// src/components/Whisper/WhisperThread.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../assets/lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import useNotifications from '../../hooks/useNotifications';
import BottomNav from '../Navigation/BottomNav';

// ADDED: Style definitions at the top
const pageContainerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF8F5 100%)',
  paddingBottom: '80px'
};

const containerStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '375px',
  margin: '0 auto',
  width: '100%',
  background: '#FFFFFF'
};

// ADDED: CSS for skeleton animation
const skeletonStyles = `
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
`;

// ADDED: Skeleton Loading Component
const WhisperThreadSkeleton: React.FC = () => (
  <div style={pageContainerStyle}>
    <div style={containerStyle}>
      {/* Header Skeleton */}
      <div style={headerStyle}>
        <div style={{
          ...backButtonStyle,
          backgroundColor: '#E5E5E5',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
        
        <div style={userInfoStyle}>
          <div style={{
            ...avatarStyle,
            backgroundColor: '#E5E5E5',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
          
          <div style={userTextStyle}>
            <div style={{
              width: '120px',
              height: '16px',
              backgroundColor: '#E5E5E5',
              borderRadius: '4px',
              marginBottom: '4px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
            <div style={{
              width: '80px',
              height: '12px',
              backgroundColor: '#E5E5E5',
              borderRadius: '3px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
          </div>
        </div>
      </div>

      {/* Messages Skeleton */}
      <div style={messagesContainerStyle}>
        <div style={messagesListStyle}>
          {/* Other user message skeleton */}
          <div style={{
            ...messageBubbleStyle,
            ...otherMessageBubbleStyle,
            backgroundColor: '#E5E5E5',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>
            <div style={{
              width: '180px',
              height: '16px',
              backgroundColor: '#D1D5DB',
              borderRadius: '4px',
              marginBottom: '8px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
            <div style={{
              width: '60px',
              height: '12px',
              backgroundColor: '#D1D5DB',
              borderRadius: '3px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
          </div>

          {/* Own message skeleton */}
          <div style={{
            ...messageBubbleStyle,
            ...ownMessageBubbleStyle,
            backgroundColor: '#E5E5E5',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>
            <div style={{
              width: '150px',
              height: '16px',
              backgroundColor: '#D1D5DB',
              borderRadius: '4px',
              marginBottom: '8px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
            <div style={{
              width: '50px',
              height: '12px',
              backgroundColor: '#D1D5DB',
              borderRadius: '3px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
          </div>

          {/* Other user message skeleton */}
          <div style={{
            ...messageBubbleStyle,
            ...otherMessageBubbleStyle,
            backgroundColor: '#E5E5E5',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>
            <div style={{
              width: '200px',
              height: '16px',
              backgroundColor: '#D1D5DB',
              borderRadius: '4px',
              marginBottom: '8px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
            <div style={{
              width: '70px',
              height: '12px',
              backgroundColor: '#D1D5DB',
              borderRadius: '3px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
          </div>
        </div>
      </div>

      {/* Input Skeleton */}
      <div style={inputFormStyle}>
        <div style={inputContainerStyle}>
          <div style={{
            ...inputStyle,
            backgroundColor: '#E5E5E5',
            border: 'none',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
          <div style={{
            ...sendButtonStyle,
            backgroundColor: '#E5E5E5',
            border: 'none',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
        </div>
      </div>
    </div>
    <BottomNav />
  </div>
);

export const WhisperThread: React.FC = () => {
  const { userId } = useParams(); // The other user's ID
  const navigate = useNavigate();
  const { user } = useAuth();
  const { markAsRead: _markAsRead } = useNotifications();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [unsendingMessageId, setUnsendingMessageId] = useState<string | null>(null); // ADDED: Track unsending state
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ADDED: Skeleton styles effect
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = skeletonStyles;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation data
  useEffect(() => {
    if (!user || !userId) return;
    loadConversation();
  }, [user, userId]);

  const loadConversation = async () => {
    if (!user || !userId) return;
    
    setLoading(true);
    try {
      // Get other user's profile
      const { data: userData } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', userId)
        .single();

      setOtherUser(userData);

      // Get messages between current user and other user
      const { data: messagesData, error } = await supabase
        .from('whispers')
        .select('*')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(messagesData || []);

      // MARK AS DELIVERED: Update status of messages sent to current user
      if (messagesData) {
        const messagesToMarkDelivered = messagesData.filter(
          msg => msg.recipient_id === user.id && msg.message_status === 'sent'
        );
        
        for (const msg of messagesToMarkDelivered) {
          await supabase
            .from('whispers')
            .update({ 
              message_status: 'delivered',
              is_read: true 
            })
            .eq('id', msg.id);
        }

        // MARK AS SEEN: Update status when user actually views the messages
        const messagesToMarkSeen = messagesData.filter(
          msg => msg.recipient_id === user.id && msg.message_status === 'delivered'
        );
        
        for (const msg of messagesToMarkSeen) {
          await supabase
            .from('whispers')
            .update({ 
              message_status: 'seen'
            })
            .eq('id', msg.id);
        }

        // Refresh messages to get updated statuses
        const { data: updatedMessages } = await supabase
          .from('whispers')
          .select('*')
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        setMessages(updatedMessages || []);
      }

    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !userId || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('whispers')
        .insert({
          sender_id: user.id,
          recipient_id: userId,
          message: newMessage.trim(),
          created_at: new Date().toISOString(),
          is_read: false,
          message_status: 'sent', // ADDED: Set initial status as 'sent'
          is_unsent: false // ADDED: Initialize unsent flag
        });

      if (error) throw error;

      // Refresh messages
      await loadConversation();
      setNewMessage('');

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // ADDED: Function to check if message can be unsent (within 5 minutes)
  const canUnsendMessage = (message: any) => {
    if (!user || message.sender_id !== user.id || message.is_unsent) {
      return false;
    }
    
    const messageTime = new Date(message.created_at).getTime();
    const currentTime = new Date().getTime();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    return (currentTime - messageTime) <= fiveMinutes;
  };

  // ADDED: Function to unsend a message
  const handleUnsendMessage = async (messageId: string) => {
    if (!user) return;
    
    setUnsendingMessageId(messageId);
    try {
      const { error } = await supabase
        .from('whispers')
        .update({ 
          is_unsent: true,
          message_status: 'sent' // Reset status since message is no longer visible
        })
        .eq('id', messageId)
        .eq('sender_id', user.id); // Ensure user can only unsend their own messages

      if (error) throw error;

      // Refresh messages to show updated state
      await loadConversation();
      
    } catch (error) {
      console.error('Error unsending message:', error);
      alert('Failed to unsend message. Please try again.');
    } finally {
      setUnsendingMessageId(null);
    }
  };

  // ADDED: Function to show confirmation dialog for unsend
  const confirmUnsend = (messageId: string) => {
    if (window.confirm('Are you sure you want to unsend this message? This action cannot be undone.')) {
      handleUnsendMessage(messageId);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleProfileClick = () => {
    if (otherUser?.id) {
      navigate(`/profile/${otherUser.id}`);
    }
  };

  const formatTime = (createdAt: string) => {
    const date = new Date(createdAt);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (createdAt: string) => {
    const date = new Date(createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // ADDED: Function to get status display text and color
  const getMessageStatusInfo = (message: any) => {
    if (!user || message.sender_id !== user.id) return { text: '', color: '' };
    
    if (message.is_unsent) {
      return { text: 'Unsent', color: '#6B7280' };
    }

    switch (message.message_status) {
      case 'sent':
        return { text: 'Sent', color: '#6B7280' };
      case 'delivered':
        return { text: 'Delivered', color: '#3B82F6' };
      case 'seen':
        return { text: 'Seen', color: '#10B981' };
      default:
        return { text: 'Sent', color: '#6B7280' };
    }
  };

  // ADDED: Show skeleton loading while data is loading
  if (loading) {
    return <WhisperThreadSkeleton />;
  }

  if (!otherUser) {
    return (
      <div style={pageContainerStyle}>
        <div style={containerStyle}>
          <div style={errorStyle}>User not found</div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div style={pageContainerStyle}>
      <div style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <button
            onClick={handleBack}
            style={backButtonStyle}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          
          <div 
            style={userInfoStyle}
            onClick={handleProfileClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.cursor = 'pointer';
              e.currentTarget.style.backgroundColor = '#FAF8F2';
              e.currentTarget.style.borderRadius = '12px';
              e.currentTarget.style.padding = '8px';
              e.currentTarget.style.margin = '-8px';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.cursor = 'default';
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderRadius = '0';
              e.currentTarget.style.padding = '0';
              e.currentTarget.style.margin = '0';
            }}
          >
            <div style={avatarStyle}>
              {otherUser.avatar_url ? (
                <img 
                  src={otherUser.avatar_url} 
                  alt="" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={avatarFallbackStyle}>
                  {otherUser.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div style={userTextStyle}>
              <div style={userNameStyle}>
                {otherUser.full_name || otherUser.username}
              </div>
              <div style={userStatusStyle}>
                Online
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={messagesContainerStyle}>
          {messages.length === 0 ? (
            <div style={emptyStateStyle}>
              <div style={emptyStateIconStyle}>💬</div>
              <div style={emptyStateTextStyle}>No messages yet</div>
              <div style={emptyStateSubtextStyle}>
                Start a conversation by sending a whisper
              </div>
            </div>
          ) : (
            <div style={messagesListStyle}>
              {messages.map((message, index) => {
                const isOwnMessage = user && message.sender_id === user.id;
                const showDate = index === 0 || 
                  formatDate(messages[index - 1].created_at) !== formatDate(message.created_at);
                const statusInfo = getMessageStatusInfo(message); // ADDED: Get status info
                const canUnsend = canUnsendMessage(message); // ADDED: Check if message can be unsent

                return (
                  <React.Fragment key={message.id}>
                    {showDate && (
                      <div style={dateDividerStyle}>
                        {formatDate(message.created_at)}
                      </div>
                    )}
                    <div 
                      style={{
                        ...messageBubbleStyle,
                        ...(isOwnMessage ? ownMessageBubbleStyle : otherMessageBubbleStyle),
                        position: 'relative'
                      }}
                      // ADDED: Hover effect for own messages that can be unsent
                      onMouseEnter={(e) => {
                        if (isOwnMessage && canUnsend && !message.is_unsent) {
                          e.currentTarget.style.backgroundColor = isOwnMessage ? '#2A2A2A' : '#F0EDE4';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isOwnMessage && canUnsend && !message.is_unsent) {
                          e.currentTarget.style.backgroundColor = isOwnMessage ? '#1A1A1A' : '#FAF8F2';
                        }
                      }}
                    >
                      <div style={messageTextStyle}>
                        {message.is_unsent ? 'This message was unsent' : message.message}
                      </div>
                      <div style={{
                        ...messageTimeStyle,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span>{formatTime(message.created_at)}</span>
                        {/* ADDED: Status indicator for own messages */}
                        {isOwnMessage && statusInfo.text && (
                          <span style={{
                            fontSize: '10px',
                            color: statusInfo.color,
                            fontStyle: 'italic'
                          }}>
                            {statusInfo.text}
                          </span>
                        )}
                      </div>
                      
                      {/* ADDED: Unsend button for own messages within 5 minutes */}
                      {isOwnMessage && canUnsend && !message.is_unsent && (
                        <div style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px'
                        }}>
                          <button
                            onClick={() => confirmUnsend(message.id)}
                            disabled={unsendingMessageId === message.id}
                            style={{
                              background: '#DC2626',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: unsendingMessageId === message.id ? 0.5 : 1
                            }}
                            title="Unsend message"
                          >
                            {unsendingMessageId === message.id ? '...' : '×'}
                          </button>
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} style={inputFormStyle}>
          <div style={inputContainerStyle}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              style={inputStyle}
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              style={{
                ...sendButtonStyle,
                opacity: (!newMessage.trim() || sending) ? 0.5 : 1
              }}
            >
              {sending ? '...' : 'Send'}
            </button>
          </div>
        </form>
      </div>

      <BottomNav />
    </div>
  );
};

// Styles (moved to bottom but kept for reference)
const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '16px 20px',
  borderBottom: '1px solid rgba(0,0,0,0.08)',
  background: '#FFFFFF',
  position: 'sticky',
  top: 0,
  zIndex: 10
};

const backButtonStyle: React.CSSProperties = {
  background: '#FAF8F2',
  border: '1px solid rgba(0,0,0,0.1)',
  borderRadius: '8px',
  padding: '8px',
  cursor: 'pointer',
  marginRight: '12px'
};

const userInfoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flex: 1
};

const avatarStyle: React.CSSProperties = {
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  backgroundColor: '#E5E5E5',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const avatarFallbackStyle: React.CSSProperties = {
  fontFamily: 'Playfair Display, serif',
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#888'
};

const userTextStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column'
};

const userNameStyle: React.CSSProperties = {
  fontFamily: 'Playfair Display, serif',
  fontSize: '16px',
  fontWeight: '600',
  color: '#1C1C1C'
};

const userStatusStyle: React.CSSProperties = {
  fontFamily: 'Cormorant, serif',
  fontSize: '13px',
  color: '#10B981',
  fontStyle: 'italic'
};

const messagesContainerStyle: React.CSSProperties = {
  flex: 1,
  padding: '20px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column'
};

const messagesListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const dateDividerStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#6B7280',
  fontSize: '12px',
  fontFamily: 'Cormorant, serif',
  fontStyle: 'italic',
  margin: '16px 0',
  padding: '4px 12px',
  background: '#FAF8F2',
  borderRadius: '12px',
  alignSelf: 'center'
};

const messageBubbleStyle: React.CSSProperties = {
  maxWidth: '70%',
  padding: '12px 16px',
  borderRadius: '18px',
  position: 'relative'
};

const ownMessageBubbleStyle: React.CSSProperties = {
  background: '#1A1A1A',
  color: '#FFFFFF',
  alignSelf: 'flex-end',
  borderBottomRightRadius: '4px'
};

const otherMessageBubbleStyle: React.CSSProperties = {
  background: '#FAF8F2',
  color: '#1C1C1C',
  alignSelf: 'flex-start',
  borderBottomLeftRadius: '4px'
};

const messageTextStyle: React.CSSProperties = {
  fontFamily: 'Cormorant, serif',
  fontSize: '15px',
  lineHeight: '1.4',
  marginBottom: '4px'
};

const messageTimeStyle: React.CSSProperties = {
  fontSize: '11px',
  opacity: 0.7,
  textAlign: 'right'
};

const inputFormStyle: React.CSSProperties = {
  padding: '16px 20px',
  borderTop: '1px solid rgba(0,0,0,0.08)',
  background: '#FFFFFF'
};

const inputContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  alignItems: 'center'
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '12px 16px',
  border: '1px solid rgba(0,0,0,0.12)',
  borderRadius: '24px',
  background: '#FAF8F2',
  outline: 'none',
  fontFamily: 'Cormorant, serif',
  fontSize: '15px'
};

const sendButtonStyle: React.CSSProperties = {
  padding: '12px 20px',
  background: '#1A1A1A',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '20px',
  cursor: 'pointer',
  fontFamily: 'Cormorant, serif',
  fontWeight: '600',
  fontSize: '14px'
};

const emptyStateStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  textAlign: 'center',
  padding: '40px 20px'
};

const emptyStateIconStyle: React.CSSProperties = {
  fontSize: '48px',
  marginBottom: '16px',
  opacity: 0.5
};

const emptyStateTextStyle: React.CSSProperties = {
  fontFamily: 'Playfair Display, serif',
  fontSize: '18px',
  color: '#6B7280',
  marginBottom: '8px'
};

const emptyStateSubtextStyle: React.CSSProperties = {
  fontFamily: 'Cormorant, serif',
  fontSize: '14px',
  color: '#9CA3AF',
  fontStyle: 'italic'
};

const errorStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '60px 20px',
  color: '#DC2626',
  fontFamily: 'Cormorant, serif'
};

export default WhisperThread;