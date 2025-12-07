import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = ({ user, vibes: initialVibes = [], stats: initialStats = null }) => {
  const [vibes, setVibes] = useState(initialVibes);
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('received');
  const [page, setPage] = useState(1);

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

  // Demo stats for display
  const demoStats = stats || {
    totalTags: 42,
    top3: [{ tag: 'Slay' }],
    stats: [
      { tag: 'Slay', pct: 35 },
      { tag: 'Kind', pct: 25 },
      { tag: 'Smart', pct: 20 },
      { tag: 'Funny', pct: 12 },
      { tag: 'Creative', pct: 8 }
    ]
  };

  const demoUser = user || { name: 'Slayer', handle: 'slayer123' };

  // Demo vibes data
  const demoVibes = vibes.length > 0 ? vibes : [
    {
      id: 1,
      from: { name: 'Sarah Chen', handle: 'sarahc' },
      message: "You're absolutely slaying today! Keep being amazing! ✨",
      tags: ['Slay', 'Iconic'],
      timestamp: '2 hours ago',
      anonymous: false
    },
    {
      id: 2,
      from: null,
      message: "Your positive energy is contagious! 💕",
      tags: ['Kind', 'Wholesome'],
      timestamp: '5 hours ago',
      anonymous: true
    }
  ];

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

  return (
    <div className="dashboard">
      <div className="page-container">
        <div className="container">
          {/* Welcome Section */}
          <div className="glass-card welcome-section">
            <div className="welcome-content">
              <h1 className="welcome-title">
                {getGreeting()}, {demoUser.name}! 👑
              </h1>
              <p className="welcome-subtitle">
                Ready to spread some positive vibes today?
              </p>
              <div className="quick-actions">
                <Link to="/send" className="btn btn-primary">
                  ✨ Send Vibe
                </Link>
                <Link to={`/profile/${demoUser.handle}`} className="btn btn-secondary">
                  👤 View Profile
                </Link>
              </div>
            </div>
            <div className="welcome-stats">
              <div className="stat-bubble">
                <span className="stat-value">{demoStats.totalTags}</span>
                <span className="stat-name">Total Vibes</span>
              </div>
              <div className="stat-bubble">
                <span className="stat-value">#{Math.floor(Math.random() * 50) + 1}</span>
                <span className="stat-name">Rank</span>
              </div>
            </div>
          </div>

          {/* Tag Cloud Section */}
          <div className="glass-card tag-cloud-section">
            <h2>Your Top Vibes 🌟</h2>
            <div className="tags-cloud">
              {demoStats.stats.map((stat, index) => (
                <span
                  key={index}
                  className={`tag-bubble ${index === 0 ? 'popular' : ''}`}
                  style={{ fontSize: `${0.9 + stat.pct / 100}rem` }}
                >
                  {stat.tag} ({stat.pct}%)
                </span>
              ))}
            </div>
          </div>

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
              {demoVibes.length > 0 ? (
                demoVibes.map((vibe) => (
                  <div key={vibe.id} className="glass-card vibe-item">
                    <div className="vibe-header">
                      <div className="vibe-sender">
                        {vibe.anonymous ? (
                          <span className="anonymous">🎭 Anonymous</span>
                        ) : (
                          <span>
                            <strong>{vibe.from.name}</strong> @{vibe.from.handle}
                          </span>
                        )}
                      </div>
                      <span className="vibe-time">{vibe.timestamp}</span>
                    </div>
                    <p className="vibe-message">
                      {vibe.message || "You're amazing! Keep slaying! 💕"}
                    </p>
                    <div className="vibe-tags">
                      {vibe.tags.map((tag, idx) => (
                        <span key={idx} className="tag-badge">
                          {tag}
                        </span>
                      ))}
                    </div>
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
                    to={activeTab === 'received' ? `/profile/${demoUser.handle}` : '/send'}
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
