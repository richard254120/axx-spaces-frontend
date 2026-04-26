import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";
import MapView from "../components/MapView";

/* ══════════════════════════════════════════════════════════════════
   PROPERTY MODAL (Includes Status & Delete Option)
══════════════════════════════════════════════════════════════════ */
function PropertyModal({ property: p, onClose, isOwner, onDelete }) {
  if (!p) return null;
  const displayImage = p.images && p.images.length > 0 ? p.images[0] : p.image;
  const cleanPhone = p.phone ? p.phone.replace(/\s+/g, "").replace(/-/g, "") : "";

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.box} onClick={(e) => e.stopPropagation()}>
        <button style={modalStyles.closeBtn} onClick={onClose}>✕</button>
        <img src={displayImage} alt="Property" style={modalStyles.img} />
        
        <div style={modalStyles.content}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h2 style={modalStyles.title}>{p.title}</h2>
            {/* Logic: If approved in DB, show Verified, else show Pending */}
            <span style={{ 
              ...modalStyles.statusBadge, 
              backgroundColor: p.status?.toLowerCase() === 'approved' ? '#10b981' : '#f59e0b' 
            }}>
              {p.status?.toLowerCase() === 'approved' ? '✓ Verified' : '⏳ Pending Approval'}
            </span>
          </div>
          
          <p style={modalStyles.location}>📍 {p.area}, {p.county}</p>
          
          <div style={modalStyles.priceRow}>
            <span style={modalStyles.priceText}>Ksh {Number(p.price).toLocaleString()}</span>
            <span style={modalStyles.typePill}>{p.type}</span>
          </div>

          <div style={modalStyles.metaInfo}>
            <p><strong>Bedrooms:</strong> {p.bedrooms || "0"}</p>
            <p><strong>Bathrooms:</strong> {p.bathrooms || "0"}</p>
            <p><strong>Deposit:</strong> Ksh {p.deposit?.toLocaleString() || "0"}</p>
          </div>

          <div style={{ marginTop: "15px" }}>
            <strong style={{ color: "#fbbf24" }}>Full Description:</strong>
            <p style={modalStyles.descriptionText}>{p.description || "No description provided."}</p>
          </div>

          {/* Landlord Specific Controls */}
          {isOwner && (
            <div style={{ marginTop: "20px", borderTop: "1px solid #1e293b", paddingTop: "20px" }}>
              <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "10px" }}>Admin actions or property found a client?</p>
              <button 
                style={modalStyles.deleteBtn} 
                onClick={() => onDelete(p._id)}
              >
                🗑️ Delete My Listing
              </button>
            </div>
          )}

          {/* Contact Area (Hidden for owners) */}
          {!isOwner && (
            <div style={modalStyles.contactContainer}>
              <button style={modalStyles.waButton} onClick={() => window.open(`https://wa.me/${cleanPhone}`)}>
                💬 WhatsApp Landlord
              </button>
            </div>
          )}
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
  const [myProperties, setMyProperties] = useState([]);
  const [viewMode, setViewMode] = useState("all"); 
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const loadData = async () => {
    setLoading(true);
    try {
      const resAll = await API.get(`/properties/approved${location.search}`);
      setProperties(resAll.data);
      if (user) {
        const resMine = await API.get("/properties/my-properties");
        setMyProperties(resMine.data);
      }
    } catch (err) { console.error("Error loading:", err); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [location.search]);

  // Handle Property Deletion
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing? This cannot be undone.")) {
      try {
        await API.delete(`/properties/${id}`);
        setSelected(null);
        loadData(); // Refresh lists
      } catch (err) {
        alert("Failed to delete property. Please try again.");
      }
    }
  };

  const activeList = viewMode === "all" ? properties : myProperties;

  return (
    <div style={styles.root}>
      {selected && (
        <PropertyModal 
          property={selected} 
          onClose={() => setSelected(null)} 
          isOwner={viewMode === "mine"}
          onDelete={handleDelete}
        />
      )}

      <div style={styles.header}>
        <h1 style={{ color: "#fbbf24", margin: 0 }}>AXX Spaces</h1>
        <div style={styles.tabGroup}>
          <button style={viewMode === "all" ? styles.tabActive : styles.tab} onClick={() => setViewMode("all")}>All Rentals</button>
          {user && <button style={viewMode === "mine" ? styles.tabActive : styles.tab} onClick={() => setViewMode("mine")}>My Dashboard</button>}
        </div>
      </div>

      <div style={styles.grid}>
        {activeList.map(p => (
          <div key={p._id} style={styles.card} onClick={() => setSelected(p)}>
            <div style={{ position: 'relative' }}>
              <img src={p.images?.[0] || "/placeholder.jpg"} style={styles.cardImg} alt="property" />
              {/* Card Status Indicator */}
              {viewMode === "mine" && (
                 <div style={{
                   ...styles.miniBadge, 
                   backgroundColor: p.status?.toLowerCase() === 'approved' ? '#10b981' : '#f59e0b'
                 }}>
                   {p.status?.toLowerCase() === 'approved' ? 'Verified' : 'Pending'}
                 </div>
              )}
            </div>
            <div style={styles.cardContent}>
              <h3 style={styles.cardTitle}>{p.title}</h3>
              <p style={styles.cardArea}>📍 {p.area}</p>
              <div style={styles.cardFooter}>
                <span style={{ color: "#34d399", fontWeight: "bold" }}>Ksh {p.price.toLocaleString()}</span>
                <button style={styles.viewBtn}>View Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  root: { padding: "30px", backgroundColor: "#06101f", minHeight: "100vh", color: "white" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  tabGroup: { display: "flex", gap: "10px" },
  tab: { padding: "10px 20px", background: "#0f172a", color: "#94a3b8", border: "none", borderRadius: "6px", cursor: "pointer" },
  tabActive: { padding: "10px 20px", background: "#fbbf24", color: "#06101f", border: "none", borderRadius: "6px", fontWeight: "bold" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "25px" },
  card: { backgroundColor: "#0f172a", borderRadius: "12px", overflow: "hidden", border: "1px solid #1e293b", cursor: "pointer" },
  cardImg: { width: "100%", height: "180px", objectFit: "cover" },
  miniBadge: { position: "absolute", top: "10px", right: "10px", padding: "4px 10px", borderRadius: "5px", fontSize: "0.7rem", color: "white", fontWeight: "bold" },
  cardContent: { padding: "15px" },
  cardTitle: { margin: "0 0 5px 0", fontSize: "1.1rem" },
  cardArea: { color: "#94a3b8", fontSize: "0.85rem", marginBottom: "15px" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  viewBtn: { background: "#1e293b", color: "white", border: "none", padding: "6px 12px", borderRadius: "5px" }
};

const modalStyles = {
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.95)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" },
  box: { backgroundColor: "#0f172a", maxWidth: "480px", width: "100%", borderRadius: "16px", position: "relative", overflowY: "auto", maxHeight: "92vh", border: "1px solid #1e293b" },
  img: { width: "100%", height: "240px", objectFit: "cover" },
  content: { padding: "25px" },
  closeBtn: { position: "absolute", top: "12px", right: "12px", background: "#fff", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontWeight: "bold" },
  statusBadge: { padding: "5px 12px", borderRadius: "8px", fontSize: "0.75rem", color: "white", fontWeight: "bold" },
  priceRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  priceText: { fontSize: "1.6rem", color: "#34d399", fontWeight: "bold" },
  typePill: { background: "#1e293b", padding: "5px 12px", borderRadius: "6px", fontSize: "0.8rem", color: "#fbbf24" },
  descriptionText: { fontSize: "0.95rem", color: "#cbd5e1", lineHeight: "1.5" },
  deleteBtn: { width: "100%", padding: "12px", background: "transparent", border: "1px solid #ef4444", borderRadius: "8px", color: "#ef4444", fontWeight: "bold", cursor: "pointer" },
  waButton: { width: "100%", padding: "14px", background: "#25D366", border: "none", borderRadius: "10px", color: "white", fontWeight: "bold", cursor: "pointer" },
  metaInfo: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", paddingBottom: "15px", borderBottom: "1px solid #1e293b" },
};