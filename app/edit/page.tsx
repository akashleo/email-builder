'use client';

import { Suspense } from 'react';
import EditablePartsEditor from '@/components/editable-parts-editor';
import EditPreview from '@/components/edit-preview';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEmailStore } from '@/lib/store';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';

function EditPageContent() {
  const router = useRouter();
  const { resetStore } = useEmailStore();

  const handleGoHome = () => {
    resetStore();
    router.push('/');
  };

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
                      Edit Content
                    </h1>
                    <p className="text-sm text-gray-600">
                      Customize your selected email parts
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGoHome}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-10rem)]">
              {/* Left Panel - Preview */}
              <div className="h-full">
                <EditPreview />
              </div>

              {/* Right Panel - Content Editor */}
              <div className="h-full">
                <EditablePartsEditor />
              </div>
            </div>
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

export default function EditPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditPageContent />
    </Suspense>
  );
}