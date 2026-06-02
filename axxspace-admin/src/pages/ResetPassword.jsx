import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("❌ Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("❌ Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post(`/auth/reset-password/${token}`, { password });
      const data = response.data;

      setSuccess("✅ Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);

    } catch (err) {
      setError(err.response?.data?.error || "❌ Failed to reset password. Link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🔑 New Password</h1>
        <p style={styles.subtitle}>Enter your new password below</p>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        {!success && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>New Password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                placeholder="Repeat your new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.btn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "⏳ Resetting..." : "🔐 Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "linear-gradient(135deg, #06101f 0%, #0a1428 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: "20px" },
  card: { background: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "48px 40px", width: "100%", maxWidth: "450px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" },
  title: { color: "#fbbf24", fontSize: "26px", fontWeight: 800, margin: "0 0 8px", textAlign: "center" },
  subtitle: { color: "#94a3b8", fontSize: "14px", textAlign: "center", marginBottom: "30px" },
  error: { background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid #ef4444", borderRadius: "8px", padding: "12px", fontSize: "14px", marginBottom: "20px", textAlign: "center" },
  success: { background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid #22c55e", borderRadius: "8px", padding: "12px", fontSize: "14px", marginBottom: "20px", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { color: "#f1f5f9", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" },
  input: { padding: "12px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(30, 41, 59, 0.6)", color: "#f1f5f9", fontSize: "14px", outline: "none" },
  btn: { padding: "14px", background: "#fbbf24", color: "#1f2937", border: "none", borderRadius: "8px", fontWeight: 800, fontSize: "15px", cursor: "pointer" },
};
