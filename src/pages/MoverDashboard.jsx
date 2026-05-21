import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

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

  // Real-time tracking filters derived from exact schema state
  const pendingJobsCount = jobs.filter(j => j.status === "pending").length;

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user?.role !== "mover") { navigate("/dashboard"); return; }
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
    const active    = jobList.filter(j => j.status === "active" || j.status === "accepted");
    const earnings  = completed.reduce((sum, j) => sum + (j.amount || 0), 0);
    setMoverStats({
      totalJobs: jobList.length,
      completedJobs: completed.length,
      activeJobs: active.length,
      totalEarnings: earnings,
    });
  };

  const handleAcceptJob = async (jobId) => {
    setActionLoading(jobId);
    try {
      const res = await fetch(`${API_BASE}/jobs/${jobId}/accept`, {
        method: "PUT", // Matches backend router verb specification
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to accept job");
      showSuccess("Booking confirmed! Contact details unlocked.");
      await fetchJobs();
    } catch {
      showError("Could not accept job. Try again.");
    } Transformer: finally {
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
      if (!res.ok) throw new Error("Failed to complete job");
      showSuccess("Job marked as completed!");
      await fetchJobs();
    } catch {
      showError("Could not complete job. Try again.");
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
      if (!res.ok) throw new Error("Failed to save profile");
      showSuccess("Profile updated successfully!");
      setEditingProfile(false);
    } catch {
      showError("Could not save profile. Try again.");
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
    accepted: "🔵 Accepted", pending: "⏳ Pending Approval",
  }[status] || status);

  const handleLogout = () => { logout(); navigate("/"); };

  if (loading) {
    return (
      <div style={{ ...styles.container, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#6b7280" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🚚</div>
          <p style={{ fontWeight: 600 }}>Syncing with server node network...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{mobileCss}</style>

      {/* TOP HEADER */}
      <header style={styles.topBar}>
        <div style={styles.logoSection}>
          <span style={styles.logoText}>🚚 AXX Movers Dashboard</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={fetchAll} style={styles.refreshBtn} title="Refresh Data">🔄</button>
          <button onClick={handleLogout} style={styles.logoutIcon} title="Logout">🚪</button>
        </div>
      </header>

      {/* SYSTEM FEEDBACK NOTIFICATIONS */}
      {error   && <div style={styles.errorToast}>{error}</div>}
      {success && <div style={styles.successToast}>{success}</div>}

      {/* PENDING ASSIGNMENT CRITICAL BANNER */}
      {pendingJobsCount > 0 && (
        <div style={styles.notificationBanner} onClick={() => setActiveTab("jobs")}>
          <span style={{ fontSize: "18px" }}>🚨</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 700 }}>Incoming request alert!</p>
            <p style={{ margin: 0, fontSize: "11px", opacity: 0.9 }}>There are {pendingJobsCount} open bookings waiting for processor acceptance.</p>
          </div>
          <span style={styles.bannerBadge}>Open Market Jobs</span>
        </div>
      )}

      {/* DASHBOARD CORE */}
      <main style={styles.content}>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <section>
            <div style={styles.welcomeCard}>
              <div>
                <h2 style={styles.welcomeTitle}>Hello, {user?.name?.split(" ")[0] || "Partner"}! 👋</h2>
                <p style={styles.welcomeSubtitle}>📍 Operations Base: {user?.county || "Default Network"}</p>
              </div>
              <div style={styles.statusBadge}>🟢 Pipeline Listening</div>
            </div>

            <div style={styles.statsGrid}>
              {[
                { icon: "📦", label: "Pipeline Registry", value: moverStats.totalJobs },
                { icon: "✅", label: "Completed Jobs", value: moverStats.completedJobs },
                { icon: "🔄", label: "Active Operations", value: moverStats.activeJobs },
                { icon: "💰", label: "Revenue Ledger", value: `KES ${moverStats.totalEarnings.toLocaleString()}` },
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

            {/* FLOATING ACTION QUEUE */}
            {jobs.filter(j => j.status === "pending").length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ ...styles.sectionTitle, color: "#ef4444" }}>⚡ High Priority Open Tasks</h3>
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

            <h3 style={styles.sectionTitle}>📋 Recent Structural Logs</h3>
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
            <h2 style={styles.sectionTitle}>📦 Complete Request Pipeline Ledger</h2>
            <JobFilterTabs jobs={jobs} getStatusColor={getStatusColor} getStatusLabel={getStatusLabel}
              actionLoading={actionLoading} onAccept={handleAcceptJob} onComplete={handleCompleteJob} />
          </section>
        )}

        {/* ── EARNINGS TAB ── */}
        {activeTab === "earnings" && (
          <section>
            <div style={styles.earningsCard}>
              <p style={styles.earningsLabel}>💰 Total Verified Balance</p>
              <h1 style={styles.earningsAmount}>KES {moverStats.totalEarnings.toLocaleString()}</h1>
              <p style={{ ...styles.earningsLabel, marginTop: "8px" }}>
                Accrued clear payout from {moverStats.completedJobs} finished orders.
              </p>
            </div>

            <h3 style={styles.sectionTitle}>📊 Verified Payment Accounts</h3>
            {jobs.filter(j => j.status === "completed").length > 0 ? (
              <div style={styles.earningsList}>
                {jobs.filter(j => j.status === "completed").map(job => (
                  <div key={job._id || job.id} style={styles.earningsRow}>
                    <div>
                      <p style={styles.earningService}>{job.serviceType || "Moving Job"}</p>
                      <p style={styles.earningDate}>📍 Route: {job.pickupLocation}</p>
                      <p style={styles.earningDate}>📅 Closed: {new Date(job.scheduledDate || job.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p style={styles.earningAmount}>+ KES {(job.amount || 0).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyBox}><p>No settlement items calculated yet.</p></div>
            )}
          </section>
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <section>
            {!editingProfile ? (
              <div style={styles.profilePage}>
                <div style={styles.avatarLarge}>🏢</div>
                <h3 style={styles.profileName}>{user?.name}</h3>
                <p style={styles.userEmail}>{user?.email}</p>

                <div style={styles.profileInfo}>
                  {[
                    { label: "📞 Primary Hotline", value: profileData.phone || "Not set" },
                    { label: "📍 Active County Base", value: profileData.county || "Not set" },
                    { label: "🚗 Transport Asset Category", value: profileData.vehicleType || "Not set" },
                    { label: "⭐ Professional Tenure", value: `${profileData.experienceYears || 0} Years` },
                  ].map(row => (
                    <div key={row.label} style={styles.infoRow}>
                      <span style={styles.infoLabel}>{row.label}</span>
                      <span style={styles.infoValue}>{row.value}</span>
                    </div>
                  ))}

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>✅ Verified Clearances</span>
                    <div style={styles.servicesDisplay}>
                      {profileData.services?.length > 0
                        ? profileData.services.map(s => (
                            <span key={s} style={styles.serviceBadge}>{s}</span>
                          ))
                        : <span style={styles.infoValue}>No active options set</span>
                      }
                    </div>
                  </div>

                  {profileData.bio && (
                    <div style={{ ...styles.infoRow, flexDirection: "column", gap: "6px" }}>
                      <span style={styles.infoLabel}>📝 Professional Statement</span>
                      <span style={{ ...styles.infoValue, fontSize: "13px", lineHeight: 1.5 }}>{profileData.bio}</span>
                    </div>
                  )}
                </div>

                <button style={styles.editBtn} onClick={() => setEditingProfile(true)}>
                  ✏️ Modulate Profile Configurations
                </button>
              </div>
            ) : (
              <div style={styles.profilePage}>
                <h3 style={{ ...styles.profileName, marginBottom: "20px" }}>✏️ Edit Profile Configuration</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "left" }}>
                  <label style={styles.formLabel}>📞 Telephone Vector Line</label>
                  <input style={styles.formInput} value={profileData.phone}
                    onChange={e => setProfileData(p => ({ ...p, phone: e.target.value }))}
                    placeholder="e.g. 0712345678" />

                  <label style={styles.formLabel}>📍 Operation County</label>
                  <input style={styles.formInput} value={profileData.county}
                    onChange={e => setProfileData(p => ({ ...p, county: e.target.value }))}
                    placeholder="e.g. Nairobi" />

                  <label style={styles.formLabel}>🚗 Transport Classification</label>
                  <select style={styles.formInput} value={profileData.vehicleType}
                    onChange={e => setProfileData(p => ({ ...p, vehicleType: e.target.value }))}>
                    <option value="">Select asset class...</option>
                    {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>

                  <label style={styles.formLabel}>⭐ Professional Tenure (Years)</label>
                  <input style={styles.formInput} type="number" min="0" max="50"
                    value={profileData.experienceYears}
                    onChange={e => setProfileData(p => ({ ...p, experienceYears: e.target.value }))}
                    placeholder="e.g. 3" />

                  <label style={styles.formLabel}>📝 Corporate Bio Summary</label>
                  <textarea style={{ ...styles.formInput, minHeight: "80px", resize: "vertical" }}
                    value={profileData.bio}
                    onChange={e => setProfileData(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Describe your equipment capacity and logistics record..." />

                  <label style={styles.formLabel}>✅ Select Active Operations</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {SERVICE_OPTIONS.map(s => (
                      <button key={s} type="button" onClick={() => toggleService(s)}
                        style={{
                          padding: "6px 12px", borderRadius: "20px", fontSize: "12px",
                          fontWeight: 600, cursor: "pointer", border: "2px solid",
                          borderColor: profileData.services.includes(s) ? "#3b82f6" : "#d1d5db",
                          background: profileData.services.includes(s) ? "#dbeafe" : "white",
                          color: profileData.services.includes(s) ? "#1d4ed8" : "#6b7280",
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                  <button type="button" style={styles.cancelBtn} onClick={() => setEditingProfile(false)}>
                    ← Cancel
                  </button>
                  <button type="button" style={{ ...styles.editBtn, margin: 0, flex: 1 }}
                    onClick={handleSaveProfile} disabled={profileSaving}>
                    {profileSaving ? "Saving details..." : "💾 Save Structural Profile"}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* BOTTOM CONTROL TAB BAR */}
      <nav style={styles.bottomNav}>
        {[
          { tab: "overview",  icon: "📊", label: "Overview", badge: 0 },
          { tab: "jobs",      icon: "📦", label: "Pipelines", badge: pendingJobsCount },
          { tab: "earnings",  icon: "💰", label: "Earnings", badge: 0 },
          { tab: "profile",   icon: "👤", label: "Account",  badge: 0 },
        ].map(({ tab, icon, label, badge }) => (
          <button key={tab}
            style={activeTab === tab ? styles.navBtnActive : styles.navBtn}
            onClick={() => setActiveTab(tab)}>
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

// ── Secondary Layout Components ────────────────────────────────────────────────────────────

function JobList({ jobs, actionLoading, onAccept, onComplete, getStatusColor, getStatusLabel }) {
  if (!jobs || jobs.length === 0) {
    return (
      <div style={styles.emptyBox}>
        <p>📭 No active listings present matching this pipeline status filter.</p>
      </div>
    );
  }
  return (
    <div style={styles.jobsList}>
      {jobs.map(job => (
        <JobCard key={job._id || job.id} job={job} actionLoading={actionLoading}
          onAccept={onAccept} onComplete={onComplete}
          getStatusColor={getStatusColor} getStatusLabel={getStatusLabel} />
      ))}
    </div>
  );
}

function JobFilterTabs({ jobs, actionLoading, onAccept, onComplete, getStatusColor, getStatusLabel }) {
  const [filter, setFilter] = useState("all");
  const tabs = ["all", "pending", "accepted", "completed"];
  const filtered = filter === "all" ? jobs : jobs.filter(j => j.status === filter);

  return (
    <>
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginBottom: "16px", paddingBottom: "4px" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            style={{
              padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
              cursor: "pointer", whiteSpace: "nowrap", border: "2px solid",
              borderColor: filter === t ? "#3b82f6" : "#d1d5db",
              background: filter === t ? "#dbeafe" : "white",
              color: filter === t ? "#1d4ed8" : "#6b7280",
                }}>
            {t === "all" ? "All Orders" : t.charAt(0).toUpperCase() + t.slice(1)}
            {" "}({filter === t ? filtered.length : jobs.filter(j => t === "all" || j.status === t).length})
          </button>
        ))}
      </div>
      <JobList jobs={filtered} actionLoading={actionLoading} onAccept={onAccept}
        onComplete={onComplete} getStatusColor={getStatusColor} getStatusLabel={getStatusLabel} />
    </>
  );
}

function JobCard({ job, actionLoading, onAccept, onComplete, getStatusColor, getStatusLabel }) {
  const id = job._id || job.id;
  const isLoading = actionLoading === id;
  const isPending = job.status === "pending";

  return (
    <div style={{ ...styles.jobCard, borderLeft: isPending ? "5px solid #ef4444" : `5px solid ${getStatusColor(job.status)}` }}>
      <div style={styles.jobHeader}>
        <div>
          <h4 style={styles.jobTitle}>{job.serviceType || "Logistics Relocation"}</h4>
          <p style={styles.jobCustomer}>👤 Client: {job.customerName || "System Pool Client"}</p>
          
          {/* SECURE TELEPHONE ESCROW CONDUIT */}
          <p style={{ ...styles.jobCustomer, marginTop: "2px", fontWeight: 500 }}>
            📞 Contact: {isPending ? (
              <span style={styles.maskedPhone}>📋 [Locked - Accept Job to View]</span>
            ) : (
              <a href={`tel:${job.customerPhone}`} style={{ color: "#3b82f6", textDecoration: "none" }}>{job.customerPhone || "Not specified"}</a>
            )}
          </p>
        </div>
        <span style={{ ...styles.jobStatus, borderColor: getStatusColor(job.status), color: getStatusColor(job.status) }}>
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
            📅 <strong>Execution:</strong> {new Date(job.scheduledDate).toLocaleDateString("en-KE", {
              weekday: "short", year: "numeric", month: "short", day: "numeric"
            })}
          </p>
        )}
        {job.amount > 0 && (
          <p style={{ ...styles.jobDetail, fontSize: "14px", fontWeight: 700, color: "#22c55e", marginTop: "4px" }}>
            💰 Compensation: KES {job.amount.toLocaleString()}
          </p>
        )}
        {job.notes && (
          <p style={{ ...styles.jobDetail, fontStyle: "italic", marginTop: "4px", background: "#f9fafb", padding: "6px", borderRadius: "4px" }}>
            📝 Instruction: "{job.notes}"
          </p>
        )}
      </div>

      {isPending && (
        <button style={{ ...styles.viewJobBtn, background: "#22c55e" }}
          onClick={() => onAccept(id)} disabled={isLoading}>
          {isLoading ? "Assigning ledger nodes..." : "🤝 Accept Pipeline Booking Request"}
        </button>
      )}
      {(job.status === "accepted" || job.status === "active") && (
        <button style={{ ...styles.viewJobBtn, background: "#f59e0b" }}
          onClick={() => onComplete(id)} disabled={isLoading}>
          {isLoading ? "Finalizing metrics..." : "🏁 Close Mission & Clear Invoices"}
        </button>
      )}
    </div>
  );
}

// ── Design Vector Objects ────────────────────────────────────────────────────────────────────

const styles = {
  container: { background: "#f4f7f6", minHeight: "100vh", paddingBottom: "100px", fontFamily: "'DM Sans', sans-serif" },
  topBar: { background: "linear-gradient(135deg, #1f2937 0%, #0f1729 100%)", color: "white", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" },
  logoSection: { display: "flex", alignItems: "center", gap: "8px" },
  logoText: { fontWeight: 800, fontSize: "16px", color: "#fbbf24", letterSpacing: "0.5px" },
  logoutIcon: { background: "none", border: "none", fontSize: "22px", cursor: "pointer" },
  refreshBtn: { background: "none", border: "none", fontSize: "18px", cursor: "pointer", marginRight: "10px" },
  notificationBanner: { display: "flex", alignItems: "center", gap: "12px", background: "#fef2f2", borderBottom: "2px solid #fca5a5", padding: "12px 20px", color: "#991b1b", cursor: "pointer" },
  bannerBadge: { background: "#ef4444", color: "white", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap" },
  errorToast: { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "12px 16px", fontSize: "13px", fontWeight: 600, position: "sticky", top: "60px", zIndex: 99 },
  successToast: { background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", padding: "12px 16px", fontSize: "13px", fontWeight: 600, position: "sticky", top: "60px", zIndex: 99 },
  content: { padding: "20px" },
  welcomeCard: { background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", color: "white", padding: "24px", borderRadius: "16px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  welcomeTitle: { fontSize: "20px", fontWeight: 800, margin: "0 0 4px" },
  welcomeSubtitle: { fontSize: "13px", opacity: 0.9, margin: 0 },
  statusBadge: { background: "rgba(255,255,255,0.2)", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600 },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" },
  statCard: { background: "white", padding: "16px", borderRadius: "12px", display: "flex", gap: "12px", alignItems: "center", border: "1px solid #e5e7eb" },
  statIcon: { fontSize: "28px" },
  statLabel: { fontSize: "11px", color: "#6b7280", margin: "0 0 4px", fontWeight: 700, textTransform: "uppercase" },
  statNumber: { fontSize: "18px", fontWeight: 800, color: "#1f2937", margin: 0 },
  sectionTitle: { fontSize: "15px", fontWeight: 700, color: "#1f2937", marginBottom: "12px", marginTop: "4px" },
  jobsList: { display: "flex", flexDirection: "column", gap: "12px" },
  jobCard: { background: "white", padding: "16px", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  jobHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" },
  jobTitle: { fontSize: "15px", fontWeight: 700, color: "#1f2937", margin: "0 0 4px" },
  jobCustomer: { fontSize: "12px", color: "#6b7280", margin: 0 },
  maskedPhone: { background: "#f3f4f6", color: "#9ca3af", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontStyle: "italic" },
  jobStatus: { padding: "4px 8px", borderRadius: "6px", border: "2px solid", fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap" },
  jobDetails: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" },
  jobDetail: { fontSize: "13px", color: "#4b5563", margin: 0 },
  viewJobBtn: { width: "100%", padding: "12px", background: "#3b82f6", color: "white", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 700, cursor: "pointer" },
  emptyBox: { background: "white", padding: "40px 20px", textAlign: "center", borderRadius: "12px", color: "#9ca3af", border: "1px dashed #d1d5db" },
  profilePage: { textAlign: "center", background: "white", padding: "30px 20px", borderRadius: "16px", border: "1px solid #e5e7eb" },
  avatarLarge: { fontSize: "60px", marginBottom: "12px" },
  profileName: { fontSize: "20px", fontWeight: 800, color: "#1f2937", margin: "0 0 4px" },
  userEmail: { color: "#6b7280", margin: "0 0 20px", fontSize: "14px" },
  profileInfo: { textAlign: "left", margin: "20px 0" },
  infoRow: { display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f3f4f6", fontSize: "14px" },
  infoLabel: { fontWeight: 600, color: "#6b7280" },
  infoValue: { color: "#1f2937", fontWeight: 500 },
  servicesDisplay: { display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "flex-end" },
  serviceBadge: { background: "#dbeafe", color: "#0c4a6e", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 },
  editBtn: { marginTop: "20px", width: "100%", padding: "12px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", color: "white", fontWeight: 700, cursor: "pointer" },
  cancelBtn: { flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", background: "white", color: "#6b7280", fontWeight: 600, cursor: "pointer" },
  formLabel: { fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "2px" },
  formInput: { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", color: "#1f2937", background: "white", boxSizing: "border-box" },
  earningsCard: { background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", color: "white", borderRadius: "16px", padding: "32px 20px", textAlign: "center", marginBottom: "24px" },
  earningsLabel: { fontSize: "14px", opacity: 0.9, margin: "0 0 8px" },
  earningsAmount: { fontSize: "32px", fontWeight: 800, margin: 0 },
  earningsList: { display: "flex", flexDirection: "column", gap: "12px" },
  earningsRow: { background: "white", padding: "16px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #e5e7eb" },
  earningService: { fontSize: "14px", fontWeight: 700, color: "#1f2937", margin: "0 0 4px" },
  earningDate: { fontSize: "12px", color: "#6b7280", margin: "0 0 2px" },
  earningAmount: { fontSize: "16px", fontWeight: 700, color: "#22c55e" },
  bottomNav: { position: "fixed", bottom: 0, width: "100%", background: "white", display: "flex", justifyContent: "space-around", padding: "8px 0", borderTop: "1px solid #e5e7eb", zIndex: 99 },
  navBtn: { border: "none", background: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: "#9ca3af", fontSize: "12px", padding: "8px 12px", cursor: "pointer" },
  navBtnActive: { border: "none", background: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: "#3b82f6", fontSize: "12px", padding: "8px 12px", cursor: "pointer", fontWeight: 700 },
  navIcon: { fontSize: "20px" },
  navLabel: { fontSize: "11px" },
  navBadgeIndex: { position: "absolute", top: "-6px", right: "-10px", background: "#ef4444", color: "white", borderRadius: "10px", padding: "1px 6px", fontSize: "10px", fontWeight: 700, minWidth: "12px", textAlign: "center" }
};

const mobileCss = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  body { margin: 0; padding: 0; }
  h1,h2,h3,h4 { margin: 0; }
  input:focus, select:focus, textarea:focus { outline: none; border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  @media (max-width: 480px) {
    [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
  }
`;