// src/components/Tour/ProfileTourTooltip.tsx
import React, { useEffect, useState } from 'react';

interface ProfileTourTooltipProps {
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

const ProfileTourTooltip: React.FC<ProfileTourTooltipProps> = ({
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
  const [position, setPosition] = useState({ 
    top: 0, 
    left: 0, 
    arrowLeft: '50%' as string | number,
    arrowPosition: 'bottom' as 'top' | 'bottom'
  });
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipDimensions, setTooltipDimensions] = useState({ width: 280, height: 180 });

  useEffect(() => {
    if (!targetElement) return;

    const calculatePosition = () => {
      const APP_WIDTH = 375;
      const TOOLTIP_WIDTH = 280;
      const TOOLTIP_HEIGHT = 180;
      const SAFE_MARGIN = 20;
      const ARROW_OFFSET = 14;
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight; // RE-ADDED: Needed for vertical positioning
      
      // Calculate app boundaries (centered in viewport)
      const appLeft = Math.max(0, (viewportWidth - APP_WIDTH) / 2);
      const appRight = appLeft + APP_WIDTH;
      
      // Get target element position
      const targetRect = targetElement.getBoundingClientRect();
      const targetCenterX = targetRect.left + (targetRect.width / 2);
      
      // Determine tooltip position based on step
      const isTopPosition = currentStep === 2 || currentStep === 3;
      
      let tooltipTop: number;
      let arrowPosition: 'top' | 'bottom';
      
      if (isTopPosition) {
        // Position tooltip BELOW target (for stats and edit button)
        tooltipTop = targetRect.bottom + 10;
        arrowPosition = 'top';
      } else {
        // Position tooltip ABOVE target (for header and tabs)
        // FIX: Check if there's enough space above, if not, position below
        const spaceAbove = targetRect.top;
        const spaceBelow = viewportHeight - targetRect.bottom;
        
        if (spaceAbove >= TOOLTIP_HEIGHT + 20) {
          // Enough space above - position above
          tooltipTop = targetRect.top - TOOLTIP_HEIGHT - 10;
          arrowPosition = 'bottom';
        } else {
          // Not enough space above - position below
          tooltipTop = targetRect.bottom + 10;
          arrowPosition = 'top';
        }
      }
      
      // Center tooltip horizontally on target
      let tooltipLeft = targetCenterX - (TOOLTIP_WIDTH / 2);
      
      // Clamp tooltip within app boundaries
      const minLeft = appLeft + SAFE_MARGIN;
      const maxLeft = appRight - TOOLTIP_WIDTH - SAFE_MARGIN;
      tooltipLeft = Math.max(minLeft, Math.min(tooltipLeft, maxLeft));
      
      // FIX: Ensure tooltip doesn't go off screen vertically
      if (tooltipTop < SAFE_MARGIN) {
        tooltipTop = SAFE_MARGIN;
        arrowPosition = 'bottom'; // If forced to top, arrow should point down
      }
      
      if (tooltipTop + TOOLTIP_HEIGHT > viewportHeight - SAFE_MARGIN) {
        tooltipTop = viewportHeight - TOOLTIP_HEIGHT - SAFE_MARGIN;
        arrowPosition = 'top'; // If forced to bottom, arrow should point up
      }
      
      // Calculate arrow position (points to target center)
      const arrowRelativeToTooltip = targetCenterX - tooltipLeft;
      
      // Clamp arrow within tooltip bounds (with padding)
      const arrowMin = ARROW_OFFSET + 10;
      const arrowMax = TOOLTIP_WIDTH - ARROW_OFFSET - 10;
      const clampedArrow = Math.max(arrowMin, Math.min(arrowRelativeToTooltip, arrowMax));
      
      setPosition({
        top: tooltipTop,
        left: tooltipLeft,
        arrowLeft: clampedArrow,
        arrowPosition
      });
      
      setTooltipDimensions({ width: TOOLTIP_WIDTH, height: TOOLTIP_HEIGHT });
      
      // Show with slight delay for smooth animation
      setTimeout(() => setIsVisible(true), 50);
    };

    calculatePosition();
    
    // Recalculate on resize and scroll
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition, true);
    
    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
    };
  }, [targetElement, currentStep]);

  if (!targetElement) return null;

  const isLastStep = currentStep === totalSteps - 1;
  const { width: TOOLTIP_WIDTH } = tooltipDimensions;

  return (
    <>
      {/* Dark overlay - covers entire screen */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 9997,
          pointerEvents: 'auto'
        }}
      />

      {/* Highlight ring around target */}
      <div
        style={{
          position: 'fixed',
          top: targetElement.getBoundingClientRect().top - 8,
          left: targetElement.getBoundingClientRect().left - 8,
          width: targetElement.offsetWidth + 16,
          height: targetElement.offsetHeight + 16,
          borderRadius: '16px',
          border: '3px solid #FFFFFF',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
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
          width: `${TOOLTIP_WIDTH}px`,
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          zIndex: 9999,
          fontFamily: "'Cormorant', serif",
          boxSizing: 'border-box',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease'
        }}
      >
        {/* Arrow pointing to target */}
        <div
          style={{
            position: 'absolute',
            [position.arrowPosition]: '-10px',
            left: `${position.arrowLeft}px`,
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: position.arrowPosition === 'bottom' ? '10px solid #FFFFFF' : 'none',
            borderBottom: position.arrowPosition === 'top' ? '10px solid #FFFFFF' : 'none'
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

        {/* Navigation buttons */}
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
            0% { 
              border-color: #FFFFFF;
              box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 0 0 rgba(255, 255, 255, 0.4);
            }
            70% { 
              border-color: #FFFFFF;
              box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 0 10px rgba(255, 255, 255, 0);
            }
            100% { 
              border-color: #FFFFFF;
              box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 0 0 rgba(255, 255, 255, 0);
            }
          }
          
          button {
            user-select: none;
            -webkit-tap-highlight-color: transparent;
          }
          
          button:active {
            opacity: 0.8;
            transform: scale(0.98);
          }
        `}
      </style>
    </>
  );
};

export default ProfileTourTooltip;