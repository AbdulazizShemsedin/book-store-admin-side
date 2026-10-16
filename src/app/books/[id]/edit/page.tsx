'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { useBook } from '@/features/books/hooks/use-books';
import { BookEditForm } from '@/features/books/components/book-edit-form';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from '@phosphor-icons/react';

export default function EditBookPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = typeof params?.id === 'string' ? params.id : '';

  const { data: book, isLoading, isError, error, refetch } = useBook(bookId);

  if (isLoading) {
    return (
      <AdminShell>
        <div className="py-24 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="mt-3 text-xs text-slate-500 font-medium">
            Loading book record from catalog...
          </p>
        </div>
      </AdminShell>
    );
  }

  if (isError || !book) {
    return (
      <AdminShell>
        <ErrorState
          title="Failed to load book record"
          message={error?.message || 'The requested book could not be retrieved from the catalog.'}
          onRetry={() => refetch()}
        />
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <PageHeader
        breadcrumbs={[
          { label: 'Catalog', href: '/books' },
          { label: 'Books', href: '/books' },
          { label: book.name || bookId, href: `/books/${bookId}` },
          { label: 'Edit' },
        ]}
        title={`Edit: ${book.name}`}
        subtitle="Update title, master language, author attribution, pricing, or media assets."
        actions={
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            onClick={() => router.push(`/books/${bookId}`)}
          >
            Back to Book Details
          </Button>
        }
      />

      <BookEditForm book={book} />
    </AdminShell>
  );
}
