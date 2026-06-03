import { describe, it, expect } from 'vitest';
import {
  API_SORT,
  CATEGORY_OPTIONS,
  SORT_OPTIONS,
  CATEGORY_ICONS,
  DEFAULT_STATS,
  DEFAULT_CATEGORIES,
  ADVERTISING_PACKAGES,
  PROPERTY_CATEGORIES,
  KENYA_COUNTIES,
  AMENITIES_LIST,
  REGISTER_STEPS,
  INITIAL_REGISTER_FORM,
  STATUS_LABELS,
  FALLBACK_PROPERTIES,
  filterPropertiesLocal,
} from './constants';

describe('constants exports', () => {
  it('API_SORT maps display labels to API sort values', () => {
    expect(API_SORT['Recommended']).toBe('recommended');
    expect(API_SORT['Price: Low to High']).toBe('price-asc');
    expect(API_SORT['Price: High to Low']).toBe('price-desc');
    expect(API_SORT['Highest Rated']).toBe('rating-desc');
    expect(API_SORT['Most Reviewed']).toBe('reviews-desc');
  });

  it('CATEGORY_OPTIONS includes All and category names', () => {
    expect(CATEGORY_OPTIONS).toContain('All');
    expect(CATEGORY_OPTIONS).toContain('Beach Resort');
    expect(CATEGORY_OPTIONS.length).toBeGreaterThan(1);
  });

  it('SORT_OPTIONS are the keys of API_SORT', () => {
    expect(SORT_OPTIONS).toEqual(Object.keys(API_SORT));
  });

  it('CATEGORY_ICONS has an icon for each category option (except All is included)', () => {
    expect(CATEGORY_ICONS['All']).toBeDefined();
    expect(CATEGORY_ICONS['Beach Resort']).toBeDefined();
  });

  it('DEFAULT_STATS has 4 entries with val and label', () => {
    expect(DEFAULT_STATS).toHaveLength(4);
    DEFAULT_STATS.forEach((stat) => {
      expect(stat).toHaveProperty('val');
      expect(stat).toHaveProperty('label');
    });
  });

  it('DEFAULT_CATEGORIES has entries with name, emoji, and count', () => {
    expect(DEFAULT_CATEGORIES.length).toBeGreaterThan(0);
    DEFAULT_CATEGORIES.forEach((cat) => {
      expect(cat).toHaveProperty('name');
      expect(cat).toHaveProperty('emoji');
      expect(cat).toHaveProperty('count');
    });
  });

  it('ADVERTISING_PACKAGES has at least one popular package', () => {
    const popular = ADVERTISING_PACKAGES.filter((p) => p.popular);
    expect(popular.length).toBeGreaterThanOrEqual(1);
    ADVERTISING_PACKAGES.forEach((pkg) => {
      expect(pkg).toHaveProperty('name');
      expect(pkg).toHaveProperty('price');
      expect(typeof pkg.price).toBe('number');
    });
  });

  it('PROPERTY_CATEGORIES is an array of strings', () => {
    expect(PROPERTY_CATEGORIES.length).toBeGreaterThan(0);
    PROPERTY_CATEGORIES.forEach((cat) => {
      expect(typeof cat).toBe('string');
    });
  });

  it('KENYA_COUNTIES is an array of strings', () => {
    expect(KENYA_COUNTIES).toContain('Nairobi');
    expect(KENYA_COUNTIES).toContain('Mombasa');
  });

  it('AMENITIES_LIST is an array of strings', () => {
    expect(AMENITIES_LIST).toContain('WiFi');
    expect(AMENITIES_LIST).toContain('Swimming Pool');
  });

  it('REGISTER_STEPS has 6 steps', () => {
    expect(REGISTER_STEPS).toHaveLength(6);
  });

  it('INITIAL_REGISTER_FORM has expected default fields', () => {
    expect(INITIAL_REGISTER_FORM.ownerName).toBe('');
    expect(INITIAL_REGISTER_FORM.amenities).toEqual([]);
    expect(INITIAL_REGISTER_FORM.checkIn).toBe('14:00');
    expect(INITIAL_REGISTER_FORM.checkOut).toBe('11:00');
    expect(INITIAL_REGISTER_FORM.agreeTerms).toBe(false);
  });

  it('STATUS_LABELS has pending, approved, rejected', () => {
    expect(STATUS_LABELS.pending.label).toBe('Under review');
    expect(STATUS_LABELS.approved.label).toBe('Live');
    expect(STATUS_LABELS.rejected.label).toBe('Rejected');
  });

  it('FALLBACK_PROPERTIES has entries with required fields', () => {
    expect(FALLBACK_PROPERTIES.length).toBeGreaterThan(0);
    FALLBACK_PROPERTIES.forEach((prop) => {
      expect(prop).toHaveProperty('id');
      expect(prop).toHaveProperty('name');
      expect(prop).toHaveProperty('price');
      expect(prop).toHaveProperty('rating');
      expect(prop).toHaveProperty('category');
      expect(prop).toHaveProperty('location');
    });
  });
});

