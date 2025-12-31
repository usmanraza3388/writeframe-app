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

    // Clone element but DON'T change fonts
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Apply minimal positioning only
    clone.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      left: 20px !important;
      z-index: 99999 !important;
      transform: none !important;
      opacity: 1 !important;
      visibility: visible !important;
      margin: 0 !important;
      width: ${element.clientWidth}px !important;
      height: ${element.clientHeight}px !important;
    `;

    // Fix text merging WITHOUT changing fonts
    const fixTextNodes = (node: HTMLElement) => {
      const walker = document.createTreeWalker(
        node,
        NodeFilter.SHOW_TEXT,
        null
      );
      
      const nodes = [];
      let textNode;
      while (textNode = walker.nextNode()) {
        nodes.push(textNode);
      }
      
      nodes.forEach(textNode => {
        if (textNode.textContent && textNode.textContent.trim()) {
          const span = document.createElement('span');
          span.textContent = textNode.textContent;
          // CRITICAL: Only fix layout, keep original font
          span.style.cssText = `
            display: inline-block !important;
            position: relative !important;
            white-space: pre-wrap !important;
            word-break: break-word !important;
            letter-spacing: normal !important;
            margin: 0 !important;
            padding: 0 !important;
          `;
          textNode.parentNode?.replaceChild(span, textNode);
        }
      });
    };

    fixTextNodes(clone);
    document.body.appendChild(clone);
    clone.offsetHeight;
    await new Promise(r => setTimeout(r, 100));

    // Use type assertion for foreignObjectRendering
    const options: any = {
      useCORS: true,
      backgroundColor: '#FAF8F2',
      scale: 2,
      logging: false,
      foreignObjectRendering: false // THIS FIXES MERGING
    };

    const canvas = await html2canvas(clone, options);
    document.body.removeChild(clone);

    // Download
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
    console.error('Capture failed:', error);
    return false;
  }
};