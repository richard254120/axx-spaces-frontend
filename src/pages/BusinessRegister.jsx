import { useState, useContext, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import PhoneInput from "../components/PhoneInput";
import { useGoogleSignIn } from "../hooks/useGoogleSignIn";
import AuthLayout from "../components/AuthLayout";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

export default function BusinessRegister() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [googleError, setGoogleError] = useState("");

  const handleGoogleCredential = useCallback(
    async (googleUser) => {
      try {
        setLoading(true);
        setError("");
        setGoogleError("");

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
        if (!res.ok) throw new Error(data.error || "Google registration failed");
        if (!data.token || !data.user) throw new Error("Invalid response from server");

        login(data.token, data.user);
        setSuccess("✓ Google registration successful! Redirecting to business dashboard...");
        setTimeout(() => {
          navigate("/business-dashboard");
        }, 900);
      } catch (err) {
        setGoogleError(err.message || "Google registration failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [login, navigate]
  );

  const handleGoogleError = useCallback((message) => {
    setGoogleError(message);
  }, []);

  const { buttonRef: googleButtonRef } = useGoogleSignIn({
    onCredential: handleGoogleCredential,
    onError: handleGoogleError,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
    const hasLetter = /[a-zA-Z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    if (!hasLetter || !hasNumber) {
      setError("Password must contain a mixture of both letters and numbers.");
      setLoading(false);
      return;
    }

    try {
      await API.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: "business",
      });

      setSuccess("✓ Registration successful! We sent a verification email to your inbox. Please verify before signing in.");

      setTimeout(() => {
        navigate("/business-login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please check your information.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      title: "Elevate Your Brand Reach",
      desc: "Get discovered by thousands searching for verified local services, artisans, and stores across Kenya.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      ),
    },
    {
      title: "Direct WhatsApp Inquiries",
      desc: "Connect instantly with prospective clients via direct WhatsApp and tap-to-call actions.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
      ),
    },
    {
      title: "Verified Trust Credential",
      desc: "Display genuine customer feedback, verified location pins, and showcase portfolios.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      ),
    },
  ];

  const stats = [
    { value: "2,500+", label: "Registered Businesses" },
    { value: "47", label: "Counties Reached" },
    { value: "0%", label: "Commission On Leads" },
  ];

  return (
    <AuthLayout
      portalBadge="AxxBiashara Business Network"
      portalTitle="Register Your Business & Start Capturing Leads"
      portalSubtitle="Join thousands of businesses thriving on Kenya's fastest-growing enterprise directory."
      accentColor="#60a5fa"
      accentGlow="rgba(96, 165, 250, 0.2)"
      features={features}
      stats={stats}
      backLink="/axxbiashara"
      backText="Back to AxxBiashara"
    >
      <div style={localStyles.container}>
        <div style={localStyles.header}>
          <h2 style={localStyles.title}>Register Business</h2>
          <p style={localStyles.subtitle}>
            Create your AxxBiashara account to showcase your services and receive client leads.
          </p>
        </div>

        {error && <div style={localStyles.errorAlert}>{error}</div>}
        {success && <div style={localStyles.successAlert}>{success}</div>}
        {googleError && <div style={localStyles.errorAlert}>{googleError}</div>}

        <form onSubmit={handleSubmit} style={localStyles.form}>
          <div style={localStyles.fieldGroup}>
            <label style={localStyles.label}>Business / Contact Name</label>
            <input
              name="name"
              type="text"
              placeholder="e.g., Nexus Electricals Ltd"
              value={formData.name}
              onChange={handleChange}
              style={localStyles.input}
              required
            />
          </div>

          <div style={localStyles.fieldGroup}>
            <label style={localStyles.label}>Business Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="contact@business.co.ke"
              value={formData.email}
              onChange={handleChange}
              style={localStyles.input}
              required
            />
          </div>

          <div style={localStyles.fieldGroup}>
            <label style={localStyles.label}>Phone Number</label>
            <PhoneInput
              name="phone"
              value={formData.phone}
              onChange={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
              style={localStyles.input}
              required
            />
          </div>

          <div style={localStyles.fieldGroup}>
            <label style={localStyles.label}>Password</label>
            <div style={localStyles.passwordWrapper}>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min 6 chars with letters & numbers"
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

          <div style={localStyles.fieldGroup}>
            <label style={localStyles.label}>Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={localStyles.input}
              required
            />
          </div>

          {formData.password && (
            <div style={localStyles.strengthNotice}>
              {formData.password.length < 6 ||
              !/[a-zA-Z]/.test(formData.password) ||
              !/[0-9]/.test(formData.password) ? (
                <span style={{ color: "#f87171" }}>
                  ✗ Password must contain at least 6 characters with both letters &amp; numbers
                </span>
              ) : formData.password !== formData.confirmPassword && formData.confirmPassword ? (
                <span style={{ color: "#fbbf24" }}>
                  ! Passwords do not match yet
                </span>
              ) : (
                <span style={{ color: "#34d399" }}>
                  ✓ Valid password
                </span>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={localStyles.primaryBtn}
          >
            {loading ? "Creating Account..." : "Create Business Account"}
          </button>
        </form>

        <div style={localStyles.divider}>
          <div style={localStyles.dividerLine} />
          <span style={localStyles.dividerText}>or register with</span>
          <div style={localStyles.dividerLine} />
        </div>

        <div ref={googleButtonRef} style={localStyles.googleBtnBox} />

        <div style={localStyles.bottomSwitch}>
          <span style={{ color: "#94a3b8", fontSize: "14px" }}>
            Already have a business account?{" "}
          </span>
          <Link to="/business-login" style={localStyles.registerLink}>
            Sign In Here
          </Link>
        </div>
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
    gap: "16px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#cbd5e1",
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
  strengthNotice: {
    fontSize: "12px",
    marginTop: "-4px",
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
};
