'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { publisherSchema, PublisherFormData } from '../schemas/publisher-schema';
import { useCreatePublisher } from '../hooks/use-publishers';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Buildings } from '@phosphor-icons/react';

interface PublisherFormCardProps {
  onCancel?: () => void;
}

export function PublisherFormCard({ onCancel }: PublisherFormCardProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PublisherFormData>({
    resolver: zodResolver(publisherSchema),
    defaultValues: {
      name: '',
    },
  });

  const createMutation = useCreatePublisher(() => {
    reset();
    setSuccessMessage('Publisher registered successfully!');
    setTimeout(() => setSuccessMessage(null), 3500);
  });

  const onSubmit = async (data: PublisherFormData) => {
    setSuccessMessage(null);
    await createMutation.mutateAsync(data);
  };

  return (
    <Card className="h-fit shadow-sm border-slate-200">
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <Buildings className="w-5 h-5 text-[#1e4634]" />
            <span>Add / Edit Publisher</span>
          </div>
        }
      />
      <CardContent className="space-y-4">
        {successMessage && (
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Publisher Name"
            required
            placeholder="e.g. Darussalam Publishers"
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              isLoading={createMutation.isPending}
              className="bg-[#1e4634] hover:bg-[#153426] flex-1"
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
