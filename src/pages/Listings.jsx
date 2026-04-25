import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";
import MapView from "../components/MapView";

export default function Listings() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, [location.search]);

  // ── UNCHANGED fetch logic ─────────────────────────────────────────────────
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

  // ── UNCHANGED WhatsApp logic ──────────────────────────────────────────────
  const openWhatsApp = (phone, title) => {
    if (!phone) {
      alert("No phone number available");
      return;
    }
    const cleanPhone = phone.replace(/\s+/g, "");
    const message = `Hello, I am interested in your property: ${title}`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // ── Parse active filters from URL for display ─────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* ── Page header ── */}
      <div style={styles.header}>
        <button className="lst-back" onClick={() => navigate("/")}>← Back</button>
        <div>
          <h1 style={styles.pageTitle}>🏠 Available Listings</h1>
          <p style={styles.pageSubtitle}>
            {loading
              ? "Searching properties…"
              : `${properties.length} propert${properties.length === 1 ? "y" : "ies"} found`}
          </p>
        </div>
      </div>

      {/* ── Active filter chips ── */}
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

      {/* ── MAP ── */}
      <div style={styles.mapWrap}>
        <MapView properties={properties} />
      </div>

      {/* ── GRID ── */}
      {loading ? (
        <div style={styles.emptyState}>
          <div className="lst-spinner" />
          <p style={{ color: "#64748b", marginTop: 16 }}>Loading properties…</p>
        </div>
      ) : properties.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔍</div>
          <h3 style={styles.emptyTitle}>No properties found</h3>
          <p style={styles.emptyText}>Try adjusting your filters or browse all listings</p>
          <button className="lst-btn" onClick={() => navigate("/listings")}>View All Listings</button>
        </div>
      ) : (
        <div style={styles.grid}>
          {properties.map((p, idx) => {
            const imageSrc = p.image;
            return (
              <div
                key={p._id}
                className="lst-card"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                {/* IMAGE */}
                {imageSrc ? (
                  <div style={styles.imageWrap}>
                    <img src={imageSrc} alt={p.title} style={styles.image} />
                    <div style={styles.typeBadge}>{p.type}</div>
                  </div>
                ) : (
                  <div style={styles.imagePlaceholder}>
                    <span style={{ fontSize: 36 }}>🏠</span>
                  </div>
                )}

                <div style={styles.cardBody}>
                  {/* Title + location */}
                  <h3 style={styles.cardTitle}>{p.title}</h3>
                  <p style={styles.cardLocation}>📍 {p.county}{p.area ? ` · ${p.area}` : ""}</p>

                  {/* Price row */}
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

                  {/* Meta pills */}
                  <div style={styles.metaRow}>
                    {p.bedrooms && (
                      <span className="lst-meta-pill">🛏 {p.bedrooms} Bed{p.bedrooms > 1 ? "s" : ""}</span>
                    )}
                    {p.type && (
                      <span className="lst-meta-pill">{p.type}</span>
                    )}
                  </div>

                  {/* Amenities */}
                  {p.amenities?.length > 0 && (
                    <p style={styles.amenities}>🏡 {p.amenities.join("  ·  ")}</p>
                  )}

                  {/* Description */}
                  {p.description && (
                    <p style={styles.description}>{p.description}</p>
                  )}

                  {/* Phone */}
                  <div style={styles.phoneRow}>
                    <span style={styles.phoneIcon}>📞</span>
                    <span style={styles.phone}>{p.phone}</span>
                  </div>

                  {/* ── WHATSAPP BUTTON — unchanged logic ── */}
                  <button
                    onClick={() => openWhatsApp(p.phone, p.title)}
                    style={styles.whatsappBtn}
                    className="lst-whatsapp"
                  >
                    💬 Chat on WhatsApp
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   STYLES  — matches Home.jsx dark navy palette
══════════════════════════════════════════════════════════════════════════════ */
const styles = {
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#06101f",
    color: "#e2e8f0",
    minHeight: "100vh",
    padding: "28px 20px 60px",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "20px",
  },
  pageTitle: {
    fontSize: "clamp(22px, 3vw, 34px)",
    fontWeight: 800,
    color: "#f1f5f9",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  pageSubtitle: {
    color: "#64748b",
    margin: "4px 0 0",
    fontSize: "14px",
  },

  filterRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    alignItems: "center",
    marginBottom: "20px",
  },
  filterLabel: { fontSize: "13px", color: "#64748b" },

  mapWrap: {
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid rgba(59,130,246,0.15)",
    marginBottom: "28px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },

  imageWrap: { position: "relative" },
  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderRadius: "12px 12px 0 0",
    display: "block",
  },
  imagePlaceholder: {
    width: "100%",
    height: "160px",
    background: "rgba(59,130,246,0.07)",
    borderRadius: "12px 12px 0 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  typeBadge: {
    position: "absolute",
    top: "10px",
    left: "10px",
    background: "rgba(6,16,31,0.82)",
    backdropFilter: "blur(6px)",
    color: "#93c5fd",
    fontSize: "11px",
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: "999px",
    border: "1px solid rgba(59,130,246,0.3)",
  },

  cardBody: { padding: "16px" },
  cardTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#f1f5f9",
    margin: "0 0 4px",
    lineHeight: 1.3,
  },
  cardLocation: { fontSize: "13px", color: "#60a5fa", margin: "0 0 14px" },

  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    background: "rgba(59,130,246,0.07)",
    borderRadius: "10px",
    padding: "10px 14px",
    marginBottom: "12px",
  },
  priceLabel: { fontSize: "11px", color: "#64748b", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.5px" },
  price:   { fontSize: "18px", fontWeight: 800, color: "#60a5fa" },
  deposit: { fontSize: "15px", fontWeight: 700, color: "#94a3b8" },

  metaRow: { display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" },

  amenities: {
    fontSize: "12px",
    color: "#64748b",
    margin: "0 0 8px",
    lineHeight: 1.5,
  },
  description: {
    fontSize: "13px",
    color: "#94a3b8",
    lineHeight: 1.6,
    margin: "0 0 12px",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  phoneRow: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" },
  phoneIcon: { fontSize: "14px" },
  phone: { fontSize: "14px", fontWeight: 600, color: "#e2e8f0" },

  // unchanged WhatsApp logic, only visual upgrade
  whatsappBtn: {
    width: "100%",
    padding: "11px",
    background: "linear-gradient(135deg,#128c4a,#25D366)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "14px",
    fontFamily: "inherit",
    transition: "transform 0.15s, box-shadow 0.2s",
    boxShadow: "0 4px 16px rgba(37,211,102,0.25)",
  },

  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyIcon:  { fontSize: "52px", marginBottom: "12px" },
  emptyTitle: { fontSize: "22px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 8px" },
  emptyText:  { color: "#64748b", marginBottom: "24px" },
};

/* ── Injected CSS classes ──────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');

  .lst-back {
    margin-top: 6px;
    padding: 7px 14px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: #94a3b8;
    font-size: 13px;
    cursor: pointer;
    white-space: nowrap;
    font-family: inherit;
    transition: background .2s;
  }
  .lst-back:hover { background: rgba(255,255,255,0.09); }

  .lst-filter-chip {
    display: inline-flex; align-items: center;
    padding: 5px 12px; border-radius: 999px; font-size: 12px;
    border: 1px solid rgba(59,130,246,0.3);
    background: rgba(59,130,246,0.08); color: #93c5fd;
    cursor: pointer; font-family: inherit; transition: background .2s;
  }
  .lst-filter-chip:hover { background: rgba(59,130,246,0.18); }

  .lst-clear {
    font-size: 12px; color: #ef4444; background: none;
    border: none; cursor: pointer; font-family: inherit;
    text-decoration: underline; padding: 0;
  }

  .lst-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; overflow: hidden;
    transition: transform .2s, border-color .2s, box-shadow .2s;
    animation: fadeUp .4s ease both;
  }
  .lst-card:hover {
    transform: translateY(-4px);
    border-color: rgba(59,130,246,0.35);
    box-shadow: 0 12px 32px rgba(0,0,0,0.35);
  }

  .lst-meta-pill {
    display: inline-block; font-size: 11px; padding: 3px 10px;
    border-radius: 999px; background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08); color: #94a3b8;
  }

  .lst-whatsapp:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(37,211,102,0.35) !important;
  }
  .lst-whatsapp:active { transform: scale(0.97); }

  .lst-btn {
    padding: 11px 28px; border-radius: 10px; border: none;
    background: linear-gradient(135deg,#1d4ed8,#6d28d9);
    color: #fff; font-weight: 700; font-size: 14px;
    cursor: pointer; font-family: inherit;
    box-shadow: 0 4px 20px rgba(59,130,246,0.35);
    transition: transform .15s;
  }
  .lst-btn:hover { transform: translateY(-2px); }

  .lst-spinner {
    width: 36px; height: 36px; border-radius: 50%;
    border: 3px solid rgba(59,130,246,0.15);
    border-top-color: #3b82f6;
    animation: spin .8s linear infinite;
    margin: 0 auto;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;