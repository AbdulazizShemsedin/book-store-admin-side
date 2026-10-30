'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Spinner } from '@/components/ui/spinner';
import { TewbaLogo } from '@/components/ui/tewba-logo';
import { ConnectivityBanner } from '@/components/ui/connectivity-banner';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#070a10] space-y-5">
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
          <TewbaLogo variant="full" size="lg" priority />
        </div>
        <div className="flex items-center gap-2">
          <Spinner size="sm" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Initializing TEWBA Admin Portal...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-[#070a10] text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-150">
      <ConnectivityBanner />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
