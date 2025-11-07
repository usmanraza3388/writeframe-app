import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../assets/lib/supabaseClient';

export const useFollowUser = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in to echo');

      // Check if already echoing
      const { data: existingEcho } = await supabase
        .from('user_echoes')
        .select('id')
        .eq('from_user_id', user.id)
        .eq('to_user_id', userId)
        .single();

      if (existingEcho) {
        // Unecho - remove the echo relationship
        const { error } = await supabase
          .from('user_echoes')
          .delete()
          .eq('id', existingEcho.id);

        if (error) throw error;
        
        console.log('Unechoed user:', userId);
      } else {
        // Echo - create echo relationship
        const { error } = await supabase
          .from('user_echoes')
          .insert({
            from_user_id: user.id,
            to_user_id: userId
          });

        if (error) throw error;
        
        console.log('Echoed user:', userId);
      }
    },
    onSuccess: () => {
      // Refresh all relevant data
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['profile-data', userId] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['echo-status', userId] });
    },
    onError: (error) => {
      console.error('Echo operation failed:', error);
    }
  });
};