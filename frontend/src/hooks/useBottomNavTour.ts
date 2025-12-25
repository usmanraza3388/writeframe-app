// hooks/useBottomNavTour.ts
import { useState, useEffect, useCallback } from 'react';

export const useBottomNavTour = () => {
  // Step state: 0 = home, 1 = whispers, 2 = create, 3 = profile, -1 = inactive
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Check if tour should start
  useEffect(() => {
    // Don't run multiple times
    if (isInitialized) return;
    
    // Check localStorage for completion
    const tourCompleted = localStorage.getItem('writeframe_bottomnav_tour_completed');
    
    // Check if user just completed GettingStartedModal
    const modalCompleted = localStorage.getItem('writeframe_onboarding_complete');
    
    // Only start if:
    // 1. Modal was just completed (first time)
    // 2. Tour hasn't been completed before
    // 3. User is on a page with BottomNav (we'll handle this in component)
    if (modalCompleted === 'true' && !tourCompleted) {
      // Wait a moment for UI to settle, then start
      const timer = setTimeout(() => {
        setCurrentStep(0);
        setIsActive(true);
        setIsInitialized(true);
      }, 1500); // 1.5 second delay after modal
      
      return () => clearTimeout(timer);
    } else {
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Step navigation
  const nextStep = useCallback(() => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Tour complete
      completeTour();
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(-1);
    localStorage.setItem('writeframe_bottomnav_tour_completed', 'true');
  }, []);

  const completeTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(-1);
    localStorage.setItem('writeframe_bottomnav_tour_completed', 'true');
  }, []);

  // Manual start (for testing or help menu)
  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  // Check if tour is completed
  const isTourCompleted = useCallback(() => {
    return localStorage.getItem('writeframe_bottomnav_tour_completed') === 'true';
  }, []);

  // Step data - matches your data-tour attributes
  const steps = [
    {
      id: 'home',
      selector: '[data-tour="home-button"]',
      title: 'Home Feed',
      description: 'See the latest scenes, monologues, and frames from the community.',
      position: 'top' as const
    },
    {
      id: 'whispers',
      selector: '[data-tour="whispers-button"]',
      title: 'Whispers',
      description: 'Private messages for feedback and collaboration with other creators.',
      position: 'top' as const
    },
    {
      id: 'create',
      selector: '[data-tour="create-button"]',
      title: 'Create',
      description: 'Start new scenes, monologues, characters, or visual frames.',
      position: 'top' as const
    },
    {
      id: 'profile',
      selector: '[data-tour="profile-button"]',
      title: 'Your Profile',
      description: 'Manage your portfolio, settings, and creative identity.',
      position: 'top' as const
    }
  ];

  return {
    // State
    currentStep,
    isActive,
    
    // Steps data
    steps,
    currentStepData: currentStep >= 0 ? steps[currentStep] : null,
    totalSteps: steps.length,
    
    // Actions
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    startTour,
    
    // Info
    isTourCompleted,
    isInitialized
  };
};