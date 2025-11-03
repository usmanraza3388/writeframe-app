import { useQuery } from '@tanstack/react-query';
import { supabase } from '../assets/lib/supabaseClient';

// UPDATED: Added repost content types
interface LikesStatusParams {
  content_type: 'scene' | 'monologue' | 'character' | 'frame' | 'character_repost' | 'frame_repost' | 'monologue_repost';
  content_id: string;
}

export const useLikesStatus = ({ content_type, content_id }: LikesStatusParams) => {
  return useQuery({
    queryKey: ['likeStatus', content_type, content_id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // CAREFULLY UPDATED: Handle both original and repost content types
      const isRepost = content_type.includes('_repost');
      const baseType = isRepost ? content_type.replace('_repost', '') : content_type;
      const tableName = isRepost ? `${content_type}_likes` : `${baseType}_likes`;
      const idColumn = isRepost ? 'repost_id' : `${baseType}_id`;
      const mainTable = isRepost ? `${baseType}_reposts` : `${baseType}s`;
      
      // Check if user has liked
      let hasLiked = false;
      if (user) {
        const { data: likeData } = await supabase
          .from(tableName)
          .select('id')
          .eq('user_id', user.id)
          .eq(idColumn, content_id)
          .single();
        hasLiked = !!likeData;
      }

      // Get like count from appropriate main table (optimized)
      const { data: contentData } = await supabase
        .from(mainTable)
        .select('like_count')
        .eq('id', content_id)
        .single();

      return {
        hasLiked,
        likeCount: contentData?.like_count || 0,
      };
    },
    enabled: !!content_id,
  });
};