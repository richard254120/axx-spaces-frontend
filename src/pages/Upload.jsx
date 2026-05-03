import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

export default function Upload() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (!token) {
      alert("❌ Please login first to upload a property");
      navigate("/login");
    }
  }, [token, navigate]);

  const [form, setForm] = useState({
    title: "",
    county: "",
    area: "",
    price: "",
    deposit: "",
    type: "",
    bedrooms: "",
    bathrooms: "",
    amenities: [],
    description: "",
    phone: "",
    images: [],
    lat: "",
    lng: "",
    size: "",
    floor: "",
    yearBuilt: "",
    furnishing: "",
    parking: "",
    petPolicy: "",
    utilitiesIncluded: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [completionPercent, setCompletionPercent] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const counties = [
    "Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita Taveta",
    "Garissa","Wajir","Mandera","Marsabit","Isiolo","Meru","Tharaka Nithi",
    "Embu","Kitui","Machakos","Makueni","Nyandarua","Nyeri","Kirinyaga",
    "Murang'a","Kiambu","Turkana","West Pokot","Samburu","Trans Nzoia",
    "Uasin Gishu","Elgeyo Marakwet","Nandi","Baringo","Laikipia","Nakuru",
    "Narok","Kajiado","Kericho","Bomet","Kakamega","Vihiga","Bungoma",
    "Busia","Siaya","Kisumu","Homa Bay","Migori","Kisii","Nyamira","Nairobi City"
  ];

  const propertyTypes = [
    "Bedsitter","Studio Apartment","1 Bedroom","2 Bedroom","3 Bedroom",
    "4+ Bedroom","Maisonette","Bungalow","Townhouse","Apartment Block",
    "Single Room","Shared Room","Hostel Room","Commercial Office",
    "Shop / Retail Space","Warehouse","Plot / Land"
  ];

  const amenitiesList = ["Water","Electricity","Parking","Security","WiFi","Borehole","Furnished","AC","TV","Gym"];

  const formatPhoneForSubmit = (phone) => {
    if (!phone) return "";
    let num = phone.toString().trim().replace(/\s+/g, "");
    if (num.startsWith("0")) num = num.substring(1);
    if (!num.startsWith("254")) num = "254" + num;
    return num;
  };

  const allowedFields = [
    "title", "county", "area", "price", "deposit", "type",
    "bedrooms", "bathrooms", "description", "phone", "amenities",
    "lat", "lng", "size", "floor", "yearBuilt", "furnishing",
    "parking", "petPolicy", "utilitiesIncluded"
  ];

  const sanitizeForm = (data) => {
    const clean = {};
    allowedFields.forEach(key => {
      if (data[key] !== undefined) clean[key] = data[key];
    });
    return clean;
  };

  const calcCompletion = () => {
    const fields = [form.title, form.county, form.area, form.price, form.type, form.bedrooms, form.description, form.phone, form.images.length > 0];
    const filled = fields.filter(f => f && f.toString().trim()).length;
    return Math.round((filled / fields.length) * 100);
  };

  const updateFormAndCompletion = (updates) => {
    const newForm = { ...form, ...updates };
    setForm(newForm);
    setCompletionPercent(calcCompletion());
  };

  const getMyLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => updateFormAndCompletion({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert("❌ Location permission denied")
    );
  };

  const handleChange = (e) => updateFormAndCompletion({ [e.target.name]: e.target.value });

  const handleAmenity = (item) => {
    const updated = form.amenities.includes(item)
      ? form.amenities.filter(a => a !== item)
      : [...form.amenities, item];
    updateFormAndCompletion({ amenities: updated });
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) return setErrorMsg("⚠️ Maximum 5 images allowed");

    const previews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        previews.push(ev.target.result);
        if (previews.length === files.length) setPreviewImages(previews);
      };
      reader.readAsDataURL(file);
    });

    updateFormAndCompletion({ images: files });
    setErrorMsg("");
  };

  const removeImage = (idx) => {
    const newImages = form.images.filter((_, i) => i !== idx);
    const newPreviews = previewImages.filter((_, i) => i !== idx);
    setForm({ ...form, images: newImages });
    setPreviewImages(newPreviews);
  };

  const resetForm = () => {
    setForm({
      title: "", county: "", area: "", price: "", deposit: "", type: "",
      bedrooms: "", bathrooms: "", amenities: [], description: "",
      phone: "", images: [], lat: "", lng: "", size: "", floor: "",
      yearBuilt: "", furnishing: "", parking: "", petPolicy: "", utilitiesIncluded: ""
    });
    setPreviewImages([]);
    setCompletionPercent(0);
    setSubmitStatus(null);
    setErrorMsg("");
  };

  const suggestPrice = () => {
    const suggestions = { "Bedsitter": 8000, "Studio Apartment": 12000, "1 Bedroom": 18000, "2 Bedroom": 28000, "3 Bedroom": 40000 };
    const suggested = suggestions[form.type] || 15000;
    updateFormAndCompletion({ price: suggested });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus(null);
    setErrorMsg("");

    try {
      const formData = new FormData();
      const sanitized = sanitizeForm(form);

      Object.keys(sanitized).forEach(key => {
        if (key === "amenities") {
          formData.append(key, JSON.stringify(sanitized[key]));
        } else if (key === "phone") {
          formData.append(key, formatPhoneForSubmit(sanitized[key]));
        } else if (key !== "images") {
          formData.append(key, sanitized[key]);
        }
      });

      form.images.forEach(img => formData.append("images", img));

      const res = await API.post("/properties", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`,
        },
      });

      setSubmitStatus("success");
      setTimeout(() => {
        resetForm();
        navigate("/dashboard");
      }, 2000);

    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || "Upload failed");
      setSubmitStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) return null;

  return (
    <div style={styles.root}>
      <style>{css}</style>

      <div style={styles.header}>
        <h1 style={styles.title}>📝 Upload Your Property</h1>
        <p style={styles.subtitle}>List your home and reach thousands of tenants</p>
      </div>

      <div style={styles.progressWrap}>
        <div style={styles.progressLabel}>
          Form Completion <span style={styles.progressPercent}>{completionPercent}%</span>
        </div>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${completionPercent}%` }} />
        </div>
      </div>

      {submitStatus === "success" && <div className="upload-success">✅ Property submitted successfully! Redirecting...</div>}
      {submitStatus === "error" && <div className="upload-error">❌ {errorMsg}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Basic Information</h3>
          <input className="upload-input" name="title" placeholder="Property Title" value={form.title} onChange={handleChange} required />
          <select className="upload-select" name="county" value={form.county} onChange={handleChange} required>
            <option value="">Select County</option>
            {counties.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="upload-input" name="area" placeholder="Area / Estate" value={form.area} onChange={handleChange} required />
          <select className="upload-select" name="type" value={form.type} onChange={handleChange} required>
            <option value="">Property Type</option>
            {propertyTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Pricing</h3>
          <div style={styles.priceRow}>
            <input className="upload-input" name="price" type="number" placeholder="Monthly Rent (Ksh)" value={form.price} onChange={handleChange} required />
            {form.type && <button type="button" className="upload-suggest-btn" onClick={suggestPrice}>💡 Suggest</button>}
          </div>
          <input className="upload-input" name="deposit" type="number" placeholder="Deposit (optional)" value={form.deposit} onChange={handleChange} />
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Additional Property Details</h3>
          <input className="upload-input" name="size" placeholder="Size (e.g. 1200 sq ft)" value={form.size} onChange={handleChange} />
          <input className="upload-input" name="floor" placeholder="Floor (e.g. Ground Floor)" value={form.floor} onChange={handleChange} />
          <input className="upload-input" name="yearBuilt" placeholder="Year Built" value={form.yearBuilt} onChange={handleChange} />
          <select className="upload-select" name="furnishing" value={form.furnishing} onChange={handleChange}>
            <option value="">Furnishing Status</option>
            <option value="Furnished">Furnished</option>
            <option value="Semi-Furnished">Semi-Furnished</option>
            <option value="Unfurnished">Unfurnished</option>
          </select>
          <select className="upload-select" name="parking" value={form.parking} onChange={handleChange}>
            <option value="">Parking</option>
            <option value="Yes">Yes</option>
            <option value="Covered">Covered Parking</option>
            <option value="Open">Open Parking</option>
            <option value="No">No Parking</option>
          </select>
          <select className="upload-select" name="petPolicy" value={form.petPolicy} onChange={handleChange}>
            <option value="">Pet Policy</option>
            <option value="Allowed">Pets Allowed</option>
            <option value="Not Allowed">No Pets Allowed</option>
          </select>
          <input className="upload-input" name="utilitiesIncluded" placeholder="Utilities Included (e.g. Water, Electricity)" value={form.utilitiesIncluded} onChange={handleChange} />
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Contact &amp; Location</h3>
          <input className="upload-input" name="phone" placeholder="Phone Number (e.g. 0712345678)" value={form.phone} onChange={handleChange} required />
          <button type="button" className="upload-geo-btn" onClick={getMyLocation}>📍 Get My Location</button>
          <div style={styles.geoRow}>
            <input className="upload-input" name="lat" value={form.lat} disabled />
            <input className="upload-input" name="lng" value={form.lng} disabled />
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Property Images (max 5)</h3>
          <div style={styles.imageUploadBox}>
            <input type="file" accept="image/*" multiple id="image-input" style={{display:"none"}} onChange={handleImages} />
            <label htmlFor="image-input" className="upload-file-label">📸 Choose Images ({form.images.length}/5)</label>
            {previewImages.length > 0 && (
              <div style={styles.previewGrid}>
                {previewImages.map((preview, i) => (
                  <div key={i} style={styles.previewItem}>
                    <img src={preview} alt="" style={styles.previewImg} />
                    <button type="button" className="upload-remove-img" onClick={() => removeImage(i)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={styles.buttonRow}>
          <button className="upload-submit-btn" type="submit" disabled={submitting || completionPercent < 80}>
            {submitting ? "⏳ Uploading..." : "Submit for Approval"}
          </button>
          <button type="button" className="upload-reset-btn" onClick={resetForm}>Clear Form</button>
        </div>
      </form>
    </div>
  );
}

/* ====================== STYLES ====================== */
const styles = {
  root: { fontFamily: "'DM Sans', sans-serif", background: "#06101f", color: "#e2e8f0", minHeight: "100vh", padding: "40px 20px", maxWidth: "700px", margin: "0 auto" },
  header: { textAlign: "center", marginBottom: "30px" },
  title: { fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: "#f1f5f9" },
  subtitle: { color: "#64748b", fontSize: "14px" },
  progressWrap: { marginBottom: "28px" },
  progressLabel: { display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#94a3b8" },
  progressBar: { height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg,#60a5fa,#3b82f6)", transition: "width 0.3s" },
  form: { display: "flex", flexDirection: "column", gap: "24px" },
  section: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px" },
  sectionTitle: { fontSize: "14px", fontWeight: 700, color: "#f1f5f9", marginBottom: "14px", textTransform: "uppercase" },
  priceRow: { display: "flex", gap: "10px", alignItems: "flex-end" },
  geoRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  imageUploadBox: { display: "flex", flexDirection: "column", gap: "12px" },
  previewGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "12px" },
  previewItem: { position: "relative", borderRadius: "12px", overflow: "hidden" },
  previewImg: { width: "100%", height: "120px", objectFit: "cover" },
  buttonRow: { display: "flex", gap: "10px" },
};

/* ====================== CSS ====================== */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');

  .upload-input, .upload-select {
    width: 100%; padding: 12px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: #e2e8f0; font-size: 14px;
  }
  .upload-input:focus, .upload-select:focus { border-color: #3b82f6; }

  .upload-file-label {
    display: block; padding: 18px; text-align: center;
    border: 2px dashed rgba(59,130,246,0.3); border-radius: 12px;
    cursor: pointer; color: #60a5fa; font-weight: 600;
  }

  .upload-remove-img {
    position: absolute; top: 6px; right: 6px;
    background: rgba(239,68,68,0.9); color: white;
    border: none; border-radius: 4px; padding: 2px 6px;
    cursor: pointer; font-size: 12px;
  }

  .upload-submit-btn {
    flex: 1; padding: 14px; border: none; border-radius: 10px;
    background: linear-gradient(135deg, #1d4ed8, #6d28d9);
    color: white; font-weight: 700; cursor: pointer;
  }
  .upload-reset-btn {
    flex: 1; padding: 14px; border: 1px solid rgba(255,255,255,0.2);
    background: transparent; color: #e2e8f0; border-radius: 10px;
    cursor: pointer;
  }

  .upload-success { padding: 12px; background: rgba(34,197,94,0.15); color: #86efac; border-radius: 10px; margin-bottom: 16px; }
  .upload-error { padding: 12px; background: rgba(239,68,68,0.15); color: #fca5a5; border-radius: 10px; margin-bottom: 16px; }
`;