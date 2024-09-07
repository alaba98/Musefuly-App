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
import API_URL from '../pages/config';
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
      element: isAuthenticated ? <Navigate to="/feed" /> : <Home />,
    },
    {
      path: '/signup',
      element: isAuthenticated ? <Navigate to="/feed" /> : <Home />,
    },
    {
      path: '/home',
      element: <Home />,
    },
    {
      path: '/profile',
      element: <Profile /> 
    },
    {
      path: '/feed',
      element: <Feed />
    },
    {
      path: '/createpost',
      element: <CreatePost /> 
    },
    {
      path: '/frl',
      element: <FriendRequestList /> 
    },
    {
      path: '/sfr',
      element: <SendFriendRequest /> 
    },
    {
      path: '/friendslist',
      element: <FriendsList />
    },
    {
      path: '/directmessages',
      element: <DirectMessages /> 
    },
    {
      path: '/directmessages/:friendId',
      element:<DirectMessages /> 
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
