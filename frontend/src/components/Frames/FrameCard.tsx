import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useFrame } from '../../hooks/useFrame';
import { useViewItem, useViewCount } from '../../hooks/useViewItem';

// Relative time utility function
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
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < intervals.hour) {
    const minutes = Math.floor(diffInSeconds / intervals.minute);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (diffInSeconds < intervals.day) {
    const hours = Math.floor(diffInSeconds / intervals.hour);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  if (diffInSeconds < intervals.week) {
    const days = Math.floor(diffInSeconds / intervals.day);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  if (diffInSeconds < intervals.month) {
    const weeks = Math.floor(diffInSeconds / intervals.week);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  if (diffInSeconds < intervals.year) {
    const months = Math.floor(diffInSeconds / intervals.month);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  const years = Math.floor(diffInSeconds / intervals.year);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
};

// SVG Icons
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

const ViewIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

// Empty slot placeholder
const EmptySlot: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <div style={{
    background: '#F0EDE4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style
  }}>
    <div style={{
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      border: '1.5px dashed #C4B8A0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <span style={{ fontSize: '14px', color: '#C4B8A0', lineHeight: 1 }}>+</span>
    </div>
  </div>
);

const FrameCard: React.FC<FrameCardProps> = React.memo(({ 
  frame, 
  currentUserId, 
  onAction 
}) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isReposting, setIsReposting] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  const { incrementView } = useViewItem();
  const { data: viewData, fetchViewCount } = useViewCount({
    content_type: 'frame',
    content_id: frame.id
  });

  useEffect(() => {
    incrementView({ content_type: 'frame', content_id: frame.id });
    fetchViewCount();
  }, [frame.id, incrementView, fetchViewCount]);

  const { deleteItem } = useDeleteItem();
  const { saveItem, unsaveItem } = useSaveItem();
  const { isSaved } = useSavedStatus('frame', frame.id);
  const { copyLink } = useCopyLink();
  const { reportItem } = useReportItem();
  const { repostFrame, deleteRepost, repostedFrames } = useFrame();

  const likeMutation = useLikeItem();
  const { data: likesData } = useLikesStatus({ content_type: 'frame', content_id: frame.id });
  const commentMutation = useCommentItem();
  const { data: commentsData } = useCommentsStatus({ content_type: 'frame', content_id: frame.id });
  const shareMutation = useShareItem();
  const { data: sharesData } = useShareStatus({ content_type: 'frame', content_id: frame.id });

  const isOwner = frame.user_id === currentUserId;

  const userData = useMemo(() => ({
    userName: frame.user?.full_name || frame.user_name || frame.user?.username || 'Unknown User',
    userGenre: frame.user_genre_tag || frame.user?.genre_persona || 'Creator',
    userAvatar: frame.avatar_url || frame.user?.avatar_url
  }), [frame.user_name, frame.user_genre_tag, frame.avatar_url, frame.user]);

  const menuOptions = useMemo(() => 
    isOwner ? ['Edit', 'Delete'] : ['Save', 'Copy Link', 'Report'],
    [isOwner]
  );

  const handleProfileClick = useCallback(() => {
    navigate(`/profile/${frame.user_id}`);
  }, [navigate, frame.user_id]);

  const handleSave = useCallback(async () => {
    if (!currentUserId) return;
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

  const handleMenuAction = useCallback(async (action: string) => {
    setShowMenu(false);
    if (action === 'Delete') {
      if (window.confirm('Are you sure you want to delete this frame? This action cannot be undone.')) {
        const success = await deleteItem(frame.id, 'frame');
        if (success) {
          alert('Frame deleted successfully.');
          onAction?.('deleted', frame.id);
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
      onAction?.(action, frame.id);
    }
  }, [frame.id, deleteItem, onAction, handleSave, copyLink]);

  const handleReport = useCallback(async (reason: string) => {
    await reportItem('frame', frame.id, reason);
  }, [frame.id, reportItem]);

  const toggleMenu = useCallback(() => setShowMenu(prev => !prev), []);
  const closeMenu = useCallback(() => setShowMenu(false), []);

  const handleLike = useCallback(() => {
    likeMutation.mutate({ content_type: 'frame', content_id: frame.id });
  }, [likeMutation, frame.id]);

  const handleComment = useCallback(() => {
    setShowCommentDialog(true);
  }, []);

  const handleCommentSubmit = useCallback((commentText: string) => {
    commentMutation.mutate({ content_type: 'frame', content_id: frame.id, content: commentText });
  }, [commentMutation, frame.id]);

  const handleShare = useCallback(() => {
    setShowShareDialog(true);
  }, []);

  const handleShareSubmit = useCallback(() => {
    shareMutation.mutate({ content_type: 'frame', content_id: frame.id }, {
      onSuccess: () => setShowShareDialog(false)
    });
  }, [shareMutation, frame.id]);

  const handleRepost = useCallback(async () => {
    if (!currentUserId) return;
    setIsReposting(true);
    try {
      const userHasReposted = repostedFrames.some(repost => repost.original_frame?.id === frame.id);
      if (userHasReposted) {
        const userRepost = repostedFrames.find(repost => repost.original_frame?.id === frame.id);
        if (userRepost) {
          const success = await deleteRepost(userRepost.id);
          if (success) onAction?.('unrepost', frame.id);
        }
      } else {
        const success = await repostFrame(frame.id);
        if (success) onAction?.('repost', frame.id);
      }
    } catch (error) {
      console.error('Error toggling repost:', error);
    } finally {
      setIsReposting(false);
    }
  }, [frame.id, currentUserId, repostFrame, deleteRepost, repostedFrames, onAction]);

  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (event: MouseEvent) => {
      const clickedOutsideButton = menuButtonRef.current && !menuButtonRef.current.contains(event.target as Node);
      const clickedOutsideMenu = menuContainerRef.current && !menuContainerRef.current.contains(event.target as Node);
      if (clickedOutsideButton && clickedOutsideMenu) closeMenu();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu, closeMenu]);

  const displayImages = useMemo(() => {
    const images = frame.image_urls?.slice(0, 4) || [];
    if (images.length === 0 && frame.image_url) return [frame.image_url];
    return images;
  }, [frame.image_urls, frame.image_url]);

  const openGallery = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setGalleryOpen(true);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentImageIndex((prev) => prev === displayImages.length - 1 ? 0 : prev + 1);
  }, [displayImages.length]);

  const goToPrev = useCallback(() => {
    setCurrentImageIndex((prev) => prev === 0 ? displayImages.length - 1 : prev - 1);
  }, [displayImages.length]);

  useEffect(() => {
    if (!galleryOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setGalleryOpen(false);
      else if (e.key === 'ArrowRight') goToNext();
      else if (e.key === 'ArrowLeft') goToPrev();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [galleryOpen, goToNext, goToPrev]);

  const userHasReposted = useMemo(() => 
    repostedFrames.some(repost => repost.original_frame?.id === frame.id),
    [repostedFrames, frame.id]
  );

  // Helper to render an image or empty slot
  const renderImage = (index: number, style: React.CSSProperties) => {
    const image = displayImages[index];
    if (image) {
      return (
        <div
          onClick={() => openGallery(index)}
          style={{
            ...style,
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <img
            src={image}
            alt={`Visual reference ${index + 1}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      );
    }
    return <EmptySlot style={style} />;
  };

  // ADDED: Get current year for copyright
  const currentYear = new Date().getFullYear();

  return (
    <>
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
          content={{
            title: frame.mood_description || frame.title || 'Cinematic Frame',
            excerpt: frame.mood_description || frame.title || 'Cinematic frame from writeFrame',
            images: displayImages
          }}
          creator={{
            name: userData.userName,
            genre: userData.userGenre
          }}
          contentType="frame"
          targetElementId={`card-frame-${frame.id}`}
        />
      )}

      <article
        id={`card-frame-${frame.id}`}
        style={{
          width: 'calc(100% + 32px)',
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
          display: 'flex',
          flexDirection: 'column'
        }}
        aria-label={`Cinematic collage by ${userData.userName}: ${frame.mood_description}`}
        role="article"
      >
        {/* Content type indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
          flexShrink: 0
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
            CINEMATIC COLLAGE
          </span>
        </div>

        {/* Header */}
        <header style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
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
                cursor: 'pointer'
              }}
            >
              {userData.userAvatar ? (
                <img src={userData.userAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: 'bold', color: '#55524F' }}>
                  {userData.userName?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div onClick={handleProfileClick} style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: 400, color: '#000000', lineHeight: '1.2', margin: 0 }}>
                {userData.userName}
              </h3>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '13px', fontWeight: 400, color: '#6B7280', lineHeight: '1.2', marginTop: '2px' }}>
                {userData.userGenre}
              </span>
            </div>
          </div>

          <div style={{ position: 'relative' }} ref={menuContainerRef}>
            <button
              ref={menuButtonRef}
              onClick={toggleMenu}
              aria-label="More options"
              aria-expanded={showMenu}
              aria-haspopup="true"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#000000', borderRadius: '4px', transition: 'background-color 0.2s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0F0F0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <MenuIcon />
            </button>
            {showMenu && (
              <div
                role="menu"
                aria-label="Frame options"
                style={{ position: 'absolute', right: 0, top: '30px', backgroundColor: 'white', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '6px 0', minWidth: '140px', zIndex: 1000, border: '1px solid #E5E5E5' }}
              >
                {menuOptions.map((option) => (
                  <button
                    key={option}
                    role="menuitem"
                    onClick={() => handleMenuAction(option)}
                    style={{ width: '100%', background: 'none', border: 'none', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', fontSize: '13px', fontFamily: 'Arial, sans-serif', transition: 'background-color 0.2s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0F0F0'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Mood description */}
        {frame.mood_description && (
          <div style={{ marginBottom: '14px', flexShrink: 0 }}>
            <h4 style={{
              fontFamily: "'Cormorant', serif",
              fontSize: '20px',
              fontWeight: 400,
              color: '#000000',
              margin: 0,
              lineHeight: '1.3',
              letterSpacing: '0.02em',
              borderBottom: '1px solid #E5E5E5',
              paddingBottom: '4px'
            }}>
              {frame.mood_description}
            </h4>
          </div>
        )}

        {/* EDITORIAL COLLAGE LAYOUT
            ┌─────────────────┬──────────┐
            │                 │    2     │
            │       1         ├──────────┤
            │   (2/3 width)   │    3     │
            ├────────┬────────┴──────────┤
            │   4 (full width)           │
            └────────────────────────────┘
        */}
        <div style={{ marginBottom: '16px', flexShrink: 0 }}>
          {/* Top row: image 1 (large left) + images 2 & 3 (stacked right) */}
          <div style={{ display: 'flex', gap: '3px', marginBottom: '3px' }}>
            {/* Image 1 - large, 2/3 width */}
            {renderImage(0, {
              width: '65%',
              height: '200px',
              borderRadius: '6px 0 0 6px',
              flexShrink: 0
            })}

            {/* Images 2 & 3 stacked on right, 1/3 width */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '35%' }}>
              {renderImage(1, {
                width: '100%',
                height: '98px',
                borderRadius: '0 6px 0 0'
              })}
              {renderImage(2, {
                width: '100%',
                height: '98px',
                borderRadius: '0 0 6px 0'
              })}
            </div>
          </div>

          {/* Bottom row: image 4 full width */}
          {renderImage(3, {
            width: '100%',
            height: '130px',
            borderRadius: '0 0 6px 6px'
          })}
        </div>

        {/* Action bar */}
        <footer style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '12px',
          borderTop: '1px solid #E5E5E5',
          marginTop: 'auto',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleLike}
              disabled={likeMutation.isPending}
              aria-label={likesData?.hasLiked ? 'Unlike' : 'Like'}
              aria-pressed={likesData?.hasLiked}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 6px', borderRadius: '4px', transition: 'background-color 0.2s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0F0F0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <LikeIcon filled={likesData?.hasLiked} />
              <span style={{ fontSize: '11px', color: likesData?.hasLiked ? '#FF4444' : '#000000', fontFamily: 'Arial, sans-serif', minWidth: '14px', fontWeight: likesData?.hasLiked ? '500' : '400' }}>
                {likesData?.likeCount || 0}
              </span>
            </button>

            <button
              onClick={handleComment}
              aria-label="Comment"
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 6px', borderRadius: '4px', transition: 'background-color 0.2s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0F0F0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <CommentIcon />
              <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Arial, sans-serif', minWidth: '14px' }}>
                {commentsData?.commentCount || 0}
              </span>
            </button>

            <button
              onClick={handleShare}
              disabled={shareMutation.isPending}
              aria-label="Share"
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 6px', borderRadius: '4px', transition: 'background-color 0.2s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0F0F0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <ShareIcon />
              <span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Arial, sans-serif', minWidth: '14px' }}>
                {sharesData?.shareCount || 0}
              </span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 6px', color: '#6B7280' }}>
              <ViewIcon />
              <span style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'Arial, sans-serif', minWidth: '14px' }}>
                {viewData?.viewCount || 0}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: 'Arial, sans-serif' }}>
              {getRelativeTime(frame.created_at)}
            </div>

            <button
              onClick={handleRepost}
              disabled={isReposting}
              aria-label={userHasReposted ? 'Undo repost' : 'Repost'}
              aria-pressed={userHasReposted}
              style={{ background: '#FAFAFA', border: '1px solid #E5E5E5', cursor: isReposting ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '3px', padding: '4px 8px', borderRadius: '4px', transition: 'all 0.2s ease', color: userHasReposted ? '#10B981' : '#000000', opacity: isReposting ? 0.6 : 1 }}
              onMouseEnter={(e) => { if (!isReposting) { e.currentTarget.style.backgroundColor = '#F0F0F0'; e.currentTarget.style.borderColor = '#D6D6D6'; } }}
              onMouseLeave={(e) => { if (!isReposting) { e.currentTarget.style.backgroundColor = '#FAFAFA'; e.currentTarget.style.borderColor = '#E5E5E5'; } }}
            >
              {isReposting ? (
                <div style={{ width: '12px', height: '12px', border: '2px solid #E5E5E5', borderTop: '2px solid #10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : (
                <RepostIcon filled={userHasReposted} />
              )}
              <span style={{ fontSize: '11px', color: userHasReposted ? '#10B981' : '#000000', fontFamily: 'Arial, sans-serif' }}>
                {frame.repost_count}
              </span>
            </button>
          </div>
        </footer>

        {/* ADDED: Copyright Notice */}
        <div style={{
          marginTop: '16px',
          paddingTop: '8px',
          textAlign: 'center',
          fontFamily: 'Playfair Display, serif',
          fontSize: '10px',
          color: '#9CA3AF',
          letterSpacing: '0.3px',
          borderTop: '1px solid #EFEDE5'
        }}>
          © {currentYear} {userData.userName}
        </div>
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

      {/* Gallery Modal */}
      {galleryOpen && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, cursor: 'pointer' }}
          onClick={() => setGalleryOpen(false)}
        >
          {displayImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '24px', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >‹</button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '24px', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >›</button>
            </>
          )}

          <div style={{ position: 'relative' }}>
            <img
              src={displayImages[currentImageIndex]}
              alt={`Image ${currentImageIndex + 1} of ${displayImages.length}`}
              style={{ maxWidth: '85vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
              onClick={(e) => e.stopPropagation()}
            />
            {displayImages.length > 1 && (
              <div style={{ position: 'absolute', bottom: '-50px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontFamily: "'Cormorant', serif" }}>
                {currentImageIndex + 1} / {displayImages.length}
              </div>
            )}
          </div>

          <button
            onClick={() => setGalleryOpen(false)}
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '24px', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >×</button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              const link = document.createElement('a');
              link.href = displayImages[currentImageIndex];
              link.download = `writeframe-image-${currentImageIndex + 1}.jpg`;
              link.click();
            }}
            style={{ position: 'absolute', top: '20px', right: '70px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '20px', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >⬇</button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (navigator.share) {
                navigator.share({ title: frame.mood_description || 'Cinematic image from writeFrame', text: 'Check out this cinematic image from writeFrame!', url: displayImages[currentImageIndex] });
              } else {
                navigator.clipboard.writeText(displayImages[currentImageIndex]);
                alert('Image link copied to clipboard!');
              }
            }}
            style={{ position: 'absolute', top: '20px', right: '120px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '20px', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >↗</button>
        </div>
      )}
    </>
  );
});

FrameCard.displayName = 'FrameCard';

export default FrameCard;