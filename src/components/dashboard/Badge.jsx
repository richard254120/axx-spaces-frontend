import { DASH, withAlpha } from "../../styles/dashboardTheme";

// Small status/label pill used across the dashboards.
export default function Badge({ children, tone = "neutral", count = false, style }) {
  const tones = {
    neutral: { fg: DASH.muted, bg: withAlpha(DASH.muted, 0.14), bd: withAlpha(DASH.muted, 0.3) },
    accent: { fg: DASH.accent, bg: withAlpha(DASH.accent, 0.14), bd: withAlpha(DASH.accent, 0.32) },
    success: { fg: DASH.success, bg: withAlpha(DASH.success, 0.14), bd: withAlpha(DASH.success, 0.32) },
    warning: { fg: DASH.warning, bg: withAlpha(DASH.warning, 0.14), bd: withAlpha(DASH.warning, 0.32) },
    error: { fg: DASH.error, bg: withAlpha(DASH.error, 0.14), bd: withAlpha(DASH.error, 0.32) },
    info: { fg: DASH.info, bg: withAlpha(DASH.info, 0.14), bd: withAlpha(DASH.info, 0.32) },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.bd}`,
        borderRadius: DASH.radius.full,
        padding: count ? "2px 8px" : "3px 10px",
        fontSize: "12px",
        fontWeight: 700,
        lineHeight: 1.4,
        letterSpacing: "0.01em",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
