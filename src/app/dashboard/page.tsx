'use client';

import React from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  BookOpen,
  Users,
  Buildings,
  DownloadSimple,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  TreeStructure,
  Megaphone,
  Lightning,
  Funnel,
} from '@phosphor-icons/react';

export default function DashboardPage() {
  const recentActivities = [
    {
      id: 'act-1',
      title: 'Book "The Art of Storytelling" published',
      badge: 'Published',
      badgeVariant: 'success' as const,
      details: 'Assigned ISBN 978-1-250-301-44-5 • Published by Meridian Press',
      author: 'Claire Bennett (Lead Admin)',
      time: '14 mins ago',
      icon: BookOpen,
    },
    {
      id: 'act-2',
      title: 'Audiobook MP3 master uploaded for "Echoes of Tomorrow"',
      badge: 'Audio Master Ready',
      badgeVariant: 'info' as const,
      details: '9 audio chapters verified • Bitrate 320kbps stereo • Total length 8h 42m',
      author: 'Marcus T. (Audio Engineer)',
      time: '1 hour ago',
      icon: BookOpen,
    },
    {
      id: 'act-3',
      title: 'Author profile "Margaret Holloway" metadata modified',
      badge: 'Bio Updated',
      badgeVariant: 'default' as const,
      details: 'Updated biography section and linked 4 active publication records.',
      author: 'System (Editorial Batch)',
      time: '3 hours ago',
      icon: Users,
    },
  ];

  const newlyCatalogedTitles = [
    {
      id: 'bk-1',
      title: 'The Art of Storytelling',
      isbn: '978-1-250-301-44-5',
      author: 'Laura Simmons',
      publisher: 'Meridian Press',
      format: 'EPUB + Print',
      status: 'Live',
    },
    {
      id: 'bk-2',
      title: 'Echoes of Tomorrow',
      isbn: '978-0-385-545-31-9',
      author: 'Daniel Okafor',
      publisher: 'Riverstone Books',
      format: 'Audio + PDF',
      status: 'Review',
    },
    {
      id: 'bk-3',
      title: 'Roots & Rising',
      isbn: '978-0-525-559-12-6',
      author: 'Sofia Andersen',
      publisher: 'Crestwood Publishing',
      format: 'EPUB',
      status: 'Live',
    },
  ];

  return (
    <AdminShell>
      {/* Page Header */}
      <PageHeader
        title="Overview"
        actions={
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white px-3.5 py-2 rounded-lg border border-slate-200/80 shadow-xs">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Last 30 Days: Oct 18 - Nov 17, 2024</span>
            <DownloadSimple className="w-3.5 h-3.5 text-slate-400 ml-1 cursor-pointer hover:text-slate-700" />
          </div>
        }
      />

      {/* KPI Cards Grid matching Figma Slide 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* TOTAL BOOKS */}
        <Card className="relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1e4634]" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  TOTAL BOOKS
                </span>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  2,850
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5" weight="fill" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AUTHORS */}
        <Card className="relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1e4634]" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  AUTHORS
                </span>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  487
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Users className="w-5 h-5" weight="fill" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TOTAL BOOKS SOLD */}
        <Card className="relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1e4634]" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  TOTAL BOOKS SOLD
                </span>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  54
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <Buildings className="w-5 h-5" weight="fill" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* STAT 4 */}
        <Card className="relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1e4634]" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  CATALOG HEALTH
                </span>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  99.8%
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                <Lightning className="w-5 h-5" weight="fill" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Left Column (Activity & Cataloged) / Right Column (Quick Actions & Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 spans) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Operational Activity Card */}
          <Card>
            <CardHeader
              title="Recent Operational Activity"
              subtitle="Audit trails, publishing events, and system changes"
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Funnel className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Filter Events
                </Button>
              }
            />
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {recentActivities.map((act) => {
                  const Icon = act.icon;
                  return (
                    <div key={act.id} className="p-5 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100/60 text-[#1e4634] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" weight="fill" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-slate-900 truncate">{act.title}</p>
                          <Badge variant={act.badgeVariant} size="sm">
                            {act.badge}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{act.details}</p>
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                          <span>👤 {act.author}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {act.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Newly Cataloged Titles Table Card */}
          <Card>
            <CardHeader
              title="Newly Cataloged Titles"
              subtitle="Overview of recent publications pending retailer distribution"
              action={
                <Link
                  href="/books"
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                >
                  <span>View Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            />
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-6">Title</th>
                      <th className="py-3 px-6">Author</th>
                      <th className="py-3 px-6">Publisher</th>
                      <th className="py-3 px-6">Format</th>
                      <th className="py-3 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {newlyCatalogedTitles.map((title) => (
                      <tr key={title.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-6">
                          <span className="font-semibold text-slate-900 block">{title.title}</span>
                          <span className="text-[11px] font-mono text-slate-400">{title.isbn}</span>
                        </td>
                        <td className="py-3.5 px-6 text-slate-700 font-medium">{title.author}</td>
                        <td className="py-3.5 px-6 text-slate-600">{title.publisher}</td>
                        <td className="py-3.5 px-6">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-100">
                            {title.format}
                          </span>
                        </td>
                        <td className="py-3.5 px-6">
                          <StatusBadge status={title.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 span): Quick Actions & Distribution */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <Lightning className="w-4 h-4 text-emerald-800" weight="fill" />
                  <span>Quick Actions</span>
                </div>
              }
              subtitle="Direct shortcuts to register assets"
            />
            <CardContent className="space-y-2.5">
              <Link href="/books/new" className="block">
                <Button
                  className="w-full justify-between bg-[#1e4634] hover:bg-[#153426] shadow-sm font-semibold"
                  leftIcon={<Plus className="w-4 h-4" weight="bold" />}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Add Book
                </Button>
              </Link>

              <Link href="/authors" className="block">
                <Button
                  variant="secondary"
                  className="w-full justify-between hover:bg-slate-50"
                  leftIcon={<Users className="w-4 h-4 text-slate-500" />}
                  rightIcon={<ArrowRight className="w-4 h-4 text-slate-400" />}
                >
                  Add Author
                </Button>
              </Link>

              <Link href="/publishers" className="block">
                <Button
                  variant="secondary"
                  className="w-full justify-between hover:bg-slate-50"
                  leftIcon={<Buildings className="w-4 h-4 text-slate-500" />}
                  rightIcon={<ArrowRight className="w-4 h-4 text-slate-400" />}
                >
                  Add Publisher
                </Button>
              </Link>

              <Link href="/categories" className="block">
                <Button
                  variant="secondary"
                  className="w-full justify-between hover:bg-slate-50"
                  leftIcon={<TreeStructure className="w-4 h-4 text-slate-500" />}
                  rightIcon={<ArrowRight className="w-4 h-4 text-slate-400" />}
                >
                  Add Category
                </Button>
              </Link>

              <Link href="/advertisements" className="block">
                <Button
                  variant="secondary"
                  className="w-full justify-between hover:bg-slate-50"
                  leftIcon={<Megaphone className="w-4 h-4 text-slate-500" />}
                  rightIcon={<ArrowRight className="w-4 h-4 text-slate-400" />}
                >
                  Create Advertisement
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Distribution Progress Card */}
          <Card>
            <CardHeader title="Distribution" subtitle="Catalog format breakdown" />
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>Digital EPUB & PDF</span>
                  <span>30%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '30%' }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>Audiobooks</span>
                  <span>12%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '12%' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
