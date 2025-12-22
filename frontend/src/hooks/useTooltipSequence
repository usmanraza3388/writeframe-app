// src/hooks/useTooltipSequence.ts
import { useState, useEffect, useCallback } from 'react';

export type TooltipSequence = 
  | 'bottom-nav'      // Sequence for BottomNav elements
  | 'profile-page'    // Sequence for Profile page
  | 'home-feed';      // Sequence for HomeFeed elements

export type TooltipStep = {
  sequence: TooltipSequence;
  stepNumber: number;
  targetElementId: string;   // ID or data attribute of element to highlight
  title: string;             // Tooltip title (optional)
  content: string;           // Tooltip text content
  position?: 'top' | 'bottom' | 'left' | 'right'; // Preferred position
  offsetX?: number;          // Horizontal offset from target
  offsetY?: number;          // Vertical offset from target
};

export type SequenceProgress = {
  [key in TooltipSequence]: {
    completed: boolean;
    lastStepCompleted: number; // 0 = not started, 1 = step 1 done, etc.
  };
};

const TOOLTIP_SEQUENCES: TooltipStep[] = [
  // BottomNav Sequence (4 steps)
  {
    sequence: 'bottom-nav',
    stepNumber: 1,
    targetElementId: 'bottomnav-home',
    title: 'Home Feed',
    content: 'This is your main feed where you see scenes, monologues, characters, and frames from creators you follow.',
    position: 'top',
    offsetY: -10
  },
  {
    sequence: 'bottom-nav',
    stepNumber: 2,
    targetElementId: 'bottomnav-whispers',
    title: 'Whispers',
    content: 'Private messages from other creators. Send and receive feedback, collaborate, and connect.',
    position: 'top',
    offsetY: -10
  },
  {
    sequence: 'bottom-nav',
    stepNumber: 3,
    targetElementId: 'bottomnav-create',
    title: 'Create Content',
    content: 'Tap here to create scenes, monologues, characters, or visual frames. This is where your creations begin.',
    position: 'top',
    offsetY: -10
  },
  {
    sequence: 'bottom-nav',
    stepNumber: 4,
    targetElementId: 'bottomnav-profile',
    title: 'Your Profile',
    content: 'Your creative portfolio. Showcase your work, stats, and connect with other creators.',
    position: 'top',
    offsetY: -10
  },

  // Profile Page Sequence (4 steps)
  {
    sequence: 'profile-page',
    stepNumber: 1,
    targetElementId: 'profile-avatar',
    title: 'Profile Picture',
    content: 'Add a profile picture to personalize your creative identity. Click to upload or change.',
    position: 'bottom',
    offsetY: 10
  },
  {
    sequence: 'profile-page',
    stepNumber: 2,
    targetElementId: 'profile-stats',
    title: 'Your Stats',
    content: 'Track your creative output: scenes, characters, monologues, frames, and remakes.',
    position: 'bottom',
    offsetY: 10
  },
  {
    sequence: 'profile-page',
    stepNumber: 3,
    targetElementId: 'profile-tabs',
    title: 'Content Tabs',
    content: 'Switch between your scenes, characters, monologues, and frames. Each tab shows your work in that format.',
    position: 'bottom',
    offsetY: 10
  },
  {
    sequence: 'profile-page',
    stepNumber: 4,
    targetElementId: 'profile-edit',
    title: 'Edit Profile',
    content: 'Update your bio, genre, social links, and creative focus settings.',
    position: 'bottom',
    offsetY: 10
  },

  // HomeFeed Sequence (2 steps - REMOVED follow button step)
  {
    sequence: 'home-feed',
    stepNumber: 1,
    targetElementId: 'feed-scene-card',
    title: 'Scene Cards',
    content: 'Each scene shows the screenplay with creator info. Tap to read, or use menu for remake actions.',
    position: 'bottom',
    offsetY: 10
  },
  {
    sequence: 'home-feed',
    stepNumber: 2,
    targetElementId: 'feed-infinite-scroll',
    title: 'Explore More',
    content: 'Scroll down to discover more content. The feed loads automatically as you explore.',
    position: 'top',
    offsetY: -10
  }
  // REMOVED: Follow button step (was step 2, now removed)
];

