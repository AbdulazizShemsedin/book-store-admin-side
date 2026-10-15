'use client';

import React, { useState, useMemo } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import {
  CategoryTable,
  CategoryLevelFilter,
} from '@/features/categories/components/category-table';
import { CreateCategoryModal } from '@/features/categories/components/create-category-modal';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { Pagination } from '@/components/tables/pagination';
import { Button } from '@/components/ui/button';
import {
  MagnifyingGlass,
  Plus,
  Folder,
  TreeStructure,
} from '@phosphor-icons/react';
import { Category } from '@/types/domain';
import { filterCategoryList } from '@/features/categories/utils/category-tree';
import { cn } from '@/lib/utils/cn';

export default function CategoriesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<CategoryLevelFilter>('all');

  // Modal creation state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalParentId, setModalParentId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useCategories({
    page,
    pageSize,
  });

  const categories = useMemo(() => data?.categories || [], [data?.categories]);
  const total = data?.total || categories.length;

  // Taxonomy Metrics
  const rootCount = useMemo(
    () => categories.filter((c) => !c.parentId).length,
    [categories]
  );
  const subCount = useMemo(
    () => categories.filter((c) => Boolean(c.parentId)).length,
    [categories]
  );

  // Smart search: preserves hierarchy and connects parent to matched children
  const filteredCategories = useMemo(
    () => filterCategoryList(categories, search),
    [categories, search]
  );

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
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Taxonomy' }]}
        title="Categories & Subcategories"
        actions={
          <Button
            onClick={() => handleOpenCreateModal(null)}
            leftIcon={<Plus className="w-4 h-4" weight="bold" />}
            className="bg-[#1e4634] hover:bg-[#153426] text-white"
          >
            New Category
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Interactive Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setLevelFilter('all')}
            className={cn(
              'p-4 rounded-xl border text-left transition-all shadow-xs flex items-center gap-3',
              levelFilter === 'all'
                ? 'bg-emerald-50/40 border-emerald-600 ring-2 ring-emerald-600/20'
                : 'bg-white border-slate-200/80 hover:border-slate-300'
            )}
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <TreeStructure className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Total Categories
              </span>
              <span className="text-xl font-bold text-slate-900">{categories.length}</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setLevelFilter('roots')}
            className={cn(
              'p-4 rounded-xl border text-left transition-all shadow-xs flex items-center gap-3',
              levelFilter === 'roots'
                ? 'bg-blue-50/40 border-blue-600 ring-2 ring-blue-600/20'
                : 'bg-white border-slate-200/80 hover:border-slate-300'
            )}
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Folder className="w-5 h-5" weight="fill" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Main Categories (L1)
              </span>
              <span className="text-xl font-bold text-slate-900">{rootCount}</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setLevelFilter('subs')}
            className={cn(
              'p-4 rounded-xl border text-left transition-all shadow-xs flex items-center gap-3',
              levelFilter === 'subs'
                ? 'bg-purple-50/40 border-purple-600 ring-2 ring-purple-600/20'
                : 'bg-white border-slate-200/80 hover:border-slate-300'
            )}
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <TreeStructure className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Subcategories (L2+)
              </span>
              <span className="text-xl font-bold text-slate-900">{subCount}</span>
            </div>
          </button>
        </div>

        {/* Search & Actions Strip */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="w-full sm:w-80 relative">
            <MagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by category or subcategory name..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-colors"
            />
          </div>
        </div>

        {/* Tree Table */}
        <div className="space-y-4">
          <CategoryTable
            categories={filteredCategories}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={() => refetch()}
            onAddSubcategory={handleAddSubcategoryFromTable}
            levelFilter={levelFilter}
            onLevelFilterChange={setLevelFilter}
          />

          {total > pageSize && (
            <Pagination
              currentPage={page}
              pageSize={pageSize}
              totalItems={total}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemLabel="categories"
            />
          )}
        </div>
      </div>

      {/* Guided Category Creation Modal */}
      <CreateCategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        categories={categories}
        initialParentId={modalParentId}
      />
    </AdminShell>
  );
}
