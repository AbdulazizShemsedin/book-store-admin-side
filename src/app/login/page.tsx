'use client';

import React, { Suspense } from 'react';
import { LoginForm } from '@/features/auth/components/login-form';
import { Spinner } from '@/components/ui/spinner';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-slate-100/80 dark:from-[#070a10] dark:to-[#0d121d] relative transition-colors duration-200">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <Suspense fallback={<Spinner size="lg" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
