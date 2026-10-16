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
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden h-full flex flex-col justify-between">
      <div>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Most-Sold Books</h3>
            <p className="text-xs text-slate-400 mt-0.5">Top revenue drivers this period</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/60 uppercase">
            Top 5
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4 w-10">#</th>
                <th className="py-2.5 px-4">Book Title</th>
                <th className="py-2.5 px-4 text-right">Sold</th>
                <th className="py-2.5 px-4 text-right">% of Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {books.map((item) => (
                <tr key={item.rank} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-400 text-xs">{item.rank}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{item.title}</span>
                    {item.subtitle && (
                      <span className="text-[11px] text-slate-400 line-clamp-1 font-normal">
                        {item.subtitle}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-800">
                    {item.soldCount}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-block px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 text-[10px] border border-emerald-200/60">
                      {item.percentOfSales}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="p-3.5 bg-slate-50/50 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
        Top 5 account for <span className="font-bold text-slate-800">94%</span> of total volume
      </div>
    </div>
  );
}

interface MostSoldAudiobooksProps {
  audiobooks: TopSoldAudiobook[];
}

export function MostSoldAudiobooksCard({ audiobooks }: MostSoldAudiobooksProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden h-full flex flex-col justify-between">
      <div>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Most-Played Audiobooks</h3>
            <p className="text-xs text-slate-400 mt-0.5">Top streaming audiobooks this period</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/60 uppercase">
            Top 5
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4 w-10">#</th>
                <th className="py-2.5 px-4">Audiobook Title</th>
                <th className="py-2.5 px-4 text-right">Sold</th>
                <th className="py-2.5 px-4 text-right">Hours Played</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {audiobooks.map((item) => (
                <tr key={item.rank} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-400 text-xs">{item.rank}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{item.title}</span>
                    {item.subtitle && (
                      <span className="text-[11px] text-slate-400 line-clamp-1 font-normal">
                        {item.subtitle}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-800">
                    {item.soldCount}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-block px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-800 text-[10px] border border-blue-200/60">
                      {item.hoursPlayed} hrs
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="p-3.5 bg-slate-50/50 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
        Top 5 account for <span className="font-bold text-slate-800">90%</span> of listening time
      </div>
    </div>
  );
}
