// Lightweight dependency-free SVG charts for the admin console.
// Styling follows the executive dark/gold design system used across the shell.
import "./AdminCharts.css";

/**
 * DonutChart — stacked ring segments with a center summary.
 * data: [{ label, value, color }]
 */
export function DonutChart({ data = [], size = 190, thickness = 24, centerValue, centerLabel }) {
  const total = data.reduce((acc, d) => acc + (d.value || 0), 0);
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const cx = size / 2;
  const GAP = 3; // px gap between segments for a cleaner read

  let accumulated = 0;
  const segments = data
    .filter((d) => d.value > 0)
    .map((d) => {
      const frac = d.value / total;
      const dash = Math.max(frac * circumference - GAP, 0.5);
      const seg = {
        ...d,
        frac,
        dash,
        dashArray: `${dash} ${circumference - dash}`,
        dashOffset: -(accumulated * circumference) - GAP / 2,
      };
      accumulated += frac;
      return seg;
    });

  return (
    <div className="ac-donut" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Distribution chart">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(148, 163, 184, 0.12)" strokeWidth={thickness} />
        <g transform={`rotate(-90 ${cx} ${cx})`}>
          {segments.map((s) => (
            <circle
              key={s.label}
              cx={cx}
              cy={cx}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={s.dashArray}
              strokeDashoffset={s.dashOffset}
              className="ac-donut-seg"
            >
              <title>{`${s.label}: ${s.value?.toLocaleString?.() ?? s.value}`}</title>
            </circle>
          ))}
        </g>
      </svg>
      <div className="ac-donut-center">
        <span className="ac-donut-value">{centerValue ?? total.toLocaleString()}</span>
        {centerLabel && <span className="ac-donut-label">{centerLabel}</span>}
      </div>
    </div>
  );
}

/**
 * ColumnChart — rounded vertical bars with value labels and category axis.
 * data: [{ label, value, color }]
 */
export function ColumnChart({ data = [], height = 170 }) {
  const max = Math.max(...data.map((d) => d.value || 0), 1);
  const fmt = (v) => (v >= 10000 ? `${(v / 1000).toFixed(1)}k` : v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v));

  if (!data.length) return null;

  return (
    <div className="ac-column">
      <div className="ac-column-plot" style={{ height }}>
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <span key={g} className="ac-column-gridline" style={{ bottom: `${g * 100}%` }} />
        ))}
        {data.map((d, i) => (
          <div key={`${d.label}-${i}`} className="ac-column-slot" title={`${d.label}: ${(d.value ?? 0).toLocaleString()} views`}>
            <span className="ac-column-value">{fmt(d.value ?? 0)}</span>
            <div
              className="ac-column-bar"
              style={{
                height: `${Math.max(((d.value || 0) / max) * 100, 2)}%`,
                background: `linear-gradient(180deg, ${d.color}, ${d.color}66)`,
                boxShadow: `0 0 14px ${d.color}33`,
                animationDelay: `${i * 60}ms`,
              }}
            />
          </div>
        ))}
      </div>
      <div className="ac-column-axis">
        {data.map((d, i) => (
          <span key={`${d.label}-ax-${i}`} className="ac-column-label" title={d.label}>
            {d.label || "—"}
          </span>
        ))}
      </div>
    </div>
  );
}
