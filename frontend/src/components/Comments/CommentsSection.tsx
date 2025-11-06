import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ADDED: Import useNavigate
import { useCommentsStatus } from '../../hooks/useCommentsStatus';
import { useDeleteComment } from '../../hooks/useDeleteComment'; // ADDED: Import delete hook
import { useAuth } from '../../contexts/AuthContext'; // ADDED: For current user

// UPDATED: Added repost content types
interface CommentsSectionProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'scene' | 'monologue' | 'character' | 'frame' | 'character_repost' | 'frame_repost' | 'monologue_repost';
  contentId: string;
  onSubmitComment: (comment: string) => void;
  isLoading?: boolean;
}

// ADDED: Three-dot menu icon
const MenuIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="6" r="1"/>
    <circle cx="12" cy="12" r="1"/>
    <circle cx="12" cy="18" r="1"/>
  </svg>
);

const CommentsSection: React.FC<CommentsSectionProps> = ({
  isOpen,
  onClose,
  contentType,
  contentId,
  onSubmitComment,
  isLoading = false
}) => {
  const navigate = useNavigate(); // ADDED: Navigation hook
  const [comment, setComment] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const [showMenuForComment, setShowMenuForComment] = useState<string | null>(null); // ADDED: Track which comment's menu is open
  const menuRef = useRef<HTMLDivElement>(null); // ADDED: For click outside detection
  
  const { data: commentsData, isLoading: commentsLoading } = useCommentsStatus({
    content_type: contentType,
    content_id: contentId
  });

  const { user } = useAuth(); // ADDED: Get current user
  const deleteCommentMutation = useDeleteComment(); // ADDED: Delete comment hook

  const comments = commentsData?.comments || [];
  const commentCount = commentsData?.commentCount || 0;

  // ADDED: Profile click handler
  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    onClose(); // Close comments when navigating to profile
  };

  const handleSubmit = () => {
    if (comment.trim()) {
      onSubmitComment(comment.trim());
      setComment('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ADDED: Delete comment handler
  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteCommentMutation.mutateAsync({
          content_type: contentType,
          content_id: contentId,
          comment_id: commentId
        });
        setShowMenuForComment(null); // Close menu after deletion
      } catch (error) {
        console.error('Failed to delete comment:', error);
        alert('Failed to delete comment. Please try again.');
      }
    }
  };

  // ADDED: Toggle menu for a specific comment
  const toggleMenu = (commentId: string) => {
    setShowMenuForComment(showMenuForComment === commentId ? null : commentId);
  };

  // ADDED: Click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenuForComment(null);
      }
    };

    if (showMenuForComment) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenuForComment]);

  // Auto-scroll to bottom when new comments are added
  useEffect(() => {
    if (commentsEndRef.current && isOpen) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments, isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      zIndex: 1000
    }}>
      {/* Comments Drawer - Fixed height for mobile with bottom nav spacing */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px 20px 0 0',
        maxWidth: '375px',
        width: '100%',
        height: '70vh',
        margin: '0 auto',
        marginBottom: '80px', // ADDED: Space for bottom navigation bar
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #e5e5e5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <h3 style={{ 
            margin: 0, 
            fontFamily: 'Playfair Display, serif',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Comments ({commentCount})
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '4px',
              borderRadius: '4px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ×
          </button>
        </div>

        {/* Scrollable Comments List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px'
        }}>
          {commentsLoading ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#666',
              fontFamily: 'Playfair Display, serif',
              padding: '20px 0'
            }}>
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#666',
              fontFamily: 'Playfair Display, serif',
              padding: '40px 0'
            }}>
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} style={{
                marginBottom: '16px',
                paddingBottom: '16px',
                borderBottom: '1px solid #f0f0f0',
                position: 'relative' // ADDED: For menu positioning
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  {/* User Avatar - UPDATED: Now clickable */}
                  <div 
                    onClick={() => handleProfileClick(comment.user_id)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#E5E5E5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden',
                      cursor: 'pointer' // ADDED: Show it's clickable
                    }}
                  >
                    {comment.user.avatar_url ? (
                      <img 
                        src={comment.user.avatar_url}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <span style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#888'
                      }}>
                        {comment.user.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  
                  {/* Comment Content */}
                  <div style={{ flex: 1 }}>
                    {/* Username - UPDATED: Now clickable */}
                    <div 
                      onClick={() => handleProfileClick(comment.user_id)}
                      style={{
                        fontFamily: 'Playfair Display, serif',
                        fontWeight: '600',
                        fontSize: '14px',
                        color: '#000',
                        marginBottom: '4px',
                        cursor: 'pointer', // ADDED: Show it's clickable
                        display: 'inline-block' // ADDED: Prevent full width click
                      }}
                    >
                      {comment.user.username}
                    </div>
                    <div style={{
                      fontFamily: 'Arial, sans-serif',
                      fontSize: '14px',
                      color: '#333',
                      lineHeight: '1.4',
                      marginBottom: '4px'
                    }}>
                      {comment.content}
                    </div>
                    <div style={{
                      fontFamily: 'Arial, sans-serif',
                      fontSize: '12px',
                      color: '#888'
                    }}>
                      {new Date(comment.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>

                  {/* ADDED: Three-dot menu for comment owner */}
                  {user && comment.user_id === user.id && (
                    <div style={{ position: 'relative' }} ref={menuRef}>
                      <button
                        onClick={() => toggleMenu(comment.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          color: '#666',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f0f0f0';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <MenuIcon />
                      </button>

                      {/* Delete menu dropdown */}
                      {showMenuForComment === comment.id && (
                        <div style={{
                          position: 'absolute',
                          right: 0,
                          top: '24px',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          border: '1px solid #e5e5e5',
                          zIndex: 1001,
                          minWidth: '120px'
                        }}>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={deleteCommentMutation.isPending}
                            style={{
                              width: '100%',
                              background: 'none',
                              border: 'none',
                              padding: '8px 12px',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontFamily: 'Arial, sans-serif',
                              color: '#ff4444',
                              transition: 'background-color 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f0f0f0';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            {deleteCommentMutation.isPending ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Fixed Comment Input at bottom */}
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderTop: '1px solid #e5e5e5',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Write a comment..."
              style={{
                flex: 1,
                minHeight: '60px',
                maxHeight: '120px',
                padding: '12px',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontFamily: 'Arial, sans-serif',
                fontSize: '14px',
                resize: 'vertical',
                outline: 'none'
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!comment.trim() || isLoading}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                background: comment.trim() ? '#1a1a1a' : '#ccc',
                color: 'white',
                cursor: comment.trim() ? 'pointer' : 'not-allowed',
                fontFamily: 'Arial, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                height: 'fit-content'
              }}
            >
              {isLoading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsSection;