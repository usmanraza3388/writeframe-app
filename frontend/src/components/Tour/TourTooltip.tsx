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
  const [position, setPosition] = useState({ 
    top: 0, 
    left: 0, 
    arrowLeft: '50%' as string | number,
    arrowPosition: 'bottom' as const 
  });
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipDimensions, setTooltipDimensions] = useState({ width: 280, height: 180 });

  useEffect(() => {
    if (!targetElement) return;

    const calculatePosition = () => {
      const APP_WIDTH = 375;
      const TOOLTIP_WIDTH = 280;
      const TOOLTIP_HEIGHT = 180;
      const BOTTOM_NAV_HEIGHT = 80;
      const SAFE_MARGIN = 20;
      const ARROW_OFFSET = 14; // Half of arrow width
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate app boundaries (centered in viewport)
      const appLeft = Math.max(0, (viewportWidth - APP_WIDTH) / 2);
      const appRight = appLeft + APP_WIDTH;
      
      // Get target button position relative to viewport
      const targetRect = targetElement.getBoundingClientRect();
      const targetCenterX = targetRect.left + (targetRect.width / 2);
      
      // Position tooltip ABOVE the target button
      let tooltipTop = targetRect.top - TOOLTIP_HEIGHT - 10; // 10px gap above button
      
      // Calculate tooltip horizontal position (centered on target)
      let tooltipLeft = targetCenterX - (TOOLTIP_WIDTH / 2);
      
      // CLAMP: Ensure tooltip stays within app boundaries
      const minLeft = appLeft + SAFE_MARGIN;
      const maxLeft = appRight - TOOLTIP_WIDTH - SAFE_MARGIN;
      tooltipLeft = Math.max(minLeft, Math.min(tooltipLeft, maxLeft));
      
      // AVOID BOTTOM NAV OVERLAP:
      // Calculate if tooltip would overlap with BottomNav area
      const bottomNavTop = viewportHeight - BOTTOM_NAV_HEIGHT;
      const tooltipBottom = tooltipTop + TOOLTIP_HEIGHT;
      
      // If tooltip would overlap BottomNav, move it higher
      if (tooltipBottom > bottomNavTop - SAFE_MARGIN) {
        // Move tooltip to a safe position above BottomNav
        tooltipTop = bottomNavTop - TOOLTIP_HEIGHT - SAFE_MARGIN * 2;
        
        // Ensure we don't go off the top of the screen
        tooltipTop = Math.max(SAFE_MARGIN, tooltipTop);
      }
      
      // Calculate arrow position (points to target button center)
      // Arrow should be centered relative to tooltip's position over the target
      const arrowRelativeToTooltip = targetCenterX - tooltipLeft;
      
      // Clamp arrow within tooltip bounds (with padding)
      const arrowMin = ARROW_OFFSET + 10; // 10px padding from left edge
      const arrowMax = TOOLTIP_WIDTH - ARROW_OFFSET - 10; // 10px padding from right edge
      const clampedArrow = Math.max(arrowMin, Math.min(arrowRelativeToTooltip, arrowMax));
      
      setPosition({
        top: tooltipTop,
        left: tooltipLeft,
        arrowLeft: clampedArrow,
        arrowPosition: 'bottom'
      });
      
      setTooltipDimensions({ width: TOOLTIP_WIDTH, height: TOOLTIP_HEIGHT });
      
      // Show with slight delay for smooth animation
      setTimeout(() => setIsVisible(true), 50);
    };

    calculatePosition();
    
    // Recalculate on resize and scroll
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition, true); // Use capture for better performance
    
    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
    };
  }, [targetElement]);

  if (!targetElement) return null;

  const isLastStep = currentStep === totalSteps - 1;
  const { width: TOOLTIP_WIDTH, height: TOOLTIP_HEIGHT } = tooltipDimensions;

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
          pointerEvents: 'auto' // Block interactions with background
        }}
      />

      {/* Highlight ring around target - FIXED positioning */}
      <div
        style={{
          position: 'fixed',
          top: targetElement.getBoundingClientRect().top - 8, // -8 for border
          left: targetElement.getBoundingClientRect().left - 8,
          width: targetElement.offsetWidth + 16,
          height: targetElement.offsetHeight + 16,
          borderRadius: '16px',
          border: '3px solid #FFFFFF',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)', // Extends to screen edges
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
          zIndex: 9999, // Above modal and everything else
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
            bottom: '-10px',
            left: `${position.arrowLeft}px`,
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

        {/* Navigation buttons - FIXED: Ensure they're visible and clickable */}
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
          
          /* Ensure buttons are clickable */
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

export default TourTooltip;