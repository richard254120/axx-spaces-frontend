import { useState, useContext, useCallback } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getDashboardPath } from "../utils/dashboardRoutes";
import { useGoogleSignIn, GOOGLE_CLIENT_ID } from "../hooks/useGoogleSignIn";
import AuthLayout from "../components/AuthLayout";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const loginType = searchParams.get("type");
  const isVerifiedParam = searchParams.get("verified") === "true";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(isVerifiedParam ? "✓ Email verified successfully! Please log in to your account." : "");

  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");

  const isMover = loginType === "mover";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoogleCredential = useCallback(async (googleUser) => {
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleId: googleUser.sub,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
          role: isMover ? "mover" : "landlord",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google authentication failed");
      if (!data.token || !data.user) throw new Error("Invalid login response from server");

      login(data.token, data.user);
      setSuccess("✓ Google login successful! Redirecting...");
      navigate(getDashboardPath(data.user.role), { replace: true });
    } catch (err) {
      setGoogleError(err.message || "Google authentication failed. Please try again.");
    }
  }, [isMover, login, navigate]);

  const handleGoogleError = useCallback((message) => {
    setGoogleError(message);
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
      const response = await fetch(`${API_BASE}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail, role: isMover ? "mover" : "landlord" }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to resend verification email");
      }

      setSuccess("✓ " + (data.message || "Verification email sent successfully! Please check your inbox."));
      setShowResend(false);
    } catch (err) {
      setError("✕ " + (err.message || "Failed to resend verification email. Please try again."));
    } finally {
      setResendLoading(false);
    }
  };

  // Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setGoogleError("");
    setShowResend(false);

    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: isMover ? "mover" : "landlord",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresVerification) {
          setShowResend(true);
          setResendEmail(data.email || formData.email);
        }
        throw new Error(data.error || "Login failed");
      }

      if (!data.token || !data.user) {
        throw new Error("Invalid login response from server");
      }

      login(data.token, data.user);
      setSuccess("✓ Login successful! Redirecting to dashboard...");

      navigate(getDashboardPath(data.user.role), { replace: true });

    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMsg("");

    if (!forgotEmail) {
      setForgotMsg("Please enter your email address.");
      return;
    }

    setForgotLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          role: isMover ? "mover" : "landlord",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process request");
      }

      setForgotMsg(data.message || "If that email exists, a reset link has been sent.");
    } catch (err) {
      setForgotMsg("Failed: " + (err.message || "Please try again later."));
    } finally {
      setForgotLoading(false);
    }
  };

  const landlordFeatures = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
      title: "Automated Rent Collection",
      desc: "Direct M-Pesa and bank reconciliation credited to your owner dashboard.",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      title: "Verified Student & General Tenants",
      desc: "Reach university students and verified tenants across all 47 Kenyan counties.",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      ),
      title: "Real-time Tenancy & Arrears Tracker",
      desc: "Track payments, generate landlord tax reports, and resolve tenant inquiries.",
    },
  ];

  const landlordStats = [
    { value: "12,000+", label: "Active Listings" },
    { value: "47", label: "Counties Covered" },
    { value: "99.8%", label: "Verified Occupancy" },
  ];

  return (
    <AuthLayout
      portalBadge={isMover ? "Axx Movers Portal" : "Landlord & Property Manager Portal"}
      portalTitle={isMover ? "Grow Your Moving & Haulage Business" : "Smart Property & Tenancy Management"}
      portalSubtitle={isMover ? "Connect with thousands of movers, get instant booking notifications, and manage jobs smoothly." : "List residential rentals, university student hostels, and commercial units on Kenya's premier network."}
      accentColor="#fbbf24"
      accentGlow="rgba(251, 191, 36, 0.22)"
      features={landlordFeatures}
      stats={landlordStats}
      backLink="/"
      backText="Explore Spaces"
    >
      {/* FORGOT PASSWORD FORM */}
      {showForgot ? (
        <div>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "26px", fontWeight: 800, color: "#ffffff", margin: "0 0 8px" }}>
              Reset Password
            </h2>
            <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0 }}>
              Enter your registered email and we'll send a recovery link
            </p>
          </div>

          {forgotMsg && (
            <div style={{
              background: forgotMsg.includes("Failed") ? "rgba(239, 68, 68, 0.15)" : "rgba(34, 197, 94, 0.15)",
              color: forgotMsg.includes("Failed") ? "#fca5a5" : "#86efac",
              border: forgotMsg.includes("Failed") ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(34, 197, 94, 0.3)",
              padding: "12px 16px",
              borderRadius: "10px",
              marginBottom: "20px",
              fontSize: "14px",
              textAlign: "center",
            }}>
              {forgotMsg}
            </div>
          )}

          <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={s.label}>Email Address</label>
              <input
                type="email"
                placeholder="landlord@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                style={s.input}
                required
              />
            </div>

            <button
              type="submit"
              disabled={forgotLoading}
              style={{
                ...s.submitBtn,
                opacity: forgotLoading ? 0.7 : 1,
                cursor: forgotLoading ? "not-allowed" : "pointer",
              }}
            >
              {forgotLoading ? "Sending Link..." : "Send Reset Link"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <span
              onClick={() => {
                setShowForgot(false);
                setForgotMsg("");
                setForgotEmail("");
              }}
              style={{ color: "#fbbf24", cursor: "pointer", fontWeight: 700, fontSize: "14px" }}
            >
              &larr; Back to Login
            </span>
          </div>
        </div>
      ) : (
        <div>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <span style={{
              display: "inline-block",
              background: "rgba(251, 191, 36, 0.15)",
              color: "#fbbf24",
              border: "1px solid rgba(251, 191, 36, 0.3)",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "10px",
            }}>
              {isMover ? "Mover Dashboard" : "Landlord Sign In"}
            </span>
            <h2 style={{ fontSize: "26px", fontWeight: 800, color: "#ffffff", margin: "0 0 6px" }}>
              Welcome Back
            </h2>
            <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0 }}>
              {isMover ? "Sign in to manage your moving requests" : "Sign in to manage your properties and tenants"}
            </p>
          </div>

          {error && <div style={s.alertError}>{error}</div>}
          {success && <div style={s.alertSuccess}>{success}</div>}
          {googleError && <div style={s.alertError}>{googleError}</div>}

          {showResend && (
            <div style={{ marginBottom: "20px" }}>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading}
                style={{
                  background: "rgba(251, 191, 36, 0.15)",
                  color: "#fbbf24",
                  border: "1px solid rgba(251, 191, 36, 0.4)",
                  borderRadius: "10px",
                  padding: "12px 18px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                {resendLoading ? "Sending Verification Email..." : "Resend Verification Email"}
              </button>
            </div>
          )}

          {/* GOOGLE SIGN-IN BUTTON */}
          {GOOGLE_CLIENT_ID && (
            <div style={{ marginBottom: "22px" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center", marginBottom: "10px" }}>
                Fast Sign In
              </p>
              <div ref={googleButtonRef} style={s.googleButtonContainer}></div>
            </div>
          )}

          <div style={s.divider}>
            <div style={s.dividerLine} />
            <span style={s.dividerText}>or continue with email</span>
            <div style={s.dividerLine} />
          </div>

          {/* EMAIL/PASSWORD FORM */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={s.label}>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="landlord@example.com"
                value={formData.email}
                onChange={handleChange}
                style={s.input}
                required
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ ...s.label, marginBottom: 0 }}>Password</label>
                <span
                  onClick={() => {
                    setShowForgot(true);
                    setError("");
                  }}
                  style={{ color: "#fbbf24", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}
                >
                  Forgot password?
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  style={s.input}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={s.passwordToggle}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...s.submitBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Signing In..." : "Sign In to Portal"}
            </button>
          </form>

          {/* FOOTER SWITCHER */}
          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.08)", textAlign: "center", display: "flex", flexDirection: "column", gap: "8px" }}>
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
              Don't have a landlord account?{" "}
              <Link to="/register" style={{ color: "#fbbf24", fontWeight: 700, textDecoration: "none" }}>
                Register Property
              </Link>
            </p>
            <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
              Looking to rent or explore spaces?{" "}
              <Link to="/user-login" style={{ color: "#38bdf8", fontWeight: 700, textDecoration: "none" }}>
                Member Hub &rarr;
              </Link>
            </p>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

const s = {
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: 700,
    color: "#cbd5e1",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "13px 16px",
    background: "rgba(15, 23, 42, 0.65)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "12px",
    color: "#f8fafc",
    fontSize: "15px",
    boxSizing: "border-box",
    transition: "all 0.2s",
  },
  passwordToggle: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  submitBtn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#0B2140",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(251, 191, 36, 0.35)",
    transition: "all 0.2s",
    marginTop: "6px",
  },
  alertError: {
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#fca5a5",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "18px",
  },
  alertSuccess: {
    background: "rgba(34, 197, 94, 0.15)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    color: "#86efac",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "18px",
  },
  googleButtonContainer: {
    width: "100%",
    minHeight: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "18px 0 22px",
    gap: "12px",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "rgba(255, 255, 255, 0.1)",
  },
  dividerText: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
};