'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CATEGORIES_QUERY_KEY } from '../hooks/use-categories';
import { categoriesApi } from '../api/categories-api';
import { Category } from '@/types/domain';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  X,
  Plus,
  Folder,
  Tag,
  CaretDown,
  MagnifyingGlass,
  TreeStructure,
} from '@phosphor-icons/react';
import { ApiError } from '@/lib/api/error-handler';
import { useQueryClient } from '@tanstack/react-query';
import {
  buildCategoryTree,
  flattenCategoryTree,
  CategoryTreeNode,
} from '../utils/category-tree';

interface CreateCategoryCardProps {
  categories: Category[];
  selectedParentId?: string | null;
  onParentChange?: (parentId: string | null) => void;
  onCancel?: () => void;
}

export function CreateCategoryCard({
  categories,
  selectedParentId: externalParentId,
  onParentChange,
  onCancel,
}: CreateCategoryCardProps) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Build tree & flat list with depth metadata
  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);
  const flatNodes = useMemo(() => flattenCategoryTree(categoryTree), [categoryTree]);

  // Eligible parent nodes: only depth 1 to 4 (so new category is at most depth 5)
  const eligibleParents = useMemo(
    () => flatNodes.filter((n) => n.depth < 5),
    [flatNodes]
  );

  // Field 0: Parent Category ID
  const [internalParentId, setInternalParentId] = useState<string | null>(null);
  const parentId = externalParentId !== undefined ? externalParentId : internalParentId;
  const setParentId = (id: string | null) => {
    if (onParentChange) onParentChange(id);
    setInternalParentId(id);
  };

  // Parent dropdown state
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);
  const [parentSearch, setParentSearch] = useState('');
  const parentDropdownRef = useRef<HTMLDivElement | null>(null);

  // Selected parent node details
  const selectedParentNode = useMemo(
    () => flatNodes.find((n) => n.id === parentId) || null,
    [flatNodes, parentId]
  );

  // Target depth for the new category being created
  const targetDepth = selectedParentNode ? selectedParentNode.depth + 1 : 1;

  // Field 1: Category Name
  const [categoryName, setCategoryName] = useState('');

  // Field 2: Child Subcategories (multi-item list)
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [newSubInput, setNewSubInput] = useState('');
  const [isSubDropdownOpen, setIsSubDropdownOpen] = useState(false);
  const subDropdownRef = useRef<HTMLDivElement | null>(null);

  // Registered subcategories from existing categories for autocomplete
  const registeredSubcategories = useMemo(() => {
    const set = new Set<string>();
    categories.forEach((c) => {
      if (c.parentId) {
        set.add(c.name.trim());
      }
    });
    return Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [categories]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        subDropdownRef.current &&
        !subDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSubDropdownOpen(false);
      }
      if (
        parentDropdownRef.current &&
        !parentDropdownRef.current.contains(event.target as Node)
      ) {
        setIsParentDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectRegisteredSub = (subName: string) => {
    if (!subcategories.includes(subName)) {
      setSubcategories((prev) => [...prev, subName]);
      setNewSubInput('');
      setFormError(null);
    }
    setIsSubDropdownOpen(false);
  };

  const handleAddSubcategory = () => {
    const trimmed = newSubInput.trim();
    if (!trimmed) return;

    // Handle comma-separated multiple entries
    const items = trimmed
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !subcategories.includes(s));

    if (items.length > 0) {
      setSubcategories((prev) => [...prev, ...items]);
      setNewSubInput('');
      setFormError(null);
    }
  };

  const handleRemoveSubcategory = (indexToRemove: number) => {
    setSubcategories((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDownSubInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubcategory();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const trimmedName = categoryName.trim();
    if (!trimmedName) {
      setFormError('Category name is required.');
      return;
    }

    if (trimmedName.length > 128) {
      setFormError('Category name must not exceed 128 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create the category/subcategory at target level
      const created = await categoriesApi.create({
        name: trimmedName,
        parentId: selectedParentNode ? selectedParentNode.id : null,
      });

      const newCategoryId = created.id;

      // 2. If user added child subcategories under this item (and targetDepth < 5)
      if (subcategories.length > 0 && targetDepth < 5) {
        for (const subName of subcategories) {
          await categoriesApi.create({
            name: subName,
            parentId: newCategoryId,
          });
        }
      }

      // 3. Invalidate query cache and reset form
      await queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });

      setCategoryName('');
      setSubcategories([]);
      setNewSubInput('');
      setParentId(null);

      const msg =
        subcategories.length > 0
          ? `Created "${trimmedName}" (Level ${targetDepth}) with ${subcategories.length} child subcategory${
              subcategories.length > 1 ? 'ies' : ''
            } (Level ${targetDepth + 1})!`
          : `Created "${trimmedName}" at Level ${targetDepth} successfully!`;

      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError('Failed to save category. Please check network connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      id="create-category-card"
      className="h-fit shadow-xs border-slate-200 scroll-mt-24 transition-all duration-500"
    >
      <CardHeader
        title="Create Category"
        subtitle="Create a top-level category or nest subcategories up to 5 levels deep."
      />
      <CardContent className="space-y-4">
        {formError && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200">
            {formError}
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Field 0: Parent Category (Taxonomy Hierarchy Placement) */}
          <div className="relative" ref={parentDropdownRef}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <TreeStructure className="w-3.5 h-3.5 text-emerald-800" />
                Parent Category
              </label>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Placement: Level {targetDepth} of 5
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsParentDropdownOpen((prev) => !prev)}
              className="w-full h-9 px-3 text-left text-xs bg-white border border-slate-300 rounded-lg flex items-center justify-between hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-colors"
            >
              <div className="truncate flex items-center gap-2">
                {selectedParentNode ? (
                  <>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      L{selectedParentNode.depth}
                    </span>
                    <span className="font-medium text-slate-800 truncate">
                      {selectedParentNode.fullPath}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      L1
                    </span>
                    <span className="text-slate-600 font-medium">
                      None (Top-Level Category · Level 1)
                    </span>
                  </>
                )}
              </div>
              <CaretDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isParentDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Parent Category Searchable Dropdown Menu */}
            {isParentDropdownOpen && (
              <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100">
                <div className="p-2 bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
                  <div className="relative">
                    <MagnifyingGlass className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={parentSearch}
                      onChange={(e) => setParentSearch(e.target.value)}
                      placeholder="Search existing categories..."
                      className="w-full h-7 pl-7 pr-2.5 text-xs bg-white border border-slate-200 rounded placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                <div className="py-1">
                  {/* None (Root) Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setParentId(null);
                      setIsParentDropdownOpen(false);
                      setParentSearch('');
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                      !parentId ? 'bg-emerald-50/80 font-semibold text-emerald-900' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="w-3.5 h-3.5 text-emerald-700" weight="duotone" />
                      <span>None (Top-Level Category · Level 1)</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Root</span>
                  </button>

                  {/* List of eligible parents (depth 1 to 4) */}
                  {eligibleParents
                    .filter((n) =>
                      parentSearch
                        ? n.fullPath.toLowerCase().includes(parentSearch.toLowerCase())
                        : true
                    )
                    .map((node) => {
                      const isSelected = parentId === node.id;
                      return (
                        <button
                          key={node.id}
                          type="button"
                          onClick={() => {
                            setParentId(node.id);
                            setIsParentDropdownOpen(false);
                            setParentSearch('');
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                            isSelected ? 'bg-emerald-50/80 font-semibold text-emerald-900' : 'text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                                node.depth === 1
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              L{node.depth}
                            </span>
                            <span className="truncate">{node.fullPath}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">
                            → Creates L{node.depth + 1}
                          </span>
                        </button>
                      );
                    })}

                  {eligibleParents.filter((n) =>
                    parentSearch
                      ? n.fullPath.toLowerCase().includes(parentSearch.toLowerCase())
                      : true
                  ).length === 0 &&
                    parentSearch && (
                      <div className="px-3 py-2 text-xs text-slate-400 italic">
                        No matching categories found.
                      </div>
                    )}
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-400 mt-1">
              Select an existing category to attach a subcategory under, or choose None for a root category.
            </p>
          </div>

          {/* Field 1: Category Name */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1.5">
              {targetDepth === 1 ? 'Category' : `Subcategory (Level ${targetDepth})`}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder={
                targetDepth === 1
                  ? 'e.g. Fiction, History, Science...'
                  : `Name for Level ${targetDepth} subcategory...`
              }
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
            />
          </div>

          {/* Field 2: Direct Child Subcategories (Available if targetDepth < 5) */}
          {targetDepth < 5 ? (
            <div className="relative" ref={subDropdownRef}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Subcategory
                </label>
                <span className="text-[10px] text-slate-400 font-medium">
                  Attaches at Level {targetDepth + 1}
                </span>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newSubInput}
                    onChange={(e) => {
                      setNewSubInput(e.target.value);
                      setIsSubDropdownOpen(true);
                    }}
                    onFocus={() => setIsSubDropdownOpen(true)}
                    onKeyDown={handleKeyDownSubInput}
                    placeholder="Select registered subcategory or search..."
                    className="w-full h-9 pl-3 pr-8 text-xs bg-white border border-slate-300 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  />
                  <button
                    type="button"
                    onClick={() => setIsSubDropdownOpen((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    aria-label="Toggle registered subcategories dropdown"
                  >
                    <CaretDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isSubDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleAddSubcategory}
                  leftIcon={<Plus className="w-3.5 h-3.5" weight="bold" />}
                  className="h-9 px-3 text-xs"
                >
                  Add
                </Button>
              </div>

              {/* Registered Subcategories Searchable Dropdown Menu */}
              {isSubDropdownOpen && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-52 overflow-y-auto py-1 divide-y divide-slate-100">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 flex items-center justify-between">
                    <span>Registered Subcategories</span>
                    <span className="text-[10px] font-normal text-slate-500">
                      {registeredSubcategories.length} available
                    </span>
                  </div>
                  {registeredSubcategories
                    .filter(
                      (s) =>
                        s.toLowerCase().includes(newSubInput.toLowerCase()) &&
                        !subcategories.includes(s)
                    )
                    .map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => handleSelectRegisteredSub(sub)}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center justify-between group transition-colors"
                      >
                        <span className="font-medium">{sub}</span>
                        <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700" />
                      </button>
                    ))}

                  {newSubInput.trim() &&
                    !registeredSubcategories.some(
                      (s) => s.toLowerCase() === newSubInput.trim().toLowerCase()
                    ) &&
                    !subcategories.includes(newSubInput.trim()) && (
                      <button
                        type="button"
                        onClick={handleAddSubcategory}
                        className="w-full text-left px-3 py-2 text-xs text-emerald-700 font-semibold hover:bg-emerald-50 flex items-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" weight="bold" />
                        <span>Add &quot;{newSubInput.trim()}&quot; as custom subcategory</span>
                      </button>
                    )}

                  {registeredSubcategories.filter(
                    (s) =>
                      s.toLowerCase().includes(newSubInput.toLowerCase()) &&
                      !subcategories.includes(s)
                  ).length === 0 &&
                    !newSubInput.trim() && (
                      <div className="px-3 py-2 text-xs text-slate-400 italic">
                        All registered subcategories already added.
                      </div>
                    )}
                </div>
              )}

              <p className="text-[11px] text-slate-400 mt-1">
                Select an existing registered subcategory from dropdown or type a custom one.
              </p>

              {/* Subcategories Chip List */}
              {subcategories.length > 0 && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Level {targetDepth + 1} Subcategories to create ({subcategories.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {subcategories.map((sub, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs"
                      >
                        <Tag className="w-3 h-3 text-emerald-700" />
                        <span>{sub}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubcategory(index)}
                          className="hover:text-red-600 rounded-full transition-colors ml-0.5"
                          title="Remove subcategory"
                          aria-label={`Remove ${sub}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900 text-xs">
              <span className="font-semibold block mb-0.5">Maximum Taxonomy Depth (Level 5)</span>
              This subcategory is being created at Level 5. Per catalog guidelines, Level 5 items cannot have further child subcategories.
            </div>
          )}

          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="bg-[#1e4634] hover:bg-[#153426] text-white flex-1"
            >
              Create
            </Button>
            {onCancel && (
              <Button type="button" variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
