import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ADDED: Import useNavigate
import type { FrameCardProps } from '../../utils/frames';
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
import { useFrame } from '../../hooks/useFrame'; // ADDED: Import useFrame hook

// ADDED: Relative time utility function
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

// SVG Icons (same as MonologueCard for consistency)
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

// ENHANCED: RepostIcon with filled prop
const RepostIcon: React.FC<{ filled?: boolean }> = ({ filled = false }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "#10B981" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M17 1l4 4-4 4"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="6" r="1"/>
    <circle cx="12" cy="12" r="1"/>
    <circle cx="12" cy="18" r="1"/>
  </svg>
);

const FrameCard: React.FC<FrameCardProps> = React.memo(({ 
  frame, 
  currentUserId, 
  onAction 
}) => {
  const navigate = useNavigate(); // ADDED: Navigation hook
  const [showMenu, setShowMenu] = useState(false);
  // REMOVED: Mock like and repost states
  // ADDED: New dialog states
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isReposting, setIsReposting] = useState(false); // ADDED: Loading state for repost
  
  // ADD: Refs for click outside detection (same as other cards)
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // EXISTING HOOKS
  const { deleteItem } = useDeleteItem();
  const { saveItem, unsaveItem } = useSaveItem();
  const { isSaved } = useSavedStatus('frame', frame.id);
  const { copyLink } = useCopyLink();
  const { reportItem } = useReportItem();

  // ADDED: Use frame hook for repost functionality
  const { repostFrame, deleteRepost, repostedFrames } = useFrame();

  // NEW ENGAGEMENT HOOKS
  const likeMutation = useLikeItem();
  const { data: likesData } = useLikesStatus({ 
    content_type: 'frame', 
    content_id: frame.id 
  });
  
  const commentMutation = useCommentItem();
  const { data: commentsData } = useCommentsStatus({ 
    content_type: 'frame', 
    content_id: frame.id 
  });
  
  const shareMutation = useShareItem();
  const { data: sharesData } = useShareStatus({ 
    content_type: 'frame', 
    content_id: frame.id 
  });

  const isOwner = frame.user_id === currentUserId;

  // FIXED: Get user data with correct priority for full name display
  const userData = useMemo(() => ({
    // FIX: Use full_name first, then fall back to flat user_name, then username
    userName: frame.user?.full_name || frame.user_name || frame.user?.username || 'Unknown User',
    userGenre: frame.user_genre_tag || frame.user?.genre_persona || 'Creator',
    userAvatar: frame.avatar_url || frame.user?.avatar_url
  }), [frame.user_name, frame.user_genre_tag, frame.avatar_url, frame.user]);

  // Memoized menu options (same as SceneCard)
  const menuOptions = useMemo(() => 
    isOwner 
      ? ['Edit', 'Delete', 'Save', 'Copy Link', 'Report']
      : ['Save', 'Copy Link', 'Report'],
    [isOwner]
  );

  // ADDED: Profile click handler
  const handleProfileClick = useCallback(() => {
    navigate(`/profile/${frame.user_id}`);
  }, [navigate, frame.user_id]);

  // ADD: Handle save action
  const handleSave = useCallback(async () => {
    if (!currentUserId) {
      return;
    }

    try {
      if (isSaved) {
        await unsaveItem({ content_type: 'frame', content_id: frame.id });
      } else {
        await saveItem({ content_type: 'frame', content_id: frame.id });
      }
    } catch (error) {
      console.error('Save operation failed:', error);
    }
  }, [isSaved, frame.id, currentUserId, saveItem, unsaveItem]);

  // UPDATE: Enhanced handleMenuAction with report functionality
  const handleMenuAction = useCallback(async (action: string) => {
    setShowMenu(false);
    
    if (action === 'Delete') {
      if (window.confirm('Are you sure you want to delete this frame? This action cannot be undone.')) {
        const success = await deleteItem(frame.id, 'frame');
        if (success) {
          alert('Frame deleted successfully.');
          onAction?.('deleted', frame.id); // Notify parent to remove from feed
        } else {
          alert('Failed to delete frame. Please try again.');
        }
      }
    } else if (action === 'Save') {
      await handleSave();
    } else if (action === 'Copy Link') {
      await copyLink('frame', frame.id);
    } else if (action === 'Report') {
      setShowReportDialog(true);
    } else {
      // Handle other actions (Edit, etc.)
      onAction?.(action, frame.id);
    }
  }, [frame.id, deleteItem, onAction, handleSave, copyLink]);

  // ADD: Handle report
  const handleReport = useCallback(async (reason: string) => {
    await reportItem('frame', frame.id, reason);
  }, [frame.id, reportItem]);

  const toggleMenu = useCallback(() => setShowMenu(prev => !prev), []);
  const closeMenu = useCallback(() => setShowMenu(false), []);

  // UPDATED: Real like handler
  const handleLike = useCallback(() => {
    likeMutation.mutate({ 
      content_type: 'frame', 
      content_id: frame.id 
    });
  }, [likeMutation, frame.id]);

  // UPDATED: Real comment handler
  const handleComment = useCallback(() => {
    setShowCommentDialog(true);
  }, []);

  // UPDATED: Comment submit handler - removed auto-close since CommentsSection handles it
  const handleCommentSubmit = useCallback((commentText: string) => {
    commentMutation.mutate({
      content_type: 'frame',
      content_id: frame.id,
      content: commentText
    });
    // CommentsSection will handle closing itself after successful post
  }, [commentMutation, frame.id]);

  // UPDATED: Real share handler
  const handleShare = useCallback(() => {
    setShowShareDialog(true);
  }, []);

  // UPDATED: Share submit handler - REMOVED copyLink from engagement flow
  const handleShareSubmit = useCallback(() => {
    shareMutation.mutate({
      content_type: 'frame',
      content_id: frame.id
    }, {
      onSuccess: () => {
        setShowShareDialog(false);
        // REMOVED: copyLink('frame', frame.id); - Now only in three-dot menu
      }
    });
  }, [shareMutation, frame.id]); // REMOVED: copyLink dependency

  // UPDATED: Toggle repost handler - repost/undo in one tap
  const handleRepost = useCallback(async () => {
    if (!currentUserId) return;
    
    setIsReposting(true);
    try {
      // Check if user has reposted this frame
      const userHasReposted = repostedFrames.some(repost => 
        repost.original_frame?.id === frame.id
      );
      
      if (userHasReposted) {
        // Find the repost ID to delete
        const userRepost = repostedFrames.find(repost => 
          repost.original_frame?.id === frame.id
        );
        
        if (userRepost) {
          const success = await deleteRepost(userRepost.id);
          if (success) {
            onAction?.('unrepost', frame.id);
          }
        }
      } else {
        // Create new repost
        const success = await repostFrame(frame.id);
        if (success) {
          onAction?.('repost', frame.id);
        }
      }
    } catch (error) {
      console.error('Error toggling repost:', error);
    } finally {
      setIsReposting(false);
    }
  }, [
    frame.id, 
    currentUserId, 
    repostFrame, 
    deleteRepost, 
    repostedFrames, 
    onAction
  ]);

  // FIXED: Proper click outside handler using refs (same as other cards)
  useEffect(() => {
    if (!showMenu) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside both menu button and menu container
      const clickedOutsideButton = menuButtonRef.current && 
        !menuButtonRef.current.contains(event.target as Node);
      
      const clickedOutsideMenu = menuContainerRef.current && 
        !menuContainerRef.current.contains(event.target as Node);
      
      // Only close if clicked outside both elements
      if (clickedOutsideButton && clickedOutsideMenu) {
        closeMenu();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu, closeMenu]);

  // Get images for the 2x2 grid (up to 4 images)
  const displayImages = useMemo(() => {
    const images = frame.image_urls?.slice(0, 4) || [];
    // If no image_urls, fall back to the main image_url
    if (images.length === 0 && frame.image_url) {
      return [frame.image_url];
    }
    return images;
  }, [frame.image_urls, frame.image_url]);

  // Check if user has reposted this frame
  const userHasReposted = useMemo(() => 
    repostedFrames.some(repost => repost.original_frame?.id === frame.id),
    [repostedFrames, frame.id]
  );

  return (
    <>
      {/* UPDATED DIALOGS - Replaced CommentDialog with CommentsSection */}
      {showCommentDialog && (
        <CommentsSection
          isOpen={showCommentDialog}
          onClose={() => setShowCommentDialog(false)}
          contentType="frame"
          contentId={frame.id}
          onSubmitComment={handleCommentSubmit}
          isLoading={commentMutation.isPending}
        />
      )}
      
      {showShareDialog && (
        <ShareDialog
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          onShare={handleShareSubmit}
          shareUrl={`${window.location.origin}/frame/${frame.id}`}
          // UPDATED: Use flat properties for social sharing
          content={{
            title: frame.mood_description || frame.title || 'Cinematic Frame',
            excerpt: frame.mood_description || frame.title || 'Cinematic frame from writeFrame',
            images: displayImages
          }}
          creator={{
            name: userData.userName, // UPDATED: Use flat property
            genre: userData.userGenre // UPDATED: Use flat property
          }}
          contentType="frame"
          targetElementId={`card-frame-${frame.id}`} // ← ADDED: Pass the card element ID
        />
      )}

      {/* MINIMAL: Visual Frame Card Layout - FIXED: Changed height to minHeight and added flex layout */}
      <article 
        id={`card-frame-${frame.id}`} // ← ADDED: Unique ID for card capture
        style={{
          width: 'calc(100% + 32px)',
          minHeight: '380px', // ← FIXED: Changed from height to minHeight
          marginLeft: '-16px',
          marginRight: '-16px',
          backgroundColor: '#FAF8F2',
          borderRadius: '12px',
          padding: '20px',
          boxSizing: 'border-box',
          position: 'relative',
          borderTop: '2px solid #E5E5E5',
          background: '#FAF8F2',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          display: 'flex', // ← FIXED: Added flex layout
          flexDirection: 'column' // ← FIXED: Stack children vertically
        }}
        aria-label={`Cinematic collage by ${userData.userName}: ${frame.mood_description}`}
        role="article"
      >
        {/* MINIMAL: Frame collage indicator header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
          flexShrink: 0 // ← FIXED: Prevent from shrinking
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
            <span style={{ fontSize: '10px', color: 'white' }}>🖼️</span>
          </div>
          <span style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '11px',
            color: '#55524F',
            fontWeight: '500',
            letterSpacing: '0.3px'
          }}>
            VISUAL FRAME
          </span>
        </div>

        {/* Header Section */}
        <header style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexShrink: 0 // ← FIXED: Prevent header from shrinking
        }}>
          {/* User Info */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            {/* Avatar - UPDATED: Now clickable */}
            <div 
              onClick={handleProfileClick}
              role="img"
              aria-label={`${userData.userName}'s avatar`}
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
                cursor: 'pointer' // ADDED: Show it's clickable
              }}
            >
              {userData.userAvatar ? (
                <img 
                  src={userData.userAvatar} 
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
                  {userData.userName?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            
            {/* Name and Genre - UPDATED: Now clickable */}
            <div 
              onClick={handleProfileClick}
              style={{ 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer' // ADDED: Show it's clickable
              }}
            >
              <h3 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '20px',
                fontWeight: 400,
                color: '#000000',
                lineHeight: '1.2',
                margin: 0
              }}>
                {userData.userName}
              </h3>
              <span style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '13px',
                fontWeight: 400,
                color: '#6B7280',
                lineHeight: '1.2',
                marginTop: '2px'
              }}>
                {userData.userGenre}
              </span>
            </div>
          </div>

          {/* Three Dots Menu */}
          <div style={{ position: 'relative' }} ref={menuContainerRef}>
            <button 
              ref={menuButtonRef}
              onClick={toggleMenu}
              aria-label="More options"
              aria-expanded={showMenu}
              aria-haspopup="true"
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
            
            {/* Dropdown Menu */}
            {showMenu && (
              <div 
                role="menu"
                aria-label="Frame options"
                style={{
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
                }}
              >
                {menuOptions.map((option) => (
                  <button
                    key={option}
                    role="menuitem"
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
        </header>

        {/* MINIMAL: Mood Description as Title */}
        {frame.mood_description && (
          <div style={{ 
            marginBottom: '16px',
            minHeight: '20px',
            flexShrink: 0 // ← FIXED: Prevent from shrinking
          }}>
            <h4 style={{
              fontFamily: "'Cormorant', serif",
              fontSize: '20px',
              fontWeight: 600,
              color: '#000000',
              margin: 0,
              lineHeight: '1.3',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
              borderBottom: '1px solid #E5E5E5',
              paddingBottom: '4px'
            }}>
              {frame.mood_description}
            </h4>
          </div>
        )}

        {/* MINIMAL: 2x2 Image Grid - clean and simple */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '6px',
          width: '100%',
          height: '160px',
          marginBottom: '16px',
          flexShrink: 0 // ← FIXED: Prevent from shrinking
        }}>
          {displayImages.map((imageUrl: string, index: number) => (
            <div
              key={index}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'white',
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
                border: '1px solid #E5E5E5'
              }}
            >
              <img 
                src={imageUrl}
                alt={`Collage image ${index + 1}`}
                loading="lazy"
                decoding="async"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>

        {/* MINIMAL: Action bar - FIXED: Added marginTop: 'auto' to push to bottom */}
        <footer style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '12px',
          borderTop: '1px solid #E5E5E5',
          marginTop: 'auto', // ← FIXED: This pushes the footer to the bottom
          flexShrink: 0
        }}>
          {/* Left Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* UPDATED: Like Button with Real Data */}
            <button 
              onClick={handleLike}
              disabled={likeMutation.isPending}
              aria-label={likesData?.hasLiked ? 'Unlike' : 'Like'}
              aria-pressed={likesData?.hasLiked}
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
            
            {/* UPDATED: Comment Button with Real Data */}
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
            
            {/* UPDATED: Share Button with Real Data */}
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

          {/* UPDATED: Right Actions - Timestamp and Repost */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* UPDATED: Relative Time */}
            <div style={{
              fontSize: '10px',
              color: '#9CA3AF',
              fontFamily: 'Arial, sans-serif'
            }}>
              {getRelativeTime(frame.created_at)}
            </div>

            {/* UPDATED: Toggle Repost Button */}
            <button 
              onClick={handleRepost}
              disabled={isReposting}
              aria-label={userHasReposted ? 'Undo repost' : 'Repost'}
              aria-pressed={userHasReposted}
              style={{ 
                background: '#FAFAFA',
                border: '1px solid #E5E5E5',
                cursor: isReposting ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'all 0.2s ease',
                color: userHasReposted ? '#10B981' : '#000000',
                opacity: isReposting ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!isReposting) {
                  e.currentTarget.style.backgroundColor = '#F0F0F0';
                  e.currentTarget.style.borderColor = '#D6D6D6';
                }
              }}
              onMouseLeave={(e) => {
                if (!isReposting) {
                  e.currentTarget.style.backgroundColor = '#FAFAFA';
                  e.currentTarget.style.borderColor = '#E5E5E5';
                }
              }}
            >
              {isReposting ? (
                <div style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid #E5E5E5',
                  borderTop: '2px solid #10B981',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              ) : (
                <RepostIcon filled={userHasReposted} />
              )}
              <span style={{ 
                fontSize: '11px',
                color: userHasReposted ? '#10B981' : '#000000',
                fontFamily: 'Arial, sans-serif'
              }}>
                {frame.repost_count}
              </span>
            </button>
          </div>
        </footer>
      </article>

      {/* Report Dialog */}
      {showReportDialog && (
        <ReportDialog
          isOpen={showReportDialog}
          onClose={() => setShowReportDialog(false)}
          onReport={handleReport}
          contentType="frame"
        />
      )}
    </>
  );
});

FrameCard.displayName = 'FrameCard';

export default FrameCard;