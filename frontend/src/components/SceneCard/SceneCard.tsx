import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FeedScene } from '../../utils/feedActions';
import RemakeEditor from '../RemakeEditor/RemakeEditor';
import { useDeleteItem } from '../../hooks/useDeleteItem';
import { useSaveItem } from '../../hooks/useSaveItem';
import { useSavedStatus } from '../../hooks/useSavedStatus';
import { useCopyLink } from '../../hooks/useCopyLink';
import { useReportItem } from '../../hooks/useReportItem';
import ReportDialog from '../ReportDialog/ReportDialog';
import { useLikeItem } from '../../hooks/useLikeItem';
import { useLikesStatus } from '../../hooks/useLikesStatus';
import { useCommentItem } from '../../hooks/useCommentItem';
import { useCommentsStatus } from '../../hooks/useCommentsStatus';
import { useShareItem } from '../../hooks/useShareItem';
import { useShareStatus } from '../../hooks/useShareStatus';
import CommentsSection from '../Comments/CommentsSection';
import ShareDialog from '../Shares/ShareDialog';

const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < intervals.hour) {
    const minutes = Math.floor(diffInSeconds / intervals.minute);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < intervals.day) {
    const hours = Math.floor(diffInSeconds / intervals.hour);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInSeconds < intervals.week) {
    const days = Math.floor(diffInSeconds / intervals.day);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else if (diffInSeconds < intervals.month) {
    const weeks = Math.floor(diffInSeconds / intervals.week);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffInSeconds < intervals.year) {
    const months = Math.floor(diffInSeconds / intervals.month);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    const years = Math.floor(diffInSeconds / intervals.year);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
};

const SceneDescription: React.FC<{ text: string }> = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 120;
  const maxLines = 3;

  const needsTruncation = text.length > maxLength;
  const displayText = isExpanded ? text : 
    (text.length > maxLength ? `${text.substring(0, maxLength)}...` : text);

  return (
    <div>
      <div style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: '14px',
        fontWeight: 400,
        color: '#55524F',
        lineHeight: '1.4',
        maxHeight: isExpanded ? 'none' : `${maxLines * 1.4}em`,
        overflow: 'hidden',
        whiteSpace: 'pre-line'
      }}>
        {displayText}
      </div>
      
      {needsTruncation && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'none',
            border: 'none',
            color: '#1C1C1C',
            fontFamily: 'Playfair Display, serif',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '4px 0',
            marginTop: '4px',
            textDecoration: 'underline'
          }}
        >
          {isExpanded ? 'Read Less' : 'Read More'}
        </button>
      )}
    </div>
  );
};

const MenuIcon = () => (
  <svg width="20" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="6" r="1"/>
    <circle cx="12" cy="12" r="1"/>
    <circle cx="12" cy="18" r="1"/>
  </svg>
);

const LikeIcon: React.FC<{ filled?: boolean }> = ({ filled = false }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "#FF4444" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const CommentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>
  </svg>
);

interface SceneCardProps {
  scene: FeedScene;
  currentUserId?: string;
  onAction?: (action: string, sceneId: string, contextText?: string) => void;
}

