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
    <Card className="h-full">
      <CardHeader
        title="Most-sold books"
        subtitle="Top revenue drivers this period"
        action={
          <Badge variant="default" size="sm" className="font-semibold text-slate-600 bg-slate-100">
            Top 5
          </Badge>
        }
      />
      <CardContent className="p-0">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 px-4 w-8">#</th>
              <th className="py-2.5 px-4">Book</th>
              <th className="py-2.5 px-4 text-right">Sold</th>
              <th className="py-2.5 px-4 text-right">% of Sales</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {books.map((item) => (
              <tr key={item.rank} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-400">{item.rank}</td>
                <td className="py-3 px-4">
                  <span className="font-semibold text-slate-900 block">{item.title}</span>
                  {item.subtitle && (
                    <span className="text-[11px] text-slate-400 line-clamp-1">
                      {item.subtitle}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right font-bold text-slate-800">
                  {item.soldCount}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-800 text-[11px]">
                    {item.percentOfSales}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
          Top 5 account for: <span className="font-semibold text-slate-800">94%</span> of sales
        </div>
      </CardContent>
    </Card>
  );
}

interface MostSoldAudiobooksProps {
  audiobooks: TopSoldAudiobook[];
}

export function MostSoldAudiobooksCard({ audiobooks }: MostSoldAudiobooksProps) {
  return (
    <Card className="h-full">
      <CardHeader
        title="Most-sold audiobooks"
        subtitle="Top revenue drivers this period"
        action={
          <Badge variant="default" size="sm" className="font-semibold text-slate-600 bg-slate-100">
            Top 5
          </Badge>
        }
      />
      <CardContent className="p-0">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 px-4 w-8">#</th>
              <th className="py-2.5 px-4">Audiobook</th>
              <th className="py-2.5 px-4 text-right">Sold</th>
              <th className="py-2.5 px-4 text-right">Hour of Play</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {audiobooks.map((item) => (
              <tr key={item.rank} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-400">{item.rank}</td>
                <td className="py-3 px-4">
                  <span className="font-semibold text-slate-900 block">{item.title}</span>
                  {item.subtitle && (
                    <span className="text-[11px] text-slate-400 line-clamp-1">
                      {item.subtitle}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right font-bold text-slate-800">
                  {item.soldCount}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="px-2 py-0.5 rounded font-medium bg-blue-50 text-blue-800 text-[11px]">
                    {item.hoursPlayed} hrs
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
          Top 5 account for: <span className="font-semibold text-slate-800">90%</span> of sales
        </div>
      </CardContent>
    </Card>
  );
}
