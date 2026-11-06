import { DASH } from "../../styles/dashboardTheme";

// Bordered content panel with an optional header row (title/subtitle + actions).
export default function SectionCard({ title, subtitle, actions, children, padded = true, style, headerStyle }) {
  const hasHeader = title || subtitle || actions;
  return (
    <section
      style={{
        background: DASH.panel,
        border: `1px solid ${DASH.borderSoft}`,
        borderRadius: DASH.radius.lg,
        boxShadow: DASH.shadowSoft,
        overflow: "hidden",
        ...style,
      }}
    >
      {hasHeader && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
            padding: "16px 20px",
            borderBottom: `1px solid ${DASH.borderSoft}`,
            ...headerStyle,
          }}
        >
          <div style={{ minWidth: 0 }}>
            {title && <h2 style={{ margin: 0, color: DASH.textStrong, fontSize: "17px", fontWeight: 800 }}>{title}</h2>}
            {subtitle && <p style={{ margin: title ? "3px 0 0" : 0, color: DASH.muted, fontSize: "13px" }}>{subtitle}</p>}
          </div>
          {actions && <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>{actions}</div>}
        </div>
      )}
      <div style={{ padding: padded ? "20px" : 0 }}>{children}</div>
    </section>
  );
}
