'use client';

import React from 'react';
import { TransactionRecord } from '@/types/domain';
import { Headphones, BookOpen, Sparkle, User, UserMinus } from '@phosphor-icons/react';

interface TransactionsTableProps {
  transactions: TransactionRecord[];
  totalRecords: number;
}

export function TransactionsTable({ transactions, totalRecords }: TransactionsTableProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Live Transaction & Sales Records
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Real-time feed of digital book purchases and recurring subscriptions
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          {totalRecords} Total Records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-6">Item / Plan</th>
              <th className="py-3 px-6">Customer</th>
              <th className="py-3 px-6">Format / Stream</th>
              <th className="py-3 px-6">Date</th>
              <th className="py-3 px-6 text-right">Paid Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                  No purchase or subscription transactions recorded for this period.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-colors"
                >
                  {/* Title & Category */}
                  <td className="py-3.5 px-6">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs">
                      {tx.title}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      {tx.category}
                    </span>
                  </td>

                  {/* Customer & Deleted Account Indicator */}
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-1.5">
                      {tx.userDeletedAt ? (
                        <UserMinus className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                      )}
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {tx.userName || 'Customer'}
                      </span>
                      {tx.userDeletedAt && (
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                          title={`User account deleted on ${new Date(tx.userDeletedAt).toLocaleDateString()}`}
                        >
                          Deleted Account
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Format / Type Badges */}
                  <td className="py-3.5 px-6">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {tx.recordType === 'subscription' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60">
                          <Sparkle className="w-3 h-3 text-blue-600 dark:text-blue-400" weight="bold" />
                          <span>Subscription</span>
                        </span>
                      ) : (
                        tx.formats
                          .filter((fmt) => fmt.toLowerCase() !== 'print')
                          .map((fmt) => {
                            if (fmt === 'Audio') {
                              return (
                                <span
                                  key={fmt}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60"
                                >
                                  <Headphones
                                    className="w-3 h-3 text-indigo-600 dark:text-indigo-400"
                                    weight="bold"
                                  />
                                  <span>Audio</span>
                                </span>
                              );
                            }
                            return (
                              <span
                                key={fmt}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60"
                              >
                                <BookOpen
                                  className="w-3 h-3 text-emerald-700 dark:text-emerald-400"
                                  weight="bold"
                                />
                                <span>{fmt}</span>
                              </span>
                            );
                          })
                      )}
                    </div>
                  </td>

                  {/* Transaction Date */}
                  <td className="py-3.5 px-6 text-slate-500 dark:text-slate-400 text-xs">
                    {tx.date
                      ? new Date(tx.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>

                  {/* Amount Paid */}
                  <td className="py-3.5 px-6 text-right font-bold text-slate-900 dark:text-slate-100 text-xs font-mono">
                    ${tx.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
        <span className="font-medium">
          Showing {transactions.length} of {totalRecords} recorded transactions
        </span>
      </div>
    </div>
  );
}
