import { useState, useEffect, useCallback, useRef } from 'react';

export const useHomeFeedTour = () => {
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

  // HomeFeed tour step definitions - based on your HomeFeed.tsx structure
  const steps = [
    {
      id: 'feed-welcome',
      selector: '[data-tour="feed-header"]',
      title: 'Welcome to Your Creative Feed',
      description: 'This is your home feed where cinematic creations are shared and discovered.',
      position: 'bottom' as 'top' | 'bottom'
    },
    {
      id: 'scene-cards',
      selector: '[data-tour="feed-scene-card"]',
      title: 'Scene Cards',
      description: 'Professional screenplay scenes with industry-standard formatting and narrative structure.',
      position: 'bottom' as 'top' | 'bottom'
    },
    {
      id: 'monologue-cards',
      selector: '[data-tour="feed-monologue-card"]',
      title: 'Monologue Cards',
      description: 'Character voice development with emotional tone analysis and prose refinement.',
      position: 'bottom' as 'top' | 'bottom'
    },
    {
      id: 'character-cards',
      selector: '[data-tour="feed-character-card"]',
      title: 'Character Cards',
      description: 'Persona building with visual reference galleries and backstory development.',
      position: 'bottom' as 'top' | 'bottom'
    },
    {
      id: 'frame-cards',
      selector: '[data-tour="feed-frame-card"]',
      title: 'Frame Cards',
      description: 'Visual narrative curation with collage composition and mood board creation.',
      position: 'bottom' as 'top' | 'bottom'
    },
    {
      id: 'card-actions',
      selector: '[data-tour="card-actions-menu"]',
      title: 'Card Actions',
      description: 'Edit, delete, or view original creations. Repost content you admire from other creators.',
      position: 'top' as 'top' | 'bottom'
    },
    {
      id: 'infinite-scroll',
      selector: '[data-tour="feed-loading-area"]',
      title: 'Discover More Content',
      description: 'Scroll down to automatically load more content. Pull down to refresh with latest creations.',
      position: 'top' as 'top' | 'bottom'
    }
  ];

  // Helper function to find tour elements
  const findStepElement = useCallback((stepIndex: number): HTMLElement | null => {
    if (stepIndex < 0 || stepIndex >= steps.length) return null;
    
    const selector = steps[stepIndex].selector;
    const element = document.querySelector(selector);
    
    if (!element) {
      console.warn(`Tour element not found: ${selector} for step ${stepIndex}`);
      return null;
    }
    
    return element as HTMLElement;
  }, [steps]);

  // Skip and complete functions - defined first
  const skipTour = useCallback(() => {
    console.log('⏭️ Skipping homefeed tour');
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

  // Step navigation with fallback for missing elements
  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      // Try to find next element
      const nextElement = findStepElement(currentStep + 1);
      
      if (nextElement) {
        setCurrentStep(prev => {
          const newStep = prev + 1;
          console.log(`➡️ Moving to homefeed step ${newStep}`);
          return newStep;
        });
      } else {
        // Element not found - skip to next available step
        console.log(`⏭️ Element for step ${currentStep + 1} not found, skipping...`);
        
        // Find next available step
        for (let i = currentStep + 2; i < steps.length; i++) {
          if (findStepElement(i)) {
            setCurrentStep(i);
            return;
          }
        }
        
        // If no more elements found, complete tour
        console.log('✅ No more tour elements found, completing tour');
        completeTour();
      }
    } else {
      completeTour();
    }
  }, [currentStep, steps.length, findStepElement, completeTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      // Try to find previous element
      const prevElement = findStepElement(currentStep - 1);
      
      if (prevElement) {
        setCurrentStep(prev => {
          const newStep = prev - 1;
          console.log(`⬅️ Moving back to homefeed step ${newStep}`);
          return newStep;
        });
      } else {
        // Element not found - go back to previous available step
        console.log(`⏮️ Element for step ${currentStep - 1} not found, finding previous...`);
        
        for (let i = currentStep - 2; i >= 0; i--) {
          if (findStepElement(i)) {
            setCurrentStep(i);
            return;
          }
        }
        
        // If no previous elements found, skip tour (can't go back)
        console.log('⚠️ No previous tour elements found, skipping tour');
        skipTour();
      }
    }
  }, [currentStep, findStepElement, skipTour]);

  // Single effect for tour initialization and cleanup
  useEffect(() => {
    // Check if homefeed tour was already completed
    const homefeedTourCompleted = localStorage.getItem('writeframe_homefeed_tour_completed');
    
    if (homefeedTourCompleted === 'true') {
      setHasTourRun(true);
      return; // Don't run tour if already completed
    }

    // Check if bottomnav tour was completed (prerequisite)
    const bottomnavTourCompleted = localStorage.getItem('writeframe_bottomnav_tour_completed');
    
    if (bottomnavTourCompleted !== 'true') {
      return; // Don't run homefeed tour until bottomnav tour is done
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

    // Add event listeners only once
    if (!eventListenerAdded.current) {
      console.log('🎯 Setting up homefeed tour event listeners...');
      
      // Listen for custom event
      window.addEventListener('homefeed-tour-should-start', handleHomeFeedTourStart);
      
      eventListenerAdded.current = true;
    }

    // Cleanup function
    return () => {
      if (eventListenerAdded.current) {
        window.removeEventListener('homefeed-tour-should-start', handleHomeFeedTourStart);
        eventListenerAdded.current = false;
      }
    };
  }, [hasTourRun]);

  // Manual tour restart function (for debugging/testing)
  const restartTour = useCallback(() => {
    localStorage.removeItem('writeframe_homefeed_tour_completed');
    setCurrentStep(0);
    setIsActive(true);
    setHasTourRun(false);
    console.log('🔄 HomeFeed tour manually restarted');
  }, []);

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