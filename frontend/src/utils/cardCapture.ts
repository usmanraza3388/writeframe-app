import html2canvas from 'html2canvas';

export interface CaptureOptions {
  elementId: string;
  fileName: string;
  quality?: number;
}

export const captureCardAsImage = async ({
  elementId,
  fileName,
  quality = 1
}: CaptureOptions): Promise<boolean> => {
  try {
    const element = document.getElementById(elementId);
    
    if (!element) {
      console.error(`Element with id "${elementId}" not found`);
      return false;
    }

    // Capture the card as canvas - USE ONLY VALID OPTIONS
    const canvas = await html2canvas(element, {
      // Remove all problematic options, use minimal config
      useCORS: true
    });

    // Convert canvas to blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/png',
        quality
      );
    });

    if (!blob) {
      throw new Error('Failed to create image blob');
    }

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.png`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error capturing card as image:', error);
    return false;
  }
};

// Helper function to generate filename based on content
export const generateFileName = (
  contentType: 'scene' | 'monologue' | 'character' | 'frame',
  title: string,
  creatorName: string
): string => {
  const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  const sanitizedCreator = creatorName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  
  return `writeframe-${contentType}-${sanitizedTitle}-by-${sanitizedCreator}`;
};