'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Category } from '@/types/domain';
import {
  buildCategoryTree,
  flattenCategoryTree,
  CategoryTreeNode,
} from '../utils/category-tree';
import { categoriesApi } from '../api/categories-api';
import { useQueryClient } from '@tanstack/react-query';
import { CATEGORIES_QUERY_KEY } from '../hooks/use-categories';
import {
  Folder,
  Tag,
  CaretRight,
  CaretDown,
  MagnifyingGlass,
  Plus,
  X,
  Check,
  TreeStructure,
  CaretLeft,
  ArrowsOutLineVertical,
  ArrowsInLineVertical,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

export const PRESET_CATEGORY_COLORS = [
  { name: 'Emerald', value: '#10b981' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Sky', value: '#0284c7' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Pink', value: '#db2777' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Slate', value: '#475569' },
];

export interface CategoryTreeSelectProps {
  categories: Category[];
  selectedCategoryIds: string[];
  onChange: (selectedIds: string[]) => void;
  maxSelections?: number;
  categoryColors?: Record<string, string>;
  onColorChange?: (categoryId: string, color: string) => void;
  error?: string;
  label?: string;
  helperText?: string;
}

export function CategoryTreeSelect({
  categories,
  selectedCategoryIds,
  onChange,
  maxSelections = 5,
  categoryColors = {},
  onColorChange,
  error,
  label = 'Category',
  helperText = 'Browse the nested folder tree or search. Up to 5 categories (optional).',
}: CategoryTreeSelectProps) {
  const queryClient = useQueryClient();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // Root categories per page for pagination

  // Creation panel state
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newParentId, setNewParentId] = useState<string>('');
  const [newCategoryColor, setNewCategoryColor] = useState<string>('#10b981');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);

  // Local color override map for instant interactive updates
  const [localColors, setLocalColors] = useState<Record<string, string>>(categoryColors);

  // Build the 5-level category tree
  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);
  const flatNodes = useMemo(() => flattenCategoryTree(categoryTree), [categoryTree]);

  // Lookup map for fast lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, CategoryTreeNode>();
    flatNodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [flatNodes]);

  // Expanded nodes state (by default expand root nodes)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const set = new Set<string>();
    categoryTree.forEach((root) => {
      if (root.children.length > 0) set.add(root.id);
    });
    return set;
  });

  // Eligible parents for new category creation (must be depth < 5 so child is at most depth 5)
  const eligibleParents = useMemo(
    () => flatNodes.filter((node) => node.depth < 5),
    [flatNodes]
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter tree based on search query
  const filteredTree = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categoryTree;

    // Filter recursively: keep a node if it matches OR if any of its descendants match
    function filterNode(node: CategoryTreeNode): CategoryTreeNode | null {
      const isMatch = node.name.toLowerCase().includes(q) || node.fullPath.toLowerCase().includes(q);
      const filteredChildren: CategoryTreeNode[] = [];

      for (const child of node.children) {
        const filteredChild = filterNode(child);
        if (filteredChild) filteredChildren.push(filteredChild);
      }

      if (isMatch || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        };
      }
      return null;
    }

    const result: CategoryTreeNode[] = [];
    for (const root of categoryTree) {
      const filtered = filterNode(root);
      if (filtered) result.push(filtered);
    }
    return result;
  }, [categoryTree, search]);

  // If searching, auto-expand all branches with matches
  useEffect(() => {
    if (search.trim()) {
      const allParentIds = new Set<string>();
      function collect(nodes: CategoryTreeNode[]) {
        for (const n of nodes) {
          if (n.children.length > 0) {
            allParentIds.add(n.id);
            collect(n.children);
          }
        }
      }
      collect(filteredTree);
      setExpandedIds(allParentIds);
      setCurrentPage(1);
    }
  }, [search, filteredTree]);

  // Paginate root categories
  const totalRootPages = Math.max(1, Math.ceil(filteredTree.length / pageSize));
  const paginatedRoots = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTree.slice(start, start + pageSize);
  }, [filteredTree, currentPage, pageSize]);

  // Toggle expansion of a node
  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExpandAll = () => {
    const all = new Set<string>();
    flatNodes.forEach((n) => {
      if (n.children.length > 0) all.add(n.id);
    });
    setExpandedIds(all);
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  // Toggle category selection
  const handleToggleCategory = (id: string) => {
    if (selectedCategoryIds.includes(id)) {
      onChange(selectedCategoryIds.filter((item) => item !== id));
    } else {
      if (selectedCategoryIds.length >= maxSelections) {
        return;
      }
      onChange([...selectedCategoryIds, id]);
    }
  };

  const handleRemoveCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedCategoryIds.filter((item) => item !== id));
  };

  // Color change handler
  const handleUpdateColor = (id: string, newColor: string) => {
    setLocalColors((prev) => ({ ...prev, [id]: newColor }));
    if (onColorChange) {
      onColorChange(id, newColor);
    }
  };

  const getCategoryColor = (cat: Category | CategoryTreeNode | undefined, id: string): string => {
    if (localColors[id]) return localColors[id];
    if (cat && cat.color) return cat.color;
    // Fallback based on ID hash for consistent aesthetic palette
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i);
    }
    const idx = Math.abs(hash) % PRESET_CATEGORY_COLORS.length;
    return PRESET_CATEGORY_COLORS[idx].value;
  };

  // Create new category inline
  const handleCreateCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setCreationError('Category name is required.');
      return;
    }
    if (trimmed.length > 128) {
      setCreationError('Category name must not exceed 128 characters.');
      return;
    }

    setIsSubmittingNew(true);
    setCreationError(null);

    try {
      const res = await categoriesApi.create({
        name: trimmed,
        parentId: newParentId ? newParentId : undefined,
        color: newCategoryColor,
      });

      const newId = res.id;
      setLocalColors((prev) => ({ ...prev, [newId]: newCategoryColor }));

      // Attach immediately to selected categories if limit not reached
      if (selectedCategoryIds.length < maxSelections && !selectedCategoryIds.includes(newId)) {
        onChange([...selectedCategoryIds, newId]);
      }

      await queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });

      setNewCategoryName('');
      setNewParentId('');
      setIsCreatingNew(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create category.';
      setCreationError(msg);
    } finally {
      setIsSubmittingNew(false);
    }
  };

  // Recursive tree node renderer
  const renderTreeNode = (node: CategoryTreeNode): React.ReactNode => {
    const isExpanded = expandedIds.has(node.id);
    const hasChildren = node.children.length > 0;
    const isSelected = selectedCategoryIds.includes(node.id);
    const isAtLimit = selectedCategoryIds.length >= maxSelections && !isSelected;
    const nodeColor = getCategoryColor(node, node.id);

    const depthBadge = {
      1: { label: 'L1', style: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
      2: { label: 'L2', style: 'bg-slate-100 text-slate-700 border-slate-200' },
      3: { label: 'L3', style: 'bg-blue-50 text-blue-700 border-blue-200' },
      4: { label: 'L4', style: 'bg-purple-50 text-purple-700 border-purple-200' },
      5: { label: 'L5', style: 'bg-amber-50 text-amber-800 border-amber-200' },
    }[node.depth as 1 | 2 | 3 | 4 | 5] || { label: `L${node.depth}`, style: 'bg-slate-100 text-slate-700 border-slate-200' };

    const paddingLeft = (node.depth - 1) * 18 + 8;

    return (
      <div key={node.id} className="select-none">
        <div
          onClick={() => {
            if (!isAtLimit) handleToggleCategory(node.id);
          }}
          style={{ paddingLeft: `${paddingLeft}px` }}
          className={cn(
            'group flex items-center justify-between py-1.5 pr-2.5 rounded-md text-xs cursor-pointer transition-colors',
            isSelected
              ? 'bg-emerald-50/80 text-emerald-950 font-medium'
              : isAtLimit
              ? 'opacity-50 cursor-not-allowed text-slate-400'
              : 'hover:bg-slate-100 text-slate-700'
          )}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {/* Expand / collapse trigger */}
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => toggleExpand(node.id, e)}
                className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-200/80 rounded transition-colors flex-shrink-0"
                aria-label={isExpanded ? 'Collapse subcategories' : 'Expand subcategories'}
              >
                {isExpanded ? (
                  <CaretDown className="w-3 h-3" weight="bold" />
                ) : (
                  <CaretRight className="w-3 h-3" weight="bold" />
                )}
              </button>
            ) : (
              <span className="w-4 flex items-center justify-center text-slate-300 flex-shrink-0 text-[10px]">
                {node.depth > 1 ? '↳' : '•'}
              </span>
            )}

            {/* Depth Level Badge */}
            <span
              className={cn(
                'text-[9px] font-bold px-1 py-0.2 rounded border flex-shrink-0',
                depthBadge.style
              )}
            >
              {depthBadge.label}
            </span>

            {/* Folder / Tag icon with color indicator */}
            <div className="relative flex items-center justify-center flex-shrink-0">
              {hasChildren ? (
                <Folder className="w-3.5 h-3.5 text-slate-500" weight="duotone" />
              ) : (
                <Tag className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span
                className="w-1.5 h-1.5 rounded-full absolute -bottom-0.5 -right-0.5 border border-white"
                style={{ backgroundColor: nodeColor }}
              />
            </div>

            {/* Category Name */}
            <span
              className="truncate"
              title={`${node.fullPath} (Level ${node.depth})`}
            >
              {node.name}
            </span>
          </div>

          {/* Selection indicator checkbox / checkmark */}
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            <div
              className={cn(
                'w-4 h-4 rounded border flex items-center justify-center transition-all',
                isSelected
                  ? 'bg-emerald-700 border-emerald-700 text-white'
                  : 'border-slate-300 bg-white group-hover:border-slate-400'
              )}
            >
              {isSelected && <Check className="w-3 h-3" weight="bold" />}
            </div>
          </div>
        </div>

        {/* Nested Child Nodes */}
        {hasChildren && isExpanded && (
          <div className="border-l border-slate-200/70 ml-2.5 my-0.5">
            {node.children.map((child) => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* Label & Header Controls */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          {label}{' '}
          <span className="text-[11px] font-normal text-slate-500 lowercase">
            ({selectedCategoryIds.length}/{maxSelections} selected)
          </span>
        </label>
        <button
          type="button"
          onClick={() => setIsCreatingNew((prev) => !prev)}
          className="text-xs font-medium text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
        >
          <Plus className="w-3 h-3" weight="bold" />
          <span>{isCreatingNew ? 'Close New Category' : 'Add New Category'}</span>
        </button>
      </div>

      {helperText && <p className="text-[11px] text-slate-500 -mt-1">{helperText}</p>}

      {/* Selected Categories as Colored Tags / Chips */}
      <div className="min-h-[38px] p-2 bg-slate-50/70 border border-slate-200 rounded-lg flex flex-wrap items-center gap-1.5">
        {selectedCategoryIds.length === 0 ? (
          <span className="text-xs text-slate-400 italic">
            No categories attached yet. Select up to 5 categories from the tree below.
          </span>
        ) : (
          selectedCategoryIds.map((id) => {
            const catNode = categoryMap.get(id);
            const catName = catNode ? catNode.name : id;
            const fullPath = catNode ? catNode.fullPath : catName;
            const catColor = getCategoryColor(catNode, id);

            return (
              <span
                key={id}
                style={{ backgroundColor: catColor }}
                title={fullPath}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-white shadow-xs animate-in fade-in duration-150"
              >
                <span className="truncate max-w-[160px]">{catName}</span>

                {/* Color picker for this selected tag */}
                <label
                  title={`Change color for "${catName}"`}
                  className="w-3.5 h-3.5 rounded-full border border-white/70 cursor-pointer overflow-hidden flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform"
                >
                  <input
                    type="color"
                    value={catColor}
                    onChange={(e) => handleUpdateColor(id, e.target.value)}
                    className="opacity-0 w-0 h-0"
                  />
                  <div className="w-full h-full" style={{ backgroundColor: catColor }} />
                </label>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => handleRemoveCategory(id, e)}
                  aria-label={`Remove category ${catName}`}
                  title={`Remove category ${catName}`}
                  className="text-white/80 hover:text-white transition-opacity ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })
        )}
      </div>

      {/* Embedded "Create New Category" Panel */}
      {isCreatingNew && (
        <div className="p-3.5 bg-white border border-emerald-200 rounded-xl shadow-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <TreeStructure className="w-4 h-4 text-emerald-800" />
              Create & Attach New Category
            </span>
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {creationError && (
            <p className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded">
              {creationError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Science Fiction, Epic Fantasy..."
                className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Parent Category (Optional - Nesting up to L5)
              </label>
              <select
                value={newParentId}
                onChange={(e) => setNewParentId(e.target.value)}
                className="w-full h-8 px-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              >
                <option value="">None (Top-Level Category)</option>
                {eligibleParents.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.fullPath} (Level {node.depth})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
              Tag / Category Color
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {PRESET_CATEGORY_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setNewCategoryColor(c.value)}
                  title={c.name}
                  className={cn(
                    'w-6 h-6 rounded-full transition-transform flex items-center justify-center border border-white shadow-xs',
                    newCategoryColor === c.value
                      ? 'scale-110 ring-2 ring-emerald-700 ring-offset-1'
                      : 'hover:scale-105'
                  )}
                  style={{ backgroundColor: c.value }}
                >
                  {newCategoryColor === c.value && (
                    <Check className="w-3 h-3 text-white" weight="bold" />
                  )}
                </button>
              ))}
              {/* Custom Color Input */}
              <label
                title="Custom color"
                className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center cursor-pointer overflow-hidden bg-white hover:border-slate-400"
              >
                <input
                  type="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="opacity-0 w-0 h-0"
                />
                <div className="w-full h-full" style={{ backgroundColor: newCategoryColor }} />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setIsCreatingNew(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              isLoading={isSubmittingNew}
              onClick={handleCreateCategory}
              className="bg-[#1e4634] hover:bg-[#153426] text-white"
            >
              Create & Attach
            </Button>
          </div>
        </div>
      )}

      {/* Main Tree Popover / Dropdown Trigger & Container */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            'w-full h-10 px-3.5 text-left text-xs bg-white border rounded-lg flex items-center justify-between transition-colors shadow-2xs',
            isOpen
              ? 'border-emerald-700 ring-2 ring-emerald-700/20'
              : 'border-slate-300 hover:border-slate-400',
            error && 'border-red-400'
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <TreeStructure className="w-4 h-4 text-emerald-800 flex-shrink-0" />
            <span className="text-slate-800 font-medium">
              {selectedCategoryIds.length === 0
                ? 'Browse Category Tree (Folder Hierarchy)...'
                : `${selectedCategoryIds.length} categor${
                    selectedCategoryIds.length > 1 ? 'ies' : 'y'
                  } selected`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 flex-shrink-0">
            <span className="text-[11px] text-slate-500">
              {selectedCategoryIds.length}/{maxSelections}
            </span>
            <CaretDown
              className={cn('w-3.5 h-3.5 transition-transform', isOpen && 'rotate-180')}
            />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header: Search + Expand/Collapse */}
            <div className="p-2.5 bg-slate-50/80 border-b border-slate-200/80 space-y-2">
              <div className="relative">
                <MagnifyingGlass className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search categories (e.g. Fiction, Ottoman, Science)..."
                  className="w-full h-8 pl-8 pr-7 text-xs bg-white border border-slate-200 rounded-md placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span className="font-medium">
                  {filteredTree.length} root categor{filteredTree.length !== 1 ? 'ies' : 'y'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExpandAll}
                    className="hover:text-emerald-800 flex items-center gap-0.5"
                  >
                    <ArrowsOutLineVertical className="w-3 h-3" />
                    <span>Expand All</span>
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={handleCollapseAll}
                    className="hover:text-emerald-800 flex items-center gap-0.5"
                  >
                    <ArrowsInLineVertical className="w-3 h-3" />
                    <span>Collapse All</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tree Nodes List */}
            <div className="max-h-64 overflow-y-auto p-2 space-y-1">
              {paginatedRoots.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No matching categories found in catalog.
                </div>
              ) : (
                paginatedRoots.map((rootNode) => renderTreeNode(rootNode))
              )}
            </div>

            {/* Footer with Tree Pagination & Selection Counter */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-medium">
                {selectedCategoryIds.length >= maxSelections ? (
                  <span className="text-amber-700 font-semibold">
                    Limit reached (max {maxSelections})
                  </span>
                ) : (
                  <span>
                    Selected: {selectedCategoryIds.length} of {maxSelections} max
                  </span>
                )}
              </span>

              {/* Pagination controls for large category sets */}
              {totalRootPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1 rounded text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent"
                    title="Previous page"
                  >
                    <CaretLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-semibold text-slate-700">
                    {currentPage} / {totalRootPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= totalRootPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalRootPages, p + 1))}
                    className="p-1 rounded text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent"
                    title="Next page"
                  >
                    <CaretRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setIsOpen(false)}
                className="h-7 px-3 text-xs"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
