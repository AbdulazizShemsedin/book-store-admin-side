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
  ArrowClockwise,
} from '@phosphor-icons/react';
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
 * Recursive child drawer row that lazily fetches and renders nested subcategories
 * to arbitrary depth (up to 5 levels) on demand.
 */
interface SubcategoriesDrawerProps {
  parent: Category;
  depth?: number;
  onAddSubcategory?: (parentCategory: Category) => void;
  asNestedList?: boolean;
}

function SubcategoriesDrawer({
  parent,
  depth = 2,
  onAddSubcategory,
  asNestedList = false,
}: SubcategoriesDrawerProps) {
  const { data: subcategories, isLoading, isError, error, refetch } = useSubcategories(parent.id, true);
  const [expandedSubIds, setExpandedSubIds] = useState<Set<string>>(new Set());

  const toggleExpandSub = (id: string) => {
    setExpandedSubIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const content = (() => {
    if (isLoading) {
      return (
        <div className="py-3 px-4 flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          <Spinner size="sm" />
          <span>Loading Level {depth} subcategories under &quot;{parent.name}&quot;...</span>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="py-2.5 px-4 flex items-center justify-between text-xs text-red-700 dark:text-red-300 bg-red-50/50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-900/50 rounded-lg">
          <span>Failed to load Level {depth} categories: {error?.message || 'Network error'}</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1 font-semibold underline hover:text-red-900 dark:hover:text-red-200"
          >
            <ArrowClockwise className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      );
    }

    if (!subcategories || subcategories.length === 0) {
      return (
        <div className="p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Tag className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span>No subcategories registered under <strong className="text-slate-700 dark:text-slate-300">{parent.name}</strong>.</span>
          </div>
          {onAddSubcategory && depth < 5 && (
            <button
              type="button"
              onClick={() => onAddSubcategory(parent)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#1e4634] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 rounded-lg transition-colors"
            >
              <Plus className="w-3 h-3" weight="bold" />
              <span>Add Level {depth} Sub</span>
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xs overflow-hidden">
        <div className="px-4 py-2 bg-slate-100/60 dark:bg-slate-900/80 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            <TreeStructure className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>
              Subcategories of {parent.name} ({subcategories.length})
            </span>
          </div>
          {onAddSubcategory && depth < 5 && (
            <button
              type="button"
              onClick={() => onAddSubcategory(parent)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1e4634] dark:text-emerald-400 hover:underline"
            >
              <Plus className="w-3 h-3" weight="bold" />
              <span>Add Level {depth} Sub</span>
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {subcategories.map((sub) => {
            const isSubExpanded = expandedSubIds.has(sub.id);

            return (
              <div key={sub.id} className="p-3 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleExpandSub(sub.id)}
                      className="w-5 h-5 flex items-center justify-center rounded text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
                      title={isSubExpanded ? 'Hide nested children' : 'View nested children'}
                    >
                      {isSubExpanded ? (
                        <CaretDown className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" weight="bold" />
                      ) : (
                        <CaretRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" weight="bold" />
                      )}
                    </button>

                    <div
                      className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 shadow-2xs',
                        depth === 2 && 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300',
                        depth === 3 && 'bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/60 text-amber-800 dark:text-amber-300',
                        depth === 4 && 'bg-purple-50 dark:bg-purple-950/50 border border-purple-200/60 dark:border-purple-800/60 text-purple-800 dark:text-purple-300',
                        depth >= 5 && 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
                      )}
                    >
                      <Tag className="w-3.5 h-3.5" weight="bold" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {sub.name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {sub.id.length > 8 ? `${sub.id.slice(0, 8)}...` : sub.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                        depth === 2 && 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-800/60',
                        depth === 3 && 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/60',
                        depth === 4 && 'bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border-purple-200/70 dark:border-purple-800/60',
                        depth >= 5 && 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200/70 dark:border-rose-800/60'
                      )}
                    >
                      Level {depth}
                    </span>

                    {onAddSubcategory && depth < 5 && (
                      <button
                        type="button"
                        onClick={() => onAddSubcategory(sub)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
                        title={`Add nested child under ${sub.name}`}
                      >
                        <Plus className="w-3 h-3" weight="bold" />
                        <span>Add L{depth + 1} Sub</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Recursive Nested Subcategories Drawer */}
                {isSubExpanded && (
                  <div className="pl-4 border-l-2 border-emerald-400/80 dark:border-emerald-600/80 ml-3.5 mt-3 pt-1">
                    <SubcategoriesDrawer
                      parent={sub}
                      depth={depth + 1}
                      onAddSubcategory={onAddSubcategory}
                      asNestedList={true}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  })();

  if (asNestedList) {
    return <div className="w-full">{content}</div>;
  }

  return (
    <tr className="bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/80">
      <td colSpan={4} className="py-3 px-6 sm:px-8">
        {content}
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
      <div className="py-24 flex flex-col items-center justify-center glass-panel rounded-3xl shadow-xs transition-colors duration-150">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/60 text-[#1e4634] dark:text-emerald-400 flex items-center justify-center mb-3 border border-emerald-200/50 dark:border-emerald-800/40">
          <Spinner size="md" />
        </div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Loading catalog categories...</p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Retrieving paginated category list from catalog service</p>
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
      <div className="py-16 glass-panel rounded-3xl shadow-xs text-center px-4 transition-colors duration-150">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/10 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3">
          <TreeStructure className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No categories found</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Start organizing books into the catalog by creating your first category.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-3xl shadow-xs overflow-hidden transition-colors duration-150">
      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] min-h-[380px] relative scroll-smooth overscroll-contain">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="sticky top-0 z-10 glass-table-th backdrop-blur-2xl">
              <th className="py-3.5 px-4 font-bold">Category Name</th>
              <th className="py-3.5 px-4 font-bold w-36 text-center">Type</th>
              <th className="py-3.5 px-4 font-bold w-44">Subcategories</th>
              <th className="py-3.5 px-4 font-bold text-right w-44">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => {
              const isExpanded = expandedIds.has(category.id);

              return (
                <React.Fragment key={category.id}>
                  <tr
                    className={cn(
                      'glass-table-row group transition-colors',
                      isExpanded && 'bg-emerald-500/[0.08] dark:bg-emerald-400/[0.05]'
                    )}
                  >
                    {/* Category Name & Expand Caret */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => toggleExpand(category.id)}
                          className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
                          aria-label={isExpanded ? 'Hide subcategories' : 'View subcategories'}
                          title={isExpanded ? 'Hide subcategories' : 'View subcategories'}
                        >
                          {isExpanded ? (
                            <CaretDown className="w-4 h-4 text-emerald-800 dark:text-emerald-400" weight="bold" />
                          ) : (
                            <CaretRight className="w-4 h-4 text-slate-400 dark:text-slate-500" weight="bold" />
                          )}
                        </button>

                        <div
                          className={cn(
                            'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors shadow-2xs',
                            isExpanded
                              ? 'bg-[#1e4634] dark:bg-[#1b4332] text-white'
                              : 'bg-emerald-50 dark:bg-emerald-950/50 text-[#1e4634] dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60'
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
                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                              {category.name}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              {category.id.length > 8 ? `${category.id.slice(0, 8)}...` : category.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Level / Type */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-[#1e4634] dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 tracking-wide uppercase shadow-2xs">
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
                            ? 'bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60'
                            : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        )}
                        title="Expand or collapse child subcategories"
                      >
                        {isExpanded ? (
                          <>
                            <CaretDown className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" weight="bold" />
                            <span>Hide Subs</span>
                          </>
                        ) : (
                          <>
                            <CaretRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" weight="bold" />
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1e4634] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98]"
                          title={`Add a subcategory nested under "${category.name}"`}
                        >
                          <Plus className="w-3 h-3 text-[#1e4634] dark:text-emerald-300" weight="bold" />
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
