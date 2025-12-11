import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './VibeWars.css';

const VibeWars = () => {
  const { user } = useAuth();
  const [currentWar, setCurrentWar] = useState(null);
  const [warHistory, setWarHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  // ✅ War datanı düz formatla
  const transformWarData = (warData) => {
    if (!warData) return null;

    const c1Votes = warData.contestant1?.vibe?.votes || 0;
    const c2Votes = warData.contestant2?.vibe?.votes || 0;
    const totalVotes = c1Votes + c2Votes || 1;

    return {
      id: warData._id || 'current-war',
      contestant1: {
        id: 'contestant-1',
        name: warData.contestant1?.user?.name || 'Contestant 1',
        handle: warData.contestant1?.user?.handle || 'user1',
        avatarUrl: warData.contestant1?.user?.avatarUrl || '',
        vibe: {
          text: warData.contestant1?.vibe?.text || 'Amazing vibe!',
          tags: warData.contestant1?.vibe?.tags || [],
        },
        votes: c1Votes,
        votePercentage: Math.round((c1Votes / totalVotes) * 100),
      },
      contestant2: {
        id: 'contestant-2',
        name: warData.contestant2?.user?.name || 'Contestant 2',
        handle: warData.contestant2?.user?.handle || 'user2',
        avatarUrl: warData.contestant2?.user?.avatarUrl || '',
        vibe: {
          text: warData.contestant2?.vibe?.text || 'Great vibe!',
          tags: warData.contestant2?.vibe?.tags || [],
        },
        votes: c2Votes,
        votePercentage: Math.round((c2Votes / totalVotes) * 100),
      },
      endTime: warData.endsAt ? new Date(warData.endsAt).toISOString() : null,
      totalVotes,
      userVote: warData.votes?.find(v => v.user === user?._id) || null,
      status: warData.status || 'active',
    };
  };

  const transformHistoryData = (wars) =>
    wars.map((war, index) => {
      const winnerVotes = war.winner?.vibe?.votes || 0;
      const loserVotes = war.loser?.vibe?.votes || 0;
      const total = winnerVotes + loserVotes || 1;
      return {
        id: war._id || `war-${index}`,
        winner: {
          name: war.winner?.user?.name || 'Winner',
          handle: war.winner?.user?.handle || 'winner',
          avatarUrl: war.winner?.user?.avatarUrl || '',
        },
        totalVotes: total,
        winPercentage: Math.round((winnerVotes / total) * 100),
        endedAt: war.endedAt,
      };
    });

  useEffect(() => {
    const init = async () => {
      try {
        await fetchCurrentWar();
        await fetchWarHistory();
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  const fetchCurrentWar = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wars/current');
      const transformed = transformWarData(res.data.war);
      setCurrentWar(transformed);
    } catch (err) {
      setError('Could not load current war');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarHistory = async () => {
    try {
      const res = await api.get('/wars/history?limit=10');
      const transformed = transformHistoryData(res.data.wars || []);
      setWarHistory(transformed);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVote = async (contestantId) => {
    if (!user) return alert('Please sign in to vote! 🔒');
    try {
      setVoting(true);
      const res = await api.post(`/wars/${currentWar.id}/vote`, {
        contestant: contestantId === 'contestant-1' ? 1 : 2,
      });
      if (res?.data?.message?.includes('ended')) {
        alert('⚔️ This war already ended! Waiting for next one.');
        setCurrentWar(null);
        return;
      }
      alert('Vote recorded! 💖');
      await fetchCurrentWar();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to vote.');
    } finally {
      setVoting(false);
    }
  };

  useEffect(() => {
    if (!currentWar?.endTime) return;
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(currentWar.endTime).getTime();
      const distance = end - now;

      if (distance <= 0) {
        setTimeLeft('War Ended 🏁');
        clearInterval(timer);
        return;
      }
      const h = Math.floor(distance / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentWar?.endTime]);

  if (loading)
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

  if (error)
    return (
      <div className="vibe-wars-page">
        <div className="container">
          <div className="glass-card">
            <h2>❌ {error}</h2>
            <button onClick={fetchCurrentWar} className="btn-vote">
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    );

  if (!currentWar)
    return (
      <div className="vibe-wars-page">
        <div className="container">
          <div className="vibe-wars-header">
            <h1 className="page-title shimmer-text">⚔️ Vibe Wars ⚔️</h1>
            <p className="page-subtitle">No active war right now, check back soon!</p>
          </div>
          {warHistory.length > 0 && (
            <div className="war-history glass-card">
              <h2>📜 War History</h2>
              <div className="history-list">
                {warHistory.map((war, i) => (
                  <div key={war.id} className="history-item">
                    <div className="winner-info">
                      <span className="winner-rank">{i + 1}</span>
                      <div className="winner-avatar">
                        {war.winner.avatarUrl ? (
                          <img src={war.winner.avatarUrl} alt={war.winner.name} />
                        ) : (
                          <span>{war.winner.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <h4>{war.winner.name}</h4>
                        <p>@{war.winner.handle}</p>
                      </div>
                    </div>
                    <div className="war-stats">
                      <span>🗳️ {war.totalVotes} votes</span>
                      <span className="win-percentage">{war.winPercentage}% win</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );

  const hasVoted = currentWar.userVote !== null;

  return (
    <div className="vibe-wars-page">
      <div className="container">
        <div className="vibe-wars-header">
          <h1 className="page-title shimmer-text">⚔️ Vibe Wars ⚔️</h1>
          <p className="page-subtitle">Vote for the best vibe and crown the champion!</p>
        </div>

        {currentWar.endTime && (
          <div className="war-timer glass-card">
            <span className="timer-label">⏰ Time Remaining</span>
            <span className="timer-value">{timeLeft}</span>
          </div>
        )}

        <div className="war-arena">
          <div className="contestant contestant-1 glass-card">
            <div className="contestant-header">
              <div className="contestant-avatar">
                {currentWar.contestant1.avatarUrl ? (
                  <img src={currentWar.contestant1.avatarUrl} alt={currentWar.contestant1.name} />
                ) : (
                  <span>{currentWar.contestant1.name.charAt(0)}</span>
                )}
              </div>
              <h3>{currentWar.contestant1.name}</h3>
              <p>@{currentWar.contestant1.handle}</p>
            </div>
            <p className="vibe-text">{currentWar.contestant1.vibe.text}</p>
            {currentWar.contestant1.vibe.tags?.length > 0 && (
              <div className="vibe-tags">
                {currentWar.contestant1.vibe.tags.map((tag, i) => (
                  <span key={i} className="vibe-tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <div className="vote-section">
              {!hasVoted ? (
                <button
                  className={`btn-vote ${voting ? 'disabled' : ''}`}
                  onClick={() => handleVote('contestant-1')}
                  disabled={voting}
                >
                  {voting ? '⏳ Voting...' : `💖 Vote for ${currentWar.contestant1.name}`}
                </button>
              ) : (
                <div className="vote-stats">
                  <div className="vote-bar">
                    <div
                      className="vote-fill"
                      style={{ width: `${currentWar.contestant1.votePercentage}%` }}
                    ></div>
                  </div>
                  <p className="vote-count">
                    {currentWar.contestant1.votes} votes ({currentWar.contestant1.votePercentage}%)
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="vs-divider">
            <span>VS</span>
          </div>

          <div className="contestant contestant-2 glass-card">
            <div className="contestant-header">
              <div className="contestant-avatar">
                {currentWar.contestant2.avatarUrl ? (
                  <img src={currentWar.contestant2.avatarUrl} alt={currentWar.contestant2.name} />
                ) : (
                  <span>{currentWar.contestant2.name.charAt(0)}</span>
                )}
              </div>
              <h3>{currentWar.contestant2.name}</h3>
              <p>@{currentWar.contestant2.handle}</p>
            </div>
            <p className="vibe-text">{currentWar.contestant2.vibe.text}</p>
            {currentWar.contestant2.vibe.tags?.length > 0 && (
              <div className="vibe-tags">
                {currentWar.contestant2.vibe.tags.map((tag, i) => (
                  <span key={i} className="vibe-tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <div className="vote-section">
              {!hasVoted ? (
                <button
                  className={`btn-vote ${voting ? 'disabled' : ''}`}
                  onClick={() => handleVote('contestant-2')}
                  disabled={voting}
                >
                  {voting ? '⏳ Voting...' : `💖 Vote for ${currentWar.contestant2.name}`}
                </button>
              ) : (
                <div className="vote-stats">
                  <div className="vote-bar">
                    <div
                      className="vote-fill"
                      style={{ width: `${currentWar.contestant2.votePercentage}%` }}
                    ></div>
                  </div>
                  <p className="vote-count">
                    {currentWar.contestant2.votes} votes ({currentWar.contestant2.votePercentage}%)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {hasVoted && (
          <div className="voted-message glass-card">
            <p>✅ You voted! Results will appear when war ends.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VibeWars;
