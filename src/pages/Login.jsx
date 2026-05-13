import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo.jpeg";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.email || !formData.password) {
      setError("❌ Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      login(data.token, data.user);

      const userRole = data.user?.role?.toLowerCase().trim();
      setSuccess("✅ Login successful! Redirecting...");

      setTimeout(() => {
        if (userRole === "landlord") {
          navigate("/dashboard");
        } else if (userRole === "mover") {
          navigate("/mover-dashboard");
        } else {
          navigate("/");
        }
      }, 1000);

    } catch (err) {
      setError(err.message || "❌ Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle forgot password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMsg("");

    if (!forgotEmail) {
      setForgotMsg("❌ Please enter your email address.");
      return;
    }

    setForgotLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();
      setForgotMsg(data.message || "✅ Reset link sent! Check your inbox.");
    } catch (err) {
      setForgotMsg("❌ Failed to send reset email. Try again.");
    } finally {
      setForgotLoading(false);
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

          {/* ✅ FORGOT PASSWORD FORM */}
          {showForgot ? (
            <>
              <h1 style={styles.title}>🔐 Reset Password</h1>
              <p style={styles.subtitle}>Enter your email to receive a reset link</p>

              {forgotMsg && (
                <div style={forgotMsg.includes("❌") ? styles.error : styles.success}>
                  {forgotMsg}
                </div>
              )}

              <form onSubmit={handleForgotPassword} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    ...styles.submitBtn,
                    opacity: forgotLoading ? 0.7 : 1,
                    cursor: forgotLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {forgotLoading ? "⏳ Sending..." : "📧 Send Reset Link"}
                </button>
              </form>

              <div style={styles.divider}></div>

              <p style={styles.footer}>
                <span
                  onClick={() => { setShowForgot(false); setForgotMsg(""); }}
                  style={styles.link}
                >
                  ← Back to Login
                </span>
              </p>
            </>
          ) : (
            <>
              {/* ✅ LOGIN FORM */}
              <h1 style={styles.title}>🏠 Landlord Portal</h1>
              <p style={styles.subtitle}>Manage your properties and tenants</p>

              {error && <div style={styles.error}>{error}</div>}
              {success && <div style={styles.success}>{success}</div>}

              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="e.g., landlord@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  />
                  {/* ✅ FORGOT PASSWORD LINK */}
                  <span
                    onClick={() => { setShowForgot(true); setError(""); }}
                    style={styles.forgotLink}
                  >
                    Forgot password?
                  </span>
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
                  {loading ? "⏳ Verifying..." : "🚀 Login to Dashboard"}
                </button>
              </form>

              <div style={styles.divider}></div>

              <p style={styles.footer}>
                Need to register a property?{" "}
                <Link to="/register" style={styles.link}>Create Account</Link>
              </p>
              <p style={{ ...styles.footer, marginTop: "10px", fontSize: "12px" }}>
                Are you a mover?{" "}
                <Link to="/movers" style={styles.link}>Go to Mover Portal</Link>
              </p>
            </>
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
  formBox: { background: "white", border: "2px solid #fbbf24", borderRadius: "16px", padding: "40px 32px", boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)" },
  title: { fontSize: "26px", fontWeight: 800, color: "#1f2937", margin: "0 0 8px", textAlign: "center" },
  subtitle: { fontSize: "14px", color: "#6b7280", margin: "0 0 30px", textAlign: "center" },
  error: { background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", textAlign: "center" },
  success: { background: "#dcfce7", color: "#166534", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "12px", fontWeight: 700, color: "#374151", textTransform: "uppercase" },
  input: { padding: "12px", border: "2px solid #d1d5db", borderRadius: "8px", fontSize: "15px", background: "#f9fafb" },
  submitBtn: { padding: "14px", background: "linear-gradient(135deg, #2427fb 0%, #4d9ffc 100%)", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "16px" },
  divider: { height: "1px", background: "#e5e7eb", margin: "25px 0" },
  footer: { textAlign: "center", color: "#6b7280", fontSize: "14px" },
  link: { color: "#2427fb", textDecoration: "none", fontWeight: 700, cursor: "pointer" },
  forgotLink: { fontSize: "12px", color: "#2427fb", cursor: "pointer", textAlign: "right", fontWeight: 600, marginTop: "2px" },
};

const css = `
  input:focus { outline: none; border-color: #2427fb !important; background: white !important; }
  button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(36, 39, 251, 0.3); }
`;