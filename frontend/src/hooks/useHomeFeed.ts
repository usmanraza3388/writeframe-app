import { useState, useEffect } from 'react';
import { supabase } from '../assets/lib/supabaseClient';
import type { SceneWithRelations } from '../../types/database.types';

export const useHomeFeed = () => {
  const [scenes, setScenes] = useState<SceneWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch published scenes for home feed
  const fetchHomeFeed = async () => {
    try {
      const { data, error } = await supabase
        .from('scenes')
        .select(`
          *,
          profiles (*),
          soundtracks (*),
          scene_moods (*),
          likes (*),
          comments (*)
        `)
        .eq('published', true)
        .eq('is_draft', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Add user_has_liked field to each scene
      const { data: { user } } = await supabase.auth.getUser();
      const scenesWithLikes = data.map(scene => ({
        ...scene,
        user_has_liked: user ? scene.likes.some((like: any) => like.user_id === user.id) : false
      })) as SceneWithRelations[];

      setScenes(scenesWithLikes);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Like a scene
  const likeScene = async (sceneId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('likes')
        .insert({ user_id: user.id, scene_id: sceneId });

      if (error) throw error;

      // Update local state
      setScenes(prev => prev.map(scene => 
        scene.id === sceneId 
          ? { 
              ...scene, 
              like_count: scene.like_count + 1,
              user_has_liked: true,
              likes: [...scene.likes, { id: '', user_id: user.id, scene_id: sceneId, created_at: new Date().toISOString() }]
            }
          : scene
      ));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Unlike a scene
  const unlikeScene = async (sceneId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('scene_id', sceneId);

      if (error) throw error;

      // Update local state
      setScenes(prev => prev.map(scene => 
        scene.id === sceneId 
          ? { 
              ...scene, 
              like_count: Math.max(0, scene.like_count - 1),
              user_has_liked: false,
              likes: scene.likes.filter(like => like.user_id !== user.id)
            }
          : scene
      ));
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchHomeFeed();
  }, []);

  return {
    scenes,
    loading,
    error,
    likeScene,
    unlikeScene,
    refetch: fetchHomeFeed
  };
};