import { useState, useContext, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import PhoneInput from "../components/PhoneInput";
import { useGoogleSignIn } from "../hooks/useGoogleSignIn";
import AuthLayout from "../components/AuthLayout";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

export default function UserRegister() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
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
            role: "user",
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Google registration failed");
        if (!data.token || !data.user) throw new Error("Invalid response from server");

        login(data.token, data.user);
        setSuccess("✓ Google registration successful! Redirecting...");
        setTimeout(() => {
          navigate("/");
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
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError("Please fill in all required fields.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    const hasLetter = /[a-zA-Z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    if (!hasLetter || !hasNumber) {
      setError("Password must contain a mixture of both letters and numbers.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: "user",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Registration failed");
      }

      if (data.requiresVerification) {
        setSuccess(
          data.message ||
            "Registration successful! We've sent a verification link to your inbox. Please verify before signing in."
        );
        setTimeout(() => {
          navigate("/user-login");
        }, 3000);
      } else if (data.token && data.user) {
        login(data.token, data.user);
        setSuccess("✓ Welcome to AxxSpace! Your account is active. Redirecting...");
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        setSuccess("✓ Registration successful! You can now log in.");
        setTimeout(() => {
          navigate("/user-login");
        }, 1500);
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      title: "Seamless Property Search",
      desc: "Explore thousands of verified apartments, bedsitters, hostels, and commercial properties across Kenya.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
    },
    {
      title: "Direct Landlord Contact",
      desc: "Book viewings and chat directly with verified landlords and agents without unverified middlemen.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
    },
    {
      title: "Verified Security",
      desc: "Your data and inquiries are safeguarded with bank-grade encryption and vetted property listings.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <path d="M9 12l2 2 4-4"></path>
        </svg>
      ),
    },
  ];

  const stats = [
    { value: "50,000+", label: "Happy Tenants" },
    { value: "15,000+", label: "Verified Spaces" },
    { value: "47", label: "Counties" },
  ];

  return (
    <AuthLayout
      portalBadge="AxxSpace Explorer Portal"
      portalTitle="Find Your Next Home, Office or Store"
      portalSubtitle="Join thousands discovering verified properties, hardware deals, and trusted local businesses."
      accentColor="#fbbf24"
      accentGlow="rgba(251, 191, 36, 0.2)"
      features={features}
      stats={stats}
      backLink="/"
      backText="Back to Home"
    >
      <div style={localStyles.container}>
        <div style={localStyles.header}>
          <h2 style={localStyles.title}>Create Your Account</h2>
          <p style={localStyles.subtitle}>
            Sign up to bookmark properties, contact verified owners, and receive updates.
          </p>
        </div>

        {error && <div style={localStyles.errorAlert}>{error}</div>}
        {success && <div style={localStyles.successAlert}>{success}</div>}
        {googleError && <div style={localStyles.errorAlert}>{googleError}</div>}

        <form onSubmit={handleSubmit} style={localStyles.form}>
          <div style={localStyles.fieldGroup}>
            <label style={localStyles.label}>Full Name</label>
            <input
              name="name"
              type="text"
              placeholder="e.g., Sarah Wanjiku"
              value={formData.name}
              onChange={handleChange}
              style={localStyles.input}
              required
            />
          </div>

          <div style={localStyles.fieldGroup}>
            <label style={localStyles.label}>Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="sarah@example.com"
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
            {formData.password && (
              <div style={localStyles.strengthNotice}>
                {formData.password.length < 6 ||
                !/[a-zA-Z]/.test(formData.password) ||
                !/[0-9]/.test(formData.password) ? (
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
            {loading ? "Creating Account..." : "Create Free Account"}
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
            Already have an account?{" "}
          </span>
          <Link to="/user-login" style={localStyles.registerLink}>
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
    marginTop: "4px",
  },
  primaryBtn: {
    marginTop: "6px",
    padding: "14px",
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#0f172a",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(251, 191, 36, 0.25)",
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
    color: "#fbbf24",
    fontWeight: 700,
    textDecoration: "none",
  },
};