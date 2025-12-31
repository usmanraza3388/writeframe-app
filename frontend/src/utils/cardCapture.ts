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

    // Wait for fonts to load
    await document.fonts.ready;

    // TypeScript workaround - cast to any to bypass type checking
    const options = {
      useCORS: true,
      backgroundColor: '#FAF8F2',
      scale: 2,
      logging: false,
      foreignObjectRendering: false,
      onclone: (_clonedDoc: Document, clonedElement: HTMLElement) => {
        clonedElement.style.cssText = `
          font-family: Arial, sans-serif !important;
          text-rendering: optimizeSpeed !important;
          -webkit-font-smoothing: none !important;
          -moz-osx-font-smoothing: grayscale !important;
        `;
        
        const allElements = clonedElement.querySelectorAll('*');
        allElements.forEach((el: Element) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.transform = 'none';
          htmlEl.style.filter = 'none';
          htmlEl.style.mixBlendMode = 'normal';
        });
      }
    };

    // Use type assertion to bypass TypeScript errors
    const canvas = await html2canvas(element, options as any);

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