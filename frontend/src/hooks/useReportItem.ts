import { useCallback } from 'react';
import { supabase } from '../assets/lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export const useReportItem = () => {
  const { user } = useAuth();

  const reportItem = useCallback(async (contentType: string, contentId: string, reason: string) => {
    if (!user) {
      alert('You must be logged in to report content.');
      return false;
    }

    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          content_type: contentType,
          content_id: contentId,
          reason: reason,
          status: 'pending'
        })
        .select();

      if (error) throw error;

      alert('Thank you for your report. We will review this content shortly.');
      return true;
    } catch (error) {
      console.error('Report submission failed:', error);
      alert('Failed to submit report. Please try again.');
      return false;
    }
  }, [user]);

  return { reportItem };
};