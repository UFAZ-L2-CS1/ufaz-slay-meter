import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './ExplorePage.css';

const ExplorePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [vibes, setVibes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // ✅ NEW: Autocomplete states
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    fetchExploreData();
  }, []);

  // ✅ NEW: Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ NEW: Fetch suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoadingSuggestions(true);
      try {
        const response = await api.get(`/users/search?q=${encodeURIComponent(searchQuery)}`);
        setSuggestions(response.data.users || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    // Debounce: wait 300ms after user stops typing
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchExploreData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/explore');
      setUsers(response.data.users || []);
      setVibes(response.data.recentVibes || []);
    } catch (err) {
      console.error('Error fetching explore data:', err);
      setError('Could not load explore page');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchExploreData();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setShowSuggestions(false);
      
      const response = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`);
      setUsers(response.data.users || []);
      setVibes(response.data.vibes || []);
    } catch (err) {
      console.error('Error searching:', err);
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Handle suggestion click
  const handleSuggestionClick = (handle) => {
    window.location.href = `/profile/${handle}`;
  };

  const handleSendVibe = (handle) => {
    window.location.href = `/send-vibe?to=${handle}`;
  };

  if (loading) {
    return (
      <div className="explore-page">
        <div className="container">
          <div className="loading-state">
            <div className="slay-loader">
              <span>✨</span>
              <p>Loading explore...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="explore-page">
      <div className="container">
        <div className="explore-header">
          <h1 className="page-title shimmer-text">✨ Explore UFAZ</h1>
          <p className="page-subtitle">
            Discover amazing people and spread the vibes! 💖
          </p>
        </div>

        {/* Search Bar */}
        <div className="search-section glass-card" ref={searchRef}>
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search for users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSuggestions(true)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                    fetchExploreData();
                  }}
                >
                  ×
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-primary search-btn">
              Search
            </button>
          </form>

          {/* ✅ NEW: Autocomplete Suggestions */}
          {showSuggestions && (
            <div className="search-suggestions">
              {loadingSuggestions ? (
                <div className="suggestion-item loading">
                  <span>Loading...</span>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="suggestion-item no-results">
                  <span>No users found</span>
                </div>
              ) : (
                suggestions.slice(0, 5).map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion.handle)}
                  >
                    <div className="suggestion-avatar">
                      {suggestion.avatarUrl ? (
                        <img src={suggestion.avatarUrl} alt={suggestion.name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {suggestion.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="suggestion-info">
                      <div className="suggestion-name">{suggestion.name}</div>
                      <div className="suggestion-handle">@{suggestion.handle}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="error-message glass-card">
            <span>⚠️</span> {error}
            <button onClick={fetchExploreData} className="btn btn-secondary">
              Try Again
            </button>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="tab-switcher glass-card">
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 People
          </button>
          <button
            className={`tab-btn ${activeTab === 'vibes' ? 'active' : ''}`}
            onClick={() => setActiveTab('vibes')}
          >
            💌 Recent Vibes
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="users-grid">
            {filteredUsers.length === 0 ? (
              <div className="empty-state glass-card">
                <span className="empty-emoji">😔</span>
                <h3>No users found</h3>
                <p>Try a different search term</p>
              </div>
            ) : (
              filteredUsers.map(u => (
                <div key={u.id} className="user-card glass-card">
                  <div className="user-card-header">
                    <Link to={`/profile/${u.handle}`} className="user-avatar-link">
                      <div className="user-avatar">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.name} />
                        ) : (
                          <span>{u.name?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                    </Link>
                    <div className="user-info">
                      <Link to={`/profile/${u.handle}`}>
                        <h3>{u.name}</h3>
                      </Link>
                      <p className="user-handle">@{u.handle}</p>
                    </div>
                  </div>

                  {u.bio && (
                    <p className="user-bio">{u.bio}</p>
                  )}

                  <div className="user-stats">
                    <div className="stat">
                      <span className="stat-value">{u.stats?.vibesReceived || 0}</span>
                      <span className="stat-label">Vibes</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{u.stats?.slayScore || 0}</span>
                      <span className="stat-label">Slay Score</span>
                    </div>
                  </div>

                  <div className="user-actions">
                    <Link
                      to={`/profile/${u.handle}`}
                      className="btn btn-secondary"
                    >
                      👤 View Profile
                    </Link>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSendVibe(u.handle)}
                      disabled={user && user.handle === u.handle}
                    >
                      💌 Send Vibe
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Vibes Tab */}
        {activeTab === 'vibes' && (
          <div className="vibes-feed">
            {vibes.length === 0 ? (
              <div className="empty-state glass-card">
                <span className="empty-emoji">💭</span>
                <h3>No recent vibes</h3>
                <p>Be the first to send a vibe!</p>
                <Link to="/send-vibe" className="btn btn-primary">
                  Send Vibe ✨
                </Link>
              </div>
            ) : (
              vibes.map(vibe => (
                <div key={vibe.id} className="vibe-card glass-card">
                  <div className="vibe-header">
                    <div className="vibe-sender">
                      {vibe.isAnonymous ? (
                        <div className="anonymous-avatar">
                          <span>💭</span>
                        </div>
                      ) : (
                        <Link to={`/profile/${vibe.sender?.handle}`}>
                          <div className="vibe-avatar">
                            {vibe.sender?.avatarUrl ? (
                              <img src={vibe.sender.avatarUrl} alt={vibe.sender.name} />
                            ) : (
                              <span>{vibe.sender?.name?.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                        </Link>
                      )}
                      <div className="vibe-sender-info">
                        {vibe.isAnonymous ? (
                          <span className="anonymous-label">Anonymous</span>
                        ) : (
                          <Link to={`/profile/${vibe.sender?.handle}`}>
                            <strong>{vibe.sender?.name}</strong>
                          </Link>
                        )}
                        <span className="vibe-arrow">→</span>
                        <Link to={`/profile/${vibe.recipient?.handle}`}>
                          <strong>{vibe.recipient?.name}</strong>
                        </Link>
                      </div>
                    </div>
                    <span className="vibe-time">
                      {new Date(vibe.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="vibe-text">{vibe.text}</p>

                  {vibe.tags && vibe.tags.length > 0 && (
                    <div className="vibe-tags">
                      {vibe.tags.map((tag, i) => (
                        <span key={i} className="vibe-tag">#{tag}</span>
                      ))}
                    </div>
                  )}

                  {vibe.emojis && vibe.emojis.length > 0 && (
                    <div className="vibe-emojis">
                      {vibe.emojis.map((emoji, i) => (
                        <span key={i}>{emoji}</span>
                      ))}
                    </div>
                  )}

                  <div className="vibe-actions">
                    <button className="vibe-action-btn">
                      ❤️ {vibe.likes || 0}
                    </button>
                    <button className="vibe-action-btn">
                      💬 {vibe.comments || 0}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Trending Section */}
        <div className="trending-section glass-card">
          <h2>🔥 Trending Now</h2>
          <div className="trending-tags">
            <span className="trending-tag">#kind</span>
            <span className="trending-tag">#amazing</span>
            <span className="trending-tag">#inspiring</span>
            <span className="trending-tag">#talented</span>
            <span className="trending-tag">#funny</span>
            <span className="trending-tag">#creative</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
