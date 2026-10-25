import { useState, useContext, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import PhoneInput from "../components/PhoneInput";
import { KENYA_COUNTIES } from "../features/accommodation";
import { useGoogleSignIn } from "../hooks/useGoogleSignIn";
import AuthLayout from "../components/AuthLayout";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

export default function AgentRegister() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    county: "",
    bio: "",
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
            role: "agent",
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Google registration failed");
        if (!data.token || !data.user) throw new Error("Invalid response from server");

        login(data.token, data.user);
        setSuccess("✓ Google registration successful! Redirecting to agent dashboard...");
        setTimeout(() => {
          navigate("/agent/dashboard");
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
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return "Password must contain a mixture of both letters and numbers.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.county || !formData.bio) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: "agent",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      if (data.requiresVerification) {
        setSuccess("✓ Account created! We've sent a verification email to " + formData.email + ". Please verify before logging in.");
        setTimeout(() => {
          navigate("/agent/login");
        }, 3000);
        return;
      }

      // Auto login if no verification required
      login(data.token, data.user);
      setSuccess("✓ Registration successful! Redirecting to your agent dashboard...");
      setTimeout(() => {
        navigate("/agent/dashboard");
      }, 1500);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      title: "Direct Landlord Mandates",
      desc: "Gain authorized access to manage property listings, arrange viewings, and close deals directly.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    },
    {
      title: "Automated Commission Tracking",
      desc: "Keep precise records of tenant deposits, agency fees, and escrow payments seamlessly.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      ),
    },
    {
      title: "Verified Agent Credential",
      desc: "Receive digital badges and client ratings that put you ahead in your county of operation.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <path d="M9 12l2 2 4-4"></path>
        </svg>
      ),
    },
  ];

  const stats = [
    { value: "1,200+", label: "Verified Agents" },
    { value: "47", label: "Counties" },
    { value: "0%", label: "Platform Cut on Fees" },
  ];

  return (
    <AuthLayout
      portalBadge="Axx Verified Agent Network"
      portalTitle="Join Kenya's Premier Real Estate Agent Network"
      portalSubtitle="Build your professional portfolio, earn direct commissions, and manage landlord properties effortlessly."
      accentColor="#10b981"
      accentGlow="rgba(16, 185, 129, 0.2)"
      features={features}
      stats={stats}
      backLink="/"
      backText="Back to Home"
    >
      <div style={localStyles.container}>
        <div style={localStyles.header}>
          <h2 style={localStyles.title}>Apply as an Agent</h2>
          <p style={localStyles.subtitle}>
            Register your credentials to start managing properties and securing tenant placements.
          </p>
        </div>

        {error && <div style={localStyles.errorAlert}>{error}</div>}
        {success && <div style={localStyles.successAlert}>{success}</div>}
        {googleError && <div style={localStyles.errorAlert}>{googleError}</div>}

        <form onSubmit={handleSubmit} style={localStyles.form}>
          <div style={localStyles.fieldGroup}>
            <label style={localStyles.label}>Full Legal Name</label>
            <input
              name="name"
              type="text"
              placeholder="e.g., Alex Kiprono"
              value={formData.name}
              onChange={handleChange}
              style={localStyles.input}
              required
            />
          </div>

          <div style={localStyles.fieldGroup}>
            <label style={localStyles.label}>Professional Email</label>
            <input
              name="email"
              type="email"
              placeholder="agent@example.com"
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
            <label style={localStyles.label}>Primary County of Operation</label>
            <select
              name="county"
              value={formData.county}
              onChange={handleChange}
              style={localStyles.select}
              required
            >
              <option value="">Select County</option>
              {KENYA_COUNTIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div style={localStyles.fieldGroup}>
            <label style={localStyles.label}>Professional Bio &amp; Specialization</label>
            <textarea
              name="bio"
              placeholder="Briefly state your experience, areas of specialization (residential, commercial, rentals), or agency affiliation..."
              value={formData.bio}
              onChange={handleChange}
              style={localStyles.textarea}
              rows={3}
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
            {loading ? "Submitting Application..." : "Submit Agent Application"}
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
            Already an accredited agent?{" "}
          </span>
          <Link to="/agent/login" style={localStyles.registerLink}>
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
  textarea: {
    width: "100%",
    padding: "12px 14px",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "10px",
    color: "#f8fafc",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    resize: "vertical",
    fontFamily: "inherit",
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
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(16, 185, 129, 0.3)",
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
    color: "#10b981",
    fontWeight: 700,
    textDecoration: "none",
  },
};
