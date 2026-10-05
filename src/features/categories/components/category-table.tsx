'use client';

import React, { useState, useMemo } from 'react';
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
  Plus,
  X,
  ArrowsOutLineVertical,
  ArrowsInLineVertical,
} from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { categoriesApi } from '../api/categories-api';
import { useQueryClient } from '@tanstack/react-query';
import { CATEGORIES_QUERY_KEY } from '../hooks/use-categories';
import {
  buildCategoryTree,
  flattenCategoryTree,
  CategoryTreeNode,
} from '../utils/category-tree';

interface CategoryTableProps {
  categories: Category[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
  onAddSubcategory?: (parentCategory: Category) => void;
}

export function CategoryTable({
  categories,
  isLoading,
  isError,
  error,
  onRetry,
  onEdit,
  onDelete,
  onAddSubcategory,
}: CategoryTableProps) {
  const queryClient = useQueryClient();

  // Build 5-level nested taxonomy tree
  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);

  // Track expanded parent rows (default: root rows expanded)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    categoryTree.forEach((root) => {
      if (root.children.length > 0) {
        initial.add(root.id);
      }
    });
    return initial;
  });

  // Edit modal state
  const [editingNode, setEditingNode] = useState<CategoryTreeNode | null>(null);
  const [editName, setEditName] = useState('');
  const [editSubcategories, setEditSubcategories] = useState<{ id?: string; name: string }[]>([]);
  const [newSubInput, setNewSubInput] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

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

  const handleExpandAll = () => {
    const allParentIds = new Set<string>();
    const collectParents = (nodes: CategoryTreeNode[]) => {
      nodes.forEach((n) => {
        if (n.children.length > 0) {
          allParentIds.add(n.id);
          collectParents(n.children);
        }
      });
    };
    collectParents(categoryTree);
    setExpandedRows(allParentIds);
  };

  const handleCollapseAll = () => {
    setExpandedRows(new Set());
  };

  const handleOpenEdit = (node: CategoryTreeNode) => {
    setEditingNode(node);
    setEditName(node.name);
    setNewSubInput('');

    // Load direct children for editing if not at maximum depth (level 5)
    if (node.depth < 5) {
      setEditSubcategories(node.children.map((c) => ({ id: c.id, name: c.name })));
    } else {
      setEditSubcategories([]);
    }
  };

  const handleAddSubcategoryInEdit = () => {
    const trimmed = newSubInput.trim();
    if (!trimmed) return;
    if (editSubcategories.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setNewSubInput('');
      return;
    }
    setEditSubcategories((prev) => [...prev, { name: trimmed }]);
    setNewSubInput('');
  };

  const handleRemoveSubcategoryInEdit = (index: number) => {
    setEditSubcategories((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveEdit = async () => {
    if (!editingNode || !editName.trim()) return;
    setIsSavingEdit(true);

    try {
      const trimmedName = editName.trim();

      // 1. Rename category if changed
      if (trimmedName !== editingNode.name) {
        await categoriesApi.update(editingNode.id, trimmedName);
      }

      // 2. Manage direct subcategories if depth < 5
      if (editingNode.depth < 5) {
        const originalChildren = editingNode.children;
        const currentIds = new Set(
          editSubcategories.filter((s) => s.id).map((s) => s.id)
        );

        // Delete removed subcategories
        for (const orig of originalChildren) {
          if (!currentIds.has(orig.id)) {
            await categoriesApi.delete(orig.id);
          }
        }

        // Add newly created subcategories under this node
        const newlyAdded = editSubcategories.filter((s) => !s.id);
        for (const sub of newlyAdded) {
          await categoriesApi.create({
            name: sub.name,
            parentId: editingNode.id,
          });
        }
      }

      await queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });

      if (onEdit) {
        onEdit({ ...editingNode, name: trimmedName });
      }

      setEditingNode(null);
    } catch (err) {
      console.error('Failed to save category edits:', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingCategory && onDelete) {
      onDelete(deletingCategory);
    }
    setDeletingCategory(null);
  };

  // Render a single tree node row, and if expanded, recursively render its children
  const renderNodeRows = (node: CategoryTreeNode): React.ReactNode => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedRows.has(node.id);
    const indentPadding = (node.depth - 1) * 22 + 20;

    // Depth pill configuration (Levels 1 to 5)
    const depthBadgeConfig = {
      1: { label: 'L1', style: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
      2: { label: 'L2', style: 'bg-slate-100 text-slate-700 border-slate-200' },
      3: { label: 'L3', style: 'bg-blue-50 text-blue-700 border-blue-200' },
      4: { label: 'L4', style: 'bg-purple-50 text-purple-700 border-purple-200' },
      5: { label: 'L5', style: 'bg-amber-50 text-amber-800 border-amber-200' },
    }[node.depth as 1 | 2 | 3 | 4 | 5] || { label: `L${node.depth}`, style: 'bg-slate-100 text-slate-600 border-slate-200' };

    return (
      <React.Fragment key={node.id}>
        <tr
          className={`hover:bg-slate-50/70 transition-colors group ${
            node.depth === 1 ? 'bg-white' : 'bg-slate-50/30'
          }`}
        >
          {/* Category Name & Hierarchy Indentation */}
          <td className="py-3 px-4" style={{ paddingLeft: `${indentPadding}px` }}>
            <div className="flex items-center gap-2">
              {/* Expand / Collapse toggle or indent spacer */}
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleExpand(node.id)}
                  className="p-1 -ml-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition-colors"
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
                <span className="w-5 flex items-center justify-center text-slate-300">
                  {node.depth > 1 ? '↳' : ''}
                </span>
              )}

              {/* Depth Level Indicator Pill */}
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${depthBadgeConfig.style}`}
                title={`Taxonomy Depth Level ${node.depth} of 5`}
              >
                {depthBadgeConfig.label}
              </span>

              {/* Icon */}
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                  node.depth === 1
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {node.depth === 1 ? (
                  <Folder className="w-3.5 h-3.5" weight="duotone" />
                ) : (
                  <Tag className="w-3 h-3" />
                )}
              </div>

              {/* Name */}
              <span
                className={`${
                  node.depth === 1
                    ? 'font-semibold text-slate-900'
                    : node.depth === 2
                    ? 'font-medium text-slate-800'
                    : 'text-slate-700 text-xs'
                }`}
              >
                {node.name}
              </span>

              {/* Children count badge */}
              {hasChildren && (
                <Badge
                  variant="default"
                  size="sm"
                  className="font-normal text-[10px] text-slate-500 bg-slate-100 border-slate-200"
                >
                  {node.children.length} {node.children.length === 1 ? 'sub' : 'subs'}
                </Badge>
              )}
            </div>
          </td>

          {/* Direct Subcategories Preview Tags */}
          <td className="py-3 px-4">
            {hasChildren ? (
              <div className="flex flex-wrap gap-1.5 items-center">
                {node.children.slice(0, 3).map((child) => (
                  <span
                    key={child.id}
                    className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200/80"
                  >
                    {child.name}
                  </span>
                ))}
                {node.children.length > 3 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!isExpanded) toggleExpand(node.id);
                    }}
                    className="text-[10px] font-medium text-emerald-800 hover:underline"
                  >
                    +{node.children.length - 3} more
                  </button>
                )}
              </div>
            ) : (
              <span className="text-slate-400 italic text-[11px]">—</span>
            )}
          </td>

          {/* Actions Column */}
          <td className="py-3 px-4 text-right">
            <div className="flex items-center justify-end gap-1 text-slate-400 group-hover:text-slate-600">
              {/* Add nested subcategory button (only for depth < 5) */}
              {node.depth < 5 && onAddSubcategory && (
                <button
                  type="button"
                  onClick={() => onAddSubcategory(node)}
                  className="p-1.5 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors"
                  title={`Add subcategory under ${node.name} (Level ${node.depth + 1})`}
                  aria-label={`Add subcategory under ${node.name}`}
                >
                  <Plus className="w-3.5 h-3.5" weight="bold" />
                </button>
              )}

              <button
                type="button"
                onClick={() => handleOpenEdit(node)}
                className="p-1.5 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                title="Edit category"
                aria-label={`Edit ${node.name}`}
              >
                <PencilSimple className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setDeletingCategory(node)}
                className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Delete category"
                aria-label={`Delete ${node.name}`}
              >
                <Trash className="w-3.5 h-3.5" />
              </button>
            </div>
          </td>
        </tr>

        {/* Recursively render child rows if node is expanded */}
        {isExpanded && node.children.map((child) => renderNodeRows(child))}
      </React.Fragment>
    );
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">
              Taxonomy Hierarchy
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              ({categories.length} total categories up to 5 levels)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExpandAll}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-200/60 transition-colors"
              title="Expand all hierarchy levels"
            >
              <ArrowsOutLineVertical className="w-3 h-3" />
              Expand all
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-200/60 transition-colors"
              title="Collapse to root categories"
            >
              <ArrowsInLineVertical className="w-3 h-3" />
              Collapse all
            </button>
          </div>
        </div>

        {/* Main Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 w-3/5">Category / Hierarchy</th>
                <th className="py-3 px-4 w-2/5">Subcategories</th>
                <th className="py-3 px-4 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {categoryTree.map((root) => renderNodeRows(root))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Category Modal */}
      {editingNode && (
        <Modal
          isOpen={Boolean(editingNode)}
          onClose={() => setEditingNode(null)}
          title={`Edit ${editingNode.depth === 1 ? 'Category' : `Subcategory (Level ${editingNode.depth})`}`}
        >
          <div className="space-y-4">
            <div>
              <Input
                label="Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Category name"
                autoFocus
              />
              {editingNode.path.length > 1 && (
                <p className="text-[11px] text-slate-400 mt-1">
                  Taxonomy Path: <span className="font-medium text-slate-600">{editingNode.fullPath}</span>
                </p>
              )}
            </div>

            {/* Direct Subcategories Management (available if depth < 5) */}
            {editingNode.depth < 5 ? (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
                  Nested Subcategories at Level {editingNode.depth + 1} ({editSubcategories.length})
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubInput}
                    onChange={(e) => setNewSubInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubcategoryInEdit();
                      }
                    }}
                    placeholder={`Add Level ${editingNode.depth + 1} subcategory...`}
                    className="flex-1 h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleAddSubcategoryInEdit}
                    leftIcon={<Plus className="w-3.5 h-3.5" weight="bold" />}
                    className="h-9 px-3 text-xs"
                  >
                    Add
                  </Button>
                </div>

                {/* Subcategories List */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 min-h-[50px] max-h-48 overflow-y-auto">
                  {editSubcategories.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2 text-center">
                      No nested subcategories attached. Add one above.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {editSubcategories.map((sub, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white text-emerald-800 border border-emerald-200 shadow-2xs"
                        >
                          <Tag className="w-3 h-3 text-emerald-700" />
                          <span>{sub.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubcategoryInEdit(index)}
                            className="hover:text-red-600 rounded-full transition-colors ml-0.5"
                            title={`Remove ${sub.name}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-800 text-xs">
                This item is at Level 5 (maximum nesting depth). It cannot have further child subcategories.
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditingNode(null)}
                disabled={isSavingEdit}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                isLoading={isSavingEdit}
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
              <strong className="text-slate-900">{deletingCategory.name}</strong>? Any nested
              subcategories under it will also be removed.
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
