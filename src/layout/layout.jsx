import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
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
    // Router setup
    const router = createBrowserRouter([
        {
           path: '/',  
           element: <Home />,  
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
            element: <Profile />,  
        },
        {
            path: '/feed',
            element: <Feed />,    
        },
        {
            path: '/createpost',
            element: <CreatePost />, 
        },
        {
            path: '/frl', 
            element: <FriendRequestList />, 
        },
        {
            path: '/sfr', 
            element: <SendFriendRequest />, 
        },
        {
            path: '/friendslist',
            element: <FriendsList />,
        },
        {
            path: '/directmessages', 
            element: <DirectMessages />, 
        },
        {
            path: '/directmessages/:friendId', 
            element: <DirectMessages />, 
        },
        {
            path: '*', // Catch-all route for undefined paths
            element: <NotFound />, 
        }
    ]);

    return (
        <RouterProvider router={router} />
    );
}
