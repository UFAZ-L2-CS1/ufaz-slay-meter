import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navigation.css';

const Navigation = ({ user, onAuthClick, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/');
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <nav className="navigation">
        <div className="nav-container">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <span>💕</span>
            UFAZ Slay Meter
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle menu"
          >
            <div className={`hamburger ${showMobileMenu ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>

          {/* Navigation Links */}
          <div className={`nav-links ${showMobileMenu ? 'mobile-open' : ''}`}>
            <Link
              to="/explore"
              className={`nav-link ${isActive('/explore') ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              ✨ Explore
            </Link>
            <Link
              to="/wars"
              className={`nav-link ${isActive('/wars') ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              ⚔️ Vibe Wars
            </Link>
            <Link
              to="/leaderboard"
              className={`nav-link ${isActive('/leaderboard') ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              👑 Leaderboard
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  📊 Dashboard
                </Link>
                <Link
                  to="/send"
                  className={`nav-link ${isActive('/send') ? 'active' : ''}`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  💌 Send Vibe
                </Link>

                {/* User Menu */}
                <div className="user-menu">
                  <button
                    className="user-menu-trigger"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <div className="user-avatar">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} />
                      ) : (
                        user.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="user-name">{user.name}</span>
                  </button>

                  {showUserMenu && (
                    <div className="user-dropdown">
                      <Link
                        to={`/profile/${user.handle || 'me'}`}
                        className="dropdown-item"
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowMobileMenu(false);
                        }}
                      >
                        <span>👤</span> My Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="dropdown-item"
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowMobileMenu(false);
                        }}
                      >
                        <span>⚙️</span> Settings
                      </Link>
                      <button className="dropdown-item logout" onClick={handleLogout}>
                        <span>🚪</span> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onAuthClick?.();
                    setShowMobileMenu(false);
                  }}
                  className="btn btn-primary nav-auth-btn"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Wednesday Special Banner */}
      {new Date().getDay() === 3 && (
        <div className="wednesday-banner">
          <p>🎀 It's Wednesday! Double slay points today! 🎀</p>
        </div>
      )}
    </>
  );
};

export default Navigation;
