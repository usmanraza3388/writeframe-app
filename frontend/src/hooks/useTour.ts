// src/hooks/useTour.ts
import { useState, useEffect, useCallback } from 'react';

export type TourStep = {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element
  position?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  route?: string; // Route where this step should be shown
  trigger?: 'route' | 'element' | 'interaction' | 'delay';
  delay?: number; // Delay in ms for 'delay' trigger
  actionText?: string; // Optional action button text
  requiredAction?: boolean; // Whether user must perform action to continue
  showNavigation?: boolean;
};

export type TourProgress = {
  completedSteps: string[];
  currentStepId?: string;
  startedAt?: Date;
  completedAt?: Date;
  skipped: boolean;
  enabled: boolean;
};

const TOUR_STORAGE_KEY = 'writeframe_tour_progress';
const TOUR_ENABLED_KEY = 'writeframe_tour_enabled';
const TOUR_OPTIN_SEEN_KEY = 'writeframe_tour_optin_seen';
const TOUR_SKIPPED_KEY = 'writeframe_tour_skipped';

// Define the tour steps for writeFrame
export const TOUR_STEPS: TourStep[] = [
  {
    id: 'home_feed_intro',
    title: 'Explore Creative Work',
    description: 'This is your home feed where you can discover scenes, monologues, characters, and frames from other creators. Scroll to see inspiring work from the community.',
    target: '.home-feed-container',
    position: 'bottom',
    route: '/home-feed',
    trigger: 'route',
    showNavigation: true
  },
  {
    id: 'feed_interactions',
    title: 'Engage with Content',
    description: 'Tap on any card to view details. You can like, comment, or repost content that inspires you. Each interaction helps you connect with other creators.',
    target: '.scene-card, .monologue-card, .character-card, .frame-card', // REVERTED: Original working selector
    position: 'bottom-right',
    route: '/home-feed',
    trigger: 'element',
    delay: 1000,
    showNavigation: true
  },
  {
    id: 'create_button',
    title: 'Create Your Masterpiece',
    description: 'Tap here to access all creation tools. You can write scenes, craft monologues, build characters, or curate visual frames.',
    target: '.create-button',
    position: 'top',
    route: '/home-feed',
    trigger: 'interaction',
    actionText: 'Try Creating',
    requiredAction: false,
    showNavigation: true
  },
  {
    id: 'profile_access',
    title: 'Your Creative Portfolio',
    description: 'Your profile showcases all your creations. It\'s your portfolio where others can discover your unique style and creative journey.',
    target: '.profile-button',
    position: 'top',
    route: '/home-feed',
    trigger: 'route',
    showNavigation: true
  },
  {
    id: 'profile_stats',
    title: 'Track Your Growth',
    description: 'Here you can see your creative stats: scenes written, characters created, followers, and more. Your stats tell the story of your creative journey.',
    target: '.stats-container',
    position: 'bottom',
    route: '/profile/:id',
    trigger: 'route',
    showNavigation: true
  },
  {
    id: 'profile_edit',
    title: 'Personalize Your Space',
    description: 'Edit your profile to add a bio, set your genre persona, and customize how others see your creative identity.',
    target: '.edit-profile-button',
    position: 'left',
    route: '/profile/:id',
    trigger: 'element',
    delay: 500,
    showNavigation: true
  },
  {
    id: 'whispers_feature',
    title: 'Connect Privately',
    description: 'Whispers are private messages for giving feedback, collaborating, or connecting with other creators directly.',
    target: '.whispers-button',
    position: 'top',
    route: '/home-feed',
    trigger: 'route',
    showNavigation: true
  }
];

