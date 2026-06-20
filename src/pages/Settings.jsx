import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
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
    maxWidth: "800px",
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
  card: {
    background: "rgba(30, 41, 59, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "16px",
    padding: "28px",
    marginBottom: "24px",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#fbbf24",
    marginBottom: "20px",
    paddingBottom: "12px",
    borderBottom: "1px solid rgba(251, 191, 36, 0.2)",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    color: "#f1f5f9",
    fontSize: "14px",
    fontFamily: "inherit",
  },
  inputFocus: {
    outline: "none",
    borderColor: "#fbbf24",
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
  },
  buttonSecondary: {
    background: "rgba(255, 255, 255, 0.1)",
    color: "#f1f5f9",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  buttonDanger: {
    background: "rgba(239, 68, 68, 0.2)",
    color: "#fca5a5",
    border: "1px solid rgba(239, 68, 68, 0.3)",
  },
  success: {
    background: "rgba(34, 197, 94, 0.1)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    color: "#86efac",
    padding: "16px",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  error: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#fca5a5",
    padding: "16px",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  info: {
    background: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    color: "#93c5fd",
    padding: "16px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  toggleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 0",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  toggleLabel: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#f1f5f9",
  },
  toggleDesc: {
    fontSize: "13px",
    color: "#94a3b8",
    marginTop: "4px",
  },
  toggleSwitch: {
    position: "relative",
    width: "50px",
    height: "26px",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "13px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  toggleSwitchActive: {
    background: "#fbbf24",
  },
  toggleKnob: {
    position: "absolute",
    top: "3px",
    left: "3px",
    width: "20px",
    height: "20px",
    background: "white",
    borderRadius: "50%",
    transition: "transform 0.2s",
  },
  toggleKnobActive: {
    transform: "translateX(24px)",
  },
};

export default function Settings() {
  const { user, token, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Email change form
  const [emailForm, setEmailForm] = useState({
    newEmail: "",
    password: "",
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setMessage({ type: "success", text: "Password changed successfully" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to change password" });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/change-email", {
        newEmail: emailForm.newEmail,
        password: emailForm.password,
      });
      setMessage({ type: "success", text: "Verification email sent to your new email address" });
      setEmailForm({ newEmail: "", password: "" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to change email" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
    if (!window.confirm("This will permanently delete all your data. Are you absolutely sure?")) {
      return;
    }

    setLoading(true);
    try {
      await API.delete("/auth/account");
      logout("/");
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to delete account" });
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Account Settings</h1>
          <p style={styles.subtitle}>Manage your account preferences and security</p>
        </div>

        {message.text && (
          <div style={styles[message.type]}>{message.text}</div>
        )}

        {/* Change Password */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Change Password</h2>
          <form onSubmit={handlePasswordChange}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Current Password</label>
              <input
                type="password"
                style={styles.input}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>New Password</label>
              <input
                type="password"
                style={styles.input}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm New Password</label>
              <input
                type="password"
                style={styles.input}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>

        {/* Change Email */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Change Email</h2>
          <div style={styles.info}>
            Current email: <strong>{user?.email}</strong>
          </div>
          <form onSubmit={handleEmailChange}>
            <div style={styles.formGroup}>
              <label style={styles.label}>New Email Address</label>
              <input
                type="email"
                style={styles.input}
                value={emailForm.newEmail}
                onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Current Password</label>
              <input
                type="password"
                style={styles.input}
                value={emailForm.password}
                onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Sending..." : "Send Verification Email"}
            </button>
          </form>
        </div>

        {/* Notification Preferences */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Notification Preferences</h2>
          <div style={styles.toggleRow}>
            <div>
              <div style={styles.toggleLabel}>Email Notifications</div>
              <div style={styles.toggleDesc}>Receive updates via email</div>
            </div>
            <div
              style={{ ...styles.toggleSwitch, ...(notifications.email && styles.toggleSwitchActive) }}
              onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
            >
              <div style={{ ...styles.toggleKnob, ...(notifications.email && styles.toggleKnobActive) }} />
            </div>
          </div>
          <div style={styles.toggleRow}>
            <div>
              <div style={styles.toggleLabel}>SMS Notifications</div>
              <div style={styles.toggleDesc}>Receive SMS alerts</div>
            </div>
            <div
              style={{ ...styles.toggleSwitch, ...(notifications.sms && styles.toggleSwitchActive) }}
              onClick={() => setNotifications({ ...notifications, sms: !notifications.sms })}
            >
              <div style={{ ...styles.toggleKnob, ...(notifications.sms && styles.toggleKnobActive) }} />
            </div>
          </div>
          <div style={styles.toggleRow}>
            <div>
              <div style={styles.toggleLabel}>Push Notifications</div>
              <div style={styles.toggleDesc}>Browser push notifications</div>
            </div>
            <div
              style={{ ...styles.toggleSwitch, ...(notifications.push && styles.toggleSwitchActive) }}
              onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
            >
              <div style={{ ...styles.toggleKnob, ...(notifications.push && styles.toggleKnobActive) }} />
            </div>
          </div>
          <div style={styles.toggleRow} style={{ borderBottom: "none" }}>
            <div>
              <div style={styles.toggleLabel}>Marketing Emails</div>
              <div style={styles.toggleDesc}>Receive promotional content</div>
            </div>
            <div
              style={{ ...styles.toggleSwitch, ...(notifications.marketing && styles.toggleSwitchActive) }}
              onClick={() => setNotifications({ ...notifications, marketing: !notifications.marketing })}
            >
              <div style={{ ...styles.toggleKnob, ...(notifications.marketing && styles.toggleKnobActive) }} />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{ ...styles.card, borderColor: "rgba(239, 68, 68, 0.3)" }}>
          <h2 style={{ ...styles.cardTitle, color: "#fca5a5", borderColor: "rgba(239, 68, 68, 0.3)" }}>
            Danger Zone
          </h2>
          <div style={styles.info}>
            These actions are irreversible. Please be certain.
          </div>
          <button
            style={{ ...styles.button, ...styles.buttonDanger }}
            onClick={handleDeleteAccount}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Account"}
          </button>
        </div>

        <div style={{ marginTop: "24px" }}>
          <button style={{ ...styles.button, ...styles.buttonSecondary }} onClick={() => navigate("/profile")}>
            ← Back to Profile
          </button>
        </div>
      </div>
    </div>
  );
}
