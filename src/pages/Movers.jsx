import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

export default function Movers() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    fromLocation: "",
    toLocation: "",
    moveDate: "",
    propertyType: "",
    itemsCount: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending request (you can connect to backend later)
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 2500);
    }, 1500);
  };

  const moverPackages = [
    {
      title: "Studio / 1 Bedroom",
      price: "8,000 - 15,000",
      description: "Perfect for small apartments",
      icon: "🛏️"
    },
    {
      title: "2-3 Bedroom",
      price: "18,000 - 28,000",
      description: "Most popular package",
      icon: "🏠"
    },
    {
      title: "Full House / 4+ Bedroom",
      price: "35,000 - 55,000",
      description: "Complete relocation service",
      icon: "🏢"
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🚚 Professional Movers</h1>
        <p style={styles.subtitle}>Reliable moving services across Kenya</p>
      </div>

      <div style={styles.packages}>
        <h2 style={styles.sectionTitle}>Choose Your Moving Package</h2>
        <div style={styles.packagesGrid}>
          {moverPackages.map((pkg, index) => (
            <div key={index} style={styles.packageCard}>
              <div style={styles.packageIcon}>{pkg.icon}</div>
              <h3>{pkg.title}</h3>
              <p style={styles.price}>{pkg.price} KES</p>
              <p style={styles.packageDesc}>{pkg.description}</p>
              <button style={styles.selectBtn} onClick={() => navigate("/movers#request")}>
                Select Package
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Request Form */}
      <div id="request" style={styles.formSection}>
        <h2 style={styles.formTitle}>Request Moving Quote</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <input
              type="text"
              name="name"
              placeholder="Your Full Name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number (07xxxxxxxx)"
              value={formData.phone}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <input
              type="text"
              name="fromLocation"
              placeholder="Moving From (County/Area)"
              value={formData.fromLocation}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <input
              type="text"
              name="toLocation"
              placeholder="Moving To (County/Area)"
              value={formData.toLocation}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <input
              type="date"
              name="moveDate"
              value={formData.moveDate}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              style={styles.input}
              required
            >
              <option value="">Select Property Type</option>
              <option value="studio">Studio</option>
              <option value="1bed">1 Bedroom</option>
              <option value="2bed">2 Bedroom</option>
              <option value="3bed">3 Bedroom</option>
              <option value="4plus">4+ Bedroom</option>
            </select>
          </div>

          <textarea
            name="message"
            placeholder="Additional details (number of items, heavy furniture, etc.)"
            value={formData.message}
            onChange={handleChange}
            style={styles.textarea}
          />

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? "Submitting Request..." : "🚚 Get Moving Quote"}
          </button>
        </form>

        {success && (
          <div style={styles.successMsg}>
            ✅ Your moving request has been submitted! A mover will contact you shortly.
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "linear-gradient(135deg, #06101f 0%, #0f1729 100%)",
    minHeight: "100vh",
    color: "#f1f5f9",
    padding: "20px"
  },
  header: { textAlign: "center", marginBottom: "50px" },
  title: { fontSize: "2.8rem", color: "#fbbf24", margin: 0 },
  subtitle: { color: "#94a3b8", fontSize: "1.2rem" },

  packages: { maxWidth: "1100px", margin: "0 auto", marginBottom: "60px" },
  sectionTitle: { textAlign: "center", fontSize: "2.2rem", marginBottom: "40px", color: "#fbbf24" },
  packagesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "25px" },
  packageCard: {
    background: "#1e293b",
    borderRadius: "12px",
    padding: "30px",
    textAlign: "center",
    border: "1px solid #334155"
  },
  packageIcon: { fontSize: "48px", marginBottom: "16px" },
  price: { fontSize: "1.8rem", fontWeight: "700", color: "#22c55e", margin: "12px 0" },
  packageDesc: { color: "#94a3b8", marginBottom: "20px" },
  selectBtn: {
    padding: "12px 28px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%"
  },

  formSection: { maxWidth: "700px", margin: "0 auto", background: "#1e293b", padding: "40px", borderRadius: "16px" },
  formTitle: { textAlign: "center", marginBottom: "30px", color: "#fbbf24" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  input: {
    width: "100%",
    padding: "14px",
    background: "#0f1729",
    border: "1px solid #475569",
    borderRadius: "8px",
    color: "white"
  },
  textarea: {
    width: "100%",
    minHeight: "120px",
    padding: "14px",
    background: "#0f1729",
    border: "1px solid #475569",
    borderRadius: "8px",
    color: "white",
    marginTop: "16px"
  },
  submitBtn: {
    marginTop: "25px",
    width: "100%",
    padding: "16px",
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "1.1rem",
    fontWeight: "700",
    cursor: "pointer"
  },
  successMsg: {
    background: "#166534",
    color: "#86efac",
    padding: "16px",
    borderRadius: "8px",
    textAlign: "center",
    marginTop: "20px"
  }
};