import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import PhoneInput from "../components/PhoneInput";
import { KENYA_COUNTIES } from "../features/accommodation";
import { resolveMediaUrl } from "../utils/fileLinks";

const counties = KENYA_COUNTIES;

const s = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    background: "linear-gradient(135deg, #fef9c3 0%, #fde68a 100%)",
    minHeight: "100vh",
    padding: "20px",
  },
  container: {
    maxWidth: "600px",
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
  field: {
    marginBottom: "20px",
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
    minHeight: "120px",
    resize: "vertical",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "#fbbf24",
    color: "#1f2937",
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

export default function BecomeAgentPage() {
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const [phone, setPhone] = useState("");
  const [county, setCounty] = useState("");
  const [bio, setBio] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [idPhotoFront, setIdPhotoFront] = useState(null);
  const [selfiePhoto, setSelfiePhoto] = useState(null);
  const [idPhotoFrontUrl, setIdPhotoFrontUrl] = useState("");
  const [selfiePhotoUrl, setSelfiePhotoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "verification");

    try {
      const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";
      const response = await fetch(`${API_BASE}/uploads`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const fileUrl = data.url || data.fileUrl || data.path;
        if (type === "idPhotoFront") {
          setIdPhotoFrontUrl(fileUrl);
        } else if (type === "selfiePhoto") {
          setSelfiePhotoUrl(fileUrl);
        }
      } else {
        setError(data.error || "Failed to upload file");
      }
    } catch (err) {
      setError("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user) {
      setError("You must be logged in to apply as an agent. Please log in first.");
      return;
    }

    if (!phone || !county || !bio || !idNumber || !idPhotoFrontUrl || !selfiePhotoUrl) {
      setError("Please fill in all required fields and upload both ID photo and selfie.");
      return;
    }

    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";
      const response = await fetch(`${API_BASE}/agents/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone,
          county,
          bio,
          idNumber,
          idPhotoFront: idPhotoFrontUrl,
          selfiePhoto: selfiePhotoUrl
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Application submitted successfully! Your application is pending verification. You will be notified once approved.");
        setPhone("");
        setCounty("");
        setBio("");
        setIdNumber("");
        setIdPhotoFront(null);
        setSelfiePhoto(null);
        setIdPhotoFrontUrl("");
        setSelfiePhotoUrl("");
      } else {
        setError(data.error || "Failed to submit application. Please try again.");
      }
    } catch (err) {
      setError("Failed to submit application. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      <div style={s.container}>
        <h1 style={s.title}>Become a Rental Agent</h1>
        <p style={s.subtitle}>
          Join our network of verified rental agents and help guests find their perfect accommodation
        </p>

        <div style={s.infoBox}>
          <strong>What you'll need:</strong> A valid phone number, your county of operation, a brief bio about your experience, your national ID number, and photos of your ID and a selfie for verification.
        </div>

        {error && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>{success}</div>}

        {!user && (
          <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: "8px", padding: "16px", marginBottom: "20px", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "#92400e", marginBottom: "12px" }}>
              You need to be logged in to apply as an agent.
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
          <div style={s.field}>
            <label style={s.label}>Phone Number *</label>
            <PhoneInput
              value={phone}
              onChange={setPhone}
              placeholder="e.g. 0712 345 678"
              required
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>County of Operation *</label>
            <select
              style={s.input}
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              required
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
            <label style={s.label}>Bio / Experience *</label>
            <textarea
              style={s.textarea}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about your experience in the rental market, areas you specialize in, and what makes you a great agent..."
              required
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>National ID Number *</label>
            <input
              style={s.input}
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="Enter your national ID number"
              required
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>ID Photo (Front) *</label>
            <input
              style={s.input}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setIdPhotoFront(file);
                  handleFileUpload(file, "idPhotoFront");
                }
              }}
              required
            />
            {idPhotoFrontUrl && (
              <img
                src={resolveMediaUrl(idPhotoFrontUrl)}
                alt="ID Front"
                style={{ width: "100%", maxWidth: "200px", marginTop: "10px", borderRadius: "8px" }}
              />
            )}
          </div>

          <div style={s.field}>
            <label style={s.label}>Selfie Photo *</label>
            <input
              style={s.input}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setSelfiePhoto(file);
                  handleFileUpload(file, "selfiePhoto");
                }
              }}
              required
            />
            {selfiePhotoUrl && (
              <img
                src={resolveMediaUrl(selfiePhotoUrl)}
                alt="Selfie"
                style={{ width: "100%", maxWidth: "200px", marginTop: "10px", borderRadius: "8px" }}
              />
            )}
          </div>

          <button
            type="submit"
            style={s.button}
            disabled={loading || uploading}
          >
            {loading ? "Submitting..." : uploading ? "Uploading..." : "Submit Application"}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center", fontSize: "12px", color: "#6b7280" }}>
          Already an agent?{" "}
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "none",
              color: "#fbbf24",
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
