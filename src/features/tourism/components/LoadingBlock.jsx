export default function LoadingBlock({ message = "Loading properties…" }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 20px", color: "#6b7280" }}>
      <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
      <p style={{ fontSize: "15px", fontWeight: 600 }}>{message}</p>
    </div>
  );
}
