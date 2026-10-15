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
import {
  MagnifyingGlass,
  Plus,
  Folder,
  TreeStructure,
  CheckCircle,
  X,
  Sparkle,
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
        title="Category Hierarchy & Taxonomy"
        actions={
          <button
            type="button"
            onClick={() => handleOpenCreateModal(null)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#1b4332] via-[#245842] to-[#2d6a4f] hover:from-[#153628] hover:to-[#245842] shadow-sm shadow-emerald-950/20 hover:shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-emerald-200" weight="bold" />
            <span>Create Category</span>
          </button>
        }
      />

      <div className="space-y-6">
        {/* Interactive KPI Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Total Categories */}
          <button
            type="button"
            onClick={() => setLevelFilter('all')}
            className={cn(
              'group relative p-4 rounded-2xl border text-left transition-all duration-200 shadow-xs flex items-center justify-between',
              levelFilter === 'all'
                ? 'bg-gradient-to-br from-emerald-50/80 to-white border-emerald-600 ring-2 ring-emerald-600/20 shadow-emerald-900/5'
                : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
            )}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors shadow-2xs',
                  levelFilter === 'all'
                    ? 'bg-[#1b4332] text-white shadow-emerald-900/20'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 group-hover:bg-emerald-100/70'
                )}
              >
                <TreeStructure className="w-5 h-5" weight={levelFilter === 'all' ? 'fill' : 'regular'} />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Categories
                </span>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {categories.length}
                </span>
              </div>
            </div>

            {levelFilter === 'all' && (
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs animate-in zoom-in-75 duration-150">
                <CheckCircle className="w-3.5 h-3.5" weight="bold" />
              </span>
            )}
          </button>

          {/* Card 2: Main Categories (L1) */}
          <button
            type="button"
            onClick={() => setLevelFilter('roots')}
            className={cn(
              'group relative p-4 rounded-2xl border text-left transition-all duration-200 shadow-xs flex items-center justify-between',
              levelFilter === 'roots'
                ? 'bg-gradient-to-br from-blue-50/80 to-white border-blue-600 ring-2 ring-blue-600/20 shadow-blue-900/5'
                : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
            )}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors shadow-2xs',
                  levelFilter === 'roots'
                    ? 'bg-blue-600 text-white shadow-blue-900/20'
                    : 'bg-blue-50 text-blue-700 border border-blue-200/60 group-hover:bg-blue-100/70'
                )}
              >
                <Folder className="w-5 h-5" weight="fill" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Root Sections (L1)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                    {rootCount}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    ({categories.length ? Math.round((rootCount / categories.length) * 100) : 0}% of catalog)
                  </span>
                </div>
              </div>
            </div>

            {levelFilter === 'roots' && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xs animate-in zoom-in-75 duration-150">
                <CheckCircle className="w-3.5 h-3.5" weight="bold" />
              </span>
            )}
          </button>

          {/* Card 3: Subcategories (L2+) */}
          <button
            type="button"
            onClick={() => setLevelFilter('subs')}
            className={cn(
              'group relative p-4 rounded-2xl border text-left transition-all duration-200 shadow-xs flex items-center justify-between',
              levelFilter === 'subs'
                ? 'bg-gradient-to-br from-indigo-50/80 to-white border-indigo-600 ring-2 ring-indigo-600/20 shadow-indigo-900/5'
                : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
            )}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors shadow-2xs',
                  levelFilter === 'subs'
                    ? 'bg-indigo-600 text-white shadow-indigo-900/20'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60 group-hover:bg-indigo-100/70'
                )}
              >
                <TreeStructure className="w-5 h-5" weight="bold" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Nested Subcategories (L2+)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                    {subCount}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    ({categories.length ? Math.round((subCount / categories.length) * 100) : 0}% nested)
                  </span>
                </div>
              </div>
            </div>

            {levelFilter === 'subs' && (
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xs animate-in zoom-in-75 duration-150">
                <CheckCircle className="w-3.5 h-3.5" weight="bold" />
              </span>
            )}
          </button>
        </div>

        {/* Search Bar Strip */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="w-full sm:w-96 relative group">
            <MagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-700 transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by category, subcategory, or parent name..."
              className="w-full h-10 pl-10 pr-9 text-xs font-medium bg-white border border-slate-200/90 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 shadow-2xs transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                title="Clear search"
              >
                <X className="w-3 h-3" weight="bold" />
              </button>
            )}
          </div>

          {search && (
            <div className="text-xs font-medium text-slate-500">
              Showing <span className="font-bold text-slate-800">{filteredCategories.length}</span> matching entries
            </div>
          )}
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
