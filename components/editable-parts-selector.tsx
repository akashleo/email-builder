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
  const [highlightedPartId, setHighlightedPartId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCount(editableParts.filter(part => part.isSelected).length);
  }, [editableParts]);

  // Listen for highlight events from the preview
  useEffect(() => {
    const handleHighlight = (e: Event) => {
      const customEvent = e as CustomEvent;
      setHighlightedPartId(customEvent.detail.partId);
    };

    const handleToggleSelection = (e: Event) => {
      const customEvent = e as CustomEvent;
      togglePartSelection(customEvent.detail.partId);
    };

    window.addEventListener('highlight-element', handleHighlight);
    window.addEventListener('toggle-part-selection', handleToggleSelection);
    
    return () => {
      window.removeEventListener('highlight-element', handleHighlight);
      window.removeEventListener('toggle-part-selection', handleToggleSelection);
    };
  }, [togglePartSelection]);

  const handleConfirmSelection = () => {
    confirmSelection();
    router.push('/edit');
  };

  const handleElementHover = (partId: string | null) => {
    setHighlightedPartId(partId);
    // Emit the event for the preview to catch
    highlightElement(partId);
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
            <div className="w-3 h-3 border-2 border-blue-500 bg-blue-100 rounded-sm"></div>
            <span>Selected (persistent highlight)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 border-2 border-dashed border-green-500 bg-green-50 rounded-sm"></div>
            <span>Hover preview</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6">
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
                          : highlightedPartId === part.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => togglePartSelection(part.id)}
                      onMouseEnter={() => handleElementHover(part.id)}
                      onMouseLeave={() => handleElementHover(null)}
                    >
                      <Checkbox
                        checked={part.isSelected}
                        onChange={() => togglePartSelection(part.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {part.selector}
                          </p>
                          {part.isSelected && (
                            <Eye className="h-3 w-3 text-blue-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
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
                            : highlightedPartId === part.id
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => togglePartSelection(part.id)}
                        onMouseEnter={() => handleElementHover(part.id)}
                        onMouseLeave={() => handleElementHover(null)}
                      >
                        <Checkbox
                          checked={part.isSelected}
                          onChange={() => togglePartSelection(part.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {part.selector}
                            </p>
                            {part.isSelected && (
                              <Eye className="h-3 w-3 text-green-600" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 truncate">
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
        
        <div className="p-6 border-t bg-gray-50">
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
      </CardContent>
    </Card>
  );
}