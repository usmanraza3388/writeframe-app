import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showCreationMenu, setShowCreationMenu] = React.useState(false);

  // Icons with theme support
  const HomeIcon = ({ active }: { active: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "var(--text-primary)" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );

  // ADDED: Messages Icon
  const MessagesIcon = ({ active }: { active: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "var(--text-primary)" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );

  const CreateIcon = ({ active }: { active: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="2" ry="2"/>
      <line x1="8" y1="2" x2="8" y2="22"/>
      <line x1="16" y1="2" x2="16" y2="22"/>
      <line x1="2" y1="8" x2="22" y2="8"/>
      <line x1="2" y1="16" x2="22" y2="16"/>
      <circle cx="12" cy="12" r="3" fill={active ? "currentColor" : "none"}/>
    </svg>
  );

  const ProfileIcon = ({ active }: { active: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "var(--text-primary)" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );

  // Content type icons for creation menu
  const SceneIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
      <polyline points="21,15 16,10 5,21"/>
    </svg>
  );

  const MonologueIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <line x1="9" y1="10" x2="15" y2="10"/>
      <line x1="12" y1="7" x2="12" y2="13"/>
    </svg>
  );

  const CharacterIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
      <path d="M16 3l4 4-4 4"/>
    </svg>
  );

  const FrameIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <line x1="9" y1="3" x2="9" y2="21"/>
      <line x1="15" y1="3" x2="15" y2="21"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="3" y1="15" x2="21" y2="15"/>
    </svg>
  );

  const handleHomeClick = () => {
    if (location.pathname === '/home-feed') {
      window.location.reload();
    } else {
      navigate('/home-feed');
    }
    setShowCreationMenu(false);
  };

  // ADDED: Handle Messages Click
  const handleMessagesClick = () => {
    navigate('/inbox');
    setShowCreationMenu(false);
  };

  const handleCreateClick = (type?: 'scene' | 'monologue' | 'character' | 'frame') => {
    if (type) {
      setShowCreationMenu(false);
      navigate(`/compose-${type}`);
    } else {
      setShowCreationMenu(!showCreationMenu);
    }
  };

  const handleProfileClick = () => {
    if (user?.id) {
      navigate(`/profile/${user.id}`);
    }
    setShowCreationMenu(false);
  };

  const isActive = (path: string) => location.pathname === path;

  // FIXED: Only highlight profile when viewing own profile
  const isOwnProfileActive = location.pathname === `/profile/${user?.id}`;

  // Creation options data
  const creationOptions = [
    { 
      type: 'scene' as const, 
      label: 'Write a Scene', 
      description: 'Craft cinematic moments and memories',
      icon: <SceneIcon />, 
      color: 'var(--color-scene)' 
    },
    { 
      type: 'monologue' as const, 
      label: 'Write a Monologue', 
      description: 'Express inner thoughts and poetic prose',
      icon: <MonologueIcon />, 
      color: 'var(--color-monologue)' 
    },
    { 
      type: 'character' as const, 
      label: 'Create a Character', 
      description: 'Build compelling personas and backstories',
      icon: <CharacterIcon />, 
      color: 'var(--color-character)' 
    },
    { 
      type: 'frame' as const, 
      label: 'Create a Cinematic Frame', 
      description: 'Curate visual inspiration and mood boards',
      icon: <FrameIcon />, 
      color: 'var(--color-frame)' 
    }
  ];

  return (
    <>
      {/* Overlay */}
      {showCreationMenu && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            zIndex: 9998,
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setShowCreationMenu(false)}
        />
      )}

      {/* Creation Menu - LIST LAYOUT */}
      {showCreationMenu && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--background-card)',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.15)',
          zIndex: 9999,
          border: '1px solid var(--border-color)',
          animation: 'slideUp 0.3s ease-out',
          width: '320px',
          maxWidth: 'calc(100vw - 40px)'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {creationOptions.map((item) => (
              <button
                key={item.type}
                onClick={() => handleCreateClick(item.type)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '16px',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'var(--background-secondary)',
                  border: `2px solid ${item.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  {item.icon}
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  flex: 1
                }}>
                  <span style={{
                    fontFamily: "'Cormorant', serif",
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    lineHeight: '1.2'
                  }}>
                    {item.label}
                  </span>
                  <span style={{
                    fontFamily: "'Cormorant', serif",
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.3',
                    fontStyle: 'italic'
                  }}>
                    {item.description}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar - UPDATED: Reduced height and centered */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--background-primary)',
        borderTop: '1px solid var(--border-color)',
        padding: '8px 0 12px', // REDUCED: Less padding for smaller height
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
        width: '375px', // ADDED: Fixed width
        maxWidth: '100vw', // ADDED: Responsive constraint
        boxSizing: 'border-box', // ADDED: Proper box model
        borderTopLeftRadius: '12px', // ADDED: Rounded corners
        borderTopRightRadius: '12px' // ADDED: Rounded corners
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          margin: '0 auto', // CHANGED: Remove maxWidth constraint
          padding: '0 20px'
        }}>
          {/* Home Button */}
          <button
            onClick={handleHomeClick}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 12px', // REDUCED: Less padding
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px', // REDUCED: Less gap
              color: isActive('/home-feed') ? 'var(--text-primary)' : 'var(--text-gray)',
              transition: 'all 0.2s ease',
              flex: 1,
              maxWidth: '70px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <HomeIcon active={isActive('/home-feed')} />
            <span style={{
              fontSize: '11px',
              fontFamily: "'Cormorant', serif",
              fontWeight: '500',
              letterSpacing: '0.5px'
            }}>
              Home
            </span>
          </button>

          {/* ADDED: Messages Button */}
          <button
            onClick={handleMessagesClick}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 12px', // REDUCED: Less padding
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px', // REDUCED: Less gap
              color: isActive('/inbox') ? 'var(--text-primary)' : 'var(--text-gray)',
              transition: 'all 0.2s ease',
              flex: 1,
              maxWidth: '70px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <MessagesIcon active={isActive('/inbox')} />
            <span style={{
              fontSize: '11px',
              fontFamily: "'Cormorant', serif",
              fontWeight: '500',
              letterSpacing: '0.5px'
            }}>
              Messages
            </span>
          </button>

          {/* Create Button */}
          <button
            onClick={() => handleCreateClick()}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 12px', // REDUCED: Less padding
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px', // REDUCED: Less gap
              color: showCreationMenu ? 'var(--text-primary)' : 'var(--text-gray)',
              transition: 'all 0.2s ease',
              flex: 1,
              maxWidth: '70px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <CreateIcon active={showCreationMenu} />
            <span style={{
              fontSize: '11px',
              fontFamily: "'Cormorant', serif",
              fontWeight: '500',
              letterSpacing: '0.5px'
            }}>
              Create
            </span>
          </button>

          {/* Profile Button - FIXED: Only highlight when viewing own profile */}
          <button
            onClick={handleProfileClick}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 12px', // REDUCED: Less padding
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px', // REDUCED: Less gap
              color: isOwnProfileActive ? 'var(--text-primary)' : 'var(--text-gray)',
              transition: 'all 0.2s ease',
              flex: 1,
              maxWidth: '70px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ProfileIcon active={isOwnProfileActive} />
            <span style={{
              fontSize: '11px',
              fontFamily: "'Cormorant', serif",
              fontWeight: '500',
              letterSpacing: '0.5px'
            }}>
              Profile
            </span>
          </button>
        </div>
      </nav>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateX(-50%) translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }
        `}
      </style>
    </>
  );
};

export default BottomNav;