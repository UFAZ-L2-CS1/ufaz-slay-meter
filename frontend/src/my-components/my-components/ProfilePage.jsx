import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = ({ currentUser }) => {
  const { handle } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOwnProfile = !handle || (currentUser && currentUser.handle === handle);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Mock profile data for demo
        setTimeout(() => {
          if (isOwnProfile && currentUser) {
            setProfile(currentUser);
          } else {
            setProfile({
              name: handle ? handle.charAt(0).toUpperCase() + handle.slice(1) : 'User',
              handle: handle || 'user',
              bio: 'Living my best life ✨',
              avatarUrl: null,
              stats: {
                vibesReceived: Math.floor(Math.random() * 100) + 10,
                vibesSent: Math.floor(Math.random() * 50) + 5,
                slayScore: Math.floor(Math.random() * 500) + 100
              },
              socials: {
                instagram: 'https://instagram.com',
                tiktok: 'https://tiktok.com'
              }
            });
          }
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Could not load profile.');
        setLoading(false);
      }
    };

    loadProfile();
  }, [handle, isOwnProfile, currentUser]);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-card loading">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-pink-200"></div>
            <div className="h-6 w-32 bg-pink-200 rounded"></div>
            <div className="h-4 w-24 bg-pink-100 rounded"></div>
          </div>
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
                📸 Instagram
              </a>
            )}
            {profile.socials.tiktok && (
              <a href={profile.socials.tiktok} target="_blank" rel="noreferrer">
                🎵 TikTok
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
