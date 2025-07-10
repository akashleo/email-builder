'use client';

import { Suspense } from 'react';
import EditablePartsEditor from '@/components/editable-parts-editor';
import PreviewModal from '@/components/preview-modal';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEmailStore } from '@/lib/store';

function EditPageContent() {
  const router = useRouter();
  const { selectedParts, resetStore } = useEmailStore();

  const handleGoHome = () => {
    resetStore();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Edit Content
                </h1>
                <p className="text-sm text-gray-600">
                  Customize your selected email parts
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoHome}
            >
              <Home className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-10rem)]">
          {/* Left Panel - Selected Parts List */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Selected Parts
              </h2>
              <p className="text-sm text-gray-600">
                {selectedParts.length} parts selected for editing
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
              {selectedParts.map((part, index) => (
                <div key={part.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {index + 1}. {part.selector}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      {part.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Content Editor */}
          <div className="h-full">
            <EditablePartsEditor />
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal />
    </div>
  );
}

export default function EditPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditPageContent />
    </Suspense>
  );
}