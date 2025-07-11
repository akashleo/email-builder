'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { EditablePart } from '@/lib/store';
import { html as beautifyHtml } from 'js-beautify';

interface CodeEditorModalProps {
  part: EditablePart | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (partId: string, newContent: string) => void;
}

export default function CodeEditorModal({ part, isOpen, onClose, onSave }: CodeEditorModalProps) {
  const [code, setCode] = useState('');

  useEffect(() => {
    if (part) {
      // Format the HTML content for better readability
      const formattedHtml = beautifyHtml(part.content, {
        indent_size: 2,
        indent_char: ' ',
        max_preserve_newlines: 1,
        preserve_newlines: true,
        indent_inner_html: true,
        indent_scripts: 'normal',
        wrap_line_length: 0,
        end_with_newline: false
      });
      setCode(formattedHtml);
    }
  }, [part]);

  const handleSave = () => {
    if (part) {
      onSave(part.id, code);
    }
  };

  if (!part) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit HTML Block ({part.tagName?.toUpperCase()})</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
            <CodeMirror
              value={code}
              height="100%"
              extensions={[html()]}
              onChange={(value) => setCode(value)}
              theme="dark"
              style={{ height: '100%' }}
            />
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 