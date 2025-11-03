import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../assets/lib/supabaseClient';

// UPDATED: Added repost content types
interface CommentItemParams {
  content_type: 'scene' | 'monologue' | 'character' | 'frame' | 'character_repost' | 'frame_repost' | 'monologue_repost';
  content_id: string;
  content: string;
}

export const useCommentItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content_type, content_id, content }: CommentItemParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in to comment');

      // CAREFULLY UPDATED: Handle both original and repost content types
      const isRepost = content_type.includes('_repost');
      const baseType = isRepost ? content_type.replace('_repost', '') : content_type;
      const tableName = isRepost ? `${content_type}_comments` : `${baseType}_comments`;
      const idColumn = isRepost ? 'repost_id' : `${baseType}_id`;
      const mainTable = isRepost ? `${baseType}_reposts` : `${baseType}s`;
      
      const { error } = await supabase
        .from(tableName)
        .insert({
          user_id: user.id,
          [idColumn]: content_id,
          content: content,
        });

      if (error) throw error;
      
      // Increment comment count in the appropriate main table
      await supabase.rpc('increment_count', {
        table_name: mainTable,
        id: content_id,
        column_name: 'comment_count'
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.content_type, variables.content_id] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
};