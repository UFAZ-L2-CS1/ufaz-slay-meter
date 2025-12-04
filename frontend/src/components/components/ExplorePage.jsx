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
    if (hasMore && !loading) setPage(prev => prev + 1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setRecentVibes([]);
  };

  return (
    <div className="explore-page">
      <div className="container">

        {/* Header */}
        <section className="explore-header glass-card">
          <h1 className="page-title shimmer-text">UFAZ Explore Zone ✨</h1>
          <p className="page-subtitle">See what’s trending and who’s slaying today!</p>
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
          {recentVibes.length > 0 ? (
            <div className="vibes-grid">
              {recentVibes.map(vibe => (
                <VibeCard key={vibe._id} vibe={vibe} currentUser={null} />
              ))}
            </div>
          ) : (
            <div className="empty-state glass-card">
              <span className="empty-emoji">💭</span>
              <h3>No vibes yet!</h3>
              <p>Be the first to send one.</p>
              <Link to="/send-vibe" className="btn btn-primary">Send Vibe</Link>
            </div>
          )}
          {hasMore && recentVibes.length > 0 && (
            <div className="load-more">
              <button
                className="btn btn-secondary"
                onClick={loadMoreVibes}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
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
