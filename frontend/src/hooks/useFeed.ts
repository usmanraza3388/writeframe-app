// E:\Cineverse\frontend\src\hooks\useFeed.ts
import { useState, useEffect } from 'react';
import { feedActions, type FeedScene } from '../utils/feedActions';

export const useFeed = () => {
  const [scenes, setScenes] = useState<FeedScene[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch scenes on component mount
  useEffect(() => {
    const fetchScenes = async () => {
      try {
        setLoading(true);
        setError(null);
        const sceneData = await feedActions.getPublishedScenes();
        setScenes(sceneData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load scenes');
      } finally {
        setLoading(false);
      }
    };

    fetchScenes();

    // Set up real-time subscription for new scenes
    const subscription = feedActions.subscribeToScenes((newScene) => {
      setScenes(prev => [newScene, ...prev]);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    scenes,
    loading,
    error,
    // Helper function to manually refresh
    refresh: () => {
      setLoading(true);
      feedActions.getPublishedScenes()
        .then(setScenes)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  };
};