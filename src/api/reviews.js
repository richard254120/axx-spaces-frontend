const API_BASE = import.meta.env.VITE_API_BASE || "https://axx-spaces-backend-1.onrender.com/api";

async function parseResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed (${res.status})`);
  }
  return data;
}

// Get all reviews
export const getAllReviews = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE}/reviews?${queryString}`);
  return parseResponse(response);
};

// Get single review
export const getReviewById = async (id) => {
  const response = await fetch(`${API_BASE}/reviews/${id}`);
  return parseResponse(response);
};

// Get reviews stats
export const getReviewsStats = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE}/reviews/stats/summary?${queryString}`);
  return parseResponse(response);
};

// Create review (requires authentication)
export const createReview = async (reviewData, token) => {
  const response = await fetch(`${API_BASE}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reviewData),
  });
  return parseResponse(response);
};

// Update review (requires authentication)
export const updateReview = async (id, reviewData, token) => {
  const response = await fetch(`${API_BASE}/reviews/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reviewData),
  });
  return parseResponse(response);
};

// Delete review (requires authentication)
export const deleteReview = async (id, token) => {
  const response = await fetch(`${API_BASE}/reviews/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return parseResponse(response);
};

// Mark review as helpful (requires authentication)
export const markHelpful = async (id, token) => {
  const response = await fetch(`${API_BASE}/reviews/${id}/helpful`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return parseResponse(response);
};

// Add reply to review (requires authentication)
export const addReply = async (id, comment, token) => {
  const response = await fetch(`${API_BASE}/reviews/${id}/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ comment }),
  });
  return parseResponse(response);
};

// Get user's own reviews (requires authentication)
export const getUserReviews = async (token) => {
  const response = await fetch(`${API_BASE}/reviews/user/my-reviews`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return parseResponse(response);
};

// Approve/unapprove review (admin only)
export const approveReview = async (id, token) => {
  const response = await fetch(`${API_BASE}/reviews/${id}/approve`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return parseResponse(response);
};

export default {
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
};
