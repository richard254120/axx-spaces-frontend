import { DASH, withAlpha } from "../../styles/dashboardTheme";

// Standard empty/none-yet state with an icon, message and optional action.
export default function EmptyState({ icon, title = "Nothing here yet", message, action, accent = DASH.accent }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "10px",
        padding: "48px 24px",
        color: DASH.muted,
      }}
    >
      {icon && (
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: DASH.radius.full,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: accent,
            background: withAlpha(accent, 0.12),
            border: `1px solid ${withAlpha(accent, 0.28)}`,
            marginBottom: "4px",
          }}
        >
          {icon}
        </div>
      )}
      <h3 style={{ margin: 0, color: DASH.text, fontSize: "16px", fontWeight: 800 }}>{title}</h3>
      {message && <p style={{ margin: 0, maxWidth: "420px", fontSize: "14px", lineHeight: 1.5 }}>{message}</p>}
      {action && <div style={{ marginTop: "10px" }}>{action}</div>}
    </div>
  );
}