const STORAGE_KEY = 'writeframe_tooltip_progress';

const getDefaultProgress = (): SequenceProgress => ({
  'bottom-nav': { completed: false, lastStepCompleted: 0 },
  'profile-page': { completed: false, lastStepCompleted: 0 },
  'home-feed': { completed: false, lastStepCompleted: 0 }
});

export const useTooltipSequence = () => {
  const [progress, setProgress] = useState<SequenceProgress>(getDefaultProgress);
  const [activeSequence, setActiveSequence] = useState<TooltipSequence | null>(null);
  const [currentStep, setCurrentStep] = useState<TooltipStep | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setProgress(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load tooltip progress:', error);
    }
    setIsInitialized(true);
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save tooltip progress:', error);
    }
  }, [progress, isInitialized]);

  // Start a sequence if it hasn't been completed
  const startSequence = useCallback((sequence: TooltipSequence) => {
    if (progress[sequence].completed) {
      return false; // Sequence already completed
    }

    const nextStepNumber = progress[sequence].lastStepCompleted + 1;
    const step = TOOLTIP_SEQUENCES.find(
      s => s.sequence === sequence && s.stepNumber === nextStepNumber
    );

    if (!step) {
      // No more steps in this sequence
      setProgress(prev => ({
        ...prev,
        [sequence]: { completed: true, lastStepCompleted: nextStepNumber - 1 }
      }));
      return false;
    }

    setActiveSequence(sequence);
    setCurrentStep(step);
    return true;
  }, [progress]);

  // Complete current step and move to next
  const completeCurrentStep = useCallback(() => {
    if (!currentStep || !activeSequence) return;

    const nextStepNumber = currentStep.stepNumber + 1;
    
    // Update progress for this sequence
    setProgress(prev => ({
      ...prev,
      [activeSequence]: { 
        ...prev[activeSequence], 
        lastStepCompleted: currentStep.stepNumber 
      }
    }));

    // Find next step in the same sequence
    const nextStep = TOOLTIP_SEQUENCES.find(
      s => s.sequence === activeSequence && s.stepNumber === nextStepNumber
    );

    if (nextStep) {
      // Move to next step in same sequence
      setCurrentStep(nextStep);
    } else {
      // Sequence completed
      setProgress(prev => ({
        ...prev,
        [activeSequence]: { 
          completed: true, 
          lastStepCompleted: nextStepNumber - 1 
        }
      }));
      setActiveSequence(null);
      setCurrentStep(null);
    }
  }, [currentStep, activeSequence]);

  // Skip the entire active sequence
  const skipSequence = useCallback(() => {
    if (!activeSequence) return;
    
    setProgress(prev => ({
      ...prev,
      [activeSequence]: { 
        completed: true, 
        lastStepCompleted: TOOLTIP_SEQUENCES
          .filter(s => s.sequence === activeSequence)
          .reduce((max, s) => Math.max(max, s.stepNumber), 0)
      }
    }));
    
    setActiveSequence(null);
    setCurrentStep(null);
  }, [activeSequence]);

  // Check if a specific element should be highlighted
  const shouldHighlightElement = useCallback((elementId: string): boolean => {
    if (!currentStep) return false;
    return currentStep.targetElementId === elementId;
  }, [currentStep]);

  // Get all steps for a sequence (for UI display)
  const getSequenceSteps = useCallback((sequence: TooltipSequence): TooltipStep[] => {
    return TOOLTIP_SEQUENCES.filter(s => s.sequence === sequence);
  }, []);

  // Check if sequence is in progress
  const isSequenceActive = useCallback((sequence: TooltipSequence): boolean => {
    return activeSequence === sequence;
  }, [activeSequence]);

  // Reset all progress (for testing/development)
  const resetAllProgress = useCallback(() => {
    setProgress(getDefaultProgress());
    setActiveSequence(null);
    setCurrentStep(null);
  }, []);

  return {
    // State
    progress,
    activeSequence,
    currentStep,
    isInitialized,
    
    // Actions
    startSequence,
    completeCurrentStep,
    skipSequence,
    
    // Queries
    shouldHighlightElement,
    getSequenceSteps,
    isSequenceActive,
    
    // Utilities
    resetAllProgress
  };
};

export default useTooltipSequence;