'use client';

import React, { useState, useMemo } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { CategoryTable } from '@/features/categories/components/category-table';
import { CreateCategoryModal } from '@/features/categories/components/create-category-modal';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { Pagination } from '@/components/tables/pagination';
import {
  MagnifyingGlass,
  Plus,
  X,
  Folders,
} from '@phosphor-icons/react';
import { Category } from '@/types/domain';

export default function CategoriesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  // Modal creation state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalParentId, setModalParentId] = useState<string | null>(null);

  // Single-request paginated categories query
  const { data, isLoading, isError, error, refetch } = useCategories({
    page,
    pageSize,
  });

  const rawCategories = useMemo(() => data?.categories || [], [data?.categories]);
  const total = data?.total ?? rawCategories.length;

  // Local search filter for currently displayed page
  const displayedCategories = useMemo(() => {
    if (!search.trim()) return rawCategories;
    const q = search.trim().toLowerCase();
    return rawCategories.filter((c) => c.name.toLowerCase().includes(q));
  }, [rawCategories, search]);

  const handleOpenCreateModal = (parentId: string | null = null) => {
    setModalParentId(parentId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalParentId(null);
  };

  const handleAddSubcategoryFromTable = (parentCategory: Category) => {
    handleOpenCreateModal(parentCategory.id);
  };

  return (
    <AdminShell>
      <PageHeader
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Categories' }]}
        title="Categories"
        actions={
          <button
            type="button"
            onClick={() => handleOpenCreateModal(null)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-[#1e4634] hover:bg-[#153426] transition-colors shadow-xs active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" weight="bold" />
            <span>New Category</span>
          </button>
        }
      />

      <div className="space-y-5">
        {/* Top Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="w-full sm:w-80 relative">
            <MagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category name..."
              className="w-full h-9 pl-9 pr-8 text-xs bg-slate-50/70 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e4634]/20 focus:border-[#1e4634] focus:bg-white transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="w-4 h-4 text-slate-400 hover:text-slate-700 flex items-center justify-center absolute right-2.5 top-1/2 -translate-y-1/2"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Folders className="w-4 h-4 text-[#1e4634]" weight="duotone" />
            <span className="font-semibold text-slate-800">{total}</span>
            <span>total categories recorded</span>
          </div>
        </div>

        {/* Categories Table */}
        <div className="space-y-4">
          <CategoryTable
            categories={displayedCategories}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={() => refetch()}
            onAddSubcategory={handleAddSubcategoryFromTable}
          />

          {/* Genuine Server-Side Pagination */}
          {total > 0 && (
            <Pagination
              currentPage={page}
              pageSize={pageSize}
              totalItems={total}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
              itemLabel="categories"
            />
          )}
        </div>
      </div>

      {/* Guided Category Creation Modal */}
      <CreateCategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        categories={rawCategories}
        initialParentId={modalParentId}
      />
    </AdminShell>
  );
}
