import { useState, useEffect } from "react";

// ✅ Use API_BASE like every other file
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

// Helper function to format Kenyan phone numbers (+254)
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
    let filtered = properties;
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
  };
  const closeModal = () => { 
    setSelectedProperty(null); 
    setCurrentImageIndex(0); 
  };
  const nextImage = () => {
    if (selectedProperty?.images?.length > 0)
      setCurrentImageIndex((prev) => (prev + 1) % selectedProperty.images.length);
  };
  const prevImage = () => {
    if (selectedProperty?.images?.length > 0)
      setCurrentImageIndex((prev) => (prev - 1 + selectedProperty.images.length) % selectedProperty.images.length);
  };

  const handleContactLandlord = (property) => {
    let phone = property.owner?.phone || property.phone || "";
    const formattedPhone = formatKenyaPhone(phone);
    const landlordName = property.owner?.name || "Landlord";
    const message = `Hi ${landlordName}, I'm interested in your property "${property.title}" located in ${property.location}. Can you provide more details?`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleBookNow = (property) => {
    let phone = property.owner?.phone || property.phone || "";
    const formattedPhone = formatKenyaPhone(phone);
    const message = `Hello,\n\nI want to BOOK this property right now:\n\n` +
                    `🏠 ${property.title}\n` +
                    `📍 ${property.county} - ${property.location}\n` +
                    `💰 KES ${property.price?.toLocaleString()}/month\n` +
                    `🛏 ${property.bedrooms} Bedrooms | 🚿 ${property.bathrooms} Bathrooms\n` +
                    `📊 Available: ${property.availableUnits} units\n\n` +
                    `Please confirm availability and let me know the next steps for booking. Thank you!`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  // ✅ NEW: SMS Booking
  const handleSendSMS = (property) => {
    let phone = property.owner?.phone || property.phone || "";
    const formattedPhone = formatKenyaPhone(phone);
    const message = `Hello, I want to BOOK this property:\n` +
                    `${property.title}\n` +
                    `${property.county} - ${property.location}\n` +
                    `KES ${property.price?.toLocaleString()}/month\n` +
                    `${property.bedrooms} Bed | ${property.bathrooms} Bath\n` +
                    `Available: ${property.availableUnits} units\n\n` +
                    `Please reply with availability and booking details. Thank you!`;
    window.open(`sms:${formattedPhone}?body=${encodeURIComponent(message)}`, "_blank");
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
          <input type="number" name="minPrice" placeholder="Min Price" value={filters.minPrice} onChange={handleFilterChange} style={styles.filterInput} />
          <span style={styles.priceSeparator}>-</span>
          <input type="number" name="maxPrice" placeholder="Max Price" value={filters.maxPrice} onChange={handleFilterChange} style={styles.filterInput} />
        </div>
      </div>

      <div style={styles.resultsCount}>Found {filteredProperties.length} {filteredProperties.length === 1 ? "property" : "properties"}</div>

      {filteredProperties.length === 0 && (
        <div style={styles.noResults}>
          <p>No properties match your filters. Try adjusting your search! 🔍</p>
        </div>
      )}

      <div style={styles.grid}>
        {filteredProperties.map((property) => (
          <div key={property._id} style={styles.card}>
            <div style={styles.imageContainer} onClick={() => openModal(property)}>
              {property.images?.length > 0 ? (
                <img src={property.images[0]} alt={property.title} style={styles.image} />
              ) : (
                <div style={styles.noImage}>📷 No Image</div>
              )}
              <div style={{ ...styles.availabilityBadge, ...(property.availableUnits > 0 ? styles.availableBadge : styles.unavailableBadge) }}>
                {property.availableUnits > 0 ? <>✅ {property.availableUnits} Available</> : <>❌ Fully Booked</>}
              </div>
            </div>
            <div style={styles.content}>
              <h2 style={styles.title}>{property.title}</h2>
              <p style={styles.location}>📍 {property.county} • {property.location}</p>
              <div style={styles.specs}>
                <span style={styles.spec}>🛏️ {property.bedrooms} Bed</span>
                <span style={styles.spec}>🚿 {property.bathrooms} Bath</span>
                <span style={styles.spec}>{property.furnished ? "🪑 Furnished" : "📦 Unfurnished"}</span>
              </div>
              <div style={styles.price}>💰 KES {property.price?.toLocaleString()}/month</div>
              <p style={styles.description}>{property.description?.substring(0, 80)}...</p>
              <button style={styles.viewBtn} onClick={() => openModal(property)}>👁️ View Details</button>
            </div>
          </div>
        ))}
      </div>

      {/* ====================== MODAL ====================== */}
      {selectedProperty && (
        <div style={styles.modal} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={closeModal}>✕</button>

            <div style={styles.modalImage}>
              {selectedProperty.images?.length > 0 ? (
                <img src={selectedProperty.images[currentImageIndex]} alt={selectedProperty.title} style={styles.modalImg} />
              ) : (
                <div style={styles.noImage}>📷 No Images Available</div>
              )}
              {selectedProperty.images?.length > 1 && (
                <>
                  <button style={styles.prevBtn} onClick={prevImage}>❮</button>
                  <button style={styles.nextBtn} onClick={nextImage}>❯</button>
                </>
              )}
            </div>

            <div style={styles.modalDetails}>
              <h2 style={styles.modalTitle}>{selectedProperty.title}</h2>
              <p style={styles.modalLocation}>📍 {selectedProperty.county} • {selectedProperty.location}</p>

              <div style={styles.specs}>
                <span style={styles.spec}>🛏️ {selectedProperty.bedrooms} Bedrooms</span>
                <span style={styles.spec}>🚿 {selectedProperty.bathrooms} Bathrooms</span>
                <span style={styles.spec}>{selectedProperty.furnished ? "🪑 Furnished" : "📦 Unfurnished"}</span>
              </div>

              <div style={styles.price}>💰 KES {selectedProperty.price?.toLocaleString()}/month</div>

              <p style={styles.fullDescription}>{selectedProperty.description}</p>

              {/* Landlord Contact - Hidden as requested */}
              <div style={styles.landlordInfo}>
                <h3 style={styles.landlordHead}>👤 Landlord Contact</h3>
                <p style={styles.landlordDetail}><strong>Name:</strong> </p>
                <p style={styles.landlordDetail}><strong>Phone:</strong> </p>
              </div>

              {/* 4 Action Buttons */}
              <div style={styles.contactButtonsContainer}>
                <button style={styles.whatsappBtn} onClick={() => handleContactLandlord(selectedProperty)}>
                  💬 WhatsApp
                </button>
                <button style={styles.callBtn} onClick={() => window.open(`tel:${selectedProperty.owner?.phone || selectedProperty.phone}`)}>
                  📞 Call
                </button>
                <button style={styles.smsBtn} onClick={() => handleSendSMS(selectedProperty)}>
                  📱 Send SMS
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

/* ====================== FULL STYLES ====================== */
const styles = {
  container: { maxWidth: "1200px", margin: "0 auto", padding: "20px", background: "linear-gradient(135deg, #06101f 0%, #0f1729 100%)", minHeight: "100vh", fontFamily: "'DM Sans', system-ui" },
  header: { textAlign: "center", marginBottom: "40px", color: "#f1f5f9" },
  heading: { fontSize: "2.5rem", margin: 0, color: "#fbbf24", fontWeight: 700 },
  tagline: { fontSize: "1.1rem", color: "#94a3b8", marginTop: "8px" },
  filters: { display: "flex", gap: "12px", marginBottom: "32px", flexWrap: "wrap" },
  filterInput: { padding: "12px", border: "1px solid #334155", borderRadius: "8px", background: "#1e293b", color: "#f1f5f9", flex: 1, minWidth: "160px" },
  filterSelect: { padding: "12px", border: "1px solid #334155", borderRadius: "8px", background: "#1e293b", color: "#f1f5f9" },
  priceRange: { display: "flex", gap: "8px", alignItems: "center" },
  priceSeparator: { color: "#94a3b8" },
  resultsCount: { color: "#94a3b8", marginBottom: "20px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" },
  card: { background: "#1e293b", borderRadius: "12px", overflow: "hidden", border: "1px solid #334155" },
  imageContainer: { position: "relative", height: "200px", cursor: "pointer" },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  noImage: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#334155", color: "#94a3b8" },
  availabilityBadge: { position: "absolute", top: "12px", left: "12px", padding: "6px 12px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 600 },
  availableBadge: { background: "#10b981", color: "white" },
  unavailableBadge: { background: "#ef4444", color: "white" },
  content: { padding: "20px" },
  title: { color: "#f1f5f9", fontSize: "1.25rem", margin: "0 0 8px 0" },
  location: { color: "#94a3b8", margin: "0 0 12px 0" },
  specs: { display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "12px" },
  spec: { color: "#cbd5e1", fontSize: "0.9rem" },
  price: { color: "#fbbf24", fontSize: "1.25rem", fontWeight: 700, margin: "8px 0" },
  description: { color: "#cbd5e1", fontSize: "0.9rem", lineHeight: "1.5" },
  viewBtn: { padding: "12px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", width: "100%", marginTop: "12px", cursor: "pointer", fontWeight: 600 },

  modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" },
  modalContent: { background: "#1e293b", borderRadius: "12px", maxWidth: "620px", width: "100%", maxHeight: "90vh", overflowY: "auto", border: "1px solid #475569" },
  closeBtn: { position: "absolute", top: "16px", right: "16px", background: "rgba(0,0,0,0.7)", color: "white", border: "none", width: "40px", height: "40px", borderRadius: "50%", fontSize: "1.4rem", cursor: "pointer", zIndex: 10 },
  modalImage: { position: "relative", height: "320px", background: "#0f1729" },
  modalImg: { width: "100%", height: "100%", objectFit: "cover" },
  prevBtn: { position: "absolute", top: "50%", left: "16px", transform: "translateY(-50%)", background: "rgba(0,0,0,0.6)", color: "white", border: "none", width: "44px", height: "44px", borderRadius: "50%", cursor: "pointer", fontSize: "1.5rem" },
  nextBtn: { position: "absolute", top: "50%", right: "16px", transform: "translateY(-50%)", background: "rgba(0,0,0,0.6)", color: "white", border: "none", width: "44px", height: "44px", borderRadius: "50%", cursor: "pointer", fontSize: "1.5rem" },
  modalDetails: { padding: "24px" },
  modalTitle: { color: "#fbbf24", fontSize: "1.6rem", margin: "0 0 8px 0" },
  modalLocation: { color: "#94a3b8", marginBottom: "16px" },
  fullDescription: { color: "#cbd5e1", lineHeight: "1.7", margin: "20px 0" },
  landlordInfo: { margin: "20px 0", padding: "16px", background: "rgba(139, 92, 246, 0.1)", borderRadius: "8px" },
  landlordHead: { margin: "0 0 10px 0", color: "#8b5cf6" },
  landlordDetail: { color: "#cbd5e1", margin: "6px 0" },
  contactButtonsContainer: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginTop: "24px" },
  whatsappBtn: { padding: "14px", background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" },
  callBtn: { padding: "14px", background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" },
  smsBtn: { padding: "14px", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" },
  bookBtn: { padding: "14px", background: "linear-gradient(135deg, #eab308, #ca8a04)", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" },
};

const cssStyles = `
  * { box-sizing: border-box; }
  button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.3); }
  @media (max-width: 768px) {
    [style*="gridTemplateColumns"] { grid-template-columns: 1fr !important; }
  }
`;