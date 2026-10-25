import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import UserProfileEditor from "../features/profile/UserProfileEditor";
import API from "../api/api";

export default function Settings() {
  const navigate = useNavigate();
  const { user, token, logout, login } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "security" | "notifications"

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Notification Preferences State (saved in localStorage for persistence)
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("axx_notification_preferences");
      return saved
        ? JSON.parse(saved)
        : {
            emailInquiries: true,
            emailDigest: true,
            smsAlerts: false,
            marketingUpdates: false,
          };
    } catch {
      return {
        emailInquiries: true,
        emailDigest: true,
        smsAlerts: false,
        marketingUpdates: false,
      };
    }
  });
  const [notifSuccess, setNotifSuccess] = useState("");

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordError("");
    setPasswordSuccess("");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await API.post("/profile/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordSuccess(res.data?.message || "Password updated successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update password. Please check your current password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleToggleNotification = (key) => {
    setNotifications((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem("axx_notification_preferences", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      setNotifSuccess("Preferences saved!");
      setTimeout(() => setNotifSuccess(""), 2500);
      return next;
    });
  };

  return (
    <div style={styles.page}>
      <style>{css}</style>

      <div style={styles.container}>
        {/* Header Bar */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <button style={styles.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back</span>
            </button>
            <div>
              <h1 style={styles.title}>Account Settings</h1>
              <p style={styles.subtitle}>
                Manage your personal profile, security credentials, and workspace preferences.
              </p>
            </div>
          </div>

          <div style={styles.headerRight}>
            <button
              style={styles.logoutBtn}
              onClick={() => {
                if (logout) logout("/user-login");
                else window.location.href = "/user-login";
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={styles.tabsTrack}>
          <button
            onClick={() => setActiveTab("profile")}
            style={{
              ...styles.tabBtn,
              ...(activeTab === "profile" ? styles.tabBtnActive : {}),
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Profile Information</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            style={{
              ...styles.tabBtn,
              ...(activeTab === "security" ? styles.tabBtnActive : {}),
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>Password &amp; Security</span>
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            style={{
              ...styles.tabBtn,
              ...(activeTab === "notifications" ? styles.tabBtnActive : {}),
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span>Notifications</span>
          </button>
        </div>

        {/* TAB 1: PROFILE INFORMATION */}
        {activeTab === "profile" && (
          <div style={styles.cardSection}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Profile Details</h2>
              <p style={styles.cardSubtitle}>
                Update your contact details, photo, and primary county of operation.
              </p>
            </div>

            <UserProfileEditor
              token={token}
              user={user}
              accentColor="#fbbf24"
              onUpdated={(updatedUser) => {
                if (updatedUser) login(token, updatedUser);
              }}
            />
          </div>
        )}

        {/* TAB 2: SECURITY & PASSWORD */}
        {activeTab === "security" && (
          <div style={styles.cardSection}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Change Password</h2>
              <p style={styles.cardSubtitle}>
                Ensure your account stays secure by using a strong password with letters and numbers.
              </p>
            </div>

            {passwordError && <div style={styles.errorAlert}>{passwordError}</div>}
            {passwordSuccess && <div style={styles.successAlert}>{passwordSuccess}</div>}

            <form onSubmit={handlePasswordSubmit} style={styles.formGrid}>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Min 6 characters"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-type new password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  style={styles.input}
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  style={styles.saveBtn}
                >
                  {passwordLoading ? "Updating Password..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: NOTIFICATION PREFERENCES */}
        {activeTab === "notifications" && (
          <div style={styles.cardSection}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Communication Preferences</h2>
              <p style={styles.cardSubtitle}>
                Choose what updates you want to receive across email and mobile channels.
              </p>
            </div>

            {notifSuccess && <div style={styles.successAlert}>{notifSuccess}</div>}

            <div style={styles.notifList}>
              <div style={styles.notifRow}>
                <div>
                  <h4 style={styles.notifTitle}>Client Inquiry Alerts</h4>
                  <p style={styles.notifDesc}>Receive immediate email alerts when tenants or buyers contact you.</p>
                </div>
                <label style={styles.switch}>
                  <input
                    type="checkbox"
                    checked={notifications.emailInquiries}
                    onChange={() => handleToggleNotification("emailInquiries")}
                  />
                  <span style={styles.slider}></span>
                </label>
              </div>

              <div style={styles.notifRow}>
                <div>
                  <h4 style={styles.notifTitle}>Weekly Digest</h4>
                  <p style={styles.notifDesc}>A weekly overview of your views, active listings, and inquiries.</p>
                </div>
                <label style={styles.switch}>
                  <input
                    type="checkbox"
                    checked={notifications.emailDigest}
                    onChange={() => handleToggleNotification("emailDigest")}
                  />
                  <span style={styles.slider}></span>
                </label>
              </div>

              <div style={styles.notifRow}>
                <div>
                  <h4 style={styles.notifTitle}>SMS Alerts</h4>
                  <p style={styles.notifDesc}>Receive instant SMS notifications for urgent booking confirmations.</p>
                </div>
                <label style={styles.switch}>
                  <input
                    type="checkbox"
                    checked={notifications.smsAlerts}
                    onChange={() => handleToggleNotification("smsAlerts")}
                  />
                  <span style={styles.slider}></span>
                </label>
              </div>

              <div style={styles.notifRow}>
                <div>
                  <h4 style={styles.notifTitle}>Product Updates &amp; Tips</h4>
                  <p style={styles.notifDesc}>Helpful feature announcements and real estate guides in Kenya.</p>
                </div>
                <label style={styles.switch}>
                  <input
                    type="checkbox"
                    checked={notifications.marketingUpdates}
                    onChange={() => handleToggleNotification("marketingUpdates")}
                  />
                  <span style={styles.slider}></span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#080c14",
    color: "#f8fafc",
    fontFamily: "'DM Sans', sans-serif",
    padding: "32px 20px 60px",
  },
  container: {
    maxWidth: "880px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "30px",
    gap: "16px",
    flexWrap: "wrap",
  },
  headerLeft: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  title: {
    margin: 0,
    fontSize: "26px",
    fontWeight: 800,
    color: "#f8fafc",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    margin: "6px 0 0 0",
    fontSize: "14px",
    color: "#94a3b8",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
  },
  logoutBtn: {
    padding: "9px 18px",
    background: "rgba(239, 68, 68, 0.12)",
    color: "#fca5a5",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  tabsTrack: {
    display: "flex",
    gap: "8px",
    background: "rgba(15, 23, 42, 0.6)",
    padding: "6px",
    borderRadius: "14px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    marginBottom: "28px",
    overflowX: "auto",
  },
  tabBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    background: "transparent",
    border: "none",
    borderRadius: "10px",
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.2s",
  },
  tabBtnActive: {
    background: "rgba(251, 191, 36, 0.15)",
    color: "#fbbf24",
    border: "1px solid rgba(251, 191, 36, 0.3)",
  },
  cardSection: {
    background: "rgba(15, 23, 42, 0.75)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "18px",
    padding: "32px",
    backdropFilter: "blur(12px)",
  },
  cardHeader: {
    marginBottom: "24px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
    paddingBottom: "18px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 800,
    color: "#f8fafc",
  },
  cardSubtitle: {
    margin: "6px 0 0 0",
    fontSize: "14px",
    color: "#94a3b8",
  },
  formGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    maxWidth: "480px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  fieldLabel: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#cbd5e1",
  },
  input: {
    padding: "12px 16px",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "10px",
    color: "#f8fafc",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  saveBtn: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#0f172a",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(251, 191, 36, 0.25)",
    transition: "transform 0.2s",
  },
  errorAlert: {
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.35)",
    color: "#fca5a5",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    marginBottom: "18px",
  },
  successAlert: {
    background: "rgba(16, 185, 129, 0.15)",
    border: "1px solid rgba(16, 185, 129, 0.35)",
    color: "#6ee7b7",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    marginBottom: "18px",
  },
  notifList: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  notifRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 0",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    gap: "20px",
  },
  notifTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 700,
    color: "#f8fafc",
  },
  notifDesc: {
    margin: "4px 0 0 0",
    fontSize: "13px",
    color: "#94a3b8",
  },
  switch: {
    position: "relative",
    display: "inline-block",
    width: "44px",
    height: "24px",
    flexShrink: 0,
  },
  slider: {
    position: "absolute",
    cursor: "pointer",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: "24px",
    transition: "0.3s",
  },
};

const css = `
  input:focus { border-color: #fbbf24 !important; outline: none; }
  .switch input { opacity: 0; width: 0; height: 0; }
  .switch input:checked + span { background-color: #fbbf24; }
  .switch span:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    border-radius: 50%;
    transition: 0.3s;
  }
  .switch input:checked + span:before {
    transform: translateX(20px);
    background-color: #0f172a;
  }
`;