describe('filterPropertiesLocal', () => {
  const properties = [
    { id: 1, name: 'Beach Resort A', location: 'Mombasa', county: 'Mombasa', category: 'Beach Resort', price: 12000, rating: 4.5 },
    { id: 2, name: 'City Hotel B', location: 'Nairobi CBD', county: 'Nairobi', category: 'City Hotel', price: 8000, rating: 4.2 },
    { id: 3, name: 'Mountain Lodge C', location: 'Nanyuki', county: 'Laikipia', category: 'Mountain Lodge', price: 25000, rating: 4.9 },
    { id: 4, name: 'Safari Camp D', location: 'Masai Mara', county: 'Narok', category: 'Safari Camp', price: 30000, rating: 4.8 },
  ];

  it('returns all properties when category is All and no filters', () => {
    const result = filterPropertiesLocal(properties, {
      category: 'All',
      maxPrice: 50000,
      minRating: 0,
      search: '',
    });
    expect(result).toHaveLength(4);
  });

  it('filters by category', () => {
    const result = filterPropertiesLocal(properties, {
      category: 'Beach Resort',
      maxPrice: 50000,
      minRating: 0,
      search: '',
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Beach Resort A');
  });

  it('filters by maxPrice', () => {
    const result = filterPropertiesLocal(properties, {
      category: 'All',
      maxPrice: 10000,
      minRating: 0,
      search: '',
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('City Hotel B');
  });

  it('filters by minRating', () => {
    const result = filterPropertiesLocal(properties, {
      category: 'All',
      maxPrice: 50000,
      minRating: 4.8,
      search: '',
    });
    expect(result).toHaveLength(2);
  });

  it('filters by search term matching name', () => {
    const result = filterPropertiesLocal(properties, {
      category: 'All',
      maxPrice: 50000,
      minRating: 0,
      search: 'safari',
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Safari Camp D');
  });

  it('filters by search term matching location', () => {
    const result = filterPropertiesLocal(properties, {
      category: 'All',
      maxPrice: 50000,
      minRating: 0,
      search: 'mombasa',
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Beach Resort A');
  });

  it('filters by search term matching county', () => {
    const result = filterPropertiesLocal(properties, {
      category: 'All',
      maxPrice: 50000,
      minRating: 0,
      search: 'nairobi',
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('City Hotel B');
  });

  it('combines multiple filters', () => {
    const result = filterPropertiesLocal(properties, {
      category: 'All',
      maxPrice: 20000,
      minRating: 4.4,
      search: '',
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Beach Resort A');
  });

  it('returns empty array when no properties match', () => {
    const result = filterPropertiesLocal(properties, {
      category: 'All',
      maxPrice: 1000,
      minRating: 0,
      search: '',
    });
    expect(result).toHaveLength(0);
  });

  it('handles empty search string', () => {
    const result = filterPropertiesLocal(properties, {
      category: 'All',
      maxPrice: 50000,
      minRating: 0,
      search: '',
    });
    expect(result).toHaveLength(4);
  });
});
