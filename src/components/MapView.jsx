/**
 * MapView.jsx — Axxspace
 *
 * Receives already-filtered properties from Listings.jsx as a prop.
 * No internal fetching. Matches the navy/amber theme.
 *
 * Usage (already in Listings.jsx):
 *   {showMap && <MapView properties={filteredProperties} />}
 *
 * Install once:
 *   npm install react-leaflet leaflet
 *
 * In your index.css / main.css add ONE line:
 *   @import "leaflet/dist/leaflet.css";
 */

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// ── Fix Leaflet marker icons broken by Vite bundler ───────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const FMT = (n) => "KES " + Number(n).toLocaleString("en-KE");

const avgRating = (reviews = []) =>
  reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

const formatPhone = (phone) => {
  if (!phone) return "";
  let c = phone.toString().replace(/\D/g, "");
  if (c.startsWith("0")) c = c.substring(1);
  if (c.startsWith("254")) return c;
  return "254" + c;
};

// ── Price-bubble custom icon ──────────────────────────────────────────────────
function makePinIcon(price, isFeatured, isActive) {
  const bg     = isActive ? "#b30000" : isFeatured ? "#d97706" : "#1e3a5f";
  const border = isActive ? "#ff6b6b" : isFeatured ? "#fbbf24" : "#334155";
  return L.divIcon({
    className: "",
    html: `
      <div style="
        background:${bg};color:#f1f5f9;
        font-size:11px;font-weight:700;
        font-family:'DM Sans',-apple-system,sans-serif;
        padding:4px 10px;border-radius:20px;
        border:1.5px solid ${border};
        box-shadow:0 2px 10px rgba(0,0,0,0.5);
        white-space:nowrap;text-align:center;">
        ${FMT(price)}
      </div>
      <div style="
        width:0;height:0;
        border-left:5px solid transparent;
        border-right:5px solid transparent;
        border-top:7px solid ${bg};
        margin:0 auto;">
      </div>`,
    iconAnchor:  [40, 24],
    popupAnchor: [0, -28],
  });
}

// ── Pan map when selected property changes ────────────────────────────────────
function PanTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 15, { duration: 0.8 });
  }, [center]);
  return null;
}

