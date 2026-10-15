'use client';

import React, { useState, useMemo } from 'react';
import { Category } from '@/types/domain';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import {
  Folder,
  FolderOpen,
  CaretRight,
  CaretDown,
  Plus,
  ArrowsOutLineVertical,
  ArrowsInLineVertical,
} from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  buildCategoryTree,
  CategoryTreeNode,
} from '../utils/category-tree';
import { cn } from '@/lib/utils/cn';

interface CategoryTableProps {
  categories: Category[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onAddSubcategory?: (parentCategory: Category) => void;
}

export function CategoryTable({
  categories,
  isLoading,
  isError,
  error,
  onRetry,
  onAddSubcategory,
}: CategoryTableProps) {
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
        description="Register a category above to begin organizing books in the catalog."
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

  // Render a single tree node row, and if expanded, recursively render its children
  const renderNodeRows = (node: CategoryTreeNode): React.ReactNode => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedRows.has(node.id);
    const indentPadding = (node.depth - 1) * 24 + 16;

    // Depth pill configuration
    const depthBadgeConfig = {
      1: { label: 'L1 Main', style: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold' },
      2: { label: 'L2 Sub', style: 'bg-slate-100 text-slate-700 border-slate-200 font-medium' },
      3: { label: 'L3 Sub', style: 'bg-blue-50 text-blue-700 border-blue-200 font-medium' },
      4: { label: 'L4 Sub', style: 'bg-purple-50 text-purple-700 border-purple-200 font-medium' },
      5: { label: 'L5 Sub', style: 'bg-amber-50 text-amber-800 border-amber-200 font-medium' },
    }[node.depth as 1 | 2 | 3 | 4 | 5] || { label: `L${node.depth}`, style: 'bg-slate-100 text-slate-600 border-slate-200' };

    return (
      <React.Fragment key={node.id}>
        <tr
          className={cn(
            'group transition-colors border-b border-slate-100/80 hover:bg-slate-50/70',
            node.depth === 1 ? 'bg-white' : 'bg-slate-50/30'
          )}
        >
          {/* Category Name & Hierarchy Indentation */}
          <td className="py-3 px-4">
            <div
              className="flex items-center gap-2"
              style={{ paddingLeft: `${indentPadding}px` }}
            >
              {/* Expand / Collapse toggle icon */}
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleExpand(node.id)}
                  className="w-5 h-5 -ml-1 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors flex-shrink-0"
                  aria-label={isExpanded ? 'Collapse subcategories' : 'Expand subcategories'}
                >
                  {isExpanded ? (
                    <CaretDown className="w-3.5 h-3.5" weight="bold" />
                  ) : (
                    <CaretRight className="w-3.5 h-3.5" weight="bold" />
                  )}
                </button>
              ) : (
                <span className="w-5 -ml-1 flex-shrink-0" />
              )}

              {/* Folder Icon */}
              {hasChildren && isExpanded ? (
                <FolderOpen className="w-4 h-4 text-emerald-700 flex-shrink-0" weight="fill" />
              ) : (
                <Folder
                  className={cn(
                    'w-4 h-4 flex-shrink-0',
                    node.depth === 1 ? 'text-emerald-700' : 'text-slate-400'
                  )}
                  weight={node.depth === 1 ? 'fill' : 'regular'}
                />
              )}

              {/* Category Name */}
              <span
                className={cn(
                  'truncate',
                  node.depth === 1
                    ? 'font-semibold text-slate-900 text-xs'
                    : 'font-normal text-slate-700 text-xs'
                )}
              >
                {node.name}
              </span>

              {/* Direct Subcategory Count Badge */}
              {hasChildren && (
                <Badge
                  variant="default"
                  size="sm"
                  className="font-normal text-[10px] text-slate-500 bg-slate-100 border-slate-200 ml-1"
                >
                  {node.children.length} {node.children.length === 1 ? 'sub' : 'subs'}
                </Badge>
              )}
            </div>
          </td>

          {/* Depth / Placement Level */}
          <td className="py-3 px-4 text-center">
            <span
              className={cn(
                'inline-block px-2 py-0.5 rounded text-[10px] border shadow-2xs',
                depthBadgeConfig.style
              )}
            >
              {depthBadgeConfig.label}
            </span>
          </td>

          {/* Subcategories Preview */}
          <td className="py-3 px-4">
            {hasChildren ? (
              <div className="flex flex-wrap gap-1.5 items-center">
                {node.children.slice(0, 3).map((child) => (
                  <span
                    key={child.id}
                    className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
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
              <span className="text-slate-300 italic text-[11px]">—</span>
            )}
          </td>

          {/* Quick Action Column: + Subcategory */}
          <td className="py-3 px-4 text-right">
            {node.depth < 5 && onAddSubcategory ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => onAddSubcategory(node)}
                leftIcon={<Plus className="w-3 h-3" weight="bold" />}
                className="h-7 px-2.5 text-[11px] font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200 hover:border-emerald-300"
                title={`Add a subcategory nested directly under "${node.name}"`}
              >
                Add Subcategory
              </Button>
            ) : (
              <span className="text-[10px] text-slate-400 italic">Max Depth (L5)</span>
            )}
          </td>
        </tr>

        {/* Recursively render child rows if node is expanded */}
        {isExpanded && node.children.map((child) => renderNodeRows(child))}
      </React.Fragment>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">
            Catalog Taxonomy
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            ({categories.length} total categories registered)
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
            title="Collapse all subcategory branches"
          >
            <ArrowsInLineVertical className="w-3 h-3" />
            Collapse all
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">Category Hierarchy</th>
              <th className="py-2.5 px-4 font-semibold text-center w-28">Level</th>
              <th className="py-2.5 px-4 font-semibold w-64">Subcategories</th>
              <th className="py-2.5 px-4 font-semibold text-right w-44">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categoryTree.map((rootNode) => renderNodeRows(rootNode))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
