import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Listings() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState({});
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    fetchListings();
  }, [searchParams]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchParams.get("county")) params.append("county", searchParams.get("county"));
      if (searchParams.get("area")) params.append("area", searchParams.get("area"));
      if (searchParams.get("type")) params.append("type", searchParams.get("type"));
      if (searchParams.get("price")) params.append("price", searchParams.get("price"));
      if (searchParams.get("bedrooms")) params.append("bedrooms", searchParams.get("bedrooms"));

      const res = await API.get(`/properties/approved?${params.toString()}`);
      setProperties(res.data);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getPropertyImages = (property) => {
    if (!property) return [];
    if (property.images && Array.isArray(property.images) && property.images.length > 0) {
      return property.images;
    }
    if (property.image) return [property.image];
    return [];
  };

  // Format phone number with +254
  const formatPhone = (phone) => {
    let num = phone.trim();
    if (num.startsWith("0")) num = num.substring(1);
    if (!num.startsWith("254")) num = "254" + num;
    return num;
  };

  // Detailed WhatsApp Message
  const getWhatsAppMessage = (property) => {
    return encodeURIComponent(
      `Hello,\n\n` +
      `I'm interested in this property:\n\n` +
      `🏠 ${property.title}\n` +
      `📍 ${property.county}${property.area ? `, ${property.area}` : ''}\n` +
      `💰 Rent: Ksh ${Number(property.price).toLocaleString()}\n` +
      `${property.deposit ? `🔒 Deposit: Ksh ${Number(property.deposit).toLocaleString()}\n` : ''}` +
      `${property.type ? `🏡 Type: ${property.type}\n` : ''}` +
      `${property.bedrooms ? `🛏 Bedrooms: ${property.bedrooms}\n` : ''}` +
      `${property.bathrooms ? `🚿 Bathrooms: ${property.bathrooms}\n` : ''}` +
      `${property.description ? `\n📝 ${property.description}\n` : ''}` +
      `\nKindly send more details. Thank you!`
    );
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

      <div style={styles.header}>
        <h1 style={styles.title}>🏠 Available Listings</h1>
        <p style={styles.count}>{properties.length} properties found</p>
      </div>

      {properties.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔍</div>
          <h2>No properties found</h2>
          <p>Try adjusting your filters</p>
          <button className="btn-primary" onClick={() => navigate("/listings")}>Clear Filters</button>
        </div>
      ) : (
        <div style={styles.grid}>
          {properties.map((property, idx) => {
            const images = getPropertyImages(property);
            const currentImageIndex = selectedImageIndex[property._id] || 0;
            const currentImage = images.length > 0 ? images[currentImageIndex] : null;

            return (
              <div key={property._id} className="card" style={{ animationDelay: `${idx * 60}ms` }}>
                {currentImage ? (
                  <div style={styles.imageContainer} onClick={() => setSelectedProperty(property)}>
                    <img src={currentImage} alt={property.title} style={styles.image} />
                    
                    {images.length > 1 && (
                      <div style={styles.imageBadge}>
                        {currentImageIndex + 1}/{images.length}
                      </div>
                    )}

                    {images.length > 1 && (
                      <div style={styles.arrowsContainer}>
                        <button className="arrow-btn" onClick={(e) => { e.stopPropagation(); /* prev */ const cur = selectedImageIndex[property._id] || 0; setSelectedImageIndex({...selectedImageIndex, [property._id]: cur === 0 ? images.length-1 : cur-1}); }}>❮</button>
                        <button className="arrow-btn" onClick={(e) => { e.stopPropagation(); /* next */ const cur = selectedImageIndex[property._id] || 0; setSelectedImageIndex({...selectedImageIndex, [property._id]: (cur + 1) % images.length}); }}>❯</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={styles.noImage}>📷 No Image</div>
                )}

                <div style={styles.cardBody}>
                  <h3 style={styles.title}>{property.title}</h3>
                  <p style={styles.location}>📍 {property.county}{property.area && ` · ${property.area}`}</p>

                  <div style={styles.priceBox}>
                    <div>
                      <div style={styles.label}>Monthly Rent</div>
                      <div style={styles.price}>Ksh {Number(property.price).toLocaleString()}</div>
                    </div>
                    {property.deposit && (
                      <div>
                        <div style={styles.label}>Deposit</div>
                        <div style={styles.deposit}>Ksh {Number(property.deposit).toLocaleString()}</div>
                      </div>
                    )}
                  </div>

                  <div style={styles.features}>
                    {property.type && <span className="badge">{property.type}</span>}
                    {property.bedrooms && <span className="badge">🛏 {property.bedrooms} Bed</span>}
                    {property.bathrooms && <span className="badge">🚿 {property.bathrooms} Bath</span>}
                  </div>

                  {property.description && <p style={styles.description}>{property.description}</p>}
                  {property.amenities?.length > 0 && <p style={styles.amenities}>✨ {property.amenities.join(", ")}</p>}

                  <div style={styles.contactBox}>
                    <p style={styles.phone}>📞 {property.phone}</p>
                  </div>

                  {/* WhatsApp Button with Icon */}
                  <div style={styles.actions}>
                    <a
                      href={`https://wa.me/${formatPhone(property.phone)}?text=${getWhatsAppMessage(property)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.btnWhatsapp}
                    >
                      💬 WhatsApp Landlord
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

      {/* Modal - Same WhatsApp logic */}
      {selectedProperty && (
        <div style={styles.modal} onClick={() => setSelectedProperty(null)}>
          <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setSelectedProperty(null)}>✕</button>
            
            {/* Your modal gallery code here - I kept it short for brevity. Add your full modal gallery if needed */}

            <div style={styles.modalBody}>
              <h2 style={styles.modalTitle}>{selectedProperty.title}</h2>
              <p style={styles.modalLocation}>📍 {selectedProperty.county}, {selectedProperty.area}</p>

              {/* Price, description etc... */}

              <a
                href={`https://wa.me/${formatPhone(selectedProperty.phone)}?text=${getWhatsAppMessage(selectedProperty)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.btnWhatsappLarge}
              >
                💬 Contact Landlord on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ====================== STYLES ====================== */
const styles = {
  root: { fontFamily: "'DM Sans', sans-serif", background: "#06101f", color: "#e2e8f0", minHeight: "100vh", padding: "40px 20px 60px", maxWidth: "1200px", margin: "0 auto" },
  header: { textAlign: "center", marginBottom: "40px" },
  title: { fontSize: "clamp(24px,5vw,36px)", fontWeight: 800, color: "#f1f5f9", margin: "0 0 8px" },
  count: { color: "#64748b", fontSize: "16px", margin: 0 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px", marginBottom: "60px" },
  imageContainer: { position: "relative", cursor: "pointer", overflow: "hidden", borderRadius: "14px 14px 0 0" },
  image: { width: "100%", height: "240px", objectFit: "cover" },
  noImage: { width: "100%", height: "160px", background: "rgba(59,130,246,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" },
  imageBadge: { position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.7)", color: "#fff", padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600 },
  arrowsContainer: { position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "12px", background: "rgba(0,0,0,0.6)", padding: "8px 14px", borderRadius: "999px" },
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
  phone: { margin: 0, fontSize: "14px", color: "#e2e8f0", fontWeight: 600 },
  actions: { display: "flex", gap: "10px" },
  btnWhatsapp: {
    flex: 1,
    padding: "12px",
    background: "#25D366",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "8px",
    textAlign: "center",
    fontSize: "14px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px"
  },
  emptyState: { textAlign: "center", padding: "80px 20px" },
  emptyIcon: { fontSize: "64px", marginBottom: "20px" },
  loadingContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "20px" },
  spinner: { width: "40px", height: "40px", border: "3px solid rgba(59,130,246,0.2)", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" },
  modalBox: { background: "#0d1b2e", borderRadius: "20px", maxWidth: "700px", width: "100%", maxHeight: "90vh", overflow: "auto" },
  closeBtn: { position: "absolute", top: "20px", right: "20px", background: "rgba(0,0,0,0.7)", color: "#fff", border: "none", width: "40px", height: "40px", borderRadius: "50%", fontSize: "20px", cursor: "pointer" },
  modalImageContainer: { position: "relative", width: "100%" },
  modalImage: { width: "100%", height: "400px", objectFit: "cover" },
  modalArrows: { position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "16px", background: "rgba(0,0,0,0.7)", padding: "12px 20px", borderRadius: "999px" },
  modalCounter: { color: "#fff", fontSize: "14px", fontWeight: 600 },
  thumbnailGallery: { display: "flex", gap: "6px", padding: "12px", background: "rgba(0,0,0,0.3)", overflowX: "auto" },
  thumbnail: { width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px", cursor: "pointer" },
  modalBody: { padding: "32px" },
  modalTitle: { fontSize: "28px", fontWeight: 800, color: "#f1f5f9", margin: "0 0 12px" },
  modalLocation: { fontSize: "16px", color: "#60a5fa", margin: "0 0 24px" },
  fullDescription: { fontSize: "15px", color: "#cbd5e1", lineHeight: 1.8, margin: "24px 0" },
  btnWhatsappLarge: {
    display: "block",
    padding: "16px 24px",
    background: "#25D366",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "10px",
    textAlign: "center",
    fontSize: "16px",
    fontWeight: 700,
    marginTop: "24px"
  },
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
  .card:hover { transform: translateY(-6px); border-color: rgba(59,130,246,0.35); box-shadow: 0 16px 40px rgba(0,0,0,0.4); }

  .arrow-btn {
    background: rgba(255,255,255,0.1);
    border: none;
    color: white;
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
  }
  .arrow-btn:hover { background: rgba(255,255,255,0.2); }

  .badge {
    background: rgba(59,130,246,0.15);
    border: 1px solid rgba(59,130,246,0.3);
    color: #60a5fa;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
  }

  .btn-primary, .btn-secondary { font-family: inherit; cursor: pointer; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
`;