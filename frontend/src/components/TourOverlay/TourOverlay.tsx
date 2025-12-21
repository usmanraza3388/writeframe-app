import React, { useEffect, useRef, useState } from 'react';

interface TourOverlayProps {
  targetSelector: string; // CSS selector for the element to highlight
  isActive: boolean;
  children?: React.ReactNode; // Tooltip component will go here
  onOverlayClick?: () => void; // Click on dimmed area
}

const TourOverlay: React.FC<TourOverlayProps> = ({
  targetSelector,
  isActive,
  children,
  onOverlayClick
}) => {
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 0, 
    height: typeof window !== 'undefined' ? window.innerHeight : 0 
  });
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Find and measure the target element
  useEffect(() => {
    if (!isActive || !targetSelector) {
      setHighlightRect(null);
      return;
    }

    const findAndMeasureElement = () => {
      const element = document.querySelector(targetSelector);
      
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightRect(rect);
      } else {
        // Element not found yet, try again after a short delay
        setTimeout(findAndMeasureElement, 100);
      }
    };

    findAndMeasureElement();
  }, [targetSelector, isActive, windowSize]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      resizeTimeoutRef.current = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  if (!isActive) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Only call onOverlayClick if clicking on the dimmed area (not the highlighted area)
    if (highlightRect && 
        e.clientX >= highlightRect.left && 
        e.clientX <= highlightRect.right &&
        e.clientY >= highlightRect.top && 
        e.clientY <= highlightRect.bottom) {
      return; // Clicked inside highlighted area
    }
    
    if (onOverlayClick) {
      onOverlayClick();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 9998,
        pointerEvents: 'auto',
        cursor: 'default'
      }}
      onClick={handleOverlayClick}
    >
      {/* Dimmed Background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(2px)'
        }}
      />

      {/* Spotlight Cutout */}
      {highlightRect && (
        <div
          style={{
            position: 'absolute',
            top: highlightRect.top - 8,
            left: highlightRect.left - 8,
            width: highlightRect.width + 16,
            height: highlightRect.height + 16,
            borderRadius: '12px',
            boxShadow: `
              0 0 0 9999px rgba(0, 0, 0, 0.75),
              0 0 0 2px #FFFFFF,
              0 0 20px rgba(255, 255, 255, 0.3),
              inset 0 0 20px rgba(255, 255, 255, 0.2)
            `,
            pointerEvents: 'none',
            transition: 'all 0.3s ease-out',
            animation: 'pulseHighlight 2s ease-in-out infinite'
          }}
        />
      )}

      {/* Tooltip Container (positioned absolutely) */}
      {children && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}>
          {children}
        </div>
      )}

      <style>
        {`
          @keyframes pulseHighlight {
            0% { 
              box-shadow: 
                0 0 0 9999px rgba(0, 0, 0, 0.75),
                0 0 0 2px #FFFFFF,
                0 0 20px rgba(255, 255, 255, 0.3),
                inset 0 0 20px rgba(255, 255, 255, 0.2);
            }
            50% { 
              box-shadow: 
                0 0 0 9999px rgba(0, 0, 0, 0.75),
                0 0 0 2px #FFFFFF,
                0 0 30px rgba(255, 255, 255, 0.5),
                inset 0 0 30px rgba(255, 255, 255, 0.3);
            }
            100% { 
              box-shadow: 
                0 0 0 9999px rgba(0, 0, 0, 0.75),
                0 0 0 2px #FFFFFF,
                0 0 20px rgba(255, 255, 255, 0.3),
                inset 0 0 20px rgba(255, 255, 255, 0.2);
            }
          }
        `}
      </style>
    </div>
  );
};

export default TourOverlay;