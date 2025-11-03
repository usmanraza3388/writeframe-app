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
        console.log('🔄 Fetching profile for:', userId);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        console.log('📊 Profile fetch result:', profileData);
        console.log('❌ Profile fetch error:', profileError);

        if (profileError) {
          throw profileError;
        }

        setData(profileData);
        setError(null);
      } catch (err) {
        console.error('🚨 Profile fetch failed:', err);
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

// Keep the other hooks as they are for now
export function useFollowUser(userId) {
  const [isLoading, setIsLoading] = useState(false);
  
  const mutateAsync = async () => {
    setIsLoading(true);
    try {
      // This will also need fixing later
      console.log('Follow user:', userId);
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