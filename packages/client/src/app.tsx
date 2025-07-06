import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Search from './Search';
import Login from './Login';
import { AuthProvider, useAuth } from './AuthContext';

function AppContent() {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      <Route path="/" element={isLoggedIn ? <Navigate to="/search" /> : <Navigate to="/login" />} />
      <Route path="/search" element={isLoggedIn ? <Search /> : <Navigate to="/login" />} />
      <Route path="/login" element={isLoggedIn ? <Navigate to="/search" /> : <Login />} />
    </Routes>
  );
}

function App() {
  return (
    <React.StrictMode>
      <h1 className="title">HomeLab Lib</h1>
      <div className="container">
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </div>
    </React.StrictMode>
  );
}

export default App;
