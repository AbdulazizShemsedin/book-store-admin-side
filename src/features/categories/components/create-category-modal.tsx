'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Category } from '@/types/domain';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { categoriesApi } from '../api/categories-api';
import { useQueryClient } from '@tanstack/react-query';
import { CATEGORIES_QUERY_KEY } from '../hooks/use-categories';
import { ApiError } from '@/lib/api/error-handler';
import {
  buildCategoryTree,
  flattenCategoryTree,
  CategoryTreeNode,
} from '../utils/category-tree';
import {
  Folder,
  FolderOpen,
  TreeStructure,
  CaretRight,
  CaretDown,
  MagnifyingGlass,
  CheckCircle,
  WarningCircle,
  X,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils/cn';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialParentId?: string | null;
}

export function CreateCategoryModal({
  isOpen,
  onClose,
  categories,
  initialParentId = null,
}: CreateCategoryModalProps) {
  const queryClient = useQueryClient();

  // Build tree & flat list
  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);
  const flatNodes = useMemo(() => flattenCategoryTree(categoryTree), [categoryTree]);

  // Max depth is 5, so parents can only be up to depth 4
  const eligibleParents = useMemo(
    () => flatNodes.filter((n) => n.depth < 5),
    [flatNodes]
  );

  // Form states
  const [isSubcategory, setIsSubcategory] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Parent selector dropdown
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);
  const [parentSearch, setParentSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Reset or initialize state whenever modal opens or initialParentId changes
  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      setCategoryName('');
      setParentSearch('');
      setIsParentDropdownOpen(false);

      if (initialParentId) {
        setIsSubcategory(true);
        setParentId(initialParentId);
      } else {
        setIsSubcategory(false);
        setParentId(null);
      }
    }
  }, [isOpen, initialParentId]);

  // Click outside listener for parent dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsParentDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedParentNode = useMemo(
    () => (parentId ? flatNodes.find((n) => n.id === parentId) || null : null),
    [flatNodes, parentId]
  );

  const filteredParents = useMemo(() => {
    if (!parentSearch.trim()) return eligibleParents;
    const term = parentSearch.toLowerCase();
    return eligibleParents.filter((n) => n.fullPath.toLowerCase().includes(term));
  }, [eligibleParents, parentSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmed = categoryName.trim();
    if (!trimmed) {
      setFormError('Please enter a category name.');
      return;
    }

    if (trimmed.length > 128) {
      setFormError('Category name cannot exceed 128 characters.');
      return;
    }

    if (isSubcategory && !parentId) {
      setFormError('Please select a parent category for this subcategory.');
      return;
    }

    setIsSubmitting(true);
    try {
      await categoriesApi.create({
        name: trimmed,
        parentId: isSubcategory ? parentId : null,
      });

      await queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError('Failed to create category. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Category"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {formError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
            <WarningCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="font-medium">{formError}</div>
          </div>
        )}

        {/* 1. Category Structure Selection (Radio Cards) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            1. Placement Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Main Category Card */}
            <button
              type="button"
              onClick={() => {
                setIsSubcategory(false);
                setParentId(null);
              }}
              className={cn(
                'p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between',
                !isSubcategory
                  ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              )}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center',
                    !isSubcategory
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  )}
                >
                  <Folder className="w-4 h-4" weight="fill" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Main Category
                  </span>
                  <span className="text-[10px] text-slate-500">Root Level (L1)</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Top-level section. E.g., <em>Islamic Studies</em>, <em>History</em>, <em>Fiction</em>.
              </p>
              {!isSubcategory && (
                <div className="absolute top-2.5 right-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" weight="fill" />
                </div>
              )}
            </button>

            {/* Subcategory Card */}
            <button
              type="button"
              onClick={() => {
                setIsSubcategory(true);
                if (!parentId && eligibleParents.length > 0) {
                  setParentId(eligibleParents[0].id);
                }
              }}
              className={cn(
                'p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between',
                isSubcategory
                  ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              )}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center',
                    isSubcategory
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  )}
                >
                  <FolderOpen className="w-4 h-4" weight="fill" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Subcategory
                  </span>
                  <span className="text-[10px] text-slate-500">Nested Child (L2+)</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Nests inside a parent category. E.g., <em>Hadith</em> inside <em>Arabic</em>.
              </p>
              {isSubcategory && (
                <div className="absolute top-2.5 right-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" weight="fill" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* 2. Parent Category Selector (Only if Subcategory) */}
        {isSubcategory && (
          <div className="space-y-1.5" ref={dropdownRef}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <TreeStructure className="w-3.5 h-3.5 text-emerald-700" />
                2. Select Parent Category <span className="text-red-500">*</span>
              </label>
              {selectedParentNode && (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  New Level: L{selectedParentNode.depth + 1}
                </span>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsParentDropdownOpen((prev) => !prev)}
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs flex items-center justify-between hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-colors"
              >
                <div className="truncate flex items-center gap-2">
                  {selectedParentNode ? (
                    <>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                        L{selectedParentNode.depth}
                      </span>
                      <span className="font-semibold text-slate-800 truncate">
                        {selectedParentNode.fullPath}
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-400">Choose parent category...</span>
                  )}
                </div>
                <CaretDown
                  className={cn(
                    'w-4 h-4 text-slate-400 transition-transform flex-shrink-0',
                    isParentDropdownOpen && 'rotate-180'
                  )}
                />
              </button>

              {/* Dropdown Menu */}
              {isParentDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in duration-150">
                  <div className="p-2 bg-slate-50 border-b border-slate-100">
                    <div className="relative">
                      <MagnifyingGlass className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={parentSearch}
                        onChange={(e) => setParentSearch(e.target.value)}
                        placeholder="Filter parent categories..."
                        className="w-full h-8 pl-8 pr-7 text-xs bg-white border border-slate-200 rounded-md placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                        autoFocus
                      />
                      {parentSearch && (
                        <button
                          type="button"
                          onClick={() => setParentSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-56 overflow-y-auto p-1 divide-y divide-slate-50">
                    {filteredParents.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No categories found matching &quot;{parentSearch}&quot;
                      </div>
                    ) : (
                      filteredParents.map((node) => {
                        const isSelected = node.id === parentId;
                        return (
                          <button
                            key={node.id}
                            type="button"
                            onClick={() => {
                              setParentId(node.id);
                              setIsParentDropdownOpen(false);
                            }}
                            className={cn(
                              'w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 rounded-lg transition-colors',
                              isSelected && 'bg-emerald-50 text-emerald-800 font-medium'
                            )}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span
                                className={cn(
                                  'px-1.5 py-0.5 rounded text-[10px] font-semibold border flex-shrink-0',
                                  node.depth === 1
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                )}
                              >
                                L{node.depth}
                              </span>
                              <span className="truncate">{node.fullPath}</span>
                            </div>
                            {isSelected && (
                              <CheckCircle
                                className="w-4 h-4 text-emerald-600 flex-shrink-0"
                                weight="fill"
                              />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Category Name Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            {isSubcategory ? '3. Subcategory Name' : '2. Category Name'}{' '}
            <span className="text-red-500">*</span>
          </label>
          <Input
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder={
              isSubcategory
                ? 'e.g. Hadith, Fiqh, Biographies, Grammar...'
                : 'e.g. Arabic, History, Fiction, Islamic Studies...'
            }
            maxLength={128}
            autoFocus={!isSubcategory}
          />
        </div>

        {/* 4. Live Visual Breadcrumb Preview */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Live Taxonomy Preview (How users will see it)
          </span>

          <div className="flex items-center gap-1.5 flex-wrap text-xs bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-2xs">
            {isSubcategory && selectedParentNode ? (
              <>
                <Folder className="w-4 h-4 text-emerald-700 flex-shrink-0" weight="fill" />
                <span className="text-slate-600 font-medium">
                  {selectedParentNode.fullPath}
                </span>
                <CaretRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <FolderOpen className="w-4 h-4 text-emerald-700 flex-shrink-0" weight="fill" />
                <span className="font-bold text-emerald-800">
                  {categoryName.trim() || '(Type subcategory name...)'}
                </span>
              </>
            ) : (
              <>
                <Folder className="w-4 h-4 text-emerald-700 flex-shrink-0" weight="fill" />
                <span className="font-bold text-emerald-800">
                  {categoryName.trim() || '(Type main category name...)'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium ml-2">
                  (Root Level)
                </span>
              </>
            )}
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            {isSubcategory
              ? 'This subcategory will be linked under the parent above. In the mobile app, users will see it when browsing or filtering that section.'
              : 'This will be created as a top-level category on the mobile home and category screen.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="bg-[#1e4634] hover:bg-[#153426] text-white"
          >
            {isSubcategory ? 'Create Subcategory' : 'Create Main Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
