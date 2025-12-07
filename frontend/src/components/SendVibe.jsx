import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SendVibe.css';

const SendVibe = ({ user }) => {
  const navigate = useNavigate();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [formData, setFormData] = useState({
    recipientHandle: '',
    text: '',
    tags: [],
    emojis: []
  });
  const [currentTag, setCurrentTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const popularTags = [
    'kind', 'smart', 'funny', 'creative', 'inspiring',
    'talented', 'beautiful', 'amazing', 'helpful', 'cool'
  ];

  const emojiOptions = ['💖', '✨', '🌟', '💕', '🔥', '👑', '💎', '🌈'];

  const vibeTemplates = [
    "You're absolutely amazing and don't let anyone tell you otherwise! 💖",
    "Your energy lights up every room you enter ✨",
    "You inspire me to be a better person every day 🌟",
    "The world is a better place because you're in it 🌈",
    "Your creativity knows no bounds! Keep shining 💎"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const addTag = (tag) => {
    if (formData.tags.length < 8 && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleCustomTag = (e) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      addTag(currentTag.trim().toLowerCase());
      setCurrentTag('');
    }
  };

  const toggleEmoji = (emoji) => {
    const newEmojis = formData.emojis.includes(emoji)
      ? formData.emojis.filter(e => e !== emoji)
      : [...formData.emojis, emoji];
    setFormData({ ...formData, emojis: newEmojis.slice(0, 8) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      setTimeout(() => {
        navigate(`/profile/${formData.recipientHandle}`);
      }, 2000);
    } catch (err) {
      setError('Failed to send vibe. Try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="send-vibe-page">
      <div className="container">
        {/* Header */}
        <div className="send-vibe-header">
          <h1 className="page-title shimmer-text">✨ Send a Vibe ✨</h1>
          <p className="page-subtitle">
            Spread love, positivity, and make someone's day slay!
          </p>
        </div>

        <div className="send-vibe-content">
          {/* Form Card */}
          <div className="vibe-form-card glass-card">
            {success ? (
              <div className="success-state">
                <span className="success-emoji">🎉</span>
                <h2>Vibe Sent Successfully!</h2>
                <p>You just made someone's day so slay! 💖</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="vibe-form">
                {/* Anonymous Notice */}
                {!user && (
                  <div className="anonymous-notice">
                    <span>🎭</span>
                    <p>You're sending as anonymous. Sign in to reveal yourself!</p>
                  </div>
                )}

                {/* Anonymous Toggle */}
                {user && (
                  <div className="anonymous-toggle">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-text">Send Anonymously</span>
                    </label>
                    <p className="toggle-hint">
                      {isAnonymous
                        ? "Your identity will be hidden 🎭"
                        : "They'll know it's from you ✨"}
                    </p>
                  </div>
                )}

                {/* Recipient */}
                <div className="input-group">
                  <label htmlFor="recipientHandle">
                    Who's getting this vibe? <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="recipientHandle"
                    name="recipientHandle"
                    value={formData.recipientHandle}
                    onChange={handleChange}
                    placeholder="@username (without @)"
                    required
                  />
                </div>

                {/* Message */}
                <div className="input-group">
                  <label htmlFor="text">
                    Your Vibe Message <span className="required">*</span>
                    <span className="char-count">{formData.text.length}/280</span>
                  </label>
                  <textarea
                    id="text"
                    name="text"
                    value={formData.text}
                    onChange={handleChange}
                    placeholder="Tell them something nice..."
                    rows="4"
                    maxLength="280"
                    required
                  />

                  {/* Templates */}
                  <div className="templates">
                    <p className="templates-label">💡 Need inspiration? Try these:</p>
                    <div className="template-chips">
                      {vibeTemplates.map((template, index) => (
                        <button
                          key={index}
                          type="button"
                          className="template-chip"
                          onClick={() => setFormData({ ...formData, text: template })}
                        >
                          {template.substring(0, 30)}...
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="input-group">
                  <label>Add Tags (Max 8)</label>
                  <div className="tag-input-wrapper">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={handleCustomTag}
                      placeholder="Press Enter to add custom tag"
                    />
                  </div>

                  <div className="popular-tags">
                    {popularTags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        className={`tag-suggestion ${formData.tags.includes(tag) ? 'selected' : ''}`}
                        onClick={() => addTag(tag)}
                        disabled={formData.tags.includes(tag)}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="selected-tags">
                      {formData.tags.map(tag => (
                        <span key={tag} className="selected-tag">
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="remove-tag"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Emojis */}
                <div className="input-group">
                  <label>Add Emojis (Optional)</label>
                  <div className="emoji-selector">
                    {emojiOptions.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        className={`emoji-option ${formData.emojis.includes(emoji) ? 'selected' : ''}`}
                        onClick={() => toggleEmoji(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="error-message">
                    <span>⚠️</span> {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="btn btn-primary submit-vibe"
                  disabled={loading}
                >
                  {loading ? '✨ Sending...' : '💖 Send Vibe'}
                </button>
              </form>
            )}
          </div>

          {/* Preview Section */}
          <div className="vibe-preview-section">
            <h3>Preview</h3>
            <div className="vibe-preview glass-card">
              <div className="preview-header">
                <span className="preview-sender">
                  {isAnonymous || !user ? '🎭 Anonymous' : `From: ${user?.name || 'You'}`}
                </span>
                <span className="preview-recipient">
                  To: @{formData.recipientHandle || 'someone'}
                </span>
              </div>
              <p className="preview-text">
                {formData.text || 'Your vibe message will appear here...'}
              </p>
              {formData.tags.length > 0 && (
                <div className="preview-tags">
                  {formData.tags.map(tag => (
                    <span key={tag} className="preview-tag">#{tag}</span>
                  ))}
                </div>
              )}
              {formData.emojis.length > 0 && (
                <div className="preview-emojis">
                  {formData.emojis.map(emoji => (
                    <span key={emoji}>{emoji}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="vibe-tips glass-card">
              <h4>💡 Vibe Tips</h4>
              <ul>
                <li>Be genuine and specific</li>
                <li>Focus on positivity</li>
                <li>Use tags to highlight qualities</li>
                <li>Add emojis for extra sparkle ✨</li>
                <li>Remember: kindness is always slay! 👑</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendVibe;
