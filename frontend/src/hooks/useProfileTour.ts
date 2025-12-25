// src/hooks/useProfileTour.ts
import { useState, useEffect, useCallback, useRef } from 'react';

export const useProfileTour = () => {
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
    // Check if profile tour was already completed
    const profileTourCompleted = localStorage.getItem('writeframe_profile_tour_completed');
    
    if (profileTourCompleted === 'true') {
      setHasTourRun(true);
      return; // Don't run tour if already completed
    }

    // Handle custom event for profile tour start
    const handleProfileTourStart = () => {
      // Prevent multiple tour starts
      if (isTourActiveRef.current || hasTourRun) {
        return;
      }

      console.log('🎯 Profile tour start event received, starting profile tour...');
      
      // Small additional delay to ensure UI is ready
      setTimeout(() => {
        setCurrentStep(0);
        setIsActive(true);
        setHasTourRun(true);
        
        console.log('🎯 Profile tour is now active at step 0');
      }, 100);
    };

    // Add event listeners only once
    if (!eventListenerAdded.current) {
      console.log('🎯 Setting up profile tour event listeners...');
      
      // Listen for custom event
      window.addEventListener('profile-tour-should-start', handleProfileTourStart);
      
      eventListenerAdded.current = true;
    }

    // Cleanup function
    return () => {
      if (eventListenerAdded.current) {
        window.removeEventListener('profile-tour-should-start', handleProfileTourStart);
        eventListenerAdded.current = false;
      }
    };
  }, [hasTourRun]);

  // Step navigation
  const nextStep = useCallback(() => {
    if (currentStep < 3) { // 4 steps total (0-3)
      setCurrentStep(prev => {
        const newStep = prev + 1;
        console.log(`➡️ Moving to profile step ${newStep}`);
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
        console.log(`⬅️ Moving back to profile step ${newStep}`);
        return newStep;
      });
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    console.log('⏭️ Skipping profile tour');
    setIsActive(false);
    setCurrentStep(-1);
    localStorage.setItem('writeframe_profile_tour_completed', 'true');
  }, []);

  const completeTour = useCallback(() => {
    console.log('✅ Profile tour completed');
    setIsActive(false);
    setCurrentStep(-1);
    localStorage.setItem('writeframe_profile_tour_completed', 'true');
  }, []);

  // Manual tour restart function (for debugging/testing)
  const restartTour = useCallback(() => {
    localStorage.removeItem('writeframe_profile_tour_completed');
    setCurrentStep(0);
    setIsActive(true);
    setHasTourRun(false);
    console.log('🔄 Profile tour manually restarted');
  }, []);

  // Profile tour step definitions - based on your Profile.tsx structure
  const steps = [
    {
      id: 'profile-header',
      selector: '[data-tour="profile-header"]',
      title: 'Your Creative Identity',
      description: 'This is your public profile where other creators can discover your work and style.',
      position: 'bottom' as 'top' | 'bottom' // FIXED: Added union type
    },
    {
      id: 'portfolio-tabs',
      selector: '[data-tour="portfolio-tabs"]',
      title: 'Portfolio Tabs',
      description: 'Switch between your scenes, monologues, characters, and frames to showcase different aspects of your creativity.',
      position: 'bottom' as 'top' | 'bottom' // FIXED: Added union type
    },
    {
      id: 'stats-section',
      selector: '[data-tour="stats-section"]',
      title: 'Track Your Progress',
      description: 'See your creative metrics: followers, creations, and engagement.',
      position: 'top' as 'top' | 'bottom' // FIXED: Added union type
    },
    {
      id: 'edit-profile',
      selector: '[data-tour="edit-profile-button"]',
      title: 'Customize Your Presence',
      description: 'Update your bio, profile picture, and creative preferences to reflect your evolving style.',
      position: 'top' as 'top' | 'bottom' // FIXED: Added union type
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
    restartTour,
    hasTourRun
  };
};