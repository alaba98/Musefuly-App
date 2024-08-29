import React from 'react';
import { authUrl } from './auth'; 

const LoginButton = () => {
  return (
    <a href={authUrl}>
      <button>Login with Spotify</button>
    </a>
  );
};

export default LoginButton;
