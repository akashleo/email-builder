import { EditablePart } from './store';

export interface ParseResult {
  editableParts: EditablePart[];
  modifiedHtml: string;
}

export function parseEmailHtml(html: string): ParseResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const editableParts: EditablePart[] = [];
  let elementCounter = 0;
  
  // Find text elements - prioritize headings and paragraphs
  const textSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'td', 'th', 'a', 'div', 'li'];
  textSelectors.forEach(selector => {
    const elements = doc.querySelectorAll(selector);
    elements.forEach((element) => {
      // Skip if element already has a data-email-builder-id (avoid duplicates)
      if (element.hasAttribute('data-email-builder-id')) return;
      
      const textContent = element.textContent?.trim();
      if (textContent && textContent.length > 0) {
        // Skip if it's just whitespace
        if (!textContent.match(/^\s*$/)) {
          // For divs, only include if they don't have many child elements
          if (selector === 'div' && element.children.length > 2) {
            return;
          }
          
          // Skip elements that are containers for other editable elements
          const hasEditableChildren = Array.from(element.children).some(
            child => textSelectors.includes(child.tagName.toLowerCase())
          );
          
          if (!hasEditableChildren || selector.match(/^h[1-6]$/)) {
            const uniqueId = `email-builder-${elementCounter++}`;
            element.setAttribute('data-email-builder-id', uniqueId);
            
            // Get href for anchor tags
            const href = element.tagName.toLowerCase() === 'a' ? element.getAttribute('href') : undefined;
            
            editableParts.push({
              id: `text-${selector}-${uniqueId}`,
              type: 'text',
              selector: `[data-email-builder-id="${uniqueId}"]`,
              content: textContent,
              originalContent: textContent,
              isSelected: false,
              tagName: element.tagName.toLowerCase(),
              href: href || undefined,
              originalHref: href || undefined,
            });
          }
        }
      }
    });
  });
  
  // Find image elements
  const images = doc.querySelectorAll('img');
  images.forEach((img) => {
    const src = img.getAttribute('src');
    if (src) {
      const uniqueId = `email-builder-${elementCounter++}`;
      img.setAttribute('data-email-builder-id', uniqueId);
      
      editableParts.push({
        id: `image-${uniqueId}`,
        type: 'image',
        selector: `[data-email-builder-id="${uniqueId}"]`,
        content: src,
        originalContent: src,
        isSelected: false,
      });
    }
  });
  
  // Get the complete HTML including head styles
  let modifiedHtml = '';
  
  // If there's a head with styles, preserve them
  const headContent = doc.head.innerHTML;
  const bodyContent = doc.body.innerHTML;
  
  // Check if we have styles to preserve
  if (headContent.trim()) {
    modifiedHtml = `<head>${headContent}</head><body>${bodyContent}</body>`;
  } else {
    modifiedHtml = bodyContent;
  }
  
  return {
    editableParts,
    modifiedHtml
  };
}

export function validateEmailFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file selected'));
      return;
    }
    
    if (!file.name.toLowerCase().endsWith('.html')) {
      reject(new Error('Please select an HTML file'));
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      reject(new Error('File size must be less than 10MB'));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content.toLowerCase().includes('<html') && !content.toLowerCase().includes('<!doctype')) {
        reject(new Error('Invalid HTML file format'));
        return;
      }
      resolve(content);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}