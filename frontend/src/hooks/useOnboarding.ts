// src/hooks/useOnboarding.ts
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
    localStorage.setItem('writeframe_tour_choice', choice);
    localStorage.setItem('writeframe_tour_available', 'true');
    setUserTourChoice(choice);
    setShowOptInModal(false);
    
    // If user chooses explore, mark tour as completed (skipped)
    if (choice === 'explore') {
      localStorage.setItem('writeframe_tour_completed', 'true');
    }
  };

  const resetTourChoice = () => {
    localStorage.removeItem('writeframe_tour_choice');
    localStorage.removeItem('writeframe_tour_completed');
    setUserTourChoice(null);
    setShowOptInModal(true); // Show opt-in modal again
  };

  const getTourStatus = () => {
    const choice = localStorage.getItem('writeframe_tour_choice');
    const completed = localStorage.getItem('writeframe_tour_completed');
    
    return {
      hasChosenTour: choice === 'tour',
      hasChosenExplore: choice === 'explore',
      hasCompletedTour: completed === 'true',
      canReplayTour: choice === 'explore' || completed === 'true'
    };
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
    
    // Status
    getTourStatus
  };
};