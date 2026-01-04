// RemakeEditor.tsx - FIXED VERSION (without warning)
import React, { useState, useEffect } from 'react';
import type { Scene } from '../../utils/scenes';

interface RemakeEditorProps {
  originalScene: Scene;
  onPost: (contextText: string) => void;
  onCancel: () => void;
}

// FIXED: Match SceneCard's exact getImageUrl function
const getImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) return '';
  
  // Check if it's already a full URL
  if (imagePath.startsWith('http')) return imagePath;
  
  // FIXED: Use the EXACT same URL construction as SceneCard
  // This matches SceneCard.tsx line 87-92
  return `https://ycrvsbtqmjksdbyrefek.supabase.co/storage/v1/object/public/scene-images/${imagePath}`;
};

const RemakeEditor: React.FC<RemakeEditorProps> = ({
  originalScene,
  onPost,
  onCancel
}) => {
  const [contextText, setContextText] = useState('');
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // FIXED: Get image URL using the same function as SceneCard
  const imageUrl = originalScene.image_path ? getImageUrl(originalScene.image_path) : '';

  // Reset image states when URL changes
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [imageUrl]);

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
        maxWidth: '90vw',
        backgroundColor: '#FAF8F2',
        borderRadius: '12px',
        padding: '20px',
        boxSizing: 'border-box',
        maxHeight: '90vh',
        overflow: 'auto'
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
          
          {/* Image with proper loading states */}
          {imageUrl ? (
            <div style={{
              width: '100%',
              height: '120px',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '8px',
              position: 'relative',
              backgroundColor: '#FAF8F2'
            }}>
              {!imageLoaded && !imageError && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#55524F',
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '14px'
                }}>
                  Loading image...
                </div>
              )}
              
              {imageError && (
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
                  fontSize: '14px',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div>Image not available</div>
                  <div style={{
                    fontSize: '12px',
                    color: '#999',
                    textAlign: 'center',
                    padding: '0 10px'
                  }}>
                    Original scene visual could not be loaded
                  </div>
                </div>
              )}
              
              <img 
                src={imageUrl} 
                alt="Original scene"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: imageLoaded && !imageError ? 'block' : 'none'
                }}
                onLoad={() => {
                  setImageLoaded(true);
                  setImageError(false);
                }}
                onError={() => {
                  console.error('Failed to load image in RemakeEditor:', {
                    url: imageUrl,
                    imagePath: originalScene.image_path,
                    sceneId: originalScene.id
                  });
                  setImageError(true);
                  setImageLoaded(false);
                }}
              />
            </div>
          ) : (
            <div style={{
              width: '100%',
              height: '120px',
              borderRadius: '8px',
              marginBottom: '8px',
              backgroundColor: '#FAF8F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#55524F',
              fontFamily: 'Playfair Display, serif',
              fontSize: '14px',
              border: '1px dashed #E5E5E5'
            }}>
              No image available
            </div>
          )}
          
          <div style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '14px',
            color: '#55524F',
            lineHeight: '1.4',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {originalScene.description || 'No description provided'}
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
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
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
              cursor: contextText.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              if (contextText.trim()) {
                e.currentTarget.style.backgroundColor = '#333333';
              }
            }}
            onMouseOut={(e) => {
              if (contextText.trim()) {
                e.currentTarget.style.backgroundColor = '#1C1C1C';
              }
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