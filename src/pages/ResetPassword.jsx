import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpeg";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

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
      const response = await fetch(`${API_BASE}/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess("✅ Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);

    } catch (err) {
      setError(err.message || "❌ Failed to reset password. Link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>
      <div style={styles.container}>
        <div style={styles.logoSection}>
          <img src={logo} alt="Axx Spaces" style={styles.logo} />
        </div>

        <div style={styles.formBox}>
          <h1 style={styles.title}>🔑 New Password</h1>
          <p style={styles.subtitle}>Enter your new password below</p>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          {!success && (
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
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

              <div style={styles.formGroup}>
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
                  ...styles.submitBtn,
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
    </div>
  );
}

const styles = {
  root: { fontFamily: "'DM Sans', sans-serif", background: "linear-gradient(135deg, #ffffff 0%, #fef3e2 50%, #fef9e7 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
  container: { width: "100%", maxWidth: "450px" },
  logoSection: { textAlign: "center", marginBottom: "30px" },
  logo: { height: "70px", width: "auto" },
  formBox: { background: "white", border: "2px solid #fbbf24", borderRadius: "16px", padding: "40px 32px", boxShadow: "0 10px 40px rgba(0,0,0,0.08)" },
  title: { fontSize: "26px", fontWeight: 800, color: "#1f2937", margin: "0 0 8px", textAlign: "center" },
  subtitle: { fontSize: "14px", color: "#6b7280", margin: "0 0 30px", textAlign: "center" },
  error: { background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", textAlign: "center" },
  success: { background: "#dcfce7", color: "#166534", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "12px", fontWeight: 700, color: "#374151", textTransform: "uppercase" },
  input: { padding: "12px", border: "2px solid #d1d5db", borderRadius: "8px", fontSize: "15px", background: "#f9fafb" },
  submitBtn: { padding: "14px", background: "linear-gradient(135deg, #2427fb 0%, #4d9ffc 100%)", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "16px" },
};

const css = `
  input:focus { outline: none; border-color: #2427fb !important; background: white !important; }
  button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(36, 39, 251, 0.3); }
`;