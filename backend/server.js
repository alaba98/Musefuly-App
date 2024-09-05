require('dotenv').config();
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('SESSION_SECRET:', process.env.SESSION_SECRET);
console.log('SPOTIFY_CLIENT_ID:', process.env.VITE_SPOTIFY_CLIENT_ID);
console.log('SPOTIFY_CLIENT_SECRET:', process.env.VITE_SPOTIFY_CLIENT_SECRET);

const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cors = require('cors');
const axios = require('axios');
const querystring = require('querystring');

const client_id = process.env.VITE_SPOTIFY_CLIENT_ID;
const client_secret = process.env.VITE_SPOTIFY_CLIENT_SECRET;

// Get Spotify Access Token
async function getAccessToken() {
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const authOptions = {
    headers: {
      'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: querystring.stringify({
      grant_type: 'client_credentials'
    }),
    method: 'POST',
    url: tokenUrl
  };

  try {
    const response = await axios(authOptions);
    return response.data.access_token;
  } catch (error) {
    console.error('Failed to obtain access token:', error);
    throw error;
  }
}

const app = express();
const port = process.env.PORT || 3001;
const allowedOrigins = [
  'http://localhost:4173', // Development
  'https://musefuly-app-frontend.onrender.com' // Production
];


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, 
  },
});

pool.connect()
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Database connection error:', err.stack));

app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: true,
  store: new pgSession({
    pool: pool, 
    // tableName: 'session' 
  }),
  cookie: { 
    secure: process.env.NODE_ENV === 'production' 
  }
}));

// Default route or health check
app.get('/', (req, res) => {
  res.send('Server is up and running');
});

