// src/hooks/useViewItem.ts
import { useState, useCallback } from 'react';
import { supabase } from '../assets/lib/supabaseClient'; // Adjust path to your supabase client

type ContentType = 'scene' | 'monologue' | 'character' | 'frame' | 
                   'monologue_repost' | 'character_repost' | 'frame_repost';

interface UseViewItemProps {
  content_type: ContentType;
  content_id: string;
}

interface ViewResponse {
  success: boolean;
  view_count: number;
}

export const useViewItem = () => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const incrementView = useCallback(async ({ 
    content_type, 
    content_id 
  }: UseViewItemProps): Promise<ViewResponse | null> => {
    setIsPending(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .rpc('increment_view_count', {
          content_type,
          content_id
        });

      if (error) throw error;

      return {
        success: true,
        view_count: data as number
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to increment view');
      setError(error);
      console.error('Error incrementing view:', error);
      return null;
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    incrementView,
    isPending,
    error
  };
};

export const useViewCount = ({ 
  content_type, 
  content_id 
}: UseViewItemProps) => {
  const [data, setData] = useState<{ viewCount: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchViewCount = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query;
      
      // Select from the appropriate table
      switch (content_type) {
        case 'scene':
          query = supabase.from('scenes').select('view_count').eq('id', content_id).single();
          break;
        case 'monologue':
          query = supabase.from('monologues').select('view_count').eq('id', content_id).single();
          break;
        case 'character':
          query = supabase.from('characters').select('view_count').eq('id', content_id).single();
          break;
        case 'frame':
          query = supabase.from('frames').select('view_count').eq('id', content_id).single();
          break;
        case 'monologue_repost':
          query = supabase.from('monologue_reposts').select('view_count').eq('id', content_id).single();
          break;
        case 'character_repost':
          query = supabase.from('character_reposts').select('view_count').eq('id', content_id).single();
          break;
        case 'frame_repost':
          query = supabase.from('frame_reposts').select('view_count').eq('id', content_id).single();
          break;
        default:
          throw new Error(`Invalid content type: ${content_type}`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setData({ viewCount: data?.view_count || 0 });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch view count');
      setError(error);
      console.error('Error fetching view count:', error);
    } finally {
      setIsLoading(false);
    }
  }, [content_type, content_id]);

  return {
    data,
    isLoading,
    error,
    fetchViewCount
  };
};