// hooks/useCopyLink.ts
import { useCallback } from 'react';
// We'll assume you have a toast system - if not, I'll create a simple one

export const useCopyLink = () => {
  const copyLink = useCallback(async (type: string, id: string) => {
    const url = `${window.location.origin}/home-feed#${type}-${id}`;
    
    try {
      await navigator.clipboard.writeText(url);
      // Show success feedback - we'll use alert for now, can upgrade to toast later
      alert('Link copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Link copied to clipboard!');
      } catch (fallbackErr) {
        alert('Failed to copy link. Please copy the URL manually.');
      }
      document.body.removeChild(textArea);
    }
  }, []);

  return { copyLink };
};