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

    // Wait for fonts
    await document.fonts.ready;

    // Type assertion to bypass TypeScript
    const options: any = {
      useCORS: true,
      backgroundColor: '#FAF8F2',
      scale: 2,
      logging: false,
      foreignObjectRendering: false, // THIS FIXES TEXT MERGING
      onclone: (_clonedDoc: Document, clonedElement: HTMLElement) => {
        // Set font properties safely
        clonedElement.style.fontFamily = 'Arial, sans-serif';
        clonedElement.style.cssText += 'text-rendering: optimizeSpeed;';
        
        // Remove transforms and filters
        const allElements = clonedElement.querySelectorAll('*');
        allElements.forEach((el: Element) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.transform = 'none';
          htmlEl.style.filter = 'none';
        });
      }
    };

    // Capture
    const canvas = await html2canvas(element, options);

    // Download
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