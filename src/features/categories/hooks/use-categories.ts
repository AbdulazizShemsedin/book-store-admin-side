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
