import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../assets/lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import useNotifications from '../../hooks/useNotifications';

export const WhisperComposer: React.FC = () => {
  const { userId } = useParams(); // Recipient ID from URL /whisper/:userId
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifyWhisper } = useNotifications();
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user || !userId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('whispers')
        .insert({
          sender_id: user.id,
          recipient_id: userId,
          message: message.trim(),
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      
      // Trigger notification for the recipient
      await notifyWhisper(
        userId, // recipient ID
        user.user_metadata?.full_name || user.email || 'Someone', // sender name
        user.id, // sender ID
        message.trim().substring(0, 50) + (message.length > 50 ? '...' : '') // message preview
      );
      
      // Navigate back to profile or inbox
      navigate(-1); // Go back to where they came from
      alert('Whisper sent!');
      
    } catch (error) {
      console.error('Failed to send whisper:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (message.trim()) {
      const confirmLeave = window.confirm('Are you sure you want to leave? Your message will not be sent.');
      if (!confirmLeave) return;
    }
    navigate(-1);
  };

  // REUSE SceneComposer container styles exactly
  const containerStyle: React.CSSProperties = {
    width: 375,
    background: '#FFFFFF',
    borderRadius: 18,
    padding: 32,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    alignSelf: 'center',
    margin: '40px auto',
    position: 'relative'
  };

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    display: 'block',
    boxSizing: 'border-box',
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.12)',
    background: '#FAF8F2',
    outline: 'none',
    fontSize: 15,
    margin: 0,
    fontFamily: "'Cormorant', serif",
    height: 120,
    resize: 'none'
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    height: 50,
    padding: '12px 16px',
    borderRadius: 10,
    background: '#1A1A1A',
    border: '1px solid #1A1A1A',
    color: '#FFFFFF',
    cursor: 'pointer',
    fontSize: 20,
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    transition: 'all 0.3s ease'
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FFFFFF'
    }}>
      <div style={containerStyle}>
        {/* Back Arrow - Same as SceneComposer */}
        <button
          type="button"
          onClick={handleBack}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: '#FAF8F2',
            border: '1px solid rgba(0,0,0,0.1)',
            cursor: 'pointer',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1C1C1C',
            zIndex: 1000
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        {/* Header - Same pattern as SceneComposer */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 32,
            fontWeight: 700,
            color: '#1C1C1C',
            lineHeight: 'auto',
            margin: '0 auto'
          }}>
            Send Whisper
          </h1>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20,
            fontWeight: 400,
            color: '#55524F',
            margin: '16px auto 0'
          }}>
            Share a private message
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message..."
            required
            style={textareaStyle}
            maxLength={500}
          />

          <button
            type="submit"
            disabled={loading || !message.trim()}
            style={{
              ...buttonStyle,
              opacity: (loading || !message.trim()) ? 0.7 : 1,
              cursor: (loading || !message.trim()) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Sending...' : 'Send Whisper'}
          </button>
        </form>
      </div>
    </div>
  );
};