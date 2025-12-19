// src/components/OptInTourModal/OptInTourModal.tsx
import React from 'react';

interface OptInTourModalProps {
  isOpen: boolean;
  onChoice: (choice: 'tour' | 'explore') => void;
}

const OptInTourModal: React.FC<OptInTourModalProps> = ({ isOpen, onChoice }) => {
  if (!isOpen) return null;

  const handleTourChoice = (choice: 'tour' | 'explore') => {
    // Save choice to localStorage
    localStorage.setItem('writeframe_tour_choice', choice);
    localStorage.setItem('writeframe_tour_available', 'true'); // For replay option
    
    // Trigger parent callback
    onChoice(choice);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: '#1A1A1A',
        borderRadius: '24px',
        padding: '40px 32px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
        color: '#FFFFFF'
      }}>
        {/* Cinematic Icon */}
        <div style={{
          fontSize: '64px',
          marginBottom: '24px',
          animation: 'float 3s ease-in-out infinite'
        }}>
          🎬
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '28px',
          fontWeight: 700,
          color: '#FFFFFF',
          margin: '0 0 16px 0',
          lineHeight: 1.3
        }}>
          Take a Quick Tour?
        </h2>

        {/* Description */}
        <p style={{
          fontFamily: "'Cormorant', serif",
          fontSize: '18px',
          color: '#D1D5DB',
          margin: '0 0 40px 0',
          lineHeight: 1.6
        }}>
          We can guide you through the app in 2 minutes, 
          or you can explore on your own.
        </p>

        {/* Options Container */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {/* Tour Option */}
          <button
            onClick={() => handleTourChoice('tour')}
            style={{
              width: '100%',
              padding: '20px 24px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              border: 'none',
              borderRadius: '16px',
              color: '#FFFFFF',
              fontSize: '18px',
              fontFamily: "'Cormorant', serif",
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span>🎥 Yes, Show Me Around</span>
            <small style={{
              fontSize: '14px',
              opacity: 0.9,
              fontWeight: 400
            }}>
              2-minute guided tour
            </small>
          </button>

          {/* Explore Option */}
          <button
            onClick={() => handleTourChoice('explore')}
            style={{
              width: '100%',
              padding: '20px 24px',
              background: 'transparent',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              color: '#FFFFFF',
              fontSize: '18px',
              fontFamily: "'Cormorant', serif",
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>🔍 I'll Explore Myself</span>
            <small style={{
              fontSize: '14px',
              opacity: 0.9,
              fontWeight: 400
            }}>
              Skip the tour
            </small>
          </button>
        </div>

        {/* Footnote */}
        <p style={{
          fontFamily: "'Cormorant', serif",
          fontSize: '14px',
          color: '#9CA3AF',
          fontStyle: 'italic',
          margin: 0,
          lineHeight: 1.5
        }}>
          You can always access the tour later in Settings.
        </p>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
        `}
      </style>
    </div>
  );
};

export default OptInTourModal;