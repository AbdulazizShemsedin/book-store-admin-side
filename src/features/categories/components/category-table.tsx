'use client';

import React, { useState } from 'react';
import { Category } from '@/types/domain';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import {
  Folder,
  FolderOpen,
  CaretRight,
  CaretDown,
  Plus,
  TreeStructure,
  Tag,
  ArrowBendDownRight,
  ArrowClockwise,
} from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { useSubcategories } from '../hooks/use-categories';
import { cn } from '@/lib/utils/cn';

export type CategoryLevelFilter = 'all' | 'roots' | 'subs';
export type CategoryViewMode = 'tree' | 'flat';

interface CategoryTableProps {
  categories: Category[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onAddSubcategory?: (parentCategory: Category) => void;
  levelFilter?: CategoryLevelFilter;
  onLevelFilterChange?: (filter: CategoryLevelFilter) => void;
}

/**
 * Child drawer row that lazily fetches and renders subcategories on demand
 * avoiding recursive bulk API crawling.
 */
function SubcategoriesDrawer({
  parent,
  onAddSubcategory,
}: {
  parent: Category;
  onAddSubcategory?: (parentCategory: Category) => void;
}) {
  const { data: subcategories, isLoading, isError, error, refetch } = useSubcategories(parent.id, true);

  if (isLoading) {
    return (
      <tr className="bg-slate-50/70 border-b border-slate-100">
        <td colSpan={4} className="py-4 px-8">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <Spinner size="sm" />
            <span>Loading subcategories under &quot;{parent.name}&quot;...</span>
          </div>
        </td>
      </tr>
    );
  }

  if (isError) {
    return (
      <tr className="bg-red-50/40 border-b border-red-100">
        <td colSpan={4} className="py-3 px-8">
          <div className="flex items-center justify-between text-xs text-red-700">
            <span>Failed to load subcategories: {error?.message || 'Network error'}</span>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1 font-semibold underline hover:text-red-900"
            >
              <ArrowClockwise className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        </td>
      </tr>
    );
  }

  if (!subcategories || subcategories.length === 0) {
    return (
      <tr className="bg-slate-50/60 border-b border-slate-100">
        <td colSpan={4} className="py-4 px-8">
          <div className="flex items-center justify-between p-3 rounded-xl border border-dashed border-slate-200 bg-white">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Tag className="w-4 h-4 text-slate-400" />
              <span>No subcategories currently registered under <strong className="text-slate-700">{parent.name}</strong>.</span>
            </div>
            {onAddSubcategory && (
              <button
                type="button"
                onClick={() => onAddSubcategory(parent)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#1e4634] bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-lg transition-colors"
              >
                <Plus className="w-3 h-3" weight="bold" />
                <span>Add First Subcategory</span>
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="bg-slate-50/60 border-b border-slate-100">
      <td colSpan={4} className="py-3 px-6 sm:px-8">
        <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
          <div className="px-4 py-2 bg-slate-100/60 border-b border-slate-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <TreeStructure className="w-3.5 h-3.5 text-emerald-700" />
              <span>Subcategories of {parent.name} ({subcategories.length})</span>
            </div>
            {onAddSubcategory && (
              <button
                type="button"
                onClick={() => onAddSubcategory(parent)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1e4634] hover:underline"
              >
                <Plus className="w-3 h-3" weight="bold" />
                <span>Add Another Sub</span>
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {subcategories.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-3 hover:bg-emerald-50/20 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center text-slate-300 group-hover:text-emerald-700 transition-colors flex-shrink-0">
                    <ArrowBendDownRight className="w-4 h-4" weight="bold" />
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/60 text-indigo-700 flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <Tag className="w-3.5 h-3.5" weight="bold" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 truncate">
                        {sub.name}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                        {sub.id.length > 8 ? `${sub.id.slice(0, 8)}...` : sub.id}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                    Subcategory (L2)
                  </span>
                  {onAddSubcategory && (
                    <button
                      type="button"
                      onClick={() => onAddSubcategory(sub)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 hover:text-emerald-800 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 transition-colors shadow-2xs"
                      title={`Add nested sub-subcategory under ${sub.name}`}
                    >
                      <Plus className="w-3 h-3" weight="bold" />
                      <span>Add Nested Sub</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </td>
    </tr>
  );
}

export function CategoryTable({
  categories,
  isLoading,
  isError,
  error,
  onRetry,
  onAddSubcategory,
}: CategoryTableProps) {
  // Track expanded parent category rows
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#1e4634] flex items-center justify-center mb-3">
          <Spinner size="md" />
        </div>
        <p className="text-sm font-semibold text-slate-800">Loading catalog categories...</p>
        <p className="mt-1 text-xs text-slate-400">Retrieving paginated category list from catalog service</p>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load categories"
        message={error?.message || 'Unable to retrieve categories from taxonomy service.'}
        onRetry={onRetry}
      />
    );
  }

  if (categories.length === 0) {
    return (
      <div className="py-16 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center px-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 border border-slate-200/60 text-slate-400 flex items-center justify-center mb-3">
          <TreeStructure className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No categories found</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          Start organizing books into the catalog by creating your first category.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 font-bold text-slate-600">Category Name</th>
              <th className="py-3.5 px-4 font-bold text-slate-600 w-36 text-center">Type</th>
              <th className="py-3.5 px-4 font-bold text-slate-600 w-44">Subcategories</th>
              <th className="py-3.5 px-4 font-bold text-slate-600 text-right w-44">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((category) => {
              const isExpanded = expandedIds.has(category.id);

              return (
                <React.Fragment key={category.id}>
                  <tr
                    className={cn(
                      'group transition-colors border-b border-slate-100',
                      isExpanded ? 'bg-emerald-50/20' : 'bg-white hover:bg-slate-50/70'
                    )}
                  >
                    {/* Category Name & Expand Caret */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => toggleExpand(category.id)}
                          className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors flex-shrink-0"
                          aria-label={isExpanded ? 'Hide subcategories' : 'View subcategories'}
                          title={isExpanded ? 'Hide subcategories' : 'View subcategories'}
                        >
                          {isExpanded ? (
                            <CaretDown className="w-4 h-4 text-emerald-800" weight="bold" />
                          ) : (
                            <CaretRight className="w-4 h-4" weight="bold" />
                          )}
                        </button>

                        <div
                          className={cn(
                            'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors shadow-2xs',
                            isExpanded
                              ? 'bg-[#1e4634] text-white'
                              : 'bg-emerald-50 text-[#1e4634] border border-emerald-200/70'
                          )}
                        >
                          {isExpanded ? (
                            <FolderOpen className="w-4 h-4" weight="fill" />
                          ) : (
                            <Folder className="w-4 h-4" weight="fill" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {category.name}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                              {category.id.length > 8 ? `${category.id.slice(0, 8)}...` : category.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Level / Type */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#1e4634] border border-emerald-200/80 tracking-wide uppercase shadow-2xs">
                        Root Category
                      </span>
                    </td>

                    {/* Subcategories toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => toggleExpand(category.id)}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shadow-2xs',
                          isExpanded
                            ? 'bg-emerald-100/70 text-emerald-900 border border-emerald-300'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                        )}
                        title="Expand or collapse child subcategories"
                      >
                        {isExpanded ? (
                          <>
                            <CaretDown className="w-3.5 h-3.5 text-emerald-800" weight="bold" />
                            <span>Hide Subs</span>
                          </>
                        ) : (
                          <>
                            <CaretRight className="w-3.5 h-3.5 text-slate-400" weight="bold" />
                            <span>View Subs</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Quick Action: + Add Subcategory */}
                    <td className="py-3.5 px-4 text-right">
                      {onAddSubcategory && (
                        <button
                          type="button"
                          onClick={() => onAddSubcategory(category)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1e4634] bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98]"
                          title={`Add a subcategory nested under "${category.name}"`}
                        >
                          <Plus className="w-3 h-3 text-[#1e4634]" weight="bold" />
                          <span>Add Subcategory</span>
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Lazy-loaded Subcategories Row */}
                  {isExpanded && (
                    <SubcategoriesDrawer
                      parent={category}
                      onAddSubcategory={onAddSubcategory}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
