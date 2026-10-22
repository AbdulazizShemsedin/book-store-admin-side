'use client';

import React from 'react';
import { useTelemetryCollector } from './hooks/use-telemetry-collector';
import { useTesterListener } from './hooks/use-tester-listener';
import { FloatingTesterMessage } from './components/floating-tester-message';
import { AdminTelemetryModal } from './components/admin-telemetry-modal';

export function TesterTelemetryRoot() {
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_TESTER_TELEMETRY === 'true';

  // Mount telemetry collector (only runs if enabled)
  useTelemetryCollector();

  // Mount listener for incoming admin messages & tab away chime
  const { incomingMessage, dismissMessage } = useTesterListener();

  if (!isEnabled) {
    return null;
  }

  return (
    <>
      <FloatingTesterMessage message={incomingMessage} onDismiss={dismissMessage} />
      <AdminTelemetryModal />
    </>
  );
}
