import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

export default function MoverDashboard() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [moverStats, setMoverStats] = useState({
    totalJobs: 0,
    completedJobs: 0,
    totalEarnings: 0,
    activeJobs: 0,
  });
  const [jobs, setJobs] = useState([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    county: "",
    services: [],
    vehicleType: "",
    experienceYears: "",
  });

  // ✅ SECURITY: Block non-movers
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user?.role !== "mover") {
      navigate("/dashboard");
      return;
    }
    fetchMoverData();
  }, [user, navigate, token]);

  const fetchMoverData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      setMoverStats({
        totalJobs: 12,
        completedJobs: 8,
        totalEarnings: 84000,
        activeJobs: 2,
      });

      setJobs([
        {
          id: 1,
          customer: "John Doe",
          location: "Nairobi CBD",
          service: "Household Moving",
          date: "2024-05-20",
          status: "completed",
          amount: 5000,
        },
        {
          id: 2,
          customer: "Jane Smith",
          location: "Westlands",
          service: "Office Relocation",
          date: "2024-05-22",
          status: "active",
          amount: 8000,
        },
        {
          id: 3,
          customer: "ABC Corp",
          location: "Upper Hill",
          service: "Furniture Moving",
          date: "2024-05-25",
          status: "pending",
          amount: 12000,
        },
      ]);

      setProfileData({
        county: user?.county || "",
        services: user?.services || [],
        vehicleType: user?.vehicleType || "",
        experienceYears: user?.experienceYears || "",
      });
    } catch (err) {
      console.error("Failed to fetch mover data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#22c55e";
      case "active":
        return "#f59e0b";
      case "pending":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return "✅ Completed";
      case "active":
        return "🔄 Active";
      case "pending":
        return "⏳ Pending";
      default:
        return status;
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={styles.container}>
      <style>{mobileCss}</style>

      {/* TOP HEADER */}
      <header style={styles.topBar}>
        <div style={styles.logoSection}>
          <span style={styles.logoText}>🚚 Axx Movers</span>
        </div>
        <button onClick={handleLogout} style={styles.logoutIcon} title="Logout">
          🚪
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main style={styles.content}>
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <section>
            <div style={styles.welcomeCard}>
              <div>
                <h2 style={styles.welcomeTitle}>Welcome, {user?.name?.split(" ")[0]}! 👋</h2>
                <p style={styles.welcomeSubtitle}>🚚 {user?.county || "Mobile Mover"}</p>
              </div>
              <div style={styles.statusBadge}>
                <span>✅ Active</span>
              </div>
            </div>

            {/* STATS GRID */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>📦</div>
                <div>
                  <p style={styles.statLabel}>Total Jobs</p>
                  <h3 style={styles.statNumber}>{moverStats.totalJobs}</h3>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>✅</div>
                <div>
                  <p style={styles.statLabel}>Completed</p>
                  <h3 style={styles.statNumber}>{moverStats.completedJobs}</h3>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>🔄</div>
                <div>
                  <p style={styles.statLabel}>Active</p>
                  <h3 style={styles.statNumber}>{moverStats.activeJobs}</h3>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>💰</div>
                <div>
                  <p style={styles.statLabel}>Total Earnings</p>
                  <h3 style={styles.statNumber}>KES {moverStats.totalEarnings.toLocaleString()}</h3>
                </div>
              </div>
            </div>

            {/* RECENT JOBS */}
            <h3 style={styles.sectionTitle}>📋 Recent Jobs</h3>
            {jobs.length > 0 ? (
              <div style={styles.jobsList}>
                {jobs.map((job) => (
                  <div key={job.id} style={styles.jobCard}>
                    <div style={styles.jobHeader}>
                      <h4 style={styles.jobTitle}>{job.service}</h4>
                      <span
                        style={{
                          ...styles.jobStatus,
                          borderColor: getStatusColor(job.status),
                          color: getStatusColor(job.status),
                        }}
                      >
                        {getStatusLabel(job.status)}
                      </span>
                    </div>
                    <p style={styles.jobDetail}>👤 {job.customer}</p>
                    <p style={styles.jobDetail}>📍 {job.location}</p>
                    <p style={styles.jobDetail}>📅 {new Date(job.date).toLocaleDateString()}</p>
                    <p style={{ ...styles.jobDetail, fontWeight: 700, color: "#22c55e" }}>
                      KES {job.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyBox}>
                <p>📭 No jobs yet. Check back soon!</p>
              </div>
            )}
          </section>
        )}

        {/* JOBS TAB */}
        {activeTab === "jobs" && (
          <section>
            <h2 style={styles.sectionTitle}>📦 All Jobs</h2>
            {jobs.length > 0 ? (
              <div style={styles.jobsList}>
                {jobs.map((job) => (
                  <div key={job.id} style={styles.jobCard}>
                    <div style={styles.jobHeader}>
                      <div>
                        <h4 style={styles.jobTitle}>{job.service}</h4>
                        <p style={styles.jobCustomer}>{job.customer}</p>
                      </div>
                      <span
                        style={{
                          ...styles.jobStatus,
                          borderColor: getStatusColor(job.status),
                          color: getStatusColor(job.status),
                        }}
                      >
                        {getStatusLabel(job.status)}
                      </span>
                    </div>
                    <div style={styles.jobDetails}>
                      <p style={styles.jobDetail}>📍 Location: {job.location}</p>
                      <p style={styles.jobDetail}>📅 Date: {new Date(job.date).toLocaleDateString()}</p>
                      <p style={{ ...styles.jobDetail, fontWeight: 700, color: "#22c55e", marginTop: "8px" }}>
                        Amount: KES {job.amount.toLocaleString()}
                      </p>
                    </div>
                    <button style={styles.viewJobBtn}>View Details →</button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyBox}>
                <p>📭 No jobs available</p>
              </div>
            )}
          </section>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <section>
            {!editingProfile ? (
              <div style={styles.profilePage}>
                <div style={styles.avatarLarge}>🚚</div>
                <h3 style={styles.profileName}>{user?.name}</h3>
                <p style={styles.userEmail}>{user?.email}</p>

                <div style={styles.profileInfo}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>📞 Phone</span>
                    <span style={styles.infoValue}>{user?.phone}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>📍 County</span>
                    <span style={styles.infoValue}>{profileData.county || "Not Set"}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>🚗 Vehicle</span>
                    <span style={styles.infoValue}>{profileData.vehicleType || "Not Set"}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>⭐ Experience</span>
                    <span style={styles.infoValue}>{profileData.experienceYears || "0"} years</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>✅ Services</span>
                    <div style={styles.servicesDisplay}>
                      {profileData.services?.length > 0 ? (
                        profileData.services.map((service) => (
                          <span key={service} style={styles.serviceBadge}>
                            {service}
                          </span>
                        ))
                      ) : (
                        <span style={styles.infoValue}>Not Set</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  style={styles.editBtn}
                  onClick={() => setEditingProfile(true)}
                >
                  ✏️ Edit Profile
                </button>
              </div>
            ) : (
              <div style={styles.profilePage}>
                <h3>Edit Profile (Coming Soon)</h3>
                <button
                  style={styles.cancelBtn}
                  onClick={() => setEditingProfile(false)}
                >
                  ← Back
                </button>
              </div>
            )}
          </section>
        )}

        {/* EARNINGS TAB */}
        {activeTab === "earnings" && (
          <section>
            <div style={styles.earningsCard}>
              <p style={styles.earningsLabel}>💰 Total Earnings</p>
              <h1 style={styles.earningsAmount}>KES {moverStats.totalEarnings.toLocaleString()}</h1>
            </div>

            <h3 style={styles.sectionTitle}>📊 Earnings Breakdown</h3>
            {jobs.length > 0 ? (
              <div style={styles.earningsList}>
                {jobs
                  .filter((j) => j.status === "completed")
                  .map((job) => (
                    <div key={job.id} style={styles.earningsRow}>
                      <div>
                        <p style={styles.earningService}>{job.service}</p>
                        <p style={styles.earningDate}>{new Date(job.date).toLocaleDateString()}</p>
                      </div>
                      <p style={styles.earningAmount}>KES {job.amount.toLocaleString()}</p>
                    </div>
                  ))}
              </div>
            ) : (
              <div style={styles.emptyBox}>
                <p>No earnings yet</p>
              </div>
            )}
          </section>
        )}
      </main>

      {/* BOTTOM NAVIGATION */}
      <nav style={styles.bottomNav}>
        <button
          style={activeTab === "overview" ? styles.navBtnActive : styles.navBtn}
          onClick={() => setActiveTab("overview")}
          title="Overview"
        >
          <span style={styles.navIcon}>📊</span>
          <span style={styles.navLabel}>Home</span>
        </button>
        <button
          style={activeTab === "jobs" ? styles.navBtnActive : styles.navBtn}
          onClick={() => setActiveTab("jobs")}
          title="Jobs"
        >
          <span style={styles.navIcon}>📦</span>
          <span style={styles.navLabel}>Jobs</span>
        </button>
        <button
          style={activeTab === "earnings" ? styles.navBtnActive : styles.navBtn}
          onClick={() => setActiveTab("earnings")}
          title="Earnings"
        >
          <span style={styles.navIcon}>💰</span>
          <span style={styles.navLabel}>Earnings</span>
        </button>
        <button
          style={activeTab === "profile" ? styles.navBtnActive : styles.navBtn}
          onClick={() => setActiveTab("profile")}
          title="Profile"
        >
          <span style={styles.navIcon}>👤</span>
          <span style={styles.navLabel}>Profile</span>
        </button>
      </nav>
    </div>
  );
}

const styles = {
  container: {
    background: "#f4f7f6",
    minHeight: "100vh",
    paddingBottom: "80px",
    fontFamily: "'DM Sans', sans-serif",
    margin: 0,
    padding: 0,
  },

  topBar: {
    background: "linear-gradient(135deg, #1f2937 0%, #0f1729 100%)",
    color: "white",
    padding: "16px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },

  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  logoText: {
    fontWeight: 800,
    fontSize: "18px",
    color: "#fbbf24",
    letterSpacing: "0.5px",
  },

  logoutIcon: {
    background: "none",
    border: "none",
    fontSize: "22px",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  content: {
    padding: "20px",
  },

  welcomeCard: {
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white",
    padding: "24px",
    borderRadius: "16px",
    marginBottom: "24px",
    boxShadow: "0 4px 15px rgba(239, 68, 68, 0.2)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  welcomeTitle: {
    fontSize: "20px",
    fontWeight: 800,
    margin: "0 0 4px",
  },

  welcomeSubtitle: {
    fontSize: "13px",
    opacity: 0.9,
    margin: 0,
  },

  statusBadge: {
    background: "rgba(255, 255, 255, 0.2)",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 600,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "24px",
  },

  statCard: {
    background: "white",
    padding: "16px",
    borderRadius: "12px",
    display: "flex",
    gap: "12px",
    alignItems: "center",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },

  statIcon: {
    fontSize: "28px",
  },

  statLabel: {
    fontSize: "12px",
    color: "#6b7280",
    margin: "0 0 4px",
    fontWeight: 600,
    textTransform: "uppercase",
  },

  statNumber: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#1f2937",
    margin: 0,
  },

  sectionTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: "12px",
    marginTop: "20px",
  },

  jobsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  jobCard: {
    background: "white",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },

  jobHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
  },

  jobTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#1f2937",
    margin: "0 0 4px",
  },

  jobCustomer: {
    fontSize: "12px",
    color: "#6b7280",
    margin: 0,
  },

  jobStatus: {
    padding: "4px 8px",
    borderRadius: "6px",
    border: "2px solid",
    fontSize: "11px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  jobDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "12px",
  },

  jobDetail: {
    fontSize: "13px",
    color: "#6b7280",
    margin: 0,
  },

  viewJobBtn: {
    width: "100%",
    padding: "10px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },

  emptyBox: {
    background: "white",
    padding: "40px 20px",
    textAlign: "center",
    borderRadius: "12px",
    color: "#9ca3af",
    border: "1px dashed #d1d5db",
  },

  profilePage: {
    textAlign: "center",
    background: "white",
    padding: "30px 20px",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
  },

  avatarLarge: {
    fontSize: "60px",
    marginBottom: "12px",
  },

  profileName: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#1f2937",
    margin: "0 0 4px",
  },

  userEmail: {
    color: "#6b7280",
    margin: "0 0 20px",
    fontSize: "14px",
  },

  profileInfo: {
    textAlign: "left",
    margin: "20px 0",
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #f3f4f6",
    fontSize: "14px",
  },

  infoLabel: {
    fontWeight: 600,
    color: "#6b7280",
  },

  infoValue: {
    color: "#1f2937",
    fontWeight: 500,
  },

  servicesDisplay: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    justifyContent: "flex-end",
  },

  serviceBadge: {
    background: "#dbeafe",
    color: "#0c4a6e",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
  },

  editBtn: {
    marginTop: "20px",
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  },

  cancelBtn: {
    marginTop: "12px",
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    background: "white",
    color: "#6b7280",
    fontWeight: 600,
    cursor: "pointer",
  },

  earningsCard: {
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    color: "white",
    borderRadius: "16px",
    padding: "32px 20px",
    textAlign: "center",
    marginBottom: "24px",
    boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)",
  },

  earningsLabel: {
    fontSize: "14px",
    opacity: 0.9,
    margin: "0 0 8px",
  },

  earningsAmount: {
    fontSize: "32px",
    fontWeight: 800,
    margin: 0,
  },

  earningsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  earningsRow: {
    background: "white",
    padding: "16px",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #e5e7eb",
  },

  earningService: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#1f2937",
    margin: "0 0 4px",
  },

  earningDate: {
    fontSize: "12px",
    color: "#6b7280",
    margin: 0,
  },

  earningAmount: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#22c55e",
  },

  bottomNav: {
    position: "fixed",
    bottom: 0,
    width: "100%",
    background: "white",
    display: "flex",
    justifyContent: "space-around",
    padding: "8px 0",
    borderTop: "1px solid #e5e7eb",
    boxShadow: "0 -2px 10px rgba(0,0,0,0.08)",
    zIndex: 99,
  },

  navBtn: {
    border: "none",
    background: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    color: "#9ca3af",
    fontSize: "12px",
    padding: "8px 12px",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  navBtnActive: {
    border: "none",
    background: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    color: "#ef4444",
    fontSize: "12px",
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: 700,
  },

  navIcon: {
    fontSize: "20px",
  },

  navLabel: {
    fontSize: "11px",
  },
};

const mobileCss = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  
  body { margin: 0; padding: 0; }
  h2, h3, h4, h1 { margin: 0; }
  
  button:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 480px) {
    [style*="grid-template-columns: 1fr 1fr"] {
      grid-template-columns: 1fr !important;
    }
  }
`;