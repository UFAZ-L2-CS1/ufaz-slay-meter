import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SendVibe.css';

const SendVibe = ({ user }) => {
  const navigate = useNavigate();
  const [isAnonymous, setIsAnonymous] = useState(true);
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

  const useTemplate = (template) => {
    setFormData({ ...formData, text: template });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.recipientHandle.trim()) {
      setError('Please enter a recipient handle');
      return;
    }
    
    if (!formData.text.trim()) {
      setError('Please write a vibe message');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError('Failed to send vibe. Try again!');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="send-vibe-page">
        <div className="container">
          <div className="glass-card">
            <div className="success-state">
              <span className="success-emoji">🎉</span>
              <h2>Vibe Sent Successfully!</h2>
              <p>You just made someone's day slay!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="send-vibe-page">
      <div className="container">
        {/* Header */}
        <div className="send-vibe-header">
          <h1 className="page-title">
            <span className="shimmer-text">Send a Vibe 💕</span>
          </h1>
          <p className="page-subtitle">
            Spread love, positivity, and make someone's day slay!
          </p>
        </div>

        {/* Content */}
        <div className="send-vibe-content">
          {/* Form Section */}
          <div className="glass-card">
            <form onSubmit={handleSubmit} className="vibe-form">
              {/* Recipient Handle */}
              <div className="input-group">
                <label>
                  Recipient Handle <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="recipientHandle"
                  value={formData.recipientHandle}
                  onChange={handleChange}
                  placeholder="@username"
                  required
                />
              </div>

              {/* Anonymous Toggle */}
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
                    ? '🎭 Your identity will be hidden'
                    : '👤 Your name will be shown'}
                </p>
              </div>

              {/* Message */}
              <div className="input-group">
                <label>
                  Your Vibe Message <span className="required">*</span>
                  <span className="char-count">
                    {formData.text.length}/500
                  </span>
                </label>
                <textarea
                  name="text"
                  value={formData.text}
                  onChange={handleChange}
                  placeholder="Write something amazing..."
                  maxLength={500}
                  required
                />
                
                {/* Templates */}
                <div className="templates">
                  <p className="templates-label">Quick templates:</p>
                  <div className="template-chips">
                    {vibeTemplates.map((template, index) => (
                      <button
                        key={index}
                        type="button"
                        className="template-chip"
                        onClick={() => useTemplate(template)}
                      >
                        {template.substring(0, 40)}...
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="input-group">
                <label>Tags (up to 8)</label>
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleCustomTag}
                  placeholder="Type and press Enter to add custom tag"
                />
                
                {formData.tags.length > 0 && (
                  <div className="selected-tags">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="selected-tag">
                        #{tag}
                        <button
                          type="button"
                          className="remove-tag"
                          onClick={() => removeTag(tag)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="popular-tags">
                  {popularTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`tag-suggestion ${
                        formData.tags.includes(tag) ? 'selected' : ''
                      }`}
                      onClick={() => addTag(tag)}
                      disabled={
                        formData.tags.includes(tag) || formData.tags.length >= 8
                      }
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emojis */}
              <div className="input-group">
                <label>Add Emojis (up to 8)</label>
                <div className="emoji-selector">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className={`emoji-option ${
                        formData.emojis.includes(emoji) ? 'selected' : ''
                      }`}
                      onClick={() => toggleEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="error-message">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="submit-vibe"
                disabled={loading || !formData.recipientHandle || !formData.text}
              >
                {loading ? 'Sending...' : 'Send Vibe 💕'}
              </button>
            </form>
          </div>

          {/* Preview Section */}
          <div className="vibe-preview-section">
            <div className="glass-card">
              <div className="preview-header">
                <span className="preview-sender">
                  From: {isAnonymous ? 'Anonymous 🎭' : user?.name || 'You'}
                </span>
                <span className="preview-recipient">
                  To: @{formData.recipientHandle || 'recipient'}
                </span>
              </div>
              
              <p className="preview-text">
                {formData.text || 'Your vibe message will appear here...'}
              </p>

              {formData.tags.length > 0 && (
                <div className="preview-tags">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="preview-tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {formData.emojis.length > 0 && (
                <div className="preview-emojis">
                  {formData.emojis.map((emoji, index) => (
                    <span key={index}>{emoji}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="glass-card vibe-tips">
              <h4>💡 Vibe Tips</h4>
              <ul>
                <li>Be genuine and specific with your compliments</li>
                <li>Mention what makes them special or unique</li>
                <li>Spread positivity and avoid negativity</li>
                <li>Remember: kind words can change someone's day!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendVibe;
