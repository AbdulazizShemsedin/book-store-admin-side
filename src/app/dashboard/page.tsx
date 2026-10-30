'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import {
  BookOpen,
  Users,
  Buildings,
  ArrowRight,
  Plus,
  TreeStructure,
  Lightning,
  Eye,
  FileText,
  Headphones,
  Translate,
  CurrencyDollar,
  TrendUp,
  Tag,
  BookmarkSimple,
  Sparkle,
} from '@phosphor-icons/react';
import { useBooks } from '@/features/books/hooks/use-books';
import { useDashboardStats } from '@/features/dashboard/hooks/use-dashboard-stats';
import { useReports } from '@/features/reports/hooks/use-reports';
import { useSeries } from '@/features/series/hooks/use-series';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils/cn';

// Dynamically import chart component with SSR disabled for optimal hydration
const SalesChart = dynamic(
  () => import('@/features/reports/components/sales-chart').then((mod) => mod.SalesChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400">
        <Spinner size="md" />
        <span className="text-xs mt-2">Loading revenue trajectory...</span>
      </div>
    ),
  }
);

const LANGUAGE_LABELS: Record<string, string> = {
  ar: 'Arabic',
  am: 'Amharic',
  en: 'English',
  om: 'Oromo',
  ti: 'Tigrinya',
  so: 'Somali',
};

