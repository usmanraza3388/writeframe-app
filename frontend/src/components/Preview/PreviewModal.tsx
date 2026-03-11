// src/components/Preview/PreviewModal.tsx
import React from 'react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.95)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ 
        width: '375px', 
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-40px',
            right: '0',
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '8px',
            zIndex: 2001
          }}
        >
          ✕
        </button>
        
        {/* Preview content (the card) */}
        {children}
        
        {/* Back button */}
        <button
          onClick={onClose}
          style={{
            marginTop: '20px',
            padding: '12px',
            background: '#FAF8F2',
            border: 'none',
            borderRadius: '8px',
            width: '100%',
            cursor: 'pointer',
            fontFamily: "'Cormorant', serif",
            fontSize: '16px',
            fontWeight: 600,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F0EDE4';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FAF8F2';
          }}
        >
          ← Back to Editing
        </button>
      </div>
    </div>
  );
};

export default PreviewModal;