import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../assets/lib/supabaseClient';

export const useFollowUser = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in to echo');

      // Check if already echoing - FIX: Remove .single() for empty tables
      const { data: existingEchoes, error: checkError } = await supabase
        .from('user_echoes')
        .select('id')
        .eq('from_user_id', user.id)
        .eq('to_user_id', userId);

      if (checkError) throw checkError;

      const isEchoing = existingEchoes && existingEchoes.length > 0;

      if (isEchoing) {
        // Unecho
        const { error } = await supabase
          .from('user_echoes')
          .delete()
          .eq('from_user_id', user.id)
          .eq('to_user_id', userId);

        if (error) throw error;
        return { action: 'unecho' };
      } else {
        // Echo
        const { error } = await supabase
          .from('user_echoes')
          .insert({
            from_user_id: user.id,
            to_user_id: userId
          });

        if (error) throw error;
        return { action: 'echo' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['echo-status', userId] });
    }
  });
};