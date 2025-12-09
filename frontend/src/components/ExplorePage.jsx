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
  const [suggestionLoading, setSuggestionLoading] = useState(false);
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

  const fetchExploreData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/explore');
      setUsers(response.data.users || []);
      setVibes(response.data.vibes || response.data.recentVibes || []);
    } catch (err) {
      console.error('Error fetching explore data:', err);
      setError('Could not load explore page');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Live search suggestions as user types
  const handleSearchInput = async (value) => {
    setSearchQuery(value);

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      fetchExploreData();
      return;
    }

    // Show suggestions after 1 character
    if (value.trim().length >= 1) {
      setSuggestionLoading(true);
      try {
        const response = await api.get(`/users/search?q=${encodeURIComponent(value.trim())}`);
        setSuggestions(response.data.users || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setSuggestions([]);
      } finally {
        setSuggestionLoading(false);
      }
    }
  };

  // ✅ NEW: Select a suggestion
  const handleSelectSuggestion = (selectedUser) => {
    setSearchQuery(selectedUser.handle);
    setShowSuggestions(false);
    // Optionally navigate to profile
    window.location.href = `/profile/${selectedUser.handle}`;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    
    if (!searchQuery.trim()) {
      fetchExploreData();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/users/search?q=${encodeURIComponent(searchQuery)}`);
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Error searching:', err);
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendVibe = (handle) => {
    window.location.href = `/send-vibe?to=${handle}`;
  };

  if (loading && !searchQuery) {
    return (
      <div className="explore-page">
        <div className="loading-state">
          <span>💫</span>
          <p>Loading explore...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="explore-page">
      <div className="explore-header">
        <h1>Explore 🌟</h1>
        <p>Discover amazing people and spread the vibes! 💖</p>
      </div>

      {/* Search Bar with Autocomplete */}
      <div className="search-section" ref={searchRef}>
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onFocus={() => searchQuery && setShowSuggestions(true)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              🔍
            </button>
          </div>

          {/* ✅ NEW: Autocomplete Dropdown */}
          {showSuggestions && (
            <div className="search-suggestions">
              {suggestionLoading ? (
                <div className="suggestion-item loading">
                  <span>Searching...</span>
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.slice(0, 5).map((suggestedUser) => (
                  <div
                    key={suggestedUser._id}
                    className="suggestion-item"
                    onClick={() => handleSelectSuggestion(suggestedUser)}
                  >
                    <div className="suggestion-avatar">
                      {suggestedUser.avatarUrl ? (
                        <img src={suggestedUser.avatarUrl} alt={suggestedUser.name} />
                      ) : (
                        <span className="avatar-placeholder">
                          {suggestedUser.name?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="suggestion-info">
                      <span className="suggestion-name">{suggestedUser.name}</span>
                      <span className="suggestion-handle">@{suggestedUser.handle}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="suggestion-item no-results">
                  <span>No users found</span>
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {error && (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchExploreData} className="btn btn-secondary">
            Try Again
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="explore-tabs">
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          People 👥
        </button>
        <button
          className={`tab ${activeTab === 'vibes' ? 'active' : ''}`}
          onClick={() => setActiveTab('vibes')}
        >
          Recent Vibes ✨
        </button>
      </div>

      {/* Content */}
      {activeTab === 'users' && (
        <div className="users-grid">
          {users.length === 0 ? (
            <div className="empty-state">
              <span>🔍</span>
              <p>Try a different search term</p>
            </div>
          ) : (
            users.map((u) => (
              <div key={u._id} className="user-card">
                <div className="user-avatar">
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt={u.name} />
                  ) : (
                    <span className="avatar-placeholder">
                      {u.name?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>
                <h3>{u.name}</h3>
                <p className="user-handle">@{u.handle}</p>
                {u.bio && <p className="user-bio">{u.bio}</p>}
                <div className="user-actions">
                  <Link to={`/profile/${u.handle}`} className="btn btn-secondary">
                    View Profile
                  </Link>
                  <button
                    onClick={() => handleSendVibe(u.handle)}
                    className="btn btn-primary"
                  >
                    Send Vibe ✨
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'vibes' && (
        <div className="vibes-list">
          {vibes.length === 0 ? (
            <div className="empty-state">
              <span>💫</span>
              <p>Be the first to send a vibe!</p>
              <button onClick={() => (window.location.href = '/send-vibe')} className="btn btn-primary">
                Send Vibe ✨
              </button>
            </div>
          ) : (
            vibes.map((vibe) => (
              <div key={vibe._id} className="vibe-card">
                <p className="vibe-text">{vibe.text}</p>
                {vibe.tags && vibe.tags.length > 0 && (
                  <div className="vibe-tags">
                    {vibe.tags.map((tag, i) => (
                      <span key={i} className="tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
