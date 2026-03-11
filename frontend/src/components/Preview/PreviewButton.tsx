// src/components/Preview/PreviewButton.tsx
import React from 'react';

interface PreviewButtonProps {
  onClick: () => void;
  disabled?: boolean;
  contentType?: 'scene' | 'character' | 'monologue' | 'frame';
}

const icons = {
  scene: '🎬',
  character: '👤',
  monologue: '🎭',
  frame: '🖼️'
};

export const PreviewButton: React.FC<PreviewButtonProps> = ({
  onClick,
  disabled = false,
  contentType = 'frame'
}) => {
  if (disabled) return null;

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '16px',
        background: '#D4AF37',
        color: '#1A1A1A',
        border: 'none',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: 600,
        fontFamily: "'Playfair Display', serif",
        marginTop: '24px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#C4A030';
        e.currentTarget.style.transform = 'scale(1.02)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#D4AF37';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {icons[contentType]} See Final Design
    </button>
  );
};

export default PreviewButton;