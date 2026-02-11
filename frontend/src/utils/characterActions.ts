import { supabase } from '../assets/lib/supabaseClient';
import type { 
  Character, 
  CharacterInsert, 
  CharacterVisualReference, 
  CharacterVisualReferenceInsert,
  CharacterWithDetails,
  RepostedCharacterData
} from './character-types';

// UPDATED: Fixed CharacterWithJoins interface with all properties from database
interface CharacterWithJoins extends Character {
  profiles: {
    username: string;
    avatar_url?: string;
    genre_persona?: string;
    full_name?: string;
  } | null;
  character_visual_references: CharacterVisualReference[];
  // ADDED: Engagement counts that exist in database
  like_count: number;
  comment_count: number;
  share_count: number;
  repost_count: number;
  view_count?: number; // ADDED: View count
}

export const characterActions = {
  // Create a new character
  async createCharacter(characterData: CharacterInsert): Promise<Character> {
    const { data, error } = await supabase
      .from('characters')
      .insert({
        ...characterData,
        view_count: 0 // ADDED: Initialize view count
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ADDED: Check if user has reposted a character
  async checkUserRepost(characterId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('character_reposts')
      .select('id')
      .eq('character_id', characterId)
      .eq('user_id', userId)
      .single();

    return !!data && !error;
  },

  // ADDED: Repost character function
  async repostCharacter(characterId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check for existing repost
      const { data: existingRepost } = await supabase
        .from('character_reposts')
        .select('id')
        .eq('user_id', user.id)
        .eq('character_id', characterId)
        .single();

      if (existingRepost) {
        return { success: true, alreadyReposted: true };
      }

      // Insert new repost
      const { error } = await supabase
        .from('character_reposts')
        .insert({
          user_id: user.id,
          character_id: characterId,
          view_count: 0 // ADDED: Initialize view count
        });

      if (error) throw error;

      // Update repost count
      const { data: currentCharacter } = await supabase
        .from('characters')
        .select('repost_count')
        .eq('id', characterId)
        .single();

      await supabase
        .from('characters')
        .update({ repost_count: (currentCharacter?.repost_count || 0) + 1 })
        .eq('id', characterId);

      return { success: true };
    } catch (error) {
      console.error('Error reposting character:', error);
      return { success: false, error };
    }
  },

  // ADDED: Delete character repost by repost ID
  async deleteRepost(repostId: string): Promise<{ success: boolean; character_id?: string }> {
    try {
      const { data, error } = await supabase
        .from('character_reposts')
        .delete()
        .eq('id', repostId)
        .select('character_id')
        .single();

      if (error) throw error;

      // Update repost count on original character
      if (data.character_id) {
        const { data: currentCharacter } = await supabase
          .from('characters')
          .select('repost_count')
          .eq('id', data.character_id)
          .single();

        await supabase
          .from('characters')
          .update({ repost_count: Math.max(0, (currentCharacter?.repost_count || 0) - 1) })
          .eq('id', data.character_id);
      }

      return { 
        success: true, 
        character_id: data.character_id 
      };
    } catch (error) {
      console.error('Error deleting character repost:', error);
      return { success: false };
    }
  },

  // ADDED: Fetch reposted characters for feed - FIXED: Proper data transformation with display names and avatars
  async fetchRepostedCharacters(limit = 20): Promise<RepostedCharacterData[]> {
    try {
      const { data: reposts, error } = await supabase
        .from('character_reposts')
        .select(`
          *,
          reposter:profiles!character_reposts_user_id_fkey (full_name, genre_persona, avatar_url),
          characters (*, 
            creator:profiles!characters_user_id_fkey (full_name, genre_persona, avatar_url),
            character_visual_references (*)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Supabase error:', error);
        return [];
      }

      return reposts.map(repost => {
        const originalCharacter = repost.characters;
        
        // FIXED: Use full_name instead of username for both reposter and original creator
        const transformedOriginalCharacter = originalCharacter ? {
          id: originalCharacter.id,
          user_id: originalCharacter.user_id,
          user_name: originalCharacter.creator?.full_name || 'Unknown User',
          user_genre_tag: originalCharacter.creator?.genre_persona || 'Creator',
          name: originalCharacter.name,
          bio: originalCharacter.bio,
          tagline: originalCharacter.tagline,
          traits: originalCharacter.traits,
          like_count: originalCharacter.like_count || 0,
          comment_count: originalCharacter.comment_count || 0,
          share_count: originalCharacter.share_count || 0,
          repost_count: originalCharacter.repost_count || 0,
          view_count: originalCharacter.view_count || 0, // ADDED: View count
          created_at: originalCharacter.created_at,
          user_has_liked: false,
          user_has_reposted: false,
          visual_references: originalCharacter.character_visual_references || [],
          avatar_url: originalCharacter.creator?.avatar_url
        } : null;

        return {
          id: repost.id,
          user_id: repost.user_id,
          user_name: repost.reposter?.full_name || 'Unknown User',
          user_genre_tag: repost.reposter?.genre_persona || 'Storyteller',
          avatar_url: repost.reposter?.avatar_url,
          created_at: repost.created_at,
          like_count: 0,
          comment_count: 0, 
          share_count: 0,
          view_count: repost.view_count || 0, // ADDED: View count for repost
          original_character: transformedOriginalCharacter
        };
      });
    } catch (error) {
      console.error('Error fetching reposted characters:', error);
      return [];
    }
  },

  // Get a character by ID with full details for CharacterCard - UPDATED: Include repost state and view count
  async getCharacterById(id: string): Promise<CharacterWithDetails | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('characters')
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url,
          genre_persona,
          full_name
        ),
        character_visual_references (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    const characterData = data as CharacterWithJoins;
    const userHasReposted = user ? await characterActions.checkUserRepost(id, user.id) : false;

    return {
      ...characterData,
      user_name: characterData.profiles?.full_name || characterData.profiles?.username || 'Unknown User',
      user_genre_tag: characterData.profiles?.genre_persona || '',
      avatar_url: characterData.profiles?.avatar_url,
      visual_references: characterData.character_visual_references || [],
      like_count: characterData.like_count || 0,
      comment_count: characterData.comment_count || 0,
      share_count: characterData.share_count || 0,
      view_count: characterData.view_count || 0, // ADDED: View count
      user_has_reposted: userHasReposted
    };
  },

  // Get characters for home feed with full details - UPDATED: Include repost state and view count
  async getCharactersForHomeFeed(limit = 20): Promise<CharacterWithDetails[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('characters')
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url,
          genre_persona,
          full_name
        ),
        character_visual_references (*)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Check reposts for current user and transform data
    const charactersWithReposts = await Promise.all(
      (data || []).map(async (character: CharacterWithJoins) => {
        const userHasReposted = user ? await characterActions.checkUserRepost(character.id, user.id) : false;
        
        return {
          ...character,
          user_name: character.profiles?.full_name || character.profiles?.username || 'Unknown User',
          user_genre_tag: character.profiles?.genre_persona || '',
          avatar_url: character.profiles?.avatar_url,
          visual_references: character.character_visual_references || [],
          like_count: character.like_count || 0,
          comment_count: character.comment_count || 0,
          share_count: character.share_count || 0,
          view_count: character.view_count || 0, // ADDED: View count
          user_has_reposted: userHasReposted
        };
      })
    );

    return charactersWithReposts;
  },

  // Get characters by user ID with details - UPDATED: Include repost state and view count
  async getCharactersByUser(userId: string): Promise<CharacterWithDetails[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('characters')
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url,
          genre_persona,
          full_name
        ),
        character_visual_references (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const charactersWithReposts = await Promise.all(
      (data || []).map(async (character: CharacterWithJoins) => {
        const userHasReposted = user ? await characterActions.checkUserRepost(character.id, user.id) : false;
        
        return {
          ...character,
          user_name: character.profiles?.full_name || character.profiles?.username || 'Unknown User',
          user_genre_tag: character.profiles?.genre_persona || '',
          avatar_url: character.profiles?.avatar_url,
          visual_references: character.character_visual_references || [],
          like_count: character.like_count || 0,
          comment_count: character.comment_count || 0,
          share_count: character.share_count || 0,
          view_count: character.view_count || 0, // ADDED: View count
          user_has_reposted: userHasReposted
        };
      })
    );

    return charactersWithReposts;
  },

  // Update a character
  async updateCharacter(id: string, updates: Partial<Character>): Promise<Character> {
    const { data, error } = await supabase
      .from('characters')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a character
  async deleteCharacter(id: string): Promise<void> {
    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // UPDATED: Add visual reference to character - NOW RECEIVES STORAGE URLS
  async addVisualReference(refData: CharacterVisualReferenceInsert): Promise<CharacterVisualReference> {
    const { data, error } = await supabase
      .from('character_visual_references')
      .insert(refData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get visual references for a character
  async getVisualReferences(characterId: string): Promise<CharacterVisualReference[]> {
    const { data, error } = await supabase
      .from('character_visual_references')
      .select('*')
      .eq('character_id', characterId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Remove visual reference
  async removeVisualReference(id: string): Promise<void> {
    const { error } = await supabase
      .from('character_visual_references')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // CHARACTER ENGAGEMENT ACTIONS (Need character_likes, character_comments, character_echoes tables)

  // Like/Unlike character (placeholder - needs character_likes table)
  async toggleLike(characterId: string, _userId: string): Promise<{ liked: boolean; like_count: number }> {
    // TODO: Implement when character_likes table exists
    console.log('Toggle like for character:', characterId);
    return { liked: true, like_count: 1 };
  },

  // Add comment to character (placeholder - needs character_comments table)
  async addComment(characterId: string, _userId: string, content: string): Promise<any> {
    // TODO: Implement when character_comments table exists
    console.log('Add comment to character:', characterId, 'content:', content);
    return { id: 'temp', content, created_at: new Date().toISOString() };
  },

  // Share character (placeholder - needs character_echoes table)
  async shareCharacter(characterId: string, _userId: string): Promise<{ shared: boolean }> {
    // TODO: Implement when character_echoes table exists
    console.log('Share character:', characterId);
    return { shared: true };
  },

  // Get character engagement counts (placeholder)
  async getEngagementCounts(_characterId: string): Promise<{ like_count: number; comment_count: number; share_count: number }> {
    // TODO: Implement when engagement tables exist
    return { like_count: 0, comment_count: 0, share_count: 0 };
  },

  // Subscribe to character changes for real-time updates
  subscribeToCharacterChanges(characterId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`character:${characterId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'characters',
          filter: `id=eq.${characterId}`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to character feed for real-time home feed updates
  subscribeToCharacterFeed(callback: (payload: any) => void) {
    return supabase
      .channel('character_feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'characters',
          filter: 'status=eq.published'
        },
        callback
      )
      .subscribe();
  },

  // ADDED: Subscribe to character reposts for real-time updates
  subscribeToCharacterReposts(callback: (payload: any) => void) {
    return supabase
      .channel('character_reposts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'character_reposts'
        },
        callback
      )
      .subscribe();
  }
};