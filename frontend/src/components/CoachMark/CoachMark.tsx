// src/components/CoachMark/CoachMark.tsx
import React, { useState, useEffect, useRef } from 'react';

type ArrowPosition = 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface CoachMarkProps {
  /** The target element to highlight (CSS selector or ref) */
  target: string | React.RefObject<HTMLElement>;
  /** Title of the tooltip */
  title: string;
  /** Description text */
  description: string;
  /** Position of the tooltip relative to target */
  position?: ArrowPosition;
  /** Step number (e.g., "1 of 4") */
  step?: number;
  /** Total steps */
  totalSteps?: number;
  /** Whether the coach mark is currently visible */
  isVisible: boolean;
  /** Function to call when user clicks "Got it" or outside */
  onDismiss: () => void;
  /** Function to go to next step (if applicable) */
  onNext?: () => void;
  /** Function to go to previous step (if applicable) */
  onPrev?: () => void;
  /** Show navigation buttons (prev/next) */
  showNavigation?: boolean;
  /** Optional action button text */
  actionText?: string;
  /** Optional action button handler */
  onAction?: () => void;
  /** Custom offset from target element */
  offset?: number;
  /** Disable backdrop dimming */
  noBackdrop?: boolean;
}

const CoachMark: React.FC<CoachMarkProps> = ({
  target,
  title,
  description,
  position = 'bottom',
  step,
  totalSteps,
  isVisible,
  onDismiss,
  onNext,
  onPrev,
  showNavigation = false,
  actionText,
  onAction,
  offset = 15,
  noBackdrop = false
}) => {
  const coachMarkRef = useRef<HTMLDivElement>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [coachMarkRect, setCoachMarkRect] = useState<DOMRect | null>(null);
  const [calculatedPosition, setCalculatedPosition] = useState<ArrowPosition>(position);
  const [appContainer, setAppContainer] = useState<HTMLElement | null>(null);

  // Find the 375px app container
  useEffect(() => {
    if (!isVisible) return;
    
    // Try to find the app container (375px max-width centered container)
    const findAppContainer = (): HTMLElement | null => {
      // Common selectors for app containers
      const selectors = [
        '.home-feed-container',
        '[style*="max-width: 375px"]',
        '[style*="max-width:375px"]',
        '[style*="width: 375px"]',
        '.MuiContainer-root' // If using Material-UI
      ];
      
      for (const selector of selectors) {
        const element = document.querySelector<HTMLElement>(selector);
        if (element && 
            (element.style.maxWidth === '375px' || 
             getComputedStyle(element).maxWidth === '375px' ||
             element.offsetWidth <= 375)) {
          return element;
        }
      }
      
      // Fallback to body if no container found
      return document.body;
    };
    
    setAppContainer(findAppContainer());
  }, [isVisible]);

  // Calculate position and arrow
  useEffect(() => {
    if (!isVisible || !appContainer) return;

    const updatePosition = () => {
      let targetElement: HTMLElement | null = null;

      if (typeof target === 'string') {
        targetElement = document.querySelector(target);
      } else if (target && 'current' in target && target.current) {
        targetElement = target.current;
      }

      if (!targetElement) {
        console.warn(`CoachMark target not found: ${target}`);
        return;
      }

      const rect = targetElement.getBoundingClientRect();
      setTargetRect(rect);

      // Get container bounds
      const containerRect = appContainer.getBoundingClientRect();
      const isAppContainer = appContainer !== document.body;
      
      // Auto-adjust position based on container bounds
      let adjustedPosition = position;
      
      if (position === 'bottom' && rect.bottom + 250 > containerRect.bottom) {
        adjustedPosition = 'top';
      } else if (position === 'top' && rect.top - 250 < containerRect.top) {
        adjustedPosition = 'bottom';
      } else if (position === 'right' && rect.right + 400 > containerRect.right) {
        adjustedPosition = 'left';
      } else if (position === 'left' && rect.left - 400 < containerRect.left) {
        adjustedPosition = 'right';
      }
      
      // Additional adjustment for app container constraints
      if (isAppContainer) {
        // Ensure tooltip stays within 375px container horizontally
        if (position === 'left' && rect.left - 320 < containerRect.left) {
          adjustedPosition = 'right';
        } else if (position === 'right' && rect.right + 320 > containerRect.right) {
          adjustedPosition = 'left';
        }
      }
      
      setCalculatedPosition(adjustedPosition);
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isVisible, target, position, appContainer]);

  // Update coach mark dimensions after render
  useEffect(() => {
    if (coachMarkRef.current && isVisible) {
      const rect = coachMarkRef.current.getBoundingClientRect();
      setCoachMarkRect(rect);
    }
  }, [isVisible]);

  // Calculate tooltip position with container awareness
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect || !coachMarkRect || !appContainer) return { display: 'none' };

    const style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 10001,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.95)',
      transition: 'opacity 0.3s ease, transform 0.3s ease'
    };

    // Get container bounds
    const containerRect = appContainer.getBoundingClientRect();
    const isAppContainer = appContainer !== document.body;
    
    // Safe margins
    const containerMargin = 15;
    const viewportMargin = 15;

    // Calculate positions relative to container
    const calculatePosition = (pos: ArrowPosition): { top: number; left: number; pos: ArrowPosition } => {
      const safeOffset = offset + 20;
      
      switch (pos) {
        case 'top':
          return {
            top: targetRect.top - coachMarkRect.height - safeOffset,
            left: targetRect.left + (targetRect.width / 2) - (coachMarkRect.width / 2),
            pos: 'top'
          };
        case 'bottom':
          return {
            top: targetRect.bottom + safeOffset,
            left: targetRect.left + (targetRect.width / 2) - (coachMarkRect.width / 2),
            pos: 'bottom'
          };
        case 'left':
          return {
            top: targetRect.top + (targetRect.height / 2) - (coachMarkRect.height / 2),
            left: targetRect.left - coachMarkRect.width - safeOffset,
            pos: 'left'
          };
        case 'right':
          return {
            top: targetRect.top + (targetRect.height / 2) - (coachMarkRect.height / 2),
            left: targetRect.right + safeOffset,
            pos: 'right'
          };
        case 'top-left':
          return {
            top: targetRect.top - coachMarkRect.height - safeOffset,
            left: targetRect.left,
            pos: 'top-left'
          };
        case 'top-right':
          return {
            top: targetRect.top - coachMarkRect.height - safeOffset,
            left: targetRect.right - coachMarkRect.width,
            pos: 'top-right'
          };
        case 'bottom-left':
          return {
            top: targetRect.bottom + safeOffset,
            left: targetRect.left,
            pos: 'bottom-left'
          };
        case 'bottom-right':
          return {
            top: targetRect.bottom + safeOffset,
            left: targetRect.right - coachMarkRect.width,
            pos: 'bottom-right'
          };
        default:
          return {
            top: targetRect.bottom + safeOffset,
            left: targetRect.left + (targetRect.width / 2) - (coachMarkRect.width / 2),
            pos: 'bottom'
          };
      }
    };

    // Get position for the requested placement
    let positionData = calculatePosition(calculatedPosition);
    
    // Check if this position would cover the target
    const coversTarget = (
      positionData.top < targetRect.bottom && 
      positionData.top + coachMarkRect.height > targetRect.top &&
      positionData.left < targetRect.right && 
      positionData.left + coachMarkRect.width > targetRect.left
    );

    // If position covers target, try alternative positions
    if (coversTarget) {
      const alternativePositions: ArrowPosition[] = ['bottom', 'top', 'right', 'left', 'bottom-right', 'bottom-left', 'top-right', 'top-left'];
      
      for (const altPos of alternativePositions) {
        if (altPos === calculatedPosition) continue;
        
        const altPosition = calculatePosition(altPos);
        const altCoversTarget = (
          altPosition.top < targetRect.bottom && 
          altPosition.top + coachMarkRect.height > targetRect.top &&
          altPosition.left < targetRect.right && 
          altPosition.left + coachMarkRect.width > targetRect.left
        );
        
        if (!altCoversTarget) {
          positionData = altPosition;
          setCalculatedPosition(altPos);
          break;
        }
      }
    }

    // Adjust position based on container constraints
    let finalTop = positionData.top;
    let finalLeft = positionData.left;

    if (isAppContainer) {
      // Constrain to app container (375px)
      const containerLeft = containerRect.left;
      const containerRight = containerRect.right;
      const containerTop = containerRect.top;
      const containerBottom = containerRect.bottom;

      // Horizontal constraints within container
      if (finalLeft < containerLeft + containerMargin) {
        finalLeft = containerLeft + containerMargin;
      } else if (finalLeft + coachMarkRect.width > containerRight - containerMargin) {
        finalLeft = containerRight - coachMarkRect.width - containerMargin;
      }

      // Vertical constraints within container
      if (finalTop < containerTop + containerMargin) {
        finalTop = containerTop + containerMargin;
      } else if (finalTop + coachMarkRect.height > containerBottom - containerMargin) {
        finalTop = containerBottom - coachMarkRect.height - containerMargin;
      }

      // Ensure tooltip doesn't go outside viewport (safety check)
      if (finalLeft < viewportMargin) {
        finalLeft = viewportMargin;
      } else if (finalLeft + coachMarkRect.width > window.innerWidth - viewportMargin) {
        finalLeft = window.innerWidth - coachMarkRect.width - viewportMargin;
      }
    } else {
      // Fallback to viewport constraints
      if (finalLeft < viewportMargin) {
        finalLeft = viewportMargin;
      } else if (finalLeft + coachMarkRect.width > window.innerWidth - viewportMargin) {
        finalLeft = window.innerWidth - coachMarkRect.width - viewportMargin;
      }
    }

    // Vertical safety for both cases
    if (finalTop < viewportMargin) {
      finalTop = viewportMargin;
    } else if (finalTop + coachMarkRect.height > window.innerHeight - viewportMargin) {
      finalTop = window.innerHeight - coachMarkRect.height - viewportMargin;
    }

    style.top = `${finalTop}px`;
    style.left = `${finalLeft}px`;

    return style;
  };

  // Calculate arrow position with container awareness
  const getArrowStyle = (): React.CSSProperties => {
    if (!targetRect || !coachMarkRect) return { display: 'none' };

    const arrowStyle: React.CSSProperties = {
      position: 'absolute',
      width: '0',
      height: '0',
      borderStyle: 'solid'
    };

    const arrowSize = 10;

    switch (calculatedPosition) {
      case 'top':
        arrowStyle.bottom = `-${arrowSize}px`;
        arrowStyle.left = '50%';
        arrowStyle.transform = 'translateX(-50%)';
        arrowStyle.borderWidth = `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`;
        arrowStyle.borderColor = `#1A1A1A transparent transparent transparent`;
        break;
      case 'bottom':
        arrowStyle.top = `-${arrowSize}px`;
        arrowStyle.left = '50%';
        arrowStyle.transform = 'translateX(-50%)';
        arrowStyle.borderWidth = `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`;
        arrowStyle.borderColor = `transparent transparent #1A1A1A transparent`;
        break;
      case 'left':
        arrowStyle.top = '50%';
        arrowStyle.right = `-${arrowSize}px`;
        arrowStyle.transform = 'translateY(-50%)';
        arrowStyle.borderWidth = `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`;
        arrowStyle.borderColor = `transparent transparent transparent #1A1A1A`;
        break;
      case 'right':
        arrowStyle.top = '50%';
        arrowStyle.left = `-${arrowSize}px`;
        arrowStyle.transform = 'translateY(-50%)';
        arrowStyle.borderWidth = `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`;
        arrowStyle.borderColor = `transparent #1A1A1A transparent transparent`;
        break;
      case 'top-left':
        arrowStyle.bottom = `-${arrowSize}px`;
        arrowStyle.left = '25px';
        arrowStyle.borderWidth = `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`;
        arrowStyle.borderColor = `#1A1A1A transparent transparent transparent`;
        break;
      case 'top-right':
        arrowStyle.bottom = `-${arrowSize}px`;
        arrowStyle.right = '25px';
        arrowStyle.borderWidth = `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`;
        arrowStyle.borderColor = `#1A1A1A transparent transparent transparent`;
        break;
      case 'bottom-left':
        arrowStyle.top = `-${arrowSize}px`;
        arrowStyle.left = '25px';
        arrowStyle.borderWidth = `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`;
        arrowStyle.borderColor = `transparent transparent #1A1A1A transparent`;
        break;
      case 'bottom-right':
        arrowStyle.top = `-${arrowSize}px`;
        arrowStyle.right = '25px';
        arrowStyle.borderWidth = `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`;
        arrowStyle.borderColor = `transparent transparent #1A1A1A transparent`;
        break;
      default:
        // Default to bottom arrow
        arrowStyle.top = `-${arrowSize}px`;
        arrowStyle.left = '50%';
        arrowStyle.transform = 'translateX(-50%)';
        arrowStyle.borderWidth = `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`;
        arrowStyle.borderColor = `transparent transparent #1A1A1A transparent`;
    }

    return arrowStyle;
  };

  // Handle click outside
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (coachMarkRef.current && !coachMarkRef.current.contains(event.target as Node)) {
        onDismiss();
      }
    };

    // Also handle Escape key
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDismiss();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, onDismiss]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop - dims everything except target */}
      {!noBackdrop && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10000,
          animation: 'fadeIn 0.3s ease',
          pointerEvents: 'auto' // Ensure backdrop receives clicks
        }} />
      )}

      {/* Highlight overlay for target element - FIXED: Ensure target stays above backdrop */}
      {targetRect && !noBackdrop && (
        <div style={{
          position: 'fixed',
          top: `${targetRect.top}px`,
          left: `${targetRect.left}px`,
          width: `${targetRect.width}px`,
          height: `${targetRect.height}px`,
          border: '2px solid rgba(212, 175, 55, 0.8)',
          borderRadius: '8px',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 175, 55, 0.6)',
          zIndex: 10001, // One above backdrop to ensure visibility
          pointerEvents: 'none',
          animation: 'pulse 2s infinite'
        }} />
      )}

      {/* Tooltip */}
      <div
        ref={coachMarkRef}
        style={getTooltipStyle()}
      >
        {/* Arrow */}
        <div style={getArrowStyle()} />

        {/* Tooltip Content */}
        <div style={{
          background: '#1A1A1A',
          borderRadius: '12px',
          padding: '20px',
          minWidth: '280px',
          maxWidth: '320px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Step indicator */}
          {(step !== undefined && totalSteps !== undefined) && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <div style={{
                fontFamily: "'Cormorant', serif",
                fontSize: '13px',
                color: '#9CA3AF',
                fontWeight: 500,
                letterSpacing: '0.5px'
              }}>
                Step {step} of {totalSteps}
              </div>
              
              {/* Close button */}
              <button
                onClick={onDismiss}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '6px',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: 0,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#9CA3AF';
                }}
              >
                ×
              </button>
            </div>
          )}

          {/* Title */}
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '18px',
            fontWeight: 700,
            color: '#FFFFFF',
            margin: '0 0 8px 0',
            lineHeight: 1.3
          }}>
            {title}
          </h3>

          {/* Description */}
          <p style={{
            fontFamily: "'Cormorant', serif",
            fontSize: '16px',
            color: '#D1D5DB',
            margin: '0 0 20px 0',
            lineHeight: 1.5
          }}>
            {description}
          </p>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: showNavigation ? 'space-between' : 'flex-end',
            alignItems: 'center'
          }}>
            {/* Navigation buttons */}
            {showNavigation && (
              <div style={{ display: 'flex', gap: '8px' }}>
                {onPrev && (
                  <button
                    onClick={onPrev}
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
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                  >
                    Previous
                  </button>
                )}
                
                {onNext && (
                  <button
                    onClick={onNext}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#1A1A1A',
                      fontSize: '14px',
                      fontFamily: "'Cormorant', serif",
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Next
                  </button>
                )}
              </div>
            )}

            {/* Action button or Got it */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {actionText && onAction ? (
                <button
                  onClick={onAction}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#1A1A1A',
                    fontSize: '14px',
                    fontFamily: "'Cormorant', serif",
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {actionText}
                </button>
              ) : (
                <button
                  onClick={onDismiss}
                  style={{
                    padding: '10px 20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontFamily: "'Cormorant', serif",
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  Got it
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes pulse {
            0% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 175, 55, 0.6); }
            50% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 30px rgba(212, 175, 55, 0.8); }
            100% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 175, 55, 0.6); }
          }
        `}
      </style>
    </>
  );
};

export default CoachMark;