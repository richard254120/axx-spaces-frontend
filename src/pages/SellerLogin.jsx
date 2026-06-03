import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, KENYA_COUNTIES } from "../utils/constants";
import useGoogleAuth from "../hooks/useGoogleAuth";
import useForgotPassword from "../hooks/useForgotPassword";

export default function SellerLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", county: "",
  });

  const { googleLoading, googleError, handleGoogleLogin } = useGoogleAuth({
    onSuccess: () => {
      setSuccess("✅ Google login successful! Redirecting...");
      setTimeout(() => navigate("/seller-dashboard"), 1000);
    },
  });

  const {
    showForgot, setShowForgot, forgotEmail, setForgotEmail,
    forgotLoading, forgotMsg, handleForgotPassword, resetForgotState,
  } = useForgotPassword();

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };



  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const url = mode === "login"
        ? `${API_BASE}/seller-auth/login`
        : `${API_BASE}/seller-auth/register`;

      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : form;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      if (mode === "register") {
        setSuccess("✅ Account created! You can now login.");
        setMode("login");
        setForm({ name: "", email: "", password: "", phone: "", county: "" });
      } else {
        // Save seller token + user separately from landlord auth
        localStorage.setItem("sellerToken", data.token);
        localStorage.setItem("sellerUser", JSON.stringify(data.user));
        navigate("/seller-dashboard");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div style={s.page}>
      <style>{css}</style>

      <div style={s.card}>
        {showForgot ? (
          <>
            {/* Forgot Password Form */}
            <div style={s.header}>
              <div style={s.icon}>🔐</div>
              <h1 style={s.title}>Reset Password</h1>
              <p style={s.subtitle}>Enter your email to receive a reset link</p>
            </div>

            {forgotMsg && (
              <div style={forgotMsg.includes("❌") ? s.error : s.successMsg}>
                {forgotMsg}
              </div>
            )}

            <div style={s.form}>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                style={s.input}
              />
              <button style={s.submitBtn} onClick={handleForgotPassword} disabled={forgotLoading}>
                {forgotLoading ? "Sending..." : "📧 Send Reset Link"}
              </button>
            </div>

            <p style={s.backLink}>
              <span style={s.link} onClick={resetForgotState}>
                ← Back to Login
              </span>
            </p>
          </>
        ) : (
          <>
            {/* Header */}
            <div style={s.header}>
              <div style={s.icon}>🛒</div>
              <h1 style={s.title}>Seller Portal</h1>
              <p style={s.subtitle}>
                {mode === "login"
                  ? "Login to manage your listings"
                  : "Create a seller account to start selling"}
              </p>
            </div>

            {/* Tab Toggle */}
            <div style={s.tabs}>
              <button
                style={{ ...s.tab, ...(mode === "login" ? s.activeTab : {}) }}
                onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
              >
                Login
              </button>
              <button
                style={{ ...s.tab, ...(mode === "register" ? s.activeTab : {}) }}
                onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
              >
                Register
              </button>
            </div>

            {/* Alerts */}
            {(error || googleError) && <div style={s.error}>{error || googleError}</div>}
            {success && <div style={s.successMsg}>{success}</div>}

            {/* Form */}
            <div style={s.form}>
              {mode === "register" && (
                <>
                  <input name="name" placeholder="Full Name" value={form.name}
                    onChange={handleChange} style={s.input} />
                  <input name="phone" placeholder="Phone (e.g. 0712345678)" value={form.phone}
                    onChange={handleChange} style={s.input} />
                  <select name="county" value={form.county} onChange={handleChange} style={s.input}>
                    <option value="">Select County</option>
                    {KENYA_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </>
              )}

              <input name="email" type="email" placeholder="Email Address" value={form.email}
                onChange={handleChange} style={s.input} />
              <input name="password" type="password" placeholder="Password" value={form.password}
                onChange={handleChange} style={s.input} />

              {mode === "login" && (
                <div style={{ textAlign: "right", fontSize: "13px" }}>
                  <span
                    onClick={() => { setShowForgot(true); setError(""); }}
                    style={{ color: "#fbbf24", cursor: "pointer", fontWeight: 600 }}
                  >
                    Forgot password?
                  </span>
                </div>
              )}

              <button style={s.submitBtn} onClick={handleSubmit} disabled={loading}>
                {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
              </button>
            </div>

            {mode === "login" && (
              <>
                <div style={s.divider}>
                  <div style={s.dividerLine}></div>
                  <span style={s.dividerText}>or</span>
                  <div style={s.dividerLine}></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  style={{
                    ...s.googleButton,
                    ...(googleLoading ? s.buttonDisabled : {}),
                  }}
                >
                  {googleLoading ? "⏳ Connecting..." : "🔐 Sign in with Google"}
                </button>
              </>
            )}

            {/* Info box */}
            <div style={s.infoBox}>
              <p style={s.infoText}>
                📋 After registering, you can upload your materials immediately.
                They will appear on the marketplace once approved by our admin team.
              </p>
            </div>

            {/* Back link */}
            <p style={s.backLink}>
              <span style={s.link} onClick={() => navigate("/materials")}>
                ← Back to Marketplace
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #06101f 0%, #0f1729 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "'DM Sans', sans-serif" },
  card: { background: "linear-gradient(135deg, #1e293b 0%, #0f1729 100%)", border: "1px solid #334155", borderRadius: "16px", padding: "40px", width: "100%", maxWidth: "420px" },
  header: { textAlign: "center", marginBottom: "28px" },
  icon: { fontSize: "3rem", marginBottom: "12px" },
  title: { margin: 0, color: "#fbbf24", fontSize: "1.8rem", fontWeight: 800 },
  subtitle: { color: "#94a3b8", margin: "8px 0 0 0", fontSize: "0.95rem" },
  tabs: { display: "flex", background: "#0f1729", borderRadius: "8px", padding: "4px", marginBottom: "24px", gap: "4px" },
  tab: { flex: 1, padding: "10px", background: "transparent", border: "none", color: "#94a3b8", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.95rem", transition: "all 0.2s" },
  activeTab: { background: "#334155", color: "#fbbf24" },
  error: { background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", padding: "10px 14px", borderRadius: "8px", fontSize: "0.88rem", marginBottom: "16px" },
  successMsg: { background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#86efac", padding: "10px 14px", borderRadius: "8px", fontSize: "0.88rem", marginBottom: "16px" },
  form: { display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" },
  input: { padding: "12px 16px", background: "#0f1729", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", fontSize: "0.95rem", width: "100%", boxSizing: "border-box" },
  submitBtn: { padding: "13px", background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", color: "#0f1729", border: "none", borderRadius: "8px", fontWeight: 800, fontSize: "1rem", cursor: "pointer", transition: "all 0.3s" },
  infoBox: { background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "8px", padding: "14px", marginBottom: "16px" },
  infoText: { color: "#93c5fd", fontSize: "0.85rem", margin: 0, lineHeight: "1.6" },
  backLink: { textAlign: "center", margin: 0 },
  link: { color: "#94a3b8", cursor: "pointer", fontSize: "0.9rem", textDecoration: "underline" },
  divider: { display: "flex", alignItems: "center", margin: "20px 0", color: "#94a3b8", fontSize: "14px" },
  dividerLine: { flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.1)" },
  dividerText: { padding: "0 10px" },
  googleButton: {
    width: "100%",
    padding: "13px",
    background: "white",
    color: "#1f2937",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "all 0.2s",
  },
};

const css = `
  * { box-sizing: border-box; }
  input:focus, select:focus { outline: none; border-color: #fbbf24 !important; box-shadow: 0 0 0 3px rgba(251,191,36,0.1) !important; }
  button:hover:not(:disabled) { transform: translateY(-2px); }
`;