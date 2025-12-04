import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Leaderboard.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [warLeaders, setWarLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vibes');
  const [timeframe, setTimeframe] = useState('all');

  useEffect(() => {
    fetchLeaderboardData();
  }, [activeTab, timeframe]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'vibes') {
        const response = await api.get(`/leaderboard/vibes?timeframe=${timeframe}`);
        setLeaderboard(response.data.leaders || []);
      } else {
        const response = await api.get(`/leaderboard/wars?timeframe=${timeframe}`);
        setWarLeaders(response.data.leaders || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Set demo data if API fails
      if (activeTab === 'vibes') {
        setLeaderboard([]);
      } else {
        setWarLeaders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
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
              <span>🏆</span>
              <p>Loading leaderboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-page page-container">
      <div className="container">
        <div className="leaderboard-header">
          <h1 className="page-title shimmer-text">UFAZ Slay Leaderboard 🏆</h1>
          <p className="page-subtitle">
            See who's slaying the hardest at UFAZ!
          </p>
        </div>

        <div className="leaderboard-controls glass-card">
          <div className="tab-switcher">
            <button
              className={`tab-btn ${activeTab === 'vibes' ? 'active' : ''}`}
              onClick={() => setActiveTab('vibes')}
            >
              Vibe Leaders
            </button>
            <button
              className={`tab-btn ${activeTab === 'wars' ? 'active' : ''}`}
              onClick={() => setActiveTab('wars')}
            >
              War Champions
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

        {activeTab === 'vibes' ? (
          <div className="leaderboard-content">
            {leaderboard.length > 0 ? (
              <>
                {/* Top 3 Podium */}
                {leaderboard.length >= 3 && (
                  <div className="podium-section glass-card">
                    <h2>Top Slayers</h2>
                    <div className="podium">
                      <div className="podium-spot second">
                        <Link to={`/profile/${leaderboard[1]?.handle}`}>
                          <div className="podium-avatar">
                            {leaderboard[1]?.avatarUrl ? (
                              <img src={leaderboard[1].avatarUrl} alt="" />
                            ) : (
                              <span>{leaderboard[1]?.name?.charAt(0) || '?'}</span>
                            )}
                          </div>
                          <h3>{leaderboard[1]?.name}</h3>
                          <p>@{leaderboard[1]?.handle}</p>
                          <div className="podium-stats">
                            <span className="medal">🥈</span>
                            <span className="score">{leaderboard[1]?.vibeCount || 0} vibes</span>
                          </div>
                          <div className="podium-bar" style={{ height: '150px' }}>2</div>
                        </Link>
                      </div>

                      <div className="podium-spot first">
                        <Link to={`/profile/${leaderboard[0]?.handle}`}>
                          <div className="crown">👑</div>
                          <div className="podium-avatar">
                            {leaderboard[0]?.avatarUrl ? (
                              <img src={leaderboard[0].avatarUrl} alt="" />
                            ) : (
                              <span>{leaderboard[0]?.name?.charAt(0) || '?'}</span>
                            )}
                          </div>
                          <h3>{leaderboard[0]?.name}</h3>
                          <p>@{leaderboard[0]?.handle}</p>
                          <div className="podium-stats">
                            <span className="medal">🥇</span>
                            <span className="score">{leaderboard[0]?.vibeCount || 0} vibes</span>
                          </div>
                          <div className="podium-bar" style={{ height: '200px' }}>1</div>
                        </Link>
                      </div>

                      <div className="podium-spot third">
                        <Link to={`/profile/${leaderboard[2]?.handle}`}>
                          <div className="podium-avatar">
                            {leaderboard[2]?.avatarUrl ? (
                              <img src={leaderboard[2].avatarUrl} alt="" />
                            ) : (
                              <span>{leaderboard[2]?.name?.charAt(0) || '?'}</span>
                            )}
                          </div>
                          <h3>{leaderboard[2]?.name}</h3>
                          <p>@{leaderboard[2]?.handle}</p>
                          <div className="podium-stats">
                            <span className="medal">🥉</span>
                            <span className="score">{leaderboard[2]?.vibeCount || 0} vibes</span>
                          </div>
                          <div className="podium-bar" style={{ height: '100px' }}>3</div>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Full Leaderboard */}
                <div className="leaderboard-list glass-card">
                  <h2>Complete Rankings</h2>
                  {leaderboard.map((user, index) => (
                    <Link 
                      to={`/profile/${user.handle}`}
                      key={user._id || index}
                      className="leaderboard-item"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="rank-section">
                        <span className="rank">#{index + 1}</span>
                        <span className="medal">{getMedalEmoji(index + 1)}</span>
                      </div>

                      <div className="user-section">
                        <div className="user-avatar">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" />
                          ) : (
                            <span>{user.name?.charAt(0) || '?'}</span>
                          )}
                        </div>
                        <div className="user-info">
                          <h4>{user.name}</h4>
                          <p>@{user.handle}</p>
                        </div>
                      </div>

                      <div className="stats-section">
                        <div className="stat">
                          <span className="stat-value">{user.vibeCount || 0}</span>
                          <span className="stat-label">Vibes</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">{user.slayScore || 0}</span>
                          <span className="stat-label">Slay Score</span>
                        </div>
                      </div>

                      <div className="title-badge">
                        {getSlayTitle(index + 1)}
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-leaderboard glass-card">
                <span className="empty-emoji">📊</span>
                <h3>No data yet</h3>
                <p>Be the first to climb the leaderboard!</p>
                <Link to="/send-vibe" className="btn btn-primary">
                  Start Slaying
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="leaderboard-content">
            {warLeaders.length > 0 ? (
              <div className="leaderboard-list glass-card">
                <h2>Vibe War Champions</h2>
                {warLeaders.map((user, index) => (
                  <Link 
                    to={`/profile/${user.handle}`}
                    key={user._id || index}
                    className="leaderboard-item war-item"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="rank-section">
                      <span className="rank">#{index + 1}</span>
                      <span className="medal">{getMedalEmoji(index + 1)}</span>
                    </div>

                    <div className="user-section">
                      <div className="user-avatar">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" />
                        ) : (
                          <span>{user.name?.charAt(0) || '?'}</span>
                        )}
                      </div>
                      <div className="user-info">
                        <h4>{user.name}</h4>
                        <p>@{user.handle}</p>
                      </div>
                    </div>

                    <div className="stats-section">
                      <div className="stat">
                        <span className="stat-value">{user.warsWon || 0}</span>
                        <span className="stat-label">Wars Won</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{user.winRate || 0}%</span>
                        <span className="stat-label">Win Rate</span>
                      </div>
                    </div>

                    <div className="title-badge war-badge">
                      ⚔️ War {index === 0 ? 'Legend' : 'Hero'}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-leaderboard glass-card">
                <span className="empty-emoji">⚔️</span>
                <h3>No war champions yet</h3>
                <p>Participate in Vibe Wars to become a champion!</p>
                <Link to="/vibe-wars" className="btn btn-primary">
                  Join War
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Achievement Section */}
        <div className="achievements-preview glass-card">
          <h2>Achievements & Badges 🏅</h2>
          <div className="badges-grid">
            <div className="badge-item">
              <span className="badge-icon">🔥</span>
              <span className="badge-name">Hot Streak</span>
              <span className="badge-desc">10 vibes in a row</span>
            </div>
            <div className="badge-item">
              <span className="badge-icon">💎</span>
              <span className="badge-name">Diamond Slayer</span>
              <span className="badge-desc">100+ vibes received</span>
            </div>
            <div className="badge-item">
              <span className="badge-icon">⚡</span>
              <span className="badge-name">War Master</span>
              <span className="badge-desc">Won 5 vibe wars</span>
            </div>
            <div className="badge-item">
              <span className="badge-icon">👑</span>
              <span className="badge-name">Slay Royalty</span>
              <span className="badge-desc">#1 on leaderboard</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
