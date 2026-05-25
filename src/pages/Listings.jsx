import { useState, useEffect } from "react";
import ReviewsSection from "../components/ReviewsSection";
import RecentlyViewed, { trackView } from "../components/RecentlyViewed";
import ShareProperty from "../components/ShareProperty";
import MapView from "../components/MapView";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

const formatKenyaPhone = (phone) => {
  if (!phone) return "";
  let cleaned = phone.toString().replace(/\D/g, "");
  if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
  if (cleaned.startsWith("254")) return cleaned;
  return "254" + cleaned;
};

export default function Listings() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
    minPrice: 0,
    maxPrice: 1000000,
    bedrooms: "",
    bathrooms: "",
    furnished: "",
  });
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(`${API_BASE}/properties`);
        if (!response.ok) throw new Error("Failed to fetch properties");
        const data = await response.json();

        const processedProperties = data.map(prop => ({
          ...prop,
          availableUnits: Math.max(0, (prop.totalUnits || 1) - (prop.bookedUnits || 0))
        }));

        const availableProperties = processedProperties.filter((prop) => prop.availableUnits > 0);
        setProperties(processedProperties);
        setFilteredProperties(availableProperties);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  useEffect(() => {
    let filtered = properties.filter(p => p.availableUnits > 0);
    if (filters.location) {
      filtered = filtered.filter((p) =>
        (p.location + " " + (p.county || "")).toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    if (filters.bedrooms) {
      filtered = filtered.filter((p) => p.bedrooms === parseInt(filters.bedrooms));
    }
    if (filters.bathrooms) {
      filtered = filtered.filter((p) => p.bathrooms === parseInt(filters.bathrooms));
    }
    if (filters.furnished !== "") {
      filtered = filtered.filter((p) => p.furnished === (filters.furnished === "true"));
    }
    filtered = filtered.filter(
      (p) => p.price >= filters.minPrice && p.price <= filters.maxPrice
    );
    setFilteredProperties(filtered);
  }, [filters, properties]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: name === "minPrice" || name === "maxPrice" ? parseFloat(value) || 0 : value,
    }));
  };

  const openModal = (property) => {
    setSelectedProperty(property);
    setCurrentImageIndex(0);
    trackView(property);
  };

  const closeModal = () => { setSelectedProperty(null); setCurrentImageIndex(0); };

  const nextImage = () => {
    if (selectedProperty?.images?.length > 0)
      setCurrentImageIndex((prev) => (prev + 1) % selectedProperty.images.length);
  };
  const prevImage = () => {
    if (selectedProperty?.images?.length > 0)
      setCurrentImageIndex((prev) => (prev - 1 + selectedProperty.images.length) % selectedProperty.images.length);
  };

  const handleContactLandlord = (property) => {
    const phoneNumber = formatKenyaPhone(property.owner?.phone || property.phone || "");
    const landlordName = property.owner?.name || "Landlord";
    const message = `Hi ${landlordName}, I'm interested in your property "${property.title}" located in ${property.location}. Can you provide more details?`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleBookNow = (property) => {
    const phoneNumber = formatKenyaPhone(property.owner?.phone || property.phone || "");
    const message = `Hello,\n\nI want to BOOK this property right now:\n\n` +
                    `🏠 ${property.title}\n` +
                    `📍 ${property.county} - ${property.location}\n` +
                    `💰 KES ${property.price?.toLocaleString()}/month\n` +
                    `🛏 ${property.bedrooms} Bedrooms | 🚿 ${property.bathrooms} Bathrooms\n` +
                    `📊 Available: ${property.availableUnits} units\n\n` +
                    `Please confirm availability and let me know the next steps for booking. Thank you!`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleSendSMS = (property) => {
    const phoneNumber = formatKenyaPhone(property.owner?.phone || property.phone || "");
    const message = `Hello, I want to BOOK this property:\n` +
                    `${property.title}\n` +
                    `${property.county} - ${property.location}\n` +
                    `KES ${property.price?.toLocaleString()}/month\n` +
                    `${property.bedrooms} Bed | ${property.bathrooms} Bath\n` +
                    `Available: ${property.availableUnits} units\n\n` +
                    `Please reply with availability and booking details. Thank you!`;
    window.open(`sms:${phoneNumber}?body=${encodeURIComponent(message)}`, "_blank");
  };

  const leaseLabel = { monthly: "Monthly", "6months": "6 Months", yearly: "Yearly" };

  if (loading) {
    return (
      <div style={styles.container}>
        <style>{cssStyles}</style>
        <div style={styles.loadingState}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading amazing properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{cssStyles}</style>

      {/* HEADER */}
      <div style={styles.heroHeader}>
        <div style={styles.headerContent}>
          <h1 style={styles.mainTitle}>Find Your Perfect Home</h1>
          <p style={styles.subtitle}>Discover {filteredProperties.length} available properties across Kenya</p>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* FILTERS */}
      <div style={styles.filterSection}>
        <div style={styles.filterWrapper}>
          <div style={styles.filterGrid}>
            <input
              type="text"
              name="location"
              placeholder="📍 Search by location or county..."
              value={filters.location}
              onChange={handleFilterChange}
              style={styles.filterInput}
            />
            <select name="bedrooms" value={filters.bedrooms} onChange={handleFilterChange} style={styles.filterSelect}>
              <option value="">All Bedrooms</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4">4+ Bedrooms</option>
            </select>
            <select name="bathrooms" value={filters.bathrooms} onChange={handleFilterChange} style={styles.filterSelect}>
              <option value="">All Bathrooms</option>
              <option value="1">1 Bathroom</option>
              <option value="2">2 Bathrooms</option>
              <option value="3">3+ Bathrooms</option>
            </select>
            <select name="furnished" value={filters.furnished} onChange={handleFilterChange} style={styles.filterSelect}>
              <option value="">Any Condition</option>
              <option value="true">Furnished</option>
              <option value="false">Unfurnished</option>
            </select>
          </div>
          <div style={styles.priceFilterWrapper}>
            <input type="number" name="minPrice" placeholder="Min" value={filters.minPrice} onChange={handleFilterChange} style={styles.priceInput} />
            <span style={styles.priceSeparator}>—</span>
            <input type="number" name="maxPrice" placeholder="Max" value={filters.maxPrice} onChange={handleFilterChange} style={styles.priceInput} />
            <button style={styles.mapToggleBtn} onClick={() => setShowMap((v) => !v)}>
              {showMap ? "🗒️ List" : "🗺️ Map"}
            </button>
          </div>
        </div>
      </div>

      {/* RESULTS INFO */}
      <div style={styles.resultsInfo}>
        <span style={styles.resultsCount}>
          {filteredProperties.length} {filteredProperties.length === 1 ? "property" : "properties"} found
        </span>
      </div>

      {/* MAP VIEW */}
      {showMap && <MapView properties={filteredProperties} />}

      {/* RECENTLY VIEWED */}
      <RecentlyViewed onSelect={openModal} />

      {/* NO RESULTS */}
      {filteredProperties.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔍</div>
          <h3 style={styles.emptyTitle}>No Properties Found</h3>
          <p style={styles.emptyText}>Try adjusting your filters to see more listings</p>
        </div>
      )}

      {/* LISTINGS GRID */}
      {filteredProperties.length > 0 && (
        <div style={styles.listingsGrid}>
          {filteredProperties.map((property) => (
            <div key={property._id} style={styles.propertyCard} className="property-card">
              
              {/* IMAGE SECTION */}
              <div style={styles.cardImageWrapper} onClick={() => openModal(property)}>
                {property.images?.length > 0 ? (
                  <img src={property.images[0]} alt={property.title} style={styles.cardImage} />
                ) : (
                  <div style={styles.noImage}>📷</div>
                )}
                
                {/* BADGES */}
                <div style={styles.badgesContainer}>
                  <span style={property.availableUnits > 0 ? styles.badgeAvailable : styles.badgeUnavailable}>
                    {property.availableUnits > 0 ? `✓ ${property.availableUnits} Available` : "✕ Fully Booked"}
                  </span>
                  {property.images?.length > 1 && (
                    <span style={styles.badgeImage}>📷 {property.images.length}</span>
                  )}
                </div>

                {/* HOVER OVERLAY */}
                <div style={styles.cardOverlay}>
                  <button style={styles.viewDetailsBtn}>View Details</button>
                </div>
              </div>

              {/* CONTENT SECTION */}
              <div style={styles.cardContent}>
                <div style={styles.titleArea}>
                  <h3 style={styles.propertyTitle}>{property.title}</h3>
                  <div style={styles.priceTag}>KES {property.price?.toLocaleString()}</div>
                </div>

                <div style={styles.locationBar}>
                  <span style={styles.location}>📍 {property.location}</span>
                  <span style={styles.county}>{property.county}</span>
                </div>

                {/* SPECS ROW */}
                <div style={styles.specsRow}>
                  <div style={styles.spec}>
                    <span style={styles.specIcon}>🛏️</span>
                    <span>{property.bedrooms}</span>
                  </div>
                  <div style={styles.spec}>
                    <span style={styles.specIcon}>🚿</span>
                    <span>{property.bathrooms}</span>
                  </div>
                  <div style={styles.spec}>
                    <span style={styles.specIcon}>{property.furnished ? "✓" : "📦"}</span>
                    <span>{property.furnished ? "Furnished" : "Unfurnished"}</span>
                  </div>
                </div>

                {/* DESCRIPTION */}
                <p style={styles.description}>{property.description?.substring(0, 70)}...</p>

                {/* AMENITIES PREVIEW */}
                {property.amenities?.length > 0 && (
                  <div style={styles.amenitiesPreview}>
                    {property.amenities.slice(0, 2).map((a, i) => (
                      <span key={i} style={styles.amenityTag}>{a}</span>
                    ))}
                    {property.amenities.length > 2 && (
                      <span style={styles.amenityTag}>+{property.amenities.length - 2}</span>
                    )}
                  </div>
                )}

                {/* ACTION BUTTONS */}
                <div style={styles.cardActions}>
                  <button
                    style={{...styles.primaryBtn, ...(property.availableUnits === 0 ? styles.btnDisabled : {})}}
                    onClick={() => handleContactLandlord(property)}
                    disabled={property.availableUnits === 0}
                  >
                    💬 WhatsApp
                  </button>
                  <button style={styles.secondaryBtn} onClick={() => openModal(property)}>
                    Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedProperty && (
        <div style={styles.modal} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={closeModal}>✕</button>

            {/* MODAL IMAGE */}
            <div style={styles.modalImageContainer}>
              {selectedProperty.images?.length > 0 ? (
                <>
                  <img src={selectedProperty.images[currentImageIndex]} alt="Property" style={styles.modalImage} />
                  {selectedProperty.images.length > 1 && (
                    <>
                      <button style={styles.navBtn} style={{ ...styles.navBtn, left: "12px" }} onClick={prevImage}>❮</button>
                      <button style={styles.navBtn} style={{ ...styles.navBtn, right: "12px" }} onClick={nextImage}>❯</button>
                      <div style={styles.imageCounter}>{currentImageIndex + 1}/{selectedProperty.images.length}</div>
                    </>
                  )}
                </>
              ) : (
                <div style={styles.noImageModal}>📷 No Images Available</div>
              )}
            </div>

            {/* THUMBNAILS */}
            {selectedProperty.images?.length > 1 && (
              <div style={styles.thumbnailsContainer}>
                {selectedProperty.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Thumb ${idx + 1}`}
                    style={{ ...styles.thumbnail, ...(idx === currentImageIndex ? styles.activeThumbnail : {}) }}
                    onClick={() => setCurrentImageIndex(idx)}
                  />
                ))}
              </div>
            )}

            {/* MODAL CONTENT */}
            <div style={styles.modalContentWrapper}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>{selectedProperty.title}</h2>
                <div style={styles.modalPrice}>KES {selectedProperty.price?.toLocaleString()}/month</div>
              </div>

              <div style={styles.modalLocation}>📍 {selectedProperty.location}, {selectedProperty.county}</div>

              {/* SPECS GRID */}
              <div style={styles.modalSpecsGrid}>
                <div style={styles.specBox}>
                  <span style={styles.specLabel}>Bedrooms</span>
                  <span style={styles.specValue}>{selectedProperty.bedrooms}</span>
                </div>
                <div style={styles.specBox}>
                  <span style={styles.specLabel}>Bathrooms</span>
                  <span style={styles.specValue}>{selectedProperty.bathrooms}</span>
                </div>
                <div style={styles.specBox}>
                  <span style={styles.specLabel}>Condition</span>
                  <span style={styles.specValue}>{selectedProperty.furnished ? "Furnished" : "Unfurnished"}</span>
                </div>
                <div style={styles.specBox}>
                  <span style={styles.specLabel}>Available</span>
                  <span style={styles.specValue}>{selectedProperty.availableUnits}</span>
                </div>
              </div>

              {/* PRICING INFO */}
              {selectedProperty.deposit > 0 && (
                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>Security Deposit</span>
                  <span style={styles.infoValue}>KES {selectedProperty.deposit?.toLocaleString()}</span>
                </div>
              )}

              {/* DESCRIPTION */}
              <div style={styles.descriptionSection}>
                <h3 style={styles.sectionTitle}>About This Property</h3>
                <p style={styles.descriptionText}>{selectedProperty.description}</p>
              </div>

              {/* AMENITIES */}
              {selectedProperty.amenities?.length > 0 && (
                <div style={styles.amenitiesSection}>
                  <h3 style={styles.sectionTitle}>Amenities</h3>
                  <div style={styles.amenitiesGrid}>
                    {selectedProperty.amenities.map((a, i) => (
                      <span key={i} style={styles.amenityBadge}>✓ {a}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* RULES */}
              {selectedProperty.rules && (
                <div style={styles.rulesSection}>
                  <h3 style={styles.sectionTitle}>House Rules</h3>
                  <p style={styles.rulesText}>{selectedProperty.rules}</p>
                </div>
              )}

              {/* SHARE PROPERTY */}
              <ShareProperty property={selectedProperty} />

              {/* CONTACT BUTTONS */}
              <div style={styles.contactGrid}>
                <button
                  style={{...styles.contactBtnGreen, ...(selectedProperty.availableUnits === 0 ? styles.btnDisabled : {})}}
                  onClick={() => handleContactLandlord(selectedProperty)}
                  disabled={selectedProperty.availableUnits === 0}
                >
                  💬 WhatsApp Message
                </button>
                <button style={styles.contactBtnBlue} onClick={() => window.open(`tel:${selectedProperty.owner?.phone || selectedProperty.phone}`)}>
                  📞 Call Landlord
                </button>
                <button style={styles.contactBtnOrange} onClick={() => handleSendSMS(selectedProperty)}>
                  📱 Send SMS
                </button>
                <button style={styles.contactBtnYellow} onClick={() => handleBookNow(selectedProperty)}>
                  🔥 Book Now
                </button>
              </div>

              {/* REVIEWS */}
              <ReviewsSection propertyId={selectedProperty._id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "linear-gradient(135deg, #f8f9fa 0%, #f0f1f3 100%)", fontFamily: "'DM Sans', sans-serif", padding: "0" },
  
  loadingState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", color: "#0B2140" },
  spinner: { width: "50px", height: "50px", border: "4px solid #e5e7eb", borderTop: "4px solid #E31B1B", borderRadius: "50%", animation: "spin 1s linear infinite" },
  loadingText: { marginTop: "20px", fontSize: "18px", fontWeight: 600 },

  heroHeader: { background: "linear-gradient(135deg, #0B2140 0%, #152B4A 100%)", color: "white", padding: "60px 20px", textAlign: "center", borderBottom: "3px solid #E31B1B" },
  headerContent: { maxWidth: "1200px", margin: "0 auto" },
  mainTitle: { fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 800, margin: "0 0 12px", letterSpacing: "-0.5px" },
  subtitle: { fontSize: "16px", opacity: 0.9, margin: 0 },

  filterSection: { background: "white", borderBottom: "1px solid #e5e7eb", padding: "24px 20px", sticky: "top", zIndex: 40 },
  filterWrapper: { maxWidth: "1200px", margin: "0 auto" },
  filterGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "12px" },
  filterInput: { padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" },
  filterSelect: { padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit", background: "white", color: "#0B2140" },
  priceFilterWrapper: { display: "flex", gap: "8px", alignItems: "center" },
  priceInput: { flex: 1, padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" },
  priceSeparator: { color: "#9ca3af", fontWeight: 600 },
  mapToggleBtn: { padding: "12px 20px", background: "#0ea5e9", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" },

  resultsInfo: { maxWidth: "1200px", margin: "20px auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  resultsCount: { fontSize: "14px", fontWeight: 600, color: "#6b7280" },

  emptyState: { textAlign: "center", padding: "80px 20px", maxWidth: "1200px", margin: "0 auto" },
  emptyIcon: { fontSize: "64px", marginBottom: "20px" },
  emptyTitle: { fontSize: "24px", fontWeight: 800, color: "#0B2140", margin: "0 0 8px" },
  emptyText: { color: "#6b7280", fontSize: "16px", margin: 0 },

  listingsGrid: { maxWidth: "1200px", margin: "0 auto", padding: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" },

  propertyCard: { background: "white", borderRadius: "12px", overflow: "hidden", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", transition: "all 0.3s ease", display: "flex", flexDirection: "column" },

  cardImageWrapper: { position: "relative", height: "220px", overflow: "hidden", background: "#f3f4f6", cursor: "pointer" },
  cardImage: { width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" },
  noImage: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px", background: "#f3f4f6" },
  badgesContainer: { position: "absolute", top: "12px", left: "12px", display: "flex", gap: "8px", flexWrap: "wrap" },
  badgeAvailable: { display: "inline-block", background: "#10b981", color: "white", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 },
  badgeUnavailable: { display: "inline-block", background: "#ef4444", color: "white", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 },
  badgeImage: { display: "inline-block", background: "rgba(0,0,0,0.6)", color: "white", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 },
  cardOverlay: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.3s ease" },
  viewDetailsBtn: { padding: "12px 24px", background: "#E31B1B", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "14px", cursor: "pointer" },

  cardContent: { padding: "20px", flex: 1, display: "flex", flexDirection: "column" },
  titleArea: { display: "flex", justifyContent: "space-between", alignItems: "start", gap: "8px", marginBottom: "8px" },
  propertyTitle: { fontSize: "16px", fontWeight: 800, color: "#0B2140", margin: 0, flex: 1 },
  priceTag: { fontSize: "14px", fontWeight: 700, color: "#E31B1B", whiteSpace: "nowrap" },

  locationBar: { display: "flex", gap: "8px", marginBottom: "12px", fontSize: "13px", flexWrap: "wrap" },
  location: { color: "#6b7280", fontWeight: 500 },
  county: { color: "#9ca3af", fontSize: "12px" },

  specsRow: { display: "flex", gap: "16px", marginBottom: "12px", padding: "12px 0", borderBottom: "1px solid #f3f4f6" },
  spec: { display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "#4b5563" },
  specIcon: { fontSize: "16px" },

  description: { fontSize: "13px", color: "#6b7280", margin: "0 0 12px", lineHeight: "1.5" },

  amenitiesPreview: { display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" },
  amenityTag: { background: "#f3f4f6", color: "#6b7280", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 500 },

  cardActions: { display: "flex", gap: "8px", marginTop: "auto" },
  primaryBtn: { flex: 1, padding: "12px", background: "#E31B1B", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer", transition: "all 0.3s" },
  secondaryBtn: { flex: 1, padding: "12px", background: "#f3f4f6", color: "#0B2140", border: "1px solid #e5e7eb", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer", transition: "all 0.3s" },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" },

  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" },
  modalContent: { background: "white", borderRadius: "16px", maxWidth: "700px", width: "100%", maxHeight: "90vh", overflowY: "auto", position: "relative" },
  closeBtn: { position: "absolute", top: "16px", right: "16px", background: "white", border: "none", width: "40px", height: "40px", borderRadius: "50%", fontSize: "24px", cursor: "pointer", zIndex: 1001, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },

  modalImageContainer: { position: "relative", width: "100%", height: "350px", background: "#f3f4f6", overflow: "hidden" },
  modalImage: { width: "100%", height: "100%", objectFit: "cover" },
  noImageModal: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" },
  navBtn: { position: "absolute", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.6)", color: "white", border: "none", width: "44px", height: "44px", borderRadius: "50%", fontSize: "20px", cursor: "pointer" },
  imageCounter: { position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.7)", color: "white", padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 },

  thumbnailsContainer: { display: "flex", gap: "8px", padding: "12px", overflowX: "auto", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" },
  thumbnail: { width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px", cursor: "pointer", border: "2px solid transparent", opacity: 0.6, transition: "all 0.3s", flexShrink: 0 },
  activeThumbnail: { opacity: 1, borderColor: "#E31B1B" },

  modalContentWrapper: { padding: "28px" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "start", gap: "12px", marginBottom: "8px" },
  modalTitle: { fontSize: "24px", fontWeight: 800, color: "#0B2140", margin: 0 },
  modalPrice: { fontSize: "18px", fontWeight: 700, color: "#E31B1B", whiteSpace: "nowrap" },
  modalLocation: { fontSize: "14px", color: "#6b7280", marginBottom: "20px" },

  modalSpecsGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "20px" },
  specBox: { background: "#f9fafb", padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb" },
  specLabel: { display: "block", fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", fontWeight: 600, marginBottom: "4px" },
  specValue: { display: "block", fontSize: "16px", fontWeight: 700, color: "#0B2140" },

  infoBox: { display: "flex", justifyContent: "space-between", padding: "12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", marginBottom: "16px" },
  infoLabel: { color: "#166534", fontWeight: 600 },
  infoValue: { color: "#15803d", fontWeight: 700 },

  descriptionSection: { marginBottom: "20px" },
  sectionTitle: { fontSize: "16px", fontWeight: 800, color: "#0B2140", margin: "0 0 12px" },
  descriptionText: { fontSize: "14px", color: "#4b5563", lineHeight: "1.7", margin: 0 },

  amenitiesSection: { marginBottom: "20px" },
  amenitiesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "8px" },
  amenityBadge: { background: "#f3f4f6", color: "#0B2140", padding: "8px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, textAlign: "center" },

  rulesSection: { marginBottom: "20px", padding: "16px", background: "#fef2f2", borderRadius: "8px", borderLeft: "3px solid #E31B1B" },
  rulesText: { fontSize: "13px", color: "#4b5563", lineHeight: "1.6", margin: 0 },

  contactGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "20px" },
  contactBtnGreen: { padding: "14px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer" },
  contactBtnBlue: { padding: "14px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer" },
  contactBtnOrange: { padding: "14px", background: "#f59e0b", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer" },
  contactBtnYellow: { padding: "14px", background: "#E31B1B", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer" },
};

const cssStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  
  * { box-sizing: border-box; }
  
  @keyframes spin { 
    to { transform: rotate(360deg); }
  }
  
  .property-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.12);
    border-color: #E31B1B;
  }
  
  .property-card:hover img {
    transform: scale(1.05);
  }
  
  .property-card:hover [style*="cardOverlay"] {
    opacity: 1 !important;
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
    .filterGrid {
      grid-template-columns: 1fr !important;
    }
  }
`;