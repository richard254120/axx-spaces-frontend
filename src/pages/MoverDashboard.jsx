import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function MoverDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // SECURITY: strictly block non-movers
    if (!user) navigate("/login");
    if (user && user.role !== "mover") navigate("/dashboard");
  }, [user, navigate]);

  return (
    <div style={styles.container}>
      <style>{mobileCss}</style>
      
      {/* Top Header */}
      <header style={styles.topBar}>
        <span style={styles.logoText}>Axx Mover</span>
        <button onClick={logout} style={styles.logoutIcon}>🚪</button>
      </header>

      {/* Main Content Area */}
      <main style={styles.content}>
        {activeTab === "overview" && (
          <section>
            <div style={styles.welcomeCard}>
              <h2>Hello, {user?.name.split(" ")[0]}!</h2>
              <p>Your account is **{user?.status || "Active"}**</p>
            </div>

            <div style={styles.statsRow}>
              <div style={styles.miniCard}><h4>0</h4><p>Jobs</p></div>
              <div style={styles.miniCard}><h4>KES 0</h4><p>Earned</p></div>
            </div>

            <h3 style={styles.sectionTitle}>Recent Move Requests</h3>
            <div style={styles.emptyBox}>
              <p>No requests yet. Stay tuned!</p>
            </div>
          </section>
        )}

        {activeTab === "profile" && (
          <section style={styles.profilePage}>
            <div style={styles.avatarLarge}>🚚</div>
            <h3>{user?.name}</h3>
            <p style={styles.userEmail}>{user?.email}</p>
            <hr style={styles.divider} />
            <div style={styles.infoRow}><strong>Phone:</strong> {user?.phone}</div>
            <div style={styles.infoRow}><strong>County:</strong> {user?.county || "Not Set"}</div>
            <button style={styles.editBtn}>Edit Profile</button>
          </section>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav style={styles.bottomNav}>
        <button 
          style={activeTab === "overview" ? styles.navBtnActive : styles.navBtn} 
          onClick={() => setActiveTab("overview")}
        >
          📊 <span>Home</span>
        </button>
        <button 
          style={activeTab === "jobs" ? styles.navBtnActive : styles.navBtn} 
          onClick={() => setActiveTab("jobs")}
        >
          📦 <span>Jobs</span>
        </button>
        <button 
          style={activeTab === "profile" ? styles.navBtnActive : styles.navBtn} 
          onClick={() => setActiveTab("profile")}
        >
          👤 <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}

const styles = {
  container: { background: "#f4f7f6", minHeight: "100vh", paddingBottom: "80px", fontFamily: "'DM Sans', sans-serif" },
  topBar: { background: "#1f2937", color: "white", padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 },
  logoText: { fontWeight: "800", fontSize: "18px", color: "#fbbf24" },
  logoutIcon: { background: "none", border: "none", fontSize: "20px", cursor: "pointer" },
  content: { padding: "20px" },
  welcomeCard: { background: "linear-gradient(135deg, #ef4444, #b91c1c)", color: "white", padding: "25px", borderRadius: "15px", marginBottom: "20px", boxShadow: "0 4px 15px rgba(239, 68, 68, 0.2)" },
  statsRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "25px" },
  miniCard: { background: "white", padding: "15px", borderRadius: "12px", textAlign: "center", border: "1px solid #e5e7eb" },
  sectionTitle: { fontSize: "16px", fontWeight: "700", color: "#374151", marginBottom: "10px" },
  emptyBox: { background: "white", padding: "40px 20px", textAlign: "center", borderRadius: "12px", color: "#9ca3af", border: "1px dashed #d1d5db" },
  bottomNav: { position: "fixed", bottom: 0, width: "100%", background: "white", display: "flex", justifyContent: "space-around", padding: "10px 0", borderTop: "1px solid #e5e7eb", boxShadow: "0 -2px 10px rgba(0,0,0,0.05)" },
  navBtn: { border: "none", background: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: "#9ca3af", fontSize: "12px" },
  navBtnActive: { border: "none", background: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: "#ef4444", fontSize: "12px", fontWeight: "bold" },
  profilePage: { textAlign: "center", background: "white", padding: "30px 20px", borderRadius: "15px" },
  avatarLarge: { fontSize: "60px", marginBottom: "10px" },
  userEmail: { color: "#6b7280", marginBottom: "20px" },
  divider: { margin: "20px 0", border: "0.5px solid #f3f4f6" },
  infoRow: { textAlign: "left", padding: "10px 0", fontSize: "14px", borderBottom: "1px solid #f9fafb" },
  editBtn: { marginTop: "20px", width: "100%", padding: "12px", borderRadius: "8px", border: "none", background: "#1f2937", color: "white", fontWeight: "bold" }
};

const mobileCss = `
  body { margin: 0; padding: 0; }
  h2, h3, h4 { margin: 0; }
`;