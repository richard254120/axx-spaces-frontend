import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_BASE, KENYA_COUNTIES } from "../utils/constants";

const AMENITIES_LIST = [
  "WiFi", "Parking", "AC/Cooler", "Water Tank", "Generator", "Security Fence",
  "Balcony", "TV", "Refrigerator", "Cooking Stove", "Bed", "Sofa", "Dining Table",
  "Shower", "Kitchen Cabinet", "Wardrobes", "Ceiling Fans", "Lights",
  "24/7 Security", "Swimming Pool", "Gym", "Garden", "Workspace", "Pet Friendly",
];

const PROPERTY_TYPES = [
  "Bedsitter", "Studio Apartment", "1 Bedroom", "2 Bedroom", "3 Bedroom",
  "4+ Bedroom", "Maisonette", "Bungalow", "Townhouse", "Apartment Block",
  "Single Room", "Shared Room", "Hostel Room", "Commercial Office",
  "Shop / Retail Space", "Warehouse", "Plot / Land", "Furnished Apartment",
  "Unfurnished Apartment", "Penthouse", "Duplex"
];

export default function Upload() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    deposit: "",
    bedrooms: "",
    bathrooms: "",
    amenities: [],
    totalUnits: 1,
    furnished: false,
    leaseType: "monthly",
    availableFrom: "",
    rules: "",
    propertyType: "",
    county: "",
    lat: "",
    lng: "",
    bookedUnits: 0,
    initiallyBooked: false,
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeSection, setActiveSection] = useState("basic");
  const [consent, setConsent] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "furnished" || name === "initiallyBooked") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    const floatFields = ["price", "deposit", "lat", "lng"];
    const intFields = ["bedrooms", "bathrooms", "totalUnits", "bookedUnits"];

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox"
        ? checked
        : floatFields.includes(name)
          ? value  // keep as string so user can type freely
          : intFields.includes(name)
            ? parseInt(value) || ""
            : value,
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 10) {
      setError("Maximum 10 images allowed");
      return;
    }
    setImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser");
      return;
    }
    setLocLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
        }));
        setLocLoading(false);
      },
      () => {
        setError("Unable to get location. Please enter coordinates manually.");
        setLocLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!consent) {
      setError("Please agree to the terms and conditions");
      return;
    }

    if (!formData.title || !formData.description || !formData.location ||
      !formData.price || !formData.bedrooms || !formData.bathrooms ||
      !formData.propertyType || !formData.county) {
      setError("Fill all required fields");
      return;
    }
    if (images.length === 0) {
      setError("Upload at least one image");
      return;
    }
    if (formData.amenities.length === 0) {
      setError("Select at least one amenity");
      return;
    }
    if (formData.bookedUnits > formData.totalUnits) {
      setError("Booked units cannot exceed total units");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== undefined && formData[key] !== null) {
          if (key === "amenities") {
            formDataToSend.append("amenities", JSON.stringify(formData.amenities));
          } else if (key === "furnished" || key === "initiallyBooked") {
            formDataToSend.append(key, String(formData[key]));
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      images.forEach((image) => formDataToSend.append("images", image));

      const response = await fetch(`${API_BASE}/properties`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Upload failed");
      }

      setSuccess("Property submitted! Pending admin approval.");
      setFormData({
        title: "", description: "", location: "", price: "", deposit: "",
        bedrooms: "", bathrooms: "", amenities: [], totalUnits: 1,
        furnished: false, leaseType: "monthly", availableFrom: "", rules: "",
        propertyType: "", county: "", lat: "", lng: "",
        bookedUnits: 0, initiallyBooked: false,
      });
      setImages([]);
      setImagePreviews([]);
      setConsent(false);

      setTimeout(() => navigate("/dashboard"), 2800);
    } catch (err) {
      setError(err.message || "Error uploading property");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={styles.container}>
        <style>{cssStyles}</style>
        <div style={styles.unauth}>
          <p>Login to upload a property</p>
          <button onClick={() => navigate("/login")} style={styles.loginBtn}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{cssStyles}</style>

      <div style={styles.header}>
        <h1 style={styles.heading}>Upload Property</h1>
        <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>←</button>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}
      {success && <div style={styles.successBox}>{success}</div>}

      {/* SECTION TABS */}
      <div style={styles.sectionTabs}>
        {["basic", "details", "images", "amenities"].map((section) => (
          <button
            key={section}
            style={{ ...styles.sectionTab, ...(activeSection === section && styles.sectionTabActive) }}
            onClick={() => setActiveSection(section)}
          >
            {section === "basic" && "📋"}
            {section === "details" && "🏠"}
            {section === "images" && "📷"}
            {section === "amenities" && "✨"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>

        {/* ── BASIC INFO ── */}
        {activeSection === "basic" && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Basic Info</h2>

            <div style={styles.formGroup}>
              <label style={styles.label}>Title *</label>
              <input type="text" name="title" placeholder="Modern 2BR Apartment" value={formData.title} onChange={handleChange} style={styles.input} required />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Property Type *</label>
              <select name="propertyType" value={formData.propertyType} onChange={handleChange} style={styles.input} required>
                <option value="">Select Type</option>
                {PROPERTY_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>County *</label>
              <select name="county" value={formData.county} onChange={handleChange} style={styles.input} required>
                <option value="">Select County</option>
                {KENYA_COUNTIES.map(county => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Location *</label>
              <input type="text" name="location" placeholder="e.g., Westlands" value={formData.location} onChange={handleChange} style={styles.input} required />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Number of Units *</label>
              <input type="number" name="totalUnits" min="1" value={formData.totalUnits} onChange={handleChange} style={styles.input} required />
            </div>

            {/* ── GPS COORDINATES ── */}
            <div style={styles.gpsCard}>
              <div style={styles.gpsHeader}>
                <span style={styles.gpsTitle}>📍 GPS Coordinates</span>
                <span style={styles.gpsBadge}>Recommended</span>
              </div>
              <p style={styles.gpsHint}>
                Adding coordinates pins your property on the map, making it easier for tenants to find.
              </p>

              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={locLoading}
                style={styles.gpsBtn}
              >
                {locLoading ? "📡 Detecting..." : "📍 Use My Current Location"}
              </button>

              {(formData.lat || formData.lng) && (
                <div style={styles.coordsDisplay}>
                  ✅ {formData.lat}, {formData.lng}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, lat: "", lng: "" }))}
                    style={styles.clearCoordsBtn}
                  >
                    ✕
                  </button>
                </div>
              )}

              <p style={styles.gpsOrDivider}>— or enter manually —</p>

              <div style={styles.twoCol}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Latitude</label>
                  <input
                    type="number"
                    name="lat"
                    step="any"
                    placeholder="-1.292066"
                    value={formData.lat}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Longitude</label>
                  <input
                    type="number"
                    name="lng"
                    step="any"
                    placeholder="36.821945"
                    value={formData.lng}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              </div>

              <p style={styles.gpsTip}>
                💡 Not sure? Open Google Maps, long-press your property location, and copy the coordinates shown.
              </p>
            </div>

            <button type="button" onClick={() => setActiveSection("details")} style={styles.nextBtn}>
              Next →
            </button>
          </div>
        )}

        {/* ── DETAILS ── */}
        {activeSection === "details" && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Details</h2>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description *</label>
              <textarea name="description" placeholder="Describe your property..." value={formData.description} onChange={handleChange} style={styles.textarea} rows="4" required />
            </div>

            <div style={styles.twoCol}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Price (KES) *</label>
                <input type="number" name="price" placeholder="50000" value={formData.price} onChange={handleChange} style={styles.input} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Deposit (KES)</label>
                <input type="number" name="deposit" placeholder="50000" value={formData.deposit} onChange={handleChange} style={styles.input} />
              </div>
            </div>

            <div style={styles.twoCol}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Bedrooms *</label>
                <input type="number" name="bedrooms" placeholder="2" value={formData.bedrooms} onChange={handleChange} style={styles.input} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Bathrooms *</label>
                <input type="number" name="bathrooms" placeholder="1" value={formData.bathrooms} onChange={handleChange} style={styles.input} required />
              </div>
            </div>

            <div style={styles.twoCol}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Furnished</label>
                <select name="furnished" value={String(formData.furnished)} onChange={handleChange} style={styles.input}>
                  <option value="false">Unfurnished</option>
                  <option value="true">Furnished</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Lease Type</label>
                <select name="leaseType" value={formData.leaseType} onChange={handleChange} style={styles.input}>
                  <option value="monthly">Monthly</option>
                  <option value="6months">6 Months</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Available From</label>
              <input type="date" name="availableFrom" value={formData.availableFrom} onChange={handleChange} style={styles.input} />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>House Rules</label>
              <textarea name="rules" placeholder="e.g., No pets..." value={formData.rules} onChange={handleChange} style={styles.textarea} rows="3" />
            </div>

            <div style={styles.navBtns}>
              <button type="button" onClick={() => setActiveSection("basic")} style={styles.prevBtn}>← Back</button>
              <button type="button" onClick={() => setActiveSection("images")} style={styles.nextBtn}>Next →</button>
            </div>
          </div>
        )}

        {/* ── IMAGES ── */}
        {activeSection === "images" && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Images</h2>

            <div style={styles.formGroup}>
              <label style={styles.label}>Upload Images ({images.length}/10) *</label>
              <div style={styles.imageUploadBox}>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} style={styles.fileInput} id="imageInput" />
                <label htmlFor="imageInput" style={styles.fileLabel}>
                  <div style={styles.uploadIcon}>📷</div>
                  <p>Tap to select images</p>
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div style={styles.previewContainer}>
                  {imagePreviews.map((preview, index) => (
                    <div key={index} style={styles.previewBox}>
                      <img src={preview} alt={`Preview ${index + 1}`} style={styles.previewImg} />
                      <button type="button" onClick={() => removeImage(index)} style={styles.removeBtn}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.navBtns}>
              <button type="button" onClick={() => setActiveSection("details")} style={styles.prevBtn}>← Back</button>
              <button type="button" onClick={() => setActiveSection("amenities")} style={styles.nextBtn}>Next →</button>
            </div>
          </div>
        )}

        {/* ── AMENITIES ── */}
        {activeSection === "amenities" && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Amenities</h2>

            <div style={styles.formGroup}>
              <label style={styles.label}>Select Amenities * ({formData.amenities.length})</label>
              <div style={styles.amenitiesGrid}>
                {AMENITIES_LIST.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity)}
                    style={{
                      ...styles.amenityBtn,
                      ...(formData.amenities.includes(amenity) ? styles.amenityBtnSelected : styles.amenityBtnUnselected),
                    }}
                  >
                    {formData.amenities.includes(amenity) ? "✓" : "○"} {amenity}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.consentBox}>
              <label style={styles.consentLabel}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                I confirm that all information provided is accurate and I agree to the terms and conditions of Axxspace.
              </label>
            </div>

            <button type="submit" disabled={loading || !consent} style={{
              ...styles.submitBtn,
              opacity: (!consent || loading) ? 0.5 : 1,
              cursor: (!consent || loading) ? "not-allowed" : "pointer",
            }}>
              {loading ? "Uploading Property..." : "Submit Property for Approval"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

const styles = {
  container: {
    background: "#06101f",
    minHeight: "100vh",
    fontFamily: "'DM Sans', sans-serif",
    color: "#f1f5f9",
    padding: "0",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    borderBottom: "1px solid #1e293b",
    background: "#0f1729",
  },
  heading: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 800,
    color: "#fbbf24",
  },
  backBtn: {
    background: "#1e293b",
    border: "none",
    color: "#fbbf24",
    fontSize: "20px",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  sectionTabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: "0",
    padding: "12px",
    background: "#1e293b",
  },
  sectionTab: {
    background: "#0f1729",
    border: "none",
    color: "#94a3b8",
    padding: "12px 8px",
    fontSize: "20px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  sectionTabActive: {
    background: "#fbbf24",
    color: "#0f1729",
  },
  form: { padding: "16px" },
  section: { animation: "fadeIn 0.3s ease" },
  sectionTitle: {
    margin: "0 0 16px",
    fontSize: "18px",
    fontWeight: 700,
    color: "#fbbf24",
  },
  formGroup: { marginBottom: "16px" },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: 700,
    color: "#cbd5e1",
    marginBottom: "6px",
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    padding: "12px",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#f1f5f9",
    fontSize: "14px",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#f1f5f9",
    fontSize: "14px",
    fontFamily: "inherit",
    boxSizing: "border-box",
    resize: "vertical",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },

  // ── GPS CARD ──
  gpsCard: {
    background: "rgba(251,191,36,0.05)",
    border: "1px solid rgba(251,191,36,0.25)",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "20px",
  },
  gpsHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "6px",
  },
  gpsTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#fbbf24",
  },
  gpsBadge: {
    fontSize: "10px",
    fontWeight: 700,
    background: "rgba(251,191,36,0.15)",
    color: "#fbbf24",
    padding: "2px 8px",
    borderRadius: "20px",
    letterSpacing: "0.5px",
  },
  gpsHint: {
    fontSize: "12px",
    color: "#94a3b8",
    marginBottom: "12px",
    lineHeight: 1.5,
  },
  gpsBtn: {
    width: "100%",
    padding: "11px",
    background: "#fbbf24",
    color: "#0f1729",
    border: "none",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "inherit",
    marginBottom: "10px",
  },
  coordsDisplay: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(34,197,94,0.1)",
    border: "1px solid rgba(34,197,94,0.3)",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "13px",
    color: "#86efac",
    fontWeight: 600,
    marginBottom: "10px",
  },
  clearCoordsBtn: {
    background: "none",
    border: "none",
    color: "#86efac",
    cursor: "pointer",
    fontSize: "14px",
    padding: "0 4px",
  },
  gpsOrDivider: {
    textAlign: "center",
    fontSize: "11px",
    color: "#475569",
    margin: "8px 0",
  },
  gpsTip: {
    fontSize: "11px",
    color: "#475569",
    marginTop: "8px",
    lineHeight: 1.5,
  },

  imageUploadBox: {
    border: "2px dashed #334155",
    borderRadius: "8px",
    padding: "24px 12px",
    textAlign: "center",
    background: "#1e293b",
    cursor: "pointer",
  },
  fileInput: { display: "none" },
  fileLabel: {
    cursor: "pointer",
    display: "block",
    color: "#94a3b8",
  },
  uploadIcon: { fontSize: "32px", marginBottom: "8px" },
  previewContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))",
    gap: "10px",
    marginTop: "12px",
  },
  previewBox: {
    position: "relative",
    aspectRatio: "1",
    borderRadius: "8px",
    overflow: "hidden",
    background: "#334155",
  },
  previewImg: { width: "100%", height: "100%", objectFit: "cover" },
  removeBtn: {
    position: "absolute",
    top: "2px",
    right: "2px",
    background: "#ef4444",
    border: "none",
    color: "white",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "10px",
  },
  amenitiesGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  },
  amenityBtn: {
    padding: "10px 8px",
    border: "1px solid #334155",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    background: "#1e293b",
    color: "#cbd5e1",
    fontFamily: "inherit",
  },
  amenityBtnSelected: {
    background: "#3b82f6",
    color: "white",
    border: "1px solid #3b82f6",
  },
  amenityBtnUnselected: {
    background: "#1e293b",
    color: "#cbd5e1",
  },
  navBtns: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginTop: "20px",
  },
  prevBtn: {
    padding: "12px",
    background: "#334155",
    color: "#f1f5f9",
    border: "none",
    borderRadius: "8px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "14px",
    fontFamily: "inherit",
  },
  nextBtn: {
    padding: "12px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "14px",
    fontFamily: "inherit",
  },
  submitBtn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "16px",
    fontFamily: "inherit",
  },
  errorBox: {
    background: "rgba(239, 68, 68, 0.2)",
    border: "1px solid #ef4444",
    color: "#fca5a5",
    padding: "12px 16px",
    margin: "16px",
    borderRadius: "8px",
    fontSize: "13px",
  },
  successBox: {
    background: "rgba(34, 197, 94, 0.2)",
    border: "1px solid #22c55e",
    color: "#86efac",
    padding: "12px 16px",
    margin: "16px",
    borderRadius: "8px",
    fontSize: "13px",
  },
  unauth: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#94a3b8",
  },
  loginBtn: {
    marginTop: "20px",
    padding: "12px 24px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 700,
    fontFamily: "inherit",
  },
  consentBox: {
    margin: "20px 0",
    padding: "12px",
    background: "rgba(251,191,36,0.1)",
    border: "1px solid #fbbf24",
    borderRadius: "8px",
  },
  consentLabel: {
    fontSize: "13px",
    color: "#cbd5e1",
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    cursor: "pointer",
  },
};

const cssStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  input:focus, textarea:focus, select:focus {
    border-color: #3b82f6 !important;
    background: #334155 !important;
    outline: none;
  }

  button:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @media (max-width: 480px) {
    [style*="padding: 16px"] {
      padding: 12px !important;
    }
  }
`;