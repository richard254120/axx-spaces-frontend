const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

async function parseJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed (${res.status})`);
  }
  return data;
}

export async function fetchTourismListings(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, v);
  });
  const res = await fetch(`${API_BASE}/tourism?${qs}`);
  const json = await parseJson(res);
  return json.data || [];
}

export async function fetchFeaturedTourism(limit = 6) {
  const res = await fetch(`${API_BASE}/tourism/featured?limit=${limit}`);
  const json = await parseJson(res);
  return json.data || [];
}

export async function fetchTourismStats() {
  const res = await fetch(`${API_BASE}/tourism/stats`);
  const json = await parseJson(res);
  return json.data;
}

export async function fetchTourismById(id) {
  const res = await fetch(`${API_BASE}/tourism/${id}`);
  const json = await parseJson(res);
  return json.data;
}

export async function recordTourismView(id) {
  await fetch(`${API_BASE}/tourism/${id}/view`, { method: "PATCH" }).catch(() => {});
}

export async function submitTourismReview(id, { name, rating, comment }) {
  const res = await fetch(`${API_BASE}/tourism/${id}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, rating, comment }),
  });
  return parseJson(res);
}

export async function registerTourismProperty(form) {
  const res = await fetch(`${API_BASE}/tourism/register`, {
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
      managerName: form.managerName,
      phone: form.phone,
      email: form.email,
      whatsapp: form.whatsapp,
    }),
  });
  return parseJson(res);
}

export async function fetchMyTourismListings(token) {
  const res = await fetch(`${API_BASE}/tourism/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseJson(res);
  return json.data || [];
}
