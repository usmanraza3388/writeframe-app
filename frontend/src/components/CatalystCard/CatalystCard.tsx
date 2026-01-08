import React from 'react';
import { useNavigate } from 'react-router-dom';

interface CatalystCardProps {
  onSelect: (type: 'scene' | 'character' | 'monologue' | 'frame', prompt: string) => void;
  onDismiss: () => void;
}

const CatalystCard: React.FC<CatalystCardProps> = ({ onSelect, onDismiss }) => {
  const navigate = useNavigate();

  const catalystOptions = [
    {
      type: 'scene' as const,
      icon: '🎬',
      title: 'Cinematic Moment',
      audience: 'For Screenwriters',
      prompt: 'A late-night confession at an empty train station',
      description: 'Start with dialogue • Visual setting • Emotional turning point',
      color: '#D4AF37'
    },
    {
      type: 'character' as const,
      icon: '👤',
      title: 'Character Portrait',
      audience: 'For Concept Artists',
      prompt: 'A librarian who can hear the whispers of unread books',
      description: 'Visual personality • Unique ability • Hidden depth',
      color: '#56CFE1'
    },
    {
      type: 'monologue' as const,
      icon: '💭',
      title: 'Internal Monologue',
      audience: 'For Filmmakers',
      prompt: 'The things I never said while watching the rain from a hospital window',
      description: 'Raw emotion • Poetic prose • Character voice',
      color: '#A855F7'
    }
  ];

  const handleOptionClick = (type: 'scene' | 'character' | 'monologue' | 'frame', prompt: string) => {
    onSelect(type, prompt);
  };

  const handleFrameClick = () => {
    // Special case for frame - no prompt needed
    onDismiss();
    navigate('/compose-frame');
  };

  return (
    <div style={containerStyle}>
      {/* Decorative background elements */}
      <div style={backgroundGlowStyle} />
      <div style={backgroundGlow2Style} />
      
      <div style={contentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={iconContainerStyle}>
            <span style={iconStyle}>✨</span>
          </div>
          <div>
            <h2 style={titleStyle}>Begin Your Creative Journey</h2>
            <p style={subtitleStyle}>
              Every great story starts with a single moment. Choose yours.
            </p>
          </div>
        </div>

        {/* Three Catalyst Options */}
        <div style={optionsContainerStyle}>
          {catalystOptions.map((option, index) => (
            <button
              key={option.type}
              onClick={() => handleOptionClick(option.type, option.prompt)}
              style={getOptionStyle(option.color)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={optionInnerStyle}>
                <div style={getOptionIconStyle(option.color)}>
                  {option.icon}
                </div>
                
                <div style={optionContentStyle}>
                  <div style={optionHeaderStyle}>
                    <div style={optionTitleStyle}>{option.title}</div>
                    <div style={getAudienceStyle(option.color)}>
                      {option.audience}
                    </div>
                  </div>
                  
                  <div style={promptStyle}>
                    "{option.prompt}"
                  </div>
                  
                  <div style={optionDescriptionStyle}>
                    <span style={{ marginRight: 4 }}>•</span>
                    {option.description}
                  </div>
                </div>
                
                <div style={arrowStyle}>
                  →
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Frame Option (Separate) */}
        <div style={frameOptionContainerStyle}>
          <button
            onClick={handleFrameClick}
            style={frameButtonStyle}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={frameIconStyle}>🖼️</div>
            <div style={frameTextStyle}>
              <div style={{ fontWeight: 600 }}>Or start with visuals</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>Create a mood board without text</div>
            </div>
            <div style={frameArrowStyle}>→</div>
          </button>
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <p style={footerTextStyle}>
            This is your creative entry point. Choose what resonates most.
          </p>
          <div style={footerNoteStyle}>
            Appears once • Your journey begins here
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onDismiss}
          style={closeButtonStyle}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// ==================== STYLES ====================

const containerStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
  borderRadius: 20,
  padding: 28,
  margin: '24px 16px',
  color: '#FFFFFF',
  position: 'relative',
  overflow: 'hidden',
  border: '1px solid rgba(212, 175, 55, 0.3)',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
  animation: 'fadeInUp 0.5s ease-out'
};

const backgroundGlowStyle: React.CSSProperties = {
  position: 'absolute',
  top: -100,
  right: -100,
  width: 200,
  height: 200,
  background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
  borderRadius: '50%',
  animation: 'pulse 4s ease-in-out infinite'
};

const backgroundGlow2Style: React.CSSProperties = {
  position: 'absolute',
  bottom: -80,
  left: -80,
  width: 160,
  height: 160,
  background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
  borderRadius: '50%'
};

const contentStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 2
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  marginBottom: 28
};

const iconContainerStyle: React.CSSProperties = {
  width: 48,
  height: 48,
  background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 24,
  boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)',
  flexShrink: 0
};

const iconStyle: React.CSSProperties = {
  display: 'block'
};

const titleStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  fontFamily: "'Playfair Display', serif",
  background: 'linear-gradient(135deg, #FFFFFF 0%, #E5E5E5 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  margin: 0,
  lineHeight: 1.2
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 14,
  opacity: 0.8,
  fontFamily: "'Cormorant', serif",
  fontStyle: 'italic',
  marginTop: 6,
  margin: 0,
  lineHeight: 1.4
};

const optionsContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16
};

