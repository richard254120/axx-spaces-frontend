import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";
import MapView from "../components/MapView";

/* ══════════════════════════════════════════════════════════════════
   PROPERTY MODAL (Shows Full Details)
══════════════════════════════════════════════════════════════════ */
function PropertyModal({ property: p, onClose }) {
  if (!p) return null;
  const displayImage = p.images && p.images.length > 0 ? p.images[0] : p.image;

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.box} onClick={(e) => e.stopPropagation()}>
        <button style={modalStyles.closeBtn} onClick={onClose}>✕</button>
        <img src={displayImage} alt="Property" style={modalStyles.img} />
        <div style={modalStyles.content}>
          <h2>{p.title}</h2>
          <p style={{color: "#94a3b8"}}>📍 {p.area}, {p.county}</p>
          <div style={modalStyles.priceRow}>
            <span style={modalStyles.price}>Ksh {Number(p.price).toLocaleString()}</span>
            <span style={modalStyles.pill}>{p.type}</span>
          </div>
          <div style={modalStyles.details}>
            <p><strong>Bedrooms:</strong> {p.bedrooms || "N/A"}</p>
            <p><strong>Bathrooms:</strong> {p.bathrooms || "N/A"}</p>
            <p><strong>Deposit:</strong> Ksh {p.deposit?.toLocaleString() || "0"}</p>
          </div>
          <div style={{marginTop: "15px"}}>
            <strong>Description:</strong>
            <p style={modalStyles.desc}>{p.description || "No description provided."}</p>
          </div>
          {p.amenities?.length > 0 && (
            <div style={{marginTop: "10px"}}>
              <strong>Amenities:</strong>
              <div style={modalStyles.amenityList}>
                {p.amenities.map(a => <span key={a} style={modalStyles.aPill}>✓ {a}</span>)}
              </div>
            </div>
          )}
          <button style={modalStyles.waBtn} onClick={() => window.open(`https://wa.me/${p.phone}`)}>
            Contact Landlord
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
  const [myProperties, setMyProperties] = useState([]);
  const [viewMode, setViewMode] = useState("all"); 
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const resAll = await API.get(`/properties/approved${location.search}`);
        setProperties(resAll.data);
        if (user) {
          const resMine = await API.get("/properties/my-properties");
          setMyProperties(resMine.data);
        }
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
  }, [location.search]);

  const list = viewMode === "all" ? properties : myProperties;

  return (
    <div style={styles.root}>
      {selected && <PropertyModal property={selected} onClose={() => setSelected(null)} />}

      <div style={styles.header}>
        <h1 style={{color: "#fbbf24"}}>AXX Spaces</h1>
        <div style={styles.nav}>
          <button style={viewMode === "all" ? styles.actTab : styles.tab} onClick={() => setViewMode("all")}>All Rentals</button>
          {user && <button style={viewMode === "mine" ? styles.actTab : styles.tab} onClick={() => setViewMode("mine")}>My Dashboard</button>}
        </div>
      </div>

      {viewMode === "all" && properties.length > 0 && (
        <div style={styles.map}><MapView properties={properties} /></div>
      )}

      <div style={styles.grid}>
        {list.map(p => (
          <div key={p._id} style={styles.card} onClick={() => setSelected(p)}>
            <img src={p.images?.[0] || "/placeholder.jpg"} style={styles.cardImg} alt="property" />
            <div style={{padding: "15px"}}>
              <h3>{p.title}</h3>
              <p style={{color: "#94a3b8", fontSize: "0.85rem"}}>📍 {p.area}</p>
              <div style={styles.cardFooter}>
                <span style={{color: "#34d399", fontWeight: "bold"}}>Ksh {p.price.toLocaleString()}</span>
                <button style={styles.btn}>View Full Details</button>
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
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  nav: { display: "flex", gap: "10px" },
  tab: { padding: "10px 20px", background: "#0f172a", color: "#94a3b8", border: "none", cursor: "pointer" },
  actTab: { padding: "10px 20px", background: "#fbbf24", color: "#06101f", border: "none", fontWeight: "bold" },
  map: { height: "300px", borderRadius: "12px", overflow: "hidden", marginBottom: "30px", border: "1px solid #1e293b" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "25px" },
  card: { backgroundColor: "#0f172a", borderRadius: "12px", overflow: "hidden", border: "1px solid #1e293b", cursor: "pointer" },
  cardImg: { width: "100%", height: "180px", objectFit: "cover" },
  cardFooter: { display: "flex", justifyContent: "space-between", marginTop: "10px", alignItems: "center" },
  btn: { background: "#1e293b", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px" }
};

const modalStyles = {
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.9)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" },
  box: { backgroundColor: "#0f172a", maxWidth: "500px", width: "100%", borderRadius: "15px", position: "relative", overflowY: "auto", maxHeight: "90vh" },
  img: { width: "100%", height: "250px", objectFit: "cover" },
  content: { padding: "20px" },
  closeBtn: { position: "absolute", top: "10px", right: "10px", background: "white", border: "none", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", fontWeight: "bold" },
  priceRow: { display: "flex", justifyContent: "space-between", alignItems: "center", margin: "15px 0" },
  price: { fontSize: "1.5rem", color: "#34d399", fontWeight: "bold" },
  pill: { background: "#1e293b", padding: "4px 10px", borderRadius: "4px", fontSize: "0.8rem" },
  details: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", borderBottom: "1px solid #1e293b", paddingBottom: "15px" },
  desc: { fontSize: "0.9rem", color: "#cbd5e1", marginTop: "5px" },
  waBtn: { width: "100%", padding: "12px", background: "#25D366", border: "none", borderRadius: "8px", color: "white", fontWeight: "bold", marginTop: "20px", cursor: "pointer" },
  amenityList: { display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" },
  aPill: { fontSize: "0.75rem", color: "#34d399" }
};