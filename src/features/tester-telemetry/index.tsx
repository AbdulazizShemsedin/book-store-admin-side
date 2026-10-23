'use client';

import React, { useState, useEffect } from 'react';
import { useTelemetryCollector } from './hooks/use-telemetry-collector';
import { useTesterListener } from './hooks/use-tester-listener';
import { FloatingTesterMessage } from './components/floating-tester-message';
import { AdminTelemetryModal } from './components/admin-telemetry-modal';
import { HudTriggerPill } from './components/hud-trigger-pill';

export function TesterTelemetryRoot() {
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_TESTER_TELEMETRY === 'true';
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mount telemetry collector
  useTelemetryCollector();

  // Mount listener for incoming admin messages
  const { incomingMessage, dismissMessage } = useTesterListener();

  // Hotkey listener: Ctrl+Shift+A or Cmd+Shift+A
  useEffect(() => {
    if (!isEnabled) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled]);

  if (!isEnabled) {
    return null;
  }

  return (
    <>
      <FloatingTesterMessage message={incomingMessage} onDismiss={dismissMessage} />
      <HudTriggerPill onClick={() => setIsModalOpen(true)} />
      <AdminTelemetryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
