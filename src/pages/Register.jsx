import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { COLORS, buttonStyles, inputStyles, pageStyles } from "../styles/theme";
import { API_BASE } from "../utils/constants";
import useGoogleAuth from "../hooks/useGoogleAuth";

export default function Register() {
  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const googleButtonRef = useRef(null);

  const { googleError, handleGoogleLogin, GOOGLE_CLIENT_ID } = useGoogleAuth({
    buttonRef: googleButtonRef,
    onSuccess: () => {
      setSuccess("✅ Google registration successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1000);
    },
  });

  // Initialize Google Sign-In on component mount
  useEffect(() => {
    if (GOOGLE_CLIENT_ID) {
      handleGoogleLogin();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic Validation
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError("❌ All fields are required");
      return;
    }
    if (formData.password.length < 6) {
      setError("❌ Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: "landlord", // Hardcoded to landlord
      };

      console.log("📤 Sending registration payload:", payload);
      console.log("🌐 API URL:", `${API_BASE}/auth/register`);

      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log("📥 Backend response:", data);
      console.log("Status:", response.status);

      if (!response.ok) {
        throw new Error(data.error || data.message || "Registration failed");
      }

      // Registration successful but email verification required
      setSuccess(data.message || "✅ Registration successful! Please check your email to verify your account.");

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
      console.error("❌ Registration error:", err);
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
          <h1 style={styles.title}>Landlord Sign Up</h1>
          <p style={styles.subtitle}>Start listing your properties on Axxspace</p>

          {(error || googleError) && <div style={styles.error}>{error || googleError}</div>}
          {success && <div style={styles.success}>{success}</div>}

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
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
                required
              />
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
    minHeight: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
`;