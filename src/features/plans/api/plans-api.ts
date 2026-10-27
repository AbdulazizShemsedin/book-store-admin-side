import { apiClient } from '@/lib/api/client';
import {
  ListPlanResponseBody,
  GetPlanResponseBody,
  UpdatePlanRequestBody,
} from '@/types/api';
import { Plan } from '@/types/domain';

export interface ListPlansParams {
  page?: number;
  pageSize?: number;
}

export interface ListPlansResult {
  plans: Plan[];
  total: number;
  page: number;
  pageSize: number;
}

export const plansApi = {
  /**
   * Retrieves paginated plans from GET /admin/api/plan.
   * Maps backend "string" property to frontend domain "name".
   */
  async list(params: ListPlansParams = {}, signal?: AbortSignal): Promise<ListPlansResult> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    const queryParams: Record<string, string | number | undefined> = {
      page,
      page_size: pageSize,
    };

    const response = await apiClient.get<ListPlanResponseBody>('/admin/api/plan', {
      params: queryParams,
      signal,
    });

    const rawPlans = response.plans || [];

    const plans: Plan[] = rawPlans.map((item) => ({
      id: item.id,
      name: item.string || 'Plan',
      price: item.price,
      discount: item.discount ?? null,
      requireSeats: false,
      minimumSeats: 1,
    }));

    return {
      plans,
      total: response.total ?? plans.length,
      page: response.page || page,
      pageSize: response.page_size || pageSize,
    };
  },

  /**
   * Retrieves single plan details via GET /admin/api/plan/{plan_id}.
   */
  async getById(id: string): Promise<Plan> {
    const raw = await apiClient.get<GetPlanResponseBody>(`/admin/api/plan/${id}`);
    return {
      id: raw.id || id,
      name: raw.string || 'Plan',
      price: raw.price,
      discount: raw.discount ?? null,
      discountedPrice: raw.discounted_price ?? null,
      requireSeats: raw.require_seats,
      minimumSeats: raw.minimum_seats,
      maximumSeats: raw.maximum_seats ?? null,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
  },

  /**
   * Updates plan price and/or discount percentage via PATCH /admin/api/plan/{plan_id}.
   */
  async update(
    id: string,
    data: { price?: string; discount?: number }
  ): Promise<void> {
    const body: UpdatePlanRequestBody = {};
    if (data.price !== undefined && data.price.trim().length > 0) {
      body.price = data.price.trim();
    }
    if (typeof data.discount === 'number') {
      body.discount = data.discount;
    }

    await apiClient.patch(`/admin/api/plan/${id}`, body);
  },
};
