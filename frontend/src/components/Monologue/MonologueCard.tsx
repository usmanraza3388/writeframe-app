import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ADDED: Import useNavigate
import { useDeleteItem } from '../../hooks/useDeleteItem';
import { useSaveItem } from '../../hooks/useSaveItem';
import { useSavedStatus } from '../../hooks/useSavedStatus';
import { useCopyLink } from '../../hooks/useCopyLink';
import { useReportItem } from '../../hooks/useReportItem';
import ReportDialog from '../ReportDialog/ReportDialog';
// ADD NEW IMPORTS
import { useLikeItem } from '../../hooks/useLikeItem';
import { useLikesStatus } from '../../hooks/useLikesStatus';
import { useCommentItem } from '../../hooks/useCommentItem';
import { useCommentsStatus } from '../../hooks/useCommentsStatus';
import { useShareItem } from '../../hooks/useShareItem';
import { useShareStatus } from '../../hooks/useShareStatus';
// REPLACED: CommentDialog with CommentsSection
import CommentsSection from '../Comments/CommentsSection';
import ShareDialog from '../Shares/ShareDialog';
import { useMonologue } from '../../hooks/useMonologue'; // ADDED: Import useMonologue hook
// ADDED: Import view hooks
import { useViewItem, useViewCount } from '../../hooks/useViewItem';

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

interface MonologueCardProps {
  monologue: {
    id: string;
    user_id: string;
    user_name: string;
    user_genre_tag: string;
    title: string;
    content_text: string;
    soundtrack_id?: string;
    like_count: number;
    comment_count: number;
    share_count: number;
    repost_count: number;
    created_at: string;
    user_has_reposted?: boolean;
    profiles?: {
      avatar_url?: string;
    };
  };
  currentUserId?: string;
  onAction?: (action: string, monologueId: string) => void;
}

// Add MonologueDescription component BEFORE the main MonologueCard - FIXED
const MonologueDescription: React.FC<{ text: string }> = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLines = 3;

  const needsTruncation = true; // Always show Read More/Less for line-based truncation
  const displayText = text; // Full text without character limit

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
        whiteSpace: 'pre-line' // ← ADDED: This preserves line breaks and paragraphs
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

// SVG Icons as separate components for better reusability and performance
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

