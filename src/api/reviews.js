import { API_BASE } from "../utils/constants";

// Get all reviews
export const getAllReviews = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE}/reviews?${queryString}`);
  const data = await response.json();
  return data;
};

// Get single review
export const getReviewById = async (id) => {
  const response = await fetch(`${API_BASE}/reviews/${id}`);
  const data = await response.json();
  return data;
};

// Get reviews stats
export const getReviewsStats = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE}/reviews/stats/summary?${queryString}`);
  const data = await response.json();
  return data;
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
  const data = await response.json();
  return data;
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
  const data = await response.json();
  return data;
};

// Delete review (requires authentication)
export const deleteReview = async (id, token) => {
  const response = await fetch(`${API_BASE}/reviews/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
};

// Mark review as helpful (requires authentication)
export const markHelpful = async (id, token) => {
  const response = await fetch(`${API_BASE}/reviews/${id}/helpful`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
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
  const data = await response.json();
  return data;
};

// Get user's own reviews (requires authentication)
export const getUserReviews = async (token) => {
  const response = await fetch(`${API_BASE}/reviews/user/my-reviews`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
};

// Approve/unapprove review (admin only)
export const approveReview = async (id, token) => {
  const response = await fetch(`${API_BASE}/reviews/${id}/approve`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
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
