import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  const [vibes, setVibes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('received');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user stats
      const statsResponse = await api.get('/users/me/stats');
      setStats(statsResponse.data);

      // Fetch vibes based on active tab
      const vibesEndpoint = activeTab === 'received' ? '/vibes/received' : '/vibes/sent';
      const vibesResponse = await api.get(vibesEndpoint, {
        params: { page: 1, limit: 10 }
      });
      setVibes(vibesResponse.data.vibes || []);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const motivationalQuotes = [
    "You're like, really pretty! 💕",
    "That's so fetch of you! ✨",
    "You go, Glen Coco! 🎉",
    "On Wednesdays, we spread vibes! 💅",
    "The limit of your amazingness does not exist! ♾️"
  ];

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  if (loading) {
    return (
      <div className="dashboard">
        <div className="page-container">
          <div className="container">
            <div className="glass-card">
              <div className="loading-state">
                <div className="burn-book-loader">
                  <span>📖</span>
                  <p>Loading your vibes...</p>
                  <p className="quote">{randomQuote}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="page-container">
          <div className="container">
            <div className="glass-card">
              <div className="error-state">
                <p>{error}</p>
                <button onClick={fetchDashboardData} className="btn btn-primary">
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-container">
        <div className="container">
          {/* Welcome Section */}
          <div className="glass-card welcome-section">
            <div className="welcome-content">
              <h1 className="welcome-title">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'Slayer'}! 👑
              </h1>
              <p className="welcome-subtitle">
                Ready to spread some positive vibes today?
              </p>
              <div className="quick-actions">
                <Link to="/send" className="btn btn-primary">
                  ✨ Send Vibe
                </Link>
                <Link to={`/profile/${user?.handle || 'me'}`} className="btn btn-secondary">
                  👤 View Profile
                </Link>
              </div>
            </div>
            <div className="welcome-stats">
              <div className="stat-bubble">
                <span className="stat-value">{stats?.totalVibes || 0}</span>
                <span className="stat-name">Total Vibes</span>
              </div>
              <div className="stat-bubble">
                <span className="stat-value">#{stats?.rank || '-'}</span>
                <span className="stat-name">Rank</span>
              </div>
            </div>
          </div>

          {/* Tag Cloud Section */}
          {stats?.stats && stats.stats.length > 0 && (
            <div className="glass-card tag-cloud-section">
              <h2>Your Top Vibes 🌟</h2>
              <div className="tags-cloud">
                {stats.stats.map((stat, index) => (
                  <span
                    key={stat.tag}
                    className={`tag-bubble ${index === 0 ? 'popular' : ''}`}
                    style={{ fontSize: `${0.9 + stat.pct / 100}rem` }}
                  >
                    {stat.tag} ({stat.pct}%)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Vibes Section */}
          <div className="vibes-section">
            <div className="section-header">
              <h2>Your Vibes 💌</h2>
              <div className="tab-switcher">
                <button
                  className={`tab-btn ${activeTab === 'received' ? 'active' : ''}`}
                  onClick={() => setActiveTab('received')}
                >
                  📬 Received
                </button>
                <button
                  className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
                  onClick={() => setActiveTab('sent')}
                >
                  📤 Sent
                </button>
              </div>
            </div>

            <div className="vibes-list">
              {vibes.length > 0 ? (
                vibes.map((vibe) => (
                  <div key={vibe._id} className="glass-card vibe-item">
                    <div className="vibe-header">
                      <div className="vibe-sender">
                        {vibe.isAnonymous || vibe.anonymous ? (
                          <span className="anonymous">🎭 Anonymous</span>
                        ) : activeTab === 'received' ? (
                          <span>
                            <strong>{vibe.from?.name || vibe.senderId?.name}</strong> 
                            {vibe.from?.handle && ` @${vibe.from.handle}`}
                          </span>
                        ) : (
                          <span>
                            To <strong>{vibe.to?.name || vibe.recipientId?.name}</strong>
                            {vibe.to?.handle && ` @${vibe.to.handle}`}
                          </span>
                        )}
                      </div>
                      <span className="vibe-time">{vibe.timestamp}</span>
                    </div>
                    <p className="vibe-message">
                      {vibe.text || vibe.message || "You're amazing! Keep slaying! 💕"}
                    </p>
                    {vibe.tags && vibe.tags.length > 0 && (
                      <div className="vibe-tags">
                        {vibe.tags.map((tag, idx) => (
                          <span key={idx} className="tag-badge">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="glass-card empty-state">
                  <span className="empty-emoji">📭</span>
                  <h3>No vibes yet!</h3>
                  <p>
                    {activeTab === 'received'
                      ? "Share your profile to start receiving vibes!"
                      : "Send your first vibe to spread the love!"}
                  </p>
                  <Link
                    to={activeTab === 'received' ? `/profile/${user?.handle}` : '/send'}
                    className="btn btn-primary"
                  >
                    {activeTab === 'received' ? 'View Profile' : 'Send Vibe'}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Daily Challenge */}
          <div className="glass-card daily-challenge">
            <h3>🎯 Daily Challenge</h3>
            <p>Send 3 vibes today to unlock the "Vibe Master" badge!</p>
            <div className="challenge-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '33%' }}></div>
              </div>
              <span className="progress-text">1/3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
