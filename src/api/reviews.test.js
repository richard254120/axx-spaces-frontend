import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAllReviews,
  getReviewById,
  getReviewsStats,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
  addReply,
  getUserReviews,
  approveReview,
} from './reviews';

const API_BASE = 'https://axx-spaces-backend-1.onrender.com/api';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('getAllReviews', () => {
  it('fetches reviews with query params', async () => {
    const reviews = [{ id: 1, rating: 5 }];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve(reviews),
    }));

    const result = await getAllReviews({ page: 1, limit: 10 });
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/reviews?page=1&limit=10`
    );
    expect(result).toEqual(reviews);
  });

  it('works with no params', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve([]),
    }));

    await getAllReviews();
    expect(fetch).toHaveBeenCalledWith(`${API_BASE}/reviews?`);
  });
});

describe('getReviewById', () => {
  it('fetches a single review by id', async () => {
    const review = { id: '123', rating: 4 };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve(review),
    }));

    const result = await getReviewById('123');
    expect(fetch).toHaveBeenCalledWith(`${API_BASE}/reviews/123`);
    expect(result).toEqual(review);
  });
});

describe('getReviewsStats', () => {
  it('fetches review stats with query params', async () => {
    const stats = { average: 4.5, count: 100 };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve(stats),
    }));

    const result = await getReviewsStats({ propertyId: 'p1' });
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/reviews/stats/summary?propertyId=p1`
    );
    expect(result).toEqual(stats);
  });
});

describe('createReview', () => {
  it('posts review data with auth token', async () => {
    const reviewData = { rating: 5, comment: 'Excellent!' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    }));

    const result = await createReview(reviewData, 'token123');
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/reviews`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token123',
        },
        body: JSON.stringify(reviewData),
      }
    );
    expect(result).toEqual({ success: true });
  });
});

describe('updateReview', () => {
  it('sends PUT request with updated data', async () => {
    const reviewData = { rating: 4, comment: 'Updated' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    }));

    const result = await updateReview('rev-1', reviewData, 'token');
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/reviews/rev-1`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token',
        },
        body: JSON.stringify(reviewData),
      }
    );
    expect(result).toEqual({ success: true });
  });
});

describe('deleteReview', () => {
  it('sends DELETE request with auth token', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    }));

    const result = await deleteReview('rev-1', 'token');
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/reviews/rev-1`,
      {
        method: 'DELETE',
        headers: { Authorization: 'Bearer token' },
      }
    );
    expect(result).toEqual({ success: true });
  });
});

describe('markHelpful', () => {
  it('sends POST request to mark review helpful', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ helpfulCount: 5 }),
    }));

    const result = await markHelpful('rev-1', 'token');
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/reviews/rev-1/helpful`,
      {
        method: 'POST',
        headers: { Authorization: 'Bearer token' },
      }
    );
    expect(result).toEqual({ helpfulCount: 5 });
  });
});

describe('addReply', () => {
  it('sends POST request with reply comment', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    }));

    const result = await addReply('rev-1', 'Thank you!', 'token');
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/reviews/rev-1/reply`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token',
        },
        body: JSON.stringify({ comment: 'Thank you!' }),
      }
    );
    expect(result).toEqual({ success: true });
  });
});

describe('getUserReviews', () => {
  it('fetches user reviews with auth token', async () => {
    const reviews = [{ id: 1, rating: 5 }];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve(reviews),
    }));

    const result = await getUserReviews('token');
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/reviews/user/my-reviews`,
      { headers: { Authorization: 'Bearer token' } }
    );
    expect(result).toEqual(reviews);
  });
});

describe('approveReview', () => {
  it('sends PATCH request to approve review', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ approved: true }),
    }));

    const result = await approveReview('rev-1', 'admin-token');
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/reviews/rev-1/approve`,
      {
        method: 'PATCH',
        headers: { Authorization: 'Bearer admin-token' },
      }
    );
    expect(result).toEqual({ approved: true });
  });
});
