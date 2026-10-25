import { useState, useContext, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import { getDashboardPath } from "../utils/dashboardRoutes";
import { useGoogleSignIn } from "../hooks/useGoogleSignIn";
import AuthLayout from "../components/AuthLayout";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

export default function BusinessLogin() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleGoogleCredential = useCallback(
    async (googleUser) => {
      try {
        const res = await fetch(`${API_BASE}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            googleId: googleUser.sub,
            email: googleUser.email,
            name: googleUser.name,
            picture: googleUser.picture,
            role: "business",
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Google authentication failed");

        login(data.token, data.user);
        setSuccess("✓ Google login successful! Redirecting to business dashboard...");
        setTimeout(() => navigate(getDashboardPath(data.user?.role)), 900);
      } catch (err) {
        setError(err.message || "Google authentication failed. Please try again.");
      }
    },
    [login, navigate]
  );

  const handleGoogleError = useCallback((message) => {
    setError(message);
  }, []);

  const { buttonRef: googleButtonRef } = useGoogleSignIn({
    onCredential: handleGoogleCredential,
    onError: handleGoogleError,
  });

  const handleResendVerification = async () => {
    setResendLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await API.post("/auth/resend-verification", {
        email: resendEmail,
        role: "user",
      });
      setSuccess("✓ " + (res.data.message || "Verification email sent successfully! Please check your inbox."));
      setShowResend(false);
    } catch (err) {
      setError("✗ " + (err.response?.data?.error || "Failed to resend verification email. Please try again."));
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setShowResend(false);

    try {
      const res = await API.post("/auth/login", { ...formData, role: "business" });
      const { token, user } = res.data;

      login(token, user);
      setSuccess("✓ Sign in successful! Redirecting to your dashboard...");

      setTimeout(() => {
        navigate(getDashboardPath(user?.role));
      }, 1000);
    } catch (err) {
      if (err.response?.data?.requiresVerification) {
        setShowResend(true);
        setResendEmail(err.response.data.email || formData.email);
      }
      setError(err.response?.data?.error || "Login failed. Please verify your credentials.");
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
      const res = await API.post("/auth/forgot-password", {
        email: forgotEmail,
        role: "user",
      });
      setForgotMsg(res.data.message || "Reset link sent! Check your email inbox.");
    } catch (err) {
      setForgotMsg("Failed to send reset email. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const features = [
    {
      title: "Direct Client Leads",
      desc: "Receive customer calls, WhatsApp chats, and quote inquiries directly with zero commissions.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
    },
    {
      title: "Verified Enterprise Badge",
      desc: "Gain instant client trust with authenticated listings, registered address verification, and badges.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      ),
    },
    {
      title: "Full Business Control",
      desc: "Manage operating hours, branches, photos, menus, portfolios, and customer reviews real-time.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      ),
    },
  ];

  const stats = [
    { value: "2,500+", label: "Registered Businesses" },
    { value: "47", label: "Counties Reached" },
    { value: "24/7", label: "Client Discovery" },
  ];

  return (
    <AuthLayout
      portalBadge="AxxBiashara Business Network"
      portalTitle="Empower Your Enterprise Across Kenya"
      portalSubtitle="Manage your corporate profile, capture high-intent inquiries, and grow your regional customer base."
      accentColor="#60a5fa"
      accentGlow="rgba(96, 165, 250, 0.2)"
      features={features}
      stats={stats}
      backLink="/axxbiashara"
      backText="Back to AxxBiashara"
    >
      <div style={localStyles.container}>
        {showForgot ? (
          <>
            <div style={localStyles.header}>
              <h2 style={localStyles.title}>Reset Business Password</h2>
              <p style={localStyles.subtitle}>
                Enter your registered business email to receive reset instructions.
              </p>
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
                  placeholder="biz@company.co.ke"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  style={localStyles.input}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  ...localStyles.primaryBtn,
                  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                }}
                disabled={forgotLoading}
              >
                {forgotLoading ? "Sending Link..." : "Send Reset Link"}
              </button>
            </form>

            <p style={localStyles.footerText}>
              <span
                style={{ ...localStyles.inlineLink, color: "#60a5fa" }}
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
              <h2 style={localStyles.title}>Business Sign In</h2>
              <p style={localStyles.subtitle}>
                Sign in to manage your directory profile, reviews, and client inquiries.
              </p>
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
              <div style={localStyles.fieldGroup}>
                <label style={localStyles.label}>Business Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="name@business.co.ke"
                  value={formData.email}
                  onChange={handleChange}
                  style={localStyles.input}
                  required
                />
              </div>

              <div style={localStyles.fieldGroup}>
                <div style={localStyles.labelRow}>
                  <label style={localStyles.label}>Password</label>
                  <span
                    onClick={() => {
                      setShowForgot(true);
                      setError("");
                    }}
                    style={localStyles.forgotLink}
                  >
                    Forgot password?
                  </span>
                </div>
                <div style={localStyles.passwordWrapper}>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
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
              </div>

              <button
                type="submit"
                disabled={loading}
                style={localStyles.primaryBtn}
              >
                {loading ? "Signing in..." : "Sign In to Business Portal"}
              </button>
            </form>

            <div style={localStyles.divider}>
              <div style={localStyles.dividerLine} />
              <span style={localStyles.dividerText}>or continue with</span>
              <div style={localStyles.dividerLine} />
            </div>

            <div ref={googleButtonRef} style={localStyles.googleBtnBox} />

            <div style={localStyles.bottomSwitch}>
              <span style={{ color: "#94a3b8", fontSize: "14px" }}>
                Don't have a registered business yet?{" "}
              </span>
              <Link to="/business-register" style={localStyles.registerLink}>
                Register Business Here
              </Link>
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
    color: "#60a5fa",
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
  primaryBtn: {
    marginTop: "6px",
    padding: "14px",
    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
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
    background: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(59, 130, 246, 0.25)",
    borderRadius: "10px",
    padding: "12px 14px",
    marginBottom: "16px",
  },
  resendText: {
    margin: "0 0 10px 0",
    color: "#93c5fd",
    fontSize: "13px",
  },
  resendBtn: {
    width: "100%",
    padding: "9px 14px",
    background: "rgba(59, 130, 246, 0.2)",
    color: "#93c5fd",
    border: "1px solid rgba(59, 130, 246, 0.4)",
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
  bottomSwitch: {
    textAlign: "center",
    marginTop: "8px",
  },
  registerLink: {
    color: "#60a5fa",
    fontWeight: 700,
    textDecoration: "none",
  },
  footerText: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "14px",
  },
  inlineLink: {
    cursor: "pointer",
    fontWeight: 600,
  },
};
