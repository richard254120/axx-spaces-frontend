import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

export default function MoverDashboard() {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [moverData, setMoverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jobs, setJobs] = useState([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // ✅ MOBILE TOGGLE
  const [profileData, setProfileData] = useState({
    county: "",
    services: [],
    experienceYears: "",
    vehicleType: "",
    description: "",
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
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

      setJobs([
        {
          id: 1,
          customer: "John Doe",
          location: "Nairobi CBD",
          service: "Household Moving",
          date: "2024-05-15",
          status: "completed",
          amount: 5000,
        },
        {
          id: 2,
          customer: "Jane Smith",
          location: "Westlands",
          service: "Office Relocation",
          date: "2024-05-18",
          status: "in-progress",
          amount: 8000,
        },
        {
          id: 3,
          customer: "ABC Corporation",
          location: "Upper Hill",
          service: "Furniture Moving",
          date: "2024-05-20",
          status: "pending",
          amount: 12000,
        },
        {
          id: 4,
          customer: "Mary Johnson",
          location: "Kilimani",
          service: "Packing Services",
          date: "2024-05-10",
          status: "completed",
          amount: 3000,
        },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const moverServicesList = [
    "Household Moving", "Office Relocation", "Furniture Moving",
    "Heavy Goods Transport", "Packing Services", "Storage Services",
    "Vehicle Transportation", "International Moving"
  ];

  const handleServiceToggle = (service) => {
    setProfileData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
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

      if (!response.ok) throw new Error("Failed to update profile");

      setMoverData({ ...moverData, ...profileData });
      setEditingProfile(false);
      alert("✅ Profile updated successfully!");
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#22c55e";
      case "in-progress":
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
      case "in-progress":
        return "🔄 In Progress";
      case "pending":
        return "⏳ Pending";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  const totalJobs = jobs.length;
  const completedJobs = jobs.filter(j => j.status === "completed").length;
  const inProgressJobs = jobs.filter(j => j.status === "in-progress").length;
  const totalEarnings = jobs.filter(j => j.status === "completed").reduce((sum, j) => sum + j.amount, 0);

  return (
    <div style={styles.root}>
      <style>{cssStyles}</style>

      {/* ✅ MOBILE OVERLAY - CLOSES SIDEBAR WHEN CLICKING OUTSIDE */}
      {sidebarOpen && (
        <div
          style={styles.mobileOverlay}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* ✅ SIDEBAR - RESPONSIVE */}
      <div style={{ ...styles.sidebar, ...(sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed) }}>
        <div style={styles.logo}>🚚 Axx Movers</div>

        <div style={styles.profileCard}>
          <div style={styles.avatar}>{moverData?.name?.charAt(0).toUpperCase()}</div>
          <h3 style={styles.profileName}>{moverData?.name}</h3>
          <p style={styles.profileEmail}>{moverData?.email}</p>
          <div style={styles.badgesContainer}>
            <span style={styles.badge}>📍 {moverData?.county}</span>
            <span style={styles.badge}>⭐ {moverData?.experienceYears || 0} yrs</span>
          </div>
        </div>

        <nav style={styles.nav}>
          {[
            { id: "overview", label: "📊 Overview" },
            { id: "jobs", label: "📋 My Jobs" },
            { id: "profile", label: "👤 Profile" },
            { id: "earnings", label: "💰 Earnings" },
            { id: "settings", label: "⚙️ Settings" },
          ].map((item) => (
            <button
              key={item.id}
              style={{
                ...styles.navItem,
                ...(activeTab === item.id && styles.navItemActive),
              }}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false); // ✅ CLOSE SIDEBAR ON MOBILE
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button style={styles.logoutBtn} onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      {/* ✅ MAIN CONTENT */}
      <div style={styles.mainContent}>
        {/* ✅ MOBILE HEADER WITH TOGGLE */}
        <div style={styles.mobileHeader}>
          <button
            style={styles.hamburger}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h1 style={styles.mobileTitle}>
            {activeTab === "overview" && "📊 Overview"}
            {activeTab === "jobs" && "📋 Jobs"}
            {activeTab === "profile" && "👤 Profile"}
            {activeTab === "earnings" && "💰 Earnings"}
            {activeTab === "settings" && "⚙️ Settings"}
          </h1>
        </div>

        {/* DESKTOP HEADER */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>
            {activeTab === "overview" && "📊 Dashboard Overview"}
            {activeTab === "jobs" && "📋 My Jobs"}
            {activeTab === "profile" && "👤 My Profile"}
            {activeTab === "earnings" && "💰 Earnings"}
            {activeTab === "settings" && "⚙️ Settings"}
          </h1>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div style={styles.content}>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>📦</div>
                <div style={styles.statInfo}>
                  <p style={styles.statLabel}>Total Jobs</p>
                  <h2 style={styles.statNumber}>{totalJobs}</h2>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>✅</div>
                <div style={styles.statInfo}>
                  <p style={styles.statLabel}>Completed</p>
                  <h2 style={styles.statNumber}>{completedJobs}</h2>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>🔄</div>
                <div style={styles.statInfo}>
                  <p style={styles.statLabel}>In Progress</p>
                  <h2 style={styles.statNumber}>{inProgressJobs}</h2>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>💰</div>
                <div style={styles.statInfo}>
                  <p style={styles.statLabel}>Total Earnings</p>
                  <h2 style={styles.statNumber}>KES {totalEarnings.toLocaleString()}</h2>
                </div>
              </div>
            </div>

            <div style={styles.recentJobsContainer}>
              <h2 style={styles.sectionTitle}>📋 Recent Jobs</h2>
              <div style={styles.jobsList}>
                {jobs.slice(0, 3).map((job) => (
                  <div key={job.id} style={styles.jobCard}>
                    <div style={styles.jobHeader}>
                      <h3 style={styles.jobTitle}>{job.service}</h3>
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
            </div>
          </div>
        )}

        {/* JOBS TAB */}
        {activeTab === "jobs" && (
          <div style={styles.content}>
            <div style={styles.jobsList}>
              {jobs.map((job) => (
                <div key={job.id} style={styles.jobCard}>
                  <div style={styles.jobHeader}>
                    <h3 style={styles.jobTitle}>{job.service}</h3>
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
                    <p style={styles.jobDetail}>👤 Customer: {job.customer}</p>
                    <p style={styles.jobDetail}>📍 Location: {job.location}</p>
                    <p style={styles.jobDetail}>📅 Date: {new Date(job.date).toLocaleDateString()}</p>
                    <p style={{ ...styles.jobDetail, fontWeight: 700, color: "#22c55e" }}>
                      Amount: KES {job.amount.toLocaleString()}
                    </p>
                  </div>
                  <button style={styles.viewJobBtn}>View Details</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div style={styles.content}>
            {!editingProfile ? (
              <div style={styles.profileContainer}>
                <div style={styles.profileInfoCard}>
                  <h2 style={styles.sectionTitle}>📋 Profile Information</h2>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Name:</span>
                    <span style={styles.infoValue}>{moverData?.name}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Email:</span>
                    <span style={styles.infoValue}>{moverData?.email}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Phone:</span>
                    <span style={styles.infoValue}>{moverData?.phone}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>County:</span>
                    <span style={styles.infoValue}>{moverData?.county}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Years of Experience:</span>
                    <span style={styles.infoValue}>{moverData?.experienceYears} years</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Vehicle Type:</span>
                    <span style={styles.infoValue}>{moverData?.vehicleType}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Description:</span>
                    <span style={styles.infoValue}>{moverData?.description}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Services Offered:</span>
                    <div style={styles.servicesDisplay}>
                      {moverData?.services?.map((service) => (
                        <span key={service} style={styles.serviceBadge}>
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    style={styles.editBtn}
                    onClick={() => setEditingProfile(true)}
                  >
                    ✏️ Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              <div style={styles.profileContainer}>
                <div style={styles.profileInfoCard}>
                  <h2 style={styles.sectionTitle}>✏️ Edit Profile</h2>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>County</label>
                    <input
                      type="text"
                      value={profileData.county}
                      onChange={(e) =>
                        setProfileData({ ...profileData, county: e.target.value })
                      }
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Years of Experience</label>
                    <input
                      type="number"
                      value={profileData.experienceYears}
                      onChange={(e) =>
                        setProfileData({ ...profileData, experienceYears: e.target.value })
                      }
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Vehicle Type</label>
                    <input
                      type="text"
                      value={profileData.vehicleType}
                      onChange={(e) =>
                        setProfileData({ ...profileData, vehicleType: e.target.value })
                      }
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Description</label>
                    <textarea
                      value={profileData.description}
                      onChange={(e) =>
                        setProfileData({ ...profileData, description: e.target.value })
                      }
                      style={styles.textarea}
                      rows="4"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Services Offered</label>
                    <div style={styles.servicesGrid}>
                      {moverServicesList.map((service) => (
                        <label key={service} style={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={profileData.services.includes(service)}
                            onChange={() => handleServiceToggle(service)}
                          />
                          <span>{service}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={styles.buttonGroup}>
                    <button
                      style={styles.saveBtn}
                      onClick={handleProfileUpdate}
                    >
                      💾 Save Changes
                    </button>
                    <button
                      style={styles.cancelBtn}
                      onClick={() => setEditingProfile(false)}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* EARNINGS TAB */}
        {activeTab === "earnings" && (
          <div style={styles.content}>
            <div style={styles.earningsContainer}>
              <div style={styles.earningsCard}>
                <p style={styles.earningsLabel}>💰 Total Earnings</p>
                <h1 style={styles.earningsAmount}>KES {totalEarnings.toLocaleString()}</h1>
              </div>

              <div style={styles.earningsBreakdown}>
                <h2 style={styles.sectionTitle}>📊 Earnings Breakdown</h2>
                <div style={styles.breakdownTable}>
                  <div style={styles.breakdownHeader}>
                    <span>Service</span>
                    <span>Amount</span>
                    <span>Date</span>
                  </div>
                  {jobs.filter(j => j.status === "completed").map((job) => (
                    <div key={job.id} style={styles.breakdownRow}>
                      <span>{job.service}</span>
                      <span style={{ color: "#22c55e", fontWeight: 700 }}>
                        KES {job.amount.toLocaleString()}
                      </span>
                      <span>{new Date(job.date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div style={styles.content}>
            <div style={styles.settingsContainer}>
              <div style={styles.settingsCard}>
                <h2 style={styles.sectionTitle}>🔒 Account Security</h2>
                <button style={styles.settingBtn}>🔑 Change Password</button>
                <button style={styles.settingBtn}>🔐 Two-Factor Authentication</button>
              </div>

              <div style={styles.settingsCard}>
                <h2 style={styles.sectionTitle}>🔔 Notifications</h2>
                <div style={styles.settingOption}>
                  <span>Email Notifications</span>
                  <input type="checkbox" defaultChecked />
                </div>
                <div style={styles.settingOption}>
                  <span>SMS Notifications</span>
                  <input type="checkbox" defaultChecked />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  root: {
    display: "flex",
    minHeight: "100vh",
    background: "#f3f4f6",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
  },

  // ✅ MOBILE OVERLAY
  mobileOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    zIndex: 99,
    display: "none",
  },

  sidebar: {
    width: "280px",
    background: "linear-gradient(135deg, #1e293b 0%, #0f1729 100%)",
    color: "#f1f5f9",
    padding: "24px",
    overflowY: "auto",
    transition: "all 0.3s ease",
    position: "relative",
  },

  // ✅ SIDEBAR MOBILE STYLES
  sidebarOpen: {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    width: "250px",
    zIndex: 100,
  },

  sidebarClosed: {
    display: "none",
  },

  logo: {
    fontSize: "20px",
    fontWeight: 800,
    marginBottom: "32px",
    color: "#fbbf24",
  },

  profileCard: {
    background: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(59, 130, 246, 0.2)",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "32px",
    textAlign: "center",
  },

  avatar: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "#fbbf24",
    color: "#0f1729",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: 800,
    margin: "0 auto 12px",
  },

  profileName: {
    margin: "0 0 4px",
    fontSize: "16px",
    fontWeight: 700,
  },

  profileEmail: {
    margin: "0 0 12px",
    fontSize: "12px",
    color: "#cbd5e1",
  },

  badgesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  badge: {
    display: "inline-block",
    background: "rgba(251, 191, 36, 0.1)",
    color: "#fbbf24",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "32px",
  },

  navItem: {
    padding: "12px 16px",
    background: "transparent",
    color: "#cbd5e1",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    textAlign: "left",
    transition: "all 0.2s",
  },

  navItemActive: {
    background: "#fbbf24",
    color: "#0f1729",
  },

  logoutBtn: {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(239, 68, 68, 0.2)",
    color: "#fca5a5",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    transition: "all 0.2s",
  },

  mainContent: {
    flex: 1,
    padding: "32px",
    overflowY: "auto",
  },

  // ✅ MOBILE HEADER
  mobileHeader: {
    display: "none",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },

  hamburger: {
    background: "none",
    border: "none",
    fontSize: "28px",
    cursor: "pointer",
    color: "#1f2937",
  },

  mobileTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 700,
    color: "#1f2937",
  },

  header: {
    marginBottom: "32px",
  },

  headerTitle: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#1f2937",
    margin: 0,
  },

  content: {
    background: "white",
    borderRadius: "12px",
    padding: "32px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },

  statCard: {
    background: "linear-gradient(135deg, #f3f4f6 0%, #f9fafb 100%)",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
    display: "flex",
    gap: "16px",
    alignItems: "center",
  },

  statIcon: {
    fontSize: "32px",
  },

  statInfo: {
    flex: 1,
  },

  statLabel: {
    margin: 0,
    fontSize: "13px",
    color: "#6b7280",
    fontWeight: 600,
    textTransform: "uppercase",
  },

  statNumber: {
    margin: "6px 0 0",
    fontSize: "24px",
    fontWeight: 800,
    color: "#1f2937",
  },

  recentJobsContainer: {
    marginTop: "40px",
  },

  sectionTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1f2937",
    margin: "0 0 20px",
  },

  jobsList: {
    display: "grid",
    gap: "16px",
  },

  jobCard: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
  },

  jobHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    flexWrap: "wrap",
    gap: "12px",
  },

  jobTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 700,
    color: "#1f2937",
  },

  jobStatus: {
    padding: "4px 12px",
    borderRadius: "6px",
    border: "2px solid",
    fontSize: "12px",
    fontWeight: 600,
  },

  jobDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "16px",
  },

  jobDetail: {
    margin: 0,
    fontSize: "14px",
    color: "#6b7280",
  },

  viewJobBtn: {
    padding: "10px 16px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    transition: "all 0.2s",
    width: "100%",
  },

  profileContainer: {
    maxWidth: "600px",
    margin: "0 auto",
  },

  profileInfoCard: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb",
    flexWrap: "wrap",
    gap: "12px",
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
    gap: "8px",
    marginTop: "8px",
  },

  serviceBadge: {
    display: "inline-block",
    background: "#dbeafe",
    color: "#0c4a6e",
    padding: "4px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
  },

  editBtn: {
    marginTop: "16px",
    padding: "10px 20px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.2s",
    width: "100%",
  },

  formGroup: {
    marginBottom: "16px",
  },

  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 700,
    color: "#374151",
    marginBottom: "6px",
    textTransform: "uppercase",
  },

  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical",
    boxSizing: "border-box",
  },

  servicesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px",
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
  },

  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
  },

  saveBtn: {
    flex: 1,
    padding: "10px 16px",
    background: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
  },

  cancelBtn: {
    flex: 1,
    padding: "10px 16px",
    background: "#e5e7eb",
    color: "#6b7280",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
  },

  earningsContainer: {
    maxWidth: "800px",
    margin: "0 auto",
  },

  earningsCard: {
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    color: "white",
    borderRadius: "12px",
    padding: "32px",
    marginBottom: "32px",
    textAlign: "center",
  },

  earningsLabel: {
    margin: "0 0 8px",
    fontSize: "14px",
    opacity: 0.9,
  },

  earningsAmount: {
    margin: 0,
    fontSize: "40px",
    fontWeight: 800,
  },

  earningsBreakdown: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
  },

  breakdownTable: {
    display: "flex",
    flexDirection: "column",
    gap: "0",
    overflowX: "auto",
  },

  breakdownHeader: {
    display: "grid",
    gridTemplateColumns: "1fr 150px 120px",
    gap: "16px",
    fontWeight: 700,
    color: "#6b7280",
    fontSize: "12px",
    textTransform: "uppercase",
    paddingBottom: "12px",
    borderBottom: "2px solid #e5e7eb",
  },

  breakdownRow: {
    display: "grid",
    gridTemplateColumns: "1fr 150px 120px",
    gap: "16px",
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb",
  },

  settingsContainer: {
    maxWidth: "600px",
    margin: "0 auto",
  },

  settingsCard: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "20px",
  },

  settingBtn: {
    display: "block",
    width: "100%",
    padding: "12px 16px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
    marginBottom: "10px",
    transition: "all 0.2s",
  },

  settingOption: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb",
  },
};

const cssStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accentColor: #3b82f6;
  }

  /* ✅ MOBILE RESPONSIVE */
  @media (max-width: 768px) {
    [style*="display: flex"][style*="width: 280px"] {
      display: none !important;
    }

    [style*="flex: 1"][style*="padding: 32px"] {
      padding: 16px !important;
    }

    [style*="fontSize: 28px"][style*="fontWeight: 800"] {
      font-size: 20px !important;
    }

    [style*="gridTemplateColumns: repeat"] {
      grid-template-columns: 1fr !important;
    }

    /* ✅ SHOW MOBILE HEADER */
    [style*="display: none"][style*="alignItems: center"][style*="gap: 12px"] {
      display: flex !important;
    }

    /* ✅ SHOW MOBILE OVERLAY */
    [style*="display: none"][style*="position: fixed"][style*="background: rgba(0, 0, 0, 0.5)"] {
      display: block !important;
    }

    /* ✅ SHOW SIDEBAR WHEN OPEN */
    [style*="position: relative"][style*="width: 280px"][style*="background: linear-gradient"] {
      position: fixed !important;
      width: 250px !important;
      height: 100vh !important;
      top: 0 !important;
      left: 0 !important;
      z-index: 100 !important;
    }
  }

  @media (max-width: 480px) {
    [style*="fontSize: 40px"] {
      font-size: 28px !important;
    }

    [style*="padding: 32px"] {
      padding: 12px !important;
    }

    [style*="display: grid"][style*="gridTemplateColumns: 1fr 150px 120px"] {
      grid-template-columns: 1fr !important;
    }
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;