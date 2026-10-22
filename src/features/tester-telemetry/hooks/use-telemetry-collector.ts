'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getTelemetrySupabase } from '../lib/supabase';
import { detectDeviceHardware, DeviceHardwareInfo } from '../lib/device-info';
import { TelemetryClick, TelemetryPayload, TelemetryTimeMetrics } from '../types';

const MAX_CLICKS_BUFFER = 80;
const SYNC_INTERVAL_MS = 3000;

interface RecentClickRecord {
  time: number;
  x: number;
  y: number;
}

export function useTelemetryCollector() {
  const pathname = usePathname();

  const hardwareRef = useRef<DeviceHardwareInfo | null>(null);
  const timeMetricsRef = useRef<TelemetryTimeMetrics>({
    totalDurationSeconds: 0,
    activeReadingSeconds: 0,
    backgroundAwaySeconds: 0,
    tabSwitchCount: 0,
  });

  const clicksRef = useRef<TelemetryClick[]>([]);
  const recentClicksHistory = useRef<RecentClickRecord[]>([]);
  const rageClicksCountRef = useRef(0);
  const deadClicksCountRef = useRef(0);
  const maxScrollDepthRef = useRef(0);

  // Initialize hardware info once
  useEffect(() => {
    hardwareRef.current = detectDeviceHardware();
  }, []);

  // 1. Time & Visibility Tracking
  useEffect(() => {
    const timer = setInterval(() => {
      timeMetricsRef.current.totalDurationSeconds += 1;
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        timeMetricsRef.current.activeReadingSeconds += 1;
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

      const payload: TelemetryPayload = {
        hardware,
        time: { ...timeMetricsRef.current },
        clicks: clicksRef.current,
        rageClicksCount: rageClicksCountRef.current,
        deadClicksCount: deadClicksCountRef.current,
        maxScrollDepthPercent: maxScrollDepthRef.current,
        currentPath: pathname || '/',
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
        // Silently catch network failures so app is never disrupted
        console.debug('[TesterTelemetry] Sync error:', err);
      }
    };

    // Initial sync
    syncToSupabase();

    const interval = setInterval(syncToSupabase, SYNC_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [pathname]);
}
