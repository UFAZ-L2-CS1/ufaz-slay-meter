import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user: currentUser } = useAuth();
  const { handle } = useParams();
  const [profile, setProfile] = useState(null);
  const [vibes, setVibes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOwnProfile = !handle || (currentUser && currentUser.handle === handle);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        let profileData;

        if (isOwnProfile && currentUser) {
          // Load own profile with stats
          const response = await api.get('/profile/me');
          profileData = response.data.user;
        } else {
          // Load other user's profile with stats
          const response = await api.get(`/profile/${handle}`);
          profileData = response.data.user;
        }

        setProfile(profileData);

        // Load vibes for this user
        try {
          const vibesResponse = await api.get(`/vibes/user/${profileData.handle}`, {
            params: { page: 1, limit: 10 }
          });
          setVibes(vibesResponse.data.items || []);
        } catch (vibesErr) {
          console.error('Error loading vibes:', vibesErr);
          // Don't fail the whole page if vibes fail
          setVibes([]);
        }

      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Could not load profile.');
      } finally {
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
          <Link to="/" className="btn-back">Go Home</Link>
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
          
          {isOwnProfile && (
            <Link to="/settings" className="btn-edit">Edit Profile</Link>
          )}
          
          {!isOwnProfile && (
            <Link to={`/send?to=${profile.handle}`} className="btn-send-vibe">
              💌 Send Vibe
            </Link>
          )}
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

        {/* Top Tags Section */}
        {profile.stats?.topTags && profile.stats.topTags.length > 0 && (
          <div className="profile-top-tags">
            <h3>Top Vibes 🌟</h3>
            <div className="tags-list">
              {profile.stats.topTags.map((tagData) => (
                <span key={tagData.tag} className="tag-item">
                  #{tagData.tag} ({tagData.pct}%)
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent Vibes Section */}
        {vibes.length > 0 && (
          <div className="profile-vibes">
            <h3>Recent Vibes 💌</h3>
            <div className="vibes-list">
              {vibes.map((vibe) => (
                <div key={vibe._id} className="vibe-item">
                  <div className="vibe-header">
                    {/* ✅ FIXED: Show sender name with link or anonymous */}
                    <span className="vibe-from">
                      {vibe.isAnonymous ? (
                        '🎭 Anonymous'
                      ) : vibe.senderId ? (
                        <>
                          From:{' '}
                          <Link to={`/profile/${vibe.senderId.handle}`} className="sender-link">
                            {vibe.senderId.name}
                          </Link>
                        </>
                      ) : (
                        'From: Someone'
                      )}
                    </span>
                    <span className="vibe-date">
                      {new Date(vibe.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="vibe-text">{vibe.text}</p>
                  {vibe.tags && vibe.tags.length > 0 && (
                    <div className="vibe-tags">
                      {vibe.tags.map((tag, idx) => (
                        <span key={idx} className="vibe-tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                  {vibe.emojis && vibe.emojis.length > 0 && (
                    <div className="vibe-emojis">
                      {vibe.emojis.map((emoji, idx) => (
                        <span key={idx} className="vibe-emoji">{emoji}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Links */}
        {profile.links && (profile.links.instagram || profile.links.tiktok || profile.links.website) && (
          <div className="profile-socials">
            <h3>Connect</h3>
            <div className="socials-list">
              {profile.links.instagram && (
                <a href={profile.links.instagram} target="_blank" rel="noreferrer">
                  📸 Instagram
                </a>
              )}
              {profile.links.tiktok && (
                <a href={profile.links.tiktok} target="_blank" rel="noreferrer">
                  🎵 TikTok
                </a>
              )}
              {profile.links.website && (
                <a href={profile.links.website} target="_blank" rel="noreferrer">
                  🌐 Website
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
