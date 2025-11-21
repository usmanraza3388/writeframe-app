// src/pages/StudioReadyGuide.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudioReadyGuide: React.FC = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    // Mark onboarding as complete
    localStorage.setItem('writeframe_onboarding_complete', 'true');
    navigate('/home-feed');
  };

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

  const creationOptions = [
    { 
      type: 'scene' as const, 
      label: 'Write a Scene', 
      description: 'Craft cinematic moments and memories',
      icon: <SceneIcon />, 
      color: '#8B5CF6' // Purple
    },
    { 
      type: 'monologue' as const, 
      label: 'Write a Monologue', 
      description: 'Express inner thoughts and poetic prose',
      icon: <MonologueIcon />, 
      color: '#EC4899' // Pink
    },
    { 
      type: 'character' as const, 
      label: 'Create a Character', 
      description: 'Build compelling personas and backstories',
      icon: <CharacterIcon />, 
      color: '#10B981' // Green
    },
    { 
      type: 'frame' as const, 
      label: 'Create a Cinematic Frame', 
      description: 'Curate visual inspiration and mood boards',
      icon: <FrameIcon />, 
      color: '#F59E0B' // Amber
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#EFEFEF',
    }}>
      <div style={{
        width: 375,
        minHeight: 812,
        background: '#FAFAFA',
        borderRadius: 18,
        padding: '60px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box',
      }}>
        {/* Header Section */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: 40 
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            🎬
          </div>
          
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            fontWeight: 700,
            color: '#1F1F1F',
            textAlign: 'center',
            marginBottom: 8,
          }}>
            Your Studio is Ready
          </h1>
          
          <p style={{
            fontFamily: "'Cormorant', serif",
            fontSize: 18,
            color: '#4B4B4B',
            textAlign: 'center',
            lineHeight: 1.4,
            margin: 0,
          }}>
            Start building your cinematic portfolio
          </p>
        </div>

        {/* Creation Options Preview */}
        <div style={{
          width: '100%',
          marginBottom: 40,
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            {creationOptions.map((item) => (
              <div
                key={item.type}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16,
                  padding: '16px',
                  background: '#FFFFFF',
                  borderRadius: 12,
                  border: '1px solid #E5E5E5',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: '#FAF8F2',
                  border: `2px solid ${item.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1A1A1A',
                  flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  flex: 1,
                }}>
                  <span style={{
                    fontFamily: "'Cormorant', serif",
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#1A1A1A',
                    lineHeight: 1.2
                  }}>
                    {item.label}
                  </span>
                  <span style={{
                    fontFamily: "'Cormorant', serif",
                    fontSize: 13,
                    color: '#6B7280',
                    lineHeight: 1.3,
                    fontStyle: 'italic'
                  }}>
                    {item.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Single CTA Button */}
        <button
          onClick={handleContinue}
          style={{
            width: '100%',
            padding: '14px 20px',
            background: '#1A1A1A',
            color: '#FFFFFF',
            fontSize: 20,
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
            fontFamily: "'Cormorant', serif",
            fontWeight: 600,
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2A2A2A';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1A1A1A';
          }}
        >
          Start Exploring
        </button>
      </div>
    </div>
  );
};

export default StudioReadyGuide;