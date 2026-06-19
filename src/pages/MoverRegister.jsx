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
    company: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await API.post("/auth/register", { ...formData, role: "mover" });

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
              "Busia", "Homa Bay", "Siaya", "Migori", "Kitui", "Embu", "Murang’a",
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
            name="services"
            placeholder="Services (e.g. House Moving, Office, Packing)"
            value={formData.services}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            type="text"
            name="experience"
            placeholder="Years of Experience (e.g. 5 years)"
            value={formData.experience}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="text"
            name="company"
            placeholder="Company Name (Optional)"
            value={formData.company}
            onChange={handleChange}
            style={styles.input}
          />

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
    maxWidth: "500px",
    width: "100%",
    border: "1px solid #334155"
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
  input: {
    width: "100%",
    padding: "14px",
    margin: "10px 0",
    background: "#0f1729",
    border: "1px solid #475569",
    borderRadius: "8px",
    color: "white"
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