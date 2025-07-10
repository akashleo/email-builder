'use client';

import { Suspense, useState, useEffect } from 'react';
import FileUpload from '@/components/file-upload';
import EditablePartsSelector from '@/components/editable-parts-selector';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEmailStore } from '@/lib/store';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';

function UploadPageContent() {
  const router = useRouter();
  const { uploadedFile } = useEmailStore();
  const [showSelector, setShowSelector] = useState(false);

  // Show selector after file is uploaded and parsed
  useEffect(() => {
    if (uploadedFile) {
      setShowSelector(true);
    } else {
      setShowSelector(false);
    }
  }, [uploadedFile]);

  return (
    <>
      <SignedIn>
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
                      Upload & Select
                    </h1>
                    <p className="text-sm text-gray-600">
                      Upload your email template and select editable parts
                    </p>
                  </div>
                </div>
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {!showSelector ? (
              // Full width for file upload and preview
              <div className="w-full">
                <FileUpload />
              </div>
            ) : (
              // Split view when selector is shown
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Panel - File Upload */}
                <div className="space-y-6">
                  <FileUpload />
                </div>

                {/* Right Panel - Editable Parts Selection */}
                <div className="h-[calc(100vh-8rem)] sticky top-8">
                  <EditablePartsSelector />
                </div>
              </div>
            )}
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <p className="text-xl mb-4">Please sign in to continue</p>
            <Button onClick={() => router.push("/")}>Go to Login</Button>
          </div>
        </div>
      </SignedOut>
    </>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UploadPageContent />
    </Suspense>
  );
}