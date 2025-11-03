import { useQuery } from '@tanstack/react-query';
import { supabase } from '../assets/lib/supabaseClient';

// UPDATED: Added repost content types
interface ShareStatusParams {
  content_type: 'scene' | 'monologue' | 'character' | 'frame' | 'character_repost' | 'frame_repost' | 'monologue_repost';
  content_id: string;
}

export const useShareStatus = ({ content_type, content_id }: ShareStatusParams) => {
  return useQuery({
    queryKey: ['shareStatus', content_type, content_id],
    queryFn: async () => {
      // CAREFULLY UPDATED: Handle both original and repost content types
      const isRepost = content_type.includes('_repost');
      const baseType = isRepost ? content_type.replace('_repost', '') : content_type;
      const mainTable = isRepost ? `${baseType}_reposts` : `${baseType}s`;

      const { data: contentData } = await supabase
        .from(mainTable)
        .select('share_count')
        .eq('id', content_id)
        .single();

      return {
        shareCount: contentData?.share_count || 0,
      };
    },
    enabled: !!content_id,
  });
};