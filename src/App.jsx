import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { HabboAvatarProvider } from './components/contexts/HabboAvatarContext'
import './App.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import EmailVerification from './pages/EmailVerification'
import { useAuth } from './components/contexts/AuthContext'
import GenderSelectionComponent from './components/GenderSelectionComponent'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
};

function App() {
  const [showGenderSelectionModal, setShowGenderSelectionModal] = useState(false);
  const { isAuthenticated, loading, user, userInfo } = useAuth();

  // Check for gender in useEffect to avoid infinite re-renders
  useEffect(() => {
    if (user && userInfo) {
      if (!userInfo?.gender || userInfo?.gender === '') {
        setShowGenderSelectionModal(true);
      } else {
        setShowGenderSelectionModal(false);
      }
    }
  }, [user, userInfo]); // Only run when user or userInfo changes

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Show gender selection modal
  if (showGenderSelectionModal) {
    return <GenderSelectionComponent onClose={() => setShowGenderSelectionModal(false)} />
  }

  return (
    <HabboAvatarProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-gray-50">
          {isAuthenticated && <Navbar />}
          <main className={isAuthenticated ? "pt-16" : ""}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:username?"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
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