import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './sfr.css'; 
import API_URL from '../config';

const SendFriendRequest = () => {
  const [users, setUsers] = useState([]);
  const [friendId, setFriendId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/users`, { withCredentials: true });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users');
      }
    };

    fetchUsers();
  }, []);

  const handleSendRequest = async () => {
    if (!friendId) {
      setError('Please select a user to send a friend request');
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/send-friend-request`,
        { friendId },
        { withCredentials: true }
      );
      setMessage(response.data.message);
      setError(''); 
    } catch (error) {
      console.error('Error sending friend request:', error);
      if (error.response && error.response.data && error.response.data.error) {
        // Check specific error messages
        const errorMessage = error.response.data.error;
        if (errorMessage === 'Friend request already pending') {
          setError('Friend request already pending');
        } else if (errorMessage === 'User is already your friend') {
          setError('User is already your friend');
        } else {
          setError('Failed to send friend request');
        }
      } else {
        setError('Failed to send friend request');
      }
      setMessage(''); 
    }
  };

  return (
    <div className="send-friend-request-container">
      <Link to="/profile" className="back-button">Back to Profile</Link>
      <h1>Send Friend Request</h1>
      <div className="user-selection">
        <label>Select a user:</label>
        <select onChange={(e) => setFriendId(e.target.value)} value={friendId}>
          <option value="">-- Select User --</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
      </div>
      <button onClick={handleSendRequest}>Send Friend Request</button>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default SendFriendRequest;
