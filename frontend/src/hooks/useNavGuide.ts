// hooks/useNavGuide.ts
import { useEffect, useState } from 'react';
import { supabase } from '../assets/lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export const useNavGuide = () => {
  const { user } = useAuth();
  const [navGuideSeen, setNavGuideSeen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkNavGuide = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('tour_status')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching tour status:', error);
          setNavGuideSeen(false);
        } else {
          // Check if tour_status is 'nav_completed'
          const hasSeenNavGuide = data?.tour_status === 'nav_completed';
          setNavGuideSeen(hasSeenNavGuide);
        }
      } catch (error) {
        console.error('Error in nav guide check:', error);
        setNavGuideSeen(false);
      } finally {
        setLoading(false);
      }
    };

    checkNavGuide();
  }, [user]);

  const markNavGuideSeen = async () => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          tour_status: 'nav_completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error marking nav guide:', error);
        return false;
      }

      setNavGuideSeen(true);
      return true;
    } catch (error) {
      console.error('Error in markNavGuideSeen:', error);
      return false;
    }
  };

  return { navGuideSeen, loading, markNavGuideSeen };
};