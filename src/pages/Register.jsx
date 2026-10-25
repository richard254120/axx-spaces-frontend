import { useState, useContext, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import PhoneInput from "../components/PhoneInput";
import { COLORS, buttonStyles, inputStyles, pageStyles } from "../styles/theme";
import { getDashboardPath } from "../utils/dashboardRoutes";
import { useGoogleSignIn } from "../hooks/useGoogleSignIn";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [landlordType, setLandlordType] = useState("general");

  const [accountChoice, setAccountChoice] = useState("member");

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
          role: accountChoice === "member" ? "member" : "landlord",
          landlordType: accountChoice === "member" ? undefined : landlordType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google authentication failed");

      login(data.token, data.user);
      setSuccess(" Google registration successful! Redirecting...");
      setTimeout(() => navigate(getDashboardPath(data.user?.role)), 1000);
    } catch (err) {
      setError(err.message || "Google authentication failed. Please try again.");
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

    // Basic Validation
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError(" All fields are required");
      return;
    }
    if (formData.password.length < 6) {
      setError(" Password must be at least 6 characters");
      return;
    }
    const hasLetter = /[a-zA-Z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    if (!hasLetter || !hasNumber) {
      setError(" Password must contain a mixture of both letters and numbers.");
      return;
    }

    setLoading(true);

    try {
      if (accountChoice === "member") {
        const memberPayload = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
        };

        const response = await fetch(`${API_BASE}/auth/register-member`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(memberPayload),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || data.message || "Member registration failed");
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
          setSuccess("Welcome to Axxspace! Member account created. Redirecting...");
          setTimeout(() => {
            navigate("/member");
          }, 1200);
          return;
        }
      }

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: "landlord",
        landlordType,
      };

      console.log(" Sending registration payload:", payload);
      console.log(" API URL:", `${API_BASE}/auth/register`);

      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log(" Backend response:", data);
      console.log("Status:", response.status);

      if (!response.ok) {
        throw new Error(data.error || data.message || "Registration failed");
      }

      // Registration successful but email verification required
      setSuccess(data.message || " Registration successful! Please check your email to verify your account.");

      // Clear form
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err) {
      console.error(" Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>

      <div style={styles.container}>
        <div style={styles.formBox}>
          {/* STEP 1: ACCOUNT TYPE CHOICE */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button
              type="button"
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "10px",
                border: accountChoice === "member" ? "2px solid #fbbf24" : "1px solid #334155",
                background: accountChoice === "member" ? "rgba(251, 191, 36, 0.15)" : "#1e293b",
                color: accountChoice === "member" ? "#fbbf24" : "#94a3b8",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
              }}
              onClick={() => setAccountChoice("member")}
            >
              Join as Member
            </button>
            <button
              type="button"
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "10px",
                border: accountChoice === "provider" ? "2px solid #fbbf24" : "1px solid #334155",
                background: accountChoice === "provider" ? "rgba(251, 191, 36, 0.15)" : "#1e293b",
                color: accountChoice === "provider" ? "#fbbf24" : "#94a3b8",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
              }}
              onClick={() => setAccountChoice("provider")}
            >
              List a business/service
            </button>
          </div>

          <h1 style={styles.title}>
            {accountChoice === "member" ? "Member Sign Up" : "List Your Space or Business"}
          </h1>
          <p style={styles.subtitle}>
            {accountChoice === "member"
              ? "Join Axxspace to explore verified spaces and save favorites"
              : "Choose how you list, then create your provider account"}
          </p>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          {accountChoice === "provider" && (
            <div style={styles.typeRow}>
              <button
                type="button"
                style={{ ...styles.typeCard, ...(landlordType === "general" ? styles.typeCardActive : {}) }}
                onClick={() => setLandlordType("general")}
              >
                <span style={styles.typeIcon}></span>
                <strong>General Landlord</strong>
                <span style={styles.typeDesc}>List rentals anywhere in Kenya</span>
              </button>
              <button
                type="button"
                style={{ ...styles.typeCard, ...(landlordType === "university" ? styles.typeCardActive : {}) }}
                onClick={() => setLandlordType("university")}
              >
                <span style={styles.typeIcon}></span>
                <strong>Near University</strong>
                <span style={styles.typeDesc}>List hostels/rooms near a campus — shown to students</span>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g., John Doe"
                value={formData.name}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

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
              <label style={styles.label}>Phone Number</label>
              <PhoneInput
                name="phone"
                value={formData.phone}
                onChange={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Min 6 chars with letters & numbers"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
                required
              />
              {formData.password && (formData.password.length < 6 || !/[a-zA-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) && (
                <div style={{ color: "#fca5a5", fontSize: "11px", marginTop: "4px" }}>
                  Password must contain both letters and numbers.
                </div>
              )}
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
              {loading ? "Creating Account..." : "Create Landlord Account"}
            </button>
          </form>

          <div style={styles.divider}></div>

          {/* Google Login Button */}
          <div ref={googleButtonRef} style={styles.googleButtonContainer}></div>

          <div style={styles.divider}></div>

          <p style={styles.footer}>
            Already have an account?{" "}
            <Link to="/login" style={styles.link}>Login here</Link>
          </p>
          <p style={styles.footerSmall}>
            Are you a mover?{" "}
            <Link to="/movers" style={styles.link}>Join our Mover Network</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    ...pageStyles.dark,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  container: {
    width: "100%",
    maxWidth: "450px",
  },
  logoSection: {
    textAlign: "center",
    marginBottom: "30px",
  },
  logo: {
    height: "70px",
    width: "auto",
  },
  formBox: {
    background: COLORS.bgLight,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "16px",
    padding: "40px 32px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
  },
  title: {
    fontSize: "26px",
    fontWeight: 800,
    color: COLORS.textLight,
    margin: "0 0 8px",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "14px",
    color: COLORS.textMutedLight,
    margin: "0 0 30px",
    textAlign: "center",
  },
  error: {
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#fca5a5",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: 500,
  },
  success: {
    background: "rgba(34, 197, 94, 0.15)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    color: "#86efac",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: 500,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  typeRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "24px",
  },
  typeCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "6px",
    padding: "14px 12px",
    background: COLORS.bgDark,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "12px",
    cursor: "pointer",
    textAlign: "left",
    color: COLORS.textLight,
    fontSize: "13px",
    transition: "border-color 0.2s, background 0.2s",
  },
  typeCardActive: {
    borderColor: COLORS.primary,
    background: "rgba(251, 191, 36, 0.08)",
  },
  typeIcon: { fontSize: "1.4rem" },
  typeDesc: {
    fontSize: "11px",
    color: COLORS.textMutedLight,
    lineHeight: 1.4,
    fontWeight: 400,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 700,
    color: COLORS.textMutedLight,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: inputStyles.dark,
  submitBtn: buttonStyles.primary,
  googleButtonContainer: {
    width: "100%",
    minHeight: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    zIndex: "5",
    overflow: "visible",
    margin: "8px 0",
  },
  googleBtn: {
    width: "100%",
    background: "white",
    color: "#1f2937",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "14px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "all 0.2s",
  },
  divider: {
    height: "1px",
    background: COLORS.border,
    margin: "20px 0",
  },
  footer: {
    textAlign: "center",
    color: COLORS.textMutedLight,
    fontSize: "14px",
  },
  footerSmall: {
    textAlign: "center",
    color: COLORS.textMutedLight,
    fontSize: "12px",
    marginTop: "10px",
  },
  link: {
    color: COLORS.accent,
    textDecoration: "none",
    fontWeight: 700,
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  input:focus {
    outline: none;
    border-color: ${COLORS.accent} !important;
    background: rgba(15,23,41,0.9) !important;
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.12);
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-2px);
    opacity: 0.9;
  }
  
  a[style*="color: #fbbf24"]:hover {
    opacity: 0.8;
  }

  /* Google Sign-In Button Fixes */
  .googleButtonContainer iframe {
    position: relative !important;
    z-index: 100 !important;
  }

  .googleButtonContainer > div {
    display: flex !important;
    justify-content: center !important;
    width: 100% !important;
  }
`;