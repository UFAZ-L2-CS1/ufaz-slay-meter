import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './VibeWars.css';

const VibeWars = () => {
  const { user } = useAuth();
  const [currentWar, setCurrentWar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [warHistory, setWarHistory] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    fetchCurrentWar();
    fetchWarHistory();
  }, []);

  useEffect(() => {
    // Countdown timer
    if (currentWar && currentWar.endsAt) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const endTime = new Date(currentWar.endsAt).getTime();
        const distance = endTime - now;

        if (distance < 0) {
          clearInterval(timer);
          setTimeLeft('War Ended');
          fetchCurrentWar(); // Fetch new war
        } else {
          const hours = Math.floor(distance / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentWar]);

  const fetchCurrentWar = async () => {
    setLoading(true);
    try {
      const response = await api.get('/vibe-wars/current');
      setCurrentWar(response.data.war);
      
      // Check if user has already voted
      if (user && response.data.war) {
        const hasVoted = response.data.war.votes?.some(
          vote => vote.userId === user._id
        );
        setVoted(hasVoted);
      }
    } catch (error) {
      console.error('Error fetching current war:', error);
      // Create a mock war for demo
      setCurrentWar({
        _id: 'demo',
        contestant1: {
          user: { name: 'User 1', handle: 'user1', _id: '1' },
          vibe: {
            text: 'You have an amazing energy that lights up every room!',
            tags: ['inspiring', 'energetic'],
            votes: 0
          }
        },
        contestant2: {
          user: { name: 'User 2', handle: 'user2', _id: '2' },
          vibe: {
            text: 'Your creativity and talent are absolutely incredible!',
            tags: ['creative', 'talented'],
            votes: 0
          }
        },
        endsAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        votes: []
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWarHistory = async () => {
    try {
      const response = await api.get('/vibe-wars/history?limit=5');
      setWarHistory(response.data.wars || []);
    } catch (error) {
      console.error('Error fetching war history:', error);
    }
  };

  const handleVote = async (contestantNumber) => {
    if (!user) {
      alert('Please sign in to vote!');
      return;
    }

    if (voted) {
      alert('You have already voted in this war!');
      return;
    }

    try {
      await api.post(`/vibe-wars/${currentWar._id}/vote`, {
        contestant: contestantNumber
      });

      setVoted(true);
      
      // Update local state to reflect the vote
      setCurrentWar(prev => ({
        ...prev,
        [`contestant${contestantNumber}`]: {
          ...prev[`contestant${contestantNumber}`],
          vibe: {
            ...prev[`contestant${contestantNumber}`].vibe,
            votes: prev[`contestant${contestantNumber}`].vibe.votes + 1
          }
        }
      }));
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to submit vote. Please try again.');
    }
  };

  const calculatePercentage = (contestant) => {
    if (!currentWar) return 50;
    
    const votes1 = currentWar.contestant1?.vibe?.votes || 0;
    const votes2 = currentWar.contestant2?.vibe?.votes || 0;
    const total = votes1 + votes2;
    
    if (total === 0) return 50;
    
    if (contestant === 1) {
      return Math.round((votes1 / total) * 100);
    } else {
      return Math.round((votes2 / total) * 100);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
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

  return (
    <div className="vibe-wars-page page-container">
      <div className="container">
        <div className="vibe-wars-header">
          <h1 className="page-title shimmer-text">Vibe Wars ⚔️</h1>
          <p className="page-subtitle">
            Vote for the strongest vibe and help crown the slay champion!
          </p>
        </div>

        {currentWar ? (
          <div className="current-war glass-card">
            <div className="war-timer">
              <span className="timer-label">Time Remaining:</span>
              <span className="timer-value">{timeLeft || 'Loading...'}</span>
            </div>

            <div className="war-arena">
              <div className="contestant contestant-1">
                <div className="contestant-header">
                  <div className="contestant-avatar">
                    {currentWar.contestant1?.user?.avatarUrl ? (
                      <img src={currentWar.contestant1.user.avatarUrl} alt="" />
                    ) : (
                      <span>{currentWar.contestant1?.user?.name?.charAt(0) || '?'}</span>
                    )}
                  </div>
                  <h3>{currentWar.contestant1?.user?.name || 'Anonymous'}</h3>
                  <p>@{currentWar.contestant1?.user?.handle || 'anonymous'}</p>
                </div>

                <div className="vibe-content">
                  <p className="vibe-text">{currentWar.contestant1?.vibe?.text}</p>
                  <div className="vibe-tags">
                    {currentWar.contestant1?.vibe?.tags?.map((tag, i) => (
                      <span key={i} className="vibe-tag">#{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="vote-section">
                  <button
                    className={`btn btn-vote ${voted ? 'disabled' : ''}`}
                    onClick={() => handleVote(1)}
                    disabled={voted}
                  >
                    {voted ? 'Voted' : 'Vote for this Vibe 💖'}
                  </button>
                  <div className="vote-stats">
                    <div className="vote-bar">
                      <div 
                        className="vote-fill"
                        style={{ width: `${calculatePercentage(1)}%` }}
                      ></div>
                    </div>
                    <span className="vote-count">
                      {currentWar.contestant1?.vibe?.votes || 0} votes ({calculatePercentage(1)}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="vs-divider">
                <span>VS</span>
              </div>

              <div className="contestant contestant-2">
                <div className="contestant-header">
                  <div className="contestant-avatar">
                    {currentWar.contestant2?.user?.avatarUrl ? (
                      <img src={currentWar.contestant2.user.avatarUrl} alt="" />
                    ) : (
                      <span>{currentWar.contestant2?.user?.name?.charAt(0) || '?'}</span>
                    )}
                  </div>
                  <h3>{currentWar.contestant2?.user?.name || 'Anonymous'}</h3>
                  <p>@{currentWar.contestant2?.user?.handle || 'anonymous'}</p>
                </div>

                <div className="vibe-content">
                  <p className="vibe-text">{currentWar.contestant2?.vibe?.text}</p>
                  <div className="vibe-tags">
                    {currentWar.contestant2?.vibe?.tags?.map((tag, i) => (
                      <span key={i} className="vibe-tag">#{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="vote-section">
                  <button
                    className={`btn btn-vote ${voted ? 'disabled' : ''}`}
                    onClick={() => handleVote(2)}
                    disabled={voted}
                  >
                    {voted ? 'Voted' : 'Vote for this Vibe 💖'}
                  </button>
                  <div className="vote-stats">
                    <div className="vote-bar">
                      <div 
                        className="vote-fill"
                        style={{ width: `${calculatePercentage(2)}%` }}
                      ></div>
                    </div>
                    <span className="vote-count">
                      {currentWar.contestant2?.vibe?.votes || 0} votes ({calculatePercentage(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {voted && (
              <div className="voted-message">
                <p>Thanks for voting! Check back when the war ends to see the winner.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="no-war glass-card">
            <h2>No Active War</h2>
            <p>A new vibe war will start soon! Check back later.</p>
          </div>
        )}

        {warHistory.length > 0 && (
          <div className="war-history glass-card">
            <h2>Recent War Winners 🏆</h2>
            <div className="history-list">
              {warHistory.map((war, index) => (
                <div key={war._id || index} className="history-item">
                  <div className="winner-info">
                    <span className="winner-rank">#{index + 1}</span>
                    <div className="winner-avatar">
                      {war.winner?.avatarUrl ? (
                        <img src={war.winner.avatarUrl} alt="" />
                      ) : (
                        <span>{war.winner?.name?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <div>
                      <h4>{war.winner?.name || 'Unknown'}</h4>
                      <p>@{war.winner?.handle || 'unknown'}</p>
                    </div>
                  </div>
                  <div className="war-stats">
                    <span>{war.totalVotes || 0} total votes</span>
                    <span className="win-percentage">{war.winPercentage || 50}% victory</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VibeWars;
