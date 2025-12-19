// frontend/src/components/Hint/Hint.tsx
import React, { useEffect, useState } from 'react';

interface HintProps {
  isVisible: boolean;
  onDismiss: () => void;
  message: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  targetRef?: React.RefObject<HTMLElement>;
  offset?: number;
}

const Hint: React.FC<HintProps> = ({
  isVisible,
  onDismiss,
  message,
  position = 'top',
  targetRef,
  offset = 10
}) => {
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});

  // Calculate position relative to target element
  useEffect(() => {
    if (!isVisible || !targetRef?.current) {
      setStyle({ display: 'none' });
      return;
    }

    const calculatePosition = () => {
      const rect = targetRef.current!.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      let top = 0;
      let left = 0;
      let arrowPosition: React.CSSProperties = {};

      switch (position) {
        case 'top':
          // For BottomNav buttons, position much higher
          top = rect.top + scrollTop - offset - 60; // Increased offset for BottomNav
          left = rect.left + scrollLeft + rect.width / 2;
          arrowPosition = {
            bottom: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '8px 8px 0 8px',
            borderColor: '#1A1A1A transparent transparent transparent'
          };
          break;
        case 'bottom':
          top = rect.bottom + scrollTop + offset;
          left = rect.left + scrollLeft + rect.width / 2;
          arrowPosition = {
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '0 8px 8px 8px',
            borderColor: 'transparent transparent #1A1A1A transparent'
          };
          break;
        case 'left':
          top = rect.top + scrollTop + rect.height / 2;
          left = rect.left + scrollLeft - offset;
          arrowPosition = {
            top: '50%',
            right: '-8px',
            transform: 'translateY(-50%)',
            borderWidth: '8px 0 8px 8px',
            borderColor: 'transparent transparent transparent #1A1A1A'
          };
          break;
        case 'right':
          top = rect.top + scrollTop + rect.height / 2;
          left = rect.right + scrollLeft + offset;
          arrowPosition = {
            top: '50%',
            left: '-8px',
            transform: 'translateY(-50%)',
            borderWidth: '8px 8px 8px 0',
            borderColor: 'transparent #1A1A1A transparent transparent'
          };
          break;
      }

      setStyle({
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        transform: 'translateX(-50%)',
        zIndex: 10001 // Higher than BottomNav (1000)
      });

      setArrowStyle({
        position: 'absolute',
        width: 0,
        height: 0,
        borderStyle: 'solid',
        ...arrowPosition
      });
    };

    calculatePosition();
    
    // Recalculate on window resize
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition);
    
    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
    };
  }, [isVisible, targetRef, position, offset]);

  if (!isVisible) return null;

  return (
    <>
      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
      
      {/* Hint Tooltip - WITHOUT the problematic overlay */}
      <div
        style={{
          ...style,
          backgroundColor: '#1A1A1A',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontFamily: "'Cormorant', serif",
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          animation: 'fadeInUp 0.3s ease-out',
          maxWidth: '250px',
          textAlign: 'center',
          pointerEvents: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Arrow */}
        <div style={arrowStyle}></div>
        
        {/* Message */}
        {message}
        
        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            position: 'absolute',
            top: '4px',
            right: '8px',
            lineHeight: '1',
            padding: '0',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Close hint"
        >
          ×
        </button>
      </div>
    </>
  );
};

export default Hint;