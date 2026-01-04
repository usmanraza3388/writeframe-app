// RemakeEditor.tsx
import React, { useState } from 'react';
import type { Scene } from '../../utils/scenes';

interface RemakeEditorProps {
  originalScene: Scene;
  onPost: (contextText: string) => void;
  onCancel: () => void;
}

// ADDED: Same image URL helper function from SceneCard
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '';
  // Check if it's already a full URL
  if (imagePath.startsWith('http')) return imagePath;
  return `https://ycrvsbtqmjksdbyrefek.supabase.co/storage/v1/object/public/scene-images/${imagePath}`;
};

const RemakeEditor: React.FC<RemakeEditorProps> = ({
  originalScene,
  onPost,
  onCancel
}) => {
  const [contextText, setContextText] = useState('');
  
  // ADDED: Get the full image URL for display
  const imageUrl = originalScene.image_path ? getImageUrl(originalScene.image_path) : '';

  const handlePost = () => {
    if (contextText.trim()) {
      onPost(contextText.trim());
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        width: '375px',
        backgroundColor: '#FAF8F2',
        borderRadius: '12px',
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '20px',
            fontWeight: 400,
            color: '#000000',
            margin: 0
          }}>
            Scene Remake
          </h2>
          <p style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '14px',
            color: '#55524F',
            margin: '8px 0 0 0'
          }}>
            Rewrite the scene with your own perspective
          </p>
        </div>

        {/* Original Scene Preview */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          border: '1px solid #E5E5E5'
        }}>
          <div style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '16px',
            fontWeight: 700,
            color: '#000000',
            marginBottom: '8px'
          }}>
            {originalScene.title}
          </div>
          
          {/* FIXED: Use the full image URL */}
          {imageUrl && (
            <div style={{
              width: '100%',
              height: '120px',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '8px',
              position: 'relative'
            }}>
              <img 
                src={imageUrl} 
                alt="Original scene"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  // Fallback if image fails to load
                  console.error('Failed to load image:', imageUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
              {/* ADDED: Loading state */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FAF8F2',
                color: '#55524F',
                fontFamily: 'Playfair Display, serif',
                fontSize: '14px'
              }}>
                Loading image...
              </div>
            </div>
          )}
          
          <div style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '14px',
            color: '#55524F',
            lineHeight: '1.4'
          }}>
            {originalScene.description}
          </div>
        </div>

        {/* Context Input */}
        <textarea
          value={contextText}
          onChange={(e) => setContextText(e.target.value)}
          placeholder="Add your perspective, interpretation, or continuation..."
          style={{
            width: '100%',
            height: '120px',
            padding: '12px',
            border: '1px solid #E5E5E5',
            borderRadius: '8px',
            fontFamily: 'Playfair Display, serif',
            fontSize: '14px',
            color: '#000000',
            resize: 'none',
            boxSizing: 'border-box',
            marginBottom: '16px'
          }}
        />

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              backgroundColor: 'white',
              color: '#000000',
              fontFamily: 'Arial, sans-serif',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handlePost}
            disabled={!contextText.trim()}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: contextText.trim() ? '#1C1C1C' : '#CCCCCC',
              color: 'white',
              fontFamily: 'Arial, sans-serif',
              fontSize: '14px',
              cursor: contextText.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemakeEditor;