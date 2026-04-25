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

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/register", formData);
      
      login(res.data.token, res.data.user);
      alert("Registration successful! Welcome to Axx Spaces.");
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Landlord Registration</h2>
      
      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          name="name"
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          name="email"
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          name="phone"
          type="tel"
          placeholder="Phone Number (07xxxxxxxx)"
          value={formData.phone}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          name="password"
          type="password"
          placeholder="Create Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? "Creating Account..." : "Register as Landlord"}
        </button>
      </form>

      <p style={styles.loginLink}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "420px",
    margin: "80px auto",
    padding: "40px 30px",
    background: "#111",
    borderRadius: "16px",
    textAlign: "center",
  },
  heading: { color: "#fff", marginBottom: "20px" },
  error: { color: "#ff4d4d", marginBottom: "15px" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: {
    padding: "14px",
    background: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "16px",
  },
  btn: {
    padding: "14px",
    background: "#0a84ff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "17px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
  },
  loginLink: {
    marginTop: "20px",
    color: "#aaa",
  },
};