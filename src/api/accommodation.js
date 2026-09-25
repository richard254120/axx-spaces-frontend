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

export function formatVideoUrl(url) {
  if (!url || typeof url !== "string") return "";
  let cleanUrl = url.trim().replace(/^http:\/\//i, "https://");
  if (cleanUrl.includes("cloudinary.com") && cleanUrl.includes("/video/upload/")) {
    cleanUrl = cleanUrl.replace(/\.(mov|quicktime|mkv|avi|webm|ogv|m4v)$/i, ".mp4");
    if (!/\.(mp4|webm)$/i.test(cleanUrl)) {
      cleanUrl = `${cleanUrl}.mp4`;
    }
  }
  return cleanUrl;
}

// ─── Normalizer ───────────────────────────────────────────────────────

export function normalizeAccommodation(acc) {
  if (!acc || typeof acc !== "object") return acc;
  const address = acc.address || "";
  const locationStr = typeof acc.location === "string"
    ? acc.location
    : (acc.location?.lat != null ? address || `${acc.location.lat}, ${acc.location.lng}` : address || "Kenya");

  const basePrice = Number(acc.basePrice ?? acc.price ?? 0);
  const rawImages = acc.images || acc.photos || [];
  const images = Array.isArray(rawImages)
    ? rawImages.map(img => typeof img === "object" ? img : { imageUrl: img })
    : [];

  const type = acc.type || acc.category || "hotel";
  const formattedCategory = acc.category || type
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const rawVideos = acc.videos || (acc.video ? [acc.video] : []);
  const videos = Array.isArray(rawVideos)
    ? rawVideos.map(v => formatVideoUrl(typeof v === "string" ? v : v?.url || v?.videoUrl || "")).filter(Boolean)
    : [];

  return {
    ...acc,
    id: acc._id || acc.id,
    _id: acc._id || acc.id,
    price: basePrice,
    basePrice: basePrice,
    category: formattedCategory,
    type: type,
    location: locationStr,
    address: address || locationStr,
    coordinates: typeof acc.location === "object" ? acc.location : null,
    images: images,
    videos: videos,
    rating: acc.rating || 4.8,
    reviews: acc.reviews?.length || (typeof acc.reviews === "number" ? acc.reviews : 12),
    color: acc.color || (type.includes("beach") ? "#0ea5e9" : type.includes("safari") ? "#16a34a" : type.includes("mountain") ? "#8b5cf6" : "#f59e0b"),
    tag: acc.tag || (acc.isFeatured ? "Featured" : "Verified Host"),
    amenities: Array.isArray(acc.amenities) ? acc.amenities : [],
  };
}

// ─── Browse ───────────────────────────────────────────────────────────

export async function fetchAccommodationListings(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, v);
  });
  // Only show approved (active) accommodations to users
  qs.set("status", "active");
  const json = await request(`/accommodations?${qs}`);
  const list = Array.isArray(json) ? json : [];
  return list.map(normalizeAccommodation);
}

export async function fetchFeaturedAccommodation(limit = 6) {
  const qs = new URLSearchParams({ limit });
  // Only show approved (active) accommodations to users
  qs.set("status", "active");
  const json = await request(`/accommodations?${qs}`);
  const list = Array.isArray(json) ? json : [];
  return list.map(normalizeAccommodation);
}

export async function fetchAccommodationStats() {
  const json = await request("/accommodations");
  return json;
}

export async function fetchAccommodationById(id) {
  const json = await request(`/accommodations/${id}`);
  return normalizeAccommodation(json);
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

export async function registerAccommodationProperty(formData, token) {
  const res = await fetch(`${API_BASE}/accommodations`, {
    method: "POST",
    headers: { ...authHeaders(token) },
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to register property");
  return data;
}

export async function fetchMyAccommodationListings(token) {
  const json = await request("/accommodations/my-accommodations/all", {
    headers: { ...authHeaders(token) },
  });
  return json || [];
}

export async function fetchOwnerProfile(token) {
  const json = await request("/accommodations/owner/profile", {
    headers: { ...authHeaders(token) },
  });
  return json;
}

export async function updateOwnerProfile(token, { name, phone }) {
  const json = await request("/accommodations/owner/profile", {
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
