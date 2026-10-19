import "./GlitterBackground.css";

export default function GlitterBackground() {
  return (
    <div className="admin-ambient-bg" aria-hidden="true">
      <div className="ambient-glow glow-gold" />
      <div className="ambient-glow glow-blue" />
      <div className="ambient-grid-overlay" />
    </div>
  );
}
