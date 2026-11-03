'use client';

import React, { useState, useMemo } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { CategoryTable, CategoryBreadcrumb } from '@/features/categories/components/category-table';
import { CreateCategoryModal } from '@/features/categories/components/create-category-modal';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { Pagination } from '@/components/tables/pagination';
import {
  MagnifyingGlass,
  Plus,
  X,
  Folders,
  House,
  FolderOpen,
} from '@phosphor-icons/react';
import { Category } from '@/types/domain';
import { useDebounce } from '@/lib/hooks/use-debounce';

export default function CategoriesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Breadcrumbs drill-down navigation state
  const [breadcrumbs, setBreadcrumbs] = useState<CategoryBreadcrumb[]>([
    { id: null, name: 'Root Categories' },
  ]);

  const currentBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
  const currentParentId = currentBreadcrumb.id;
  const isRootLevel = currentParentId === null;

  const currentParentCategory: Category | null = useMemo(() => {
    if (!currentParentId) return null;
    return {
      id: currentParentId,
      name: currentBreadcrumb.name,
    };
  }, [currentParentId, currentBreadcrumb.name]);

  // Modal creation state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalParentId, setModalParentId] = useState<string | null>(null);
  const [modalParentCategory, setModalParentCategory] = useState<Category | null>(null);

  // Paginated categories query for current level (roots or current parent's children)
  const { data, isLoading, isError, error, refetch } = useCategories({
    page,
    pageSize,
    parentId: currentParentId || undefined,
    search: debouncedSearch || undefined,
  });

  const rawCategories = useMemo(() => data?.categories || [], [data?.categories]);
  const total = data?.total ?? rawCategories.length;

  // Local search filter for currently displayed page
  const displayedCategories = useMemo(() => {
    if (!search.trim()) return rawCategories;
    const q = search.trim().toLowerCase();
    return rawCategories.filter((c) => c.name.toLowerCase().includes(q));
  }, [rawCategories, search]);

  // Breadcrumb navigation handlers
  const handleDrillDown = (category: Category) => {
    setBreadcrumbs((prev) => [...prev, { id: category.id, name: category.name }]);
    setPage(1);
    setSearch('');
  };

  const handleNavigateBreadcrumb = (index: number) => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
    setPage(1);
    setSearch('');
  };

  const handleNavigateRoot = () => {
    setBreadcrumbs([{ id: null, name: 'Root Categories' }]);
    setPage(1);
    setSearch('');
  };

  const handleGoUpOneLevel = () => {
    if (breadcrumbs.length > 1) {
      setBreadcrumbs((prev) => prev.slice(0, prev.length - 1));
      setPage(1);
      setSearch('');
    }
  };

  const handleOpenCreateModal = (parentCategory: Category | null = null) => {
    // If no specific parent passed, default to current folder level
    const targetParent = parentCategory || currentParentCategory;
    setModalParentCategory(targetParent);
    setModalParentId(targetParent ? targetParent.id : null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalParentId(null);
    setModalParentCategory(null);
  };

  const handleAddSubcategoryFromTable = (parentCategory: Category) => {
    handleOpenCreateModal(parentCategory);
  };

  return (
    <AdminShell>
      <PageHeader
        breadcrumbs={[
          { label: 'Catalog', href: '/books' },
          { label: 'Categories', href: '/categories' },
          ...(isRootLevel
            ? []
            : [
                {
                  label: currentParentCategory?.name || 'Subcategories',
                },
              ]),
        ]}
        title={isRootLevel ? 'Categories Taxonomy' : `Subcategories: ${currentParentCategory?.name}`}
        subtitle={
          isRootLevel
            ? 'Centralized category hierarchy. Click any folder to drill down into its subcategories.'
            : `Showing nested subcategories inside "${currentParentCategory?.name}". Breadcrumbs allow instant jump to any parent level.`
        }
        actions={
          <div className="flex items-center gap-2">
            {!isRootLevel && (
              <button
                type="button"
                onClick={handleNavigateRoot}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 glass-pill hover:bg-white/80 dark:hover:bg-white/10 shadow-2xs transition-all active:scale-[0.98]"
              >
                <House className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>Root Categories</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleOpenCreateModal(currentParentCategory)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#1e4634] hover:bg-[#153426] transition-colors shadow-xs active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" weight="bold" />
              <span>{isRootLevel ? 'New Root Category' : `Add Subcategory in "${currentParentCategory?.name}"`}</span>
            </button>
          </div>
        }
      />

      {/* Top Controls Bar */}
      <div className="glass-panel p-3.5 rounded-2xl mb-4 relative z-10 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="w-full sm:w-80 relative">
            <MagnifyingGlass className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isRootLevel ? 'Filter root categories...' : `Filter inside ${currentParentCategory?.name}...`}
              className="w-full h-9 pl-9 pr-8 text-xs bg-white/70 dark:bg-white/[0.05] border border-white/90 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1e4634]/20 dark:focus:ring-emerald-500/20 focus:border-[#1e4634] dark:focus:border-emerald-500 transition-colors shadow-2xs backdrop-blur-md"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="w-4 h-4 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center absolute right-2.5 top-1/2 -translate-y-1/2"
                title="Clear filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <Folders className="w-4 h-4 text-[#1e4634] dark:text-emerald-400" weight="duotone" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">{total}</span>
            <span>{isRootLevel ? 'root categories' : 'subcategories in this folder'}</span>
          </div>
        </div>
      </div>

      {/* Drill-Down Categories Table & Pagination */}
      <div className="space-y-0">
        <CategoryTable
          categories={displayedCategories}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={() => refetch()}
          onAddSubcategory={handleAddSubcategoryFromTable}
          breadcrumbs={breadcrumbs}
          currentParent={currentParentCategory}
          onDrillDown={handleDrillDown}
          onNavigateBreadcrumb={handleNavigateBreadcrumb}
          onNavigateRoot={handleNavigateRoot}
          onGoUpOneLevel={handleGoUpOneLevel}
        />

        {/* Server-Side Pagination for current level */}
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
            itemLabel={isRootLevel ? 'categories' : 'subcategories'}
          />
        )}
      </div>

      {/* Guided Category Creation Modal */}
      <CreateCategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        categories={rawCategories}
        initialParentId={modalParentId}
        initialParentCategory={modalParentCategory}
      />
    </AdminShell>
  );
}
