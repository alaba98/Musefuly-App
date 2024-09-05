import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Post from '../post/post';
import CreatePost from '../post/createpost';
import { Link, useNavigate } from 'react-router-dom'; 
import './feed.css';
import API_URL from '../config';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    fetchPosts();
    fetchCurrentUser();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/posts`);
      console.log('Posts API Response:', response.data);

      // Adjust this based on actual API response format
      // Assuming response.data is an object with a posts key or is already an array
      const postsData = Array.isArray(response.data) ? response.data : response.data.posts || [];
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Error fetching posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/me`, { withCredentials: true });
      console.log('Current User API Response:', response.data);
      
      // Adjust this based on actual API response format
      // Assuming response.data contains username directly
      setCurrentUser(response.data.username || 'Guest');
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="feed-container">
      <div className="left-sidebar">
        <Link to="/directmessages" className="sidebar-link">Direct Messages</Link>
        {/* Other sidebar links */}
      </div>
      
      <div className="feed">
        <h1>MuseFeed</h1>
        <CreatePost onPostCreated={fetchPosts} />

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : posts.length === 0 ? (
          <p>No posts available.</p>
        ) : (
          posts.map((post) => (
            <Post 
              key={post.id}
              id={post.id}
              title={post.title}
              body={post.body}
              author={post.username}
              timestamp={post.created_at}
              currentUser={currentUser}
              onPostDeleted={handlePostDeleted}
              spotifyTrackName={post.spotify_track_name}
              spotifyAlbumCover={post.spotify_album_cover}
              spotifyTrackId={post.spotify_track_id}
            />
          ))
        )}
      </div>

      <div className="right-sidebar">
        <Link to="/profile" className="profile-link">Go to Profile</Link>
        <a href="#!" className="profile-link" onClick={handleLogout}>Logout</a>
      </div>
    </div>
  );
}
