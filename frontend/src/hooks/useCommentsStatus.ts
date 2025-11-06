import { useQuery } from '@tanstack/react-query';
import { supabase } from '../assets/lib/supabaseClient';

// UPDATED: Added repost content types
interface CommentsStatusParams {
  content_type: 'scene' | 'monologue' | 'character' | 'frame' | 'character_repost' | 'frame_repost' | 'monologue_repost';
  content_id: string;
}

interface CommentWithUser {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: {
    username: string;
    avatar_url: string | null;
  };
}

export const useCommentsStatus = ({ content_type, content_id }: CommentsStatusParams) => {
  return useQuery({
    queryKey: ['comments', content_type, content_id],
    queryFn: async () => {
      // CAREFULLY UPDATED: Handle both original and repost content types
      const isRepost = content_type.includes('_repost');
      const baseType = isRepost ? content_type.replace('_repost', '') : content_type;
      const tableName = isRepost ? `${content_type}_comments` : `${baseType}_comments`;
      const idColumn = isRepost ? 'repost_id' : `${baseType}_id`;
      
      // FIXED: Use exact foreign key constraint names for each table
      let commentsQuery;

      if (tableName === 'monologue_comments') {
        // Use the correct foreign key for monologue_comments
        commentsQuery = supabase
          .from(tableName)
          .select(`
            id,
            user_id,
            content,
            created_at,
            profiles!monologue_comments_user_id_fkey (
              username,
              avatar_url
            )
          `);
      } else if (tableName === 'scene_comments') {
        // Use the correct foreign key for scene_comments
        commentsQuery = supabase
          .from(tableName)
          .select(`
            id,
            user_id,
            content,
            created_at,
            profiles!scene_comments_user_id_fkey (
              username,
              avatar_url
            )
          `);
      } else if (tableName === 'character_comments') {
        // Use the correct foreign key for character_comments
        commentsQuery = supabase
          .from(tableName)
          .select(`
            id,
            user_id,
            content,
            created_at,
            profiles!character_comments_user_id_fkey (
              username,
              avatar_url
            )
          `);
      } else if (tableName === 'frame_comments') {
        // Use the correct foreign key for frame_comments
        commentsQuery = supabase
          .from(tableName)
          .select(`
            id,
            user_id,
            content,
            created_at,
            profiles!frame_comments_user_id_fkey (
              username,
              avatar_url
            )
          `);
      } else if (tableName === 'character_repost_comments') {
        // Use the correct foreign key for character_repost_comments
        commentsQuery = supabase
          .from(tableName)
          .select(`
            id,
            user_id,
            content,
            created_at,
            profiles!character_repost_comments_user_id_fkey (
              username,
              avatar_url
            )
          `);
      } else if (tableName === 'frame_repost_comments') {
        // Use the correct foreign key for frame_repost_comments
        commentsQuery = supabase
          .from(tableName)
          .select(`
            id,
            user_id,
            content,
            created_at,
            profiles!frame_repost_comments_user_id_fkey (
              username,
              avatar_url
            )
          `);
      } else if (tableName === 'monologue_repost_comments') {
        // Use the correct foreign key for monologue_repost_comments
        commentsQuery = supabase
          .from(tableName)
          .select(`
            id,
            user_id,
            content,
            created_at,
            profiles!monologue_repost_comments_user_id_fkey (
              username,
              avatar_url
            )
          `);
      } else {
        // Fallback for any unknown tables
        commentsQuery = supabase
          .from(tableName)
          .select(`
            id,
            user_id,
            content,
            created_at,
            profiles:user_id (
              username,
              avatar_url
            )
          `);
      }

      // Execute the query
      const { data: comments, error: commentsError } = await commentsQuery
        .eq(idColumn, content_id)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
        // Fallback to just count if comments fetch fails
        const mainTable = isRepost ? `${baseType}_reposts` : `${baseType}s`;
        const { data: contentData } = await supabase
          .from(mainTable)
          .select('comment_count')
          .eq('id', content_id)
          .single();

        return {
          commentCount: contentData?.comment_count || 0,
          comments: []
        };
      }

      // FIXED: Simplified transform - profiles will be an array due to proper join
      const commentsWithUser: CommentWithUser[] = (comments || []).map(comment => {
        // With proper foreign key joins, profiles is guaranteed to be an array
        const profile = comment.profiles && comment.profiles[0];
        
        return {
          id: comment.id,
          user_id: comment.user_id,
          content: comment.content,
          created_at: comment.created_at,
          user: {
            username: profile?.username || 'Unknown User',
            avatar_url: profile?.avatar_url || null
          }
        };
      });

      // Get comment count from main table for consistency
      const mainTable = isRepost ? `${baseType}_reposts` : `${baseType}s`;
      const { data: contentData } = await supabase
        .from(mainTable)
        .select('comment_count')
        .eq('id', content_id)
        .single();

      return {
        commentCount: contentData?.comment_count || commentsWithUser.length,
        comments: commentsWithUser
      };
    },
    enabled: !!content_id,
  });
};