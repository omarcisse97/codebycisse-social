import React, { useState, useEffect } from 'react'
// import { useAuth0 } from "@auth0/auth0-react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { HabboAvatarProvider } from './components/contexts/HabboAvatarContext'
import './App.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import EmailVerification from './pages/EmailVerification'
import { useAuth } from './components/contexts/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
};

function App() {
  // const { isAuthenticated, isLoading, user, loginWithRedirect } = useAuth0();

  // Dummy user for testing
  const [userTest, setUserTest] = useState({
    id: 1,
    username: 'omar',
    email: 'omar@example.com',
    avatar: null,
    bio: 'Software developer passionate about creating amazing experiences',
    followers: 1234,
    following: 567,
    posts: 89
  });

  const { isAuthenticated, loading, user, registerEnhanced, userInfo } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if(user && userInfo){
    console.log('USER INFO -> ', userInfo);
  }
  

  return (
    <HabboAvatarProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-gray-50">
          {isAuthenticated && <Navbar user={userTest} />}
          <main className={isAuthenticated ? "pt-16" : ""}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<EmailVerification />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home user={userTest} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:username?"
                element={
                  <ProtectedRoute>
                    <Profile user={userTest} />
                  </ProtectedRoute>
                }
              />

              {/* Catch all - redirect based on auth status */}
              <Route
                path="*"
                element={<Navigate to={isAuthenticated ? "/" : "/login"} />}
              />
            </Routes>
          </main>
        </div>
      </Router>
    </HabboAvatarProvider>
  )
}

export default App