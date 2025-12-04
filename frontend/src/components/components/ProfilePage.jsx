import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './ProfilePage.css';

const ProfilePage = () => {
  const { handle } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOwnProfile = !handle || (user && user.handle === handle);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        if (isOwnProfile) {
          // current logged-in user
          const res = await api.get('/profile/me');
          setProfile(res.data.user || res.data);
        } else {
          // public profile by handle
          const res = await api.get(`/users/${handle}`);
          setProfile(res.data.user || res.data);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Could not load profile.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [handle, isOwnProfile]);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-card loading">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-page">
        <div className="profile-card error">
          <h2>Profile not found</h2>
          <p>{error || 'This profile could not be loaded.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} />
            ) : (
              <span>{profile.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="profile-info">
            <h1>{profile.name}</h1>
            <p className="profile-handle">@{profile.handle}</p>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-label">Vibes received</span>
            <span className="stat-value">{profile.stats?.vibesReceived ?? 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Vibes sent</span>
            <span className="stat-value">{profile.stats?.vibesSent ?? 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Slay score</span>
            <span className="stat-value">{profile.stats?.slayScore ?? 0}</span>
          </div>
        </div>

        {profile.socials && (
          <div className="profile-socials">
            {profile.socials.instagram && (
              <a href={profile.socials.instagram} target="_blank" rel="noreferrer">
                Instagram
              </a>
            )}
            {profile.socials.tiktok && (
              <a href={profile.socials.tiktok} target="_blank" rel="noreferrer">
                TikTok
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
