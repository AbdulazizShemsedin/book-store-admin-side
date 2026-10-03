'use client';

import React, { Suspense } from 'react';
import { LoginForm } from '@/features/auth/components/login-form';
import { Spinner } from '@/components/ui/spinner';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-slate-100/80">
      <Suspense fallback={<Spinner size="lg" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
