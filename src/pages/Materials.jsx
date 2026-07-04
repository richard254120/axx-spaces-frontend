import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

const COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta",
  "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka Nithi",
  "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga",
  "Murang'a", "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans Nzoia",
  "Uasin Gishu", "Elgeyo Marakwet", "Nandi", "Baringo", "Laikipia", "Nakuru",
  "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma",
  "Busia", "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi City",
];

const CATEGORIES = [
  "Furniture", "Electronics", "Appliances", "Tools", "Clothing", "Books",
  "Sports & Outdoors", "Home & Garden", "Beauty & Personal Care", "Toys & Games",
  "Construction Materials", "Vehicles & Parts", "Other",
];

const CONDITIONS = ["Like New", "Excellent", "Good", "Fair", "For Parts"];

export default function QuickSAles() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token, user } = useContext(AuthContext);

  // Check for seller authentication
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    const sellerToken = localStorage.getItem("sellerToken");
    setIsSeller(!!sellerToken);
  }, []);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("fav_quicksales");
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

  useEffect(() => {
    localStorage.setItem("fav_quicksales", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params[key] = val;
    });
    setSearchParams(params, { replace: true });
    fetchItems();
  }, [filters]);

  useEffect(() => {
    if (searchInput === filters.search) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
    }, 400);

    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [searchInput]);

  // Handle material query parameter to select specific material
  useEffect(() => {
    const materialId = searchParams.get('material');
    if (materialId && items.length > 0) {
      const item = items.find(i => i._id === materialId);
      if (item) {
        setSelected(item);
        setCurrentImage(0);
        // Scroll to item details
        setTimeout(() => {
          const itemDetails = document.getElementById('item-details');
          if (itemDetails) {
            itemDetails.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  }, [searchParams, items]);

  const fetchItems = async () => {
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
        const approvedItems = data.filter(item => item.status === "active");
        setItems(approvedItems);
      } else {
        setItems([]);
      }
      setError("");
    } catch (err) {
      setError("Failed to load QuickSAles items");
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

  const handleShareListing = (e, item) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?search=${encodeURIComponent(item.title)}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(item._id);
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

  const handleWhatsApp = (item) => {
    const phone = formatPhone(item.sellerPhone);
    const msg = `Hi ${item.sellerName}, I'm interested in your listing "${item.title}" on Axxspace for KES ${item.price?.toLocaleString()}. Is it still available?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleCall = (item) => window.open(`tel:${item.sellerPhone}`, "_blank");
  const openModal = (item) => { setSelected(item); setCurrentImage(0); };
  const closeModal = () => { setSelected(null); setCurrentImage(0); };

  const hasActiveFilters = Object.values(filters).some(val => val !== "");

  const getCategoryEmoji = (category) => {
    const emojiMap = {
      "Furniture": "🪑",
      "Electronics": "📱",
      "Appliances": "🍳",
      "Tools": "🔧",
      "Clothing": "👕",
      "Books": "📚",
      "Sports & Outdoors": "⛰️",
      "Home & Garden": "🏡",
      "Beauty & Personal Care": "💄",
      "Toys & Games": "🎮",
      "Construction Materials": "🏗️",
      "Vehicles & Parts": "🚗",
      "Other": "📦",
    };
    return emojiMap[category] || "📦";
  };

  return (
    <div style={styles.container}>
      <style>{css}</style>

      {/* HERO BANNER */}
      <div style={styles.heroSection}>
        <div style={{ maxWidth: "700px" }}>
          <span style={styles.taglineBadge}>✨ Pre-Loved & New Items</span>
          <h1 style={styles.heroTitle}>Smart Shopping, Smarter Prices</h1>
          <p style={styles.heroSubtitle}>Discover quality second-hand items, materials, furniture, electronics, and more from verified local sellers. Buy smart, save big, give items a second life.</p>
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {isSeller && (
            <button onClick={() => navigate("/seller-dashboard")} style={{ ...styles.heroUploadBtn, background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" }}>
              <span style={{ fontSize: "1.2rem", marginRight: "6px" }}>📊</span> My Dashboard
            </button>
          )}
          <button onClick={handleSell} style={styles.heroUploadBtn}>
            <span style={{ fontSize: "1.2rem", marginRight: "6px" }}>💰</span> Sell Your Item
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div style={styles.filterContainer}>
        <h3 style={styles.filterTitle}>🔍 Find What You're Looking For</h3>
        <div style={styles.filterGrid}>
          <input
            type="text"
            name="search"
            placeholder="Search for furniture, electronics, tools..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ ...styles.filterInput, gridColumn: "span 2" }}
          />
          <select name="category" value={filters.category} onChange={handleFilterChange} style={styles.filterInput}>
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{getCategoryEmoji(c)} {c}</option>)}
          </select>
          <select name="condition" value={filters.condition} onChange={handleFilterChange} style={styles.filterInput}>
            <option value="">All Conditions</option>
            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select name="county" value={filters.county} onChange={handleFilterChange} style={styles.filterInput}>
            <option value="">All Counties</option>
            {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="number" name="minPrice" placeholder="Min Price (KES)" value={filters.minPrice} onChange={handleFilterChange} style={styles.filterInput} />
          <input type="number" name="maxPrice" placeholder="Max Price (KES)" value={filters.maxPrice} onChange={handleFilterChange} style={styles.filterInput} />
        </div>
      </div>

      <div style={styles.resultsRow}>
        <div style={styles.resultsCount}>
          Found <strong style={{ color: "#E31B1B" }}>{items.length}</strong> items available
        </div>
        {hasActiveFilters && (
          <button onClick={handleResetFilters} style={styles.resetBtn}>
            🔄 Reset
          </button>
        )}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={styles.spinner}></div>
          <p style={{ color: "#6b7280", marginTop: "16px", fontSize: "16px" }}>Loading QuickSAles...</p>
        </div>
      ) : items.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📦</div>
          <h3 style={{ color: "#0B2140", marginBottom: "8px" }}>No items found</h3>
          <p style={{ color: "#6b7280", marginBottom: "24px" }}>Try adjusting your search or browsing all categories</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            {hasActiveFilters && <button onClick={handleResetFilters} style={styles.emptyResetBtn}>Clear Filters</button>}
            <button onClick={handleSell} style={styles.emptySellBtn}>List Your Item</button>
          </div>
        </div>
      ) : (
        <div style={styles.grid}>
          {items.map((item) => {
            const isFavorite = favorites.includes(item._id);
            const isLowStock = item.quantity && item.quantity <= 2;
            const isNewItem = item.createdAt && (Date.now() - new Date(item.createdAt).getTime() < 172800000);

            return (
              <div key={item._id} data-material-id={item._id} style={styles.card} className="item-card" onClick={() => openModal(item)}>
                <div style={styles.imageWrapper}>
                  <img src={item.images?.[0] || "/placeholder.jpg"} alt={item.title} style={styles.itemImage} />

                  {/* BADGES */}
                  <div style={styles.badgeStack}>
                    <span style={styles.conditionBadge}>{item.condition}</span>
                    {isLowStock && <span style={styles.lowStockBadge}>⚠️ Only {item.quantity}</span>}
                    {isNewItem && <span style={styles.newItemBadge}>🆕 New</span>}
                  </div>

                  {/* ACTION BUTTONS */}
                  <button
                    style={{ ...styles.actionBtn, ...styles.favBtn, color: isFavorite ? "#ef4444" : "#9ca3af" }}
                    onClick={(e) => handleToggleFavorite(e, item._id)}
                  >
                    ❤️
                  </button>

                  <button
                    style={{ ...styles.actionBtn, ...styles.shareBtn }}
                    onClick={(e) => handleShareListing(e, item)}
                  >
                    {copiedId === item._id ? "✅" : "🔗"}
                  </button>

                  {item.images?.length > 1 && (
                    <span style={styles.photoCount}>📷 {item.images.length}</span>
                  )}
                </div>

                <div style={styles.cardContent}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "8px", marginBottom: "4px" }}>
                    <h3 style={styles.itemTitle}>{item.title}</h3>
                    <span style={styles.categoryIcon}>{getCategoryEmoji(item.category)}</span>
                  </div>

                  <p style={styles.itemLocation}>📍 {item.location}, {item.county}</p>

                  <div style={styles.priceSection}>
                    <p style={styles.price}>KES {Number(item.price).toLocaleString()}</p>
                    <span style={styles.dealBadge}>✓ Great Deal</span>
                  </div>

                  <div style={styles.infoGrid}>
                    <div>
                      <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}>CATEGORY</span>
                      <p style={styles.infoValue}>{item.category}</p>
                    </div>
                    <div>
                      <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}>AVAILABLE</span>
                      <p style={styles.infoValue}>{item.quantity || 1}</p>
                    </div>
                  </div>

                  <button style={styles.viewBtn} onClick={(e) => { e.stopPropagation(); openModal(item); }}>
                    View Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {selected && (
        <div style={styles.modal} onClick={closeModal}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={closeModal}>✕</button>

            {/* IMAGES */}
            <div style={styles.modalImageSection}>
              {selected.images?.length > 0 ? (
                <>
                  <img src={selected.images[currentImage]} alt={selected.title} style={styles.mainImage} />
                  {selected.images.length > 1 && (
                    <>
                      <button style={{ ...styles.navBtn, left: "16px" }} onClick={() => setCurrentImage((p) => (p - 1 + selected.images.length) % selected.images.length)}>❮</button>
                      <button style={{ ...styles.navBtn, right: "16px" }} onClick={() => setCurrentImage((p) => (p + 1) % selected.images.length)}>❯</button>
                      <div style={styles.photoIndicator}>{currentImage + 1}/{selected.images.length}</div>
                    </>
                  )}
                </>
              ) : (
                <div style={styles.noImagePlaceholder}>📷</div>
              )}
            </div>

            {/* THUMBNAILS */}
            {selected.images?.length > 1 && (
              <div style={styles.thumbnailRow}>
                {selected.images.map((img, idx) => (
                  <img key={idx} src={img} alt={`thumb`}
                    style={{ ...styles.thumbnail, ...(idx === currentImage ? styles.activeThumbnail : {}) }}
                    onClick={() => setCurrentImage(idx)} />
                ))}
              </div>
            )}

            <div style={styles.modalContent}>
              {/* HEADER */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "12px", marginBottom: "8px" }}>
                  <span style={styles.verifiedBadge}>✓ Verified Listing</span>
                  <button style={styles.shareLinkBtn} onClick={(e) => handleShareListing(e, selected)}>
                    {copiedId === selected._id ? "✅ Copied" : "🔗 Share"}
                  </button>
                </div>
                <h2 style={styles.modalTitle}>{selected.title}</h2>
                <p style={styles.modalSubtitle}>📍 {selected.location}, {selected.county}</p>
              </div>

              {/* CONDITION & CATEGORY BADGES */}
              <div style={styles.badgesRow}>
                <span style={styles.modalConditionBadge}>{selected.condition}</span>
                <span style={styles.modalCategoryBadge}>{getCategoryEmoji(selected.category)} {selected.category}</span>
                {selected.quantity <= 2 && <span style={styles.urgentTag}>⚠️ Limited Stock</span>}
              </div>

              {/* PRICE & STOCK */}
              <div style={styles.priceBox}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#6b7280", display: "block", marginBottom: "4px" }}>ASKING PRICE</span>
                  <span style={styles.modalPrice}>KES {selected.price?.toLocaleString()}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.75rem", color: "#6b7280", display: "block", marginBottom: "4px" }}>AVAILABLE</span>
                  <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "#10b981" }}>{selected.quantity || 1}</span>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#0B2140", fontWeight: 700 }}>About This Item</h4>
                <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.6, fontSize: "14px" }}>{selected.description}</p>
              </div>

              {/* SELLER INFO */}
              <div style={styles.sellerSection}>
                <h4 style={{ margin: "0 0 12px 0", color: "#0B2140", fontWeight: 700 }}>👤 Seller Information</h4>
                <div style={{ background: "#f3f4f6", padding: "12px", borderRadius: "8px", marginBottom: "12px" }}>
                  <p style={{ margin: "6px 0", fontSize: "14px", color: "#0B2140" }}><strong>{selected.sellerName}</strong></p>
                  <p style={{ margin: "6px 0", fontSize: "13px", color: "#6b7280" }}>{selected.location}, {selected.county}</p>
                  <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#E31B1B", fontWeight: 600 }}>✓ Verified Seller</p>
                </div>
              </div>

              {/* CONTACT BUTTONS */}
              <div style={styles.contactBtns}>
                <button style={styles.whatsappBtn} onClick={() => handleWhatsApp(selected)}>
                  💬 Chat on WhatsApp
                </button>
                <button style={styles.callBtn} onClick={() => handleCall(selected)}>
                  📞 Call Seller
                </button>
              </div>

              <p style={{ fontSize: "12px", color: "#6b7280", textAlign: "center", margin: "16px 0 0 0" }}>
                Always inspect items in person before making payment. Meet in safe, public locations.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { background: "#ffffff", minHeight: "100vh", padding: "20px", fontFamily: "'DM Sans', sans-serif", color: "#0B2140", maxWidth: "1200px", margin: "0 auto" },

  heroSection: { background: "linear-gradient(135deg, #0B2140 0%, #152B4A 100%)", borderRadius: "16px", padding: "48px 36px", marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "32px", flexWrap: "wrap", color: "white" },
  taglineBadge: { background: "rgba(227, 27, 27, 0.15)", color: "#E31B1B", padding: "8px 14px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", display: "inline-block", marginBottom: "12px" },
  heroTitle: { margin: 0, fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.5px", marginBottom: "8px" },
  heroSubtitle: { margin: "0 0 0 0", fontSize: "1.05rem", lineHeight: 1.6, opacity: 0.95 },
  heroUploadBtn: { padding: "14px 28px", background: "#E31B1B", color: "white", border: "none", borderRadius: "10px", fontSize: "1rem", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" },

  filterContainer: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "24px", marginBottom: "24px" },
  filterTitle: { margin: "0 0 16px 0", fontSize: "15px", fontWeight: 700, color: "#0B2140" },
  filterGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" },
  filterInput: { padding: "12px 14px", background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", color: "#0B2140", fontSize: "14px", fontFamily: "inherit" },

  resultsRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  resultsCount: { color: "#6b7280", fontSize: "14px", fontWeight: 500 },
  resetBtn: { background: "none", border: "none", color: "#E31B1B", cursor: "pointer", fontSize: "14px", fontWeight: 700, padding: 0 },

  error: { background: "#fee2e2", border: "1px solid #fecaca", color: "#dc2626", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" },

  emptyState: { textAlign: "center", padding: "80px 20px", background: "#f9fafb", borderRadius: "12px", border: "2px dashed #e5e7eb" },
  emptyResetBtn: { background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", color: "#0B2140", padding: "12px 20px", cursor: "pointer", fontWeight: 600, fontSize: "14px" },
  emptySellBtn: { background: "#E31B1B", border: "none", borderRadius: "8px", color: "white", padding: "12px 24px", cursor: "pointer", fontWeight: 700, fontSize: "14px" },

  grid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" },
  "@media (max-width: 768px)": { grid: { gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" } },
  "@media (max-width: 480px)": { grid: { gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" } },
  "@media (max-width: 380px)": { grid: { gridTemplateColumns: "repeat(2, 1fr)", gap: "6px" } },

  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: "16px", overflow: "hidden", cursor: "pointer", transition: "all 0.3s ease", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  "@media (max-width: 768px)": { card: { borderRadius: "12px" } },

  imageWrapper: { position: "relative", aspectRatio: "1/1", overflow: "hidden", background: "#f3f4f6" },
  itemImage: { width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" },

  badgeStack: { position: "absolute", top: "12px", left: "12px", display: "flex", flexDirection: "column", gap: "6px" },
  conditionBadge: { background: "#3b82f6", color: "white", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700 },
  lowStockBadge: { background: "#dc2626", color: "white", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700 },
  newItemBadge: { background: "#10b981", color: "white", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700 },

  actionBtn: { position: "absolute", width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255, 255, 255, 0.9)", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 5, fontSize: "18px", padding: 0 },
  favBtn: { top: "12px", right: "12px" },
  shareBtn: { top: "52px", right: "12px" },

  photoCount: { position: "absolute", bottom: "12px", right: "12px", background: "rgba(0, 0, 0, 0.6)", color: "white", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 },

  cardContent: { padding: "16px" },
  "@media (max-width: 768px)": { cardContent: { padding: "12px" } },
  itemTitle: { margin: "0 0 8px 0", fontSize: "16px", fontWeight: 700, color: "#0B2140", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  "@media (max-width: 768px)": { itemTitle: { fontSize: "14px" } },
  categoryIcon: { fontSize: "20px", flexShrink: 0 },
  "@media (max-width: 768px)": { categoryIcon: { fontSize: "16px" } },
  itemLocation: { margin: "0 0 12px 0", fontSize: "13px", color: "#6b7280" },
  "@media (max-width: 768px)": { itemLocation: { fontSize: "11px", marginBottom: "8px" } },

  priceSection: { display: "flex", justifyContent: "space-between", alignItems: "center", margin: "12px 0" },
  "@media (max-width: 768px)": { priceSection: { margin: "8px 0" } },
  price: { margin: 0, fontSize: "20px", fontWeight: 800, color: "#E31B1B" },
  "@media (max-width: 768px)": { price: { fontSize: "16px" } },
  dealBadge: { fontSize: "11px", background: "#d1fae5", color: "#065f46", padding: "3px 8px", borderRadius: "4px", fontWeight: 700 },

  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", background: "#f9fafb", padding: "10px", borderRadius: "8px", margin: "10px 0" },
  "@media (max-width: 768px)": { infoGrid: { gap: "8px", padding: "8px", margin: "8px 0" } },
  infoValue: { margin: "4px 0 0 0", fontWeight: 700, color: "#0B2140", fontSize: "13px" },
  "@media (max-width: 768px)": { infoValue: { fontSize: "12px" } },

  viewBtn: { width: "100%", padding: "12px", background: "#0B2140", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 700, marginTop: "10px" },
  "@media (max-width: 768px)": { viewBtn: { padding: "10px", fontSize: "13px", marginTop: "8px" } },

  modal: { position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" },
  modalBox: { background: "white", borderRadius: "16px", maxWidth: "650px", width: "100%", maxHeight: "90vh", overflowY: "auto", position: "relative" },
  closeBtn: { position: "absolute", top: "16px", right: "16px", background: "white", border: "1px solid #e5e7eb", color: "#0B2140", width: "40px", height: "40px", borderRadius: "50%", cursor: "pointer", fontSize: "24px", zIndex: 1001 },

  modalImageSection: { position: "relative", width: "100%", height: "380px", background: "#f3f4f6", overflow: "hidden" },
  mainImage: { width: "100%", height: "100%", objectFit: "cover" },
  noImagePlaceholder: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "64px" },
  navBtn: { position: "absolute", top: "50%", transform: "translateY(-50%)", background: "rgba(0, 0, 0, 0.5)", color: "white", border: "none", width: "44px", height: "44px", borderRadius: "50%", cursor: "pointer", fontSize: "20px" },
  photoIndicator: { position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", background: "rgba(0, 0, 0, 0.6)", color: "white", padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 },

  thumbnailRow: { display: "flex", gap: "8px", padding: "12px", overflowX: "auto", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" },
  thumbnail: { width: "64px", height: "64px", objectFit: "cover", borderRadius: "8px", cursor: "pointer", opacity: 0.5, border: "2px solid transparent", flexShrink: 0 },
  activeThumbnail: { opacity: 1, borderColor: "#E31B1B" },

  modalContent: { padding: "28px" },
  verifiedBadge: { fontSize: "12px", color: "#10b981", fontWeight: 700, textTransform: "uppercase" },
  shareLinkBtn: { background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "14px", fontWeight: 600, padding: 0 },
  modalTitle: { fontSize: "24px", margin: "8px 0 4px 0", color: "#0B2140", fontWeight: 800 },
  modalSubtitle: { color: "#6b7280", margin: "0 0 16px 0", fontSize: "14px" },

  badgesRow: { display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" },
  modalConditionBadge: { background: "#dbeafe", color: "#1d4ed8", padding: "6px 14px", borderRadius: "6px", fontSize: "13px", fontWeight: 700 },
  modalCategoryBadge: { background: "#e9d5ff", color: "#6b21a8", padding: "6px 14px", borderRadius: "6px", fontSize: "13px", fontWeight: 700 },
  urgentTag: { background: "#fee2e2", color: "#991b1b", padding: "6px 14px", borderRadius: "6px", fontSize: "13px", fontWeight: 700 },

  priceBox: { display: "flex", justifyContent: "space-between", background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: "10px", padding: "16px", marginBottom: "20px" },
  modalPrice: { color: "#E31B1B", fontSize: "28px", fontWeight: 900 },

  sellerSection: { background: "#f9fafb", padding: "16px", borderRadius: "10px", marginBottom: "20px", borderLeft: "4px solid #E31B1B" },

  contactBtns: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  whatsappBtn: { padding: "14px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "14px" },
  callBtn: { padding: "14px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "14px" },

  spinner: { width: "40px", height: "40px", border: "4px solid #e5e7eb", borderTop: "4px solid #E31B1B", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  
  * { box-sizing: border-box; }
  
  @keyframes spin { 
    to { transform: rotate(360deg); }
  }
  
  .item-card {
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }
  
  .item-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba(227, 27, 27, 0.15);
    border-color: #E31B1B !important;
  }
  
  .item-card:hover img {
    transform: scale(1.05);
  }
  
  button:not(:disabled):hover {
    transform: translateY(-2px);
  }
  
  input:focus, select:focus {
    outline: none;
    border-color: #E31B1B !important;
    box-shadow: 0 0 0 3px rgba(227, 27, 27, 0.1) !important;
  }
  
  @media (max-width: 768px) {
    [style*="gridTemplateColumns: repeat"] {
      grid-template-columns: 1fr !important;
    }
    .contactBtns {
      grid-template-columns: 1fr !important;
    }
  }
`;