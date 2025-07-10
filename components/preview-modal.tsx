'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, X } from 'lucide-react';
import { useEmailStore } from '@/lib/store';

export default function PreviewModal() {
  const { isPreviewOpen, previewHtml, setPreviewOpen } = useEmailStore();

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
    <Dialog open={isPreviewOpen} onOpenChange={setPreviewOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Email Preview</DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button
                onClick={() => setPreviewOpen(false)}
                variant="ghost"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full border rounded-lg">
            <div className="p-4">
              <iframe
                srcDoc={previewHtml}
                className="w-full h-[600px] border-0"
                title="Email Preview"
                sandbox="allow-same-origin"
              />
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}