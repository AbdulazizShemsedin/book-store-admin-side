import { ListCategoryResponseItem } from '@/types/api';

/**
 * Initial mock category taxonomy conforming strictly to OpenAPI ListCategoryResponseItem schema.
 * Represents root categories and subcategories with parent_id linkage.
 */
export const initialMockCategories: ListCategoryResponseItem[] = [
  // Root Categories
  {
    id: 'c1000000-0000-4000-8000-000000000001',
    name: 'Fiction & Literature',
    parent_id: null,
  },
  {
    id: 'c1000000-0000-4000-8000-000000000002',
    name: 'History & Middle Eastern Studies',
    parent_id: null,
  },
  {
    id: 'c1000000-0000-4000-8000-000000000003',
    name: 'Poetry & Anthologies',
    parent_id: null,
  },
  {
    id: 'c1000000-0000-4000-8000-000000000004',
    name: 'Philosophy & Thought',
    parent_id: null,
  },
  {
    id: 'c1000000-0000-4000-8000-000000000005',
    name: 'Biography & Memoirs',
    parent_id: null,
  },

  // Subcategories for Fiction & Literature (c100...001)
  {
    id: 'c1000000-0000-4000-8000-000000000011',
    name: 'Contemporary Fiction',
    parent_id: 'c1000000-0000-4000-8000-000000000001',
  },
  {
    id: 'c1000000-0000-4000-8000-000000000012',
    name: 'Historical Novels',
    parent_id: 'c1000000-0000-4000-8000-000000000001',
  },
  {
    id: 'c1000000-0000-4000-8000-000000000013',
    name: 'Short Stories & Novellas',
    parent_id: 'c1000000-0000-4000-8000-000000000001',
  },
  // Level 3 Subcategory (under Historical Novels)
  {
    id: 'c1000000-0000-4000-8000-000000000014',
    name: 'Medieval & Ottoman Epics',
    parent_id: 'c1000000-0000-4000-8000-000000000012',
  },
  // Level 4 Subcategory (under Medieval & Ottoman Epics)
  {
    id: 'c1000000-0000-4000-8000-000000000015',
    name: 'Byzantine Frontier Chronicles',
    parent_id: 'c1000000-0000-4000-8000-000000000014',
  },
  // Level 5 Subcategory (under Byzantine Frontier Chronicles)
  {
    id: 'c1000000-0000-4000-8000-000000000016',
    name: '14th Century Constantinople',
    parent_id: 'c1000000-0000-4000-8000-000000000015',
  },

  // Subcategories for History & Middle Eastern Studies (c100...002)
  {
    id: 'c1000000-0000-4000-8000-000000000021',
    name: 'Islamic Golden Age & Andalusia',
    parent_id: 'c1000000-0000-4000-8000-000000000002',
  },
  {
    id: 'c1000000-0000-4000-8000-000000000022',
    name: 'Modern Levant & North Africa',
    parent_id: 'c1000000-0000-4000-8000-000000000002',
  },

  // Subcategories for Poetry (c100...003)
  {
    id: 'c1000000-0000-4000-8000-000000000031',
    name: 'Classical & Muallaqat',
    parent_id: 'c1000000-0000-4000-8000-000000000003',
  },
  {
    id: 'c1000000-0000-4000-8000-000000000032',
    name: 'Modern Free Verse & Resistance',
    parent_id: 'c1000000-0000-4000-8000-000000000003',
  },
];
