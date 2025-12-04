import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import VibeCard from './VibeCard';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [vibes, setVibes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchDashboardData();
  }, [user, page]);

  const fetchDashboardData = async () => {
    if (!user?.handle) return;
    
    setLoading(true);
    try {
      const [vibesRes, statsRes] = await Promise.all([
        api.get(`/vibes/user/${user.handle}?page=${page}&limit=10`),
        api.get(`/vibes/user/${user.handle}/stats`)
      ]);
      
      setVibes(vibesRes.data.items);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (vibeId, reactionType) => {
    try {
      const response = await api.post(`/vibes/${vibeId}/react`, {
        type: reactionType
      });
      
      // Update local state with new reactions
      setVibes(vibes.map(vibe => 
        vibe._id === vibeId 
          ? { ...vibe, reactions: response.data.reactions }
          : vibe
      ));
    } catch (error) {
      console.error('Error adding reaction:', error);
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
              {getGreeting()}, {user?.name}! 
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
            {stats && (
              <>
                <div className="stat-bubble">
                  <span className="stat-value">{stats.totalTags || 0}</span>
                  <span className="stat-name">Total Tags</span>
                </div>
                <div className="stat-bubble">
                  <span className="stat-value">{vibes.length}</span>
                  <span className="stat-name">Vibes</span>
                </div>
                <div className="stat-bubble">
                  <span className="stat-value">
                    {stats.top3?.[0]?.tag || 'N/A'}
                  </span>
                  <span className="stat-name">Top Tag</span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Tag Cloud */}
        {stats?.stats && stats.stats.length > 0 && (
          <section className="tag-cloud-section glass-card">
            <h2>Your Vibe Cloud ☁️</h2>
            <div className="tags-cloud">
              {stats.stats.map((tag, index) => (
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
              vibes.map((vibe) => (
                <VibeCard
                  key={vibe._id}
                  vibe={vibe}
                  onReaction={handleReaction}
                  currentUser={user}
                />
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
                  to={activeTab === 'received' ? `/profile/${user.handle}` : '/send-vibe'} 
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
