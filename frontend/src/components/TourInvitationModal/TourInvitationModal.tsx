// src/components/TourInvitationModal/TourInvitationModal.tsx
import React, { useState } from 'react';
import { supabase } from '../../assets/lib/supabaseClient';

interface TourInvitationModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onRemindLater: () => void;
  userId: string | undefined;
}

const TourInvitationModal: React.FC<TourInvitationModalProps> = ({ 
  isOpen, 
  onAccept, 
  onDecline,
  onRemindLater,
  userId
}) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleAction = async (action: 'accept' | 'decline' | 'remind_later') => {
    if (!userId) {
      // If no user ID, just call the callback
      if (action === 'accept') onAccept();
      else if (action === 'decline') onDecline();
      else onRemindLater();
      return;
    }

    setIsLoading(true);
    try {
      // Update tour status in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ 
          tour_status: action === 'accept' ? 'accepted' : action,
          tour_last_shown: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Call the appropriate callback
      if (action === 'accept') onAccept();
      else if (action === 'decline') onDecline();
      else onRemindLater();

    } catch (error) {
      console.error('Error updating tour status:', error);
      // Still call callback on error
      if (action === 'accept') onAccept();
      else if (action === 'decline') onDecline();
      else onRemindLater();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        padding: '32px 24px',
        maxWidth: '375px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#FAF8F2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '28px'
        }}>
          👣
        </div>
        
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '24px',
          fontWeight: 700,
          color: '#1A1A1A',
          margin: '0 0 12px'
        }}>
          Quick App Tour?
        </h2>
        
        <p style={{
          fontFamily: "'Cormorant', serif",
          fontSize: '16px',
          color: '#55524F',
          lineHeight: 1.5,
          margin: '0 0 24px'
        }}>
          Take a 2-minute tour to learn where everything is located.
        </p>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <button
            onClick={() => handleAction('accept')}
            disabled={isLoading}
            style={{
              padding: '14px 20px',
              backgroundColor: '#1A1A1A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontFamily: "'Cormorant', serif",
              fontWeight: 600,
              cursor: isLoading ? 'default' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'background-color 0.2s, opacity 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = '#2D2D2D';
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = '#1A1A1A';
            }}
          >
            {isLoading ? 'Saving...' : 'Yes, show me around'}
          </button>
          
          <button
            onClick={() => handleAction('decline')}
            disabled={isLoading}
            style={{
              padding: '14px 20px',
              backgroundColor: 'transparent',
              color: '#6B7280',
              border: '1px solid #D1D5DB',
              borderRadius: '12px',
              fontSize: '15px',
              fontFamily: "'Cormorant', serif",
              fontWeight: 500,
              cursor: isLoading ? 'default' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#FAF8F2';
                e.currentTarget.style.borderColor = '#9CA3AF';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }
            }}
          >
            No thanks, I'll explore myself
          </button>
          
          <button
            onClick={() => handleAction('remind_later')}
            disabled={isLoading}
            style={{
              padding: '14px 20px',
              backgroundColor: 'transparent',
              color: '#6B7280',
              border: 'none',
              fontSize: '14px',
              fontFamily: "'Cormorant', serif",
              cursor: isLoading ? 'default' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.color = '#4B5563';
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.color = '#6B7280';
            }}
          >
            Remind me later
          </button>
        </div>
      </div>
    </div>
  );
};

export default TourInvitationModal;