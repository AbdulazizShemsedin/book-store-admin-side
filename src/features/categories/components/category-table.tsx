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
  BookmarkSimple,
  Tag,
  ArrowBendDownRight,
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

  // Filter nodes according to levelFilter (declared unconditionally at top)
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
      <div className="py-24 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
          <Spinner size="md" />
        </div>
        <p className="text-sm font-semibold text-slate-800">Loading catalog taxonomy...</p>
        <p className="mt-1 text-xs text-slate-400">Fetching categories and subcategories across all hierarchy levels</p>
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
          Start organizing books into the catalog by creating your first root or subcategory.
        </p>
      </div>
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
      1: { label: 'L1 Root', style: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 font-bold shadow-2xs' },
      2: { label: 'L2 Sub', style: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 font-semibold shadow-2xs' },
      3: { label: 'L3 Sub', style: 'bg-sky-50 text-sky-700 border-sky-200/80 font-semibold shadow-2xs' },
      4: { label: 'L4 Sub', style: 'bg-purple-50 text-purple-700 border-purple-200/80 font-medium' },
      5: { label: 'L5 Sub', style: 'bg-amber-50 text-amber-800 border-amber-200/80 font-medium' },
    }[depth as 1 | 2 | 3 | 4 | 5] || { label: `L${depth}`, style: 'bg-slate-100 text-slate-600 border-slate-200' };

    return (
      <span
        className={cn(
          'inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] border tracking-wide uppercase',
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
        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-medium italic">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          None (Top-Level Root)
        </span>
      );
    }

    const parentPath = node.path.slice(0, -1).join(' › ');
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 text-slate-700 text-[11px] font-medium border border-slate-200/70 max-w-[220px] shadow-2xs group-hover:bg-white group-hover:border-slate-300 transition-colors"
        title={`Belongs to: ${parentPath}`}
      >
        <Folder className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" weight="fill" />
        <span className="truncate">{parentPath}</span>
      </div>
    );
  };

  // Helper to render subcategories preview
  const renderSubcategoriesColumn = (node: CategoryTreeNode) => {
    const hasChildren = node.children.length > 0;
    if (!hasChildren) {
      return (
        <span className="text-slate-300 italic text-[11px] select-none">—</span>
      );
    }

    return (
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/70">
          {node.children.length} {node.children.length === 1 ? 'sub' : 'subs'}
        </span>
        {node.children.slice(0, 3).map((child) => (
          <span
            key={child.id}
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200/70 shadow-2xs hover:bg-slate-200/60 transition-colors"
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
            className="text-[10px] font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50/50 hover:bg-emerald-100/60 px-1.5 py-0.5 rounded transition-colors"
            title="Expand to view all subcategories"
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
    const indentPadding = (node.depth - 1) * 24 + 16;

    return (
      <React.Fragment key={node.id}>
        <tr
          className={cn(
            'group transition-all duration-150 border-b border-slate-100',
            node.depth === 1
              ? 'bg-white hover:bg-emerald-50/20'
              : node.depth === 2
              ? 'bg-slate-50/40 hover:bg-emerald-50/30'
              : 'bg-slate-100/30 hover:bg-emerald-50/40'
          )}
        >
          {/* Category Name & Indentation Hierarchy */}
          <td className="py-3 px-4">
            <div
              className="flex items-center gap-2"
              style={{ paddingLeft: `${indentPadding}px` }}
            >
              {/* Hierarchy Branch Connector */}
              {node.depth > 1 && (
                <div className="flex items-center text-slate-300 group-hover:text-emerald-600 transition-colors -mr-0.5 select-none flex-shrink-0">
                  <ArrowBendDownRight className="w-3.5 h-3.5" weight="bold" />
                </div>
              )}

              {/* Expand / Collapse toggle icon */}
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleExpand(node.id)}
                  className="w-5 h-5 -ml-1 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-200/70 transition-all flex-shrink-0"
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
                <span className="w-5 -ml-1 flex-shrink-0" />
              )}

              {/* Folder / Category Icon */}
              {hasChildren && isExpanded ? (
                <div className="w-6 h-6 rounded-md bg-emerald-100/70 text-emerald-800 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <FolderOpen className="w-3.5 h-3.5" weight="fill" />
                </div>
              ) : (
                <div
                  className={cn(
                    'w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors shadow-2xs',
                    node.depth === 1
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                      : 'bg-slate-100 text-slate-500 border border-slate-200/60 group-hover:text-slate-800'
                  )}
                >
                  <Folder className="w-3.5 h-3.5" weight={node.depth === 1 ? 'fill' : 'regular'} />
                </div>
              )}

              {/* Category Name */}
              <span
                className={cn(
                  'truncate tracking-tight',
                  node.depth === 1
                    ? 'font-bold text-slate-900 text-xs'
                    : 'font-semibold text-slate-800 text-xs'
                )}
              >
                {node.name}
              </span>
            </div>
          </td>

          {/* Depth / Placement Level */}
          <td className="py-3 px-3 text-center">
            {getDepthBadge(node.depth)}
          </td>

          {/* Parent Category Column */}
          <td className="py-3 px-3">
            {renderParentCategory(node)}
          </td>

          {/* Subcategories Preview */}
          <td className="py-3 px-4">
            {renderSubcategoriesColumn(node)}
          </td>

          {/* Quick Action Column: + Subcategory */}
          <td className="py-3 px-4 text-right">
            {node.depth < 5 && onAddSubcategory ? (
              <button
                type="button"
                onClick={() => onAddSubcategory(node)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98]"
                title={`Add a subcategory nested directly under "${node.name}"`}
              >
                <Plus className="w-3 h-3 text-emerald-700" weight="bold" />
                <span>Add Sub</span>
              </button>
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
          'group transition-colors border-b border-slate-100 hover:bg-emerald-50/20',
          node.depth === 1 ? 'bg-white' : 'bg-slate-50/40'
        )}
      >
        {/* Category Name */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                'w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 shadow-2xs',
                node.depth === 1
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                  : 'bg-slate-100 text-slate-500 border border-slate-200/60'
              )}
            >
              <Folder className="w-3.5 h-3.5" weight={node.depth === 1 ? 'fill' : 'regular'} />
            </div>
            <span
              className={cn(
                'truncate',
                node.depth === 1
                  ? 'font-bold text-slate-900 text-xs'
                  : 'font-semibold text-slate-800 text-xs'
              )}
            >
              {node.name}
            </span>
          </div>
        </td>

        {/* Level */}
        <td className="py-3 px-3 text-center">
          {getDepthBadge(node.depth)}
        </td>

        {/* Parent Category */}
        <td className="py-3 px-3">
          {renderParentCategory(node)}
        </td>

        {/* Subcategories */}
        <td className="py-3 px-4">
          {renderSubcategoriesColumn(node)}
        </td>

        {/* Actions */}
        <td className="py-3 px-4 text-right">
          {node.depth < 5 && onAddSubcategory ? (
            <button
              type="button"
              onClick={() => onAddSubcategory(node)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98]"
              title={`Add a subcategory nested directly under "${node.name}"`}
            >
              <Plus className="w-3 h-3 text-emerald-700" weight="bold" />
              <span>Add Sub</span>
            </button>
          ) : (
            <span className="text-[10px] text-slate-400 italic">Max Depth (L5)</span>
          )}
        </td>
      </tr>
    );
  };

  const isFlatRender = viewMode === 'flat' || levelFilter === 'subs';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Table Toolbar */}
      <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        {/* Left: Filter Tabs */}
        <div className="flex items-center gap-1.5">
          <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 mr-1.5">
            Filter View:
          </span>
          <button
            type="button"
            onClick={() => onLevelFilterChange?.('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
              levelFilter === 'all'
                ? 'bg-[#1b4332] text-white shadow-xs ring-1 ring-emerald-700'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80 shadow-2xs'
            )}
          >
            All Categories ({flatNodes.length})
          </button>
          <button
            type="button"
            onClick={() => onLevelFilterChange?.('roots')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
              levelFilter === 'roots'
                ? 'bg-[#1b4332] text-white shadow-xs ring-1 ring-emerald-700'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80 shadow-2xs'
            )}
          >
            Root Categories ({flatNodes.filter((n) => n.depth === 1).length})
          </button>
          <button
            type="button"
            onClick={() => onLevelFilterChange?.('subs')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
              levelFilter === 'subs'
                ? 'bg-[#1b4332] text-white shadow-xs ring-1 ring-emerald-700'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80 shadow-2xs'
            )}
          >
            Subcategories ({flatNodes.filter((n) => n.depth > 1).length})
          </button>
        </div>

        {/* Right: Expand/Collapse & View Mode toggles */}
        <div className="flex items-center gap-3">
          {!isFlatRender && (
            <div className="flex items-center gap-1.5 text-[11px] bg-white px-2 py-1 rounded-lg border border-slate-200/80 shadow-2xs">
              <button
                type="button"
                onClick={handleExpandAll}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-emerald-800 font-semibold px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors"
                title="Expand all hierarchy levels"
              >
                <ArrowsOutLineVertical className="w-3.5 h-3.5" weight="bold" />
                Expand all
              </button>
              <span className="text-slate-200">|</span>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-emerald-800 font-semibold px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors"
                title="Collapse all subcategory branches"
              >
                <ArrowsInLineVertical className="w-3.5 h-3.5" weight="bold" />
                Collapse all
              </button>
            </div>
          )}

          {levelFilter !== 'subs' && (
            <div className="flex items-center rounded-lg border border-slate-200/80 bg-white p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('tree')}
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all',
                  viewMode === 'tree'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                )}
                title="Tree hierarchy view"
              >
                <TreeStructure className="w-3.5 h-3.5" weight="bold" />
                Tree
              </button>
              <button
                type="button"
                onClick={() => setViewMode('flat')}
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all',
                  viewMode === 'flat'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                )}
                title="Flat list view"
              >
                <ListDashes className="w-3.5 h-3.5" weight="bold" />
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
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 font-bold text-slate-600">Category Name</th>
              <th className="py-3 px-3 font-bold text-slate-600 text-center w-24">Level</th>
              <th className="py-3 px-3 font-bold text-slate-600 w-56">Parent Category</th>
              <th className="py-3 px-4 font-bold text-slate-600 w-56">Subcategories</th>
              <th className="py-3 px-4 font-bold text-slate-600 text-right w-36">Actions</th>
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
