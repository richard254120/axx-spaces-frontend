import { useState, useEffect } from "react";

// ✅ Use API_BASE like every other file
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

// Helper function to format Kenyan phone numbers
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

  const [filters, setFilters] = useState({
    location: "",
    minPrice: 0,
    maxPrice: 1000000,
    bedrooms: "",
    bathrooms: "",
    furnished: "",
    showOnlyFeatured: false,
  });

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch Properties
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
      
        setProperties(processedProperties);
        setFilteredProperties(processedProperties.filter((prop) => prop.availableUnits > 0));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Apply Filters + Boosted Priority
  useEffect(() => {
    let filtered = [...properties];

    if (filters.showOnlyFeatured) {
      filtered = filtered.filter((p) => 
        p.isFeatured && 
        p.promotionEndDate && 
        new Date(p.promotionEndDate) > new Date()
      );
    }

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

    // Sort: Boosted properties appear first
    filtered.sort((a, b) => {
      const aBoosted = a.isFeatured && new Date(a.promotionEndDate || 0) > new Date();
      const bBoosted = b.isFeatured && new Date(b.promotionEndDate || 0) > new Date();
      if (aBoosted && !bBoosted) return -1;
      if (!aBoosted && bBoosted) return 1;
      return 0;
    });

    setFilteredProperties(filtered);
  }, [filters, properties]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : 
               (name === "minPrice" || name === "maxPrice") ? parseFloat(value) || 0 : value,
    }));
  };

  const openModal = (property) => {
    setSelectedProperty(property);
    setCurrentImageIndex(0);
  };

  const closeModal = () => {
    setSelectedProperty(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedProperty?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedProperty.images.length);
    }
  };

  const prevImage = () => {
    if (selectedProperty?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedProperty.images.length) % selectedProperty.images.length);
    }
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
                    `Please confirm availability. Thank you!`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleSendSMS = (property) => {
    const phoneNumber = formatKenyaPhone(property.owner?.phone || property.phone || "");
    const message = `Hello, I want to BOOK this property:\n${property.title}\n${property.county} - ${property.location}\nKES ${property.price?.toLocaleString()}/month\nAvailable: ${property.availableUnits} units`;
    window.open(`sms:${phoneNumber}?body=${encodeURIComponent(message)}`, "_blank");
  };

  const isBoosted = (property) => {
    return property.isFeatured && 
           property.promotionEndDate && 
           new Date(property.promotionEndDate) > new Date();
  };

  const leaseLabel = { monthly: "Monthly", "6months": "6 Months", yearly: "Yearly" };

  if (loading) {
    return (
      <div style={styles.container}>
        <style>{cssStyles}</style>
        <p style={styles.loading}>⏳ Loading properties...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{cssStyles}</style>

      <div style={styles.header}>
        <h1 style={styles.heading}>🏢 Available Properties</h1>
        <p style={styles.tagline}>Find your perfect rental home in Kenya</p>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.filters}>
        <label style={styles.featuredToggle}>
          <input
            type="checkbox"
            name="showOnlyFeatured"
            checked={filters.showOnlyFeatured}
            onChange={handleFilterChange}
          />
          🔥 Show Only Boosted Properties
        </label>

        <input
          type="text"
          name="location"
          placeholder="📍 Filter by location or county..."
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
          <option value="">Furnished or not</option>
          <option value="true">Furnished</option>
          <option value="false">Unfurnished</option>
        </select>

        <div style={styles.priceRange}>
          <input 
            type="number" 
            name="minPrice" 
            placeholder="Min Price" 
            value={filters.minPrice} 
            onChange={handleFilterChange} 
            style={styles.filterInput} 
          />
          <span style={styles.priceSeparator}>-</span>
          <input 
            type="number" 
            name="maxPrice" 
            placeholder="Max Price" 
            value={filters.maxPrice} 
            onChange={handleFilterChange} 
            style={styles.filterInput} 
          />
        </div>
      </div>

      <div style={styles.resultsCount}>
        Found {filteredProperties.length} {filteredProperties.length === 1 ? "property" : "properties"}
      </div>

      {filteredProperties.length === 0 && (
        <div style={styles.noResults}>
          <p>No properties match your filters. Try adjusting your search! 🔍</p>
        </div>
      )}

      {filteredProperties.length > 0 && (
        <div style={styles.grid}>
          {filteredProperties.map((property) => {
            const boosted = isBoosted(property);
            return (
              <div key={property._id} style={styles.card}>
                <div style={styles.imageContainer} onClick={() => openModal(property)}>
                  {property.images?.length > 0 ? (
                    <img src={property.images[0]} alt={property.title} style={styles.image} />
                  ) : (
                    <div style={styles.noImage}>📷 No Image</div>
                  )}

                  {boosted && <div style={styles.boostedBadge}>⭐ BOOSTED</div>}

                  <div style={{
                    ...styles.availabilityBadge,
                    ...(property.availableUnits > 0 ? styles.availableBadge : styles.unavailableBadge)
                  }}>
                    {property.availableUnits > 0 ? <>✅ {property.availableUnits} Available</> : <>❌ Fully Booked</>}
                  </div>

                  {property.images?.length > 1 && (
                    <div style={styles.imageCount}>📷 {property.images.length}</div>
                  )}
                </div>

                <div style={styles.content}>
                  <h2 style={styles.title}>
                    {property.title} {boosted && "⭐"}
                  </h2>

                  <p style={styles.location}>
                    📍 {property.county} • {property.location}
                  </p>

                  <div style={styles.specs}>
                    <span style={styles.spec}>🛏️ {property.bedrooms} Bed</span>
                    <span style={styles.spec}>🚿 {property.bathrooms} Bath</span>
                    <span style={styles.spec}>{property.furnished ? "🪑 Furnished" : "📦 Unfurnished"}</span>
                  </div>

                  <div style={styles.price}>💰 KES {property.price?.toLocaleString()}/month</div>
                  <p style={styles.description}>{property.description?.substring(0, 80)}...</p>

                  <div style={styles.unitInfo}>
                    <div><span style={styles.unitLabel}>Total Units</span><span style={styles.unitValue}>{property.totalUnits || 1}</span></div>
                    <div><span style={styles.unitLabel}>Booked</span><span style={styles.unitValue}>{property.bookedUnits || 0}</span></div>
                    <div><span style={styles.unitLabel}>Available</span><strong style={styles.unitValueBold}>{property.availableUnits}</strong></div>
                  </div>

                  {property.amenities?.length > 0 && (
                    <div style={styles.amenitiesPreview}>
                      {property.amenities.slice(0, 2).map((amenity, idx) => (
                        <span key={idx} style={styles.amenityChip}>✓ {amenity}</span>
                      ))}
                      {property.amenities.length > 2 && (
                        <span style={styles.amenityChip}>+{property.amenities.length - 2} more</span>
                      )}
                    </div>
                  )}

                  <button
                    style={{ ...styles.contactBtn, ...(property.availableUnits === 0 ? styles.contactBtnDisabled : {}) }}
                    onClick={() => handleContactLandlord(property)}
                    disabled={property.availableUnits === 0}
                  >
                    💬 Contact via WhatsApp
                  </button>
                  <button style={styles.viewBtn} onClick={() => openModal(property)}>
                    👁️ View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal - Your Original Modal (Unchanged) */}
      {selectedProperty && (
        <div style={styles.modal} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={closeModal}>✕</button>

            <div style={styles.modalImage}>
              {selectedProperty.images?.length > 0 ? (
                <>
                  <img 
                    src={selectedProperty.images[currentImageIndex]} 
                    alt={selectedProperty.title} 
                    style={styles.modalImg} 
                  />
                  {selectedProperty.images.length > 1 && (
                    <>
                      <button style={styles.prevBtn} onClick={prevImage}>❮</button>
                      <button style={styles.nextBtn} onClick={nextImage}>❯</button>
                      <div style={styles.imageCounter}>
                        {currentImageIndex + 1} / {selectedProperty.images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div style={styles.noImage}>📷 No Images Available</div>
              )}
            </div>

            {selectedProperty.images?.length > 1 && (
              <div style={styles.thumbnails}>
                {selectedProperty.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    style={{ 
                      ...styles.thumbnail, 
                      ...(idx === currentImageIndex ? styles.activeThumbnail : {}) 
                    }}
                    onClick={() => setCurrentImageIndex(idx)}
                  />
                ))}
              </div>
            )}

            <div style={styles.modalDetails}>
              <h2 style={styles.modalTitle}>{selectedProperty.title}</h2>
              <p style={styles.modalLocation}>
                📍 {selectedProperty.county} • {selectedProperty.location}
              </p>

              <div style={styles.specs}>
                <span style={styles.spec}>🛏️ {selectedProperty.bedrooms} Bedrooms</span>
                <span style={styles.spec}>🚿 {selectedProperty.bathrooms} Bathrooms</span>
                <span style={styles.spec}>{selectedProperty.furnished ? "🪑 Furnished" : "📦 Unfurnished"}</span>
              </div>

              {/* Pricing, Description, Amenities, etc. - kept as original */}
              <div style={styles.pricingRow}>
                <div style={styles.pricingBox}>
                  <span style={styles.pricingLabel}>Monthly Rent</span>
                  <span style={styles.pricingValue}>KES {selectedProperty.price?.toLocaleString()}</span>
                </div>
              </div>

              <p style={styles.fullDescription}>{selectedProperty.description}</p>

              {/* Contact Buttons */}
              <div style={styles.contactButtonsContainer}>
                <button style={styles.whatsappBtn} onClick={() => handleContactLandlord(selectedProperty)}>
                  💬 WhatsApp
                </button>
                <button style={styles.callBtn} onClick={() => window.open(`tel:${selectedProperty.owner?.phone || selectedProperty.phone}`)}>
                  📞 Call
                </button>
                <button style={styles.smsBtn} onClick={() => handleSendSMS(selectedProperty)}>
                  📱 SMS
                </button>
                <button style={styles.bookBtn} onClick={() => handleBookNow(selectedProperty)}>
                  🚀 Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================== STYLES ==================== */
const styles = {
  container: { 
    maxWidth: "1200px", 
    margin: "0 auto", 
    padding: "20px", 
    background: "linear-gradient(135deg, #06101f 0%, #0f1729 100%)", 
    minHeight: "100vh", 
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont" 
  },
  header: { textAlign: "center", marginBottom: "40px", color: "#f1f5f9" },
  heading: { fontSize: "2.5rem", margin: 0, color: "#fbbf24", fontWeight: 700 },
  tagline: { fontSize: "1rem", color: "#94a3b8", marginTop: "8px" },
  error: { background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", color: "#fca5a5", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", textAlign: "center" },
  loading: { textAlign: "center", color: "#94a3b8", fontSize: "1.1rem", padding: "60px 20px" },

  filters: { display: "flex", gap: "12px", marginBottom: "32px", flexWrap: "wrap", alignItems: "center" },
  featuredToggle: { display: "flex", alignItems: "center", gap: "8px", color: "#fbbf24", fontWeight: "600", cursor: "pointer" },
  filterInput: { padding: "10px 14px", border: "1px solid #334155", borderRadius: "6px", background: "#1e293b", color: "#f1f5f9", fontSize: "0.95rem", minWidth: "150px" },
  filterSelect: { padding: "10px 14px", border: "1px solid #334155", borderRadius: "6px", background: "#1e293b", color: "#f1f5f9", fontSize: "0.95rem", minWidth: "140px" },
  priceRange: { display: "flex", gap: "8px", alignItems: "center" },
  priceSeparator: { color: "#94a3b8", fontWeight: 600 },

  resultsCount: { color: "#94a3b8", marginBottom: "20px", fontSize: "0.95rem" },
  noResults: { textAlign: "center", color: "#94a3b8", padding: "60px 20px", background: "rgba(30, 41, 59, 0.5)", borderRadius: "12px", border: "2px dashed #475569" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" },

  card: { 
    background: "linear-gradient(135deg, #1e293b 0%, #0f1729 100%)", 
    border: "1px solid #334155", 
    borderRadius: "12px", 
    overflow: "hidden", 
    transition: "all 0.3s ease", 
    display: "flex", 
    flexDirection: "column", 
    height: "100%" 
  },

  imageContainer: { position: "relative", width: "100%", height: "200px", overflow: "hidden", background: "#0f1729", cursor: "pointer" },
  image: { width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" },
  noImage: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#334155", color: "#94a3b8", fontWeight: 600 },
  boostedBadge: { 
    position: "absolute", 
    top: "12px", 
    right: "12px", 
    background: "#eab308", 
    color: "#000", 
    padding: "6px 12px", 
    borderRadius: "20px", 
    fontSize: "0.8rem", 
    fontWeight: "700", 
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    zIndex: 2 
  },
  availabilityBadge: { position: "absolute", top: "12px", left: "12px", padding: "8px 14px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 600 },
  availableBadge: { background: "#10b981", color: "white" },
  unavailableBadge: { background: "#ef4444", color: "white" },
  imageCount: { position: "absolute", bottom: "12px", right: "12px", background: "rgba(0,0,0,0.6)", color: "white", padding: "6px 12px", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 600 },

  content: { padding: "20px", flex: 1, display: "flex", flexDirection: "column" },
  title: { color: "#f1f5f9", fontSize: "1.2rem", margin: "0 0 8px 0", wordBreak: "break-word" },
  location: { color: "#94a3b8", margin: "0 0 12px 0", fontSize: "0.9rem" },
  specs: { display: "flex", gap: "10px", margin: "12px 0", flexWrap: "wrap" },
  spec: { color: "#cbd5e1", fontSize: "0.85rem" },
  price: { color: "#fbbf24", fontSize: "1.1rem", fontWeight: 700, margin: "8px 0" },
  description: { color: "#cbd5e1", fontSize: "0.85rem", margin: "8px 0", lineHeight: "1.4" },

  unitInfo: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", padding: "12px", background: "rgba(59, 130, 246, 0.1)", borderRadius: "6px", margin: "12px 0", fontSize: "0.8rem", color: "#cbd5e1" },
  unitLabel: { color: "#94a3b8", display: "block", fontSize: "0.75rem", marginBottom: "2px" },
  unitValue: { display: "block", fontWeight: 600 },
  unitValueBold: { display: "block", color: "#22c55e", fontWeight: 700, fontSize: "1rem" },

  amenitiesPreview: { display: "flex", flexWrap: "wrap", gap: "6px", margin: "8px 0" },
  amenityChip: { background: "rgba(139, 92, 246, 0.2)", color: "#cbd5e1", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 500 },

  contactBtn: { padding: "10px 12px", background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", color: "white", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem", marginTop: "8px" },
  contactBtnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  viewBtn: { padding: "10px 12px", background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", color: "white", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem", marginTop: "6px" },

  /* Modal Styles */
  modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" },
  modalContent: { background: "linear-gradient(135deg, #1e293b 0%, #0f1729 100%)", borderRadius: "12px", maxWidth: "600px", width: "100%", maxHeight: "90vh", overflowY: "auto", border: "1px solid #334155" },
  closeBtn: { position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.6)", border: "none", color: "white", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontSize: "1.2rem", zIndex: 1001 },
  modalImage: { position: "relative", width: "100%", height: "300px", overflow: "hidden", background: "#0f1729" },
  modalImg: { width: "100%", height: "100%", objectFit: "cover" },
  prevBtn: { position: "absolute", top: "50%", left: "12px", transform: "translateY(-50%)", background: "rgba(0,0,0,0.6)", border: "none", color: "white", width: "40px", height: "40px", borderRadius: "50%", cursor: "pointer" },
  nextBtn: { position: "absolute", top: "50%", right: "12px", transform: "translateY(-50%)", background: "rgba(0,0,0,0.6)", border: "none", color: "white", width: "40px", height: "40px", borderRadius: "50%", cursor: "pointer" },
  imageCounter: { position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.6)", color: "white", padding: "4px 12px", borderRadius: "12px" },
  thumbnails: { display: "flex", gap: "8px", padding: "12px", overflowX: "auto", background: "#0f1729" },
  thumbnail: { width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px", cursor: "pointer", opacity: 0.6, border: "2px solid transparent", flexShrink: 0 },
  activeThumbnail: { opacity: 1, borderColor: "#fbbf24" },

  modalDetails: { padding: "24px", color: "#f1f5f9" },
  modalTitle: { fontSize: "1.5rem", margin: "0 0 8px 0", color: "#fbbf24" },
  modalLocation: { color: "#94a3b8", marginBottom: "16px" },
  pricingRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "12px", margin: "16px 0" },
  pricingBox: { background: "rgba(251, 191, 36, 0.1)", border: "1px solid rgba(251, 191, 36, 0.2)", borderRadius: "8px", padding: "12px", textAlign: "center" },
  pricingLabel: { display: "block", color: "#94a3b8", fontSize: "0.75rem", marginBottom: "4px" },
  pricingValue: { display: "block", color: "#fbbf24", fontWeight: 700, fontSize: "1rem" },
  fullDescription: { color: "#cbd5e1", lineHeight: "1.6", margin: "16px 0" },

  contactButtonsContainer: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginTop: "20px" },
  whatsappBtn: { padding: "14px", background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" },
  callBtn: { padding: "14px", background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" },
  smsBtn: { padding: "14px", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" },
  bookBtn: { padding: "14px", background: "linear-gradient(135deg, #eab308, #ca8a04)", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" },
};

const cssStyles = `
  * { box-sizing: border-box; }
  button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
  input:focus, select:focus { outline: none; border-color: #fbbf24 !important; box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1) !important; }
  @media (max-width: 768px) {
    [style*="gridTemplateColumns"] { grid-template-columns: 1fr !important; }
  }
`;