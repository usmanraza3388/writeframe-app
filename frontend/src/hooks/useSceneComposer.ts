import { useState } from 'react';
import { supabase } from '../assets/lib/supabaseClient';
import type { CreateSceneData, Soundtrack } from '../../types/database.types';

export const useSceneComposer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new scene
  const createScene = async (sceneData: CreateSceneData) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // 1. Upload image if provided
      let imagePath = null;
      if (sceneData.image_file) {
        const fileExt = sceneData.image_file.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('scene-images')
          .upload(fileName, sceneData.image_file);

        if (uploadError) throw uploadError;
        imagePath = data.path;
      }

      // 2. Create the scene record - UPDATED: Use status field instead of is_draft/published
      const { data: scene, error: sceneError } = await supabase
        .from('scenes')
        .insert({
          user_id: user.id,
          title: sceneData.title,
          content_text: sceneData.content_text,
          image_path: imagePath,
          soundtrack_id: sceneData.soundtrack_id,
          status: sceneData.is_draft ? 'draft' : 'published' // UPDATED: Convert is_draft boolean to status enum
        })
        .select()
        .single();

      if (sceneError) throw sceneError;

      // 3. Add mood associations
      if (sceneData.moods.length > 0) {
        const moodInserts = sceneData.moods.map(mood => ({
          scene_id: scene.id,
          mood: mood
        }));

        const { error: moodError } = await supabase
          .from('scene_moods')
          .insert(moodInserts);

        if (moodError) throw moodError;
      }

      return scene;

    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get available soundtracks
  const getSoundtracks = async (mood?: string) => {
    try {
      let query = supabase
        .from('soundtracks')
        .select('*')
        .eq('is_available', true);

      if (mood) {
        query = query.eq('mood', mood);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data as Soundtrack[];
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  };

  return {
    createScene,
    getSoundtracks,
    loading,
    error
  };
};