import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import './VibeCard.css';

const VibeCard = ({ vibe, onReaction, currentUser }) => {
  const timeAgo = formatDistanceToNow(new Date(vibe.createdAt), { addSuffix: true });
  
  const reactionEmojis = {
    love: '❤️',
    fire: '🔥',
    star: '⭐',
    sparkle: '✨',
    crown: '👑'
  };

  const hasReacted = (type) => {
    return vibe.reactions?.some(r => 
      r.userId === currentUser?._id && r.type === type
    );
  };

  const getReactionCount = (type) => {
    return vibe.reactions?.filter(r => r.type === type).length || 0;
  };

  return (
    <div className="vibe-card glass-card">
      <div className="vibe-header">
        <div className="vibe-sender">
          {vibe.isAnonymous ? (
            <span className="vibe-anonymous">
              👤 Secret Admirer
            </span>
          ) : (
            <span className="vibe-sender-name">
              From: {vibe.senderId?.name || 'Unknown'}
            </span>
          )}
        </div>
        <span className="vibe-time">{timeAgo}</span>
      </div>

      <div className="vibe-content">
        <p className="vibe-text">{vibe.text}</p>
        
        {vibe.tags && vibe.tags.length > 0 && (
          <div className="vibe-tags">
            {vibe.tags.map((tag, index) => (
              <span key={index} className="vibe-tag">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {vibe.emojis && vibe.emojis.length > 0 && (
          <div className="vibe-emojis">
            {vibe.emojis.map((emoji, index) => (
              <span key={index}>{emoji}</span>
            ))}
          </div>
        )}
      </div>

      {currentUser && onReaction && (
        <div className="vibe-reactions">
          {Object.entries(reactionEmojis).map(([type, emoji]) => (
            <button
              key={type}
              className={`reaction-btn ${hasReacted(type) ? 'active' : ''}`}
              onClick={() => onReaction(vibe._id, type)}
            >
              <span>{emoji}</span>
              {getReactionCount(type) > 0 && (
                <span className="reaction-count">{getReactionCount(type)}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default VibeCard;
