'use client';

import React from 'react';
import { AdminMessage } from '../types';
import { ChatTeardropDots, X } from '@phosphor-icons/react';

interface FloatingTesterMessageProps {
  message: AdminMessage | null;
  onDismiss: () => void;
}

export function FloatingTesterMessage({ message, onDismiss }: FloatingTesterMessageProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 dark:bg-[#121926]/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/30 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
          <ChatTeardropDots className="w-5 h-5" weight="fill" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Message from Admin
            </span>
            <button
              onClick={onDismiss}
              className="text-slate-400 hover:text-white transition-colors p-0.5"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-slate-100 font-medium leading-relaxed">
            {message.text}
          </p>

          <span className="text-[10px] text-slate-400 block pt-1">
            {new Date(message.sentAt).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}
