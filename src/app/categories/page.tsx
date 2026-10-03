'use client';

import React, { useState } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { CategoryTable } from '@/features/categories/components/category-table';
import { CreateCategoryCard } from '@/features/categories/components/create-category-card';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { Pagination } from '@/components/tables/pagination';
import { Button } from '@/components/ui/button';
import { Plus, MagnifyingGlass } from '@phosphor-icons/react';

export default function CategoriesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, error, refetch } = useCategories({
    page,
    pageSize,
    search,
  });

  const categories = data?.categories || [];
  const total = data?.total || categories.length;

  const filteredCategories = search
    ? categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : categories;

  return (
    <AdminShell>
      <PageHeader
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Taxonomy' }]}
        title="Categories"
        actions={
          <Button
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" weight="bold" />}
            onClick={() => {
              const el = document.getElementById('category-name');
              if (el) el.focus();
            }}
            className="bg-[#1e4634] hover:bg-[#153426]"
          >
            Add Category
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Search & Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="w-full sm:w-80 relative">
            <MagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-colors"
            />
          </div>

          <CategoryTable
            categories={filteredCategories}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={() => refetch()}
            onEdit={(cat) => alert(`Editing category: ${cat.name}`)}
            onDelete={(cat) => alert(`Delete category: ${cat.name}`)}
          />

          <Pagination
            currentPage={page}
            pageSize={pageSize}
            totalItems={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemLabel="categories"
          />
        </div>

        {/* Right Column: Create Category / Subcategory Card */}
        <div className="lg:col-span-1">
          <CreateCategoryCard categories={categories} />
        </div>
      </div>
    </AdminShell>
  );
}
