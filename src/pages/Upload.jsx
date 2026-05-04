import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

export default function Upload() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  // Constants
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

  // State
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

  // Auth Guard
  useEffect(() => {
    if (!token) {
      alert("❌ Please login first to upload a property");
      navigate("/login");
    }
  }, [token, navigate]);

  // FIXED: Completion Logic moved to useEffect to prevent the 67% sync error
  useEffect(() => {
    const coreFields = [
      form.title, form.county, form.area, form.price, 
      form.type, form.bedrooms, form.description, form.phone
    ];
    const filledCore = coreFields.filter(f => f && f.toString().trim() !== "").length;
    const hasImages = form.images.length > 0 ? 1 : 0;
    
    // Total 9 points. (8 text fields + 1 image set)
    const totalPoints = 9; 
    const percent = Math.round(((filledCore + hasImages) / totalPoints) * 100);
    setCompletionPercent(percent);
  }, [form]);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenity = (item) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(item)
        ? prev.amenities.filter(a => a !== item)
        : [...prev.amenities, item]
    }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + form.images.length > 5) return setErrorMsg("⚠️ Maximum 5 images allowed");

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviews]);
    setForm(prev => ({ ...prev, images: [...prev.images, ...files] }));
    setErrorMsg("");
  };

  const removeImage = (idx) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
    setPreviewImages(prev => prev.filter((_, i) => i !== idx));
  };

  const getMyLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm(prev => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude })),
      () => alert("❌ Location permission denied")
    );
  };

  const suggestPrice = () => {
    const suggestions = { "Bedsitter": 8000, "Studio Apartment": 12000, "1 Bedroom": 18000, "2 Bedroom": 28000 };
    setForm(prev => ({ ...prev, price: suggestions[prev.type] || 15000 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      
      // Formatting phone
      let cleanPhone = form.phone.trim().replace(/\s+/g, "");
      if (cleanPhone.startsWith("0")) cleanPhone = "254" + cleanPhone.substring(1);
      if (!cleanPhone.startsWith("254")) cleanPhone = "254" + cleanPhone;

      // Append all fields
      Object.keys(form).forEach(key => {
        if (key === "images") {
          form.images.forEach(img => formData.append("images", img));
        } else if (key === "amenities") {
          formData.append(key, JSON.stringify(form[key]));
        } else if (key === "phone") {
          formData.append(key, cleanPhone);
        } else {
          formData.append(key, form[key]);
        }
      });

      await API.post("/properties", formData, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` }
      });

      setSubmitStatus("success");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Upload failed. Please check your connection.");
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
        <h1 style={styles.title}>📝 List Property</h1>
        <p style={styles.subtitle}>Fill in details to attract tenants</p>
      </div>

      <div style={styles.progressWrap}>
        <div style={styles.progressLabel}>
          Form Completion <span style={styles.progressPercent}>{completionPercent}%</span>
        </div>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${completionPercent}%` }} />
        </div>
      </div>

      {submitStatus === "success" && <div className="upload-success">✅ Upload Successful! Redirecting...</div>}
      {errorMsg && <div className="upload-error">❌ {errorMsg}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Section 1: Basics */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Basic Information</h3>
          <input className="upload-input" name="title" placeholder="Title (e.g. Modern 2BR in Kilimani)" value={form.title} onChange={handleChange} required />
          <div style={styles.geoRow}>
            <select className="upload-select" name="county" value={form.county} onChange={handleChange} required>
              <option value="">Select County</option>
              {counties.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input className="upload-input" name="area" placeholder="Area / Estate" value={form.area} onChange={handleChange} required />
          </div>
          <select className="upload-select" name="type" value={form.type} onChange={handleChange} required>
            <option value="">Property Type</option>
            {propertyTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <div style={styles.geoRow}>
            <input className="upload-input" name="bedrooms" type="number" placeholder="Bedrooms" value={form.bedrooms} onChange={handleChange} required />
            <input className="upload-input" name="bathrooms" type="number" placeholder="Bathrooms" value={form.bathrooms} onChange={handleChange} />
          </div>
        </div>

        {/* Section 2: Pricing */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Rent & Deposit</h3>
          <div style={styles.priceRow}>
            <input className="upload-input" name="price" type="number" placeholder="Rent per month (Ksh)" value={form.price} onChange={handleChange} required />
            <button type="button" className="upload-suggest-btn" onClick={suggestPrice}>💡 Suggest</button>
          </div>
          <input className="upload-input" name="deposit" type="number" placeholder="Security Deposit (Ksh)" value={form.deposit} onChange={handleChange} />
        </div>

        {/* Section 3: Details */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Amenities & Description</h3>
          <div style={styles.amenityGrid}>
            {amenitiesList.map(item => (
              <button 
                key={item} 
                type="button" 
                onClick={() => handleAmenity(item)}
                className={`amenity-btn ${form.amenities.includes(item) ? 'active' : ''}`}
              >
                {item}
              </button>
            ))}
          </div>
          <textarea 
            className="upload-input" 
            name="description" 
            placeholder="Tell us more about the house..." 
            style={{ minHeight: "100px", marginTop: "15px" }}
            value={form.description} 
            onChange={handleChange} 
            required 
          />
        </div>

        {/* Section 4: Contact & Images */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Contact & Photos</h3>
          <input className="upload-input" name="phone" placeholder="Phone Number (07...)" value={form.phone} onChange={handleChange} required />
          
          <div style={styles.imageUploadBox}>
            <input type="file" accept="image/*" multiple id="image-input" style={{display:"none"}} onChange={handleImages} />
            <label htmlFor="image-input" className="upload-file-label">📸 Add Photos ({form.images.length}/5)</label>
            <div style={styles.previewGrid}>
              {previewImages.map((src, i) => (
                <div key={i} style={styles.previewItem}>
                  <img src={src} alt="" style={styles.previewImg} />
                  <button type="button" className="upload-remove-img" onClick={() => removeImage(i)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={styles.buttonRow}>
          <button 
            className="upload-submit-btn" 
            type="submit" 
            disabled={submitting || completionPercent < 70}
          >
            {submitting ? "⏳ Uploading..." : `Submit (${completionPercent}%)`}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  root: { fontFamily: "'DM Sans', sans-serif", background: "#06101f", color: "#e2e8f0", minHeight: "100vh", padding: "40px 20px", maxWidth: "600px", margin: "0 auto" },
  header: { textAlign: "center", marginBottom: "30px" },
  title: { fontSize: "28px", fontWeight: 800, color: "#f1f5f9" },
  subtitle: { color: "#64748b", fontSize: "14px" },
  progressWrap: { marginBottom: "28px" },
  progressLabel: { display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px" },
  progressBar: { height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "99px" },
  progressFill: { height: "100%", background: "#3b82f6", borderRadius: "99px", transition: "width 0.4s ease" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  section: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px" },
  sectionTitle: { fontSize: "12px", letterSpacing: "1px", fontWeight: 700, color: "#94a3b8", marginBottom: "15px", textTransform: "uppercase" },
  geoRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" },
  priceRow: { display: "flex", gap: "10px", marginBottom: "10px" },
  amenityGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "8px" },
  imageUploadBox: { marginTop: "15px" },
  previewGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginTop: "10px" },
  previewItem: { position: "relative", height: "80px", borderRadius: "8px", overflow: "hidden" },
  previewImg: { width: "100%", height: "100%", objectFit: "cover" },
  buttonRow: { marginTop: "10px" }
};

const css = `
  .upload-input, .upload-select {
    width: 100%; padding: 12px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1); background: #0f172a;
    color: white; outline: none; margin-bottom: 10px;
  }
  .amenity-btn {
    padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
    background: transparent; color: #94a3b8; font-size: 11px; cursor: pointer;
  }
  .amenity-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }
  .upload-file-label {
    display: block; padding: 20px; border: 2px dashed #334155;
    text-align: center; border-radius: 12px; color: #3b82f6; cursor: pointer;
  }
  .upload-submit-btn {
    width: 100%; padding: 16px; border-radius: 12px; border: none;
    background: #3b82f6; color: white; font-weight: 700; cursor: pointer;
  }
  .upload-submit-btn:disabled { background: #1e293b; color: #475569; cursor: not-allowed; }
  .upload-suggest-btn {
    padding: 0 15px; height: 45px; border-radius: 10px; border: none;
    background: #1e293b; color: #fbbf24; cursor: pointer;
  }
  .upload-remove-img {
    position: absolute; top: 4px; right: 4px; background: rgba(239, 68, 68, 0.8);
    color: white; border: none; border-radius: 4px; cursor: pointer;
  }
  .upload-success { background: rgba(34,197,94,0.1); color: #4ade80; padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: center; }
  .upload-error { background: rgba(239,68,68,0.1); color: #f87171; padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: center; }
`;