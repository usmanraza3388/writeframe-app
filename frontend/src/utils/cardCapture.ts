import html2canvas from 'html2canvas';

export const captureCardAsImage = async (
  element: HTMLElement,
  fileName: string
): Promise<boolean> => {
  try {
    // 1. TEMPORARILY modify the card for clean capture
    const originalHTML = element.innerHTML;
    
    // 2. Replace all text with plain text spans
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent && node.textContent.trim()) {
        const span = document.createElement('span');
        span.textContent = node.textContent;
        span.style.cssText = `
          display: inline-block;
          position: relative;
          font-family: Arial, sans-serif;
          white-space: pre-wrap;
          margin: 0;
          padding: 0;
          line-height: 1.4;
          letter-spacing: normal;
        `;
        node.parentNode?.replaceChild(span, node);
      }
    }
    
    // 3. Wait for reflow
    element.offsetHeight;
    await new Promise(r => setTimeout(r, 100));
    
    // 4. Capture with minimal options
    const canvas = await html2canvas(element, {
      useCORS: true,
      backgroundColor: '#FAF8F2',
      scale: window.devicePixelRatio * 2
    });
    
    // 5. Restore original HTML
    element.innerHTML = originalHTML;
    
    // 6. Download
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${fileName}.png`;
    link.click();
    
    return true;
  } catch (error) {
    console.error('Capture failed:', error);
    return false;
  }
};