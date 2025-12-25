// components/Tour/TourTooltip.tsx
import React from 'react';

interface TourTooltipProps {
  targetElement: HTMLElement | null;
  title: string;
  description: string;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onComplete?: () => void;
}

const TourTooltip: React.FC<TourTooltipProps> = ({
  targetElement,
  title,
  description,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  onComplete
}) => {
  // Don't render if no target element
  if (!targetElement) return null;

  // Calculate position relative to target element
  const getTooltipPosition = () => {
    if (!targetElement) return { top: 0, left: 0 };
    
    const rect = targetElement.getBoundingClientRect();
    
    // Position above the button with some spacing
    return {
      top: rect.top - 10, // 10px above the element
      left: rect.left + (rect.width / 2) // Center horizontally
    };
  };

  const position = getTooltipPosition();
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <>
      {/* Background overlay - dims everything except target */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 9998,
          pointerEvents: 'none' // Allows clicks through, but we'll handle this differently
        }}
      />
      
      {/* Highlight ring around target element */}
      <div
        style={{
          position: 'fixed',
          top: position.top - 8, // Extend beyond element
          left: position.left - (targetElement.offsetWidth / 2) - 8,
          width: targetElement.offsetWidth + 16,
          height: targetElement.offsetHeight + 16,
          borderRadius: '16px',
          border: '3px solid #FFFFFF',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 255, 255, 0.5)',
          zIndex: 9998,
          pointerEvents: 'none',
          animation: 'pulse 2s infinite'
        }}
      />

      {/* Tooltip container - positioned above target */}
      <div
        style={{
          position: 'fixed',
          top: `${position.top - 130}px`, // Position above the highlight
          left: `${position.left}px`,
          transform: 'translateX(-50%)',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '20px',
          width: '280px',
          maxWidth: 'calc(100vw - 40px)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.25)',
          zIndex: 9999,
          fontFamily: "'Cormorant', serif",
          boxSizing: 'border-box'
        }}
      >
        {/* Arrow pointing down to target */}
        <div
          style={{
            position: 'absolute',
            bottom: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '10px solid #FFFFFF'
          }}
        />

        {/* Content */}
        <div style={{ marginBottom: '16px' }}>
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#1A1A1A',
              margin: '0 0 8px 0',
              lineHeight: 1.3
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: '15px',
              color: '#55524F',
              lineHeight: 1.4,
              margin: 0
            }}
          >
            {description}
          </p>
        </div>

        {/* Progress indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '6px'
            }}
          >
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: index === currentStep ? '#1A1A1A' : '#E5E7EB',
                  transition: 'background-color 0.3s ease'
                }}
              />
            ))}
          </div>
          <span
            style={{
              fontSize: '12px',
              color: '#9CA3AF',
              fontFamily: "'Cormorant', serif"
            }}
          >
            {currentStep + 1} of {totalSteps}
          </span>
        </div>

        {/* Navigation buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          {/* Skip button - left aligned */}
          <button
            onClick={onSkip}
            style={{
              background: 'none',
              border: 'none',
              color: '#6B7280',
              fontSize: '14px',
              fontFamily: "'Cormorant', serif",
              cursor: 'pointer',
              padding: '6px 0',
              fontWeight: 500
            }}
          >
            Skip Tour
          </button>

          {/* Navigation buttons - right aligned */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {currentStep > 0 && (
              <button
                onClick={onBack}
                style={{
                  padding: '8px 16px',
                  background: '#F3F4F6',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  color: '#4B5563',
                  fontSize: '14px',
                  fontFamily: "'Cormorant', serif",
                  fontWeight: 500,
                  cursor: 'pointer',
                  minWidth: '70px'
                }}
              >
                Back
              </button>
            )}
            <button
              onClick={isLastStep ? onComplete || onNext : onNext}
              style={{
                padding: '8px 16px',
                background: '#1A1A1A',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontFamily: "'Cormorant', serif",
                fontWeight: 600,
                cursor: 'pointer',
                minWidth: '70px'
              }}
            >
              {isLastStep ? 'Got it!' : 'Next'}
            </button>
          </div>
        </div>
      </div>

      {/* CSS for pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 255, 255, 0.5); }
            50% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 255, 255, 0.8); }
            100% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 255, 255, 0.5); }
          }
        `}
      </style>
    </>
  );
};

export default TourTooltip;