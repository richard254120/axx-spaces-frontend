import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Listings() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState({}); // ✅ Track gallery position per property
  const [selectedProperty, setSelectedProperty] = useState(null); // ✅ Modal state

  useEffect(() => {
    fetchListings();
  }, [searchParams]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      // ✅ Build query string from search params
      const params = new URLSearchParams();
      if (searchParams.get("county")) params.append("county", searchParams.get("county"));
      if (searchParams.get("area")) params.append("area", searchParams.get("area"));
      if (searchParams.get("type")) params.append("type", searchParams.get("type"));
      if (searchParams.get("price")) params.append("price", searchParams.get("price"));
      if (searchParams.get("bedrooms")) params.append("bedrooms", searchParams.get("bedrooms"));

      const res = await API.get(`/properties/approved?${params.toString()}`);
      console.log("✅ Listings loaded:", res.data.length);
      setProperties(res.data);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get images for a property - ALWAYS returns array
  const getPropertyImages = (property) => {
    if (!property) return [];
    
    // Check images array first
    if (property.images && Array.isArray(property.images) && property.images.length > 0) {
      return property.images;
    }
    
    // Fall back to single image
    if (property.image) {
      return [property.image];
    }
    
    return [];
  };

  // ✅ Navigate gallery forward
  const nextImage = (propId, images) => {
    e.stopPropagation();
    const current = selectedImageIndex[propId] || 0;
    setSelectedImageIndex({
      ...selectedImageIndex,
      [propId]: (current + 1) % images.length
    });
  };

  // ✅ Navigate gallery backward
  const prevImage = (propId, images) => {
    e.stopPropagation();
    const current = selectedImageIndex[propId] || 0;
    setSelectedImageIndex({
      ...selectedImageIndex,
      [propId]: current === 0 ? images.length - 1 : current - 1
    });
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p>Loading properties...</p>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>🏠 Available Listings</h1>
        <p style={styles.count}>{properties.length} properties found</p>
      </div>

      {/* NO RESULTS */}
      {properties.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔍</div>
          <h2>No properties found</h2>
          <p>Try adjusting your filters or search criteria</p>
          <button className="btn-primary" onClick={() => navigate("/listings")}>Clear Filters</button>
        </div>
      ) : (
        /* GRID */
        <div style={styles.grid}>
          {properties.map((property, idx) => {
            // ✅ Get all images for this property
            const images = getPropertyImages(property);
            const currentImageIndex = selectedImageIndex[property._id] || 0;
            const currentImage = images.length > 0 ? images[currentImageIndex] : null;

            return (
              <div key={property._id} className="card" style={{ animationDelay: `${idx * 60}ms` }}>
                {/* ✅ IMAGE GALLERY */}
                {currentImage ? (
                  <div style={styles.imageContainer} onClick={() => setSelectedProperty(property)}>
                    <img src={currentImage} alt={property.title} style={styles.image} />
                    
                    {/* ✅ Image counter badge */}
                    {images.length > 1 && (
                      <div style={styles.imageBadge}>
                        {currentImageIndex + 1}/{images.length}
                      </div>
                    )}

                    {/* ✅ Navigation arrows */}
                    {images.length > 1 && (
                      <div style={styles.arrowsContainer}>
                        <button
                          className="arrow-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            const current = selectedImageIndex[property._id] || 0;
                            setSelectedImageIndex({
                              ...selectedImageIndex,
                              [property._id]: current === 0 ? images.length - 1 : current - 1
                            });
                          }}
                        >
                          ❮
                        </button>
                        <button
                          className="arrow-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            const current = selectedImageIndex[property._id] || 0;
                            setSelectedImageIndex({
                              ...selectedImageIndex,
                              [property._id]: (current + 1) % images.length
                            });
                          }}
                        >
                          ❯
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={styles.noImage}>📷 No Image</div>
                )}

                {/* INFO */}
                <div style={styles.cardBody}>
                  <h3 style={styles.title}>{property.title}</h3>
                  
                  <p style={styles.location}>
                    📍 {property.county}
                    {property.area && ` · ${property.area}`}
                  </p>

                  {/* PRICE */}
                  <div style={styles.priceBox}>
                    <div>
                      <div style={styles.label}>Monthly Rent</div>
                      <div style={styles.price}>
                        Ksh {Number(property.price).toLocaleString()}
                      </div>
                    </div>
                    {property.deposit && (
                      <div>
                        <div style={styles.label}>Deposit</div>
                        <div style={styles.deposit}>
                          Ksh {Number(property.deposit).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* FEATURES */}
                  <div style={styles.features}>
                    {property.type && <span className="badge">{property.type}</span>}
                    {property.bedrooms && (
                      <span className="badge">🛏 {property.bedrooms} Bed{property.bedrooms > 1 ? 's' : ''}</span>
                    )}
                    {property.bathrooms && (
                      <span className="badge">🚿 {property.bathrooms} Bath{property.bathrooms > 1 ? 's' : ''}</span>
                    )}
                  </div>

                  {/* DESCRIPTION */}
                  {property.description && (
                    <p style={styles.description}>{property.description}</p>
                  )}

                  {/* AMENITIES */}
                  {property.amenities && property.amenities.length > 0 && (
                    <p style={styles.amenities}>
                      ✨ {property.amenities.join(", ")}
                    </p>
                  )}

                  {/* CONTACT */}
                  <div style={styles.contactBox}>
                    <p style={styles.phone}>
                      <span>📞</span> {property.phone}
                    </p>
                  </div>

                  {/* ACTIONS */}
                  <div style={styles.actions}>
                    <a href={`https://wa.me/${property.phone}?text=Hi, I'm interested in your property: ${property.title}`} target="_blank" rel="noopener noreferrer" style={styles.btnWhatsapp}>
                      💬 WhatsApp
                    </a>
                    <button className="btn-secondary" onClick={() => setSelectedProperty(property)}>
                      👁 View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL - FULL PROPERTY VIEW */}
      {selectedProperty && (
        <div style={styles.modal} onClick={() => setSelectedProperty(null)}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setSelectedProperty(null)}>✕</button>
            
            {/* ✅ MODAL GALLERY */}
            {(() => {
              const images = getPropertyImages(selectedProperty);
              const currentIdx = selectedImageIndex[selectedProperty._id] || 0;
              const currentImage = images.length > 0 ? images[currentIdx] : null;

              return (
                <>
                  {currentImage && (
                    <div style={styles.modalImageContainer}>
                      <img src={currentImage} alt={selectedProperty.title} style={styles.modalImage} />
                      
                      {images.length > 1 && (
                        <div style={styles.modalArrows}>
                          <button
                            className="arrow-btn"
                            onClick={() => {
                              const current = selectedImageIndex[selectedProperty._id] || 0;
                              setSelectedImageIndex({
                                ...selectedImageIndex,
                                [selectedProperty._id]: current === 0 ? images.length - 1 : current - 1
                              });
                            }}
                          >
                            ❮
                          </button>
                          <span style={styles.modalCounter}>
                            {currentIdx + 1} / {images.length}
                          </span>
                          <button
                            className="arrow-btn"
                            onClick={() => {
                              const current = selectedImageIndex[selectedProperty._id] || 0;
                              setSelectedImageIndex({
                                ...selectedImageIndex,
                                [selectedProperty._id]: (current + 1) % images.length
                              });
                            }}
                          >
                            ❯
                          </button>
                        </div>
                      )}

                      {/* Thumbnail gallery */}
                      {images.length > 1 && (
                        <div style={styles.thumbnailGallery}>
                          {images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt={`thumb ${i}`}
                              style={{
                                ...styles.thumbnail,
                                border: i === currentIdx ? "2px solid #3b82f6" : "1px solid #333"
                              }}
                              onClick={() => setSelectedImageIndex({ ...selectedImageIndex, [selectedProperty._id]: i })}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              );
            })()}

            {/* MODAL INFO */}
            <div style={styles.modalBody}>
              <h2 style={styles.modalTitle}>{selectedProperty.title}</h2>
              <p style={styles.modalLocation}>📍 {selectedProperty.county}, {selectedProperty.area}</p>
              
              <div style={styles.priceBox}>
                <div>
                  <div style={styles.label}>Monthly Rent</div>
                  <div style={styles.price}>Ksh {Number(selectedProperty.price).toLocaleString()}</div>
                </div>
                {selectedProperty.deposit && (
                  <div>
                    <div style={styles.label}>Deposit</div>
                    <div style={styles.deposit}>Ksh {Number(selectedProperty.deposit).toLocaleString()}</div>
                  </div>
                )}
              </div>

              {selectedProperty.description && (
                <p style={styles.fullDescription}>{selectedProperty.description}</p>
              )}

              {selectedProperty.amenities?.length > 0 && (
                <p style={styles.amenities}>🏡 {selectedProperty.amenities.join(", ")}</p>
              )}

              <a href={`https://wa.me/${selectedProperty.phone}?text=Hi, I'm interested in your property: ${selectedProperty.title}`} target="_blank" rel="noopener noreferrer" style={styles.btnWhatsappLarge}>
                💬 Contact via WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#06101f",
    color: "#e2e8f0",
    minHeight: "100vh",
    padding: "40px 20px 60px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: { textAlign: "center", marginBottom: "40px" },
  title: { fontSize: "clamp(24px,5vw,36px)", fontWeight: 800, color: "#f1f5f9", margin: "0 0 8px" },
  count: { color: "#64748b", fontSize: "16px", margin: 0 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px", marginBottom: "60px" },
  imageContainer: { position: "relative", cursor: "pointer", overflow: "hidden", borderRadius: "14px 14px 0 0" },
  image: { width: "100%", height: "240px", objectFit: "cover", display: "block" },
  noImage: { width: "100%", height: "160px", background: "rgba(59,130,246,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" },
  imageBadge: { position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.7)", color: "#fff", padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600 },
  arrowsContainer: { position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "12px", background: "rgba(0,0,0,0.6)", padding: "8px 14px", borderRadius: "999px" },
  cardBody: { padding: "20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0 0 14px 14px" },
  location: { fontSize: "14px", color: "#60a5fa", margin: "0 0 16px" },
  priceBox: { display: "flex", justifyContent: "space-between", background: "rgba(59,130,246,0.08)", padding: "14px", borderRadius: "10px", marginBottom: "14px" },
  label: { fontSize: "12px", color: "#94a3b8", textTransform: "uppercase" },
  price: { fontSize: "18px", fontWeight: 800, color: "#60a5fa" },
  deposit: { fontSize: "16px", fontWeight: 700, color: "#94a3b8" },
  features: { display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" },
  description: { fontSize: "14px", color: "#cbd5e1", lineHeight: 1.6, margin: "14px 0" },
  amenities: { fontSize: "13px", color: "#94a3b8", margin: "14px 0" },
  contactBox: { background: "rgba(255,255,255,0.04)", padding: "12px", borderRadius: "8px", marginBottom: "14px" },
  phone: { margin: 0, fontSize: "14px", color: "#e2e8f0", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" },
  actions: { display: "flex", gap: "10px" },
  btnWhatsapp: { flex: 1, padding: "12px", background: "#25d366", color: "#fff", textDecoration: "none", borderRadius: "8px", textAlign: "center", fontSize: "14px", fontWeight: 700, transition: "all 0.2s" },
  emptyState: { textAlign: "center", padding: "80px 20px" },
  emptyIcon: { fontSize: "64px", marginBottom: "20px" },
  loadingContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "20px" },
  spinner: { width: "40px", height: "40px", border: "3px solid rgba(59,130,246,0.2)", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" },
  modalBox: { background: "#0d1b2e", borderRadius: "20px", maxWidth: "700px", width: "100%", maxHeight: "90vh", overflow: "auto" },
  closeBtn: { position: "absolute", top: "20px", right: "20px", background: "rgba(0,0,0,0.7)", color: "#fff", border: "none", width: "40px", height: "40px", borderRadius: "50%", fontSize: "20px", cursor: "pointer", zIndex: 1001 },
  modalImageContainer: { position: "relative", width: "100%" },
  modalImage: { width: "100%", height: "400px", objectFit: "cover" },
  modalArrows: { position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "16px", background: "rgba(0,0,0,0.7)", padding: "12px 20px", borderRadius: "999px" },
  modalCounter: { color: "#fff", fontSize: "14px", fontWeight: 600, minWidth: "50px", textAlign: "center" },
  thumbnailGallery: { display: "flex", gap: "6px", padding: "12px", background: "rgba(0,0,0,0.3)", overflowX: "auto" },
  thumbnail: { width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px", cursor: "pointer", flexShrink: 0 },
  modalBody: { padding: "32px" },
  modalTitle: { fontSize: "28px", fontWeight: 800, color: "#f1f5f9", margin: "0 0 12px" },
  modalLocation: { fontSize: "16px", color: "#60a5fa", margin: "0 0 24px" },
  fullDescription: { fontSize: "15px", color: "#cbd5e1", lineHeight: 1.8, margin: "24px 0" },
  btnWhatsappLarge: { display: "block", padding: "16px 24px", background: "#25d366", color: "#fff", textDecoration: "none", borderRadius: "10px", textAlign: "center", fontSize: "16px", fontWeight: 700, marginTop: "24px", transition: "all 0.2s" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');

  .card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    overflow: hidden;
    transition: all .2s;
    animation: fadeUp .4s ease both;
  }
  .card:hover {
    transform: translateY(-6px);
    border-color: rgba(59,130,246,0.35);
    box-shadow: 0 16px 40px rgba(0,0,0,0.4);
  }

  .arrow-btn {
    background: rgba(255,255,255,0.1);
    border: none;
    color: white;
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: background .2s;
  }
  .arrow-btn:hover {
    background: rgba(255,255,255,0.2);
  }

  .badge {
    display: inline-block;
    background: rgba(59,130,246,0.15);
    border: 1px solid rgba(59,130,246,0.3);
    color: #60a5fa;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
  }

  .btn-primary {
    padding: 12px 28px;
    background: linear-gradient(135deg,#3b82f6,#6d28d9);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
  }

  .btn-secondary {
    padding: 12px 20px;
    background: rgba(59,130,246,0.12);
    border: 1px solid rgba(59,130,246,0.3);
    color: #60a5fa;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-family: inherit;
    transition: all .2s;
  }
  .btn-secondary:hover {
    background: rgba(59,130,246,0.25);
  }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
`;