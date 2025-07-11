import { create } from 'zustand';

export interface EditablePart {
  id: string;
  selector: string;
  type: 'text' | 'image' | 'code';
  content: string;
  originalContent: string;
  isSelected: boolean;
  tagName?: string; // The actual HTML tag name (h1, p, a, etc.)
  href?: string; // For anchor tags, store the href attribute
  originalHref?: string; // Original href value
}

interface EmailStore {
  // Upload state
  uploadedFile: File | null;
  uploadedHtml: string;
  uploadError: string | null;
  
  // Editable parts
  editableParts: EditablePart[];
  selectedParts: EditablePart[];
  
  // Preview state
  previewHtml: string;
  isPreviewOpen: boolean;
  
  // Actions
  setUploadedFile: (file: File | null) => void;
  setUploadedHtml: (html: string) => void;
  setUploadError: (error: string | null) => void;
  setEditableParts: (parts: EditablePart[]) => void;
  togglePartSelection: (partId: string) => void;
  confirmSelection: () => void;
  updatePartContent: (partId: string, newContent: string) => void;
  updatePartHref: (partId: string, newHref: string) => void;
  generatePreview: () => void;
  setPreviewOpen: (open: boolean) => void;
  resetStore: () => void;
}

export const useEmailStore = create<EmailStore>((set, get) => ({
  // Initial state
  uploadedFile: null,
  uploadedHtml: '',
  uploadError: null,
  editableParts: [],
  selectedParts: [],
  previewHtml: '',
  isPreviewOpen: false,

  // Actions
  setUploadedFile: (file) => set({ uploadedFile: file }),
  setUploadedHtml: (html) => set({ uploadedHtml: html }),
  setUploadError: (error) => set({ uploadError: error }),
  setEditableParts: (parts) => set({ editableParts: parts }),
  
  togglePartSelection: (partId) => set((state) => ({
    editableParts: state.editableParts.map(part =>
      part.id === partId ? { ...part, isSelected: !part.isSelected } : part
    )
  })),
  
  confirmSelection: () => set((state) => ({
    selectedParts: state.editableParts.filter(part => part.isSelected)
  })),
  
  updatePartContent: (partId, newContent) => set((state) => ({
    selectedParts: state.selectedParts.map(part =>
      part.id === partId ? { ...part, content: newContent } : part
    )
  })),

  updatePartHref: (partId: string, newHref: string) => set((state) => ({
    selectedParts: state.selectedParts.map(part =>
      part.id === partId ? { ...part, href: newHref } : part
    )
  })),
  
  generatePreview: () => {
    const { uploadedHtml, selectedParts } = get();
    if (!uploadedHtml) {
      set({ previewHtml: '' });
      return;
    }
    
    let previewHtml = uploadedHtml;
    
    // Create a DOM parser to work with the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(previewHtml, 'text/html');
    
    selectedParts.forEach(part => {
      // Find element by data-email-builder-id attribute
      const element = doc.querySelector(`[data-email-builder-id="${part.id}"]`);
      if (!element) {
        console.warn(`Element with id ${part.id} not found`);
        return;
      }
      
      if (part.type === 'text') {
        // Update text content directly
        element.textContent = part.content;
        
        // Update href for anchor tags if changed
        if (part.tagName === 'a' && part.href && element instanceof HTMLAnchorElement) {
          element.href = part.href;
        }
      } else if (part.type === 'image') {
        if (element instanceof HTMLImageElement) {
          element.src = part.content;
        }
      } else if (part.type === 'code') {
        // Replace full HTML block for complex code elements
        element.outerHTML = part.content;
      }
    });
    
    // Convert back to string
    previewHtml = doc.documentElement.outerHTML;
    set({ previewHtml });
  },
  
  setPreviewOpen: (open) => set({ isPreviewOpen: open }),
  
  resetStore: () => set({
    uploadedFile: null,
    uploadedHtml: '',
    uploadError: null,
    editableParts: [],
    selectedParts: [],
    previewHtml: '',
    isPreviewOpen: false,
  }),
}));