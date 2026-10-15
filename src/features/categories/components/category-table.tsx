'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  TreeStructure,
  ListDashes,
} from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  buildCategoryTree,
  flattenCategoryTree,
  CategoryTreeNode,
} from '../utils/category-tree';
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

export function CategoryTable({
  categories,
  isLoading,
  isError,
  error,
  onRetry,
  onAddSubcategory,
  levelFilter = 'all',
  onLevelFilterChange,
}: CategoryTableProps) {
  const [viewMode, setViewMode] = useState<CategoryViewMode>('tree');

  // Build 5-level nested taxonomy tree
  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);

  // Flattened list for flat view
  const flatNodes = useMemo(() => flattenCategoryTree(categoryTree), [categoryTree]);

  // Track expanded parent rows (default: ALL parent rows expanded so all subcategories are immediately visible)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [hasInitializedExpansion, setHasInitializedExpansion] = useState(false);

  // Auto-expand all parent categories when categories load
  useEffect(() => {
    if (categoryTree.length > 0 && !hasInitializedExpansion) {
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
      setHasInitializedExpansion(true);
    }
  }, [categoryTree, hasInitializedExpansion]);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200">
        <Spinner size="lg" />
        <p className="mt-3 text-xs text-slate-500 font-medium">Loading catalog categories and subcategories...</p>
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

  const getDepthBadge = (depth: number) => {
    const depthBadgeConfig = {
      1: { label: 'L1 Main', style: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold' },
      2: { label: 'L2 Sub', style: 'bg-slate-100 text-slate-700 border-slate-200 font-medium' },
      3: { label: 'L3 Sub', style: 'bg-blue-50 text-blue-700 border-blue-200 font-medium' },
      4: { label: 'L4 Sub', style: 'bg-purple-50 text-purple-700 border-purple-200 font-medium' },
      5: { label: 'L5 Sub', style: 'bg-amber-50 text-amber-800 border-amber-200 font-medium' },
    }[depth as 1 | 2 | 3 | 4 | 5] || { label: `L${depth}`, style: 'bg-slate-100 text-slate-600 border-slate-200' };

    return (
      <span
        className={cn(
          'inline-block px-2 py-0.5 rounded text-[10px] border shadow-2xs',
          depthBadgeConfig.style
        )}
      >
        {depthBadgeConfig.label}
      </span>
    );
  };

  // Helper to get parent category path display
  const renderParentCategory = (node: CategoryTreeNode) => {
    if (node.depth === 1) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 italic">
          — (Main / Root)
        </span>
      );
    }

    const parentPath = node.path.slice(0, -1).join(' › ');
    return (
      <div className="flex items-center gap-1.5" title={`Belongs to: ${parentPath}`}>
        <Folder className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" weight="fill" />
        <span className="text-[11px] font-medium text-slate-700 truncate max-w-[180px]">
          {parentPath}
        </span>
      </div>
    );
  };

  // Helper to render subcategories preview
  const renderSubcategoriesColumn = (node: CategoryTreeNode) => {
    const hasChildren = node.children.length > 0;
    if (!hasChildren) {
      return <span className="text-slate-300 italic text-[11px]">—</span>;
    }

    return (
      <div className="flex flex-wrap gap-1.5 items-center">
        <Badge
          variant="default"
          size="sm"
          className="font-medium text-[10px] text-emerald-800 bg-emerald-50 border-emerald-200"
        >
          {node.children.length} {node.children.length === 1 ? 'sub' : 'subs'}
        </Badge>
        {node.children.slice(0, 3).map((child) => (
          <span
            key={child.id}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
          >
            {child.name}
          </span>
        ))}
        {node.children.length > 3 && (
          <button
            type="button"
            onClick={() => {
              if (!expandedRows.has(node.id)) toggleExpand(node.id);
            }}
            className="text-[10px] font-medium text-emerald-800 hover:underline"
          >
            +{node.children.length - 3} more
          </button>
        )}
      </div>
    );
  };

  // Render a single tree node row, and if expanded, recursively render its children
  const renderNodeRows = (node: CategoryTreeNode): React.ReactNode => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedRows.has(node.id);
    const indentPadding = (node.depth - 1) * 22 + 12;

    return (
      <React.Fragment key={node.id}>
        <tr
          className={cn(
            'group transition-colors border-b border-slate-100/80 hover:bg-slate-50/80',
            node.depth === 1 ? 'bg-white' : node.depth === 2 ? 'bg-slate-50/40' : 'bg-slate-100/30'
          )}
        >
          {/* Category Name & Hierarchy Indentation */}
          <td className="py-2.5 px-4">
            <div
              className="flex items-center gap-2"
              style={{ paddingLeft: `${indentPadding}px` }}
            >
              {/* Visual Branch Connector for Subcategories */}
              {node.depth > 1 && (
                <span className="text-slate-300 font-mono text-xs select-none -mr-0.5 flex-shrink-0">
                  └──
                </span>
              )}

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
                    node.depth === 1 ? 'text-emerald-700' : 'text-slate-500'
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
                    : 'font-medium text-slate-800 text-xs'
                )}
              >
                {node.name}
              </span>

              {/* Direct Subcategory Count Badge */}
              {hasChildren && (
                <Badge
                  variant="default"
                  size="sm"
                  className="font-normal text-[10px] text-slate-500 bg-slate-100 border-slate-200 ml-0.5"
                >
                  {node.children.length} {node.children.length === 1 ? 'sub' : 'subs'}
                </Badge>
              )}
            </div>
          </td>

          {/* Depth / Placement Level */}
          <td className="py-2.5 px-3 text-center">
            {getDepthBadge(node.depth)}
          </td>

          {/* Parent Category Column */}
          <td className="py-2.5 px-3">
            {renderParentCategory(node)}
          </td>

          {/* Subcategories Preview */}
          <td className="py-2.5 px-4">
            {renderSubcategoriesColumn(node)}
          </td>

          {/* Quick Action Column: + Subcategory */}
          <td className="py-2.5 px-4 text-right">
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

  // Render a flat row (used in flat view mode or when filtering specifically to subcategories)
  const renderFlatRow = (node: CategoryTreeNode): React.ReactNode => {
    return (
      <tr
        key={node.id}
        className={cn(
          'group transition-colors border-b border-slate-100/80 hover:bg-slate-50/80',
          node.depth === 1 ? 'bg-white' : 'bg-slate-50/30'
        )}
      >
        {/* Category Name */}
        <td className="py-2.5 px-4">
          <div className="flex items-center gap-2">
            <Folder
              className={cn(
                'w-4 h-4 flex-shrink-0',
                node.depth === 1 ? 'text-emerald-700' : 'text-slate-500'
              )}
              weight={node.depth === 1 ? 'fill' : 'regular'}
            />
            <span
              className={cn(
                'truncate',
                node.depth === 1
                  ? 'font-semibold text-slate-900 text-xs'
                  : 'font-medium text-slate-800 text-xs'
              )}
            >
              {node.name}
            </span>
          </div>
        </td>

        {/* Level */}
        <td className="py-2.5 px-3 text-center">
          {getDepthBadge(node.depth)}
        </td>

        {/* Parent Category */}
        <td className="py-2.5 px-3">
          {renderParentCategory(node)}
        </td>

        {/* Subcategories */}
        <td className="py-2.5 px-4">
          {renderSubcategoriesColumn(node)}
        </td>

        {/* Actions */}
        <td className="py-2.5 px-4 text-right">
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
    );
  };

  // Filter nodes according to levelFilter
  const visibleTreeRoots = useMemo(() => {
    if (levelFilter === 'roots') {
      return categoryTree.map((root) => ({ ...root, children: [] }));
    }
    return categoryTree;
  }, [categoryTree, levelFilter]);

  const visibleFlatNodes = useMemo(() => {
    if (levelFilter === 'roots') {
      return flatNodes.filter((n) => n.depth === 1);
    }
    if (levelFilter === 'subs') {
      return flatNodes.filter((n) => n.depth > 1);
    }
    return flatNodes;
  }, [flatNodes, levelFilter]);

  const isFlatRender = viewMode === 'flat' || levelFilter === 'subs';

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        {/* Left: Filter Tabs */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400 mr-1">
            Display:
          </span>
          <button
            type="button"
            onClick={() => onLevelFilterChange?.('all')}
            className={cn(
              'px-2.5 py-1 rounded text-xs font-medium transition-colors',
              levelFilter === 'all'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
            )}
          >
            All Categories ({flatNodes.length})
          </button>
          <button
            type="button"
            onClick={() => onLevelFilterChange?.('roots')}
            className={cn(
              'px-2.5 py-1 rounded text-xs font-medium transition-colors',
              levelFilter === 'roots'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
            )}
          >
            Main Categories ({flatNodes.filter((n) => n.depth === 1).length})
          </button>
          <button
            type="button"
            onClick={() => onLevelFilterChange?.('subs')}
            className={cn(
              'px-2.5 py-1 rounded text-xs font-medium transition-colors',
              levelFilter === 'subs'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
            )}
          >
            Subcategories ({flatNodes.filter((n) => n.depth > 1).length})
          </button>
        </div>

        {/* Right: Expand/Collapse & View Mode toggles */}
        <div className="flex items-center gap-3">
          {!isFlatRender && (
            <div className="flex items-center gap-1 text-[11px]">
              <button
                type="button"
                onClick={handleExpandAll}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-200/60 transition-colors"
                title="Expand all hierarchy levels"
              >
                <ArrowsOutLineVertical className="w-3 h-3" />
                Expand all
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-200/60 transition-colors"
                title="Collapse all subcategory branches"
              >
                <ArrowsInLineVertical className="w-3 h-3" />
                Collapse all
              </button>
            </div>
          )}

          {levelFilter !== 'subs' && (
            <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('tree')}
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors',
                  viewMode === 'tree'
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-slate-500 hover:text-slate-700'
                )}
                title="Tree hierarchy view"
              >
                <TreeStructure className="w-3 h-3" />
                Tree
              </button>
              <button
                type="button"
                onClick={() => setViewMode('flat')}
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors',
                  viewMode === 'flat'
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-slate-500 hover:text-slate-700'
                )}
                title="Flat list view"
              >
                <ListDashes className="w-3 h-3" />
                List
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">Category Name</th>
              <th className="py-2.5 px-3 font-semibold text-center w-24">Level</th>
              <th className="py-2.5 px-3 font-semibold w-52">Parent Category</th>
              <th className="py-2.5 px-4 font-semibold w-56">Subcategories</th>
              <th className="py-2.5 px-4 font-semibold text-right w-40">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isFlatRender
              ? visibleFlatNodes.map((node) => renderFlatRow(node))
              : visibleTreeRoots.map((rootNode) => renderNodeRows(rootNode))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
