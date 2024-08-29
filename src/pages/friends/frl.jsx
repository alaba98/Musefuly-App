import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './frl.css';

const FriendRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const response = await axios.get('http://localhost:3001/friend-requests', { withCredentials: true });
        setRequests(response.data);
      } catch (error) {
        console.error('Error fetching friend requests:', error);
        setMessage('Failed to fetch friend requests');
        setTimeout(() => setMessage(''), 1000); 
      }
    };

    fetchFriendRequests();
  }, []);

  const handleRequestUpdate = async (requestId, status) => {
    try {
      const response = await axios.post('http://localhost:3001/update-friend-request', { requestId, status }, { withCredentials: true });
      setMessage(response.data.message);
      setTimeout(() => setMessage(''), 1000); 
      setRequests(requests.filter(request => request.id !== requestId));
    } catch (error) {
      console.error('Error updating friend request:', error);
      setMessage('Failed to update friend request');
      setTimeout(() => setMessage(''), 1000);
    }
  };

  return (
    <div className="friend-request-list-container">
      <Link to="/profile" className="back-button">Back to Profile</Link>
      <h1>Pending Friend Requests</h1>
      {message && <p className="error-message">{message}</p>}
      {requests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        requests.map(request => (
          <div key={request.id} className="friend-request-item">
            <p>{request.username} wants to be your friend.</p>
            <button onClick={() => handleRequestUpdate(request.id, 'accepted')}>Accept</button>
            <button onClick={() => handleRequestUpdate(request.id, 'rejected')}>Decline</button>
          </div>
        ))
      )}
    </div>
  );
};

export default FriendRequestList;
