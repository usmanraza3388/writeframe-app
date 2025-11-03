// hooks/useFrameActions.ts
import { useState } from 'react';
import { frameActions } from '../utils/frameActions';
import { supabase } from '../assets/lib/supabaseClient';

export const useFrameActions = (frameId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const like = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to like a frame');

      await frameActions.likeFrame(frameId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like frame');
      throw err; // Re-throw to handle in component
    } finally {
      setIsLoading(false);
    }
  };

  const comment = async (content: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to comment');

      const result = await frameActions.addComment(frameId, content);
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to comment on frame');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const share = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await frameActions.incrementShareCount(frameId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share frame');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    like,
    comment,
    share,
    isLoading,
    error,
    clearError,
  };
};