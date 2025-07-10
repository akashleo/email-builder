import { EditablePart } from './store';

export function parseEmailHtml(html: string): EditablePart[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const editableParts: EditablePart[] = [];
  
  // Find text elements (p, h1-h6, span, div with text content)
  const textSelectors = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'td', 'th', 'a'];
  textSelectors.forEach(selector => {
    const elements = doc.querySelectorAll(selector);
    elements.forEach((element, index) => {
      const textContent = element.textContent?.trim();
      if (textContent && textContent.length > 0) {
        // Skip if it's just whitespace or contains only other HTML elements
        if (textContent.length < 500 && !textContent.match(/^\s*$/)) {
          editableParts.push({
            id: `text-${selector}-${index}`,
            type: 'text',
            selector: `${selector}:nth-of-type(${index + 1})`,
            content: textContent,
            originalContent: textContent,
            isSelected: false,
          });
        }
      }
    });
  });
  
  // Find image elements
  const images = doc.querySelectorAll('img');
  images.forEach((img, index) => {
    const src = img.getAttribute('src');
    if (src) {
      editableParts.push({
        id: `image-${index}`,
        type: 'image',
        selector: `img:nth-of-type(${index + 1})`,
        content: src,
        originalContent: src,
        isSelected: false,
      });
    }
  });
  
  return editableParts;
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