import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { advertisementsApi } from '../api/advertisements-api';
import { AdvertisementFormData } from '../schemas/advertisement-schema';

export const ADS_QUERY_KEY = 'advertisements';

export function useAdvertisements() {
  return useQuery({
    queryKey: [ADS_QUERY_KEY],
    queryFn: () => advertisementsApi.list(),
  });
}

export function useCreateAdvertisement(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdvertisementFormData) => advertisementsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADS_QUERY_KEY] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
}

export function useReorderAdvertisements() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedIds: string[]) => advertisementsApi.reorder(orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADS_QUERY_KEY] });
    },
  });
}

export function useToggleAdStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => advertisementsApi.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADS_QUERY_KEY] });
    },
  });
}

export function useDeleteAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => advertisementsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADS_QUERY_KEY] });
    },
  });
}
