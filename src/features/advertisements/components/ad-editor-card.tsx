'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { advertisementSchema, AdvertisementFormData } from '../schemas/advertisement-schema';
import { useCreateAdvertisement } from '../hooks/use-advertisements';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileDropzone } from '@/components/uploads/file-dropzone';
import { Megaphone, CheckCircle } from '@phosphor-icons/react';

interface AdEditorCardProps {
  currentCount: number;
  onCancel?: () => void;
}

export function AdEditorCard({ currentCount, onCancel }: AdEditorCardProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AdvertisementFormData>({
    resolver: zodResolver(advertisementSchema),
    defaultValues: {
      message: '',
      order: currentCount + 1,
      status: 'active',
      imageUrl: '',
    },
  });

  const watchedOrder = watch('order');

  const createMutation = useCreateAdvertisement(() => {
    reset();
    setUploadedImageUrl(null);
    setSuccessMessage('Advertisement banner published successfully!');
    setTimeout(() => setSuccessMessage(null), 3500);
  });

  const onSubmit = async (data: AdvertisementFormData) => {
    setSuccessMessage(null);
    await createMutation.mutateAsync({
      ...data,
      imageUrl:
        uploadedImageUrl ||
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    });
  };

  return (
    <Card id="ad-editor-card" className="h-fit shadow-sm border-slate-200 scroll-mt-24 transition-all duration-500">
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#1e4634]" />
            <span>Advertisement editor</span>
          </div>
        }
        action={
          <Badge variant="primary" size="sm" className="font-semibold">
            New banner
          </Badge>
        }
      />
      <CardContent className="space-y-4">
        {successMessage && (
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Ad message"
            required
            placeholder="e.g. 30% OFF BOOKS"
            error={errors.message?.message}
            {...register('message')}
          />

          {/* Order of Display Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Order of Display <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">Position in mobile carousel</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'First (1st)', val: 1 },
                { label: 'Second (2nd)', val: 2 },
                { label: 'Third (3rd)', val: 3 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setValue('order', opt.val)}
                  className={`py-2 px-2 rounded-lg border text-xs font-medium transition-colors text-center ${
                    watchedOrder === opt.val
                      ? 'border-emerald-700 bg-emerald-50 text-[#1e4634] font-semibold'
                      : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Background Image Upload Zone */}
          <FileDropzone
            label="Background image"
            required
            accept={{
              'image/png': ['.png'],
              'image/jpeg': ['.jpg', '.jpeg'],
              'image/webp': ['.webp'],
            }}
            maxSizeMB={10}
            iconType="image"
            helperText="Drag & drop or click to upload. Recommended: 1200 x 400 (PNG, JPG)"
            onUploaded={(result) => {
              setUploadedImageUrl(
                'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80'
              );
              setValue('imageUrl', result.key);
            }}
          />

          {/* Status Radio */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Initial Status
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  value="active"
                  defaultChecked
                  className="text-emerald-800 focus:ring-emerald-700/20"
                  {...register('status')}
                />
                <span>Active</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  value="disabled"
                  className="text-emerald-800 focus:ring-emerald-700/20"
                  {...register('status')}
                />
                <span>Disabled</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              isLoading={createMutation.isPending}
              className="bg-[#1e4634] hover:bg-[#153426] flex-1 font-semibold"
            >
              Save
            </Button>
            {onCancel && (
              <Button type="button" variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
