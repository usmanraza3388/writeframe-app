// src/hooks/useSequentialTour.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
      navigateTo: '/profile' // Will navigate to user's profile
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

  // Check if tour should be active
  useEffect(() => {
    const hasChosenTour = localStorage.getItem('writeframe_tour_choice') === 'tour';
    const tourCompleted = localStorage.getItem('writeframe_tour_completed') === 'true';
    const currentStepIndex = parseInt(localStorage.getItem('writeframe_tour_current_step') || '1');
    
    if (hasChosenTour && !tourCompleted && !skipRequestedRef.current) {
      setIsTourActive(true);
      setHasCompletedTour(false);
      
      // Find the current step based on saved index
      const step = allTooltipSteps.find(s => s.index === currentStepIndex) || allTooltipSteps[0];
      setCurrentStep(step);
      setCurrentPhase(step.phase);
      
      // Navigate if step requires specific route
      if (step.navigateTo && location.pathname !== step.navigateTo) {
        navigate(step.navigateTo);
      }
    } else if (tourCompleted) {
      setHasCompletedTour(true);
      setIsTourActive(false);
    }
  }, [location.pathname, navigate]);

  // Check if current location matches step requirements
  const shouldShowCurrentStep = useCallback(() => {
    if (!currentStep || !isTourActive) return false;
    
    // Check if we're on the right page for this step
    if (currentStep.navigateTo && location.pathname !== currentStep.navigateTo) {
      return false;
    }
    
    // For profile steps, check if we're on correct profile type
    if (currentStep.requireOwnProfile && !location.pathname.startsWith('/profile/')) {
      return false;
    }
    
    if (currentStep.requireOtherProfile && !location.pathname.startsWith('/profile/')) {
      return false;
    }
    
    return true;
  }, [currentStep, isTourActive, location.pathname]);

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
        if (nextStep.navigateTo && location.pathname !== nextStep.navigateTo) {
          navigate(nextStep.navigateTo);
        }
      }
    } else {
      // Tour completed
      completeTour();
    }
    
    // Small delay to prevent rapid clicking
    setTimeout(() => setIsTransitioning(false), 300);
  }, [currentStep, isTourActive, location.pathname, navigate]);

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
      
      if (prevStep.navigateTo && location.pathname !== prevStep.navigateTo) {
        navigate(prevStep.navigateTo);
      }
    }
    
    setTimeout(() => setIsTransitioning(false), 300);
  }, [currentStep, isTourActive, location.pathname, navigate]);

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
    
    if (firstStep.navigateTo && location.pathname !== firstStep.navigateTo) {
      navigate(firstStep.navigateTo);
    }
  }, [location.pathname, navigate]);

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
    
    // Constants
    allTooltipSteps
  };
};