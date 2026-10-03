'use client';

import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/lib/query/query-client';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Use useState to ensure QueryClient instance is stable per request lifecycle
  const [client] = useState(() => createQueryClient());

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
