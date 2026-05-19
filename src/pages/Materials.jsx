import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

const COUNTIES = [
  "Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita Taveta",
  "Garissa","Wajir","Mandera","Marsabit","Isiolo","Meru","Tharaka Nithi",
  "Embu","Kitui","Machakos","Makueni","Nyandarua","Nyeri","Kirinyaga",
  "Murang'a","Kiambu","Turkana","West Pokot","Samburu","Trans Nzoia",
  "Uasin Gishu","Elgeyo Marakwet","Nandi","Baringo","Laikipia","Nakuru",
  "Narok","Kajiado","Kericho","Bomet","Kakamega","Vihiga","Bungoma",
  "Busia","Siaya","Kisumu","Homa Bay","Migori","Kisii","Nyamira","Nairobi City",
];

const CATEGORIES = [
  "Construction Materials","Furniture","Appliances","Electronics","Tools","Other",
];

const CONDITIONS = ["Like New","Good","Fair","Poor"];

export default function Materials() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    condition: searchParams.get("condition") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    county: searchParams.get("county") || "",
  });

  useEffect(() => { fetchMaterials(); }, [filters]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filters.search) query.append("search", filters.search);
      if (filters.category) query.append("category", filters.category);
      if (filters.condition) query.append("condition", filters.condition);
      if (filters.minPrice) query.append("minPrice", filters.minPrice);
      if (filters.maxPrice) query.append("maxPrice", filters.maxPrice);
      if (filters.county) query.append("county", filters.county);

      const res = await fetch(`${API_BASE}/materials?${query}`);
      const data = await res.json();
      setMaterials(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError("Failed to load materials");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Goes to seller login, NOT landlord login
  const handleSell = () => navigate("/seller-login");

  const formatPhone = (phone) => {
    if (!phone) return "";
    let cleaned = phone.toString().replace(/\D/g, "");
    if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
    if (cleaned.startsWith("254")) return cleaned;
    return "254" + cleaned;
  };

  const handleWhatsApp = (m) => {
    const phone = formatPhone(m.sellerPhone);
    const msg = `Hi ${m.sellerName}, I'm interested in your listing "${m.title}" on Axx Spaces for KES ${m.price?.toLocaleString()}. Is it still available?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleCall = (m) => window.open(`tel:${m.sellerPhone}`, "_blank");

  const openModal = (item) => { setSelected(item); setCurrentImage(0); };
  const closeModal = () => { setSelected(null); setCurrentImage(0); };

  return (
    <div style={styles.container}>
      <style>{css}</style>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🏗️ Materials Marketplace</h1>
          <p style={styles.subtitle}>Buy and sell construction materials, furniture, appliances & more</p>
        </div>
        <button onClick={handleSell} style={styles.uploadBtn}>
          ⬆️ Sell Materials
        </button>
      </div>

      {/* FILTERS */}
      <div style={styles.filterSection}>
        <input type="text" name="search" placeholder="🔍 Search materials..."
          value={filters.search} onChange={handleFilterChange} style={{ ...styles.filterSelect, gridColumn: "span 2" }} />
        <select name="category" value={filters.category} onChange={handleFilterChange} style={styles.filterSelect}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="condition" value={filters.condition} onChange={handleFilterChange} style={styles.filterSelect}>
          <option value="">All Conditions</option>
          {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="county" value={filters.county} onChange={handleFilterChange} style={styles.filterSelect}>
          <option value="">All Counties</option>
          {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="number" name="minPrice" placeholder="Min KES"
          value={filters.minPrice} onChange={handleFilterChange} style={styles.filterSelect} />
        <input type="number" name="maxPrice" placeholder="Max KES"
          value={filters.maxPrice} onChange={handleFilterChange} style={styles.filterSelect} />
      </div>

      <div style={styles.resultsCount}>
        Found {materials.length} {materials.length === 1 ? "item" : "items"}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <p style={styles.loading}>⏳ Loading materials...</p>
      ) : materials.length === 0 ? (
        <div style={styles.empty}>
          <p>No materials found. Try different filters.</p>
          <button onClick={handleSell} style={styles.uploadBtn}>Be the first to sell here!</button>
        </div>
      ) : (
        <div style={styles.grid}>
          {materials.map((m) => (
            <div key={m._id} style={styles.card} onClick={() => openModal(m)}>
              <div style={styles.imageContainer}>
                <img src={m.images?.[0] || "/placeholder.jpg"} alt={m.title} style={styles.image} />
                <span style={styles.conditionBadge}>{m.condition}</span>
                {m.images?.length > 1 && (
                  <span style={styles.imgCount}>📷 {m.images.length}</span>
                )}
              </div>
              <div style={styles.content}>
                <h3 style={styles.materialTitle}>{m.title}</h3>
                <p style={styles.location}>📍 {m.location}, {m.county}</p>
                <p style={styles.category}>🏷️ {m.category}</p>
                <p style={styles.price}>KES {Number(m.price).toLocaleString()}</p>
                <p style={styles.quantity}>Qty: {m.quantity}</p>
                <div style={styles.stats}>
                  <span>👁️ {m.views || 0}</span>
                  <span>💬 {m.inquiries || 0}</span>
                </div>
                <button style={styles.viewBtn} onClick={(e) => { e.stopPropagation(); openModal(m); }}>
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── MODAL ─── */}
      {selected && (
        <div style={styles.modal} onClick={closeModal}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={closeModal}>✕</button>

            <div style={styles.modalImgBox}>
              {selected.images?.length > 0 ? (
                <>
                  <img src={selected.images[currentImage]} alt={selected.title} style={styles.modalImg} />
                  {selected.images.length > 1 && (
                    <>
                      <button style={styles.prevBtn} onClick={() => setCurrentImage((p) => (p - 1 + selected.images.length) % selected.images.length)}>❮</button>
                      <button style={styles.nextBtn} onClick={() => setCurrentImage((p) => (p + 1) % selected.images.length)}>❯</button>
                      <div style={styles.imgCounter}>{currentImage + 1} / {selected.images.length}</div>
                    </>
                  )}
                </>
              ) : (
                <div style={styles.noImg}>📷 No Images</div>
              )}
            </div>

            {selected.images?.length > 1 && (
              <div style={styles.thumbs}>
                {selected.images.map((img, idx) => (
                  <img key={idx} src={img} alt={`thumb ${idx}`}
                    style={{ ...styles.thumb, ...(idx === currentImage ? styles.activeThumb : {}) }}
                    onClick={() => setCurrentImage(idx)} />
                ))}
              </div>
            )}

            <div style={styles.modalDetails}>
              <h2 style={styles.modalTitle}>{selected.title}</h2>
              <p style={styles.modalLocation}>📍 {selected.location}, {selected.county}</p>

              <div style={styles.badgeRow}>
                <span style={styles.conditionTag}>{selected.condition}</span>
                <span style={styles.categoryTag}>{selected.category}</span>
              </div>

              <div style={styles.priceBox}>
                <span style={styles.modalPrice}>KES {selected.price?.toLocaleString()}</span>
                <span style={styles.qtyTag}>Qty: {selected.quantity}</span>
              </div>

              <p style={styles.fullDesc}>{selected.description}</p>

              <div style={styles.sellerBox}>
                <h3 style={styles.sellerHead}>👤 Seller</h3>
                <p style={styles.sellerDetail}><strong>Name:</strong> {selected.sellerName}</p>
                <p style={styles.sellerDetail}><strong>Location:</strong> {selected.location}, {selected.county}</p>
              </div>

              <div style={styles.modalBtns}>
                <button style={styles.waBtn} onClick={() => handleWhatsApp(selected)}>
                  💬 WhatsApp Seller
                </button>
                <button style={styles.callBtn} onClick={() => handleCall(selected)}>
                  📞 Call Seller
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { background: "#06101f", minHeight: "100vh", padding: "20px", fontFamily: "'DM Sans', sans-serif", color: "#f1f5f9", maxWidth: "1200px", margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px", paddingBottom: "20px", borderBottom: "1px solid #334155", flexWrap: "wrap", gap: "12px" },
  title: { margin: 0, fontSize: "2rem", fontWeight: 800, color: "#fbbf24" },
  subtitle: { color: "#94a3b8", margin: "6px 0 0 0", fontSize: "0.95rem" },
  uploadBtn: { padding: "12px 24px", background: "linear-gradient(135deg, #fbbf24, #f59e0b)", color: "#0f1729", border: "none", borderRadius: "8px", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer" },
  filterSection: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "24px" },
  filterSelect: { padding: "11px 14px", background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", fontSize: "0.92rem" },
  resultsCount: { color: "#94a3b8", marginBottom: "20px", fontSize: "0.95rem" },
  error: { background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#fca5a5", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px" },
  loading: { textAlign: "center", color: "#94a3b8", padding: "60px" },
  empty: { textAlign: "center", color: "#94a3b8", padding: "60px 20px", background: "rgba(30,41,59,0.5)", borderRadius: "12px", border: "2px dashed #475569" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" },
  card: { background: "linear-gradient(135deg, #1e293b, #0f1729)", border: "1px solid #334155", borderRadius: "12px", overflow: "hidden", cursor: "pointer", transition: "all 0.3s" },
  imageContainer: { position: "relative", height: "170px", overflow: "hidden", background: "#0f1729" },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  conditionBadge: { position: "absolute", top: "10px", right: "10px", background: "#3b82f6", color: "white", padding: "4px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700 },
  imgCount: { position: "absolute", bottom: "10px", right: "10px", background: "rgba(0,0,0,0.6)", color: "white", padding: "3px 8px", borderRadius: "6px", fontSize: "0.75rem" },
  content: { padding: "14px" },
  materialTitle: { margin: "0 0 4px 0", fontSize: "1rem", fontWeight: 700, color: "#f1f5f9" },
  location: { margin: "0 0 3px 0", fontSize: "0.82rem", color: "#94a3b8" },
  category: { margin: "0 0 6px 0", fontSize: "0.82rem", color: "#94a3b8" },
  price: { margin: "6px 0 3px 0", fontSize: "1.1rem", fontWeight: 700, color: "#fbbf24" },
  quantity: { margin: "0 0 6px 0", fontSize: "0.82rem", color: "#94a3b8" },
  stats: { display: "flex", gap: "10px", fontSize: "0.78rem", color: "#cbd5e1", marginBottom: "10px" },
  viewBtn: { width: "100%", padding: "9px", background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.88rem", fontWeight: 600 },
  modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" },
  modalBox: { background: "linear-gradient(135deg, #1e293b, #0f1729)", borderRadius: "12px", maxWidth: "580px", width: "100%", maxHeight: "90vh", overflowY: "auto", border: "1px solid #334155", position: "relative" },
  closeBtn: { position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.6)", border: "none", color: "white", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontSize: "1.2rem", zIndex: 1001 },
  modalImgBox: { position: "relative", width: "100%", height: "300px", overflow: "hidden", background: "#0f1729" },
  modalImg: { width: "100%", height: "100%", objectFit: "cover" },
  imgCounter: { position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.6)", color: "white", padding: "4px 12px", borderRadius: "12px", fontSize: "0.85rem" },
  prevBtn: { position: "absolute", top: "50%", left: "12px", transform: "translateY(-50%)", background: "rgba(0,0,0,0.6)", border: "none", color: "white", width: "40px", height: "40px", borderRadius: "50%", cursor: "pointer", fontSize: "1.2rem" },
  nextBtn: { position: "absolute", top: "50%", right: "12px", transform: "translateY(-50%)", background: "rgba(0,0,0,0.6)", border: "none", color: "white", width: "40px", height: "40px", borderRadius: "50%", cursor: "pointer", fontSize: "1.2rem" },
  thumbs: { display: "flex", gap: "8px", padding: "10px", overflowX: "auto", background: "#0f1729" },
  thumb: { width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px", cursor: "pointer", opacity: 0.6, border: "2px solid transparent", flexShrink: 0 },
  activeThumb: { opacity: 1, borderColor: "#fbbf24" },
  noImg: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontWeight: 600 },
  modalDetails: { padding: "20px" },
  modalTitle: { fontSize: "1.4rem", margin: "0 0 6px 0", color: "#fbbf24" },
  modalLocation: { color: "#94a3b8", marginBottom: "14px" },
  badgeRow: { display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" },
  conditionTag: { background: "rgba(59,130,246,0.2)", color: "#93c5fd", padding: "5px 12px", borderRadius: "12px", fontSize: "0.82rem", fontWeight: 700 },
  categoryTag: { background: "rgba(139,92,246,0.2)", color: "#c4b5fd", padding: "5px 12px", borderRadius: "12px", fontSize: "0.82rem", fontWeight: 600 },
  priceBox: { display: "flex", alignItems: "center", gap: "16px", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: "8px", padding: "14px", marginBottom: "14px" },
  modalPrice: { color: "#fbbf24", fontSize: "1.6rem", fontWeight: 700 },
  qtyTag: { color: "#94a3b8", fontSize: "0.88rem" },
  fullDesc: { color: "#cbd5e1", lineHeight: "1.6", margin: "0 0 16px 0" },
  sellerBox: { background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "8px", padding: "14px", marginBottom: "16px" },
  sellerHead: { margin: "0 0 10px 0", color: "#a78bfa", fontSize: "1rem" },
  sellerDetail: { color: "#cbd5e1", margin: "5px 0", fontSize: "0.9rem" },
  modalBtns: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  waBtn: { padding: "13px", background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.95rem" },
  callBtn: { padding: "13px", background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.95rem" },
};

const css = `
  * { box-sizing: border-box; }
  button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59,130,246,0.3); }
  input:focus, select:focus { outline: none; border-color: #fbbf24 !important; box-shadow: 0 0 0 3px rgba(251,191,36,0.1) !important; }
  @media (max-width: 768px) {
    [style*="gridTemplateColumns: repeat(auto-fill, minmax(240px"] { grid-template-columns: 1fr !important; }
  }
`;