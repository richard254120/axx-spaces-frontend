export default function StatsCard({ label, total, pending, color, isPulse }) {
  return (
    <div 
      className={`stat-card ${isPulse && pending > 0 ? 'pulse' : ''}`}
      style={{ borderTop: `3px solid ${color}` }}
    >
      <p className="stat-label">{label}</p>
      <p className="stat-value" style={{ color }}>{total}</p>
      {pending > 0 && (
        <p className="stat-pending">
          {isPulse ? `🔴 ${pending} unread` : `${pending} pending`}
        </p>
      )}
    </div>
  );
}
