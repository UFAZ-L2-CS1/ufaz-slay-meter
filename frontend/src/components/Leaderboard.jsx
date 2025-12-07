import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Leaderboard.css';

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('vibes');
  const [timeframe, setTimeframe] = useState('all');
  const [leaderboard, setLeaderboard] = useState([]);
  const [warLeaders, setWarLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeTab === 'vibes') {
      fetchVibeLeaders();
    } else {
      fetchWarLeaders();
    }
  }, [activeTab, timeframe]);

  const fetchVibeLeaders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/leaderboard/vibes?timeframe=${timeframe}`);
      setLeaderboard(response.data.leaders);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Could not load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchWarLeaders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/leaderboard/wars?timeframe=${timeframe}`);
      setWarLeaders(response.data.leaders);
    } catch (err) {
      console.error('Error fetching war leaders:', err);
      setError('Could not load war leaders');
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '👑';
    }
  };

  const getSlayTitle = (rank) => {
    switch (rank) {
      case 1: return 'Ultimate Slay Queen/King';
      case 2: return 'Slay Master';
      case 3: return 'Slay Champion';
      default: return `Top ${rank} Slayer`;
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="loading-state">
            <div className="slay-loader">
              <span>👑</span>
              <p>Loading leaderboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="error-state glass-card">
            <h2>❌ {error}</h2>
            <button onClick={() => activeTab === 'vibes' ? fetchVibeLeaders() : fetchWarLeaders()} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentLeaders = activeTab === 'vibes' ? leaderboard : warLeaders;

  return (
    <div className="leaderboard-page page-container">
      <div className="container">
        <div className="leaderboard-header">
          <h1 className="page-title">👑 UFAZ Slay Leaderboard</h1>
          <p className="page-subtitle">See who's slaying the hardest at UFAZ!</p>
        </div>

        <div className="leaderboard-controls glass-card">
          <div className="tab-switcher">
            <button
              className={`tab-btn ${activeTab === 'vibes' ? 'active' : ''}`}
              onClick={() => setActiveTab('vibes')}
            >
              💖 Vibe Leaders
            </button>
            <button
              className={`tab-btn ${activeTab === 'wars' ? 'active' : ''}`}
              onClick={() => setActiveTab('wars')}
            >
              ⚔️ War Champions
            </button>
          </div>

          <div className="timeframe-selector">
            <button
              className={`timeframe-btn ${timeframe === 'day' ? 'active' : ''}`}
              onClick={() => setTimeframe('day')}
            >
              Today
            </button>
            <button
              className={`timeframe-btn ${timeframe === 'week' ? 'active' : ''}`}
              onClick={() => setTimeframe('week')}
            >
              This Week
            </button>
            <button
              className={`timeframe-btn ${timeframe === 'month' ? 'active' : ''}`}
              onClick={() => setTimeframe('month')}
            >
              This Month
            </button>
            <button
              className={`timeframe-btn ${timeframe === 'all' ? 'active' : ''}`}
              onClick={() => setTimeframe('all')}
            >
              All Time
            </button>
          </div>
        </div>

        {currentLeaders.length === 0 ? (
          <div className="empty-leaderboard glass-card">
            <span className="empty-emoji">😔</span>
            <h3>No data yet</h3>
            <p>Be the first to climb the leaderboard!</p>
            <Link to="/send-vibe" className="btn btn-primary">
              Start Slaying ✨
            </Link>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {currentLeaders.length >= 3 && (
              <div className="podium-section glass-card">
                <h2>🏆 Top Slayers</h2>
                <div className="podium">
                  {/* 2nd Place */}
                  <div className="podium-spot second">
                    <Link to={`/profile/${currentLeaders[1]?.handle}`}>
                      <div className="podium-avatar">
                        {currentLeaders[1]?.avatarUrl ? (
                          <img src={currentLeaders[1].avatarUrl} alt={currentLeaders[1].name} />
                        ) : (
                          <span>{currentLeaders[1]?.name?.charAt(0)?.toUpperCase()}</span>
                        )}
                      </div>
                      <h3>{currentLeaders[1]?.name}</h3>
                      <p>@{currentLeaders[1]?.handle}</p>
                      <div className="podium-stats">
                        <span className="medal">🥈</span>
                        <span className="score">
                          {activeTab === 'vibes'
                            ? `${currentLeaders[1]?.vibeCount || 0} vibes`
                            : `${currentLeaders[1]?.warsWon || 0} wins`}
                        </span>
                      </div>
                      <div className="podium-bar" style={{ height: '150px' }}>
                        2
                      </div>
                    </Link>
                  </div>

                  {/* 1st Place */}
                  <div className="podium-spot first">
                    <Link to={`/profile/${currentLeaders[0]?.handle}`}>
                      <div className="crown">👑</div>
                      <div className="podium-avatar">
                        {currentLeaders[0]?.avatarUrl ? (
                          <img src={currentLeaders[0].avatarUrl} alt={currentLeaders[0].name} />
                        ) : (
                          <span>{currentLeaders[0]?.name?.charAt(0)?.toUpperCase()}</span>
                        )}
                      </div>
                      <h3>{currentLeaders[0]?.name}</h3>
                      <p>@{currentLeaders[0]?.handle}</p>
                      <div className="podium-stats">
                        <span className="medal">🥇</span>
                        <span className="score">
                          {activeTab === 'vibes'
                            ? `${currentLeaders[0]?.vibeCount || 0} vibes`
                            : `${currentLeaders[0]?.warsWon || 0} wins`}
                        </span>
                      </div>
                      <div className="podium-bar" style={{ height: '200px' }}>
                        1
                      </div>
                    </Link>
                  </div>

                  {/* 3rd Place */}
                  <div className="podium-spot third">
                    <Link to={`/profile/${currentLeaders[2]?.handle}`}>
                      <div className="podium-avatar">
                        {currentLeaders[2]?.avatarUrl ? (
                          <img src={currentLeaders[2].avatarUrl} alt={currentLeaders[2].name} />
                        ) : (
                          <span>{currentLeaders[2]?.name?.charAt(0)?.toUpperCase()}</span>
                        )}
                      </div>
                      <h3>{currentLeaders[2]?.name}</h3>
                      <p>@{currentLeaders[2]?.handle}</p>
                      <div className="podium-stats">
                        <span className="medal">🥉</span>
                        <span className="score">
                          {activeTab === 'vibes'
                            ? `${currentLeaders[2]?.vibeCount || 0} vibes`
                            : `${currentLeaders[2]?.warsWon || 0} wins`}
                        </span>
                      </div>
                      <div className="podium-bar" style={{ height: '100px' }}>
                        3
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Full Leaderboard */}
            <div className="leaderboard-list glass-card">
              <h2>📊 Complete Rankings</h2>
              {currentLeaders.map((user, index) => (
                <Link
                  to={`/profile/${user.handle}`}
                  key={user.id || index}
                  className="leaderboard-item"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="rank-section">
                    <span className="rank">{index + 1}</span>
                    <span className="medal">{getMedalEmoji(index + 1)}</span>
                  </div>

                  <div className="user-section">
                    <div className="user-avatar">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} />
                      ) : (
                        <span>{user.name?.charAt(0)?.toUpperCase()}</span>
                      )}
                    </div>
                    <div className="user-info">
                      <h4>{user.name}</h4>
                      <p>@{user.handle}</p>
                    </div>
                  </div>

                  <div className="stats-section">
                    {activeTab === 'vibes' ? (
                      <>
                        <div className="stat">
                          <span className="stat-value">{user.vibeCount || 0}</span>
                          <span className="stat-label">Vibes</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">{user.slayScore || 0}</span>
                          <span className="stat-label">Slay Score</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="stat">
                          <span className="stat-value">{user.warsWon || 0}</span>
                          <span className="stat-label">Wars Won</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">{user.winRate || 0}%</span>
                          <span className="stat-label">Win Rate</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="title-badge">
                    {getSlayTitle(index + 1)}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
