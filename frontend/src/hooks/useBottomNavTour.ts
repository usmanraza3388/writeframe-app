// hooks/useBottomNavTour.ts
import { useState, useEffect, useCallback, useRef } from 'react';

export const useBottomNavTour = () => {
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [hasTourRun, setHasTourRun] = useState<boolean>(false);
  
  // Use refs to track event listener state
  const eventListenerAdded = useRef(false);
  const isTourActiveRef = useRef(false);

  // Update ref when isActive changes
  useEffect(() => {
    isTourActiveRef.current = isActive;
  }, [isActive]);

  // Single effect for tour initialization and cleanup
  useEffect(() => {
    // Check if tour was already completed
    const tourCompleted = localStorage.getItem('writeframe_bottomnav_tour_completed');
    
    if (tourCompleted === 'true') {
      setHasTourRun(true);
      return; // Don't run tour if already completed
    }

    // Handle custom event for delayed tour start
    const handleTourStartEvent = () => {
      // Prevent multiple tour starts
      if (isTourActiveRef.current || hasTourRun) {
        return;
      }

      console.log('🎯 Tour start event received, starting tour...');
      
      // Small additional delay to ensure UI is ready
      setTimeout(() => {
        setCurrentStep(0);
        setIsActive(true);
        setHasTourRun(true);
        
        // Ensure tour overlay appears above everything
        console.log('🎯 Tour is now active at step 0');
      }, 100);
    };

    // Listen for storage changes (backup mechanism)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'writeframe_onboarding_complete' && e.newValue === 'true') {
        // Don't auto-start from storage, wait for custom event
        console.log('📝 Onboarding complete detected via storage, waiting for event...');
      }
    };

    // Add event listeners only once
    if (!eventListenerAdded.current) {
      console.log('🎯 Setting up tour event listeners...');
      
      // Listen for custom event from HomeFeed
      window.addEventListener('tour-should-start', handleTourStartEvent);
      
      // Backup: listen for storage events
      window.addEventListener('storage', handleStorageChange);
      
      eventListenerAdded.current = true;
      
      // Also check if event was already dispatched before listener was added
      // This handles the case where modal completes very quickly
      setTimeout(() => {
        const modalCompleted = localStorage.getItem('writeframe_onboarding_complete');
        if (modalCompleted === 'true' && !tourCompleted && !isTourActiveRef.current) {
          console.log('📝 Modal already completed, checking for tour eligibility...');
          // Don't auto-start, wait for custom event or user action
        }
      }, 1000);
    }

    // Cleanup function
    return () => {
      if (eventListenerAdded.current) {
        window.removeEventListener('tour-should-start', handleTourStartEvent);
        window.removeEventListener('storage', handleStorageChange);
        eventListenerAdded.current = false;
      }
    };
  }, [hasTourRun]);

  // Manual tour restart function (for debugging)
  const restartTour = useCallback(() => {
    localStorage.removeItem('writeframe_bottomnav_tour_completed');
    setCurrentStep(0);
    setIsActive(true);
    setHasTourRun(false);
    console.log('🔄 Tour manually restarted');
  }, []);

  // Step navigation
  const nextStep = useCallback(() => {
    if (currentStep < 3) {
      setCurrentStep(prev => {
        const newStep = prev + 1;
        console.log(`➡️ Moving to step ${newStep}`);
        return newStep;
      });
    } else {
      completeTour();
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => {
        const newStep = prev - 1;
        console.log(`⬅️ Moving back to step ${newStep}`);
        return newStep;
      });
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    console.log('⏭️ Skipping tour');
    setIsActive(false);
    setCurrentStep(-1);
    localStorage.setItem('writeframe_bottomnav_tour_completed', 'true');
  }, []);

  const completeTour = useCallback(() => {
    console.log('✅ Tour completed');
    setIsActive(false);
    setCurrentStep(-1);
    localStorage.setItem('writeframe_bottomnav_tour_completed', 'true');
  }, []);

  // Tour step definitions
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
    completeTour,
    restartTour, // Added for debugging
    hasTourRun
  };
};