// components/Tour/TourTooltip.tsx
import React, { useEffect, useState } from 'react';

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
  const [position, setPosition] = useState({ top: 0, left: 0, arrowPosition: 'bottom' as const });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!targetElement) return;

    const calculatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      const appWidth = 375; // Your app's fixed width
      const viewportWidth = window.innerWidth;
      
      // Calculate centered position within 375px container
      const centerX = (viewportWidth - appWidth) / 2 + rect.left + (rect.width / 2);
      
      // Position tooltip ABOVE the button (not overlapping)
      const tooltipTop = rect.top - 160; // Higher up to avoid BottomNav overlap
      
      // Ensure tooltip stays within bounds
      const tooltipWidth = 280;
      let tooltipLeft = centerX - (tooltipWidth / 2);
      
      // Clamp to screen edges
      const minLeft = (viewportWidth - appWidth) / 2 + 20;
      const maxLeft = minLeft + appWidth - tooltipWidth - 20;
      
      tooltipLeft = Math.max(minLeft, Math.min(tooltipLeft, maxLeft));

      setPosition({
        top: tooltipTop,
        left: tooltipLeft,
        arrowPosition: 'bottom'
      });
      
      // Show with slight delay for smooth animation
      setTimeout(() => setIsVisible(true), 50);
    };

    calculatePosition();
    
    // Recalculate on resize
    window.addEventListener('resize', calculatePosition);
    return () => window.removeEventListener('resize', calculatePosition);
  }, [targetElement]);

  if (!targetElement) return null;

  const isLastStep = currentStep === totalSteps - 1;
  const tooltipWidth = 280;

  return (
    <>
      {/* Dark overlay - covers entire screen but allows clicks through */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 9997,
          pointerEvents: 'none' // IMPORTANT: Allows clicks to pass through
        }}
      />

      {/* Highlight ring around target */}
      <div
        style={{
          position: 'fixed',
          top: position.top + 150, // Position below tooltip
          left: position.left + (tooltipWidth / 2) - (targetElement.offsetWidth / 2) - 8,
          width: targetElement.offsetWidth + 16,
          height: targetElement.offsetHeight + 16,
          borderRadius: '16px',
          border: '3px solid #FFFFFF',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
          zIndex: 9998,
          pointerEvents: 'none',
          animation: 'pulse 2s infinite',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* Tooltip Container */}
      <div
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: `${tooltipWidth}px`,
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.25)',
          zIndex: 9999,
          fontFamily: "'Cormorant', serif",
          boxSizing: 'border-box',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease'
        }}
      >
        {/* Arrow pointing down to target */}
        <div
          style={{
            position: 'absolute',
            [position.arrowPosition]: '-10px',
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
          <div style={{ display: 'flex', gap: '6px' }}>
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
          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
            {currentStep + 1} of {totalSteps}
          </span>
        </div>

        {/* Navigation buttons - FIXED: Ensure they're visible */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
          }}
        >
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
              fontWeight: 500,
              whiteSpace: 'nowrap'
            }}
          >
            Skip Tour
          </button>

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
                  minWidth: '60px'
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
                minWidth: '60px'
              }}
            >
              {isLastStep ? 'Got it!' : 'Next'}
            </button>
          </div>
        </div>
      </div>

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