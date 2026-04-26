import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";
import MapView from "../components/MapView";

/* ══════════════════════════════════════════════════════════════════
   ✅ NEW — Image Gallery Component (Swipeable)
══════════════════════════════════════════════════════════════════ */
function ImageGallery({ images, title, onOpenModal }) {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div style={styles.imagePlaceholder} onClick={onOpenModal}>
        <span style={{ fontSize: 36 }}>🏠</span>
      </div>
    );
  }

  const nextImg = (e) => {
    e.stopPropagation();
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const prevImg = (e) => {
    e.stopPropagation();
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div style={styles.imageWrap}>
      <img
        src={images[current]}
        alt={title}
        style={{ ...styles.image, cursor: "pointer" }}
        onClick={onOpenModal}
      />
      
      {images.length > 1 && (
        <>
          <button onClick={prevImg} className="lst-gallery-nav left">‹</button>
          <button onClick={nextImg} className="lst-gallery-nav right">›</button>
          <div className="lst-gallery-dots">
            {current + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   ✅ UPDATED — Property Detail Modal (Supports Multiple Images)
══════════════════════════════════════════════════════════════════ */
function PropertyModal({ property: p, onClose, onWhatsApp, isFav, onToggleFav }) {
  if (!p) return null;
  return (
    <div style={modal.overlay} onClick={onClose}>
      <div style={modal.box} onClick={(e) => e.stopPropagation()}>
        <button style={modal.closeBtn} onClick={onClose}>✕</button>

        <ImageGallery images={p.images} title={p.title} />

        <div style={modal.body}>
          <div style={modal.topRow}>
            <h2 style={modal.title}>{p.title}</h2>
            <button
              style={{ ...modal.favBtn, color: isFav ? "#f43f5e" : "#64748b" }}
              onClick={() => onToggleFav(p._id)}
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
            {p.type && <span className="lst-meta-pill">🏗 {p.type}</span>}
            {p.bedrooms && <span className="lst-meta-pill">🛏 {p.bedrooms} Bed</span>}
          </div>

          {p.description && (
            <div style={modal.section}>
              <div style={modal.sectionLabel}>Description</div>
              <p style={modal.desc}>{p.description}</p>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button className="lst-whatsapp-btn" onClick={() => onWhatsApp(p.phone, p.title)}>
              💬 WhatsApp Landlord
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function Listings() {
  const [properties, setProperties]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedProperty, setSelected] = useState(null);
  const [favourites, setFavourites]     = useState(() => {
    try { return JSON.parse(localStorage.getItem("axx_favourites") || "[]"); }
    catch { return []; }
  });
  const [inlineFilters, setInlineFilters] = useState({
    search: "", minPrice: "", maxPrice: "", sortBy: "newest",
  });
  const [showFavsOnly, setShowFavsOnly] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, [location.search]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      // ✅ Now calling your updated /approved endpoint
      const res = await API.get(`/properties/approved${location.search}`);
      setProperties(res.data);
    } catch (err) {
      console.log("FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (phone, title) => {
    const cleanPhone = phone.replace(/\s+/g, "");
    const message = `Hello, I am interested in your property on AXX Spaces: ${title}`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const toggleFavourite = useCallback((id) => {
    setFavourites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("axx_favourites", JSON.stringify(next));
      return next;
    });
  }, []);

  const filtered = properties
    .filter((p) => {
      if (showFavsOnly && !favourites.includes(p._id)) return false;
      if (inlineFilters.search) {
        const q = inlineFilters.search.toLowerCase();
        return (p.title?.toLowerCase().includes(q) || p.area?.toLowerCase().includes(q));
      }
      if (inlineFilters.minPrice && p.price < Number(inlineFilters.minPrice)) return false;
      if (inlineFilters.maxPrice && p.price > Number(inlineFilters.maxPrice)) return false;
      return true;
    })
    .sort((a, b) => {
      if (inlineFilters.sortBy === "price_asc") return a.price - b.price;
      if (inlineFilters.sortBy === "price_desc") return b.price - a.price;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setSelected(null)}
          onWhatsApp={openWhatsApp}
          isFav={favourites.includes(selectedProperty._id)}
          onToggleFav={toggleFavourite}
        />
      )}

      <div style={styles.header}>
        <button className="lst-back" onClick={() => navigate("/")}>← Back</button>
        <div>
          <h1 style={styles.pageTitle}>🏠 AXX Listings</h1>
          <p style={styles.pageSubtitle}>{filtered.length} Properties Found</p>
        </div>
      </div>

      <div style={styles.searchBar}>
        <input
          className="lst-search-input"
          placeholder="🔍 Search Area or Title..."
          value={inlineFilters.search}
          onChange={(e) => setInlineFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <select
          className="lst-sort-select"
          value={inlineFilters.sortBy}
          onChange={(e) => setInlineFilters((f) => ({ ...f, sortBy: e.target.value }))}
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      <div style={styles.grid}>
        {filtered.map((p) => (
          <div key={p._id} className="lst-card">
            {/* ✅ NEW — Swipeable Gallery on Card */}
            <ImageGallery 
              images={p.images} 
              title={p.title} 
              onOpenModal={() => setSelected(p)} 
            />

            <div style={styles.cardBody}>
              <h3 style={styles.cardTitle} onClick={() => setSelected(p)}>{p.title}</h3>
              <p style={styles.cardLocation}>📍 {p.area}, {p.county}</p>

              <div style={styles.priceRow}>
                <div style={styles.price}>Ksh {Number(p.price).toLocaleString()}</div>
                <div style={styles.deposit}>Dep: {Number(p.deposit).toLocaleString()}</div>
              </div>

              <div style={styles.actionRow}>
                <button onClick={() => openWhatsApp(p.phone, p.title)} style={styles.whatsappBtn}>
                  💬 WhatsApp
                </button>
                <button className="lst-view-btn" onClick={() => setSelected(p)}>Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   STYLES & CSS
══════════════════════════════════════════════════════════════════ */
const styles = {
  root: { background: "#06101f", color: "#e2e8f0", minHeight: "100vh", padding: "20px", maxWidth: "1200px", margin: "0 auto" },
  header: { display: "flex", gap: "20px", marginBottom: "30px" },
  pageTitle: { fontSize: "28px", margin: 0 },
  pageSubtitle: { color: "#64748b" },
  searchBar: { display: "flex", gap: "10px", marginBottom: "20px", background: "#0d1b2e", padding: "15px", borderRadius: "12px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" },
  imageWrap: { position: "relative", height: "200px", overflow: "hidden", borderRadius: "12px 12px 0 0" },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  imagePlaceholder: { height: "200px", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" },
  cardBody: { padding: "15px", background: "#0d1b2e", borderRadius: "0 0 12px 12px" },
  cardTitle: { fontSize: "16px", fontWeight: 700, margin: "0 0 5px", cursor: "pointer" },
  cardLocation: { fontSize: "13px", color: "#60a5fa", marginBottom: "15px" },
  priceRow: { display: "flex", justifyContent: "space-between", marginBottom: "15px", borderBottom: "1px solid #1e293b", pb: "10px" },
  price: { fontSize: "18px", fontWeight: 800, color: "#34d399" },
  deposit: { fontSize: "14px", color: "#94a3b8" },
  actionRow: { display: "flex", gap: "10px" },
  whatsappBtn: { flex: 2, padding: "10px", background: "#25D366", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" },
};

const modal = {
  overlay: { position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
  box: { background: "#06101f", borderRadius: "20px", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto", position: "relative" },
  closeBtn: { position: "absolute", top: "15px", right: "15px", zIndex: 11, background: "#fff", border: "none", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer" },
  body: { padding: "20px" },
  title: { fontSize: "22px", margin: 0 },
  location: { color: "#60a5fa" },
  priceRow: { display: "flex", justifyContent: "space-between", background: "#0d1b2e", padding: "15px", borderRadius: "10px", margin: "15px 0" },
  price: { fontSize: "24px", color: "#34d399", fontWeight: 800 },
};

const css = `
  .lst-gallery-nav {
    position: absolute; top: 50%; transform: translateY(-50%);
    background: rgba(0,0,0,0.5); color: white; border: none;
    width: 30px; height: 30px; border-radius: 50%; cursor: pointer;
    font-size: 20px; display: flex; alignItems: center; justifyContent: center;
  }
  .lst-gallery-nav.left { left: 10px; }
  .lst-gallery-nav.right { right: 10px; }
  .lst-gallery-dots {
    position: absolute; bottom: 10px; right: 10px;
    background: rgba(0,0,0,0.7); color: white;
    padding: 2px 8px; borderRadius: 10px; font-size: 11px;
  }
  .lst-card:hover { transform: translateY(-5px); transition: 0.3s; }
  .lst-view-btn { flex: 1; background: #1e293b; color: white; border: 1px solid #334155; border-radius: 8px; cursor: pointer; }
  .lst-search-input { flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #334155; background: #1a1a1a; color: white; }
`;