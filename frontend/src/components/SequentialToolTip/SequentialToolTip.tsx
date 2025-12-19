// src/components/SequentialTooltip/SequentialTooltip.tsx - CORRECTED VERSION
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSequentialTour } from '../../hooks/useSequentialTour';
import { useOnboarding } from '../../hooks/useOnboarding';

interface SequentialTooltipProps {
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

  const { showOnboarding, showOptInModal } = useOnboarding();
  
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [elementPosition, setElementPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipDirection, setTooltipDirection] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const [isVisible, setIsVisible] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const [isGettingStartedModalOpen, setIsGettingStartedModalOpen] = useState(false);
  
  const tooltipRef = useRef<HTMLDivElement>(null);
  const cleanupHighlightRef = useRef<(() => void) | null>(null);
  const repositionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if GettingStartedModal is open
  useEffect(() => {
    const checkModal = () => {
      const modalElements = document.querySelectorAll('[style*="z-index: 9999"]');
      const hasModal = modalElements.length > 0;
      setIsGettingStartedModalOpen(hasModal);
    };
    
    checkModal();
    const interval = setInterval(checkModal, 200);
    return () => clearInterval(interval);
  }, []);

  // Calculate tooltip position with mobile optimization
  const calculateOptimalPosition = useCallback((rect: DOMRect, tooltipWidth: number, tooltipHeight: number) => {
    const viewportWidth = Math.min(window.innerWidth, 375);
    const viewportHeight = window.innerHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = Math.max(window.pageXOffset || document.documentElement.scrollLeft, 0);
    
    const elementTop = rect.top + scrollTop;
    const elementLeft = Math.max(rect.left + scrollLeft, 0);
    const elementBottom = elementTop + rect.height;
    const elementRight = Math.min(elementLeft + rect.width, viewportWidth);
    
    // Define safe margins - smaller for mobile
    const margin = 8;
    const arrowSize = 8;
    
    // Cap tooltip width to viewport
    const adjustedTooltipWidth = Math.min(tooltipWidth, viewportWidth - margin * 2);
    
    // Try different positions in order of preference
    const positionOptions = [
      {
        direction: 'top' as const,
        top: elementTop - tooltipHeight - arrowSize - margin,
        left: elementLeft + (rect.width / 2) - (adjustedTooltipWidth / 2),
        condition: elementTop - tooltipHeight - arrowSize - margin > margin
      },
      {
        direction: 'bottom' as const,
        top: elementBottom + arrowSize + margin,
        left: elementLeft + (rect.width / 2) - (adjustedTooltipWidth / 2),
        condition: elementBottom + tooltipHeight + arrowSize + margin < viewportHeight + scrollTop - margin
      },
      {
        direction: 'right' as const,
        top: elementTop + (rect.height / 2) - (tooltipHeight / 2),
        left: elementRight + arrowSize + margin,
        condition: elementRight + adjustedTooltipWidth + arrowSize + margin < viewportWidth + scrollLeft - margin
      },
      {
        direction: 'left' as const,
        top: elementTop + (rect.height / 2) - (tooltipHeight / 2),
        left: elementLeft - adjustedTooltipWidth - arrowSize - margin,
        condition: elementLeft - adjustedTooltipWidth - arrowSize - margin > margin
      }
    ];

    // Find first valid position
    const validPosition = positionOptions.find(pos => pos.condition);
    
    if (validPosition) {
      // Adjust to ensure tooltip stays within viewport
      let adjustedLeft = validPosition.left;
      let adjustedTop = validPosition.top;
      
      // Horizontal boundary check with mobile constraints
      if (adjustedLeft < margin) {
        adjustedLeft = margin;
      } else if (adjustedLeft + adjustedTooltipWidth > viewportWidth + scrollLeft - margin) {
        adjustedLeft = viewportWidth + scrollLeft - adjustedTooltipWidth - margin;
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
    
    // Fallback: center on screen with mobile constraints
    return {
      top: viewportHeight / 2 + scrollTop - tooltipHeight / 2,
      left: Math.max(viewportWidth / 2 + scrollLeft - adjustedTooltipWidth / 2, margin),
      direction: 'top' as const
    };
  }, []);

  // Update tooltip position when target changes
  useEffect(() => {
    // If tour isn't active or no current step, hide everything
    if (!isTourActive || !currentStep || !shouldShowCurrentStep()) {
      setIsVisible(false);
      setIsPositioned(false);
      if (cleanupHighlightRef.current) {
        cleanupHighlightRef.current();
        cleanupHighlightRef.current = null;
      }
      return;
    }

    // Clear any existing timeout
    if (repositionTimeoutRef.current) {
      clearTimeout(repositionTimeoutRef.current);
    }

    // Wait for DOM to be ready
    repositionTimeoutRef.current = setTimeout(() => {
      const element = getTargetElement();
      setTargetElement(element);
      
      if (element) {
        // Clean up previous highlight
        if (cleanupHighlightRef.current) {
          cleanupHighlightRef.current();
        }
        
        // Apply highlight with simpler styling
        const cleanup = highlightElement(element);
        cleanupHighlightRef.current = cleanup || null;
        
        // Get element position
        const position = getElementPosition(element);
        setElementPosition(position);
        
        // Calculate tooltip position
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
        
        // Scroll element into view gently
        setTimeout(() => {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }, 100);
        
        setIsVisible(true);
      }
    }, 150);

    return () => {
      if (repositionTimeoutRef.current) {
        clearTimeout(repositionTimeoutRef.current);
      }
      if (cleanupHighlightRef.current) {
        cleanupHighlightRef.current();
        cleanupHighlightRef.current = null;
      }
    };
  }, [
    currentStep, 
    isTourActive, 
    shouldShowCurrentStep, 
    getTargetElement, 
    highlightElement, 
    getElementPosition, 
    calculateOptimalPosition
  ]);

  // Handle window resize and scroll with debouncing
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

    const handleResize = () => {
      if (repositionTimeoutRef.current) {
        clearTimeout(repositionTimeoutRef.current);
      }
      repositionTimeoutRef.current = setTimeout(handleReposition, 300);
    };

    let scrollTimer: NodeJS.Timeout;
    const handleScroll = () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(handleReposition, 150);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      if (repositionTimeoutRef.current) clearTimeout(repositionTimeoutRef.current);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, [isTourActive, targetElement, isPositioned, calculateOptimalPosition]);

  // DON'T render if tour isn't active or no current step
  if (!isTourActive || !currentStep || isTransitioning) {
    return null;
  }

  // Don't render if we shouldn't show this step on current page
  if (!shouldShowCurrentStep()) {
    return null;
  }

  // Don't render if onboarding modals are open
  if (showOnboarding || showOptInModal) {
    return null;
  }

  // Don't render if GettingStartedModal is open
  if (isGettingStartedModalOpen) {
    return null;
  }

  // Don't render if not visible
  if (!isVisible) {
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
            bottom: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '10px 6px 0 6px',
            borderColor: `${secondaryColor} transparent transparent transparent`
          }} />
        );
      case 'bottom':
        return (
          <div style={{
            ...baseStyle,
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '0 6px 10px 6px',
            borderColor: `transparent transparent ${secondaryColor} transparent`
          }} />
        );
      case 'left':
        return (
          <div style={{
            ...baseStyle,
            right: '-10px',
            top: '50%',
            transform: 'translateY(-50%)',
            borderWidth: '6px 0 6px 10px',
            borderColor: `transparent transparent transparent ${secondaryColor}`
          }} />
        );
      case 'right':
        return (
          <div style={{
            ...baseStyle,
            left: '-10px',
            top: '50%',
            transform: 'translateY(-50%)',
            borderWidth: '6px 10px 6px 0',
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
          zIndex: 9998,
          pointerEvents: 'none',
          opacity: isPositioned ? 1 : 0,
          transition: 'opacity 0.4s ease'
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
              transition: 'box-shadow 0.3s ease'
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
          borderRadius: '14px',
          padding: '18px',
          maxWidth: 'min(300px, calc(100vw - 32px))',
          minWidth: '260px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 9999,
          opacity: isPositioned ? 1 : 0,
          transform: isPositioned ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
          pointerEvents: 'auto',
          boxSizing: 'border-box'
        }}
      >
        {/* Arrow */}
        {renderArrow()}

        {/* Header with step counter */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '10px'
        }}>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '17px',
            fontWeight: 700,
            color: '#FFFFFF',
            margin: 0,
            lineHeight: 1.3,
            wordWrap: 'break-word'
          }}>
            {currentStep.message}
          </h3>
          
          <div style={{
            fontSize: '13px',
            color: primaryColor,
            fontWeight: 600,
            fontFamily: "'Cormorant', serif",
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            padding: '3px 6px',
            borderRadius: '10px',
            marginLeft: '6px',
            flexShrink: 0
          }}>
            {currentStepIndex}/{totalSteps}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          height: '3px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '1.5px',
          marginBottom: '18px',
          overflow: 'hidden'
        }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: primaryColor,
              borderRadius: '1.5px',
              transition: 'width 0.4s ease'
            }}
          />
        </div>

        {/* Progress dots */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '18px'
        }}>
          {renderProgressDots()}
        </div>

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div>
            {currentStepIndex > 1 && (
              <button
                onClick={prevStep}
                disabled={isTransitioning}
                style={{
                  padding: '7px 14px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '7px',
                  color: '#9CA3AF',
                  fontSize: '13px',
                  fontFamily: "'Cormorant', serif",
                  fontWeight: 600,
                  cursor: isTransitioning ? 'default' : 'pointer',
                  opacity: isTransitioning ? 0.7 : 1,
                  transition: 'all 0.3s ease'
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
            gap: '8px',
            alignItems: 'center'
          }}>
            <button
              onClick={skipTour}
              style={{
                padding: '7px 14px',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '7px',
                color: '#9CA3AF',
                fontSize: '13px',
                fontFamily: "'Cormorant', serif",
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
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
                padding: '9px 18px',
                background: `linear-gradient(135deg, ${primaryColor} 0%, #EC4899 100%)`,
                border: 'none',
                borderRadius: '7px',
                color: '#FFFFFF',
                fontSize: '13px',
                fontFamily: "'Cormorant', serif",
                fontWeight: 600,
                cursor: isTransitioning ? 'default' : 'pointer',
                opacity: isTransitioning ? 0.7 : 1,
                transition: 'all 0.3s ease',
                minWidth: '90px'
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
    </>
  );
};

export default SequentialTooltip;