import { create } from 'zustand';

export interface EditablePart {
  id: string;
  type: 'text' | 'image';
  selector: string;
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
    let previewHtml = uploadedHtml;
    
    selectedParts.forEach(part => {
      if (part.type === 'text') {
        // Update text content
        previewHtml = previewHtml.replace(part.originalContent, part.content);
        
        // Update href for anchor tags if changed
        if (part.tagName === 'a' && part.href && part.originalHref && part.href !== part.originalHref) {
          const selector = part.selector.replace(/\[|\]/g, '');
          const regex = new RegExp(`(<[^>]*${selector}[^>]*href=")[^"]*("[^>]*>)`, 'g');
          previewHtml = previewHtml.replace(regex, `$1${part.href}$2`);
        }
      } else if (part.type === 'image') {
        previewHtml = previewHtml.replace(
          new RegExp(`src="${part.originalContent}"`, 'g'),
          `src="${part.content}"`
        );
      }
    });
    
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