import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function AdminDashboard() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Security check: ensure only admins can stay on this page
    if (user?.role !== "admin") {
      navigate("/");
      return;
    }
    loadPending();
  }, []);

  const loadPending = async () => {
    try {
      setLoading(true);
      // Fetches properties where status is 'pending'
      const res = await API.get("/properties/admin/pending");
      setPending(res.data);
    } catch (err) {
      console.error("❌ Failed to load pending properties", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      // Using a single PATCH route is cleaner for state management
      await API.patch(`/properties/${id}/status`, { status });
      setPending((prev) => prev.filter((item) => item._id !== id));
      console.log(`✅ Property ${status} successfully`);
    } catch (err) {
      alert("❌ Operation failed. Please check permissions.");
    }
  };

  return (
    <div style={styles.container}>
      <style>{cssStyles}</style>
      
      <div style={styles.header}>
        <h1 style={styles.title}>🛡️ Admin Review Panel</h1>
        <p style={styles.subtitle}>Manage pending submissions for Axx Spaces</p>
      </div>

      {loading ? (
        <div style={styles.loader}>⏳ Syncing with database...</div>
      ) : pending.length === 0 ? (
        <div style={styles.emptyCard}>
          <p style={styles.emptyText}>✅ All caught up! No pending properties to review.</p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={styles.th}>Property Details</th>
                <th style={styles.th}>Owner Info</th>
                <th style={styles.th}>Price (KES)</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((item) => (
                <tr key={item._id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.propTitle}>{item.title}</div>
                    <div style={styles.propLoc}>📍 {item.location || `${item.area}, ${item.county}`}</div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.ownerName}>{item.owner?.name || "Member"}</div>
                    <div style={styles.ownerContact}>{item.owner?.phone}</div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.priceBadge}>{item.price.toLocaleString()}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.btnGroup}>
                      <button 
                        onClick={() => handleStatusUpdate(item._id, "approved")} 
                        style={styles.approveBtn}
                      >Approve</button>
                      <button 
                        onClick={() => handleStatusUpdate(item._id, "rejected")} 
                        style={styles.rejectBtn}
                      >Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ==================== STYLES (Midnight Blue & Gold Theme) ==================== */
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #06101f 0%, #0a1428 100%)",
    padding: "50px 5%",
    color: "#f1f5f9",
    fontFamily: "'DM Sans', sans-serif",
  },
  header: { textAlign: "center", marginBottom: "50px" },
  title: { fontSize: "32px", fontWeight: 800, color: "#fbbf24", marginBottom: "10px" },
  subtitle: { color: "#94a3b8", fontSize: "16px" },
  loader: { textAlign: "center", padding: "100px", color: "#fbbf24", fontSize: "18px" },
  emptyCard: { 
    background: "rgba(30, 41, 59, 0.4)", 
    padding: "60px", 
    borderRadius: "20px", 
    textAlign: "center", 
    border: "1px dashed rgba(251, 191, 36, 0.3)" 
  },
  emptyText: { color: "#94a3b8", fontSize: "18px" },
  tableContainer: {
    background: "rgba(15, 23, 42, 0.8)",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.05)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
  },
  table: { width: "100%", borderCollapse: "collapse" },
  theadRow: { background: "rgba(251, 191, 36, 0.1)" },
  th: { padding: "18px", textAlign: "left", color: "#fbbf24", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px" },
  tr: { borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "0.2s" },
  td: { padding: "18px", verticalAlign: "middle" },
  propTitle: { fontWeight: 700, fontSize: "16px", marginBottom: "4px" },
  propLoc: { fontSize: "13px", color: "#94a3b8" },
  ownerName: { fontWeight: 600, fontSize: "14px" },
  ownerContact: { fontSize: "12px", color: "#64748b" },
  priceBadge: { background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", padding: "6px 12px", borderRadius: "6px", fontWeight: 700 },
  btnGroup: { display: "flex", gap: "10px" },
  approveBtn: { 
    background: "#22c55e", color: "white", border: "none", 
    padding: "8px 16px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" 
  },
  rejectBtn: { 
    background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid #ef4444", 
    padding: "8px 16px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" 
  }
};

const cssStyles = `
  tr:hover { background: rgba(255,255,255,0.02); }
  button:active { transform: scale(0.95); }
  button:hover { opacity: 0.9; }
`;