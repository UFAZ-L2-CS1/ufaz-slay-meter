import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ExplorePage.css';

const ExplorePage = () => {
  const [activeTab, setActiveTab] = useState('recent');
  const [loading, setLoading] = useState(false);

  // Demo data
  const trendingTags = [
    { tag: 'Slay Queen', count: 342 },
    { tag: 'Kind Soul', count: 289 },
    { tag: 'Smart Cookie', count: 256 },
    { tag: 'Iconic', count: 198 },
    { tag: 'Main Character', count: 167 },
    { tag: 'Wholesome', count: 145 }
  ];

  const topUsers = [
    { name: 'Sarah Chen', handle: 'sarahc', vibeCount: 89, avatarUrl: null },
    { name: 'Alex Kim', handle: 'alexk', vibeCount: 76, avatarUrl: null },
    { name: 'Jordan Miller', handle: 'jordanm', vibeCount: 64, avatarUrl: null },
    { name: 'Taylor Swift', handle: 'taylors', vibeCount: 52, avatarUrl: null },
    { name: 'Chris Park', handle: 'chrisp', vibeCount: 41, avatarUrl: null }
  ];

  const totalUsers = 1234;
  const totalVibes = 5678;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="explore-page">
      <div className="container">

        {/* Header */}
        <section className="explore-header glass-card">
          <h1 className="page-title shimmer-text">UFAZ Explore Zone ✨</h1>
          <p className="page-subtitle">See what's trending and who's slaying today!</p>
        </section>

        {/* Trending Tags */}
        {trendingTags.length > 0 && (
          <section className="trending-section glass-card">
            <h2>🔥 Trending Tags</h2>
            <div className="trending-tags-grid">
              {trendingTags.map((item, index) => (
                <div className="trending-tag-card" key={index}>
                  <span className="tag-name">#{item.tag}</span>
                  <div className="tag-bar">
                    <div
                      className="tag-bar-fill"
                      style={{
                        width: `${Math.min(100, (item.count / Math.max(...trendingTags.map(t => t.count))) * 100)}%`
                      }}
                    ></div>
                  </div>
                  <p className="tag-count">{item.count} vibes</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Top Users */}
        {topUsers.length > 0 && (
          <section className="top-users-section glass-card">
            <h2>👑 Slay Queens & Kings</h2>
            <div className="top-users-list">
              {topUsers.map((user, index) => (
                <Link to={`/profile/${user.handle}`} key={index} className="top-user-card">
                  <div className="rank-badge">#{index + 1}</div>
                  <div className="user-avatar">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} />
                    ) : (
                      <span>{user.name?.charAt(0)}</span>
                    )}
                  </div>
                  <div className="user-info">
                    <h3>{user.name}</h3>
                    <p>@{user.handle}</p>
                  </div>
                  <span className="user-vibes">{user.vibeCount} vibes</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Tabs */}
        <section className="tab-section glass-card">
          <div className="tab-nav">
            {['recent', 'popular', 'wednesday'].map(tab => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => handleTabChange(tab)}
              >
                {tab === 'recent' && '💌 Recent'}
                {tab === 'popular' && '🔥 Popular'}
                {tab === 'wednesday' && '🎀 Wednesday'}
              </button>
            ))}
          </div>
        </section>

        {/* Vibes */}
        <section className="vibes-section">
          <div className="empty-state glass-card">
            <span className="empty-emoji">💭</span>
            <h3>Discover Amazing Vibes!</h3>
            <p>Be the first to send one and start the positivity chain.</p>
            <Link to="/send-vibe" className="btn btn-primary">Send Vibe 💕</Link>
          </div>
        </section>

        {/* Stats */}
        <section className="stats-preview glass-card">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">{totalUsers}</span>
              <span className="stat-label">Active Slayers</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{totalVibes}</span>
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
        </section>
      </div>
    </div>
  );
};

export default ExplorePage;