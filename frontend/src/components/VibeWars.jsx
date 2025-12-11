import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './VibeWars.css';

// Yardımcı fonksiyon: Kullanıcı handle'ının ilk harfini alır
const getInitial = (handle) => handle ? handle[0].toUpperCase() : 'X';

const VibeWars = () => {
  const { user } = useAuth();
  const [currentWar, setCurrentWar] = useState(null);
  const [warHistory, setWarHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [message, setMessage] = useState('');

  const [timeLeft, setTimeLeft] = useState('');
  const [warEnded, setWarEnded] = useState(false); // Savaşın bitip bitmediğini izlemek için yeni state

  const fetchCurrentWar = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wars/current');
      if (!res.data.war) {
        setCurrentWar(null);
      } else {
        setCurrentWar(res.data.war);
        // Savaş durumu kontrolü
        const endsAtTime = new Date(res.data.war.endsAt).getTime();
        if (Date.now() >= endsAtTime) {
          setWarEnded(true);
          setTimeLeft('War Ended 🏁');
        } else {
          setWarEnded(false);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarHistory = async () => {
    try {
      // API'den gelen verinin winner, contestant1, contestant2 yapısını kontrol edin
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

  // Geri sayım sayacı
  useEffect(() => {
    if (!currentWar?.endsAt || warEnded) {
      setTimeLeft(warEnded ? 'War Ended 🏁' : '');
      return;
    }
    const end = new Date(currentWar.endsAt).getTime();
    const tick = setInterval(() => {
      const now = Date.now();
      const diff = end - now;
      
      if (diff <= 0) {
        setTimeLeft('War Ended 🏁');
        setWarEnded(true); // Savaş bitti
        clearInterval(tick);
        // Savaş bittiğinde mevcut savaşı yeniden çekmek isteyebilirsiniz (sonuçları görmek için)
        // fetchCurrentWar(); 
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`);
    }, 1000);
    return () => clearInterval(tick);
  }, [currentWar, warEnded]);


  const handleVote = async (side) => {
    if (!user) {
      setMessage('🔒 Sign in to vote!');
      return;
    }
    if (warEnded) {
      setMessage('🛑 This war has ended. You cannot vote.');
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
      setMessage('❌ Vote failed or you have already voted!');
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
          <p>A new vibe war will start soon. Stay tuned!</p>
        </div>
      ) : (
        <>
          <div className="war-timer glass-card">
            <span className="timer-label">⏰ Time Remaining</span>
            <span className={`timer-value ${warEnded ? 'ended' : ''}`}>{timeLeft}</span>
          </div>

          <div className="war-arena">
            {/* Contestant 1 */}
            <div className="contestant contestant-1 glass-card">
                <div className="contestant-header">
                  <h3>@{currentWar.contestant1.user.handle}</h3>
                </div>
                <div className="vibe-content">
                  <p className="vibe-text">{currentWar.contestant1.vibe.text}</p>
                </div>
              <button
                className={`btn-vote ${voting || warEnded ? 'disabled' : ''}`}
                onClick={() => handleVote(1)}
                disabled={voting || warEnded}
              >
                💖 Vote for {currentWar.contestant1.user.handle}
              </button>
            </div>

            <div className="vs-divider"><span>VS</span></div>

            {/* Contestant 2 */}
            <div className="contestant contestant-2 glass-card">
                <div className="contestant-header">
                  <h3>@{currentWar.contestant2.user.handle}</h3>
                </div>
                <div className="vibe-content">
                  <p className="vibe-text">{currentWar.contestant2.vibe.text}</p>
                </div>
              <button
                className={`btn-vote ${voting || warEnded ? 'disabled' : ''}`}
                onClick={() => handleVote(2)}
                disabled={voting || warEnded}
              >
                💖 Vote for {currentWar.contestant2.user.handle}
              </button>
            </div>
          </div>
        </>
      )}

      {warHistory.length > 0 && (
        <div className="war-history glass-card">
          <h2>Past Wars (Top 10)</h2>
          <div className="history-list">
            {warHistory.map((war, index) => {
              const winner = war.winner === 'contestant1'
                ? war.contestant1
                : war.winner === 'contestant2'
                ? war.contestant2
                : null;
              const totalVotes = war.contestant1.votes + war.contestant2.votes;
              const winnerPercentage = winner && totalVotes > 0
                ? ((winner.votes / totalVotes) * 100).toFixed(1)
                : 'N/A';
              
              return (
                <div key={war._id} className="history-item">
                  <div className="winner-info">
                    <span className="winner-rank">#{index + 1}</span>
                    <div className="winner-avatar">
                      <span>{getInitial(winner ? winner.user.handle : 'X')}</span>
                    </div>
                    <div>
                      <h4>{winner ? `@${winner.user.handle}` : 'Draw'}</h4>
                      <p>{winner ? winner.vibe.text.substring(0, 30) + (winner.vibe.text.length > 30 ? '...' : '') : 'No winner / Tie'}</p>
                    </div>
                  </div>
                  <div className="war-stats">
                    <span>Total Votes: {totalVotes}</span>
                    {winner && <span className="win-percentage">{winnerPercentage}% Win</span>}
                    <span>Ended: {new Date(war.endsAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VibeWars;