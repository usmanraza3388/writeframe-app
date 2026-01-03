// src/hooks/useUnreadWhispersCount.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../assets/lib/supabaseClient';

export const useUnreadWhispersCount = () => {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch current unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) {
      setCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { count, error } = await supabase
        .from('whispers')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false)
        .eq('is_unsent', false);

      if (error) throw error;
      
      setCount(count || 0);
    } catch (err) {
      console.error('Error fetching unread whispers count:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch count'));
      setCount(0); // Reset to 0 on error to avoid false positives
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Initial fetch and real-time subscription
  useEffect(() => {
    if (!user?.id) {
      setCount(0);
      setIsLoading(false);
      return;
    }

    // Fetch initial count
    fetchUnreadCount();

    // Subscribe to INSERT events (new whispers)
    const insertChannel = supabase
      .channel(`whispers-insert-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whispers',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          // When new whisper arrives, increment count
          setCount(prev => prev + 1);
        }
      )
      .subscribe();

    // Subscribe to UPDATE events (when whispers are marked as read/unsent)
    const updateChannel = supabase
      .channel(`whispers-update-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'whispers',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          const newData = payload.new as { is_read: boolean; is_unsent: boolean };
          const oldData = payload.old as { is_read: boolean; is_unsent: boolean };
          
          // If whisper was marked as read or unsent, decrement count
          if ((!oldData.is_read && newData.is_read) || 
              (!oldData.is_unsent && newData.is_unsent)) {
            setCount(prev => Math.max(0, prev - 1));
          }
          // If whisper was un-read or un-unsent, increment count
          else if ((oldData.is_read && !newData.is_read) || 
                   (oldData.is_unsent && !newData.is_unsent)) {
            setCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(insertChannel);
      supabase.removeChannel(updateChannel);
    };
  }, [user?.id, fetchUnreadCount]);

  return {
    count,
    isLoading,
    error,
    refresh: fetchUnreadCount // Manual refresh option
  };
};

export default useUnreadWhispersCount;