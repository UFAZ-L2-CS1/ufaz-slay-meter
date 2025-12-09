import React, { useState } from 'react';
import './AuthModal.css';

const AuthModal = ({ onClose, onLogin, onRegister, onGoogleLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    handle: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        if (onLogin) {
          await onLogin(formData.email, formData.password);
        }
      } else {
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        if (onRegister) {
          await onRegister(formData);
        }
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      if (onGoogleLogin) {
        await onGoogleLogin();
        onClose();
      } else {
        setError('Google login is not configured. Please use email/password.');
      }
    } catch (err) {
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ name: '', email: '', password: '', handle: '' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <div className="auth-header">
          <h2 className="auth-title">
            {isLogin ? 'Welcome Back! 💕' : 'Join the Squad! ✨'}
          </h2>
          <p className="auth-subtitle">
            {isLogin ? 'Sign in to check your slay level' : 'Create an account to start slaying'}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <span>⚠️</span>
              {error}
            </div>
          )}

          {!isLogin && (
            <>
              <div className="input-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Your fabulous name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  disabled={loading}
                />
              </div>

              <div className="input-group">
                <label htmlFor="handle">Username</label>
                <input
                  id="handle"
                  type="text"
                  name="handle"
                  placeholder="@yourhandle"
                  value={formData.handle}
                  onChange={handleChange}
                  required={!isLogin}
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? (
              <span className="loading-text">
                <span>⏳</span> Loading...
              </span>
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <div className="social-auth">
          <button
            type="button"
            className="social-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <span className="google-icon">G</span>
            Continue with Google
          </button>
        </div>

        <div className="auth-footer">
          <p>{isLogin ? "Don't have an account?" : "Already have an account?"}</p>
          <button
            type="button"
            className="auth-toggle"
            onClick={toggleMode}
            disabled={loading}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>

        <div className="auth-quote">
          <p>"Your slay level is off the charts!" 💕</p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
