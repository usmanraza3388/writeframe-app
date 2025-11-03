import { useState, useEffect } from 'react';
import { supabase } from '../assets/lib/supabaseClient';

export interface SavedItem {
  id: string;
  user_id: string;
  content_type: 'scene' | 'monologue' | 'character' | 'frame';
  content_id: string;
  saved_at: string;
  scene?: any;
  monologue?: any;
  character?: any;
  frame?: any;
}

export const useSavedItems = () => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSavedItems = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No user found - returning empty saved items');
        setSavedItems([]);
        return;
      }

      console.log('🔍 Fetching saved items for user:', user.id);

      // SIMPLIFIED QUERY - Get only saved_items first
      const { data: savedItemsData, error } = await supabase
        .from('saved_items')
        .select('*')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });

      console.log('📊 Basic saved items result:', { 
        dataCount: savedItemsData?.length, 
        data: savedItemsData, 
        error 
      });

      if (error) {
        console.error('❌ Error fetching saved items:', error);
        throw error;
      }

      // If we have saved items, fetch the content data separately
      if (savedItemsData && savedItemsData.length > 0) {
        console.log('🔄 Fetching content data for saved items...');
        
        const savedItemsWithContent = await Promise.all(
          savedItemsData.map(async (savedItem) => {
            let contentData = null;
            
            try {
              const { data, error } = await supabase
                .from(savedItem.content_type + 's') // scenes, monologues, etc.
                .select(`
                  *,
                  user:profiles!inner (
                    username,
                    avatar_url,
                    full_name,
                    genre_persona
                  )
                `)
                .eq('id', savedItem.content_id)
                .single();

              if (!error && data) {
                contentData = data;
              } else {
                console.error(`Error fetching ${savedItem.content_type} data:`, error);
              }
            } catch (err) {
              console.error(`Error fetching ${savedItem.content_type} data:`, err);
            }

            return {
              ...savedItem,
              [savedItem.content_type]: contentData
            };
          })
        );

        console.log('✅ Final saved items with content:', savedItemsWithContent);
        setSavedItems(savedItemsWithContent);
      } else {
        console.log('ℹ️ No saved items found');
        setSavedItems([]);
      }
    } catch (err) {
      console.error('💥 Error in fetchSavedItems:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 useSavedItems hook mounted - fetching saved items');
    fetchSavedItems();
  }, []);

  return {
    savedItems,
    loading,
    error,
    refetch: fetchSavedItems
  };
};