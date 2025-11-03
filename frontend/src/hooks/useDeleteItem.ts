// hooks/useDeleteItem.ts
import { useState } from 'react';
import { supabase } from '../assets/lib/supabaseClient';

export const useDeleteItem = () => {
  const [isLoading, setIsLoading] = useState(false);

  const deleteItem = async (itemId: string, itemType: 'scene' | 'monologue' | 'character' | 'frame') => {
    setIsLoading(true);
    try {
      let tableName: string;
      
      switch (itemType) {
        case 'scene':
          // SPECIAL HANDLING FOR SCENES - check if it's a remake first
          return await deleteSceneWithRemakeHandling(itemId);
        case 'monologue':
          tableName = 'monologues';
          break;
        case 'character':
          tableName = 'characters';
          break;
        case 'frame':
          tableName = 'frames';
          break;
        default:
          throw new Error('Invalid item type');
      }

      // ORIGINAL LOGIC FOR NON-SCENE ITEMS (unchanged)
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ADD: Special function to handle scene deletion with remake count updates
  const deleteSceneWithRemakeHandling = async (sceneId: string): Promise<boolean> => {
    try {
      // 1. Check if this scene is a remake by looking in scene_remakes table
      const { data: remakeRecord, error: remakeError } = await supabase
        .from('scene_remakes')
        .select('original_scene_id')
        .eq('new_scene_id', sceneId)
        .single();

      // If it's a remake scene, handle the remake count
      if (!remakeError && remakeRecord) {
        // 2. Decrement the original scene's remake_count
        const { error: decrementError } = await supabase.rpc(
          'decrement_count',
          {
            table_name: 'scenes',
            id: remakeRecord.original_scene_id,
            column_name: 'remake_count'
          }
        );

        if (decrementError) {
          console.error('Error decrementing remake count:', decrementError);
          // Don't throw here - continue with scene deletion
        }

        // 3. Delete the remake record from scene_remakes table
        const { error: deleteRemakeError } = await supabase
          .from('scene_remakes')
          .delete()
          .eq('new_scene_id', sceneId);

        if (deleteRemakeError) {
          console.error('Error deleting remake record:', deleteRemakeError);
          // Don't throw here - continue with scene deletion
        }
      }

      // 4. Delete the scene itself (this works for both regular scenes and remake scenes)
      const { error: deleteError } = await supabase
        .from('scenes')
        .delete()
        .eq('id', sceneId);

      if (deleteError) throw deleteError;

      return true;
    } catch (error) {
      console.error('Error deleting scene with remake handling:', error);
      return false;
    }
  };

  return { deleteItem, isLoading };
};