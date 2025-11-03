import React from 'react';

interface Prompt {
  title?: string;
  description?: string;
  name?: string;
  tagline?: string;
  bio?: string;
  content?: string;
  mood?: string;
}

interface InspirationBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: Prompt) => void;
  prompts: Prompt[];
  contentType: 'scenes' | 'characters' | 'monologues' | 'frames';
}

const InspirationBottomSheet: React.FC<InspirationBottomSheetProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
  prompts,
  contentType
}) => {
  if (!isOpen) return null;

  const getContentTypeLabel = () => {
    const labels = {
      scenes: 'Scene',
      characters: 'Character', 
      monologues: 'Monologue',
      frames: 'Frame'
    };
    return labels[contentType];
  };

  const renderPrompt = (prompt: Prompt, index: number) => {
    switch (contentType) {
      case 'scenes':
        return (
          <div key={index} style={promptCardStyle}>
            <div style={promptTitleStyle}>{prompt.title}</div>
            <div style={promptDescriptionStyle}>{prompt.description}</div>
          </div>
        );
      
      case 'characters':
        return (
          <div key={index} style={promptCardStyle}>
            <div style={promptTitleStyle}>{prompt.name}</div>
            <div style={promptTaglineStyle}>"{prompt.tagline}"</div>
            <div style={promptDescriptionStyle}>{prompt.bio}</div>
          </div>
        );
      
      case 'monologues':
        return (
          <div key={index} style={promptCardStyle}>
            <div style={promptTitleStyle}>{prompt.title}</div>
            <div style={promptDescriptionStyle}>{prompt.content}</div>
          </div>
        );
      
      case 'frames':
        return (
          <div key={index} style={promptCardStyle}>
            <div style={promptTitleStyle}>{prompt.mood}</div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      {/* Hidden scrollbar styles */}
      <style>
        {`
          .hide-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;      /* Firefox */
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;              /* Chrome, Safari and Opera */
          }
        `}
      </style>

      {/* Backdrop - covers only the 375px container */}
      <div style={backdropStyle} onClick={onClose} />
      
      {/* Bottom Sheet - positioned within the container */}
      <div style={bottomSheetStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={titleStyle}>
            {getContentTypeLabel()} Inspirations
          </div>
          <button onClick={onClose} style={closeButtonStyle}>
            ×
          </button>
        </div>

        {/* Prompts List - with hidden scrollbar but functional scrolling */}
        <div style={promptsListStyle} className="hide-scrollbar">
          {prompts.map((prompt, index) => (
            <div 
              key={index}
              onClick={() => onSelectPrompt(prompt)}
              style={promptItemStyle}
            >
              {renderPrompt(prompt, index)}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// Styles
const backdropStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 1000,
  borderRadius: 18,
};

const bottomSheetStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'white',
  borderTopLeftRadius: '20px',
  borderTopRightRadius: '20px',
  padding: '20px',
  maxHeight: '70vh',
  overflow: 'hidden',
  zIndex: 1001,
  boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
  boxSizing: 'border-box',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  paddingBottom: '15px',
  borderBottom: '1px solid #f0f0f0',
};

const titleStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', serif",
  fontSize: '20px',
  fontWeight: '700',
  color: '#1A1A1A',
};

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  color: '#666',
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const promptsListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
  maxHeight: 'calc(70vh - 80px)',
  overflowY: 'auto', // Keep scrolling enabled
  // Note: Scrollbar hiding is handled by the CSS class
};

const promptItemStyle: React.CSSProperties = {
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
};

const promptCardStyle: React.CSSProperties = {
  backgroundColor: '#FAF8F2',
  borderRadius: '12px',
  padding: '16px',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  width: '100%',
  boxSizing: 'border-box',
};

const promptTitleStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', serif",
  fontSize: '16px',
  fontWeight: '600',
  color: '#1A1A1A',
  marginBottom: '8px',
  wordWrap: 'break-word',
};

const promptTaglineStyle: React.CSSProperties = {
  fontFamily: "'Cormorant', serif",
  fontSize: '14px',
  fontStyle: 'italic',
  color: '#D4AF37',
  marginBottom: '8px',
  wordWrap: 'break-word',
};

const promptDescriptionStyle: React.CSSProperties = {
  fontFamily: "'Cormorant', serif",
  fontSize: '14px',
  color: '#55524F',
  lineHeight: '1.4',
  wordWrap: 'break-word',
};

export default InspirationBottomSheet;