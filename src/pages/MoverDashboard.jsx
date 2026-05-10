import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api"; // Ensure this points to your axios instance

export default function MoverDashboard() {
  const { token, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  // --- DATA STATE ---
  const [moverData, setMoverData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [profileData, setProfileData] = useState({
    county: "",
    experienceYears: "",
    vehicleType: "",
    description: "",
    services: []
  });

  useEffect(() => {
    if (!token) {
      navigate("/movers"); 
      return;
    }
    fetchMoverPortal();
  }, [token]);

  const fetchMoverPortal = async () => {
    try {
      setLoading(true);
      // Fetch fresh data from /auth/me or a specific /movers/profile endpoint
      const res = await API.get("/auth/me");
      const data = res.data;

      setMoverData(data);
      setProfileData({
        county: data.county || "",
        experienceYears: data.experienceYears || "",
        vehicleType: data.vehicleType || "",
        description: data.description || "",
        services: data.services || []
      });

      // If the mover isn't approved, force them to the pending tab
      if (!data.isApproved) {
        setActiveTab("pending");
      }

      // Mock jobs - Replace with API.get("/movers/my-jobs") later
      setJobs([
        { id: 1, customer: "John Doe", location: "Nairobi CBD", service: "Household Moving", date: "2026-05-15", status: "completed", amount: 5000 },
        { id: 2, customer: "Jane Smith", location: "Westlands", service: "Office Relocation", date: "2026-05-18", status: "in-progress", amount: 8500 },
      ]);
    } catch (err) {
      console.error("Dashboard Load Error:", err);
      if (err.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await API.put("/movers/profile", profileData);
      setMoverData({ ...moverData, ...profileData });
      setEditingProfile(false);
      alert("✅ Business profile updated successfully!");
    } catch (err) {
      alert("❌ Update failed. Please check your connection.");
    }
  };

  const totalEarnings = jobs
    .filter(j => j.status === "completed")
    .reduce((sum, j) => sum + j.amount, 0);

  if (loading) return <div style={styles.loader}>Initializing Secure Portal...</div>;

  return (
    <div style={styles.root}>
      {/* Mobile Header */}
      <div style={styles.mobileHeader}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.hamburger}>☰</button>
        <span style={styles.mobileLogo}>AXX MOVERS</span>
      </div>

      {/* Sidebar Navigation */}
      <div style={{ ...styles.sidebar, left: sidebarOpen ? "0" : "-280px" }}>
        <div style={styles.logo}>🚚 Mover Portal</div>
        
        <div style={styles.profileBrief}>
          <div style={styles.avatar}>{moverData?.name?.charAt(0)}</div>
          <h3>{moverData?.name}</h3>
          <span style={moverData?.isApproved ? styles.statusBadge : styles.pendingBadge}>
            {moverData?.isApproved ? "Verified Professional" : "Pending Verification"}
          </span>
        </div>

        <nav style={styles.nav}>
          <button 
            disabled={!moverData?.isApproved}
            onClick={() => {setActiveTab("overview"); setSidebarOpen(false);}} 
            style={activeTab === "overview" ? styles.navActive : styles.navBtn}
          >📊 Business Overview</button>
          
          <button 
            disabled={!moverData?.isApproved}
            onClick={() => {setActiveTab("jobs"); setSidebarOpen(false);}} 
            style={activeTab === "jobs" ? styles.navActive : styles.navBtn}
          >📋 Active Jobs</button>
          
          <button 
            onClick={() => {setActiveTab("profile"); setSidebarOpen(false);}} 
            style={activeTab === "profile" ? styles.navActive : styles.navBtn}
          >👤 Edit Business Profile</button>
          
          <button onClick={() => logout()} style={styles.logoutBtn}>🚪 Logout</button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div style={styles.main}>
        <div style={styles.header}>
          <h2 style={{textTransform: 'capitalize'}}>{activeTab}</h2>
          <p>Logged in as: <b>{moverData?.email}</b></p>
        </div>

        {/* CASE 1: NOT YET APPROVED */}
        {activeTab === "pending" && (
          <div style={styles.card}>
            <div style={{textAlign: 'center', padding: '40px'}}>
                <h1 style={{fontSize: '3rem'}}>⏳</h1>
                <h2 style={{color: '#fbbf24'}}>Application Under Review</h2>
                <p style={{color: '#94a3b8', maxWidth: '500px', margin: '20px auto', lineHeight: '1.6'}}>
                    Welcome to Axx Movers, <b>{moverData?.name}</b>! Your account is currently being 
                    vetted by our administrators. Once verified, you will appear in search 
                    results and gain access to your job leads.
                </p>
                <div style={styles.infoBox}>
                    <p>Expected verification time: <b>12-24 Hours</b></p>
                </div>
            </div>
          </div>
        )}

        {/* CASE 2: DASHBOARD OVERVIEW */}
        {activeTab === "overview" && moverData?.isApproved && (
          <div style={styles.grid}>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Total Revenue</p>
              <h3 style={styles.statValue}>KES {totalEarnings.toLocaleString()}</h3>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Completed Moves</p>
              <h3 style={styles.statValue}>{jobs.filter(j => j.status === "completed").length}</h3>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Success Rate</p>
              <h3 style={styles.statValue}>100%</h3>
            </div>
          </div>
        )}

        {/* CASE 3: PROFILE MANAGEMENT */}
        {activeTab === "profile" && (
          <div style={styles.card}>
             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px'}}>
                <h3>Business Information</h3>
                <button onClick={() => setEditingProfile(!editingProfile)} style={styles.editBtn}>
                    {editingProfile ? "Cancel" : "✏️ Update Profile"}
                </button>
             </div>
             
             <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Base County</label>
                    <input 
                        disabled={!editingProfile} 
                        value={profileData.county} 
                        onChange={(e) => setProfileData({...profileData, county: e.target.value})}
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Years of Experience</label>
                    <input 
                        type="number"
                        disabled={!editingProfile} 
                        value={profileData.experienceYears} 
                        onChange={(e) => setProfileData({...profileData, experienceYears: e.target.value})}
                        style={styles.input}
                    />
                </div>
             </div>

             <div style={styles.inputGroup}>
                <label style={styles.label}>Public Business Description</label>
                <textarea 
                    disabled={!editingProfile} 
                    value={profileData.description} 
                    placeholder="Tell renters why they should hire you..."
                    onChange={(e) => setProfileData({...profileData, description: e.target.value})}
                    style={styles.textarea}
                />
             </div>

             {editingProfile && (
                <button onClick={handleProfileUpdate} style={styles.saveBtn}>💾 Save Business Details</button>
             )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  root: { display: "flex", minHeight: "100vh", background: "#060b13", color: "#f1f5f9", fontFamily: "'Inter', sans-serif" },
  loader: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#060b13", color: "#fbbf24", fontWeight: "bold" },
  
  // Sidebar
  sidebar: { width: "280px", background: "#0f172a", padding: "30px", borderRight: "1px solid #1e293b", position: "fixed", height: "100vh", zIndex: 100, transition: "0.3s" },
  logo: { fontSize: "1.4rem", fontWeight: "800", color: "#fbbf24", marginBottom: "40px", letterSpacing: "-1px" },
  profileBrief: { textAlign: "center", marginBottom: "30px", paddingBottom: "20px", borderBottom: "1px solid #1e293b" },
  avatar: { width: "65px", height: "65px", background: "#fbbf24", borderRadius: "18px", margin: "0 auto 15px", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: "bold", fontSize: "1.5rem" },
  statusBadge: { fontSize: "0.75rem", color: "#22c55e", background: "rgba(34, 197, 94, 0.1)", padding: "5px 12px", borderRadius: "20px", border: "1px solid rgba(34, 197, 94, 0.2)" },
  pendingBadge: { fontSize: "0.75rem", color: "#fbbf24", background: "rgba(251, 191, 36, 0.1)", padding: "5px 12px", borderRadius: "20px", border: "1px solid rgba(251, 191, 36, 0.2)" },
  
  // Navigation
  nav: { display: "flex", flexDirection: "column", gap: "8px" },
  navBtn: { padding: "14px", textAlign: "left", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", borderRadius: "12px", transition: "0.2s" },
  navActive: { padding: "14px", textAlign: "left", background: "#fbbf24", border: "none", color: "#000", cursor: "pointer", borderRadius: "12px", fontWeight: "bold" },
  logoutBtn: { padding: "14px", textAlign: "left", background: "rgba(239, 68, 68, 0.1)", border: "none", color: "#ef4444", cursor: "pointer", marginTop: "30px", borderRadius: "12px", fontWeight: "600" },
  
  // Main Content
  main: { flex: 1, marginLeft: "280px", padding: "50px", maxWidth: "1200px" },
  header: { marginBottom: "40px", borderBottom: "1px solid #1e293b", paddingBottom: "20px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "25px" },
  statCard: { background: "#0f172a", padding: "25px", borderRadius: "20px", border: "1px solid #1e293b", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" },
  statLabel: { color: "#94a3b8", fontSize: "0.9rem", marginBottom: "10px" },
  statValue: { fontSize: "1.8rem", fontWeight: "bold", color: "#fff" },
  
  // Cards & Forms
  card: { background: "#0f172a", padding: "35px", borderRadius: "24px", border: "1px solid #1e293b" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px", marginBottom: "25px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "10px" },
  label: { fontSize: "0.85rem", color: "#64748b", fontWeight: "600" },
  input: { padding: "14px", background: "#060b13", border: "1px solid #1e293b", borderRadius: "12px", color: "#fff", transition: "0.3s" },
  textarea: { padding: "14px", background: "#060b13", border: "1px solid #1e293b", borderRadius: "12px", color: "#fff", height: "120px", resize: "none" },
  editBtn: { padding: "10px 20px", background: "transparent", border: "1px solid #fbbf24", color: "#fbbf24", borderRadius: "10px", cursor: "pointer", fontWeight: "600" },
  saveBtn: { width: "100%", padding: "16px", background: "#fbbf24", color: "#000", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold", fontSize: "1rem" },
  infoBox: { marginTop: "20px", padding: "15px", background: "rgba(251, 191, 36, 0.05)", borderRadius: "12px", border: "1px solid rgba(251, 191, 36, 0.1)" },
  
  // Mobile Support
  mobileHeader: { display: "none", padding: "20px", background: "#0f172a", borderBottom: "1px solid #1e293b" },
  hamburger: { fontSize: "1.8rem", background: "none", border: "none", color: "#fbbf24", cursor: "pointer" }
};