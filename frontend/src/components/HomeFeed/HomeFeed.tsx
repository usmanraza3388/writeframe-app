// E:\Cineverse\frontend\src\components\HomeFeed\HomeFeed.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeed } from '../../hooks/useFeed';
import { useMonologue } from '../../hooks/useMonologue';
import { useCharacter } from '../../hooks/useCharacter';
import { useFrame } from '../../hooks/useFrame';
import { useAuth } from '../../contexts/AuthContext';
import SceneCard from '../SceneCard/SceneCard';
import MonologueCard from '../Monologue/MonologueCard';
import RepostedMonologueCard from '../Monologue/RepostedMonologueCard';
import CharacterCard from '../Characters/CharacterCard';
import RepostedCharacterCard from '../Characters/RepostedCharacterCard';
import FrameCard from '../Frames/FrameCard';
import RepostedFrameCard from '../Frames/RepostedFrameCard';
import BottomNav from '../Navigation/BottomNav';
import type { CharacterWithDetails } from '../../utils/character-types';
import type { FrameWithDetails } from '../../utils/frames';
import { feedActions } from '../../utils/feedActions';

// ADDED: Skeleton Loading Components
const CardSkeleton: React.FC = () => (
  <div style={{
    width: 'calc(100% + 32px)',
    height: '200px',
    backgroundColor: '#FAF8F2',
    borderRadius: '12px',
    marginLeft: '-16px',
    marginRight: '-16px',
    padding: '16px',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      marginBottom: '16px'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: '#E5E5E5',
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />
      <div style={{ flex: 1 }}>
        <div style={{
          width: '60%',
          height: '20px',
          backgroundColor: '#E5E5E5',
          borderRadius: '4px',
          marginBottom: '8px',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
        <div style={{
          width: '40%',
          height: '15px',
          backgroundColor: '#E5E5E5',
          borderRadius: '4px',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
      </div>
    </div>
    <div style={{
      width: '80%',
      height: '16px',
      backgroundColor: '#E5E5E5',
      borderRadius: '4px',
      marginBottom: '8px',
      animation: 'pulse 1.5s ease-in-out infinite'
    }} />
    <div style={{
      width: '90%',
      height: '14px',
      backgroundColor: '#E5E5E5',
      borderRadius: '4px',
      marginBottom: '8px',
      animation: 'pulse 1.5s ease-in-out infinite'
    }} />
    <div style={{
      width: '70%',
      height: '14px',
      backgroundColor: '#E5E5E5',
      borderRadius: '4px',
      animation: 'pulse 1.5s ease-in-out infinite'
    }} />
  </div>
);

// ADDED: CSS for skeleton animation
const skeletonStyles = `
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
`;

type FeedItem = 
  | { type: 'scene'; data: any }
  | { type: 'monologue'; data: any }
  | { type: 'reposted_monologue'; data: any }
  | { type: 'character'; data: CharacterWithDetails }
  | { type: 'reposted_character'; data: any }
  | { type: 'frame'; data: FrameWithDetails }
  | { type: 'reposted_frame'; data: any };

const HomeFeed: React.FC = () => {
  const { scenes, loading: scenesLoading, error: scenesError, refresh: refreshScenes } = useFeed();
  const { monologues, repostedMonologues, loading: monologuesLoading, error: monologuesError, refreshMonologues, repostMonologue } = useMonologue();
  const { characters, repostedCharacters, isLoading: charactersLoading, error: charactersError, loadCharacters, repostCharacter } = useCharacter();
  const { frames, repostedFrames, loading: framesLoading, error: framesError, loadFrames, repostFrame } = useFrame();
  
  const { user, isLoading: authLoading } = useAuth();
  const currentUserId = user?.id;
  const navigate = useNavigate();

  // ADDED: Pagination state
  const [visibleCount, setVisibleCount] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // ADDED: Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (isLoadingMore) return;
    
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Load more when 500px from bottom
    if (scrollTop + windowHeight >= documentHeight - 500) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setVisibleCount(prev => prev + 10);
        setIsLoadingMore(false);
      }, 300); // Small delay for better UX
    }
  }, [isLoadingMore]);

  // ADDED: Scroll event listener
  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // FIXED: Skeleton styles - proper useEffect cleanup
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = skeletonStyles;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // CLEANED: Auto-scroll without debug logs
  React.useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash;
      
      if (hash) {
        const id = hash.replace('#', '');
        
        setTimeout(() => {
          const element = document.getElementById(id);
          
          if (element) {
            const elementRect = element.getBoundingClientRect();
            const absoluteElementTop = elementRect.top + window.pageYOffset;
            const offset = 120;
            
            window.scrollTo({
              top: absoluteElementTop - offset,
              behavior: 'smooth'
            });

            element.style.backgroundColor = '#fef7cd';
            element.style.transition = 'background-color 0.8s ease';
            
            setTimeout(() => {
              element.style.backgroundColor = '';
            }, 2500);

          } else {
            setTimeout(() => {
              const retryElement = document.getElementById(id);
              if (retryElement) {
                const retryRect = retryElement.getBoundingClientRect();
                const retryTop = retryRect.top + window.pageYOffset;
                
                window.scrollTo({
                  top: retryTop - 120,
                  behavior: 'smooth'
                });

                retryElement.style.backgroundColor = '#fef7cd';
                setTimeout(() => {
                  retryElement.style.backgroundColor = '';
                }, 2500);
              }
            }, 800);
          }
        }, 500);
      }
    };

    handleHashScroll();
    window.addEventListener('hashchange', handleHashScroll);
    
    return () => {
      window.removeEventListener('hashchange', handleHashScroll);
    };
  }, []);

  React.useEffect(() => {
    loadCharacters();
    loadFrames();
  }, [loadCharacters, loadFrames]);

  const handleSceneAction = React.useCallback(async (action: string, sceneId: string, contextText?: string) => {
    if (action === 'Edit') {
      sessionStorage.setItem('feedScrollPosition', window.scrollY.toString());
      navigate(`/compose-scene?id=${sceneId}`);
    } else if (action === 'deleted') {
      refreshScenes();
    } else if (action === 'remake' && contextText && currentUserId) {
      try {
        await feedActions.createRemakeScene(sceneId, contextText, currentUserId);
        refreshScenes();
      } catch (error) {
        console.error('Failed to create remake:', error);
      }
    } else if (action === 'view_original') {
      const originalSceneElement = document.getElementById(`scene-${sceneId}`);
      if (originalSceneElement) {
        originalSceneElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
        
        originalSceneElement.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
        setTimeout(() => {
          originalSceneElement.style.backgroundColor = '';
        }, 2000);
      }
    }
  }, [currentUserId, refreshScenes, navigate]);

  const handleMonologueAction = React.useCallback(async (action: string, monologueId: string) => {
    if (action === 'Edit') {
      sessionStorage.setItem('feedScrollPosition', window.scrollY.toString());
      navigate(`/compose-monologue?id=${monologueId}`);
    } else if (action === 'deleted') {
      refreshMonologues();
    } else if (action === 'repost' && currentUserId) {
      try {
        const success = await repostMonologue(monologueId);
        if (success) {
          // Successfully reposted
        }
      } catch (error) {
        console.error('Error reposting monologue:', error);
      }
    }
  }, [currentUserId, repostMonologue, navigate, refreshMonologues]);

  const handleCharacterAction = React.useCallback(async (action: string, characterId: string) => {
    if (action === 'Edit') {
      sessionStorage.setItem('feedScrollPosition', window.scrollY.toString());
      navigate(`/compose-character?id=${characterId}`);
    } else if (action === 'deleted') {
      loadCharacters();
    } else if (action === 'repost' && currentUserId) {
      try {
        const success = await repostCharacter(characterId);
        if (success) {
          // Successfully reposted
        }
      } catch (error) {
        console.error('Error reposting character:', error);
      }
    }
  }, [currentUserId, repostCharacter, navigate, loadCharacters]);

  const handleFrameAction = React.useCallback(async (action: string, frameId: string) => {
    if (action === 'Edit') {
      sessionStorage.setItem('feedScrollPosition', window.scrollY.toString());
      navigate(`/compose-frame?id=${frameId}`);
    } else if (action === 'deleted') {
      loadFrames();
    } else if (action === 'repost' && currentUserId) {
      try {
        const success = await repostFrame(frameId);
        if (success) {
          // Successfully reposted
        }
      } catch (error) {
        console.error('Error reposting frame:', error);
      }
    }
  }, [currentUserId, repostFrame, navigate, loadFrames]);

  // FIXED: Removed unused repostId parameters
  const handleRepostedMonologueAction = React.useCallback(async (action: string, _repostId: string, context?: any) => {
    if (action === 'view_original' && context?.originalMonologueId) {
      const elementId = `monologue-${context.originalMonologueId}`;
      const originalElement = document.getElementById(elementId);
      
      if (originalElement) {
        originalElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
        
        originalElement.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
        setTimeout(() => {
          originalElement.style.backgroundColor = '';
        }, 2000);
      }
    }
  }, []);

  // FIXED: Removed unused repostId parameters
  const handleRepostedCharacterAction = React.useCallback(async (action: string, _repostId: string, context?: any) => {
    if (action === 'view_original' && context?.originalCharacterId) {
      const elementId = `character-${context.originalCharacterId}`;
      const originalElement = document.getElementById(elementId);
      
      if (originalElement) {
        originalElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
        
        originalElement.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
        setTimeout(() => {
          originalElement.style.backgroundColor = '';
        }, 2000);
      }
    }
  }, []);

  // FIXED: Removed unused repostId parameters
  const handleRepostedFrameAction = React.useCallback(async (action: string, _repostId: string, context?: any) => {
    if (action === 'view_original' && context?.originalFrameId) {
      const elementId = `frame-${context.originalFrameId}`;
      const originalElement = document.getElementById(elementId);
      
      if (originalElement) {
        originalElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
        
        originalElement.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
        setTimeout(() => {
          originalElement.style.backgroundColor = '';
        }, 2000);
      }
    }
  }, []);

  const mixedFeed: FeedItem[] = React.useMemo(() => {
    const sceneItems = scenes.map(scene => ({
      type: 'scene' as const,
      data: scene,
      created_at: scene.created_at
    }));
    
    const monologueItems = monologues.map(monologue => ({
      type: 'monologue' as const,
      data: monologue,
      created_at: monologue.created_at
    }));

    const repostedMonologueItems = repostedMonologues.map(repost => ({
      type: 'reposted_monologue' as const,
      data: repost,
      created_at: repost.created_at
    }));

    const repostedCharacterItems = repostedCharacters.map(repost => ({
      type: 'reposted_character' as const,
      data: repost,
      created_at: repost.created_at
    }));

    const repostedFrameItems = repostedFrames.map(repost => ({
      type: 'reposted_frame' as const,
      data: repost,
      created_at: repost.created_at
    }));

    const characterItems = characters.map(character => ({
      type: 'character' as const,
      data: character,
      created_at: character.created_at
    }));

    const frameItems = frames.map(frame => ({
      type: 'frame' as const,
      data: frame,
      created_at: frame.created_at
    }));

    return [...sceneItems, ...monologueItems, ...repostedMonologueItems, ...characterItems, ...repostedCharacterItems, ...frameItems, ...repostedFrameItems]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [scenes, monologues, repostedMonologues, characters, repostedCharacters, frames, repostedFrames]);

  // ADDED: Paginated feed
  const displayFeed = useMemo(() => mixedFeed.slice(0, visibleCount), [mixedFeed, visibleCount]);

  const loading = scenesLoading || monologuesLoading || charactersLoading || framesLoading || authLoading;
  const error = scenesError || monologuesError || charactersError || framesError;

  const refreshAll = () => {
    refreshScenes();
    refreshMonologues();
    loadCharacters();
    loadFrames();
    setVisibleCount(10); // Reset pagination on refresh
  };

  // ADDED: Enhanced loading state with skeletons
  if (loading && mixedFeed.length === 0) {
    return (
      <div style={{
        width: '100%',
        maxWidth: '375px',
        margin: '0 auto',
        padding: '16px 0',
        backgroundColor: '#FFFFFF',
        paddingBottom: '100px',
        minHeight: '100vh'
      }}>
        <div style={{
          padding: '0 16px 16px 16px',
          borderBottom: '1px solid #E5E5E5',
          marginBottom: '16px'
        }}>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1C1C1C',
            margin: 0
          }}>
            writeFrame
          </h1>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          padding: '0 16px'
        }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>

        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#ff0000',
        fontFamily: 'Playfair Display, serif'
      }}>
        Error: {error}
        <br />
        <button 
          onClick={refreshAll}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#1C1C1C',
            color: '#FAF8F2',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (mixedFeed.length === 0) {
    return (
      <div style={{
        padding: '40px 20px',
        textAlign: 'center',
        fontFamily: 'Playfair Display, serif',
        color: '#55524F'
      }}>
        No content yet. Be the first to create a scene, monologue, character, or frame!
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '375px',
      margin: '0 auto',
      padding: '16px 0',
      backgroundColor: '#FFFFFF',
      paddingBottom: '100px',
      minHeight: '100vh'
    }}>
      <div style={{
        padding: '0 16px 16px 16px',
        borderBottom: '1px solid #E5E5E5',
        marginBottom: '16px'
      }}>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1C1C1C',
          margin: 0
        }}>
          writeFrame
        </h1>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '0 16px'
      }}>
        {displayFeed.map((item) => {
          if (item.type === 'scene') {
            return (
              <div key={`scene-${item.data.id}`} id={`scene-${item.data.id}`}>
                <SceneCard 
                  scene={item.data}
                  currentUserId={currentUserId}
                  onAction={handleSceneAction}
                />
              </div>
            );
          } else if (item.type === 'monologue') {
            return (
              <div key={`monologue-${item.data.id}`} id={`monologue-${item.data.id}`}>
                <MonologueCard 
                  monologue={item.data}
                  currentUserId={currentUserId}
                  onAction={handleMonologueAction}
                />
              </div>
            );
          } else if (item.type === 'reposted_monologue') {
            return (
              <RepostedMonologueCard 
                key={`repost-${item.data.id}`}
                repost={item.data}
                originalMonologue={item.data.original_monologue}
                currentUserId={currentUserId}
                onAction={handleRepostedMonologueAction}
              />
            );
          } else if (item.type === 'character') {
            return (
              <div key={`character-${item.data.id}`} id={`character-${item.data.id}`}>
                <CharacterCard 
                  character={item.data}
                  currentUserId={currentUserId}
                  onAction={handleCharacterAction}
                />
              </div>
            );
          } else if (item.type === 'reposted_character') {
            return (
              <RepostedCharacterCard 
                key={`repost-${item.data.id}`}
                repost={item.data}
                originalCharacter={item.data.original_character}
                currentUserId={currentUserId}
                onAction={handleRepostedCharacterAction}
              />
            );
          } else if (item.type === 'frame') {
            return (
              <div key={`frame-${item.data.id}`} id={`frame-${item.data.id}`}>
                <FrameCard 
                  frame={item.data}
                  currentUserId={currentUserId}
                  onAction={handleFrameAction}
                />
              </div>
            );
          } else if (item.type === 'reposted_frame') {
            return (
              <RepostedFrameCard 
                key={`repost-${item.data.id}`}
                repost={item.data}
                originalFrame={item.data.original_frame}
                currentUserId={currentUserId}
                onAction={handleRepostedFrameAction}
              />
            );
          } else {
            return null;
          }
        })}

        {/* ADDED: Loading more indicator */}
        {isLoadingMore && <CardSkeleton />}

        {/* ADDED: End of feed message with dynamic text */}
        {visibleCount >= mixedFeed.length && mixedFeed.length > 0 && (
          <div style={{
            padding: '20px 16px',
            textAlign: 'center',
            fontFamily: 'Playfair Display, serif',
            color: '#55524F',
            fontSize: '14px'
          }}>
            — {mixedFeed.length > 50 ? "You've reached the end for now" : "That's all for now"} —
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default HomeFeed;