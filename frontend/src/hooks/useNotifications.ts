// src/hooks/useNotifications.ts
import { useCallback } from 'react';
import { supabase } from '../assets/lib/supabaseClient';

// Notification types
export type NotificationType = 'echo' | 'remake' | 'comment' | 'follow' | 'whisper' | 'like';

// Notification payload interfaces - REMOVED name fields
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

export interface CommentNotification {
  type: 'comment';
  userId: string;
  commenterId: string;
  contentId: string;
  contentTitle: string;
  contentType: 'scene' | 'frame' | 'character' | 'monologue' | 'repost';
}

export interface LikeNotification {
  type: 'like';
  userId: string;
  likerId: string;
  contentId: string;
  contentTitle: string;
  contentType: 'scene' | 'frame' | 'character' | 'monologue' | 'repost';
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

export type NotificationData = EchoNotification | RemakeNotification | CommentNotification | LikeNotification | PromptEmailNotification | WhisperNotification;

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
      sceneId
    );

    // Fallback to console if DB fails
    if (!dbSuccess) {
      console.log('📊 Notification data (console fallback):', { userId, remakerName, remakerId, sceneId, sceneTitle });
    }
    
    return dbSuccess;
  }, [saveNotificationToDB, getProfileName]);

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

  // Notify about comments
  const notifyComment = useCallback(async (
    userId: string, 
    commenterId: string, 
    contentId: string,
    contentTitle: string,
    contentType: string
  ) => {
    const commenterName = await getProfileName(commenterId);
    
    console.log(`📢 COMMENT NOTIFICATION: ${commenterName} commented on your ${contentType} "${contentTitle}"`);
    
    const dbSuccess = await saveNotificationToDB(
      userId,
      'comment',
      'New Comment',
      `${commenterName} commented on your ${contentType} "${contentTitle}"`,
      commenterId
    );

    if (!dbSuccess) {
      console.log('📊 Comment notification fallback:', { 
        userId, 
        commenterName, 
        commenterId, 
        contentId, 
        contentTitle,
        contentType 
      });
    }
    
    return dbSuccess;
  }, [saveNotificationToDB, getProfileName]);

  // Notify about likes
  const notifyLike = useCallback(async (
    userId: string, 
    likerId: string, 
    contentId: string,
    contentTitle: string,
    contentType: string
  ) => {
    const likerName = await getProfileName(likerId);
    
    console.log(`📢 LIKE NOTIFICATION: ${likerName} liked your ${contentType} "${contentTitle}"`);
    
    const dbSuccess = await saveNotificationToDB(
      userId,
      'like',
      'New Like',
      `${likerName} liked your ${contentType} "${contentTitle}"`,
      likerId
    );

    if (!dbSuccess) {
      console.log('📊 Like notification fallback:', { 
        userId, 
        likerName, 
        likerId, 
        contentId, 
        contentTitle,
        contentType 
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

  // Generic notification sender
  const sendNotification = useCallback(async (data: NotificationData) => {
    switch (data.type) {
      case 'echo':
        return await notifyEcho(data.userId, data.echoerId);
      case 'remake':
        return await notifyRemake(data.userId, data.remakerId, data.sceneId, data.sceneTitle);
      case 'comment':
        const commentData = data as CommentNotification;
        return await notifyComment(
          commentData.userId, 
          commentData.commenterId, 
          commentData.contentId,
          commentData.contentTitle,
          commentData.contentType
        );
      case 'like':
        const likeData = data as LikeNotification;
        return await notifyLike(
          likeData.userId,
          likeData.likerId,
          likeData.contentId,
          likeData.contentTitle,
          likeData.contentType
        );
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
    notifyWhisper,
    notifyComment,
    notifyLike,
    sendPromptEmail,
    sendNotification,
    getUserNotifications,
    markAsRead,
    getUnreadCount,
  };
};

export default useNotifications;