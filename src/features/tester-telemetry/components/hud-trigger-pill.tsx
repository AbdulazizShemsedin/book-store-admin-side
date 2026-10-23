'use client';

import React from 'react';
import { Eye } from '@phosphor-icons/react';

interface HudTriggerPillProps {
  onClick: () => void;
}

export function HudTriggerPill({ onClick }: HudTriggerPillProps) {
  return (
    <button
      onClick={onClick}
      title="Open Tester Telemetry HUD (Ctrl+Shift+A)"
      className="fixed bottom-3 left-3 z-40 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 dark:bg-slate-800/80 backdrop-blur-md text-emerald-400 hover:text-white border border-emerald-500/30 hover:border-emerald-500 text-[11px] font-mono font-medium shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer opacity-70 hover:opacity-100"
    >
      <Eye className="w-3.5 h-3.5" weight="bold" />
      <span>HUD</span>
    </button>
  );
}
