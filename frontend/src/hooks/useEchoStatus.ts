import { useQuery } from '@tanstack/react-query';
import { supabase } from '../assets/lib/supabaseClient';

export const useEchoStatus = (targetUserId: string) => {
  return useQuery({
    queryKey: ['echo-status', targetUserId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { isEchoing: false };

      // Check echo status without .single()
      const { data: echoes, error } = await supabase
        .from('user_echoes')
        .select('id')
        .eq('from_user_id', user.id)
        .eq('to_user_id', targetUserId);

      if (error) {
        return { isEchoing: false };
      }

      return {
        isEchoing: !!echoes && echoes.length > 0
      };
    },
    enabled: !!targetUserId,
  });
};