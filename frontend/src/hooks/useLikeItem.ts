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
  const { notifyLike } = useNotifications(); // ADD THIS LINE

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

        // ADD NOTIFICATION TRIGGER HERE
        if (notifyLike) {
          // Fire-and-forget approach
          setTimeout(() => {
            notifyLike(user.id, content_type, content_id)
              .catch(err => {
                console.error('Failed to send like notification:', err);
              });
          }, 0);
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['likeStatus', variables.content_type, variables.content_id] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
};