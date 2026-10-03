/**
 * Domain Models for TEWBA Admin.
 * These clean models isolate components from backend naming peculiarities
 * (e.g. author display name returned as "string") and support future backend fields.
 */

export interface Author {
  id: string;
  name: string;
  nationality?: string;
  worksCount?: number;
  status?: 'active' | 'inactive';
  bio?: string;
  photoUrl?: string;
}

export type BookFormat = 'EPUB' | 'PDF' | 'Audiobook' | 'Print';

export interface Book {
  id: string;
  name: string;
  author?: string;
  authorId?: string;
  publisher?: string;
  publisherId?: string;
  status: 'Published' | 'Draft' | 'Review' | 'Archived' | string;
  pageCount?: number;
  description?: string;
  language?: string;
  tags?: string[];
  category?: string;
  categoryId?: string;
  subcategory?: string;
  subcategoryId?: string;
  hasAudiobook?: boolean;
  narrator?: string;
  coverUrl?: string;
  epubFileId?: string;
  audioFileId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Publisher {
  id: string;
  name: string;
  monogram: string;
  booksCount?: number;
  status?: 'Active' | 'Inactive';
}

export interface Category {
  id: string;
  name: string;
  parentId?: string | null;
  subcategories?: Category[];
}

export interface Advertisement {
  id: string;
  message: string;
  imageUrl: string;
  status: 'active' | 'disabled';
  order: number; // 1, 2, 3...
  createdAt?: string;
}

export interface ReportSummary {
  booksSold: number;
  booksSoldGrowthPercent: number;
  totalIncome: number;
  totalIncomeGrowthPercent: number;
  audiobookBooks: number;
  audiobookSharePercent: number;
  salesPeriodLabel: string;
}

export interface DailySalesDataPoint {
  date: string;
  booksSold: number;
  audiobooksSold: number;
  revenue: number;
}

export interface TopSoldBook {
  rank: number;
  title: string;
  subtitle?: string;
  soldCount: number;
  percentOfSales: number;
}

export interface TopSoldAudiobook {
  rank: number;
  title: string;
  subtitle?: string;
  soldCount: number;
  hoursPlayed: number;
}

export interface TransactionRecord {
  id: string; // e.g. TXN-01
  title: string;
  category: string;
  author: string;
  publisher: string;
  formats: ('Print' | 'EPUB' | 'Audio')[];
  unitsSold: number;
  income: number;
  date?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
}
