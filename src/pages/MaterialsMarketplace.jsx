import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { COLORS, buttonStyles, inputStyles, pageStyles, cardStyles } from "../styles/theme";
import { useAuth } from "../context/AuthContext";
import PhoneInput from "../components/PhoneInput";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

const CATEGORIES = [
  "Construction Materials",
  "Furniture",
  "Appliances",
  "Electronics",
  "Tools",
  "Other",
];

const CONDITIONS = ["Like New", "Good", "Fair", "Poor"];

const COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta",
  "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka Nithi",
  "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga",
  "Murang'a", "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans Nzoia",
  "Uasin Gishu", "Elgeyo Marakwet", "Nandi", "Baringo", "Laikipia", "Nakuru",
  "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma",
  "Busia", "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi City",
];

export default function MaterialsMarketplace() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    category: "",
    condition: "",
    county: "",
    minPrice: "",
    maxPrice: "",
    search: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [paymentPhone, setPaymentPhone] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.condition) params.append("condition", filters.condition);
      if (filters.county) params.append("county", filters.county);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(`${API_BASE}/materials?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setMaterials(data);
      } else {
        setError(data.error || "Failed to load materials");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    fetchMaterials();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      condition: "",
      county: "",
      minPrice: "",
      maxPrice: "",
      search: "",
    });
    setTimeout(fetchMaterials, 100);
  };

  const handleInquiry = (materialId) => {
    navigate(`/materials/${materialId}/inquire`);
  };

  const handlePurchaseMaterial = (material) => {
    if (!user) {
      alert("Please log in to purchase this material");
      return;
    }
    setSelectedMaterial(material);
    setPaymentAmount(material.price?.toString() || "");
    setPaymentPhone(user.phone || "");
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    setPaymentError("");
    setPaymentSuccess("");

    try {
      const response = await fetch(`${API_BASE}/payment/purchase-material`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          materialId: selectedMaterial._id,
          phone: paymentPhone,
          amount: paymentAmount,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPaymentSuccess("✅ M-Pesa prompt sent! Check your phone to complete payment.");
        setTimeout(() => {
          setShowPaymentModal(false);
          setPaymentSuccess("");
        }, 3000);
      } else {
        setPaymentError(data.error || "❌ Payment failed. Please try again.");
      }
    } catch (err) {
      setPaymentError("❌ Payment failed. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* HERO SECTION */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>✨ Verified Sellers Only</div>
          <h1 style={styles.heroTitle}>Materials Marketplace</h1>
          <p style={styles.heroSubtitle}>
            Browse construction materials, furniture, appliances, and more from verified sellers across Kenya
          </p>

          {/* Search Bar */}
          <div style={styles.searchBar}>
            <input
              type="text"
              placeholder="Search materials..."
              value={filters.search}
              onChange={handleFilterChange}
              style={styles.searchInput}
            />
            <button onClick={() => { fetchMaterials(); }} style={styles.searchBtn}>
              🔍 Search
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={styles.filterToggleBtn}
            >
              {showFilters ? "✕ Close" : "⚙ Filters"}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div style={styles.filterPanel}>
              <div style={styles.filterGrid}>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Category</label>
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    style={styles.filterSelect}
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Condition</label>
                  <select
                    name="condition"
                    value={filters.condition}
                    onChange={handleFilterChange}
                    style={styles.filterSelect}
                  >
                    <option value="">All Conditions</option>
                    {CONDITIONS.map((cond) => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>County</label>
                  <select
                    name="county"
                    value={filters.county}
                    onChange={handleFilterChange}
                    style={styles.filterSelect}
                  >
                    <option value="">All Counties</option>
                    {COUNTIES.map((county) => (
                      <option key={county} value={county}>{county}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Price Range (KSh)</label>
                  <div style={styles.priceRange}>
                    <input
                      type="number"
                      name="minPrice"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      style={styles.priceInput}
                    />
                    <span style={styles.priceSeparator}>-</span>
                    <input
                      type="number"
                      name="maxPrice"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      style={styles.priceInput}
                    />
                  </div>
                </div>
              </div>

              <div style={styles.filterActions}>
                <button onClick={applyFilters} style={styles.applyBtn}>
                  Apply Filters
                </button>
                <button onClick={clearFilters} style={styles.clearBtn}>
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* MATERIALS GRID */}
      <section style={styles.materialsSection}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <div className="spinner"></div>
            <p style={styles.loadingText}>Loading materials...</p>
          </div>
        ) : error ? (
          <div style={styles.errorContainer}>
            <div style={styles.errorIcon}>⚠️</div>
            <p style={styles.errorText}>{error}</p>
            <button onClick={fetchMaterials} style={styles.retryBtn}>
              🔄 Retry
            </button>
          </div>
        ) : materials.length === 0 ? (
          <div style={styles.emptyContainer}>
            <div style={styles.emptyIcon}>📦</div>
            <h3 style={styles.emptyTitle}>No Materials Found</h3>
            <p style={styles.emptyText}>
              Try adjusting your filters or check back later for new listings
            </p>
            <button onClick={clearFilters} style={styles.clearBtn}>
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div style={styles.resultsHeader}>
              <p style={styles.resultsCount}>
                Showing {materials.length} approved material{materials.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div style={styles.materialsGrid}>
              {materials.map((material) => (
                <div key={material._id} style={styles.materialCard} className="material-card">
                  <div style={styles.imageWrapper}>
                    {material.images && material.images.length > 0 ? (
                      <img
                        src={material.images[0]}
                        alt={material.title}
                        style={styles.materialImage}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <div style={styles.noImage}>📷 No Image</div>
                    )}
                    <div style={styles.categoryBadge}>{material.category}</div>
                    <div style={styles.conditionBadge}>{material.condition}</div>
                  </div>

                  <div style={styles.materialInfo}>
                    <h3 style={styles.materialTitle}>{material.title}</h3>
                    <p style={styles.materialDescription}>
                      {material.description.length > 100
                        ? material.description.substring(0, 100) + "..."
                        : material.description}
                    </p>

                    <div style={styles.materialMeta}>
                      <span style={styles.metaItem}>📍 {material.location}, {material.county}</span>
                      <span style={styles.metaItem}>📦 Qty: {material.quantity}</span>
                    </div>

                    {/* GPS Coordinates */}
                    {material.lat && material.lng && (
                      <div style={styles.gpsSection}>
                        <div style={styles.gpsCoords}>
                          <span style={styles.gpsLabel}>📍 GPS:</span>
                          <span style={styles.gpsValue}>{material.lat.toFixed(6)}, {material.lng.toFixed(6)}</span>
                        </div>
                        <a
                          href={`https://www.google.com/maps?q=${material.lat},${material.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.mapLink}
                        >
                          🗺️ View on Map
                        </a>
                      </div>
                    )}

                    <div style={styles.sellerInfo}>
                      <span style={styles.sellerLabel}>Seller:</span>
                      <span style={styles.sellerName}>{material.sellerName}</span>
                      {material.sellerRating > 0 && (
                        <span style={styles.sellerRating}>
                          ⭐ {material.sellerRating.toFixed(1)}
                        </span>
                      )}
                    </div>

                    <div style={styles.priceSection}>
                      <span style={styles.price}>
                        KSh {Number(material.price).toLocaleString()}
                      </span>
                      <div style={styles.buttonGroup}>
                        <button
                          onClick={() => handleInquiry(material._id)}
                          style={styles.inquireBtn}
                        >
                          💬 Inquire
                        </button>
                        <button
                          onClick={() => handlePurchaseMaterial(material)}
                          style={styles.purchaseBtn}
                        >
                          🛒 Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* CTA SECTION */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Have Materials to Sell?</h2>
          <p style={styles.ctaText}>
            Join our verified seller network and reach thousands of buyers across Kenya
          </p>
          <button
            onClick={() => navigate("/seller-login")}
            style={styles.ctaBtn}
          >
            🛒 Become a Seller
          </button>
        </div>
      </section>

      {/* PAYMENT MODAL */}
      {showPaymentModal && selectedMaterial && (
        <div style={styles.paymentModal} onClick={() => setShowPaymentModal(false)}>
          <div style={styles.paymentModalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.paymentTitle}>💳 Purchase Material - M-Pesa Payment</h3>
            <p style={styles.paymentSubtitle}>
              {selectedMaterial.title} - KES {paymentAmount}
            </p>
            {paymentSuccess && (
              <div style={styles.paymentSuccess}>{paymentSuccess}</div>
            )}
            {paymentError && (
              <div style={styles.paymentError}>{paymentError}</div>
            )}
            {!paymentSuccess && (
              <form onSubmit={handlePaymentSubmit} style={styles.paymentForm}>
                <div style={styles.paymentField}>
                  <label style={styles.paymentLabel}>M-Pesa Phone Number</label>
                  <PhoneInput
                    value={paymentPhone}
                    onChange={(value) => setPaymentPhone(value)}
                    style={styles.paymentInput}
                    required
                  />
                </div>
                <div style={styles.paymentField}>
                  <label style={styles.paymentLabel}>Amount (KES)</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount"
                    style={styles.paymentInput}
                    required
                  />
                </div>
                <button
                  type="submit"
                  style={styles.paymentButton}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? "Processing..." : "📱 Pay with M-Pesa"}
                </button>
                <button
                  type="button"
                  style={styles.paymentCancelButton}
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  root: {
    ...pageStyles.dark,
  },

  /* Hero Section */
  hero: {
    background: `linear-gradient(135deg, ${COLORS.bgDarker} 0%, ${COLORS.bgDark} 100%)`,
    padding: "80px 20px 60px",
    borderBottom: `3px solid ${COLORS.primary}`,
  },
  heroContent: {
    maxWidth: "1000px",
    margin: "0 auto",
  },
  badge: {
    display: "inline-block",
    background: "rgba(34, 197, 94, 0.15)",
    color: "#86efac",
    padding: "6px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "20px",
    border: "1px solid rgba(34, 197, 94, 0.3)",
  },
  heroTitle: {
    fontSize: "clamp(32px, 5vw, 48px)",
    fontWeight: 800,
    color: COLORS.textLight,
    margin: "0 0 16px",
    letterSpacing: "-1px",
  },
  heroSubtitle: {
    fontSize: "16px",
    color: COLORS.textMutedLight,
    margin: "0 0 32px",
    maxWidth: "600px",
    lineHeight: 1.6,
  },

  /* Search Bar */
  searchBar: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  searchInput: {
    flex: 1,
    minWidth: "280px",
    padding: "14px 18px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "12px",
    fontSize: "15px",
    background: COLORS.bgLight,
    color: COLORS.textLight,
    fontFamily: "'DM Sans', sans-serif",
  },
  searchBtn: {
    padding: "14px 28px",
    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  filterToggleBtn: {
    padding: "14px 24px",
    background: "transparent",
    border: `1px solid ${COLORS.border}`,
    color: COLORS.textLight,
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },

  /* Filter Panel */
  filterPanel: {
    background: COLORS.bgLight,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "16px",
    padding: "24px",
    marginTop: "24px",
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  filterLabel: {
    fontSize: "13px",
    fontWeight: 700,
    color: COLORS.textMutedLight,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  filterSelect: {
    padding: "12px 14px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "8px",
    fontSize: "14px",
    background: COLORS.bgDark,
    color: COLORS.textLight,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
  },
  priceRange: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  priceInput: {
    flex: 1,
    padding: "12px 14px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "8px",
    fontSize: "14px",
    background: COLORS.bgDark,
    color: COLORS.textLight,
    fontFamily: "'DM Sans', sans-serif",
  },
  priceSeparator: {
    color: COLORS.textMutedLight,
    fontWeight: 600,
  },
  filterActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
  },
  applyBtn: {
    padding: "12px 24px",
    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  clearBtn: {
    padding: "12px 24px",
    background: "transparent",
    border: `1px solid ${COLORS.border}`,
    color: COLORS.textMutedLight,
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },

  /* Materials Section */
  materialsSection: {
    padding: "60px 20px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    padding: "60px 20px",
  },
  loadingText: {
    color: COLORS.textMutedLight,
    fontSize: "16px",
  },
  errorContainer: {
    textAlign: "center",
    padding: "60px 20px",
  },
  errorIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  errorText: {
    color: COLORS.textMutedLight,
    fontSize: "16px",
    marginBottom: "20px",
  },
  retryBtn: {
    padding: "12px 28px",
    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  emptyContainer: {
    textAlign: "center",
    padding: "80px 20px",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "20px",
  },
  emptyTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: COLORS.textLight,
    margin: "0 0 12px",
  },
  emptyText: {
    color: COLORS.textMutedLight,
    fontSize: "16px",
    marginBottom: "24px",
  },
  resultsHeader: {
    marginBottom: "32px",
  },
  resultsCount: {
    color: COLORS.textMutedLight,
    fontSize: "15px",
  },
  materialsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "28px",
  },
  materialCard: {
    background: COLORS.bgLight,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "16px",
    overflow: "hidden",
    transition: "all 0.3s",
  },
  imageWrapper: {
    position: "relative",
    height: "220px",
    background: COLORS.bgDark,
  },
  materialImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  noImage: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    fontSize: "48px",
    color: COLORS.textMutedLight,
  },
  categoryBadge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
    color: "white",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 700,
  },
  conditionBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    background: "rgba(251, 191, 36, 0.9)",
    color: COLORS.bgDarker,
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 700,
  },
  materialInfo: {
    padding: "20px",
  },
  materialTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: COLORS.textLight,
    margin: "0 0 10px",
  },
  materialDescription: {
    fontSize: "14px",
    color: COLORS.textMutedLight,
    lineHeight: 1.6,
    margin: "0 0 16px",
  },
  materialMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "16px",
  },
  metaItem: {
    fontSize: "13px",
    color: COLORS.textMutedLight,
  },
  gpsSection: {
    background: "rgba(59, 130, 246, 0.08)",
    border: "1px solid rgba(59, 130, 246, 0.25)",
    borderRadius: "8px",
    padding: "10px 12px",
    marginBottom: "12px",
  },
  gpsCoords: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
  },
  gpsLabel: {
    fontSize: "11px",
    fontWeight: 700,
    color: COLORS.primary,
  },
  gpsValue: {
    fontSize: "12px",
    color: COLORS.textLight,
    fontFamily: "monospace",
  },
  mapLink: {
    display: "inline-block",
    fontSize: "12px",
    color: COLORS.primary,
    textDecoration: "none",
    fontWeight: 600,
  },
  sellerInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px",
    paddingBottom: "16px",
    borderBottom: `1px solid ${COLORS.border}`,
  },
  sellerLabel: {
    fontSize: "13px",
    color: COLORS.textMutedLight,
  },
  sellerName: {
    fontSize: "14px",
    fontWeight: 600,
    color: COLORS.accent,
  },
  sellerRating: {
    fontSize: "13px",
    color: COLORS.accent,
  },
  priceSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  price: {
    fontSize: "22px",
    fontWeight: 800,
    color: COLORS.primary,
  },
  inquireBtn: {
    padding: "10px 20px",
    background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentDark} 100%)`,
    color: COLORS.bgDarker,
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  buttonGroup: {
    display: "flex",
    gap: "8px",
  },
  purchaseBtn: {
    padding: "10px 20px",
    background: `linear-gradient(135deg, #22c55e 0%, #16a34a 100%)`,
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  paymentModal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    padding: "20px",
  },
  paymentModalContent: {
    background: `linear-gradient(135deg, ${COLORS.bgDark} 0%, ${COLORS.bgDarker} 100%)`,
    borderRadius: "12px",
    maxWidth: "400px",
    width: "100%",
    padding: "24px",
    border: `1px solid ${COLORS.border}`,
    position: "relative",
  },
  paymentTitle: {
    fontSize: "1.2rem",
    margin: "0 0 12px 0",
    color: COLORS.primary,
    textAlign: "center",
  },
  paymentSubtitle: {
    fontSize: "0.9rem",
    color: COLORS.textMutedLight,
    textAlign: "center",
    marginBottom: "20px",
  },
  paymentForm: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  paymentField: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  paymentLabel: {
    fontSize: "0.85rem",
    color: COLORS.textLight,
    fontWeight: 600,
  },
  paymentInput: {
    padding: "10px 12px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "6px",
    background: COLORS.bgDarker,
    color: COLORS.textLight,
    fontSize: "0.95rem",
    outline: "none",
  },
  paymentButton: {
    padding: "12px 16px",
    background: `linear-gradient(135deg, #22c55e 0%, #16a34a 100%)`,
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "0.95rem",
    transition: "all 0.3s ease",
  },
  paymentCancelButton: {
    padding: "12px 16px",
    background: "transparent",
    color: COLORS.textMutedLight,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "6px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.95rem",
    transition: "all 0.3s ease",
  },
  paymentSuccess: {
    background: "rgba(34, 197, 94, 0.15)",
    color: "#86efac",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "16px",
    textAlign: "center",
    fontSize: "0.9rem",
    border: "1px solid rgba(34, 197, 94, 0.3)",
  },
  paymentError: {
    background: "rgba(239, 68, 68, 0.15)",
    color: "#fca5a5",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "16px",
    textAlign: "center",
    fontSize: "0.9rem",
    border: "1px solid rgba(239, 68, 68, 0.3)",
  },

  /* CTA Section */
  ctaSection: {
    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
    padding: "80px 20px",
    textAlign: "center",
  },
  ctaContent: {
    maxWidth: "600px",
    margin: "0 auto",
  },
  ctaTitle: {
    fontSize: "32px",
    fontWeight: 800,
    color: "white",
    margin: "0 0 16px",
  },
  ctaText: {
    fontSize: "16px",
    color: "rgba(255, 255, 255, 0.9)",
    margin: "0 0 32px",
  },
  ctaBtn: {
    padding: "16px 36px",
    background: "white",
    color: COLORS.primary,
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: 800,
    cursor: "pointer",
    transition: "all 0.2s",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid ${COLORS.border};
    border-top-color: ${COLORS.primary};
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  input:focus, select:focus {
    outline: none;
    border-color: ${COLORS.accent} !important;
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.12);
  }

  button:hover:not(:disabled) {
    transform: translateY(-2px);
    opacity: 0.9;
  }

  .material-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
    border-color: ${COLORS.accent};
  }

  select {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 16px;
    padding-right: 36px;
  }

  @media (max-width: 768px) {
    .materials-grid {
      grid-template-columns: 1fr;
    }
    
    .filter-grid {
      grid-template-columns: 1fr;
    }
    
    .search-bar {
      flex-direction: column;
    }
    
    .search-input {
      width: 100%;
    }
  }
`;
