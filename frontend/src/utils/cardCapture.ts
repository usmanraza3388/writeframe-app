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
    // STEP 1: Find and isolate the element
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id "${elementId}" not found`);
      return false;
    }

    // STEP 2: Create a clean clone of the element
    const clone = element.cloneNode(true) as HTMLElement;
    
    // STEP 3: Apply positioning only - NO font changes
    clone.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      left: 20px !important;
      z-index: 99999 !important;
      transform: none !important;
      opacity: 1 !important;
      visibility: visible !important;
      background-color: #FAF8F2 !important;
      margin: 0 !important;
      padding: 20px !important;
      border-radius: 12px !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08) !important;
      width: ${element.clientWidth}px !important;
      height: ${element.clientHeight}px !important;
    `;

    // STEP 4: Replace text nodes with spans while preserving original fonts
    const replaceTextWithSpans = (node: HTMLElement) => {
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
          const parent = textNode.parentElement;
          if (!parent) return;
          
          // Get original font styles
          const originalStyle = window.getComputedStyle(parent);
          
          const span = document.createElement('span');
          span.textContent = textNode.textContent;
          
          // Preserve original font styling
          span.style.fontFamily = originalStyle.fontFamily;
          span.style.fontSize = originalStyle.fontSize;
          span.style.fontWeight = originalStyle.fontWeight;
          span.style.fontStyle = originalStyle.fontStyle;
          span.style.color = originalStyle.color;
          span.style.lineHeight = originalStyle.lineHeight;
          span.style.textAlign = originalStyle.textAlign;
          span.style.textDecoration = originalStyle.textDecoration;
          
          // Add anti-merging properties
          span.style.display = 'inline-block';
          span.style.whiteSpace = 'pre-wrap';
          span.style.wordBreak = 'break-word';
          span.style.letterSpacing = 'normal';
          span.style.margin = '0';
          span.style.padding = '0';
          
          parent.replaceChild(span, textNode);
        }
      });
    };

    replaceTextWithSpans(clone);

    // STEP 5: Add clone to document
    document.body.appendChild(clone);
    
    // STEP 6: Wait for rendering
    clone.offsetHeight;
    await new Promise(r => setTimeout(r, 300));

    // STEP 7: Capture with valid options
    const canvas = await html2canvas(clone, {
      useCORS: true,
      logging: false
    });

    // STEP 8: Remove clone
    document.body.removeChild(clone);

    // STEP 9: Create canvas with background color
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height;
    const ctx = finalCanvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#FAF8F2';
      ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
      ctx.drawImage(canvas, 0, 0);
    }

    // STEP 10: Convert to blob and download
    const blob = await new Promise<Blob | null>((resolve) => {
      finalCanvas.toBlob(
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
    }, 100);

    return true;
  } catch (error) {
    console.error('Capture failed:', error);
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