import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ProfileAvatar } from "../features/profile";
import { fetchUserProfile, updateUserProfile, buildProfileFormData } from "../api/profile";
import VerificationStatus from "../components/VerificationStatus";
import VerificationHistory from "../components/VerificationHistory";

export default function SettingsPage() {
  const { token, user, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  const [form, setForm] = useState({ name: "", phone: "", county: "", description: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    (async () => {
      try {
        setLoading(true);
        const data = await fetchUserProfile(token);
        if (data) {
          setProfile(data);
          setForm({
            name: data.name || "",
            phone: data.phone || "",
            county: data.county || "",
            description: data.description || "",
          });
        }
      } catch {
        setError("Unable to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, navigate]);

  const onPickPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please choose an image file."); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) { setError("Name and phone are required."); return; }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const fd = buildProfileFormData({
        name: form.name.trim(),
        phone: form.phone.trim(),
        county: form.county,
        description: form.description,
        avatarFile,
      });
      const res = await updateUserProfile(token, fd);
      const updated = res.data?.user;
      if (updated) {
        setProfile(updated);
        login(token, updated);
        setAvatarFile(null);
        setAvatarPreview(null);
      }
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (passwordForm.newPassword.length < 6) { setPasswordError("Password must be at least 6 characters."); return; }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { setPasswordError("Passwords do not match."); return; }
    setChangingPassword(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to change password");
      setPasswordSuccess("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    if (!window.confirm("This will permanently delete all your data. Type OK to confirm.")) return;
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";
      const res = await fetch(`${API_BASE}/auth/delete-account`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        logout("/");
      }
    } catch {
      setError("Failed to delete account. Please try again.");
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "verification", label: "Verification", icon: "✓" },
    { id: "security", label: "Security", icon: "🔒" },
    { id: "danger", label: "Danger Zone", icon: "⚠️" },
  ];

  if (loading) {
    return (
      <div style={styles.container}>
        <style>{css}</style>
        <div style={styles.loadingState}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Loading settings...</p>
        </div>
      </div>
    );
  }

  const displayUser = avatarPreview ? { ...profile, profileImage: avatarPreview } : profile;

  return (
    <div style={styles.container}>
      <style>{css}</style>

      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <div>
          <h1 style={styles.title}>Settings</h1>
          <p style={styles.subtitle}>Manage your account preferences</p>
        </div>
      </div>

      <div style={styles.layout}>
        {/* Sidebar Tabs */}
        <div style={styles.sidebar}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              style={{ ...styles.tabBtn, ...(activeTab === tab.id ? styles.tabBtnActive : {}) }}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={styles.main}>
          {error && <div style={styles.errorBanner}>{error}</div>}
          {success && <div style={styles.successBanner}>{success}</div>}

          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} style={styles.section}>
              <h2 style={styles.sectionTitle}>Edit Profile</h2>

              <div style={styles.avatarSection}>
                <ProfileAvatar user={displayUser} size={80} />
                <div>
                  <button type="button" style={styles.uploadBtn} onClick={() => fileRef.current?.click()}>
                    Change Photo
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onPickPhoto} />
                  <p style={styles.uploadHint}>JPG, PNG, or WebP. Max 5MB.</p>
                </div>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Name</label>
                  <input style={styles.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone</label>
                  <input style={styles.input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>County</label>
                  <input style={styles.input} value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })} placeholder="Your county" />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Bio / Description</label>
                <textarea
                  style={{ ...styles.input, minHeight: 100, resize: "vertical" }}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <button type="submit" style={styles.saveBtn} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          )}

          {activeTab === "security" && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Change Password</h2>
              {profile?.isGoogleUser && (
                <div style={styles.infoBanner}>
                  You signed in with Google. Password changes are managed through your Google account.
                </div>
              )}
              {!profile?.isGoogleUser && (
                <form onSubmit={handleChangePassword}>
                  {passwordError && <div style={styles.errorBanner}>{passwordError}</div>}
                  {passwordSuccess && <div style={styles.successBanner}>{passwordSuccess}</div>}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Current Password</label>
                    <input
                      style={styles.input}
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>New Password</label>
                    <input
                      style={styles.input}
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter new password (min 6 chars)"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Confirm New Password</label>
                    <input
                      style={styles.input}
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button type="submit" style={styles.saveBtn} disabled={changingPassword}>
                    {changingPassword ? "Changing..." : "Change Password"}
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === "verification" && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Identity Verification</h2>
              <VerificationStatus />
              <VerificationHistory />
              {profile?.verificationStatus === 'approved' && (
                <div style={styles.successBanner}>
                  ✓ Your verification has been approved! You are now a verified user.
                </div>
              )}
              {profile?.verificationStatus === 'rejected' && (
                <div style={styles.errorBanner}>
                  ✕ Your verification was rejected. Please review the rejection reason and resubmit.
                </div>
              )}
            </div>
          )}

          {activeTab === "danger" && (
            <div style={styles.section}>
              <h2 style={{ ...styles.sectionTitle, color: "#ef4444" }}>Danger Zone</h2>
              <div style={styles.dangerCard}>
                <div>
                  <h3 style={styles.dangerTitle}>Delete Account</h3>
                  <p style={styles.dangerText}>
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <button style={styles.deleteBtn} onClick={handleDeleteAccount}>
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
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
    display: "flex", alignItems: "center", gap: 20,
    maxWidth: 1000, margin: "0 auto 30px",
  },
  backBtn: {
    padding: "10px 20px", background: "rgba(255,255,255,0.1)", color: "#f1f5f9",
    border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, cursor: "pointer",
    fontSize: "0.95rem", fontWeight: 600,
  },
  title: { fontSize: "2rem", color: "#f1f5f9", margin: 0, fontWeight: 700 },
  subtitle: { color: "#94a3b8", margin: "4px 0 0", fontSize: "1rem" },
  loadingState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" },
  spinner: { width: 50, height: 50, border: "4px solid rgba(251,191,36,0.2)", borderTop: "4px solid #fbbf24", borderRadius: "50%", animation: "spin 1s linear infinite" },
  loadingText: { color: "#94a3b8", marginTop: 20, fontSize: "1rem" },

  layout: {
    maxWidth: 1000, margin: "0 auto", display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap",
  },
  sidebar: {
    width: 220, display: "flex", flexDirection: "column", gap: 8,
    background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12, padding: 12,
  },
  tabBtn: {
    display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
    background: "transparent", color: "#94a3b8", border: "none", borderRadius: 8,
    cursor: "pointer", fontSize: "0.95rem", fontWeight: 500, textAlign: "left", width: "100%",
  },
  tabBtnActive: { background: "rgba(251,191,36,0.15)", color: "#fbbf24" },

  main: { flex: 1, minWidth: 0 },

  errorBanner: { padding: "12px 20px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, color: "#ef4444", fontSize: "0.95rem", marginBottom: 16 },
  successBanner: { padding: "12px 20px", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, color: "#22c55e", fontSize: "0.95rem", marginBottom: 16 },
  infoBanner: { padding: "12px 20px", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 8, color: "#3b82f6", fontSize: "0.95rem", marginBottom: 16 },

  section: {
    background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16, padding: 30,
  },
  sectionTitle: { color: "#f1f5f9", fontSize: "1.3rem", margin: "0 0 24px", fontWeight: 700 },

  avatarSection: { display: "flex", alignItems: "center", gap: 20, marginBottom: 24 },
  uploadBtn: {
    padding: "8px 18px", background: "rgba(251,191,36,0.15)", color: "#fbbf24",
    border: "1px solid rgba(251,191,36,0.3)", borderRadius: 8, cursor: "pointer",
    fontSize: "0.9rem", fontWeight: 600,
  },
  uploadHint: { color: "#64748b", fontSize: "0.8rem", margin: "6px 0 0" },

  formGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 16,
  },
  formGroup: { marginBottom: 16 },
  label: { display: "block", color: "#94a3b8", fontSize: "0.85rem", marginBottom: 6, fontWeight: 600 },
  input: {
    width: "100%", padding: "12px 16px", background: "rgba(15,23,42,0.8)",
    border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#f1f5f9",
    fontSize: "0.95rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  },

  saveBtn: {
    padding: "12px 28px", background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#1f2937", border: "none", borderRadius: 8, fontWeight: 700, fontSize: "0.95rem",
    cursor: "pointer", marginTop: 8,
  },

  dangerCard: {
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20,
    padding: 20, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: 12, flexWrap: "wrap",
  },
  dangerTitle: { color: "#f1f5f9", margin: "0 0 8px", fontSize: "1.1rem", fontWeight: 600 },
  dangerText: { color: "#94a3b8", margin: 0, fontSize: "0.9rem", lineHeight: 1.5 },
  deleteBtn: {
    padding: "12px 24px", background: "#ef4444", color: "white", border: "none",
    borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: "0.95rem", whiteSpace: "nowrap",
  },
};

const css = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @media (max-width: 700px) {
    .settings-layout { flex-direction: column !important; }
  }
`;
