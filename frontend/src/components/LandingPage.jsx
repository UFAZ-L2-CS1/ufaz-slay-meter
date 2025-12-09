import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import './LandingPage.css';

const LandingPage = () => {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [stats] = useState({ users: 1234, vibes: 5678, tags: 342, slayers: 89 });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  const quotes = [
    "Your slay level is unmeasurable! 💖",
    "UFAZ vibes only! ✨",
    "Spread the slay, spread the love! 💕",
    "Everyone deserves to know they're amazing! 🌟"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleAuthClick = () => {
    setShowAuthModal(true);
  };

  const handleCloseModal = () => {
    setShowAuthModal(false);
  };

  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      setShowAuthModal(false);
      navigate('/dashboard');
    } catch (error) {
      throw error; // Re-throw so AuthModal can display the error
    }
  };

  const handleRegister = async (userData) => {
    try {
      await register(userData);
      setShowAuthModal(false);
      navigate('/dashboard');
    } catch (error) {
      throw error; // Re-throw so AuthModal can display the error
    }
  };

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="logo">
          <span className="logo-icon">✨</span>
          <span className="logo-text">UFAZ Slay Meter</span>
        </div>
        <nav className="landing-nav">
          {user ? (
            <Link to="/dashboard" className="nav-btn btn-primary">
              Dashboard
            </Link>
          ) : (
            <button onClick={handleAuthClick} className="nav-btn btn-primary">
              Get Started
            </button>
          )}
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Send anonymous vibes to your UFAZ friends and let them know how amazing they are!
          </h1>
          <p className="hero-quote">{quotes[currentQuote]}</p>
          <button onClick={handleAuthClick} className="cta-button">
            Start Slaying ✨
          </button>
        </div>
        <div className="hero-graphic">
          <div className="floating-card">
            <div className="card-emoji">💖</div>
            <div className="card-text">You're amazing!</div>
          </div>
          <div className="floating-card delay-1">
            <div className="card-emoji">✨</div>
            <div className="card-text">Slay queen!</div>
          </div>
          <div className="floating-card delay-2">
            <div className="card-emoji">🌟</div>
            <div className="card-text">Iconic!</div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stat-item">
          <div className="stat-number">{stats.users}+</div>
          <div className="stat-label">Active Slayers</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{stats.vibes}+</div>
          <div className="stat-label">Vibes Sent</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{stats.tags}+</div>
          <div className="stat-label">Unique Tags</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{stats.slayers}</div>
          <div className="stat-label">Top Slayers</div>
        </div>
      </section>

      <section className="features">
        <h2 className="section-title">Why UFAZ Slay Meter?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎭</div>
            <h3>Anonymous Vibes</h3>
            <p>Send vibes without revealing your identity. Let people know they're appreciated!</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Slay Leaderboard</h3>
            <p>Receive vibes and climb the UFAZ leaderboard. Show everyone your slay level!</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏷️</div>
            <h3>Trending Tags</h3>
            <p>See what qualities are trending at UFAZ. Join the conversation with popular tags!</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚔️</div>
            <h3>Vibe Wars</h3>
            <p>Vote for the strongest vibes and help crown the ultimate slay champion!</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💝</div>
            <h3>Build Community</h3>
            <p>Create a culture of appreciation and support within the UFAZ community!</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎖️</div>
            <h3>Earn Badges</h3>
            <p>Compete for the top spots and earn badges for your achievements!</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Account</h3>
            <p>Sign up with your UFAZ email and create your profile</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Send Vibes</h3>
            <p>Choose a friend and send them anonymous compliments with tags</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Climb the Ranks</h3>
            <p>Receive vibes and watch your slay level rise on the leaderboard</p>
          </div>
        </div>
      </section>

      <section className="rules">
        <h2 className="section-title">Slay Rules</h2>
        <div className="rules-list">
          <div className="rule-item">
            <span className="rule-icon">✅</span>
            <p>Be genuine with your vibes - real recognizes real</p>
          </div>
          <div className="rule-item">
            <span className="rule-icon">💖</span>
            <p>On Wednesdays, we double the slay points</p>
          </div>
          <div className="rule-item">
            <span className="rule-icon">🚫</span>
            <p>No hate, only love - negativity drops your slay score to zero</p>
          </div>
          <div className="rule-item">
            <span className="rule-icon">🌟</span>
            <p>Every vibe matters - spread them generously!</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Join UFAZ Slay Meter today and start spreading amazing vibes!</h2>
        <button onClick={handleAuthClick} className="cta-button large">
          Get Started Now ✨
        </button>
      </section>

      <footer className="landing-footer">
        <p>© 2024 UFAZ Slay Meter. Made with 💖 by UFAZ students.</p>
      </footer>

      {showAuthModal && (
        <AuthModal
          onClose={handleCloseModal}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      )}
    </div>
  );
};

export default LandingPage;
