// /src/components/Whisper/InboxPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../assets/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../Navigation/BottomNav';

export const InboxPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    
    try {
      // Get all whispers where user is either sender or recipient
      const { data, error } = await supabase
        .from('whispers')
        .select(`
          *,
          sender:profiles!whispers_sender_id_fkey(id, username, full_name, avatar_url),
          recipient:profiles!whispers_recipient_id_fkey(id, username, full_name, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by conversation partner and get latest message
      const conversationMap = new Map();
      
      data?.forEach(whisper => {
        const otherUserId = whisper.sender_id === user.id ? whisper.recipient_id : whisper.sender_id;
        const otherUser = whisper.sender_id === user.id ? whisper.recipient : whisper.sender;
        
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            user: otherUser,
            lastMessage: whisper,
            unread: whisper.recipient_id === user.id && !whisper.is_read
          });
        }
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (otherUser: any) => {
    navigate(`/whisper-thread/${otherUser.id}`);
  };

  const containerStyle: React.CSSProperties = {
    width: 375,
    background: '#FFFFFF',
    borderRadius: 18,
    padding: 32,
    boxSizing: 'border-box',
    margin: '40px auto',
    minHeight: '100vh',
    paddingBottom: '100px'
  };

  if (!user) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          Please sign in to view whispers
        </div>
        <BottomNav />
      </div>
    );
  }

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          Loading whispers...
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1C1C1C',
        marginBottom: 24
      }}>
        Whispers
      </h1>

      {conversations.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          color: '#55524F', 
          padding: '60px 20px',
          fontFamily: "'Cormorant', serif"
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>💬</div>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>No whispers yet</div>
          <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
            Start a conversation by whispering to someone!
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {conversations.map((conv) => (
            <div
              key={conv.user.id}
              onClick={() => handleConversationClick(conv.user)}
              style={{
                padding: 16,
                background: '#FAF8F2',
                borderRadius: 12,
                cursor: 'pointer',
                border: conv.unread ? '1px solid #bc63ceff' : '1px solid transparent',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F0EDE4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FAF8F2';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* User Avatar */}
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  backgroundColor: '#E5E5E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  {conv.user.avatar_url ? (
                    <img 
                      src={conv.user.avatar_url} 
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
                      {conv.user.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                
                {/* Conversation Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: 4 
                  }}>
                    <div style={{
                      fontFamily: 'Playfair Display, serif',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#1C1C1C'
                    }}>
                      {conv.user.full_name || conv.user.username}
                    </div>
                    {conv.unread && (
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#bc63ceff'
                      }} />
                    )}
                  </div>
                  <div style={{ 
                    fontFamily: 'Cormorant, serif', 
                    fontSize: 14,
                    color: '#55524F',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {conv.lastMessage.message}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <BottomNav />
    </div>
  );
};