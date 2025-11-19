import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // ADDED: Import useNavigate
import FrameCard from './FrameCard';
// ADD NEW IMPORTS
import { useLikeItem } from '../../hooks/useLikeItem';
import { useLikesStatus } from '../../hooks/useLikesStatus';
import { useCommentItem } from '../../hooks/useCommentItem';
import { useCommentsStatus } from '../../hooks/useCommentsStatus';
import { useShareItem } from '../../hooks/useShareItem';
import { useShareStatus } from '../../hooks/useShareStatus';
// UPDATED: Replaced CommentDialog with CommentsSection
import CommentsSection from '../Comments/CommentsSection';
import ShareDialog from '../Shares/ShareDialog';
import type { FrameWithDetails } from '../../utils/frames';
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

interface RepostedFrameCardProps {
  repost: {
    id: string;
    user_id: string;
    user_name: string;
    user_genre_tag: string;
    avatar_url?: string; // ← ADDED: Reposter's avatar URL
    created_at: string;
    // Repost-specific engagement
    like_count: number;
    comment_count: number;
    share_count: number;
  };
  originalFrame: FrameWithDetails;
  currentUserId?: string;
  onAction?: (action: string, repostId: string, context?: any) => void;
}

// Small Repost Icon for header
const SmallRepostIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 1l4 4-4 4"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);

// SVG Icons for repost engagement (same as FrameCard but can be customized)
const LikeIcon: React.FC<{ filled?: boolean }> = ({ filled = false }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#FF4444" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const CommentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>
  </svg>
);

