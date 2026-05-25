export default function EmptyState({ title = "No properties found", hint = "Try adjusting your filters or search terms", action }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
      <h3 style={{ color: "#1f2937", marginBottom: "8px", fontSize: "18px" }}>{title}</h3>
      <p style={{ color: "#6b7280", marginBottom: action ? "20px" : 0 }}>{hint}</p>
      {action}
    </div>
  );
}
