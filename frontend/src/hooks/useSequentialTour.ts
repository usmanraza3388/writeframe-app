// src/hooks/useSequentialTour.ts - FIXED VERSION
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../assets/lib/supabaseClient'; // ADDED: Import supabase

type TooltipPhase = 'bottom-nav' | 'home-feed' | 'profile-page' | 'other-profile' | 'completed';
type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

interface TooltipStep {
  id: string;
  phase: TooltipPhase;
  index: number; // Overall index (1-10)
  selector: string;
  message: string;
  position: TooltipPosition;
  navigateTo?: string; // If tooltip requires navigation
  requireOwnProfile?: boolean; // Only show on user's own profile
  requireOtherProfile?: boolean; // Only show on other user's profile
}

export const useSequentialTour = () => {
  const [currentStep, setCurrentStep] = useState<TooltipStep | null>(null);
  const [currentPhase, setCurrentPhase] = useState<TooltipPhase | null>(null);
  const [isTourActive, setIsTourActive] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // ADDED: Store current user ID
  
  const location = useLocation();
  const navigate = useNavigate();
  const skipRequestedRef = useRef(false);

  // Define all tooltip steps in sequence
  const allTooltipSteps: TooltipStep[] = [
    // PHASE 1: Bottom Navigation (3 tooltips)
    {
      id: 'create-button',
      phase: 'bottom-nav',
      index: 1,
      selector: '.bottom-nav-create',
      message: 'Tap here to CREATE scenes, monologues, characters, or frames',
      position: 'top'
    },
    {
      id: 'profile-button',
      phase: 'bottom-nav', 
      index: 2,
      selector: '.bottom-nav-profile',
      message: 'Your PORTFOLIO lives here - showcase all your work',
      position: 'top',
      requireOwnProfile: true // CHANGED: Added flag to identify profile step
    },
    {
      id: 'whispers-button',
      phase: 'bottom-nav',
      index: 3,
      selector: '.bottom-nav-whispers',
      message: 'WHISPERS: Private messages to connect with creators',
      position: 'top'
    },

    // PHASE 2: Home Feed (2 tooltips)
    {
      id: 'home-feed-header',
      phase: 'home-feed',
      index: 4,
      selector: '.home-feed-header',
      message: 'Discover cinematic creations from the community',
      position: 'bottom',
      navigateTo: '/home-feed'
    },
    {
      id: 'first-content-card',
      phase: 'home-feed',
      index: 5,
      selector: '.scene-card:first-child, .monologue-card:first-child',
      message: 'Tap any creation to READ, REMIX, or interact',
      position: 'right'
    },

    // PHASE 3: Profile Page - Own Profile (3 tooltips)
    {
      id: 'profile-grid',
      phase: 'profile-page',
      index: 6,
      selector: '.profile-grid',
      message: 'Your creations appear here - build your cinematic portfolio',
      position: 'top',
      requireOwnProfile: true
    },
    {
      id: 'profile-stats',
      phase: 'profile-page',
      index: 7,
      selector: '.social-button:first-child',
      message: 'Track your growth and community engagement here',
      position: 'left',
      requireOwnProfile: true
    },
    {
      id: 'profile-tabs',
      phase: 'profile-page',
      index: 8,
      selector: '.tabs-container',
      message: 'Filter your work by type: Scenes, Characters, Monologues, or Frames',
      position: 'bottom',
      requireOwnProfile: true
    },

    // PHASE 4: Profile Page - Other Users (2 tooltips)
    {
      id: 'follow-button',
      phase: 'other-profile',
      index: 9,
      selector: '.echo-button',
      message: 'FOLLOW creators whose work inspires you',
      position: 'left',
      requireOtherProfile: true
    },
    {
      id: 'whisper-button',
      phase: 'other-profile',
      index: 10,
      selector: '.whisper-button',
      message: 'Send WHISPERS for private feedback or collaboration',
      position: 'left',
      requireOtherProfile: true
    }
  ];

  // Get current user ID on mount
  useEffect(() => {
    const getCurrentUserId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
          
          // Also store in localStorage for navigation purposes
          localStorage.setItem('writeframe_current_user_id', user.id);
        }
      } catch (error) {
        console.error('Failed to get current user:', error);
      }
    };
    
    getCurrentUserId();
  }, []);

  // Check if tour should be active
  useEffect(() => {
    const checkAndStartTour = async () => {
      const hasChosenTour = localStorage.getItem('writeframe_tour_choice') === 'tour';
      const tourCompleted = localStorage.getItem('writeframe_tour_completed') === 'true';
      const currentStepIndex = parseInt(localStorage.getItem('writeframe_tour_current_step') || '1');
      const tourTrigger = localStorage.getItem('writeframe_tour_trigger'); // ADDED: Check for immediate trigger
      
      // Get user ID if not already set
      if (!currentUserId) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            setCurrentUserId(user.id);
            localStorage.setItem('writeframe_current_user_id', user.id);
          }
        } catch (error) {
          console.error('Failed to get user ID for tour:', error);
        }
      }
      
      // Start tour if conditions met
      if ((hasChosenTour || tourTrigger === 'true') && !tourCompleted && !skipRequestedRef.current) {
        // Clear trigger flag if it exists
        if (tourTrigger === 'true') {
          localStorage.removeItem('writeframe_tour_trigger');
        }
        
        setIsTourActive(true);
        setHasCompletedTour(false);
        
        // Find the current step based on saved index
        const step = allTooltipSteps.find(s => s.index === currentStepIndex) || allTooltipSteps[0];
        setCurrentStep(step);
        setCurrentPhase(step.phase);
        
        // Navigate if step requires specific route
        if (step.requireOwnProfile && currentUserId) {
          // Navigate to user's own profile
          const profilePath = `/profile/${currentUserId}`;
          if (location.pathname !== profilePath) {
            navigate(profilePath);
          }
        } else if (step.navigateTo && location.pathname !== step.navigateTo) {
          navigate(step.navigateTo);
        }
      } else if (tourCompleted) {
        setHasCompletedTour(true);
        setIsTourActive(false);
      }
    };
    
    checkAndStartTour();
  }, [location.pathname, navigate, currentUserId]); // ADDED: currentUserId dependency

  // Get navigation path for a step (handles profile routes)
  const getNavigationPath = useCallback((step: TooltipStep): string | null => {
    if (step.requireOwnProfile && currentUserId) {
      return `/profile/${currentUserId}`;
    }
    
    if (step.navigateTo) {
      return step.navigateTo;
    }
    
    return null;
  }, [currentUserId]);

  // Check if current location matches step requirements
  const shouldShowCurrentStep = useCallback(() => {
    if (!currentStep || !isTourActive) return false;
    
    // Get expected path for this step
    const expectedPath = getNavigationPath(currentStep);
    
    // Check if we're on the right page for this step
    if (expectedPath && location.pathname !== expectedPath) {
      return false;
    }
    
    // For profile steps, check if we're on correct profile type
    if (currentStep.requireOwnProfile) {
      // Should be on user's own profile
      return currentUserId && location.pathname === `/profile/${currentUserId}`;
    }
    
    if (currentStep.requireOtherProfile) {
      // Should be on someone else's profile
      return currentUserId && location.pathname.startsWith('/profile/') && location.pathname !== `/profile/${currentUserId}`;
    }
    
    return true;
  }, [currentStep, isTourActive, location.pathname, currentUserId, getNavigationPath]);

  // Advance to next step
  const nextStep = useCallback(() => {
    if (!currentStep || !isTourActive) return;
    
    setIsTransitioning(true);
    
    const nextIndex = currentStep.index + 1;
    
    if (nextIndex <= allTooltipSteps.length) {
      const nextStep = allTooltipSteps.find(s => s.index === nextIndex);
      
      if (nextStep) {
        // Save progress
        localStorage.setItem('writeframe_tour_current_step', nextIndex.toString());
        setCurrentStep(nextStep);
        setCurrentPhase(nextStep.phase);
        
        // Navigate if needed
        const nextPath = getNavigationPath(nextStep);
        if (nextPath && location.pathname !== nextPath) {
          navigate(nextPath);
        }
      }
    } else {
      // Tour completed
      completeTour();
    }
    
    // Small delay to prevent rapid clicking
    setTimeout(() => setIsTransitioning(false), 300);
  }, [currentStep, isTourActive, location.pathname, navigate, getNavigationPath]);

  // Go back to previous step
  const prevStep = useCallback(() => {
    if (!currentStep || !isTourActive || currentStep.index <= 1) return;
    
    setIsTransitioning(true);
    
    const prevIndex = currentStep.index - 1;
    const prevStep = allTooltipSteps.find(s => s.index === prevIndex);
    
    if (prevStep) {
      localStorage.setItem('writeframe_tour_current_step', prevIndex.toString());
      setCurrentStep(prevStep);
      setCurrentPhase(prevStep.phase);
      
      // Navigate if needed
      const prevPath = getNavigationPath(prevStep);
      if (prevPath && location.pathname !== prevPath) {
        navigate(prevPath);
      }
    }
    
    setTimeout(() => setIsTransitioning(false), 300);
  }, [currentStep, isTourActive, location.pathname, navigate, getNavigationPath]);

  // Complete the tour
  const completeTour = useCallback(() => {
    localStorage.setItem('writeframe_tour_completed', 'true');
    localStorage.setItem('writeframe_tour_current_step', '1'); // Reset for future
    setIsTourActive(false);
    setHasCompletedTour(true);
    setCurrentStep(null);
    setCurrentPhase(null);
  }, []);

  // Skip the entire tour
  const skipTour = useCallback(() => {
    skipRequestedRef.current = true;
    localStorage.setItem('writeframe_tour_completed', 'true');
    localStorage.setItem('writeframe_tour_choice', 'explore'); // Update choice
    setIsTourActive(false);
    setHasCompletedTour(true);
    setCurrentStep(null);
    setCurrentPhase(null);
  }, []);

  // Restart the tour from beginning
  const restartTour = useCallback(() => {
    skipRequestedRef.current = false;
    localStorage.removeItem('writeframe_tour_completed');
    localStorage.setItem('writeframe_tour_current_step', '1');
    localStorage.setItem('writeframe_tour_choice', 'tour');
    setIsTourActive(true);
    setHasCompletedTour(false);
    
    const firstStep = allTooltipSteps[0];
    setCurrentStep(firstStep);
    setCurrentPhase(firstStep.phase);
    
    // Navigate to first step's location
    const firstPath = getNavigationPath(firstStep);
    if (firstPath && location.pathname !== firstPath) {
      navigate(firstPath);
    }
  }, [location.pathname, navigate, getNavigationPath]);

  // Get progress percentage
  const getProgress = useCallback(() => {
    if (!currentStep) return 0;
    return Math.round((currentStep.index / allTooltipSteps.length) * 100);
  }, [currentStep]);

  // Check if element exists for current step
  const getTargetElement = useCallback(() => {
    if (!currentStep?.selector) return null;
    
    try {
      // Try to find the element
      const element = document.querySelector(currentStep.selector) as HTMLElement;
      return element;
    } catch (error) {
      console.warn('Could not find tour target element:', currentStep.selector);
      return null;
    }
  }, [currentStep]);

  // Get position for tooltip
  const getElementPosition = useCallback((element: HTMLElement) => {
    if (!element) return { top: 0, left: 0, width: 0, height: 0 };
    
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    return {
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft,
      width: rect.width,
      height: rect.height
    };
  }, []);

  // Highlight target element
  const highlightElement = useCallback((element: HTMLElement) => {
    if (!element) return;
    
    // Store original styles
    const originalBoxShadow = element.style.boxShadow;
    const originalOutline = element.style.outline;
    const originalZIndex = element.style.zIndex;
    const originalPosition = element.style.position;
    
    // Apply highlight
    element.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.5)';
    element.style.outline = '2px solid rgba(139, 92, 246, 0.8)';
    element.style.zIndex = '9995';
    element.style.position = 'relative';
    
    // Return cleanup function
    return () => {
      element.style.boxShadow = originalBoxShadow;
      element.style.outline = originalOutline;
      element.style.zIndex = originalZIndex;
      element.style.position = originalPosition;
    };
  }, []);

  return {
    // State
    currentStep,
    currentPhase,
    isTourActive,
    hasCompletedTour,
    isTransitioning,
    currentUserId, // ADDED: Export current user ID
    
    // Progress
    totalSteps: allTooltipSteps.length,
    currentStepIndex: currentStep?.index || 0,
    progress: getProgress(),
    
    // Actions
    nextStep,
    prevStep,
    completeTour,
    skipTour,
    restartTour,
    
    // Utilities
    shouldShowCurrentStep,
    getTargetElement,
    getElementPosition,
    highlightElement,
    getNavigationPath, // ADDED: Export navigation helper
    
    // Constants
    allTooltipSteps
  };
};