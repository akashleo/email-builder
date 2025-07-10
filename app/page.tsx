'use client';

import { SignInButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Email Builder</h1>
          <p className="text-gray-600 mt-2">
            Create and customize beautiful email templates
          </p>
        </div>

        {/* Auth components */}
        <div className="flex flex-col items-center space-y-4">
            <SignedIn>
                <div className="flex flex-col items-center space-y-4">
                    <p className="text-lg text-gray-800">Welcome back!</p>
                    <div className="flex items-center space-x-4">
                        <UserButton afterSignOutUrl="/" />
                        <Button onClick={() => router.push('/upload')}>
                            Go to Dashboard
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </SignedIn>
            <SignedOut>
                <p className="text-lg text-gray-800">Please sign in to continue</p>
                <SignInButton mode="modal">
                    <Button className="w-full max-w-xs h-12 text-base font-medium">
                        Sign In
                    </Button>
                </SignInButton>
            </SignedOut>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Secure authentication powered by Clerk</p>
        </div>
      </div>
    </div>
  );
}