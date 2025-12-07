import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './VibeWars.css';

const VibeWars = () => {
  const [loading, setLoading] = useState(false);
  const [currentWar, setCurrentWar] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedFor, setVotedFor] = useState(null);
  const [warHistory, setWarHistory] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState('24:00:00');

  // Demo data for current war
  useEffect(() => {
    // Simulate loading current war
    const demoWar = {
      id: 1,
      contestant1: {
        id: 1,
        name: 'Sarah Chen',
        handle: '@sarahc',
        avatarUrl: null,
        vibe: {
          text: 'You absolutely slayed that presentation! Your confidence was off the charts! 🔥',
          tags: ['confident', 'inspiring', 'queen'],
        },
        votes: 42,
      },
      contestant2: {
        id: 2,
        name: 'Alex Kim',
        handle: '@alexk',
        avatarUrl: null,
        vibe: {
          text: 'Your style today was immaculate! Serving major looks and vibes! 💅✨',
          tags: ['stylish', 'iconic', 'slay'],
        },
        votes: 38,
      },
      totalVotes: 80,
      endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    };

    setCurrentWar(demoWar);

    // Demo war history
    setWarHistory([
      {
        id: 1,
        winner: { name: 'Jordan Miller', handle: '@jordanm', avatarUrl: null },
        rank: 1,
        votes: 156,
        totalVotes: 289,
        date: 'Yesterday',
      },
      {
        id: 2,
        winner: { name: 'Taylor Swift', handle: '@taylors', avatarUrl: null },
        rank: 2,
        votes: 142,
        totalVotes: 267,
        date: '2 days ago',
      },
      {
        id: 3,
        winner: { name: 'Chris Park', handle: '@chrisp', avatarUrl: null },
        rank: 3,
        votes: 128,
        totalVotes: 245,
        date: '3 days ago',
      },
    ]);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!currentWar) return;

    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(currentWar.endsAt);
      const diff = end - now;

      if (diff <= 0) {
        setTimeRemaining('00:00:00');
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [currentWar]);

  const handleVote = (contestantId) => {
    if (hasVoted) return;

    setHasVoted(true);
    setVotedFor(contestantId);

    // Update vote counts
    setCurrentWar((prev) => ({
      ...prev,
      contestant1: {
        ...prev.contestant1,
        votes: prev.contestant1.id === contestantId ? prev.contestant1.votes + 1 : prev.contestant1.votes,
      },
      contestant2: {
        ...prev.contestant2,
        votes: prev.contestant2.id === contestantId ? prev.contestant2.votes + 1 : prev.contestant2.votes,
      },
      totalVotes: prev.totalVotes + 1,
    }));
  };

  const getVotePercentage = (votes, total) => {
    if (total === 0) return 0;
    return ((votes / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="vibe-wars-page">
        <div className="container">
          <div className="loading-state">
            <div className="slay-loader">
              <span>⚔️</span>
              <p>Loading Vibe Wars...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentWar) {
    return (
      <div className="vibe-wars-page">
        <div className="container">
          <div className="vibe-wars-header">
            <h1 className="page-title">
              <span className="shimmer-text">⚔️ VIBE WARS ⚔️</span>
            </h1>
            <p className="page-subtitle">Battle of the Best Vibes</p>
          </div>

          <div className="glass-card no-war">
            <span className="empty-emoji">😴</span>
            <h2>No Active War Right Now</h2>
            <p>Check back soon for the next epic vibe battle!</p>
          </div>

          {/* War History */}
          {warHistory.length > 0 && (
            <div className="glass-card war-history">
              <h2>🏆 Past Champions</h2>
              <div className="history-list">
                {warHistory.map((war) => (
                  <Link to={`/profile/${war.winner.handle}`} key={war.id} className="history-item">
                    <div className="winner-info">
                      <div className="winner-rank">#{war.rank}</div>
                      <div className="winner-avatar">
                        {war.winner.avatarUrl ? (
                          <img src={war.winner.avatarUrl} alt={war.winner.name} />
                        ) : (
                          <span>{war.winner.name?.charAt(0)?.toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <h4>{war.winner.name}</h4>
                        <p>{war.winner.handle}</p>
                      </div>
                    </div>
                    <div className="war-stats">
                      <span>{war.date}</span>
                      <span className="win-percentage">
                        {getVotePercentage(war.votes, war.totalVotes)}% votes
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="vibe-wars-page">
      <div className="container">
        {/* Header */}
        <div className="vibe-wars-header">
          <h1 className="page-title">
            <span className="shimmer-text">⚔️ VIBE WARS ⚔️</span>
          </h1>
          <p className="page-subtitle">Vote for the most iconic vibe!</p>
        </div>

        {/* Timer */}
        <div className="glass-card">
          <div className="war-timer">
            <span className="timer-label">⏰ Time Remaining</span>
            <span className="timer-value">{timeRemaining}</span>
          </div>

          {/* War Arena */}
          <div className="war-arena">
            {/* Contestant 1 */}
            <div className="contestant contestant-1">
              <div className="contestant-header">
                <div className="contestant-avatar">
                  {currentWar.contestant1.avatarUrl ? (
                    <img src={currentWar.contestant1.avatarUrl} alt={currentWar.contestant1.name} />
                  ) : (
                    <span>{currentWar.contestant1.name?.charAt(0)?.toUpperCase()}</span>
                  )}
                </div>
                <h3>{currentWar.contestant1.name}</h3>
                <p>{currentWar.contestant1.handle}</p>
              </div>

              <div className="vibe-content">
                <p className="vibe-text">{currentWar.contestant1.vibe.text}</p>
                {currentWar.contestant1.vibe.tags.length > 0 && (
                  <div className="vibe-tags">
                    {currentWar.contestant1.vibe.tags.map((tag, idx) => (
                      <span key={idx} className="vibe-tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="vote-section">
                <button
                  className={`btn-vote ${hasVoted ? 'disabled' : ''}`}
                  onClick={() => handleVote(currentWar.contestant1.id)}
                  disabled={hasVoted}
                >
                  {hasVoted && votedFor === currentWar.contestant1.id ? '✅ Voted!' : '👑 Vote'}
                </button>

                <div className="vote-stats">
                  <div className="vote-bar">
                    <div
                      className="vote-fill"
                      style={{
                        width: `${getVotePercentage(currentWar.contestant1.votes, currentWar.totalVotes)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="vote-count">
                    {currentWar.contestant1.votes} votes (
                    {getVotePercentage(currentWar.contestant1.votes, currentWar.totalVotes)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* VS Divider */}
            <div className="vs-divider">
              <span>VS</span>
            </div>

            {/* Contestant 2 */}
            <div className="contestant contestant-2">
              <div className="contestant-header">
                <div className="contestant-avatar">
                  {currentWar.contestant2.avatarUrl ? (
                    <img src={currentWar.contestant2.avatarUrl} alt={currentWar.contestant2.name} />
                  ) : (
                    <span>{currentWar.contestant2.name?.charAt(0)?.toUpperCase()}</span>
                  )}
                </div>
                <h3>{currentWar.contestant2.name}</h3>
                <p>{currentWar.contestant2.handle}</p>
              </div>

              <div className="vibe-content">
                <p className="vibe-text">{currentWar.contestant2.vibe.text}</p>
                {currentWar.contestant2.vibe.tags.length > 0 && (
                  <div className="vibe-tags">
                    {currentWar.contestant2.vibe.tags.map((tag, idx) => (
                      <span key={idx} className="vibe-tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="vote-section">
                <button
                  className={`btn-vote ${hasVoted ? 'disabled' : ''}`}
                  onClick={() => handleVote(currentWar.contestant2.id)}
                  disabled={hasVoted}
                >
                  {hasVoted && votedFor === currentWar.contestant2.id ? '✅ Voted!' : '👑 Vote'}
                </button>

                <div className="vote-stats">
                  <div className="vote-bar">
                    <div
                      className="vote-fill"
                      style={{
                        width: `${getVotePercentage(currentWar.contestant2.votes, currentWar.totalVotes)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="vote-count">
                    {currentWar.contestant2.votes} votes (
                    {getVotePercentage(currentWar.contestant2.votes, currentWar.totalVotes)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Voted Message */}
          {hasVoted && (
            <div className="voted-message">
              <p>✨ Your vote has been counted! Check back to see who wins! ✨</p>
            </div>
          )}
        </div>

        {/* War History */}
        {warHistory.length > 0 && (
          <div className="glass-card war-history">
            <h2>🏆 Recent War Champions</h2>
            <div className="history-list">
              {warHistory.map((war) => (
                <Link to={`/profile/${war.winner.handle}`} key={war.id} className="history-item">
                  <div className="winner-info">
                    <div className="winner-rank">#{war.rank}</div>
                    <div className="winner-avatar">
                      {war.winner.avatarUrl ? (
                        <img src={war.winner.avatarUrl} alt={war.winner.name} />
                      ) : (
                        <span>{war.winner.name?.charAt(0)?.toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h4>{war.winner.name}</h4>
                      <p>{war.winner.handle}</p>
                    </div>
                  </div>
                  <div className="war-stats">
                    <span>{war.date}</span>
                    <span className="win-percentage">
                      {getVotePercentage(war.votes, war.totalVotes)}% votes
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VibeWars;
