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
import AuthCheck from '..pages/auth/authcheck'; // Adjust this path if needed

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthCheck>
        <Home />
      </AuthCheck>
    ),
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
    element: <PrivateRoute element={<Profile />} />,
  },
  {
    path: '/feed',
    element: <PrivateRoute element={<Feed />} />,
  },
  {
    path: '/createpost',
    element: <PrivateRoute element={<CreatePost />} />,
  },
  {
    path: '/frl',
    element: <PrivateRoute element={<FriendRequestList />} />,
  },
  {
    path: '/sfr',
    element: <PrivateRoute element={<SendFriendRequest />} />,
  },
  {
    path: '/friendslist',
    element: <PrivateRoute element={<FriendsList />} />,
  },
  {
    path: '/directmessages',
    element: <PrivateRoute element={<DirectMessages />} />,
  },
  {
    path: '/directmessages/:friendId',
    element: <PrivateRoute element={<DirectMessages />} />,
  },
  {
    path: '*',
    element: <NotFound />,
  }
]);

export default function App() {
  return (
    <RouterProvider router={router} />
  );
}
