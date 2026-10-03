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

// Design-accurate dataset from approved Figma Slides 10 & 11
const REPORTS_MOCK_DATA: ReportsData = {
  summary: {
    booksSold: 1420,
    booksSoldGrowthPercent: 14.8,
    totalIncome: 544989,
    totalIncomeGrowthPercent: 150,
    audiobookBooks: 642,
    audiobookSharePercent: 45.2,
    salesPeriodLabel: 'May 01, 2024 – May 31, 2024',
  },
  dailyTrend: [
    { date: 'May 01', booksSold: 180, audiobooksSold: 90, revenue: 14200 },
    { date: 'May 07', booksSold: 280, audiobooksSold: 140, revenue: 21500 },
    { date: 'May 14', booksSold: 420, audiobooksSold: 210, revenue: 34800 },
    { date: 'May 21', booksSold: 560, audiobooksSold: 320, revenue: 49200 },
    { date: 'May 28', booksSold: 640, audiobooksSold: 380, revenue: 58900 },
    { date: 'May 31', booksSold: 710, audiobooksSold: 410, revenue: 64500 },
  ],
  topBooks: [
    { rank: 1, title: 'The Sealed Nectar', subtitle: 'Ar-Raheeq Al-Makhtum', soldCount: 420, percentOfSales: 30 },
    { rank: 2, title: 'Revival of the Religious', subtitle: 'Ihya Ulum al-Din', soldCount: 315, percentOfSales: 22 },
    { rank: 3, title: 'Lost Islamic History', subtitle: 'Reclaiming Muslim Civilisation', soldCount: 260, percentOfSales: 18 },
    { rank: 4, title: 'Destiny Disrupted', subtitle: 'A History of the World', soldCount: 198, percentOfSales: 14 },
    { rank: 5, title: 'The Book of Wisdom', subtitle: 'Kitab al-Hikma', soldCount: 142, percentOfSales: 10 },
  ],
  topAudiobooks: [
    { rank: 1, title: 'The Sealed Nectar', subtitle: 'Ar-Raheeq Al-Makhtum', soldCount: 420, hoursPlayed: 500 },
    { rank: 2, title: 'Revival of the Religious', subtitle: 'Ihya Ulum al-Din', soldCount: 315, hoursPlayed: 280 },
    { rank: 3, title: 'Lost Islamic History', subtitle: 'Reclaiming Muslim Civilisation', soldCount: 260, hoursPlayed: 200 },
    { rank: 4, title: 'Destiny Disrupted', subtitle: 'A History of the World', soldCount: 198, hoursPlayed: 150 },
    { rank: 5, title: 'The Book of Wisdom', subtitle: 'Kitab al-Hikma', soldCount: 142, hoursPlayed: 40 },
  ],
  transactions: [
    {
      id: 'TXN-01',
      title: 'Sahih Bukhari',
      category: 'Hadith',
      author: 'Imam Al-Bukhari',
      publisher: 'Darussalam Publishing house',
      formats: ['Print', 'EPUB', 'Audio'],
      unitsSold: 5420,
      income: 32520,
    },
    {
      id: 'TXN-02',
      title: 'Riyad Asalihin',
      category: 'Hadith',
      author: 'Imam Al-Nawawi',
      publisher: 'Darussalam Publishing house',
      formats: ['Print', 'EPUB', 'Audio'],
      unitsSold: 4110,
      income: 26715,
    },
    {
      id: 'TXN-03',
      title: 'The Sealed Nectar',
      category: 'Biography',
      author: 'Sheikh Safiur Rahman Mubarakpuri',
      publisher: 'Darussalam Publishing house',
      formats: ['Print', 'EPUB', 'Audio'],
      unitsSold: 3890,
      income: 23340,
    },
    {
      id: 'TXN-04',
      title: "Abu Shuja'",
      category: 'Islamic Jurisprudence',
      author: "Qadi Abu Shuja'",
      publisher: 'Darussalam Publishing house',
      formats: ['Print', 'EPUB'],
      unitsSold: 2750,
      income: 19250,
    },
    {
      id: 'TXN-05',
      title: 'Safina',
      category: 'Islamic Jurisprudence',
      author: 'Shaykh Salim bin Abdullah Al-Hadrami',
      publisher: 'Darussalam Publishing house',
      formats: ['Print', 'EPUB', 'Audio'],
      unitsSold: 2100,
      income: 14700,
    },
  ],
  totalTransactions: 342,
};

export const reportsApi = {
  /**
   * BACKEND GAP ISOLATION:
   * The current OpenAPI does not expose admin reporting or sales analytics endpoints.
   * This service adapter isolates report data fetching for when backend analytics
   * services are ready.
   */
  async getReports(period: string = '30d'): Promise<ReportsData> {
    // In future: return apiClient.get(`/admin/api/reports?period=${period}`)
    return {
      ...REPORTS_MOCK_DATA,
      summary: {
        ...REPORTS_MOCK_DATA.summary,
        salesPeriodLabel:
          period === 'today'
            ? 'Today: May 31, 2024'
            : period === '7d'
            ? 'Last 7 Days: May 24 – May 31, 2024'
            : 'May 01, 2024 – May 31, 2024',
      },
    };
  },
};
