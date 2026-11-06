import { DASH, withAlpha } from "../../styles/dashboardTheme";

// Consistent page/section intro block: eyebrow (optional), title, subtitle,
// and a right-aligned actions slot. Carries a thin accent underline.
export default function PageHeader({ eyebrow, title, subtitle, actions, accent = DASH.accent, style }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap",
        paddingBottom: "16px",
        marginBottom: "24px",
        borderBottom: `1px solid ${DASH.borderSoft}`,
        position: "relative",
        ...style,
      }}
    >
      <div style={{ minWidth: 0 }}>
        {eyebrow && (
          <div
            style={{
              color: accent,
              fontSize: "12px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "6px",
            }}
          >
            {eyebrow}
          </div>
        )}
        <h1
          style={{
            margin: 0,
            color: DASH.textStrong,
            fontSize: "26px",
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: "6px 0 0", color: DASH.muted, fontSize: "14px", lineHeight: 1.5 }}>{subtitle}</p>
        )}
      </div>
      {actions && <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>{actions}</div>}
      {/* accent underline tick */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          bottom: "-1px",
          width: "64px",
          height: "2px",
          borderRadius: "2px",
          background: `linear-gradient(90deg, ${accent} 0%, ${withAlpha(accent, 0)} 100%)`,
        }}
      />
    </div>
  );
}
