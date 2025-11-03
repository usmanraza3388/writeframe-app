// src/components/GridItem.jsx
import React, { memo, useState } from 'react';

const GridItem = memo(({ item, type, onCardClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Use DIRECT field access for engagement metrics
  const likeCount = item.like_count || 0;
  const commentCount = item.comment_count || 0;
  const totalEngagement = likeCount + commentCount;

  // Get content type configuration
  const getContentTypeConfig = () => {
    const configs = {
      scenes: {
        gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
        icon: '🎬',
        label: 'Scene',
        title: item.title,
        description: item.description,
        engagement: totalEngagement,
        likeCount: likeCount,
        commentCount: commentCount
      },
      monologues: {
        gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
        icon: '🎭',
        label: 'Monologue',
        title: item.title,
        description: item.content_text,
        engagement: totalEngagement,
        likeCount: likeCount,
        commentCount: commentCount
      },
      characters: {
        gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
        icon: '👤',
        label: 'Character',
        title: item.name, // Characters use 'name' instead of 'title'
        description: item.tagline || item.bio,
        engagement: totalEngagement,
        likeCount: likeCount,
        commentCount: commentCount
      },
      frames: {
        gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        icon: '🖼️',
        label: 'Frame',
        // ✅ USE MOOD DESCRIPTION AS TITLE (primary content)
        title: item.mood_description || 'Visual Frame',
        // ✅ NO DESCRIPTION NEEDED
        description: null,
        engagement: totalEngagement,
        likeCount: likeCount,
        commentCount: commentCount
      }
    };
    return configs[type] || configs.scenes;
  };

  // NEW: Check if item is a remake or repost
  const getActionBadgeConfig = () => {
    // Check for scene remakes
    if (type === 'scenes' && item.original_scene_id) {
      return { label: '🔄 Remade', color: '#10B981' };
    }
    
    // Check for reposts (using user_has_reposted flag or other indicators)
    if (item.user_has_reposted) {
      return { label: '🔄 Reposted', color: '#3B82F6' };
    }
    
    return null;
  };

  // Get image URL based on content type
  const getImageUrl = () => {
    switch (type) {
      case 'scenes':
        return item.image_path ? 
          `https://ycrvsbtqmjksdbyrefek.supabase.co/storage/v1/object/public/scene-images/${item.image_path}` : 
          null;
      
      case 'characters':
        return item.visual_references?.[0]?.image_url || null;
      
      case 'frames':
        return item.image_url || item.image_urls?.[0] || null;
      
      case 'monologues':
      default:
        return null; // Monologues have no images
    }
  };

  const config = getContentTypeConfig();
  const actionBadge = getActionBadgeConfig(); // NEW: Get action badge config
  const imageUrl = getImageUrl();
  const hasImage = imageUrl && !imageError;
  const displayTitle = config.title || 'Untitled';
  const displayDescription = config.description ? 
    (config.description.length > 80 ? `${config.description.substring(0, 80)}...` : config.description) 
    : 'No description';

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const containerStyle = {
    position: 'relative',
    width: '100%',
    aspectRatio: '1 / 1', // 1:1 square
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column'
  };

  const hoverStyle = {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
  };

  const imageContainerStyle = {
    width: '100%',
    height: '60%',
    position: 'relative',
    overflow: 'hidden',
    background: hasImage ? '#f8fafc' : config.gradient,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: imageLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease'
  };

  const placeholderStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    gap: '8px'
  };

  const placeholderIconStyle = {
    fontSize: '24px',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
  };

  const placeholderLabelStyle = {
    fontSize: '12px',
    fontWeight: '600',
    opacity: 0.9,
    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
  };

  const badgeStyle = {
    position: 'absolute',
    top: '8px',
    left: '8px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(8px)',
    borderRadius: '20px',
    padding: '4px 8px',
    fontSize: '10px',
    fontWeight: '600',
    color: '#1A1A1A',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    zIndex: 2
  };

  // NEW: Action badge style for remake/repost
  const actionBadgeStyle = {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: actionBadge?.color || '#6B7280',
    color: 'white',
    borderRadius: '12px',
    padding: '3px 8px',
    fontSize: '9px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    zIndex: 2
  };

  const contentStyle = {
    flex: 1,
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  };

  const titleStyle = {
    fontFamily: "'Cormorant', serif",
    fontSize: '14px',
    fontWeight: '600',
    color: '#1A1A1A',
    lineHeight: '1.3',
    margin: '0 0 4px 0',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  };

  const descriptionStyle = {
    fontFamily: "'Cormorant', serif",
    fontSize: '11px',
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: '1.3',
    margin: '0 0 8px 0',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  };

  const engagementStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
    color: '#9CA3AF',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '500'
  };

  const engagementItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '2px'
  };

  return (
    <div 
      style={containerStyle}
      onClick={() => onCardClick(item, type)}
      onMouseEnter={(e) => {
        Object.assign(e.currentTarget.style, hoverStyle);
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, containerStyle);
      }}
      aria-label={`${config.label}: ${displayTitle}`}
      role="article"
    >
      {/* Content Type Badge */}
      <div style={badgeStyle}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </div>

      {/* NEW: Action Badge (Remake/Repost) */}
      {actionBadge && (
        <div style={actionBadgeStyle}>
          <span>{actionBadge.label}</span>
        </div>
      )}

      {/* Image or Gradient Placeholder */}
      <div style={imageContainerStyle}>
        {hasImage ? (
          <img
            src={imageUrl}
            alt={displayTitle}
            style={imageStyle}
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div style={placeholderStyle}>
            <span style={placeholderIconStyle}>{config.icon}</span>
            <span style={placeholderLabelStyle}>{config.label}</span>
          </div>
        )}
      </div>

      {/* Content Info */}
      <div style={contentStyle}>
        <div>
          <h3 style={titleStyle}>
            {displayTitle}
          </h3>
          {/* Conditionally render description - hide for frames */}
          {config.description && (
            <p style={descriptionStyle}>
              {displayDescription}
            </p>
          )}
        </div>
        
        {/* Engagement Metrics - USING DIRECT FIELD ACCESS */}
        <div style={engagementStyle}>
          <div style={engagementItemStyle}>
            <span>❤️</span>
            <span>{likeCount}</span>
          </div>
          <div style={engagementItemStyle}>
            <span>💬</span>
            <span>{commentCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

GridItem.displayName = 'GridItem';

export default GridItem;