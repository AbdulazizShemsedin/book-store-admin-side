'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getTelemetrySupabase } from '../lib/supabase';
import { detectDeviceHardware, DeviceHardwareInfo } from '../lib/device-info';
import {
  TelemetryClick,
  TelemetryPayload,
  TelemetryTimeMetrics,
  FeaturesExplored,
  PerformanceVitals,
  InputAndAccessibility,
} from '../types';

const MAX_CLICKS_BUFFER = 100;
const SYNC_INTERVAL_MS = 3000;

interface RecentClickRecord {
  time: number;
  x: number;
  y: number;
}

export function useTelemetryCollector() {
  const pathname = usePathname();
  const currentPathRef = useRef(pathname || '/');

  useEffect(() => {
    currentPathRef.current = pathname || '/';
  }, [pathname]);

  const hardwareRef = useRef<DeviceHardwareInfo | null>(null);
  const timeMetricsRef = useRef<TelemetryTimeMetrics>({
    totalDurationSeconds: 0,
    activeReadingSeconds: 0,
    backgroundAwaySeconds: 0,
    tabSwitchCount: 0,
  });

  const pageAttentionRef = useRef<Record<string, number>>({});
  const featuresExploredRef = useRef<FeaturesExplored>({
    visitedDashboard: false,
    browsedBooks: false,
    viewedSeries: false,
    viewedCategories: false,
    viewedAuthors: false,
    viewedPublishers: false,
    usedSearch: false,
    usedThemeToggle: false,
  });

  const clicksRef = useRef<TelemetryClick[]>([]);
  const recentClicksHistory = useRef<RecentClickRecord[]>([]);
  const rageClicksCountRef = useRef(0);
  const deadClicksCountRef = useRef(0);
  const maxScrollDepthRef = useRef(0);

  // Performance Vitals & Goldmine Refs
  const currentFpsRef = useRef(60);
  const fpsSamplesRef = useRef<number[]>([]);
  const uiFreezesCountRef = useRef(0);
  const maxFreezeDurationMsRef = useRef(0);
  const storageQuotaMbRef = useRef(0);
  const storageUsageMbRef = useRef(0);
  const inputAndA11yRef = useRef<InputAndAccessibility>({
    pointerType: 'fine',
    canHover: true,
    prefersReducedMotion: false,
    forcedColorsHighContrast: false,
  });

  // Initialize hardware info & Input/A11y queries once
  useEffect(() => {
    hardwareRef.current = detectDeviceHardware();

    if (typeof window !== 'undefined') {
      inputAndA11yRef.current = {
        pointerType: window.matchMedia('(pointer: coarse)').matches ? 'coarse' : 'fine',
        canHover: window.matchMedia('(hover: hover)').matches,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        forcedColorsHighContrast: window.matchMedia('(forced-colors: active)').matches,
      };

      // Query storage quota once
      if (navigator.storage && navigator.storage.estimate) {
        navigator.storage
          .estimate()
          .then((est) => {
            storageQuotaMbRef.current = Math.round((est.quota || 0) / (1024 * 1024));
            storageUsageMbRef.current = Math.round(((est.usage || 0) / (1024 * 1024)) * 10) / 10;
          })
          .catch(() => {});
      }
    }
  }, []);

  // Long Tasks (UI Freeze Detector) Observer
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    let observer: PerformanceObserver | null = null;
    try {
      observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          uiFreezesCountRef.current += 1;
          if (entry.duration > maxFreezeDurationMsRef.current) {
            maxFreezeDurationMsRef.current = Math.round(entry.duration);
          }
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch {
      // Longtask observer not supported or permission denied in this browser
    }

    return () => {
      observer?.disconnect();
    };
  }, []);

  // Lightweight FPS counter loop (pauses when tab is hidden)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsCalculation = performance.now();

    const loop = (now: number) => {
      if (document.visibilityState === 'visible') {
        frameCount += 1;
        const elapsed = now - lastFpsCalculation;
        if (elapsed >= 1000) {
          const fps = Math.round((frameCount * 1000) / elapsed);
          currentFpsRef.current = Math.min(fps, 144);
          fpsSamplesRef.current.push(currentFpsRef.current);
          if (fpsSamplesRef.current.length > 30) {
            fpsSamplesRef.current.shift();
          }
          frameCount = 0;
          lastFpsCalculation = now;
        }
      }
      lastTime = now;
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Track feature exploration based on route
  useEffect(() => {
    const p = pathname || '';
    if (p.includes('/dashboard')) featuresExploredRef.current.visitedDashboard = true;
    if (p.includes('/books')) featuresExploredRef.current.browsedBooks = true;
    if (p.includes('/series')) featuresExploredRef.current.viewedSeries = true;
    if (p.includes('/categories')) featuresExploredRef.current.viewedCategories = true;
    if (p.includes('/authors')) featuresExploredRef.current.viewedAuthors = true;
    if (p.includes('/publishers')) featuresExploredRef.current.viewedPublishers = true;
  }, [pathname]);

  // 1. Time, Visibility & Section Attention Tracking
  useEffect(() => {
    const timer = setInterval(() => {
      timeMetricsRef.current.totalDurationSeconds += 1;
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        timeMetricsRef.current.activeReadingSeconds += 1;
        const currentRoute = currentPathRef.current;
        pageAttentionRef.current[currentRoute] = (pageAttentionRef.current[currentRoute] || 0) + 1;
      } else {
        timeMetricsRef.current.backgroundAwaySeconds += 1;
      }
    }, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        timeMetricsRef.current.tabSwitchCount += 1;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 2. Scroll Depth Tracking
  useEffect(() => {
    const updateScrollDepth = () => {
      if (typeof window === 'undefined') return;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        maxScrollDepthRef.current = 100;
        return;
      }
      const percent = Math.min(100, Math.max(0, Math.round((scrollTop / docHeight) * 100)));
      if (percent > maxScrollDepthRef.current) {
        maxScrollDepthRef.current = percent;
      }
    };

    window.addEventListener('scroll', updateScrollDepth, { passive: true });
    updateScrollDepth();

    return () => window.removeEventListener('scroll', updateScrollDepth);
  }, [pathname]);

  // 3. Click Stream, Rage Clicks & Dead Clicks Detection
  useEffect(() => {
    const isInteractiveElement = (el: HTMLElement | null): boolean => {
      if (!el) return false;
      const tag = el.tagName.toLowerCase();
      if (['button', 'a', 'input', 'select', 'textarea', 'label', 'summary'].includes(tag)) {
        return true;
      }
      if (el.getAttribute('role') === 'button' || el.getAttribute('role') === 'link') {
        return true;
      }
      if (el.hasAttribute('onclick') || el.tabIndex >= 0) {
        return true;
      }
      try {
        const computed = window.getComputedStyle(el);
        if (computed.cursor === 'pointer') return true;
      } catch {
        // fallback
      }
      return el.parentElement ? isInteractiveElement(el.parentElement) : false;
    };

    const handleClick = (e: MouseEvent) => {
      const now = Date.now();
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const tag = target.tagName || 'DIV';

      // Feature detection on click
      if (target.closest('[data-testid="theme-toggle"]') || target.closest('button[aria-label*="theme" i]')) {
        featuresExploredRef.current.usedThemeToggle = true;
      }
      if (tag === 'INPUT' && (target as HTMLInputElement).placeholder?.toLowerCase().includes('search')) {
        featuresExploredRef.current.usedSearch = true;
      }

      // Privacy: Never record sensitive text from inputs/passwords
      let label = '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        label = `[${(target as HTMLInputElement).type || 'input'}]`;
      } else {
        const rawText = target.innerText || target.getAttribute('aria-label') || target.getAttribute('title') || '';
        label = rawText.trim().replace(/\s+/g, ' ').substring(0, 32);
      }

      // Rage Click check: 3+ clicks within 500ms within 30px
      recentClicksHistory.current = recentClicksHistory.current.filter((c) => now - c.time <= 500);
      recentClicksHistory.current.push({ time: now, x: e.clientX, y: e.clientY });

      let isRage = false;
      if (recentClicksHistory.current.length >= 3) {
        const first = recentClicksHistory.current[0];
        const last = recentClicksHistory.current[recentClicksHistory.current.length - 1];
        const dist = Math.hypot(last.x - first.x, last.y - first.y);
        if (dist <= 30) {
          isRage = true;
          rageClicksCountRef.current += 1;
        }
      }

      // Dead Click check: Clicked on a non-interactive element
      const isInteractive = isInteractiveElement(target);
      const isDead = !isInteractive;
      if (isDead) {
        deadClicksCountRef.current += 1;
      }

      const clickRecord: TelemetryClick = {
        timestamp: now,
        tag,
        label,
        x: e.clientX,
        y: e.clientY,
        isRage,
        isDead,
        route: currentPathRef.current,
      };

      clicksRef.current = [...clicksRef.current.slice(-MAX_CLICKS_BUFFER), clickRecord];
    };

    document.addEventListener('click', handleClick, { capture: true, passive: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, []);

  // 4. Throttled Sync to Supabase table `tester_sessions` (every 3 seconds)
  useEffect(() => {
    const supabase = getTelemetrySupabase();
    if (!supabase) return;

    const syncToSupabase = async () => {
      const hardware = hardwareRef.current || detectDeviceHardware();

      // Memory vitals (Chromium only)
      let usedJsHeapMb = 0;
      let totalJsHeapMb = 0;
      let jsHeapLimitMb = 0;
      if (typeof window !== 'undefined' && (performance as any)?.memory) {
        const mem = (performance as any).memory;
        usedJsHeapMb = Math.round((mem.usedJSHeapSize || 0) / (1024 * 1024));
        totalJsHeapMb = Math.round((mem.totalJSHeapSize || 0) / (1024 * 1024));
        jsHeapLimitMb = Math.round((mem.jsHeapSizeLimit || 0) / (1024 * 1024));
      }

      // FPS metrics
      const samples = fpsSamplesRef.current;
      const avgFps =
        samples.length > 0 ? Math.round(samples.reduce((a, b) => a + b, 0) / samples.length) : currentFpsRef.current;

      const vitals: PerformanceVitals = {
        currentFps: currentFpsRef.current,
        avgFps,
        usedJsHeapMb,
        totalJsHeapMb,
        jsHeapLimitMb,
        uiFreezesCount: uiFreezesCountRef.current,
        maxFreezeDurationMs: maxFreezeDurationMsRef.current,
        storageQuotaMb: storageQuotaMbRef.current,
        storageUsageMb: storageUsageMbRef.current,
      };

      const payload: TelemetryPayload = {
        hardware,
        time: { ...timeMetricsRef.current },
        vitals,
        inputAndA11y: { ...inputAndA11yRef.current },
        clicks: clicksRef.current,
        rageClicksCount: rageClicksCountRef.current,
        deadClicksCount: deadClicksCountRef.current,
        maxScrollDepthPercent: maxScrollDepthRef.current,
        currentPath: currentPathRef.current,
        pageAttention: { ...pageAttentionRef.current },
        featuresExplored: { ...featuresExploredRef.current },
      };

      try {
        await supabase.from('tester_sessions').upsert(
          {
            session_id: hardware.sessionId,
            device_type: hardware.deviceType,
            os: hardware.os,
            browser: hardware.browser,
            last_updated: new Date().toISOString(),
            telemetry: payload,
          },
          { onConflict: 'session_id' }
        );
      } catch (err) {
        console.debug('[TesterTelemetry] Sync error:', err);
      }
    };

    syncToSupabase();
    const interval = setInterval(syncToSupabase, SYNC_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);
}
