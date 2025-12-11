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

  // 🔹 Backend data-nı frontend format-a çevir
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
          tags: warData.contestant1?.vibe?.tags || []
        },
        votes: c1Votes,
        votePercentage: Math.round((c1Votes / totalVotes) * 100)
      },
      contestant2: {
        id: 'contestant-2',
        name: warData.contestant2?.user?.name || 'Contestant 2',
        handle: warData.contestant2?.user?.handle || 'user2',
        avatarUrl: warData.contestant2?.user?.avatarUrl || '',
        vibe: {
          text: warData.contestant2?.vibe?.text || 'Great vibe!',
          tags: warData.contestant2?.vibe?.tags || []
        },
        votes: c2Votes,
        votePercentage: Math.round((c2Votes / totalVotes) * 100)
      },
      endTime: warData.endsAt || new Date(Date.now() + 3600000).toISOString(),
      totalVotes,
      userVote: warData.votes?.find(v => v.user === user?._id) || null,
      status: 'active'
    };
  };

  // 🔹 History data transform
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
          avatarUrl: war.winner?.user?.avatarUrl || ''
        },
        totalVotes: total,
        winPercentage: Math.round((winnerVotes / total) * 100),
        endedAt: war.endedAt
      };
    });

  // 🔹 İlk dəfə yüklənəndə fetch et
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        await fetchCurrentWar();
        await fetchWarHistory();
      } catch (err) {
        console.error(err);
      }
    };
    init();
    return () => { isMounted = false; };
  }, []);

  const fetchCurrentWar = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/wars/current');
      const transformed = transformWarData(res.data.war);
      setCurrentWar(transformed);
    } catch (err) {
      console.error('❌ Error fetching war:', err);
      setError('Could not load current war');
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
      console.error('❌ Error fetching history:', err);
    }
  };

  const handleVote = async (contestantId) => {
    if (!user) {
      alert('Please sign in to vote! 🔒');
      return;
    }

    try {
      setVoting(true);
      await api.post(`/wars/${currentWar.id}/vote`, {
        contestant: contestantId === 'contestant-1' ? 1 : 2,
        contestantId
      });
      await fetchCurrentWar();
      alert('Vote recorded! 💖');
    } catch (err) {
      console.error('❌ Error voting:', err);
      alert(err.response?.data?.message || 'Failed to vote. Please try again.');
    } finally {
      setVoting(false);
    }
  };

  // 🔹 Timer countdown (stabil versiya)
  useEffect(() => {
    if (!currentWar?.endTime) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(currentWar.endTime).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('War Ended! 🏁');
        clearInterval(timer);
        // optional: 5 saniyə sonra bir dəfə yenilə
        // setTimeout(fetchCurrentWar, 5000);
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentWar?.endTime]);

  // === UI hissəsi ===
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

  if (error) {
    return (
      <div className="vibe-wars-page">
        <div className="container">
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h2 style={{ color: 'hsl(var(--pink-500))', marginBottom: '1rem' }}>❌ {error}</h2>
            <button onClick={fetchCurrentWar} className="btn-vote" style={{ maxWidth: '300px', margin: '0 auto' }}>
              🔄 Try Again
            </button>
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
            <h1 className="page-title shimmer-text">⚔️ Vibe Wars ⚔️</h1>
            <p className="page-subtitle">The ultimate battle of positivity!</p>
          </div>

          <div className="no-war glass-card">
            <h2>🌟 No Active War Right Now</h2>
            <p>Check back soon for the next epic battle!</p>
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
                        {war.winner.avatarUrl
                          ? <img src={war.winner.avatarUrl} alt={war.winner.name} />
                          : <span>{war.winner.name.charAt(0).toUpperCase()}</span>}
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
  }

  const hasVoted = currentWar.userVote !== null;

  return (
    <div className="vibe-wars-page">
      <div className="container">
        <div className="vibe-wars-header">
          <h1 className="page-title shimmer-text">⚔️ Vibe Wars ⚔️</h1>
          <p className="page-subtitle">Vote for the best vibe and crown the champion!</p>
        </div>

        <div className="war-timer glass-card">
          <span className="timer-label">⏰ Time Remaining</span>
          <span className="timer-value">{timeLeft}</span>
        </div>

        <div className="war-arena glass-card">
          {[currentWar.contestant1, currentWar.contestant2].map((c, idx) => (
            <div key={c.id} className={`contestant contestant-${idx + 1}`}>
              <div className="contestant-header">
                <div className="contestant-avatar">
                  {c.avatarUrl ? <img src={c.avatarUrl} alt={c.name} /> : <span>{c.name.charAt(0).toUpperCase()}</span>}
                </div>
                <h3>{c.name}</h3>
                <p>@{c.handle}</p>
              </div>

              <div className="vibe-content">
                <p className="vibe-text">{c.vibe.text}</p>
                {c.vibe.tags?.length > 0 && (
                  <div className="vibe-tags">
                    {c.vibe.tags.map((tag, i) => <span key={i} className="vibe-tag">#{tag}</span>)}
                  </div>
                )}
              </div>

              <div className="vote-section">
                {!hasVoted ? (
                  <button
                    className={`btn-vote ${(!user || voting) ? 'disabled' : ''}`}
                    onClick={() => handleVote(c.id)}
                    disabled={!user || voting}
                  >
                    {voting ? '⏳ Voting...' : `💖 Vote for ${c.name}`}
                  </button>
                ) : (
                  <div className="vote-stats">
                    <div className="vote-bar">
                      <div className="vote-fill" style={{ width: `${c.votePercentage}%` }}></div>
                    </div>
                    <p className="vote-count">{c.votes} votes ({c.votePercentage}%)</p>
                  </div>
                )}
              </div>
              {idx === 0 && <div className="vs-divider"><span>VS</span></div>}
            </div>
          ))}
        </div>

        {hasVoted && (
          <div className="voted-message glass-card">
            <p>✅ You voted! Results will be revealed when the war ends.</p>
          </div>
        )}

        {!user && (
          <div className="voted-message glass-card" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(244,114,182,0.15))' }}>
            <p style={{ color: 'hsl(var(--pink-600))' }}>🔒 Sign in to participate in Vibe Wars!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VibeWars;
