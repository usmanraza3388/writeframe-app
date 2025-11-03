import { useState, useEffect } from 'react';
import { supabase } from '../assets/lib/supabaseClient';

export const useSavedStatus = (content_type: string, content_id: string) => {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!content_type || !content_id) {
        console.log('❌ Missing content_type or content_id:', { content_type, content_id });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('❌ No user found - setting isSaved to false');
          setIsSaved(false);
          setLoading(false);
          return;
        }

        console.log('🔍 Checking saved status for:', { content_type, content_id, user_id: user.id });

        // Use .maybeSingle() instead of .single() to handle no rows gracefully
        const { data, error } = await supabase
          .from('saved_items')
          .select('id')
          .eq('user_id', user.id)
          .eq('content_type', content_type)
          .eq('content_id', content_id)
          .maybeSingle(); // Changed from .single() to .maybeSingle()

        console.log('📊 Saved status result:', { 
          data, 
          error,
          isSaved: !!data,
          hasError: !!error,
          errorCode: error?.code 
        });

        if (error) {
          // Only throw if it's not a "no rows" error
          if (error.code !== 'PGRST116') {
            console.error('❌ Non-PGRST116 error:', error);
            throw error;
          }
          console.log('ℹ️ No saved item found (PGRST116) - setting isSaved to false');
          setIsSaved(false);
        } else {
          console.log('✅ Setting isSaved to:', !!data);
          setIsSaved(!!data);
        }
      } catch (err) {
        console.error('💥 Error checking saved status:', err);
        setError(err as Error);
        setIsSaved(false); // Default to false on error
      } finally {
        console.log('🏁 Saved status check completed - loading:', false);
        setLoading(false);
      }
    };

    console.log('🚀 useSavedStatus effect triggered for:', { content_type, content_id });
    checkSavedStatus();
  }, [content_type, content_id]);

  console.log('🔄 useSavedStatus returning:', { isSaved, loading, error: error?.message });

  return {
    isSaved,
    loading,
    error
  };
};