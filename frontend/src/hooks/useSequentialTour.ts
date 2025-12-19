// src/hooks/useSequentialTour.ts - CLEAN VERSION
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../assets/lib/supabaseClient';

type TooltipPhase = 'bottom-nav' | 'home-feed' | 'profile-page' | 'other-profile' | 'completed';
type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

interface TooltipStep {
  id: string;
  phase: TooltipPhase;
  index: number;
  selector: string;
  message: string;
  position: TooltipPosition;
  navigateTo?: string;
  requireOwnProfile?: boolean;
  requireOtherProfile?: boolean;
}

export const useSequentialTour = () => {
  const [currentStep, setCurrentStep] = useState<TooltipStep | null>(null);
  const [currentPhase, setCurrentPhase] = useState<TooltipPhase | null>(null);
  const [isTourActive, setIsTourActive] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
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
      requireOwnProfile: true
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
          localStorage.setItem('writeframe_current_user_id', user.id);
        }
      } catch (error) {
        // Silent fail - user ID not critical for tour start
      }
    };
    
    getCurrentUserId();
  }, []);

  // Check if tour should be active
  useEffect(() => {
    const checkAndStartTour = async () => {
      const hasChosenTour = localStorage.getItem('writeframe_tour_choice') === 'tour';
      const tourCompleted = localStorage.getItem('writeframe_tour_completed') === 'true';
      const immediateStart = localStorage.getItem('writeframe_tour_start_immediately') === 'true';
      const currentStepIndex = parseInt(localStorage.getItem('writeframe_tour_current_step') || '1');
      
      // Start tour if: (user chose tour AND tour not completed) OR immediate start flag is set
      const shouldStartTour = (hasChosenTour && !tourCompleted) || immediateStart;
      
      if (shouldStartTour && !skipRequestedRef.current) {
        // Clear immediate start flag if it exists
        if (immediateStart) {
          localStorage.removeItem('writeframe_tour_start_immediately');
        }
        
        // Ensure we have a step index (default to 1)
        const stepIndex = currentStepIndex >= 1 && currentStepIndex <= allTooltipSteps.length 
          ? currentStepIndex 
          : 1;
        
        // Save the starting step index
        localStorage.setItem('writeframe_tour_current_step', stepIndex.toString());
        
        // Set tour as active
        setIsTourActive(true);
        setHasCompletedTour(false);
        
        // Find and set the current step
        const step = allTooltipSteps.find(s => s.index === stepIndex) || allTooltipSteps[0];
        setCurrentStep(step);
        setCurrentPhase(step.phase);
        
        // Navigate if needed
        if (step.requireOwnProfile && currentUserId) {
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
        setCurrentStep(null);
        setCurrentPhase(null);
      } else {
        setIsTourActive(false);
      }
    };
    
    // Small delay to ensure page is fully loaded
    const timer = setTimeout(() => {
      checkAndStartTour();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [location.pathname, navigate, currentUserId]);

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
      return currentUserId && location.pathname === `/profile/${currentUserId}`;
    }
    
    if (currentStep.requireOtherProfile) {
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
    localStorage.setItem('writeframe_tour_current_step', '1');
    setIsTourActive(false);
    setHasCompletedTour(true);
    setCurrentStep(null);
    setCurrentPhase(null);
  }, []);

  // Skip the entire tour
  const skipTour = useCallback(() => {
    skipRequestedRef.current = true;
    localStorage.setItem('writeframe_tour_completed', 'true');
    localStorage.setItem('writeframe_tour_choice', 'explore');
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
    localStorage.setItem('writeframe_tour_start_immediately', 'true');
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
      const element = document.querySelector(currentStep.selector) as HTMLElement;
      return element;
    } catch (error) {
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

  // Highlight target element - SIMPLIFIED
  const highlightElement = useCallback((element: HTMLElement) => {
    if (!element) return;
    
    // Store original styles
    const originalBoxShadow = element.style.boxShadow;
    const originalOutline = element.style.outline;
    
    // Apply simple highlight
    element.style.boxShadow = '0 0 0 2px rgba(139, 92, 246, 0.5)';
    element.style.outline = '1px solid rgba(139, 92, 246, 0.8)';
    
    // Return cleanup function
    return () => {
      element.style.boxShadow = originalBoxShadow;
      element.style.outline = originalOutline;
    };
  }, []);

  return {
    // State
    currentStep,
    currentPhase,
    isTourActive,
    hasCompletedTour,
    isTransitioning,
    currentUserId,
    
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
    getNavigationPath,
    
    // Constants
    allTooltipSteps
  };
};