'use client';

import React from 'react';
import { Category } from '@/types/domain';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import {
  Folder,
  FolderOpen,
  ArrowRight,
  ArrowLeft,
  House,
  TreeStructure,
  Tag,
  Plus,
  CaretRight,
  FolderPlus,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils/cn';

export interface CategoryBreadcrumb {
  id: string | null;
  name: string;
}

interface CategoryTableProps {
  categories: Category[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onAddSubcategory?: (parentCategory: Category) => void;
  // Breadcrumb Drill-Down Props
  breadcrumbs: CategoryBreadcrumb[];
  currentParent: Category | null;
  onDrillDown: (category: Category) => void;
  onNavigateBreadcrumb: (index: number) => void;
  onNavigateRoot: () => void;
  onGoUpOneLevel: () => void;
}

export function CategoryTable({
  categories,
  isLoading,
  isError,
  error,
  onRetry,
  onAddSubcategory,
  breadcrumbs,
  currentParent,
  onDrillDown,
  onNavigateBreadcrumb,
  onNavigateRoot,
  onGoUpOneLevel,
}: CategoryTableProps) {
  const isRootLevel = breadcrumbs.length <= 1;
  const currentDepth = breadcrumbs.length;

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center glass-panel rounded-3xl shadow-xs transition-colors duration-150">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/60 text-[#1e4634] dark:text-emerald-400 flex items-center justify-center mb-3 border border-emerald-200/50 dark:border-emerald-800/40">
          <Spinner size="md" />
        </div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {isRootLevel ? 'Loading root categories...' : `Loading subcategories of "${currentParent?.name}"...`}
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Retrieving taxonomy records from catalog service
        </p>
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

  return (
    <div className="glass-panel rounded-3xl shadow-xs overflow-hidden transition-colors duration-150">
      {/* ========================================================= */}
      {/* DRILL-DOWN BREADCRUMB BAR (Google Drive / macOS Finder Style) */}
      {/* ========================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-slate-50/90 dark:bg-slate-900/60 border-b border-slate-200/70 dark:border-white/10">
        {/* Left: Breadcrumbs Trail */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          {/* If not at root, show quick "Up Level" button */}
          {!isRootLevel && (
            <button
              type="button"
              onClick={onGoUpOneLevel}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-emerald-300 bg-white dark:bg-white/[0.08] hover:bg-emerald-50 dark:hover:bg-white/[0.14] border border-slate-200/80 dark:border-white/10 shadow-2xs font-semibold mr-1 transition-all active:scale-[0.98]"
              title="Go up one folder level"
            >
              <ArrowLeft className="w-3.5 h-3.5" weight="bold" />
              <span>Up Level</span>
            </button>
          )}

          {/* Root Level button */}
          <button
            type="button"
            onClick={onNavigateRoot}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all active:scale-[0.98]',
              isRootLevel
                ? 'bg-[#1e4634] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/[0.06] border border-transparent hover:border-slate-200/60 dark:hover:border-white/10'
            )}
          >
            <House className="w-3.5 h-3.5" weight={isRootLevel ? 'fill' : 'bold'} />
            <span>Root Categories</span>
          </button>

          {/* Subcategory Breadcrumb Segments */}
          {breadcrumbs.slice(1).map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 2;
            const originalIndex = idx + 1;

            return (
              <React.Fragment key={crumb.id || idx}>
                <CaretRight className="w-3 h-3 text-slate-400 dark:text-slate-500 flex-shrink-0" weight="bold" />
                <button
                  type="button"
                  onClick={() => onNavigateBreadcrumb(originalIndex)}
                  disabled={isLast}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all max-w-[220px]',
                    isLast
                      ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-xs cursor-default'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/[0.06] border border-transparent hover:border-slate-200/60 dark:hover:border-white/10 active:scale-[0.98]'
                  )}
                  title={crumb.name}
                >
                  <Folder className="w-3.5 h-3.5 flex-shrink-0" weight={isLast ? 'fill' : 'bold'} />
                  <span className="truncate">{crumb.name}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Right: Level Badge & Quick Actions */}
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white dark:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Level {currentDepth}</span>
            <span className="text-slate-400 font-normal">
              {isRootLevel ? '• Top Level' : `• In "${currentParent?.name}"`}
            </span>
          </span>

          {!isRootLevel && (
            <button
              type="button"
              onClick={onNavigateRoot}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline px-1 py-0.5"
            >
              Root Level
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* CATEGORIES TABLE OR LEAF EMPTY STATE */}
      {/* ========================================================= */}
      {categories.length === 0 ? (
        <div className="py-20 text-center px-4 transition-colors duration-150">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
            <FolderOpen className="w-8 h-8" weight="duotone" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            {isRootLevel
              ? 'No root categories found'
              : `No subcategories inside "${currentParent?.name}"`}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {isRootLevel
              ? 'Start building your library catalog by creating the first top-level category.'
              : `"${currentParent?.name}" currently has no nested children. You can add a subcategory here or go back up.`}
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            {!isRootLevel && (
              <button
                type="button"
                onClick={onGoUpOneLevel}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Go Up Level</span>
              </button>
            )}

            {onAddSubcategory && (
              <button
                type="button"
                onClick={() => onAddSubcategory(currentParent!)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#1e4634] hover:bg-[#153426] transition-colors shadow-xs"
              >
                <FolderPlus className="w-4 h-4" weight="bold" />
                <span>{isRootLevel ? 'Create Category' : `Add Subcategory in "${currentParent?.name}"`}</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] min-h-[380px] relative scroll-smooth overscroll-contain">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="sticky top-0 z-10 glass-table-th backdrop-blur-2xl">
                <th className="py-3.5 px-5 font-bold">Category Name</th>
                <th className="py-3.5 px-4 font-bold w-40 text-center">Depth Level</th>
                <th className="py-3.5 px-4 font-bold w-48 text-center">Subcategories</th>
                <th className="py-3.5 px-5 font-bold text-right w-48">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="glass-table-row group transition-colors hover:bg-emerald-500/[0.04] dark:hover:bg-emerald-400/[0.03]"
                >
                  {/* Category Name & Click-to-Drill */}
                  <td className="py-3.5 px-5">
                    <div
                      onClick={() => onDrillDown(category)}
                      className="flex items-center gap-3 cursor-pointer select-none group/item"
                      title={`Click to open "${category.name}" subcategories`}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-50 dark:bg-emerald-950/50 text-[#1e4634] dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60 group-hover/item:scale-105 group-hover/item:bg-[#1e4634] group-hover/item:text-white transition-all shadow-2xs">
                        <Folder className="w-4 h-4" weight="fill" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover/item:text-emerald-800 dark:group-hover/item:text-emerald-300 transition-colors">
                            {category.name}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {category.id.length > 8 ? `${category.id.slice(0, 8)}...` : category.id}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                          <span>Click row to drill into subcategories</span>
                          <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Level / Type Badge */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={cn(
                        'inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wide uppercase shadow-2xs',
                        isRootLevel
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-[#1e4634] dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/60'
                          : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60'
                      )}
                    >
                      {isRootLevel ? 'Root (L1)' : `Level ${currentDepth}`}
                    </span>
                  </td>

                  {/* Drill-down Button */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onDrillDown(category)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/[0.06] hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-900 dark:hover:text-emerald-300 border border-slate-200/80 dark:border-white/10 shadow-2xs hover:border-emerald-300 transition-all active:scale-[0.98]"
                      title={`Browse subcategories inside "${category.name}"`}
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" weight="bold" />
                      <span>Browse Subcategories</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </td>

                  {/* Quick Actions */}
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onAddSubcategory && (
                        <button
                          type="button"
                          onClick={() => onAddSubcategory(category)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#1e4634] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98]"
                          title={`Add a nested child category inside "${category.name}"`}
                        >
                          <Plus className="w-3 h-3" weight="bold" />
                          <span>Add Child</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
