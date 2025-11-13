// src/hooks/useProfileData.ts
import { useState, useEffect } from 'react';
import { supabase } from '../assets/lib/supabaseClient';

interface ProfileStats {
  scenes: number;
  followers: number;  // Changed from echoes to followers
  following: number;  // Added this new property
  remakes: number;
  monologues: number;
  characters: number;
  frames: number;
  totalLikes: number;
}

interface TabContent {
  scenes: any[];
  monologues: any[];
  characters: any[];
  frames: any[];
}

// COMPLETELY ISOLATED DEEP CLONE - NO REFERENCES SHARED
const createIsolatedCopy = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  // Handle arrays - create completely new array with isolated items
  if (Array.isArray(obj)) {
    return obj.map(item => createIsolatedCopy(item));
  }
  
  // Handle objects - create completely new object with isolated values
  const copy: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      copy[key] = createIsolatedCopy(obj[key]);
    }
  }
  return copy;
};

// SEPARATE TRANSFORMERS FOR EACH CONTENT TYPE - NO SHARED LOGIC
const transformCharacterData = (char: any) => ({
  ...createIsolatedCopy(char),
  visual_references: char.character_visual_references || [], // ✅ ADD VISUAL REFERENCES
  _dataType: 'character',
  _tab: 'characters',
  _timestamp: Date.now() + Math.random()
});

const transformMonologueData = (mono: any) => ({
  ...createIsolatedCopy(mono),
  _dataType: 'monologue', 
  _tab: 'monologues',
  _timestamp: Date.now() + Math.random()
});

const transformFrameData = (frame: any) => ({
  ...createIsolatedCopy(frame),
  _dataType: 'frame',
  _tab: 'frames',
  _timestamp: Date.now() + Math.random()
});

