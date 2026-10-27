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
  thumbnail?: string | null;
  epubFileId?: string;
  audioFileId?: string;
  assets?: {
    book?: string | null;
    audio?: string | null;
  };
  price?: {
    bookOnly?: string | null;
    audioOnly?: string | null;
    total?: string | null;
  };
  series?: {
    id: string;
    name: string;
    position?: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Series {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  booksCount?: number;
}

export interface SeriesBook {
  id: string;
  name: string;
  position: number;
  author?: string | null;
  rating?: string | null;
  thumbnail?: string | null;
  owned?: boolean;
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
  color?: string;
  subcategories?: Category[];
}

export interface Plan {
  id: string;
  name: string; // mapped from backend "string"
  price: string;
  discount?: number | null;
  discountedPrice?: string | null;
  requireSeats: boolean;
  minimumSeats: number;
  maximumSeats?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Advertisement {
  id: string;
  message: string;
  imageUrl: string;
  banner?: string | null;
  buttonLabel?: string | null;
  activeUntil?: string | null;
  status: 'active' | 'disabled';
  order: number; // 1, 2, 3...
  createdAt?: string;
  action?: {
    type: 'book_detail' | 'external_link' | 'subscription';
    bookId?: string;
    url?: string;
    planId?: string;
  };
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
