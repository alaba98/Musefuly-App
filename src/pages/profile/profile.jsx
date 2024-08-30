import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './profile.css';
import API_URL from '../config';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_URL}/me`, { withCredentials: true });
        setUser(response.data);
      } catch (err) {
        setError('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="profile-container">
      <Link to="/feed" className="back-button">Back to Feed</Link>
      <h1>Your Profile</h1>
      <div className="profile-info">
        {user ? (
          <>
            <p><strong>Username:</strong> {user.username}</p>
            
          </>
        ) : (
          <p>No user data available.</p>
        )}
      </div>
      <div className="profile-actions">
        <Link to="/frl" className="profile-link">View Friend Requests</Link>
        <Link to="/sfr" className="profile-link">Send Friend Request</Link>
        <Link to="/friendslist" className="profile-link">View My Friends</Link>
      </div>
    </div>
  );
};

export default Profile;
