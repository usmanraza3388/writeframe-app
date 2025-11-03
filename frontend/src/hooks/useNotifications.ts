// src/hooks/useNotifications.ts
import { useCallback } from 'react';
import { supabase } from '../assets/lib/supabaseClient';

// Notification types
export type NotificationType = 'echo' | 'remake' | 'comment' | 'follow' | 'whisper';

// Notification payload interfaces
export interface EchoNotification {
  type: 'echo';
  userId: string;
  echoerName: string;
  echoerId: string;
}

export interface RemakeNotification {
  type: 'remake';
  userId: string;
  remakerName: string;
  remakerId: string;
  sceneId: string;
  sceneTitle: string;
}

export interface CommentNotification {
  type: 'comment';
  userId: string;
  commenterName: string;
  commenterId: string;
  sceneId: string;
  sceneTitle: string;
}

export interface PromptEmailNotification {
  type: 'prompt_email';
  userEmail: string;
  prompt: string;
}

export interface WhisperNotification {
  type: 'whisper';
  userId: string;
  senderName: string;
  senderId: string;
  messagePreview: string;
}

export type NotificationData = EchoNotification | RemakeNotification | CommentNotification | PromptEmailNotification | WhisperNotification;

// Enhanced notification service with database integration
export const useNotifications = () => {
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

  // Notify about echoes - NOW WITH DATABASE
  const notifyEcho = useCallback(async (userId: string, echoerName: string, echoerId: string) => {
    console.log(`📢 ECHO NOTIFICATION: ${echoerName} echoed user ${userId}`);
    
    // Save to database
    const dbSuccess = await saveNotificationToDB(
      userId,
      'echo',
      'New Echo',
      `${echoerName} echoed your profile`,
      echoerId
    );

    // Fallback to console if DB fails
    if (!dbSuccess) {
      console.log('📊 Notification data (console fallback):', { userId, echoerName, echoerId });
    }
    
    return dbSuccess;
  }, [saveNotificationToDB]);

  // Notify about remakes - NOW WITH DATABASE
  const notifyRemake = useCallback(async (
    userId: string, 
    remakerName: string, 
    remakerId: string, 
    sceneId: string, 
    sceneTitle: string
  ) => {
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
  }, [saveNotificationToDB]);

  // Notify about whispers - NOW WITH DATABASE
  const notifyWhisper = useCallback(async (
    userId: string, 
    senderName: string, 
    senderId: string, 
    messagePreview: string
  ) => {
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
  }, [saveNotificationToDB]);

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
        return await notifyEcho(data.userId, data.echoerName, data.echoerId);
      case 'remake':
        return await notifyRemake(data.userId, data.remakerName, data.remakerId, data.sceneId, data.sceneTitle);
      case 'whisper':
        return await notifyWhisper(data.userId, data.senderName, data.senderId, data.messagePreview);
      case 'prompt_email':
        return sendPromptEmail(data.userEmail, data.prompt);
      default:
        console.warn('Unknown notification type:', data);
        return false;
    }
  }, [notifyEcho, notifyRemake, notifyWhisper, sendPromptEmail]);

  return {
    notifyEcho,
    notifyRemake,
    notifyWhisper,
    sendPromptEmail,
    sendNotification,
    getUserNotifications,
    markAsRead,
    getUnreadCount,
  };
};

export default useNotifications;