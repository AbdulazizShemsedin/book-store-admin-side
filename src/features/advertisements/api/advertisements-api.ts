import { Advertisement } from '@/types/domain';
import { AdvertisementFormData } from '../schemas/advertisement-schema';

// Initial promotional banners faithfully taken from approved Figma Slide 12
const INITIAL_ADS: Advertisement[] = [
  {
    id: 'ad-01',
    message: 'Ramadan & Eid Book Fair — 30% OFF Classical Works',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    order: 1,
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'ad-02',
    message: 'Scholar Spotlight: Imam Al-Ghazali Collection — 20% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    order: 2,
    createdAt: '2026-09-10T12:00:00Z',
  },
  {
    id: 'ad-03',
    message: 'Audiobook Week — Stream Hadith Narrations Free',
    imageUrl: 'https://images.unsplash.com/photo-1507842229452-7104b77f3a9e?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    order: 3,
    createdAt: '2026-09-15T09:30:00Z',
  },
  {
    id: 'ad-04',
    message: 'Autumn Curation: Islamic History Volumes — 15% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    status: 'disabled',
    order: 4,
    createdAt: '2026-09-20T14:15:00Z',
  },
];

function getStoredAds(): Advertisement[] {
  if (typeof window === 'undefined') return [...INITIAL_ADS];
  try {
    const raw = localStorage.getItem('tewba_ads_db');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [...INITIAL_ADS];
}

function saveStoredAds(ads: Advertisement[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('tewba_ads_db', JSON.stringify(ads));
  } catch {}
}

let inMemoryAds = getStoredAds();

export const advertisementsApi = {
  /**
   * BACKEND GAP ISOLATION:
   * The current OpenAPI contract does not expose promotional banner management endpoints.
   * This module maintains clean domain separation so that when the mobile app promo APIs
   * arrive, only this file is modified.
   */
  async list(): Promise<Advertisement[]> {
    return [...inMemoryAds].sort((a, b) => a.order - b.order);
  },

  async create(data: AdvertisementFormData): Promise<Advertisement> {
    const newAd: Advertisement = {
      id: `ad-${Date.now().toString().slice(-4)}`,
      message: data.message.trim(),
      imageUrl:
        data.imageUrl ||
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
      status: data.status,
      order: data.order,
      createdAt: new Date().toISOString(),
    };

    inMemoryAds.push(newAd);
    saveStoredAds(inMemoryAds);
    return newAd;
  },

  /**
   * Updates display order sequence (supports drag-and-drop persistence).
   */
  async reorder(orderedIds: string[]): Promise<Advertisement[]> {
    const updated = inMemoryAds.map((ad) => {
      const newIndex = orderedIds.indexOf(ad.id);
      if (newIndex !== -1) {
        return { ...ad, order: newIndex + 1 };
      }
      return ad;
    });

    inMemoryAds = updated.sort((a, b) => a.order - b.order);
    saveStoredAds(inMemoryAds);
    return inMemoryAds;
  },

  async toggleStatus(id: string): Promise<Advertisement | null> {
    const target = inMemoryAds.find((ad) => ad.id === id);
    if (!target) return null;

    target.status = target.status === 'active' ? 'disabled' : 'active';
    saveStoredAds(inMemoryAds);
    return { ...target };
  },

  async delete(id: string): Promise<void> {
    inMemoryAds = inMemoryAds.filter((ad) => ad.id !== id);
    saveStoredAds(inMemoryAds);
  },
};
