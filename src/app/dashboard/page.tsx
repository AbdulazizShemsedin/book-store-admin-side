'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
} from '@phosphor-icons/react';
import { useBooks } from '@/features/books/hooks/use-books';
import { useDashboardStats } from '@/features/dashboard/hooks/use-dashboard-stats';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils/cn';

const LANGUAGE_LABELS: Record<string, string> = {
  ar: 'Arabic',
  am: 'Amharic',
  en: 'English',
  om: 'Oromo',
  ti: 'Tigrinya',
  so: 'Somali',
};

export default function DashboardPage() {
  const { data: booksData, isLoading: booksLoading } = useBooks({ page: 1, pageSize: 6 });
  const { data: statsData } = useDashboardStats();

  const totalBooks = statsData?.totalBooks ?? booksData?.total ?? 0;
  const totalAuthors = statsData?.totalAuthors ?? 0;
  const totalCategories = statsData?.totalCategories ?? 0;
  const rootCategoriesCount = statsData?.rootCategoriesCount ?? 0;
  const subCategoriesCount = statsData?.subCategoriesCount ?? 0;
  const totalPublishers = statsData?.totalPublishers ?? 0;

  const recentBooks = booksData?.books || [];

  return (
    <AdminShell>
      {/* Page Header */}
      <PageHeader
        title="Dashboard Overview"
        subtitle="Catalog overview, real-time statistics, and bookstore management shortcuts"
        actions={
          <Link href="/books/new" className="inline-block">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#1b4332] via-[#245842] to-[#2d6a4f] hover:from-[#153628] hover:to-[#245842] shadow-sm shadow-emerald-950/20 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-emerald-200" weight="bold" />
              <span>Register New Book</span>
            </button>
          </Link>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* TOTAL BOOKS */}
        <Link href="/books" className="block group animate-fade-in-up [animation-delay:0ms]">
          <div className="relative overflow-hidden bg-white dark:bg-[#0d121d] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-none hover:border-emerald-600/60 dark:hover:border-emerald-500/50 hover:shadow-md hover:-translate-y-1 transition-all duration-200 ease-out">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                  Cataloged Books
                </span>
                <span className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {totalBooks.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">Live titles repository</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-200 shadow-2xs">
                <BookOpen className="w-5 h-5" weight="fill" />
              </div>
            </div>
          </div>
        </Link>

        {/* AUTHORS */}
        <Link href="/authors" className="block group animate-fade-in-up [animation-delay:60ms]">
          <div className="relative overflow-hidden bg-white dark:bg-[#0d121d] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-none hover:border-blue-600/60 dark:hover:border-blue-500/50 hover:shadow-md hover:-translate-y-1 transition-all duration-200 ease-out">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                  Authors
                </span>
                <span className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {totalAuthors.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">Registered writers</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/50 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-200 shadow-2xs">
                <Users className="w-5 h-5" weight="fill" />
              </div>
            </div>
          </div>
        </Link>

        {/* CATEGORIES TAXONOMY */}
        <Link href="/categories" className="block group animate-fade-in-up [animation-delay:120ms]">
          <div className="relative overflow-hidden bg-white dark:bg-[#0d121d] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-none hover:border-indigo-600/60 dark:hover:border-indigo-500/50 hover:shadow-md hover:-translate-y-1 transition-all duration-200 ease-out">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                  Categories & Tags
                </span>
                <span className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {totalCategories.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                  {rootCategoriesCount} roots • {subCategoriesCount} subcategories
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/50 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-200 shadow-2xs">
                <TreeStructure className="w-5 h-5" weight="fill" />
              </div>
            </div>
          </div>
        </Link>

        {/* PUBLISHERS */}
        <Link href="/publishers" className="block group animate-fade-in-up [animation-delay:180ms]">
          <div className="relative overflow-hidden bg-white dark:bg-[#0d121d] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-none hover:border-purple-600/60 dark:hover:border-purple-500/50 hover:shadow-md hover:-translate-y-1 transition-all duration-200 ease-out">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                  Publishers
                </span>
                <span className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {totalPublishers.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">Distribution partners</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-200 shadow-2xs">
                <Buildings className="w-5 h-5" weight="fill" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Grid: Left Column (Live Cataloged Books) / Right Column (Quick Actions & Taxonomy) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 spans): Recent Real Books Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0d121d] rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-none overflow-hidden transition-colors duration-150">
            {/* Table Header Bar */}
            <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recently Registered Titles</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Live catalog entries in the bookstore</p>
              </div>
              <Link
                href="/books"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 px-3 py-1.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/50 transition-colors"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" weight="bold" />
              </Link>
            </div>

            {/* Table Body */}
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
                    <tr className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4 w-12 text-center">Cover</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Language</th>
                      <th className="py-3 px-4">Format</th>
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {recentBooks.map((book) => {
                      const langLabel = book.language
                        ? LANGUAGE_LABELS[book.language.toLowerCase()] || book.language.toUpperCase()
                        : null;
                      const bookCover = book.thumbnail || book.coverUrl;

                      return (
                        <tr key={book.id} className="hover:bg-emerald-50/20 dark:hover:bg-slate-800/40 transition-colors group">
                          {/* Cover */}
                          <td className="py-3 px-4 text-center">
                            <div className="w-8 h-11 mx-auto rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 overflow-hidden shadow-2xs">
                              {bookCover ? (
                                <Image
                                  src={bookCover}
                                  alt={book.name}
                                  width={32}
                                  height={44}
                                  className="w-full h-full object-cover"
                                  unoptimized
                                />
                              ) : (
                                <BookOpen className="w-4 h-4 text-slate-300 dark:text-slate-600" weight="duotone" />
                              )}
                            </div>
                          </td>

                          {/* Title */}
                          <td className="py-3 px-4">
                            <Link
                              href={`/books/${book.id}`}
                              className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors block text-xs group-hover:underline truncate max-w-[200px]"
                            >
                              {book.name}
                            </Link>
                          </td>

                          {/* Language */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {langLabel ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
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
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60">
                                <Headphones className="w-3 h-3 text-indigo-600 dark:text-indigo-400" weight="bold" />
                                <span>Audiobook</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60">
                                <FileText className="w-3 h-3 text-emerald-700 dark:text-emerald-400" weight="bold" />
                                <span>E-Book</span>
                              </span>
                            )}
                          </td>

                          {/* Author */}
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                            {book.author ? (
                              <span className="truncate block max-w-[120px]">{book.author}</span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-600 italic text-[11px]">—</span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <Link
                              href={`/books/${book.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-emerald-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 shadow-2xs transition-all active:scale-[0.98]"
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

        {/* Right Column (1 span): Quick Actions & Catalog Taxonomy */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-[#0d121d] rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-none p-5 space-y-3 transition-colors duration-150">
            <div className="flex items-center gap-2 mb-2">
              <Lightning className="w-4 h-4 text-emerald-800 dark:text-emerald-400" weight="fill" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Management Shortcuts
              </h3>
            </div>

            <Link href="/books/new" className="block">
              <button
                type="button"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#1b4332] to-[#245842] text-white font-bold text-xs shadow-xs hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4" weight="bold" />
                  <span>Register New Book</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-200" />
              </button>
            </Link>

            <Link href="/categories" className="block">
              <button
                type="button"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <TreeStructure className="w-4 h-4 text-emerald-800 dark:text-emerald-400" weight="bold" />
                  <span>Manage Taxonomy & Categories</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              </button>
            </Link>

            <Link href="/authors" className="block">
              <button
                type="button"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-blue-700 dark:text-blue-400" weight="bold" />
                  <span>Authors Directory</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              </button>
            </Link>

            <Link href="/publishers" className="block">
              <button
                type="button"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Buildings className="w-4 h-4 text-purple-700 dark:text-purple-400" weight="bold" />
                  <span>Publisher Imprints</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              </button>
            </Link>
          </div>

          {/* Real Taxonomy Summary Card */}
          <div className="bg-white dark:bg-[#0d121d] rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-none p-5 space-y-3 transition-colors duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TreeStructure className="w-4 h-4 text-emerald-800 dark:text-emerald-400" weight="bold" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Catalog Taxonomy
                </h3>
              </div>
              <Link href="/categories" className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Root Languages & Main</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{rootCategoriesCount}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Nested Subcategories</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{subCategoriesCount}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Total Registered Tags</span>
                <span className="font-bold text-emerald-800 dark:text-emerald-400">{totalCategories}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
