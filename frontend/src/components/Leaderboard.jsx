import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Leaderboard.css';

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('vibes');
  const [timeframe, setTimeframe] = useState('all');
  const [loading, setLoading] = useState(false);

  // Demo data
  const leaderboard = [
    { _id: '1', name: 'Sarah Chen', handle: 'sarahc', vibeCount: 156, slayScore: 892, avatarUrl: null },
    { _id: '2', name: 'Alex Kim', handle: 'alexk', vibeCount: 134, slayScore: 756, avatarUrl: null },
    { _id: '3', name: 'Jordan Miller', handle: 'jordanm', vibeCount: 98, slayScore: 623, avatarUrl: null },
    { _id: '4', name: 'Taylor Swift', handle: 'taylors', vibeCount: 87, slayScore: 512, avatarUrl: null },
    { _id: '5', name: 'Chris Park', handle: 'chrisp', vibeCount: 76, slayScore: 445, avatarUrl: null }
  ];

  const warLeaders = [
    { _id: '1', name: 'Sarah Chen', handle: 'sarahc', warsWon: 23, winRate: 87, avatarUrl: null },
    { _id: '2', name: 'Alex Kim', handle: 'alexk', warsWon: 19, winRate: 82, avatarUrl: null },
    { _id: '3', name: 'Jordan Miller', handle: 'jordanm', warsWon: 15, winRate: 75, avatarUrl: null }
  ];

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

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const currentLeaderboard = activeTab === 'vibes' ? leaderboard : warLeaders;
  const top3 = currentLeaderboard.slice(0, 3);
  const rest = currentLeaderboard.slice(3);

  if (loading) {
    return (
      <div className="leaderboard-page">
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

  return (
    <div className="leaderboard-page">
      <div className="container">
        {/* Header */}
        <div className="leaderboard-header">
          <h1 className="page-title">Leaderboard 👑</h1>
          <p className="page-subtitle">See who's slaying the hardest at UFAZ!</p>
        </div>

        {/* Controls */}
        <div className="glass-card leaderboard-controls">
          <div className="tab-switcher">
            <button
              className={`tab-btn ${activeTab === 'vibes' ? 'active' : ''}`}
              onClick={() => setActiveTab('vibes')}
            >
              💌 Vibes Received
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
              className={`timeframe-btn ${timeframe === 'all' ? 'active' : ''}`}
              onClick={() => setTimeframe('all')}
            >
              All Time
            </button>
            <button
              className={`timeframe-btn ${timeframe === 'month' ? 'active' : ''}`}
              onClick={() => setTimeframe('month')}
            >
              This Month
            </button>
            <button
              className={`timeframe-btn ${timeframe === 'week' ? 'active' : ''}`}
              onClick={() => setTimeframe('week')}
            >
              This Week
            </button>
          </div>
        </div>

        {/* Podium (Top 3) */}
        {top3.length >= 3 && (
          <div className="glass-card podium-section">
            <h2>🏆 Top Slayers</h2>
            <div className="podium">
              {/* Second Place */}
              <div className="podium-spot second">
                <Link to={`/profile/${top3[1].handle}`}>
                  <div className="crown">👑</div>
                  <div className="podium-avatar">
                    {top3[1].avatarUrl ? (
                      <img src={top3[1].avatarUrl} alt={top3[1].name} />
                    ) : (
                      getInitials(top3[1].name)
                    )}
                  </div>
                  <h3>{top3[1].name}</h3>
                  <p>@{top3[1].handle}</p>
                  <div className="podium-stats">
                    <span className="medal">{getMedalEmoji(2)}</span>
                    <span className="score">
                      {activeTab === 'vibes' ? top3[1].slayScore : top3[1].warsWon}
                    </span>
                  </div>
                  <div className="podium-bar" style={{ height: '120px' }}>
                    #2
                  </div>
                </Link>
              </div>

              {/* First Place */}
              <div className="podium-spot first">
                <Link to={`/profile/${top3[0].handle}`}>
                  <div className="crown">👑</div>
                  <div className="podium-avatar">
                    {top3[0].avatarUrl ? (
                      <img src={top3[0].avatarUrl} alt={top3[0].name} />
                    ) : (
                      getInitials(top3[0].name)
                    )}
                  </div>
                  <h3>{top3[0].name}</h3>
                  <p>@{top3[0].handle}</p>
                  <div className="podium-stats">
                    <span className="medal">{getMedalEmoji(1)}</span>
                    <span className="score">
                      {activeTab === 'vibes' ? top3[0].slayScore : top3[0].warsWon}
                    </span>
                  </div>
                  <div className="podium-bar" style={{ height: '160px' }}>
                    #1
                  </div>
                </Link>
              </div>

              {/* Third Place */}
              <div className="podium-spot third">
                <Link to={`/profile/${top3[2].handle}`}>
                  <div className="crown">👑</div>
                  <div className="podium-avatar">
                    {top3[2].avatarUrl ? (
                      <img src={top3[2].avatarUrl} alt={top3[2].name} />
                    ) : (
                      getInitials(top3[2].name)
                    )}
                  </div>
                  <h3>{top3[2].name}</h3>
                  <p>@{top3[2].handle}</p>
                  <div className="podium-stats">
                    <span className="medal">{getMedalEmoji(3)}</span>
                    <span className="score">
                      {activeTab === 'vibes' ? top3[2].slayScore : top3[2].warsWon}
                    </span>
                  </div>
                  <div className="podium-bar" style={{ height: '100px' }}>
                    #3
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Rest of Leaderboard */}
        <div className="glass-card leaderboard-list">
          <h2>📊 Full Rankings</h2>
          {rest.length > 0 ? (
            rest.map((user, index) => {
              const rank = index + 4;
              return (
                <Link
                  key={user._id}
                  to={`/profile/${user.handle}`}
                  className="leaderboard-item"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="rank-section">
                    <span className="rank">#{rank}</span>
                    <span className="medal">{getMedalEmoji(rank)}</span>
                  </div>

                  <div className="user-section">
                    <div className="user-avatar">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} />
                      ) : (
                        getInitials(user.name)
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
                          <span className="stat-value">{user.vibeCount}</span>
                          <span className="stat-label">Vibes</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">{user.slayScore}</span>
                          <span className="stat-label">Score</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="stat">
                          <span className="stat-value">{user.warsWon}</span>
                          <span className="stat-label">Wins</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">{user.winRate}%</span>
                          <span className="stat-label">Win Rate</span>
                        </div>
                      </>
                    )}
                  </div>

                  <span className={`title-badge ${activeTab === 'wars' ? 'war-badge' : ''}`}>
                    {getSlayTitle(rank)}
                  </span>
                </Link>
              );
            })
          ) : (
            <div className="empty-leaderboard">
              <span className="empty-emoji">📊</span>
              <h3>No rankings yet!</h3>
              <p>
                {activeTab === 'vibes'
                  ? 'Be the first to climb the leaderboard!'
                  : 'Participate in Vibe Wars to become a champion!'}
              </p>
              <Link
                to={activeTab === 'vibes' ? '/send' : '/wars'}
                className="btn btn-primary"
              >
                {activeTab === 'vibes' ? 'Start Slaying 💖' : 'Join War 💪'}
              </Link>
            </div>
          )}
        </div>

        {/* Achievements Preview */}
        <div className="glass-card achievements-preview">
          <h2>🎖️ Top Achievements</h2>
          <div className="badges-grid">
            <div className="badge-item">
              <span className="badge-icon">👑</span>
              <p className="badge-name">Slay Royalty</p>
              <p className="badge-desc">Reach #1 on leaderboard</p>
            </div>
            <div className="badge-item">
              <span className="badge-icon">💯</span>
              <p className="badge-name">Century Club</p>
              <p className="badge-desc">Receive 100 vibes</p>
            </div>
            <div className="badge-item">
              <span className="badge-icon">⚔️</span>
              <p className="badge-name">War Legend</p>
              <p className="badge-desc">Win 20 Vibe Wars</p>
            </div>
            <div className="badge-item">
              <span className="badge-icon">✨</span>
              <p className="badge-name">Vibe Master</p>
              <p className="badge-desc">Send 50 vibes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
