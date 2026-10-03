'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema, CategoryFormData } from '../schemas/category-schema';
import { useCreateCategory } from '../hooks/use-categories';
import { Category } from '@/types/domain';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/error-handler';

interface CreateCategoryCardProps {
  categories: Category[];
  onCancel?: () => void;
}

export function CreateCategoryCard({ categories, onCancel }: CreateCategoryCardProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter only root categories to serve as potential parents for subcategories
  const parentOptions = [
    { label: 'None (Top-Level Category)', value: '' },
    ...categories
      .filter((c) => !c.parentId)
      .map((c) => ({
        label: c.name,
        value: c.id,
      })),
  ];

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      parentId: '',
    },
  });

  const createMutation = useCreateCategory(() => {
    reset();
    setSuccessMessage('Category created successfully!');
    setTimeout(() => setSuccessMessage(null), 3500);
  });

  const onSubmit = async (data: CategoryFormData) => {
    setFormError(null);
    setSuccessMessage(null);
    try {
      await createMutation.mutateAsync({
        name: data.name,
        parentId: data.parentId ? data.parentId : null,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors.name) {
          setError('name', { message: err.fieldErrors.name });
        }
        setFormError(err.message);
      } else {
        setFormError('Failed to create category. Please check connection.');
      }
    }
  };

  return (
    <Card className="h-fit shadow-sm border-slate-200">
      <CardHeader
        title="Create Category"
        subtitle="Used to group literature across catalogs and mobile browsing."
      />
      <CardContent className="space-y-4">
        {formError && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200">
            {formError}
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name"
            required
            placeholder="Enter category name..."
            error={errors.name?.message}
            {...register('name')}
          />

          <Select
            label="Parent Category (Subcategories)"
            options={parentOptions}
            helperText="Select a parent category to create a hierarchical subcategory."
            {...register('parentId')}
          />

          <div className="flex items-center gap-3 pt-3">
            <Button
              type="submit"
              isLoading={createMutation.isPending}
              className="bg-[#1e4634] hover:bg-[#153426] flex-1"
            >
              Create
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
