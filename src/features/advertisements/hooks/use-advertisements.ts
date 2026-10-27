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

export function useAdvertisement(id: string | null) {
  return useQuery({
    queryKey: [ADS_QUERY_KEY, id],
    queryFn: () => (id ? advertisementsApi.getById(id) : null),
    enabled: Boolean(id),
  });
}

export function useCreateAdvertisement(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, bannerFile }: { data: AdvertisementFormData; bannerFile?: File }) =>
      advertisementsApi.create(data, bannerFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADS_QUERY_KEY] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
}

export function useUploadAdvertisementBanner(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      advertisementsApi.uploadBanner(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADS_QUERY_KEY] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
}
