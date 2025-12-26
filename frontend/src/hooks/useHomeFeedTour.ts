// src/hooks/useHomeFeedTour.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const useHomeFeedTour = () => {
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [hasTourRun, setHasTourRun] = useState<boolean>(false);
  
  const location = useLocation();
  const isOnHomeFeed = location.pathname === '/home-feed';
  
  // Use refs to track event listener state
  const eventListenerAdded = useRef(false);
  const isTourActiveRef = useRef(false);

  // Update ref when isActive changes
  useEffect(() => {
    isTourActiveRef.current = isActive;
  }, [isActive]);

  // Single effect for tour initialization and cleanup
  useEffect(() => {
    // Check if we're on HomeFeed page
    if (!isOnHomeFeed) {
      // Reset tour state if user navigates away
      if (isActive) {
        setIsActive(false);
        setCurrentStep(-1);
      }
      return;
    }

    // Check if homefeed tour was already completed
    const homefeedTourCompleted = localStorage.getItem('writeframe_homefeed_tour_completed');
    
    if (homefeedTourCompleted === 'true') {
      setHasTourRun(true);
      return; // Don't run tour if already completed
    }

    // Check if BottomNav tour is active - don't interrupt it
    const bottomNavTourCompleted = localStorage.getItem('writeframe_bottomnav_tour_completed');
    const onboardingComplete = localStorage.getItem('writeframe_onboarding_complete');
    
    // Don't start if BottomNav tour is still active and not completed
    if (onboardingComplete === 'true' && bottomNavTourCompleted !== 'true') {
      console.log('⏳ HomeFeed tour waiting: BottomNav tour not completed yet');
      return;
    }

    // Handle custom event for homefeed tour start
    const handleHomeFeedTourStart = () => {
      // Prevent multiple tour starts
      if (isTourActiveRef.current || hasTourRun) {
        return;
      }

      console.log('🎯 HomeFeed tour start event received, starting homefeed tour...');
      
      // Small additional delay to ensure UI is ready
      setTimeout(() => {
        setCurrentStep(0);
        setIsActive(true);
        setHasTourRun(true);
        
        console.log('🎯 HomeFeed tour is now active at step 0');
      }, 100);
    };

    // Auto-start after checking conditions
    const shouldAutoStart = () => {
      return onboardingComplete === 'true' && 
             bottomNavTourCompleted === 'true' && 
             homefeedTourCompleted !== 'true';
    };

    // Add event listeners only once
    if (!eventListenerAdded.current) {
      console.log('🎯 Setting up HomeFeed tour event listeners...');
      
      // Listen for custom event
      window.addEventListener('homefeed-tour-should-start', handleHomeFeedTourStart);
      
      eventListenerAdded.current = true;
    }

    // Auto-start if conditions are met
    if (shouldAutoStart() && !isTourActiveRef.current && !hasTourRun) {
      console.log('🚀 Auto-starting HomeFeed tour (conditions met)');
      handleHomeFeedTourStart();
    }

    // Cleanup function
    return () => {
      if (eventListenerAdded.current) {
        window.removeEventListener('homefeed-tour-should-start', handleHomeFeedTourStart);
        eventListenerAdded.current = false;
      }
    };
  }, [isOnHomeFeed, hasTourRun, isActive]);

  // Step navigation
  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => {
        const newStep = prev + 1;
        console.log(`➡️ Moving to homefeed step ${newStep}`);
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
        console.log(`⬅️ Moving back to homefeed step ${newStep}`);
        return newStep;
      });
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    console.log('⏭️ Skipping HomeFeed tour');
    setIsActive(false);
    setCurrentStep(-1);
    localStorage.setItem('writeframe_homefeed_tour_completed', 'true');
  }, []);

  const completeTour = useCallback(() => {
    console.log('✅ HomeFeed tour completed');
    setIsActive(false);
    setCurrentStep(-1);
    localStorage.setItem('writeframe_homefeed_tour_completed', 'true');
  }, []);

  // Manual tour restart function (for debugging/testing)
  const restartTour = useCallback(() => {
    localStorage.removeItem('writeframe_homefeed_tour_completed');
    setCurrentStep(0);
    setIsActive(true);
    setHasTourRun(false);
    console.log('🔄 HomeFeed tour manually restarted');
  }, []);

  // HomeFeed tour step definitions - UPDATED: 5 steps (removed create button step)
  const steps = [
    {
      id: 'feed-header',
      selector: '[data-tour="feed-header"]',
      title: 'Your Creative Feed',
      description: 'Welcome to your creative feed! Discover scenes, monologues, characters, and frames from creators worldwide.',
      position: 'bottom' as 'top' | 'bottom'
    },
    {
      id: 'scene-card',
      selector: '[data-tour="scene-card"]',
      title: 'Cinematic Scenes',
      description: 'Browse professional-grade screenplay scenes. Click to read, edit, or create remakes to build upon existing work.',
      position: 'top' as 'top' | 'bottom'
    },
    {
      id: 'monologue-card',
      selector: '[data-tour="monologue-card"]',
      title: 'Character Monologues',
      description: 'Explore character voices and emotional narratives. Monologues showcase inner thoughts and dramatic prose.',
      position: 'top' as 'top' | 'bottom'
    },
    {
      id: 'character-card',
      selector: '[data-tour="character-card"]',
      title: 'Character Profiles',
      description: 'Discover rich character personas with visual references and backstories. Perfect for building ensemble casts.',
      position: 'top' as 'top' | 'bottom'
    },
    {
      id: 'frame-card',
      selector: '[data-tour="frame-card"]',
      title: 'Visual Frames',
      description: 'Curated visual inspiration and mood boards. Frames help visualize scenes, characters, and cinematic tones.',
      position: 'top' as 'top' | 'bottom'
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