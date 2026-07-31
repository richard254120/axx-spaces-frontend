import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchTourismListings,
  fetchFeaturedTourism,
  fetchTourismStats,
  fetchTourismById,
  tourismLogin,
  fetchMyTourismListings,
  fetchOwnerProfile,
  updateOwnerProfile,
  submitTourismReview,
} from './tourism';

const API_BASE = 'https://axx-spaces-backend-1.onrender.com/api';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('fetchTourismListings', () => {
  it('calls /tourism with query params', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [{ id: 1, name: 'Resort' }] }),
    }));

    const result = await fetchTourismListings({ category: 'Beach Resort', page: 1 });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/tourism?'),
      expect.any(Object)
    );
    const calledUrl = fetch.mock.calls[0][0];
    expect(calledUrl).toContain('category=Beach+Resort');
    expect(calledUrl).toContain('page=1');
    expect(result).toEqual([{ id: 1, name: 'Resort' }]);
  });

  it('skips empty/null/undefined params', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    }));

    await fetchTourismListings({ category: '', page: null, sort: undefined });
    const calledUrl = fetch.mock.calls[0][0];
    expect(calledUrl).not.toContain('category=');
    expect(calledUrl).not.toContain('page=');
    expect(calledUrl).not.toContain('sort=');
  });

  it('returns empty array when data is missing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    }));

    const result = await fetchTourismListings();
    expect(result).toEqual([]);
  });

  it('throws on server error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Internal Error' }),
    }));

    await expect(fetchTourismListings()).rejects.toThrow('Internal Error');
  });
});

describe('fetchFeaturedTourism', () => {
  it('calls /tourism/featured with limit', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [{ id: 1 }] }),
    }));

    const result = await fetchFeaturedTourism(3);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/tourism/featured?limit=3`,
      expect.any(Object)
    );
    expect(result).toEqual([{ id: 1 }]);
  });

  it('defaults to limit=6', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    }));

    await fetchFeaturedTourism();
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/tourism/featured?limit=6`,
      expect.any(Object)
    );
  });
});

describe('fetchTourismStats', () => {
  it('calls /tourism/stats and returns data', async () => {
    const stats = { total: 100, avgRating: 4.5 };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: stats }),
    }));

    const result = await fetchTourismStats();
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/tourism/stats`,
      expect.any(Object)
    );
    expect(result).toEqual(stats);
  });
});

describe('fetchTourismById', () => {
  it('calls /tourism/:id and returns data', async () => {
    const property = { id: '123', name: 'Hotel X' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: property }),
    }));

    const result = await fetchTourismById('123');
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/tourism/123`,
      expect.any(Object)
    );
    expect(result).toEqual(property);
  });
});

describe('tourismLogin', () => {
  it('posts credentials and returns token', async () => {
    const response = { token: 'jwt-token', user: { name: 'User' } };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(response),
    }));

    const result = await tourismLogin('user@test.com', 'pass123');
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/auth/login`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@test.com', password: 'pass123' }),
      })
    );
    expect(result).toEqual(response);
  });

  it('throws on invalid credentials', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'Invalid credentials' }),
    }));

    await expect(tourismLogin('bad@test.com', 'wrong')).rejects.toThrow('Invalid credentials');
  });
});

describe('fetchMyTourismListings', () => {
  it('calls /tourism/my with auth header', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [{ id: 1 }] }),
    }));

    const result = await fetchMyTourismListings('my-token');
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/tourism/my`,
      { headers: { Authorization: 'Bearer my-token' } }
    );
    expect(result).toEqual([{ id: 1 }]);
  });
});

describe('fetchOwnerProfile', () => {
  it('calls /tourism/owner/profile with auth header', async () => {
    const profile = { name: 'Owner', email: 'owner@test.com' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: profile }),
    }));

    const result = await fetchOwnerProfile('owner-token');
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/tourism/owner/profile`,
      { headers: { Authorization: 'Bearer owner-token' } }
    );
    expect(result).toEqual(profile);
  });
});

describe('updateOwnerProfile', () => {
  it('sends PATCH request with name and phone', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    }));

    const result = await updateOwnerProfile('token', { name: 'New Name', phone: '0712345678' });
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/tourism/owner/profile`,
      expect.objectContaining({
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token',
        },
        body: JSON.stringify({ name: 'New Name', phone: '0712345678' }),
      })
    );
    expect(result).toEqual({ success: true });
  });
});

describe('submitTourismReview', () => {
  it('posts review data to /tourism/:id/reviews', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    }));

    const review = { name: 'User', rating: 5, comment: 'Great!' };
    const result = await submitTourismReview('prop-1', review);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/tourism/prop-1/reviews`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      })
    );
    expect(result).toEqual({ success: true });
  });
});
