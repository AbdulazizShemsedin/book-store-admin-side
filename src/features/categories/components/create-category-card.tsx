'use client';

import React, { useState } from 'react';
import { useCreateCategory, CATEGORIES_QUERY_KEY } from '../hooks/use-categories';
import { categoriesApi } from '../api/categories-api';
import { Category } from '@/types/domain';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus, Folder, Tag } from '@phosphor-icons/react';
import { ApiError } from '@/lib/api/error-handler';
import { useQueryClient } from '@tanstack/react-query';

interface CreateCategoryCardProps {
  categories: Category[];
  onCancel?: () => void;
}

export function CreateCategoryCard({ categories, onCancel }: CreateCategoryCardProps) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field 1: Category Name
  const [categoryName, setCategoryName] = useState('');

  // Field 2: Subcategories (multi-item list)
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [newSubInput, setNewSubInput] = useState('');

  // Existing root categories for optional autocomplete / linking
  const rootCategories = categories.filter((c) => !c.parentId);

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

    const trimmedCategory = categoryName.trim();
    if (!trimmedCategory) {
      setFormError('Category name is required.');
      return;
    }

    if (trimmedCategory.length > 128) {
      setFormError('Category name must not exceed 128 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Check if category already exists as a root category
      const existingRoot = rootCategories.find(
        (c) => c.name.toLowerCase() === trimmedCategory.toLowerCase()
      );

      let parentId: string;

      if (existingRoot) {
        parentId = existingRoot.id;
      } else {
        // Create root category
        const created = await categoriesApi.create({
          name: trimmedCategory,
          parentId: null,
        });
        parentId = created.id;
      }

      // 2. Create each added subcategory with parent_id set to this category
      if (subcategories.length > 0) {
        for (const subName of subcategories) {
          await categoriesApi.create({
            name: subName,
            parentId: parentId,
          });
        }
      }

      // 3. Invalidate query cache and reset form
      await queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });

      setCategoryName('');
      setSubcategories([]);
      setNewSubInput('');

      const msg =
        subcategories.length > 0
          ? `Category "${trimmedCategory}" and ${subcategories.length} subcategory${subcategories.length > 1 ? 'ies' : ''} created successfully!`
          : `Category "${trimmedCategory}" created successfully!`;

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
    <Card className="h-fit shadow-xs border-slate-200">
      <CardHeader
        title="Create Category"
        subtitle="Define a main category and attach one or more subcategories."
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
          {/* Field 1: Category */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              list="existing-category-options"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. Fiction, History, Science..."
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
            />
            <datalist id="existing-category-options">
              {rootCategories.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
            <p className="text-[11px] text-slate-400 mt-1">
              Enter a new category name or select an existing one to add subcategories under.
            </p>
          </div>

          {/* Field 2: Subcategory (supports multiple subcategories) */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1.5">
              Subcategory
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubInput}
                onChange={(e) => setNewSubInput(e.target.value)}
                onKeyDown={handleKeyDownSubInput}
                placeholder="e.g. Contemporary, Novels (press Enter)"
                className="flex-1 h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
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
            <p className="text-[11px] text-slate-400 mt-1">
              Add multiple subcategories for this category by typing and clicking Add or pressing Enter.
            </p>

            {/* Subcategories Chip List */}
            {subcategories.length > 0 && (
              <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Subcategories to be created ({subcategories.length}):
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
