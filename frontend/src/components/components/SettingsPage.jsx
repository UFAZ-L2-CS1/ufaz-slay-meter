import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './SettingsPage.css';

const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profileData, setProfileData] = useState({
    name: '',
    handle: '',
    bio: '',
    avatarUrl: '',
    links: {
      instagram: '',
      tiktok: '',
      website: ''
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        handle: user.handle || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
        links: {
          instagram: user.links?.instagram || '',
          tiktok: user.links?.tiktok || '',
          website: user.links?.website || ''
        }
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('links.')) {
      const linkName = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        links: {
          ...prev.links,
          [linkName]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await updateProfile(profileData);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setMessage('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await api.post('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setProfileData(prev => ({
        ...prev,
        avatarUrl: response.data.url
      }));
      
      setMessage('Avatar uploaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to upload avatar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page page-container">
      <div className="container">
        <div className="settings-header">
          <h1>Settings</h1>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate(`/profile/${user?.handle}`)}
          >
            View Profile
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-tabs">
            <button
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              Password
            </button>
            <button
              className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              Privacy
            </button>
          </div>

          <div className="settings-panel glass-card">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="settings-form">
                <h2>Edit Profile</h2>

                <div className="avatar-section">
                  <div className="current-avatar">
                    {profileData.avatarUrl ? (
                      <img src={profileData.avatarUrl} alt="Avatar" />
                    ) : (
                      <div className="avatar-placeholder">
                        <span>{profileData.name?.charAt(0) || '?'}</span>
                      </div>
                    )}
                  </div>
                  <div className="avatar-upload">
                    <label htmlFor="avatar-upload" className="btn btn-secondary">
                      Change Avatar
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      style={{ display: 'none' }}
                    />
                    <p className="upload-hint">Max size: 5MB</p>
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="handle">Username</label>
                  <input
                    type="text"
                    id="handle"
                    name="handle"
                    value={profileData.handle}
                    onChange={handleProfileChange}
                    pattern="[a-zA-Z0-9_]+"
                    required
                  />
                  <p className="input-hint">Letters, numbers, and underscores only</p>
                </div>

                <div className="input-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    rows="4"
                    maxLength="240"
                    placeholder="Tell everyone about yourself..."
                  />
                  <p className="char-count">{profileData.bio.length}/240</p>
                </div>

                <div className="social-links-section">
                  <h3>Social Links</h3>
                  
                  <div className="input-group">
                    <label htmlFor="instagram">Instagram</label>
                    <input
                      type="text"
                      id="instagram"
                      name="links.instagram"
                      value={profileData.links.instagram}
                      onChange={handleProfileChange}
                      placeholder="username (without @)"
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="tiktok">TikTok</label>
                    <input
                      type="text"
                      id="tiktok"
                      name="links.tiktok"
                      value={profileData.links.tiktok}
                      onChange={handleProfileChange}
                      placeholder="username (without @)"
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="website">Website</label>
                    <input
                      type="url"
                      id="website"
                      name="links.website"
                      value={profileData.links.website}
                      onChange={handleProfileChange}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                {message && (
                  <div className="success-message">
                    <span>✅</span> {message}
                  </div>
                )}

                {error && (
                  <div className="error-message">
                    <span>⚠️</span> {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="settings-form">
                <h2>Change Password</h2>

                <div className="input-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    minLength="6"
                    required
                  />
                  <p className="input-hint">Minimum 6 characters</p>
                </div>

                <div className="input-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    minLength="6"
                    required
                  />
                </div>

                {message && (
                  <div className="success-message">
                    <span>✅</span> {message}
                  </div>
                )}

                {error && (
                  <div className="error-message">
                    <span>⚠️</span> {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            )}

            {activeTab === 'privacy' && (
              <div className="privacy-settings">
                <h2>Privacy Settings</h2>
                <p>Privacy options coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
