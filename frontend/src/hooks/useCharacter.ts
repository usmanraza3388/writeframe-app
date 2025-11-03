import { useState, useCallback, useEffect } from 'react';
import type { CharacterWithDetails } from '../utils/character-types';
import { characterActions } from '../utils/characterActions';
import type { RepostedCharacterData } from '../utils/character-types';

export const useCharacter = () => {
  const [characters, setCharacters] = useState<CharacterWithDetails[]>([]);
  const [repostedCharacters, setRepostedCharacters] = useState<RepostedCharacterData[]>([]); // ADDED: Reposted characters state
  const [currentCharacter, setCurrentCharacter] = useState<CharacterWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ADDED: Fetch reposted characters for feed
  const fetchRepostedCharacters = useCallback(async () => {
    try {
      const reposts = await characterActions.fetchRepostedCharacters();
      setRepostedCharacters(reposts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching reposted characters');
    }
  }, []);

  // ADDED: Repost character function
  const repostCharacter = useCallback(async (characterId: string): Promise<boolean> => {
    try {
      const result = await characterActions.repostCharacter(characterId);
      
      if (result.success) {
        // Update local state optimistically
        setCharacters(prev => prev.map(character => {
          if (character.id === characterId) {
            return {
              ...character,
              repost_count: character.repost_count + 1,
              user_has_reposted: true
            };
          }
          return character;
        }));

        // Refresh reposted characters
        await fetchRepostedCharacters();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error reposting character');
      return false;
    }
  }, [fetchRepostedCharacters]);

  // ADDED: Delete repost function
  const deleteRepost = useCallback(async (repostId: string): Promise<boolean> => {
    try {
      const result = await characterActions.deleteRepost(repostId);
      
      if (result.success) {
        // Update local state optimistically
        if (result.character_id) {
          setCharacters(prev => prev.map(character => {
            if (character.id === result.character_id) {
              return {
                ...character,
                repost_count: Math.max(0, character.repost_count - 1),
                user_has_reposted: false
              };
            }
            return character;
          }));
        }

        // Refresh reposted characters
        await fetchRepostedCharacters();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting repost');
      return false;
    }
  }, [fetchRepostedCharacters]);

  // Load characters for home feed
  const loadCharacters = useCallback(async (limit = 20) => {
    setIsLoading(true);
    setError(null);
    try {
      const charactersData = await characterActions.getCharactersForHomeFeed(limit);
      setCharacters(charactersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load characters');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load a single character by ID
  const loadCharacter = useCallback(async (characterId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const characterData = await characterActions.getCharacterById(characterId);
      setCurrentCharacter(characterData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load character');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load characters by user
  const loadUserCharacters = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const userCharacters = await characterActions.getCharactersByUser(userId);
      setCharacters(userCharacters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user characters');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Like/Unlike character
  const likeCharacter = useCallback(async (characterId: string, userId: string) => {
    try {
      const result = await characterActions.toggleLike(characterId, userId);
      
      // Optimistic update for home feed
      setCharacters(prev => prev.map(char => 
        char.id === characterId 
          ? { ...char, like_count: result.like_count }
          : char
      ));
      
      // Optimistic update for current character
      if (currentCharacter?.id === characterId) {
        setCurrentCharacter(prev => prev ? { ...prev, like_count: result.like_count } : null);
      }
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like character');
      throw err;
    }
  }, [currentCharacter]);

  // Add comment to character
  const addComment = useCallback(async (characterId: string, userId: string, content: string) => {
    try {
      const result = await characterActions.addComment(characterId, userId, content);
      
      // Optimistic update
      setCharacters(prev => prev.map(char => 
        char.id === characterId 
          ? { ...char, comment_count: char.comment_count + 1 }
          : char
      ));
      
      if (currentCharacter?.id === characterId) {
        setCurrentCharacter(prev => prev ? { ...prev, comment_count: prev.comment_count + 1 } : null);
      }
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
      throw err;
    }
  }, [currentCharacter]);

  // Share character
  const shareCharacter = useCallback(async (characterId: string, userId: string) => {
    try {
      const result = await characterActions.shareCharacter(characterId, userId);
      
      // Optimistic update
      setCharacters(prev => prev.map(char => 
        char.id === characterId 
          ? { ...char, share_count: char.share_count + 1 }
          : char
      ));
      
      if (currentCharacter?.id === characterId) {
        setCurrentCharacter(prev => prev ? { ...prev, share_count: prev.share_count + 1 } : null);
      }
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share character');
      throw err;
    }
  }, [currentCharacter]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear current character
  const clearCurrentCharacter = useCallback(() => {
    setCurrentCharacter(null);
  }, []);

  // Real-time subscription for character updates
  useEffect(() => {
    if (!currentCharacter) return;

    const subscription = characterActions.subscribeToCharacterChanges(
      currentCharacter.id,
      (payload) => {
        if (payload.eventType === 'UPDATE' && payload.new) {
          setCurrentCharacter(prev => prev ? { ...prev, ...payload.new } : null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [currentCharacter]);

  // Real-time subscription for new characters in feed
  useEffect(() => {
    const subscription = characterActions.subscribeToCharacterFeed((payload) => {
      if (payload.eventType === 'INSERT' && payload.new) {
        // Add new character to the beginning of the feed
        setCharacters(prev => [payload.new as CharacterWithDetails, ...prev]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ADDED: Real-time subscription for character reposts
  useEffect(() => {
    const subscription = characterActions.subscribeToCharacterReposts((payload) => {
      if (payload.eventType === 'INSERT' && payload.new) {
        // Refresh reposted characters when new reposts are created
        fetchRepostedCharacters();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchRepostedCharacters]);

  // ADDED: Initial load of reposted characters
  useEffect(() => {
    fetchRepostedCharacters();
  }, [fetchRepostedCharacters]);

  return {
    // State
    characters,
    repostedCharacters, // ADDED: Return reposted characters
    currentCharacter,
    isLoading,
    error,
    
    // Actions
    loadCharacters,
    loadCharacter,
    loadUserCharacters,
    likeCharacter,
    addComment,
    shareCharacter,
    repostCharacter, // ADDED: Repost function
    deleteRepost, // ADDED: Delete repost function
    fetchRepostedCharacters, // ADDED: Fetch reposted characters
    clearError,
    clearCurrentCharacter,
    
    // Utility
    hasCharacters: characters.length > 0,
  };
};

// Hook for single character operations
export const useSingleCharacter = (characterId?: string) => {
  const [character, setCharacter] = useState<CharacterWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCharacter = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const characterData = await characterActions.getCharacterById(id);
      setCharacter(characterData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load character');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (characterId) {
      loadCharacter(characterId);
    }
  }, [characterId, loadCharacter]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    character,
    isLoading,
    error,
    loadCharacter,
    clearError,
  };
};