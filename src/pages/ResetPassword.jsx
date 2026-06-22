import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpeg";
import { COLORS, buttonStyles, inputStyles, pageStyles } from "../styles/theme";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

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
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      setError("❌ Password must contain a mixture of both letters and numbers.");
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
          <img src={logo} alt="Axxspace" style={styles.logo} />
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
                  placeholder="Min. 6 chars, letters & numbers"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  required
                />
                {password && (password.length < 6 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) && (
                  <div style={{ color: "#fca5a5", fontSize: "11px", marginTop: "4px" }}>
                    ⚠️ Password must contain both letters and numbers.
                  </div>
                )}
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
  root: {
    ...pageStyles.dark,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  container: { width: "100%", maxWidth: "450px" },
  logoSection: { textAlign: "center", marginBottom: "30px" },
  logo: { height: "70px", width: "auto", borderRadius: "50%" },
  formBox: {
    background: COLORS.bgLight,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "16px",
    padding: "40px 32px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
  },
  title: { fontSize: "26px", fontWeight: 800, color: COLORS.textLight, margin: "0 0 8px", textAlign: "center" },
  subtitle: { fontSize: "14px", color: COLORS.textMutedLight, margin: "0 0 30px", textAlign: "center" },
  error: { background: "rgba(239, 68, 68, 0.15)", color: "#fca5a5", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", textAlign: "center", border: "1px solid rgba(239, 68, 68, 0.3)" },
  success: { background: "rgba(34, 197, 94, 0.15)", color: "#86efac", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", textAlign: "center", border: "1px solid rgba(34, 197, 94, 0.3)" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "12px", fontWeight: 700, color: COLORS.textMutedLight, textTransform: "uppercase", letterSpacing: "0.5px" },
  input: inputStyles.dark,
  submitBtn: buttonStyles.primary,
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  
  input:focus { 
    outline: none; 
    border-color: ${COLORS.accent} !important; 
    background: rgba(15,23,41,0.9) !important;
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.12);
  }
  
  button:hover:not(:disabled) { 
    transform: translateY(-2px); 
    opacity: 0.9;
  }
`;