import { DASH, withAlpha } from "../../styles/dashboardTheme";

// A single metric tile. Renders as a button when onClick is provided
// (used by the Accommodation status filters).
export default function StatCard({ label, value, icon, color = DASH.accent, hint, active = false, onClick, style }) {
  const interactive = typeof onClick === "function";
  const base = {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "18px 18px",
    background: active ? withAlpha(color, 0.12) : DASH.panel,
    border: `1px solid ${active ? withAlpha(color, 0.5) : DASH.borderSoft}`,
    borderRadius: DASH.radius.lg,
    boxShadow: DASH.shadowSoft,
    textAlign: "left",
    width: "100%",
    transition: "transform 0.15s ease, border-color 0.15s ease, background 0.15s ease",
    cursor: interactive ? "pointer" : "default",
    fontFamily: DASH.font,
    ...style,
  };

  const inner = (
    <>
      {icon && (
        <div
          style={{
            flexShrink: 0,
            width: "44px",
            height: "44px",
            borderRadius: DASH.radius.md,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
            background: withAlpha(color, 0.14),
          }}
        >
          {icon}
        </div>
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{ color: DASH.muted, fontSize: "12.5px", fontWeight: 600, letterSpacing: "0.02em" }}>{label}</div>
        <div style={{ color: DASH.textStrong, fontSize: "22px", fontWeight: 800, lineHeight: 1.25, marginTop: "2px" }}>
          {value}
        </div>
        {hint && <div style={{ color: DASH.faint, fontSize: "12px", marginTop: "2px" }}>{hint}</div>}
      </div>
    </>
  );

  if (interactive) {
    return (
      <button type="button" onClick={onClick} style={base} onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")} onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}>
        {inner}
      </button>
    );
  }
  return <div style={base}>{inner}</div>;
}
