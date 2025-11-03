// src/components/CropModal.jsx
import React, { useState, useRef, useEffect } from 'react';

export default function CropModal({ imageSrc, onSave, onClose, open }) {
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const cropBoxRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [crop, setCrop] = useState({ x: 50, y: 50, size: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (open) {
      setIsLoading(true);
    }
  }, [open]);

  const handleImageLoad = () => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      setImageDimensions({ width: naturalWidth, height: naturalHeight });
      
      // Set initial crop to center with reasonable size
      const initialSize = Math.min(80, Math.min(naturalWidth, naturalHeight) * 0.8);
      setCrop({
        x: 50,
        y: 50,
        size: initialSize
      });
    }
    setIsLoading(false);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStart.x) / containerRect.width) * 100;
    const deltaY = ((e.clientY - dragStart.y) / containerRect.height) * 100;

    setCrop(prev => ({
      ...prev,
      x: Math.max(prev.size / 2, Math.min(100 - prev.size / 2, prev.x + deltaX)),
      y: Math.max(prev.size / 2, Math.min(100 - prev.size / 2, prev.y + deltaY))
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = -Math.sign(e.deltaY) * 2; // Invert scroll direction
    setCrop(prev => ({
      ...prev,
      size: Math.max(20, Math.min(95, prev.size + delta))
    }));
  };

  const handleSave = () => {
    if (imageRef.current && imageDimensions.width > 0) {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate actual pixel coordinates from percentages
        const cropSizePx = (crop.size / 100) * Math.min(imageDimensions.width, imageDimensions.height);
        const cropXPx = ((crop.x - crop.size / 2) / 100) * imageDimensions.width;
        const cropYPx = ((crop.y - crop.size / 2) / 100) * imageDimensions.height;
        
        canvas.width = cropSizePx;
        canvas.height = cropSizePx;
        
        // Draw cropped image
        ctx.drawImage(
          imageRef.current,
          cropXPx, cropYPx, cropSizePx, cropSizePx, // Source coordinates
          0, 0, cropSizePx, cropSizePx // Destination coordinates
        );
        
        const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
        onSave(croppedImageUrl);
      } catch (error) {
        console.error('Error cropping image:', error);
        alert('Error cropping image. Please try again.');
      }
    }
  };

  // Add event listeners for drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  if (!open) return null;

  // Modal styles
  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px',
  };

  const modalContentStyle = {
    backgroundColor: '#FFFFFF',
    padding: '24px',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  };

  const buttonStyle = {
    padding: '12px 24px',
    borderRadius: '8px',
    border: '1px solid rgba(0, 0, 0, 0.15)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: "'Cormorant', serif",
    fontWeight: '500',
    transition: 'all 0.2s ease',
    margin: '0 8px',
  };

  const saveButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
    border: '1px solid #1A1A1A',
  };

  const imageContainerStyle = {
    position: 'relative',
    maxWidth: '100%',
    maxHeight: '400px',
    overflow: 'hidden',
    marginBottom: '20px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isLoading ? '#FAF8F2' : 'transparent',
    minHeight: '300px',
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const cropBoxStyle = {
    position: 'absolute',
    left: `${crop.x - crop.size / 2}%`,
    top: `${crop.y - crop.size / 2}%`,
    width: `${crop.size}%`,
    height: `${crop.size}%`,
    border: '2px solid #FFFFFF',
    borderRadius: '50%',
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
    pointerEvents: 'none',
  };

  const handleStyle = {
    position: 'absolute',
    bottom: '-10px',
    right: '-10px',
    width: '20px',
    height: '20px',
    backgroundColor: '#FFFFFF',
    border: '2px solid #1A1A1A',
    borderRadius: '50%',
    cursor: 'nwse-resize',
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '20px',
          fontWeight: '700',
          color: '#1A1A1A',
          marginBottom: '16px',
          textAlign: 'center',
        }}>
          Adjust Your Profile Picture
        </h3>

        <div 
          ref={containerRef}
          style={imageContainerStyle}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
        >
          {isLoading && (
            <div style={{
              color: '#6B7280',
              fontFamily: "'Cormorant', serif",
              fontStyle: 'italic',
            }}>
              Loading image...
            </div>
          )}
          <img
            ref={imageRef}
            src={imageSrc}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%', 
              display: isLoading ? 'none' : 'block',
            }}
            alt="Crop preview"
            onLoad={handleImageLoad}
            onError={() => {
              setIsLoading(false);
              alert('Failed to load image. Please try another image.');
            }}
          />
          
          {!isLoading && (
            <div style={cropBoxStyle}>
              <div style={handleStyle} />
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}>
            <span style={{
              fontFamily: "'Cormorant', serif",
              fontSize: '14px',
              color: '#6B7280',
            }}>
              Zoom:
            </span>
            <span style={{
              fontFamily: "'Cormorant', serif",
              fontSize: '14px',
              fontWeight: '600',
              color: '#1A1A1A',
            }}>
              {Math.round(crop.size)}%
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="95"
            value={crop.size}
            onChange={(e) => setCrop(prev => ({ ...prev, size: parseInt(e.target.value) }))}
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              backgroundColor: '#FAF8F2',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '12px',
          marginTop: '20px'
        }}>
          <button 
            onClick={onClose} 
            style={buttonStyle}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            style={saveButtonStyle}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Save Crop'}
          </button>
        </div>

        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#FAF8F2',
          borderRadius: '8px',
        }}>
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: '#6B7280',
            fontFamily: "'Cormorant', serif",
            fontStyle: 'italic',
            textAlign: 'center',
            lineHeight: '1.4',
          }}>
            💡 <strong>Drag</strong> to move • <strong>Scroll</strong> or use slider to zoom<br/>
            The circular area will become your profile picture
          </p>
        </div>
      </div>
    </div>
  );
}