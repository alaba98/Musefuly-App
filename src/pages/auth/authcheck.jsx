import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const AuthCheck = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    fetch('/me')
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false));
  }, []);

  if (isAuthenticated === null) return null; // Loading state

  return isAuthenticated ? <Navigate to="/feed" /> : children;
};

export default AuthCheck;
