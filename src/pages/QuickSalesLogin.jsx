import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

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

export default function QuickSalesLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useContext(AuthContext);
  // ?mode=register lets CTAs (e.g. the QuickSales composer) land on the signup tab.
  const [mode, setMode] = useState(() => (searchParams.get("mode") === "register" ? "register" : "login")); // "login" | "register"
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  // Initialize Google Sign-In on mount
  useEffect(() => {
    if (import.meta.env.VITE_GOOGLE_CLIENT_ID && mode === "login" && !showForgot) {
      handleGoogleLogin();
    }
  }, [mode, showForgot]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");

    try {
      if (!window.google) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.crossOrigin = "anonymous";
        script.onload = () => {
          initializeGoogleSignIn();
        };
        script.onerror = () => {
          setError("Failed to load Google Sign-In. Please use email & password.");
          setGoogleLoading(false);
        };
        document.head.appendChild(script);
      } else {
        initializeGoogleSignIn();
      }
    } catch (err) {
      setGoogleLoading(false);
    }
  };

  const initializeGoogleSignIn = () => {
    try {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID",
        callback: handleGoogleCredentialResponse,
        auto_select: false,
      });

      if (googleButtonRef.current) {
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          text: "signin_with",
          width: "100%",
        });
        setGoogleLoading(false);
      }
    } catch (err) {
      setGoogleLoading(false);
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    try {
      const base64Url = response.credential.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

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

      localStorage.setItem("sellerToken", data.token);
      localStorage.setItem("sellerUser", JSON.stringify(data.user));
      login(data.token, data.user);
      setSuccess("✓ Google login successful! Redirecting to marketplace...");

      setTimeout(() => {
        navigate("/quicksales-dashboard");
      }, 900);
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

      setSuccess("✓ " + (data.message || "Verification email sent successfully! Please check your inbox."));
      setShowResend(false);
    } catch (err) {
      setError("✗ " + (err.message || "Failed to resend verification email. Please try again."));
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (mode === "register") {
      if (!form.name || !form.email || !form.password || !form.phone || !form.county) {
        setError("Please fill in all required fields.");
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
      const url =
        mode === "login"
          ? `${API_BASE}/seller-auth/login`
          : `${API_BASE}/seller-auth/register`;

      const body =
        mode === "login"
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
        setError(data.error || "Authentication failed. Please check your details.");
        return;
      }

      if (mode === "register") {
        setSuccess(
          data.message ||
            "Account created! We've sent a verification email to your inbox. Please verify to log in."
        );
        setMode("login");
        setForm({ name: "", email: "", password: "", phone: "", county: "" });
      } else {
        localStorage.setItem("sellerToken", data.token);
        localStorage.setItem("sellerUser", JSON.stringify(data.user));
        login(data.token, data.user);
        navigate("/quicksales-dashboard");
      }
    } catch (err) {
      setError("Network error. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMsg("");

    if (!forgotEmail) {
      setForgotMsg("Please enter your registered email address.");
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
      setForgotMsg(data.message || "Reset link sent! Please check your email inbox.");
    } catch (err) {
      setForgotMsg("Failed to send reset email. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const features = [
    {
      title: "Instant Material Listing",
      desc: "Post surplus building materials, tools, or hardware in 60 seconds with instant photo uploads.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      ),
    },
    {
      title: "Direct Contractor Enquiries",
      desc: "Connect directly with verified builders, engineers, and property managers over WhatsApp & call.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
      ),
    },
    {
      title: "Zero Intermediary Margins",
      desc: "Keep 100% of your listed value with transparent dealings and direct buyer settlement.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      ),
    },
  ];

  const stats = [
    { value: "10,000+", label: "Materials Sold" },
    { value: "47", label: "Counties Active" },
    { value: "0%", label: "Listing Fee" },
  ];

  return (
    <AuthLayout
      portalBadge="Axx QuickSales Marketplace"
      portalTitle="Kenya's Premier Building & Hardware Exchange"
      portalSubtitle="Sell surplus construction supplies, machinery, timber, and fixtures directly to verified buyers."
      accentColor="#f59e0b"
      accentGlow="rgba(245, 158, 11, 0.2)"
      features={features}
      stats={stats}
      backLink="/quicksales"
      backText="Back to Marketplace"
    >
      <div style={localStyles.container}>
        {showForgot ? (
          <>
            <div style={localStyles.header}>
              <h2 style={localStyles.title}>Reset Password</h2>
              <p style={localStyles.subtitle}>Enter your registered email to receive a password reset link.</p>
            </div>

            {forgotMsg && (
              <div
                style={
                  forgotMsg.includes("Failed") || forgotMsg.includes("Please enter")
                    ? localStyles.errorAlert
                    : localStyles.successAlert
                }
              >
                {forgotMsg}
              </div>
            )}

            <form onSubmit={handleForgotPassword} style={localStyles.form}>
              <div style={localStyles.fieldGroup}>
                <label style={localStyles.label}>Registered Email</label>
                <input
                  type="email"
                  placeholder="seller@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  style={localStyles.input}
                  required
                />
              </div>

              <button
                type="submit"
                style={localStyles.primaryBtn}
                disabled={forgotLoading}
              >
                {forgotLoading ? "Sending Link..." : "Send Reset Link"}
              </button>
            </form>

            <p style={localStyles.footerText}>
              <span
                style={localStyles.inlineLink}
                onClick={() => {
                  setShowForgot(false);
                  setForgotMsg("");
                }}
              >
                ← Back to Login
              </span>
            </p>
          </>
        ) : (
          <>
            <div style={localStyles.header}>
              <h2 style={localStyles.title}>
                {mode === "login" ? "Seller Sign In" : "Register QuickSales Store"}
              </h2>
              <p style={localStyles.subtitle}>
                {mode === "login"
                  ? "Access your listings, respond to quotes, and post new materials."
                  : "Start liquidating your construction inventory in minutes."}
              </p>
            </div>

            {/* Mode Switch Tabs */}
            <div style={localStyles.tabTrack}>
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccess("");
                }}
                style={{
                  ...localStyles.tabBtn,
                  ...(mode === "login" ? localStyles.tabBtnActive : {}),
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                  setSuccess("");
                }}
                style={{
                  ...localStyles.tabBtn,
                  ...(mode === "register" ? localStyles.tabBtnActive : {}),
                }}
              >
                Create Store
              </button>
            </div>

            {error && <div style={localStyles.errorAlert}>{error}</div>}
            {success && <div style={localStyles.successAlert}>{success}</div>}

            {showResend && (
              <div style={localStyles.resendBox}>
                <p style={localStyles.resendText}>
                  Need a new verification link sent to <strong>{resendEmail}</strong>?
                </p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  style={localStyles.resendBtn}
                >
                  {resendLoading ? "Sending Verification..." : "Resend Verification Email"}
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} style={localStyles.form}>
              {mode === "register" && (
                <>
                  <div style={localStyles.fieldGroup}>
                    <label style={localStyles.label}>Full Name / Company Name</label>
                    <input
                      name="name"
                      type="text"
                      placeholder="e.g., John Mwangi or Apex Hardware"
                      value={form.name}
                      onChange={handleChange}
                      style={localStyles.input}
                      required
                    />
                  </div>

                  <div style={localStyles.fieldGroup}>
                    <label style={localStyles.label}>Phone Number</label>
                    <input
                      name="phone"
                      type="tel"
                      placeholder="e.g., 0712 345 678"
                      value={form.phone}
                      onChange={handleChange}
                      style={localStyles.input}
                      required
                    />
                  </div>

                  <div style={localStyles.fieldGroup}>
                    <label style={localStyles.label}>County Location</label>
                    <select
                      name="county"
                      value={form.county}
                      onChange={handleChange}
                      style={localStyles.select}
                      required
                    >
                      <option value="">Select County</option>
                      {COUNTIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div style={localStyles.fieldGroup}>
                <label style={localStyles.label}>Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="seller@example.com"
                  value={form.email}
                  onChange={handleChange}
                  style={localStyles.input}
                  required
                />
              </div>

              <div style={localStyles.fieldGroup}>
                <div style={localStyles.labelRow}>
                  <label style={localStyles.label}>Password</label>
                  {mode === "login" && (
                    <span
                      onClick={() => {
                        setShowForgot(true);
                        setError("");
                      }}
                      style={localStyles.forgotLink}
                    >
                      Forgot password?
                    </span>
                  )}
                </div>
                <div style={localStyles.passwordWrapper}>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      mode === "register"
                        ? "Min 6 chars with letters & numbers"
                        : "••••••••"
                    }
                    value={form.password}
                    onChange={handleChange}
                    style={{ ...localStyles.input, paddingRight: "46px" }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={localStyles.eyeBtn}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                {mode === "register" && form.password && (
                  <div style={localStyles.strengthNotice}>
                    {form.password.length < 6 ||
                    !/[a-zA-Z]/.test(form.password) ||
                    !/[0-9]/.test(form.password) ? (
                      <span style={{ color: "#f87171" }}>
                        ✗ Must contain at least 6 characters with both letters &amp; numbers
                      </span>
                    ) : (
                      <span style={{ color: "#34d399" }}>
                        ✓ Strong password format
                      </span>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={localStyles.primaryBtn}
              >
                {loading ? "Processing..." : mode === "login" ? "Sign In to QuickSales" : "Create Seller Account"}
              </button>
            </form>

            {mode === "login" && (
              <>
                <div style={localStyles.divider}>
                  <div style={localStyles.dividerLine} />
                  <span style={localStyles.dividerText}>or continue with</span>
                  <div style={localStyles.dividerLine} />
                </div>

                <div ref={googleButtonRef} style={localStyles.googleBtnBox} />
              </>
            )}

            <div style={localStyles.infoBanner}>
              <div style={localStyles.infoIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <p style={localStyles.infoText}>
                All listings undergo swift verification by our quality control team before appearing publicly.
              </p>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}

const localStyles = {
  container: {
    display: "flex",
    flexDirection: "column",
  },
  header: {
    marginBottom: "24px",
  },
  title: {
    margin: 0,
    fontSize: "26px",
    fontWeight: 800,
    color: "#f8fafc",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    margin: "8px 0 0 0",
    fontSize: "14px",
    color: "#94a3b8",
    lineHeight: 1.5,
  },
  tabTrack: {
    display: "flex",
    background: "rgba(15, 23, 42, 0.7)",
    padding: "4px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    marginBottom: "22px",
    gap: "4px",
  },
  tabBtn: {
    flex: 1,
    padding: "10px",
    background: "transparent",
    border: "none",
    borderRadius: "8px",
    color: "#94a3b8",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  tabBtnActive: {
    background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.25) 100%)",
    color: "#fbbf24",
    border: "1px solid rgba(245, 158, 11, 0.35)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#cbd5e1",
  },
  forgotLink: {
    fontSize: "12px",
    color: "#fbbf24",
    cursor: "pointer",
    fontWeight: 500,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "10px",
    color: "#f8fafc",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  select: {
    width: "100%",
    padding: "12px 14px",
    background: "#0f172a",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "10px",
    color: "#f8fafc",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  passwordWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
  },
  strengthNotice: {
    fontSize: "12px",
    marginTop: "4px",
  },
  primaryBtn: {
    marginTop: "6px",
    padding: "14px",
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    color: "#0f172a",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(245, 158, 11, 0.25)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  errorAlert: {
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.35)",
    color: "#fca5a5",
    padding: "12px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    marginBottom: "16px",
    lineHeight: 1.4,
  },
  successAlert: {
    background: "rgba(16, 185, 129, 0.15)",
    border: "1px solid rgba(16, 185, 129, 0.35)",
    color: "#6ee7b7",
    padding: "12px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    marginBottom: "16px",
    lineHeight: 1.4,
  },
  resendBox: {
    background: "rgba(245, 158, 11, 0.1)",
    border: "1px solid rgba(245, 158, 11, 0.25)",
    borderRadius: "10px",
    padding: "12px 14px",
    marginBottom: "16px",
  },
  resendText: {
    margin: "0 0 10px 0",
    color: "#fde68a",
    fontSize: "13px",
  },
  resendBtn: {
    width: "100%",
    padding: "9px 14px",
    background: "rgba(245, 158, 11, 0.2)",
    color: "#fbbf24",
    border: "1px solid rgba(245, 158, 11, 0.4)",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "20px 0 16px 0",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "rgba(255, 255, 255, 0.08)",
  },
  dividerText: {
    padding: "0 12px",
    fontSize: "12px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  googleBtnBox: {
    width: "100%",
    minHeight: "44px",
    display: "flex",
    justifyContent: "center",
    marginBottom: "18px",
  },
  infoBanner: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    borderRadius: "10px",
    padding: "12px",
    marginTop: "16px",
  },
  infoIcon: {
    flexShrink: 0,
    marginTop: "1px",
  },
  infoText: {
    margin: 0,
    fontSize: "12px",
    color: "#94a3b8",
    lineHeight: 1.5,
  },
  footerText: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "14px",
  },
  inlineLink: {
    color: "#fbbf24",
    cursor: "pointer",
    fontWeight: 600,
    textDecoration: "none",
  },
};