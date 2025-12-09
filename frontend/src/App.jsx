import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import ProfilePage from './components/ProfilePage';
import AuthModal from './components/AuthModal';
import Navigation from './components/Navigation';
import SendVibe from './components/SendVibe';
import ExplorePage from './components/ExplorePage';
import SettingsPage from './components/SettingsPage';
import VibeWars from './components/VibeWars';
import Leaderboard from './components/Leaderboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { user, loading, login, register } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  console.log('🎯 AppContent render - User:', user);
  console.log('🎯 AppContent render - Loading:', loading);

  // Redirect to dashboard when user logs in
  useEffect(() => {
    if (user) {
      console.log('🚀 User detected, navigating to dashboard...');
      navigate('/dashboard');
      setShowAuthModal(false);
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="slay-loader">
          <span>💖</span>
          <p>Loading UFAZ Slay Meter...</p>
        </div>
      </div>
    );
  }

  const handleLoginSuccess = async (email, password) => {
    try {
      console.log('🔑 handleLoginSuccess called');
      await login(email, password);
      console.log('✅ Login completed');
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const handleRegisterSuccess = async (userData) => {
    try {
      console.log('📝 handleRegisterSuccess called');
      await register(userData);
      console.log('✅ Registration completed');
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  };

  return (
    <div className="app">
      <Navigation onAuthClick={() => setShowAuthModal(true)} />
      
      <Routes>
        <Route path="/" element={<LandingPage onAuthClick={() => setShowAuthModal(true)} />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/profile/:handle" element={<ProfilePage />} />
        <Route path="/send-vibe" element={<SendVibe />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/" />} />
        <Route path="/vibe-wars" element={<VibeWars />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLoginSuccess}
          onRegister={handleRegisterSuccess}
        />
      )}

      {/* Floating sparkles effect */}
      <div className="sparkles-container">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="sparkle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}>✨</div>
        ))}
      </div>
    </div>
  );
}

export default App;
