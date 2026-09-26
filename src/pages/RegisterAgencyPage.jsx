import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import PhoneInput from "../components/PhoneInput";
import { KENYA_COUNTIES } from "../features/accommodation";

const counties = KENYA_COUNTIES;

const s = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
    minHeight: "100vh",
    padding: "20px",
  },
  container: {
    maxWidth: "700px",
    margin: "0 auto",
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    padding: "40px 30px",
  },
  title: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#1f2937",
    marginBottom: "8px",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    textAlign: "center",
    marginBottom: "32px",
  },
  section: {
    marginBottom: "24px",
    paddingBottom: "24px",
    borderBottom: "1px solid #e5e7eb",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: "16px",
  },
  field: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 700,
    color: "#374151",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "inherit",
    minHeight: "100px",
    resize: "vertical",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 0.2s",
  },
  error: {
    background: "#fee2e2",
    color: "#dc2626",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "16px",
  },
  success: {
    background: "#dcfce7",
    color: "#16a34a",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "16px",
  },
  infoBox: {
    background: "#fef3c7",
    border: "1px solid #fcd34d",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "12px",
    color: "#92400e",
    marginBottom: "20px",
  },
};

export default function RegisterAgencyPage() {
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  
  // Agency fields
  const [name, setName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [county, setCounty] = useState("");
  const [logo, setLogo] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  
  // Admin user fields
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user) {
      setError("You must be logged in to register an agency. Please log in first.");
      return;
    }

    // Agency validation
    if (!name || !registrationNumber || !phone || !email) {
      setError("Please fill in all required agency fields.");
      return;
    }

    // Admin validation
    if (!adminName || !adminEmail || !adminPhone || !adminPassword) {
      setError("Please fill in all required admin fields.");
      return;
    }

    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";
      const response = await fetch(`${API_BASE}/agencies/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          registrationNumber,
          phone,
          email,
          address,
          county,
          logo,
          description,
          website,
          adminName,
          adminEmail,
          adminPhone,
          adminPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Agency registered successfully! The admin account has been created. You can now log in with the admin credentials.");
        // Reset form
        setName("");
        setRegistrationNumber("");
        setPhone("");
        setEmail("");
        setAddress("");
        setCounty("");
        setLogo("");
        setDescription("");
        setWebsite("");
        setAdminName("");
        setAdminEmail("");
        setAdminPhone("");
        setAdminPassword("");
      } else {
        setError(data.error || "Failed to register agency. Please try again.");
      }
    } catch (err) {
      setError("Failed to register agency. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      <div style={s.container}>
        <h1 style={s.title}>Register Your Agency</h1>
        <p style={s.subtitle}>
          Create an agency account to manage multiple agents and track their performance
        </p>

        <div style={s.infoBox}>
          <strong>What you'll need:</strong> Agency details (name, registration number, contact info), and admin account credentials for the agency manager.
        </div>

        {error && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>{success}</div>}

        {!user && (
          <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: "8px", padding: "16px", marginBottom: "20px", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "#92400e", marginBottom: "12px" }}>
              You need to be logged in to register an agency.
            </p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              style={{
                background: "#fbbf24",
                color: "#1f2937",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Log In
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Agency Information */}
          <div style={s.section}>
            <h2 style={s.sectionTitle}>Agency Information</h2>
            
            <div style={s.field}>
              <label style={s.label}>Agency Name *</label>
              <input
                style={s.input}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nairobi Properties Ltd"
                required
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Registration Number *</label>
              <input
                style={s.input}
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="e.g. BN/2023/123456"
                required
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Agency Phone *</label>
              <PhoneInput
                value={phone}
                onChange={setPhone}
                placeholder="e.g. 0712 345 678"
                required
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Agency Email *</label>
              <input
                style={s.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agency@example.com"
                required
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Address</label>
              <input
                style={s.input}
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Physical address"
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>County</label>
              <select
                style={s.input}
                value={county}
                onChange={(e) => setCounty(e.target.value)}
              >
                <option value="">Select county...</option>
                {counties.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div style={s.field}>
              <label style={s.label}>Website</label>
              <input
                style={s.input}
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Description</label>
              <textarea
                style={s.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about your agency, services offered, and areas of operation..."
              />
            </div>
          </div>

          {/* Admin Account */}
          <div style={s.section}>
            <h2 style={s.sectionTitle}>Agency Admin Account</h2>
            
            <div style={s.field}>
              <label style={s.label}>Admin Name *</label>
              <input
                style={s.input}
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Full name of agency manager"
                required
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Admin Email *</label>
              <input
                style={s.input}
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Admin Phone *</label>
              <PhoneInput
                value={adminPhone}
                onChange={setAdminPhone}
                placeholder="e.g. 0712 345 678"
                required
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Admin Password *</label>
              <input
                style={s.input}
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Create a password"
                required
                minLength="6"
              />
            </div>
          </div>

          <button
            type="submit"
            style={s.button}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register Agency"}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center", fontSize: "12px", color: "#6b7280" }}>
          Already have an agency?{" "}
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "none",
              color: "#3b82f6",
              fontWeight: 700,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Go to homepage
          </button>
        </div>
      </div>
    </div>
  );
}
