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

    await document.fonts.ready;

    // Use type assertion to bypass TypeScript errors
    const options: any = {
      useCORS: true,
      backgroundColor: '#FAF8F2',
      scale: 2,
      letterRendering: true
    };

    const canvas = await html2canvas(element, options);

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

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.png`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error capturing card as image:', error);
    return false;
  }
};

export const generateFileName = (
  contentType: 'scene' | 'monologue' | 'character' | 'frame',
  title: string,
  creatorName: string
): string => {
  const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  const sanitizedCreator = creatorName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  
  return `writeframe-${contentType}-${sanitizedTitle}-by-${sanitizedCreator}`;
};