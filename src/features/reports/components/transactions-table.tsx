'use client';

import React from 'react';
import { TransactionRecord } from '@/types/domain';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartBar, Headphones, BookOpen, FileText } from '@phosphor-icons/react';

interface TransactionsTableProps {
  transactions: TransactionRecord[];
  totalRecords: number;
}

export function TransactionsTable({ transactions, totalRecords }: TransactionsTableProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader
        title="Transaction Records & Revenue Breakdown"
        subtitle="Catalog transactions, settlement balances, and multi-format sales distribution"
      />
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">Transaction</th>
                <th className="py-3 px-6">Title & Catalog Info</th>
                <th className="py-3 px-6">Author & Publisher</th>
                <th className="py-3 px-6">Format Support</th>
                <th className="py-3 px-6 text-right">Units Sold</th>
                <th className="py-3 px-6 text-right">Income</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Transaction ID */}
                  <td className="py-4 px-6 font-mono text-[11px] font-bold text-slate-700">
                    {tx.id}
                  </td>

                  {/* Title & Catalog Info */}
                  <td className="py-4 px-6">
                    <span className="font-semibold text-slate-900 block text-xs">
                      {tx.title}
                    </span>
                    <span className="text-[11px] text-slate-500">{tx.category}</span>
                  </td>

                  {/* Author & Publisher */}
                  <td className="py-4 px-6">
                    <span className="font-medium text-slate-800 block text-xs">
                      {tx.author}
                    </span>
                    <span className="text-[11px] text-slate-400">{tx.publisher}</span>
                  </td>

                  {/* Format Badges */}
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {tx.formats.map((fmt) => {
                        if (fmt === 'Audio') {
                          return (
                            <Badge
                              key={fmt}
                              variant="warning"
                              size="sm"
                              className="bg-amber-50 text-amber-800 border-amber-200 py-0"
                            >
                              <Headphones className="w-3 h-3 mr-0.5" />
                              <span>Audio</span>
                            </Badge>
                          );
                        }
                        if (fmt === 'EPUB') {
                          return (
                            <Badge
                              key={fmt}
                              variant="info"
                              size="sm"
                              className="bg-blue-50 text-blue-800 border-blue-200 py-0"
                            >
                              <BookOpen className="w-3 h-3 mr-0.5" />
                              <span>EPUB</span>
                            </Badge>
                          );
                        }
                        return (
                          <Badge
                            key={fmt}
                            variant="default"
                            size="sm"
                            className="bg-slate-100 text-slate-700 border-slate-200 py-0"
                          >
                            <FileText className="w-3 h-3 mr-0.5" />
                            <span>Print</span>
                          </Badge>
                        );
                      })}
                    </div>
                  </td>

                  {/* Units Sold */}
                  <td className="py-4 px-6 text-right font-bold text-slate-800 text-xs">
                    {tx.unitsSold.toLocaleString()}
                  </td>

                  {/* Income */}
                  <td className="py-4 px-6 text-right font-bold text-slate-900 text-xs font-mono">
                    ${tx.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>

                  {/* Action */}
                  <td className="py-4 px-6 text-center">
                    <button
                      type="button"
                      aria-label="View transaction analytics"
                      className="p-1.5 text-slate-400 hover:text-emerald-800 hover:bg-slate-100 rounded-md transition-colors"
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
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 text-xs text-slate-500 bg-slate-50/30">
          <span>
            Showing {transactions.length} of {totalRecords} Catalog Titles
          </span>
          <div className="flex items-center gap-1 font-medium">
            <button
              type="button"
              disabled
              className="px-2.5 py-1 text-slate-400 hover:bg-slate-100 rounded disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-2.5 py-1 bg-[#1e4634] text-white rounded font-bold">1</span>
            <button
              type="button"
              className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded"
            >
              2
            </button>
            <button
              type="button"
              className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded"
            >
              3
            </button>
            <button
              type="button"
              className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded"
            >
              Next
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
