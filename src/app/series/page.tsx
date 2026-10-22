'use client';

import React from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { SeriesTable } from '@/features/series/components/series-table';
import { Badge } from '@/components/ui/badge';
import { useSeries } from '@/features/series/hooks/use-series';

export default function SeriesPage() {
  const { data } = useSeries({ page: 1, pageSize: 1 });
  const total = data?.total || 0;

  return (
    <AdminShell>
      <PageHeader
        breadcrumbs={[{ label: 'Admin' }, { label: 'Series & Volumes' }]}
        title="Book Series & Volumes"
        badge={
          <Badge variant="primary" size="md">
            {total} {total === 1 ? 'Series' : 'Series'}
          </Badge>
        }
      />

      <div className="space-y-6">
        <SeriesTable />
      </div>
    </AdminShell>
  );
}
