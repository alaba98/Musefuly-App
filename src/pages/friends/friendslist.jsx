import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './friendslist.css'; 

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3001/friends', { withCredentials: true });
        if (Array.isArray(response.data)) {
          setFriends(response.data);
        } else {
          setError('Unexpected data format');
        }
      } catch (error) {
        console.error('Error fetching friends:', error);
        setError('Failed to fetch friends');
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  return (
    <div className="friends-list-container">
      <Link to="/profile" className="back-button">Back to Profile</Link>
      <h1>My Friends</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      <ul>
        {friends.length === 0 ? (
          <li>No friends yet.</li>
        ) : (
          friends.map(friend => (
            <li key={friend.id}>{friend.username}</li>
          ))
        )}
      </ul>
    </div>
  );
};

export default FriendsList;
