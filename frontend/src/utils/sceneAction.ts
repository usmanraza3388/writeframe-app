import { supabase } from '../assets/lib/supabaseClient';
// Comment type import removed as it's not used

// Add a comment to a scene
export const addComment = async (sceneId: string, content: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        scene_id: sceneId,
        content: content
      })
      .select(`
        *,
        profiles (username, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    return null;
  }
};

// Share a scene (increment share count)
export const shareScene = async (sceneId: string) => {
  try {
    const { error } = await supabase.rpc('increment_share_count', {
      scene_id: sceneId
    });

    if (error) throw error;
    return true;
  } catch (error: any) {
    return false;
  }
};

// Create a scene remake - UPDATED: Uses status field
export const createSceneRemake = async (originalSceneId: string, newSceneData: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First create the new scene - UPDATED: Uses status field
    const { data: newScene, error: sceneError } = await supabase
      .from('scenes')
      .insert({
        user_id: user.id,
        title: newSceneData.title,
        content_text: newSceneData.content_text,
        image_path: newSceneData.image_path,
        soundtrack_id: newSceneData.soundtrack_id,
        status: 'published', // UPDATED: Use status instead of is_draft/published
        view_count: 0 // ADDED: Initialize view count
      })
      .select()
      .single();

    if (sceneError) throw sceneError;

    // Then create the remake relationship
    const { error: remakeError } = await supabase
      .from('scene_remakes')
      .insert({
        user_id: user.id,
        original_scene_id: originalSceneId,
        new_scene_id: newScene.id
      });

    if (remakeError) throw remakeError;

    return newScene;
  } catch (error: any) {
    return null;
  }
};

// NEW: Create or update a scene with status field
export const createOrUpdateScene = async (sceneData: any, isUpdate: boolean = false) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const scenePayload = {
      user_id: user.id,
      title: sceneData.title,
      description: sceneData.description,
      content_text: sceneData.content_text,
      image_path: sceneData.image_path,
      soundtrack_id: sceneData.soundtrack_id,
      status: sceneData.status || 'draft', // UPDATED: Use status field
      updated_at: new Date().toISOString(),
      view_count: 0 // ADDED: Initialize view count
    };

    let query;
    if (isUpdate && sceneData.id) {
      // Update existing scene - don't reset view_count on update
      const { view_count, ...updatePayload } = scenePayload;
      query = supabase
        .from('scenes')
        .update(updatePayload)
        .eq('id', sceneData.id);
    } else {
      // Create new scene
      query = supabase
        .from('scenes')
        .insert(scenePayload);
    }

    const { data, error } = await query.select().single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    return null;
  }
};

// NEW: Update scene status (draft/published)
export const updateSceneStatus = async (sceneId: string, status: 'draft' | 'published') => {
  try {
    const { data, error } = await supabase
      .from('scenes')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', sceneId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    return null;
  }
};

// Get image URL from Supabase Storage
export const getImageUrl = (path: string) => {
  if (!path) return null;
  const { data } = supabase.storage.from('scene-images').getPublicUrl(path);
  return data.publicUrl;
};

// Social sharing function
export const shareToSocialMedia = async (scene: any) => {
  const shareData = {
    title: scene.title,
    text: `"${scene.content_text?.substring(0, 100)}..." by @${scene.profiles.username}`,
    url: `${window.location.origin}/scenes/${scene.id}`,
  };

  if (navigator.share) {
    // Native share on mobile devices
    try {
      await navigator.share(shareData);
      await shareScene(scene.id); // Increment share count
      return true;
    } catch (error) {
      // Silently handle native share errors
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(shareData.url);
    await shareScene(scene.id); // Increment share count
    return true;
  } catch (error) {
    return false;
  }
};