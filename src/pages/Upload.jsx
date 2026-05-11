import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

const AMENITIES_LIST = [
  "WiFi","Parking","AC/Cooler","Water Tank","Generator","Security Fence",
  "Balcony","TV","Refrigerator","Cooking Stove","Bed","Sofa","Dining Table",
  "Shower","Kitchen Cabinet","Wardrobes","Ceiling Fans","Lights",
  "24/7 Security","Swimming Pool","Gym","Garden","Workspace","Pet Friendly",
];

const PROPERTY_TYPES = [
  "Bedsitter","Studio Apartment","1 Bedroom","2 Bedroom","3 Bedroom",
  "4+ Bedroom","Maisonette","Bungalow","Townhouse","Apartment Block",
  "Single Room","Shared Room","Hostel Room","Commercial Office",
  "Shop / Retail Space","Warehouse","Plot / Land","Furnished Apartment",
  "Unfurnished Apartment","Penthouse","Duplex"
];

const COUNTIES = [
  "Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita Taveta",
  "Garissa","Wajir","Mandera","Marsabit","Isiolo","Meru","Tharaka Nithi",
  "Embu","Kitui","Machakos","Makueni","Nyandarua","Nyeri","Kirinyaga",
  "Murang’a","Kiambu","Turkana","West Pokot","Samburu","Trans Nzoia",
  "Uasin Gishu","Elgeyo Marakwet","Nandi","Baringo","Laikipia","Nakuru",
  "Narok","Kajiado","Kericho","Bomet","Kakamega","Vihiga","Bungoma",
  "Busia","Siaya","Kisumu","Homa Bay","Migori","Kisii","Nyamira",
  "Nairobi City"
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "furnished" || name === "initiallyBooked") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    const floatFields = ["price", "deposit"];
    const intFields = ["bedrooms", "bathrooms", "totalUnits", "bookedUnits"];

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox"
        ? checked
        : floatFields.includes(name)
          ? parseFloat(value) || ""
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
      setError("⚠️ Maximum 10 images allowed");
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
      setError("❌ Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
        }));
      },
      () => setError("❌ Unable to get location. Please enter manually.")
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title || !formData.description || !formData.location ||
        !formData.price || !formData.bedrooms || !formData.bathrooms ||
        !formData.propertyType || !formData.county) {
      setError("❌ Please fill all required fields");
      return;
    }
    if (images.length === 0) {
      setError("❌ Please upload at least one image");
      return;
    }
    if (formData.amenities.length === 0) {
      setError("❌ Please select at least one amenity");
      return;
    }
    if (formData.bookedUnits > formData.totalUnits) {
      setError("❌ Booked units cannot be more than total units");
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

      // ✅ FIXED: Correct endpoint
      const response = await fetch(`${API_BASE}/properties`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log("Upload success:", result);

      setSuccess("✅ Property submitted successfully! Pending admin approval. You can mark units as booked/unbooked from your dashboard.");

      // Reset form
      setFormData({
        title: "", description: "", location: "", price: "", deposit: "",
        bedrooms: "", bathrooms: "", amenities: [], totalUnits: 1,
        furnished: false, leaseType: "monthly", availableFrom: "", rules: "",
        propertyType: "", county: "", lat: "", lng: "",
        bookedUnits: 0, initiallyBooked: false,
      });
      setImages([]);
      setImagePreviews([]);

      setTimeout(() => navigate("/dashboard"), 2800);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Error uploading property. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={styles.container}>
        <style>{cssStyles}</style>
        <div style={styles.unauth}>
          <p>🔐 Please login to upload a property</p>
          <button onClick={() => navigate("/login")} style={styles.loginBtn}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{cssStyles}</style>
      <div style={styles.formBox}>
        <h1 style={styles.heading}>📝 Upload Your Property</h1>
        <p style={styles.subtitle}>List your rental property on Axx Spaces</p>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Property Title <span style={styles.required}>*</span></label>
            <input type="text" name="title" placeholder="e.g., Modern 2BR Apartment with balcony" value={formData.title} onChange={handleChange} style={styles.input} required />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Property Type <span style={styles.required}>*</span></label>
              <select name="propertyType" value={formData.propertyType} onChange={handleChange} style={styles.input} required>
                <option value="">Select Property Type</option>
                {PROPERTY_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>County <span style={styles.required}>*</span></label>
              <select name="county" value={formData.county} onChange={handleChange} style={styles.input} required>
                <option value="">Select County</option>
                {COUNTIES.map(county => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Location <span style={styles.required}>*</span></label>
            <input type="text" name="location" placeholder="e.g., Nairobi, Westlands" value={formData.location} onChange={handleChange} style={styles.input} required />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Latitude</label>
              <input type="number" name="lat" step="0.000001" placeholder="e.g., -1.2921" value={formData.lat} onChange={handleChange} style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Longitude</label>
              <input type="number" name="lng" step="0.000001" placeholder="e.g., 36.8219" value={formData.lng} onChange={handleChange} style={styles.input} />
            </div>
          </div>
          <button type="button" onClick={getCurrentLocation} style={styles.geoBtn}>
            📍 Get Current Location
          </button>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description <span style={styles.required}>*</span></label>
            <textarea 
              name="description" 
              placeholder="Describe your property in detail..." 
              value={formData.description} 
              onChange={handleChange} 
              style={styles.textarea} 
              rows="6" 
              required 
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Monthly Price (KES) <span style={styles.required}>*</span></label>
              <input type="number" name="price" placeholder="45000" value={formData.price} onChange={handleChange} style={styles.input} min="0" required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Deposit (KES)</label>
              <input type="number" name="deposit" placeholder="45000" value={formData.deposit} onChange={handleChange} style={styles.input} min="0" />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Bedrooms <span style={styles.required}>*</span></label>
              <input type="number" name="bedrooms" placeholder="2" value={formData.bedrooms} onChange={handleChange} style={styles.input} min="0" required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Bathrooms <span style={styles.required}>*</span></label>
              <input type="number" name="bathrooms" placeholder="1" value={formData.bathrooms} onChange={handleChange} style={styles.input} min="0" required />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Furnished</label>
              <select name="furnished" value={String(formData.furnished)} onChange={handleChange} style={styles.input}>
                <option value="false">Unfurnished</option>
                <option value="true">Fully Furnished</option>
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

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Total Units</label>
              <input type="number" name="totalUnits" placeholder="1" value={formData.totalUnits} onChange={handleChange} style={styles.input} min="1" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Initial Booked Units</label>
              <input type="number" name="bookedUnits" placeholder="0" value={formData.bookedUnits} onChange={handleChange} style={styles.input} min="0" />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <input 
                type="checkbox" 
                name="initiallyBooked" 
                checked={formData.initiallyBooked} 
                onChange={handleChange} 
                style={{ marginRight: "8px" }}
              />
              Mark this property as partially booked on upload
            </label>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Available From</label>
            <input type="date" name="availableFrom" value={formData.availableFrom} onChange={handleChange} style={styles.input} />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>House Rules</label>
            <textarea name="rules" placeholder="e.g., No pets, No smoking indoors..." value={formData.rules} onChange={handleChange} style={styles.textarea} rows="3" />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Upload Images (Max 10) <span style={styles.required}>*</span></label>
            <div style={styles.imageUploadBox}>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} style={styles.fileInput} id="imageInput" />
              <label htmlFor="imageInput" style={styles.fileLabel}>
                <div style={styles.uploadIcon}>📷</div>
                <p>Click to select or drag images here</p>
                <p style={styles.uploadSubtext}>{images.length}/10 images selected</p>
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

          <div style={styles.formGroup}>
            <label style={styles.label}>Amenities <span style={styles.required}>*</span></label>
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
                  {formData.amenities.includes(amenity) ? "✓ " : ""}{amenity}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "⏳ Uploading Property..." : "🚀 Upload Property"}
          </button>
        </form>

        <p style={styles.disclaimer}>
          ℹ️ Your property will be reviewed by our admin team. After approval, you can mark units as booked/unbooked from your dashboard.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "linear-gradient(135deg, #06101f 0%, #0a1428 100%)", padding: "40px 20px", fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont" },
  formBox: { maxWidth: "700px", margin: "0 auto", background: "rgba(10, 20, 40, 0.9)", border: "1px solid rgba(59, 130, 246, 0.2)", backdropFilter: "blur(10px)", borderRadius: "20px", padding: "50px 40px", boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)" },
  heading: { color: "#f1f5f9", fontSize: "28px", fontWeight: 800, margin: "0 0 8px", textAlign: "center" },
  subtitle: { color: "#94a3b8", fontSize: "14px", textAlign: "center", margin: "0 0 32px" },
  errorBox: { background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.5)", color: "#fca5a5", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: 500 },
  successBox: { background: "rgba(34, 197, 94, 0.15)", border: "1px solid rgba(34, 197, 94, 0.5)", color: "#86efac", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: 500 },
  form: { display: "flex", flexDirection: "column", gap: "24px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  label: { color: "#cbd5e1", fontSize: "13px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" },
  required: { color: "#ef4444", fontWeight: 700 },
  input: { padding: "14px 16px", background: "rgba(30, 41, 59, 0.8)", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "10px", color: "#f1f5f9", fontSize: "15px", fontFamily: "inherit", transition: "all 0.2s", outline: "none" },
  textarea: { padding: "14px 16px", background: "rgba(30, 41, 59, 0.8)", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "10px", color: "#f1f5f9", fontSize: "15px", fontFamily: "inherit", transition: "all 0.2s", outline: "none", resize: "vertical" },
  imageUploadBox: { position: "relative", border: "2px dashed rgba(59, 130, 246, 0.5)", borderRadius: "10px", padding: "40px 20px", textAlign: "center", background: "rgba(59, 130, 246, 0.05)", transition: "all 0.3s ease", cursor: "pointer" },
  fileInput: { display: "none" },
  fileLabel: { cursor: "pointer", display: "block", color: "#94a3b8" },
  uploadIcon: { fontSize: "48px", marginBottom: "12px" },
  uploadSubtext: { color: "#94a3b8", fontSize: "12px", margin: "8px 0 0 0" },
  previewContainer: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "12px", marginTop: "16px" },
  previewBox: { position: "relative", width: "100%", aspectRatio: "1", borderRadius: "8px", overflow: "hidden", background: "#1e293b" },
  previewImg: { width: "100%", height: "100%", objectFit: "cover" },
  removeBtn: { position: "absolute", top: "4px", right: "4px", background: "rgba(239, 68, 68, 0.9)", border: "none", color: "white", width: "24px", height: "24px", borderRadius: "50%", cursor: "pointer", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" },
  amenitiesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "8px" },
  amenityBtn: { padding: "10px 12px", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease", textAlign: "center" },
  amenityBtnUnselected: { background: "rgba(30, 41, 59, 0.8)", color: "#cbd5e1" },
  amenityBtnSelected: { background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", color: "white", border: "1px solid #3b82f6" },
  submitBtn: { padding: "14px 24px", background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 700, marginTop: "16px", transition: "all 0.3s", boxShadow: "0 8px 24px rgba(34, 197, 94, 0.4)" },
  disclaimer: { textAlign: "center", color: "#64748b", fontSize: "12px", marginTop: "20px" },
  unauth: { textAlign: "center", color: "#94a3b8", padding: "60px 20px", background: "rgba(30, 41, 59, 0.5)", borderRadius: "12px", border: "2px dashed #475569" },
  loginBtn: { marginTop: "20px", padding: "12px 24px", background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", color: "white", border: "none", borderRadius: "8px", fontSize: "1rem", fontWeight: 600, cursor: "pointer" },
  geoBtn: { padding: "10px 16px", background: "linear-gradient(135deg, #0a84ff, #0066cc)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", marginTop: "8px" },
};

const cssStyles = `
  input:focus, textarea:focus, select:focus {
    border-color: rgba(59, 130, 246, 0.8) !important;
    background: rgba(30, 41, 59, 1) !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  button:hover:not(:disabled) { transform: translateY(-2px); }
  @media (max-width: 600px) {
    [style*="gridTemplateColumns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
  }
`;