const SceneCard: React.FC<SceneCardProps> = React.memo(({ scene, currentUserId, onAction }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showRemakeEditor, setShowRemakeEditor] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  // ADDED: Gallery state for image opening (simplified for single image)
  const [galleryOpen, setGalleryOpen] = useState(false);
  
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // ADDED: Debug logging for images
  useEffect(() => {
    if (scene.image_path) {
      console.log('SceneCard image debug:', {
        id: scene.id,
        image_path: scene.image_path,
        fullUrl: getImageUrl(scene.image_path)
      });
    }
  }, [scene]);

  const { deleteItem } = useDeleteItem();
  const { saveItem, unsaveItem } = useSaveItem();
  const { isSaved } = useSavedStatus('scene', scene.id);
  const { copyLink } = useCopyLink();
  const { reportItem } = useReportItem();

  const likeMutation = useLikeItem();
  const { data: likesData } = useLikesStatus({ 
    content_type: 'scene', 
    content_id: scene.id 
  });
  
  const commentMutation = useCommentItem();
  const { data: commentsData } = useCommentsStatus({ 
    content_type: 'scene', 
    content_id: scene.id 
  });
  
  const shareMutation = useShareItem();
  const { data: sharesData } = useShareStatus({ 
    content_type: 'scene', 
    content_id: scene.id 
  });

  const isOwner = currentUserId && scene.user_id === currentUserId;
  const isRemakeScene = !!scene.original_scene_id;
  const hasOriginalSceneData = isRemakeScene && scene.original_scene_data;

  const menuOptions = isOwner 
    ? ['Edit', 'Delete', 'Save', 'Copy Link', 'Report']
    : ['Save', 'Copy Link', 'Report'];

  // ADDED: Image URL helper function
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    // Check if it's already a full URL
    if (imagePath.startsWith('http')) return imagePath;
    return `https://ycrvsbtqmjksdbyrefek.supabase.co/storage/v1/object/public/scene-images/${imagePath}`;
  };

  // ADDED: Simple gallery handler for single image
  const openGallery = useCallback(() => {
    if (scene.image_path) {
      setGalleryOpen(true);
    }
  }, [scene.image_path]);

  // ADDED: Keyboard navigation for gallery
  useEffect(() => {
    if (!galleryOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setGalleryOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [galleryOpen]);

  // ADDED: Profile click handler
  const handleProfileClick = useCallback(() => {
    navigate(`/profile/${scene.user_id}`);
  }, [navigate, scene.user_id]);

  const handleSave = useCallback(async () => {
    if (!currentUserId) {
      return;
    }

    try {
      if (isSaved) {
        await unsaveItem({ content_type: 'scene', content_id: scene.id });
      } else {
        await saveItem({ content_type: 'scene', content_id: scene.id });
      }
    } catch (error) {
      console.error('Save operation failed:', error);
    }
  }, [isSaved, scene.id, currentUserId, saveItem, unsaveItem]);

  const handleMenuAction = useCallback(async (action: string) => {
    setShowMenu(false);
    
    if (action === 'Delete') {
      if (window.confirm('Are you sure you want to delete this scene? This action cannot be undone.')) {
        const success = await deleteItem(scene.id, 'scene');
        if (success) {
          alert('Scene deleted successfully.');
          onAction?.('deleted', scene.id);
        } else {
          alert('Failed to delete scene. Please try again.');
        }
      }
    } else if (action === 'Save') {
      await handleSave();
    } else if (action === 'Copy Link') {
      await copyLink('scene', scene.id);
    } else if (action === 'Report') {
      setShowReportDialog(true);
    } else {
      onAction?.(action, scene.id);
    }
  }, [scene.id, deleteItem, onAction, handleSave, copyLink]);

  const handleReport = useCallback(async (reason: string) => {
    await reportItem('scene', scene.id, reason);
  }, [scene.id, reportItem]);

  const toggleMenu = useCallback(() => setShowMenu(prev => !prev), []);
  const closeMenu = useCallback(() => setShowMenu(false), []);

  const handleLike = useCallback(() => {
    likeMutation.mutate({ 
      content_type: 'scene', 
      content_id: scene.id 
    });
  }, [likeMutation, scene.id]);

  const handleComment = useCallback(() => {
    setShowCommentDialog(true);
  }, []);

  const handleCommentSubmit = useCallback((commentText: string) => {
    commentMutation.mutate({
      content_type: 'scene',
      content_id: scene.id,
      content: commentText
    });
  }, [commentMutation, scene.id]);

  const handleShare = useCallback(() => {
    setShowShareDialog(true);
  }, []);

  const handleShareSubmit = useCallback(() => {
    shareMutation.mutate({
      content_type: 'scene',
      content_id: scene.id
    }, {
      onSuccess: () => {
        setShowShareDialog(false);
      }
    });
  }, [shareMutation, scene.id]);

  const handleRemake = useCallback(() => {
    setShowRemakeEditor(true);
  }, []);

  const handleRemakePost = useCallback((contextText: string) => {
    setShowRemakeEditor(false);
    onAction?.('remake', scene.id, contextText);
  }, [scene.id, onAction]);

  const handleRemakeCancel = useCallback(() => {
    setShowRemakeEditor(false);
  }, []);

  const handleOriginalSceneClick = useCallback(() => {
    if (hasOriginalSceneData) {
      onAction?.('view_original', scene.original_scene_data!.id);
    }
  }, [hasOriginalSceneData, scene.original_scene_data, onAction]);

  useEffect(() => {
    if (!showMenu) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const clickedOutsideButton = menuButtonRef.current && 
        !menuButtonRef.current.contains(event.target as Node);
      
      const clickedOutsideMenu = menuContainerRef.current && 
        !menuContainerRef.current.contains(event.target as Node);
      
      if (clickedOutsideButton && clickedOutsideMenu) {
        closeMenu();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu, closeMenu]);

  return (
    <>
      {showRemakeEditor && (
        <RemakeEditor
          originalScene={scene}
          onPost={handleRemakePost}
          onCancel={handleRemakeCancel}
        />
      )}
      
      {showCommentDialog && (
        <CommentsSection
          isOpen={showCommentDialog}
          onClose={() => setShowCommentDialog(false)}
          contentType="scene"
          contentId={scene.id}
          onSubmitComment={handleCommentSubmit}
          isLoading={commentMutation.isPending}
        />
      )}
      
      {showShareDialog && (
        <ShareDialog
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          onShare={handleShareSubmit}
          shareUrl={`${window.location.origin}/scene/${scene.id}`}
          content={{
            title: scene.title,
            excerpt: scene.description || scene.title,
            images: scene.image_path ? [getImageUrl(scene.image_path)] : []
          }}
          creator={{
            name: scene.user_name,
            genre: scene.user_genre_tag
          }}
          contentType="scene"
          targetElementId={`card-scene-${scene.id}`}
        />
      )}
      
      {/* NEUTRAL: Scene Card Layout */}
      <div 
        id={`card-scene-${scene.id}`}
        style={{
          width: 'calc(100% + 32px)',
          minHeight: scene.image_path ? '420px' : '320px',
          marginLeft: '-16px',
          marginRight: '-16px',
          backgroundColor: '#FAF8F2',
          borderRadius: '12px',
          padding: '20px',
          boxSizing: 'border-box',
          position: 'relative',
          borderTop: '2px solid #E5E5E5',
          background: '#FAF8F2',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
        }}
      >
        {/* NEUTRAL: Scene indicator header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '2px',
            backgroundColor: '#55524F',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '10px', color: 'white' }}>🎬</span>
          </div>
          <span style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '11px',
            color: '#55524F',
            fontWeight: '500',
            letterSpacing: '0.3px'
          }}>
            SCENE
          </span>
        </div>

        {isRemakeScene && (
          <div 
            onClick={handleOriginalSceneClick}
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '11px',
              color: '#6B7280',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              padding: '6px 8px',
              backgroundColor: '#FAFAFA',
              borderRadius: '6px',
              border: '1px solid #E5E5E5'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#000000';
              e.currentTarget.style.backgroundColor = '#F0F0F0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6B7280';
              e.currentTarget.style.backgroundColor = '#FAFAFA';
            }}
          >
            <span>🔄</span>
            <span>
              Remake of{' '}
              <span style={{ 
                fontWeight: '500', 
                color: '#000000',
                textDecoration: 'underline'
              }}>
                {hasOriginalSceneData ? scene.original_scene_data!.user_name : 'original scene'}
              </span>
            </span>
          </div>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div 
              onClick={handleProfileClick}
              role="img"
              aria-label={`${scene.user_name}'s avatar`}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: '#F0F0F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                border: '1.5px solid #E5E5E5',
                cursor: 'pointer'
              }}
            >
              {scene.user_avatar && scene.user_avatar !== '/default-avatar.png' ? (
                <img 
                  src={scene.user_avatar}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <span style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#55524F'
                }}>
                  {scene.user_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            <div 
              onClick={handleProfileClick}
              style={{ 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer'
              }}
            >
              <span style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '20px',
                fontWeight: 400,
                color: '#000000',
                lineHeight: '1.2'
              }}>
                {scene.user_name}
              </span>
              <span style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '13px',
                fontWeight: 400,
                color: '#6B7280',
                lineHeight: '1.2',
                marginTop: '2px'
              }}>
                {scene.user_genre_tag}
              </span>
            </div>
          </div>

          <div style={{ position: 'relative' }} ref={menuContainerRef}>
            <button 
              ref={menuButtonRef}
              onClick={toggleMenu}
              aria-label="More options"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: '#000000',
                borderRadius: '4px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F0F0F0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <MenuIcon />
            </button>
            
            {showMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '30px',
                backgroundColor: 'white',
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                padding: '6px 0',
                minWidth: '140px',
                zIndex: 1000,
                border: '1px solid #E5E5E5'
              }}>
                {menuOptions.map((option: string) => (
                  <button
                    key={option}
                    onClick={() => handleMenuAction(option)}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      padding: '6px 12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontFamily: 'Arial, sans-serif',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F0F0F0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {isRemakeScene && scene.context_text && (
          <div style={{
            marginBottom: '16px',
            padding: '12px 14px',
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: '6px',
            border: '1px solid #E5E5E5'
          }}>
            <div style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '14px',
              fontWeight: 400,
              color: '#55524F',
              lineHeight: '1.4',
              fontStyle: 'italic'
            }}>
              "{scene.context_text}"
            </div>
          </div>
        )}

        <div style={{ marginBottom: scene.image_path ? '16px' : '0' }}>
          <div style={{
            fontFamily: "'Cormorant', serif",
            fontSize: '20px',
            fontWeight: 600,
            color: '#000000',
            marginBottom: '8px',
            lineHeight: '1.3',
            letterSpacing: '0.02em',
            borderBottom: '1px solid #E5E5E5',
            paddingBottom: '4px'
          }}>
            {scene.title.length > 60 
              ? `${scene.title.substring(0, 60)}...` 
              : scene.title
            }
          </div>
          
          {(scene.description && scene.description.trim() !== '') ? (
            <SceneDescription text={scene.description} />
          ) : (
            <div style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '14px',
              fontWeight: 400,
              color: '#9CA3AF',
              fontStyle: 'italic',
              lineHeight: '1.4'
            }}>
              No description provided
            </div>
          )}
        </div>

        {/* UPDATED: Image presentation - Now clickable */}
        {scene.image_path && (
          <div 
            style={{
              width: '100%',
              height: '200px',
              borderRadius: '8px',
              marginBottom: '16px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #E5E5E5',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onClick={openGallery}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.01)';
              e.currentTarget.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
          >
            <img 
              src={getImageUrl(scene.image_path)}
              alt={scene.title}
              loading="lazy"
              decoding="async"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            
            {/* Hover overlay with zoom icon */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0)',
              transition: 'background-color 0.2s ease',
              pointerEvents: 'none'
            }}>
              <div style={{
                opacity: 0,
                transform: 'scale(0.8)',
                transition: 'opacity 0.2s ease, transform 0.2s ease',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}>
                <span style={{ fontSize: '18px', color: '#000' }}>🔍</span>
              </div>
            </div>
          </div>
        )}

        {isRemakeScene && hasOriginalSceneData && (
          <div 
            onClick={handleOriginalSceneClick}
            style={{
              marginTop: '8px',
              padding: '8px 10px',
              backgroundColor: '#FAFAFA',
              borderRadius: '6px',
              border: '1px solid #E5E5E5',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F0F0F0';
              e.currentTarget.style.borderColor = '#D6D6D6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FAFAFA';
              e.currentTarget.style.borderColor = '#E5E5E5';
            }}
          >
            <div style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '12px',
              color: '#6B7280',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>Based on:</span>
              <span style={{ 
                fontWeight: '500', 
                color: '#000000',
                textDecoration: 'underline'
              }}>
                "{scene.original_scene_data!.title}" by {scene.original_scene_data!.user_name}
              </span>
            </div>
          </div>
        )}

        {/* NEUTRAL: Action bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid #E5E5E5'
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={handleLike}
              disabled={likeMutation.isPending}
              aria-label={likesData?.hasLiked ? 'Unlike' : 'Like'}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 6px',
                borderRadius: '4px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F0F0F0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <LikeIcon filled={likesData?.hasLiked} />
              <span style={{ 
                fontSize: '11px',
                color: likesData?.hasLiked ? '#FF4444' : '#000000',
                fontFamily: 'Arial, sans-serif',
                minWidth: '14px',
                fontWeight: likesData?.hasLiked ? '500' : '400'
              }}>
                {likesData?.likeCount || 0}
              </span>
            </button>
            
            <button 
              onClick={handleComment}
              aria-label="Comment"
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 6px',
                borderRadius: '4px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F0F0F0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <CommentIcon />
              <span style={{ 
                fontSize: '11px',
                color: '#000000',
                fontFamily: 'Arial, sans-serif',
                minWidth: '14px'
              }}>
                {commentsData?.commentCount || 0}
              </span>
            </button>
            
            <button 
              onClick={handleShare}
              disabled={shareMutation.isPending}
              aria-label="Share"
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 6px',
                borderRadius: '4px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F0F0F0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <ShareIcon />
              <span style={{ 
                fontSize: '11px',
                color: '#000000',
                fontFamily: 'Arial, sans-serif',
                minWidth: '14px'
              }}>
                {sharesData?.shareCount || 0}
              </span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              fontSize: '10px',
              color: '#9CA3AF',
              fontFamily: 'Arial, sans-serif'
            }}>
              {getRelativeTime(scene.created_at)}
            </div>

            {!isRemakeScene && (
              <button 
                onClick={handleRemake}
                aria-label="Remake"
                style={{ 
                  background: '#FAFAFA',
                  border: '1px solid #E5E5E5',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F0F0F0';
                  e.currentTarget.style.borderColor = '#D6D6D6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FAFAFA';
                  e.currentTarget.style.borderColor = '#E5E5E5';
                }}
              >
                <span style={{ 
                  fontSize: '11px',
                  color: '#000000',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: '500'
                }}>
                  Remake
                </span>
                <span style={{ 
                  fontSize: '11px',
                  color: '#000000',
                  fontFamily: 'Arial, sans-serif',
                  minWidth: '14px'
                }}>
                  {scene.remake_count}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* UPDATED: Add Gallery Modal for single image */}
      {galleryOpen && scene.image_path && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            cursor: 'pointer'
          }}
          onClick={() => setGalleryOpen(false)}
        >
          {/* Main image */}
          <div style={{ position: 'relative' }}>
            <img 
              src={getImageUrl(scene.image_path)}
              alt={`Scene: ${scene.title}`}
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Image info */}
            <div style={{
              position: 'absolute',
              bottom: '-50px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontFamily: "'Cormorant', serif",
              textAlign: 'center',
              maxWidth: '80vw'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {scene.title}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                by {scene.user_name}
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => setGalleryOpen(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            ×
          </button>
          
          {/* Download button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const link = document.createElement('a');
              link.href = getImageUrl(scene.image_path!);
              link.download = `scene-${scene.title.toLowerCase().replace(/\s+/g, '-')}.jpg`;
              link.click();
            }}
            style={{
              position: 'absolute',
              top: '20px',
              right: '70px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            ⬇
          </button>
          
          {/* Share button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (navigator.share) {
                navigator.share({
                  title: scene.title,
                  text: scene.description || 'Check out this scene from writeFrame!',
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Scene link copied to clipboard!');
              }
            }}
            style={{
              position: 'absolute',
              top: '20px',
              right: '120px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            ↗
          </button>
        </div>
      )}

      {showReportDialog && (
        <ReportDialog
          isOpen={showReportDialog}
          onClose={() => setShowReportDialog(false)}
          onReport={handleReport}
          contentType="scene"
        />
      )}
    </>
  );
});

SceneCard.displayName = 'SceneCard';

export default SceneCard;
