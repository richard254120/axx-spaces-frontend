import { DASH } from "../../styles/dashboardTheme";
import StatCard from "./StatCard";

// Responsive auto-fit grid for StatCards. Provide children (StatCard nodes)
// or a `stats` array of { key, ...StatCardProps } for a compact call site.
export default function StatGrid({ children, stats, minColumn = "210px", gap = "16px", style }) {
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(auto-fit, minmax(${minColumn}, 1fr))`,
    gap,
    marginBottom: "24px",
    ...style,
  };

  if (Array.isArray(stats)) {
    return <div style={gridStyle}>{stats.map(({ key, ...rest }, i) => <StatCard key={key || i} {...rest} />)}</div>;
  }
  return <div style={gridStyle}>{children}</div>;
}