const getOptionStyle = (color: string): React.CSSProperties => ({
  background: 'rgba(255, 255, 255, 0.03)',
  border: `1px solid rgba(${hexToRgb(color)}, 0.2)`,
  borderRadius: 14,
  padding: 16,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  textAlign: 'left',
  width: '100%',
  position: 'relative',
  overflow: 'hidden'
});

const optionInnerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 16
};

const getOptionIconStyle = (color: string): React.CSSProperties => ({
  width: 44,
  height: 44,
  background: `rgba(${hexToRgb(color)}, 0.1)`,
  borderRadius: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 22,
  border: `1px solid rgba(${hexToRgb(color)}, 0.3)`,
  flexShrink: 0
});

const optionContentStyle: React.CSSProperties = {
  flex: 1,
  textAlign: 'left'
};

const optionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 8
};

const optionTitleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  fontFamily: "'Cormorant', serif",
  color: '#FFFFFF'
};

const getAudienceStyle = (color: string): React.CSSProperties => ({
  fontSize: 10,
  background: `rgba(${hexToRgb(color)}, 0.2)`,
  color: color,
  padding: '2px 8px',
  borderRadius: 10,
  fontWeight: 500,
  whiteSpace: 'nowrap'
});

const promptStyle: React.CSSProperties = {
  fontSize: 14,
  opacity: 0.9,
  fontStyle: 'italic',
  marginBottom: 8,
  lineHeight: 1.4,
  fontFamily: "'Cormorant', serif",
  color: '#FFFFFF'
};

const optionDescriptionStyle: React.CSSProperties = {
  fontSize: 11,
  opacity: 0.6,
  display: 'flex',
  alignItems: 'center',
  fontFamily: "'Cormorant', serif",
  color: '#FFFFFF'
};

const arrowStyle: React.CSSProperties = {
  fontSize: 20,
  opacity: 0.5,
  transform: 'rotate(-45deg)',
  alignSelf: 'center',
  marginLeft: 8
};

const frameOptionContainerStyle: React.CSSProperties = {
  marginTop: 20,
  paddingTop: 20,
  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
};

const frameButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 12,
  padding: '12px 16px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  width: '100%',
  color: '#FFFFFF'
};

const frameIconStyle: React.CSSProperties = {
  fontSize: 24,
  opacity: 0.8
};

const frameTextStyle: React.CSSProperties = {
  flex: 1,
  textAlign: 'left',
  fontFamily: "'Cormorant', serif"
};

const frameArrowStyle: React.CSSProperties = {
  fontSize: 18,
  opacity: 0.6
};

const footerStyle: React.CSSProperties = {
  marginTop: 28,
  paddingTop: 20,
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  textAlign: 'center'
};

const footerTextStyle: React.CSSProperties = {
  fontSize: 13,
  opacity: 0.7,
  fontFamily: "'Cormorant', serif",
  fontStyle: 'italic',
  margin: 0,
  lineHeight: 1.5
};

const footerNoteStyle: React.CSSProperties = {
  fontSize: 11,
  opacity: 0.5,
  fontFamily: "'Cormorant', serif",
  fontStyle: 'italic',
  marginTop: 6
};

const closeButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: 16,
  right: 16,
  background: 'rgba(255, 255, 255, 0.1)',
  border: 'none',
  width: 32,
  height: 32,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#FFFFFF',
  cursor: 'pointer',
  fontSize: 20,
  transition: 'all 0.2s ease',
  zIndex: 10
};

// Helper function to convert hex to rgb
const hexToRgb = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
};

// Add CSS animations
const catalystStyles = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}

/* Inject styles */
const style = document.createElement('style');
style.textContent = catalystStyles;
document.head.appendChild(style);
`;

export default CatalystCard;