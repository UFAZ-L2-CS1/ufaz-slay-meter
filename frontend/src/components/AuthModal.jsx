import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthModal.css';

const AuthModal = ({ onClose, onLogin, onRegister, onGoogleLogin }) => {
  const navigate = useNavigate();
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
      navigate('/dashboard'); // ✅ FIXED: Redirect to dashboard after successful login
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
        navigate('/dashboard'); // ✅ Redirect after Google login
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
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        
        <div className="auth-header">
          <h2>{isLogin ? 'Welcome Back! 💖' : 'Join the Slay! ✨'}</h2>
          <p>{isLogin ? 'Sign in to check your slay level' : 'Create an account to start slaying'}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your fabulous name"
                  required={!isLogin}
                />
              </div>

              <div className="form-group">
                <label htmlFor="handle">Handle (optional)</label>
                <input
                  type="text"
                  id="handle"
                  name="handle"
                  value={formData.handle}
                  onChange={handleChange}
                  placeholder="@yourhandle"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '⏳ Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button className="google-btn" onClick={handleGoogleLogin} disabled={loading}>
          <span className="google-icon">G</span>
          Continue with Google
        </button>

        <div className="auth-toggle">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button onClick={toggleMode}>{isLogin ? 'Sign Up' : 'Sign In'}</button>
          </p>
        </div>

        <div className="auth-footer">
          <p>"Your slay level is off the charts!" 💕</p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
