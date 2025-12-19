// frontend/src/hooks/useHint.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../assets/lib/supabaseClient';

// Define ALL possible hint IDs (we'll use them one by one)
export type HintId = 
  | 'create_button' 
  | 'feed_interaction' 
  | 'whispers' 
  | 'remake_action' 
  | 'profile_tabs';

interface UseHintReturn {
  isVisible: boolean;
  show: () => void;
  dismiss: () => Promise<void>;
  isLoading: boolean;
}

export const useHint = (hintId: HintId): UseHintReturn => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user has already seen this hint
  useEffect(() => {
    const checkHintStatus = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user's profile with hints_seen
        const { data, error } = await supabase
          .from('profiles')
          .select('hints_seen')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        // Check if this specific hint has been seen
        // If hints_seen is null or doesn't have this key, show the hint
        const hasSeen = data?.hints_seen?.[hintId] === true;
        
        // Only show if NOT seen AND user exists
        setIsVisible(!hasSeen);
      } catch (error) {
        console.error('Error checking hint status:', error);
        setIsVisible(false); // Don't show hint on error
      } finally {
        setIsLoading(false);
      }
    };

    checkHintStatus();
  }, [user, hintId]);

  // Mark hint as seen in Supabase
  const dismiss = useCallback(async () => {
    if (!user) return;

    try {
      // Get current hints_seen
      const { data: currentData } = await supabase
        .from('profiles')
        .select('hints_seen')
        .eq('id', user.id)
        .single();

      // Update with this hint marked as seen
      const currentHints = currentData?.hints_seen || {};
      const updatedHints = {
        ...currentHints,
        [hintId]: true
      };

      // Update in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ hints_seen: updatedHints })
        .eq('id', user.id);

      if (error) throw error;

      // Hide the hint locally
      setIsVisible(false);
    } catch (error) {
      console.error('Error dismissing hint:', error);
    }
  }, [user, hintId]);

  // Manually show the hint (optional, for testing)
  const show = useCallback(() => {
    setIsVisible(true);
  }, []);

  return {
    isVisible,
    show,
    dismiss,
    isLoading
  };
};