import { useState, useEffect } from "react";

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
  });
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("/api/properties");
        if (!response.ok) throw new Error("Failed to fetch properties");
        const data = await response.json();

        // Filter only properties with available units
        const availableProperties = data.filter((prop) => prop.availableUnits > 0);

        setProperties(availableProperties);
        setFilteredProperties(availableProperties);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = properties;

    if (filters.location) {
      filtered = filtered.filter((p) =>
        p.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.bedrooms) {
      filtered = filtered.filter((p) => p.bedrooms === parseInt(filters.bedrooms));
    }

    if (filters.bathrooms) {
      filtered = filtered.filter((p) => p.bathrooms === parseInt(filters.bathrooms));
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
    if (selectedProperty?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedProperty.images.length);
    }
  };

  const prevImage = () => {
    if (selectedProperty?.images?.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + selectedProperty.images.length) % selectedProperty.images.length
      );
    }
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  const handleContactLandlord = (property) => {
    const phoneNumber = property.owner?.phone?.replace(/\D/g, "") || property.phone?.replace(/\D/g, "");
    const landlordName = property.owner?.name || "Landlord";
    const message = `Hi ${landlordName}, I'm interested in your property "${property.title}" located in ${property.location}. Can you provide more details?`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

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

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.heading}>🏢 Available Properties</h1>
        <p style={styles.tagline}>Find your perfect rental home in Kenya</p>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* Filters */}
      <div style={styles.filters}>
        <input
          type="text"
          name="location"
          placeholder="📍 Filter by location..."
          value={filters.location}
          onChange={handleFilterChange}
          style={styles.filterInput}
        />

        <select
          name="bedrooms"
          value={filters.bedrooms}
          onChange={handleFilterChange}
          style={styles.filterSelect}
        >
          <option value="">All Bedrooms</option>
          <option value="1">1 Bedroom</option>
          <option value="2">2 Bedrooms</option>
          <option value="3">3 Bedrooms</option>
          <option value="4">4+ Bedrooms</option>
        </select>

        <select
          name="bathrooms"
          value={filters.bathrooms}
          onChange={handleFilterChange}
          style={styles.filterSelect}
        >
          <option value="">All Bathrooms</option>
          <option value="1">1 Bathroom</option>
          <option value="2">2 Bathrooms</option>
          <option value="3">3+ Bathrooms</option>
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

      {/* Results Count */}
      <div style={styles.resultsCount}>
        Found {filteredProperties.length} properties
      </div>

      {/* No Results */}
      {filteredProperties.length === 0 && (
        <div style={styles.noResults}>
          <p>No properties match your filters. Try adjusting your search! 🔍</p>
        </div>
      )}

      {/* Properties Grid */}
      {filteredProperties.length > 0 && (
        <div style={styles.grid}>
          {filteredProperties.map((property) => (
            <div key={property._id} style={styles.card}>
              {/* Image Container */}
              <div
                style={styles.imageContainer}
                onClick={() => openModal(property)}
              >
                {property.images?.length > 0 ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    style={styles.image}
                  />
                ) : (
                  <div style={styles.noImage}>📷 No Image</div>
                )}

                {/* Availability Badge */}
                <div
                  style={{
                    ...styles.availabilityBadge,
                    ...(property.availableUnits > 0
                      ? styles.availableBadge
                      : styles.unavailableBadge),
                  }}
                >
                  {property.availableUnits > 0 ? (
                    <>✅ {property.availableUnits} Available</>
                  ) : (
                    <>❌ Fully Booked</>
                  )}
                </div>

                {/* Image Count */}
                {property.images?.length > 1 && (
                  <div style={styles.imageCount}>📷 {property.images.length}</div>
                )}
              </div>

              {/* Card Content */}
              <div style={styles.content}>
                <h2 style={styles.title}>{property.title}</h2>
                <p style={styles.location}>📍 {property.location}</p>

                {/* Specs */}
                <div style={styles.specs}>
                  <span style={styles.spec}>🛏️ {property.bedrooms} Bed</span>
                  <span style={styles.spec}>🚿 {property.bathrooms} Bath</span>
                </div>

                {/* Price */}
                <div style={styles.price}>
                  💰 KES {property.price?.toLocaleString()}/month
                </div>

                {/* Description */}
                <p style={styles.description}>
                  {property.description?.substring(0, 80)}...
                </p>

                {/* Unit Info */}
                <div style={styles.unitInfo}>
                  <div>
                    <span style={styles.unitLabel}>Total Units:</span>
                    <span style={styles.unitValue}>{property.totalUnits}</span>
                  </div>
                  <div>
                    <span style={styles.unitLabel}>Booked:</span>
                    <span style={styles.unitValue}>{property.bookedUnits}</span>
                  </div>
                  <div>
                    <span style={styles.unitLabel}>Available:</span>
                    <strong style={styles.unitValueBold}>{property.availableUnits}</strong>
                  </div>
                </div>

                {/* Amenities Preview */}
                {property.amenities?.length > 0 && (
                  <div style={styles.amenitiesPreview}>
                    {property.amenities.slice(0, 2).map((amenity, idx) => (
                      <span key={idx} style={styles.amenityChip}>
                        ✓ {amenity}
                      </span>
                    ))}
                    {property.amenities.length > 2 && (
                      <span style={styles.amenityChip}>
                        +{property.amenities.length - 2} more
                      </span>
                    )}
                  </div>
                )}

                {/* Buttons */}
                <button
                  style={{
                    ...styles.contactBtn,
                    ...(property.availableUnits === 0 ? styles.contactBtnDisabled : {}),
                  }}
                  onClick={() => handleContactLandlord(property)}
                  disabled={property.availableUnits === 0}
                >
                  💬 Contact via WhatsApp
                </button>

                <button
                  style={styles.viewBtn}
                  onClick={() => openModal(property)}
                >
                  👁️ View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedProperty && (
        <div style={styles.modal} onClick={closeModal}>
          <div
            style={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button style={styles.closeBtn} onClick={closeModal}>
              ✕
            </button>

            {/* Image Gallery */}
            <div style={styles.modalImage}>
              {selectedProperty.images?.length > 0 ? (
                <>
                  <img
                    src={selectedProperty.images[currentImageIndex]}
                    alt={`${selectedProperty.title} ${currentImageIndex + 1}`}
                    style={styles.modalImg}
                  />

                  {selectedProperty.images.length > 1 && (
                    <>
                      <button
                        style={styles.prevBtn}
                        onClick={prevImage}
                      >
                        ❮
                      </button>
                      <button
                        style={styles.nextBtn}
                        onClick={nextImage}
                      >
                        ❯
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div style={styles.noImage}>📷 No Images Available</div>
              )}
            </div>

            {/* Thumbnails */}
            {selectedProperty.images?.length > 1 && (
              <div style={styles.thumbnails}>
                {selectedProperty.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    style={{
                      ...styles.thumbnail,
                      ...(idx === currentImageIndex ? styles.activeThumbnail : {}),
                    }}
                    onClick={() => goToImage(idx)}
                  />
                ))}
              </div>
            )}

            {/* Details */}
            <div style={styles.modalDetails}>
              <h2 style={styles.modalTitle}>{selectedProperty.title}</h2>
              <p style={styles.modalLocation}>📍 {selectedProperty.location}</p>

              <div style={styles.specs}>
                <span style={styles.spec}>🛏️ {selectedProperty.bedrooms} Bedrooms</span>
                <span style={styles.spec}>🚿 {selectedProperty.bathrooms} Bathrooms</span>
              </div>

              <p style={styles.modalPrice}>
                💰 KES {selectedProperty.price?.toLocaleString()}/month
              </p>

              <p style={styles.fullDescription}>
                {selectedProperty.description}
              </p>

              {/* Amenities */}
              {selectedProperty.amenities?.length > 0 && (
                <div style={styles.amenitiesSection}>
                  <h3 style={styles.amenitiesHead}>✨ Amenities</h3>
                  <ul style={styles.amenitiesList}>
                    {selectedProperty.amenities.map((amenity, idx) => (
                      <li key={idx} style={styles.amenityItem}>
                        ✓ {amenity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Unit Info */}
              <div style={styles.unitInfoModal}>
                <h3 style={styles.unitHeading}>📊 Availability</h3>
                <div style={styles.unitGrid}>
                  <div style={styles.unitBox}>
                    <p style={styles.unitBoxLabel}>Total Units</p>
                    <p style={styles.unitBoxNumber}>{selectedProperty.totalUnits}</p>
                  </div>
                  <div style={styles.unitBox}>
                    <p style={styles.unitBoxLabel}>Booked</p>
                    <p style={styles.unitBoxNumber}>{selectedProperty.bookedUnits}</p>
                  </div>
                  <div style={styles.unitBox}>
                    <p style={styles.unitBoxLabel}>Available</p>
                    <p style={styles.unitBoxNumber}>{selectedProperty.availableUnits}</p>
                  </div>
                </div>
              </div>

              {/* Landlord Info */}
              <div style={styles.landlordInfo}>
                <h3 style={styles.landlordHead}>👤 Landlord Contact</h3>
                <p style={styles.landlordDetail}>
                  <strong>Name:</strong> {selectedProperty.owner?.name}
                </p>
                <p style={styles.landlordDetail}>
                  <strong>Phone:</strong> {selectedProperty.owner?.phone}
                </p>
              </div>

              {/* Contact Buttons */}
              <div style={styles.contactButtonsContainer}>
                <button
                  style={{
                    ...styles.whatsappBtn,
                    ...(selectedProperty.availableUnits === 0
                      ? styles.contactBtnDisabled
                      : {}),
                  }}
                  onClick={() => handleContactLandlord(selectedProperty)}
                  disabled={selectedProperty.availableUnits === 0}
                >
                  💬 Contact via WhatsApp
                </button>
                <button
                  style={styles.callBtn}
                  onClick={() =>
                    window.open(`tel:${selectedProperty.owner?.phone}`)
                  }
                >
                  📞 Call Landlord
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
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    background: "linear-gradient(135deg, #06101f 0%, #0f1729 100%)",
    minHeight: "100vh",
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
    color: "#f1f5f9",
  },
  heading: {
    fontSize: "2.5rem",
    margin: 0,
    color: "#fbbf24",
    fontWeight: 700,
  },
  tagline: {
    fontSize: "1rem",
    color: "#94a3b8",
    marginTop: "8px",
  },
  error: {
    background: "#ef4444",
    color: "white",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    textAlign: "center",
    fontWeight: 500,
  },
  loading: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "1.1rem",
    padding: "60px 20px",
  },
  filters: {
    display: "flex",
    gap: "12px",
    marginBottom: "32px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  filterInput: {
    padding: "10px 14px",
    border: "1px solid #334155",
    borderRadius: "6px",
    background: "#1e293b",
    color: "#f1f5f9",
    fontSize: "0.95rem",
    minWidth: "150px",
  },
  filterSelect: {
    padding: "10px 14px",
    border: "1px solid #334155",
    borderRadius: "6px",
    background: "#1e293b",
    color: "#f1f5f9",
    fontSize: "0.95rem",
    minWidth: "140px",
  },
  priceRange: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  priceSeparator: {
    color: "#94a3b8",
    fontWeight: 600,
  },
  resultsCount: {
    color: "#94a3b8",
    marginBottom: "20px",
    fontSize: "0.95rem",
  },
  noResults: {
    textAlign: "center",
    color: "#94a3b8",
    padding: "60px 20px",
    background: "rgba(30, 41, 59, 0.5)",
    borderRadius: "12px",
    border: "2px dashed #475569",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "24px",
  },
  card: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f1729 100%)",
    border: "1px solid #334155",
    borderRadius: "12px",
    overflow: "hidden",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: "200px",
    overflow: "hidden",
    background: "#0f1729",
    cursor: "pointer",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s ease",
  },
  noImage: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#334155",
    color: "#94a3b8",
    fontWeight: 600,
  },
  availabilityBadge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    padding: "8px 14px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: 600,
  },
  availableBadge: {
    background: "#10b981",
    color: "white",
  },
  unavailableBadge: {
    background: "#ef4444",
    color: "white",
  },
  imageCount: {
    position: "absolute",
    bottom: "12px",
    right: "12px",
    background: "rgba(0, 0, 0, 0.6)",
    color: "white",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "0.85rem",
    fontWeight: 600,
  },
  content: {
    padding: "20px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  title: {
    color: "#f1f5f9",
    fontSize: "1.2rem",
    margin: "0 0 8px 0",
    wordBreak: "break-word",
  },
  location: {
    color: "#94a3b8",
    margin: "0 0 12px 0",
    fontSize: "0.9rem",
  },
  specs: {
    display: "flex",
    gap: "12px",
    margin: "12px 0",
  },
  spec: {
    color: "#cbd5e1",
    fontSize: "0.9rem",
  },
  price: {
    color: "#fbbf24",
    fontSize: "1.1rem",
    fontWeight: 700,
    margin: "8px 0",
  },
  description: {
    color: "#cbd5e1",
    fontSize: "0.85rem",
    margin: "8px 0",
    lineHeight: "1.4",
  },
  unitInfo: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px",
    padding: "12px",
    background: "rgba(59, 130, 246, 0.1)",
    borderRadius: "6px",
    margin: "12px 0",
    fontSize: "0.8rem",
    color: "#cbd5e1",
  },
  unitLabel: {
    color: "#94a3b8",
    display: "block",
    fontSize: "0.75rem",
    marginBottom: "2px",
  },
  unitValue: {
    display: "block",
    fontWeight: 600,
  },
  unitValueBold: {
    display: "block",
    color: "#22c55e",
    fontWeight: 700,
    fontSize: "1rem",
  },
  amenitiesPreview: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    margin: "8px 0",
  },
  amenityChip: {
    background: "rgba(139, 92, 246, 0.2)",
    color: "#cbd5e1",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: 500,
  },
  contactBtn: {
    padding: "10px 12px",
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.9rem",
    marginTop: "8px",
    transition: "all 0.3s ease",
  },
  contactBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  viewBtn: {
    padding: "10px 12px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.9rem",
    marginTop: "6px",
    transition: "all 0.3s ease",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modalContent: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f1729 100%)",
    borderRadius: "12px",
    maxWidth: "600px",
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    border: "1px solid #334155",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: "12px",
    right: "12px",
    background: "rgba(0, 0, 0, 0.6)",
    border: "none",
    color: "white",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "1.2rem",
    zIndex: 1001,
    transition: "all 0.3s ease",
  },
  modalImage: {
    position: "relative",
    width: "100%",
    height: "300px",
    overflow: "hidden",
    background: "#0f1729",
  },
  modalImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  prevBtn: {
    position: "absolute",
    top: "50%",
    left: "12px",
    transform: "translateY(-50%)",
    background: "rgba(0, 0, 0, 0.6)",
    border: "none",
    color: "white",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "1.2rem",
    transition: "all 0.3s ease",
  },
  nextBtn: {
    position: "absolute",
    top: "50%",
    right: "12px",
    transform: "translateY(-50%)",
    background: "rgba(0, 0, 0, 0.6)",
    border: "none",
    color: "white",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "1.2rem",
    transition: "all 0.3s ease",
  },
  thumbnails: {
    display: "flex",
    gap: "8px",
    padding: "12px",
    overflowX: "auto",
    background: "#0f1729",
  },
  thumbnail: {
    width: "60px",
    height: "60px",
    objectFit: "cover",
    borderRadius: "6px",
    cursor: "pointer",
    opacity: 0.6,
    transition: "all 0.3s ease",
    border: "2px solid transparent",
  },
  activeThumbnail: {
    opacity: 1,
    borderColor: "#fbbf24",
  },
  modalDetails: {
    padding: "24px",
    color: "#f1f5f9",
  },
  modalTitle: {
    fontSize: "1.5rem",
    margin: "0 0 8px 0",
    color: "#fbbf24",
  },
  modalLocation: {
    color: "#94a3b8",
    marginBottom: "16px",
  },
  modalPrice: {
    color: "#fbbf24",
    fontSize: "1.3rem",
    fontWeight: 700,
    margin: "12px 0",
  },
  fullDescription: {
    color: "#cbd5e1",
    lineHeight: "1.6",
    margin: "16px 0",
  },
  amenitiesSection: {
    margin: "20px 0",
    padding: "16px",
    background: "rgba(59, 130, 246, 0.1)",
    borderRadius: "8px",
  },
  amenitiesHead: {
    margin: "0 0 12px 0",
    color: "#fbbf24",
  },
  amenitiesList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  amenityItem: {
    color: "#cbd5e1",
    padding: "6px 0",
  },
  unitInfoModal: {
    margin: "20px 0",
    padding: "16px",
    background: "rgba(34, 197, 94, 0.1)",
    borderRadius: "8px",
  },
  unitHeading: {
    margin: "0 0 12px 0",
    color: "#10b981",
  },
  unitGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
  },
  unitBox: {
    textAlign: "center",
    padding: "12px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "6px",
  },
  unitBoxLabel: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "0.85rem",
  },
  unitBoxNumber: {
    margin: "4px 0 0 0",
    color: "#22c55e",
    fontSize: "1.5rem",
    fontWeight: 700,
  },
  landlordInfo: {
    margin: "20px 0",
    padding: "16px",
    background: "rgba(139, 92, 246, 0.1)",
    borderRadius: "8px",
  },
  landlordHead: {
    margin: "0 0 12px 0",
    color: "#8b5cf6",
  },
  landlordDetail: {
    color: "#cbd5e1",
    margin: "8px 0",
  },
  contactButtonsContainer: {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
  },
  whatsappBtn: {
    flex: 1,
    padding: "12px 16px",
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.95rem",
    transition: "all 0.3s ease",
  },
  callBtn: {
    flex: 1,
    padding: "12px 16px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.95rem",
    transition: "all 0.3s ease",
  },
};

const cssStyles = `
  * {
    box-sizing: border-box;
  }

  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  input:focus,
  select:focus {
    outline: none;
    border-color: #fbbf24 !important;
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1) !important;
  }

  @media (max-width: 768px) {
    [style*="gridTemplateColumns"] {
      grid-template-columns: 1fr !important;
    }
  }
`;