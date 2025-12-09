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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  // ✅ Fetch real stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [globalStats, trendingTags, topUsers] = await Promise.all([
          api.get('/stats/global'),
          api.get('/tags/trending'),
          api.get('/users/top?limit=100')
        ]);

        setStats({
          users: globalStats.data.totalUsers || 0,
          vibes: globalStats.data.totalVibes || 0,
          tags: trendingTags.data.tags?.length || 0,
          slayers: topUsers.data.users?.filter(u => u.vibeCount > 5).length || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Keep zeros if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
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
              <button className="btn btn-primary" onClick={onAuthClick}>
                GET STARTED <span className="sparkle">✨</span>
              </button>
              {!user && (
                <button className="btn btn-secondary" onClick={onAuthClick}>
                  SIGN IN
                </button>
              )}
            </div>

            <div className="quote-carousel">
              <p className="quote">{quotes[currentQuote]}</p>
            </div>
          </div>

          <div className="hero-visual">
            <div className="slay-card">
              <h3 className="slay-title">
                Slay
                <br />
                Meter
              </h3>
              <p className="slay-edition">UFAZ Edition</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
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
            <div className="stat-icon">👑</div>
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
            <h3 className="feature-title">Anonymous Vibes</h3>
            <p className="feature-description">
              Send vibes without revealing your identity. Let people know they're appreciated!
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Track Your Slay</h3>
            <p className="feature-description">
              Receive vibes and climb the UFAZ leaderboard. Show everyone your slay level!
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔥</div>
            <h3 className="feature-title">Trending Tags</h3>
            <p className="feature-description">
              See what qualities are trending at UFAZ. Join the conversation with popular tags!
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚔️</div>
            <h3 className="feature-title">Vibe Wars</h3>
            <p className="feature-description">
              Vote for the strongest vibes and help crown the ultimate slay champion!
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💖</div>
            <h3 className="feature-title">Spread Positivity</h3>
            <p className="feature-description">
              Create a culture of appreciation and support within the UFAZ community!
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3 className="feature-title">Achievements</h3>
            <p className="feature-description">
              Compete for the top spots and earn badges for your achievements!
            </p>
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section className="rules-section">
        <h2 className="section-title">Slay Meter Rules</h2>
        <div className="rules-grid">
          <div className="rule-card">
            <span className="rule-number">1</span>
            <p className="rule-text">Be genuine with your vibes - real recognizes real</p>
          </div>

          <div className="rule-card wednesday">
            <span className="rule-number">2</span>
            <p className="rule-text">On Wednesdays, we double the slay points</p>
          </div>

          <div className="rule-card">
            <span className="rule-number">3</span>
            <p className="rule-text">No hate, only love - negativity drops your slay score to zero</p>
          </div>

          <div className="rule-card">
            <span className="rule-number">4</span>
            <p className="rule-text">Every vibe matters - spread them generously!</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to Start Slaying?</h2>
        <p className="cta-text">
          Join UFAZ Slay Meter today and start spreading amazing vibes!
        </p>
        <button className="btn btn-primary btn-large" onClick={onAuthClick}>
          JOIN NOW <span className="arrow">→</span>
        </button>
      </section>
    </div>
  );
};

export default LandingPage;
