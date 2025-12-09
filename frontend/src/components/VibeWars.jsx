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

  // Fetch current war from database
  useEffect(() => {
    fetchCurrentWar();
    fetchWarHistory();
  }, []);

  const fetchCurrentWar = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/vibe-wars/current'); // ✅ FIXED
      setCurrentWar(response.data.war);
    } catch (err) {
      console.error('Error fetching war:', err);
      setError('Could not load current war');
    } finally {
      setLoading(false);
    }
  };

  const fetchWarHistory = async () => {
    try {
      const response = await api.get('/vibe-wars/history'); // ✅ FIXED (removed ?limit=10)
      setWarHistory(response.data.wars);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const handleVote = async (contestantId) => {
    if (!user) {
      alert('Please sign in to vote!');
      return;
    }

    try {
      setVoting(true);
      await api.post(`/vibe-wars/${currentWar._id}/vote`, { // ✅ FIXED: use _id
        contestant: contestantId
      });
      // Refresh war data
      await fetchCurrentWar();
    } catch (err) {
      console.error('Error voting:', err);
      alert(err.response?.data?.message || 'Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (!currentWar?.endsAt) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(currentWar.endsAt).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('War Ended');
        clearInterval(timer);
        fetchCurrentWar(); // Refresh to get new war
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentWar]);

  if (loading) {
    return (
      <div className="vibe-wars-loading">
        <div className="loader">⚔️</div>
        <p>Loading Vibe Wars...</p>
      </div>
    );
  }

  if (error || !currentWar) {
    return (
      <div className="vibe-wars-container">
        <div className="wars-hero">
          <h1>⚔️ Vibe Wars ⚔️</h1>
          <p className="wars-subtitle">The ultimate battle of positivity!</p>
        </div>
        <div className="no-war-message">
          <h2>No active war right now</h2>
          <p>Check back soon for the next epic battle!</p>
        </div>
      </div>
    );
  }

  const { contestant1, contestant2 } = currentWar;
  const totalVotes = (contestant1?.votes || 0) + (contestant2?.votes || 0);
  const c1Percentage = totalVotes > 0 ? Math.round((contestant1.votes / totalVotes) * 100) : 50;
  const c2Percentage = totalVotes > 0 ? Math.round((contestant2.votes / totalVotes) * 100) : 50;

  return (
    <div className="vibe-wars-container">
      <div className="wars-hero">
        <h1>⚔️ Vibe Wars ⚔️</h1>
        <p className="wars-subtitle">Vote for the best vibe and crown the champion!</p>
        <div className="war-timer">
          <span className="timer-icon">⏱️</span>
          <span className="timer-text">{timeLeft}</span>
        </div>
      </div>

      <div className="war-battlefield">
        {/* Contestant 1 */}
        <div className="war-contestant contestant-left">
          <div className="contestant-header">
            <img
              src={contestant1.user?.avatarUrl || 'https://via.placeholder.com/100'}
              alt={contestant1.user?.name}
              className="contestant-avatar"
            />
            <h3>@{contestant1.user?.handle || 'user1'}</h3>
          </div>
          <div className="vibe-display">
            <p className="vibe-text">{contestant1.vibe?.text}</p>
            {contestant1.vibe?.tags?.length > 0 && (
              <div className="vibe-tags">
                {contestant1.vibe.tags.map((tag, idx) => (
                  <span key={idx} className="tag">#{tag}</span>
                ))}
              </div>
            )}
          </div>
          <div className="vote-section">
            <div className="vote-bar">
              <div
                className="vote-fill vote-fill-left"
                style={{ width: `${c1Percentage}%` }}
              ></div>
            </div>
            <p className="vote-count">{contestant1.votes} votes ({c1Percentage}%)</p>
            <button
              className="vote-btn"
              onClick={() => handleVote(1)}
              disabled={!user || voting}
            >
              {voting ? 'Voting...' : 'Vote 💖'}
            </button>
          </div>
        </div>

        <div className="war-vs">VS</div>

        {/* Contestant 2 */}
        <div className="war-contestant contestant-right">
          <div className="contestant-header">
            <img
              src={contestant2.user?.avatarUrl || 'https://via.placeholder.com/100'}
              alt={contestant2.user?.name}
              className="contestant-avatar"
            />
            <h3>@{contestant2.user?.handle || 'user2'}</h3>
          </div>
          <div className="vibe-display">
            <p className="vibe-text">{contestant2.vibe?.text}</p>
            {contestant2.vibe?.tags?.length > 0 && (
              <div className="vibe-tags">
                {contestant2.vibe.tags.map((tag, idx) => (
                  <span key={idx} className="tag">#{tag}</span>
                ))}
              </div>
            )}
          </div>
          <div className="vote-section">
            <div className="vote-bar">
              <div
                className="vote-fill vote-fill-right"
                style={{ width: `${c2Percentage}%` }}
              ></div>
            </div>
            <p className="vote-count">{contestant2.votes} votes ({c2Percentage}%)</p>
            <button
              className="vote-btn"
              onClick={() => handleVote(2)}
              disabled={!user || voting}
            >
              {voting ? 'Voting...' : 'Vote 💖'}
            </button>
          </div>
        </div>
      </div>

      {!user && (
        <div className="login-prompt">
          <p>🔒 Sign in to participate in Vibe Wars!</p>
        </div>
      )}

      {warHistory.length > 0 && (
        <div className="war-history">
          <h2>Previous Wars</h2>
          <div className="history-list">
            {warHistory.map((war, idx) => (
              <div key={idx} className="history-item">
                <span className="winner-badge">👑</span>
                <p>Winner: @{war.winner?.handle}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VibeWars;