const useTour = () => {
  const [progress, setProgress] = useState<TourProgress>(() => {
    // Load from localStorage on init
    const saved = localStorage.getItem(TOUR_STORAGE_KEY);
    const enabled = localStorage.getItem(TOUR_ENABLED_KEY) === 'true';
    const skipped = localStorage.getItem(TOUR_SKIPPED_KEY) === 'true';
    
    if (saved) {
      return { ...JSON.parse(saved), enabled, skipped };
    }
    
    return {
      completedSteps: [],
      skipped: skipped || false,
      enabled: enabled || false,
    };
  });

  const [currentStep, setCurrentStep] = useState<TourStep | null>(null);
  const [isActive, setIsActive] = useState(false);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify({
      completedSteps: progress.completedSteps,
      currentStepId: progress.currentStepId,
      startedAt: progress.startedAt,
      skipped: progress.skipped
    }));
    localStorage.setItem(TOUR_ENABLED_KEY, progress.enabled.toString());
    localStorage.setItem(TOUR_SKIPPED_KEY, progress.skipped.toString());
  }, [progress]);

  // Check if user has seen the opt-in
  const hasSeenOptIn = useCallback(() => {
    return localStorage.getItem(TOUR_OPTIN_SEEN_KEY) === 'true';
  }, []);

  const markOptInSeen = useCallback(() => {
    localStorage.setItem(TOUR_OPTIN_SEEN_KEY, 'true');
  }, []);

  // Enable the tour (called when user accepts from opt-in modal)
  const enableTour = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      enabled: true,
      skipped: false,
      startedAt: new Date()
    }));
    setIsActive(true);
  }, []);

  // Disable/skip the tour
  const skipTour = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      enabled: false,
      skipped: true,
      completedAt: new Date()
    }));
    setIsActive(false);
    setCurrentStep(null);
  }, []);

  // Complete the entire tour
  const completeTour = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      enabled: false,
      completedAt: new Date(),
      completedSteps: TOUR_STEPS.map(step => step.id)
    }));
    setIsActive(false);
    setCurrentStep(null);
  }, []);

  // Complete a specific step
  const completeStep = useCallback((stepId: string) => {
    setProgress(prev => ({
      ...prev,
      completedSteps: [...prev.completedSteps, stepId]
    }));
    
    // Move to next step if there is one
    const currentIndex = TOUR_STEPS.findIndex(step => step.id === stepId);
    if (currentIndex < TOUR_STEPS.length - 1) {
      const nextStep = TOUR_STEPS[currentIndex + 1];
      setCurrentStep(nextStep);
    } else {
      // Tour completed
      completeTour();
    }
  }, [completeTour]);

  // Go to next step
  const goToNextStep = useCallback(() => {
    if (!currentStep) return;
    
    completeStep(currentStep.id);
  }, [currentStep, completeStep]);

  // Go to previous step
  const goToPrevStep = useCallback(() => {
    if (!currentStep) return;
    
    const currentIndex = TOUR_STEPS.findIndex(step => step.id === currentStep.id);
    if (currentIndex > 0) {
      const prevStep = TOUR_STEPS[currentIndex - 1];
      setCurrentStep(prevStep);
    }
  }, [currentStep]);

  // Start the tour from beginning or resume
  const startTour = useCallback(() => {
    if (!progress.enabled) return;
    
    setIsActive(true);
    
    // Find first incomplete step
    const firstIncomplete = TOUR_STEPS.find(step => 
      !progress.completedSteps.includes(step.id)
    );
    
    if (firstIncomplete) {
      setCurrentStep(firstIncomplete);
    } else {
      // All steps completed
      completeTour();
    }
  }, [progress.enabled, progress.completedSteps, completeTour]);

  // Pause the tour
  const pauseTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(null);
  }, []);

  // Reset tour progress
  const resetTour = useCallback(() => {
    setProgress({
      completedSteps: [],
      skipped: false,
      enabled: true,
      startedAt: new Date()
    });
    setIsActive(true);
    setCurrentStep(TOUR_STEPS[0]);
    localStorage.removeItem(TOUR_STORAGE_KEY);
    localStorage.removeItem(TOUR_SKIPPED_KEY);
    localStorage.setItem(TOUR_ENABLED_KEY, 'true');
  }, []);

  // Check if a step should be triggered based on current route
  const checkRouteTrigger = useCallback((step: TourStep, currentRoute: string): boolean => {
    if (step.trigger !== 'route' || !step.route) return false;
    
    // Check if route matches (supports dynamic segments like :id)
    if (step.route === currentRoute) return true;
    
    // Handle dynamic routes (e.g., /profile/:id)
    if (step.route.includes(':') && currentRoute.includes('/profile/')) {
      const routePattern = step.route.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${routePattern}$`);
      return regex.test(currentRoute);
    }
    
    return false;
  }, []);

  // Check if a step should be triggered based on element visibility
  const checkElementTrigger = useCallback((step: TourStep): boolean => {
    if (step.trigger !== 'element' || !step.target) return false;
    
    try {
      // SIMPLIFIED: Just check if any matching element exists
      const element = document.querySelector(step.target);
      
      // For Step 2, if no element found, check if feed has any content
      if (!element && step.id === 'feed_interactions') {
        // Check if feed has any content at all
        const feedContainer = document.querySelector('.home-feed-container');
        if (!feedContainer) return false;
        
        // Return true if feed exists (element will be found when CoachMark tries to highlight)
        return true;
      }
      
      return !!element; // Just check existence, not visibility
    } catch (error) {
      console.warn('Error checking element trigger:', error);
      return false;
    }
  }, []);

  // Trigger a specific step by ID
  const triggerStep = useCallback((stepId: string) => {
    if (!progress.enabled || !isActive) return;
    
    const step = TOUR_STEPS.find(s => s.id === stepId);
    if (step && !progress.completedSteps.includes(stepId)) {
      setCurrentStep(step);
      return true;
    }
    return false;
  }, [progress.enabled, isActive, progress.completedSteps]);

  // Main function to check and trigger steps based on context
  const checkAndTriggerSteps = useCallback((currentRoute: string) => {
    if (!progress.enabled || !isActive || currentStep) return;
    
    // Find steps that should be triggered now
    const eligibleSteps = TOUR_STEPS.filter(step => {
      // Skip completed steps
      if (progress.completedSteps.includes(step.id)) return false;
      
      // Check trigger conditions
      switch (step.trigger) {
        case 'route':
          return checkRouteTrigger(step, currentRoute);
        case 'element':
          // For element triggers, add a small delay to ensure DOM is ready
          return checkElementTrigger(step);
        case 'delay':
          return false;
        case 'interaction':
          return false;
        default:
          return false;
      }
    });
    
    // Trigger the first eligible step
    if (eligibleSteps.length > 0) {
      // Small delay to ensure smooth transition between steps
      setTimeout(() => {
        setCurrentStep(eligibleSteps[0]);
      }, 300);
    }
  }, [progress.enabled, isActive, currentStep, progress.completedSteps, checkRouteTrigger, checkElementTrigger]);

  // Get progress percentage
  const getProgressPercentage = useCallback(() => {
    if (TOUR_STEPS.length === 0) return 0;
    return Math.round((progress.completedSteps.length / TOUR_STEPS.length) * 100);
  }, [progress.completedSteps]);

  // Check if tour is completed
  const isTourCompleted = useCallback(() => {
    return progress.completedSteps.length === TOUR_STEPS.length;
  }, [progress.completedSteps]);

  // Check if a specific step is completed
  const isStepCompleted = useCallback((stepId: string) => {
    return progress.completedSteps.includes(stepId);
  }, [progress.completedSteps]);

  // Get current step index
  const getCurrentStepIndex = useCallback(() => {
    if (!currentStep) return -1;
    return TOUR_STEPS.findIndex(step => step.id === currentStep.id);
  }, [currentStep]);

  return {
    // State
    progress,
    currentStep,
    isActive,
    steps: TOUR_STEPS,
    
    // Actions
    enableTour,
    skipTour,
    completeTour,
    completeStep,
    goToNextStep,
    goToPrevStep,
    startTour,
    pauseTour,
    resetTour,
    triggerStep,
    checkAndTriggerSteps,
    
    // Getters
    getProgressPercentage,
    isTourCompleted,
    isStepCompleted,
    getCurrentStepIndex,
    
    // Opt-in related
    hasSeenOptIn,
    markOptInSeen,
    
    // Constants
    totalSteps: TOUR_STEPS.length
  };
};

export default useTour;