const RepostedFrameCard: React.FC<RepostedFrameCardProps> = React.memo(({
  repost,
  originalFrame,
  currentUserId,
  onAction
}) => {
  const navigate = useNavigate(); // ADDED: Navigation hook
  // ADD NEW STATES
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isUndoingRepost, setIsUndoingRepost] = useState(false); // ADDED: Loading state for undo
  
  // ADDED: Use frame hook for deleteRepost functionality
  const { deleteRepost } = useFrame();
  
  // UPDATED: All hooks now use 'frame_repost' and repost.id for separate engagement
  const likeMutation = useLikeItem();
  const { data: likesData } = useLikesStatus({ 
    content_type: 'frame_repost', 
    content_id: repost.id 
  });
  
  const commentMutation = useCommentItem();
  const { data: commentsData } = useCommentsStatus({ 
    content_type: 'frame_repost', 
    content_id: repost.id 
  });
  
  const shareMutation = useShareItem();
  const { data: sharesData } = useShareStatus({ 
    content_type: 'frame_repost', 
    content_id: repost.id 
  });

  // ADDED: Profile click handler
  const handleProfileClick = useCallback(() => {
    navigate(`/profile/${repost.user_id}`);
  }, [navigate, repost.user_id]);

  // ADDED: Handle undo repost from repost header
  const handleUndoRepost = useCallback(async () => {
    if (!currentUserId) return;
    
    setIsUndoingRepost(true);
    try {
      const success = await deleteRepost(repost.id);
      if (success) {
        onAction?.('unrepost', repost.id, { originalFrameId: originalFrame.id });
      }
    } catch (error) {
      console.error('Error undoing repost:', error);
    } finally {
      setIsUndoingRepost(false);
    }
  }, [repost.id, originalFrame.id, currentUserId, deleteRepost, onAction]);

  // UPDATED: Real like handler for REPOST (not original frame)
  const handleLike = useCallback(() => {
    likeMutation.mutate({ 
      content_type: 'frame_repost', 
      content_id: repost.id 
    });
  }, [likeMutation, repost.id]);

  // UPDATED: Real comment handler for REPOST
  const handleComment = useCallback(() => {
    setShowCommentDialog(true);
  }, []);

  // UPDATED: Comment submit handler - removed auto-close since CommentsSection handles it
  const handleCommentSubmit = useCallback((commentText: string) => {
    commentMutation.mutate({
      content_type: 'frame_repost',
      content_id: repost.id,
      content: commentText
    });
    // CommentsSection will handle closing itself after successful post
  }, [commentMutation, repost.id]);

  // UPDATED: Real share handler for REPOST
  const handleShare = useCallback(() => {
    setShowShareDialog(true);
  }, []);

  // UPDATED: Share submit handler - REMOVED copyLink from engagement flow
  const handleShareSubmit = useCallback(() => {
    shareMutation.mutate({
      content_type: 'frame_repost',
      content_id: repost.id
    }, {
      onSuccess: () => {
        setShowShareDialog(false);
        // REMOVED: copyLink - Now only in three-dot menu
      }
    });
  }, [shareMutation, repost.id]); // REMOVED: copyLink dependency

  const handleEmbeddedCardClick = () => {
    // Navigate to original frame - FIXED: Add context with originalFrameId
    onAction?.('view_original', repost.id, { originalFrameId: originalFrame.id });
  };

  return (
    <article 
      style={{
        width: 'calc(100% + 32px)',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        marginLeft: '-16px',
        marginRight: '-16px',
        padding: '16px',
        boxSizing: 'border-box',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        border: '1px solid #E5E5E5'
      }}
      aria-label={`Reposted frame by ${repost.user_name}`}
      role="article"
    >
      {/* UPDATED DIALOGS - Replaced CommentDialog with CommentsSection */}
      {showCommentDialog && (
        <CommentsSection
          isOpen={showCommentDialog}
          onClose={() => setShowCommentDialog(false)}
          contentType="frame_repost"
          contentId={repost.id}
          onSubmitComment={handleCommentSubmit}
          isLoading={commentMutation.isPending}
        />
      )}
      
      {showShareDialog && (
        <ShareDialog
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          onShare={handleShareSubmit}
          shareUrl={`${window.location.origin}/frame_repost/${repost.id}`}
          // ADDED: Normalized content and creator data for social sharing
          content={{
            title: originalFrame.mood_description || originalFrame.title || 'Cinematic Frame',
            excerpt: originalFrame.mood_description || originalFrame.title || 'Cinematic frame from writeFrame',
            images: originalFrame.image_urls || []
          }}
          creator={{
            name: originalFrame.user?.username || 'Creator',
            genre: originalFrame.user?.genre_persona
          }}
          contentType="frame"
          targetElementId={`card-frame-${originalFrame.id}`} // ← ADDED: Target the embedded frame card
        />
      )}

      {/* UPDATED: REPOST HEADER - Now clickable for undo */}
      <header 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          padding: '8px 0'
        }}
      >
        {/* Reposter Avatar - UPDATED: Now uses actual avatar URL and clickable */}
        <div 
          onClick={handleProfileClick}
          role="img"
          aria-label={`${repost.user_name}'s avatar`}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#E5E5E5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
            cursor: 'pointer' // ADDED: Show it's clickable
          }}
        >
          {repost.avatar_url ? ( // ← THIS IS THE FIX
            <img 
              src={repost.avatar_url}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#888'
            }}>
              {repost.user_name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        
        {/* Reposter Info - UPDATED: Now clickable */}
        <div 
          onClick={handleProfileClick}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            flex: 1,
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
            {repost.user_name}
          </h3>
          <span style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '13px',
            fontWeight: 400,
            color: '#000000',
            lineHeight: '1.2',
            marginTop: '2px'
          }}>
            {repost.user_genre_tag}
          </span>
        </div>

        {/* UPDATED: Repost Indicator - Now clickable for undo */}
        <button
          onClick={handleUndoRepost}
          disabled={isUndoingRepost}
          aria-label="Undo repost"
          style={{
            background: 'none',
            border: 'none',
            cursor: isUndoingRepost ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: isUndoingRepost ? '#9CA3AF' : '#666666',
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            padding: '6px 8px',
            borderRadius: '6px',
            transition: 'all 0.2s ease',
            opacity: isUndoingRepost ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (!isUndoingRepost) {
              e.currentTarget.style.backgroundColor = '#F0F0F0';
              e.currentTarget.style.color = '#DC2626';
            }
          }}
          onMouseLeave={(e) => {
            if (!isUndoingRepost) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#666666';
            }
          }}
        >
          {isUndoingRepost ? (
            <div style={{
              width: '14px',
              height: '14px',
              border: '2px solid #E5E5E5',
              borderTop: '2px solid #DC2626',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          ) : (
            <SmallRepostIcon />
          )}
          <span>Reposted</span>
        </button>
      </header>

      {/* EMBEDDED ORIGINAL CARD - Centered and Adjusted */}
      <div 
        onClick={handleEmbeddedCardClick}
        style={{
          transform: 'scale(0.85)',
          transformOrigin: 'center top',
          margin: '0 -8px',
          cursor: 'pointer',
          opacity: 0.9,
          border: '1px solid #F0F0F0',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        <div 
          id={`card-frame-${originalFrame.id}`} // ← ADDED: ID for embedded card download
          style={{ pointerEvents: 'none' }}
        >
          <FrameCard 
            frame={originalFrame}
            currentUserId={currentUserId}
            onAction={(action, frameId) => {
              // Prevent actions on embedded card, only allow navigation
              if (action === 'view_original') {
                onAction?.(action, frameId);
              }
            }}
          />
        </div>
      </div>

      {/* UPDATED REPOST-SPECIFIC ENGAGEMENT */}
      <footer style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '8px',
        borderTop: '1px solid #f0f0f0',
        marginTop: '4px'
      }}>
        {/* Left Actions - Repost-specific engagement */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* UPDATED: Like Button with Real Data for REPOST */}
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
              padding: '4px',
              borderRadius: '4px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <LikeIcon filled={likesData?.hasLiked} />
            <span style={{ 
              fontSize: '12px', 
              color: likesData?.hasLiked ? '#FF4444' : '#000000',
              fontFamily: 'Arial, sans-serif',
              minWidth: '16px'
            }}>
              {likesData?.likeCount || 0}
            </span>
          </button>
          
          {/* UPDATED: Comment Button with Real Data for REPOST */}
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
              padding: '4px',
              borderRadius: '4px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <CommentIcon />
            <span style={{ 
              fontSize: '12px', 
              color: '#000000',
              fontFamily: 'Arial, sans-serif',
              minWidth: '16px'
            }}>
              {commentsData?.commentCount || 0}
            </span>
          </button>
          
          {/* UPDATED: Share Button with Real Data for REPOST */}
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
              padding: '4px',
              borderRadius: '4px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <ShareIcon />
            <span style={{ 
              fontSize: '12px', 
              color: '#000000',
              fontFamily: 'Arial, sans-serif',
              minWidth: '16px'
            }}>
              {sharesData?.shareCount || 0}
            </span>
          </button>
        </div>

        {/* UPDATED: Relative Time */}
        <div style={{
          fontSize: '11px',
          color: '#888888',
          fontFamily: 'Arial, sans-serif'
        }}>
          {getRelativeTime(repost.created_at)}
        </div>
      </footer>
    </article>
  );
});

RepostedFrameCard.displayName = 'RepostedFrameCard';

export default RepostedFrameCard;