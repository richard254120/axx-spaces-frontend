/**
 * Site-wide user profile API (all roles: landlord, mover, seller, tourism)
 */
const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || `Request failed (${res.status})`);
  return data;
}

export async function fetchUserProfile(token) {
  const json = await parseResponse(
    await fetch(`${API_BASE}/profile`, { headers: authHeaders(token) })
  );
  return json.data?.user || json.user;
}

export async function updateUserProfile(token, formData) {
  const json = await parseResponse(
    await fetch(`${API_BASE}/profile`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: formData,
    })
  );
  return json;
}

/** Build FormData for profile update */
export function buildProfileFormData({
  name,
  phone,
  county,
  vehicleType,
  experienceYears,
  services,
  description,
  bio,
  avatarFile,
  removeProfileImage,
}) {
  const fd = new FormData();
  if (name != null) fd.append("name", name);
  if (phone != null) fd.append("phone", phone);
  if (county != null) fd.append("county", county);
  if (vehicleType != null) fd.append("vehicleType", vehicleType);
  if (experienceYears != null && experienceYears !== "") fd.append("experienceYears", experienceYears);
  if (services != null) fd.append("services", JSON.stringify(services));
  if (description != null) fd.append("description", description);
  if (bio != null) fd.append("bio", bio);
  if (avatarFile) fd.append("avatar", avatarFile);
  if (removeProfileImage) fd.append("removeProfileImage", "true");
  return fd;
}
