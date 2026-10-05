'use client';

import React, { useState } from 'react';
import { Category } from '@/types/domain';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import {
  Folder,
  PencilSimple,
  Trash,
  CaretRight,
  CaretDown,
  Tag,
} from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
  // Track expanded parent rows (default: all expanded for convenience)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Edit modal state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');

  // Delete modal state
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

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
        description="Register a category on the right to begin grouping books in the catalog."
      />
    );
  }

  // Build hierarchical grouping: root categories and their child subcategories
  const rootCategories = categories.filter((c) => !c.parentId);
  const subcategoryMap = new Map<string, Category[]>();

  categories.forEach((cat) => {
    if (cat.parentId) {
      const existing = subcategoryMap.get(cat.parentId) || [];
      existing.push(cat);
      subcategoryMap.set(cat.parentId, existing);
    }
  });

  const toggleExpand = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setEditName(category.name);
  };

  const handleSaveEdit = () => {
    if (!editingCategory || !editName.trim()) return;
    if (onEdit) {
      onEdit({ ...editingCategory, name: editName.trim() });
    }
    setEditingCategory(null);
  };

  const handleConfirmDelete = () => {
    if (deletingCategory && onDelete) {
      onDelete(deletingCategory);
    }
    setDeletingCategory(null);
  };

  return (
    <>
      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200/80 shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-6 w-2/5">Category</th>
              <th className="py-3.5 px-6 w-2/5">Subcategories</th>
              <th className="py-3.5 px-6 w-1/6">ID</th>
              <th className="py-3.5 px-6 text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {rootCategories.map((root) => {
              const rootDisplayId = root.id.length > 12 ? `${root.id.slice(0, 8)}...` : root.id;
              const subcategories = subcategoryMap.get(root.id) || [];
              const isExpanded = expandedRows.has(root.id);

              return (
                <React.Fragment key={root.id}>
                  {/* Root Category Row */}
                  <tr className="hover:bg-slate-50/70 transition-colors group bg-white">
                    {/* Category Name & Hierarchy Toggle */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {subcategories.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => toggleExpand(root.id)}
                            className="p-1 -ml-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            aria-label={isExpanded ? 'Collapse subcategories' : 'Expand subcategories'}
                            title={isExpanded ? 'Collapse subcategories' : 'Expand subcategories'}
                          >
                            {isExpanded ? (
                              <CaretDown className="w-3.5 h-3.5" weight="bold" />
                            ) : (
                              <CaretRight className="w-3.5 h-3.5" weight="bold" />
                            )}
                          </button>
                        ) : (
                          <span className="w-5" />
                        )}
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center flex-shrink-0">
                          <Folder className="w-4 h-4" weight="duotone" />
                        </div>
                        <span className="font-semibold text-slate-900">{root.name}</span>
                        {subcategories.length > 0 && (
                          <Badge variant="default" size="sm" className="font-normal text-[10px] text-slate-600 bg-slate-100">
                            {subcategories.length}
                          </Badge>
                        )}
                      </div>
                    </td>

                    {/* Subcategories preview tags */}
                    <td className="py-4 px-6">
                      {subcategories.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {subcategories.slice(0, 3).map((sub) => (
                            <span
                              key={sub.id}
                              className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200/80"
                            >
                              {sub.name}
                            </span>
                          ))}
                          {subcategories.length > 3 && (
                            <button
                              type="button"
                              onClick={() => toggleExpand(root.id)}
                              className="text-[10px] font-medium text-emerald-800 hover:underline"
                            >
                              +{subcategories.length - 3} more
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No subcategories</span>
                      )}
                    </td>

                    {/* ID */}
                    <td className="py-4 px-6 font-mono text-[11px] text-slate-500" title={root.id}>
                      {rootDisplayId}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1 text-slate-400 group-hover:text-slate-600">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(root)}
                          className="p-1.5 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit category"
                          aria-label={`Edit ${root.name}`}
                        >
                          <PencilSimple className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingCategory(root)}
                          className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete category"
                          aria-label={`Delete ${root.name}`}
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Subcategories Panel */}
                  {isExpanded && subcategories.length > 0 && (
                    <tr className="bg-slate-50/50 border-t border-slate-100/80">
                      <td colSpan={4} className="py-3 px-6 pl-14">
                        <div className="bg-white rounded-lg border border-slate-200/80 p-3 shadow-2xs space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Subcategories of {root.name}
                          </p>
                          <div className="divide-y divide-slate-100">
                            {subcategories.map((sub) => {
                              const subDisplayId =
                                sub.id.length > 12 ? `${sub.id.slice(0, 8)}...` : sub.id;
                              return (
                                <div
                                  key={sub.id}
                                  className="flex items-center justify-between py-2 px-2 hover:bg-slate-50/60 rounded transition-colors group/sub text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="font-medium text-slate-800">{sub.name}</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span
                                      className="font-mono text-[11px] text-slate-400"
                                      title={sub.id}
                                    >
                                      {subDisplayId}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEdit(sub)}
                                        className="p-1 hover:text-slate-900 hover:bg-slate-100 rounded text-slate-400 transition-colors"
                                        title="Edit subcategory"
                                      >
                                        <PencilSimple className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeletingCategory(sub)}
                                        className="p-1 hover:text-red-600 hover:bg-red-50 rounded text-slate-400 transition-colors"
                                        title="Delete subcategory"
                                      >
                                        <Trash className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <Modal
          isOpen={Boolean(editingCategory)}
          onClose={() => setEditingCategory(null)}
          title={`Edit ${editingCategory.parentId ? 'Subcategory' : 'Category'}`}
        >
          <div className="space-y-4">
            <Input
              label="Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Category name"
              autoFocus
            />
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditingCategory(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                className="bg-[#1e4634] hover:bg-[#153426] text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <Modal
          isOpen={Boolean(deletingCategory)}
          onClose={() => setDeletingCategory(null)}
          title="Delete Category"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Are you sure you want to delete{' '}
              <strong className="text-slate-900">{deletingCategory.name}</strong>? Books
              currently filed under this category may need to be recataloged.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeletingCategory(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleConfirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
