import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import PhoneInput from "../components/PhoneInput";

export default function MoverRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    county: "",
    services: "",
    experience: "",
    company: "",
    description: "",
    vehicleType: "",
    baseRate: "",
    rateType: "per_job",
    minCharge: "",
    hasInsurance: false,
    insuranceProvider: "",
    coverageAmount: "",
    teamSize: "1",
    specialties: "",
    serviceAreas: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Prepare the data for submission
      const submissionData = {
        ...formData,
        role: "mover",
        experienceYears: parseInt(formData.experience) || 0,
        services: formData.services.split(',').map(s => s.trim()).filter(s => s),
        pricing: {
          baseRate: parseFloat(formData.baseRate) || 0,
          rateType: formData.rateType,
          minCharge: parseFloat(formData.minCharge) || 0,
          additionalServices: []
        },
        insurance: {
          hasInsurance: formData.hasInsurance,
          provider: formData.insuranceProvider,
          coverageAmount: parseFloat(formData.coverageAmount) || 0,
          expiryDate: null
        },
        teamInfo: {
          teamSize: parseInt(formData.teamSize) || 1,
          teamMembers: []
        },
        specialties: formData.specialties.split(',').map(s => s.trim()).filter(s => s),
        serviceAreas: formData.serviceAreas.split(',').map(s => s.trim()).filter(s => s)
      };

      const res = await API.post("/auth/register", submissionData);

      setMessage("✅ Mover registration successful! Please check your email to verify your account.");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.error || "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🚚 Register as a Professional Mover</h1>
        <p style={styles.subtitle}>Join Axxspace Movers Network</p>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Basic Information</h3>
            <input
              type="text"
              name="name"
              placeholder="Full Name or Company Name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Create Password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <PhoneInput
              name="phone"
              value={formData.phone}
              onChange={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
              style={styles.input}
              required
            />

            <select
              name="county"
              value={formData.county}
              onChange={handleChange}
              style={styles.input}
              required
            >
              <option value="">Select Operating County</option>
              {[
                "Nairobi City", "Mombasa", "Kiambu", "Nakuru", "Uasin Gishu", "Kisumu",
                "Kakamega", "Machakos", "Kajiado", "Kilifi", "Meru", "Nyeri", "Bungoma",
                "Busia", "Homa Bay", "Siaya", "Migori", "Kitui", "Embu", "Murang'a",
                "Kirinyaga", "Tharaka Nithi", "Laikipia", "Baringo", "Nandi", "Kericho",
                "Bomet", "Vihiga", "Trans Nzoia", "West Pokot", "Turkana", "Samburu",
                "Mandera", "Wajir", "Garissa", "Tana River", "Lamu", "Taita Taveta",
                "Marsabit", "Isiolo", "Nyandarua", "Nyamira", "Elgeyo Marakwet"
              ].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <input
              type="text"
              name="company"
              placeholder="Company Name (Optional)"
              value={formData.company}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* Services & Experience */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Services & Experience</h3>
            <textarea
              name="services"
              placeholder="Services (comma-separated, e.g. House Moving, Office Relocation, Packing)"
              value={formData.services}
              onChange={handleChange}
              style={styles.textarea}
              required
            />

            <input
              type="text"
              name="experience"
              placeholder="Years of Experience (e.g. 5)"
              value={formData.experience}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="">Primary Vehicle Type</option>
              <option value="Pickup">Pickup Truck</option>
              <option value="Van">Van</option>
              <option value="Lorry">Lorry</option>
              <option value="Truck">Truck</option>
              <option value="Motorbike">Motorbike</option>
            </select>

            <textarea
              name="description"
              placeholder="Describe your business and why customers should choose you..."
              value={formData.description}
              onChange={handleChange}
              style={styles.textarea}
            />
          </div>

          {/* Pricing */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Pricing Information</h3>
            <input
              type="number"
              name="baseRate"
              placeholder="Base Rate (KES)"
              value={formData.baseRate}
              onChange={handleChange}
              style={styles.input}
            />

            <select
              name="rateType"
              value={formData.rateType}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="per_job">Per Job</option>
              <option value="hourly">Hourly</option>
              <option value="per_km">Per Kilometer</option>
              <option value="fixed">Fixed Price</option>
            </select>

            <input
              type="number"
              name="minCharge"
              placeholder="Minimum Charge (KES)"
              value={formData.minCharge}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* Insurance */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Insurance Information</h3>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="hasInsurance"
                checked={formData.hasInsurance}
                onChange={handleChange}
                style={styles.checkbox}
              />
              <span>I have insurance coverage</span>
            </label>

            {formData.hasInsurance && (
              <>
                <input
                  type="text"
                  name="insuranceProvider"
                  placeholder="Insurance Provider Name"
                  value={formData.insuranceProvider}
                  onChange={handleChange}
                  style={styles.input}
                />

                <input
                  type="number"
                  name="coverageAmount"
                  placeholder="Coverage Amount (KES)"
                  value={formData.coverageAmount}
                  onChange={handleChange}
                  style={styles.input}
                />
              </>
            )}
          </div>

          {/* Team & Specialties */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Team & Specialties</h3>
            <input
              type="number"
              name="teamSize"
              placeholder="Team Size"
              value={formData.teamSize}
              onChange={handleChange}
              style={styles.input}
              min="1"
            />

            <textarea
              name="specialties"
              placeholder="Specialties (comma-separated, e.g. Piano Moving, Fragile Items, Heavy Lifting)"
              value={formData.specialties}
              onChange={handleChange}
              style={styles.textarea}
            />

            <textarea
              name="serviceAreas"
              placeholder="Service Areas (comma-separated counties/areas)"
              value={formData.serviceAreas}
              onChange={handleChange}
              style={styles.textarea}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? "Registering..." : "Register as Mover"}
          </button>
        </form>

        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #06101f 0%, #0f1729 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px"
  },
  card: {
    background: "#1e293b",
    padding: "40px",
    borderRadius: "16px",
    maxWidth: "600px",
    width: "100%",
    border: "1px solid #334155",
    maxHeight: "90vh",
    overflowY: "auto"
  },
  title: {
    textAlign: "center",
    color: "#fbbf24",
    fontSize: "2rem",
    marginBottom: "8px"
  },
  subtitle: {
    textAlign: "center",
    color: "#94a3b8",
    marginBottom: "30px"
  },
  section: {
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: "1px solid #334155"
  },
  sectionTitle: {
    color: "#fbbf24",
    fontSize: "1.2rem",
    marginBottom: "15px",
    fontWeight: "600"
  },
  input: {
    width: "100%",
    padding: "14px",
    margin: "10px 0",
    background: "#0f1729",
    border: "1px solid #475569",
    borderRadius: "8px",
    color: "white"
  },
  textarea: {
    width: "100%",
    padding: "14px",
    margin: "10px 0",
    background: "#0f1729",
    border: "1px solid #475569",
    borderRadius: "8px",
    color: "white",
    minHeight: "80px",
    resize: "vertical",
    fontFamily: "inherit"
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#94a3b8",
    margin: "10px 0",
    cursor: "pointer"
  },
  checkbox: {
    width: "20px",
    height: "20px",
    cursor: "pointer"
  },
  submitBtn: {
    width: "100%",
    padding: "16px",
    background: "#22c55e",
    color: "black",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700",
    marginTop: "20px",
    cursor: "pointer"
  },
  message: {
    textAlign: "center",
    marginTop: "20px",
    padding: "12px",
    borderRadius: "8px",
    fontWeight: "600"
  }
};