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
 * MultiLineChart — responsive SVG line chart with several daily series,
 * gridlines, y-axis ticks, x labels and hover dots with value tooltips.
 * series: [{ name, color, values: number[] }], labels: string[]
 */
export function MultiLineChart({ series = [], labels = [], height = 230 }) {
  const data = series.filter((s) => Array.isArray(s.values) && s.values.length);
  if (!data.length || !labels.length) return null;

  const W = 640;
  const H = height;
  const padL = 36; const padR = 14; const padT = 14; const padB = 26;
  const max = Math.max(...data.flatMap((s) => s.values), 1);
  const n = Math.max(...data.map((s) => s.values.length));
  const x = (i) => padL + (i * (W - padL - padR)) / Math.max(n - 1, 1);
  const y = (v) => padT + (1 - v / max) * (H - padT - padB);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));
  const everyX = Math.ceil(n / 7);

  return (
    <div className="ac-ml">
      <svg viewBox={`0 0 ${W} ${H}`} className="ac-ml-svg" preserveAspectRatio="none" role="img" aria-label="Trend chart">
        {ticks.map((t, i) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray={i === 4 ? "0" : "3 5"} />
            <text x={padL - 7} y={y(t) + 3.5} textAnchor="end" fontSize="10" fill="#cdd8e8" opacity="0.75">{t}</text>
          </g>
        ))}
        {data.map((s) => {
          const pts = s.values.map((v, i) => `${x(i)},${y(v || 0)}`).join(" ");
          return (
            <g key={s.name}>
              <polyline points={pts} fill="none" stroke={s.color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${s.color}55)` }} />
              {s.values.map((v, i) => (
                <circle key={i} cx={x(i)} cy={y(v || 0)} r="7" fill="transparent">
                  <title>{`${labels[i] ?? ""} · ${s.name}: ${(v || 0).toLocaleString()}`}</title>
                </circle>
              ))}
              {s.values.map((v, i) => (
                <circle key={`d-${i}`} cx={x(i)} cy={y(v || 0)} r="2.2" fill={s.color} pointerEvents="none" />
              ))}
            </g>
          );
        })}
        {labels.map((l, i) =>
          i % everyX === 0 || i === labels.length - 1 ? (
            <text key={`${l}-${i}`} x={x(i)} y={H - 7} textAnchor="middle" fontSize="10" fill="#cdd8e8" opacity="0.7">{l}</text>
          ) : null
        )}
      </svg>
      <div className="ac-ml-legend">
        {data.map((s) => (
          <span key={s.name} className="ac-ml-legend-item">
            <i style={{ background: s.color }} /> {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Sparkline — compact area+line for a single series (used in growth cards).
 */
export function Sparkline({ values = [], color = "#f43f5e", width = 130, height = 38 }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const x = (i) => (i * width) / Math.max(values.length - 1, 1);
  const y = (v) => height - 3 - (v / max) * (height - 6);
  const line = values.map((v, i) => `${x(i).toFixed(1)},${y(v || 0).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="ac-spark" width={width} height={height} aria-hidden="true">
      <polygon points={`0,${height} ${line} ${width},${height}`} fill={color} opacity="0.16" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(values.length - 1)} cy={y(values[values.length - 1] || 0)} r="2.6" fill={color} />
    </svg>
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
