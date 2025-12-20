// src/components/TourOptInModal/TourOptInModal.tsx
import React from 'react';

interface TourOptInModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onClose?: () => void; // Optional if you want an X button
}

const TourOptInModal: React.FC<TourOptInModalProps> = ({
  isOpen,
  onAccept,
  onDecline,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10002, // INCREASED: Was 10000, now 10002 to ensure above GettingStartedModal (9999)
      padding: '20px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '32px 28px',
        maxWidth: '375px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        border: '1px solid rgba(0, 0, 0, 0.08)'
      }}>
        {/* Optional Close Button - top right */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#9CA3AF',
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        )}

        {/* Icon/Visual */}
        <div style={{
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '12px'
          }}>
            🎬
          </div>
          <div style={{
            width: '60px',
            height: '4px',
            background: 'linear-gradient(90deg, #1A1A1A 0%, #4B5563 100%)',
            borderRadius: '2px',
            margin: '0 auto'
          }} />
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '24px',
          fontWeight: 700,
          color: '#1A1A1A',
          textAlign: 'center',
          margin: '0 0 16px 0',
          lineHeight: 1.3
        }}>
          Take a Quick Tour?
        </h2>

        {/* Description */}
        <div style={{
          marginBottom: '28px'
        }}>
          <p style={{
            fontFamily: "'Cormorant', serif",
            fontSize: '18px',
            color: '#55524F',
            textAlign: 'center',
            margin: '0 0 16px 0',
            lineHeight: 1.5
          }}>
            Let us guide you through writeFrame's key features so you can start creating immediately.
          </p>
          
          <div style={{
            background: '#FAF8F2',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: 'rgba(26, 26, 26, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '14px'
              }}>
                1
              </div>
              <div style={{
                fontFamily: "'Cormorant', serif",
                fontSize: '15px',
                color: '#4B5563',
                lineHeight: 1.4
              }}>
                <span style={{ fontWeight: 600, color: '#1A1A1A' }}>Interactive tips</span> appear as you explore
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: 'rgba(26, 26, 26, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '14px'
              }}>
                2
              </div>
              <div style={{
                fontFamily: "'Cormorant', serif",
                fontSize: '15px',
                color: '#4B5563',
                lineHeight: 1.4
              }}>
                <span style={{ fontWeight: 600, color: '#1A1A1A' }}>Learn by doing</span> - tips guide your actual actions
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: 'rgba(26, 26, 26, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '14px'
              }}>
                3
              </div>
              <div style={{
                fontFamily: "'Cormorant', serif",
                fontSize: '15px',
                color: '#4B5563',
                lineHeight: 1.4
              }}>
                <span style={{ fontWeight: 600, color: '#1A1A1A' }}>Skip anytime</span> - explore at your own pace
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <button
            onClick={onAccept}
            style={{
              padding: '16px 24px',
              background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#FFFFFF',
              fontSize: '16px',
              fontFamily: "'Cormorant', serif",
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(26, 26, 26, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(26, 26, 26, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 26, 26, 0.2)';
            }}
          >
            Yes, Show Me Around
          </button>
          
          <button
            onClick={onDecline}
            style={{
              padding: '14px 24px',
              background: 'transparent',
              border: '1.5px solid #D1D5DB',
              borderRadius: '12px',
              color: '#6B7280',
              fontSize: '15px',
              fontFamily: "'Cormorant', serif",
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F9FAFB';
              e.currentTarget.style.borderColor = '#9CA3AF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#D1D5DB';
            }}
          >
            No Thanks, I'll Explore Myself
          </button>
          
          {/* Optional footnote */}
          <p style={{
            fontFamily: "'Cormorant', serif",
            fontSize: '13px',
            color: '#9CA3AF',
            textAlign: 'center',
            margin: '8px 0 0 0',
            fontStyle: 'italic'
          }}>
            You can enable the tour later in Settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default TourOptInModal;