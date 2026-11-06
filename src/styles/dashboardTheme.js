// Unified dark dashboard design tokens for the four provider workspaces
// (Landlord, Accommodation/Host, QuickSales/Seller, Business).
// Presentation only - shared by the dashboard UI kit so all four match.

export const DASH = {
  // Surfaces
  bg: "#0f1729", // page base (matches AccountLayout)
  bgGradient: "linear-gradient(135deg, #0f1729 0%, #131f38 100%)",
  panel: "#1e293b", // card / sidebar surface
  panelSoft: "rgba(30, 41, 59, 0.6)",
  panelElevated: "#223047",
  sidebarBg: "linear-gradient(180deg, #16233d 0%, #0f1729 100%)",
  topbarBg: "linear-gradient(135deg, #1e293b 0%, #0f1729 100%)",

  // Lines & effects
  border: "#334155",
  borderSoft: "rgba(51, 65, 85, 0.6)",
  shadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
  shadowSoft: "0 4px 14px rgba(0, 0, 0, 0.25)",

  // Text tiers
  text: "#f1f5f9",
  textStrong: "#ffffff",
  muted: "#94a3b8",
  faint: "#64748b",

  // Brand palette
  primary: "#E31B1B",
  primaryDark: "#C01010",
  accent: "#fbbf24",
  accentDark: "#f59e0b",

  // Status
  success: "#22c55e",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",

  // Radii
  radius: { sm: "6px", md: "10px", lg: "14px", xl: "18px", full: "9999px" },

  // Spacing scale
  space: { xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "32px", xxl: "48px" },

  // Layout
  sidebarWidth: "248px",
  topbarHeight: "64px",

  font: "'DM Sans', sans-serif",
};

// Per-service accent used for the active nav indicator, page-header underline
// and focus glows so each portal keeps an identity while sharing one system.
export const SERVICE_ACCENT = {
  landlord: "#E31B1B",
  host: "#fbbf24",
  seller: "#fbbf24",
  business: "#3b82f6",
};

// Small helpers ------------------------------------------------------------

/** Turn a hex color into an rgba() string with the given alpha. */
export function withAlpha(hex, alpha) {
  if (!hex) return `rgba(148, 163, 184, ${alpha})`;
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Resolve the accent for a role, defaulting to the brand gold. */
export function getAccent(role) {
  return SERVICE_ACCENT[role] || DASH.accent;
}
