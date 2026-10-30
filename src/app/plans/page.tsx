'use client';

import React, { useState } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { usePlans } from '@/features/plans/hooks/use-plans';
import { EditPlanModal } from '@/features/plans/components/edit-plan-modal';
import { Plan } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import {
  CreditCard,
  PencilSimple,
  Users,
  Check,
  Tag,
  CurrencyDollar,
  Sparkle,
} from '@phosphor-icons/react';

export default function PlansPage() {
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const { data, isLoading, isError, error, refetch } = usePlans();

  const plans = data?.plans || [];
  const total = data?.total || 0;

  return (
    <AdminShell>
      <PageHeader
        breadcrumbs={[{ label: 'Admin' }, { label: 'Subscription Plans' }]}
        title="Subscription Plans"
        subtitle="Manage membership tiers, multi-seat allowances, base recurring pricing, and active discount percentages."
        badge={
          <Badge variant="primary" size="md">
            {total} Active Tiers
          </Badge>
        }
      />

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center bg-white dark:bg-[#0d121d] rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-3">
            <Spinner size="md" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Loading subscription plans...
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Fetching configured membership tiers from backend
          </p>
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to load subscription plans"
          message={error?.message || 'Unable to retrieve plan configurations.'}
          onRetry={() => refetch()}
        />
      ) : plans.length === 0 ? (
        <div className="py-16 bg-white dark:bg-[#0d121d] rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-sm text-center px-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3">
            <CreditCard className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No subscription plans found
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            No active subscription tiers are currently configured on the platform.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => {
            const hasDiscount = typeof plan.discount === 'number' && plan.discount > 0;
            const numericPrice = parseFloat(plan.price) || 0;
            const computedDiscounted = hasDiscount
              ? (numericPrice * (1 - plan.discount! / 100)).toFixed(2)
              : null;

            return (
              <div
                key={plan.id}
                className="p-6 rounded-2xl bg-white dark:bg-[#0d121d] border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-col justify-between hover:border-emerald-500/40 transition-colors group"
              >
                <div>
                  {/* Card Top: Plan Name & Badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
                          {plan.name}
                        </h3>
                        {plan.requireSeats && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            Seat-based
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                        {plan.id.length > 12 ? `${plan.id.slice(0, 10)}...` : plan.id}
                      </p>
                    </div>
                    {hasDiscount ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Sparkle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        <span>{plan.discount}% OFF</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Standard
                      </span>
                    )}
                  </div>

                  {/* Pricing Display */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 mb-5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                        ${computedDiscounted || plan.price}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-slate-400 line-through">
                          ${plan.price}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        / recurring
                      </span>
                    </div>
                    {hasDiscount && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium mt-1">
                        Active {plan.discount}% promotion applied
                      </p>
                    )}
                  </div>

                  {/* Plan Features / Attributes */}
                  <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 mb-6">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-400 flex-shrink-0" />
                      <span>
                        {plan.requireSeats
                          ? `Multi-Seat (${plan.minimumSeats}${plan.maximumSeats ? ` to ${plan.maximumSeats}` : '+'} seats)`
                          : 'Single Subscriber Seat'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400 flex-shrink-0" />
                      <span>Full catalog audiobooks & eBooks streaming</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400 flex-shrink-0" />
                      <span>Live mobile app sync & offline caching</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    onClick={() => setEditingPlan(plan)}
                    variant="outline"
                    size="sm"
                    leftIcon={<PencilSimple className="w-3.5 h-3.5" weight="bold" />}
                    className="w-full text-xs font-semibold justify-center"
                  >
                    Edit Price & Discount
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Plan Modal */}
      <EditPlanModal
        plan={editingPlan}
        isOpen={Boolean(editingPlan)}
        onClose={() => setEditingPlan(null)}
        onSuccess={() => refetch()}
      />
    </AdminShell>
  );
}
