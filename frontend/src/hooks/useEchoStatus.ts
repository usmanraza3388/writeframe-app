import { useQuery } from '@tanstack/react-query';
import { supabase } from '../assets/lib/supabaseClient';

export const useEchoStatus = (targetUserId: string) => {
  return useQuery({
    queryKey: ['echo-status', targetUserId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { isEchoing: false };

      const { data: echo } = await supabase
        .from('user_echoes')
        .select('id')
        .eq('from_user_id', user.id)
        .eq('to_user_id', targetUserId)
        .single();

      return {
        isEchoing: !!echo
      };
    },
    enabled: !!targetUserId,
  });
};