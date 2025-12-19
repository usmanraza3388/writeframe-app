// src/hooks/useOnboarding.ts - FIXED TOUR TRIGGER
import { useState, useEffect } from 'react';
import { supabase } from '../assets/lib/supabaseClient';

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showOptInModal, setShowOptInModal] = useState(false);
  const [userTourChoice, setUserTourChoice] = useState<'tour' | 'explore' | null>(null);
  const [isChecking, setIsChecking] = useState(true);

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
        
        // If user just completed expression selection AND hasn't seen getting started
        if (profile?.expression) {
          // Check if user has completed getting started
          const hasCompletedGettingStarted = profile.settings?.completed_getting_started;
          
          if (!hasCompletedGettingStarted) {
            // Wait a moment so the page loads first
            setTimeout(() => {
              setShowOnboarding(true);
            }, 1000);
          }
          // If user has completed getting started but hasn't made tour choice
          else if (!hasMadeTourChoice) {
            // Show opt-in modal after a delay
            setTimeout(() => {
              setShowOptInModal(true);
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
      
      // Show opt-in modal after onboarding completes
      setTimeout(() => {
        setShowOptInModal(true);
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
    // Clear ALL previous tour state
    localStorage.removeItem('writeframe_tour_completed');
    localStorage.removeItem('writeframe_tour_current_step');
    
    if (choice === 'tour') {
      // Set tour as chosen and NOT completed
      localStorage.setItem('writeframe_tour_choice', 'tour');
      localStorage.setItem('writeframe_tour_start_immediately', 'true'); // NEW: Immediate start flag
      console.log('Tour chosen - setting immediate start flag');
      
      // Force page reload to trigger tour start
      setTimeout(() => {
        window.location.reload();
      }, 300);
    } else {
      // If user chooses explore, mark tour as completed (skipped)
      localStorage.setItem('writeframe_tour_choice', 'explore');
      localStorage.setItem('writeframe_tour_completed', 'true');
      console.log('Explore chosen - marking tour as completed');
    }
    
    setUserTourChoice(choice);
    setShowOptInModal(false);
  };

  const resetTourChoice = () => {
    localStorage.removeItem('writeframe_tour_choice');
    localStorage.removeItem('writeframe_tour_completed');
    localStorage.removeItem('writeframe_tour_current_step');
    localStorage.removeItem('writeframe_tour_start_immediately');
    setUserTourChoice(null);
    setShowOptInModal(true);
  };

  const getTourStatus = () => {
    const choice = localStorage.getItem('writeframe_tour_choice');
    const completed = localStorage.getItem('writeframe_tour_completed');
    const immediateStart = localStorage.getItem('writeframe_tour_start_immediately');
    
    return {
      hasChosenTour: choice === 'tour',
      hasChosenExplore: choice === 'explore',
      hasCompletedTour: completed === 'true',
      shouldStartImmediately: immediateStart === 'true',
      canReplayTour: choice === 'explore' || completed === 'true'
    };
  };

  // Function to manually start tour (for testing/debugging)
  const manuallyStartTour = () => {
    localStorage.setItem('writeframe_tour_choice', 'tour');
    localStorage.setItem('writeframe_tour_start_immediately', 'true');
    localStorage.removeItem('writeframe_tour_completed');
    localStorage.removeItem('writeframe_tour_current_step');
    
    // Close any open modals
    setShowOnboarding(false);
    setShowOptInModal(false);
    
    // Force reload
    setTimeout(() => {
      window.location.reload();
    }, 300);
    
    console.log('Manually starting tour');
  };

  return {
    // Modal states
    showOnboarding,
    showOptInModal,
    isChecking,
    
    // User choice
    userTourChoice,
    
    // Handlers
    handleComplete,
    handleClose,
    handleTourChoice,
    resetTourChoice,
    manuallyStartTour,
    
    // Status
    getTourStatus
  };
};