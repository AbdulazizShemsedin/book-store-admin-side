'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Spinner } from '@/components/ui/spinner';
import { TewbaLogo } from '@/components/ui/tewba-logo';
import { ConnectivityBanner } from '@/components/ui/connectivity-banner';
import { CommandPalette } from '@/components/ui/command-palette';
import { Toaster } from 'sonner';

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
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#edf2ef] dark:bg-[#06090e] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-950 dark:selection:text-emerald-200 transition-colors duration-200">
      {/* High-Precision Multi-Stop Optical Chromatic Backdrops */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Top-Right Emerald Aurora */}
        <div className="absolute -top-32 right-[-5%] w-[720px] h-[720px] rounded-full bg-gradient-to-br from-emerald-500/25 via-emerald-600/15 to-transparent dark:from-emerald-500/20 dark:via-emerald-900/25 dark:to-transparent blur-[140px] transform-gpu animate-pulse [animation-duration:8s]" />

        {/* Center-Left Teal Spotlight */}
        <div className="absolute top-[30%] -left-[10%] w-[680px] h-[680px] rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-600/10 to-transparent dark:from-teal-900/20 dark:via-emerald-950/30 dark:to-transparent blur-[130px] transform-gpu" />

        {/* Bottom-Right Deep Forest Glow */}
        <div className="absolute -bottom-40 right-[15%] w-[800px] h-[800px] rounded-full bg-gradient-to-tl from-emerald-700/20 via-teal-600/15 to-transparent dark:from-emerald-950/30 dark:via-slate-900/50 dark:to-transparent blur-[150px] transform-gpu" />

        {/* Bottom-Left Subtle Indigo Counterbalance */}
        <div className="absolute -bottom-20 -left-[5%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-500/10 via-teal-400/5 to-transparent dark:from-indigo-950/20 dark:via-slate-950/40 dark:to-transparent blur-[120px] transform-gpu" />

        {/* Micro-Dot Noise Grid Texture for Depth Refraction */}
        <div className="absolute inset-0 bg-noise-overlay opacity-60 pointer-events-none" />
      </div>

      <ConnectivityBanner />
      <CommandPalette />
      <Toaster
        richColors
        position="top-right"
        closeButton
        toastOptions={{
          className:
            'glass-panel !backdrop-blur-2xl !border-white/80 dark:!border-white/10 !shadow-xl !rounded-2xl',
        }}
      />

      {/* Permanently Fixed/Sticky Glass Dock Sidebar */}
      <Sidebar />

      {/* Main Content Area with Independent Scroll Container */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 h-screen overflow-hidden transition-all duration-300">
        <Header />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto overscroll-contain">{children}</main>
      </div>
    </div>
  );
}
