import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ProfileAvatar } from "../features/profile";
import { fetchUserProfile } from "../api/profile";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

export default function ProfilePage() {
  const { token, user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    (async () => {
      try {
        setLoading(true);
        const data = await fetchUserProfile(token);
        if (data) {
          setProfile(data);
          updateUser(data);
        }
      } catch (err) {
        console.error("Profile load error:", err);
        setError("Unable to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, navigate, updateUser]);

  const getRoleBadge = (role) => {
    const badges = {
      user: { label: "User", color: "#3b82f6" },
      landlord: { label: "Landlord", color: "#22c55e" },
      mover: { label: "Mover", color: "#f97316" },
      seller: { label: "Seller", color: "#8b5cf6" },
      admin: { label: "Admin", color: "#ef4444" },
    };
    return badges[role] || badges.user;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <style>{css}</style>
        <div style={styles.loadingState}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Loading profile...</p>
        </div>
      </div>
    );
  }

  const roleBadge = getRoleBadge(profile?.role);

  return (
    <div style={styles.container}>
      <style>{css}</style>

      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <div>
          <h1 style={styles.title}>My Profile</h1>
          <p style={styles.subtitle}>Manage your account information</p>
        </div>
      </div>

      {error && <div style={styles.errorBanner}>{error}</div>}

      <div style={styles.content}>
        {/* Profile Card */}
        <div style={styles.profileCard}>
          <div style={styles.profileTop}>
            <ProfileAvatar user={profile} size={100} />
            <div style={styles.profileInfo}>
              <h2 style={styles.profileName}>{profile?.name || "User"}</h2>
              <p style={styles.profileEmail}>{profile?.email}</p>
              <span style={{ ...styles.roleBadge, background: `${roleBadge.color}22`, color: roleBadge.color, border: `1px solid ${roleBadge.color}44` }}>
                {roleBadge.label}
              </span>
            </div>
          </div>

          <div style={styles.profileDetails}>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Phone</span>
              <span style={styles.detailValue}>{profile?.phone || "Not set"}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>County</span>
              <span style={styles.detailValue}>{profile?.county || "Not set"}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Email Verified</span>
              <span style={{ ...styles.detailValue, color: profile?.isEmailVerified ? "#22c55e" : "#ef4444" }}>
                {profile?.isEmailVerified ? "Verified" : "Not Verified"}
              </span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Member Since</span>
              <span style={styles.detailValue}>
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" }) : "N/A"}
              </span>
            </div>
          </div>

          <Link to="/settings" style={styles.editBtn}>Edit Profile</Link>
        </div>

        {/* Verification Badges Section */}
        <div style={styles.badgeSection}>
          <h3 style={styles.sectionTitle}>🏅 Verification Badges</h3>
          {profile?.verificationBadges && profile.verificationBadges.length > 0 ? (
            <div style={styles.badgeGrid}>
              {profile.verificationBadges.map((badgeId) => (
                <div key={badgeId} style={styles.badgeCard}>
                  <img
                    src={`/${badgeId.replace(/_/g, ' ')}.png`}
                    alt={badgeId}
                    style={styles.badgeImage}
                  />
                  <div style={styles.badgeName}>
                    {badgeId.replace(/_/g, ' ').toUpperCase()}
                  </div>
                  <div style={styles.badgeStatus}>✓ Active</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.noBadges}>
              <span style={styles.noBadgesIcon}>🏅</span>
              <div style={styles.noBadgesText}>No verification badges yet</div>
              <div style={styles.noBadgesSubtext}>
                Complete payments and get verified by admins to earn badges
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div style={styles.statsGrid}>
          <Link to="/wallet" style={styles.statCard}>
            <div style={styles.statIcon}>💰</div>
            <div style={styles.statValue}>KES {(profile?.walletBalance || 0).toLocaleString()}</div>
            <div style={styles.statLabel}>Wallet Balance</div>
          </Link>
          <Link to="/payment-history" style={styles.statCard}>
            <div style={styles.statIcon}>💳</div>
            <div style={styles.statValue}>{profile?.paymentHistory?.length || 0}</div>
            <div style={styles.statLabel}>Transactions</div>
          </Link>
          <Link to="/saved" style={styles.statCard}>
            <div style={styles.statIcon}>❤️</div>
            <div style={styles.statValue}>View</div>
            <div style={styles.statLabel}>Saved Listings</div>
          </Link>
          <Link to="/messages" style={styles.statCard}>
            <div style={styles.statIcon}>💬</div>
            <div style={styles.statValue}>View</div>
            <div style={styles.statLabel}>Messages</div>
          </Link>
        </div>

        {/* Quick Links */}
        <div style={styles.quickLinks}>
          <h3 style={styles.sectionTitle}>Quick Links</h3>
          <div style={styles.linksGrid}>
            <Link to="/settings" style={styles.linkCard}>
              <span style={styles.linkIcon}>⚙️</span>
              <span style={styles.linkText}>Account Settings</span>
            </Link>
            <Link to="/notifications" style={styles.linkCard}>
              <span style={styles.linkIcon}>🔔</span>
              <span style={styles.linkText}>Notifications</span>
            </Link>
            <Link to="/wallet" style={styles.linkCard}>
              <span style={styles.linkIcon}>💰</span>
              <span style={styles.linkText}>Wallet</span>
            </Link>
            <Link to="/upload" style={styles.linkCard}>
              <span style={styles.linkIcon}>📤</span>
              <span style={styles.linkText}>Upload Property</span>
            </Link>
          </div>
        </div>

        {/* Mover Info (if mover role) */}
        {profile?.role === "mover" && (
          <div style={styles.moverSection}>
            <h3 style={styles.sectionTitle}>Mover Details</h3>
            <div style={styles.profileDetails}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Vehicle Type</span>
                <span style={styles.detailValue}>{profile?.vehicleType || "Not set"}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Experience</span>
                <span style={styles.detailValue}>{profile?.experienceYears || 0} years</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Status</span>
                <span style={{ ...styles.detailValue, color: profile?.isApproved ? "#22c55e" : "#fbbf24" }}>
                  {profile?.isApproved ? "Approved" : profile?.status || "Pending"}
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Services</span>
                <span style={styles.detailValue}>{profile?.services?.join(", ") || "None"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "20px",
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    maxWidth: "900px",
    margin: "0 auto 30px",
  },
  backBtn: {
    padding: "10px 20px",
    background: "rgba(255,255,255,0.1)",
    color: "#f1f5f9",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: 600,
  },
  title: { fontSize: "2rem", color: "#f1f5f9", margin: 0, fontWeight: 700 },
  subtitle: { color: "#94a3b8", margin: "4px 0 0", fontSize: "1rem" },
  loadingState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" },
  spinner: { width: 50, height: 50, border: "4px solid rgba(251,191,36,0.2)", borderTop: "4px solid #fbbf24", borderRadius: "50%", animation: "spin 1s linear infinite" },
  loadingText: { color: "#94a3b8", marginTop: 20, fontSize: "1rem" },
  errorBanner: { maxWidth: 900, margin: "0 auto 20px", padding: "12px 20px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, color: "#ef4444", fontSize: "0.95rem" },
  content: { maxWidth: 900, margin: "0 auto" },

  profileCard: {
    background: "rgba(30,41,59,0.8)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 30,
    marginBottom: 24,
  },
  profileTop: { display: "flex", alignItems: "center", gap: 24, marginBottom: 24, flexWrap: "wrap" },
  profileInfo: { flex: 1 },
  profileName: { color: "#f1f5f9", fontSize: "1.5rem", margin: "0 0 4px", fontWeight: 700 },
  profileEmail: { color: "#94a3b8", margin: "0 0 10px", fontSize: "0.95rem" },
  roleBadge: { display: "inline-block", padding: "4px 14px", borderRadius: 20, fontSize: "0.8rem", fontWeight: 700, textTransform: "capitalize" },

  profileDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
    marginBottom: 20,
  },
  detailItem: { padding: 12, background: "rgba(15,23,42,0.5)", borderRadius: 10 },
  detailLabel: { display: "block", color: "#94a3b8", fontSize: "0.8rem", marginBottom: 4, fontWeight: 500 },
  detailValue: { display: "block", color: "#f1f5f9", fontSize: "0.95rem", fontWeight: 600 },

  editBtn: {
    display: "inline-block",
    padding: "12px 28px",
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#1f2937",
    border: "none",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: "0.95rem",
    textDecoration: "none",
    cursor: "pointer",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    background: "rgba(30,41,59,0.8)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 20,
    textAlign: "center",
    textDecoration: "none",
    transition: "all 0.2s",
    cursor: "pointer",
  },
  statIcon: { fontSize: "2rem", marginBottom: 8 },
  statValue: { color: "#fbbf24", fontSize: "1.3rem", fontWeight: 700, marginBottom: 4 },
  statLabel: { color: "#94a3b8", fontSize: "0.85rem" },

  quickLinks: {
    background: "rgba(30,41,59,0.8)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  sectionTitle: { color: "#f1f5f9", fontSize: "1.2rem", margin: "0 0 16px", fontWeight: 700 },
  linksGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },
  linkCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 18px",
    background: "rgba(15,23,42,0.5)",
    borderRadius: 10,
    textDecoration: "none",
    transition: "all 0.2s",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  linkIcon: { fontSize: "1.3rem" },
  linkText: { color: "#f1f5f9", fontSize: "0.95rem", fontWeight: 500 },

  moverSection: {
    background: "rgba(30,41,59,0.8)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  badgeSection: {
    background: "rgba(30,41,59,0.8)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  badgeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: 16,
  },
  badgeCard: {
    background: "rgba(15,23,42,0.5)",
    border: "1px solid rgba(251,191,36,0.2)",
    borderRadius: 12,
    padding: 16,
    textAlign: "center",
    transition: "all 0.2s",
  },
  badgeImage: {
    width: 64,
    height: 64,
    objectFit: "contain",
    marginBottom: 12,
  },
  badgeName: {
    color: "#f1f5f9",
    fontSize: "0.85rem",
    fontWeight: 600,
    marginBottom: 6,
  },
  badgeStatus: {
    color: "#22c55e",
    fontSize: "0.75rem",
    fontWeight: 700,
  },
  noBadges: {
    textAlign: "center",
    padding: "40px 20px",
    background: "rgba(15,23,42,0.3)",
    borderRadius: 12,
    border: "1px dashed rgba(255,255,255,0.1)",
  },
  noBadgesIcon: {
    fontSize: "3rem",
    marginBottom: 12,
    display: "block",
  },
  noBadgesText: {
    color: "#f1f5f9",
    fontSize: "1rem",
    fontWeight: 600,
    marginBottom: 6,
  },
  noBadgesSubtext: {
    color: "#94a3b8",
    fontSize: "0.85rem",
  },
};

const css = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
