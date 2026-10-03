import React from 'react';
import { Badge } from './badge';
import { Headphones, BookOpen } from '@phosphor-icons/react';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  if (normalized === 'active' || normalized === 'live' || normalized === 'published') {
    return (
      <Badge variant="success" dot size="sm">
        {status}
      </Badge>
    );
  }

  if (normalized === 'review' || normalized === 'pending') {
    return (
      <Badge variant="warning" dot size="sm">
        {status}
      </Badge>
    );
  }

  if (normalized === 'disabled' || normalized === 'inactive' || normalized === 'archived') {
    return (
      <Badge variant="danger" dot size="sm">
        {status}
      </Badge>
    );
  }

  return (
    <Badge variant="default" size="sm">
      {status}
    </Badge>
  );
}

interface FormatBadgeProps {
  hasAudiobook?: boolean;
  format?: string;
}

export function FormatBadge({ hasAudiobook, format }: FormatBadgeProps) {
  if (hasAudiobook || format === 'Audiobook' || format === 'has Audiobook') {
    return (
      <Badge variant="info" size="sm" className="font-normal text-blue-700 bg-blue-50/80 border-blue-200">
        <Headphones className="w-3.5 h-3.5 mr-0.5 text-blue-600" />
        <span>has Audiobook</span>
      </Badge>
    );
  }

  return (
    <Badge variant="default" size="sm" className="font-normal text-slate-600 bg-slate-100 border-slate-200">
      <BookOpen className="w-3.5 h-3.5 mr-0.5 text-slate-500" />
      <span>text-only</span>
    </Badge>
  );
}
