'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEmailStore } from '@/lib/store';
import { highlightElement } from './editable-parts-selector';

interface HtmlPreviewProps {
  highlightedPartId: string | null;
  onElementHover: (partId: string | null) => void;
}

export default function HtmlPreview({ highlightedPartId, onElementHover }: HtmlPreviewProps) {
  const { uploadedHtml, editableParts } = useEmailStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen for highlight events from the selector
  useEffect(() => {
    const handleHighlight = (e: Event) => {
      const customEvent = e as CustomEvent;
      onElementHover(customEvent.detail.partId);
    };

    window.addEventListener('highlight-element', handleHighlight);
    
    return () => {
      window.removeEventListener('highlight-element', handleHighlight);
    };
  }, [onElementHover]);

  // Initialize iframe content
  useEffect(() => {
    if (!iframeRef.current || !uploadedHtml) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    // Write the HTML content to the iframe
    iframeDoc.open();
    
    // Check if uploadedHtml already has head/body structure
    const hasHeadTag = uploadedHtml.includes('<head>');
    const hasBodyTag = uploadedHtml.includes('<body>');
    
    let htmlContent = '';
    
    if (hasHeadTag && hasBodyTag) {
      // Insert our styles into the existing head
      const headEndIndex = uploadedHtml.indexOf('</head>');
      const stylesTag = `
        <style>
          /* Text elements - green underline */
          .email-builder-selected-text {
            text-decoration: underline !important;
            text-decoration-color: #22c55e !important;
            text-decoration-thickness: 2px !important;
            text-underline-offset: 2px !important;
          }
          
          /* Image elements - green border */
          .email-builder-selected-image {
            outline: 3px solid #22c55e !important;
            outline-offset: 2px !important;
          }

          /* Code elements - blue border */
          .email-builder-selected-code {
            outline: 3px solid #3b82f6 !important;
            outline-offset: 2px !important;
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.5) !important;
          }
          
          /* Cursor pointer for interactive elements (but not code blocks) */
          [data-email-builder-id]:not([data-email-builder-id^="email-builder-code-"]) {
            cursor: pointer;
          }
          
          /* Hover effect for interactive elements */
          [data-email-builder-id]:not([data-email-builder-id^="email-builder-code-"]):hover {
            opacity: 0.9;
          }
        </style>
      `;
      
      htmlContent = `<!DOCTYPE html><html>${uploadedHtml.slice(0, headEndIndex)}${stylesTag}${uploadedHtml.slice(headEndIndex)}</html>`;
    } else {
      // Wrap in proper HTML structure
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              /* Text elements - green underline */
              .email-builder-selected-text {
                text-decoration: underline !important;
                text-decoration-color: #22c55e !important;
                text-decoration-thickness: 2px !important;
                text-underline-offset: 2px !important;
              }
              
              /* Image elements - green border */
              .email-builder-selected-image {
                outline: 3px solid #22c55e !important;
                outline-offset: 2px !important;
              }

              /* Code elements - blue border */
              .email-builder-selected-code {
                outline: 3px solid #3b82f6 !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 15px rgba(59, 130, 246, 0.5) !important;
              }
              
              /* Cursor pointer for interactive elements (but not code blocks) */
              [data-email-builder-id]:not([data-email-builder-id^="email-builder-code-"]) {
                cursor: pointer;
              }
              
              /* Hover effect for interactive elements */
              [data-email-builder-id]:not([data-email-builder-id^="email-builder-code-"]):hover {
                opacity: 0.9;
              }
            </style>
          </head>
          <body>
            ${uploadedHtml}
          </body>
        </html>
      `;
    }
    
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // Wait for iframe to load then apply highlights and event listeners
    const applyHighlightsAndListeners = () => {
      // Apply persistent highlights for selected elements
      editableParts.forEach(part => {
        try {
          const element = iframeDoc.querySelector(part.selector);
          if (element) {
            // Remove all highlight classes first
            element.classList.remove('email-builder-selected-text', 'email-builder-selected-image', 'email-builder-selected-code');
            
            // Apply highlight if selected
            if (part.isSelected) {
              if (part.type === 'text') {
                element.classList.add('email-builder-selected-text');
              } else if (part.type === 'image') {
                element.classList.add('email-builder-selected-image');
              } else if (part.type === 'code') {
                element.classList.add('email-builder-selected-code');
              }
            }

            // Add click event to toggle selection (only for non-code elements)
            if (part.type !== 'code') {
              element.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Emit event to toggle selection
                const toggleEvent = new CustomEvent('toggle-part-selection', { 
                  detail: { partId: part.id } 
                });
                window.dispatchEvent(toggleEvent);
              });
            }
          } else {
            console.warn(`Element not found for selector: ${part.selector}`);
          }
        } catch (error) {
          console.error('Error processing element:', error);
        }
      });
    };

    // Apply highlights after a short delay to ensure iframe is loaded
    setTimeout(applyHighlightsAndListeners, 100);

  }, [uploadedHtml, editableParts]);

  // Update highlights when selection changes
  useEffect(() => {
    if (!iframeRef.current || !uploadedHtml) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc || !iframeDoc.body) return;

    // Apply persistent highlights for selected elements
    editableParts.forEach(part => {
      try {
        const element = iframeDoc.querySelector(part.selector);
        if (element) {
          // Remove all highlight classes first
          element.classList.remove('email-builder-selected-text', 'email-builder-selected-image', 'email-builder-selected-code');
          
          // Apply highlight if selected
          if (part.isSelected) {
            if (part.type === 'text') {
              element.classList.add('email-builder-selected-text');
            } else if (part.type === 'image') {
              element.classList.add('email-builder-selected-image');
            } else if (part.type === 'code') {
              element.classList.add('email-builder-selected-code');
            }
          }
        }
      } catch (error) {
        console.error('Error applying highlight:', error);
      }
    });
  }, [editableParts]);

  if (!uploadedHtml) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center p-8">
          <div className="text-gray-400">
            <p>Upload an HTML file to preview</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            <iframe
              ref={iframeRef}
              className="w-full h-[600px] border-0"
              title="Email HTML Preview"
              sandbox="allow-same-origin"
            />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 