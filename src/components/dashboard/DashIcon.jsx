// Shared inline-SVG icon so dashboards can pass lightweight path glyphs to
// the shell nav and stat cards without an icon-library dependency.
export default function DashIcon({ d, size = 18, strokeWidth = 2, style }) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {paths.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  );
}
