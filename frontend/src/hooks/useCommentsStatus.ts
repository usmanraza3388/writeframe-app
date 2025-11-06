import { useQuery } from '@tanstack/react-query';
import { supabase } from '../assets/lib/supabaseClient';

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

// FIXED: Add proper type for the raw comment data
interface RawComment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  }[] | null;
}

export const useCommentsStatus = ({ content_type, content_id }: CommentsStatusParams) => {
  return useQuery({
    queryKey: ['comments', content_type, content_id],
    queryFn: async () => {
      const isRepost = content_type.includes('_repost');
      const baseType = isRepost ? content_type.replace('_repost', '') : content_type;
      const tableName = isRepost ? `${content_type}_comments` : `${baseType}_comments`;
      const idColumn = isRepost ? 'repost_id' : `${baseType}_id`;

      // SIMPLIFIED: Use basic join without foreign key specifiers
      const commentsQuery = supabase
        .from(tableName)
        .select(`
          id,
          user_id,
          content,
          created_at,
          profiles (
            username,
            avatar_url
          )
        `);

      // Execute the query
      const { data: comments, error: commentsError } = await commentsQuery
        .eq(idColumn, content_id)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
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

      // FIXED: Type the comments properly
      const rawComments = comments as RawComment[];
      
      // Transform the data to flatten the profile relationship
      const commentsWithUser: CommentWithUser[] = (rawComments || []).map((comment) => {
        let username = 'Unknown User';
        let avatar_url = null;

        if (comment.profiles) {
          if (Array.isArray(comment.profiles) && comment.profiles.length > 0) {
            // FIXED: Access array element properly
            username = comment.profiles[0]?.username || 'Unknown User';
            avatar_url = comment.profiles[0]?.avatar_url || null;
          } else if (typeof comment.profiles === 'object' && !Array.isArray(comment.profiles)) {
            // Handle case where profiles is a single object
            const profileObj = comment.profiles as any;
            username = profileObj.username || 'Unknown User';
            avatar_url = profileObj.avatar_url || null;
          }
        }
        
        return {
          id: comment.id,
          user_id: comment.user_id,
          content: comment.content,
          created_at: comment.created_at,
          user: { username, avatar_url }
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