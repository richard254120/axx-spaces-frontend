import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";
import MapView from "../components/MapView";

/* ══════════════════════════════════════════════════════════════════
   ✅ NEW — Property Detail Modal (self-contained, no logic changes)
══════════════════════════════════════════════════════════════════ */
function PropertyModal({ property: p, onClose, onWhatsApp, isFav, onToggleFav }) {
  if (!p) return null;
  return (
    <div style={modal.overlay} onClick={onClose}>
      <div style={modal.box} onClick={(e) => e.stopPropagation()}>
        <button style={modal.closeBtn} onClick={onClose}>✕</button>

        {p.image && (
          <img src={p.image} alt={p.title} style={modal.image} />
        )}

        <div style={modal.body}>
          <div style={modal.topRow}>
            <h2 style={modal.title}>{p.title}</h2>
            <button
              style={{ ...modal.favBtn, color: isFav ? "#f43f5e" : "#64748b" }}
              onClick={() => onToggleFav(p._id)}
              title={isFav ? "Remove from favourites" : "Save to favourites"}
            >
              {isFav ? "♥" : "♡"}
            </button>
          </div>

          <p style={modal.location}>📍 {p.county}{p.area ? ` · ${p.area}` : ""}</p>

          <div style={modal.priceRow}>
            <div>
              <div style={modal.priceLabel}>Monthly Rent</div>
              <div style={modal.price}>Ksh {Number(p.price).toLocaleString()}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={modal.priceLabel}>Deposit</div>
              <div style={modal.deposit}>Ksh {Number(p.deposit).toLocaleString()}</div>
            </div>
          </div>

          <div style={modal.metaGrid}>
            {p.type      && <span className="lst-meta-pill">🏗 {p.type}</span>}
            {p.bedrooms  && <span className="lst-meta-pill">🛏 {p.bedrooms} Bed{p.bedrooms > 1 ? "s" : ""}</span>}
            {p.bathrooms && <span className="lst-meta-pill">🚿 {p.bathrooms} Bath</span>}
          </div>

          {p.amenities?.length > 0 && (
            <div style={modal.section}>
              <div style={modal.sectionLabel}>Amenities</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {p.amenities.map((a) => (
                  <span key={a} className="lst-meta-pill" style={{ color: "#34d399" }}>✓ {a}</span>
                ))}
              </div>
            </div>
          )}

          {p.description && (
            <div style={modal.section}>
              <div style={modal.sectionLabel}>Description</div>
              <p style={modal.desc}>{p.description}</p>
            </div>
          )}

          <div style={modal.section}>
            <div style={modal.sectionLabel}>Contact</div>
            <p style={{ color: "#e2e8f0", margin: "4px 0 12px", fontWeight: 700 }}>📞 {p.phone}</p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="lst-whatsapp-btn" onClick={() => onWhatsApp(p.phone, p.title)}>
              💬 Chat on WhatsApp
            </button>
            <button className="lst-share-btn" onClick={() => shareProperty(p)}>
              🔗 Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ✅ NEW — Share helper */
function shareProperty(p) {
  const text = `🏠 ${p.title} — Ksh ${Number(p.price).toLocaleString()}/mo\n📍 ${p.county}${p.area ? ", " + p.area : ""}\n\nFound on Axx Spaces`;
  if (navigator.share) {
    navigator.share({ title: p.title, text, url: window.location.href }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text + "\n" + window.location.href).then(() => {
      alert("Link copied to clipboard! 📋");
    });
  }
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function Listings() {
  const [properties, setProperties]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedProperty, setSelected] = useState(null);        // ✅ NEW modal
  const [favourites, setFavourites]     = useState(() => {       // ✅ NEW favourites
    try { return JSON.parse(localStorage.getItem("axx_favourites") || "[]"); }
    catch { return []; }
  });
  const [inlineFilters, setInlineFilters] = useState({           // ✅ NEW inline filters
    search: "", minPrice: "", maxPrice: "", sortBy: "newest",
  });
  const [showFavsOnly, setShowFavsOnly] = useState(false);       // ✅ NEW saved toggle

  const location = useLocation();
  const navigate = useNavigate();

  // ── UNCHANGED fetch logic ───────────────────────────────────────
  useEffect(() => {
    fetchProperties();
  }, [location.search]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/properties/approved${location.search}`);
      setProperties(res.data);
    } catch (err) {
      console.log("FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── UNCHANGED WhatsApp logic ────────────────────────────────────
  const openWhatsApp = (phone, title) => {
    if (!phone) { alert("No phone number available"); return; }
    const cleanPhone = phone.replace(/\s+/g, "");
    const message = `Hello, I am interested in your property: ${title}`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  // ✅ NEW — toggle favourite (persisted to localStorage)
  const toggleFavourite = useCallback((id) => {
    setFavourites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("axx_favourites", JSON.stringify(next));
      return next;
    });
  }, []);

  // ✅ NEW — client-side filter + sort over fetched data
  const filtered = properties
    .filter((p) => {
      if (showFavsOnly && !favourites.includes(p._id)) return false;
      if (inlineFilters.search) {
        const q = inlineFilters.search.toLowerCase();
        if (
          !p.title?.toLowerCase().includes(q) &&
          !p.area?.toLowerCase().includes(q) &&
          !p.county?.toLowerCase().includes(q) &&
          !p.type?.toLowerCase().includes(q)
        ) return false;
      }
      if (inlineFilters.minPrice && p.price < Number(inlineFilters.minPrice)) return false;
      if (inlineFilters.maxPrice && p.price > Number(inlineFilters.maxPrice)) return false;
      return true;
    })
    .sort((a, b) => {
      if (inlineFilters.sortBy === "price_asc")  return a.price - b.price;
      if (inlineFilters.sortBy === "price_desc") return b.price - a.price;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  // ✅ NEW — similar properties (same county or type, exclude current)
  const getSimilar = (p) =>
    properties
      .filter((x) => x._id !== p._id && (x.county === p.county || x.type === p.type))
      .slice(0, 3);

  // ── URL active filters (unchanged logic) ───────────────────────
  const params = new URLSearchParams(location.search);
  const activeFilters = [];
  if (params.get("county"))   activeFilters.push({ key: "county",   label: `📍 ${params.get("county")}` });
  if (params.get("area"))     activeFilters.push({ key: "area",     label: `🏘 ${params.get("area")}` });
  if (params.get("type"))     activeFilters.push({ key: "type",     label: `🏗 ${params.get("type")}` });
  if (params.get("price"))    activeFilters.push({ key: "price",    label: `💵 Max Ksh ${params.get("price")}` });
  if (params.get("bedrooms")) activeFilters.push({ key: "bedrooms", label: `🛏 ${params.get("bedrooms")} Beds` });

  const removeFilter = (key) => {
    params.delete(key);
    navigate(`/listings?${params.toString()}`);
  };

  // ── RENDER ──────────────────────────────────────────────────────
  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* ✅ NEW — Detail modal */}
      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setSelected(null)}
          onWhatsApp={openWhatsApp}
          isFav={favourites.includes(selectedProperty._id)}
          onToggleFav={toggleFavourite}
        />
      )}

      {/* ── Page header ── */}
      <div style={styles.header}>
        <button className="lst-back" onClick={() => navigate("/")}>← Back</button>
        <div>
          <h1 style={styles.pageTitle}>🏠 Available Listings</h1>
          <p style={styles.pageSubtitle}>
            {loading
              ? "Searching properties…"
              : `${filtered.length} of ${properties.length} propert${properties.length === 1 ? "y" : "ies"}`}
          </p>
        </div>
      </div>

      {/* ── URL filter chips ── */}
      {activeFilters.length > 0 && (
        <div style={styles.filterRow}>
          <span style={styles.filterLabel}>Filters:</span>
          {activeFilters.map((f) => (
            <button key={f.key} className="lst-filter-chip" onClick={() => removeFilter(f.key)}>
              {f.label} <span style={{ marginLeft: 4, opacity: 0.7 }}>✕</span>
            </button>
          ))}
          <button className="lst-clear" onClick={() => navigate("/listings")}>Clear all</button>
        </div>
      )}

      {/* ✅ NEW — Inline search & filter bar */}
      <div style={styles.searchBar}>
        <input
          className="lst-search-input"
          placeholder="🔍  Search title, area, county, type…"
          value={inlineFilters.search}
          onChange={(e) => setInlineFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <input
          className="lst-price-input"
          placeholder="Min Ksh"
          type="number"
          value={inlineFilters.minPrice}
          onChange={(e) => setInlineFilters((f) => ({ ...f, minPrice: e.target.value }))}
        />
        <input
          className="lst-price-input"
          placeholder="Max Ksh"
          type="number"
          value={inlineFilters.maxPrice}
          onChange={(e) => setInlineFilters((f) => ({ ...f, maxPrice: e.target.value }))}
        />
        <select
          className="lst-sort-select"
          value={inlineFilters.sortBy}
          onChange={(e) => setInlineFilters((f) => ({ ...f, sortBy: e.target.value }))}
        >
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
        <button
          className={`lst-fav-toggle${showFavsOnly ? " active" : ""}`}
          onClick={() => setShowFavsOnly((v) => !v)}
          title="Show saved only"
        >
          {showFavsOnly ? "♥ Saved" : "♡ Saved"} ({favourites.length})
        </button>
      </div>

      {/* ── MAP (unchanged) ── */}
      <div style={styles.mapWrap}>
        <MapView properties={properties} />
      </div>

      {/* ── GRID ── */}
      {loading ? (
        <div style={styles.emptyState}>
          <div className="lst-spinner" />
          <p style={{ color: "#64748b", marginTop: 16 }}>Loading properties…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔍</div>
          <h3 style={styles.emptyTitle}>No properties found</h3>
          <p style={styles.emptyText}>Try adjusting your filters or browse all listings</p>
          <button
            className="lst-btn"
            onClick={() => {
              navigate("/listings");
              setInlineFilters({ search: "", minPrice: "", maxPrice: "", sortBy: "newest" });
              setShowFavsOnly(false);
            }}
          >
            View All Listings
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((p, idx) => (
            <div key={p._id} className="lst-card" style={{ animationDelay: `${idx * 60}ms` }}>

              {/* IMAGE */}
              {p.image ? (
                <div style={styles.imageWrap}>
                  <img
                    src={p.image}
                    alt={p.title}
                    style={{ ...styles.image, cursor: "pointer" }}
                    onClick={() => setSelected(p)}
                  />
                  <div style={styles.typeBadge}>{p.type}</div>

                  {/* ✅ NEW — heart button */}
                  <button
                    className="lst-heart-btn"
                    onClick={(e) => { e.stopPropagation(); toggleFavourite(p._id); }}
                    title={favourites.includes(p._id) ? "Remove favourite" : "Save property"}
                  >
                    {favourites.includes(p._id) ? "♥" : "♡"}
                  </button>
                </div>
              ) : (
                <div style={styles.imagePlaceholder} onClick={() => setSelected(p)}>
                  <span style={{ fontSize: 36 }}>🏠</span>
                </div>
              )}

              <div style={styles.cardBody}>
                <h3 style={{ ...styles.cardTitle, cursor: "pointer" }} onClick={() => setSelected(p)}>
                  {p.title}
                </h3>
                <p style={styles.cardLocation}>📍 {p.county}{p.area ? ` · ${p.area}` : ""}</p>

                <div style={styles.priceRow}>
                  <div>
                    <div style={styles.priceLabel}>Monthly</div>
                    <div style={styles.price}>Ksh {Number(p.price).toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={styles.priceLabel}>Deposit</div>
                    <div style={styles.deposit}>Ksh {Number(p.deposit).toLocaleString()}</div>
                  </div>
                </div>

                <div style={styles.metaRow}>
                  {p.bedrooms && <span className="lst-meta-pill">🛏 {p.bedrooms} Bed{p.bedrooms > 1 ? "s" : ""}</span>}
                  {p.type     && <span className="lst-meta-pill">{p.type}</span>}
                </div>

                {p.amenities?.length > 0 && (
                  <p style={styles.amenities}>🏡 {p.amenities.join("  ·  ")}</p>
                )}

                {p.description && (
                  <p style={styles.description}>{p.description}</p>
                )}

                <div style={styles.phoneRow}>
                  <span style={styles.phoneIcon}>📞</span>
                  <span style={styles.phone}>{p.phone}</span>
                </div>

                {/* ── Action row ── */}
                <div style={styles.actionRow}>
                  {/* UNCHANGED WhatsApp button */}
                  <button
                    onClick={() => openWhatsApp(p.phone, p.title)}
                    style={styles.whatsappBtn}
                    className="lst-whatsapp"
                  >
                    💬 WhatsApp
                  </button>

                  {/* ✅ NEW — share */}
                  <button
                    className="lst-share-card-btn"
                    onClick={() => shareProperty(p)}
                    title="Share this property"
                  >
                    🔗
                  </button>

                  {/* ✅ NEW — view detail modal */}
                  <button className="lst-view-btn" onClick={() => setSelected(p)}>
                    View
                  </button>
                </div>

                {/* ✅ NEW — Similar properties */}
                {getSimilar(p).length > 0 && (
                  <div style={styles.similarWrap}>
                    <div style={styles.similarLabel}>Similar</div>
                    <div style={styles.similarRow}>
                      {getSimilar(p).map((s) => (
                        <button
                          key={s._id}
                          className="lst-similar-chip"
                          onClick={() => setSelected(s)}
                        >
                          {s.title.length > 22 ? s.title.slice(0, 22) + "…" : s.title}
                          <span style={{ color: "#60a5fa", marginLeft: 4 }}>
                            Ksh {Number(s.price).toLocaleString()}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════════════ */
const styles = {
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#06101f", color: "#e2e8f0",
    minHeight: "100vh", padding: "28px 20px 60px",
    maxWidth: "1200px", margin: "0 auto",
  },
  header: { display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "20px" },
  pageTitle: { fontSize: "clamp(22px,3vw,34px)", fontWeight: 800, color: "#f1f5f9", margin: 0, letterSpacing: "-0.5px" },
  pageSubtitle: { color: "#64748b", margin: "4px 0 0", fontSize: "14px" },
  filterRow: { display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", marginBottom: "16px" },
  filterLabel: { fontSize: "13px", color: "#64748b" },
  searchBar: {
    display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center",
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "14px", padding: "14px 16px", marginBottom: "20px",
  },
  mapWrap: { borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(59,130,246,0.15)", marginBottom: "28px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "20px" },
  imageWrap: { position: "relative" },
  image: { width: "100%", height: "200px", objectFit: "cover", borderRadius: "12px 12px 0 0", display: "block" },
  imagePlaceholder: {
    width: "100%", height: "160px", background: "rgba(59,130,246,0.07)",
    borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center",
    justifyContent: "center", cursor: "pointer",
  },
  typeBadge: {
    position: "absolute", top: "10px", left: "10px",
    background: "rgba(6,16,31,0.82)", backdropFilter: "blur(6px)",
    color: "#93c5fd", fontSize: "11px", fontWeight: 600,
    padding: "3px 10px", borderRadius: "999px", border: "1px solid rgba(59,130,246,0.3)",
  },
  cardBody: { padding: "16px" },
  cardTitle: { fontSize: "16px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px", lineHeight: 1.3 },
  cardLocation: { fontSize: "13px", color: "#60a5fa", margin: "0 0 14px" },
  priceRow: {
    display: "flex", justifyContent: "space-between",
    background: "rgba(59,130,246,0.07)", borderRadius: "10px",
    padding: "10px 14px", marginBottom: "12px",
  },
  priceLabel: { fontSize: "11px", color: "#64748b", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.5px" },
  price:   { fontSize: "18px", fontWeight: 800, color: "#60a5fa" },
  deposit: { fontSize: "15px", fontWeight: 700, color: "#94a3b8" },
  metaRow: { display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" },
  amenities: { fontSize: "12px", color: "#64748b", margin: "0 0 8px", lineHeight: 1.5 },
  description: {
    fontSize: "13px", color: "#94a3b8", lineHeight: 1.6, margin: "0 0 12px",
    display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
  },
  phoneRow: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" },
  phoneIcon: { fontSize: "14px" },
  phone: { fontSize: "14px", fontWeight: 600, color: "#e2e8f0" },
  actionRow: { display: "flex", gap: "8px", alignItems: "center", marginBottom: "14px" },
  whatsappBtn: {
    flex: 1, padding: "10px", background: "linear-gradient(135deg,#128c4a,#25D366)",
    color: "white", border: "none", borderRadius: "10px", cursor: "pointer",
    fontWeight: 700, fontSize: "13px", fontFamily: "inherit",
    transition: "transform 0.15s, box-shadow 0.2s",
    boxShadow: "0 4px 16px rgba(37,211,102,0.25)",
  },
  similarWrap: { borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" },
  similarLabel: { fontSize: "11px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "8px" },
  similarRow: { display: "flex", flexDirection: "column", gap: "6px" },
  emptyState: { textAlign: "center", padding: "60px 20px" },
  emptyIcon:  { fontSize: "52px", marginBottom: "12px" },
  emptyTitle: { fontSize: "22px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 8px" },
  emptyText:  { color: "#64748b", marginBottom: "24px" },
};

/* ── Modal styles ──────────────────────────────────────────────── */
const modal = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 1000,
    background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
  },
  box: {
    background: "#0d1b2e", borderRadius: "20px",
    border: "1px solid rgba(59,130,246,0.2)",
    width: "100%", maxWidth: "560px",
    maxHeight: "90vh", overflowY: "auto",
    position: "relative", animation: "modalIn .25s ease",
  },
  closeBtn: {
    position: "absolute", top: "14px", right: "14px", zIndex: 10,
    background: "rgba(255,255,255,0.07)", border: "none",
    color: "#94a3b8", fontSize: "16px", borderRadius: "50%",
    width: "32px", height: "32px", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  image: { width: "100%", height: "240px", objectFit: "cover", borderRadius: "20px 20px 0 0", display: "block" },
  body: { padding: "20px" },
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "6px" },
  title: { fontSize: "20px", fontWeight: 800, color: "#f1f5f9", margin: 0, lineHeight: 1.3 },
  favBtn: { fontSize: "26px", background: "none", border: "none", cursor: "pointer", lineHeight: 1, padding: 0, transition: "color .2s" },
  location: { fontSize: "13px", color: "#60a5fa", margin: "0 0 14px" },
  priceRow: {
    display: "flex", justifyContent: "space-between",
    background: "rgba(59,130,246,0.07)", borderRadius: "10px",
    padding: "12px 16px", marginBottom: "14px",
  },
  priceLabel: { fontSize: "11px", color: "#64748b", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.5px" },
  price:   { fontSize: "22px", fontWeight: 800, color: "#60a5fa" },
  deposit: { fontSize: "17px", fontWeight: 700, color: "#94a3b8" },
  metaGrid: { display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" },
  section: { marginBottom: "14px" },
  sectionLabel: { fontSize: "11px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "6px" },
  desc: { fontSize: "14px", color: "#94a3b8", lineHeight: 1.7, margin: 0 },
};

/* ── CSS classes ───────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');

  .lst-back {
    margin-top: 6px; padding: 7px 14px; border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04); color: #94a3b8;
    font-size: 13px; cursor: pointer; white-space: nowrap;
    font-family: inherit; transition: background .2s;
  }
  .lst-back:hover { background: rgba(255,255,255,0.09); }

  .lst-filter-chip {
    display: inline-flex; align-items: center; padding: 5px 12px; border-radius: 999px;
    font-size: 12px; border: 1px solid rgba(59,130,246,0.3);
    background: rgba(59,130,246,0.08); color: #93c5fd;
    cursor: pointer; font-family: inherit; transition: background .2s;
  }
  .lst-filter-chip:hover { background: rgba(59,130,246,0.18); }
  .lst-clear { font-size: 12px; color: #ef4444; background: none; border: none; cursor: pointer; font-family: inherit; text-decoration: underline; padding: 0; }

  .lst-search-input {
    flex: 1; min-width: 200px; padding: 10px 14px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05);
    color: #e2e8f0; font-size: 14px; font-family: inherit; outline: none; transition: border .2s;
  }
  .lst-search-input:focus { border-color: rgba(59,130,246,0.5); }

  .lst-price-input {
    width: 110px; padding: 10px 12px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05);
    color: #e2e8f0; font-size: 13px; font-family: inherit; outline: none; transition: border .2s;
  }
  .lst-price-input:focus { border-color: rgba(59,130,246,0.5); }
  .lst-price-input::-webkit-inner-spin-button { opacity: 0.4; }

  .lst-sort-select {
    padding: 10px 12px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05);
    color: #e2e8f0; font-size: 13px; font-family: inherit; outline: none; cursor: pointer;
  }
  .lst-sort-select option { background: #0d1b2e; }

  .lst-fav-toggle {
    padding: 9px 16px; border-radius: 999px; font-size: 13px; font-weight: 600;
    border: 1px solid rgba(244,63,94,0.3); color: #f43f5e;
    background: rgba(244,63,94,0.07); cursor: pointer; font-family: inherit; transition: background .2s;
  }
  .lst-fav-toggle.active { background: rgba(244,63,94,0.18); border-color: #f43f5e; }
  .lst-fav-toggle:hover  { background: rgba(244,63,94,0.15); }

  .lst-heart-btn {
    position: absolute; top: 10px; right: 10px;
    background: rgba(6,16,31,0.75); backdrop-filter: blur(4px);
    border: 1px solid rgba(244,63,94,0.35); color: #f43f5e;
    font-size: 18px; border-radius: 50%; width: 34px; height: 34px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background .2s, transform .15s;
  }
  .lst-heart-btn:hover { background: rgba(244,63,94,0.2); transform: scale(1.1); }

  .lst-share-card-btn {
    padding: 10px 13px; border-radius: 10px; font-size: 15px;
    border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05);
    color: #94a3b8; cursor: pointer; transition: background .2s;
  }
  .lst-share-card-btn:hover { background: rgba(255,255,255,0.1); }

  .lst-view-btn {
    padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 600;
    border: 1px solid rgba(59,130,246,0.35); color: #60a5fa;
    background: rgba(59,130,246,0.08); cursor: pointer; font-family: inherit; transition: background .2s;
  }
  .lst-view-btn:hover { background: rgba(59,130,246,0.18); }

  .lst-similar-chip {
    display: flex; justify-content: space-between; align-items: center;
    padding: 7px 12px; border-radius: 8px; font-size: 12px;
    border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.03);
    color: #94a3b8; cursor: pointer; font-family: inherit; text-align: left;
    transition: border-color .2s, background .2s;
  }
  .lst-similar-chip:hover { border-color: rgba(59,130,246,0.3); background: rgba(59,130,246,0.06); }

  .lst-whatsapp-btn {
    flex: 1; padding: 12px; background: linear-gradient(135deg,#128c4a,#25D366);
    color: white; border: none; border-radius: 10px; cursor: pointer;
    font-weight: 700; font-size: 14px; font-family: inherit;
    transition: transform .15s; box-shadow: 0 4px 16px rgba(37,211,102,0.25);
  }
  .lst-whatsapp-btn:hover { transform: translateY(-2px); }

  .lst-share-btn {
    padding: 12px 20px; border-radius: 10px; font-size: 14px; font-weight: 600;
    border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.05);
    color: #e2e8f0; cursor: pointer; font-family: inherit; transition: background .2s;
  }
  .lst-share-btn:hover { background: rgba(255,255,255,0.1); }

  .lst-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; overflow: hidden;
    transition: transform .2s, border-color .2s, box-shadow .2s;
    animation: fadeUp .4s ease both;
  }
  .lst-card:hover { transform: translateY(-4px); border-color: rgba(59,130,246,0.35); box-shadow: 0 12px 32px rgba(0,0,0,0.35); }

  .lst-meta-pill {
    display: inline-block; font-size: 11px; padding: 3px 10px; border-radius: 999px;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: #94a3b8;
  }

  .lst-whatsapp:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,211,102,0.35) !important; }
  .lst-whatsapp:active { transform: scale(0.97); }

  .lst-btn {
    padding: 11px 28px; border-radius: 10px; border: none;
    background: linear-gradient(135deg,#1d4ed8,#6d28d9);
    color: #fff; font-weight: 700; font-size: 14px; cursor: pointer;
    font-family: inherit; box-shadow: 0 4px 20px rgba(59,130,246,0.35); transition: transform .15s;
  }
  .lst-btn:hover { transform: translateY(-2px); }

  .lst-spinner {
    width: 36px; height: 36px; border-radius: 50%;
    border: 3px solid rgba(59,130,246,0.15); border-top-color: #3b82f6;
    animation: spin .8s linear infinite; margin: 0 auto;
  }

  @keyframes fadeUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }
`;