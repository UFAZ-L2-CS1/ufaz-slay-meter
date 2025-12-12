import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./VibeWars.css";

const getInitial = (handle) => handle ? handle[0].toUpperCase() : "X";

const VibeWars = () => {
  const { user } = useAuth();
  const [currentWar, setCurrentWar] = useState(null);
  const [warHistory, setWarHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const [warEnded, setWarEnded] = useState(false);

  // === Fetch current war ===
  const fetchCurrentWar = useCallback(async () => {
    try {
      const res = await api.get("/wars/current");
      if (!res.data.war) {
        setCurrentWar(null);
        setWarEnded(true);
      } else {
        setCurrentWar(res.data.war);
        const endsAt = new Date(res.data.war.endsAt).getTime();
        const now = Date.now();
        
        if (now >= endsAt || res.data.war.status === "ended") {
          setWarEnded(true);
          setTimeLeft("War Ended 🏁");
        } else {
          setWarEnded(false);
        }
      }
    } catch (err) {
      console.error("Error fetching current war:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // === Fetch war history ===
  const fetchWarHistory = useCallback(async () => {
    try {
      const res = await api.get("/wars/history?limit=10");
      setWarHistory(res.data.wars || []);
    } catch (err) {
      console.error("Error fetching war history:", err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCurrentWar();
    fetchWarHistory();
  }, [fetchCurrentWar, fetchWarHistory]);

  // Auto-refresh current war every 5 seconds when active
  useEffect(() => {
    if (!warEnded && currentWar) {
      const interval = setInterval(() => {
        fetchCurrentWar();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [warEnded, currentWar, fetchCurrentWar]);

  // Refresh history when war ends
  useEffect(() => {
    if (warEnded) {
      fetchWarHistory();
    }
  }, [warEnded, fetchWarHistory]);

  // === Countdown timer ===
  useEffect(() => {
    if (!currentWar?.endsAt || warEnded) {
      setTimeLeft(warEnded ? "War Ended 🏁" : "");
      return;
    }
    
    const end = new Date(currentWar.endsAt).getTime();
    
    const tick = setInterval(() => {
      const now = Date.now();
      const diff = end - now;
      
      if (diff <= 0) {
        setTimeLeft("War Ended 🏁");
        setWarEnded(true);
        clearInterval(tick);
        // Trigger refresh when war ends
        fetchCurrentWar();
        fetchWarHistory();
        return;
      }
      
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(
        `${h.toString().padStart(2, "0")}h ${m
          .toString()
          .padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`
      );
    }, 1000);
    
    return () => clearInterval(tick);
  }, [currentWar, warEnded, fetchCurrentWar, fetchWarHistory]);

  // === Voting ===
  const handleVote = async (side) => {
    if (!user) {
      setMessage("🔒 Sign in to vote!");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    
    if (warEnded) {
      setMessage("🛑 This war has ended. You cannot vote.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    
    try {
      setVoting(true);
      await api.post(`/wars/${currentWar._id}/vote`, { contestant: side });
      
      // Immediately fetch updated war data
      await fetchCurrentWar();
      
      setMessage("💖 Your vote is recorded!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Vote failed";
      setMessage(`❌ ${errorMsg}`);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setVoting(false);
    }
  };

  // Calculate total votes
  const getTotalVotes = () => {
    if (!currentWar) return 0;
    return (currentWar.contestant1?.vibe?.votes || 0) + 
           (currentWar.contestant2?.vibe?.votes || 0);
  };

  // Check if user has voted
  const hasUserVoted = () => {
    if (!user || !currentWar || !currentWar.votes) return false;
    // Check if user's ID is in the votes array
    const voted = currentWar.votes.some(v => {
      return String(v.userId) === String(user._id) || 
             String(v.userId) === String(user.id);
    });
    return voted;
  };

  // Get which contestant user voted for
  const getUserVote = () => {
    if (!user || !currentWar || !currentWar.votes) return null;
    const vote = currentWar.votes.find(v => 
      String(v.userId) === String(user._id) || 
      String(v.userId) === String(user.id)
    );
    return vote ? vote.contestantNumber : null;
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="slay-loader">
          <span>💖</span>
          <p>Loading Vibe Wars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vibe-wars-page container">
      {message && (
        <div
          className="glass-card message-card"
          style={{ padding: "1rem", textAlign: "center", marginBottom: "1rem" }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>{message}</p>
        </div>
      )}

      {!currentWar ? (
        <div className="glass-card no-war">
          <h2>No Active War</h2>
          <p>A new vibe war will start soon. Stay tuned!</p>
        </div>
      ) : (
        <>
          <div className={`war-timer glass-card ${warEnded ? 'ended' : ''}`}>
            <span className={`timer-label ${warEnded ? 'ended' : ''}`}>
              ⏰ Time Remaining
            </span>
            <span className={`timer-value ${warEnded ? "ended" : ""}`}>
              {timeLeft}
            </span>
            {!warEnded && (
              <span style={{ 
                display: 'block', 
                marginTop: '0.5rem', 
                fontSize: '0.9rem', 
                color: 'var(--muted-foreground)' 
              }}>
                Total Votes: {getTotalVotes()}
              </span>
            )}
          </div>

          <div className="war-arena">
            {/* Contestant 1 */}
            <div className="contestant contestant-1 glass-card">
              <div className="contestant-header">
                <h3>@{currentWar.contestant1.user.handle}</h3>
              </div>
              <div className="vibe-content">
                <p className="vibe-text">
                  {currentWar.contestant1.vibe.text}
                </p>
              </div>
              <div className="vote-stats">
                <span className="vote-count">
                  💖 {currentWar.contestant1.vibe.votes || 0} votes
                </span>
                {getTotalVotes() > 0 && (
                  <span className="vote-percentage">
                    {((currentWar.contestant1.vibe.votes || 0) / getTotalVotes() * 100).toFixed(1)}%
                  </span>
                )}
              </div>
              <button
                className={`btn-vote ${
                  voting || warEnded || hasUserVoted() ? "disabled" : ""
                }`}
                onClick={() => handleVote(1)}
                disabled={voting || warEnded || hasUserVoted()}
              >
                {warEnded 
                  ? "War Ended 🏁"
                  : hasUserVoted() && getUserVote() === 1
                  ? "✓ You Voted Here" 
                  : hasUserVoted()
                  ? "Already Voted"
                  : `💖 Vote for ${currentWar.contestant1.user.handle}`}
              </button>
            </div>

            <div className="vs-divider">
              <span>VS</span>
            </div>

            {/* Contestant 2 */}
            <div className="contestant contestant-2 glass-card">
              <div className="contestant-header">
                <h3>@{currentWar.contestant2.user.handle}</h3>
              </div>
              <div className="vibe-content">
                <p className="vibe-text">
                  {currentWar.contestant2.vibe.text}
                </p>
              </div>
              <div className="vote-stats">
                <span className="vote-count">
                  💖 {currentWar.contestant2.vibe.votes || 0} votes
                </span>
                {getTotalVotes() > 0 && (
                  <span className="vote-percentage">
                    {((currentWar.contestant2.vibe.votes || 0) / getTotalVotes() * 100).toFixed(1)}%
                  </span>
                )}
              </div>
              <button
                className={`btn-vote ${
                  voting || warEnded || hasUserVoted() ? "disabled" : ""
                }`}
                onClick={() => handleVote(2)}
                disabled={voting || warEnded || hasUserVoted()}
              >
                {warEnded 
                  ? "War Ended 🏁"
                  : hasUserVoted() && getUserVote() === 2
                  ? "✓ You Voted Here" 
                  : hasUserVoted()
                  ? "Already Voted"
                  : `💖 Vote for ${currentWar.contestant2.user.handle}`}
              </button>
            </div>
          </div>
        </>
      )}

      {/* War History */}
      {warHistory.length > 0 && (
        <div className="war-history glass-card">
          <h2>Past Wars (Top 10)</h2>
          <div className="history-list">
            {warHistory.map((war, index) => {
              const endDate = war.endedAt ? new Date(war.endedAt) : null;
              const isValidDate = endDate && !isNaN(endDate.getTime());
              const formattedDate = isValidDate 
                ? endDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : 'Date Unknown';

              const totalVotes = war.totalVotes || 0;
              const winner = war.winner;

              return (
                <div key={war._id} className="history-item">
                  <div className="winner-info">
                    <span className="winner-rank">#{index + 1}</span>
                    <div className="winner-avatar">
                      <span>
                        {winner 
                          ? getInitial(winner.user?.handle) 
                          : "✖"}
                      </span>
                    </div>
                    <div>
                      <h4>
                        {winner 
                          ? `@${winner.user?.handle || "unknown"}` 
                          : "Draw"}
                      </h4>
                      <p>
                        {winner 
                          ? (winner.vibe?.text || "No vibe text")
                          : "No winner / Tie"}
                      </p>
                    </div>
                  </div>
                  <div className="war-stats">
                    <span>Total Votes: {totalVotes}</span>
                    {winner && winner.vibe?.votes !== undefined && (
                      <span className="win-percentage">
                        {totalVotes > 0 
                          ? ((winner.vibe.votes / totalVotes) * 100).toFixed(1)
                          : "0"}% Win
                      </span>
                    )}
                    <span>Ended: {formattedDate}</span>
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

/* Add these CSS rules to your VibeWars.css file:

.vote-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  margin-bottom: 1rem;
  border-top: 1px solid rgba(236, 72, 153, 0.2);
  border-bottom: 1px solid rgba(236, 72, 153, 0.2);
}

.vote-count {
  font-size: 1rem;
  font-weight: 700;
  color: hsl(var(--pink-500));
}

.vote-percentage {
  font-size: 0.9rem;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  padding: 0.25rem 0.5rem;
  background: rgba(236, 72, 153, 0.1);
  border-radius: 8px;
}

.message-card {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
*/