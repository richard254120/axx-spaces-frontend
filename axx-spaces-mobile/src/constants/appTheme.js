// Centralized design tokens so the native shell matches the Axxspace website.
// Website palette: deep navy background (#0f1729) with amber accents (#fbbf24).
// Named `appTheme` to avoid colliding with the Expo Router `theme.ts`.
export const COLORS = {
  background: '#0f1729',
  surface: '#1e293b',
  surfaceAlt: '#111c30',
  border: 'rgba(251, 191, 36, 0.18)',
  primary: '#fbbf24',
  primaryDark: '#f59e0b',
  text: '#ffffff',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  danger: '#ef4444',
  success: '#22c55e',
  scrim: 'rgba(15, 23, 41, 0.92)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export default COLORS;
