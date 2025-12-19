// src/hooks/useOnboarding.ts
import { useState, useEffect } from 'react';
import { supabase } from '../assets/lib/supabaseClient';

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
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

        // If user just completed expression selection AND hasn't seen getting started
        // We'll check a custom field in settings or use expression as trigger
        if (profile?.expression) {
          // Check if user has completed getting started
          const hasCompletedGettingStarted = profile.settings?.completed_getting_started;
          
          if (!hasCompletedGettingStarted) {
            // Wait a moment so the page loads first
            setTimeout(() => {
              setShowOnboarding(true);
            }, 1000);
          }
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
      
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
      setShowOnboarding(false);
    }
  };

  const handleClose = async () => {
    // Also mark as seen when skipped
    await handleComplete();
  };

  return {
    showOnboarding,
    isChecking,
    handleComplete,
    handleClose
  };
};