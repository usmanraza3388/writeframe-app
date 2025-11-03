import { useState } from 'react';
import { supabase } from '../assets/lib/supabaseClient';

interface SaveItemParams {
  content_type: 'scene' | 'monologue' | 'character' | 'frame';
  content_id: string;
}

export const useSaveItem = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const saveItem = async ({ content_type, content_id }: SaveItemParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in to save items');

      const { data, error } = await supabase
        .from('saved_items')
        .insert([
          { 
            user_id: user.id, 
            content_type, 
            content_id 
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unsaveItem = async ({ content_type, content_id }: SaveItemParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in to unsave items');

      const { error } = await supabase
        .from('saved_items')
        .delete()
        .eq('user_id', user.id)
        .eq('content_type', content_type)
        .eq('content_id', content_id);

      if (error) throw error;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    saveItem,
    unsaveItem,
    loading,
    error
  };
};