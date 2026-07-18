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

export default function QuickSales() {
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
        // Scroll to material card and highlight it
        setTimeout(() => {
          const materialCard = document.querySelector(`[data-material-id="${materialId}"]`);
          if (materialCard) {
            materialCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight the card
            materialCard.style.boxShadow = "0 0 20px rgba(201, 168, 76, 0.5)";
            materialCard.style.transform = "scale(1.02)";
            setTimeout(() => {
              materialCard.style.boxShadow = "";
              materialCard.style.transform = "";
            }, 2000);
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
      setError("Failed to load QuickSales items");
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

      {/* ── ULTRA-COMPACT HEADER & CATEGORIES ── */}
      {/* Row 1: Logo & Title | Search Bar | Action Buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "20px" }}>🛍️</span>
          <h1 style={{ fontSize: "20px", fontWeight: 800, background: "linear-gradient(135deg, #0B2140 0%, #E31B1B 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", margin: 0, lineHeight: 1 }}>
            QuickSales
          </h1>
        </div>
        
        <div style={{ position: "relative", flexGrow: 1, maxWidth: "450px", minWidth: "200px" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", color: "#E31B1B" }}>🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search for furniture, electronics, tools..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ padding: "8px 12px 8px 36px", fontSize: "13px", borderRadius: "10px", height: "36px", margin: 0, width: "100%", border: "1px solid #e5e7eb" }}
          />
          {searchInput && (
            <button onClick={() => setSearchInput("")} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "12px" }}>✕</button>
          )}
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {isSeller && (
            <button onClick={() => navigate("/seller-dashboard")} style={{ padding: "6px 12px", background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", color: "white", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", height: "36px" }}>
              My Dashboard
            </button>
          )}
          <button onClick={handleSell} style={{ padding: "6px 14px", background: "#E31B1B", color: "white", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", height: "36px" }}>
            Sell Your Item
          </button>
        </div>
      </div>

      {/* Row 2: Categories Pills Scrolling | Small Dropdown Filters */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "4px" }}>
        <div className="categories-container" style={{ margin: 0, padding: "2px 0 6px", flexGrow: 1, overflowX: "auto" }}>
          <button 
            className={`category-pill ${filters.category === "" ? "active" : ""}`}
            onClick={() => setFilters(prev => ({ ...prev, category: "" }))}
            style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "8px" }}
          >
            All Categories
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`category-pill ${filters.category === cat ? "active" : ""}`}
              onClick={() => setFilters(prev => ({ ...prev, category: cat }))}
              style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "8px" }}
            >
              <span>{getCategoryEmoji(cat)}</span>
              <span>{cat}</span>
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0, marginBottom: "6px" }}>

          <select name="county" value={filters.county} onChange={handleFilterChange} style={{ padding: "4px 20px 4px 8px", fontSize: "12px", height: "30px", minWidth: "110px", background: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
            <option value="">All Counties</option>
            {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <input type="number" name="minPrice" placeholder="Min Price" value={filters.minPrice} onChange={handleFilterChange} style={{ padding: "4px 8px", fontSize: "12px", height: "30px", maxWidth: "90px", background: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
          <input type="number" name="maxPrice" placeholder="Max Price" value={filters.maxPrice} onChange={handleFilterChange} style={{ padding: "4px 8px", fontSize: "12px", height: "30px", maxWidth: "90px", background: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }} />

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              style={{ padding: "4px 10px", background: "rgba(227, 27, 27, 0.08)", border: "1px solid rgba(227, 27, 27, 0.2)", borderRadius: "8px", color: "#E31B1B", fontSize: "12px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", height: "30px" }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div style={styles.resultsRow}>
        <div style={styles.resultsCount}>
          Found <strong style={{ color: "#E31B1B" }}>{items.length}</strong> items available
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={styles.spinner}></div>
          <p style={{ color: "#6b7280", marginTop: "16px", fontSize: "16px" }}>Loading QuickSales...</p>
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
        <div style={styles.grid} className="quicksales-grid">
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

              {/* CATEGORY BADGES */}
              <div style={styles.badgesRow}>
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
  container: { background: "#ffffff", minHeight: "100vh", padding: "12px 24px 0px", fontFamily: "'DM Sans', sans-serif", color: "#0B2140", maxWidth: "1200px", margin: "0 auto" },

  resultsRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  resultsCount: { color: "#6b7280", fontSize: "12px", fontWeight: 500 },
  resetBtn: { background: "none", border: "none", color: "#E31B1B", cursor: "pointer", fontSize: "12px", fontWeight: 700, padding: 0 },

  error: { background: "#fee2e2", border: "1px solid #fecaca", color: "#dc2626", padding: "8px 12px", borderRadius: "8px", marginBottom: "12px", fontSize: "13px" },

  emptyState: { textAlign: "center", padding: "60px 20px", background: "#f9fafb", borderRadius: "12px", border: "2px dashed #e5e7eb" },
  emptyResetBtn: { background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", color: "#0B2140", padding: "10px 16px", cursor: "pointer", fontWeight: 600, fontSize: "13px" },
  emptySellBtn: { background: "#E31B1B", border: "none", borderRadius: "8px", color: "white", padding: "10px 20px", cursor: "pointer", fontWeight: 700, fontSize: "13px" },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px" },
  "@media (max-width: 768px)": { grid: { gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" } },
  "@media (max-width: 480px)": { grid: { gridTemplateColumns: "repeat(2, 1fr)", gap: "6px" } },
  "@media (max-width: 380px)": { grid: { gridTemplateColumns: "repeat(2, 1fr)", gap: "4px" } },

  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden", cursor: "pointer", transition: "all 0.3s ease", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  "@media (max-width: 768px)": { card: { borderRadius: "10px" } },

  imageWrapper: { position: "relative", aspectRatio: "16/10", overflow: "hidden", background: "#f3f4f6" },
  itemImage: { width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" },

  badgeStack: { position: "absolute", top: "8px", left: "8px", display: "flex", flexDirection: "column", gap: "4px" },
  conditionBadge: { background: "#3b82f6", color: "white", padding: "2px 6px", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 700 },
  lowStockBadge: { background: "#dc2626", color: "white", padding: "2px 6px", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 700 },
  newItemBadge: { background: "#10b981", color: "white", padding: "2px 6px", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 700 },

  actionBtn: { position: "absolute", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255, 255, 255, 0.9)", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 5, fontSize: "14px", padding: 0 },
  favBtn: { top: "8px", right: "8px" },
  shareBtn: { top: "40px", right: "8px" },

  photoCount: { position: "absolute", bottom: "8px", right: "8px", background: "rgba(0, 0, 0, 0.6)", color: "white", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 600 },

  cardContent: { padding: "10px" },
  "@media (max-width: 768px)": { cardContent: { padding: "8px" } },
  itemTitle: { margin: "0 0 4px 0", fontSize: "14px", fontWeight: 700, color: "#0B2140", lineHeight: 1.15, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" },
  "@media (max-width: 768px)": { itemTitle: { fontSize: "13px" } },
  categoryIcon: { fontSize: "16px", flexShrink: 0 },
  "@media (max-width: 768px)": { categoryIcon: { fontSize: "14px" } },
  itemLocation: { margin: "0 0 6px 0", fontSize: "11px", color: "#6b7280" },
  "@media (max-width: 768px)": { itemLocation: { fontSize: "10px", marginBottom: "4px" } },

  priceSection: { display: "flex", justifyContent: "space-between", alignItems: "center", margin: "6px 0" },
  "@media (max-width: 768px)": { priceSection: { margin: "4px 0" } },
  price: { margin: 0, fontSize: "15px", fontWeight: 800, color: "#E31B1B" },
  "@media (max-width: 768px)": { price: { fontSize: "14px" } },
  dealBadge: { fontSize: "9px", background: "#d1fae5", color: "#065f46", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 },

  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", background: "#f9fafb", padding: "6px", borderRadius: "6px", margin: "6px 0" },
  "@media (max-width: 768px)": { infoGrid: { gap: "4px", padding: "4px", margin: "4px 0" } },
  infoValue: { margin: "2px 0 0 0", fontWeight: 700, color: "#0B2140", fontSize: "11px" },
  "@media (max-width: 768px)": { infoValue: { fontSize: "10px" } },

  viewBtn: { width: "100%", padding: "8px", background: "#0B2140", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 700, marginTop: "6px" },
  "@media (max-width: 768px)": { viewBtn: { padding: "8px", fontSize: "11px", marginTop: "6px" } },

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
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(227, 27, 27, 0.12);
    border-color: #E31B1B !important;
  }
  
  .item-card:hover img {
    transform: scale(1.03);
  }
  
  button:not(:disabled):hover {
    transform: translateY(-1px);
  }
  
  input:focus, select:focus {
    outline: none;
    border-color: #E31B1B !important;
    box-shadow: 0 0 0 3px rgba(227, 27, 27, 0.1) !important;
  }
  
  @media (max-width: 768px) {
    [style*="gridTemplateColumns: repeat"]:not(.quicksales-grid) {
      grid-template-columns: 1fr !important;
    }
    .quicksales-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 10px !important;
    }
    .contactBtns {
      grid-template-columns: 1fr !important;
    }
  }

  /* Scrolling Category Pills styling */
  .categories-container {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding: 4px 4px 10px;
    margin-bottom: 8px;
    scrollbar-width: none; /* Firefox */
  }
  .categories-container::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
  .category-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    color: #4b5563;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s ease;
    white-space: nowrap;
    font-family: inherit;
  }
  .category-pill:hover {
    background: #fee2e2;
    border-color: #fca5a5;
    color: #dc2626;
    transform: translateY(-1px);
  }
  .category-pill.active {
    background: linear-gradient(135deg, #fee2e2 0%, rgba(227, 27, 27, 0.1) 100%);
    border-color: #E31B1B;
    color: #E31B1B;
    box-shadow: 0 4px 12px rgba(227, 27, 27, 0.1);
  }
`;