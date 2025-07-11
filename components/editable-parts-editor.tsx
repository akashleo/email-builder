'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Type, Image, Save, Link, Code, Pencil } from 'lucide-react';
import { useEmailStore } from '@/lib/store';
import { EditablePart } from '@/lib/store';
import CodeEditorModal from './code-editor-modal';

export default function EditablePartsEditor() {
  const { selectedParts, updatePartContent, updatePartHref, generatePreview } = useEmailStore();
  const [editingPart, setEditingPart] = useState<string | null>(null);
  const [tempContent, setTempContent] = useState<string>('');
  const [tempHref, setTempHref] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCodePart, setEditingCodePart] = useState<EditablePart | null>(null);

  const handleStartEdit = (part: EditablePart) => {
    if (part.type === 'code') {
      setEditingCodePart(part);
      setIsModalOpen(true);
    } else {
      setEditingPart(part.id);
      setTempContent(part.content);
      setTempHref(part.href || '');
    }
  };

  const handleSaveEdit = (partId: string) => {
    updatePartContent(partId, tempContent);
    if (tempHref) {
      updatePartHref(partId, tempHref);
    }
    setEditingPart(null);
    setTempContent('');
    setTempHref('');
    // Auto-generate preview after edit
    setTimeout(() => generatePreview(), 100);
  };

  const handleCancelEdit = () => {
    setEditingPart(null);
    setTempContent('');
    setTempHref('');
  };

  const handleSaveCode = (partId: string, newContent: string) => {
    updatePartContent(partId, newContent);
    setIsModalOpen(false);
    setEditingCodePart(null);
    // Auto-generate preview after edit
    setTimeout(() => generatePreview(), 100);
  };

  // Auto-generate preview when component mounts and reset editing state
  useEffect(() => {
    generatePreview();
    setEditingPart(null);
    setIsModalOpen(false);
    setEditingCodePart(null);
  }, [selectedParts, generatePreview]);

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
      'table': 'Table',
      'ul': 'List (Unordered)',
      'ol': 'List (Ordered)',
    };
    return tagMap[tagName] || tagName.toUpperCase();
  };

  if (selectedParts.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center p-8">
          <div className="text-gray-400 mb-4">
            <Type className="h-12 w-12 mx-auto mb-2" />
            <p>No parts selected for editing</p>
            <p className="text-sm mt-2">Go back to upload page to select parts</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>Edit Selected Parts</span>
          <Badge variant="secondary">
            {selectedParts.length} parts
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Edit the content of your selected email parts
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 min-h-0 ">
        <ScrollArea className="flex-1 px-6 max-h-[calc(100vh-12rem)]">
          <div className="space-y-6 py-4 flex flex-col">
            {selectedParts.map((part, index) => (
              <div key={part.id} className="border rounded-lg p-4 space-y-3 w-full">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {part.type === 'text' ? (
                      <Type className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    ) : part.type === 'image' ? (
                      <Image className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <Code className="h-4 w-4 text-purple-600 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {part.tagName ? getTagDisplayName(part.tagName) : part.selector}
                    </span>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {part.type}
                    </Badge>
                    {part.tagName === 'a' && (
                      <Badge variant="outline" className="text-xs text-blue-600 flex-shrink-0">
                        <Link className="h-3 w-3 mr-1" />
                        link
                      </Badge>
                    )}
                  </div>
                  {editingPart !== part.id && (
                    <Button
                      onClick={() => handleStartEdit(part)}
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0"
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>

                {editingPart === part.id ? (
                  <div className="space-y-3">
                    <div>
                      {part.type === 'text' ? (
                        <Label htmlFor={`edit-${part.id}`}>
                          {part.type === 'text' ? 'Text Content' : 'Image URL'}
                        </Label>
                      ) : null}
                      {part.type === 'text' ? (
                        <Textarea
                          id={`edit-${part.id}`}
                          value={tempContent}
                          onChange={(e) => setTempContent(e.target.value)}
                          className="mt-1"
                          rows={3}
                        />
                      ) : (
                        <Input
                          id={`edit-${part.id}`}
                          value={tempContent}
                          onChange={(e) => setTempContent(e.target.value)}
                          className="mt-1"
                          placeholder="Enter image URL"
                        />
                      )}
                    </div>
                    
                    {/* Href editing for anchor tags */}
                    {part.tagName === 'a' && (
                      <div>
                        <Label htmlFor={`edit-href-${part.id}`}>
                          Link URL (href)
                        </Label>
                        <Input
                          id={`edit-href-${part.id}`}
                          value={tempHref}
                          onChange={(e) => setTempHref(e.target.value)}
                          className="mt-1"
                          placeholder="Enter link URL"
                        />
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleSaveEdit(part.id)}
                        size="sm"
                        variant="default"
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        size="sm"
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {part.type !== 'code' && (
                       <div className="bg-gray-50 p-3 rounded border">
                        <p className="text-sm text-gray-700 font-medium mb-1">Current Content:</p>
                        <p className="text-sm text-gray-900 break-all">
                          {part.content}
                        </p>
                      </div>
                    )}
                    
                    {/* Show href for anchor tags */}
                    {part.tagName === 'a' && part.href && (
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="text-sm text-blue-700 font-medium mb-1">Link URL:</p>
                        <p className="text-sm text-blue-900 break-all">
                          {part.href}
                        </p>
                      </div>
                    )}

                    {/* Show code block content */}
                    {part.type === 'code' && (
                      <div className="bg-gray-50 p-3 rounded border">
                         <p className="text-sm text-gray-700 font-medium mb-1">HTML Content:</p>
                         <div className="text-xs text-gray-800 bg-white p-2 rounded-md overflow-x-auto font-mono">
                          {part.content.split('\n').slice(0, 3).map((line, index) => (
                            <div key={index} className="whitespace-nowrap overflow-hidden text-ellipsis">
                              {line.trim()}
                            </div>
                          ))}
                          {part.content.split('\n').length > 3 && (
                            <div className="text-gray-500 mt-1">...</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CodeEditorModal
        isOpen={isModalOpen}
        part={editingCodePart}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCode}
      />
    </Card>
  );
}