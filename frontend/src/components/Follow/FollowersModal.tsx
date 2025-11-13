// src/components/Follow/FollowersModal.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../assets/lib/supabaseClient';

interface FollowersModalProps {
  open: boolean;
  onClose: () => void;
  profileId: string;
}

// ADD ALL THE MISSING STYLE OBJECTS
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '20px',
};

const modalStyle: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '400px',
  maxHeight: '80vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px 24px 16px 24px',
  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
};

const titleStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', serif",
  fontSize: '20px',
  fontWeight: 700,
  color: '#1A1A1A',
  margin: 0,
};

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  color: '#6B7280',
  padding: '4px',
  borderRadius: '4px',
  transition: 'all 0.2s ease',
};

const contentStyle: React.CSSProperties = {
  flex: 1,
  overflow: 'auto',
  padding: '16px 0',
};

const loadingStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '40px 20px',
  color: '#6B7280',
  fontFamily: "'Cormorant', serif",
  fontSize: '16px',
};

const emptyStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '40px 20px',
  color: '#9CA3AF',
  fontFamily: "'Cormorant', serif",
  fontSize: '16px',
  fontStyle: 'italic',
};

const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '0 16px',
};

const userItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  borderRadius: '12px',
  transition: 'background-color 0.2s ease',
  cursor: 'pointer',
};

const avatarStyle: React.CSSProperties = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid #FAF8F2',
};

const userInfoStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
};

const userNameStyle: React.CSSProperties = {
  fontFamily: "'Cormorant', serif",
  fontSize: '16px',
  fontWeight: 600,
  color: '#1A1A1A',
  lineHeight: 1.2,
};

const usernameStyle: React.CSSProperties = {
  fontFamily: "'Cormorant', serif",
  fontSize: '14px',
  color: '#6B7280',
  fontStyle: 'italic',
  lineHeight: 1.2,
};

const bioStyle: React.CSSProperties = {
  fontFamily: "'Cormorant', serif",
  fontSize: '13px',
  color: '#9CA3AF',
  lineHeight: 1.3,
  marginTop: '4px',
};

const FollowersModal: React.FC<FollowersModalProps> = ({ open, onClose, profileId }) => {
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && profileId) {
      fetchFollowers();
    }
  }, [open, profileId]);

  const fetchFollowers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_echoes')
        .select(`
          from_user_id,
          profiles:from_user_id (
            id,
            username,
            full_name,
            avatar_url,
            bio
          ),
          created_at
        `)
        .eq('to_user_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFollowers(data || []);
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <h3 style={titleStyle}>Followers</h3>
          <button 
            onClick={onClose} 
            style={closeButtonStyle}
            onMouseEnter={(e) => e.currentTarget.style.color = '#1A1A1A'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {loading ? (
            <div style={loadingStyle}>Loading followers...</div>
          ) : followers.length === 0 ? (
            <div style={emptyStyle}>No followers yet</div>
          ) : (
            <div style={listStyle}>
              {followers.map((follower) => (
                <div 
                  key={follower.from_user_id} 
                  style={userItemStyle}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FAF8F2'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <img 
                    src={follower.profiles.avatar_url || '/placeholder-avatar.png'} 
                    alt={follower.profiles.username}
                    style={avatarStyle}
                  />
                  <div style={userInfoStyle}>
                    <div style={userNameStyle}>{follower.profiles.full_name || 'Anonymous'}</div>
                    <div style={usernameStyle}>@{follower.profiles.username || 'user'}</div>
                    {follower.profiles.bio && (
                      <div style={bioStyle}>{follower.profiles.bio}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;