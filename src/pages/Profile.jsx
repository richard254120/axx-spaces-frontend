import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { fetchUserProfile, updateUserProfile, buildProfileFormData } from "../api/profile";
import ProfileAvatar from "../features/profile/ProfileAvatar";
import API from "../api/api";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "40px 20px",
    color: "#f1f5f9",
    fontFamily: "'DM Sans', sans-serif",
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "40px",
    paddingBottom: "20px",
    borderBottom: "2px solid #fbbf24",
  },
  title: {
    fontSize: "36px",
    fontWeight: 800,
    color: "#fbbf24",
    margin: "0 0 10px 0",
  },
  subtitle: {
    fontSize: "16px",
    color: "#94a3b8",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "24px",
  },
  card: {
    background: "rgba(30, 41, 59, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "16px",
    padding: "28px",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#fbbf24",
    marginBottom: "20px",
    paddingBottom: "12px",
    borderBottom: "1px solid rgba(251, 191, 36, 0.2)",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  infoItem: {
    marginBottom: "12px",
  },
  infoLabel: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: "4px",
  },
  infoValue: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#f1f5f9",
  },
  walletCard: {
    background: "linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)",
    border: "1px solid rgba(251, 191, 36, 0.3)",
  },
  walletBalance: {
    fontSize: "48px",
    fontWeight: 800,
    color: "#fbbf24",
    marginBottom: "8px",
  },
  walletLabel: {
    fontSize: "14px",
    color: "#94a3b8",
    marginBottom: "20px",
  },
  button: {
    padding: "12px 24px",
    background: "#fbbf24",
    color: "#0f172a",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    marginRight: "10px",
    marginBottom: "10px",
  },
  buttonSecondary: {
    background: "rgba(255, 255, 255, 0.1)",
    color: "#f1f5f9",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  loading: {
    textAlign: "center",
    padding: "60px 20px",
    fontSize: "18px",
    color: "#94a3b8",
  },
  error: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#fca5a5",
    padding: "16px",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  roleBadge: {
    display: "inline-block",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
    background: "rgba(59, 130, 246, 0.2)",
    color: "#60a5fa",
    border: "1px solid rgba(59, 130, 246, 0.3)",
  },
  verifiedBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 700,
    background: "rgba(34, 197, 94, 0.2)",
    color: "#22c55e",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    marginLeft: "10px",
  },
  badgesSection: {
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  },
  badgesTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#94a3b8",
    marginBottom: "12px",
    textTransform: "uppercase",
  },
  badgesContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  badgeItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderRadius: "8px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  badgeImage: {
    width: "32px",
    height: "32px",
    objectFit: "contain",
  },
  badgeName: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#f1f5f9",
  },
  badgeDate: {
    fontSize: "10px",
    color: "#94a3b8",
  },
  noBadges: {
    fontSize: "13px",
    color: "#64748b",
    fontStyle: "italic",
  },
};

