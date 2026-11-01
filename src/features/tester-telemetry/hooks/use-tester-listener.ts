'use client';

import { useEffect, useState } from 'react';
import { getTelemetrySupabase } from '../lib/supabase';
import { getOrCreateSessionId } from '../lib/device-info';
import { AdminMessage } from '../types';

// Track messages sent from this browser tab so we never pop them up on our own screen
let lastSentByThisClientMessageId: string | null = null;

export function markMessageSentByMe(id: string) {
  lastSentByThisClientMessageId = id;
}

export function useTesterListener() {
  const [incomingMessage, setIncomingMessage] = useState<AdminMessage | null>(null);

  // Realtime Listener for Incoming Admin Messages to this device
  useEffect(() => {
    const supabase = getTelemetrySupabase();
    if (!supabase) return;

    const sessionId = getOrCreateSessionId();

    const channel = supabase
      .channel(`tester_dm_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tester_sessions',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newRow = payload.new as { admin_message?: AdminMessage | null };
          if (newRow?.admin_message && newRow.admin_message.text) {
            // If this message was sent by this tab, ignore it so you don't message yourself
            if (newRow.admin_message.id === lastSentByThisClientMessageId) {
              return;
            }

            setIncomingMessage(newRow.admin_message);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    incomingMessage,
    dismissMessage: () => setIncomingMessage(null),
  };
}
