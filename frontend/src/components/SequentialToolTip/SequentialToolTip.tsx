// src/components/SequentialTooltip/SequentialTooltip.tsx - FIXED VERSION
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSequentialTour } from '../../hooks/useSequentialTour';

interface SequentialTooltipProps {
  // Optional: Override colors or styles
  primaryColor?: string;
  secondaryColor?: string;
}

const SequentialTooltip: React.FC<SequentialTooltipProps> = ({
  primaryColor = '#8B5CF6',
  secondaryColor = '#1A1A1A'
}) => {
  const {
    currentStep,
    isTourActive,
    isTransitioning,
    currentStepIndex,
    totalSteps,
    progress,
    nextStep,
    prevStep,
    skipTour,
    shouldShowCurrentStep,
    getTargetElement,
    getElementPosition,
    highlightElement
  } = useSequentialTour();

  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [elementPosition, setElementPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipDirection, setTooltipDirection] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const [isVisible, setIsVisible] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  
  const tooltipRef = useRef<HTMLDivElement>(null);
  const cleanupHighlightRef = useRef<(() => void) | null>(null);

  // Calculate tooltip position based on target element and screen boundaries
  const calculateOptimalPosition = useCallback((rect: DOMRect, tooltipWidth: number, tooltipHeight: number) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    const elementTop = rect.top + scrollTop;
    const elementLeft = rect.left + scrollLeft;
    const elementBottom = elementTop + rect.height;
    const elementRight = elementLeft + rect.width;
    
    // Define safe margins from screen edges
    const margin = 16;
    const arrowSize = 12;
    
    // Try different positions in order of preference
    const positionOptions = [
      {
        direction: 'top' as const,
        top: elementTop - tooltipHeight - arrowSize - margin,
        left: elementLeft + (rect.width / 2) - (tooltipWidth / 2),
        condition: elementTop - tooltipHeight - arrowSize - margin > margin
      },
      {
        direction: 'bottom' as const,
        top: elementBottom + arrowSize + margin,
        left: elementLeft + (rect.width / 2) - (tooltipWidth / 2),
        condition: elementBottom + tooltipHeight + arrowSize + margin < viewportHeight + scrollTop - margin
      },
      {
        direction: 'right' as const,
        top: elementTop + (rect.height / 2) - (tooltipHeight / 2),
        left: elementRight + arrowSize + margin,
        condition: elementRight + tooltipWidth + arrowSize + margin < viewportWidth + scrollLeft - margin
      },
      {
        direction: 'left' as const,
        top: elementTop + (rect.height / 2) - (tooltipHeight / 2),
        left: elementLeft - tooltipWidth - arrowSize - margin,
        condition: elementLeft - tooltipWidth - arrowSize - margin > margin
      }
    ];

    // Find first valid position
    const validPosition = positionOptions.find(pos => pos.condition);
    
    if (validPosition) {
      // Adjust to ensure tooltip stays within viewport
      let adjustedLeft = validPosition.left;
      let adjustedTop = validPosition.top;
      
      // Horizontal boundary check
      if (adjustedLeft < margin) {
        adjustedLeft = margin;
      } else if (adjustedLeft + tooltipWidth > viewportWidth + scrollLeft - margin) {
        adjustedLeft = viewportWidth + scrollLeft - tooltipWidth - margin;
      }
      
      // Vertical boundary check
      if (adjustedTop < margin) {
        adjustedTop = margin;
      } else if (adjustedTop + tooltipHeight > viewportHeight + scrollTop - margin) {
        adjustedTop = viewportHeight + scrollTop - tooltipHeight - margin;
      }
      
      return {
        top: adjustedTop,
        left: adjustedLeft,
        direction: validPosition.direction
      };
    }
    
    // Fallback: center on screen
    return {
      top: viewportHeight / 2 + scrollTop - tooltipHeight / 2,
      left: viewportWidth / 2 + scrollLeft - tooltipWidth / 2,
      direction: 'top' as const
    };
  }, []);

  // Update tooltip position when target changes
  useEffect(() => {
    if (!isTourActive || !currentStep || !shouldShowCurrentStep()) {
      setIsVisible(false);
      setIsPositioned(false);
      return;
    }

    // Wait for DOM to be ready and element to exist
    const timer = setTimeout(() => {
      const element = getTargetElement();
      setTargetElement(element);
      
      if (element) {
        // Highlight the element
        if (cleanupHighlightRef.current) {
          cleanupHighlightRef.current();
        }
        
        const cleanup = highlightElement(element);
        if (cleanup) {
          cleanupHighlightRef.current = cleanup;
        } else {
          cleanupHighlightRef.current = null;
        }
        
        // Get element position
        const position = getElementPosition(element);
        setElementPosition(position);
        
        // Calculate tooltip position on next frame
        requestAnimationFrame(() => {
          if (tooltipRef.current) {
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            
            const optimalPosition = calculateOptimalPosition(
              elementRect,
              tooltipRect.width,
              tooltipRect.height
            );
            
            setTooltipPosition({
              top: optimalPosition.top,
              left: optimalPosition.left
            });
            setTooltipDirection(optimalPosition.direction);
            setIsPositioned(true);
          }
        });
        
        // Scroll element into view if needed
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
        
        setIsVisible(true);
      }
    }, 100); // Small delay to ensure DOM is ready

    return () => {
      clearTimeout(timer);
      if (cleanupHighlightRef.current) {
        cleanupHighlightRef.current();
        cleanupHighlightRef.current = null;
      }
    };
  }, [currentStep, isTourActive, shouldShowCurrentStep, getTargetElement, highlightElement, getElementPosition, calculateOptimalPosition]);

  // Handle window resize and scroll
  useEffect(() => {
    if (!isTourActive || !targetElement || !isPositioned) return;

    const handleReposition = () => {
      if (targetElement && tooltipRef.current) {
        const elementRect = targetElement.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        
        const optimalPosition = calculateOptimalPosition(
          elementRect,
          tooltipRect.width,
          tooltipRect.height
        );
        
        setTooltipPosition({
          top: optimalPosition.top,
          left: optimalPosition.left
        });
        setTooltipDirection(optimalPosition.direction);
      }
    };

    // Throttle repositioning
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleReposition, 250);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleReposition, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleReposition);
      clearTimeout(resizeTimer);
    };
  }, [isTourActive, targetElement, isPositioned, calculateOptimalPosition]);

  // Don't render if tour isn't active or no current step
  if (!isTourActive || !currentStep || !isVisible || isTransitioning) {
    return null;
  }

  // Don't render if we shouldn't show this step on current page
  if (!shouldShowCurrentStep()) {
    return null;
  }

  // Progress dots for all steps
  const renderProgressDots = () => {
    return Array.from({ length: totalSteps }).map((_, index) => (
      <div
        key={index}
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: index + 1 === currentStepIndex ? primaryColor : 'rgba(255, 255, 255, 0.2)',
          transition: 'background-color 0.3s ease',
          margin: '0 2px'
        }}
      />
    ));
  };

  // Arrow based on direction
  const renderArrow = () => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid'
    };

    switch (tooltipDirection) {
      case 'top':
        return (
          <div style={{
            ...baseStyle,
            bottom: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '12px 8px 0 8px',
            borderColor: `${secondaryColor} transparent transparent transparent`
          }} />
        );
      case 'bottom':
        return (
          <div style={{
            ...baseStyle,
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '0 8px 12px 8px',
            borderColor: `transparent transparent ${secondaryColor} transparent`
          }} />
        );
      case 'left':
        return (
          <div style={{
            ...baseStyle,
            right: '-12px',
            top: '50%',
            transform: 'translateY(-50%)',
            borderWidth: '8px 0 8px 12px',
            borderColor: `transparent transparent transparent ${secondaryColor}`
          }} />
        );
      case 'right':
        return (
          <div style={{
            ...baseStyle,
            left: '-12px',
            top: '50%',
            transform: 'translateY(-50%)',
            borderWidth: '8px 12px 8px 0',
            borderColor: `transparent ${secondaryColor} transparent transparent`
          }} />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Overlay with cutout for target element */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 9990,
          pointerEvents: 'none',
          opacity: isPositioned ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      >
        {/* Cutout for target element */}
        {targetElement && isPositioned && (
          <div
            style={{
              position: 'absolute',
              top: `${elementPosition.top}px`,
              left: `${elementPosition.left}px`,
              width: `${elementPosition.width}px`,
              height: `${elementPosition.height}px`,
              borderRadius: '8px',
              boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.7)`,
              animation: 'pulseCutout 2s infinite'
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          position: 'absolute',
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          backgroundColor: secondaryColor,
          color: '#FFFFFF',
          borderRadius: '16px',
          padding: '20px',
          maxWidth: '300px',
          minWidth: '280px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 9991,
          opacity: isPositioned ? 1 : 0,
          transform: isPositioned ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          pointerEvents: 'auto'
        }}
      >
        {/* Arrow */}
        {renderArrow()}

        {/* Header with step counter */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '12px'
        }}>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '18px',
            fontWeight: 700,
            color: '#FFFFFF',
            margin: 0,
            lineHeight: 1.3
          }}>
            {currentStep.message}
          </h3>
          
          <div style={{
            fontSize: '14px',
            color: primaryColor,
            fontWeight: 600,
            fontFamily: "'Cormorant', serif",
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            padding: '4px 8px',
            borderRadius: '12px',
            marginLeft: '8px',
            flexShrink: 0
          }}>
            {currentStepIndex}/{totalSteps}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          height: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '2px',
          marginBottom: '20px',
          overflow: 'hidden'
        }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: primaryColor,
              borderRadius: '2px',
              transition: 'width 0.3s ease'
            }}
          />
        </div>

        {/* Progress dots */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          {renderProgressDots()}
        </div>

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div>
            {currentStepIndex > 1 && (
              <button
                onClick={prevStep}
                disabled={isTransitioning}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#9CA3AF',
                  fontSize: '14px',
                  fontFamily: "'Cormorant', serif",
                  fontWeight: 600,
                  cursor: isTransitioning ? 'default' : 'pointer',
                  opacity: isTransitioning ? 0.7 : 1,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isTransitioning) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                ← Back
              </button>
            )}
          </div>

          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}>
            <button
              onClick={skipTour}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#9CA3AF',
                fontSize: '14px',
                fontFamily: "'Cormorant', serif",
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Skip Tour
            </button>

            <button
              onClick={nextStep}
              disabled={isTransitioning}
              style={{
                padding: '10px 20px',
                background: `linear-gradient(135deg, ${primaryColor} 0%, #EC4899 100%)`,
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontFamily: "'Cormorant', serif",
                fontWeight: 600,
                cursor: isTransitioning ? 'default' : 'pointer',
                opacity: isTransitioning ? 0.7 : 1,
                transition: 'all 0.2s ease',
                minWidth: '100px'
              }}
              onMouseEnter={(e) => {
                if (!isTransitioning) {
                  e.currentTarget.style.opacity = '0.9';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = isTransitioning ? '0.7' : '1';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {currentStepIndex === totalSteps ? 'Finish Tour' : 'Next →'}
            </button>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes pulseCutout {
            0% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7); }
            50% { box-shadow: 0 0 0 9999px rgba(139, 92, 246, 0.2); }
            100% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7); }
          }
        `}
      </style>
    </>
  );
};

export default SequentialTooltip;