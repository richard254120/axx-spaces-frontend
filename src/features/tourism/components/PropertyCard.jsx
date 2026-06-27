export default function PropertyCard({ property: p, onOpen }) {
  const BADGE_IMAGES = {
    student_verified: "/Student Verified.png",
    business_verified: "/Business Verified.png",
    identity_verified: "/Identity Verified.png",
    location_verified: "/Locationn Verified.png",
    online_verified: "/Online Verified.png",
    premium_verified: "/Premium Verified.png",
  };

  return (
    <div className="prop-card" onClick={() => onOpen(p.id)} style={{ cursor: "pointer" }}>
      <div style={{
        height: "150px",
        background: `linear-gradient(135deg, ${p.color}25, ${p.color}10)`,
        border: `1px solid ${p.color}25`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        borderRadius: "12px 12px 0 0",
        overflow: "hidden",
      }}>
        {p.images && p.images.length > 0 ? (
          <img
            src={p.images[0]}
            alt={p.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: "52px" }}>{p.emoji}</span>
        )}
        {p.tag && (
          <div style={{ position: "absolute", top: "10px", left: "10px", background: p.color, color: "white", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px", zIndex: 1 }}>
            {p.tag}
          </div>
        )}
        {p.bookingUrl && (
          <div style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(255,255,255,0.9)", color: "#6b7280", fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "20px", zIndex: 1 }}>
            🔗 Book online
          </div>
        )}
      </div>
      <div style={{ padding: "14px" }}>
        <div style={{ fontSize: "10px", color: "#6b7280", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "4px" }}>{p.category}</div>
        <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#1f2937", margin: "0 0 4px", lineHeight: 1.3 }}>{p.name}</h3>
        <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>📍 {p.location}</div>

        {/* Verification Badges */}
        {p.owner?.verificationBadges && p.owner.verificationBadges.length > 0 && (
          <div style={{
            marginTop: "10px",
            padding: "8px",
            background: "linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(14, 165, 233, 0.02) 100%)",
            borderRadius: "8px",
            border: "1px solid rgba(14, 165, 233, 0.2)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <span style={{ fontSize: 11 }}>✅</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#0ea5e9" }}>Verified Owner</span>
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {p.owner.verificationBadges.map((badgeId) => (
                <div key={badgeId} style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={BADGE_IMAGES[badgeId]}
                    alt={badgeId}
                    style={{
                      width: "28px",
                      height: "28px",
                      objectFit: "contain",
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "transform 0.2s"
                    }}
                    title={badgeId.replace(/_/g, ' ').toUpperCase()}
                  />
                  <div style={{
                    position: "absolute",
                    bottom: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#1e293b",
                    color: "#f1f5f9",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "9px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    opacity: 0,
                    visibility: "hidden",
                    transition: "all 0.2s",
                    marginBottom: "4px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                    zIndex: 10,
                    pointerEvents: "none"
                  }}>
                    {badgeId.replace(/_/g, ' ').toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(p.amenities || []).slice(0, 4).map((a) => (
          <span key={a} style={{ background: "#f3f4f6", color: "#6b7280", fontSize: "10px", padding: "2px 7px", borderRadius: "20px", marginRight: "4px" }}>
            {a}
          </span>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px 0" }}>
          <div>
            <span style={{ fontSize: "16px", fontWeight: 800, color: p.color }}>KSh {p.price?.toLocaleString()}</span>
            <span style={{ fontSize: "11px", color: "#9ca3af" }}>/night</span>
          </div>
          <div style={{ fontSize: "12px", color: "#fbbf24", fontWeight: 700 }}>⭐ {p.rating} ({p.reviews})</div>
        </div>
        <button
          type="button"
          style={{ width: "100%", background: p.color, border: "none", color: "white", padding: "10px", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}
          onClick={(e) => { e.stopPropagation(); onOpen(p.id); }}
        >
          {p.bookingUrl ? "View & Book →" : "View Details →"}
        </button>
      </div>
    </div>
  );
}
