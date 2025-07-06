import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Search from './Search';
import Login from './Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  useEffect(() => {
    function handleStorageChange() {
      const token = localStorage.getItem('token');
      console.log('change of storage');
      setIsLoggedIn(!!token);
    }
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    // <Router>
    <Routes>
      <Route path="/" element={isLoggedIn ? <Navigate to="/search" /> : <Navigate to="/login" />} />
      <Route path="/search" element={isLoggedIn ? <Search /> : <Navigate to="/login" />} />
      <Route path="/login" element={isLoggedIn ? <Navigate to="/search" /> : <Login />} />
    </Routes>
    // </Router>
  );
}

export default App;
