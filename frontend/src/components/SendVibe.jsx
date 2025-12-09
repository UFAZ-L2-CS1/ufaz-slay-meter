import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./SendVibe.css";

const SendVibe = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [formData, setFormData] = useState({
    recipientHandle: "",
    text: "",
    tags: [],
    emojis: [],
  });

  // 🧠 For user suggestions
  const [suggestions, setSuggestions] = useState([]);

  const handleRecipientChange = async (e) => {
    const value = e.target.value.trim().replace("@", "");
    setFormData({ ...formData, recipientHandle: value });

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await api.get(`/users/search?q=${value}`);
      setSuggestions(res.data.users);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const [currentTag, setCurrentTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const popularTags = [
    "kind",
    "smart",
    "funny",
    "creative",
    "inspiring",
    "talented",
    "beautiful",
    "amazing",
    "helpful",
    "cool",
  ];
  const emojiOptions = ["💖", "✨", "🔥", "👑", "💯", "🌟", "💕", "⚡"];
  const vibeTemplates = [
    "You're absolutely amazing and don't let anyone tell you otherwise! ✨",
    "Your energy lights up every room you enter 💫",
    "You inspire me to be a better person every day 🌟",
    "The world is a better place because you're in it 💖",
    "Your creativity knows no bounds! Keep shining ⭐",
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const addTag = (tag) => {
    if (formData.tags.length < 8 && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleCustomTag = (e) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      addTag(currentTag.trim().toLowerCase());
      setCurrentTag("");
    }
  };

  const toggleEmoji = (emoji) => {
    const newEmojis = formData.emojis.includes(emoji)
      ? formData.emojis.filter((e) => e !== emoji)
      : [...formData.emojis, emoji];
    setFormData({ ...formData, emojis: newEmojis.slice(0, 8) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post("/vibes/send", {
        recipientHandle: formData.recipientHandle,
        text: formData.text,
        tags: formData.tags,
        emojis: formData.emojis,
        isAnonymous: isAnonymous,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(`/profile/${formData.recipientHandle}`);
      }, 2000);
    } catch (err) {
      console.error("Error sending vibe:", err);
      setError(err.response?.data?.message || "Failed to send vibe. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="send-vibe-page">
      <div className="container">
        <div className="send-vibe-header">
          <h1 className="page-title shimmer-text">💌 Send a Vibe</h1>
          <p className="page-subtitle">
            Spread love, positivity, and make someone's day slay! ✨
          </p>
        </div>

        <div className="send-vibe-content">
          <div className="vibe-form-card glass-card">
            {success ? (
              <div className="success-state">
                <span className="success-emoji">🎉</span>
                <h2>Vibe Sent Successfully!</h2>
                <p>You just made someone's day so slay!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="vibe-form">
                {!user && (
                  <div className="anonymous-notice">
                    <span>ℹ️</span>
                    <p>You're sending as anonymous. Sign in to reveal yourself!</p>
                  </div>
                )}

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
                        ? "Your identity will be hidden"
                        : "They'll know it's from you"}
                    </p>
                  </div>
                )}

                {/* 🔍 Recipient autocomplete */}
                <div className="input-group">
                  <label htmlFor="recipientHandle">
                    Who's getting this vibe? <span className="required">*</span>
                  </label>
                  <div className="recipient-autocomplete">
                    <input
                      type="text"
                      id="recipientHandle"
                      name="recipientHandle"
                      value={formData.recipientHandle}
                      onChange={handleRecipientChange}
                      placeholder="@username"
                      required
                      autoComplete="off"
                    />
                    {/* Autocomplete suggestions */}
                      {suggestions.length > 0 && (
                        <ul className="suggestions-list">
                          {suggestions.map((u) => (
                            <li
                              key={u.handle}
                              onClick={() => {
                                setFormData({ ...formData, recipientHandle: u.handle });
                                setSuggestions([]);
                              }}
                            >
                              <img
                                src={u.avatarUrl || "https://via.placeholder.com/36"}
                                alt={u.name}
                                className="suggestion-avatar"
                              />
                              <div className="suggestion-info">
                                <span className="suggestion-name">{u.name}</span>
                                <span className="suggestion-handle">@{u.handle}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                      
                      {formData.recipientHandle.length >= 2 && suggestions.length === 0 && (
                        <div className="no-suggestions">No users found</div>
                      )}

                    {suggestions.length > 0 && (
                      <ul className="suggestions-list">
                        {suggestions.map((u) => (
                          <li
                            key={u.handle}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                recipientHandle: u.handle,
                              });
                              setSuggestions([]);
                            }}
                          >
                            <img
                              src={
                                u.avatarUrl || "https://via.placeholder.com/30"
                              }
                              alt={u.name}
                              className="suggestion-avatar"
                            />
                            <div className="suggestion-info">
                              <span className="suggestion-name">{u.name}</span>
                              <span className="suggestion-handle">
                                @{u.handle}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
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
                </div>

                {/* Tags */}
                <div className="input-group">
                  <label>Add Tags (Max 8)</label>
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={handleCustomTag}
                    placeholder="Press Enter to add custom tag"
                  />
                  <div className="popular-tags">
                    {popularTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={`tag-suggestion ${
                          formData.tags.includes(tag) ? "selected" : ""
                        }`}
                        onClick={() => addTag(tag)}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emojis */}
                <div className="input-group">
                  <label>Add Emojis (Optional)</label>
                  <div className="emoji-selector">
                    {emojiOptions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className={`emoji-option ${
                          formData.emojis.includes(emoji) ? "selected" : ""
                        }`}
                        onClick={() => toggleEmoji(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="error-message">
                    <span>⚠️</span> {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary submit-vibe"
                  disabled={loading}
                >
                  {loading ? "⏳ Sending..." : "💖 Send Vibe"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendVibe;
