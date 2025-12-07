import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = ({ onAuthClick, user }) => {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [stats] = useState({
    users: 1234,
    vibes: 5678,
    tags: 342,
    slayers: 89
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
          <div className="hero-title">
            <h1 className="title-main">UFAZ Slay Meter</h1>
            <span className="title-sparkle">✨</span>
          </div>
          <h2 className="hero-subtitle">
            <span className="shimmer-text">Where your slay level gets recognized</span>
          </h2>
          <div className="hero-description">
            <p>
              Send anonymous vibes to your UFAZ friends and let them know how amazing they are!
            </p>
          </div>
          <div className="hero-buttons">
            {user ? (
              <>
                <Link to="/dashboard" className="btn btn-fetch">
                  Go to Dashboard 🚀
                </Link>
                <Link to="/send" className="btn btn-secondary">
                  Send a Vibe 💕
                </Link>
              </>
            ) : (
              <>
                <button onClick={onAuthClick} className="btn btn-fetch">
                  Get Started 🚀
                </button>
                <button onClick={onAuthClick} className="btn btn-secondary">
                  Sign In
                </button>
              </>
            )}
          </div>
          <div className="quotes-carousel">
            <p className="quote-text" key={currentQuote}>
              {quotes[currentQuote]}
            </p>
          </div>
        </div>

        <div className="hero-visual">
          <div className="slay-book-preview">
            <div className="book-cover">
              <h2>Slay Meter</h2>
              <p>UFAZ Edition</p>
              <div className="book-sparkles">
                <span className="sparkle">✨</span>
                <span className="sparkle">💕</span>
                <span className="sparkle">👑</span>
                <span className="sparkle">💖</span>
                <span className="sparkle">⭐</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why You'll Love It 💕</h2>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">🎭</span>
              <h3>Anonymous Vibes</h3>
              <p>
                Send vibes without revealing your identity. Let people know they're appreciated!
              </p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🏆</span>
              <h3>Leaderboard</h3>
              <p>
                Receive vibes and climb the UFAZ leaderboard. Show everyone your slay level!
              </p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🔥</span>
              <h3>Trending Tags</h3>
              <p>
                See what qualities are trending at UFAZ. Join the conversation with popular tags!
              </p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">⚔️</span>
              <h3>Vibe Wars</h3>
              <p>
                Vote for the strongest vibes and help crown the ultimate slay champion!
              </p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💖</span>
              <h3>Community Love</h3>
              <p>
                Create a culture of appreciation and support within the UFAZ community!
              </p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🎖️</span>
              <h3>Achievements</h3>
              <p>
                Compete for the top spots and earn badges for your achievements!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section className="rules-section">
        <div className="container">
          <div className="rules-book">
            <h2 className="rules-title">The Rules of Slaying 👑</h2>
            <div className="rules-list">
              <div className="rule-item">
                <span className="rule-number">#1</span>
                <p>Be genuine with your vibes - real recognizes real</p>
              </div>
              <div className="rule-item">
                <span className="rule-number">#2</span>
                <p>On Wednesdays, we double the slay points</p>
              </div>
              <div className="rule-item">
                <span className="rule-number">#3</span>
                <p>No hate, only love - negativity drops your slay score to zero</p>
              </div>
              <div className="rule-item">
                <span className="rule-number">#4</span>
                <p>Every vibe matters - spread them generously!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Preview */}
      <section className="stats-preview">
        <div className="container">
          <h2 className="section-title">The Numbers Don't Lie 📊</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">{stats.users}</span>
              <span className="stat-label">Slayers</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.vibes}</span>
              <span className="stat-label">Vibes Sent</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.tags}</span>
              <span className="stat-label">Tags Used</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.slayers}</span>
              <span className="stat-label">Top Slayers</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2 className="cta-title shimmer-text">
            Ready to Start Slaying? 👑
          </h2>
          <p className="cta-subtitle">
            Join UFAZ Slay Meter today and start spreading amazing vibes!
          </p>
          <div className="cta-buttons">
            {user ? (
              <Link to="/dashboard" className="btn btn-fetch">
                Go to Dashboard 🚀
              </Link>
            ) : (
              <button onClick={onAuthClick} className="btn btn-fetch">
                Join Now - It's Free! 💕
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
