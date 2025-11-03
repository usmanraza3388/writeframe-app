// hooks/useUnlikeItem.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../assets/lib/supabaseClient';

interface UnlikeItemParams {
  content_type: 'scene' | 'monologue' | 'character' | 'frame';
  content_id: string;
}

export const useUnlikeItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content_type, content_id }: UnlikeItemParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in to unlike items');

      const tableName = `${content_type}_likes`;
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('user_id', user.id)
        .eq(`${content_type}_id`, content_id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: [variables.content_type + 's'] });
    },
  });
};