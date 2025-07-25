'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye, RefreshCw } from 'lucide-react';
import { useEmailStore } from '@/lib/store';
import { useEffect, useMemo } from 'react';

export default function EditPreview() {
  const { previewHtml, generatePreview, selectedParts } = useEmailStore();

  // Create a stable key for the iframe based on content
  const iframeKey = useMemo(() => {
    return `preview-${previewHtml.length}-${previewHtml.slice(0, 100).replace(/\s/g, '').length}`;
  }, [previewHtml]);

  // Generate preview on mount
  useEffect(() => {
    generatePreview();
  }, [generatePreview]);

  // Generate preview when selected parts change
  useEffect(() => {
    generatePreview();
  }, [selectedParts, generatePreview]);



  const handleRefresh = () => {
    generatePreview();
  };

  const handleDownload = () => {
    const blob = new Blob([previewHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edited-email.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Live Preview</span>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <div className="flex-1 border rounded-lg mx-6 mb-6 overflow-hidden">
          <iframe
            key={iframeKey} // Force re-render when content changes
            srcDoc={previewHtml}
            className="w-full h-full border-0"
            title="Email Preview"
            sandbox="allow-same-origin"
          />
        </div>
      </CardContent>
    </Card>
  );
} 