// ADDED: View icon component
const ViewIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const MonologueCard: React.FC<MonologueCardProps> = React.memo(({ 
  monologue, 
  currentUserId, 
  onAction 
}) => {
  const navigate = useNavigate(); // ADDED: Navigation hook
  // ADD: Safety check for undefined monologue
  if (!monologue) {
    console.error('MonologueCard received undefined monologue data');
    return null;
  }

  const [showMenu, setShowMenu] = useState(false);
  // REMOVED: Mock like and repost states
  // ADDED: New dialog states
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isReposting, setIsReposting] = useState(false); // ADDED: Loading state for repost
  
  // ADD: Refs for click outside detection
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  
  // ADDED: View tracking hooks
  const { incrementView } = useViewItem();
  const { data: viewData, fetchViewCount } = useViewCount({
    content_type: 'monologue',
    content_id: monologue.id
  });

  // ADDED: Increment view count when card mounts
  useEffect(() => {
    incrementView({
      content_type: 'monologue',
      content_id: monologue.id
    });
    fetchViewCount();
  }, [monologue.id, incrementView, fetchViewCount]);

  // EXISTING HOOKS
  const { deleteItem } = useDeleteItem();
  const { saveItem, unsaveItem } = useSaveItem();
  const { isSaved } = useSavedStatus('monologue', monologue.id);
  const { copyLink } = useCopyLink();
  const { reportItem } = useReportItem();

  // ADDED: Use monologue hook for repost functionality
  const { repostMonologue, deleteRepost, repostedMonologues } = useMonologue();

  // NEW ENGAGEMENT HOOKS
  const likeMutation = useLikeItem();
  const { data: likesData } = useLikesStatus({ 
    content_type: 'monologue', 
    content_id: monologue.id 
  });
  
  const commentMutation = useCommentItem();
  const { data: commentsData } = useCommentsStatus({ 
    content_type: 'monologue', 
    content_id: monologue.id 
  });
  
  const shareMutation = useShareItem();
  const { data: sharesData } = useShareStatus({ 
    content_type: 'monologue', 
    content_id: monologue.id 
  });
  
  // FIXED: Safe isOwner logic with null/undefined checks
  const isOwner = currentUserId && monologue.user_id === currentUserId;

  // Memoized menu options
  const menuOptions = useMemo(() => 
    isOwner 
      ? ['Edit', 'Delete']
      : ['Save', 'Copy Link', 'Report'],
    [isOwner]
  );

  // ADDED: Profile click handler
  const handleProfileClick = useCallback(() => {
    navigate(`/profile/${monologue.user_id}`);
  }, [navigate, monologue.user_id]);

  // ADD: Handle save action
  const handleSave = useCallback(async () => {
    if (!currentUserId) {
      return;
    }

    try {
      if (isSaved) {
        await unsaveItem({ content_type: 'monologue', content_id: monologue.id });
      } else {
        await saveItem({ content_type: 'monologue', content_id: monologue.id });
      }
    } catch (error) {
      console.error('Save operation failed:', error);
    }
  }, [isSaved, monologue.id, currentUserId, saveItem, unsaveItem]);

  // UPDATE: Enhanced handleMenuAction with report functionality
  const handleMenuAction = useCallback(async (action: string) => {
    setShowMenu(false);
    
    if (action === 'Delete') {
      if (window.confirm('Are you sure you want to delete this monologue? This action cannot be undone.')) {
        const success = await deleteItem(monologue.id, 'monologue');
        if (success) {
          alert('Monologue deleted successfully.');
          onAction?.('deleted', monologue.id);
        } else {
          alert('Failed to delete monologue. Please try again.');
        }
      }
    } else if (action === 'Save') {
      await handleSave();
    } else if (action === 'Copy Link') {
      await copyLink('monologue', monologue.id);
    } else if (action === 'Report') {
      setShowReportDialog(true);
    } else {
      // Handle other actions (Edit, etc.)
      onAction?.(action, monologue.id);
    }
  }, [monologue.id, deleteItem, onAction, handleSave, copyLink]);

  // ADD: Handle report
  const handleReport = useCallback(async (reason: string) => {
    await reportItem('monologue', monologue.id, reason);
  }, [monologue.id, reportItem]);

  const toggleMenu = useCallback(() => setShowMenu(prev => !prev), []);
  const closeMenu = useCallback(() => setShowMenu(false), []);

  // UPDATED: Real like handler
  const handleLike = useCallback(() => {
    likeMutation.mutate({ 
      content_type: 'monologue', 
      content_id: monologue.id 
    });
  }, [likeMutation, monologue.id]);

  // UPDATED: Real comment handler
  const handleComment = useCallback(() => {
    setShowCommentDialog(true);
  }, []);

  // UPDATED: Comment submit handler - removed auto-close since CommentsSection handles it
  const handleCommentSubmit = useCallback((commentText: string) => {
    commentMutation.mutate({
      content_type: 'monologue',
      content_id: monologue.id,
      content: commentText
    });
    // CommentsSection will handle closing itself after successful post
  }, [commentMutation, monologue.id]);

  // UPDATED: Real share handler
  const handleShare = useCallback(() => {
    setShowShareDialog(true);
  }, []);

  // UPDATED: Share submit handler - REMOVED copyLink from engagement flow
  const handleShareSubmit = useCallback(() => {
    shareMutation.mutate({
      content_type: 'monologue',
      content_id: monologue.id
    }, {
      onSuccess: () => {
        setShowShareDialog(false);
        // REMOVED: copyLink('monologue', monologue.id); - Now only in three-dot menu
      }
    });
  }, [shareMutation, monologue.id]); // REMOVED: copyLink dependency

  // UPDATED: Toggle repost handler - repost/undo in one tap (EXACTLY like CharacterCard)
  const handleRepost = useCallback(async () => {
    if (!currentUserId) return;
    
    setIsReposting(true);
    try {
      if (monologue.user_has_reposted) {
        // Find the repost ID to delete
        const userRepost = repostedMonologues.find(repost => 
          repost.original_monologue?.id === monologue.id
        );
        
        if (userRepost) {
          const success = await deleteRepost(userRepost.id);
          if (success) {
            onAction?.('unrepost', monologue.id);
          }
        }
      } else {
        // Create new repost
        const success = await repostMonologue(monologue.id);
        if (success) {
          onAction?.('repost', monologue.id);
        }
      }
    } catch (error) {
      console.error('Error toggling repost:', error);
    } finally {
      setIsReposting(false);
    }
  }, [
    monologue.id, 
    monologue.user_has_reposted, 
    currentUserId, 
    repostMonologue, 
    deleteRepost, 
    repostedMonologues, 
    onAction
  ]);

  // FIXED: Proper click outside handler
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

  return (
    <>
      {/* UPDATED DIALOGS - Replaced CommentDialog with CommentsSection */}
      {showCommentDialog && (
        <CommentsSection
          isOpen={showCommentDialog}
          onClose={() => setShowCommentDialog(false)}
          contentType="monologue"
          contentId={monologue.id}
          onSubmitComment={handleCommentSubmit}
          isLoading={commentMutation.isPending}
        />
      )}
      
      {showShareDialog && (
        <ShareDialog
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          onShare={handleShareSubmit}
          shareUrl={`${window.location.origin}/monologue/${monologue.id}`}
          // ADDED: Normalized content and creator data for social sharing
          content={{
            title: monologue.title,
            excerpt: monologue.content_text || monologue.title,
            images: [] // Monologues typically don't have images
          }}
          creator={{
            name: monologue.user_name,
            genre: monologue.user_genre_tag
          }}
          contentType="monologue"
          targetElementId={`card-monologue-${monologue.id}`} // ← ADDED: Pass the card element ID
        />
      )}

      {/* MINIMAL: Monologue Card Layout */}
      <article 
        id={`card-monologue-${monologue.id}`} // ← ADDED: Unique ID for card capture
        style={{
          width: 'calc(100% + 32px)',
          minHeight: '168px',
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
        aria-label={`Monologue by ${monologue.user_name}: ${monologue.title}`}
        role="article"
      >
        {/* MINIMAL: Monologue indicator header */}
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
            <span style={{ fontSize: '10px', color: 'white' }}>🎭</span>
          </div>
          <span style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '11px',
            color: '#55524F',
            fontWeight: '500',
            letterSpacing: '0.3px'
          }}>
            MONOLOGUE
          </span>
        </div>

        {/* Header Section */}
        <header style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          {/* User Info */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            {/* FIXED: Avatar section using profiles.avatar_url - UPDATED: Now clickable */}
            <div 
              onClick={handleProfileClick}
              role="img"
              aria-label={`${monologue.user_name}'s avatar`}
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
              {monologue.profiles?.avatar_url ? (
                <img 
                  src={monologue.profiles.avatar_url}
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
                  {(monologue.user_name || 'U').charAt(0).toUpperCase()}
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
                {monologue.user_name || 'Unknown User'}
              </h3>
              <span style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '13px',
                fontWeight: 400,
                color: '#6B7280',
                lineHeight: '1.2',
                marginTop: '2px'
              }}>
                {monologue.user_genre_tag || 'Writer'}
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
                aria-label="Monologue options"
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

        {/* Content Section */}
        <div style={{ 
          marginBottom: '16px',
          minHeight: '40px'
        }}>
          {/* Monologue Title */}
          <h4 style={{
            fontFamily: "'Cormorant', serif",
            fontSize: '17px',
            fontWeight: 600,
            color: '#000000',
            marginBottom: '8px',
            lineHeight: '1.3',
            margin: 0,
            letterSpacing: '0.02em',
            borderBottom: '1px solid #E5E5E5',
            paddingBottom: '4px'
          }}>
            {monologue.title}
          </h4>
          
          {/* Monologue Content */}
          {(monologue.content_text && monologue.content_text.trim() !== '') ? (
            <div style={{
              padding: '12px 14px',
              backgroundColor: 'rgba(255,255,255,0.8)',
              borderRadius: '6px',
              border: '1px solid #E5E5E5'
            }}>
              <MonologueDescription text={monologue.content_text} />
            </div>
          ) : (
            <div style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '14px',
              fontWeight: 400,
              color: '#888888',
              fontStyle: 'italic',
              lineHeight: '1.4'
            }}>
              No content provided
            </div>
          )}
        </div>

        {/* MINIMAL: Action bar */}
        <footer style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '12px',
          borderTop: '1px solid #E5E5E5',
          marginTop: '4px',
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
            
            {/* ADDED: View count display */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 6px',
              color: '#6B7280'
            }}>
              <ViewIcon />
              <span style={{ 
                fontSize: '11px',
                color: '#6B7280',
                fontFamily: 'Arial, sans-serif',
                minWidth: '14px'
              }}>
                {viewData?.viewCount || 0}
              </span>
            </div>
          </div>

          {/* UPDATED: Right Actions - Timestamp and Repost */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* UPDATED: Relative Time */}
            <div style={{
              fontSize: '10px',
              color: '#9CA3AF',
              fontFamily: 'Arial, sans-serif'
            }}>
              {getRelativeTime(monologue.created_at)}
            </div>

            {/* UPDATED: Toggle Repost Button (EXACTLY like CharacterCard) */}
            <button 
              onClick={handleRepost}
              disabled={isReposting}
              aria-label={monologue.user_has_reposted ? 'Undo repost' : 'Repost'}
              aria-pressed={monologue.user_has_reposted}
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
                color: monologue.user_has_reposted ? '#10B981' : '#000000',
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
                <RepostIcon filled={monologue.user_has_reposted} />
              )}
              <span style={{ 
                fontSize: '11px',
                color: monologue.user_has_reposted ? '#10B981' : '#000000',
                fontFamily: 'Arial, sans-serif'
              }}>
                {monologue.repost_count}
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
          contentType="monologue"
        />
      )}
    </>
  );
});

MonologueCard.displayName = 'MonologueCard';

export default MonologueCard;