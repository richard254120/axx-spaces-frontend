import React, { useState, useEffect, useMemo } from "react";
// If using in a standard React environment. Note: styles imported as object for compatibility with your snippet
// import styles from "../styles/Listings.module.css"; 

export default function Listings() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [filters, setFilters] = useState({
    location: "",
    minPrice: 0,
    maxPrice: 2000000, // Increased default range
    bedrooms: "",
    bathrooms: "",
  });

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 1. Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("/api/properties");
        if (!response.ok) throw new Error("Failed to fetch properties");
        const data = await response.json();
        
        // Filter only properties with available units at the source
        const availableProperties = data.filter(prop => prop.availableUnits > 0);
        setProperties(availableProperties);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // 2. Filter logic (Memoized for performance)
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const matchLocation = p.location.toLowerCase().includes(filters.location.toLowerCase());
      const matchBedrooms = filters.bedrooms === "" || p.bedrooms === parseInt(filters.bedrooms);
      const matchBathrooms = filters.bathrooms === "" || p.bathrooms === parseInt(filters.bathrooms);
      const matchMinPrice = p.price >= (Number(filters.minPrice) || 0);
      const matchMaxPrice = p.price <= (Number(filters.maxPrice) || Infinity);

      return matchLocation && matchBedrooms && matchBathrooms && matchMinPrice && matchMaxPrice;
    });
  }, [filters, properties]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (property) => {
    setSelectedProperty(property);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal open
  };

  const closeModal = () => {
    setSelectedProperty(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'unset';
  };

  const nextImage = (e) => {
    e.stopPropagation();
    if (selectedProperty?.images?.length) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedProperty.images.length);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (selectedProperty?.images?.length) {
      setCurrentImageIndex((prev) => 
        (prev - 1 + selectedProperty.images.length) % selectedProperty.images.length
      );
    }
  };

  const handleContactLandlord = (property) => {
    const phoneNumber = property.owner?.phone.replace(/\D/g, "");
    const landlordName = property.owner?.name || "Landlord";
    const message = `Hi ${landlordName}, I'm interested in your property "${property.title}" in ${property.location}. Is it still available?`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (loading) return <div className="loading">Loading properties...</div>;

  return (
    <div className="container">
      <header className="header">
        <h1>🏢 Available Properties</h1>
        <p>Find your perfect rental home in Kenya</p>
      </header>

      {error && <div className="error">{error}</div>}

      {/* Filters Section */}
      <section className="filters">
        <input
          type="text"
          name="location"
          placeholder="📍 Search location..."
          value={filters.location}
          onChange={handleFilterChange}
          className="filterInput"
        />

        <select name="bedrooms" value={filters.bedrooms} onChange={handleFilterChange} className="filterSelect">
          <option value="">All Bedrooms</option>
          <option value="1">1 Bedroom</option>
          <option value="2">2 Bedrooms</option>
          <option value="3">3 Bedrooms</option>
          <option value="4">4+ Bedrooms</option>
        </select>

        <select name="bathrooms" value={filters.bathrooms} onChange={handleFilterChange} className="filterSelect">
          <option value="">All Bathrooms</option>
          <option value="1">1 Bathroom</option>
          <option value="2">2 Bathrooms</option>
          <option value="3">3+ Bathrooms</option>
        </select>

        <div className="priceRange">
          <input
            type="number"
            name="minPrice"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={handleFilterChange}
            className="filterInput"
          />
          <span style={{color: '#94a3b8'}}>-</span>
          <input
            type="number"
            name="maxPrice"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            className="filterInput"
          />
        </div>
      </section>

      <div className="resultsCount">
        Showing {filteredProperties.length} results
      </div>

      {filteredProperties.length === 0 ? (
        <div className="noResults">
          <p>No properties match your filters. Try adjusting your search! 🔍</p>
        </div>
      ) : (
        <div className="grid">
          {filteredProperties.map((property) => (
            <article key={property._id} className="card">
              <div className="imageContainer" onClick={() => openModal(property)}>
                {property.images?.[0] ? (
                  <img src={property.images[0]} alt={property.title} className="image" />
                ) : (
                  <div className="noImage">No Image Available</div>
                )}
                <div className="availabilityBadge">
                  ✅ {property.availableUnits} Available
                </div>
              </div>

              <div className="content">
                <div className="price">KES {property.price.toLocaleString()} /mo</div>
                <h2>{property.title}</h2>
                <p className="location">📍 {property.location}</p>
                <div className="specs">
                  <span>🛏️ {property.bedrooms} Bed</span>
                  <span>🚿 {property.bathrooms} Bath</span>
                </div>
                <button className="viewBtn" onClick={() => openModal(property)}>View Details</button>
                <button className="contactBtn" onClick={() => handleContactLandlord(property)}>WhatsApp</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal Section */}
      {selectedProperty && (
        <div className="modal" onClick={closeModal}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <button className="closeBtn" onClick={closeModal}>&times;</button>
            
            <div className="modalImage">
              {selectedProperty.images?.[currentImageIndex] ? (
                <img src={selectedProperty.images[currentImageIndex]} alt="Property" />
              ) : (
                <div className="noImage">No Images</div>
              )}
              {selectedProperty.images?.length > 1 && (
                <>
                  <button className="prevBtn" onClick={prevImage}>❮</button>
                  <button className="nextBtn" onClick={nextImage}>❯</button>
                </>
              )}
            </div>

            <div className="modalDetails">
              <h2>{selectedProperty.title}</h2>
              <p className="price">KES {selectedProperty.price.toLocaleString()} /month</p>
              <p className="fullDescription">{selectedProperty.description}</p>
              
              <div className="landlordInfo">
                <h3>Contact Landlord</h3>
                <p>👤 {selectedProperty.owner?.name}</p>
                <p>📞 {selectedProperty.owner?.phone}</p>
              </div>

              <div className="contactButtons">
                <button className="whatsappBtn" onClick={() => handleContactLandlord(selectedProperty)}>WhatsApp</button>
                <button className="callBtn" onClick={() => window.open(`tel:${selectedProperty.owner?.phone}`)}>Call Now</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embedded CSS for this example */}
      <style>{`
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; font-family: sans-serif; background: #0f172a; color: #fff; min-height: 100vh; }
        .header { text-align: center; padding: 40px 0; }
        .header h1 { color: #fbbf24; margin: 0; }
        .filters { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; background: #1e293b; padding: 20px; border-radius: 8px; }
        .filterInput, .filterSelect { background: #0f172a; border: 1px solid #334155; color: white; padding: 8px 12px; border-radius: 4px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .card { background: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; transition: 0.3s; }
        .card:hover { transform: translateY(-5px); border-color: #fbbf24; }
        .imageContainer { height: 200px; position: relative; cursor: pointer; }
        .image { width: 100%; height: 100%; object-fit: cover; }
        .availabilityBadge { position: absolute; top: 10px; left: 10px; background: #10b981; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; }
        .content { padding: 15px; }
        .price { color: #fbbf24; font-weight: bold; font-size: 1.2rem; }
        .specs { display: flex; gap: 15px; margin: 10px 0; color: #94a3b8; }
        .viewBtn, .contactBtn { width: 100%; padding: 10px; margin-top: 10px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
        .viewBtn { background: #3b82f6; color: white; }
        .contactBtn { background: #22c55e; color: white; }
        
        .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
        .modalContent { background: #1e293b; width: 100%; max-width: 600px; border-radius: 12px; overflow-y: auto; max-height: 90vh; position: relative; }
        .modalImage { height: 350px; position: relative; }
        .modalImage img { width: 100%; height: 100%; object-fit: cover; }
        .closeBtn { position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); color: white; border: none; font-size: 24px; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; z-index: 10; }
        .modalDetails { padding: 20px; }
        .contactButtons { display: flex; gap: 10px; margin-top: 20px; }
        .whatsappBtn, .callBtn { flex: 1; padding: 12px; border: none; border-radius: 6px; color: white; cursor: pointer; font-weight: bold; }
        .whatsappBtn { background: #22c55e; }
        .callBtn { background: #3b82f6; }
        .prevBtn, .nextBtn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; padding: 10px; cursor: pointer; }
        .nextBtn { right: 0; }
        .loading { text-align: center; padding: 100px; font-size: 1.5rem; color: #fbbf24; }
      `}</style>
    </div>
  );
}