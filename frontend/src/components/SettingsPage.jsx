import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './SettingsPage.css';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Profile Settings
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

  // Load user data when component mounts
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

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    allowAnonymousVibes: true,
    showVibesOnProfile: true,
    showStatsPublicly: true
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    vibeReceived: true,
    weeklyDigest: true,
    newFollowers: false,
    vibeMilestones: true
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested links
    if (name.startsWith('links.')) {
      const linkKey = name.split('.')[1];
      setProfileData({
        ...profileData,
        links: {
          ...profileData.links,
          [linkKey]: value
        }
      });
    } else {
      setProfileData({ ...profileData, [name]: value });
    }
    
    setError('');
    setSuccess('');
  };

  const handlePrivacyChange = (name, value) => {
    setPrivacySettings({ ...privacySettings, [name]: value });
  };

  const handleNotificationChange = (name) => {
    setNotificationSettings({
      ...notificationSettings,
      [name]: !notificationSettings[name]
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // ✅ FIXED: Actually call the API
      const response = await api.patch('/profile', {
        name: profileData.name,
        handle: profileData.handle,
        bio: profileData.bio,
        avatarUrl: profileData.avatarUrl,
        links: profileData.links
      });

      // Update user in context
      if (setUser && response.data.user) {
        setUser(response.data.user);
      }

      setSuccess('Profile updated successfully!');
      
      // Redirect to profile after 1.5 seconds
      setTimeout(() => {
        navigate(`/profile/${response.data.user.handle}`);
      }, 1500);

    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrivacy = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // TODO: Implement privacy settings API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Privacy settings updated successfully!');
    } catch (err) {
      setError('Failed to update privacy settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // TODO: Implement notification settings API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Notification settings updated successfully!');
    } catch (err) {
      setError('Failed to update notification settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      setLoading(true);
      try {
        // TODO: Implement delete account API
        await api.delete('/profile');
        localStorage.removeItem('token');
        navigate('/');
      } catch (err) {
        setError('Failed to delete account.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="settings-page">
      <div className="container">
        {/* Header */}
        <div className="settings-header">
          <h1 className="page-title">
            <span className="shimmer-text">⚙️ Settings</span>
          </h1>
          <p className="page-subtitle">Manage your account and preferences</p>
        </div>

        <div className="settings-content">
          {/* Sidebar Navigation */}
          <div className="settings-sidebar">
            <nav className="settings-nav">
              <button
                className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveSection('profile')}
              >
                <span className="nav-icon">👤</span>
                Profile
              </button>
              <button
                className={`nav-item ${activeSection === 'privacy' ? 'active' : ''}`}
                onClick={() => setActiveSection('privacy')}
              >
                <span className="nav-icon">🔒</span>
                Privacy
              </button>
              <button
                className={`nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveSection('notifications')}
              >
                <span className="nav-icon">🔔</span>
                Notifications
              </button>
              <button
                className={`nav-item ${activeSection === 'account' ? 'active' : ''}`}
                onClick={() => setActiveSection('account')}
              >
                <span className="nav-icon">⚠️</span>
                Account
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="settings-main">
            {/* Success/Error Messages */}
            {success && (
              <div className="success-message">
                <span>✓</span>
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="error-message">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="glass-card settings-section">
                <h2 className="section-title">Profile Information</h2>
                <form onSubmit={handleSaveProfile} className="settings-form">
                  <div className="input-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      placeholder="Enter your name"
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
                      placeholder="@username"
                      pattern="[a-zA-Z0-9_]+"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="bio">
                      Bio
                      <span className="char-count">
                        {profileData.bio.length}/240
                      </span>
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      placeholder="Tell us about yourself..."
                      maxLength={240}
                      rows={4}
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="avatarUrl">Avatar URL</label>
                    <input
                      type="url"
                      id="avatarUrl"
                      name="avatarUrl"
                      value={profileData.avatarUrl}
                      onChange={handleProfileChange}
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <p className="input-hint">
                      Enter a URL to your profile picture
                    </p>
                  </div>

                  {/* Social Links */}
                  <div className="input-group">
                    <label htmlFor="links.instagram">Instagram URL</label>
                    <input
                      type="url"
                      id="links.instagram"
                      name="links.instagram"
                      value={profileData.links.instagram}
                      onChange={handleProfileChange}
                      placeholder="https://instagram.com/username"
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="links.tiktok">TikTok URL</label>
                    <input
                      type="url"
                      id="links.tiktok"
                      name="links.tiktok"
                      value={profileData.links.tiktok}
                      onChange={handleProfileChange}
                      placeholder="https://tiktok.com/@username"
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="links.website">Website URL</label>
                    <input
                      type="url"
                      id="links.website"
                      name="links.website"
                      value={profileData.links.website}
                      onChange={handleProfileChange}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* Privacy Section */}
            {activeSection === 'privacy' && (
              <div className="glass-card settings-section">
                <h2 className="section-title">Privacy Settings</h2>
                <div className="settings-form">
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Profile Visibility</h3>
                      <p>Control who can see your profile</p>
                    </div>
                    <select
                      value={privacySettings.profileVisibility}
                      onChange={(e) =>
                        handlePrivacyChange('profileVisibility', e.target.value)
                      }
                      className="select-input"
                    >
                      <option value="public">Public</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Allow Anonymous Vibes</h3>
                      <p>Let people send you vibes anonymously</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={privacySettings.allowAnonymousVibes}
                        onChange={(e) =>
                          handlePrivacyChange(
                            'allowAnonymousVibes',
                            e.target.checked
                          )
                        }
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Show Vibes on Profile</h3>
                      <p>Display vibes you've received on your profile</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={privacySettings.showVibesOnProfile}
                        onChange={(e) =>
                          handlePrivacyChange(
                            'showVibesOnProfile',
                            e.target.checked
                          )
                        }
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Show Stats Publicly</h3>
                      <p>Display your vibe statistics to everyone</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={privacySettings.showStatsPublicly}
                        onChange={(e) =>
                          handlePrivacyChange(
                            'showStatsPublicly',
                            e.target.checked
                          )
                        }
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={handleSavePrivacy}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Privacy Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="glass-card settings-section">
                <h2 className="section-title">Notification Preferences</h2>
                <div className="settings-form">
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Email Notifications</h3>
                      <p>Receive notifications via email</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={() =>
                          handleNotificationChange('emailNotifications')
                        }
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Vibe Received</h3>
                      <p>Get notified when you receive a new vibe</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.vibeReceived}
                        onChange={() => handleNotificationChange('vibeReceived')}
                        disabled={!notificationSettings.emailNotifications}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Weekly Digest</h3>
                      <p>Receive a weekly summary of your vibes</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.weeklyDigest}
                        onChange={() => handleNotificationChange('weeklyDigest')}
                        disabled={!notificationSettings.emailNotifications}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>New Followers</h3>
                      <p>Get notified when someone follows you</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.newFollowers}
                        onChange={() => handleNotificationChange('newFollowers')}
                        disabled={!notificationSettings.emailNotifications}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Vibe Milestones</h3>
                      <p>Celebrate when you reach vibe milestones</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.vibeMilestones}
                        onChange={() =>
                          handleNotificationChange('vibeMilestones')
                        }
                        disabled={!notificationSettings.emailNotifications}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={handleSaveNotifications}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Notification Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Account Section */}
            {activeSection === 'account' && (
              <div className="glass-card settings-section">
                <h2 className="section-title">Account Management</h2>
                <div className="settings-form">
                  <div className="danger-zone">
                    <h3>⚠️ Danger Zone</h3>
                    <p>
                      Once you delete your account, there is no going back.
                      Please be certain.
                    </p>
                    <button
                      className="btn btn-danger"
                      onClick={handleDeleteAccount}
                      disabled={loading}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
