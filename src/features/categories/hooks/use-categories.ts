import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, ListCategoriesParams } from '../api/categories-api';
import { CategoryFormData } from '../schemas/category-schema';

export const CATEGORIES_QUERY_KEY = 'categories';

export function useCategories(params: ListCategoriesParams = {}) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 50;
  const parentId = params.parentId || '';
  const search = params.search || '';

  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY, { page, pageSize, parentId, search }],
    queryFn: () => categoriesApi.list({ page, pageSize, parentId, search }),
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000, // 5 minutes fresh cache for static taxonomy
  });
}

export function useCreateCategory(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CategoryFormData) => categoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
  });
}

export function useSubcategories(parentId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY, 'subcategories', parentId],
    queryFn: () => categoriesApi.getSubcategories(parentId),
    enabled: Boolean(parentId && enabled),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAllCategories() {
  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY, 'all-tree'],
    queryFn: () => categoriesApi.getAllCategories(),
    staleTime: 5 * 60 * 1000,
  });
}

