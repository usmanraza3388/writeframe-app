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

    // Use the simplest possible capture
    const canvas = await html2canvas(element, {
      useCORS: true
    });

    // Create download
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png', quality);

    return true;
  } catch (error) {
    console.error('Error capturing card as image:', error);
    return false;
  }
};