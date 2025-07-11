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

  // --- Phase 1: Identify Code Blocks ---
  const codeBlockSelectors = ['table', 'div', 'ul', 'ol'];
  const codeBlocks: Element[] = [];
  codeBlockSelectors.forEach(selector => {
    const elements = doc.querySelectorAll(selector);
    elements.forEach(element => {
      // More selective filtering for code blocks
      if (element.innerHTML.trim().length > 100 && element.children.length > 1) {
        
        // Exclude simple wrapper divs - only consider complex structures
        if (selector === 'div' && element.children.length < 3) {
          return;
        }
        
        // Exclude elements that are just wrappers for a single editable element
        if (element.children.length === 1 && (codeBlockSelectors.includes(element.children[0].tagName.toLowerCase()) || ['p', 'h1', 'h2', 'h3'].includes(element.children[0].tagName.toLowerCase()))) {
            return;
        }

        // For tables, always include if they have structure
        // For other elements, be more selective
        const shouldIncludeAsCodeBlock = 
          selector === 'table' ||
          (selector === 'ul' || selector === 'ol') ||
          (selector === 'div' && element.children.length >= 3);
          
        if (shouldIncludeAsCodeBlock) {
          const uniqueId = `email-builder-code-${elementCounter++}`;
          element.setAttribute('data-email-builder-id', uniqueId);
          
          // Only mark direct structural children, not all descendants
          Array.from(element.children).forEach(child => {
            if (['div', 'tr', 'li', 'section', 'article'].includes(child.tagName.toLowerCase())) {
              child.setAttribute('data-email-builder-codeless-ignore', 'true');
            }
          });

          editableParts.push({
            id: `code-${selector}-${uniqueId}`,
            type: 'code',
            selector: `[data-email-builder-id="${uniqueId}"]`,
            content: element.innerHTML,
            originalContent: element.innerHTML,
            isSelected: false,
            tagName: element.tagName.toLowerCase(),
          });
          codeBlocks.push(element);
        }
      }
    });
  });

  // --- Phase 2: Identify Text Elements (that are not inside code blocks) ---
  const textSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'td', 'th', 'a', 'div', 'li'];
  textSelectors.forEach(selector => {
    const elements = doc.querySelectorAll(selector);
    elements.forEach((element) => {
      // Skip if element is inside a code block or already has an ID
      if (element.hasAttribute('data-email-builder-id') || element.hasAttribute('data-email-builder-codeless-ignore')) return;
      
      const textContent = element.textContent?.trim();
      if (textContent && textContent.length > 0) {
        // Skip if it's just whitespace
        if (!textContent.match(/^\s*$/)) {
          // For divs, only include if they don't have many child elements
          if (selector === 'div' && element.children.length > 2) {
            return;
          }
          
          // Skip elements that are containers for other editable elements
          // But allow elements with only inline styling elements (span, strong, em, etc.)
          const inlineElements = ['span', 'strong', 'b', 'em', 'i', 'u', 'small', 'mark', 'del', 'ins', 'sub', 'sup'];
          const hasBlockChildren = Array.from(element.children).some(
            child => {
              const tagName = child.tagName.toLowerCase();
              return textSelectors.includes(tagName) && !inlineElements.includes(tagName);
            }
          );
          
          if (!hasBlockChildren || selector.match(/^h[1-6]$/)) {
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

  // --- Phase 3: Identify Image Elements (that are not inside code blocks) ---
  const images = doc.querySelectorAll('img');
  images.forEach((img) => {
    // Skip if element is inside a code block
    if (img.hasAttribute('data-email-builder-id') || img.hasAttribute('data-email-builder-codeless-ignore')) return;

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