/**
 * Accommodation API — all backend calls in one place.
 * Set VITE_API_URL in .env (e.g. http://localhost:1000/api)
 */
const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed (${res.status})`);
  }
  return data;
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Browse ───────────────────────────────────────────────────────────

export async function fetchAccommodationListings(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, v);
  });
  const json = await request(`/accommodations?${qs}`);
  return json || [];
}

export async function fetchFeaturedAccommodation(limit = 6) {
  const qs = new URLSearchParams({ featured: "true", limit });
  const json = await request(`/accommodations?${qs}`);
  return json || [];
}

export async function fetchAccommodationStats() {
  const json = await request("/accommodations");
  return json;
}

export async function fetchAccommodationById(id) {
  const json = await request(`/accommodations/${id}`);
  return json;
}

export async function recordAccommodationView(id) {
  await fetch(`${API_BASE}/accommodations/${id}`, { method: "PATCH" }).catch(() => { });
}

// ─── Auth (uses main auth routes) ─────────────────────────────────────

export async function accommodationLogin(email, password) {
  const json = await request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return json;
}

// ─── Provider ─────────────────────────────────────────────────────────

export async function registerAccommodationProperty(formData) {
  const res = await fetch(`${API_BASE}/accommodation/register`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to register property");
  return data;
}

export async function fetchMyAccommodationListings(token) {
  const json = await request("/accommodation/my", {
    headers: { ...authHeaders(token) },
  });
  return json.data || [];
}

export async function fetchOwnerProfile(token) {
  const json = await request("/accommodation/owner/profile", {
    headers: { ...authHeaders(token) },
  });
  return json.data;
}

export async function updateOwnerProfile(token, { name, phone }) {
  const json = await request("/accommodation/owner/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ name, phone }),
  });
  return json;
}

export async function fetchOwnerListing(token, listingId) {
  const json = await request(`/accommodations/${listingId}`, {
    headers: { ...authHeaders(token) },
  });
  return json;
}

export async function updateOwnerListing(token, listingId, formData) {
  const res = await fetch(`${API_BASE}/accommodations/${listingId}`, {
    method: "PATCH",
    headers: { ...authHeaders(token) },
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to update property");
  return data;
}

export async function submitAccommodationReview(accommodationId, { rating, title, comment }, token) {
  const res = await fetch(`${API_BASE}/accommodation-reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ accommodationId, rating, title, comment }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to submit review");
  return data;
}
