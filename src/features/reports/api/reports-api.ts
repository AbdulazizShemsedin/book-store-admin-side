import { apiClient } from '@/lib/api/client';
import {
  ListPurchaseRecordsResponseBody,
  ListSubscriptionRecordsResponseBody,
} from '@/types/api';
import {
  ReportSummary,
  DailySalesDataPoint,
  TopSoldBook,
  TopSoldAudiobook,
  TransactionRecord,
} from '@/types/domain';

export interface ReportsData {
  summary: ReportSummary;
  dailyTrend: DailySalesDataPoint[];
  topBooks: TopSoldBook[];
  topAudiobooks: TopSoldAudiobook[];
  transactions: TransactionRecord[];
  totalTransactions: number;
}

export interface GetReportsParams {
  period?: 'today' | '7d' | '30d' | 'custom';
  startDate?: string;
  endDate?: string;
}

export const reportsApi = {
  /**
   * Retrieves and aggregates live sales analytics and transaction feeds
   * from GET /admin/api/reports/records/purchase and GET /admin/api/reports/records/subscription.
   */
  async getReports(params: GetReportsParams | string = '30d'): Promise<ReportsData> {
    const periodParam = typeof params === 'string' ? params : params.period || '30d';
    const startDateParam = typeof params === 'object' ? params.startDate : undefined;
    const endDateParam = typeof params === 'object' ? params.endDate : undefined;

    let apiPeriod: 'day' | 'week' | 'month' | 'year' | undefined = undefined;
    let date_start: string | undefined = undefined;
    let date_end: string | undefined = undefined;
    let salesPeriodLabel = 'Last 30 Days';

    const now = new Date();

    if (periodParam === 'today') {
      apiPeriod = 'day';
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      date_start = startOfToday.toISOString();
      date_end = now.toISOString();
      salesPeriodLabel = `Today: ${now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (periodParam === '7d') {
      apiPeriod = 'week';
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      date_start = sevenDaysAgo.toISOString();
      date_end = now.toISOString();
      salesPeriodLabel = `${sevenDaysAgo.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (periodParam === '30d') {
      apiPeriod = 'month';
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      date_start = thirtyDaysAgo.toISOString();
      date_end = now.toISOString();
      salesPeriodLabel = `${thirtyDaysAgo.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (periodParam === 'custom') {
      if (startDateParam) date_start = new Date(startDateParam).toISOString();
      if (endDateParam) {
        const end = new Date(endDateParam);
        end.setHours(23, 59, 59, 999);
        date_end = end.toISOString();
      }
      salesPeriodLabel = `Custom Range: ${startDateParam || 'Earliest'} to ${endDateParam || 'Latest'}`;
    }

    const queryParams: Record<string, string | number | undefined> = {
      page: 1,
      page_size: 100,
      period: apiPeriod,
      date_start,
      date_end,
    };

    // Concurrent parallel queries for minimal network latency
    const [purchaseRes, subRes] = await Promise.all([
      apiClient
        .get<ListPurchaseRecordsResponseBody>('/admin/api/reports/records/purchase', {
          params: queryParams,
        })
        .catch((err) => {
          console.warn('Failed to fetch purchase records from backend:', err);
          return { page: 1, page_size: 100, total: 0, records: [] };
        }),
      apiClient
        .get<ListSubscriptionRecordsResponseBody>('/admin/api/reports/records/subscription', {
          params: queryParams,
        })
        .catch((err) => {
          console.warn('Failed to fetch subscription records from backend:', err);
          return { page: 1, page_size: 100, total: 0, records: [] };
        }),
    ]);

    const rawPurchases = purchaseRes.records || [];
    const rawSubs = subRes.records || [];

    // Map purchases
    const purchaseTransactions: TransactionRecord[] = rawPurchases.map((p) => {
      const priceNum = parseFloat(p.paid_price) || 0;
      const formatMap: Record<string, ('Print' | 'EPUB' | 'Audio')[]> = {
        book_only: ['EPUB'],
        audio_only: ['Audio'],
        both: ['EPUB', 'Audio'],
      };

      return {
        id: p.id,
        title: p.plan?.name || 'Book Purchase',
        category: 'Book Sale',
        author: 'Catalog Author',
        publisher: 'Tewba Bookstore',
        formats: formatMap[p.type] || ['EPUB'],
        unitsSold: 1,
        income: priceNum,
        date: p.created_at,
        userName: p.user?.name || 'Customer',
        userDeletedAt: p.user?.deleted_at || null,
        recordType: 'purchase',
      };
    });

    // Map subscriptions
    const subTransactions: TransactionRecord[] = rawSubs.map((s) => {
      const priceNum = parseFloat(s.paid_price) || 0;
      return {
        id: s.id,
        title: `${s.plan?.name || 'Subscription'} (${s.type === 'renewal' ? 'Renewal' : 'Initial'})`,
        category: 'Subscription Plan',
        author: 'Tewba Membership',
        publisher: 'Subscription Tier',
        formats: ['EPUB', 'Audio'],
        unitsSold: 1,
        income: priceNum,
        date: s.created_at,
        userName: s.user?.name || 'Subscriber',
        userDeletedAt: s.user?.deleted_at || null,
        recordType: 'subscription',
      };
    });

    // Merge and sort chronologically (latest first)
    const allTransactions = [...purchaseTransactions, ...subTransactions].sort(
      (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    );

    // Compute live KPIs
    let totalIncome = 0;
    let booksSold = 0;
    let audiobookBooks = 0;

    purchaseTransactions.forEach((p) => {
      totalIncome += p.income;
      if (p.formats.includes('EPUB')) booksSold += 1;
      if (p.formats.includes('Audio')) audiobookBooks += 1;
    });

    subTransactions.forEach((s) => {
      totalIncome += s.income;
    });

    // Aggregate dailyTrend for charts
    const trendMap = new Map<
      string,
      { date: string; timestamp: number; booksSold: number; audiobooksSold: number; revenue: number }
    >();

    allTransactions.forEach((t) => {
      const dateObj = t.date ? new Date(t.date) : new Date();
      const dayKey = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
      const dayLabel = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      const existing = trendMap.get(dayKey) || {
        date: dayLabel,
        timestamp: dateObj.getTime(),
        booksSold: 0,
        audiobooksSold: 0,
        revenue: 0,
      };

      existing.revenue += t.income;
      if (t.formats.includes('EPUB')) existing.booksSold += 1;
      if (t.formats.includes('Audio')) existing.audiobooksSold += 1;
      trendMap.set(dayKey, existing);
    });

    const dailyTrend: DailySalesDataPoint[] = Array.from(trendMap.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(({ date, booksSold, audiobooksSold, revenue }) => ({
        date,
        booksSold,
        audiobooksSold,
        revenue: Math.round(revenue * 100) / 100,
      }));

    if (dailyTrend.length === 0) {
      dailyTrend.push({
        date: now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        booksSold: 0,
        audiobooksSold: 0,
        revenue: 0,
      });
    }

    // Aggregate Top Books ranking from real purchases
    const bookCountMap = new Map<string, number>();
    purchaseTransactions.forEach((p) => {
      bookCountMap.set(p.title, (bookCountMap.get(p.title) || 0) + 1);
    });

    const topBooks: TopSoldBook[] = Array.from(bookCountMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([title, count], idx) => ({
        rank: idx + 1,
        title,
        soldCount: count,
        percentOfSales: booksSold > 0 ? Math.round((count / booksSold) * 100) : 0,
      }));

    // Aggregate Top Audiobooks ranking
    const audioCountMap = new Map<string, number>();
    purchaseTransactions
      .filter((p) => p.formats.includes('Audio'))
      .forEach((p) => {
        audioCountMap.set(p.title, (audioCountMap.get(p.title) || 0) + 1);
      });

    const topAudiobooks: TopSoldAudiobook[] = Array.from(audioCountMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([title, count], idx) => ({
        rank: idx + 1,
        title,
        soldCount: count,
        hoursPlayed: count * 4,
      }));

    const totalSoldUnits = booksSold + audiobookBooks;
    const audiobookSharePercent =
      totalSoldUnits > 0 ? Math.round((audiobookBooks / totalSoldUnits) * 1000) / 10 : 0;

    return {
      summary: {
        booksSold,
        booksSoldGrowthPercent: 0,
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalIncomeGrowthPercent: 0,
        audiobookBooks,
        audiobookSharePercent,
        salesPeriodLabel,
      },
      dailyTrend,
      topBooks,
      topAudiobooks,
      transactions: allTransactions,
      totalTransactions: allTransactions.length,
    };
  },
};
