// Unified Design System for Axx Spaces
// Consistent colors, spacing, and styles across all pages

export const COLORS = {
  // Primary Colors
  primary: "#E31B1B", // Red - main brand color
  primaryDark: "#C01010", // Darker red
  primaryLight: "#FF4D4D", // Lighter red
  
  // Accent Colors
  accent: "#fbbf24", // Yellow/gold - highlights and CTAs
  accentDark: "#f59e0b", // Darker yellow
  accentLight: "#fcd34d", // Lighter yellow
  
  // Background Colors
  bgDark: "#0f1729", // Dark background (main theme)
  bgDarker: "#0B2140", // Even darker
  bgLight: "#1e293b", // Lighter dark
  bgWhite: "#FFFFFF", // White
  bgOffWhite: "#F8F9FA", // Off-white
  
  // Text Colors
  textLight: "#f1f5f9", // Light text on dark
  textDark: "#0B2140", // Dark text on light
  textMuted: "#6b7280", // Muted gray
  textMutedLight: "#94a3b8", // Muted on dark
  
  // Border Colors
  border: "#334155", // Dark border
  borderLight: "#e5e7eb", // Light border
  
  // Status Colors
  success: "#22c55e",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
};

export const SPACING = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  xxl: "48px",
};

export const BORDER_RADIUS = {
  sm: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
};

export const FONT_SIZES = {
  xs: "12px",
  sm: "13px",
  base: "14px",
  md: "15px",
  lg: "16px",
  xl: "18px",
  "2xl": "20px",
  "3xl": "24px",
  "4xl": "30px",
  "5xl": "36px",
};

export const FONT_WEIGHTS = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
};

// Common button styles
export const buttonStyles = {
  primary: {
    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
    color: COLORS.bgWhite,
    border: "none",
    padding: "14px 28px",
    borderRadius: BORDER_RADIUS.md,
    fontWeight: FONT_WEIGHTS.bold,
    fontSize: FONT_SIZES.lg,
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: `0 4px 14px rgba(227, 27, 27, 0.35)`,
  },
  secondary: {
    background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentDark} 100%)`,
    color: COLORS.bgDarker,
    border: "none",
    padding: "14px 28px",
    borderRadius: BORDER_RADIUS.md,
    fontWeight: FONT_WEIGHTS.bold,
    fontSize: FONT_SIZES.lg,
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: `0 4px 12px rgba(251, 191, 36, 0.3)`,
  },
  outline: {
    background: "transparent",
    color: COLORS.primary,
    border: `2px solid ${COLORS.primary}`,
    padding: "12px 24px",
    borderRadius: BORDER_RADIUS.md,
    fontWeight: FONT_WEIGHTS.bold,
    fontSize: FONT_SIZES.base,
    cursor: "pointer",
    transition: "all 0.2s",
  },
};

// Common input styles
export const inputStyles = {
  base: {
    padding: "12px 14px",
    border: `2px solid ${COLORS.borderLight}`,
    borderRadius: BORDER_RADIUS.md,
    fontSize: FONT_SIZES.base,
    background: "#f9fafb",
    color: COLORS.textDark,
    fontFamily: "'DM Sans', sans-serif",
    width: "100%",
    boxSizing: "border-box",
  },
  dark: {
    padding: "12px 14px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: BORDER_RADIUS.md,
    fontSize: FONT_SIZES.base,
    background: "rgba(15,23,41,0.8)",
    color: COLORS.textLight,
    fontFamily: "'DM Sans', sans-serif",
    width: "100%",
    boxSizing: "border-box",
  },
};

// Common card styles
export const cardStyles = {
  light: {
    background: COLORS.bgWhite,
    border: `1px solid ${COLORS.borderLight}`,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  dark: {
    background: COLORS.bgLight,
    border: `1px solid ${COLORS.border}`,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
};

// Page layout styles
export const pageStyles = {
  dark: {
    fontFamily: "'DM Sans', sans-serif",
    background: `linear-gradient(135deg, ${COLORS.bgDark} 0%, ${COLORS.bgLight} 100%)`,
    color: COLORS.textLight,
    minHeight: "100vh",
  },
  light: {
    fontFamily: "'DM Sans', sans-serif",
    background: `linear-gradient(135deg, ${COLORS.bgWhite} 0%, ${COLORS.bgOffWhite} 100%)`,
    color: COLORS.textDark,
    minHeight: "100vh",
  },
};

// Hero section styles
export const heroStyles = {
  dark: {
    textAlign: "center",
    padding: "72px 24px 48px",
    borderBottom: `1px solid ${COLORS.border}55`,
  },
  light: {
    textAlign: "center",
    padding: "80px 20px 60px",
    borderBottom: `3px solid ${COLORS.primary}`,
  },
};

// Section header styles
export const sectionHeaderStyles = {
  dark: {
    textAlign: "center",
    marginBottom: "44px",
    padding: "0 20px",
  },
  light: {
    textAlign: "center",
    marginBottom: "44px",
    padding: "0 20px",
  },
};
