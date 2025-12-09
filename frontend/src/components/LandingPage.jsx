import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import api from '../services/api';

const LandingPage = ({ onAuthClick, user }) => {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [stats, setStats] = useState({ 
    users: 0, 
    vibes: 0, 
    tags: 0, 
    slayers: 0 
  });
  const [loading, setLoading] = useState(true);

  const quotes = [
    "Your slay level is unmeasurable! 💖",
    "UFAZ vibes only! ✨",
    "Spread the slay, spread the love! 💕",
    "Everyone deserves to know they're amazing! 🌟"
  ];

  // Fetch real stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [globalStats, trendingTags, topUsers] = await Promise.all([
          api.get('/stats/global'),
          api.get('/tags/trending'),
          api.get('/users/top?limit=10')
        ]);

        setStats({
          users: globalStats.data.totalUsers || 0,
          vibes: globalStats.data.totalVibes || 0,
          tags: trendingTags.data.tags?.length || 0,
          slayers: topUsers.data.users?.length || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Rotate quotes
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
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="gradient-text">UFAZ Slay Meter</span>
            </h1>
            <p className="hero-subtitle">
              Where your slay level gets recognized
            </p>
            <p className="hero-description">
              Send anonymous vibes to your UFAZ friends and let them know how amazing they are!
            </p>

            <div className="cta-buttons">
              <button className="btn btn-primary btn-large" onClick={onAuthClick}>
                GET STARTED ✨
              </button>
              {!user && (
                <button className="btn btn-secondary btn-large" onClick={onAuthClick}>
                  SIGN IN
                </button>
              )}
            </div>

            <div className="quote-carousel">
              <p className="rotating-quote">{quotes[currentQuote]}</p>
            </div>
          </div>

          <div className="hero-visual">
            <div className="slay-card">
              <h2 className="gradient-text">Slay Meter</h2>
              <p className="edition-text">UFAZ Edition</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-number">
              {loading ? '...' : stats.users.toLocaleString()}
            </div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💕</div>
            <div className="stat-number">
              {loading ? '...' : stats.vibes.toLocaleString()}
            </div>
            <div className="stat-label">Vibes Sent</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏷️</div>
            <div className="stat-number">
              {loading ? '...' : stats.tags}
            </div>
            <div className="stat-label">Trending Tags</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-number">
              {loading ? '...' : stats.slayers}
            </div>
            <div className="stat-label">Top Slayers</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">How It Works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎭</div>
            <h3>Anonymous Vibes</h3>
            <p>Send vibes without revealing your identity. Let people know they're appreciated!</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Track Your Slay</h3>
            <p>Receive vibes and climb the UFAZ leaderboard. Show everyone your slay level!</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔥</div>
            <h3>Trending Tags</h3>
            <p>See what qualities are trending at UFAZ. Join the conversation with popular tags!</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚔️</div>
            <h3>Vibe Wars</h3>
            <p>Vote for the strongest vibes and help crown the ultimate slay champion!</p>
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="why-join-section">
        <h2 className="section-title">Why Join?</h2>
        <div className="reasons-grid">
          <div className="reason-card">
            <span className="reason-emoji">💖</span>
            <p>Create a culture of appreciation and support within the UFAZ community!</p>
          </div>
          <div className="reason-card">
            <span className="reason-emoji">🏆</span>
            <p>Compete for the top spots and earn badges for your achievements!</p>
          </div>
        </div>
      </section>

      {/* Community Rules */}
      <section className="rules-section">
        <h2 className="section-title">Community Vibes</h2>
        <div className="rules-grid">
          <div className="rule-card">
            <span className="rule-number">1</span>
            <p>Be genuine with your vibes - real recognizes real</p>
          </div>
          <div className="rule-card">
            <span className="rule-number">2</span>
            <p>On Wednesdays, we double the slay points</p>
          </div>
          <div className="rule-card">
            <span className="rule-number">3</span>
            <p>No hate, only love - negativity drops your slay score to zero</p>
          </div>
          <div className="rule-card">
            <span className="rule-number">4</span>
            <p>Every vibe matters - spread them generously!</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <h2>Join UFAZ Slay Meter today and start spreading amazing vibes!</h2>
        <button className="btn btn-primary btn-large" onClick={onAuthClick}>
          GET STARTED NOW 💕
        </button>
      </section>
    </div>
  );
};

export default LandingPage;
