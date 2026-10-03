'use client';

import React from 'react';
import { Category } from '@/types/domain';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Folder, ArrowElbowDownRight, PencilSimple, Trash } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';

interface CategoryTableProps {
  categories: Category[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
}

export function CategoryTable({
  categories,
  isLoading,
  isError,
  error,
  onRetry,
  onEdit,
  onDelete,
}: CategoryTableProps) {
  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200">
        <Spinner size="lg" />
        <p className="mt-3 text-xs text-slate-500 font-medium">Loading catalog categories...</p>
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
      <EmptyState
        title="No categories found"
        description="Register a category to begin grouping books in the catalog."
      />
    );
  }

  // Build hierarchical list: root categories followed by their subcategories
  const rootCategories = categories.filter((c) => !c.parentId);
  const subcategoryMap = new Map<string, Category[]>();

  categories.forEach((cat) => {
    if (cat.parentId) {
      const existing = subcategoryMap.get(cat.parentId) || [];
      existing.push(cat);
      subcategoryMap.set(cat.parentId, existing);
    }
  });

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200/80 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <th className="py-3.5 px-6">Category</th>
            <th className="py-3.5 px-6">ID</th>
            <th className="py-3.5 px-6 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs">
          {rootCategories.map((root, index) => {
            const rootId = root.id.startsWith('CAT-')
              ? root.id
              : `CAT-${String(index + 1).padStart(3, '0')}`;
            const subcategories = subcategoryMap.get(root.id) || [];

            return (
              <React.Fragment key={root.id}>
                {/* Parent / Root Category */}
                <tr className="hover:bg-slate-50/60 transition-colors group bg-white font-medium">
                  <td className="py-4 px-6 text-slate-900 flex items-center gap-2.5">
                    <Folder className="w-4 h-4 text-[#1e4634]" weight="fill" />
                    <span>{root.name}</span>
                    {subcategories.length > 0 && (
                      <Badge variant="default" size="sm" className="ml-2 font-normal text-[10px]">
                        {subcategories.length} subcategories
                      </Badge>
                    )}
                  </td>
                  <td className="py-4 px-6 font-mono text-[11px] text-slate-500">
                    {rootId}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-500">
                      <button
                        type="button"
                        onClick={() => onEdit?.(root)}
                        className="hover:text-slate-900 transition-colors inline-flex items-center gap-1"
                      >
                        <PencilSimple className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <span className="text-slate-300">·</span>
                      <button
                        type="button"
                        onClick={() => onDelete?.(root)}
                        className="text-red-600 hover:text-red-700 transition-colors inline-flex items-center gap-1"
                      >
                        <Trash className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Subcategories (PM Requirement: Subcategories hierarchy) */}
                {subcategories.map((sub, subIdx) => {
                  const subId = `${rootId}-${subIdx + 1}`;
                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/80 transition-colors bg-slate-50/30"
                    >
                      <td className="py-3 px-6 pl-12 text-slate-700 flex items-center gap-2">
                        <ArrowElbowDownRight className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sub.name}</span>
                        <Badge variant="outline" size="sm" className="text-[10px] py-0 text-slate-500">
                          Subcategory
                        </Badge>
                      </td>
                      <td className="py-3 px-6 font-mono text-[11px] text-slate-400">
                        {subId}
                      </td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 text-slate-500">
                          <button
                            type="button"
                            onClick={() => onEdit?.(sub)}
                            className="hover:text-slate-900 transition-colors text-xs"
                          >
                            Edit
                          </button>
                          <span className="text-slate-300">·</span>
                          <button
                            type="button"
                            onClick={() => onDelete?.(sub)}
                            className="text-red-600 hover:text-red-700 transition-colors text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
