import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // ADDED: Import useNavigate
import type { CharacterCardProps } from '../../utils/character-types';
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
import { useCharacter } from '../../hooks/useCharacter'; // ADDED: Import useCharacter hook

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

// CharacterDescription component - FIXED
const CharacterDescription: React.FC<{ text: string }> = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 120;
  const maxLines = 3;

  const needsTruncation = text && text.length > maxLength;
  
  // For truncated view, we need to handle line breaks differently
  const displayText = isExpanded ? text : 
    (text && text.length > maxLength ? `${text.substring(0, maxLength)}...` : text);

  if (!text) return null;

  return (
    <div>
      <div style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: '13px',
        fontWeight: 400,
        color: '#000000',
        lineHeight: '1.4',
        maxHeight: isExpanded ? 'none' : `${maxLines * 1.4}em`,
        overflow: 'hidden',
        whiteSpace: 'pre-line' // ← ADDED: This preserves line breaks and paragraphs
      }}>
        {isExpanded || !needsTruncation ? (
          // When expanded or no truncation needed, show with proper line breaks
          text
        ) : (
          // When truncated, show simple truncated text
          displayText
        )}
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

// Main CharacterCard Component
const CharacterCard: React.FC<CharacterCardProps> = React.memo(({ 
  character, 
  currentUserId, 
  onAction 
}) => {
  // ADDED: Navigation hook
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isReposting, setIsReposting] = useState(false); // ADDED: Loading state for repost
  // ADDED: Gallery state for image opening
  const [galleryOpen, setGalleryOpen] = useState(false);
  
  const isOwner = character.user_id === currentUserId;
  
  // Refs for click outside detection
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // Existing hooks
  const { deleteItem } = useDeleteItem();
  const { saveItem, unsaveItem } = useSaveItem();
  const { isSaved } = useSavedStatus('character', character.id);
  const { copyLink } = useCopyLink();
  const { reportItem } = useReportItem();

  // ADDED: Use character hook for repost functionality
  const { repostCharacter, deleteRepost, repostedCharacters } = useCharacter();

  // New engagement hooks
  const likeMutation = useLikeItem();
  const { data: likesData } = useLikesStatus({ 
    content_type: 'character', 
    content_id: character.id 
  });
  
  const commentMutation = useCommentItem();
  const { data: commentsData } = useCommentsStatus({ 
    content_type: 'character', 
    content_id: character.id 
  });
  
  const shareMutation = useShareItem();
  const { data: sharesData } = useShareStatus({ 
    content_type: 'character', 
    content_id: character.id 
  });

  // Memoized menu options
  const menuOptions = useMemo(() => 
    isOwner 
      ? ['Edit', 'Delete', 'Save', 'Copy Link', 'Report']
      : ['Save', 'Copy Link', 'Report'],
    [isOwner]
  );

  // ADDED: Profile click handler
  const handleProfileClick = useCallback(() => {
    navigate(`/profile/${character.user_id}`);
  }, [navigate, character.user_id]);

  // ADDED: Simple gallery handler for single image
  const openGallery = useCallback(() => {
    const mainImage = character.visual_references?.[0]?.image_url;
    if (mainImage) {
      setGalleryOpen(true);
    }
  }, [character.visual_references]);

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

  // Handle save action
  const handleSave = useCallback(async () => {
    if (!currentUserId) {
      return;
    }

    try {
      if (isSaved) {
        await unsaveItem({ content_type: 'character', content_id: character.id });
      } else {
        await saveItem({ content_type: 'character', content_id: character.id });
      }
    } catch (error) {
      console.error('Save operation failed:', error);
    }
  }, [isSaved, character.id, currentUserId, saveItem, unsaveItem]);

  // Enhanced handleMenuAction with report functionality
  const handleMenuAction = useCallback(async (action: string) => {
    setShowMenu(false);
    
    if (action === 'Delete') {
      if (window.confirm('Are you sure you want to delete this character? This action cannot be undone.')) {
        const success = await deleteItem(character.id, 'character');
        if (success) {
          alert('Character deleted successfully.');
          onAction?.('deleted', character.id);
        } else {
          alert('Failed to delete character. Please try again.');
        }
      }
    } else if (action === 'Save') {
      await handleSave();
    } else if (action === 'Copy Link') {
      await copyLink('character', character.id);
    } else if (action === 'Report') {
      setShowReportDialog(true);
    } else {
      onAction?.(action, character.id);
    }
  }, [character.id, deleteItem, onAction, handleSave, copyLink]);

  // Handle report
  const handleReport = useCallback(async (reason: string) => {
    await reportItem('character', character.id, reason);
  }, [character.id, reportItem]);

  const toggleMenu = useCallback(() => setShowMenu(prev => !prev), []);
  const closeMenu = useCallback(() => setShowMenu(false), []);

  // Real like handler
  const handleLike = useCallback(() => {
    likeMutation.mutate({ 
      content_type: 'character', 
      content_id: character.id 
    });
  }, [likeMutation, character.id]);

  // Real comment handler
  const handleComment = useCallback(() => {
    setShowCommentDialog(true);
  }, []);

  // Comment submit handler
  const handleCommentSubmit = useCallback((commentText: string) => {
    commentMutation.mutate({
      content_type: 'character',
      content_id: character.id,
      content: commentText
    });
  }, [commentMutation, character.id]);

  // Real share handler
  const handleShare = useCallback(() => {
    setShowShareDialog(true);
  }, []);

  // Share submit handler
  const handleShareSubmit = useCallback(() => {
    shareMutation.mutate({
      content_type: 'character',
      content_id: character.id
    }, {
      onSuccess: () => {
        setShowShareDialog(false);
      }
    });
  }, [shareMutation, character.id]);

  // UPDATED: Toggle repost handler - repost/undo in one tap
  const handleRepost = useCallback(async () => {
    if (!currentUserId) return;
    
    setIsReposting(true);
    try {
      if (character.user_has_reposted) {
        // Find the repost ID to delete
        const userRepost = repostedCharacters.find(repost => 
          repost.original_character?.id === character.id
        );
        
        if (userRepost) {
          const success = await deleteRepost(userRepost.id);
          if (success) {
            onAction?.('unrepost', character.id);
          }
        }
      } else {
        // Create new repost
        const success = await repostCharacter(character.id);
        if (success) {
          onAction?.('repost', character.id);
        }
      }
    } catch (error) {
      console.error('Error toggling repost:', error);
    } finally {
      setIsReposting(false);
    }
  }, [
    character.id, 
    character.user_has_reposted, 
    currentUserId, 
    repostCharacter, 
    deleteRepost, 
    repostedCharacters, 
    onAction
  ]);

  // Proper click outside handler
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

  // Get main character image
  const mainImage = character.visual_references?.[0]?.image_url;

  return (
    <>
      {/* Dialogs */}
      {showCommentDialog && (
        <CommentsSection
          isOpen={showCommentDialog}
          onClose={() => setShowCommentDialog(false)}
          contentType="character"
          contentId={character.id}
          onSubmitComment={handleCommentSubmit}
          isLoading={commentMutation.isPending}
        />
      )}
      
      {showShareDialog && (
        <ShareDialog
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          onShare={handleShareSubmit}
          shareUrl={`${window.location.origin}/character/${character.id}`}
          content={{
            title: character.name,
            excerpt: character.tagline || character.bio || character.name,
            images: mainImage ? [mainImage] : []
          }}
          creator={{
            name: character.user_name,
            genre: character.user_genre_tag
          }}
          contentType="character"
          targetElementId={`card-character-${character.id}`} // ← ADDED: Pass the card element ID
        />
      )}

      {/* Character Profile Card Layout */}
      <article 
        id={`card-character-${character.id}`} // ← ADDED: Unique ID for card capture
        style={{
          width: 'calc(100% + 32px)',
          minHeight: mainImage ? '420px' : '350px',
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
        aria-label={`Character by ${character.user_name}: ${character.name}`}
        role="article"
      >
        {/* Character profile indicator header */}
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
            <span style={{ fontSize: '10px', color: 'white' }}>👤</span>
          </div>
          <span style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '11px',
            color: '#55524F',
            fontWeight: '500',
            letterSpacing: '0.3px'
          }}>
            CHARACTER PROFILE
          </span>
        </div>

        {/* Header Section */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          {/* User Info - UPDATED: Now clickable */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            {/* Avatar - CIRCULAR for user - UPDATED: Now clickable */}
            <div 
              onClick={handleProfileClick}
              role="img"
              aria-label={`${character.user_name}'s avatar`}
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
              {character.avatar_url ? (
                <img 
                  src={character.avatar_url}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#55524F'
                }}>
                  {character.user_name?.charAt(0).toUpperCase()}
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
                {character.user_name}
              </h3>
              <span style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '13px',
                fontWeight: 400,
                color: '#6B7280',
                lineHeight: '1.2',
                marginTop: '2px'
              }}>
                {character.user_genre_tag}
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
                aria-label="Character options"
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
        </div>

        {/* UPDATED: Character image - RECTANGULAR for character - Now clickable */}
        {mainImage && (
          <div 
            style={{
              width: '140px',
              height: '140px',
              margin: '0 auto 20px auto',
              overflow: 'hidden',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onClick={openGallery}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
            }}
          >
            <img 
              src={mainImage}
              alt={`Visual reference for ${character.name}`}
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
        )}

        {/* Character name */}
        <div style={{
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          <h3 style={{
            fontFamily: "'Cormorant', serif",
            fontSize: '22px',
            fontWeight: 600,
            color: '#000000',
            margin: '0 0 8px 0',
            letterSpacing: '0.3px',
            borderBottom: '1px solid #E5E5E5',
            paddingBottom: '6px'
          }}>
            {character.name}
          </h3>
          {character.tagline && (
            <div style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '13px',
              color: '#666',
              fontStyle: 'italic',
              lineHeight: '1.4'
            }}>
              "{character.tagline}"
            </div>
          )}
        </div>

        {/* Bio/Description */}
        {character.bio && (
          <div style={{
            marginBottom: '20px',
            padding: '12px 14px',
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: '6px',
            border: '1px solid #E5E5E5'
          }}>
            <CharacterDescription text={character.bio} />
          </div>
        )}

        {/* Action bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid #E5E5E5'
        }}>
          {/* Left Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Like Button with Real Data */}
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
            
            {/* Comment Button with Real Data */}
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
            
            {/* Share Button with Real Data */}
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

          {/* Right Actions - Timestamp and Repost */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Relative Time */}
            <div style={{
              fontSize: '10px',
              color: '#9CA3AF',
              fontFamily: 'Arial, sans-serif'
            }}>
              {getRelativeTime(character.created_at)}
            </div>

            {/* UPDATED: Toggle Repost Button */}
            <button 
              onClick={handleRepost}
              disabled={isReposting}
              aria-label={character.user_has_reposted ? 'Undo repost' : 'Repost'}
              aria-pressed={character.user_has_reposted}
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
                color: character.user_has_reposted ? '#10B981' : '#000000',
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
                <RepostIcon filled={character.user_has_reposted} />
              )}
              <span style={{ 
                fontSize: '11px',
                color: character.user_has_reposted ? '#10B981' : '#000000',
                fontFamily: 'Arial, sans-serif'
              }}>
                {character.repost_count}
              </span>
            </button>
          </div>
        </div>
      </article>

      {/* UPDATED: Add Gallery Modal for character image */}
      {galleryOpen && mainImage && (
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
              src={mainImage}
              alt={`Character: ${character.name}`}
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
                {character.name}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                by {character.user_name}
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
              link.href = mainImage;
              link.download = `character-${character.name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
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
                  title: character.name,
                  text: character.tagline || 'Check out this character from writeFrame!',
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Character link copied to clipboard!');
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

      {/* Report Dialog */}
      {showReportDialog && (
        <ReportDialog
          isOpen={showReportDialog}
          onClose={() => setShowReportDialog(false)}
          onReport={handleReport}
          contentType="character"
        />
      )}
    </>
  );
});

CharacterCard.displayName = 'CharacterCard';

export default CharacterCard;