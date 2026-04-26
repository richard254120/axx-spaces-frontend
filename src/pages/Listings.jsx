import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Listings() {
  const [properties, setProperties] = useState([]);
  const [myProperties, setMyProperties] = useState([]); // Landlord's personal view
  const [viewMode, setViewMode] = useState("all"); // "all" or "mine"
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelected] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")); // Assuming user data is stored here

  useEffect(() => {
    fetchAllApproved();
    if (user) fetchMyProperties();
  }, [location.search, user?.id]);

  // 1. Fetch public properties (Approved only)
  const fetchAllApproved = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/properties/approved${location.search}`);
      setProperties(res.data);
    } catch (err) {
      console.error("Public fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch landlord's specific properties (Includes Pending/Rejected)
  const fetchMyProperties = async () => {
    try {
      const res = await API.get("/properties/my-properties");
      setMyProperties(res.data);
    } catch (err) {
      console.error("Landlord fetch error:", err);
    }
  };

  const handleWhatsApp = (phone, title) => {
    window.open(`https://wa.me/${phone.replace(/\s/g, "")}?text=Interested in ${title}`, "_blank");
  };

  const currentList = viewMode === "all" ? properties : myProperties;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <h1 style={styles.pageTitle}>AXX Spaces</h1>
          {user && (
            <div style={styles.tabs}>
              <button 
                style={viewMode === "all" ? styles.activeTab : styles.tab} 
                onClick={() => setViewMode("all")}
              >
                Browse All
              </button>
              <button 
                style={viewMode === "mine" ? styles.activeTab : styles.tab} 
                onClick={() => setViewMode("mine")}
              >
                My Submissions
              </button>
            </div>
          )}
        </div>
        <p style={styles.subtitle}>
          {viewMode === "all" ? "Approved Listings for Renters" : "Track your property approval status"}
        </p>
      </div>

      {loading ? (
        <div style={styles.center}><p>Loading...</p></div>
      ) : (
        <div style={styles.grid}>
          {currentList.map((p) => (
            <div key={p._id} style={styles.card}>
              <div style={styles.imgContainer}>
                <img 
                  src={p.images && p.images.length > 0 ? p.images[0] : "/placeholder.jpg"} 
                  style={styles.cardImg} 
                  alt={p.title}
                />
                
                {/* 🟢 Status Badge for Landlords */}
                {viewMode === "mine" && (
                  <div style={{...styles.statusBadge, backgroundColor: getStatusColor(p.status)}}>
                    {p.status.toUpperCase()}
                  </div>
                )}
              </div>
              
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{p.title}</h3>
                <p style={styles.cardLoc}>📍 {p.area}</p>
                <div style={styles.cardFooter}>
                  <span style={styles.cardPrice}>Ksh {Number(p.price).toLocaleString()}</span>
                  {viewMode === "all" ? (
                    <button style={styles.viewBtn} onClick={() => setSelected(p)}>Details</button>
                  ) : (
                    <button style={styles.deleteBtn} onClick={() => deleteProperty(p._id)}>Delete</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper to color the status badges
const getStatusColor = (status) => {
  if (status === "approved") return "#10b981"; // Green
  if (status === "pending") return "#f59e0b";  // Gold/Orange
  return "#ef4444"; // Red
};

const deleteProperty = async (id) => {
    if (window.confirm("Delete this submission?")) {
        try {
            await API.delete(`/properties/${id}`);
            window.location.reload(); 
        } catch (err) { alert("Delete failed"); }
    }
};

const styles = {
  container: { padding: "40px 20px", backgroundColor: "#06101f", minHeight: "100vh", color: "#e2e8f0" },
  header: { maxWidth: "1200px", margin: "0 auto 30px" },
  headerTop: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" },
  pageTitle: { fontSize: "2rem", color: "#fbbf24" },
  tabs: { display: "flex", gap: "10px", backgroundColor: "#0f172a", padding: "5px", borderRadius: "8px" },
  tab: { padding: "8px 16px", color: "#94a3b8", border: "none", background: "none", cursor: "pointer" },
  activeTab: { padding: "8px 16px", color: "#fff", backgroundColor: "#1e293b", borderRadius: "6px", border: "none", fontWeight: "bold" },
  subtitle: { color: "#94a3b8", marginTop: "10px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px", maxWidth: "1200px", margin: "0 auto" },
  card: { backgroundColor: "#0f172a", borderRadius: "12px", overflow: "hidden", border: "1px solid #1e293b" },
  imgContainer: { position: "relative", height: "180px" },
  cardImg: { width: "100%", height: "100%", objectFit: "cover" },
  statusBadge: { position: "absolute", bottom: "10px", right: "10px", padding: "4px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "bold", color: "white" },
  cardContent: { padding: "15px" },
  cardTitle: { fontSize: "1.1rem", marginBottom: "5px" },
  cardLoc: { fontSize: "0.85rem", color: "#94a3b8", marginBottom: "12px" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  cardPrice: { color: "#34d399", fontWeight: "bold" },
  viewBtn: { background: "#fbbf24", color: "#06101f", border: "none", padding: "6px 12px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" },
  deleteBtn: { background: "#ef4444", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }
};