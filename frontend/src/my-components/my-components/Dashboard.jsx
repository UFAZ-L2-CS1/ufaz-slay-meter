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

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="loading-state">
            <div className="burn-book-loader">
              <span>💖</span>
              <p>Loading your vibes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard page-container">
      <div className="container">
        {/* Welcome Section */}
        <section className="welcome-section glass-card">
          <div className="welcome-content">
            <h1 className="welcome-title">
              {getGreeting()}, {demoUser?.name}! 
            </h1>
            <p className="welcome-subtitle">{randomQuote}</p>
            <div className="quick-actions">
              <Link to="/send-vibe" className="btn btn-primary">
                Send a Vibe 💌
              </Link>
              <Link to="/explore" className="btn btn-secondary">
                Explore 🔍
              </Link>
            </div>
          </div>
          <div className="welcome-stats">
            <div className="stat-bubble">
              <span className="stat-value">{demoStats.totalTags || 0}</span>
              <span className="stat-name">Total Tags</span>
            </div>
            <div className="stat-bubble">
              <span className="stat-value">{vibes.length || 24}</span>
              <span className="stat-name">Vibes</span>
            </div>
            <div className="stat-bubble">
              <span className="stat-value">
                {demoStats.top3?.[0]?.tag || 'Slay'}
              </span>
              <span className="stat-name">Top Tag</span>
            </div>
          </div>
        </section>

        {/* Tag Cloud */}
        {demoStats?.stats && demoStats.stats.length > 0 && (
          <section className="tag-cloud-section glass-card">
            <h2>Your Vibe Cloud ☁️</h2>
            <div className="tags-cloud">
              {demoStats.stats.map((tag, index) => (
                <span 
                  key={index}
                  className={`tag-bubble ${index < 3 ? 'popular' : ''}`}
                  style={{ fontSize: `${Math.max(0.9, 0.9 + (tag.pct / 50))}rem` }}
                >
                  {tag.tag} ({tag.pct}%)
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Vibes Section */}
        <section className="vibes-section">
          <div className="section-header">
            <h2>Your Vibes 💖</h2>
            <div className="tab-switcher">
              <button
                className={`tab-btn ${activeTab === 'received' ? 'active' : ''}`}
                onClick={() => setActiveTab('received')}
              >
                Received
              </button>
              <button
                className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
                onClick={() => setActiveTab('sent')}
              >
                Sent
              </button>
            </div>
          </div>

          <div className="vibes-list">
            {vibes.length > 0 ? (
              vibes.map((vibe, index) => (
                <div key={vibe._id || index} className="glass-card">
                  <p>{vibe.message || "You're amazing! Keep slaying! 💕"}</p>
                </div>
              ))
            ) : (
              <div className="empty-state glass-card">
                <span className="empty-emoji">😢</span>
                <h3>No vibes yet!</h3>
                <p>
                  {activeTab === 'received' 
                    ? "Share your profile to start receiving vibes!" 
                    : "Send your first vibe to spread the love!"}
                </p>
                <Link 
                  to={activeTab === 'received' ? `/profile/${demoUser?.handle}` : '/send-vibe'} 
                  className="btn btn-primary"
                >
                  {activeTab === 'received' ? 'View Profile' : 'Send Vibe'}
                </Link>
              </div>
            )}
          </div>

          {vibes.length > 0 && (
            <div className="pagination">
              <button 
                className="btn btn-secondary"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="page-info">Page {page}</span>
              <button 
                className="btn btn-secondary"
                onClick={() => setPage(page + 1)}
                disabled={vibes.length < 10}
              >
                Next
              </button>
            </div>
          )}
        </section>

        {/* Daily Challenge */}
        <section className="daily-challenge glass-card">
          <h3>Daily Vibe Challenge 🎯</h3>
          <p>Send 3 vibes today to unlock the "Vibe Master" badge!</p>
          <div className="challenge-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '33%' }}></div>
            </div>
            <span className="progress-text">1 / 3</span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;