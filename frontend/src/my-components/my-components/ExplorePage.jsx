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

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="explore-page">
      <div className="page-container">
        <div className="container">
          {/* Header */}
          <div className="glass-card explore-header">
            <h1 className="page-title">
              <span className="shimmer-text">Explore the Vibe 🌟</span>
            </h1>
            <p className="page-subtitle">
              See what's trending and who's slaying today!
            </p>
          </div>

          {/* Stats Preview */}
          <div className="glass-card stats-preview">
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-number">{totalUsers}</span>
                <span className="stat-label">Slayers</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{totalVibes}</span>
                <span className="stat-label">Vibes Sent</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{trendingTags.length}</span>
                <span className="stat-label">Trending Tags</span>
              </div>
            </div>
          </div>

          {/* Trending Tags */}
          <div className="glass-card trending-section">
            <h2>🔥 Trending Tags</h2>
            <div className="trending-tags-grid">
              {trendingTags.map((item, index) => (
                <div key={index} className="trending-tag-card">
                  <span className="tag-name">#{item.tag}</span>
                  <div className="tag-bar">
                    <div 
                      className="tag-bar-fill" 
                      style={{ width: `${(item.count / trendingTags[0].count) * 100}%` }}
                    ></div>
                  </div>
                  <p className="tag-count">{item.count} vibes</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Users */}
          <div className="glass-card top-users-section">
            <h2>👑 Top Slayers</h2>
            <div className="top-users-list">
              {topUsers.map((user, index) => (
                <Link 
                  key={index} 
                  to={`/profile/${user.handle}`} 
                  className="top-user-card"
                >
                  <div className="rank-badge">#{index + 1}</div>
                  <div className="user-avatar">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  <div className="user-info">
                    <h3>{user.name}</h3>
                    <p>@{user.handle}</p>
                  </div>
                  <div className="user-vibes">
                    {user.vibeCount} vibes
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Vibes Section */}
          <div className="glass-card vibes-section">
            <div className="tab-section">
              <div className="tab-nav">
                <button
                  className={`tab-btn ${activeTab === 'recent' ? 'active' : ''}`}
                  onClick={() => handleTabChange('recent')}
                >
                  ⏰ Recent
                </button>
                <button
                  className={`tab-btn ${activeTab === 'popular' ? 'active' : ''}`}
                  onClick={() => handleTabChange('popular')}
                >
                  🔥 Popular
                </button>
              </div>
            </div>

            <div className="vibes-grid">
              {/* Empty state for now - can be populated with actual vibes */}
              <div className="empty-state">
                <span className="empty-emoji">✨</span>
                <h3>No vibes yet!</h3>
                <p>Be the first to send one and start the positivity chain.</p>
                <Link to="/send" className="btn btn-primary">
                  Send Vibe 💕
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
