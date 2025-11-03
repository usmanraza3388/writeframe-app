// src/hooks/useDashboardData.ts
import { useState, useEffect } from 'react';
import { supabase } from '../assets/lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface DashboardStats {
  streak: number;
  totalCreations: number;
  totalEngagement: number;
  contentDistribution: {
    scenes: number;
    monologues: number;
    characters: number;
    frames: number;
  };
  topContent: {
    scene: any | null;
    monologue: any | null;
    character: any | null;
    frame: any | null;
  };
}

export const useDashboardData = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    streak: 0,
    totalCreations: 0,
    totalEngagement: 0,
    contentDistribution: { scenes: 0, monologues: 0, characters: 0, frames: 0 },
    topContent: { scene: null, monologue: null, character: null, frame: null }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all user content in parallel
        const [
          scenesResponse,
          monologuesResponse, 
          charactersResponse,
          framesResponse
        ] = await Promise.all([
          supabase.from('scenes').select('*').eq('user_id', user.id).eq('published', true),
          supabase.from('monologues').select('*').eq('user_id', user.id).eq('published', true),
          supabase.from('characters').select('*').eq('user_id', user.id).eq('status', 'published'),
          supabase.from('frames').select('*').eq('user_id', user.id).eq('status', 'published')
        ]);

        // Check for errors
        if (scenesResponse.error) throw scenesResponse.error;
        if (monologuesResponse.error) throw monologuesResponse.error;
        if (charactersResponse.error) throw charactersResponse.error;
        if (framesResponse.error) throw framesResponse.error;

        const scenes = scenesResponse.data || [];
        const monologues = monologuesResponse.data || [];
        const characters = charactersResponse.data || [];
        const frames = framesResponse.data || [];

        // Calculate total creations
        const totalCreations = scenes.length + monologues.length + characters.length + frames.length;

        // Calculate total engagement (likes + comments + shares across all content)
        const scenesEngagement = scenes.reduce((sum, scene) => 
          sum + (scene.like_count || 0) + (scene.comment_count || 0) + (scene.share_count || 0), 0
        );
        
        const monologuesEngagement = monologues.reduce((sum, monologue) => 
          sum + (monologue.like_count || 0) + (monologue.comment_count || 0) + (monologue.share_count || 0), 0
        );
        
        const charactersEngagement = characters.reduce((sum, character) => 
          sum + (character.like_count || 0), 0 // Characters only track likes
        );
        
        const framesEngagement = frames.reduce((sum, frame) => 
          sum + (frame.like_count || 0) + (frame.comment_count || 0) + (frame.share_count || 0) + (frame.repost_count || 0), 0
        );

        const totalEngagement = scenesEngagement + monologuesEngagement + charactersEngagement + framesEngagement;

        // Calculate day streak (days with content creation in last 7 days)
        const allContent = [...scenes, ...monologues, ...characters, ...frames];
        const recentDays = new Set();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        allContent.forEach(item => {
          const createdDate = new Date(item.created_at);
          if (createdDate > sevenDaysAgo) {
            recentDays.add(createdDate.toDateString());
          }
        });

        const dayStreak = recentDays.size;

        // Find top performing content from each category
        const topScene = scenes.length > 0 ? scenes.reduce((max, scene) => {
          const maxEngagement = (max.like_count || 0) + (max.comment_count || 0) + (max.share_count || 0);
          const currentEngagement = (scene.like_count || 0) + (scene.comment_count || 0) + (scene.share_count || 0);
          return currentEngagement > maxEngagement ? scene : max;
        }) : null;

        const topMonologue = monologues.length > 0 ? monologues.reduce((max, monologue) => {
          const maxEngagement = (max.like_count || 0) + (max.comment_count || 0) + (max.share_count || 0);
          const currentEngagement = (monologue.like_count || 0) + (monologue.comment_count || 0) + (monologue.share_count || 0);
          return currentEngagement > maxEngagement ? monologue : max;
        }) : null;

        const topCharacter = characters.length > 0 ? characters.reduce((max, character) => {
          return (character.like_count || 0) > (max.like_count || 0) ? character : max;
        }) : null;

        const topFrame = frames.length > 0 ? frames.reduce((max, frame) => {
          const maxEngagement = (max.like_count || 0) + (max.comment_count || 0) + (max.share_count || 0) + (max.repost_count || 0);
          const currentEngagement = (frame.like_count || 0) + (frame.comment_count || 0) + (frame.share_count || 0) + (frame.repost_count || 0);
          return currentEngagement > maxEngagement ? frame : max;
        }) : null;

        // Update stats
        setStats({
          streak: dayStreak,
          totalCreations,
          totalEngagement,
          contentDistribution: {
            scenes: scenes.length,
            monologues: monologues.length,
            characters: characters.length,
            frames: frames.length
          },
          topContent: {
            scene: topScene,
            monologue: topMonologue,
            character: topCharacter,
            frame: topFrame
          }
        });

        setError(null);

      } catch (err: any) {
        console.error('Dashboard data fetch error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return { stats, isLoading, error };
};