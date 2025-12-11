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
  const [message, setMessage] = useState('');

  const [timeLeft, setTimeLeft] = useState('');

  const fetchCurrentWar = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wars/current');
      if (!res.data.war) {
        setCurrentWar(null);
      } else {
        setCurrentWar(res.data.war);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarHistory = async () => {
    try {
      const res = await api.get('/wars/history?limit=10');
      setWarHistory(res.data.wars || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCurrentWar();
    fetchWarHistory();
  }, []);

  useEffect(() => {
    if (!currentWar?.endsAt) {
      setTimeLeft('');
      return;
    }
    const end = new Date(currentWar.endsAt).getTime();
    const tick = setInterval(() => {
      const now = Date.now();
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft('War Ended 🏁');
        clearInterval(tick);
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(tick);
  }, [currentWar]);

  const handleVote = async (side) => {
    if (!user) {
      setMessage('🔒 Sign in to vote!');
      return;
    }
    try {
      setVoting(true);
      await api.post(`/wars/${currentWar._id}/vote`, {
        contestant: side,
      });
      fetchCurrentWar();
      setMessage('💖 Your vote is recorded!');
    } catch (err) {
      setMessage('❌ Vote failed!');
    } finally {
      setVoting(false);
    }
  };

  if (loading) return <div className="loading-state"><p>Loading...</p></div>;

  return (
    <div className="vibe-wars-page container">

      {message && (
        <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <p>{message}</p>
        </div>
      )}

      {!currentWar ? (
        <div className="glass-card no-war">
          <h2>No Active War</h2>
        </div>
      ) : (
        <>
          <div className="war-timer glass-card">
            <span className="timer-label">⏰ Time Remaining</span>
            <span className="timer-value">{timeLeft}</span>
          </div>

          <div className="war-arena">
            <div className="contestant contestant-1 glass-card">
              <h3>@{currentWar.contestant1.user.handle}</h3>
              <p>{currentWar.contestant1.vibe.text}</p>
              <button
                className="btn-vote"
                onClick={() => handleVote(1)}
                disabled={voting}
              >
                💖 Vote for {currentWar.contestant1.user.handle}
              </button>
            </div>

            <div className="vs-divider"><span>VS</span></div>

            <div className="contestant contestant-2 glass-card">
              <h3>@{currentWar.contestant2.user.handle}</h3>
              <p>{currentWar.contestant2.vibe.text}</p>
              <button
                className="btn-vote"
                onClick={() => handleVote(2)}
                disabled={voting}
              >
                💖 Vote for {currentWar.contestant2.user.handle}
              </button>
            </div>
          </div>
        </>
      )}

      {warHistory.length > 0 && (
        <div className="war-history glass-card">
          <h2>Past Wars</h2>
          {warHistory.map((war) => (
            <div key={war._id}>{war._id}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VibeWars;
