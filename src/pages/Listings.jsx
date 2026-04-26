import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";

/* ══════════════════════════════════════════════════════════════════
   PROPERTY DETAIL MODAL (Pop-up when a property is clicked)
══════════════════════════════════════════════════════════════════ */
function PropertyModal({ property: p, onClose, onWhatsApp }) {
  if (!p) return null;

  // Handles both the new Cloudinary array and any old single image strings
  const displayImage = p.images && p.images.length > 0 ? p.images[0] : p.image;

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.box} onClick={(e) => e.stopPropagation()}>
        <button style={modalStyles.closeBtn} onClick={onClose}>✕</button>
        
        {displayImage && <img src={displayImage} alt={p.title} style={modalStyles.image} />}
        
        <div style={modalStyles.body}>
          <h2 style={modalStyles.title}>{p.title}</h2>
          <p style={modalStyles.location}>📍 {p.area}, {p.county}</p>
          
          <div style={modalStyles.priceRow}>
            <div>
              <div style={modalStyles.label}>Monthly Rent</div>
              <div style={modalStyles.price}>Ksh {Number(p.price).toLocaleString()}</div>
            </div>
          </div>

          <div style={modalStyles.infoGrid}>
            <span style={modalStyles.pill}>🏗 {p.type}</span>
            {p.bedrooms && <span style={modalStyles.pill}>🛏 {p.bedrooms} Bedrooms</span>}
          </div>

          <p style={modalStyles.desc}>{p.description || "No description provided."}</p>

          <button 
            style={modalStyles.whatsappBtn} 
            onClick={() => onWhatsApp(p.phone, p.title)}
          >
            💬 Chat on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN LISTINGS PAGE
══════════════════════════════════════════════════════════════════ */
export default function Listings() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelected] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        // Hits the specific backend route for approved properties
        const res = await API.get(`/properties/approved${location.search}`);
        setProperties(res.data);
      } catch (err) {
        console.error("Error loading listings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [location.search]);

  const handleWhatsApp = (phone, title) => {
    const msg = encodeURIComponent(`Hello, I'm interested in the property: ${title}`);
    window.open(`https://wa.me/${phone.replace(/\s/g, "")}?text=${msg}`, "_blank");
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate("/")}>← Back</button>
        <h1 style={styles.pageTitle}>AXX Spaces Listings</h1>
        <p style={styles.subtitle}>{properties.length} Approved Properties Available</p>
      </div>

      {selectedProperty && (
        <PropertyModal 
          property={selectedProperty} 
          onClose={() => setSelected(null)} 
          onWhatsApp={handleWhatsApp}
        />
      )}

      {loading ? (
        <div style={styles.center}><div className="spinner"></div><p>Searching for homes...</p></div>
      ) : properties.length === 0 ? (
        <div style={styles.center}>
          <h3>No properties found.</h3>
          <button style={styles.resetBtn} onClick={() => navigate("/listings")}>Clear Filters</button>
        </div>
      ) : (
        <div style={styles.grid}>
          {properties.map((p) => (
            <div key={p._id} style={styles.card} onClick={() => setSelected(p)}>
              <div style={styles.imgContainer}>
                <img 
                  src={p.images && p.images.length > 0 ? p.images[0] : p.image || "/placeholder.jpg"} 
                  alt={p.title} 
                  style={styles.cardImg} 
                />
                <div style={styles.typeTag}>{p.type}</div>
              </div>
              
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{p.title}</h3>
                <p style={styles.cardLoc}>📍 {p.area}</p>
                <div style={styles.cardFooter}>
                  <span style={styles.cardPrice}>Ksh {Number(p.price).toLocaleString()}</span>
                  <button style={styles.viewBtn}>View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .spinner { border: 4px solid #1e293b; border-top: 4px solid #34d399; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 10px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   STYLES (Midnight Blue & Gold Theme)
══════════════════════════════════════════════════════════════════ */
const styles = {
  container: { padding: "40px 20px", backgroundColor: "#06101f", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Inter', sans-serif" },
  header: { maxWidth: "1200px", margin: "0 auto 30px auto" },
  pageTitle: { fontSize: "2.5rem", color: "#f1f5f9", marginBottom: "5px" },
  subtitle: { color: "#94a3b8", fontSize: "1.1rem" },
  backBtn: { backgroundColor: "transparent", color: "#fbbf24", border: "1px solid #fbbf24", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", marginBottom: "20px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "25px", maxWidth: "1200px", margin: "0 auto" },
  card: { backgroundColor: "#0f172a", borderRadius: "15px", overflow: "hidden", border: "1px solid #1e293b", cursor: "pointer", transition: "transform 0.2s" },
  imgContainer: { position: "relative", height: "200px" },
  cardImg: { width: "100%", height: "100%", objectFit: "cover" },
  typeTag: { position: "absolute", top: "10px", left: "10px", backgroundColor: "rgba(6, 16, 31, 0.8)", padding: "4px 10px", borderRadius: "5px", fontSize: "0.8rem", color: "#fbbf24", fontWeight: "bold" },
  cardContent: { padding: "20px" },
  cardTitle: { fontSize: "1.3rem", color: "#f8fafc", marginBottom: "5px" },
  cardLoc: { color: "#94a3b8", fontSize: "0.9rem", marginBottom: "15px" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #1e293b", paddingTop: "15px" },
  cardPrice: { fontSize: "1.2rem", fontWeight: "bold", color: "#34d399" },
  viewBtn: { backgroundColor: "#1e293b", color: "#f1f5f9", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer" },
  center: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: "100px" },
  resetBtn: { marginTop: "20px", padding: "10px 20px", backgroundColor: "#fbbf24", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" }
};

const modalStyles = {
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" },
  box: { backgroundColor: "#0f172a", maxWidth: "600px", width: "100%", borderRadius: "20px", position: "relative", overflow: "hidden", border: "1px solid #334155" },
  closeBtn: { position: "absolute", top: "15px", right: "15px", background: "rgba(255,255,255,0.1)", border: "none", color: "white", width: "35px", height: "35px", borderRadius: "50%", cursor: "pointer", zIndex: 10 },
  image: { width: "100%", height: "300px", objectFit: "cover" },
  body: { padding: "30px" },
  title: { fontSize: "1.8rem", marginBottom: "5px" },
  location: { color: "#94a3b8", marginBottom: "20px" },
  priceRow: { marginBottom: "20px" },
  label: { fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase" },
  price: { fontSize: "2rem", color: "#34d399", fontWeight: "bold" },
  infoGrid: { display: "flex", gap: "10px", marginBottom: "20px" },
  pill: { backgroundColor: "#1e293b", padding: "6px 12px", borderRadius: "20px", fontSize: "0.9rem" },
  desc: { lineHeight: "1.6", color: "#cbd5e1", marginBottom: "30px" },
  whatsappBtn: { width: "100%", padding: "15px", backgroundColor: "#25D366", color: "white", border: "none", borderRadius: "10px", fontSize: "1.1rem", fontWeight: "bold", cursor: "pointer" }
};