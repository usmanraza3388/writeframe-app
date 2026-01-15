// src/components/NotificationBell/NotificationBell.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // ADDED: Import useNavigate
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../contexts/AuthContext';

// UPDATED: Accept profileId prop
const NotificationBell: React.FC<{ profileId?: string }> = ({ profileId }) => {
  const { user } = useAuth();
  const { getUserNotifications, markAsRead, getUnreadCount } = useNotifications();
  const navigate = useNavigate(); // ADDED: useNavigate hook
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  // UPDATED: Use profileId if provided, otherwise use auth user ID
  const targetUserId = profileId || user?.id;

  // ADDED: Click handler for profile navigation
  const handleProfileClick = (notification: any, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the notification click
    
    if (notification.related_entity_id) {
      navigate(`/profile/${notification.related_entity_id}`);
    }
  };

  // UPDATED: Helper function to extract clickable name from message
  const getClickableMessage = (notification: any) => {
    const message = notification.message;
    
    switch (notification.type) {
      case 'echo':
        const echoMatch = message.match(/^(.*?) started following you$/);
        if (echoMatch) return { name: echoMatch[1], suffix: ' started following you' };
        break;
        
      case 'remake':
        const remakeMatch = message.match(/^(.*?) remade your (.+?) "(.*)"$/);
        if (remakeMatch) return { name: remakeMatch[1], suffix: ` remade your ${remakeMatch[2]} "${remakeMatch[3]}"` };
        break;
        
      case 'comment':
        // UPDATED: Handle generic comment format for all content types
        const commentMatch = message.match(/^(.*?) commented on your (.+?) "(.*)"$/);
        if (commentMatch) return { 
          name: commentMatch[1], 
          suffix: ` commented on your ${commentMatch[2]} "${commentMatch[3]}"` 
        };
        break;
        
      case 'like':
        // NEW: Handle like notification format
        const likeMatch = message.match(/^(.*?) liked your (.+?) "(.*)"$/);
        if (likeMatch) return { 
          name: likeMatch[1], 
          suffix: ` liked your ${likeMatch[2]} "${likeMatch[3]}"` 
        };
        break;
        
      case 'follow':
        const followMatch = message.match(/^(.*?) started following you$/);
        if (followMatch) return { name: followMatch[1], suffix: ' started following you' };
        break;
        
      case 'whisper':
        const whisperMatch = message.match(/^(.*?): (.*)$/);
        if (whisperMatch) return { name: whisperMatch[1], suffix: `: ${whisperMatch[2]}` };
        break;
    }
    
    return null;
  };

  // UPDATED: Load notifications for targetUserId
  const loadNotifications = async () => {
    if (!targetUserId) {
      // Clear everything if no target user
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    
    setIsLoading(true);
    try {
      const [notifsData, countData] = await Promise.all([
        getUserNotifications(targetUserId, 10),
        getUnreadCount(targetUserId) // UPDATED: Use targetUserId
      ]);
      
      setNotifications(notifsData);
      setUnreadCount(countData);
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Clear on error too
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node) &&
          bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      loadNotifications(); // Refresh when opening
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, targetUserId]); // UPDATED: Use targetUserId

  // UPDATED: Enhanced target user change handling
  useEffect(() => {
    // Clear everything immediately when target user changes
    setNotifications([]);
    setUnreadCount(0);
    setIsOpen(false);
    
    // Load new target user's notifications
    if (targetUserId) {
      loadNotifications();
    }
  }, [targetUserId]); // UPDATED: Use targetUserId instead of user.id

  // UPDATED: Clear everything when target user becomes null
  useEffect(() => {
    if (!targetUserId) {
      setNotifications([]);
      setUnreadCount(0);
      setIsOpen(false);
    }
  }, [targetUserId]);

  const handleBellClick = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Update local notification state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );
    }
  };

  const formatTime = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  // UPDATED: Added icon for like notifications
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'echo':
        return '🔄';
      case 'remake':
        return '🎬';
      case 'comment':
        return '💬';
      case 'like':
        return '❤️'; // NEW: Added heart icon for likes
      case 'follow':
        return '👤';
      case 'whisper':
        return '💭';
      default:
        return '🔔';
    }
  };

  if (!user) return null;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bell Icon with Badge */}
      <button
        ref={bellRef}
        onClick={handleBellClick}
        aria-label="Notifications"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '50%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--hover-background)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {/* Bell Icon SVG */}
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="var(--text-primary)"
          strokeWidth="2"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              backgroundColor: '#FF4444',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '10px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--background-card)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            top: '70px',
            right: 'calc(50% - 187.5px + 32px)',
            width: '300px',
            maxHeight: '350px',
            backgroundColor: 'var(--background-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Panel Header */}
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontFamily: "'Playfair Display', serif",
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span
                style={{
                  backgroundColor: 'var(--text-primary)',
                  color: 'var(--background-card)',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              >
                {unreadCount} new
              </span>
            )}
          </div>

          {/* Notifications List */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              maxHeight: '250px',
              minHeight: '80px',
            }}
          >
            {isLoading ? (
              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                  fontFamily: "'Cormorant', serif",
                }}
              >
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                  fontFamily: "'Cormorant', serif",
                  fontStyle: 'italic',
                }}
              >
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    backgroundColor: notification.is_read 
                      ? 'transparent' 
                      : 'var(--hover-background)',
                    transition: 'background-color 0.2s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--hover-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = notification.is_read 
                      ? 'transparent' 
                      : 'var(--hover-background)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '16px', flexShrink: 0 }}>
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: "'Cormorant', serif",
                          fontSize: '14px',
                          fontWeight: notification.is_read ? 400 : 600,
                          color: 'var(--text-primary)',
                          marginBottom: '4px',
                          lineHeight: '1.3',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {notification.title}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Cormorant', serif",
                          fontSize: '13px',
                          color: 'var(--text-secondary)',
                          marginBottom: '4px',
                          lineHeight: '1.3',
                        }}
                      >
                        {(() => {
                          const clickableData = getClickableMessage(notification);
                          
                          if (clickableData && notification.related_entity_id) {
                            return (
                              <>
                                <span
                                  onClick={(e) => handleProfileClick(notification, e)}
                                  style={{
                                    color: 'var(--text-primary)',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = 'var(--accent-color)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = 'var(--text-primary)';
                                  }}
                                >
                                  {clickableData.name}
                                </span>
                                {clickableData.suffix}
                              </>
                            );
                          }
                          
                          // Fallback for notifications without clickable names
                          return notification.message;
                        })()}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Cormorant', serif",
                          fontSize: '11px',
                          color: 'var(--text-light)',
                          fontStyle: 'italic',
                        }}
                      >
                        {formatTime(notification.created_at)}
                      </div>
                    </div>
                    {!notification.is_read && (
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--text-primary)',
                          flexShrink: 0,
                          marginTop: '4px',
                        }}
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Panel Footer */}
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--border-color)',
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            <button
              onClick={loadNotifications}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontFamily: "'Cormorant', serif",
                fontSize: '13px',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;