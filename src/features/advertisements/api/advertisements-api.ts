import { apiClient } from '@/lib/api/client';
import {
  ListAdvertisementResponseBody,
  CreateAdvertisementRequestBody,
  CreateAdvertisementResponseBody,
  GetAdvertisementResponseBody,
  AdvertisementAction,
} from '@/types/api';
import { Advertisement } from '@/types/domain';
import { AdvertisementFormData } from '../schemas/advertisement-schema';

export const advertisementsApi = {
  /**
   * Retrieves advertisements from documented GET /admin/api/advertisement.
   */
  async list(): Promise<Advertisement[]> {
    try {
      const response = await apiClient.get<ListAdvertisementResponseBody>('/admin/api/advertisement', {
        params: { page: 1, page_size: 50 },
      });
      const rawAds = response.advertisements || [];
      return rawAds.map((ad, idx) => {
        const isExpired = ad.active_until ? new Date(ad.active_until).getTime() < Date.now() : false;
        return {
          id: ad.id,
          message: ad.message,
          imageUrl:
            ad.banner ||
            'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
          banner: ad.banner || null,
          status: isExpired ? 'disabled' : 'active',
          order: idx + 1,
          activeUntil: ad.active_until || undefined,
        };
      });
    } catch (err) {
      console.warn('Backend advertisement list call failed:', err);
      return [];
    }
  },

  /**
   * Retrieves single advertisement details via GET /admin/api/advertisement/{advertisement_id}.
   */
  async getById(id: string): Promise<GetAdvertisementResponseBody> {
    return apiClient.get<GetAdvertisementResponseBody>(`/admin/api/advertisement/${id}`);
  },

  /**
   * Step 1: Creates advertisement record via POST /admin/api/advertisement.
   * Returns generated advertisement ID.
   */
  async createRecord(data: AdvertisementFormData): Promise<{ id: string }> {
    let action: AdvertisementAction = { type: 'subscription' };
    if (data.actionType === 'book_detail' && data.actionBookId) {
      action = { type: 'book_detail', book_id: data.actionBookId };
    } else if (data.actionType === 'external_link' && data.actionUrl) {
      action = { type: 'external_link', url: data.actionUrl };
    } else {
      action = { type: 'subscription' };
    }

    const requestBody: CreateAdvertisementRequestBody = {
      message: data.message.trim(),
      button_label: data.buttonLabel?.trim() || undefined,
      active_until: data.activeUntil ? new Date(data.activeUntil).toISOString() : undefined,
      action,
    };

    const response = await apiClient.post<CreateAdvertisementResponseBody>(
      '/admin/api/advertisement',
      requestBody
    );

    return { id: response.id };
  },

  /**
   * Step 2: Uploads banner image via PUT /admin/api/advertisement/{advertisement_id}/banner.
   */
  async uploadBanner(id: string, file: File): Promise<void> {
    const normalizedType =
      file.type === 'image/png'
        ? 'image/png'
        : file.type === 'image/webp'
        ? 'image/webp'
        : 'image/jpeg';

    const normalizedName =
      file.name.replace(/\.[^/.]+$/, '') +
      (normalizedType === 'image/png' ? '.png' : normalizedType === 'image/webp' ? '.webp' : '.jpg');

    const preparedFile = new File([file], normalizedName, { type: normalizedType });

    const formData = new FormData();
    formData.append('banner', preparedFile, preparedFile.name);
    await apiClient.put(`/admin/api/advertisement/${id}/banner`, formData);
  },

  /**
   * Unified helper to create record and upload banner in sequence.
   */
  async create(data: AdvertisementFormData, bannerFile?: File): Promise<Advertisement> {
    const { id } = await this.createRecord(data);

    if (bannerFile && id) {
      await this.uploadBanner(id, bannerFile);
    }

    return {
      id,
      message: data.message.trim(),
      imageUrl: '',
      buttonLabel: data.buttonLabel?.trim() || undefined,
      activeUntil: data.activeUntil || undefined,
      status: 'active',
      order: 1,
      createdAt: new Date().toISOString(),
    };
  },
};
