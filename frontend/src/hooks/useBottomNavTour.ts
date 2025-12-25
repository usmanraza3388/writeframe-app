// hooks/useBottomNavTour.ts
import { useState, useEffect, useCallback } from 'react';

export const useBottomNavTour = () => {
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isActive, setIsActive] = useState<boolean>(false);

  // CONSTANTLY check for tour conditions (not just on mount)
  useEffect(() => {
    const checkAndStartTour = () => {
      const tourCompleted = localStorage.getItem('writeframe_bottomnav_tour_completed');
      const modalCompleted = localStorage.getItem('writeframe_onboarding_complete');
      
      // Debug logging
      console.log('Tour check:', {
        modalCompleted,
        tourCompleted,
        shouldStart: modalCompleted === 'true' && !tourCompleted
      });
      
      if (modalCompleted === 'true' && !tourCompleted && !isActive) {
        console.log('Starting tour...');
        // Small delay to ensure UI is ready
        setTimeout(() => {
          setCurrentStep(0);
          setIsActive(true);
        }, 500);
      }
    };

    // Check immediately
    checkAndStartTour();
    
    // Check every second for the first 10 seconds after component mounts
    // (in case modal completes after hook initializes)
    const interval = setInterval(checkAndStartTour, 1000);
    
    // Also listen for storage events (if modal sets localStorage from another component)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'writeframe_onboarding_complete' && e.newValue === 'true') {
        checkAndStartTour();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isActive]);

  // Rest of the hook remains the same...
  const nextStep = useCallback(() => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
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
    currentStep,
    isActive,
    steps,
    currentStepData: currentStep >= 0 ? steps[currentStep] : null,
    totalSteps: steps.length,
    nextStep,
    prevStep,
    skipTour,
    completeTour
  };
};