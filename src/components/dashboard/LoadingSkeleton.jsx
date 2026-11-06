import { DASH } from "../../styles/dashboardTheme";

// Lightweight shimmer placeholder for loading panels/lists.
export default function LoadingSkeleton({ rows = 3, height = "18px", gap = "12px", radius = DASH.radius.md, style }) {
  const items = Array.from({ length: rows });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap, ...style }}>
      <style>{`@keyframes dashShimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}`}</style>
      {items.map((_, i) => (
        <div
          key={i}
          style={{
            height,
            borderRadius: radius,
            background: `linear-gradient(90deg, ${DASH.panelSoft} 25%, rgba(51,65,85,0.5) 37%, ${DASH.panelSoft} 63%)`,
            backgroundSize: "800px 100%",
            animation: "dashShimmer 1.3s infinite linear",
          }}
        />
      ))}
    </div>
  );
}
