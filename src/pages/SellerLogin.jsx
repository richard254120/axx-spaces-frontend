import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

const COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta",
  "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka Nithi",
  "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga",
  "Murang'a", "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans Nzoia",
  "Uasin Gishu", "Elgeyo Marakwet", "Nandi", "Baringo", "Laikipia", "Nakuru",
  "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma",
  "Busia", "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi City",
];

export default function SellerLogin() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", county: "",
  });

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");

  // Google Sign-In button ref
  const googleButtonRef = useRef(null);

  // Initialize Google Sign-In on component mount
  useEffect(() => {
    if (import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      handleGoogleLogin();
    }
  }, []);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");

    try {
      if (!window.google) {
        // Load Google Identity Services script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.crossOrigin = 'anonymous';
        script.onload = () => {
          console.log('Google Sign-In script loaded successfully');
          initializeGoogleSignIn();
        };
        script.onerror = () => {
          console.error('Failed to load Google Sign-In script');
          setError("Failed to load Google Sign-In. Please check your internet connection or use email/password.");
          setGoogleLoading(false);
        };
        document.head.appendChild(script);
      } else {
        initializeGoogleSignIn();
      }
    } catch (err) {
      console.error('Google Sign-In error:', err);
      setError("Google Sign-In is not configured. Please use email/password.");
      setGoogleLoading(false);
    }
  };

  const initializeGoogleSignIn = () => {
    try {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID",
        callback: handleGoogleCredentialResponse,
        auto_select: false,
      });

      // Render the Google Sign-In button instead of using prompt
      if (googleButtonRef.current) {
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          width: '100%',
        });
        setGoogleLoading(false);
      }
    } catch (err) {
      setError("Google Sign-In initialization failed. Please use email/password.");
      setGoogleLoading(false);
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const googleUser = JSON.parse(jsonPayload);

      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleId: googleUser.sub,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
          role: "seller",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Google authentication failed");
      }

      login(data.token, data.user);
      setSuccess("✅ Google login successful! Redirecting...");

      setTimeout(() => {
        navigate("/seller-dashboard");
      }, 1000);

    } catch (err) {
      setError(err.message || "Google authentication failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail, role: "seller" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to resend verification email");
      }

      setSuccess("✅ " + (data.message || "Verification email sent successfully! Please check your inbox."));
      setShowResend(false);
    } catch (err) {
      setError("❌ " + (err.message || "Failed to resend verification email. Please try again."));
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (mode === "register") {
      if (!form.name || !form.email || !form.password || !form.phone || !form.county) {
        setError("Please fill in all fields.");
        return;
      }
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      const hasLetter = /[a-zA-Z]/.test(form.password);
      const hasNumber = /[0-9]/.test(form.password);
      if (!hasLetter || !hasNumber) {
        setError("Password must contain a mixture of both letters and numbers.");
        return;
      }
    }
    setLoading(true);
    setError("");
    setSuccess("");
    setShowResend(false);

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
        if (data.requiresVerification) {
          setShowResend(true);
          setResendEmail(data.email || form.email);
        }
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMsg("");

    if (!forgotEmail) {
      setForgotMsg("❌ Please enter your email address.");
      return;
    }

    setForgotLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, role: "seller" }),
      });

      const data = await res.json();
      setForgotMsg(data.message || "✅ Reset link sent! Check your inbox.");
    } catch (err) {
      setForgotMsg("❌ Failed to send reset email. Try again.");
    } finally {
      setForgotLoading(false);
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
              <span style={s.link} onClick={() => { setShowForgot(false); setForgotMsg(""); }}>
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
            {error && <div style={s.error}>{error}</div>}
            {success && <div style={s.successMsg}>{success}</div>}

            {showResend && (
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  style={{
                    background: "rgba(251, 191, 36, 0.15)",
                    color: "#fbbf24",
                    border: "1px solid rgba(251, 191, 36, 0.3)",
                    borderRadius: "8px",
                    padding: "10px 18px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    width: "100%",
                    transition: "all 0.2s"
                  }}
                >
                  {resendLoading ? "⏳ Sending..." : "📧 Resend Verification Email"}
                </button>
              </div>
            )}

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
                    {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </>
              )}

              <input name="email" type="email" placeholder="Email Address" value={form.email}
                onChange={handleChange} style={s.input} />
              <input name="password" type="password" placeholder={mode === "register" ? "Password (Min 6 chars, letters & numbers)" : "Password"} value={form.password}
                onChange={handleChange} style={s.input} />
              {mode === "register" && form.password && (form.password.length < 6 || !/[a-zA-Z]/.test(form.password) || !/[0-9]/.test(form.password)) && (
                <div style={{ color: "#fca5a5", fontSize: "11px", marginTop: "-12px", marginBottom: "12px", textAlign: "left" }}>
                  ⚠️ Password must contain both letters and numbers.
                </div>
              )}

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

                <div ref={googleButtonRef} style={s.googleButtonContainer}></div>
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
  googleButtonContainer: {
    width: "100%",
    minHeight: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
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