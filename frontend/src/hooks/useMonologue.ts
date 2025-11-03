import { useState, useEffect, useCallback } from 'react';
import { monologueActions } from '../utils/monologueActions';
import type { MonologueFeedItem, MonologueComment } from '../utils/monologueActions';

interface UseMonologueReturn {
  monologues: MonologueFeedItem[];
  repostedMonologues: any[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  refreshMonologues: () => Promise<void>;
  loadMoreMonologues: () => Promise<void>;
  likeMonologue: (monologueId: string) => Promise<void>;
  addComment: (monologueId: string, content: string) => Promise<boolean>;
  shareMonologue: (monologueId: string) => Promise<boolean>;
  repostMonologue: (monologueId: string) => Promise<boolean>;
  deleteRepost: (repostId: string) => Promise<boolean>; // ADDED: Delete repost function
  fetchRepostedMonologues: () => Promise<void>;
}

export const useMonologue = (initialLimit = 10): UseMonologueReturn => {
  const [monologues, setMonologues] = useState<MonologueFeedItem[]>([]);
  const [repostedMonologues, setRepostedMonologues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Fetch monologues for home feed
  const fetchMonologues = useCallback(async (loadMore = false) => {
    try {
      if (!loadMore) {
        setLoading(true);
      }
      
      setError(null);
      const limit = initialLimit;
      const newMonologues = await monologueActions.fetchMonologues(limit);

      if (loadMore) {
        setMonologues(prev => [...prev, ...newMonologues]);
      } else {
        setMonologues(newMonologues);
      }

      // Check if there are more monologues to load
      setHasMore(newMonologues.length === limit);
      
    } catch (err) {
      console.error('Error fetching monologues:', err);
      setError('Failed to load monologues');
    } finally {
      setLoading(false);
    }
  }, [initialLimit]);

  // Fetch reposted monologues for home feed
  const fetchRepostedMonologues = useCallback(async () => {
    try {
      const reposts = await monologueActions.fetchRepostedMonologues();
      setRepostedMonologues(reposts);
    } catch (err) {
      console.error('Error fetching reposted monologues:', err);
    }
  }, []);

  // ADDED: Delete repost function
  const deleteRepost = useCallback(async (repostId: string): Promise<boolean> => {
    try {
      const result = await monologueActions.deleteRepost(repostId);
      
      if (result.success) {
        // Update local state optimistically
        if (result.monologue_id) {
          setMonologues(prev => prev.map(monologue => {
            if (monologue.id === result.monologue_id) {
              return {
                ...monologue,
                repost_count: Math.max(0, monologue.repost_count - 1),
                user_has_reposted: false
              };
            }
            return monologue;
          }));
        }

        // Refresh reposted monologues
        await fetchRepostedMonologues();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting repost:', err);
      return false;
    }
  }, [fetchRepostedMonologues]);

  // Refresh monologues
  const refreshMonologues = useCallback(async () => {
    await fetchMonologues(false);
  }, [fetchMonologues]);

  // Load more monologues
  const loadMoreMonologues = useCallback(async () => {
    if (loading || !hasMore) return;
    await fetchMonologues(true);
  }, [loading, hasMore, fetchMonologues]);

  // Like/unlike a monologue
  const likeMonologue = useCallback(async (monologueId: string) => {
    try {
      const success = await monologueActions.toggleLike(monologueId);
      
      if (success) {
        // Update local state optimistically
        setMonologues(prev => prev.map(monologue => {
          if (monologue.id === monologueId) {
            const newLikeCount = monologue.user_has_liked 
              ? monologue.like_count - 1 
              : monologue.like_count + 1;
            
            return {
              ...monologue,
              like_count: newLikeCount,
              user_has_liked: !monologue.user_has_liked
            };
          }
          return monologue;
        }));
      }
    } catch (err) {
      console.error('Error liking monologue:', err);
      // Optionally show error toast to user
    }
  }, []);

  // Add comment to monologue
  const addComment = useCallback(async (monologueId: string, content: string): Promise<boolean> => {
    try {
      const result = await monologueActions.addComment(monologueId, content);
      
      if (result.success) {
        // Update local state optimistically
        setMonologues(prev => prev.map(monologue => {
          if (monologue.id === monologueId) {
            return {
              ...monologue,
              comment_count: monologue.comment_count + 1
            };
          }
          return monologue;
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding comment:', err);
      return false;
    }
  }, []);

  // Share monologue
  const shareMonologue = useCallback(async (monologueId: string): Promise<boolean> => {
    try {
      const result = await monologueActions.shareMonologue(monologueId);
      
      if (result.success) {
        // Update local state optimistically
        setMonologues(prev => prev.map(monologue => {
          if (monologue.id === monologueId) {
            return {
              ...monologue,
              share_count: monologue.share_count + 1
            };
          }
          return monologue;
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error sharing monologue:', err);
      return false;
    }
  }, []);

  // Repost monologue
  const repostMonologue = useCallback(async (monologueId: string): Promise<boolean> => {
    try {
      const result = await monologueActions.repostMonologue(monologueId);
      
      if (result.success) {
        // Update local state optimistically
        setMonologues(prev => prev.map(monologue => {
          if (monologue.id === monologueId) {
            return {
              ...monologue,
              repost_count: monologue.repost_count + 1,
              user_has_reposted: true
            };
          }
          return monologue;
        }));

        // Refresh reposted monologues to include the new repost
        await fetchRepostedMonologues();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error reposting monologue:', err);
      return false;
    }
  }, [fetchRepostedMonologues]);

  // Real-time subscription for new monologues
  useEffect(() => {
    const subscription = monologueActions.subscribeToMonologues((newMonologue) => {
      setMonologues(prev => [newMonologue, ...prev]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Initial load
  useEffect(() => {
    fetchMonologues(false);
    fetchRepostedMonologues();
  }, [fetchMonologues, fetchRepostedMonologues]);

  return {
    monologues,
    repostedMonologues,
    loading,
    error,
    hasMore,
    refreshMonologues,
    loadMoreMonologues,
    likeMonologue,
    addComment,
    shareMonologue,
    repostMonologue,
    deleteRepost, // ADDED: Return delete repost function
    fetchRepostedMonologues
  };
};

// Hook for single monologue with comments
interface UseSingleMonologueReturn {
  monologue: MonologueFeedItem | null;
  comments: MonologueComment[];
  loading: boolean;
  error: string | null;
  refreshMonologue: () => Promise<void>;
  refreshComments: () => Promise<void>;
}

export const useSingleMonologue = (monologueId: string): UseSingleMonologueReturn => {
  const [monologue, setMonologue] = useState<MonologueFeedItem | null>(null);
  const [comments, setComments] = useState<MonologueComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMonologue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const monologueData = await monologueActions.getMonologueById(monologueId);
      if (monologueData) {
        // Transform to MonologueFeedItem format
        const feedItem: MonologueFeedItem = {
          id: monologueData.id,
          user_id: monologueData.user_id,
          user_name: monologueData.profiles?.username || 'Unknown User',
          user_genre_tag: monologueData.profiles?.genre_persona || 'Writer',
          title: monologueData.title,
          content_text: monologueData.content_text,
          soundtrack_id: monologueData.soundtrack_id,
          like_count: monologueData.like_count || 0,
          comment_count: monologueData.comment_count || 0,
          share_count: monologueData.share_count || 0,
          repost_count: (monologueData as any).repost_count || 0, // FIX: Use type assertion
          created_at: monologueData.created_at,
          user_has_liked: monologueData.user_has_liked || false,
          user_has_reposted: (monologueData as any).user_has_reposted || false, // FIX: Use type assertion
          emotional_tags: monologueData.monologue_emotional_tags?.map((tag: any) => tag.emotional_tone) || [],
          soundtrack: monologueData.soundtracks ? {
            title: monologueData.soundtracks.title,
            artist: monologueData.soundtracks.artist
          } : undefined
        };
        setMonologue(feedItem);
      } else {
        setError('Monologue not found');
      }
    } catch (err) {
      console.error('Error fetching monologue:', err);
      setError('Failed to load monologue');
    } finally {
      setLoading(false);
    }
  }, [monologueId]);

  const fetchComments = useCallback(async () => {
    try {
      const commentsData = await monologueActions.fetchComments(monologueId);
      setComments(commentsData);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  }, [monologueId]);

  const refreshMonologue = useCallback(async () => {
    await fetchMonologue();
  }, [fetchMonologue]);

  const refreshComments = useCallback(async () => {
    await fetchComments();
  }, [fetchComments]);

  // Initial load
  useEffect(() => {
    if (monologueId) {
      fetchMonologue();
      fetchComments();
    }
  }, [monologueId, fetchMonologue, fetchComments]);

  return {
    monologue,
    comments,
    loading,
    error,
    refreshMonologue,
    refreshComments
  };
};