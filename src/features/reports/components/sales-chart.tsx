'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { DailySalesDataPoint } from '@/types/domain';

import { useTheme } from 'next-themes';

interface SalesChartProps {
  data: DailySalesDataPoint[];
}

export function SalesChart({ data }: SalesChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={isDark ? '#1e293b' : '#f1f5f9'}
          />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
            dy={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
            dx={-4}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              borderRadius: '8px',
              border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: '12px',
              color: isDark ? '#f8fafc' : '#0f172a',
            }}
          />
          {/* Books sold - Primary Forest Green / Emerald */}
          <Line
            type="monotone"
            dataKey="booksSold"
            name="Books Sold"
            stroke={isDark ? '#34d399' : '#1e4634'}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: isDark ? '#34d399' : '#1e4634' }}
          />
          {/* Audiobook sold - Amber / Gold */}
          <Line
            type="monotone"
            dataKey="audiobooksSold"
            name="Audiobooks Sold"
            stroke={isDark ? '#fbbf24' : '#d97706'}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: isDark ? '#fbbf24' : '#d97706' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
