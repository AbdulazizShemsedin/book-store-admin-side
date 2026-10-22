'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { SeriesDetailHeader } from '@/features/series/components/series-detail-header';
import { SeriesBooksTable } from '@/features/series/components/series-books-table';
import { AddBookToSeriesModal } from '@/features/series/components/add-book-to-series-modal';
import { useSeriesDetail, useSeriesBooks } from '@/features/series/hooks/use-series';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { SeriesBook } from '@/types/domain';
import { ArrowLeft, Books } from '@phosphor-icons/react';

export default function SeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params?.id as string;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBookForEdit, setSelectedBookForEdit] = useState<SeriesBook | null>(null);

  const {
    data: series,
    isLoading: isLoadingSeries,
    isError: isSeriesError,
  } = useSeriesDetail(seriesId);

  const {
    data: booksData,
    isLoading: isLoadingBooks,
    isError: isBooksError,
  } = useSeriesBooks(seriesId);

  const books = booksData?.books || [];
  const totalBooks = books.length;

  // Next suggested position for a new volume
  const maxPosition = books.length > 0 ? Math.max(...books.map((b) => b.position)) : 0;
  const nextSuggestedPosition = Math.min(maxPosition + 1, 128);

  if (isLoadingSeries) {
    return (
      <AdminShell>
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-slate-500">Loading series details...</p>
        </div>
      </AdminShell>
    );
  }

  if (isSeriesError || !series) {
    return (
      <AdminShell>
        <div className="p-8 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
            <Books className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Series Not Found
          </h2>
          <p className="text-xs text-slate-500">
            The requested series could not be retrieved from the server.
          </p>
          <Button
            variant="secondary"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.push('/series')}
          >
            Back to Series Catalog
          </Button>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <SeriesDetailHeader
          series={series}
          totalBooks={totalBooks}
          onAddBookClick={() => setIsAddModalOpen(true)}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Volumes in this Series
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Ordered by volume sequence
            </span>
          </div>

          <SeriesBooksTable
            seriesId={seriesId}
            books={books}
            isLoading={isLoadingBooks}
            onEditPosition={(book) => setSelectedBookForEdit(book)}
            onAddBookClick={() => setIsAddModalOpen(true)}
          />
        </div>
      </div>

      {/* Add Volume Modal */}
      <AddBookToSeriesModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        seriesId={seriesId}
        seriesName={series.name}
        defaultPosition={nextSuggestedPosition}
      />

      {/* Edit Volume Position Modal */}
      {selectedBookForEdit && (
        <AddBookToSeriesModal
          isOpen={Boolean(selectedBookForEdit)}
          onClose={() => setSelectedBookForEdit(null)}
          seriesId={seriesId}
          seriesName={series.name}
          existingBook={selectedBookForEdit}
          defaultPosition={selectedBookForEdit.position}
        />
      )}
    </AdminShell>
  );
}
