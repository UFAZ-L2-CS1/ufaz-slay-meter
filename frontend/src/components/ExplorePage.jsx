import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import VibeCard from './VibeCard';
import './ExplorePage.css';

const ExplorePage = () => {
  const [recentVibes, setRecentVibes] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalVibes, setTotalVibes] = useState(0);

  useEffect(() => {
    fetchExploreData();
  }, [activeTab, page]);

  useEffect(() => {
    // Fetch stats separately
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const statsRes = await api.get('/stats/global');
      setTotalUsers(statsRes.data.totalUsers || 0);
      setTotalVibes(statsRes.data.totalVibes || 0);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchExploreData = async () => {
    setLoading(true);
    try {
      const [vibesRes, tagsRes, usersRes] = await Promise.all([
        api.get(`/vibes/public?page=${page}&limit=10&type=${activeTab}`),
        api.get('/tags/trending'),
        api.get('/users/top?limit=5')
      ]);
      
      if (page === 1) {
        setRecentVibes(vibesRes.data.items || []);
      } else {
        setRecentVibes(prev => [...prev, ...(vibesRes.data.items || [])]);
      }
      
      setHasMore(vibesRes.data.items?.length === 10);
      setTrendingTags(tagsRes.data.tags || []);
      setTopUsers(usersRes.data.users || []);
    } catch (error) {
      console.error('Error fetching explore data:', error);
      // Set empty arrays if API fails
      if (page === 1) {
        setRecentVibes([]);
        setTrendingTags([]);
        setTopUsers([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreVibes = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setRecentVibes([]);
  };

  if (loading && page === 1) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="loading-state">
            <div className="slay-loader">
              <span>💖</span>
              <p>Loading slay vibes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="explore-page page-container">
      <div className="container">
        {/* Page Header */}
        <section className="explore-header">
          <h1 className="page-title shimmer-text">Explore UFAZ Vibes</h1>
          <p className="page-subtitle">
            Discover who's slaying and what's trending at UFAZ! ✨
          </p>
        </section>

        {/* Search Bar */}
        <section className="search-section glass-card">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search users or tags..." 
              className="search-input"
            />
            <button className="search-btn btn btn-primary">
              Search 🔍
            </button>
          </div>
        </section>

        {/* Trending Tags */}
        {trendingTags.length > 0 && (
          <section className="trending-section glass-card">
            <h2>Trending Tags 🔥</h2>
            <div className="trending-tags-grid">
              {trendingTags.map((item, index) => (
                <div 
                  key={index} 
                  className="trending-tag-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="tag-header">
                    <span className="tag-name">#{item.tag}</span>
                    <span className={`trend-indicator ${item.trend || 'stable'}`}>
                      {item.trend === 'up' && '↑'}
                      {item.trend === 'down' && '↓'}
                      {(!item.trend || item.trend === 'stable') && '→'}
                    </span>
                  </div>
                  <div className="tag-count">{item.count} vibes</div>
                  <div className="tag-bar">
                    <div 
                      className="tag-bar-fill" 
                      style={{ width: `${Math.min(100, (item.count / Math.max(...trendingTags.map(t => t.count))) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Top Users */}
        {topUsers.length > 0 && (
          <section className="top-users-section glass-card">
            <h2>Slay Queens & Kings 👑</h2>
            <div className="top-users-list">
              {topUsers.map((user, index) => (
                <Link 
                  to={`/profile/${user.handle}`}
                  key={user._id || index}
                  className="top-user-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="user-rank">#{index + 1}</div>
                  <div className="user-avatar">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} />
                    ) : (
                      <span>{user.name?.charAt(0) || '?'}</span>
                    )}
                  </div>
                  <div className="user-info">
                    <h3>{user.name}</h3>
                    <p>@{user.handle}</p>
                  </div>
                  <div className="user-stats">
                    <span className="vibe-count">{user.vibeCount || 0}</span>
                    <span className="vibe-label">vibes</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Tab Navigation */}
        <section className="content-tabs">
          <div className="tab-nav">
            <button
              className={`tab-btn ${activeTab === 'recent' ? 'active' : ''}`}
              onClick={() => handleTabChange('recent')}
            >
              Recent Vibes
            </button>
            <button
              className={`tab-btn ${activeTab === 'popular' ? 'active' : ''}`}
              onClick={() => handleTabChange('popular')}
            >
              Most Popular
            </button>
            <button
              className={`tab-btn ${activeTab === 'wednesday' ? 'active' : ''}`}
              onClick={() => handleTabChange('wednesday')}
            >
              Wednesday Special
            </button>
          </div>
        </section>

        {/* Recent Vibes */}
        <section className="recent-vibes-section">
          <h2>
            {activeTab === 'recent' && 'Recent Public Vibes 💌'}
            {activeTab === 'popular' && 'Most Loved Vibes ❤️'}
            {activeTab === 'wednesday' && 'Wednesday Vibes 🎀'}
          </h2>
          
          {recentVibes.length > 0 ? (
            <div className="vibes-grid">
              {recentVibes.map((vibe) => (
                <VibeCard
                  key={vibe._id}
                  vibe={vibe}
                  currentUser={null}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state glass-card">
              <span className="empty-emoji">💭</span>
              <h3>No vibes yet!</h3>
              <p>Be the first to send a vibe!</p>
              <Link to="/send-vibe" className="btn btn-primary">
                Send First Vibe
              </Link>
            </div>
          )}

          {hasMore && recentVibes.length > 0 && (
            <div className="load-more">
              <button 
                className="btn btn-secondary"
                onClick={loadMoreVibes}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More Vibes'}
              </button>
            </div>
          )}
        </section>

        {/* Stats Section */}
        <section className="stats-preview">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">{totalUsers || '0'}</span>
              <span className="stat-label">Active Slayers</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{totalVibes || '0'}</span>
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

        {/* Call to Action */}
        <section className="explore-cta glass-card">
          <h2>Ready to Check Your Slay Level?</h2>
          <p>Sign up now and start spreading UFAZ vibes!</p>
          <div className="cta-buttons">
            <Link to="/" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/send-vibe" className="btn btn-fetch">
              Send Anonymous Vibe
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ExplorePage;
