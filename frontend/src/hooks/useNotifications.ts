// src/hooks/useNotifications.ts
import { useCallback } from 'react';
import { supabase } from '../assets/lib/supabaseClient';

// Notification types - UPDATED: Added 'like' and 'prompt_email'
export type NotificationType = 'echo' | 'remake' | 'comment' | 'follow' | 'whisper' | 'prompt_email' | 'like';

// Notification payload interfaces
export interface EchoNotification {
  type: 'echo';
  userId: string;
  echoerId: string;
}

export interface RemakeNotification {
  type: 'remake';
  userId: string;
  remakerId: string;
  sceneId: string;
  sceneTitle: string;
}

// UPDATED: Made generic for all content types
export interface CommentNotification {
  type: 'comment';
  userId: string;
  commenterId: string;
  contentId: string;      // Changed from sceneId to support all content types
  contentType: string;    // 'scene', 'character', 'frame', 'monologue', or their repost variants
  contentName: string;    // Changed from sceneTitle to support all content types
}

// NEW: Added LikeNotification interface
export interface LikeNotification {
  type: 'like';
  userId: string;        // Content owner (person being notified)
  likerId: string;       // User who performed the like
  contentId: string;     // The liked content ID
  contentType: string;   // 'scene', 'character', 'frame', 'monologue', or their repost variants
  contentName: string;   // Character name, scene title, frame title, etc.
}

export interface PromptEmailNotification {
  type: 'prompt_email';
  userEmail: string;
  prompt: string;
}

export interface WhisperNotification {
  type: 'whisper';
  userId: string;
  senderId: string;
  messagePreview: string;
}

// UPDATED: Added LikeNotification to the union
export type NotificationData = EchoNotification | RemakeNotification | CommentNotification | PromptEmailNotification | WhisperNotification | LikeNotification;

// Helper type for content data
interface ContentData {
  user_id: string;
  name?: string;
  title?: string;
}

// Helper type for repost data
interface RepostData {
  user_id: string;
  character_id?: string;
  scene_id?: string;
  frame_id?: string;
  monologue_id?: string;
}