export default function DashboardPage() {
  const { data: booksData, isLoading: booksLoading } = useBooks({ page: 1, pageSize: 5 });
  const { data: statsData } = useDashboardStats();
  const { data: reportsData, isLoading: reportsLoading } = useReports('30d');
  const { data: seriesData } = useSeries({ page: 1, pageSize: 5 });

  const totalBooks = statsData?.totalBooks ?? booksData?.total ?? 0;
  const totalAuthors = statsData?.totalAuthors ?? 0;
  const totalCategories = statsData?.totalCategories ?? 0;
  const rootCategoriesCount = statsData?.rootCategoriesCount ?? 0;
  const subCategoriesCount = statsData?.subCategoriesCount ?? 0;
  const totalPublishers = statsData?.totalPublishers ?? 0;

  const recentBooks = booksData?.books || [];
  const totalSeries = seriesData?.total ?? 0;

  const totalRevenue = reportsData?.summary?.totalIncome ?? 0;
  const totalBooksSold = reportsData?.summary?.booksSold ?? 0;
  const audioSharePercent = reportsData?.summary?.audiobookSharePercent ?? 0;
  const chartData = reportsData?.dailyTrend || [];

  return (
    <AdminShell>
      {/* Page Header */}
      <PageHeader
        title="Command Center"
        subtitle="Real-time bookstore intelligence, catalog metrics, and quick operational shortcuts"
        actions={
          <div className="flex items-center gap-2.5">
            <Link href="/reports">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 glass-pill hover:bg-white/80 dark:hover:bg-white/10 shadow-2xs transition-all active:scale-[0.98]"
              >
                <TrendUp className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                <span>Financial Analytics</span>
              </button>
            </Link>
            <Link href="/books/new">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#1b4332] via-[#245842] to-[#2d6a4f] hover:from-[#153628] hover:to-[#245842] shadow-sm shadow-emerald-950/20 hover:shadow-md transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 text-emerald-200" weight="bold" />
                <span>Register Title</span>
              </button>
            </Link>
          </div>
        }
      />

      {/* Bento Grid Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 mb-8">
        {/* ========================================================= */}
        {/* BENTO CELL 1: PRIMARY METRIC & HERO PULSE (Col 1-8 / 8 Spans) */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 bg-gradient-to-br from-[#1b4332]/95 via-[#204d3a]/90 to-[#0e271c]/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-white/15 relative overflow-hidden flex flex-col justify-between group">
          {/* Subtle Ambient Backing Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:bg-emerald-400/25 transition-all duration-700" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Bar inside Bento 1 */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-emerald-200">
              <Sparkle className="w-3.5 h-3.5 text-emerald-300" weight="fill" />
              <span>TEWBA Digital Bookstore Engine</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Database Synchronized</span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 my-6 sm:my-8 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            <div className="sm:col-span-7">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300/90 block mb-1">
                Active Catalog Volume
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-sm">
                  {totalBooks.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-emerald-200/90">Books & Audiobooks</span>
              </div>
              <p className="text-xs text-emerald-100/70 mt-2.5 max-w-md leading-relaxed">
                Centralized multi-lingual repository supporting Amharic, Oromo, Tigrinya, Arabic, English, and Somali literature.
              </p>
            </div>

            {/* Quick Micro Stats Pill */}
            <div className="sm:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-3 shadow-inner">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-100/80 font-medium">30d Revenue</span>
                <span className="font-bold text-white text-sm">
                  ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-100/80 font-medium">Copies Sold</span>
                <span className="font-bold text-white">{totalBooksSold.toLocaleString()}</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-100/80 font-medium">Audiobook Share</span>
                <span className="font-bold text-emerald-300">
                  {audioSharePercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Action buttons */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Link
                href="/books"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-[#1b4332] text-xs font-bold hover:bg-emerald-50 transition-colors shadow-xs active:scale-[0.98]"
              >
                <span>Browse Library</span>
                <ArrowRight className="w-3.5 h-3.5" weight="bold" />
              </Link>
              <Link
                href="/books/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/60 text-white text-xs font-medium border border-white/15 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" weight="bold" />
                <span>Upload New E-Book</span>
              </Link>
            </div>
            <span className="text-[11px] text-emerald-200/70 font-mono">
              60 FPS Virtualized Scroller Ready
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BENTO CELL 2: QUICK ACTION LAUNCHPAD (Col 9-12 / 4 Spans) */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-6 flex flex-col justify-between transition-colors duration-150">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-800/40">
                  <Lightning className="w-4 h-4" weight="fill" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Command Shortcuts
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">1-Click</span>
            </div>

            <div className="space-y-2.5">
              <Link href="/books/new" className="block group">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 border border-emerald-200/60 dark:border-emerald-800/40 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#070a10] text-emerald-800 dark:text-emerald-300 flex items-center justify-center shadow-xs">
                      <Plus className="w-4 h-4" weight="bold" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Register Book</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">Multipart EPUB/PDF upload</span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              <Link href="/authors" className="block group">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#070a10] text-blue-700 dark:text-blue-400 flex items-center justify-center shadow-xs">
                      <Users className="w-4 h-4" weight="bold" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Authors Directory</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">Profiles & nationality flags</span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              <Link href="/categories" className="block group">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#070a10] text-purple-700 dark:text-purple-400 flex items-center justify-center shadow-xs">
                      <TreeStructure className="w-4 h-4" weight="bold" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Category Taxonomy</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">Hierarchical genre tree</span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Series Collections</span>
            <Link href="/series" className="font-semibold text-emerald-800 dark:text-emerald-400 hover:underline">
              {totalSeries} Series Registered &rarr;
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BENTO CELL 3: AUTHORS REPOSITORY (Col 1-3 / 3 Spans) */}
        {/* ========================================================= */}
        <Link href="/authors" className="lg:col-span-3 block group">
          <div className="h-full glass-panel glass-card-interactive rounded-3xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Authors
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50/80 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/50 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-200 shadow-2xs">
                <Users className="w-5 h-5" weight="fill" />
              </div>
            </div>
            <div className="my-3">
              <span className="text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-normal font-sans">
                {totalAuthors.toLocaleString()}
              </span>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Biographies & photo archives</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 group-hover:underline pt-2 border-t border-slate-200/50 dark:border-white/10">
              <span>View Directory</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* ========================================================= */}
        {/* BENTO CELL 4: TAXONOMY & TAGS (Col 4-6 / 3 Spans) */}
        {/* ========================================================= */}
        <Link href="/categories" className="lg:col-span-3 block group">
          <div className="h-full glass-panel glass-card-interactive rounded-3xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Taxonomy & Tags
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-200 shadow-2xs">
                <Tag className="w-5 h-5" weight="fill" />
              </div>
            </div>
            <div className="my-3">
              <span className="text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-normal font-sans">
                {totalCategories.toLocaleString()}
              </span>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                {rootCategoriesCount} roots • {subCategoriesCount} subcategories
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400 group-hover:underline pt-2 border-t border-slate-200/50 dark:border-white/10">
              <span>Explore Hierarchy</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* ========================================================= */}
        {/* BENTO CELL 5: PUBLISHERS (Col 7-9 / 3 Spans) */}
        {/* ========================================================= */}
        <Link href="/publishers" className="lg:col-span-3 block group">
          <div className="h-full glass-panel glass-card-interactive rounded-3xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Publishers
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-50/80 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-200 shadow-2xs">
                <Buildings className="w-5 h-5" weight="fill" />
              </div>
            </div>
            <div className="my-3">
              <span className="text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-normal font-sans">
                {totalPublishers.toLocaleString()}
              </span>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Distribution houses</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-400 group-hover:underline pt-2 border-t border-slate-200/50 dark:border-white/10">
              <span>View Imprints</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* ========================================================= */}
        {/* BENTO CELL 6: SUBSCRIPTION PLANS (Col 10-12 / 3 Spans) */}
        {/* ========================================================= */}
        <Link href="/plans" className="lg:col-span-3 block group">
          <div className="h-full glass-panel glass-card-interactive rounded-3xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Tier Plans
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50/80 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-200 shadow-2xs">
                <CurrencyDollar className="w-5 h-5" weight="bold" />
              </div>
            </div>
            <div className="my-3">
              <span className="text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-normal font-sans">
                Active
              </span>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Reader subscription models</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 group-hover:underline pt-2 border-t border-slate-200/50 dark:border-white/10">
              <span>Pricing Tiers</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* ========================================================= */}
        {/* BENTO CELL 7: LIVE SALES TRAJECTORY CHART (Col 1-8 / 8 Spans) */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-6 transition-colors duration-150 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <TrendUp className="w-4 h-4 text-emerald-800 dark:text-emerald-400" weight="bold" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Revenue Performance</h3>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">30-day aggregate revenue trend</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>30 Days</span>
                </span>
                <Link
                  href="/reports"
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors"
                >
                  Full Report &rarr;
                </Link>
              </div>
            </div>

            {/* Chart Area */}
            {reportsLoading ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                <Spinner size="md" />
                <span className="text-xs mt-2">Loading revenue stream...</span>
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-center">
                <TrendUp className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                <span className="text-xs font-medium">No sales data recorded in this period</span>
              </div>
            ) : (
              <div className="w-full">
                <SalesChart data={chartData} />
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>Aggregated from live telemetry & orders</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Total Volume: ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BENTO CELL 8: SERIES & EDITORIAL SPOTLIGHT (Col 9-12 / 4 Spans) */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-6 transition-colors duration-150 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookmarkSimple className="w-4 h-4 text-indigo-700 dark:text-indigo-400" weight="fill" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Book Series
                </h3>
              </div>
              <Link href="/series" className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 hover:underline">
                View All
              </Link>
            </div>

            {seriesData?.series && seriesData.series.length > 0 ? (
              <div className="space-y-2.5">
                {seriesData.series.slice(0, 4).map((item) => (
                  <Link
                    key={item.id}
                    href={`/series/${item.id}`}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-white/10 transition-colors group"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors block truncate">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {item.booksCount ? `${item.booksCount} Volumes` : 'Series Collection'}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-all flex-shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <BookmarkSimple className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No series created</p>
                <Link
                  href="/series"
                  className="inline-block mt-2 text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
                >
                  Create your first series &rarr;
                </Link>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Series Collections</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{totalSeries} Registered</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BENTO CELL 9: RECENTLY REGISTERED BOOKS (Full Width 12 Spans) */}
        {/* ========================================================= */}
        <div className="lg:col-span-12 glass-panel rounded-3xl overflow-hidden transition-colors duration-150">
          <div className="px-6 py-4.5 border-b border-slate-200/50 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-800 dark:text-emerald-400" weight="fill" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Recent Catalog Registrations
                </h3>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Latest publications added to the live bookstore catalog
              </p>
            </div>
            <Link
              href="/books"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 glass-pill hover:bg-emerald-50 dark:hover:bg-emerald-950/50 px-3.5 py-1.5 rounded-xl transition-colors"
            >
              <span>View Full Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" weight="bold" />
            </Link>
          </div>

          {booksLoading ? (
            <div className="py-16 flex items-center justify-center">
              <Spinner size="md" />
            </div>
          ) : recentBooks.length === 0 ? (
            <div className="py-16 text-center px-4">
              <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No books found in catalog</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Register a book to see it appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider backdrop-blur-sm">
                    <th className="py-3.5 px-5 w-14 text-center">Cover</th>
                    <th className="py-3.5 px-5">Title & Info</th>
                    <th className="py-3.5 px-4">Language</th>
                    <th className="py-3.5 px-4">Format</th>
                    <th className="py-3.5 px-4">Author</th>
                    <th className="py-3.5 px-5 text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/40 dark:divide-white/[0.04]">
                  {recentBooks.map((book) => {
                    const langLabel = book.language
                      ? LANGUAGE_LABELS[book.language.toLowerCase()] || book.language.toUpperCase()
                      : null;
                    const bookCover = book.thumbnail || book.coverUrl;

                    return (
                      <tr key={book.id} className="hover:bg-emerald-500/[0.04] dark:hover:bg-white/[0.03] transition-colors group">
                        {/* Cover */}
                        <td className="py-3 px-5 text-center">
                          <div className="w-9 h-12 mx-auto rounded-md bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 overflow-hidden shadow-2xs">
                            {bookCover ? (
                              <Image
                                src={bookCover}
                                alt={book.name}
                                width={36}
                                height={48}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                unoptimized
                              />
                            ) : (
                              <BookOpen className="w-4 h-4 text-slate-300 dark:text-slate-600" weight="duotone" />
                            )}
                          </div>
                        </td>

                        {/* Title & Description */}
                        <td className="py-3 px-5">
                          <Link
                            href={`/books/${book.id}`}
                            className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors block text-xs group-hover:underline truncate max-w-sm"
                          >
                            {book.name}
                          </Link>
                          {book.description && (
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5 max-w-md font-normal">
                              {book.description}
                            </p>
                          )}
                        </td>

                        {/* Language */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {langLabel ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                              <Translate className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                              <span>{langLabel}</span>
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600 italic text-[11px]">—</span>
                          )}
                        </td>

                        {/* Format */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {book.hasAudiobook ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60">
                              <Headphones className="w-3 h-3 text-indigo-600 dark:text-indigo-400" weight="bold" />
                              <span>Audiobook</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60">
                              <FileText className="w-3 h-3 text-emerald-700 dark:text-emerald-400" weight="bold" />
                              <span>E-Book</span>
                            </span>
                          )}
                        </td>

                        {/* Author */}
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                          {book.author ? (
                            <span className="truncate block max-w-[140px]">{book.author}</span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-600 italic text-[11px]">—</span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-3 px-5 text-right whitespace-nowrap">
                          <Link
                            href={`/books/${book.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-emerald-300 bg-white/70 dark:bg-white/[0.05] hover:bg-emerald-50 dark:hover:bg-white/[0.1] border border-slate-200/60 dark:border-white/10 shadow-2xs transition-all active:scale-[0.98]"
                            title="View details"
                          >
                            <Eye className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                            <span>View</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
