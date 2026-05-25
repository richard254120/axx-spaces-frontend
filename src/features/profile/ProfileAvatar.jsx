/** Circular avatar — photo or initials fallback */
export default function ProfileAvatar({
  user,
  size = 48,
  style = {},
}) {
  const name = user?.name || "";
  const initial = (name || "?").charAt(0).toUpperCase();
  const src = user?.profileImage;

  const base = {
    width: size,
    height: size,
    borderRadius: "50%",
    flexShrink: 0,
    objectFit: "cover",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: Math.round(size * 0.4),
    background: "#fbbf24",
    color: "#1f2937",
    border: "2px solid #e5e7eb",
    overflow: "hidden",
    ...style,
  };

  if (src) {
    return <img src={src} alt={name || "Profile"} style={{ ...base, display: "block" }} />;
  }

  return <div style={base} aria-hidden>{initial}</div>;
}
