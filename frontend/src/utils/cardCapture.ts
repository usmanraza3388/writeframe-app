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

    // Store original styles
    const originalStyles = {
      position: element.style.position,
      top: element.style.top,
      left: element.style.left,
      zIndex: element.style.zIndex,
      transform: element.style.transform,
      margin: element.style.margin,
      boxShadow: element.style.boxShadow,
      visibility: element.style.visibility
    };

    // Hide scrollbars and freeze
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Position element for clean capture
    const rect = element.getBoundingClientRect();
    element.style.position = 'fixed';
    element.style.top = `${rect.top}px`;
    element.style.left = `${rect.left}px`;
    element.style.zIndex = '99999';
    element.style.transform = 'none';
    element.style.margin = '0';
    element.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
    element.style.visibility = 'visible';

    // Wait for fonts and images
    await Promise.all([
      document.fonts.ready,
      ...Array.from(element.querySelectorAll('img'))
        .filter(img => !img.complete)
        .map(img => new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        }))
    ]);

    // Force reflow
    element.offsetHeight;

    // Capture with valid options only
    const canvas = await html2canvas(element, {
      useCORS: true,
      logging: false,
      width: element.offsetWidth,
      height: element.offsetHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0
    });

    // Restore original styles immediately
    Object.assign(element.style, originalStyles);
    document.body.style.overflow = originalBodyOverflow;
    document.documentElement.style.overflow = originalHtmlOverflow;

    // Create final canvas with proper background
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height;
    const ctx = finalCanvas.getContext('2d');
    
    if (ctx) {
      // Match your card's exact background color
      ctx.fillStyle = '#FAF8F2';
      ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
      ctx.drawImage(canvas, 0, 0);
    }

    // Download
    return new Promise((resolve) => {
      finalCanvas.toBlob((blob) => {
        if (!blob) {
          resolve(false);
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.png`;
        link.style.cssText = `
          position: fixed;
          top: -100px;
          left: -100px;
          opacity: 0;
          pointer-events: none;
        `;
        
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          resolve(true);
        }, 100);
      }, 'image/png', quality);
    });

  } catch (error) {
    console.error('Error capturing card as image:', error);
    
    // Emergency cleanup
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    
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