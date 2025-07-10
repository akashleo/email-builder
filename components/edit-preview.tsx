'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';
import { useEmailStore } from '@/lib/store';
import { useEffect } from 'react';

export default function EditPreview() {
  const { previewHtml, generatePreview } = useEmailStore();

  // Generate preview on mount and when data changes
  useEffect(() => {
    generatePreview();
  }, [generatePreview]);

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
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <div className="flex-1 border rounded-lg mx-6 mb-6 overflow-hidden">
          <iframe
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