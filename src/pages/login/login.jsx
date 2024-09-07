// Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './login.css';
import API_URL from '../config';
import { useAuth } from '../auth/authcontext'; // Import useAuth

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth(); // Access setIsAuthenticated

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send credentials with cookies included
      await axios.post(`${API_URL}/login`, { username, password }, { withCredentials: true });
      setIsAuthenticated(true); // Set authentication status
      navigate('/feed');
    } catch (err) {
      alert(err.response?.data?.error || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="card">
        <div className="left">
          <h2>Musefuly Login<br />-</h2>
          <p>Welcome back! Please log in to continue.</p>
          <span>Don't have an account?</span>
          <Link to='/signup'>
            <button className='btn btn-primary'>Register</button>
          </Link>
        </div>
        <form className="right" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder='Username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type='submit' className='btn' disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
