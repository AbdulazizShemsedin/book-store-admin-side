'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdatePlan } from '../hooks/use-plans';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plan } from '@/types/domain';
import { CurrencyDollar, Percent, FloppyDisk, CheckCircle } from '@phosphor-icons/react';
import { ApiError } from '@/lib/api/error-handler';

const editPlanSchema = z.object({
  price: z
    .string()
    .min(1, 'Price is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid decimal price (e.g. 49.99)'),
  discount: z.coerce
    .number()
    .min(0, 'Discount must be at least 0%')
    .max(100, 'Discount cannot exceed 100%')
    .optional(),
});

type EditPlanFormData = z.infer<typeof editPlanSchema>;

interface EditPlanModalProps {
  plan: Plan | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditPlanModal({
  plan,
  isOpen,
  onClose,
  onSuccess,
}: EditPlanModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditPlanFormData>({
    resolver: zodResolver(editPlanSchema),
    defaultValues: {
      price: plan?.price || '',
      discount: plan?.discount ?? 0,
    },
  });

  useEffect(() => {
    if (plan) {
      reset({
        price: plan.price || '',
        discount: plan.discount ?? 0,
      });
      setFormError(null);
      setFormSuccess(null);
    }
  }, [plan, reset]);

  const updateMutation = useUpdatePlan(() => {
    setFormSuccess('Subscription plan updated successfully!');
    if (onSuccess) onSuccess();
    setTimeout(() => {
      onClose();
    }, 900);
  });

  const onSubmit = async (data: EditPlanFormData) => {
    if (!plan) return;
    setFormError(null);
    setFormSuccess(null);

    try {
      await updateMutation.mutateAsync({
        id: plan.id,
        data: {
          price: data.price.trim(),
          discount: data.discount && data.discount > 0 ? data.discount : undefined,
        },
      });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Failed to update plan pricing. Please try again.');
      }
    }
  };

  if (!plan) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Subscription Plan"
      subtitle={`Configure base price and discount for ${plan.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {formSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{formSuccess}</span>
          </div>
        )}

        {formError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300">
            {formError}
          </div>
        )}

        {/* Plan Header Pill */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{plan.name}</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">ID: {plan.id}</p>
          </div>
          {plan.requireSeats && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
              Multi-Seat Tier
            </span>
          )}
        </div>

        {/* Base Price Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Base Subscription Price <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('price')}
            placeholder="e.g. 49.99"
            error={errors.price?.message}
            leftIcon={<CurrencyDollar className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {/* Promotional Discount Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Promotional Discount (%)
          </label>
          <Input
            type="number"
            {...register('discount')}
            placeholder="e.g. 20 (0 for no discount)"
            error={errors.discount?.message}
            leftIcon={<Percent className="w-4 h-4 text-slate-400" />}
            min={0}
            max={100}
          />
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Setting a percentage discount will compute the discounted price shown to subscribers.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={updateMutation.isPending}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={updateMutation.isPending}
            className="text-xs bg-[#1e4634] hover:bg-[#163527] text-white"
          >
            <FloppyDisk className="w-4 h-4 mr-1.5" />
            Save Plan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
