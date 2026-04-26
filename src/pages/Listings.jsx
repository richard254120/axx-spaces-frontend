import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import API from "../api/api";

export default function Listings() {
  const [properties, setProperties] = useState([]);      // Public list
  const [myProperties, setMyProperties] = useState([]);  // Landlord list
  const [viewMode, setViewMode] = useState("all");       // Toggle state
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch public rentals
      const resAll = await API.get(`/properties/approved${location.search}`);
      setProperties(resAll.data);

      // Fetch landlord submissions
      if (token) {
        const resMine = await API.get("/properties/my-properties", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyProperties(resMine.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [location.search, token]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await API.delete(`/properties/${id}`, { headers: { Authorization: `Bearer ${token}` }});
      setSelected(null);
      loadData();
    } catch (err) { alert("Delete failed"); }
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
        <h1 style={{ color: "#fbbf24" }}>AXX Spaces</h1>
        <div style={styles.tabGroup}>
          <button style={viewMode === "all" ? styles.tabActive : styles.tab} onClick={() => setViewMode("all")}>All Rentals</button>
          {user && <button style={viewMode === "mine" ? styles.tabActive : styles.tab} onClick={() => setViewMode("mine")}>My Properties</button>}
        </div>
      </div>

      {loading ? (
        <p style={styles.center}>Loading...</p>
      ) : activeList.length === 0 ? (
        <p style={styles.center}>No properties found in this section.</p>
      ) : (
        <div style={styles.grid}>
          {activeList.map(p => (
            <div key={p._id} style={styles.card} onClick={() => setSelected(p)}>
              <div style={{ position: 'relative' }}>
                <img src={p.images?.[0] || "/placeholder.jpg"} style={styles.cardImg} alt="property" />
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
                <h3>{p.title}</h3>
                <p style={{color: "#94a3b8"}}>📍 {p.area}</p>
                <div style={styles.cardFooter}>
                  <span style={{ color: "#34d399", fontWeight: "bold" }}>Ksh {p.price.toLocaleString()}</span>
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
   MODAL COMPONENT
══════════════════════════════════════════════════════════════════ */
function PropertyModal({ property: p, onClose, isOwner, onDelete }) {
  const isApproved = p.status === 'approved';
  const cleanPhone = p.phone?.replace(/\s+/g, "");

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.box} onClick={e => e.stopPropagation()}>
        <button style={modalStyles.closeBtn} onClick={onClose}>✕</button>
        <img src={p.images?.[0]} style={modalStyles.img} />
        <div style={modalStyles.content}>
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <h2>{p.title}</h2>
            <span style={{...modalStyles.badge, backgroundColor: isApproved ? '#10b981' : '#f59e0b'}}>
              {isApproved ? 'Verified' : 'Pending Approval'}
            </span>
          </div>
          <p>{p.description}</p>
          
          <div style={{marginTop:'20px'}}>
            {isOwner ? (
              <button style={modalStyles.deleteBtn} onClick={() => onDelete(p._id)}>🗑️ Delete Listing</button>
            ) : (
              <div style={{display:'flex', gap:'10px'}}>
                <button style={modalStyles.waBtn} onClick={() => window.open(`https://wa.me/${cleanPhone}`)}>WhatsApp</button>
                <button style={modalStyles.callBtn} onClick={() => window.open(`tel:${cleanPhone}`)}>Call</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// STYLES
const styles = {
  root: { padding: "30px", backgroundColor: "#06101f", minHeight: "100vh", color: "white" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: "30px" },
  tabGroup: { display: "flex", gap: "10px" },
  tab: { padding: "10px 20px", background: "#0f172a", color: "#94a3b8", border: "none", cursor: "pointer", borderRadius: "8px" },
  tabActive: { padding: "10px 20px", background: "#fbbf24", color: "#06101f", border: "none", borderRadius: "8px", fontWeight: "bold" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "25px" },
  card: { backgroundColor: "#0f172a", borderRadius: "12px", overflow: "hidden", border: "1px solid #1e293b", cursor: "pointer" },
  cardImg: { width: "100%", height: "180px", objectFit: "cover" },
  miniBadge: { position: "absolute", top: "10px", right: "10px", padding: "4px 8px", borderRadius: "5px", fontSize: "0.7rem", color: "white", fontWeight: "bold" },
  cardContent: { padding: "15px" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px" },
  viewBtn: { background: "#1e293b", color: "white", border: "none", padding: "6px 12px", borderRadius: "5px" },
  center: { textAlign: "center", marginTop: "50px" }
};

const modalStyles = {
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.9)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  box: { backgroundColor: "#0f172a", maxWidth: "450px", width: "95%", borderRadius: "15px", position: "relative", overflow: "hidden" },
  img: { width: "100%", height: "200px", objectFit: "cover" },
  content: { padding: "20px" },
  badge: { padding: "5px 10px", borderRadius: "5px", fontSize: "0.7rem", color: "white", fontWeight: "bold" },
  closeBtn: { position: "absolute", top: "10px", right: "10px", zIndex: 10 },
  deleteBtn: { width: "100%", padding: "12px", background: "#ef4444", border: "none", borderRadius: "8px", color: "white", fontWeight: "bold", cursor: "pointer" },
  waBtn: { flex: 1, padding: "12px", background: "#25D366", color: "white", borderRadius: "8px", border: "none", fontWeight: "bold" },
  callBtn: { flex: 1, padding: "12px", background: "#3b82f6", color: "white", borderRadius: "8px", border: "none", fontWeight: "bold" }
};