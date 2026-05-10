import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

export default function MoverDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    pendingRequests: 0,
    completedMoves: 0,
    totalEarnings: 0
  });

  // Example of fetching mover-specific data
  useEffect(() => {
    if (!user || user.role !== "mover") {
      navigate("/login");
      return;
    }
    // You would fetch real stats from your backend here
  }, [user, navigate]);

  return (
    <div style={styles.dashboard}>
      <style>{css}</style>
      
      {/* Sidebar / Header */}
      <nav style={styles.sidebar}>
        <div style={styles.profileSection}>
          <div style={styles.avatar}>🚚</div>
          <h3 style={styles.userName}>{user?.name || "Mover Partner"}</h3>
          <span style={styles.badge}>Verified Mover</span>
        </div>
        
        <ul style={styles.navLinks}>
          <li style={styles.activeLink}>📊 Overview</li>
          <li>📦 Move Requests</li>
          <li>🛠 Manage Services</li>
          <li>⚙️ Settings</li>
        </ul>

        <button onClick={logout} style={styles.logoutBtn}>🚪 Logout</button>
      </nav>

      {/* Main Content */}
      <main style={styles.main}>
        <header style={styles.header}>
          <h1>Mover Dashboard</h1>
          <p>Welcome back! You have <strong>{stats.pendingRequests}</strong> new move requests today.</p>
        </header>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h4>Pending</h4>
            <p style={styles.statValue}>{stats.pendingRequests}</p>
          </div>
          <div style={styles.statCard}>
            <h4>Completed</h4>
            <p style={styles.statValue}>{stats.completedMoves}</p>
          </div>
          <div style={styles.statCard}>
            <h4>Total Revenue</h4>
            <p style={{...styles.statValue, color: "#10b981"}}>KES 0</p>
          </div>
        </div>

        {/* Recent Activity Section */}
        <section style={styles.section}>
          <h3>Recent Requests</h3>
          <div style={styles.emptyState}>
            <p>No active requests found. Make sure your profile is updated to attract clients!</p>
            <button style={styles.actionBtn}>Update Portfolio</button>
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  dashboard: { display: "flex", minHeight: "100vh", background: "#f9fafb", fontFamily: "'DM Sans', sans-serif" },
  sidebar: { width: "260px", background: "#1f2937", color: "white", padding: "30px 20px", display: "flex", flexDirection: "column" },
  profileSection: { textAlign: "center", marginBottom: "40px" },
  avatar: { fontSize: "40px", marginBottom: "10px" },
  userName: { margin: "0", fontSize: "18px" },
  badge: { fontSize: "12px", color: "#fbbf24", fontWeight: "bold" },
  navLinks: { listStyle: "none", padding: "0", flex: 1 },
  activeLink: { background: "#374151", padding: "12px", borderRadius: "8px", marginBottom: "10px", color: "#fbbf24" },
  logoutBtn: { background: "transparent", border: "1px solid #ef4444", color: "#ef4444", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  main: { flex: 1, padding: "40px" },
  header: { marginBottom: "30px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "40px" },
  statCard: { background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", border: "1px solid #e5e7eb" },
  statValue: { fontSize: "28px", fontWeight: "800", margin: "10px 0 0" },
  section: { background: "white", padding: "30px", borderRadius: "12px", border: "1px solid #e5e7eb" },
  emptyState: { textAlign: "center", color: "#6b7280", padding: "40px 0" },
  actionBtn: { marginTop: "15px", padding: "10px 20px", background: "#2427fb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }
};

const css = `
  li { padding: 12px; cursor: pointer; transition: 0.2s; color: #9ca3af; }
  li:hover { color: white; }
`;