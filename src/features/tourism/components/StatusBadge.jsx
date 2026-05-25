import { STATUS_LABELS } from "../constants";

export default function StatusBadge({ status }) {
  const meta = STATUS_LABELS[status] || STATUS_LABELS.pending;
  return (
    <span style={{
      fontSize: "11px",
      fontWeight: 800,
      padding: "4px 10px",
      borderRadius: "20px",
      color: meta.color,
      background: meta.bg,
      border: `1px solid ${meta.color}33`,
    }}>
      {meta.label}
    </span>
  );
}
