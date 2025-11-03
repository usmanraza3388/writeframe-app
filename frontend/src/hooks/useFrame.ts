// useFrame.ts
import { useState, useEffect, useCallback } from 'react';
import { frameActions } from '../utils/frameActions';
import type { FrameWithDetails } from '../utils/frames';

export const useFrame = (initialLimit = 20) => {
  const [frames, setFrames] = useState<FrameWithDetails[]>([]);
  const [repostedFrames, setRepostedFrames] = useState<any[]>([]); // ADDED: Reposted frames state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Load frames for home feed
  const loadFrames = useCallback(async (limit = initialLimit) => {
    try {
      setLoading(true);
      setError(null);
      const framesData = await frameActions.getFrames(limit);
      setFrames(framesData);
      setHasMore(framesData.length === limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load frames');
    } finally {
      setLoading(false);
    }
  }, [initialLimit]);

  // ADDED: Fetch reposted frames for feed
  const fetchRepostedFrames = useCallback(async () => {
    try {
      const reposts = await frameActions.fetchRepostedFrames();
      setRepostedFrames(reposts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching reposted frames');
    }
  }, []);

  // ADDED: Delete repost function
  const deleteRepost = useCallback(async (repostId: string): Promise<boolean> => {
    try {
      const result = await frameActions.deleteRepost(repostId);
      
      if (result.success) {
        // Update local state optimistically
        if (result.frame_id) {
          setFrames(prev => prev.map(frame => {
            if (frame.id === result.frame_id) {
              return {
                ...frame,
                repost_count: Math.max(0, frame.repost_count - 1),
                reposts: frame.reposts?.filter(repost => repost.id !== repostId) || []
              };
            }
            return frame;
          }));
        }

        // Refresh reposted frames
        await fetchRepostedFrames();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting repost');
      return false;
    }
  }, [fetchRepostedFrames]);

  // Like a frame with optimistic update
  const likeFrame = useCallback(async (frameId: string) => {
    const originalFrames = [...frames];
    
    // Optimistic update
    setFrames(prev => prev.map(frame => 
      frame.id === frameId 
        ? { 
            ...frame, 
            like_count: frame.like_count + 1,
            likes: [...(frame.likes || []), { 
              id: 'temp', 
              user_id: 'temp', 
              frame_id: frameId, 
              created_at: new Date().toISOString() 
            }]
          }
        : frame
    ));

    try {
      await frameActions.likeFrame(frameId);
      // Refresh to get actual data
      await loadFrames();
    } catch (error) {
      // Revert on error
      setFrames(originalFrames);
      setError(error instanceof Error ? error.message : 'Error liking frame');
    }
  }, [frames, loadFrames]);

  // Unlike a frame with optimistic update
  const unlikeFrame = useCallback(async (frameId: string) => {
    const originalFrames = [...frames];
    
    // Optimistic update
    setFrames(prev => prev.map(frame => 
      frame.id === frameId 
        ? { 
            ...frame, 
            like_count: Math.max(0, frame.like_count - 1),
            likes: frame.likes?.filter(like => like.id !== 'temp') || []
          }
        : frame
    ));

    try {
      await frameActions.unlikeFrame(frameId);
      await loadFrames();
    } catch (error) {
      setFrames(originalFrames);
      setError(error instanceof Error ? error.message : 'Error unliking frame');
    }
  }, [frames, loadFrames]);

  // Add comment with optimistic update
  const addComment = useCallback(async (frameId: string, content: string) => {
    const originalFrames = [...frames];
    
    // Optimistic update
    const tempComment = {
      id: 'temp',
      user_id: 'temp', 
      frame_id: frameId,
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: { username: 'You', avatar_url: undefined }
    };

    setFrames(prev => prev.map(frame => 
      frame.id === frameId 
        ? { 
            ...frame, 
            comment_count: frame.comment_count + 1,
            comments: [...(frame.comments || []), tempComment]
          }
        : frame
    ));

    try {
      const newComment = await frameActions.addComment(frameId, content);
      if (newComment) {
        await loadFrames(); // Refresh to get actual comment data
      }
    } catch (error) {
      setFrames(originalFrames);
      setError(error instanceof Error ? error.message : 'Error adding comment');
      throw error;
    }
  }, [frames, loadFrames]);

  // Share frame
  const shareFrame = useCallback(async (frameId: string) => {
    const originalFrames = [...frames];
    
    // Optimistic update
    setFrames(prev => prev.map(frame => 
      frame.id === frameId 
        ? { ...frame, share_count: frame.share_count + 1 }
        : frame
    ));

    try {
      await frameActions.incrementShareCount(frameId);
    } catch (error) {
      setFrames(originalFrames);
      setError(error instanceof Error ? error.message : 'Error sharing frame');
    }
  }, [frames]);

  // Repost frame with optimistic update - UPDATED: Include reposted frames refresh
  const repostFrame = useCallback(async (frameId: string): Promise<boolean> => {
    const originalFrames = [...frames];
    
    // Optimistic update
    setFrames(prev => prev.map(frame => 
      frame.id === frameId 
        ? { 
            ...frame, 
            repost_count: frame.repost_count + 1,
            reposts: [...(frame.reposts || []), { 
              id: 'temp', 
              user_id: 'temp', 
              frame_id: frameId, 
              created_at: new Date().toISOString() 
            }]
          }
        : frame
    ));

    try {
      const result = await frameActions.repostFrame(frameId);
      
      if (result.success) {
        // Refresh reposted frames to include the new repost
        await fetchRepostedFrames();
        return true;
      }
      return false;
    } catch (error) {
      setFrames(originalFrames);
      setError(error instanceof Error ? error.message : 'Error reposting frame');
      return false;
    }
  }, [frames, fetchRepostedFrames]);

  // Unrepost frame with optimistic update - UPDATED: Include reposted frames refresh
  const unrepostFrame = useCallback(async (frameId: string) => {
    const originalFrames = [...frames];
    
    // Optimistic update
    setFrames(prev => prev.map(frame => 
      frame.id === frameId 
        ? { 
            ...frame, 
            repost_count: Math.max(0, frame.repost_count - 1),
            reposts: frame.reposts?.filter(repost => repost.id !== 'temp') || []
          }
        : frame
    ));

    try {
      await frameActions.unrepostFrame(frameId);
      await loadFrames();
      // Refresh reposted frames to remove the unreposted frame
      await fetchRepostedFrames();
    } catch (error) {
      setFrames(originalFrames);
      setError(error instanceof Error ? error.message : 'Error unreposting frame');
    }
  }, [frames, loadFrames, fetchRepostedFrames]);

  // Load frames on mount - UPDATED: Include reposted frames
  useEffect(() => {
    loadFrames();
    fetchRepostedFrames(); // ADDED: Load reposted frames on mount
  }, [loadFrames, fetchRepostedFrames]);

  return {
    frames,
    repostedFrames, // ADDED: Return reposted frames
    loading,
    error,
    hasMore,
    loadFrames,
    fetchRepostedFrames, // ADDED: Return fetch function
    deleteRepost, // ADDED: Delete repost function
    likeFrame,
    unlikeFrame,
    addComment,
    shareFrame,
    repostFrame,
    unrepostFrame,
    refetch: loadFrames
  };
};