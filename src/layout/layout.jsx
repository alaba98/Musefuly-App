import React, { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
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
import API_URL from '../config';
import axios from 'axios';

export default function Layout() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_URL}/me`, { withCredentials: true });
        setIsAuthenticated(!!response.data.username); // Adjust based on your response
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    // Optionally, handle loading state here
    return <div>Loading...</div>;
  }

  const router = createBrowserRouter([
    {
      path: '/',
      element: isAuthenticated ? <Navigate to="/feed" /> : <Home />,
    },
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/signup',
      element: <Signup />,
    },
    {
      path: '/home',
      element: <Home />,
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
