// src/hooks/useOnboarding.ts - FIXED VERSION
import { useState, useEffect } from 'react';
import { supabase } from '../assets/lib/supabaseClient';

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showOptInModal, setShowOptInModal] = useState(false);
  const [userTourChoice, setUserTourChoice] = useState<'tour' | 'explore' | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isTourActive, setIsTourActive] = useState(false); // ADDED: Track if tour is active

  // Function to check if tour is active (by checking localStorage and DOM)
  const checkIfTourActive = () => {
    const tourChoice = localStorage.getItem('writeframe_tour_choice');
    const tourCompleted = localStorage.getItem('writeframe_tour_completed');
    const tourTrigger = localStorage.getItem('writeframe_tour_trigger');
    
    // Check if tour should be active
    const shouldBeActive = (tourChoice === 'tour' || tourTrigger === 'true') && tourCompleted !== 'true';
    
    // Also check if SequentialTooltip is currently rendering
    const tourTooltip = document.querySelector('[style*="z-index: 9990"]') || 
                       document.querySelector('[style*="z-index: 9991"]');
    
    return shouldBeActive || !!tourTooltip;
  };

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsChecking(false);
          return;
        }

        // Check user's profile for onboarding status
        const { data: profile } = await supabase
          .from('profiles')
          .select('expression, settings')
          .eq('id', user.id)
          .single();

        // Check if user has made a tour choice already
        const hasMadeTourChoice = localStorage.getItem('writeframe_tour_choice');
        
        // Check if tour is currently active
        const tourActive = checkIfTourActive();
        setIsTourActive(tourActive);
        
        // If tour is active, DON'T show onboarding modals
        if (tourActive) {
          console.log('Tour is active, suppressing onboarding modals');
          setShowOnboarding(false);
          setShowOptInModal(false);
          setIsChecking(false);
          return;
        }
        
        // If user just completed expression selection AND hasn't seen getting started
        if (profile?.expression) {
          // Check if user has completed getting started
          const hasCompletedGettingStarted = profile.settings?.completed_getting_started;
          
          if (!hasCompletedGettingStarted) {
            // Wait a moment so the page loads first
            setTimeout(() => {
              // Double-check tour isn't active now
              if (!checkIfTourActive()) {
                setShowOnboarding(true);
              }
            }, 1000);
          }
          // If user has completed getting started but hasn't made tour choice
          else if (!hasMadeTourChoice) {
            // Show opt-in modal after a delay
            setTimeout(() => {
              // Double-check tour isn't active now
              if (!checkIfTourActive()) {
                setShowOptInModal(true);
              }
            }, 500);
          }
        }
        
        // Set user choice if already made
        if (hasMadeTourChoice) {
          setUserTourChoice(hasMadeTourChoice as 'tour' | 'explore');
        }
        
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkOnboardingStatus();
    
    // Set up interval to check for tour activity
    const tourCheckInterval = setInterval(() => {
      const tourActive = checkIfTourActive();
      setIsTourActive(tourActive);
      
      // If tour becomes active while modals are open, close them
      if (tourActive && (showOnboarding || showOptInModal)) {
        console.log('Tour activated, closing onboarding modals');
        setShowOnboarding(false);
        setShowOptInModal(false);
      }
    }, 500); // Check every 500ms
    
    return () => clearInterval(tourCheckInterval);
  }, []);

  const handleComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mark getting started as completed in user's settings
      const { data: profile } = await supabase
        .from('profiles')
        .select('settings')
        .eq('id', user.id)
        .single();

      const currentSettings = profile?.settings || {};
      
      await supabase
        .from('profiles')
        .update({
          settings: {
            ...currentSettings,
            completed_getting_started: true,
            completed_getting_started_at: new Date().toISOString()
          }
        })
        .eq('id', user.id);
      
      setShowOnboarding(false);
      
      // Show opt-in modal after onboarding completes (if tour not active)
      setTimeout(() => {
        if (!checkIfTourActive()) {
          setShowOptInModal(true);
        }
      }, 300);
      
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
      setShowOnboarding(false);
    }
  };

  const handleClose = async () => {
    // Also mark as seen when skipped
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setShowOnboarding(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('settings')
        .eq('id', user.id)
        .single();

      const currentSettings = profile?.settings || {};
      
      await supabase
        .from('profiles')
        .update({
          settings: {
            ...currentSettings,
            completed_getting_started: true,
            completed_getting_started_at: new Date().toISOString()
          }
        })
        .eq('id', user.id);
      
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
      setShowOnboarding(false);
    }
  };

  const handleTourChoice = (choice: 'tour' | 'explore') => {
    localStorage.setItem('writeframe_tour_choice', choice);
    setUserTourChoice(choice);
    setShowOptInModal(false);
    
    if (choice === 'tour') {
      // Set immediate trigger for tour start
      localStorage.setItem('writeframe_tour_trigger', 'true');
      localStorage.removeItem('writeframe_tour_completed'); // Ensure not marked as completed
      console.log('Tour chosen - triggering immediate start');
    } else {
      // If user chooses explore, mark tour as completed (skipped)
      localStorage.setItem('writeframe_tour_completed', 'true');
      localStorage.removeItem('writeframe_tour_trigger'); // Clear any trigger
    }
  };

  const resetTourChoice = () => {
    localStorage.removeItem('writeframe_tour_choice');
    localStorage.removeItem('writeframe_tour_completed');
    localStorage.removeItem('writeframe_tour_trigger');
    localStorage.removeItem('writeframe_tour_current_step');
    setUserTourChoice(null);
    
    // Only show opt-in modal if tour isn't currently active
    if (!checkIfTourActive()) {
      setShowOptInModal(true);
    }
  };

  const getTourStatus = () => {
    const choice = localStorage.getItem('writeframe_tour_choice');
    const completed = localStorage.getItem('writeframe_tour_completed');
    const trigger = localStorage.getItem('writeframe_tour_trigger');
    
    return {
      hasChosenTour: choice === 'tour',
      hasChosenExplore: choice === 'explore',
      hasCompletedTour: completed === 'true',
      isTourTriggered: trigger === 'true',
      canReplayTour: choice === 'explore' || completed === 'true',
      isTourActive: checkIfTourActive()
    };
  };

  // Function to manually start tour (for testing/debugging)
  const manuallyStartTour = () => {
    localStorage.setItem('writeframe_tour_choice', 'tour');
    localStorage.setItem('writeframe_tour_trigger', 'true');
    localStorage.removeItem('writeframe_tour_completed');
    localStorage.removeItem('writeframe_tour_current_step');
    
    // Close any open modals
    setShowOnboarding(false);
    setShowOptInModal(false);
    
    console.log('Manually starting tour');
  };

  return {
    // Modal states
    showOnboarding,
    showOptInModal,
    isChecking,
    isTourActive, // ADDED: Export tour active state
    
    // User choice
    userTourChoice,
    
    // Handlers
    handleComplete,
    handleClose,
    handleTourChoice,
    resetTourChoice,
    manuallyStartTour, // ADDED: For testing
    
    // Status
    getTourStatus,
    checkIfTourActive // ADDED: Export check function
  };
};