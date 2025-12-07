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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
    setFormData({
      name: '',
      email: '',
      password: '',
      handle: ''
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="auth-header">
          <h2 className="auth-title">
            {isLogin ? 'Welcome Back! 💖' : 'Join the Slay Squad ✨'}
          </h2>
          <p className="auth-subtitle">
            {isLogin 
              ? 'Sign in to check your slay level' 
              : 'Create an account to start slaying'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="input-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required={!isLogin}
                />
              </div>

              <div className="input-group">
                <label htmlFor="handle">Username</label>
                <input
                  type="text"
                  id="handle"
                  name="handle"
                  value={formData.handle}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  pattern="[a-zA-Z0-9_]+"
                  title="Username can only contain letters, numbers, and underscores"
                  required={!isLogin}
                />
              </div>
            </>
          )}

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={isLogin ? "Enter your password" : "Min. 6 characters"}
              minLength={isLogin ? undefined : 6}
              required
            />
          </div>

          {error && (
            <div className="error-message">
              <span>⚠️</span> {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-text">Loading...</span>
            ) : (
              isLogin ? 'Sign In 💫' : 'Create Account ✨'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button 
            type="button" 
            className="auth-toggle"
            onClick={toggleMode}
            disabled={loading}
          >
            {isLogin ? 'Join Now' : 'Sign In'}
          </button>
        </div>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <div className="social-auth">
          <button 
            className="social-btn google"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <span className="google-icon">G</span>
            Google
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