// Enhanced notification service with database integration
export const useNotifications = () => {
  // Helper function to get profile name from profiles table
  const getProfileName = useCallback(async (userId: string): Promise<string> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        console.error('❌ Failed to fetch profile:', error);
        return 'Unknown User';
      }

      return profile.full_name || profile.username || 'Unknown User';
    } catch (err) {
      console.error('💥 Error fetching profile name:', err);
      return 'Unknown User';
    }
  }, []);

  // Helper to get content owner and name for notification
  const getContentInfo = useCallback(async (
    contentType: string, 
    contentId: string
  ): Promise<{ ownerId: string; contentName: string }> => {
    try {
      const isRepost = contentType.includes('_repost');
      const baseType = isRepost ? contentType.replace('_repost', '') : contentType;
      
      if (isRepost) {
        // For reposts: get from repost table (reposter is the owner for notifications)
        const { data: repostData, error } = await supabase
          .from(`${contentType}s`)  // e.g., character_reposts
          .select('*')
          .eq('id', contentId)
          .single();

        if (error || !repostData) {
          console.error('❌ Failed to fetch repost info:', error);
          return { ownerId: '', contentName: 'Content' };
        }

        // Type-safe access to user_id
        const repost = repostData as RepostData;
        const ownerId = repost.user_id;
        
        // Get the original content ID
        const originalContentIdField = `${baseType}_id` as keyof RepostData;
        const originalContentId = repost[originalContentIdField] as string | undefined;

        if (!originalContentId) {
          return { ownerId, contentName: 'Content' };
        }

        // Get original content name for message
        const nameColumn = baseType === 'character' ? 'name' : 'title';
        const { data: originalData } = await supabase
          .from(`${baseType}s`)
          .select(nameColumn)
          .eq('id', originalContentId)
          .single();

        const originalContent = originalData as { name?: string; title?: string } | null;
        const contentName = originalContent?.[nameColumn as keyof typeof originalContent] || 'Content';

        return {
          ownerId,
          contentName
        };
      } else {
        // For original content: get from main table
        const tableName = `${contentType}s`;
        const nameColumn = contentType === 'character' ? 'name' : 'title';
        
        const { data: contentData, error } = await supabase
          .from(tableName)
          .select(`user_id, ${nameColumn}`)
          .eq('id', contentId)
          .single();

        if (error || !contentData) {
          console.error('❌ Failed to fetch content info:', error);
          return { ownerId: '', contentName: 'Content' };
        }

        const content = contentData as ContentData;
        const ownerId = content.user_id;
        const contentName = contentType === 'character' 
          ? content.name || 'Untitled'
          : content.title || 'Untitled';

        return {
          ownerId,
          contentName
        };
      }
    } catch (err) {
      console.error('💥 Error fetching content info:', err);
      return { ownerId: '', contentName: 'Content' };
    }
  }, []);

  // Save notification to database
  const saveNotificationToDB = useCallback(async (
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedEntityId?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: type,
          title: title,
          message: message,
          related_entity_id: relatedEntityId
        })
        .select();

      if (error) {
        console.error('❌ Failed to save notification to DB:', error);
        return false;
      }

      console.log('✅ Notification saved to DB:', data);
      return true;
    } catch (err) {
      console.error('💥 Error saving notification:', err);
      return false;
    }
  }, []);

  // Notify about echoes - UPDATED: Fetch profile name
  const notifyEcho = useCallback(async (userId: string, echoerId: string) => {
    const echoerName = await getProfileName(echoerId);
    
    console.log(`📢 ECHO NOTIFICATION: ${echoerName} echoed user ${userId}`);
    
    // Save to database
    const dbSuccess = await saveNotificationToDB(
      userId,
      'echo',
      'New Follower',
      `${echoerName} started following you`,
      echoerId
    );

    // Fallback to console if DB fails
    if (!dbSuccess) {
      console.log('📊 Notification data (console fallback):', { userId, echoerName, echoerId });
    }
    
    return dbSuccess;
  }, [saveNotificationToDB, getProfileName]);

  // Notify about remakes - UPDATED: Fetch profile name
  const notifyRemake = useCallback(async (
    userId: string, 
    remakerId: string, 
    sceneId: string, 
    sceneTitle: string
  ) => {
    const remakerName = await getProfileName(remakerId);
    
    console.log(`📢 REMAKE NOTIFICATION: ${remakerName} remaked your scene "${sceneTitle}"`);
    
    // Save to database
    const dbSuccess = await saveNotificationToDB(
      userId,
      'remake',
      'Scene Remade',
      `${remakerName} remade your scene "${sceneTitle}"`,
      remakerId
    );

    // Fallback to console if DB fails
    if (!dbSuccess) {
      console.log('📊 Notification data (console fallback):', { userId, remakerName, remakerId, sceneId, sceneTitle });
    }
    
    return dbSuccess;
  }, [saveNotificationToDB, getProfileName]);

  // Notify about comments - NEW FUNCTION
  const notifyComment = useCallback(async (
    commenterId: string,
    contentType: string,
    contentId: string
  ) => {
    try {
      // Get content info (owner + name)
      const { ownerId, contentName } = await getContentInfo(contentType, contentId);
      
      if (!ownerId) {
        console.error('❌ No owner found for comment notification');
        return false;
      }

      // Don't notify if user commented on their own content
      if (ownerId === commenterId) {
        console.log('👤 User commented on own content, skipping notification');
        return true;
      }

      const commenterName = await getProfileName(commenterId);
      const contentTypeDisplay = contentType.includes('_repost') 
        ? 'repost' 
        : contentType === 'scene' ? 'scene' :
          contentType === 'character' ? 'character' :
          contentType === 'frame' ? 'frame' :
          contentType === 'monologue' ? 'monologue' : 'content';

      console.log(`💬 COMMENT NOTIFICATION: ${commenterName} commented on ${ownerId}'s ${contentType}`);

      // Save to database
      const dbSuccess = await saveNotificationToDB(
        ownerId,
        'comment',
        'New Comment',
        `${commenterName} commented on your ${contentTypeDisplay}: "${contentName}"`,
        commenterId
      );

      if (!dbSuccess) {
        console.log('📊 Comment notification data (console fallback):', { 
          ownerId, commenterName, contentType, contentId, contentName 
        });
      }
      
      return dbSuccess;
    } catch (err) {
      console.error('💥 Error in notifyComment:', err);
      return false;
    }
  }, [saveNotificationToDB, getProfileName, getContentInfo]);

  // Notify about likes - NEW FUNCTION
  const notifyLike = useCallback(async (
    likerId: string,
    contentType: string,
    contentId: string
  ) => {
    try {
      // Get content info (owner + name)
      const { ownerId, contentName } = await getContentInfo(contentType, contentId);
      
      if (!ownerId) {
        console.error('❌ No owner found for like notification');
        return false;
      }

      // Don't notify if user liked their own content
      if (ownerId === likerId) {
        console.log('👤 User liked own content, skipping notification');
        return true;
      }

      const likerName = await getProfileName(likerId);
      const contentTypeDisplay = contentType.includes('_repost') 
        ? 'repost' 
        : contentType === 'scene' ? 'scene' :
          contentType === 'character' ? 'character' :
          contentType === 'frame' ? 'frame' :
          contentType === 'monologue' ? 'monologue' : 'content';

      console.log(`❤️ LIKE NOTIFICATION: ${likerName} liked ${ownerId}'s ${contentType}`);

      // Save to database
      const dbSuccess = await saveNotificationToDB(
        ownerId,
        'like',
        'New Like',
        `${likerName} liked your ${contentTypeDisplay}: "${contentName}"`,
        likerId
      );

      if (!dbSuccess) {
        console.log('📊 Like notification data (console fallback):', { 
          ownerId, likerName, contentType, contentId, contentName 
        });
      }
      
      return dbSuccess;
    } catch (err) {
      console.error('💥 Error in notifyLike:', err);
      return false;
    }
  }, [saveNotificationToDB, getProfileName, getContentInfo]);

  // Notify about whispers - UPDATED: Fetch profile name
  const notifyWhisper = useCallback(async (
    userId: string, 
    senderId: string, 
    messagePreview: string
  ) => {
    const senderName = await getProfileName(senderId);
    
    console.log(`📢 WHISPER NOTIFICATION: ${senderName} sent a whisper to user ${userId}`);
    
    // Save to database
    const dbSuccess = await saveNotificationToDB(
      userId,
      'whisper',
      'New Whisper',
      `${senderName}: ${messagePreview}`,
      senderId
    );

    // Fallback to console if DB fails
    if (!dbSuccess) {
      console.log('📊 Whisper notification data (console fallback):', { 
        userId, 
        senderName, 
        senderId, 
        messagePreview 
      });
    }
    
    return dbSuccess;
  }, [saveNotificationToDB, getProfileName]);

  // Send prompt emails - STUB FOR NOW (MVP)
  const sendPromptEmail = useCallback((userEmail: string, prompt: string) => {
    console.log(`📧 PROMPT EMAIL: Would send to ${userEmail}`);
    console.log(`📧 Email content: "${prompt}"`);
    
    // Future: Integrate with email service (SendGrid, Resend, etc.)
    // For MVP, we'll just log this
    return true; // Simulate success
  }, []);

  // Get user notifications
  const getUserNotifications = useCallback(async (userId: string, limit: number = 20) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Failed to fetch notifications:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('💥 Error fetching notifications:', err);
      return [];
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('❌ Failed to mark notification as read:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('💥 Error marking notification as read:', err);
      return false;
    }
  }, []);

  // Get unread count
  const getUnreadCount = useCallback(async (userId: string) => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('❌ Failed to get unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (err) {
      console.error('💥 Error getting unread count:', err);
      return 0;
    }
  }, []);

  // Generic notification sender - UPDATED: Added comment and like cases
  const sendNotification = useCallback(async (data: NotificationData) => {
    switch (data.type) {
      case 'echo':
        return await notifyEcho(data.userId, data.echoerId);
      case 'remake':
        return await notifyRemake(data.userId, data.remakerId, data.sceneId, data.sceneTitle);
      case 'comment':
        return await notifyComment(data.commenterId, data.contentType, data.contentId);
      case 'like':
        return await notifyLike(data.likerId, data.contentType, data.contentId);
      case 'whisper':
        return await notifyWhisper(data.userId, data.senderId, data.messagePreview);
      case 'prompt_email':
        return sendPromptEmail(data.userEmail, data.prompt);
      default:
        console.warn('Unknown notification type:', data);
        return false;
    }
  }, [notifyEcho, notifyRemake, notifyComment, notifyLike, notifyWhisper, sendPromptEmail]);

  return {
    notifyEcho,
    notifyRemake,
    notifyComment, // NEW
    notifyLike,    // NEW
    notifyWhisper,
    sendPromptEmail,
    sendNotification,
    getUserNotifications,
    markAsRead,
    getUnreadCount,
  };
};

export default useNotifications;