import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = ({ onAuthClick, user }) => {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [stats, setStats] = useState({
    users: 1234,
    vibes: 5678
  });

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

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="title-main">UFAZ Slay Meter</span>
            <span className="title-sparkle">✨</span>
          </h1>
          <p className="hero-subtitle shimmer-text">
            Where your slay level gets recognized
          </p>
          
          <div className="hero-description">
            <p>Send anonymous vibes to your UFAZ friends and let them know how amazing they are!</p>
          </div>

          <div className="hero-buttons">
            {user ? (
              <>
                <Link to="/dashboard" className="btn btn-primary">
                  Go to Dashboard
                </Link>
                <Link to="/send-vibe" className="btn btn-secondary">
                  Send a Vibe
                </Link>
              </>
            ) : (
              <>
                <button onClick={onAuthClick} className="btn btn-primary">
                  Join the Slay Squad
                </button>
                <Link to="/send-vibe" className="btn btn-secondary">
                  Send Anonymous Vibe
                </Link>
              </>
            )}
          </div>

          <div className="quotes-carousel">
            <p className="quote-text">{quotes[currentQuote]}</p>
          </div>
        </div>

        <div className="hero-visual">
          <div className="slay-book-preview">
            <div className="book-cover">
              <h2>UFAZ</h2>
              <p>Slay Meter</p>
              <div className="book-sparkles">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="sparkle">✨</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why UFAZ Slay Meter? 💖</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">🎭</span>
              <h3>Anonymous Vibes</h3>
              <p>Send vibes without revealing your identity. Let people know they're appreciated!</p>
            </div>
            
            <div className="feature-card">
              <span className="feature-icon">👑</span>
              <h3>Build Your Reputation</h3>
              <p>Receive vibes and climb the UFAZ leaderboard. Show everyone your slay level!</p>
            </div>
            
            <div className="feature-card">
              <span className="feature-icon">🔥</span>
              <h3>Trending Tags</h3>
              <p>See what qualities are trending at UFAZ. Join the conversation with popular tags!</p>
            </div>
            
            <div className="feature-card">
              <span className="feature-icon">⚔️</span>
              <h3>Vibe Wars</h3>
              <p>Vote for the strongest vibes and help crown the ultimate slay champion!</p>
            </div>
            
            <div className="feature-card">
              <span className="feature-icon">💖</span>
              <h3>Spread Positivity</h3>
              <p>Create a culture of appreciation and support within the UFAZ community!</p>
            </div>
            
            <div className="feature-card">
              <span className="feature-icon">🏆</span>
              <h3>Leaderboards</h3>
              <p>Compete for the top spots and earn badges for your achievements!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section className="rules-section">
        <div className="container">
          <div className="rules-book">
            <h2 className="rules-title">The UFAZ Slay Rules 💅</h2>
            <div className="rules-list">
              <div className="rule-item">
                <span className="rule-number">01</span>
                <p>Be genuine with your vibes - real recognizes real</p>
              </div>
              <div className="rule-item">
                <span className="rule-number">02</span>
                <p>On Wednesdays, we double the slay points</p>
              </div>
              <div className="rule-item">
                <span className="rule-number">03</span>
                <p>No hate, only love - negativity drops your slay score to zero</p>
              </div>
              <div className="rule-item">
                <span className="rule-number">04</span>
                <p>Every vibe matters - spread them generously!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Preview */}
      <section className="stats-preview">
        <div className="container">
          <h2 className="section-title">UFAZ Slay Stats 📊</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">{stats.users || '0'}</span>
              <span className="stat-label">Active Slayers</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.vibes || '0'}</span>
              <span className="stat-label">Vibes Sent</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">100%</span>
              <span className="stat-label">Slay Level</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">∞</span>
              <span className="stat-label">Good Energy</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2 className="cta-title shimmer-text">Ready to Check Your Slay Level? ✨</h2>
          <p className="cta-subtitle">Join UFAZ Slay Meter today and start spreading amazing vibes!</p>
          <div className="cta-buttons">
            {user ? (
              <Link to="/dashboard" className="btn btn-fetch">
                Visit Dashboard 💖
              </Link>
            ) : (
              <button onClick={onAuthClick} className="btn btn-fetch">
                Get Started Now 💖
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;