// ── MapView ───────────────────────────────────────────────────────────────────
export default function MapView({ properties = [] }) {
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId,  setHoveredId]  = useState(null);
  const [panTo,      setPanTo]      = useState(null);

  // Properties that actually have coordinates
  const mappable = properties.filter(p => p.lat && p.lng);
  const unmapped = properties.length - mappable.length;

  // Default center: Nairobi; or centroid of first mapped property
  const defaultCenter =
    mappable[0] ? [mappable[0].lat, mappable[0].lng] : [-1.286389, 36.817223];

  const selectPin = (p) => {
    const next = selectedId === p._id ? null : p._id;
    setSelectedId(next);
    if (next && p.lat && p.lng) setPanTo([p.lat, p.lng]);
  };

  const openWhatsApp = (p) => {
    const phone = formatPhone(p.owner?.phone || p.phone || "");
    const msg   = `Hi ${p.owner?.name || "Landlord"}, I'm interested in "${p.title}" in ${p.location}. Can you share more details?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div style={S.wrapper}>

      {/* ── Header bar ── */}
      <div style={S.bar}>
        <span style={S.barText}>
          📍 Showing <strong style={{ color: "#fbbf24" }}>{mappable.length}</strong> of {properties.length} listings on map
          {unmapped > 0 && <span style={S.barMuted}> · {unmapped} without coordinates</span>}
        </span>
        <div style={S.legend}>
          <span style={S.legendDot("#fbbf24")} /> Featured
          <span style={S.legendDot("#1e3a5f")} /> Standard
          <span style={S.legendDot("#b30000")} /> Selected
        </div>
      </div>

      <div style={S.body}>

        {/* ── Property list ── */}
        <div style={S.list}>
          {mappable.length === 0 && (
            <p style={S.empty}>No properties with GPS coordinates yet.</p>
          )}
          {mappable.map(p => {
            const isActive   = selectedId === p._id || hoveredId === p._id;
            const available  = p.availableUnits > 0;
            const rating     = avgRating(p.reviews);
            return (
              <div
                key={p._id}
                style={{ ...S.card, ...(isActive ? S.cardActive : {}) }}
                onClick={() => selectPin(p)}
                onMouseEnter={() => setHoveredId(p._id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Thumbnail */}
                <div style={S.thumb}>
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt="" style={S.thumbImg} />
                    : <span style={{ fontSize: 18 }}>🏠</span>}
                  {p.isFeatured && <span style={S.featBadge}>★</span>}
                </div>

                {/* Info */}
                <div style={S.cardBody}>
                  <div style={S.cardPrice}>{FMT(p.price)}<span style={S.perMo}>/mo</span></div>
                  <div style={S.cardName}>{p.title}</div>
                  <div style={S.cardMeta}>
                    <span>📍 {p.county}</span>
                    <span>🛏 {p.bedrooms}bd</span>
                    <span>🚿 {p.bathrooms}ba</span>
                  </div>
                  <div style={S.cardFooter}>
                    <span style={{ ...S.dot, background: available ? "#22c55e" : "#ef4444" }} />
                    <span style={S.availText}>
                      {available ? `${p.availableUnits} avail.` : "Fully booked"}
                    </span>
                    {rating && <span style={S.rating}>⭐ {rating}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Map ── */}
        <div style={S.mapWrap}>
          {mappable.length > 0 ? (
            <MapContainer
              center={defaultCenter}
              zoom={12}
              style={{ width: "100%", height: "100%" }}
            >
              {/* Dark tile layer — matches Listings.jsx navy theme */}
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
              />

              {panTo && <PanTo center={panTo} />}

              {mappable.map(p => (
                <Marker
                  key={p._id}
                  position={[p.lat, p.lng]}
                  icon={makePinIcon(
                    p.price,
                    p.isFeatured,
                    selectedId === p._id || hoveredId === p._id
                  )}
                  eventHandlers={{
                    click:     () => selectPin(p),
                    mouseover: () => setHoveredId(p._id),
                    mouseout:  () => setHoveredId(null),
                  }}
                >
                  <Popup>
                    <div style={S.popup}>
                      {/* Popup image */}
                      {p.images?.[0] && (
                        <img src={p.images[0]} alt=""
                          style={{ width: "100%", height: 110,
                                   objectFit: "cover", display: "block" }} />
                      )}
                      <div style={S.popupBody}>
                        {p.isFeatured && (
                          <span style={S.popupFeat}>★ Featured</span>
                        )}
                        <div style={S.popupPrice}>
                          {FMT(p.price)}
                          <span style={{ fontSize: 11, fontWeight: 400,
                                         color: "#94a3b8" }}>/mo</span>
                        </div>
                        <div style={S.popupTitle}>{p.title}</div>
                        <div style={S.popupMeta}>
                          📍 {p.location}, {p.county}
                        </div>
                        <div style={S.popupMeta}>
                          🛏 {p.bedrooms} bed &nbsp;·&nbsp;
                          🚿 {p.bathrooms} bath &nbsp;·&nbsp;
                          {p.furnished ? "✅ Furnished" : "📦 Unfurnished"}
                        </div>
                        {p.leaseType && (
                          <div style={S.popupMeta}>
                            📄 {
                              { monthly: "Monthly", "6months": "6 Months", yearly: "Yearly" }
                              [p.leaseType] ?? p.leaseType
                            }
                            {p.deposit > 0 &&
                              <> &nbsp;·&nbsp; Deposit: {FMT(p.deposit)}</>}
                          </div>
                        )}
                        <div style={{ ...S.popupMeta, display: "flex",
                                       alignItems: "center", gap: 6 }}>
                          <span style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: p.availableUnits > 0 ? "#22c55e" : "#ef4444",
                            display: "inline-block",
                          }} />
                          {p.availableUnits > 0
                            ? `${p.availableUnits} unit(s) available`
                            : "Fully booked"}
                          {avgRating(p.reviews) &&
                            <span style={{ marginLeft: "auto" }}>
                              ⭐ {avgRating(p.reviews)}
                            </span>}
                        </div>

                        {/* Contact buttons */}
                        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                          <button
                            style={S.popupWaBtn}
                            disabled={p.availableUnits === 0}
                            onClick={() => openWhatsApp(p)}
                          >
                            WhatsApp
                          </button>
                          <button
                            style={S.popupCallBtn}
                            onClick={() =>
                              window.open(`tel:${p.owner?.phone || p.phone}`)
                            }
                          >
                            📞 Call
                          </button>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div style={S.noMap}>
              <p style={{ color: "#94a3b8", textAlign: "center" }}>
                🗺️ No properties with GPS coordinates to display.<br/>
                <span style={{ fontSize: 12 }}>
                  Ask landlords to add lat/lng when listing their property.
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Styles — navy/amber matching Listings.jsx ─────────────────────────────────
const NAVY   = "#0f1729";
const SURF   = "#1e293b";
const BORDER = "#334155";
const MUTED  = "#94a3b8";
const AMBER  = "#fbbf24";
const RED    = "#b30000";

const S = {
  wrapper:  { background: NAVY, border: `1px solid ${BORDER}`, borderRadius: 12,
              overflow: "hidden", marginBottom: 24, height: 480,
              display: "flex", flexDirection: "column",
              fontFamily: "'DM Sans',-apple-system,sans-serif" },

  bar:      { display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 16px", background: SURF, borderBottom: `1px solid ${BORDER}`,
              flexShrink: 0, flexWrap: "wrap", gap: 8 },
  barText:  { fontSize: 13, color: "#f1f5f9" },
  barMuted: { color: MUTED },
  legend:   { display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: MUTED },
  legendDot: (bg) => ({
    display: "inline-block", width: 8, height: 8,
    borderRadius: "50%", background: bg, marginRight: 4,
  }),

  body:     { display: "flex", flex: 1, overflow: "hidden" },

  // Left list
  list:     { width: 220, flexShrink: 0, borderRight: `1px solid ${BORDER}`,
              overflowY: "auto", background: SURF },
  empty:    { padding: 16, fontSize: 12, color: MUTED, textAlign: "center" },
  card:     { padding: "10px 12px", borderBottom: `1px solid ${BORDER}`,
              cursor: "pointer", display: "flex", gap: 8, alignItems: "flex-start",
              transition: "background .12s" },
  cardActive: { background: "rgba(179,0,0,0.12)", borderLeft: `2px solid ${RED}` },

  thumb:    { width: 46, height: 42, borderRadius: 6, flexShrink: 0,
              background: NAVY, display: "flex", alignItems: "center",
              justifyContent: "center", overflow: "hidden", position: "relative" },
  thumbImg: { width: "100%", height: "100%", objectFit: "cover" },
  featBadge:{ position: "absolute", top: 0, right: 0, background: AMBER, color: "#000",
              fontSize: 8, fontWeight: 700, padding: "1px 3px", borderRadius: "0 6px 0 4px" },

  cardBody:  { flex: 1, minWidth: 0 },
  cardPrice: { fontSize: 12, fontWeight: 700, color: AMBER },
  perMo:     { fontSize: 10, fontWeight: 400, color: MUTED },
  cardName:  { fontSize: 11, color: "#cbd5e1", overflow: "hidden",
               textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 },
  cardMeta:  { display: "flex", gap: 6, marginTop: 3, fontSize: 10, color: MUTED,
               flexWrap: "wrap" },
  cardFooter:{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 },
  dot:       { width: 6, height: 6, borderRadius: "50%", flexShrink: 0 },
  availText: { fontSize: 10, color: MUTED },
  rating:    { fontSize: 10, color: "#facc15", marginLeft: "auto" },

  // Map
  mapWrap:   { flex: 1, position: "relative" },
  noMap:     { width: "100%", height: "100%", display: "flex",
               alignItems: "center", justifyContent: "center",
               background: NAVY, padding: 24 },

  // Popup
  popup:     { minWidth: 210, background: SURF, color: "#f1f5f9",
               borderRadius: 10, overflow: "hidden",
               fontFamily: "'DM Sans',-apple-system,sans-serif",
               fontSize: 12, margin: -14 },
  popupBody: { padding: "12px 14px" },
  popupFeat: { display: "inline-block", fontSize: 10, background: AMBER,
               color: "#000", fontWeight: 700, padding: "2px 8px",
               borderRadius: 10, marginBottom: 6 },
  popupPrice:{ fontSize: 16, fontWeight: 700, color: AMBER, marginBottom: 2 },
  popupTitle:{ color: "#f1f5f9", fontWeight: 600, marginBottom: 6 },
  popupMeta: { color: MUTED, fontSize: 11, marginBottom: 4, lineHeight: 1.6 },
  popupWaBtn:{ flex: 1, padding: "8px 0",
               background: "linear-gradient(135deg,#22c55e,#16a34a)",
               color: "#fff", border: "none", borderRadius: 6,
               fontWeight: 700, cursor: "pointer", fontSize: 12 },
  popupCallBtn:{ flex: 1, padding: "8px 0",
                 background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                 color: "#fff", border: "none", borderRadius: 6,
                 fontWeight: 700, cursor: "pointer", fontSize: 12 },
};