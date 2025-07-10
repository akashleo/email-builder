'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useEmailStore } from '@/lib/store';
import { validateEmailFile, parseEmailHtml } from '@/lib/email-parser';
import HtmlPreview from './html-preview';

export default function FileUpload() {
  const { 
    uploadedFile, 
    uploadError, 
    setUploadedFile, 
    setUploadedHtml, 
    setUploadError, 
    setEditableParts,
    editableParts
  } = useEmailStore();
  
  const [highlightedPartId, setHighlightedPartId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadError(null);
    setUploadedFile(file);
    setShowPreview(true);

    try {
      const htmlContent = await validateEmailFile(file);
      setUploadedHtml(htmlContent);
      
      // Parse HTML to find editable parts
      const editableParts = parseEmailHtml(htmlContent);
      setEditableParts(editableParts);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to process file');
      setUploadedFile(null);
      setShowPreview(false);
    }
  }, [setUploadedFile, setUploadedHtml, setUploadError, setEditableParts]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/html': ['.html', '.htm'],
    },
    maxFiles: 1,
  });

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadedHtml('');
    setUploadError(null);
    setEditableParts([]);
    setShowPreview(false);
    setHighlightedPartId(null);
  };

  const handleElementHover = (partId: string | null) => {
    setHighlightedPartId(partId);
  };

  const handleTogglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Email Template</h2>
        <p className="text-gray-600">
          Upload your HTML email template to start editing
        </p>
      </div>

      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {!uploadedFile ? (
        <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
          <CardContent className="p-8">
            <div
              {...getRootProps()}
              className={`text-center cursor-pointer transition-all ${
                isDragActive ? 'scale-105' : ''
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-xl font-medium text-gray-900 mb-2">
                {isDragActive ? 'Drop your HTML file here' : 'Upload HTML Email Template'}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Drag and drop your HTML file here, or click to browse
              </p>
              <p className="text-xs text-gray-500">
                Supports .html and .htm files (max 10MB)
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">{uploadedFile.name}</p>
                    <p className="text-sm text-green-700">
                      {(uploadedFile.size / 1024).toFixed(1)} KB • {editableParts.length} elements detected
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleTogglePreview}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </Button>
                  <Button
                    onClick={handleRemoveFile}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {showPreview && (
            <div className="w-full">
              <HtmlPreview 
                highlightedPartId={highlightedPartId}
                onElementHover={handleElementHover}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}