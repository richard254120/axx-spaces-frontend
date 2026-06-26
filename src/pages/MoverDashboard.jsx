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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 22) return "Good evening";
    return "Hello";
  };
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
    phone: "", bio: "", portfolioImages: [], pricing: {}, insurance: {},
    teamInfo: {}, specialties: [], serviceAreas: [],
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
      portfolioImages: data.portfolioImages || [],
      pricing: data.pricing || { baseRate: 0, rateType: "per_job", minCharge: 0, additionalServices: [] },
      insurance: data.insurance || { hasInsurance: false, provider: "", coverageAmount: 0, expiryDate: null },
      teamInfo: data.teamInfo || { teamSize: 1, teamMembers: [] },
      specialties: data.specialties || [],
      serviceAreas: data.serviceAreas || [],
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

  const handlePortfolioUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    try {
      const res = await fetch(`${API_BASE}/movers/portfolio`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to upload portfolio images");
      }

      const data = await res.json();
      setProfileData(prev => ({
        ...prev,
        portfolioImages: data.portfolioImages
      }));
      showSuccess("Portfolio images uploaded successfully!");
    } catch (err) {
      showError(err.message || "Could not upload portfolio images. Try again.");
    }
  };

  const handleDeletePortfolioImage = async (index) => {
    try {
      const res = await fetch(`${API_BASE}/movers/portfolio/${index}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to delete portfolio image");
      }

      const data = await res.json();
      setProfileData(prev => ({
        ...prev,
        portfolioImages: data.portfolioImages
      }));
      showSuccess("Portfolio image deleted successfully!");
    } catch (err) {
      showError(err.message || "Could not delete portfolio image. Try again.");
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

      {/* TABS SCROLL */}
      <div style={styles.tabsScroll}>
        <button
          style={{ ...styles.tabBtn, ...(activeTab === "overview" && styles.tabBtnActive) }}
          onClick={() => setActiveTab("overview")}
        >
          📊 Overview
        </button>
        <button
          style={{ ...styles.tabBtn, ...(activeTab === "jobs" && styles.tabBtnActive) }}
          onClick={() => setActiveTab("jobs")}
        >
          📦 Jobs {pendingJobsCount > 0 && <span style={styles.tabBadge}>{pendingJobsCount}</span>}
        </button>
        <button
          style={{ ...styles.tabBtn, ...(activeTab === "earnings" && styles.tabBtnActive) }}
          onClick={() => setActiveTab("earnings")}
        >
          💰 Earnings
        </button>
        <button
          style={{ ...styles.tabBtn, ...(activeTab === "profile" && styles.tabBtnActive) }}
          onClick={() => setActiveTab("profile")}
        >
          👤 Profile
        </button>
      </div>

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
                <h2 style={styles.welcomeTitle}>{getGreeting()}, {user?.name?.split(" ")[0] || "Partner"}! 👋</h2>
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

            {/* Portfolio Management */}
            <div style={styles.profileSection}>
              <h3 style={styles.sectionTitle}>📸 Portfolio Gallery</h3>
              <div style={styles.portfolioGrid}>
                {profileData.portfolioImages && profileData.portfolioImages.length > 0 ? (
                  profileData.portfolioImages.map((img, index) => (
                    <div key={index} style={styles.portfolioItem}>
                      <img src={img} alt={`Portfolio ${index + 1}`} style={styles.portfolioImage} />
                      <button
                        onClick={() => handleDeletePortfolioImage(index)}
                        style={styles.deleteBtn}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <div style={styles.emptyPortfolio}>
                    <p>No portfolio images yet</p>
                  </div>
                )}
              </div>
              {profileData.portfolioImages && profileData.portfolioImages.length < 10 && (
                <div style={styles.uploadSection}>
                  <input
                    type="file"
                    id="portfolio-upload"
                    multiple
                    accept="image/*"
                    onChange={handlePortfolioUpload}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="portfolio-upload" style={styles.uploadBtn}>
                    + Add Portfolio Images
                  </label>
                </div>
              )}
            </div>

            {/* Enhanced Profile Fields */}
            <div style={styles.profileSection}>
              <h3 style={styles.sectionTitle}>💰 Pricing Information</h3>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Base Rate (KES)</label>
                <input
                  type="number"
                  value={profileData.pricing?.baseRate || ""}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    pricing: { ...prev.pricing, baseRate: parseFloat(e.target.value) || 0 }
                  }))}
                  style={styles.fieldInput}
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Rate Type</label>
                <select
                  value={profileData.pricing?.rateType || "per_job"}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    pricing: { ...prev.pricing, rateType: e.target.value }
                  }))}
                  style={styles.fieldInput}
                >
                  <option value="per_job">Per Job</option>
                  <option value="hourly">Hourly</option>
                  <option value="per_km">Per Kilometer</option>
                  <option value="fixed">Fixed Price</option>
                </select>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Minimum Charge (KES)</label>
                <input
                  type="number"
                  value={profileData.pricing?.minCharge || ""}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    pricing: { ...prev.pricing, minCharge: parseFloat(e.target.value) || 0 }
                  }))}
                  style={styles.fieldInput}
                />
              </div>
            </div>

            {/* Insurance Information */}
            <div style={styles.profileSection}>
              <h3 style={styles.sectionTitle}>🛡️ Insurance Information</h3>
              <div style={styles.fieldGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={profileData.insurance?.hasInsurance || false}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      insurance: { ...prev.insurance, hasInsurance: e.target.checked }
                    }))}
                    style={styles.checkbox}
                  />
                  <span>I have insurance coverage</span>
                </label>
              </div>
              {profileData.insurance?.hasInsurance && (
                <>
                  <div style={styles.fieldGroup}>
                    <label style={styles.fieldLabel}>Insurance Provider</label>
                    <input
                      type="text"
                      value={profileData.insurance?.provider || ""}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        insurance: { ...prev.insurance, provider: e.target.value }
                      }))}
                      style={styles.fieldInput}
                    />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.fieldLabel}>Coverage Amount (KES)</label>
                    <input
                      type="number"
                      value={profileData.insurance?.coverageAmount || ""}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        insurance: { ...prev.insurance, coverageAmount: parseFloat(e.target.value) || 0 }
                      }))}
                      style={styles.fieldInput}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Team Information */}
            <div style={styles.profileSection}>
              <h3 style={styles.sectionTitle}>👥 Team Information</h3>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Team Size</label>
                <input
                  type="number"
                  value={profileData.teamInfo?.teamSize || 1}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    teamInfo: { ...prev.teamInfo, teamSize: parseInt(e.target.value) || 1 }
                  }))}
                  style={styles.fieldInput}
                  min="1"
                />
              </div>
            </div>

            {/* Specialties */}
            <div style={styles.profileSection}>
              <h3 style={styles.sectionTitle}>⭐ Specialties</h3>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Specialties (comma-separated)</label>
                <textarea
                  value={(profileData.specialties || []).join(", ")}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    specialties: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  }))}
                  style={styles.textareaInput}
                  placeholder="e.g. Piano Moving, Fragile Items, Heavy Lifting"
                />
              </div>
            </div>

            {/* Service Areas */}
            <div style={styles.profileSection}>
              <h3 style={styles.sectionTitle}>📍 Service Areas</h3>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Service Areas (comma-separated)</label>
                <textarea
                  value={(profileData.serviceAreas || []).join(", ")}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    serviceAreas: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  }))}
                  style={styles.textareaInput}
                  placeholder="e.g. Nairobi, Kiambu, Nakuru"
                />
              </div>
            </div>

            <UserProfileEditor
              token={token}
              user={user}
              showMoverFields
              accentColor="#3b82f6"
              onUpdated={() => fetchProfile()}
            />

            <button onClick={handleSaveProfile} disabled={profileSaving} style={styles.saveBtn}>
              {profileSaving ? "Saving..." : "💾 Save All Changes"}
            </button>
          </section>
        )}
      </main>
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
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", minHeight: "100vh",
    color: "#f8fafc", fontFamily: "'Inter', 'DM Sans', sans-serif",
    padding: "24px 20px",
  },
  tabsScroll: {
    display: "flex", gap: "8px", overflowX: "auto",
    marginBottom: "24px", paddingBottom: "8px", scrollBehavior: "smooth",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  },
  tabBtn: {
    background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#94a3b8",
    padding: "12px 20px", borderRadius: "10px", fontSize: "13px",
    fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.3s ease", display: "flex", alignItems: "center", gap: "6px"
  },
  tabBtnActive: { background: "#fbbf24", color: "#0f1729", border: "1px solid #fbbf24", boxShadow: "0 4px 12px rgba(251, 191, 36, 0.3)" },
  tabBadge: {
    background: "#ef4444", color: "white", padding: "1px 6px", borderRadius: "10px", fontSize: "10px", fontWeight: 700
  },
  notificationBanner: {
    display: "flex", alignItems: "center", gap: "12px",
    background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)",
    padding: "12px 20px", color: "#fca5a5", cursor: "pointer", borderRadius: "12px", marginBottom: "20px"
  },
  bannerBadge: {
    background: "#ef4444", color: "white",
    padding: "4px 12px", borderRadius: "12px",
    fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap",
  },
  errorToast: {
    background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171",
    padding: "12px 16px", fontSize: "13px", fontWeight: 600,
    borderRadius: "10px", marginBottom: "16px"
  },
  successToast: {
    background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#34d399",
    padding: "12px 16px", fontSize: "13px", fontWeight: 600,
    borderRadius: "10px", marginBottom: "16px"
  },
  content: { padding: "12px 0" },
  welcomeCard: {
    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(29, 78, 216, 0.05) 100%)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    color: "white", padding: "28px", borderRadius: "20px", marginBottom: "28px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    boxShadow: "0 8px 24px rgba(59, 130, 246, 0.1)",
  },
  welcomeTitle: { fontSize: "24px", fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.5px", color: "#fbbf24" },
  welcomeSubtitle: { fontSize: "14px", opacity: 0.95, margin: 0, lineHeight: "1.5", color: "#94a3b8" },
  statusBadge: {
    background: "rgba(34, 197, 94, 0.15)", color: "#22c55e", border: "1px solid rgba(34, 197, 94, 0.3)", padding: "10px 16px",
    borderRadius: "12px", fontSize: "13px", fontWeight: 700, backdropFilter: "blur(10px)",
  },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "28px" },
  statCard: {
    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)", padding: "20px", borderRadius: "16px",
    display: "flex", gap: "14px", alignItems: "center",
    border: "1px solid rgba(255, 255, 255, 0.08)", transition: "all 0.3s ease",
  },
  statIcon: { fontSize: "32px" },
  statLabel: { fontSize: "11px", color: "#94a3b8", margin: "0 0 6px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" },
  statNumber: { fontSize: "22px", fontWeight: 800, color: "#fbbf24", margin: 0, letterSpacing: "-0.5px" },
  sectionTitle: { fontSize: "18px", fontWeight: 800, color: "#fbbf24", marginBottom: "16px", marginTop: "8px", letterSpacing: "-0.3px" },
  jobsList: { display: "flex", flexDirection: "column", gap: "16px" },
  jobCard: {
    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)", padding: "20px", borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.08)", transition: "all 0.3s ease",
  },
  jobHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", gap: "12px" },
  jobTitle: { fontSize: "17px", fontWeight: 800, color: "#f1f5f9", margin: "0 0 6px", letterSpacing: "-0.3px" },
  jobCustomer: { fontSize: "13px", color: "#94a3b8", margin: 0 },
  maskedPhone: {
    background: "rgba(255, 255, 255, 0.05)", color: "#64748b",
    padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontStyle: "italic",
  },
  jobStatus: {
    padding: "6px 12px", borderRadius: "8px", border: "2px solid",
    fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0,
  },
  jobDetails: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" },
  jobDetail: { fontSize: "14px", color: "#cbd5e1", margin: 0, lineHeight: "1.5" },
  actionBtn: {
    width: "100%", padding: "14px", color: "white",
    border: "none", borderRadius: "12px",
    fontSize: "14px", fontWeight: 700, cursor: "pointer", transition: "all 0.3s ease",
  },
  emptyBox: {
    background: "rgba(30, 41, 59, 0.4)", padding: "48px 24px", textAlign: "center",
    borderRadius: "16px", color: "#94a3b8", border: "2px dashed rgba(255, 255, 255, 0.1)",
  },
  profilePage: {
    textAlign: "center", background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)",
    padding: "30px 20px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  avatarLarge: { fontSize: "60px", marginBottom: "12px" },
  profileName: { fontSize: "20px", fontWeight: 800, color: "#f1f5f9", margin: "0 0 4px" },
  userEmail: { color: "#94a3b8", margin: "0 0 20px", fontSize: "14px" },
  profileInfo: { textAlign: "left", margin: "20px 0" },
  infoRow: {
    display: "flex", justifyContent: "space-between",
    padding: "12px 0", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", fontSize: "14px",
  },
  infoLabel: { fontWeight: 600, color: "#94a3b8" },
  infoValue: { color: "#f1f5f9", fontWeight: 500 },
  servicesDisplay: { display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "flex-end" },
  serviceBadge: {
    background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", border: "1px solid rgba(59, 130, 246, 0.3)",
    padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
  },
  editBtn: {
    marginTop: "20px", width: "100%", padding: "12px",
    borderRadius: "8px", border: "none",
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#0f172a", fontWeight: 700, cursor: "pointer",
  },
  cancelBtn: {
    flex: 1, padding: "10px", borderRadius: "6px",
    border: "1px solid rgba(255, 255, 255, 0.08)", background: "rgba(255,255,255,0.02)",
    color: "#94a3b8", fontWeight: 600, cursor: "pointer",
  },
  formLabel: { fontSize: "13px", fontWeight: 700, color: "#cbd5e1", marginBottom: "2px" },
  formInput: {
    width: "100%", padding: "10px 12px", borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.08)", fontSize: "14px",
    color: "white", background: "rgba(15, 23, 42, 0.8)", boxSizing: "border-box",
  },
  earningsCard: {
    background: "linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.05) 100%)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    color: "white", borderRadius: "20px",
    padding: "40px 24px", textAlign: "center", marginBottom: "28px",
    boxShadow: "0 8px 24px rgba(34, 197, 94, 0.1)",
  },
  earningsLabel: { fontSize: "15px", opacity: 0.95, margin: "0 0 12px", fontWeight: 600, color: "#94a3b8" },
  earningsAmount: { fontSize: "42px", fontWeight: 800, margin: 0, letterSpacing: "-2px", color: "#22c55e" },
  earningsList: { display: "flex", flexDirection: "column", gap: "16px" },
  earningsRow: {
    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)", padding: "20px", borderRadius: "16px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  earningService: { fontSize: "15px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 6px" },
  earningDate: { fontSize: "13px", color: "#94a3b8", margin: "0 0 4px" },
  earningAmount: { fontSize: "18px", fontWeight: 800, color: "#22c55e", whiteSpace: "nowrap", letterSpacing: "-0.5px" },
  profileSection: {
    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    marginBottom: "20px",
  },
  portfolioGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },
  portfolioItem: {
    position: "relative",
    aspectRatio: "1",
    borderRadius: "8px",
    overflow: "hidden",
  },
  portfolioImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  deleteBtn: {
    position: "absolute",
    top: "4px",
    right: "4px",
    background: "rgba(239, 68, 68, 0.9)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyPortfolio: {
    background: "rgba(15, 23, 42, 0.5)",
    padding: "40px",
    borderRadius: "8px",
    textAlign: "center",
    color: "#94a3b8",
    border: "2px dashed rgba(255, 255, 255, 0.1)",
  },
  uploadSection: {
    marginTop: "16px",
  },
  uploadBtn: {
    display: "inline-block",
    padding: "10px 20px",
    background: "#3b82f6",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    border: "none",
    transition: "all 0.3s ease",
  },
  fieldGroup: {
    marginBottom: "16px",
  },
  fieldLabel: {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    color: "#cbd5e1",
    marginBottom: "6px",
  },
  fieldInput: {
    width: "100%",
    padding: "10px 12px",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "8px",
    color: "white",
    fontSize: "14px",
  },
  textareaInput: {
    width: "100%",
    padding: "10px 12px",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "8px",
    color: "white",
    fontSize: "14px",
    minHeight: "80px",
    resize: "vertical",
    fontFamily: "inherit",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#cbd5e1",
    cursor: "pointer",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
  },
  saveBtn: {
    width: "100%",
    padding: "14px",
    background: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "20px",
    fontSize: "16px",
  },
};

const mobileCss = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
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
  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
  .job-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }
  .action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  }
`;