export default function Profile() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    loadProfile();
  }, [token, navigate]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await fetchUserProfile(token);
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>⏳ Loading profile...</div>
      </div>
    );
  }

  const displayProfile = profile || user;

  const badgeTypes = {
    premium_verified: { label: "Premium Verified", icon: "⭐", image: "Premium Verified.png" },
    student_verified: { label: "Student Verified", icon: "🎓", image: "Student Verified.png" },
    business_verified: { label: "Business Verified", icon: "🏢", image: "Business Verified.png" },
    identity_verified: { label: "Identity Verified", icon: "🪪", image: "Identity Verified.png" },
    location_verified: { label: "Location Verified", icon: "📍", image: "Locationn Verified.png" },
    online_verified: { label: "Online Verified", icon: "🌐", image: "Online Verified.png" },
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>My Profile</h1>
          <p style={styles.subtitle}>Manage your account information and preferences</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.grid}>
          {/* Profile Info Card */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Profile Information</h2>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "24px", gap: "20px" }}>
              <ProfileAvatar user={displayProfile} size={80} />
              <div>
                <div style={{ fontSize: "24px", fontWeight: 700, color: "#f1f5f9", marginBottom: "8px" }}>
                  {displayProfile?.name}
                  {displayProfile?.isEmailVerified && (
                    <span style={styles.verifiedBadge}>✓ Verified</span>
                  )}
                </div>
                <span style={styles.roleBadge}>{displayProfile?.role}</span>
              </div>
            </div>

            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Email</div>
                <div style={styles.infoValue}>{displayProfile?.email}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Phone</div>
                <div style={styles.infoValue}>{displayProfile?.phone || "Not set"}</div>
              </div>
              {displayProfile?.county && (
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>County</div>
                  <div style={styles.infoValue}>{displayProfile.county}</div>
                </div>
              )}
              {displayProfile?.createdAt && (
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Member Since</div>
                  <div style={styles.infoValue}>
                    {new Date(displayProfile.createdAt).toLocaleDateString("en-KE", {
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: "24px" }}>
              <button style={styles.button} onClick={() => navigate("/settings")}>
                ⚙️ Account Settings
              </button>
              <button style={{ ...styles.button, ...styles.buttonSecondary }} onClick={() => logout("/login")}>
                🚪 Logout
              </button>
            </div>

            {/* Verification Badges Section */}
            <div style={styles.badgesSection}>
              <div style={styles.badgesTitle}>Verification Badges</div>
              {displayProfile?.verificationBadges && displayProfile.verificationBadges.length > 0 ? (
                <div style={styles.badgesContainer}>
                  {displayProfile.verificationBadges.map((badge, index) => {
                    const badgeInfo = badgeTypes[badge.type] || { label: badge.type, icon: "🏅", image: null };
                    return (
                      <div key={index} style={styles.badgeItem}>
                        {badgeInfo.image && (
                          <img
                            src={`/${badgeInfo.image}`}
                            alt={badgeInfo.label}
                            style={styles.badgeImage}
                          />
                        )}
                        <div>
                          <div style={styles.badgeName}>
                            {badgeInfo.icon} {badgeInfo.label}
                          </div>
                          <div style={styles.badgeDate}>
                            Issued: {new Date(badge.verifiedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={styles.noBadges}>No verification badges earned yet</div>
              )}
            </div>
          </div>

          {/* Wallet Card */}
          <div style={{ ...styles.card, ...styles.walletCard }}>
            <h2 style={styles.cardTitle}>AxxWallet Balance</h2>
            <div style={styles.walletBalance}>
              KES {displayProfile?.walletBalance?.toLocaleString() || "0"}
            </div>
            <p style={styles.walletLabel}>Available for bookings and purchases</p>

            <div style={{ marginTop: "24px" }}>
              <button style={styles.button} onClick={() => navigate("/wallet")}>
                💳 View Wallet
              </button>
              <button style={{ ...styles.button, ...styles.buttonSecondary }} onClick={() => navigate("/payment-history")}>
                📊 Payment History
              </button>
            </div>

            {displayProfile?.paymentHistory && displayProfile.paymentHistory.length > 0 && (
              <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(251, 191, 36, 0.2)" }}>
                <div style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "12px" }}>
                  Recent Transactions ({displayProfile.paymentHistory.length})
                </div>
                {displayProfile.paymentHistory.slice(0, 3).map((tx, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px",
                      background: "rgba(15, 23, 42, 0.5)",
                      borderRadius: "8px",
                      marginBottom: "8px",
                      fontSize: "13px",
                    }}
                  >
                    <span style={{ color: "#cbd5e1" }}>{tx.plan || tx.transactionId?.substring(0, 8)}</span>
                    <span style={{ fontWeight: 700, color: tx.status === "success" ? "#22c55e" : "#fbbf24" }}>
                      KES {tx.amount?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Quick Actions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button style={styles.button} onClick={() => navigate("/saved")}>
                ❤️ Saved Listings
              </button>
              <button style={styles.button} onClick={() => navigate("/messages")}>
                💬 Messages
              </button>
              <button style={styles.button} onClick={() => navigate("/notifications")}>
                🔔 Notifications
              </button>
              {displayProfile?.role === "landlord" && (
                <button style={styles.button} onClick={() => navigate("/dashboard")}>
                  📊 Landlord Dashboard
                </button>
              )}
              {displayProfile?.role === "mover" && (
                <button style={styles.button} onClick={() => navigate("/mover-dashboard")}>
                  🚛 Mover Dashboard
                </button>
              )}
              {displayProfile?.role === "seller" && (
                <button style={styles.button} onClick={() => navigate("/seller-dashboard")}>
                  🏪 Seller Dashboard
                </button>
              )}
              <button style={styles.button} onClick={() => {
                const role = displayProfile?.role;
                if (role === "landlord") navigate("/dashboard");
                else if (role === "seller") navigate("/seller-dashboard");
                else if (role === "mover") navigate("/mover-dashboard");
                else navigate("/business-dashboard");
              }}>
                📊 My Workspace Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
