/**
 * Tourism API — all backend calls in one place.
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

export async function fetchTourismListings(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, v);
  });
  const json = await request(`/tourism?${qs}`);
  return json.data || [];
}

export async function fetchFeaturedTourism(limit = 6) {
  const json = await request(`/tourism/featured?limit=${limit}`);
  return json.data || [];
}

export async function fetchTourismStats() {
  const json = await request("/tourism/stats");
  return json.data;
}

export async function fetchTourismById(id) {
  const json = await request(`/tourism/${id}`);
  return json.data;
}

export async function recordTourismView(id) {
  await fetch(`${API_BASE}/tourism/${id}/view`, { method: "PATCH" }).catch(() => { });
}

// ─── Auth (uses main auth routes) ─────────────────────────────────────

export async function tourismLogin(email, password) {
  const json = await request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return json;
}

// ─── Provider ─────────────────────────────────────────────────────────

export async function registerTourismProperty(form) {
  return request("/tourism/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ownerName: form.ownerName,
      ownerEmail: form.ownerEmail,
      ownerPhone: form.ownerPhone,
      password: form.password,
      selectedPackage: form.selectedPackage,
      name: form.name,
      category: form.category,
      description: form.description,
      county: form.county,
      town: form.town,
      address: form.address,
      mapLink: form.mapLink,
      amenities: form.amenities,
      basePrice: form.basePrice,
      weekendPrice: form.weekendPrice,
      peakPrice: form.peakPrice,
      roomTypes: form.roomTypes,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      cancellation: form.cancellation,
      bookingUrl: form.bookingUrl,
    }),
  });
}

export async function fetchMyTourismListings(token) {
  const json = await request("/tourism/my", {
    headers: { ...authHeaders(token) },
  });
  return json.data || [];
}

export async function fetchOwnerProfile(token) {
  const json = await request("/tourism/owner/profile", {
    headers: { ...authHeaders(token) },
  });
  return json.data;
}

export async function updateOwnerProfile(token, { name, phone }) {
  const json = await request("/tourism/owner/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ name, phone }),
  });
  return json;
}

export async function fetchOwnerListing(token, listingId) {
  const json = await request(`/tourism/owner/listings/${listingId}`, {
    headers: { ...authHeaders(token) },
  });
  return json.data;
}

export async function updateOwnerListing(token, listingId, formData) {
  const res = await fetch(`${API_BASE}/tourism/owner/listings/${listingId}`, {
    method: "PATCH",
    headers: { ...authHeaders(token) },
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to update property");
  return data;
}

export async function submitTourismReview(id, { name, rating, comment }) {
  return request(`/tourism/${id}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, rating, comment }),
  });
}
