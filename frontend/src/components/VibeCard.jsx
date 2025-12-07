import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './VibeCard.css';

const VibeCard = ({ vibe }) => {
  const [reactions, setReactions] = useState({
    heart: vibe?.reactions?.heart || 0,
    fire: vibe?.reactions?.fire || 0,
    star: vibe?.reactions?.star || 0,
    crown: vibe?.reactions?.crown || 0
  });

  const [userReactions, setUserReactions] = useState({
    heart: false,
    fire: false,
    star: false,
    crown: false
  });

  const handleReaction = (type) => {
    if (userReactions[type]) {
      // Remove reaction
      setReactions({ ...reactions, [type]: reactions[type] - 1 });
      setUserReactions({ ...userReactions, [type]: false });
    } else {
      // Add reaction
      setReactions({ ...reactions, [type]: reactions[type] + 1 });
      setUserReactions({ ...userReactions, [type]: true });
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const vibeDate = new Date(timestamp);
    const diffMs = now - vibeDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return vibeDate.toLocaleDateString();
  };

  // Default data if vibe prop is incomplete
  const sender = vibe?.sender || 'Anonymous';
  const isAnonymous = vibe?.isAnonymous || !vibe?.sender;
  const text = vibe?.text || vibe?.message || 'You are amazing! ✨';
  const tags = vibe?.tags || [];
  const emojis = vibe?.emojis || [];
  const timestamp = vibe?.timestamp || vibe?.createdAt || new Date();

  return (
    <div className="vibe-card">
      {/* Header */}
      <div className="vibe-header">
        <div className="vibe-sender">
          {isAnonymous ? (
            <span className="vibe-anonymous">
              🎭 Anonymous
            </span>
          ) : (
            <Link to={`/profile/${sender}`} className="vibe-sender-name">
              From: {sender}
            </Link>
          )}
        </div>
        <span className="vibe-time">{formatTimestamp(timestamp)}</span>
      </div>

      {/* Content */}
      <div className="vibe-content">
        <p className="vibe-text">{text}</p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="vibe-tags">
            {tags.map((tag, index) => (
              <span key={index} className="vibe-tag">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Emojis */}
        {emojis.length > 0 && (
          <div className="vibe-emojis">
            {emojis.map((emoji, index) => (
              <span key={index}>{emoji}</span>
            ))}
          </div>
        )}
      </div>

      {/* Reactions */}
      <div className="vibe-reactions">
        <button
          className={`reaction-btn ${userReactions.heart ? 'active' : ''}`}
          onClick={() => handleReaction('heart')}
          aria-label="React with heart"
        >
          <span>💖</span>
          {reactions.heart > 0 && (
            <span className="reaction-count">{reactions.heart}</span>
          )}
        </button>

        <button
          className={`reaction-btn ${userReactions.fire ? 'active' : ''}`}
          onClick={() => handleReaction('fire')}
          aria-label="React with fire"
        >
          <span>🔥</span>
          {reactions.fire > 0 && (
            <span className="reaction-count">{reactions.fire}</span>
          )}
        </button>

        <button
          className={`reaction-btn ${userReactions.star ? 'active' : ''}`}
          onClick={() => handleReaction('star')}
          aria-label="React with star"
        >
          <span>⭐</span>
          {reactions.star > 0 && (
            <span className="reaction-count">{reactions.star}</span>
          )}
        </button>

        <button
          className={`reaction-btn ${userReactions.crown ? 'active' : ''}`}
          onClick={() => handleReaction('crown')}
          aria-label="React with crown"
        >
          <span>👑</span>
          {reactions.crown > 0 && (
            <span className="reaction-count">{reactions.crown}</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default VibeCard;
