import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import axios from 'axios';
import './signup.css';
import API_URL from '../config';

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/signup`, { username, email, password });
      alert(response.data.message || 'Registration successful. Redirecting...');
      setTimeout(() => navigate('/login'), 2000); 
    } catch (err) {
      // Handle errors based on the server response
      const errorResponse = err.response?.data;
      if (errorResponse) {
        switch (errorResponse.error) {
          case 'Username already exists':
            alert('This username is already taken. Please choose a different one.');
            break;
          case 'Email already exists':
            alert('This email is already registered. Please use a different email.');
            break;
          default:
            alert(errorResponse.message || 'Error registering user. Please try again.');
        }
      } else {
        alert('Error registering user. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup">
      <div className="card">
        <div className="left">
          <h2>Musefuly Signup<br />-</h2>
          <p>Create your account to join us.</p>
          <span>Already have an account?</span>
          <Link to='/login'>
            <button className='btn btn-primary'>Login</button>
          </Link>
        </div>
        <form className="right" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder='Username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type='submit' className='btn' disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}