// Signup Route
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if username or email already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);

    if (existingUser.rows.length > 0) {
      if (existingUser.rows.find(user => user.username === username)) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      if (existingUser.rows.find(user => user.email === email)) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Hash the password and insert new user into database
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [username, email, hashedPassword]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Login Route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (user && await bcrypt.compare(password, user.password)) {
      req.session.user = { id: user.id, username: user.username };
      res.json({ message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Current User
app.get('/me', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Create Post Route
app.post('/posts', async (req, res) => {
  const { title, body, spotify_track_id, spotify_track_name, spotify_album_cover } = req.body;
  const userId = req.session.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    await pool.query(
      'INSERT INTO posts (title, body, user_id, spotify_track_id, spotify_track_name, spotify_album_cover, created_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)',
      [title, body, userId, spotify_track_id, spotify_track_name, spotify_album_cover]
    );
    res.status(201).json({ message: 'Post created successfully' });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch Posts Route
app.get('/posts', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id ORDER BY posts.created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
// Search Spotify Tracks Route
app.get('/search-spotify', async (req, res) => {
  const query = req.query.query;

  if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
      const accessToken = await getAccessToken(); // Ensure getAccessToken function is correctly implemented
      const response = await axios.get('https://api.spotify.com/v1/search', {
          params: {
              q: query,
              type: 'track', // Search for tracks
              limit: 10 // Adjust limit as needed
          },
          headers: {
              'Authorization': `Bearer ${accessToken}`
          }
      });
      res.json(response.data.tracks.items); // Return only the tracks
  } catch (error) {
      console.error('Error searching Spotify:', error);
      res.status(500).json({ error: 'Error searching Spotify' });
  }
});

// Delete Post Route
app.delete('/posts/:id', async (req, res) => {
  const postId = req.params.id;
  const userId = req.session.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const result = await pool.query('SELECT * FROM posts WHERE id = $1 AND user_id = $2', [postId, userId]);
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'You are not authorized to delete this post' });
    }

    await pool.query('DELETE FROM posts WHERE id = $1', [postId]);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Comment Routes
app.post('/comments', async (req, res) => {
  const { postId, parentId, body } = req.body;
  const userId = req.session.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    await pool.query(
      'INSERT INTO comments (post_id, parent_id, user_id, body, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
      [postId, parentId, userId, body]
    );
    res.status(201).json({ message: 'Comment added successfully' });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch Comments for a Post with Nested Structure
app.get('/posts/:id/comments', async (req, res) => {
  const postId = parseInt(req.params.id, 10);

  try {
    const result = await pool.query(
      'SELECT comments.*, users.username FROM comments JOIN users ON comments.user_id = users.id WHERE comments.post_id = $1 ORDER BY comments.created_at ASC',
      [postId]
    );

    const comments = result.rows;

    // Function to nest comments recursively
    const nestComments = (comments, parentId = null) => {
      return comments
        .filter(comment => comment.parent_id === parentId)
        .map(comment => ({
          ...comment,
          replies: nestComments(comments, comment.id) // Recursively nest replies
        }));
    };

    const nestedComments = nestComments(comments);

    res.json(nestedComments);
  } catch (error) {
    console.error('Fetch comments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete Comment Route
app.delete('/comments/:id', async (req, res) => {
  const commentId = req.params.id;
  const userId = req.session.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const result = await pool.query('SELECT * FROM comments WHERE id = $1 AND user_id = $2', [commentId, userId]);
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'You are not authorized to delete this comment' });
    }

    await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add Reaction Route
app.post('/posts/:id/reactions', async (req, res) => {
  const { id: postId } = req.params;
  const { emoji } = req.body;
  const userId = req.session.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  // Validate emoji
  const validEmojis = ['❤️', '👍', '👎', '😂', '😐', '🗑️'];
  if (!validEmojis.includes(emoji)) {
    return res.status(400).json({ error: 'Invalid emoji' });
  }

  try {
    // Check if the reaction already exists
    const existingReaction = await pool.query(
      'SELECT * FROM post_reactions WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );

    if (existingReaction.rows.length > 0) {
      // Update existing reaction
      await pool.query(
        'UPDATE post_reactions SET emoji = $1 WHERE post_id = $2 AND user_id = $3',
        [emoji, postId, userId]
      );
    } else {
      // Insert new reaction
      await pool.query(
        'INSERT INTO post_reactions (post_id, user_id, emoji) VALUES ($1, $2, $3)',
        [postId, userId, emoji]
      );
    }

    res.json({ message: 'Reaction added or updated successfully' });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Reactions Route
app.get('/posts/:id/reactions', async (req, res) => {
  const postId = req.params.id;

  try {
    const result = await pool.query(
      'SELECT emoji, COUNT(*) as count FROM post_reactions WHERE post_id = $1 GROUP BY emoji',
      [postId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch reactions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});



app.post('/send-friend-request', async (req, res) => {
  const { friendId } = req.body;
  const userId = req.session.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  // Prevent users from sending a friend request to themselves
  if (userId === friendId) {
    return res.status(400).json({ error: 'You cannot send a friend request to yourself' });
  }

  try {
    // Check if already friends
    const existingFriendship = await pool.query(
      'SELECT * FROM friendships WHERE (user_id = $1 AND friend_id = $2 OR user_id = $2 AND friend_id = $1) AND status = $3',
      [userId, friendId, 'accepted']
    );

    if (existingFriendship.rows.length > 0) {
      return res.status(400).json({ error: 'User is already your friend' });
    }

    // Check if there's a pending or rejected request
    const existingRequest = await pool.query(
      'SELECT * FROM friendships WHERE (user_id = $1 AND friend_id = $2 OR user_id = $2 AND friend_id = $1) AND status IN ($3, $4)',
      [userId, friendId, 'pending', 'rejected']
    );

    if (existingRequest.rows.length > 0) {
      
      if (existingRequest.rows[0].status === 'rejected') {
        await pool.query('DELETE FROM friendships WHERE id = $1', [existingRequest.rows[0].id]);
      } else {
        return res.status(400).json({ error: 'Friend request already pending' });
      }
    }

   
    await pool.query(
      'INSERT INTO friendships (user_id, friend_id, status) VALUES ($1, $2, $3)',
      [userId, friendId, 'pending']
    );

    res.status(201).json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.get('/friend-requests', async (req, res) => {
  const userId = req.session.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const pendingRequests = await pool.query(
      `SELECT f.id, u.username 
       FROM friendships f
       JOIN users u ON f.user_id = u.id
       WHERE f.friend_id = $1 AND f.status = $2`,
      [userId, 'pending']
    );
    res.json(pendingRequests.rows);
  } catch (error) {
    console.error('Fetch friend requests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
app.post('/update-friend-request', async (req, res) => {
  const { requestId, status } = req.body;

  if (!requestId || !['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  try {
    await pool.query(
      'UPDATE friendships SET status = $1 WHERE id = $2',
      [status, requestId]
    );
    res.send('Friend request updated');
  } catch (err) {
    console.error('Error updating friend request:', err);
    res.status(500).send('Server error');
  }
});
// Get Users Route
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username FROM users');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Server error');
  }
});
// Fetch friends for the logged-in user
app.get('/friends', async (req, res) => {
  const userId = req.session.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const result = await pool.query(
      `SELECT u.id, u.username 
       FROM users u
       JOIN friendships f 
         ON (u.id = f.friend_id AND f.user_id = $1)
         OR (u.id = f.user_id AND f.friend_id = $1)
       WHERE f.status = 'accepted'`,
      [userId]
    );

    res.json(result.rows); // Ensure this is the correct data format
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
// Logout Route
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});
// Fetch direct messages between the logged-in user and another user
app.get('/direct-messages/:friendId', async (req, res) => {
    const userId = req.session.user?.id;
    const friendId = parseInt(req.params.friendId, 10);

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
        const result = await pool.query(
            `SELECT dm.*, u1.username AS sender_username, u2.username AS receiver_username
             FROM direct_messages dm
             JOIN users u1 ON dm.sender_id = u1.id
             JOIN users u2 ON dm.receiver_id = u2.id
             WHERE (dm.sender_id = $1 AND dm.receiver_id = $2)
                OR (dm.sender_id = $2 AND dm.receiver_id = $1)
             ORDER BY dm.created_at ASC`,
            [userId, friendId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Fetch direct messages error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Send a direct message with optional Spotify track information
app.post('/direct-messages', async (req, res) => {
  const { receiverId, message, spotify_track_id, spotify_track_name, spotify_album_cover } = req.body;
  const senderId = req.session.user?.id;

  if (!senderId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    await pool.query(
      'INSERT INTO direct_messages (sender_id, receiver_id, message, spotify_track_id, spotify_track_name, spotify_album_cover) VALUES ($1, $2, $3, $4, $5, $6)',
      [senderId, receiverId, message, spotify_track_id, spotify_track_name, spotify_album_cover]
    );
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Send direct message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
