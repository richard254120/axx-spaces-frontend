/**
 * MapView.jsx — AXX Spaces
 *
 * Matches your Property schema exactly:
 *   lat, lng, county, propertyType, price, bedrooms,
 *   bathrooms, location (string), isFeatured, availableUnits,
 *   reviews[], images[], status ("approved" only shown)
 *
 * Install:
 *   npm install react-leaflet leaflet
 *
 * In index.css:
 *   @import "leaflet/dist/leaflet.css";
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet default icon (broken with Vite)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const RED     = "#b30000";
const DARK    = "#0a0a0a";
const SURFACE = "#1a1a1a";
const BORDER  = "#2a2a2a";
const MUTED   = "#888";
const FMT     = (n) => "KES " + Number(n).toLocaleString("en-KE");
const STARS   = (reviews = []) =>
  reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

// ── Price bubble marker ────────────────────────────────────────────────────────
function makeIcon(price, isFeatured, isActive) {
  const bg = isActive ? RED : isFeatured ? "#8b0000" : "#1f1f1f";
  const border = isFeatured ? RED : isActive ? "#ff3333" : BORDER;
  return L.divIcon({
    className: "",
    html: `
      <div style="background:${bg};color:#fff;font-size:11px;font-weight:700;
        font-family:Arial,sans-serif;padding:4px 10px;border-radius:20px;
        border:1.5px solid ${border};box-shadow:0 2px 10px rgba(179,0,0,0.4);
        white-space:nowrap;text-align:center;">${FMT(price)}</div>
      <div style="width:0;height:0;border-left:5px solid transparent;
        border-right:5px solid transparent;border-top:7px solid ${bg};
        margin:0 auto;"></div>`,
    iconAnchor:  [40, 24],
    popupAnchor: [0, -30],
  });
}

// ── Smooth pan to selected property ───────────────────────────────────────────
function PanTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, map.getZoom(), { duration: 0.7 });
  }, [center]);
  return null;
}

// ── Counties pulled from your county field ─────────────────────────────────────
const COUNTIES = [
  "All counties","Nairobi","Mombasa","Kisumu","Nakuru",
  "Kiambu","Machakos","Kajiado","Muranga","Nyeri",
];
const PROP_TYPES = ["all","apartment","house","studio","villa","bedsitter","maisonette"];
const LEASE_LABELS = { monthly:"Monthly", "6months":"6 Months", yearly:"Yearly" };

export default function MapView() {
  const [properties, setProperties] = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId,  setHoveredId]  = useState(null);
  const [panTo,      setPanTo]      = useState(null);

  // Filters
  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [maxPrice,   setMaxPrice]   = useState(150000);
  const [bedsFilter, setBedsFilter] = useState("any");
  const [county,     setCounty]     = useState("All counties");
  const [onlyAvail,  setOnlyAvail]  = useState(false);
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [furnished,  setFurnished]  = useState(false);

  // ── Fetch approved properties ────────────────────────────────────────────────
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    fetch("/api/properties?status=approved&limit=200", { signal: ctrl.signal })
      .then(r => { if (!r.ok) throw new Error("Failed to load properties"); return r.json(); })
      .then(data => {
        const list = Array.isArray(data) ? data : (data.properties ?? []);
        // Only keep properties that have coordinates
        setProperties(list.filter(p => p.lat && p.lng));
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== "AbortError") { setError(err.message); setLoading(false); }
      });
    return () => ctrl.abort();
  }, []);

  // ── Filter logic ─────────────────────────────────────────────────────────────
  const applyFilters = useCallback(() => {
    const q = search.trim().toLowerCase();
    setFiltered(properties.filter(p => {
      if (typeFilter !== "all" && p.propertyType?.toLowerCase() !== typeFilter) return false;
      if (county !== "All counties" && p.county !== county) return false;
      if (p.price > maxPrice) return false;
      if (bedsFilter === "1" && p.bedrooms !== 1) return false;
      if (bedsFilter === "2" && p.bedrooms !== 2) return false;
      if (bedsFilter === "3" && p.bedrooms < 3) return false;
      if (onlyAvail && p.availableUnits < 1) return false;
      if (onlyFeatured && !p.isFeatured) return false;
      if (furnished && !p.furnished) return false;
      if (q &&
        !p.title?.toLowerCase().includes(q) &&
        !p.location?.toLowerCase().includes(q) &&
        !p.county?.toLowerCase().includes(q)) return false;
      return true;
    }));
  }, [properties, search, typeFilter, county, maxPrice, bedsFilter, onlyAvail, onlyFeatured, furnished]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  // ── Select property ───────────────────────────────────────────────────────────
  const selectProp = (p) => {
    setSelectedId(prev => prev === p._id ? null : p._id);
    if (p.lat && p.lng) setPanTo([p.lat, p.lng]);
  };

  const S = styles; // alias

  return (
    <div style={S.wrapper}>

      {/* ─── Top bar ─── */}
      <div style={S.topbar}>
        <div style={S.searchWrap}>
          <span style={S.searchIcon}>🔍</span>
          <input
            style={S.searchInput}
            placeholder="Search title, location or county…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select style={S.select} value={county} onChange={e => setCounty(e.target.value)}>
          {COUNTIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <label style={S.toggle}>
          <input type="checkbox" checked={onlyAvail} onChange={e => setOnlyAvail(e.target.checked)} />
          <span style={S.toggleLabel}>Available only</span>
        </label>
      </div>

      <div style={S.body}>

        {/* ─── Sidebar ─── */}
        <aside style={S.sidebar}>
          <div style={S.filterBox}>

            <p style={S.filterLabel}>Property type</p>
            <div style={S.chipRow}>
              {PROP_TYPES.map(t => (
                <button key={t} style={{...S.chip, ...(typeFilter===t ? S.chipActive : {})}}
                  onClick={() => setTypeFilter(t)}>
                  {t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>

            <p style={S.filterLabel}>Max price / month</p>
            <div style={S.priceRow}>
              <span style={{ color: MUTED, fontSize: 11 }}>KES 0</span>
              <span style={S.priceVal}>{FMT(maxPrice)}</span>
            </div>
            <input type="range" min={5000} max={500000} step={5000} value={maxPrice}
              style={{ width:"100%", accentColor: RED, marginBottom: 14 }}
              onChange={e => setMaxPrice(+e.target.value)} />

            <p style={S.filterLabel}>Bedrooms</p>
            <div style={S.chipRow}>
              {[["any","Any"],["1","1"],["2","2"],["3","3+"]].map(([v,l]) => (
                <button key={v} style={{...S.chip, ...(bedsFilter===v ? S.chipActive : {})}}
                  onClick={() => setBedsFilter(v)}>{l}</button>
              ))}
            </div>

            <div style={S.toggleRow}>
              <label style={S.toggle}>
                <input type="checkbox" checked={furnished} onChange={e=>setFurnished(e.target.checked)}/>
                <span style={S.toggleLabel}>Furnished only</span>
              </label>
              <label style={S.toggle}>
                <input type="checkbox" checked={onlyFeatured} onChange={e=>setOnlyFeatured(e.target.checked)}/>
                <span style={S.toggleLabel}>Featured only</span>
              </label>
            </div>
          </div>

          {/* Results list */}
          <div style={S.listHeader}>
            <span style={S.listTitle}>Listings</span>
            <span style={{ fontSize:11, color: MUTED }}>{filtered.length} found</span>
          </div>

          <div style={S.list}>
            {loading && <p style={S.empty}>Loading properties…</p>}
            {error   && <p style={{ ...S.empty, color: RED }}>{error}</p>}
            {!loading && !error && filtered.length === 0 && (
              <p style={S.empty}>No properties match your filters.</p>
            )}
            {filtered.map(p => {
              const avg  = STARS(p.reviews);
              const avail = p.availableUnits > 0;
              const isSelected = selectedId === p._id;
              const isHovered  = hoveredId  === p._id;
              return (
                <div key={p._id}
                  style={{...S.card, ...(isSelected||isHovered ? S.cardActive : {})}}
                  onClick={() => selectProp(p)}
                  onMouseEnter={() => setHoveredId(p._id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Thumbnail */}
                  <div style={S.thumb}>
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt="" style={S.thumbImg}/>
                      : <span style={{fontSize:18}}>🏠</span>}
                    {p.isFeatured && <span style={S.featBadge}>★ Featured</span>}
                  </div>
                  {/* Info */}
                  <div style={S.cardInfo}>
                    <div style={S.cardPrice}>{FMT(p.price)}<span style={S.cardMo}>/mo</span></div>
                    <div style={S.cardName}>{p.title}</div>
                    <div style={S.cardMeta}>
                      <span>📍 {p.county}</span>
                      <span>🛏 {p.bedrooms}bd</span>
                      <span>🚿 {p.bathrooms}ba</span>
                    </div>
                    <div style={S.cardFooter}>
                      <span style={{...S.availDot, background: avail ? "#22c55e" : RED}}/>
                      <span style={{ fontSize:10, color: MUTED }}>
                        {avail ? `${p.availableUnits} unit${p.availableUnits>1?"s":""} avail.` : "Fully booked"}
                      </span>
                      {avg && <span style={S.star}>⭐ {avg}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ─── Map ─── */}
        <div style={{ flex:1, position:"relative" }}>
          <MapContainer
            center={[-1.286389, 36.817223]}
            zoom={12}
            style={{ width:"100%", height:"100%" }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
            />

            {panTo && <PanTo center={panTo} />}

            {filtered.map(p => {
              if (!p.lat || !p.lng) return null;
              const isActive = selectedId === p._id || hoveredId === p._id;
              return (
                <Marker
                  key={p._id}
                  position={[p.lat, p.lng]}
                  icon={makeIcon(p.price, p.isFeatured, isActive)}
                  eventHandlers={{
                    click:     () => selectProp(p),
                    mouseover: () => setHoveredId(p._id),
                    mouseout:  () => setHoveredId(null),
                  }}
                >
                  <Popup>
                    <div style={{ minWidth:190, background:SURFACE, color:"#fff",
                                  borderRadius:8, overflow:"hidden",
                                  fontFamily:"Arial,sans-serif", fontSize:12 }}>
                      {p.images?.[0] && (
                        <img src={p.images[0]} alt=""
                          style={{ width:"100%", height:100, objectFit:"cover",
                                   display:"block" }}/>
                      )}
                      <div style={{ padding:"10px 12px" }}>
                        {p.isFeatured && (
                          <span style={{ fontSize:10, background:RED, color:"#fff",
                            padding:"2px 7px", borderRadius:10, marginBottom:6,
                            display:"inline-block" }}>★ Featured</span>
                        )}
                        <div style={{ fontSize:15, fontWeight:700, marginBottom:2 }}>
                          {FMT(p.price)}<span style={{ fontSize:10, fontWeight:400, color:MUTED }}>/mo</span>
                        </div>
                        <div style={{ color:"#ccc", marginBottom:6 }}>{p.title}</div>
                        <div style={{ color:MUTED, fontSize:11, marginBottom:4, lineHeight:1.6 }}>
                          📍 {p.location}, {p.county}<br/>
                          🛏 {p.bedrooms} bed &nbsp;·&nbsp;
                          🚿 {p.bathrooms} bath &nbsp;·&nbsp;
                          {p.furnished ? "✅ Furnished" : "🪑 Unfurnished"}
                        </div>
                        {p.leaseType && (
                          <div style={{ color:MUTED, fontSize:11, marginBottom:4 }}>
                            📄 Lease: {LEASE_LABELS[p.leaseType] ?? p.leaseType}
                            {p.deposit > 0 && ` · Deposit: ${FMT(p.deposit)}`}
                          </div>
                        )}
                        <div style={{ display:"flex", justifyContent:"space-between",
                                      alignItems:"center", marginBottom:8 }}>
                          <span style={{ fontSize:11 }}>
                            <span style={{ width:7, height:7, borderRadius:"50%",
                              background: p.availableUnits>0 ? "#22c55e" : RED,
                              display:"inline-block", marginRight:4 }}/>
                            {p.availableUnits>0
                              ? `${p.availableUnits} unit(s) available`
                              : "Fully booked"}
                          </span>
                          {STARS(p.reviews) &&
                            <span style={{ fontSize:11 }}>⭐ {STARS(p.reviews)} ({p.reviews.length})</span>}
                        </div>
                        <a href={`/properties/${p._id}`}
                          style={{ display:"block", textAlign:"center",
                            padding:"8px 0", background:RED, color:"#fff",
                            borderRadius:5, textDecoration:"none",
                            fontWeight:700, fontSize:12 }}>
                          View listing →
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  wrapper:  { display:"flex", flexDirection:"column", height:"100vh",
              background:DARK, color:"#fff", fontFamily:"Arial,sans-serif",
              overflow:"hidden" },

  topbar:   { display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
              borderBottom:`1px solid ${BORDER}`, background:SURFACE, flexShrink:0 },

  searchWrap:  { flex:1, position:"relative" },
  searchIcon:  { position:"absolute", left:10, top:"50%",
                 transform:"translateY(-50%)", fontSize:13 },
  searchInput: { width:"100%", padding:"7px 12px 7px 32px",
                 border:`1px solid ${BORDER}`, borderRadius:5, fontSize:13,
                 background:"#111", color:"#fff", outline:"none",
                 boxSizing:"border-box" },
  select:      { padding:"7px 10px", border:`1px solid ${BORDER}`, borderRadius:5,
                 fontSize:12, background:"#111", color:"#fff", cursor:"pointer" },
  toggle:      { display:"flex", alignItems:"center", gap:5, cursor:"pointer" },
  toggleLabel: { fontSize:11, color:"#ccc", whiteSpace:"nowrap" },
  toggleRow:   { display:"flex", flexDirection:"column", gap:6, marginTop:4 },

  body:     { display:"flex", flex:1, overflow:"hidden" },
  sidebar:  { width:240, flexShrink:0, borderRight:`1px solid ${BORDER}`,
              display:"flex", flexDirection:"column", overflow:"hidden",
              background:SURFACE },

  filterBox:    { padding:12, borderBottom:`1px solid ${BORDER}`, flexShrink:0 },
  filterLabel:  { fontSize:10, fontWeight:700, color:MUTED, textTransform:"uppercase",
                  letterSpacing:"0.06em", marginBottom:6, marginTop:2 },

  chipRow:    { display:"flex", flexWrap:"wrap", gap:4, marginBottom:12 },
  chip:       { padding:"3px 9px", border:`1px solid ${BORDER}`, borderRadius:20,
                fontSize:11, cursor:"pointer", background:"#111", color:"#aaa",
                transition:"all .15s" },
  chipActive: { background:RED, color:"#fff", borderColor:RED },

  priceRow:   { display:"flex", justifyContent:"space-between", marginBottom:4 },
  priceVal:   { fontSize:12, fontWeight:700, color:"#fff" },

  listHeader: { display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"10px 12px 6px", flexShrink:0 },
  listTitle:  { fontSize:12, fontWeight:700 },
  list:       { overflowY:"auto", flex:1 },
  empty:      { padding:"20px 12px", fontSize:12, color:MUTED, textAlign:"center" },

  card:       { padding:"10px 12px", borderBottom:`1px solid ${BORDER}`,
                cursor:"pointer", display:"flex", gap:10, alignItems:"flex-start",
                transition:"background .12s" },
  cardActive: { background:"#1f1f1f", borderLeft:`2px solid ${RED}` },

  thumb:      { width:52, height:46, borderRadius:6, flexShrink:0,
                background:"#111", display:"flex", alignItems:"center",
                justifyContent:"center", overflow:"hidden", position:"relative" },
  thumbImg:   { width:"100%", height:"100%", objectFit:"cover" },
  featBadge:  { position:"absolute", bottom:0, left:0, right:0, background:RED,
                color:"#fff", fontSize:8, fontWeight:700, textAlign:"center",
                padding:"1px 0" },

  cardInfo:   { flex:1, minWidth:0 },
  cardPrice:  { fontSize:13, fontWeight:700 },
  cardMo:     { fontSize:10, fontWeight:400, color:MUTED },
  cardName:   { fontSize:11, color:"#aaa", overflow:"hidden",
                textOverflow:"ellipsis", whiteSpace:"nowrap", marginTop:1 },
  cardMeta:   { display:"flex", gap:7, marginTop:3, fontSize:10, color:MUTED },
  cardFooter: { display:"flex", alignItems:"center", gap:6, marginTop:4 },
  availDot:   { width:6, height:6, borderRadius:"50%", flexShrink:0 },
  star:       { fontSize:10, color:"#facc15", marginLeft:"auto" },
};