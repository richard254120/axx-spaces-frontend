const API_URL = process.env.REACT_APP_API_URL || "http://localhost:1000/api";
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export function resolveMediaUrl(url) {
  if (!url) return "";
  if (String(url).startsWith("http")) return url;
  return `${API_ORIGIN}${url.startsWith("/") ? url : `/${url}`}`;
}

export function getPricelistUrl(pricelist) {
  if (!pricelist?.url && !pricelist?.publicId) return "";
  if (pricelist.url?.startsWith("http")) return pricelist.url;
  if (pricelist.publicId) {
    return `${API_URL}/uploads/pricelist/download?publicId=${encodeURIComponent(pricelist.publicId)}`;
  }
  return resolveMediaUrl(pricelist.url);
}

export async function openAdminFile(url) {
  const resolved = resolveMediaUrl(url);
  if (!resolved) return;

  const isVerification = resolved.includes("/uploads/verification/");
  const token = localStorage.getItem("token");

  if (isVerification && token) {
    const filename = resolved.split("/").pop();
    const secureUrl = `${API_URL}/uploads/verification/${encodeURIComponent(filename)}`;
    const res = await fetch(secureUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error("File not found or access denied");
    }
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    return;
  }

  window.open(resolved, "_blank", "noopener,noreferrer");
}
