// src/components/ContextualTooltip/ContextualTooltip.tsx
import React, { useEffect, useState, useRef } from 'react';
import useTooltipSequence from '../../hooks/useTooltipSequence';

const ContextualTooltip: React.FC = () => {
  const { 
    currentStep, 
    completeCurrentStep, 
    skipSequence,
    shouldHighlightElement 
  } = useTooltipSequence();
  
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
    arrowPosition: 'top' | 'bottom' | 'left' | 'right';
    visible: boolean;
  } | null>(null);
  
  const [pulseHighlight, setPulseHighlight] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Calculate tooltip position when step changes
  useEffect(() => {
    if (!currentStep) {
      setTooltipPosition(null);
      return;
    }
    
    // Find target element
    const targetElement = document.getElementById(currentStep.targetElementId) || 
                         document.querySelector(`[data-tooltip="${currentStep.targetElementId}"]`);
    
    if (!targetElement) {
      console.warn(`Tooltip target element not found: ${currentStep.targetElementId}`);
      // Try again after a short delay (element might not be rendered yet)
      const timer = setTimeout(() => {
        const retryElement = document.getElementById(currentStep.targetElementId) || 
                           document.querySelector(`[data-tooltip="${currentStep.targetElementId}"]`);
        if (retryElement) {
          calculatePosition(retryElement);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
    
    calculatePosition(targetElement);
    
    // Start pulse animation
    setPulseHighlight(true);
    const pulseInterval = setInterval(() => {
      setPulseHighlight(prev => !prev);
    }, 1500);
    
    return () => clearInterval(pulseInterval);
  }, [currentStep]);
  
  const calculatePosition = (element: Element) => {
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Get preferred position from step config, default to 'bottom'
    const preferredPosition = currentStep?.position || 'bottom';
    
    // Calculate based on element position and viewport
    let arrowPosition: 'top' | 'bottom' | 'left' | 'right' = preferredPosition;
    let tooltipTop = 0;
    let tooltipLeft = 0;
    
    // Offsets from step config
    const offsetX = currentStep?.offsetX || 0;
    const offsetY = currentStep?.offsetY || 0;
    
    // Default tooltip dimensions (will be adjusted after render)
    const tooltipWidth = 280; // Max width for 375px container
    const tooltipHeight = 180; // Approximate height
    
    switch (preferredPosition) {
      case 'top':
        if (rect.top - tooltipHeight - 40 > 0) {
          // Enough space above
          tooltipTop = rect.top - tooltipHeight - 20 + offsetY;
          tooltipLeft = rect.left + (rect.width / 2) - (tooltipWidth / 2) + offsetX;
          arrowPosition = 'bottom';
        } else {
          // Not enough space above, show below
          tooltipTop = rect.bottom + 20 + offsetY;
          tooltipLeft = rect.left + (rect.width / 2) - (tooltipWidth / 2) + offsetX;
          arrowPosition = 'top';
        }
        break;
        
      case 'bottom':
        if (rect.bottom + tooltipHeight + 40 < viewportHeight) {
          // Enough space below
          tooltipTop = rect.bottom + 20 + offsetY;
          tooltipLeft = rect.left + (rect.width / 2) - (tooltipWidth / 2) + offsetX;
          arrowPosition = 'top';
        } else {
          // Not enough space below, show above
          tooltipTop = rect.top - tooltipHeight - 20 + offsetY;
          tooltipLeft = rect.left + (rect.width / 2) - (tooltipWidth / 2) + offsetX;
          arrowPosition = 'bottom';
        }
        break;
        
      case 'left':
        if (rect.left - tooltipWidth - 40 > 0) {
          // Enough space to the left
          tooltipTop = rect.top + (rect.height / 2) - (tooltipHeight / 2) + offsetY;
          tooltipLeft = rect.left - tooltipWidth - 20 + offsetX;
          arrowPosition = 'right';
        } else {
          // Not enough space left, show to the right
          tooltipTop = rect.top + (rect.height / 2) - (tooltipHeight / 2) + offsetY;
          tooltipLeft = rect.right + 20 + offsetX;
          arrowPosition = 'left';
        }
        break;
        
      case 'right':
        if (rect.right + tooltipWidth + 40 < viewportWidth) {
          // Enough space to the right
          tooltipTop = rect.top + (rect.height / 2) - (tooltipHeight / 2) + offsetY;
          tooltipLeft = rect.right + 20 + offsetX;
          arrowPosition = 'left';
        } else {
          // Not enough space right, show to the left
          tooltipTop = rect.top + (rect.height / 2) - (tooltipHeight / 2) + offsetY;
          tooltipLeft = rect.left - tooltipWidth - 20 + offsetX;
          arrowPosition = 'right';
        }
        break;
    }
    
    // Constrain to viewport (especially important for 375px mobile width)
    tooltipLeft = Math.max(10, Math.min(tooltipLeft, viewportWidth - tooltipWidth - 10));
    tooltipTop = Math.max(10, Math.min(tooltipTop, viewportHeight - tooltipHeight - 10));
    
    setTooltipPosition({
      top: tooltipTop,
      left: tooltipLeft,
      arrowPosition,
      visible: true
    });
  };
  
  // Adjust position after tooltip renders (to get actual dimensions)
  useEffect(() => {
    if (!tooltipPosition || !tooltipRef.current || !currentStep) return;
    
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    
    // Ensure tooltip stays within 375px container bounds
    const maxLeft = Math.min(viewportWidth, 375) - tooltipRect.width - 20;
    const constrainedLeft = Math.max(20, Math.min(tooltipPosition.left, maxLeft));
    
    if (constrainedLeft !== tooltipPosition.left) {
      setTooltipPosition(prev => prev ? { ...prev, left: constrainedLeft } : null);
    }
  }, [tooltipPosition, currentStep]);
  
  // Handle escape key to skip
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentStep) {
        skipSequence();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [currentStep, skipSequence]);
  
  if (!currentStep || !tooltipPosition) return null;
  
  // Get total steps in current sequence
  const totalSteps = currentStep.sequence === 'bottom-nav' ? 4 :
                    currentStep.sequence === 'profile-page' ? 4 : 3;
  
  return (
    <>
      {/* Highlight overlay for target element */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 9998,
          pointerEvents: 'none',
          clipPath: currentStep ? `url(#tooltip-clip-${currentStep.targetElementId})` : 'none'
        }}
      />
      
      {/* Clip path for highlighted element */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          {(() => {
            const targetElement = document.getElementById(currentStep.targetElementId) || 
                                 document.querySelector(`[data-tooltip="${currentStep.targetElementId}"]`);
            if (!targetElement) return null;
            
            const rect = targetElement.getBoundingClientRect();
            const highlightPadding = pulseHighlight ? 8 : 4;
            
            return (
              <clipPath id={`tooltip-clip-${currentStep.targetElementId}`}>
                <rect
                  x={rect.left - highlightPadding}
                  y={rect.top - highlightPadding}
                  width={rect.width + (highlightPadding * 2)}
                  height={rect.height + (highlightPadding * 2)}
                  rx="8"
                  ry="8"
                />
              </clipPath>
            );
          })()}
        </defs>
      </svg>
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          backgroundColor: '#1A1A1A',
          color: '#FFFFFF',
          borderRadius: '12px',
          padding: '20px',
          maxWidth: '280px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
          zIndex: 9999,
          opacity: tooltipPosition.visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
          boxSizing: 'border-box'
        }}
      >
        {/* Arrow */}
        <div
          style={{
            position: 'absolute',
            width: 0,
            height: 0,
            ...(tooltipPosition.arrowPosition === 'top' && {
              top: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '8px solid #1A1A1A'
            }),
            ...(tooltipPosition.arrowPosition === 'bottom' && {
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #1A1A1A'
            }),
            ...(tooltipPosition.arrowPosition === 'left' && {
              left: '-8px',
              top: '50%',
              transform: 'translateY(-50%)',
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderRight: '8px solid #1A1A1A'
            }),
            ...(tooltipPosition.arrowPosition === 'right' && {
              right: '-8px',
              top: '50%',
              transform: 'translateY(-50%)',
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderLeft: '8px solid #1A1A1A'
            })
          }}
        />
        
        {/* Content */}
        <div style={{ marginBottom: '16px' }}>
          {currentStep.title && (
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '18px',
              fontWeight: 'bold',
              margin: '0 0 8px 0',
              color: '#FFFFFF'
            }}>
              {currentStep.title}
            </h3>
          )}
          
          <p style={{
            fontFamily: "'Cormorant', serif",
            fontSize: '16px',
            lineHeight: '1.4',
            margin: 0,
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            {currentStep.content}
          </p>
        </div>
        
        {/* Progress & Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px'
        }}>
          {/* Progress indicator */}
          <div style={{
            fontFamily: "'Cormorant', serif",
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            fontWeight: 500
          }}>
            {currentStep.stepNumber} of {totalSteps}
          </div>
          
          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={skipSequence}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '14px',
                fontFamily: "'Cormorant', serif",
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
              }}
            >
              Skip
            </button>
            
            <button
              onClick={completeCurrentStep}
              style={{
                padding: '8px 20px',
                backgroundColor: '#FFFFFF',
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
                e.currentTarget.style.backgroundColor = '#F5F5F5';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {currentStep.stepNumber === totalSteps ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
      
      <style>
        {`
          @keyframes pulse-border {
            0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7); }
            70% { box-shadow: 0 0 0 6px rgba(212, 175, 55, 0); }
            100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
          }
          
          #${currentStep.targetElementId},
          [data-tooltip="${currentStep.targetElementId}"] {
            position: relative;
            z-index: 10000 !important;
            animation: ${pulseHighlight ? 'pulse-border 1.5s infinite' : 'none'};
          }
        `}
      </style>
    </>
  );
};

export default ContextualTooltip;