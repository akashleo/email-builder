'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Type, Image, Eye, Save } from 'lucide-react';
import { useEmailStore } from '@/lib/store';
import { EditablePart } from '@/lib/store';

export default function EditablePartsEditor() {
  const { selectedParts, updatePartContent, generatePreview, setPreviewOpen } = useEmailStore();
  const [editingPart, setEditingPart] = useState<string | null>(null);
  const [tempContent, setTempContent] = useState<string>('');

  const handleStartEdit = (part: EditablePart) => {
    setEditingPart(part.id);
    setTempContent(part.content);
  };

  const handleSaveEdit = (partId: string) => {
    updatePartContent(partId, tempContent);
    setEditingPart(null);
    setTempContent('');
  };

  const handleCancelEdit = () => {
    setEditingPart(null);
    setTempContent('');
  };

  const handlePreview = () => {
    generatePreview();
    setPreviewOpen(true);
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
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6">
            {selectedParts.map((part, index) => (
              <div key={part.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {part.type === 'text' ? (
                      <Type className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Image className="h-4 w-4 text-green-600" />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {part.selector}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {part.type}
                    </Badge>
                  </div>
                  {editingPart !== part.id && (
                    <Button
                      onClick={() => handleStartEdit(part)}
                      variant="ghost"
                      size="sm"
                    >
                      Edit
                    </Button>
                  )}
                </div>

                {editingPart === part.id ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`edit-${part.id}`}>
                        {part.type === 'text' ? 'Text Content' : 'Image URL'}
                      </Label>
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
                  <div className="bg-gray-50 p-3 rounded border">
                    <p className="text-sm text-gray-700 font-medium mb-1">Current Content:</p>
                    <p className="text-sm text-gray-900 break-all">
                      {part.content}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-6 border-t bg-gray-50">
          <Button
            onClick={handlePreview}
            className="w-full"
            size="lg"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}