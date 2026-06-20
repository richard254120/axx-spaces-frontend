import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import VerificationStatus from "../components/VerificationStatus";
import { UserProfileEditor } from "../features/profile";
import VerificationBadges from "../components/VerificationBadges";
import BoostNotification from "../components/BoostNotification";
import AnalyticsDashboard from "../components/AnalyticsDashboard";

import { getDashboardPath } from "../utils/dashboardRoutes";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

const VEHICLE_TYPES = ["Pickup", "Van", "Lorry", "Motorbike", "Truck"];
const SERVICE_OPTIONS = [
  "Household Moving", "Office Relocation", "Furniture Moving",
  "Appliance Moving", "Piano Moving", "Storage Services"
];

export default function MoverDashboard() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [moverStats, setMoverStats] = useState({
    totalJobs: 0, completedJobs: 0, totalEarnings: 0, activeJobs: 0,
  });
  const [jobs, setJobs] = useState([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    county: "", services: [], vehicleType: "", experienceYears: "",
    phone: "", bio: "",
  });

  const pendingJobsCount = jobs.filter(j => j.status === "pending").length;

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user?.role !== "mover") { navigate(getDashboardPath(user?.role)); return; }
    fetchAll();
  }, [user, token]);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      await Promise.all([fetchJobs(), fetchProfile()]);
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    const res = await fetch(`${API_BASE}/jobs/mover`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch jobs");
    const data = await res.json();
    const jobList = Array.isArray(data) ? data : (data.jobs || []);
    setJobs(jobList);
    computeStats(jobList);
  };

  const fetchProfile = async () => {
    const res = await fetch(`${API_BASE}/movers/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    setProfileData({
      county: data.county || user?.county || "",
      services: data.services || user?.services || [],
      vehicleType: data.vehicleType || user?.vehicleType || "",
      experienceYears: data.experienceYears || user?.experienceYears || "",
      phone: data.phone || user?.phone || "",
      bio: data.bio || "",
    });
  };

  const computeStats = (jobList) => {
    const completed = jobList.filter(j => j.status === "completed");
    const active = jobList.filter(j => j.status === "active" || j.status === "accepted");
    const earnings = completed.reduce((sum, j) => sum + (j.amount || 0), 0);
    setMoverStats({
      totalJobs: jobList.length,
      completedJobs: completed.length,
      activeJobs: active.length,
      totalEarnings: earnings,
    });
  };

  // ── FIXED: removed the "Transformer:" typo that broke parsing ──
  const handleAcceptJob = async (jobId) => {
    setActionLoading(jobId);
    try {
      const res = await fetch(`${API_BASE}/jobs/${jobId}/accept`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to accept job");
      }
      showSuccess("Booking confirmed! Contact details unlocked.");
      await fetchJobs();
    } catch (err) {
      showError(err.message || "Could not accept job. Try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteJob = async (jobId) => {
    if (!window.confirm("Mark this job as completed?")) return;
    setActionLoading(jobId);
    try {
      const res = await fetch(`${API_BASE}/jobs/${jobId}/complete`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to complete job");
      }
      showSuccess("Job marked as completed!");
      await fetchJobs();
    } catch (err) {
      showError(err.message || "Could not complete job. Try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      const res = await fetch(`${API_BASE}/movers/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to save profile");
      }
      showSuccess("Profile updated successfully!");
      setEditingProfile(false);
    } catch (err) {
      showError(err.message || "Could not save profile. Try again.");
    } finally {
      setProfileSaving(false);
    }
  };

  const toggleService = (service) => {
    setProfileData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service],
    }));
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };
  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 4000);
  };

  const getStatusColor = (status) => ({
    completed: "#22c55e", active: "#f59e0b",
    accepted: "#3b82f6", pending: "#ef4444",
  }[status] || "#6b7280");

  const getStatusLabel = (status) => ({
    completed: "✅ Completed", active: "🔄 Active",
    accepted: "🔵 Accepted", pending: "⏳ Pending",
  }[status] || status);

  const handleLogout = () => { logout(); navigate("/"); };

  if (loading) {
    return (
      <div style={{ ...styles.container, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#6b7280" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🚚</div>
          <p style={{ fontWeight: 600 }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{mobileCss}</style>

      {/* BOOST NOTIFICATION */}
      <BoostNotification user={user} userType="mover" />

      {/* TOP HEADER */}
      <header style={styles.topBar}>
        <div style={styles.logoSection}>
          <span style={styles.logoText}>🚚 AXX Movers Dashboard</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={fetchAll} style={styles.refreshBtn} title="Refresh Data">refresh</button>
          <button onClick={() => navigate("/settings")} style={styles.settingsIcon} title="Settings">⚙️</button>
          <button onClick={handleLogout} style={styles.logoutIcon} title="Logout">logout</button>
        </div>
      </header>

      {/* FEEDBACK TOASTS */}
      {error && <div style={styles.errorToast}>{error}</div>}
      {success && <div style={styles.successToast}>{success}</div>}

      {/* PENDING JOBS BANNER */}
      {pendingJobsCount > 0 && (
        <div style={styles.notificationBanner} onClick={() => setActiveTab("jobs")}>
          <span style={{ fontSize: "18px" }}>🚨</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 700 }}>Incoming request alert!</p>
            <p style={{ margin: 0, fontSize: "11px", opacity: 0.9 }}>
              {pendingJobsCount} booking{pendingJobsCount > 1 ? "s" : ""} waiting for your acceptance.
            </p>
          </div>
          <span style={styles.bannerBadge}>View Jobs</span>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main style={styles.content}>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <section>
            <div style={styles.welcomeCard}>
              <div>
                <h2 style={styles.welcomeTitle}>Hello, {user?.name?.split(" ")[0] || "Partner"}! 👋</h2>
                <p style={styles.welcomeSubtitle}>📍 {user?.county || "Kenya"}</p>
              </div>
              <div style={styles.statusBadge}>🟢 Active</div>
            </div>

            <div style={styles.statsGrid}>
              {[
                { icon: "📦", label: "Total Jobs", value: moverStats.totalJobs },
                { icon: "✅", label: "Completed", value: moverStats.completedJobs },
                { icon: "🔄", label: "Active", value: moverStats.activeJobs },
                { icon: "💰", label: "Earnings", value: `KES ${moverStats.totalEarnings.toLocaleString()}` },
              ].map(stat => (
                <div key={stat.label} style={styles.statCard}>
                  <div style={styles.statIcon}>{stat.icon}</div>
                  <div>
                    <p style={styles.statLabel}>{stat.label}</p>
                    <h3 style={styles.statNumber}>{stat.value}</h3>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <VerificationStatus />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <AnalyticsDashboard userType="mover" userId={user?._id || user?.id} />
            </div>

            {jobs.filter(j => j.status === "pending").length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ ...styles.sectionTitle, color: "#ef4444" }}>⚡ Pending Bookings</h3>
                <JobList
                  jobs={jobs.filter(j => j.status === "pending")}
                  actionLoading={actionLoading}
                  onAccept={handleAcceptJob}
                  onComplete={handleCompleteJob}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                />
              </div>
            )}

            <h3 style={styles.sectionTitle}>📋 Recent Jobs</h3>
            <JobList
              jobs={jobs.filter(j => j.status !== "pending").slice(0, 3)}
              actionLoading={actionLoading}
              onAccept={handleAcceptJob}
              onComplete={handleCompleteJob}
              getStatusColor={getStatusColor}
              getStatusLabel={getStatusLabel}
            />
          </section>
        )}

        {/* ── JOBS TAB ── */}
        {activeTab === "jobs" && (
          <section>
            <h2 style={styles.sectionTitle}>📦 All Jobs</h2>
            <JobFilterTabs
              jobs={jobs}
              getStatusColor={getStatusColor}
              getStatusLabel={getStatusLabel}
              actionLoading={actionLoading}
              onAccept={handleAcceptJob}
              onComplete={handleCompleteJob}
            />
          </section>
        )}

        {/* ── EARNINGS TAB ── */}
        {activeTab === "earnings" && (
          <section>
            <div style={styles.earningsCard}>
              <p style={styles.earningsLabel}>💰 Total Earnings</p>
              <h1 style={styles.earningsAmount}>KES {moverStats.totalEarnings.toLocaleString()}</h1>
              <p style={{ ...styles.earningsLabel, marginTop: "8px" }}>
                From {moverStats.completedJobs} completed job{moverStats.completedJobs !== 1 ? "s" : ""}
              </p>
            </div>

            <h3 style={styles.sectionTitle}>📊 Completed Jobs</h3>
            {jobs.filter(j => j.status === "completed").length > 0 ? (
              <div style={styles.earningsList}>
                {jobs.filter(j => j.status === "completed").map(job => (
                  <div key={job._id || job.id} style={styles.earningsRow}>
                    <div>
                      <p style={styles.earningService}>{job.serviceType || "Moving Job"}</p>
                      <p style={styles.earningDate}>📍 {job.pickupLocation} → {job.dropoffLocation}</p>
                      <p style={styles.earningDate}>
                        📅 {new Date(job.scheduledDate || job.createdAt).toLocaleDateString("en-KE", {
                          year: "numeric", month: "short", day: "numeric"
                        })}
                      </p>
                    </div>
                    <p style={styles.earningAmount}>+ KES {(job.amount || 0).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyBox}><p>No completed jobs yet.</p></div>
            )}
          </section>
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <section>
            <VerificationBadges userId={user?._id || user?.id} userType="mover" />
            <AnalyticsDashboard userType="mover" userId={user?._id || user?.id} />
            <UserProfileEditor
              token={token}
              user={user}
              showMoverFields
              accentColor="#3b82f6"
              onUpdated={() => fetchProfile()}
            />
          </section>
        )}
      </main>

      {/* BOTTOM NAV */}
      <nav style={styles.bottomNav}>
        {[
          { tab: "overview", icon: "📊", label: "Overview", badge: 0 },
          { tab: "jobs", icon: "📦", label: "Jobs", badge: pendingJobsCount },
          { tab: "earnings", icon: "💰", label: "Earnings", badge: 0 },
          { tab: "profile", icon: "👤", label: "Profile", badge: 0 },
        ].map(({ tab, icon, label, badge }) => (
          <button
            key={tab}
            style={activeTab === tab ? styles.navBtnActive : styles.navBtn}
            onClick={() => setActiveTab(tab)}
          >
            <div style={{ position: "relative" }}>
              <span style={styles.navIcon}>{icon}</span>
              {badge > 0 && <span style={styles.navBadgeIndex}>{badge}</span>}
            </div>
            <span style={styles.navLabel}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function JobList({ jobs, actionLoading, onAccept, onComplete, getStatusColor, getStatusLabel }) {
  if (!jobs || jobs.length === 0) {
    return (
      <div style={styles.emptyBox}>
        <p>No jobs found.</p>
      </div>
    );
  }
  return (
    <div style={styles.jobsList}>
      {jobs.map(job => (
        <JobCard
          key={job._id || job.id}
          job={job}
          actionLoading={actionLoading}
          onAccept={onAccept}
          onComplete={onComplete}
          getStatusColor={getStatusColor}
          getStatusLabel={getStatusLabel}
        />
      ))}
    </div>
  );
}

function JobFilterTabs({ jobs, actionLoading, onAccept, onComplete, getStatusColor, getStatusLabel }) {
  const [filter, setFilter] = useState("all");
  const tabs = ["all", "pending", "accepted", "active", "completed"];
  const filtered = filter === "all" ? jobs : jobs.filter(j => j.status === filter);

  return (
    <>
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginBottom: "16px", paddingBottom: "4px" }}>
        {tabs.map(t => {
          const count = t === "all" ? jobs.length : jobs.filter(j => j.status === t).length;
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              style={{
                padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                cursor: "pointer", whiteSpace: "nowrap", border: "2px solid",
                borderColor: filter === t ? "#3b82f6" : "#d1d5db",
                background: filter === t ? "#dbeafe" : "white",
                color: filter === t ? "#1d4ed8" : "#6b7280",
              }}
            >
              {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)} ({count})
            </button>
          );
        })}
      </div>
      <JobList
        jobs={filtered}
        actionLoading={actionLoading}
        onAccept={onAccept}
        onComplete={onComplete}
        getStatusColor={getStatusColor}
        getStatusLabel={getStatusLabel}
      />
    </>
  );
}

function JobCard({ job, actionLoading, onAccept, onComplete, getStatusColor, getStatusLabel }) {
  const id = job._id || job.id;
  const isLoading = actionLoading === id;
  const isPending = job.status === "pending";

  return (
    <div style={{
      ...styles.jobCard,
      borderLeft: `5px solid ${getStatusColor(job.status)}`,
    }}>
      <div style={styles.jobHeader}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={styles.jobTitle}>{job.serviceType || "Moving Job"}</h4>
          <p style={styles.jobCustomer}>👤 {job.customerName || "Client"}</p>

          {/* Phone is hidden until job is accepted */}
          <p style={{ ...styles.jobCustomer, marginTop: "2px" }}>
            📞 {isPending ? (
              <span style={styles.maskedPhone}>🔒 Accept to unlock contact</span>
            ) : (
              <a
                href={`tel:${job.customerPhone}`}
                style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}
              >
                {job.customerPhone || "N/A"}
              </a>
            )}
          </p>
        </div>
        <span style={{
          ...styles.jobStatus,
          borderColor: getStatusColor(job.status),
          color: getStatusColor(job.status),
        }}>
          {getStatusLabel(job.status)}
        </span>
      </div>

      <div style={styles.jobDetails}>
        {job.pickupLocation && (
          <p style={styles.jobDetail}>📍 <strong>Pickup:</strong> {job.pickupLocation}</p>
        )}
        {job.dropoffLocation && (
          <p style={styles.jobDetail}>🏁 <strong>Dropoff:</strong> {job.dropoffLocation}</p>
        )}
        {job.scheduledDate && (
          <p style={styles.jobDetail}>
            📅 <strong>Date:</strong> {new Date(job.scheduledDate).toLocaleDateString("en-KE", {
              weekday: "short", year: "numeric", month: "short", day: "numeric",
            })}
          </p>
        )}
        {job.amount > 0 && (
          <p style={{ ...styles.jobDetail, fontSize: "14px", fontWeight: 700, color: "#22c55e" }}>
            💰 KES {job.amount.toLocaleString()}
          </p>
        )}
        {job.notes && (
          <p style={{
            ...styles.jobDetail, fontStyle: "italic", marginTop: "4px",
            background: "#f9fafb", padding: "6px", borderRadius: "4px",
          }}>
            📝 "{job.notes}"
          </p>
        )}
      </div>

      {isPending && (
        <button
          style={{ ...styles.actionBtn, background: "#22c55e" }}
          onClick={() => onAccept(id)}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "🤝 Accept Job"}
        </button>
      )}
      {(job.status === "accepted" || job.status === "active") && (
        <button
          style={{ ...styles.actionBtn, background: "#f59e0b" }}
          onClick={() => onComplete(id)}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "🏁 Mark as Completed"}
        </button>
      )}
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = {
  container: {
    background: "#f4f7f6", minHeight: "100vh",
    paddingBottom: "100px", fontFamily: "'DM Sans', sans-serif",
  },
  topBar: {
    background: "linear-gradient(135deg, #1f2937 0%, #0f1729 100%)",
    color: "white", padding: "16px 20px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    position: "sticky", top: 0, zIndex: 100,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  logoSection: { display: "flex", alignItems: "center", gap: "8px" },
  logoText: { fontWeight: 800, fontSize: "16px", color: "#fbbf24", letterSpacing: "0.5px" },
  logoutIcon: { background: "none", border: "none", fontSize: "22px", cursor: "pointer" },
  settingsIcon: { background: "none", border: "none", fontSize: "20px", cursor: "pointer" },
  refreshBtn: { background: "none", border: "none", fontSize: "18px", cursor: "pointer", marginRight: "10px" },
  notificationBanner: {
    display: "flex", alignItems: "center", gap: "12px",
    background: "#fef2f2", borderBottom: "2px solid #fca5a5",
    padding: "12px 20px", color: "#991b1b", cursor: "pointer",
  },
  bannerBadge: {
    background: "#ef4444", color: "white",
    padding: "4px 8px", borderRadius: "12px",
    fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap",
  },
  errorToast: {
    background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626",
    padding: "12px 16px", fontSize: "13px", fontWeight: 600,
    position: "sticky", top: "60px", zIndex: 99,
  },
  successToast: {
    background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a",
    padding: "12px 16px", fontSize: "13px", fontWeight: 600,
    position: "sticky", top: "60px", zIndex: 99,
  },
  content: { padding: "20px" },
  welcomeCard: {
    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    color: "white", padding: "24px", borderRadius: "16px", marginBottom: "24px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  welcomeTitle: { fontSize: "20px", fontWeight: 800, margin: "0 0 4px" },
  welcomeSubtitle: { fontSize: "13px", opacity: 0.9, margin: 0 },
  statusBadge: {
    background: "rgba(255,255,255,0.2)", padding: "8px 12px",
    borderRadius: "8px", fontSize: "12px", fontWeight: 600,
  },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" },
  statCard: {
    background: "white", padding: "16px", borderRadius: "12px",
    display: "flex", gap: "12px", alignItems: "center",
    border: "1px solid #e5e7eb",
  },
  statIcon: { fontSize: "28px" },
  statLabel: { fontSize: "11px", color: "#6b7280", margin: "0 0 4px", fontWeight: 700, textTransform: "uppercase" },
  statNumber: { fontSize: "18px", fontWeight: 800, color: "#1f2937", margin: 0 },
  sectionTitle: { fontSize: "15px", fontWeight: 700, color: "#1f2937", marginBottom: "12px", marginTop: "4px" },
  jobsList: { display: "flex", flexDirection: "column", gap: "12px" },
  jobCard: {
    background: "white", padding: "16px", borderRadius: "12px",
    border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  jobHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", gap: "8px" },
  jobTitle: { fontSize: "15px", fontWeight: 700, color: "#1f2937", margin: "0 0 4px" },
  jobCustomer: { fontSize: "12px", color: "#6b7280", margin: 0 },
  maskedPhone: {
    background: "#f3f4f6", color: "#9ca3af",
    padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontStyle: "italic",
  },
  jobStatus: {
    padding: "4px 8px", borderRadius: "6px", border: "2px solid",
    fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0,
  },
  jobDetails: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" },
  jobDetail: { fontSize: "13px", color: "#4b5563", margin: 0 },
  actionBtn: {
    width: "100%", padding: "12px", color: "white",
    border: "none", borderRadius: "8px",
    fontSize: "13px", fontWeight: 700, cursor: "pointer",
  },
  emptyBox: {
    background: "white", padding: "40px 20px", textAlign: "center",
    borderRadius: "12px", color: "#9ca3af", border: "1px dashed #d1d5db",
  },
  profilePage: {
    textAlign: "center", background: "white",
    padding: "30px 20px", borderRadius: "16px", border: "1px solid #e5e7eb",
  },
  avatarLarge: { fontSize: "60px", marginBottom: "12px" },
  profileName: { fontSize: "20px", fontWeight: 800, color: "#1f2937", margin: "0 0 4px" },
  userEmail: { color: "#6b7280", margin: "0 0 20px", fontSize: "14px" },
  profileInfo: { textAlign: "left", margin: "20px 0" },
  infoRow: {
    display: "flex", justifyContent: "space-between",
    padding: "12px 0", borderBottom: "1px solid #f3f4f6", fontSize: "14px",
  },
  infoLabel: { fontWeight: 600, color: "#6b7280" },
  infoValue: { color: "#1f2937", fontWeight: 500 },
  servicesDisplay: { display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "flex-end" },
  serviceBadge: {
    background: "#dbeafe", color: "#0c4a6e",
    padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
  },
  editBtn: {
    marginTop: "20px", width: "100%", padding: "12px",
    borderRadius: "8px", border: "none",
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "white", fontWeight: 700, cursor: "pointer",
  },
  cancelBtn: {
    flex: 1, padding: "10px", borderRadius: "6px",
    border: "1px solid #d1d5db", background: "white",
    color: "#6b7280", fontWeight: 600, cursor: "pointer",
  },
  formLabel: { fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "2px" },
  formInput: {
    width: "100%", padding: "10px 12px", borderRadius: "8px",
    border: "1px solid #d1d5db", fontSize: "14px",
    color: "#1f2937", background: "white", boxSizing: "border-box",
  },
  earningsCard: {
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    color: "white", borderRadius: "16px",
    padding: "32px 20px", textAlign: "center", marginBottom: "24px",
  },
  earningsLabel: { fontSize: "14px", opacity: 0.9, margin: "0 0 8px" },
  earningsAmount: { fontSize: "32px", fontWeight: 800, margin: 0 },
  earningsList: { display: "flex", flexDirection: "column", gap: "12px" },
  earningsRow: {
    background: "white", padding: "16px", borderRadius: "12px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    border: "1px solid #e5e7eb",
  },
  earningService: { fontSize: "14px", fontWeight: 700, color: "#1f2937", margin: "0 0 4px" },
  earningDate: { fontSize: "12px", color: "#6b7280", margin: "0 0 2px" },
  earningAmount: { fontSize: "16px", fontWeight: 700, color: "#22c55e", whiteSpace: "nowrap" },
  bottomNav: {
    position: "fixed", bottom: 0, width: "100%",
    background: "white", display: "flex", justifyContent: "space-around",
    padding: "8px 0", borderTop: "1px solid #e5e7eb", zIndex: 99,
  },
  navBtn: {
    border: "none", background: "none",
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: "4px", color: "#9ca3af", fontSize: "12px",
    padding: "8px 12px", cursor: "pointer",
  },
  navBtnActive: {
    border: "none", background: "none",
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: "4px", color: "#3b82f6", fontSize: "12px",
    padding: "8px 12px", cursor: "pointer", fontWeight: 700,
  },
  navIcon: { fontSize: "20px" },
  navLabel: { fontSize: "11px" },
  navBadgeIndex: {
    position: "absolute", top: "-6px", right: "-10px",
    background: "#ef4444", color: "white",
    borderRadius: "10px", padding: "1px 6px",
    fontSize: "10px", fontWeight: 700,
    minWidth: "12px", textAlign: "center",
  },
};

const mobileCss = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  body { margin: 0; padding: 0; }
  h1,h2,h3,h4 { margin: 0; }
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }
  button:disabled { opacity: 0.6; cursor: not-allowed !important; }
  @media (max-width: 480px) {
    [style*="grid-template-columns: 1fr 1fr"] {
      grid-template-columns: 1fr !important;
    }
  }
`;