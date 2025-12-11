import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navigation.css';

const Navigation = ({ user, onAuthClick, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // Close menus on route change
  useEffect(() => {
    setShowMobileMenu(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileMenu]);

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/');
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getUserInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
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
            aria-expanded={showMobileMenu}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {showMobileMenu ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>

          {/* Navigation Links */}
          <div className={`nav-links ${showMobileMenu ? 'mobile-open' : ''}`}>
            <Link
              to="/explore"
              className={`nav-link ${isActive('/explore') ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <span>Explore</span>
            </Link>

            <Link
              to="/vibe-wars"
              className={`nav-link ${isActive('/vibe-wars') ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
              <span>Vibe Wars</span>
            </Link>

            <Link
              to="/leaderboard"
              className={`nav-link ${isActive('/leaderboard') ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
              <span>Leaderboard</span>
            </Link>

            {user && (
              <>
                <Link
                  to="/dashboard"
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/send-vibe"
                  className={`nav-link ${isActive('/send-vibe') ? 'active' : ''}`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
                  </svg>
                  <span>Send Vibe</span>
                </Link>
              </>
            )}

            {/* Auth Section */}
            <div className="nav-auth">
              {user ? (
                <div className="user-menu" ref={userMenuRef}>
                  <button
                    className="user-menu-trigger"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    aria-expanded={showUserMenu}
                    aria-haspopup="true"
                  >
                    <div className="user-avatar">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} />
                      ) : (
                        <span>{getUserInitials(user.name)}</span>
                      )}
                    </div>
                    <span className="user-name">{user.name}</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      style={{
                        transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 0.3s ease',
                        flexShrink: 0,
                      }}
                    >
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <div className={`user-menu-dropdown ${showUserMenu ? 'open' : ''}`}>
                    <Link
                      to={`/profile/${user.handle || user.username || 'me'}`}
                      className="user-menu-item"
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowMobileMenu(false);
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/settings"
                      className="user-menu-item"
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowMobileMenu(false);
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v6m0 6v6" />
                        <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24" />
                        <path d="M1 12h6m6 0h6" />
                        <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24" />
                      </svg>
                      <span>Settings</span>
                    </Link>

                    <button className="user-menu-item logout" onClick={handleLogout}>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={onAuthClick} className="btn-signin">
                  SIGN IN
                </button>
              )}
            </div>
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