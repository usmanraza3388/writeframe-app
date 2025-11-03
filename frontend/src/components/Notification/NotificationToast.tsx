import React from 'react';
import { type Notification, useNotifications } from '../../contexts/NotificationContext';

const icons = {
  success: '✅',
  error: '❌', 
  warning: '⚠️',
  info: '💡'
};

const NotificationToast: React.FC<{ notification: Notification }> = ({ notification }) => {
  const { removeNotification } = useNotifications();

  const handleClose = () => {
    removeNotification(notification.id);
  };

  React.useEffect(() => {
    if (notification.duration !== 0) {
      const timer = setTimeout(handleClose, notification.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div style={{
      minWidth: '300px',
      maxWidth: '400px',
      background: '#FFFFFF',
      borderLeft: `4px solid ${getBorderColor(notification.type)}`,
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{ fontSize: '20px', flexShrink: 0 }}>
        {icons[notification.type]}
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '16px',
          fontWeight: 600,
          color: '#1A1A1A',
          marginBottom: '4px'
        }}>
          {notification.title}
        </div>
        
        <div style={{
          fontFamily: "'Cormorant', serif", 
          fontSize: '14px',
          color: '#55524F',
          lineHeight: 1.4
        }}>
          {notification.message}
        </div>

        {notification.action && (
          <button
            onClick={notification.action.onClick}
            style={{
              background: 'none',
              border: 'none',
              color: getBorderColor(notification.type),
              fontFamily: "'Cormorant', serif",
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '4px 0',
              marginTop: '8px',
              textDecoration: 'underline'
            }}
          >
            {notification.action.label}
          </button>
        )}
      </div>

      <button
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '18px',
          cursor: 'pointer',
          color: '#9CA3AF',
          padding: '4px',
          borderRadius: '4px'
        }}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

const getBorderColor = (type: Notification['type']): string => {
  switch (type) {
    case 'success': return '#10B981';
    case 'error': return '#EF4444';
    case 'warning': return '#F59E0B';
    case 'info': return '#3B82F6';
    default: return '#6B7280';
  }
};

// Notification Container
export const NotificationContainer: React.FC = () => {
  const { notifications } = useNotifications();

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 10000,
      maxHeight: 'calc(100vh - 40px)',
      overflowY: 'auto'
    }}>
      {notifications.map(notification => (
        <NotificationToast key={notification.id} notification={notification} />
      ))}
    </div>
  );
};

// Add CSS for animations
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(notificationStyles);

export default NotificationToast;