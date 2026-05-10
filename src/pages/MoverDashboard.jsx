import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

export default function MoverDashboard() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [moverData, setMoverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); 

  const [profileData, setProfileData] = useState({
    county: "",
    services: [],
    experienceYears: "",
    vehicleType: "",
    description: "",
  });

  useEffect(() => {
    if (!token) {
      navigate("/movers"); // Redirect to login if no token
      return;
    }
    fetchMoverData();
  }, [token, navigate]);

  const fetchMoverData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch mover data");

      const data = await response.json();
      setMoverData(data);
      setProfileData({
        county: data.county || "",
        services: data.services || [],
        experienceYears: data.experienceYears || "",
        vehicleType: data.vehicleType || "",
        description: data.description || "",
      });

      // Mock jobs data (Replace with API call to /movers/jobs later)
      setJobs([
        { id: 1, customer: "John Doe", location: "Nairobi CBD", service: "Household Moving", date: "2026-05-15", status: "completed", amount: 5000 },
        { id: 2, customer: "Jane Smith", location: "Westlands", service: "Office Relocation", date: "2026-05-18", status: "in-progress", amount: 8500 },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await fetch(`${API_BASE}/movers/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) throw new Error("Update failed");

      setMoverData({ ...moverData, ...profileData });
      setEditingProfile(false);
      alert("✅ Profile updated successfully!");
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const totalEarnings = jobs.filter(j => j.status === "completed").reduce((sum, j) => sum + j.amount, 0);

  if (loading) return <div style={styles.loader}>Loading Mover Portal...</div>;

  return (
    <div style={styles.root}>
      {/* Mobile Sidebar Toggle */}
      <div style={styles.mobileHeader}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.hamburger}>☰</button>
        <span style={styles.mobileLogo}>AXX MOVERS</span>
      </div>

      {/* Sidebar */}
      <div style={{ ...styles.sidebar, left: sidebarOpen ? "0" : "-280px" }}>
        <div style={styles.logo}>🚚 Mover Portal</div>
        
        <div style={styles.profileBrief}>
          <div style={styles.avatar}>{moverData?.name?.charAt(0)}</div>
          <h3>{moverData?.name}</h3>
          <span style={styles.statusBadge}>Verified Professional</span>
        </div>

        <nav style={styles.nav}>
          <button onClick={() => setActiveTab("overview")} style={activeTab === "overview" ? styles.navActive : styles.navBtn}>📊 Overview</button>
          <button onClick={() => setActiveTab("jobs")} style={activeTab === "jobs" ? styles.navActive : styles.navBtn}>📋 My Jobs</button>
          <button onClick={() => setActiveTab("profile")} style={activeTab === "profile" ? styles.navActive : styles.navBtn}>👤 My Profile</button>
          <button onClick={() => logout()} style={styles.logoutBtn}>🚪 Logout</button>
        </nav>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        <div style={styles.header}>
          <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
          <p>Welcome back, {moverData?.name.split(' ')[0]}!</p>
        </div>

        {activeTab === "overview" && (
          <div style={styles.grid}>
            <div style={styles.statCard}>
              <p>Total Earnings</p>
              <h3>KES {totalEarnings.toLocaleString()}</h3>
            </div>
            <div style={styles.statCard}>
              <p>Jobs Completed</p>
              <h3>{jobs.filter(j => j.status === "completed").length}</h3>
            </div>
            <div style={styles.statCard}>
              <p>Active Requests</p>
              <h3>{jobs.filter(j => j.status === "in-progress").length}</h3>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div style={styles.card}>
             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <h3>Business Details</h3>
                <button onClick={() => setEditingProfile(!editingProfile)} style={styles.editBtn}>
                    {editingProfile ? "Cancel" : "Edit Profile"}
                </button>
             </div>
             
             <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                    <label>Operating County</label>
                    <input 
                        disabled={!editingProfile} 
                        value={profileData.county} 
                        onChange={(e) => setProfileData({...profileData, county: e.target.value})}
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label>Years of Experience</label>
                    <input 
                        disabled={!editingProfile} 
                        value={profileData.experienceYears} 
                        onChange={(e) => setProfileData({...profileData, experienceYears: e.target.value})}
                        style={styles.input}
                    />
                </div>
             </div>

             <div style={styles.inputGroup}>
                <label>Service Description</label>
                <textarea 
                    disabled={!editingProfile} 
                    value={profileData.description} 
                    onChange={(e) => setProfileData({...profileData, description: e.target.value})}
                    style={styles.textarea}
                />
             </div>

             {editingProfile && (
                <button onClick={handleProfileUpdate} style={styles.saveBtn}>Save Changes</button>
             )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  root: { display: "flex", minHeight: "100vh", background: "#0f172a", color: "#f1f5f9", fontFamily: "sans-serif" },
  loader: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#0f172a", color: "#fbbf24" },
  sidebar: { width: "280px", background: "#1e293b", padding: "30px", borderRight: "1px solid #334155", position: "fixed", height: "100vh", transition: "0.3s" },
  logo: { fontSize: "1.5rem", fontWeight: "bold", color: "#fbbf24", marginBottom: "40px" },
  profileBrief: { textAlign: "center", marginBottom: "30px" },
  avatar: { width: "60px", height: "60px", background: "#fbbf24", borderRadius: "50%", margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: "bold", fontSize: "1.2rem" },
  statusBadge: { fontSize: "0.8rem", color: "#22c55e", background: "rgba(34, 197, 94, 0.1)", padding: "4px 8px", borderRadius: "4px" },
  nav: { display: "flex", flexDirection: "column", gap: "10px" },
  navBtn: { padding: "12px", textAlign: "left", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", borderRadius: "8px" },
  navActive: { padding: "12px", textAlign: "left", background: "#334155", border: "none", color: "#fbbf24", cursor: "pointer", borderRadius: "8px", fontWeight: "bold" },
  logoutBtn: { padding: "12px", textAlign: "left", background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", marginTop: "20px" },
  main: { flex: 1, marginLeft: "280px", padding: "40px" },
  header: { marginBottom: "30px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" },
  statCard: { background: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid #334155" },
  card: { background: "#1e293b", padding: "30px", borderRadius: "12px", border: "1px solid #334155" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "15px" },
  input: { padding: "10px", background: "#0f172a", border: "1px solid #334155", borderRadius: "6px", color: "#fff" },
  textarea: { padding: "10px", background: "#0f172a", border: "1px solid #334155", borderRadius: "6px", color: "#fff", height: "100px", resize: "none" },
  editBtn: { padding: "8px 16px", background: "#fbbf24", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" },
  saveBtn: { width: "100%", padding: "12px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" },
  mobileHeader: { display: "none", padding: "15px", background: "#1e293b", justifyContent: "space-between", alignItems: "center" },
  hamburger: { fontSize: "1.5rem", background: "none", border: "none", color: "#fff" }
};