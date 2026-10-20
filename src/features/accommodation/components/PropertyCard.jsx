import React, { useState, useEffect } from "react";

export default function PropertyCard({ property: p, onOpen }) {
  const BADGE_IMAGES = {
    student_verified: "/Student Verified.png",
    business_verified: "/Business Verified.png",
    identity_verified: "/Identity Verified.png",
    location_verified: "/Locationn Verified.png",
    online_verified: "/Online Verified.png",
    premium_verified: "/Premium Verified.png",
  };

  const propId = p._id || p.id;
  const rawImages = Array.isArray(p.images) ? p.images : [];
  const images = rawImages
    .map((img) => (typeof img === "object" ? img?.imageUrl || img?.url : img))
    .filter(Boolean);

  const [activeImgIdx, setActiveImgIdx] = useState(0);

  // Auto-cycle through photos continuously
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImgIdx((prev) => (prev + 1) % images.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [images.length]);

  const locationText = typeof p.location === "object"
    ? (p.address || p.county || "Kenya")
    : (p.location || p.address || "Kenya");
  const priceVal = Number(p.price ?? p.basePrice ?? 0);
  const categoryText = p.category || (p.type ? p.type.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "Accommodation");
  const cardColor = p.color || "#0ea5e9";

  return (
    <div className="prop-card" onClick={() => onOpen(propId)} style={{ cursor: "pointer" }}>
      <div style={{
        height: "150px",
        background: `linear-gradient(135deg, ${cardColor}25, ${cardColor}10)`,
        border: `1px solid ${cardColor}25`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        borderRadius: "12px 12px 0 0",
        overflow: "hidden",
      }}>
        {images.length > 0 ? (
          images.map((imgSrc, idx) => (
            <img
              key={idx}
              src={imgSrc}
              alt={`${p.name} photo ${idx + 1}`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: idx === activeImgIdx ? 1 : 0,
                transition: "opacity 0.5s ease-in-out",
                pointerEvents: "none"
              }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          ))
        ) : (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
            <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 9h1M9 13h1M9 17h1M14 9h1M14 13h1M14 17h1" />
          </svg>
        )}

        {/* Carousel controls for multi-image listings */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveImgIdx((prev) => (prev - 1 + images.length) % images.length);
              }}
              style={{
                position: "absolute",
                left: "6px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "rgba(15, 23, 42, 0.75)",
                color: "#fff",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 2,
                fontSize: "14px",
                lineHeight: "1",
                padding: 0
              }}
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveImgIdx((prev) => (prev + 1) % images.length);
              }}
              style={{
                position: "absolute",
                right: "6px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "rgba(15, 23, 42, 0.75)",
                color: "#fff",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 2,
                fontSize: "14px",
                lineHeight: "1",
                padding: 0
              }}
              aria-label="Next photo"
            >
              ›
            </button>
            <div
              style={{
                position: "absolute",
                bottom: "6px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "4px",
                zIndex: 2
              }}
            >
              {images.map((_, idx) => (
                <span
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImgIdx(idx);
                  }}
                  style={{
                    width: idx === activeImgIdx ? "14px" : "5px",
                    height: "5px",
                    borderRadius: "10px",
                    background: idx === activeImgIdx ? "#38bdf8" : "rgba(255,255,255,0.65)",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                />
              ))}
            </div>
          </>
        )}
        {p.tag && (
          <div style={{ position: "absolute", top: "10px", left: "10px", background: cardColor, color: "white", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px", zIndex: 1 }}>
            {p.tag}
          </div>
        )}
        {p.bookingUrl && (
          <div style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(255,255,255,0.9)", color: "#6b7280", fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "20px", zIndex: 1 }}>
            Book online
          </div>
        )}
        {p.videos && p.videos.length > 0 && (
          <div style={{
            position: "absolute",
            bottom: "8px",
            right: "8px",
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(4px)",
            color: "#f8fafc",
            fontSize: "10px",
            fontWeight: 800,
            padding: "3px 8px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            zIndex: 1,
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
          }}>
            <span style={{ color: "#38bdf8" }}>▶</span> Video Tour
          </div>
        )}
      </div>
      <div style={{ padding: "14px" }}>
        <div style={{ fontSize: "10px", color: "#6b7280", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "4px" }}>{categoryText}</div>
        <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#1f2937", margin: "0 0 4px", lineHeight: 1.3 }}>{p.name}</h3>
        <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}> {locationText}</div>

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
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#0ea5e9" }}>Verified Owner</span>
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {p.owner.verificationBadges.map((badge, bIdx) => {
                const badgeId = typeof badge === "string" ? badge : badge?.type;
                if (!badgeId || !BADGE_IMAGES[badgeId]) return null;
                return (
                  <div key={badgeId + bIdx} style={{ position: "relative", display: "inline-block" }}>
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
                  </div>
                );
              })}
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
            <span style={{ fontSize: "16px", fontWeight: 800, color: cardColor }}>KSh {priceVal.toLocaleString()}</span>
            <span style={{ fontSize: "11px", color: "#9ca3af" }}>/night</span>
          </div>
          <div style={{ fontSize: "12px", color: "#fbbf24", fontWeight: 700 }}>★ {p.rating || "4.8"} ({p.reviews || 0})</div>
        </div>
        <button
          type="button"
          style={{ width: "100%", background: cardColor, border: "none", color: "white", padding: "10px", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}
          onClick={(e) => { e.stopPropagation(); onOpen(propId); }}
        >
          {p.bookingUrl ? "View & Book →" : "View Details →"}
        </button>
      </div>
    </div>
  );
}
