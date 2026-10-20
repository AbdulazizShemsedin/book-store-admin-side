'use client';

import React from 'react';
import { TopSoldBook, TopSoldAudiobook } from '@/types/domain';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MostSoldBooksProps {
  books: TopSoldBook[];
}

export function MostSoldBooksCard({ books }: MostSoldBooksProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden h-full flex flex-col justify-between">
      <div>
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Most-Sold Books</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Top revenue drivers this period</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 uppercase">
            Top 5
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4 w-10">#</th>
                <th className="py-2.5 px-4">Book Title</th>
                <th className="py-2.5 px-4 text-right">Sold</th>
                <th className="py-2.5 px-4 text-right">% of Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {books.map((item) => (
                <tr key={item.rank} className="hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-400 dark:text-slate-500 text-xs">{item.rank}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">{item.title}</span>
                    {item.subtitle && (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 font-normal">
                        {item.subtitle}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-800 dark:text-slate-200">
                    {item.soldCount}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-block px-2 py-0.5 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[10px] border border-emerald-200/60 dark:border-emerald-800/60">
                      {item.percentOfSales}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="p-3.5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
        Top 5 account for <span className="font-bold text-slate-800 dark:text-slate-200">94%</span> of total volume
      </div>
    </div>
  );
}

interface MostSoldAudiobooksProps {
  audiobooks: TopSoldAudiobook[];
}

export function MostSoldAudiobooksCard({ audiobooks }: MostSoldAudiobooksProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden h-full flex flex-col justify-between">
      <div>
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Most-Played Audiobooks</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Top streaming audiobooks this period</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 uppercase">
            Top 5
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4 w-10">#</th>
                <th className="py-2.5 px-4">Audiobook Title</th>
                <th className="py-2.5 px-4 text-right">Sold</th>
                <th className="py-2.5 px-4 text-right">Hours Played</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {audiobooks.map((item) => (
                <tr key={item.rank} className="hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-400 dark:text-slate-500 text-xs">{item.rank}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">{item.title}</span>
                    {item.subtitle && (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 font-normal">
                        {item.subtitle}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-800 dark:text-slate-200">
                    {item.soldCount}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-block px-2 py-0.5 rounded-full font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 text-[10px] border border-blue-200/60 dark:border-blue-800/60">
                      {item.hoursPlayed} hrs
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="p-3.5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
        Top 5 account for <span className="font-bold text-slate-800 dark:text-slate-200">90%</span> of listening time
      </div>
    </div>
  );
}
