'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Type, Image, CheckCircle, Eye } from 'lucide-react';
import { useEmailStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

// Create a custom event for highlighting
export const highlightElement = (partId: string | null) => {
  const event = new CustomEvent('highlight-element', { 
    detail: { partId } 
  });
  window.dispatchEvent(event);
};

export default function EditablePartsSelector() {
  const { 
    editableParts, 
    selectedParts, 
    togglePartSelection, 
    confirmSelection 
  } = useEmailStore();
  const router = useRouter();
  const [selectedCount, setSelectedCount] = useState(0);

  // Helper function to get tag display name
  const getTagDisplayName = (tagName: string) => {
    const tagMap: Record<string, string> = {
      'h1': 'H1 Heading',
      'h2': 'H2 Heading', 
      'h3': 'H3 Heading',
      'h4': 'H4 Heading',
      'h5': 'H5 Heading',
      'h6': 'H6 Heading',
      'p': 'Paragraph',
      'span': 'Span Text',
      'div': 'Div Block',
      'a': 'Link',
      'td': 'Table Cell',
      'th': 'Table Header',
      'li': 'List Item',
      'img': 'Image'
    };
    return tagMap[tagName] || tagName?.toUpperCase() || 'Element';
  };

  // Helper function to get tag color classes
  const getTagColorClasses = (tagName: string) => {
    const colorMap: Record<string, { bg: string, text: string, border: string }> = {
      'h1': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
      'h2': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
      'h3': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      'h4': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
      'h5': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
      'h6': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
      'p': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      'span': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
      'div': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
      'a': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
      'td': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      'th': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
      'li': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
      'img': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' }
    };
    return colorMap[tagName] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  };

  useEffect(() => {
    setSelectedCount(editableParts.filter(part => part.isSelected).length);
  }, [editableParts]);

  // Listen for toggle selection events from the preview
  useEffect(() => {
    const handleToggleSelection = (e: Event) => {
      const customEvent = e as CustomEvent;
      togglePartSelection(customEvent.detail.partId);
    };

    window.addEventListener('toggle-part-selection', handleToggleSelection);
    
    return () => {
      window.removeEventListener('toggle-part-selection', handleToggleSelection);
    };
  }, [togglePartSelection]);

  const handleConfirmSelection = () => {
    confirmSelection();
    router.push('/edit');
  };

  const textParts = editableParts.filter(part => part.type === 'text');
  const imageParts = editableParts.filter(part => part.type === 'image');

  if (editableParts.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center p-8">
          <div className="text-gray-400 mb-4">
            <Type className="h-12 w-12 mx-auto mb-2" />
            <p>Upload an HTML file to see editable parts</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>Editable Parts</span>
          <Badge variant="secondary">
            {selectedCount} selected
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Select the parts you want to edit in your email template
        </p>
        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
          <div className="flex items-center space-x-1">
            <div className="w-16 h-0.5 bg-green-500"></div>
            <span>Text (underline)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 border-2 border-green-500 rounded-sm"></div>
            <span>Image (border)</span>
          </div>
        </div>
      </CardHeader>
      
      {/* Confirm Selection Button - Moved to top */}
      <div className="px-6 pb-4">
        <Button
          onClick={handleConfirmSelection}
          disabled={selectedCount === 0}
          className="w-full"
          size="lg"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Confirm Selection ({selectedCount} parts)
        </Button>
      </div>
      
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 pb-4">
            {textParts.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Type className="h-4 w-4 text-blue-600" />
                  <h3 className="font-medium text-gray-900">Text Content</h3>
                  <Badge variant="outline">{textParts.length}</Badge>
                </div>
                <div className="space-y-2">
                  {textParts.map((part) => (
                    <div
                      key={part.id}
                      className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        part.isSelected 
                          ? 'border-blue-500 bg-blue-50 shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => togglePartSelection(part.id)}
                    >
                      <Checkbox
                        checked={part.isSelected}
                        onChange={() => togglePartSelection(part.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getTagColorClasses(part.tagName || '').bg} ${getTagColorClasses(part.tagName || '').text} ${getTagColorClasses(part.tagName || '').border}`}>
                            {getTagDisplayName(part.tagName || '')}
                          </div>
                          {part.isSelected && (
                            <Eye className="h-3 w-3 text-blue-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {part.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {imageParts.length > 0 && (
              <>
                {textParts.length > 0 && <Separator />}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Image className="h-4 w-4 text-green-600" />
                    <h3 className="font-medium text-gray-900">Images</h3>
                    <Badge variant="outline">{imageParts.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {imageParts.map((part) => (
                      <div
                        key={part.id}
                        className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          part.isSelected 
                            ? 'border-green-500 bg-green-50 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => togglePartSelection(part.id)}
                      >
                        <Checkbox
                          checked={part.isSelected}
                          onChange={() => togglePartSelection(part.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getTagColorClasses(part.tagName || 'img').bg} ${getTagColorClasses(part.tagName || 'img').text} ${getTagColorClasses(part.tagName || 'img').border}`}>
                              {getTagDisplayName(part.tagName || 'img')}
                            </div>
                            {part.isSelected && (
                              <Eye className="h-3 w-3 text-green-600" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 truncate mt-1">
                            {part.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}