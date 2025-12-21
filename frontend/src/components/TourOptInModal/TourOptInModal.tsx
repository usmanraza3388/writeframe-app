import React from 'react';

interface TourOptInModalProps {
  isOpen: boolean;
  onAccept: () => void; // User chooses "Take Tour"
  onDecline: () => void; // User chooses "Explore Myself"
}

const TourOptInModal: React.FC<TourOptInModalProps> = ({
  isOpen,
  onAccept,
  onDecline
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '375px',
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '32px 24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        boxSizing: 'border-box',
        textAlign: 'center'
      }}>
        {/* Title */}
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '24px',
          fontWeight: 700,
          color: '#1A1A1A',
          margin: '0 0 12px 0',
          lineHeight: 1.3
        }}>
          Take a Quick Tour?
        </h2>

        {/* Description */}
        <p style={{
          fontFamily: "'Cormorant', serif",
          fontSize: '18px',
          color: '#55524F',
          margin: '0 0 28px 0',
          lineHeight: 1.5
        }}>
          Get a guided walkthrough of writeFrame's key features in 2 minutes, or explore on your own.
        </p>

        {/* Option 1: Take Tour */}
        <button
          onClick={onAccept}
          style={{
            width: '100%',
            padding: '16px 20px',
            background: '#1A1A1A',
            border: 'none',
            borderRadius: '12px',
            color: '#FFFFFF',
            fontSize: '16px',
            fontFamily: "'Cormorant', serif",
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '12px',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2D2D2D';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1A1A1A';
          }}
        >
          Yes, Take the Tour
        </button>

        {/* Option 2: Explore Myself */}
        <button
          onClick={onDecline}
          style={{
            width: '100%',
            padding: '16px 20px',
            background: 'transparent',
            border: '1px solid #D1D5DB',
            borderRadius: '12px',
            color: '#6B7280',
            fontSize: '15px',
            fontFamily: "'Cormorant', serif",
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#FAF8F2';
            e.currentTarget.style.borderColor = '#9CA3AF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = '#D1D5DB';
          }}
        >
          No, I'll Explore Myself
        </button>

        {/* Note */}
        <div style={{
          marginTop: '16px',
          fontSize: '13px',
          color: '#9CA3AF',
          fontFamily: "'Cormorant', serif",
          fontStyle: 'italic'
        }}>
          You can always start the tour later from Settings
        </div>
      </div>
    </div>
  );
};

export default TourOptInModal;