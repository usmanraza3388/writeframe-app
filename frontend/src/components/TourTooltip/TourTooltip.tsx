import React from 'react';

interface TourTooltipProps {
  targetRect: DOMRect | null;
  position: 'top' | 'bottom' | 'left' | 'right';
  title: string;
  content: string;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  showNextButton?: boolean;
  showBackButton?: boolean;
}

const TourTooltip: React.FC<TourTooltipProps> = ({
  targetRect,
  position,
  title,
  content,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  showNextButton = true,
  showBackButton = true
}) => {
  if (!targetRect) return null;

  // Calculate tooltip position based on target element
  const getTooltipPosition = () => {
    const spacing = 20;
    const tooltipWidth = 280;
    const tooltipHeight = 220;

    switch (position) {
      case 'top':
        return {
          top: targetRect.top - tooltipHeight - spacing,
          left: Math.max(
            20,
            Math.min(
              targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
              window.innerWidth - tooltipWidth - 20
            )
          ),
          arrowPosition: 'bottom',
          arrowOffset: targetRect.left + targetRect.width / 2
        };

      case 'bottom':
        return {
          top: targetRect.bottom + spacing,
          left: Math.max(
            20,
            Math.min(
              targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
              window.innerWidth - tooltipWidth - 20
            )
          ),
          arrowPosition: 'top',
          arrowOffset: targetRect.left + targetRect.width / 2
        };

      case 'left':
        return {
          top: Math.max(
            20,
            Math.min(
              targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
              window.innerHeight - tooltipHeight - 20
            )
          ),
          left: targetRect.left - tooltipWidth - spacing,
          arrowPosition: 'right',
          arrowOffset: targetRect.top + targetRect.height / 2
        };

      case 'right':
        return {
          top: Math.max(
            20,
            Math.min(
              targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
              window.innerHeight - tooltipHeight - 20
            )
          ),
          left: targetRect.right + spacing,
          arrowPosition: 'left',
          arrowOffset: targetRect.top + targetRect.height / 2
        };

      default:
        return {
          top: targetRect.bottom + spacing,
          left: Math.max(20, targetRect.left + targetRect.width / 2 - tooltipWidth / 2),
          arrowPosition: 'top',
          arrowOffset: targetRect.left + targetRect.width / 2
        };
    }
  };

  const { top, left, arrowPosition, arrowOffset } = getTooltipPosition();
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div
      style={{
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: '280px',
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        zIndex: 9999,
        pointerEvents: 'auto',
        fontFamily: "'Cormorant', serif",
        boxSizing: 'border-box'
      }}
    >
      {/* Arrow pointing to target element */}
      <div
        style={{
          position: 'absolute',
          ...(arrowPosition === 'top' && {
            top: '-8px',
            left: `${arrowOffset - left - 8}px`,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: '8px solid #FFFFFF'
          }),
          ...(arrowPosition === 'bottom' && {
            bottom: '-8px',
            left: `${arrowOffset - left - 8}px`,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #FFFFFF'
          }),
          ...(arrowPosition === 'left' && {
            left: '-8px',
            top: `${arrowOffset - top - 8}px`,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: '8px solid #FFFFFF'
          }),
          ...(arrowPosition === 'right' && {
            right: '-8px',
            top: `${arrowOffset - top - 8}px`,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderLeft: '8px solid #FFFFFF'
          })
        }}
      />

      {/* Progress Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        position: 'relative'
      }}>
        <div style={{
          flex: 1,
          height: '4px',
          background: '#F3F4F6',
          borderRadius: '2px',
          marginRight: '40px'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: '#1A1A1A',
            borderRadius: '2px',
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Step Counter */}
        <div style={{
          fontSize: '13px',
          color: '#6B7280',
          fontWeight: 500,
          fontFamily: "'Cormorant', serif",
          position: 'absolute',
          right: 0,
          top: '-6px'
        }}>
          {currentStep + 1}/{totalSteps}
        </div>
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '20px',
        fontWeight: 700,
        color: '#1A1A1A',
        margin: '0 0 8px 0',
        lineHeight: 1.3
      }}>
        {title}
      </h3>

      {/* Content */}
      <p style={{
        fontFamily: "'Cormorant', serif",
        fontSize: '16px',
        color: '#55524F',
        margin: '0 0 20px 0',
        lineHeight: 1.5
      }}>
        {content}
      </p>

      {/* Navigation Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'space-between'
      }}>
        {/* Back Button */}
        {showBackButton && currentStep > 0 && (
          <button
            onClick={onBack}
            style={{
              padding: '10px 16px',
              background: 'transparent',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              color: '#6B7280',
              fontSize: '14px',
              fontFamily: "'Cormorant', serif",
              fontWeight: 500,
              cursor: 'pointer',
              flex: 1,
              transition: 'all 0.2s ease'
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
            Back
          </button>
        )}

        {/* Skip Button (only show on first step) */}
        {currentStep === 0 && (
          <button
            onClick={onSkip}
            style={{
              padding: '10px 16px',
              background: 'transparent',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              color: '#6B7280',
              fontSize: '14px',
              fontFamily: "'Cormorant', serif",
              fontWeight: 500,
              cursor: 'pointer',
              flex: 1,
              transition: 'all 0.2s ease'
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
            Skip Tour
          </button>
        )}

        {/* Next/Complete Button */}
        {showNextButton && (
          <button
            onClick={onNext}
            style={{
              padding: '10px 16px',
              background: '#1A1A1A',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontFamily: "'Cormorant', serif",
              fontWeight: 600,
              cursor: 'pointer',
              flex: currentStep === 0 ? 2 : 1,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2D2D2D';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#1A1A1A';
            }}
          >
            {currentStep === totalSteps - 1 ? 'Finish Tour' : 'Next'}
          </button>
        )}
      </div>
    </div>
  );
};

export default TourTooltip;