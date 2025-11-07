// src/hooks/useUserProfile.js - FIXED VERSION
import { useState, useEffect } from 'react';
import { supabase } from '../assets/lib/supabaseClient';

export function useUserProfile(userId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) {
          throw profileError;
        }

        setData(profileData);
        setError(null);
      } catch (err) {
        console.error('Profile fetch failed:', err);
        setError(err.message);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return { data, isLoading, error };
}

// FIXED: Actual implementation that works with database
export function useFollowUser(userId) {
  const [isLoading, setIsLoading] = useState(false);
  
  const mutateAsync = async () => {
    if (!userId) throw new Error('User ID is required');
    
    setIsLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in to echo');

      // Check if already echoing
      const { data: existingEchoes, error: checkError } = await supabase
        .from('user_echoes')
        .select('id')
        .eq('from_user_id', user.id)
        .eq('to_user_id', userId);

      if (checkError) throw checkError;

      const isEchoing = existingEchoes && existingEchoes.length > 0;

      if (isEchoing) {
        // Unecho - remove the relationship
        const { error: deleteError } = await supabase
          .from('user_echoes')
          .delete()
          .eq('from_user_id', user.id)
          .eq('to_user_id', userId);

        if (deleteError) throw deleteError;
        return { action: 'unecho' };
      } else {
        // Echo - create the relationship
        const { error: insertError } = await supabase
          .from('user_echoes')
          .insert({
            from_user_id: user.id,
            to_user_id: userId
          });

        if (insertError) throw insertError;
        return { action: 'echo' };
      }
    } catch (error) {
      console.error('Echo operation failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutateAsync, isLoading };
}

export function useWhisper(userId) {
  const mutate = async ({ message }) => {
    console.log('Whisper to:', userId, 'Message:', message);
  };

  return { mutate };
}