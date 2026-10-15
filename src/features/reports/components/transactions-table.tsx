'use client';

import React from 'react';
import { TransactionRecord } from '@/types/domain';
import { Badge } from '@/components/ui/badge';
import { ChartBar, Headphones, BookOpen } from '@phosphor-icons/react';

interface TransactionsTableProps {
  transactions: TransactionRecord[];
  totalRecords: number;
}

export function TransactionsTable({ transactions, totalRecords }: TransactionsTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-200/80">
        <h3 className="text-sm font-bold text-slate-900">Transaction & Sales Records</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Settlement balances and multi-format sales distribution
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-6">Title & Category</th>
              <th className="py-3 px-6">Author & Publisher</th>
              <th className="py-3 px-6">Available Formats</th>
              <th className="py-3 px-6 text-right">Units Sold</th>
              <th className="py-3 px-6 text-right">Revenue</th>
              <th className="py-3 px-6 text-center">Analytics</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-emerald-50/20 transition-colors">
                {/* Title & Catalog Info */}
                <td className="py-3.5 px-6">
                  <span className="font-bold text-slate-900 block text-xs">
                    {tx.title}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{tx.category}</span>
                </td>

                {/* Author & Publisher */}
                <td className="py-3.5 px-6">
                  <span className="font-semibold text-slate-800 block text-xs">
                    {tx.author}
                  </span>
                  <span className="text-[11px] text-slate-400">{tx.publisher}</span>
                </td>

                {/* Format Badges */}
                <td className="py-3.5 px-6">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {tx.formats
                      .filter((fmt) => fmt.toLowerCase() !== 'print')
                      .map((fmt) => {
                        if (fmt === 'Audio') {
                          return (
                            <span
                              key={fmt}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70"
                            >
                              <Headphones className="w-3 h-3 text-indigo-600" weight="bold" />
                              <span>Audio</span>
                            </span>
                          );
                        }
                        return (
                          <span
                            key={fmt}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/70"
                          >
                            <BookOpen className="w-3 h-3 text-emerald-700" weight="bold" />
                            <span>{fmt}</span>
                          </span>
                        );
                      })}
                  </div>
                </td>

                {/* Units Sold */}
                <td className="py-3.5 px-6 text-right font-bold text-slate-800 text-xs">
                  {tx.unitsSold.toLocaleString()}
                </td>

                {/* Income */}
                <td className="py-3.5 px-6 text-right font-bold text-slate-900 text-xs font-mono">
                  ${tx.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>

                {/* Action */}
                <td className="py-3.5 px-6 text-center">
                  <button
                    type="button"
                    aria-label="View transaction analytics"
                    title="View transaction analytics"
                    className="p-1.5 text-slate-400 hover:text-emerald-800 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <ChartBar className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 text-xs text-slate-500 bg-slate-50/50">
        <span className="font-medium">
          Showing {transactions.length} of {totalRecords} recorded titles
        </span>
      </div>
    </div>
  );
}
