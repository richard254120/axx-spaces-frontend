import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError("❌ Please fill all fields");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("❌ Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      console.log("📝 Registering user...", formData);
      
      const res = await API.post("/auth/register", formData);
      
      console.log("✅ Registration response:", res.data);

      if (res.data.token && res.data.user) {
        login(res.data.token, res.data.user);
        setSuccess("✅ Registration successful!");
        
        setTimeout(() => {
          navigate("/listings");
        }, 1500);
      } else {
        setError("❌ Invalid response from server");
      }
    } catch (err) {
      console.error("❌ Registration error:", err);
      const errorMsg = err?.response?.data?.error || err?.message || "Registration failed";
      setError("❌ " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>{css}</style>

      <div style={styles.box}>
        <h1 style={styles.heading}>🏠 Create Account</h1>
        <p style={styles.subtitle}>Join Axx Spaces as a Landlord</p>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              name="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Phone Number</label>
            <input
              name="phone"
              type="tel"
              placeholder="254712345678"
              value={formData.phone}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{
              ...styles.btn,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "⏳ Creating Account..." : "✅ Register as Landlord"}
          </button>
        </form>

        <p style={styles.divider}>or</p>

        <p style={styles.loginLink}>
          Already have an account? <Link to="/login" style={styles.link}>Login here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #06101f 0%, #0a1428 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "'DM Sans', sans-serif",
  },
  box: {
    background: "rgba(10, 20, 40, 0.9)",
    border: "1px solid rgba(59, 130, 246, 0.2)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "50px 40px",
    maxWidth: "450px",
    width: "100%",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
  },
  heading: {
    color: "#f1f5f9",
    fontSize: "28px",
    fontWeight: 800,
    margin: "0 0 8px",
    textAlign: "center",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "14px",
    textAlign: "center",
    margin: "0 0 32px",
  },
  errorBox: {
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.5)",
    color: "#fca5a5",
    padding: "12px 16px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: 500,
  },
  successBox: {
    background: "rgba(34, 197, 94, 0.15)",
    border: "1px solid rgba(34, 197, 94, 0.5)",
    color: "#86efac",
    padding: "12px 16px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: 500,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginBottom: "24px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    color: "#cbd5e1",
    fontSize: "13px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    padding: "14px 16px",
    background: "rgba(30, 41, 59, 0.8)",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    borderRadius: "10px",
    color: "#f1f5f9",
    fontSize: "15px",
    fontFamily: "inherit",
    transition: "all 0.2s",
    outline: "none",
  },
  btn: {
    padding: "14px 24px",
    background: "linear-gradient(135deg, #3b82f6 0%, #6d28d9 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "8px",
    transition: "all 0.3s",
    boxShadow: "0 8px 24px rgba(59, 130, 246, 0.4)",
  },
  divider: {
    textAlign: "center",
    color: "#64748b",
    margin: "24px 0",
    fontSize: "13px",
  },
  loginLink: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "14px",
    margin: 0,
  },
  link: {
    color: "#3b82f6",
    textDecoration: "none",
    fontWeight: 600,
    transition: "color 0.2s",
  },
};

const css = `
  input:focus {
    border-color: rgba(59, 130, 246, 0.8) !important;
    background: rgba(30, 41, 59, 1) !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(59, 130, 246, 0.5);
  }

  a {
    cursor: pointer;
  }
`;