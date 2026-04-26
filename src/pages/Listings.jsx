import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import API from "../api/api";

export default function Listings() {
  const [properties, setProperties] = useState([]);      // Public listings
  const [myProperties, setMyProperties] = useState([]);  // User-specific listings
  const [viewMode, setViewMode] = useState("all");       // 'all' or 'mine'
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // 1. Data Fetching Logic
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch public (Approved only)
      const resAll = await API.get(`/properties/approved${location.search}`);
      setProperties(resAll.data);

      // Fetch personal (Landlord Dashboard)
      if (token) {
        const resMine = await API.get("/properties/my-properties", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyProperties(resMine.data);
      }
    } catch (err) {
      console.error("Fetch failed:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [location.search, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 2. Property Deletion
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await API.delete(`/properties/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelected(null);
      loadData(); // Refresh both lists
    } catch (err) {
      alert("Failed to delete property.");
    }
  };

  const activeList = viewMode === "all" ? properties : myProperties;

  return (
    <div style={styles.root}>
      {/* Detail Modal */}
      {selected && (
        <PropertyModal 
          property={selected} 
          onClose={() => setSelected(null)} 
          isOwner={viewMode === "mine"}
          onDelete={handleDelete}
        />
      )}

      {/* Header & Tabs */}
      <div style={styles.header}>
        <h1 style={{ color: "#fbbf24", margin: 0 }}>AXX Spaces</h1>
        <div style={styles.tabGroup}>
          <button 
            style={viewMode === "all" ? styles.tabActive : styles.tab} 
            onClick={() => setViewMode("all")}
          >
            All Rentals
          </button>
          {user && (
            <button 
              style={viewMode === "mine" ? styles.tabActive : styles.tab} 
              onClick={() => setViewMode("mine")}
            >
              My Properties
            </button>
          )}
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div style={styles.center}><p>Syncing data...</p></div>
      ) : activeList.length === 0 ? (
        <div style={styles.center}>
          <h3>No properties found</h3>
          <p style={{color: "#94a3b8"}}>
            {viewMode === "mine" ? "You haven't uploaded any properties yet." : "No properties available right now."}
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {activeList.map(p => (
            <div key={p._id} style={styles.card} onClick={() => setSelected(p)}>
              <div style={{ position: 'relative' }}>
                <img src={p.images?.[0] || "/placeholder.jpg"} style={styles.cardImg} alt="listing" />
                
                {/* 🟢 STATUS BADGE (Only visible in 'My Properties' tab) */}
                {viewMode === "mine" && (
                   <div style={{
                     ...styles.miniBadge, 
                     backgroundColor: p.status === 'approved' ? '#10b981' : '#f59e0b'
                   }}>
                     {p.status === 'approved' ? 'Verified' : 'Pending Approval'}
                   </div>
                )}
              </div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{p.title}</h3>
                <p style={styles.cardArea}>📍 {p.area}, {p.county}</p>
                <div style={styles.cardFooter}>
                  <span style={{ color: "#34d399", fontWeight: "bold" }}>Ksh {p.price?.toLocaleString()}</span>
                  <button style={styles.viewBtn}>View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   DETAIL MODAL COMPONENT
══════════════════════════════════════════════════════════════════ */
function PropertyModal({ property: p, onClose, isOwner, onDelete }) {
  const isApproved = p.status === 'approved';
  const cleanPhone = p.phone?.replace(/\s+/g, "");

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.box} onClick={e => e.stopPropagation()}>
        <button style={modalStyles.closeBtn} onClick={onClose}>✕</button>
        <img src={p.images?.[0]} style={modalStyles.img} alt="preview" />
        <div style={modalStyles.content}>
          <div style={modalStyles.headerRow}>
            <h2 style={{margin:0}}>{p.title}</h2>
            <span style={{
              ...modalStyles.badge, 
              backgroundColor: isApproved ? '#10b981' : '#f59e0b'
            }}>
              {isApproved ? 'Verified' : 'Pending'}
            </span>
          </div>
          <p style={modalStyles.location}>📍 {p.area}, {p.county}</p>
          <p style={modalStyles.description}>{p.description}</p>
          
          <div style={{marginTop: "25px"}}>
            {isOwner ? (
              <button style={modalStyles.deleteBtn} onClick={() => onDelete(p._id)}>
                🗑️ Delete Listing
              </button>
            ) : (
              <div style={{display: 'flex', gap: '10px'}}>
                <button 
                   style={modalStyles.waBtn} 
                   onClick={() => window.open(`https://wa.me/${cleanPhone}`)}
                >
                  WhatsApp Landlord
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   STYLES (AXX Premium Fintech Theme)
══════════════════════════════════════════════════════════════════ */
const styles = {
  root: { padding: "40px 20px", backgroundColor: "#06101f", minHeight: "100vh", color: "white" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" },
  tabGroup: { display: "flex", gap: "10px", backgroundColor: "#0f172a", padding: "5px", borderRadius: "10px" },
  tab: { padding: "10px 20px", background: "transparent", color: "#94a3b8", border: "none", borderRadius: "8px", cursor: "pointer", transition: "0.3s" },
  tabActive: { padding: "10px 20px", background: "#fbbf24", color: "#06101f", border: "none", borderRadius: "8px", fontWeight: "bold" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "25px" },
  card: { backgroundColor: "#0f172a", borderRadius: "16px", overflow: "hidden", border: "1px solid #1e293b", cursor: "pointer", transition: "transform 0.2s" },
  cardImg: { width: "100%", height: "200px", objectFit: "cover" },
  miniBadge: { position: "absolute", top: "12px", right: "12px", padding: "5px 12px", borderRadius: "6px", fontSize: "0.7rem", color: "white", fontWeight: "bold", boxShadow: "0 4px 6px rgba(0,0,0,0.3)" },
  cardContent: { padding: "20px" },
  cardTitle: { margin: "0 0 8px 0", fontSize: "1.2rem", color: "#f8fafc" },
  cardArea: { color: "#94a3b8", fontSize: "0.9rem", marginBottom: "20px" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  viewBtn: { background: "#1e293b", color: "#fbbf24", border: "1px solid #fbbf24", padding: "8px 16px", borderRadius: "8px", fontSize: "0.85rem", cursor: "pointer" },
  center: { textAlign: "center", marginTop: "100px" }
};

const modalStyles = {
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.92)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000, padding: "20px" },
  box: { backgroundColor: "#0f172a", maxWidth: "500px", width: "100%", borderRadius: "20px", position: "relative", overflow: "hidden", border: "1px solid #1e293b" },
  img: { width: "100%", height: "250px", objectFit: "cover" },
  content: { padding: "25px" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "start", gap: "10px" },
  badge: { padding: "6px 12px", borderRadius: "8px", fontSize: "0.75rem", color: "white", fontWeight: "bold", textTransform: "uppercase" },
  location: { color: "#fbbf24", fontSize: "0.95rem", margin: "10px 0" },
  description: { color: "#cbd5e1", fontSize: "0.9rem", lineHeight: "1.6" },
  closeBtn: { position: "absolute", top: "15px", right: "15px", background: "white", border: "none", borderRadius: "50%", width: "30px", height: "30px", fontWeight: "bold", cursor: "pointer", zIndex: 10 },
  deleteBtn: { width: "100%", padding: "14px", background: "transparent", border: "1px solid #ef4444", color: "#ef4444", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" },
  waBtn: { width: "100%", padding: "14px", background: "#25D366", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }
};