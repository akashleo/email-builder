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

  // Apply highlighting when a part is hovered or selected
  useEffect(() => {
    if (!iframeRef.current || !uploadedHtml) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    // Reset all highlights first
    const allHighlighted = iframeDoc.querySelectorAll('.email-builder-highlight, .email-builder-selected');
    allHighlighted.forEach((el) => {
      el.classList.remove('email-builder-highlight', 'email-builder-selected');
    });

    // Add persistent highlights for selected elements
    editableParts.forEach(part => {
      if (part.isSelected) {
        try {
          const element = iframeDoc.querySelector(part.selector);
          if (element) {
            element.classList.add('email-builder-selected');
          }
        } catch (error) {
          console.error('Error selecting element:', error);
        }
      }
    });

    // Add temporary highlight to the hovered element if any
    if (highlightedPartId) {
      const hoveredPart = editableParts.find(part => part.id === highlightedPartId);
      if (hoveredPart) {
        try {
          const element = iframeDoc.querySelector(hoveredPart.selector);
          if (element) {
            // Only add hover highlight if not already selected
            if (!hoveredPart.isSelected) {
              element.classList.add('email-builder-highlight');
            }
            // Scroll into view if needed
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } catch (error) {
          console.error('Error highlighting element:', error);
        }
      }
    }
  }, [highlightedPartId, uploadedHtml, editableParts]);

  // Initialize iframe content and add event listeners
  useEffect(() => {
    if (!iframeRef.current || !uploadedHtml) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    // Write the HTML content to the iframe
    iframeDoc.open();
    
    // Inject our custom styles for highlighting
    const htmlWithStyles = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            .email-builder-selected {
              outline: 3px solid #3b82f6 !important;
              background-color: rgba(59, 130, 246, 0.15) !important;
              transition: outline 0.2s ease, background-color 0.2s ease;
            }
            .email-builder-highlight {
              outline: 2px dashed #22c55e !important;
              background-color: rgba(34, 197, 94, 0.1) !important;
              transition: outline 0.2s ease, background-color 0.2s ease;
            }
            .email-builder-hover {
              outline: 2px dashed #6b7280 !important;
              background-color: rgba(107, 114, 128, 0.05) !important;
            }
          </style>
        </head>
        <body>
          ${uploadedHtml}
        </body>
      </html>
    `;
    
    iframeDoc.write(htmlWithStyles);
    iframeDoc.close();

    // Add hover effects to all editable elements
    editableParts.forEach(part => {
      try {
        const element = iframeDoc.querySelector(part.selector);
        if (element) {
          // Add hover event
          element.addEventListener('mouseenter', () => {
            if (!part.isSelected) {
              element.classList.add('email-builder-hover');
            }
            // Use the custom event system
            highlightElement(part.id);
          });
          
          // Remove hover event
          element.addEventListener('mouseleave', () => {
            element.classList.remove('email-builder-hover');
            highlightElement(null);
          });
          
          // Add click event to toggle selection
          element.addEventListener('click', (e) => {
            e.preventDefault();
            // Emit event to toggle selection
            const toggleEvent = new CustomEvent('toggle-part-selection', { 
              detail: { partId: part.id } 
            });
            window.dispatchEvent(toggleEvent);
          });
        }
      } catch (error) {
        console.error('Error adding event listeners:', error);
      }
    });

    // Cleanup function
    return () => {
      // No need to remove event listeners as the iframe will be recreated
    };
  }, [uploadedHtml, editableParts]);

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