// frameActions.ts
import { supabase } from '../assets/lib/supabaseClient';
import type { Frame, FrameWithDetails, FrameComposerData, FrameComment } from './frames';

export const frameActions = {
  // Create a new frame - CLEANED: No debug logs
  async createFrame(frameData: FrameComposerData): Promise<Frame | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('frames')
        .insert({
          user_id: user.id,
          image_url: frameData.image_urls[0] || '', // Use first image as main
          image_urls: frameData.image_urls,
          mood_description: frameData.mood_description,
          title: frameData.title,
          notes: frameData.notes,
          status: frameData.status,
          view_count: 0 // ADDED: Initialize view count
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating frame:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating frame:', error);
      return null;
    }
  },

  // Get frames for home feed - UPDATED: Added flat properties for consistency
  async getFrames(limit = 20): Promise<FrameWithDetails[]> {
    try {
      // First, get the frames without the join
      const { data: frames, error } = await supabase
        .from('frames')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching frames:', error);
        throw error;
      }

      if (!frames || frames.length === 0) {
        return [];
      }

      // Then, get the user profiles separately
      const userIds = [...new Set(frames.map(frame => frame.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, genre_persona, full_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Return frames without user data rather than failing completely
        return frames.map(frame => ({
          ...frame,
          // FLAT PROPERTIES (new)
          user_name: 'Unknown User',
          user_genre_tag: 'Creator',
          avatar_url: undefined,
          view_count: frame.view_count || 0, // ADDED: View count with fallback
          // NESTED (existing - for backward compatibility)
          user: {
            id: frame.user_id,
            username: 'Unknown User',
            avatar_url: undefined,
            genre_persona: 'Creator',
            full_name: undefined
          },
          likes: [],
          comments: [],
          reposts: []
        }));
      }

      // Create a map for quick profile lookup
      const profileMap = new Map(profiles.map(profile => [profile.id, profile]));

      // Combine frames with their user data
      const transformedData: FrameWithDetails[] = frames.map(frame => {
        const userProfile = profileMap.get(frame.user_id);
        
        return {
          ...frame,
          // FLAT PROPERTIES (new - consistent with other content types)
          user_name: userProfile?.username || 'Unknown User',
          user_genre_tag: userProfile?.genre_persona || 'Creator',
          avatar_url: userProfile?.avatar_url,
          view_count: frame.view_count || 0, // ADDED: View count with fallback
          // NESTED (existing - for backward compatibility)
          user: {
            id: frame.user_id,
            username: userProfile?.username || 'Unknown User',
            avatar_url: userProfile?.avatar_url,
            genre_persona: userProfile?.genre_persona || 'Creator',
            full_name: userProfile?.full_name
          },
          likes: [],
          comments: [],
          reposts: []
        };
      });

      return transformedData;
    } catch (error) {
      console.error('Error fetching frames:', error);
      return [];
    }
  },

  // Like a frame
  async likeFrame(frameId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('frame_likes')
        .insert({ user_id: user.id, frame_id: frameId });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error liking frame:', error);
      return false;
    }
  },

  // Unlike a frame
  async unlikeFrame(frameId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('frame_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('frame_id', frameId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error unliking frame:', error);
      return false;
    }
  },

  // Add comment to frame
  async addComment(frameId: string, content: string): Promise<FrameComment | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('frame_comments')
        .insert({ user_id: user.id, frame_id: frameId, content })
        .select(`
          *,
          user:profiles(username, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      return null;
    }
  },

  // Increment share count
  async incrementShareCount(frameId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('increment_frame_share_count', { 
        frame_id: frameId 
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error incrementing share count:', error);
      return false;
    }
  },

  // Check if user has reposted a frame
  async checkUserRepost(frameId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('frame_reposts')
      .select('id')
      .eq('frame_id', frameId)
      .eq('user_id', userId)
      .single();

    return !!data && !error;
  },

  // Repost frame function - CLEANED: No debug logs
  async repostFrame(frameId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check for existing repost
      const { data: existingRepost } = await supabase
        .from('frame_reposts')
        .select('id')
        .eq('user_id', user.id)
        .eq('frame_id', frameId)
        .single();

      if (existingRepost) {
        return { success: true, alreadyReposted: true };
      }

      // Insert new repost
      const { error } = await supabase
        .from('frame_reposts')
        .insert({
          user_id: user.id,
          frame_id: frameId,
          view_count: 0 // ADDED: Initialize view count
        });

      if (error) throw error;

      // Update repost count
      const { data: currentFrame } = await supabase
        .from('frames')
        .select('repost_count')
        .eq('id', frameId)
        .single();

      await supabase
        .from('frames')
        .update({ repost_count: (currentFrame?.repost_count || 0) + 1 })
        .eq('id', frameId);

      return { success: true };
    } catch (error) {
      console.error('Error reposting frame:', error);
      return { success: false, error };
    }
  },

  // ADDED: Delete frame repost by repost ID
  async deleteRepost(repostId: string): Promise<{ success: boolean; frame_id?: string }> {
    try {
      const { data, error } = await supabase
        .from('frame_reposts')
        .delete()
        .eq('id', repostId)
        .select('frame_id')
        .single();

      if (error) throw error;

      // Update repost count on original frame
      if (data.frame_id) {
        const { data: currentFrame } = await supabase
          .from('frames')
          .select('repost_count')
          .eq('id', data.frame_id)
          .single();

        await supabase
          .from('frames')
          .update({ repost_count: Math.max(0, (currentFrame?.repost_count || 0) - 1) })
          .eq('id', data.frame_id);
      }

      return { 
        success: true, 
        frame_id: data.frame_id 
      };
    } catch (error) {
      console.error('Error deleting frame repost:', error);
      return { success: false };
    }
  },

  // Fetch reposted frames for feed - FIXED: Includes avatar_url for reposter
  async fetchRepostedFrames(limit = 20): Promise<any[]> {
    try {
      // Get reposts with basic frame data first
      const { data: reposts, error } = await supabase
        .from('frame_reposts')
        .select(`
          *,
          frames (*)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) return [];

      if (!reposts || reposts.length === 0) {
        return [];
      }

      // Get user profiles for both reposters and frame creators
      const reposterUserIds = [...new Set(reposts.map(repost => repost.user_id))];
      const frameCreatorUserIds = [...new Set(reposts.map(repost => repost.frames?.user_id).filter(Boolean))];
      const allUserIds = [...new Set([...reposterUserIds, ...frameCreatorUserIds])];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, genre_persona, full_name')
        .in('id', allUserIds);

      if (profilesError) {
        console.error('Error fetching profiles for reposts:', profilesError);
        return [];
      }

      // Create profile map for quick lookup
      const profileMap = new Map(profiles.map(profile => [profile.id, profile]));

      // Transform the data
      return reposts.map(repost => {
        const originalFrame = repost.frames;
        const reposterProfile = profileMap.get(repost.user_id);
        const frameCreatorProfile = originalFrame ? profileMap.get(originalFrame.user_id) : null;

        const transformedOriginalFrame = originalFrame ? {
          id: originalFrame.id,
          user_id: originalFrame.user_id,
          // FLAT PROPERTIES (new)
          user_name: frameCreatorProfile?.full_name || frameCreatorProfile?.username || 'Unknown User',
          user_genre_tag: frameCreatorProfile?.genre_persona || 'Creator',
          avatar_url: frameCreatorProfile?.avatar_url,
          view_count: originalFrame.view_count || 0, // ADDED: View count
          // NESTED (existing)
          user: {
            id: originalFrame.user_id,
            username: frameCreatorProfile?.username || 'Unknown User',
            avatar_url: frameCreatorProfile?.avatar_url,
            genre_persona: frameCreatorProfile?.genre_persona || 'Creator',
            full_name: frameCreatorProfile?.full_name
          },
          scene_id: originalFrame.scene_id,
          image_url: originalFrame.image_url,
          notes: originalFrame.notes,
          mood_description: originalFrame.mood_description,
          image_urls: originalFrame.image_urls || [],
          title: originalFrame.title,
          status: originalFrame.status || 'published',
          updated_at: originalFrame.updated_at || originalFrame.created_at,
          share_count: originalFrame.share_count || 0,
          like_count: originalFrame.like_count || 0,
          comment_count: originalFrame.comment_count || 0,
          repost_count: originalFrame.repost_count || 0,
          created_at: originalFrame.created_at,
          likes: [],
          comments: [],
          reposts: []
        } : null;

        return {
          id: repost.id,
          user_id: repost.user_id,
          user_name: reposterProfile?.full_name || reposterProfile?.username || 'Unknown User',
          user_genre_tag: reposterProfile?.genre_persona || 'Storyteller',
          avatar_url: reposterProfile?.avatar_url,
          view_count: repost.view_count || 0, // ADDED: View count for repost
          created_at: repost.created_at,
          like_count: 0,
          comment_count: 0, 
          share_count: 0,
          original_frame: transformedOriginalFrame
        };
      });
    } catch (error) {
      console.error('Error fetching reposted frames:', error);
      return [];
    }
  },

  // Unrepost frame - CLEANED: No debug logs
  async unrepostFrame(frameId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('frame_reposts')
        .delete()
        .eq('user_id', user.id)
        .eq('frame_id', frameId);

      if (error) throw error;

      // Update repost count
      const { data: currentFrame } = await supabase
        .from('frames')
        .select('repost_count')
        .eq('id', frameId)
        .single();

      await supabase
        .from('frames')
        .update({ repost_count: Math.max(0, (currentFrame?.repost_count || 0) - 1) })
        .eq('id', frameId);

      return true;
    } catch (error) {
      console.error('Error unreposting frame:', error);
      return false;
    }
  }
};