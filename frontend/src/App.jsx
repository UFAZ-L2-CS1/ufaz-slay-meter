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

  // ✅ Redirect to dashboard after successful login
  useEffect(() => {
    if (user && showAuthModal) {
      setShowAuthModal(false);
      navigate('/dashboard');
    }
  }, [user]);

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
          onLogin={login}
          onRegister={register}
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
