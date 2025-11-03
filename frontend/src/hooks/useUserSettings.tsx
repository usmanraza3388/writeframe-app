// src/hooks/useUserSettings.ts
import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../assets/lib/supabaseClient';

export const useUserSettings = () => {
  const { user } = useAuth();
  const { setTheme } = useTheme();

  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('settings')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading user settings:', error);
          return;
        }

        // Load saved theme from settings
        if (data?.settings?.theme) {
          setTheme(data.settings.theme);
        }
      } catch (error) {
        console.error('Error in useUserSettings:', error);
      }
    };

    loadUserSettings();
  }, [user, setTheme]);
};