export const useProfileData = (userId: string) => {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<ProfileStats>({
    scenes: 0, 
    followers: 0,  // Changed from echoes to followers
    following: 0,  // Added this new property
    remakes: 0, 
    monologues: 0, 
    characters: 0, 
    frames: 0, 
    totalLikes: 0
  });
  const [tabContent, setTabContent] = useState<TabContent>({
    scenes: [], monologues: [], characters: [], frames: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true; // Prevent state updates after unmount

    const fetchAllProfileData = async () => {
      try {
        setIsLoading(true);
        
        // 1. Fetch basic profile info
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;
        if (!isMounted) return;

        // 2. Fetch ALL data in parallel but process SEPARATELY
        const [
          scenesCount, monologuesCount, charactersCount, framesCount,
          followersCount, followingCount, remakesCount, totalLikesCount,
          originalScenes, originalMonologues, originalCharacters, originalFrames,
          characterReposts, monologueReposts, frameReposts
        ] = await Promise.all([
          // Content counts
          supabase.from('scenes').select('id', { count: 'exact' }).eq('user_id', userId).eq('status', 'published'),
          supabase.from('monologues').select('id', { count: 'exact' }).eq('user_id', userId).eq('status', 'published'),
          supabase.from('characters').select('id', { count: 'exact' }).eq('user_id', userId).eq('status', 'published'),
          supabase.from('frames').select('id', { count: 'exact' }).eq('user_id', userId).eq('status', 'published'),
          
          // Engagement counts - UPDATED: followers and following
          supabase.from('user_echoes').select('id', { count: 'exact' }).eq('to_user_id', userId), // Followers
          supabase.from('user_echoes').select('id', { count: 'exact' }).eq('from_user_id', userId), // Following
          supabase.from('scenes')
            .select('remake_count')
            .eq('user_id', userId)
            .eq('status', 'published'),
          supabase.from('likes').select('id', { count: 'exact' }).eq('user_id', userId),

          // Original content - SEPARATE QUERIES
          supabase.from('scenes').select('*').eq('user_id', userId).eq('status', 'published').order('created_at', { ascending: false }).limit(20),
          supabase.from('monologues').select('*').eq('user_id', userId).eq('status', 'published').order('created_at', { ascending: false }).limit(20),
          // ✅ FIXED: Include character_visual_references for original characters
          supabase.from('characters').select(`
            *,
            character_visual_references (*)
          `).eq('user_id', userId).eq('status', 'published').order('created_at', { ascending: false }).limit(20),
          supabase.from('frames').select('*').eq('user_id', userId).eq('status', 'published').order('created_at', { ascending: false }).limit(20),
          
          // Reposts - SEPARATE QUERIES
          // ✅ FIXED: Include character_visual_references for reposted characters
          supabase.from('character_reposts')
            .select(`
              *, 
              original_character:character_id(*, character_visual_references(*))
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20),
          supabase.from('monologue_reposts')
            .select('*, original_monologue:monologue_id(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20),
          supabase.from('frame_reposts')
            .select('*, original_frame:frame_id(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20),
        ]);

        if (!isMounted) return;

        // 3. PROCESS EACH TAB COMPLETELY SEPARATELY - NO SHARED DATA
        const processScenesTab = () => {
          const allScenes = (originalScenes.data || []).map(scene => {
            const isolatedScene = createIsolatedCopy(scene);
            return {
              ...isolatedScene,
              description: isolatedScene.description || isolatedScene.content_text || '',
              _dataType: isolatedScene.original_scene_id ? 'scene-remake' : 'scene',
              _tab: 'scenes',
              _timestamp: Date.now() + Math.random()
            };
          }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

          return allScenes;
        };

        const processCharactersTab = () => {
          const original = originalCharacters.data?.map(transformCharacterData) || [];
          const reposts = characterReposts.data?.map((repost: any) => {
            if (!repost.original_character) return null;
            return transformCharacterData({
              id: repost.id, // Use repost ID as main identifier
              ...repost.original_character,
              // ✅ USE REPOST-SPECIFIC ENGAGEMENT
              like_count: repost.like_count || 0,
              comment_count: repost.comment_count || 0,
              share_count: repost.share_count || 0,
              user_has_reposted: true,
              repost_id: repost.id,
              repost_created_at: repost.created_at,
              is_repost: true
            });
          }).filter(Boolean) || [];
          return [...original, ...reposts]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        };

        const processMonologuesTab = () => {
          const original = originalMonologues.data?.map(transformMonologueData) || [];
          const reposts = monologueReposts.data?.map((repost: any) => {
            if (!repost.original_monologue) return null;
            return transformMonologueData({
              id: repost.id,
              ...repost.original_monologue,
              // ✅ USE REPOST-SPECIFIC ENGAGEMENT
              like_count: repost.like_count || 0,
              comment_count: repost.comment_count || 0,
              share_count: repost.share_count || 0,
              user_has_reposted: true,
              repost_id: repost.id,
              repost_created_at: repost.created_at,
              is_repost: true
            });
          }).filter(Boolean) || [];
          return [...original, ...reposts]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        };

        const processFramesTab = () => {
          const original = originalFrames.data?.map(transformFrameData) || [];
          const reposts = frameReposts.data?.map((repost: any) => {
            if (!repost.original_frame) return null;
            return transformFrameData({
              id: repost.id,
              ...repost.original_frame,
              // ✅ USE REPOST-SPECIFIC ENGAGEMENT
              like_count: repost.like_count || 0,
              comment_count: repost.comment_count || 0,
              share_count: repost.share_count || 0,
              user_has_reposted: true,
              repost_id: repost.id,
              repost_created_at: repost.created_at,
              is_repost: true
            });
          }).filter(Boolean) || [];
          return [...original, ...reposts]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        };

        // 4. Calculate stats
        const totalRemakesReceived = remakesCount.data?.reduce((sum, scene) => sum + (scene.remake_count || 0), 0) || 0;

        // 5. Set state with COMPLETELY ISOLATED data
        if (isMounted) {
          setProfile(createIsolatedCopy(profileData));
          setStats({
            scenes: scenesCount.count || 0,
            monologues: monologuesCount.count || 0,
            characters: charactersCount.count || 0,
            frames: framesCount.count || 0,
            followers: followersCount.count || 0,  // Changed from echoes to followers
            following: followingCount.count || 0,  // Added this new property
            remakes: totalRemakesReceived,
            totalLikes: totalLikesCount.count || 0,
          });
          
          setTabContent({
            scenes: processScenesTab(),
            monologues: processMonologuesTab(),
            characters: processCharactersTab(),
            frames: processFramesTab(),
          });
          
          setError(null);
        }

      } catch (err: any) {
        if (isMounted) {
          setError(err.message);
          console.error('Profile data fetch error:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAllProfileData();

    return () => {
      isMounted = false; // Cleanup
    };
  }, [userId, refreshTrigger]);

  const refresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return {
    profile,
    stats,
    tabContent,
    isLoading,
    error,
    refresh
  };
};