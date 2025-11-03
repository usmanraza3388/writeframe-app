import React, { useState } from 'react';

interface CommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => void;
  isLoading?: boolean;
}

const CommentDialog: React.FC<CommentDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (comment.trim()) {
      onSubmit(comment.trim());
      setComment('');
    }
  };

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
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        width: '90%',
        maxWidth: '400px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontFamily: 'Playfair Display' }}>
          Add Comment
        </h3>
        
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your comment..."
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '12px',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />
        
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          marginTop: '16px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid #e5e5e5',
              borderRadius: '6px',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!comment.trim() || isLoading}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              background: comment.trim() ? '#1a1a1a' : '#ccc',
              color: 'white',
              cursor: comment.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            {isLoading ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentDialog;