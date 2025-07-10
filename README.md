# Email Builder - Professional Email Template Editor

A modern, user-friendly email template builder that allows users to upload HTML email templates, identify editable content, and customize them without coding knowledge.

## 🎯 Project Purpose

This application serves as a no-code email template editor, enabling users to:
- Upload existing HTML email templates
- Automatically identify editable text and image elements
- Select specific parts for customization
- Edit content through an intuitive interface
- Preview changes in real-time
- Download the modified HTML template

## 🏗️ Project Structure

### **Frontend Framework**
- **Next.js 13.5.1** with TypeScript
- **React 18.2.0** for component architecture
- **Tailwind CSS** for styling with shadcn/ui component library

### **State Management**
- **Zustand** for lightweight, efficient state management
- Centralized store managing upload, editing, and preview states

### **Key Directories**

```
email-builder/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Login/landing page
│   ├── upload/page.tsx    # File upload and part selection
│   ├── edit/page.tsx      # Content editing interface
│   ├── layout.tsx         # Root layout component
│   └── globals.css        # Global styles and Tailwind configuration
├── components/            # React components
│   ├── ui/               # shadcn/ui component library
│   ├── file-upload.tsx   # Drag & drop file upload component
│   ├── editable-parts-selector.tsx  # Part selection interface
│   ├── editable-parts-editor.tsx    # Content editing interface
│   └── preview-modal.tsx # Email preview modal
├── lib/                  # Core utilities and logic
│   ├── email-parser.ts   # HTML parsing and element identification
│   ├── store.ts          # Zustand state management
│   └── utils.ts          # Utility functions
└── hooks/                # React hooks
    └── use-toast.ts      # Toast notification system
```

## 🔄 Application Flow

### 1. **Authentication (Simulated)**
- Simple login interface for demo purposes
- Redirects to upload page after "authentication"

### 2. **File Upload & Parsing**
- **File Upload Component** (`components/file-upload.tsx`)
  - Drag & drop HTML file upload
  - File validation (HTML files only, max 10MB)
  - Real-time error handling

- **HTML Parser** (`lib/email-parser.ts`)
  - Automatically scans uploaded HTML for editable elements
  - Identifies text content in: `p`, `h1-h6`, `span`, `div`, `td`, `th`, `a`
  - Locates image elements with `src` attributes
  - Generates unique selectors for each element

### 3. **Part Selection**
- **Editable Parts Selector** (`components/editable-parts-selector.tsx`)
  - Displays all identified editable elements
  - Categorizes content: Text Content vs Images
  - Checkbox selection interface
  - Real-time selection counter

### 4. **Content Editing**
- **Parts Editor** (`components/editable-parts-editor.tsx`)
  - Individual editing interface for each selected part
  - Text areas for text content
  - URL inputs for image sources
  - Save/cancel functionality per element

### 5. **Preview & Download**
- **Preview Modal** (`components/preview-modal.tsx`)
  - Real-time preview of edited email template
  - Sandboxed iframe for safe HTML rendering
  - Download functionality for final HTML file

## 🛠️ Technical Architecture

### **State Management** (`lib/store.ts`)
The Zustand store manages the entire application state:

```typescript
interface EmailStore {
  // Upload state
  uploadedFile: File | null
  uploadedHtml: string
  uploadError: string | null
  
  // Editable parts
  editableParts: EditablePart[]
  selectedParts: EditablePart[]
  
  // Preview state
  previewHtml: string
  isPreviewOpen: boolean
  
  // Actions for state management
}
```

### **HTML Parsing Logic** (`lib/email-parser.ts`)
- **DOM Parser**: Uses browser's native DOMParser to analyze HTML structure
- **Element Identification**: Traverses DOM tree to find editable content
- **Selector Generation**: Creates CSS selectors for precise element targeting
- **Content Extraction**: Safely extracts text content and image sources

### **UI Components**
Built with **shadcn/ui** for consistency and accessibility:
- Form components (Input, Textarea, Button)
- Layout components (Card, Dialog, ScrollArea)
- Feedback components (Alert, Badge, Toast)

## 🚀 Features

### **Core Functionality**
- ✅ HTML email template upload
- ✅ Automatic editable element detection
- ✅ Selective content editing
- ✅ Real-time preview
- ✅ HTML download functionality

### **User Experience**
- ✅ Drag & drop file upload
- ✅ Responsive design (mobile-friendly)
- ✅ Intuitive multi-step workflow
- ✅ Error handling and validation
- ✅ Toast notifications

### **Technical Features**
- ✅ Type-safe TypeScript implementation
- ✅ Efficient state management with Zustand
- ✅ Component composition with shadcn/ui
- ✅ Static site generation ready (output: 'export')

## 🔧 Development Setup

### **Prerequisites**
- Node.js 18+ and npm/yarn
- Modern web browser with ES6+ support

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd email-builder

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### **Key Dependencies**
- **Core**: Next.js, React, TypeScript
- **State**: Zustand
- **UI**: shadcn/ui, Tailwind CSS, Lucide icons
- **File Handling**: react-dropzone
- **Forms**: react-hook-form with validation

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first design approach
- Flexible grid layouts using CSS Grid and Flexbox
- Responsive navigation and modals
- Touch-friendly interface elements

## 🔐 Security Considerations

- **HTML Sanitization**: Preview uses sandboxed iframe
- **File Validation**: Strict file type and size checking
- **XSS Prevention**: Safe content handling throughout
- **Client-side Processing**: No server-side storage of user data

## 🎨 Design System

### **Color Scheme**
- Uses CSS custom properties for theming
- Light mode with neutral color palette
- Accessible contrast ratios
- Consistent spacing using Tailwind's scale

### **Typography**
- Inter font family for clean, modern appearance
- Hierarchical heading structure
- Proper line heights and letter spacing

## 🚦 Usage Workflow

1. **Start** → Access the application at `/`
2. **Login** → Use simulated authentication (any email)
3. **Upload** → Drag & drop HTML email template
4. **Select** → Choose editable parts from parsed content
5. **Edit** → Modify text content and image URLs
6. **Preview** → Review changes in real-time
7. **Download** → Save the customized HTML template

## 🔮 Potential Enhancements

- **Rich Text Editor**: WYSIWYG editing for text content
- **Image Upload**: Direct image hosting instead of URLs
- **Template Library**: Pre-built email templates
- **Version History**: Save and restore editing sessions
- **Real Email Testing**: Integration with email testing services
- **Collaboration**: Multi-user editing capabilities

## 📄 License & Contributions

This project demonstrates modern React/Next.js development patterns and can serve as a foundation for commercial email builder applications. 