import React, { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, useNavigate } from 'react-router-dom';
import Login from '../pages/login/login';
import Signup from '../pages/signup/signup';
import Home from '../pages/home/home';
import Profile from '../pages/profile/profile';
import Feed from '../pages/feed/feed';
import CreatePost from '../pages/post/createpost';
import FriendRequestList from '../pages/friends/frl';
import SendFriendRequest from '../pages/friends/sfr'; 
import FriendsList from '../pages/friends/friendslist';
import DirectMessages from '../pages/directmessages/directmessages'; 
import NotFound from '../pages/notfound/notfound';
import API_URL from '../pages/config';
import axios from 'axios';

export default function Layout() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // `null` to signify loading
  const [loading, setLoading] = useState(true); // For tracking the loading state
  const navigate = useNavigate(); // For programmatic navigation

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_URL}/me`, { withCredentials: true });
        setIsAuthenticated(!!response.data.username); // Adjust based on your response
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false); // If there's an error, assume not authenticated
      } finally {
        setLoading(false); // Update loading state regardless of success or failure
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/feed'); // Redirect to feed page if authenticated
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return <div>Loading...</div>; // Or a spinner/loading animation
  }

  const router = createBrowserRouter([
    {
      path: '/',
      element: isAuthenticated ? <Navigate to="/feed" /> : <Home />,
    },
    {
      path: '/login',
      element: isAuthenticated ? <Navigate to="/feed" /> : <Login />,
    },
    {
      path: '/signup',
      element: isAuthenticated ? <Navigate to="/feed" /> : <Signup />,
    },
    {
      path: '/home',
      element: isAuthenticated ? <Home /> : <Navigate to="/login" />,
    },
    {
      path: '/profile',
      element: isAuthenticated ? <Profile /> : <Navigate to="/login" />,
    },
    {
      path: '/feed',
      element: isAuthenticated ? <Feed /> : <Navigate to="/login" />,
    },
    {
      path: '/createpost',
      element: isAuthenticated ? <CreatePost /> : <Navigate to="/login" />,
    },
    {
      path: '/frl',
      element: isAuthenticated ? <FriendRequestList /> : <Navigate to="/login" />,
    },
    {
      path: '/sfr',
      element: isAuthenticated ? <SendFriendRequest /> : <Navigate to="/login" />,
    },
    {
      path: '/friendslist',
      element: isAuthenticated ? <FriendsList /> : <Navigate to="/login" />,
    },
    {
      path: '/directmessages',
      element: isAuthenticated ? <DirectMessages /> : <Navigate to="/login" />,
    },
    {
      path: '/directmessages/:friendId',
      element: isAuthenticated ? <DirectMessages /> : <Navigate to="/login" />,
    },
    {
      path: '*',
      element: <NotFound />,
    }
  ]);

  return (
    <RouterProvider router={router} />
  );
}
