import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../assets/lib/supabaseClient';
import { useNotifications } from './useNotifications'; // ADD THIS IMPORT

// UPDATED: Added repost content types
interface LikeItemParams {
  content_type: 'scene' | 'monologue' | 'character' | 'frame' | 'character_repost' | 'frame_repost' | 'monologue_repost';
  content_id: string;
}

export const useLikeItem = () => {
  const queryClient = useQueryClient();
  const { sendNotification } = useNotifications(); // ADD THIS HOOK

  return useMutation({
    mutationFn: async ({ content_type, content_id }: LikeItemParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in to like items');

      // CAREFULLY UPDATED: Handle both original and repost content types
      const isRepost = content_type.includes('_repost');
      const baseType = isRepost ? content_type.replace('_repost', '') : content_type;
      const tableName = isRepost ? `${content_type}_likes` : `${baseType}_likes`;
      const idColumn = isRepost ? 'repost_id' : `${baseType}_id`;
      const mainTable = isRepost ? `${baseType}_reposts` : `${baseType}s`;
      
      // Check if already liked
      const { data: existingLike } = await supabase
        .from(tableName)
        .select('id')
        .eq('user_id', user.id)
        .eq(idColumn, content_id)
        .single();

      if (existingLike) {
        // Unlike: Delete the like
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', existingLike.id);
        if (error) throw error;
        
        // Decrement count in appropriate main table
        await supabase.rpc('decrement_count', {
          table_name: mainTable,
          id: content_id,
          column_name: 'like_count'
        });
      } else {
        // Like: Insert new like
        const { error } = await supabase
          .from(tableName)
          .insert({
            user_id: user.id,
            [idColumn]: content_id,
          });
        if (error) throw error;
        
        // Increment count in appropriate main table
        await supabase.rpc('increment_count', {
          table_name: mainTable,
          id: content_id,
          column_name: 'like_count'
        });

        // ADDED: Send notification for new likes (not unlikes)
        try {
          // Get content owner and title for notification
          const { data: contentData } = await supabase
            .from(mainTable)
            .select('user_id, title')
            .eq('id', content_id)
            .single();

          if (contentData) {
            // Don't send notification if user is liking their own content
            if (contentData.user_id !== user.id) {
              await sendNotification({
                type: 'like',
                userId: contentData.user_id, // Content owner
                likerId: user.id, // Current user who liked
                contentId: content_id,
                contentTitle: contentData.title || 'Untitled',
                contentType: isRepost ? 'repost' : (baseType as 'scene' | 'monologue' | 'character' | 'frame')
              });
            }
          }
        } catch (notificationError) {
          console.error('Failed to send like notification:', notificationError);
          // Don't fail the like operation if notification fails
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['likeStatus', variables.content_type, variables.content_id] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
};