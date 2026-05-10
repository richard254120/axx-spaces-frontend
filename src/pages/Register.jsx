import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo.jpeg";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("landlord"); // landlord or mover

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    // Mover extra fields
    county: "",
    services: [],
    experienceYears: "",
    vehicleType: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const moverServicesList = [
    "Household Moving", "Office Relocation", "Furniture Moving",
    "Heavy Goods Transport", "Packing Services", "Storage Services",
    "Vehicle Transportation", "International Moving"
  ];

  const counties = [
    "Nairobi City","Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita Taveta",
    "Garissa","Wajir","Mandera","Marsabit","Isiolo","Meru","Tharaka Nithi","Embu",
    "Kitui","Machakos","Makueni","Nyandarua","Nyeri","Kirinyaga","Murang’a","Kiambu",
    "Turkana","West Pokot","Samburu","Trans Nzoia","Uasin Gishu","Elgeyo Marakwet",
    "Nandi","Baringo","Laikipia","Nakuru","Narok","Kajiado","Kericho","Bomet",
    "Kakamega","Vihiga","Bungoma","Busia","Siaya","Kisumu","Homa Bay","Migori",
    "Kisii","Nyamira"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceToggle = (service) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError("❌ All fields are required");
      return;
    }
    if (formData.password.length < 6) {
      setError("❌ Password must be at least 6 characters");
      return;
    }
    if (activeTab === "mover" && (!formData.county || formData.services.length === 0)) {
      setError("❌ Please select county and at least one service");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: activeTab,   // "landlord" or "mover"
        ...(activeTab === "mover" && {
          county: formData.county,
          services: formData.services,
          experienceYears: Number(formData.experienceYears) || 0,
          vehicleType: formData.vehicleType,
          description: formData.description,
        })
      };

      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Registration failed");

      setSuccess("✅ Registration successful! Logging you in...");

      login(data.token, data.user);

      setTimeout(() => {
        if (data.user?.role === "mover") {
          navigate("/movers");
        } else {
          navigate("/dashboard");
        }
      }, 1500);

    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>

      <div style={styles.container}>
        <div style={styles.logoSection}>
          <img src={logo} alt="Axx Spaces" style={styles.logo} />
        </div>

        <div style={styles.formBox}>
          <h1 style={styles.title}>📝 Create Your Account</h1>
          <p style={styles.subtitle}>Join Kenya's fastest-growing rental platform</p>

          {/* TABS */}
          <div style={styles.tabs}>
            <button
              style={{ ...styles.tabBtn, ...(activeTab === "landlord" && styles.tabBtnActive) }}
              onClick={() => setActiveTab("landlord")}
            >
              🏠 Register as Landlord
            </button>
            <button
              style={{ ...styles.tabBtn, ...(activeTab === "mover" && styles.tabBtnActive) }}
              onClick={() => setActiveTab("mover")}
            >
              🚚 Register as Mover
            </button>
          </div>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* ==================== YOUR ORIGINAL LANDLORD FORM (UNTOUCHED) ==================== */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input type="text" name="name" placeholder="e.g., John Doe" value={formData.name} onChange={handleChange} style={styles.input} required />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input type="email" name="email" placeholder="e.g., john@example.com" value={formData.email} onChange={handleChange} style={styles.input} required />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number</label>
              <input type="tel" name="phone" placeholder="e.g., 254712345678" value={formData.phone} onChange={handleChange} style={styles.input} required />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input type="password" name="password" placeholder="Min 6 characters" value={formData.password} onChange={handleChange} style={styles.input} required />
            </div>

            {/* ==================== MOVER ONLY FIELDS ==================== */}
            {activeTab === "mover" && (
              <>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Primary County of Operation</label>
                  <select name="county" value={formData.county} onChange={handleChange} style={styles.input} required>
                    <option value="">Select County</option>
                    {counties.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Services Offered (Select all that apply)</label>
                  <div style={styles.amenitiesGrid}>
                    {moverServicesList.map(service => (
                      <label key={service} style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={formData.services.includes(service)}
                          onChange={() => handleServiceToggle(service)}
                        />
                        {service}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={styles.col}>
                    <label style={styles.label}>Years of Experience</label>
                    <input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} style={styles.input} placeholder="e.g. 5" />
                  </div>
                  <div style={styles.col}>
                    <label style={styles.label}>Vehicle Type</label>
                    <input type="text" name="vehicleType" value={formData.vehicleType} onChange={handleChange} style={styles.input} placeholder="Lorry, Pickup, Van etc." />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Brief Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    style={styles.textarea}
                    rows="3"
                    placeholder="We offer careful household and office moving services across Nairobi..."
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "⏳ Creating Account..." : `Register as ${activeTab === "landlord" ? "Landlord" : "Mover"}`}
            </button>
          </form>

          <div style={styles.divider}></div>

          <p style={styles.footer}>
            Already have an account?{" "}
            <Link to="/login" style={styles.link}>Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ====================== STYLES ====================== */
const styles = {
  root: { fontFamily: "'DM Sans', sans-serif", background: "linear-gradient(135deg, #ffffff 0%, #fef3e2 50%, #fef9e7 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
  container: { width: "100%", maxWidth: "520px" },
  logoSection: { textAlign: "center", marginBottom: "40px" },
  logo: { height: "80px", width: "auto" },
  formBox: { background: "white", border: "2px solid #fbbf24", borderRadius: "16px", padding: "40px 32px", boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)" },
  title: { fontSize: "28px", fontWeight: 800, color: "#1f2937", margin: "0 0 8px", textAlign: "center" },
  subtitle: { fontSize: "14px", color: "#6b7280", margin: "0 0 24px", textAlign: "center" },
  tabs: { display: "flex", background: "#f3f4f6", borderRadius: "8px", padding: "4px", marginBottom: "24px" },
  tabBtn: { flex: 1, padding: "12px", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer", background: "transparent", color: "#6b7280" },
  tabBtnActive: { background: "white", color: "#1f2937", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  error: { background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", fontWeight: 500 },
  success: { background: "#dcfce7", border: "1px solid #86efac", color: "#166534", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", fontWeight: 500 },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" },
  input: { padding: "12px 14px", border: "2px solid #d1d5db", borderRadius: "8px", fontSize: "15px", fontFamily: "inherit", transition: "all 0.2s", background: "#f9fafb" },
  textarea: { padding: "12px 14px", border: "2px solid #d1d5db", borderRadius: "8px", fontSize: "15px", minHeight: "90px", resize: "vertical" },
  row: { display: "flex", gap: "16px" },
  col: { flex: 1 },
  amenitiesGrid: { display: "flex", flexWrap: "wrap", gap: "10px" },
  checkboxLabel: { display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", cursor: "pointer" },
  submitBtn: { padding: "13px 24px", background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", color: "white", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)", marginTop: "8px" },
  divider: { height: "1px", background: "#e5e7eb", margin: "20px 0" },
  footer: { textAlign: "center", color: "#6b7280", fontSize: "14px", margin: 0 },
  link: { color: "#ef4444", textDecoration: "none", fontWeight: 700 },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');
  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: #ef4444 !important;
    background: white !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }
  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4) !important;
  }
`;