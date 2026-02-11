// E:\Cineverse\frontend\src\utils\feedActions.ts
import { supabase } from '../assets/lib/supabaseClient';
import type { Scene } from './scenes';

// ADD: Extended interface for remake scenes with original scene data
export interface FeedScene extends Scene {
  original_scene_data?: Scene; // ADD: Store original scene data for remakes
  context_text?: string; // ADD: Store remake context separately
  view_count?: number; // ADDED: View count for scenes
}

export const feedActions = {
  async getPublishedScenes(): Promise<FeedScene[]> {
    try {
      const { data: scenes, error } = await supabase
        .from('scenes')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            genre_persona,
            full_name
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching scenes:', error);
        throw error;
      }

      // ADD: Fetch original scene data for remake scenes
      const scenesWithOriginalData = await Promise.all(
        scenes.map(async (scene) => {
          let originalSceneData = null;
          
          if (scene.original_scene_id) {
            // Fetch original scene data for remake scenes
            const { data: originalScene } = await supabase
              .from('scenes')
              .select(`
                *,
                profiles:user_id (
                  username,
                  avatar_url,
                  genre_persona,
                  full_name
                )
              `)
              .eq('id', scene.original_scene_id)
              .single();

            if (originalScene) {
              originalSceneData = {
                id: originalScene.id,
                user_id: originalScene.user_id,
                user_name: originalScene.profiles?.full_name || originalScene.profiles?.username || 'Unknown User',
                user_avatar: originalScene.profiles?.avatar_url || '/default-avatar.png',
                user_genre_tag: originalScene.profiles?.genre_persona || 'Storyteller',
                title: originalScene.title,
                description: originalScene.description || originalScene.content_text || '',
                image_path: originalScene.image_path || '/default-scene.jpg',
                like_count: originalScene.like_count || 0,
                comment_count: originalScene.comment_count || 0,
                share_count: originalScene.share_count || 0,
                remake_count: originalScene.remake_count || 0,
                repost_count: originalScene.repost_count || 0,
                view_count: originalScene.view_count || 0, // ADDED: View count for original scene
                created_at: originalScene.created_at,
              };
            }
          }

          return {
            id: scene.id,
            user_id: scene.user_id,
            user_name: scene.profiles?.full_name || scene.profiles?.username || 'Unknown User',
            user_avatar: scene.profiles?.avatar_url || '/default-avatar.png',
            user_genre_tag: scene.profiles?.genre_persona || 'Storyteller',
            title: scene.title,
            description: scene.description || scene.content_text || '',
            image_path: scene.image_path || '/default-scene.jpg',
            like_count: scene.like_count || 0,
            comment_count: scene.comment_count || 0,
            share_count: scene.share_count || 0,
            remake_count: scene.remake_count || 0,
            repost_count: scene.repost_count || 0,
            view_count: scene.view_count || 0, // ADDED: View count for this scene
            created_at: scene.created_at,
            is_owner: false,
            original_scene_id: scene.original_scene_id || undefined,
            // ADD: Store original scene data and extract context text
            original_scene_data: originalSceneData || undefined,
            context_text: scene.original_scene_id ? this.extractContextText(scene.description) : undefined
          };
        })
      );

      return scenesWithOriginalData;
    } catch (error) {
      console.error('Error in getPublishedScenes:', error);
      return [];
    }
  },

  // ADD: Helper to extract context text from description
  extractContextText(description: string): string {
    if (!description) return '';
    
    // Split by the separator used in createRemakeScene
    const parts = description.split('\n\n---\n\n');
    return parts[0] || description; // Return context text or fallback to full description
  },

  // UPDATE: Create remake scene with proper context storage AND scene_remakes record
  async createRemakeScene(originalSceneId: string, contextText: string, currentUserId: string): Promise<FeedScene> {
    try {
      // 1. Fetch the original scene data
      const { data: originalScene, error: fetchError } = await supabase
        .from('scenes')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            genre_persona,
            full_name
          )
        `)
        .eq('id', originalSceneId)
        .single();

      if (fetchError || !originalScene) {
        throw new Error('Original scene not found');
      }

      // 2. Get current user's profile
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('username, avatar_url, genre_persona, full_name')
        .eq('id', currentUserId)
        .single();

      if (profileError) {
        // Silently handle profile error - use defaults
      }

      // 3. Create the remake scene with context in description (for now)
      const remakeData = {
        user_id: currentUserId,
        title: originalScene.title, // Keep same title
        description: `${contextText}\n\n---\n\nBased on "${originalScene.title}" by ${originalScene.profiles?.full_name || originalScene.profiles?.username || 'Unknown User'}`,
        image_path: originalScene.image_path, // Use same image
        original_scene_id: originalSceneId, // Reference to original (for backward compatibility)
        status: 'published',
        like_count: 0,
        comment_count: 0,
        share_count: 0,
        remake_count: 0,
        repost_count: 0,
        view_count: 0 // ADDED: Initialize view count to 0
      };

      const { data: newScene, error: createError } = await supabase
        .from('scenes')
        .insert(remakeData)
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // 4. ADD: Create record in scene_remakes table
      const { error: remakeRecordError } = await supabase
        .from('scene_remakes')
        .insert({
          user_id: currentUserId,
          original_scene_id: originalSceneId,
          new_scene_id: newScene.id
        });

      if (remakeRecordError) {
        console.error('Error creating remake record:', remakeRecordError);
        // Don't throw - continue with the process
      }

      // 5. Increment the original scene's remake_count
      await supabase
        .from('scenes')
        .update({ remake_count: (originalScene.remake_count || 0) + 1 })
        .eq('id', originalSceneId);

      // 6. Return the new remake scene with original scene data
      const originalSceneFormatted = {
        id: originalScene.id,
        user_id: originalScene.user_id,
        user_name: originalScene.profiles?.full_name || originalScene.profiles?.username || 'Unknown User',
        user_avatar: originalScene.profiles?.avatar_url || '/default-avatar.png',
        user_genre_tag: originalScene.profiles?.genre_persona || 'Storyteller',
        title: originalScene.title,
        description: originalScene.description || originalScene.content_text || '',
        image_path: originalScene.image_path || '/default-scene.jpg',
        like_count: originalScene.like_count || 0,
        comment_count: originalScene.comment_count || 0,
        share_count: originalScene.share_count || 0,
        remake_count: originalScene.remake_count || 0,
        repost_count: originalScene.repost_count || 0,
        view_count: originalScene.view_count || 0, // ADDED: View count for original scene
        created_at: originalScene.created_at,
      };

      return {
        id: newScene.id,
        user_id: newScene.user_id,
        user_name: userProfile?.full_name || userProfile?.username || 'Unknown User',
        user_avatar: userProfile?.avatar_url || '/default-avatar.png',
        user_genre_tag: userProfile?.genre_persona || 'Storyteller',
        title: newScene.title,
        description: newScene.description,
        image_path: newScene.image_path,
        like_count: newScene.like_count,
        comment_count: newScene.comment_count,
        share_count: newScene.share_count,
        remake_count: newScene.remake_count,
        repost_count: newScene.repost_count || 0,
        view_count: newScene.view_count || 0, // ADDED: View count for new scene
        created_at: newScene.created_at,
        is_owner: true,
        original_scene_id: newScene.original_scene_id,
        // ADD: Include original scene data and context
        original_scene_data: originalSceneFormatted,
        context_text: contextText
      };

    } catch (error) {
      throw error;
    }
  },

  subscribeToScenes(callback: (scene: FeedScene) => void) {
    return supabase
      .channel('scenes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scenes',
          filter: 'status=eq.published'
        },
        async (payload) => {
          const newScene = payload.new as any;
          
          // ADD: Fetch original scene data for remake scenes
          let originalSceneData = null;
          if (newScene.original_scene_id) {
            const { data: originalScene } = await supabase
              .from('scenes')
              .select(`
                *,
                profiles:user_id (
                  username,
                  avatar_url,
                  genre_persona,
                  full_name
                )
              `)
              .eq('id', newScene.original_scene_id)
              .single();

            if (originalScene) {
              originalSceneData = {
                id: originalScene.id,
                user_id: originalScene.user_id,
                user_name: originalScene.profiles?.full_name || originalScene.profiles?.username || 'Unknown User',
                user_avatar: originalScene.profiles?.avatar_url || '/default-avatar.png',
                user_genre_tag: originalScene.profiles?.genre_persona || 'Storyteller',
                title: originalScene.title,
                description: originalScene.description || originalScene.content_text || '',
                image_path: originalScene.image_path || '/default-scene.jpg',
                like_count: originalScene.like_count || 0,
                comment_count: originalScene.comment_count || 0,
                share_count: originalScene.share_count || 0,
                remake_count: originalScene.remake_count || 0,
                repost_count: originalScene.repost_count || 0,
                view_count: originalScene.view_count || 0, // ADDED: View count for original scene
                created_at: originalScene.created_at,
              };
            }
          }

          callback({
            id: newScene.id,
            user_id: newScene.user_id,
            user_name: 'New User',
            user_avatar: '/default-avatar.png',
            user_genre_tag: 'Storyteller',
            title: newScene.title,
            description: newScene.description || newScene.content_text || '',
            image_path: newScene.image_path || '/default-scene.jpg',
            like_count: newScene.like_count || 0,
            comment_count: newScene.comment_count || 0,
            share_count: newScene.share_count || 0,
            remake_count: newScene.remake_count || 0,
            repost_count: newScene.repost_count || 0,
            view_count: newScene.view_count || 0, // ADDED: View count for new scene
            created_at: newScene.created_at,
            is_owner: false,
            original_scene_id: newScene.original_scene_id || undefined,
            // ADD: Include original scene data and context
            original_scene_data: originalSceneData || undefined,
            context_text: newScene.original_scene_id ? this.extractContextText(newScene.description) : undefined
          });
        }
      )
      .subscribe();
  }
};