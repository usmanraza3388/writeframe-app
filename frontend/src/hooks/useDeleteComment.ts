import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../assets/lib/supabaseClient';

interface DeleteCommentParams {
  content_type: 'scene' | 'monologue' | 'character' | 'frame' | 'character_repost' | 'frame_repost' | 'monologue_repost';
  content_id: string;
  comment_id: string;
}

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content_type, content_id, comment_id }: DeleteCommentParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in to delete comments');

      // Handle both original and repost content types
      const isRepost = content_type.includes('_repost');
      const baseType = isRepost ? content_type.replace('_repost', '') : content_type;
      const tableName = isRepost ? `${content_type}_comments` : `${baseType}_comments`;
      const mainTable = isRepost ? `${baseType}_reposts` : `${baseType}s`;

      // First, verify the user owns this comment
      const { data: comment, error: fetchError } = await supabase
        .from(tableName)
        .select('user_id')
        .eq('id', comment_id)
        .single();

      if (fetchError) throw new Error('Comment not found');
      if (comment.user_id !== user.id) throw new Error('You can only delete your own comments');

      // Delete the comment
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', comment_id);

      if (deleteError) throw deleteError;

      // Decrement comment count in the main table
      const { error: countError } = await supabase
        .rpc('decrement_count', {
          table_name: mainTable,
          id: content_id,
          column_name: 'comment_count'
        });

      if (countError) {
        console.error('Failed to decrement count:', countError);
        // Don't throw here - comment was deleted successfully
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate the comments query to refresh the list
      queryClient.invalidateQueries({ 
        queryKey: ['comments', variables.content_type, variables.content_id] 
      });
      
      // Also invalidate the feed to update counts everywhere
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: (error: Error) => {
      console.error('Error deleting comment:', error);
      // You might want to show a toast notification here
    }
  });
};