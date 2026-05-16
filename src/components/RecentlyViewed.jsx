// src/components/RecentlyViewed.jsx
// 1. Call trackView(property) whenever a user opens a property modal
// 2. Place <RecentlyViewed onSelect={openModal} /> anywhere in Listings.jsx

import { useState, useEffect } from "react";

const KEY = "axx_recently_viewed";
const MAX = 4;

// ── Call this whenever a property modal is opened ──
export function trackView(property) {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || "[]");
    // Remove if already exists, then prepend
    const filtered = stored.filter((p) => p._id !== property._id);
    const updated = [
      {
        _id: property._id,
        title: property.title,
        location: property.location,
        county: property.county,
        price: property.price,
        images: property.images,
        availableUnits: property.availableUnits,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
      },
      ...filtered,
    ].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    // fail silently
  }
}

// ── Component ──
export default function RecentlyViewed({ onSelect }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || "[]");
      setItems(stored);
    } catch {
      setItems([]);
    }
  }, []);

  if (items.length === 0) return null;

  return (
    <div style={s.wrap}>
      <h3 style={s.title}>🕐 Recently Viewed</h3>
      <div style={s.grid}>
        {items.map((p) => (
          <div
            key={p._id}
            style={s.card}
            onClick={() => onSelect && onSelect(p)}
            className="rv-card"
          >
            <div style={s.imgWrap}>
              {p.images?.[0] ? (
                <img src={p.images[0]} alt={p.title} style={s.img} />
              ) : (
                <div style={s.noImg}>📷</div>
              )}
              {p.availableUnits > 0 ? (
                <span style={s.badgeGreen}>✅ {p.availableUnits} left</span>
              ) : (
                <span style={s.badgeRed}>❌ Booked</span>
              )}
            </div>
            <div style={s.info}>
              <p style={s.name}>{p.title}</p>
              <p style={s.loc}>📍 {p.county} • {p.location}</p>
              <p style={s.price}>KES {p.price?.toLocaleString()}/mo</p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .rv-card { cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
        .rv-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
      `}</style>
    </div>
  );
}

const s = {
  wrap: {
    margin: "32px 0",
    padding: "0",
  },
  title: {
    color: "#fbbf24", fontSize: "18px", fontWeight: 700,
    margin: "0 0 16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "14px",
  },
  card: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f1729 100%)",
    border: "1px solid #334155",
    borderRadius: "10px",
    overflow: "hidden",
  },
  imgWrap: { position: "relative", height: "120px" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  noImg: {
    width: "100%", height: "100%",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "#334155", fontSize: "24px",
  },
  badgeGreen: {
    position: "absolute", bottom: "6px", left: "6px",
    background: "#10b981", color: "white",
    padding: "3px 8px", borderRadius: "10px",
    fontSize: "10px", fontWeight: 700,
  },
  badgeRed: {
    position: "absolute", bottom: "6px", left: "6px",
    background: "#ef4444", color: "white",
    padding: "3px 8px", borderRadius: "10px",
    fontSize: "10px", fontWeight: 700,
  },
  info: { padding: "10px" },
  name: {
    margin: "0 0 4px", color: "#f1f5f9",
    fontSize: "13px", fontWeight: 700,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  loc: { margin: "0 0 4px", color: "#64748b", fontSize: "11px" },
  price: { margin: 0, color: "#fbbf24", fontSize: "13px", fontWeight: 700 },
};