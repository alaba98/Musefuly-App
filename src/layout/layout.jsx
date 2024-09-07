import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../pages/config';
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

export default function Layout() {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // `null` to signify loading
    const [loading, setLoading] = useState(true); // For tracking the loading state

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

    // Define routes with conditional redirects based on authentication status
    const router = createBrowserRouter([
        {
            path: '/',  
            element: isAuthenticated === null ? null : (isAuthenticated ? <Navigate to="/home" /> : <Home />),  
        },
        {
            path: '/login',
            element: isAuthenticated ? <Navigate to="/home" /> : <Login />,  
        },
        {
            path: '/signup',
            element: isAuthenticated ? <Navigate to="/home" /> : <Signup />,  
        },
        {
            path: '/home',
            element: isAuthenticated === null ? null : (isAuthenticated ? <Home /> : <Navigate to="/login" />),  
        },
        {
            path: '/profile',
            element: isAuthenticated === null ? null : (isAuthenticated ? <Profile /> : <Navigate to="/login" />),  
        },
        {
            path: '/feed',
            element: isAuthenticated === null ? null : (isAuthenticated ? <Feed /> : <Navigate to="/login" />),    
        },
        {
            path: '/createpost',
            element: isAuthenticated === null ? null : (isAuthenticated ? <CreatePost /> : <Navigate to="/login" />), 
        },
        {
            path: '/frl', 
            element: isAuthenticated === null ? null : (isAuthenticated ? <FriendRequestList /> : <Navigate to="/login" />), 
        },
        {
            path: '/sfr', 
            element: isAuthenticated === null ? null : (isAuthenticated ? <SendFriendRequest /> : <Navigate to="/login" />), 
        },
        {
            path: '/friendslist',
            element: isAuthenticated === null ? null : (isAuthenticated ? <FriendsList /> : <Navigate to="/login" />),
        },
        {
            path: '/directmessages', 
            element: isAuthenticated === null ? null : (isAuthenticated ? <DirectMessages /> : <Navigate to="/login" />), 
        },
        {
            path: '/directmessages/:friendId', 
            element: isAuthenticated === null ? null : (isAuthenticated ? <DirectMessages /> : <Navigate to="/login" />), 
        },
        {
            path: '*', // Catch-all route for undefined paths
            element: <NotFound />, 
        }
    ]);

    if (loading) {
        return <div>Loading...</div>; // Optional loading state
    }

    return (
        <RouterProvider router={router} />
    );
}
