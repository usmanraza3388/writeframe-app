import { supabase } from '../assets/lib/supabaseClient';
import type { CreateMonologueData, MonologueWithRelations } from '../../types/database.types';

// Define interfaces for the new functions - ADDED EXPORT
export interface MonologueFeedItem {
  id: string;
  user_id: string;
  user_name: string;
  user_genre_tag: string;
  title: string;
  content_text: string;
  soundtrack_id?: string | null;
  like_count: number;
  comment_count: number;
  share_count: number;
  repost_count: number; // ADDED: Repost count
  view_count?: number; // ADDED: Optional view count for backward compatibility
  created_at: string;
  user_has_liked: boolean;
  user_has_reposted: boolean; // ADDED: User repost state
  emotional_tags: string[];
  soundtrack?: {
    title: string;
    artist: string;
  };
}

// ADDED EXPORT
export interface MonologueComment {
  id: string;
  user_id: string;
  monologue_id: string;
  content: string;
  created_at: string;
  user_name: string;
  user_genre_tag: string;
}

// ADDED: Repost interface with view_count
export interface MonologueRepost {
  id: string;
  user_id: string;
  monologue_id: string;
  created_at: string;
  view_count?: number; // ADDED: Optional view count for reposts
}

export const monologueActions = {
  // Your existing functions...
  async createMonologue(monologueData: CreateMonologueData, emotionalTone?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');

    await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    const { data: monologue, error } = await supabase
      .from('monologues')
      .insert({
        user_id: user.id,
        title: monologueData.title,
        content_text: monologueData.content_text,
        soundtrack_id: monologueData.soundtrack_id || null,
        status: monologueData.is_draft ? 'draft' : 'published', // UPDATED: Use status field instead of is_draft/published
        view_count: 0 // ADDED: Initialize view count
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (emotionalTone && monologue) {
      await supabase
        .from('monologue_emotional_tags')
        .insert({
          monologue_id: monologue.id,
          emotional_tone: emotionalTone
        });
    }

    return monologue;
  },

  async getMonologueById(id: string): Promise<MonologueWithRelations | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data: monologue, error } = await supabase
      .from('monologues')
      .select(`
        *,
        profiles (*),
        soundtracks (*),
        monologue_emotional_tags (*),
        monologue_likes (*),
        monologue_comments (*)
      `)
      .eq('id', id)
      .single();

    if (error) return null;

    const userHasLiked = user ? await monologueActions.checkUserLike(monologue.id, user.id) : false;
    const userHasReposted = user ? await monologueActions.checkUserRepost(monologue.id, user.id) : false;

    // FIX: Add repost properties to the returned object
    return {
      ...monologue,
      user_has_liked: userHasLiked,
      user_has_reposted: userHasReposted,
      repost_count: monologue.repost_count || 0, // Add repost_count with fallback
      view_count: monologue.view_count || 0 // ADDED: View count with fallback
    };
  },

  async checkUserLike(monologueId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('monologue_likes')
      .select('id')
      .eq('monologue_id', monologueId)
      .eq('user_id', userId)
      .single();

    return !!data && !error;
  },

  // ADDED: Check if user has reposted a monologue
  async checkUserRepost(monologueId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('monologue_reposts')
      .select('id')
      .eq('monologue_id', monologueId)
      .eq('user_id', userId)
      .single();

    return !!data && !error;
  },

  async toggleLike(monologueId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const hasLiked = await monologueActions.checkUserLike(monologueId, user.id);

    if (hasLiked) {
      const { error } = await supabase
        .from('monologue_likes')
        .delete()
        .eq('monologue_id', monologueId)
        .eq('user_id', user.id);

      if (error) throw error;

      // FIXED: Use direct SQL update instead of RPC
      const { data: currentMonologue } = await supabase
        .from('monologues')
        .select('like_count')
        .eq('id', monologueId)
        .single();

      await supabase
        .from('monologues')
        .update({ like_count: Math.max(0, (currentMonologue?.like_count || 0) - 1) })
        .eq('id', monologueId);
    } else {
      const { error } = await supabase
        .from('monologue_likes')
        .insert({
          monologue_id: monologueId,
          user_id: user.id
        });

      if (error) throw error;

      // FIXED: Use direct SQL update instead of RPC
      const { data: currentMonologue } = await supabase
        .from('monologues')
        .select('like_count')
        .eq('id', monologueId)
        .single();

      await supabase
        .from('monologues')
        .update({ like_count: (currentMonologue?.like_count || 0) + 1 })
        .eq('id', monologueId);
    }

    return !hasLiked;
  },

  // ADDED: Repost monologue function
  async repostMonologue(monologueId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check for existing repost
      const { data: existingRepost } = await supabase
        .from('monologue_reposts')
        .select('id')
        .eq('user_id', user.id)
        .eq('monologue_id', monologueId)
        .single();

      if (existingRepost) {
        return { success: true, alreadyReposted: true };
      }

      // Insert new repost
      const { error } = await supabase
        .from('monologue_reposts')
        .insert({
          user_id: user.id,
          monologue_id: monologueId,
          view_count: 0 // ADDED: Initialize view count
        });

      if (error) throw error;

      // FIXED: Use direct SQL update instead of RPC
      const { data: currentMonologue } = await supabase
        .from('monologues')
        .select('repost_count')
        .eq('id', monologueId)
        .single();

      await supabase
        .from('monologues')
        .update({ repost_count: (currentMonologue?.repost_count || 0) + 1 })
        .eq('id', monologueId);

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  // ADDED: Delete monologue repost by repost ID
  async deleteRepost(repostId: string): Promise<{ success: boolean; monologue_id?: string }> {
    try {
      const { data, error } = await supabase
        .from('monologue_reposts')
        .delete()
        .eq('id', repostId)
        .select('monologue_id')
        .single();

      if (error) throw error;

      // Update repost count on original monologue
      if (data.monologue_id) {
        const { data: currentMonologue } = await supabase
          .from('monologues')
          .select('repost_count')
          .eq('id', data.monologue_id)
          .single();

        await supabase
          .from('monologues')
          .update({ repost_count: Math.max(0, (currentMonologue?.repost_count || 0) - 1) })
          .eq('id', data.monologue_id);
      }

      return { 
        success: true, 
        monologue_id: data.monologue_id 
      };
    } catch (error) {
      console.error('Error deleting monologue repost:', error);
      return { success: false };
    }
  },

  // ADDED: Fetch reposted monologues for feed - FIXED: Proper avatar structure for embedded MonologueCard
  async fetchRepostedMonologues(limit = 20): Promise<any[]> {
    try {
      const { data: reposts, error } = await supabase
        .from('monologue_reposts')
        .select(`
          *,
          profiles!inner (username, genre_persona, avatar_url, full_name),
          monologues (
            *,
            profiles!inner (username, genre_persona, avatar_url, full_name),
            soundtracks (title, artist),
            monologue_emotional_tags (emotional_tone)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching reposts:', error);
        return [];
      }

      return reposts.map(repost => {
        const originalMonologue = repost.monologues;
        
        // Transform the original monologue data to match MonologueCard expectations
        const transformedOriginalMonologue = originalMonologue ? {
          id: originalMonologue.id,
          user_id: originalMonologue.user_id,
          user_name: originalMonologue.profiles?.full_name || originalMonologue.profiles?.username || 'Unknown User',
          user_genre_tag: originalMonologue.profiles?.genre_persona || 'Writer',
          // FIX: Maintain the profiles structure that MonologueCard expects
          profiles: {
            avatar_url: originalMonologue.profiles?.avatar_url
          },
          title: originalMonologue.title,
          content_text: originalMonologue.content_text,
          soundtrack_id: originalMonologue.soundtrack_id,
          like_count: originalMonologue.like_count || 0,
          comment_count: originalMonologue.comment_count || 0,
          share_count: originalMonologue.share_count || 0,
          repost_count: originalMonologue.repost_count || 0,
          view_count: originalMonologue.view_count || 0, // ADDED: View count
          created_at: originalMonologue.created_at,
          user_has_reposted: false,
          emotional_tags: originalMonologue.monologue_emotional_tags?.map((tag: any) => tag.emotional_tone) || [],
          soundtrack: originalMonologue.soundtracks ? {
            title: originalMonologue.soundtracks.title,
            artist: originalMonologue.soundtracks.artist
          } : undefined
        } : null;

        return {
          id: repost.id,
          user_id: repost.user_id,
          user_name: repost.profiles?.full_name || repost.profiles?.username || 'Unknown User',
          user_genre_tag: repost.profiles?.genre_persona || 'Storyteller',
          avatar_url: repost.profiles?.avatar_url,
          created_at: repost.created_at,
          like_count: repost.like_count || 0,
          comment_count: repost.comment_count || 0,
          share_count: repost.share_count || 0,
          view_count: repost.view_count || 0, // ADDED: View count for repost
          original_monologue: transformedOriginalMonologue
        };
      });
    } catch (error) {
      console.error('Error in fetchRepostedMonologues:', error);
      return [];
    }
  },

  // NEW FUNCTIONS WITH FIXED TYPES:

  // Fetch published monologues for home feed - UPDATED: Use status field
  async fetchMonologues(limit = 20): Promise<MonologueFeedItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: monologues, error } = await supabase
        .from('monologues')
        .select(`
          *,
          profiles (
            username,
            genre_persona,
            avatar_url,
            full_name
          ),
          soundtracks (
            title,
            artist
          ),
          monologue_emotional_tags (
            emotional_tone
          )
        `)
        .eq('status', 'published') // UPDATED: Use status field instead of published/is_draft
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Check likes and reposts for current user and transform data
      const monologuesWithLikes = await Promise.all(
        monologues.map(async (monologue: any) => {
          const userHasLiked = user ? await monologueActions.checkUserLike(monologue.id, user.id) : false;
          const userHasReposted = user ? await monologueActions.checkUserRepost(monologue.id, user.id) : false;
          
          return {
            ...monologue,
            user_has_liked: userHasLiked,
            user_has_reposted: userHasReposted, // ADDED: User repost state
            emotional_tags: monologue.monologue_emotional_tags?.map((tag: any) => tag.emotional_tone) || [],
            // FIXED: Use full_name instead of username
            user_name: monologue.profiles?.full_name || monologue.profiles?.username || 'Unknown User',
            user_genre_tag: monologue.profiles?.genre_persona || 'Writer',
            content_text: monologue.content_text,
            repost_count: monologue.repost_count || 0, // ADDED: Repost count
            view_count: monologue.view_count || 0, // ADDED: View count
            soundtrack: monologue.soundtracks ? {
              title: monologue.soundtracks.title,
              artist: monologue.soundtracks.artist
            } : undefined
          };
        })
      );

      return monologuesWithLikes;
    } catch (error) {
      return [];
    }
  },

  // Fetch emotional tags for multiple monologues
  async fetchEmotionalTags(monologueIds: string[]): Promise<Record<string, string[]>> {
    try {
      const { data, error } = await supabase
        .from('monologue_emotional_tags')
        .select('monologue_id, emotional_tone')
        .in('monologue_id', monologueIds);

      if (error) throw error;

      // Group tags by monologue ID
      const tagsByMonologue: Record<string, string[]> = {};
      data?.forEach((tag: any) => {
        if (!tagsByMonologue[tag.monologue_id]) {
          tagsByMonologue[tag.monologue_id] = [];
        }
        tagsByMonologue[tag.monologue_id].push(tag.emotional_tone);
      });

      return tagsByMonologue;
    } catch (error) {
      return {};
    }
  },

  // Add comment to monologue
  async addComment(monologueId: string, content: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('monologue_comments')
        .insert({
          monologue_id: monologueId,
          user_id: user.id,
          content: content
        });

      if (error) throw error;

      // FIXED: Use direct SQL update instead of RPC
      const { data: currentMonologue } = await supabase
        .from('monologues')
        .select('comment_count')
        .eq('id', monologueId)
        .single();

      await supabase
        .from('monologues')
        .update({ comment_count: (currentMonologue?.comment_count || 0) + 1 })
        .eq('id', monologueId);

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Share monologue (increment share count)
  async shareMonologue(monologueId: string) {
    try {
      // FIXED: Use direct SQL update instead of RPC
      const { data: currentMonologue } = await supabase
        .from('monologues')
        .select('share_count')
        .eq('id', monologueId)
        .single();

      const { error } = await supabase
        .from('monologues')
        .update({ share_count: (currentMonologue?.share_count || 0) + 1 })
        .eq('id', monologueId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Subscribe to real-time monologue updates - UPDATED: Use status field
  subscribeToMonologues(callback: (monologue: MonologueFeedItem) => void) {
    return supabase
      .channel('monologues-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'monologues',
          filter: 'status=eq.published' // UPDATED: Use status field instead of published
        },
        async (payload: any) => {
          // Fetch complete monologue data with relations
          const newMonologue = await monologueActions.getMonologueById(payload.new.id);
          if (newMonologue) {
            // Transform to MonologueFeedItem format with proper fallbacks
            const feedItem: MonologueFeedItem = {
              id: newMonologue.id,
              user_id: newMonologue.user_id,
              // FIXED: Use full_name instead of username
              user_name: newMonologue.profiles?.full_name || newMonologue.profiles?.username || 'Unknown User',
              user_genre_tag: newMonologue.profiles?.genre_persona || 'Writer',
              title: newMonologue.title,
              content_text: newMonologue.content_text,
              soundtrack_id: newMonologue.soundtrack_id,
              like_count: newMonologue.like_count || 0,
              comment_count: newMonologue.comment_count || 0,
              share_count: newMonologue.share_count || 0,
              repost_count: (newMonologue as any).repost_count || 0,
              view_count: (newMonologue as any).view_count || 0, // ADDED: View count with fallback
              created_at: newMonologue.created_at,
              user_has_liked: newMonologue.user_has_liked || false,
              user_has_reposted: (newMonologue as any).user_has_reposted || false,
              emotional_tags: newMonologue.monologue_emotional_tags?.map((tag: any) => tag.emotional_tone) || [],
              soundtrack: newMonologue.soundtracks ? {
                title: newMonologue.soundtracks.title,
                artist: newMonologue.soundtracks.artist
              } : undefined
            };
            callback(feedItem);
          }
        }
      )
      .subscribe();
  },

  // Fetch comments for a monologue
  async fetchComments(monologueId: string): Promise<MonologueComment[]> {
    try {
      const { data: comments, error } = await supabase
        .from('monologue_comments')
        .select(`
          *,
          profiles (
            username,
            genre_persona,
            avatar_url,
            full_name
          )
        `)
        .eq('monologue_id', monologueId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (comments || []).map((comment: any) => ({
        id: comment.id,
        user_id: comment.user_id,
        monologue_id: comment.monologue_id,
        content: comment.content,
        created_at: comment.created_at,
        // FIXED: Use full_name instead of username
        user_name: comment.profiles?.full_name || comment.profiles?.username || 'Unknown User',
        user_genre_tag: comment.profiles?.genre_persona || 'Writer'
      }));
    } catch (error) {
      return [];
    }
  }
};