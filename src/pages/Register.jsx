import { useState, useContext, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import PhoneInput from "../components/PhoneInput";
import { getDashboardPath } from "../utils/dashboardRoutes";
import { useGoogleSignIn } from "../hooks/useGoogleSignIn";
import AuthLayout from "../components/AuthLayout";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

// Each signup path gets its own accent so the page never looks like the
// wrong portal when it is opened from a deep link.
const ACCENTS = {
  landlord: {
    color: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.22)",
    gradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    onAccent: "#0B2140",
    soft: "rgba(251, 191, 36, 0.15)",
    border: "rgba(251, 191, 36, 0.4)",
    shadow: "rgba(251, 191, 36, 0.35)",
  },
  member: {
    color: "#38bdf8",
    glow: "rgba(56, 189, 248, 0.22)",
    gradient: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)",
    onAccent: "#04244D",
    soft: "rgba(56, 189, 248, 0.15)",
    border: "rgba(56, 189, 248, 0.45)",
    shadow: "rgba(56, 189, 248, 0.35)",
  },
};

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const [landlordType, setLandlordType] = useState("general");
  // ?account=member opens the community account tab, which creates the same
  // Explorer account as /user-register.
  const [accountChoice, setAccountChoice] = useState(() =>
    searchParams.get("account") === "member" ? "member" : "landlord"
  ); // "landlord" | "member"

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
          role: accountChoice === "member" ? "user" : "landlord",
          landlordType: accountChoice === "member" ? undefined : landlordType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google authentication failed");

      login(data.token, data.user);
      setSuccess("✓ Google registration successful! Redirecting...");
      setTimeout(() => navigate(getDashboardPath(data.user?.role)), 1000);
    } catch (err) {
      setError(err.message || "Google registration failed. Please try again.");
    }
  }, [accountChoice, landlordType, login, navigate]);

  const handleGoogleError = useCallback((message) => {
    setError(message);
  }, []);

  const { buttonRef: googleButtonRef } = useGoogleSignIn({
    onCredential: handleGoogleCredential,
    onError: handleGoogleError,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError("All fields are required");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
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
      if (accountChoice === "member") {
        const explorerPayload = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
          // The community/member account and the Explorer account are the same
          // account type, so it is always created with the "user" role.
          role: "user",
        };

        const response = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(explorerPayload),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || data.message || "Explorer registration failed");
        }

        if (data.requiresVerification) {
          setSuccess("Registration successful! A verification email has been sent to " + formData.email + ". Please check your inbox and verify your email before logging in.");
          setFormData({ name: "", email: "", password: "", phone: "" });
          setTimeout(() => {
            navigate("/user-login");
          }, 3000);
          return;
        }

        if (data.token && data.user) {
          login(data.token, data.user);
          setSuccess("Welcome to AxxSpace! Your Explorer (community member) account is ready. Redirecting...");
          setTimeout(() => {
            navigate("/member");
          }, 1200);
          return;
        }
      }

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        role: "landlord",
        landlordType,
      };

      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Registration failed");
      }

      setSuccess(data.message || "Registration successful! Please check your email to verify your account.");

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const registerFeatures = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
      title: "List Hostels & General Rentals",
      desc: "Promote your rooms directly to college students, young professionals, and families.",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      ),
      title: "Faster Occupancy & Lower Vacancies",
      desc: "Over 80% of properties on AxxSpace receive booking inquiries within the first 72 hours.",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
      title: "Verified Owner Status",
      desc: "Get the gold verified badge to gain trust, boost rankings, and prevent impersonation.",
    },
  ];

  const registerStats = [
    { value: "48 Hrs", label: "Avg First Inquiry" },
    { value: "0%", label: "Setup Fee" },
    { value: "24/7", label: "Owner Assistance" },
  ];

  const memberFeatures = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      title: "Verified Homes & Hostels",
      desc: "Browse vetted rentals and student hostels across all 47 counties.",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
      title: "Save, Compare & Get Alerts",
      desc: "Shortlist favourites, save searches and be first to hear about new listings.",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      ),
      title: "Sell on QuickSales",
      desc: "Post items for sale free and deal directly with buyers on WhatsApp.",
    },
  ];

  const memberStats = [
    { value: "100%", label: "Free Account" },
    { value: "47", label: "Counties Covered" },
    { value: "0%", label: "Listing Fees" },
  ];

  const isMember = accountChoice === "member";
  const accent = ACCENTS[accountChoice];

  const tabStyle = (choice) =>
    accountChoice === choice
      ? {
          ...s.tabButton,
          background: ACCENTS[choice].soft,
          color: ACCENTS[choice].color,
          border: `1px solid ${ACCENTS[choice].border}`,
        }
      : s.tabButton;

  const typeCardStyle = (type) =>
    landlordType === type
      ? { ...s.typeCard, borderColor: accent.border, background: accent.soft }
      : s.typeCard;

  return (
    <AuthLayout
      portalBadge={isMember ? "Explorer Registration" : "Landlord Registration"}
      portalTitle={
        isMember
          ? "Join the AxxSpace Community — Free Forever"
          : "Start Listing & Monetizing Your Space Today"
      }
      portalSubtitle={
        isMember
          ? "Discover verified homes and hostels across all 47 counties. Save favourites, book instantly and sell on QuickSales with one free account."
          : "Join thousands of Kenyan property owners who manage, rent out, and track income on AxxSpace with zero monthly fixed costs."
      }
      accentColor={accent.color}
      accentGlow={accent.glow}
      features={isMember ? memberFeatures : registerFeatures}
      stats={isMember ? memberStats : registerStats}
      backLink={isMember ? "/user-login" : "/login"}
      backText="Back to Login"
    >
      <div>
        {/* Account Choice Switcher */}
        <div style={s.tabGroup}>
          <button
            type="button"
            onClick={() => setAccountChoice("landlord")}
            style={tabStyle("landlord")}
          >
            🏢 Landlord / Owner
          </button>
          <button
            type="button"
            onClick={() => setAccountChoice("member")}
            style={tabStyle("member")}
          >
            🌟 Member / Explorer
          </button>
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "22px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", margin: "0 0 6px" }}>
            {accountChoice === "landlord" ? "Create Owner Account" : "Create Member Account"}
          </h2>
          <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0 }}>
            {accountChoice === "landlord"
              ? "List your property and connect with tenants directly"
              : "Explore verified spaces, save favorites, and book easily"}
          </p>
        </div>

        {error && <div style={s.alertError}>{error}</div>}
        {success && <div style={s.alertSuccess}>{success}</div>}

        {/* Landlord Type Picker */}
        {accountChoice === "landlord" && (
          <div style={{ marginBottom: "20px" }}>
            <label style={s.label}>Property Specialty</label>
            <div style={s.typeGrid}>
              <button
                type="button"
                onClick={() => setLandlordType("general")}
                style={typeCardStyle("general")}
              >
                <div style={s.typeCardTitle}>🏡 General Rentals</div>
                <div style={s.typeCardDesc}>Apartments, villas, family homes, commercial spaces</div>
              </button>
              <button
                type="button"
                onClick={() => setLandlordType("university")}
                style={typeCardStyle("university")}
              >
                <div style={s.typeCardTitle}>🎓 Campus &amp; Hostels</div>
                <div style={s.typeCardDesc}>Student rooms near colleges and university campuses</div>
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={s.label}>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Joseph Mwangi"
              value={formData.name}
              onChange={handleChange}
              style={s.input}
              required
            />
          </div>

          <div>
            <label style={s.label}>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="e.g., mwangi@example.com"
              value={formData.email}
              onChange={handleChange}
              style={s.input}
              required
            />
          </div>

          <div>
            <label style={s.label}>Phone Number (M-Pesa registered preferred)</label>
            <PhoneInput
              name="phone"
              value={formData.phone}
              onChange={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
              style={s.input}
              required
            />
          </div>

          <div>
            <label style={s.label}>Password (Min 6 chars, letters &amp; numbers)</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a strong password"
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
            {formData.password && (formData.password.length < 6 || !/[a-zA-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) && (
              <p style={{ color: "#fca5a5", fontSize: "11px", margin: "4px 0 0" }}>
                Password must contain both letters and numbers.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...s.submitBtn,
              background: accent.gradient,
              color: accent.onAccent,
              boxShadow: `0 4px 14px ${accent.shadow}`,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating Account..." : accountChoice === "landlord" ? "Create Owner Account" : "Create Member Account"}
          </button>
        </form>

        <div style={s.divider}>
          <div style={s.dividerLine} />
          <span style={s.dividerText}>or register with</span>
          <div style={s.dividerLine} />
        </div>

        <div ref={googleButtonRef} style={s.googleButtonContainer}></div>

        <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
            Already registered?{" "}
            <Link
              to={isMember ? "/user-login" : "/login"}
              style={{ color: accent.color, fontWeight: 700, textDecoration: "none" }}
            >
              Sign In Here &rarr;
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

const s = {
  tabGroup: {
    display: "flex",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "14px",
    padding: "4px",
    marginBottom: "20px",
    gap: "6px",
  },
  tabButton: {
    flex: 1,
    padding: "11px 12px",
    borderRadius: "10px",
    border: "1px solid transparent",
    background: "transparent",
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  typeGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  typeCard: {
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    padding: "12px",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  typeCardTitle: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#f8fafc",
    marginBottom: "3px",
  },
  typeCardDesc: {
    fontSize: "11px",
    color: "#94a3b8",
    lineHeight: 1.35,
  },
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
    padding: "12px 14px",
    background: "rgba(15, 23, 42, 0.65)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "10px",
    color: "#f8fafc",
    fontSize: "14px",
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
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: 800,
    cursor: "pointer",
    transition: "all 0.2s",
    marginTop: "6px",
  },
  alertError: {
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#fca5a5",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    textAlign: "center",
    marginBottom: "16px",
  },
  alertSuccess: {
    background: "rgba(34, 197, 94, 0.15)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    color: "#86efac",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    textAlign: "center",
    marginBottom: "16px",
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
    margin: "18px 0 16px",
    gap: "12px",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "rgba(255, 255, 255, 0.1)",
  },
  dividerText: {
    color: "#64748b",
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
};