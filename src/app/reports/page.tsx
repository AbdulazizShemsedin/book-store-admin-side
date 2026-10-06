'use client';

import React, { useState } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { useReports } from '@/features/reports/hooks/use-reports';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

const SalesChart = dynamic(
  () => import('@/features/reports/components/sales-chart').then((mod) => mod.SalesChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[280px] w-full flex items-center justify-center bg-slate-50/50 rounded-lg">
        <Spinner size="md" />
      </div>
    ),
  }
);
import {
  MostSoldBooksCard,
  MostSoldAudiobooksCard,
} from '@/features/reports/components/ranking-table';
import { TransactionsTable } from '@/features/reports/components/transactions-table';
import { ErrorState } from '@/components/ui/error-state';
import {
  BookOpen,
  Headphones,
  CurrencyDollar,
  DownloadSimple,
  Printer,
  Calendar,
  TrendUp,
  Check,
} from '@phosphor-icons/react';

export default function ReportsPage() {
  const [period, setPeriod] = useState<'today' | '7d' | '30d' | 'custom'>('30d');

  // Compute dynamic defaults for custom date picker
  const todayStr = new Date().toISOString().split('T')[0];
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(thirtyDaysAgoStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [customRangeLabel, setCustomRangeLabel] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useReports(period);

  const handleApplyCustomRange = () => {
    if (!startDate || !endDate) return;
    const startObj = new Date(startDate);
    const endObj = new Date(endDate);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit', year: 'numeric' };
    const label = `${startObj.toLocaleDateString('en-US', options)} – ${endObj.toLocaleDateString('en-US', options)}`;
    setCustomRangeLabel(label);
    refetch();
  };

  if (isLoading) {
    return (
      <AdminShell>
        <div className="py-24 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="mt-3 text-xs text-slate-500 font-medium">Computing sales & circulation analytics...</p>
        </div>
      </AdminShell>
    );
  }

  if (isError || !data) {
    return (
      <AdminShell>
        <ErrorState
          title="Failed to load reports"
          message={error?.message || 'Unable to retrieve financial and transaction records.'}
          onRetry={() => refetch()}
          isBackendGap
        />
      </AdminShell>
    );
  }

  const { summary, dailyTrend, topBooks, topAudiobooks, transactions, totalTransactions } = data;

  const displayDateLabel =
    customRangeLabel ||
    (period === 'today'
      ? 'Today · ' + new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      : period === '7d'
      ? 'Past 7 Days'
      : period === '30d'
      ? 'Past 30 Days'
      : summary.salesPeriodLabel);

  return (
    <AdminShell>
      {/* Top Page Header */}
      <PageHeader
        breadcrumbs={[{ label: 'Admin' }, { label: 'Reports' }]}
        title="Reports"
        subtitle="Real-time book sales analysis, digital circulation, and audio distribution records."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<DownloadSimple className="w-3.5 h-3.5" />}
              onClick={() => alert('Exporting full analytics report PDF/CSV...')}
            >
              Export
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              onClick={() => window.print()}
            >
              Print Report
            </Button>
          </div>
        }
      />

      {/* Report Period Filter Bar */}
      <div className="mb-8 p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-2">
              Report Period
            </span>
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: 'Last 7 days' },
              { id: '30d', label: 'Last 30 days' },
              { id: 'custom', label: 'Custom range' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setPeriod(item.id as typeof period);
                  if (item.id !== 'custom') {
                    setCustomRangeLabel(null);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  period === item.id
                    ? 'bg-[#1e4634] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Date Display Pill */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>{displayDateLabel}</span>
          </div>
        </div>

        {/* Custom Date Range Picker Container */}
        {period === 'custom' && (
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-lg border border-slate-200/60 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mr-1">
                <Calendar className="w-4 h-4 text-[#1e4634]" />
                Select Dates:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-8 px-2.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  aria-label="Start Date"
                />
                <span className="text-xs text-slate-400 font-medium">to</span>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-8 px-2.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  aria-label="End Date"
                />
                <Button
                  size="sm"
                  onClick={handleApplyCustomRange}
                  className="bg-[#1e4634] hover:bg-[#153426] text-white h-8 px-3 text-xs"
                >
                  Apply Date Range
                </Button>
              </div>
            </div>
            {customRangeLabel && (
              <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-700" weight="bold" />
                Active Filter: {customRangeLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Total income */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#1e4634]" />
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Total income
                </span>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  ${summary.totalIncome.toLocaleString()}
                </span>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-2">
                  <TrendUp className="w-3.5 h-3.5" />
                  <span>+{summary.totalIncomeGrowthPercent}% vs previous 30 days</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
                <CurrencyDollar className="w-5 h-5" weight="bold" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Books Sold */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#1e4634]" />
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Books Sold
                </span>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {summary.booksSold.toLocaleString()}
                </span>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-2">
                  <TrendUp className="w-3.5 h-3.5" />
                  <span>+{summary.booksSoldGrowthPercent}% vs previous 30 days</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1e4634] flex items-center justify-center">
                <BookOpen className="w-5 h-5" weight="fill" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Audiobook Books */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#1e4634]" />
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Audiobook Books
                </span>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {summary.audiobookBooks.toLocaleString()}
                </span>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-2">
                  <TrendUp className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{summary.audiobookSharePercent}% of total catalog sales</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                <Headphones className="w-5 h-5" weight="fill" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily / Recent Books Sold Chart */}
      <div className="mb-8">
        <Card>
          <CardHeader
            title="Daily / recent books sold"
            subtitle="Circulation trends comparing digital ebooks and audiobook streaming units"
          />
          <CardContent className="pt-2">
            <SalesChart data={dailyTrend} />
          </CardContent>
        </Card>
      </div>

      {/* Two Side-by-Side Ranking Cards: Most-sold books & Most-sold audiobooks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <MostSoldBooksCard books={topBooks} />
        <MostSoldAudiobooksCard audiobooks={topAudiobooks} />
      </div>

      {/* Dedicated Transactions Table Section (PM Requirement: Transactions Table in Reports) */}
      <div className="mb-8">
        <TransactionsTable
          transactions={transactions}
          totalRecords={totalTransactions}
        />
      </div>
    </AdminShell>
  );
}
