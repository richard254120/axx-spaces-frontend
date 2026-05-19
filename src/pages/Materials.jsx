import { useState, useEffect, useRef } from "react";
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
  const [searchParams, setSearchParams] = useSearchParams();

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  
  // New visual state tracking
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("fav_materials");
    return saved ? JSON.parse(saved) : [];
  });
  const [copiedId, setCopiedId] = useState(null);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    condition: searchParams.get("condition") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    county: searchParams.get("county") || "",
  });

  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceTimer = useRef(null);

  // Synchronize favorites with client storage
  useEffect(() => {
    localStorage.setItem("fav_materials", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params[key] = val;
    });
    setSearchParams(params, { replace: true });
    fetchMaterials();
  }, [filters]);

  useEffect(() => {
    if (searchInput === filters.search) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    debounceTimer.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
    }, 400);

    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [searchInput]);

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
      query.append("_cb", Date.now());

      const res = await fetch(`${API_BASE}/materials?${query}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        const approvedItems = data.filter(item => item.status === "approved");
        setMaterials(approvedItems);
      } else {
        setMaterials([]);
      }
      setError("");
    } catch (err) {
      setError("Failed to load materials");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setFilters({
      search: "",
      category: "",
      condition: "",
      minPrice: "",
      maxPrice: "",
      county: "",
    });
  };

  const handleToggleFavorite = (e, id) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };

  const handleShareListing = (e, m) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?search=${encodeURIComponent(m.title)}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(m._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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

  const hasActiveFilters = Object.values(filters).some(val => val !== "");

  return (
    <div style={styles.container}>
      <style>{css}</style>

      {/* HERO BANNER SECTION */}
      <div style={styles.heroSection}>
        <div style={{ maxWidth: "650px" }}>
          <span style={styles.taglineBadge}>🔥 Verified Local Deals</span>
          <h1 style={styles.heroTitle}>Smart Sourcing for Materials</h1>
          <p style={styles.heroSubtitle}>Connect directly with local verified sellers. Save costs on construction materials, overstock furniture, tools, and heavy appliances.</p>
        </div>
        <button onClick={handleSell} style={styles.heroUploadBtn}>
          <span style={{ fontSize: "1.2rem", marginRight: "6px" }}>💵</span> Sell a Material
        </button>
      </div>

      {/* FILTER BAR CONTAINER */}
      <div style={styles.glassFilterContainer}>
        <h3 style={styles.filterBarTitle}>🔍 Filter & Refine Search</h3>
        <div style={styles.filterSection}>
          <input 
            type="text" 
            name="search" 
            placeholder="What materials are you looking for today?"
            value={searchInput} 
            onChange={(e) => setSearchInput(e.target.value)} 
            style={{ ...styles.filterSelect, gridColumn: "span 2" }} 
          />
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
          <input type="number" name="minPrice" placeholder="Min Price (KES)" value={filters.minPrice} onChange={handleFilterChange} style={styles.filterSelect} />
          <input type="number" name="maxPrice" placeholder="Max Price (KES)" value={filters.maxPrice} onChange={handleFilterChange} style={styles.filterSelect} />
        </div>
      </div>

      <div style={styles.resultsRow}>
        <div style={styles.resultsCount}>
          Displaying <strong style={{ color: "#fbbf24" }}>{materials.length}</strong> active marketplace opportunities
        </div>
        {hasActiveFilters && (
          <button onClick={handleResetFilters} style={styles.resetBtn}>
            🔄 Reset Filters
          </button>
        )}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px" }}>
          <div className="spinner"></div>
          <p style={{ color: "#94a3b8", marginTop: "14px" }}>Scanning marketplace catalogs...</p>
        </div>
      ) : materials.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: "3rem", marginBottom: "10px" }}>📦</div>
          <h3>No matching stock inventory discovered</h3>
          <p>Sellers haven't uploaded items matching those parameters yet. Try broadening your criteria filters.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "20px" }}>
            {hasActiveFilters && <button onClick={handleResetFilters} style={styles.resetBtnSecondary}>Clear All Filters</button>}
            <button onClick={handleSell} style={styles.uploadBtn}>Post a Listing Here</button>
          </div>
        </div>
      ) : (
        <div style={styles.grid}>
          {materials.map((m) => {
            const isFavorite = favorites.includes(m._id);
            const isLowStock = m.quantity && m.quantity <= 3;
            const isNewlyAdded = m.createdAt && (Date.now() - new Date(m.createdAt).getTime() < 172800000); // 48 hours

            return (
              <div key={m._id} className="material-card" style={styles.card} onClick={() => openModal(m)}>
                <div style={styles.imageContainer}>
                  <img src={m.images?.[0] || "/placeholder.jpg"} alt={m.title} style={styles.image} className="card-zoom-img" />
                  
                  {/* SYSTEM BADGES */}
                  <div style={styles.badgeStack}>
                    <span style={styles.conditionBadge}>{m.condition}</span>
                    {isLowStock && <span style={styles.urgencyBadge}>⚠️ Only {m.quantity} Left</span>}
                    {isNewlyAdded && <span style={styles.newBadge}>✨ Just Added</span>}
                  </div>

                  {/* INTERACTIVE COMPONENT TRIPS */}
                  <button style={{ ...styles.favCircle, color: isFavorite ? "#ef4444" : "#94a3b8" }} onClick={(e) => handleToggleFavorite(e, m._id)}>
                    ❤️
                  </button>

                  <button style={styles.shareCircle} onClick={(e) => handleShareListing(e, m)}>
                    {copiedId === m._id ? "✅" : "🔗"}
                  </button>

                  {m.images?.length > 1 && (
                    <span style={styles.imgCount}>📷 {m.images.length} Photos</span>
                  )}
                </div>

                <div style={styles.content}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <h3 style={styles.materialTitle}>{m.title}</h3>
                  </div>
                  <p style={styles.location}>📍 {m.location}, {m.county}</p>
                  
                  <div style={styles.priceContainer}>
                    <p style={styles.price}>KES {Number(m.price).toLocaleString()}</p>
                    <span style={styles.verifiedDealTag}>✓ Best Deal</span>
                  </div>

                  <div style={styles.infoRowGrid}>
                    <div>
                      <span style={{ color: "#64748b" }}>Category:</span>
                      <p style={styles.infoRowText}>{m.category}</p>
                    </div>
                    <div>
                      <span style={{ color: "#64748b" }}>Stock Available:</span>
                      <p style={styles.infoRowText}>{m.quantity} pieces</p>
                    </div>
                  </div>

                  <div style={styles.stats}>
                    <span>👁️ {m.views || 4} buyer views</span>
                    <span>🔥 High Demand</span>
                  </div>

                  <button style={styles.viewBtn} onClick={(e) => { e.stopPropagation(); openModal(m); }}>
                    Check Availability Details
                  </button>
                </div>
              </div>
            );
          })}
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
                <div style={styles.noImg}>📷 No Media Uploaded</div>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={styles.guaranteeTag}>🛡️ Verified Marketplace Listing</span>
                <button style={styles.modalShareLinkBtn} onClick={(e) => handleShareListing(e, selected)}>
                  {copiedId === selected._id ? "Copied Link!" : "🔗 Share Listing"}
                </button>
              </div>
              
              <h2 style={styles.modalTitle}>{selected.title}</h2>
              <p style={styles.modalLocation}>📍 Item Location: {selected.location}, {selected.county} County</p>

              <div style={styles.badgeRow}>
                <span style={styles.conditionTag}>Condition: {selected.condition}</span>
                <span style={styles.categoryTag}>{selected.category}</span>
                {selected.quantity <= 3 && <span style={styles.modalUrgentTag}>⚠️ Running Out Fast</span>}
              </div>

              <div style={styles.priceBox}>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block" }}>TOTAL TRANSACTION PRICE</span>
                  <span style={styles.modalPrice}>KES {selected.price?.toLocaleString()}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block" }}>AVAILABLE STOCK</span>
                  <span style={styles.qtyTag}>{selected.quantity} units</span>
                </div>
              </div>

              <h4 style={{ margin: "16px 0 6px 0", color: "#f1f5f9" }}>Item Description</h4>
              <p style={styles.fullDesc}>{selected.description}</p>

              <div style={styles.sellerBox}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <h3 style={styles.sellerHead}>👤 Registered Marketplace Supplier</h3>
                  <span style={styles.sellerBadgeVerified}>✓ Background Verified</span>
                </div>
                <p style={styles.sellerDetail}><strong>Supplier Contact Name:</strong> {selected.sellerName}</p>
                <p style={styles.sellerDetail}><strong>Primary Dispatch Route:</strong> {selected.location}, {selected.county}</p>
                <p style={{ ...styles.sellerDetail, fontSize: "0.8rem", color: "#fbbf24", marginTop: "8px" }}>
                  💡 Secure Payment Advice: Inspect materials physically at delivery before completing mobile transactions.
                </p>
              </div>

              <div style={styles.modalBtns}>
                <button style={styles.waBtn} onClick={() => handleWhatsApp(selected)}>
                  💬 Chat on WhatsApp Now
                </button>
                <button style={styles.callBtn} onClick={() => handleCall(selected)}>
                  📞 Place Direct Call
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
  container: { background: "#060b13", minHeight: "100vh", padding: "20px", fontFamily: "'DM Sans', sans-serif", color: "#f1f5f9", maxWidth: "1200px", margin: "0 auto" },
  heroSection: { background: "linear-gradient(145deg, #0f1c30 0%, #08111e 100%)", borderRadius: "16px", padding: "35px", marginBottom: "30px", border: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px" },
  taglineBadge: { background: "rgba(251,191,36,0.1)", color: "#fbbf24", padding: "6px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", display: "inline-block", marginBottom: "12px" },
  heroTitle: { margin: 0, fontSize: "2.4rem", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.5px" },
  heroSubtitle: { color: "#94a3b8", margin: "10px 0 0 0", fontSize: "1.05rem", lineHeight: "1.5" },
  heroUploadBtn: { padding: "14px 28px", background: "linear-gradient(135deg, #fbbf24, #d97706)", color: "#000000", border: "none", borderRadius: "10px", fontSize: "1rem", fontWeight: 800, cursor: "pointer", transition: "all 0.2s" },
  glassFilterContainer: { background: "rgba(15, 28, 48, 0.4)", backdropFilter: "blur(10px)", border: "1px solid #1e293b", borderRadius: "14px", padding: "20px", marginBottom: "25px" },
  filterBarTitle: { margin: "0 0 14px 0", fontSize: "1rem", fontWeight: 700, color: "#94a3b8" },
  filterSection: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" },
  filterSelect: { padding: "12px 14px", background: "#09111e", border: "1px solid #1e293b", borderRadius: "8px", color: "#f1f5f9", fontSize: "0.92rem" },
  resultsRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  resultsCount: { color: "#94a3b8", fontSize: "0.95rem" },
  resetBtn: { background: "none", border: "none", color: "#fbbf24", cursor: "pointer", fontSize: "0.95rem", fontWeight: 700 },
  resetBtnSecondary: { background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", padding: "12px 20px", cursor: "pointer", fontWeight: 600 },
  uploadBtn: { padding: "12px 24px", background: "#fbbf24", color: "#0f1729", border: "none", borderRadius: "8px", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer" },
  error: { background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#fca5a5", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px" },
  empty: { textAlign: "center", color: "#94a3b8", padding: "50px 20px", background: "#0f1c30", borderRadius: "14px", border: "1px solid #1e293b" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" },
  card: { background: "#0f1c30", border: "1px solid #1e293b", borderRadius: "14px", overflow: "hidden", cursor: "pointer", position: "relative" },
  imageContainer: { position: "relative", height: "190px", overflow: "hidden", background: "#060b13" },
  image: { width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" },
  badgeStack: { position: "absolute", top: "12px", left: "12px", display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-start", zIndex: 5 },
  conditionBadge: { background: "#2563eb", color: "#ffffff", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 800 },
  urgencyBadge: { background: "#dc2626", color: "#ffffff", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 800, border: "1px solid rgba(255,255,255,0.2)" },
  newBadge: { background: "#10b981", color: "#ffffff", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 800 },
  favCircle: { position: "absolute", top: "12px", right: "12px", width: "34px", height: "34px", borderRadius: "50%", background: "rgba(15,28,48,0.8)", border: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 5, fontSize: "0.95rem", padding: 0 },
  shareCircle: { position: "absolute", top: "52px", right: "12px", width: "34px", height: "34px", borderRadius: "50%", background: "rgba(15,28,48,0.8)", border: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 5, fontSize: "0.95rem", padding: 0 },
  imgCount: { position: "absolute", bottom: "12px", right: "12px", background: "rgba(6,11,19,0.8)", color: "#94a3b8", padding: "4px 8px", borderRadius: "6px", fontSize: "0.72rem", border: "1px solid #1e293b" },
  content: { padding: "16px" },
  materialTitle: { margin: "0 0 4px 0", fontSize: "1.1rem", fontWeight: 700, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  location: { margin: "0 0 10px 0", fontSize: "0.85rem", color: "#94a3b8" },
  priceContainer: { display: "flex", justifyContent: "space-between", alignItems: "center", margin: "12px 0" },
  price: { margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "#fbbf24" },
  verifiedDealTag: { fontSize: "0.72rem", background: "rgba(16,185,129,0.15)", color: "#34d399", padding: "3px 8px", borderRadius: "4px", fontWeight: 700 },
  infoRowGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", background: "#08111e", padding: "10px", borderRadius: "8px", margin: "10px 0", fontSize: "0.8rem" },
  infoRowText: { margin: "2px 0 0 0", fontWeight: 700, color: "#e2e8f0" },
  stats: { display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "#64748b", marginBottom: "14px", borderTop: "1px solid #1e293b", paddingTop: "10px" },
  viewBtn: { width: "100%", padding: "11px", background: "linear-gradient(135deg, #1e3a8a, #2563eb)", color: "#ffffff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.88rem", fontWeight: 700 },
  modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(3,7,18,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" },
  modalBox: { background: "#0f1c30", borderRadius: "16px", maxWidth: "600px", width: "100%", maxHeight: "92vh", overflowY: "auto", border: "1px solid #1e293b", position: "relative" },
  closeBtn: { position: "absolute", top: "14px", right: "14px", background: "#060b13", border: "1px solid #1e293b", color: "#ffffff", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", fontSize: "1.1rem", zIndex: 1001 },
  modalImgBox: { position: "relative", width: "100%", height: "340px", overflow: "hidden", background: "#060b13" },
  modalImg: { width: "100%", height: "100%", objectFit: "cover" },
  imgCounter: { position: "absolute", bottom: "14px", left: "50%", transform: "translateX(-50%)", background: "rgba(6,11,19,0.8)", color: "#ffffff", padding: "4px 14px", borderRadius: "20px", fontSize: "0.82rem", border: "1px solid #1e293b" },
  prevBtn: { position: "absolute", top: "50%", left: "14px", transform: "translateY(-50%)", background: "rgba(6,11,19,0.8)", border: "none", color: "white", width: "42px", height: "42px", borderRadius: "50%", cursor: "pointer", fontSize: "1.2rem" },
  nextBtn: { position: "absolute", top: "50%", right: "14px", transform: "translateY(-50%)", background: "rgba(6,11,19,0.8)", border: "none", color: "white", width: "42px", height: "42px", borderRadius: "50%", cursor: "pointer", fontSize: "1.2rem" },
  thumbs: { display: "flex", gap: "8px", padding: "12px", overflowX: "auto", background: "#08111e", borderBottom: "1px solid #1e293b" },
  thumb: { width: "64px", height: "64px", objectFit: "cover", borderRadius: "8px", cursor: "pointer", opacity: 0.5, border: "2px solid transparent", flexShrink: 0 },
  activeThumb: { opacity: 1, borderColor: "#fbbf24" },
  noImg: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontWeight: 600 },
  modalDetails: { padding: "24px" },
  guaranteeTag: { fontSize: "0.75rem", color: "#34d399", fontWeight: 700, textTransform: "uppercase" },
  modalShareLinkBtn: { background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 },
  modalTitle: { fontSize: "1.6rem", margin: "6px 0 4px 0", color: "#ffffff", fontWeight: 800 },
  modalLocation: { color: "#94a3b8", margin: "0 0 16px 0", fontSize: "0.92rem" },
  badgeRow: { display: "flex", gap: "8px", marginBottom: "18px", flexWrap: "wrap" },
  conditionTag: { background: "rgba(37,99,235,0.15)", color: "#93c5fd", padding: "6px 14px", borderRadius: "8px", fontSize: "0.82rem", fontWeight: 700 },
  categoryTag: { background: "rgba(124,58,237,0.15)", color: "#c4b5fd", padding: "6px 14px", borderRadius: "8px", fontSize: "0.82rem", fontWeight: 700 },
  modalUrgentTag: { background: "rgba(220,38,38,0.15)", color: "#fca5a5", padding: "6px 14px", borderRadius: "8px", fontSize: "0.82rem", fontWeight: 700 },
  priceBox: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: "10px", padding: "16px", marginBottom: "18px" },
  modalPrice: { color: "#fbbf24", fontSize: "1.8rem", fontWeight: 900 },
  qtyTag: { color: "#ffffff", fontSize: "1.3rem", fontWeight: 800 },
  fullDesc: { color: "#cbd5e1", lineHeight: "1.6", margin: "0 0 20px 0", fontSize: "0.95rem" },
  sellerBox: { background: "#08111e", border: "1px solid #1e293b", borderRadius: "10px", padding: "16px", marginBottom: "20px" },
  sellerHead: { margin: 0, color: "#ffffff", fontSize: "0.95rem", fontWeight: 700 },
  sellerBadgeVerified: { fontSize: "0.7rem", background: "#047857", color: "#ffffff", padding: "3px 8px", borderRadius: "4px", fontWeight: 700 },
  sellerDetail: { color: "#94a3b8", margin: "6px 0 0 0", fontSize: "0.9rem" },
  modalBtns: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  waBtn: { padding: "14px", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem", display: "flex", alignItems: "center", justifyContent: "center" },
  callBtn: { padding: "14px", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem", display: "flex", alignItems: "center", justifyContent: "center" },
};

const css = `
  * { box-sizing: border-box; }
  button { transition: all 0.2s ease; }
  button:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
  button:active { transform: translateY(0); }
  input:focus, select:focus { outline: none; border-color: #fbbf24 !important; box-shadow: 0 0 0 3px rgba(251,191,36,0.1) !important; }
  
  .material-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
  .material-card:hover { transform: translateY(-6px); border-color: #fbbf24 !important; box-shadow: 0 16px 32px rgba(0,0,0,0.4); }
  .material-card:hover .card-zoom-img { transform: scale(1.06); }
  
  .spinner { width: 32px; height: 32px; border: 3px solid rgba(251,191,36,0.1); border-top-color: #fbbf24; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Custom visual styling overrides for scrollbars in slide feeds */
  ::-webkit-scrollbar { height: 6px; width: 6px; }
  ::-webkit-scrollbar-track { background: #060b13; }
  ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
  
  @media (max-width: 768px) {
    [style*="gridTemplateColumns: repeat(auto-fill, minmax(260px"] { grid-template-columns: 1fr !important; }
    .modalBtns { grid-template-columns: 1fr !important; gap: 10px !important; }
  }
`;