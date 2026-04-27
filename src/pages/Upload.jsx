import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Upload() {
  const navigate = useNavigate();
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
    images: [], // Changed: array instead of single image
    lat: "",
    lng: "",
  });

  // ✅ NEW — form state tracking
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // "success" | "error" | null
  const [previewImages, setPreviewImages] = useState([]); // ✅ Multiple previews
  const [completionPercent, setCompletionPercent] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const counties = [
    "Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita Taveta",
    "Garissa","Wajir","Mandera","Marsabit",
    "Isiolo","Meru","Tharaka Nithi","Embu","Kitui",
    "Machakos","Makueni","Nyandarua","Nyeri","Kirinyaga",
    "Murang'a","Kiambu","Turkana","West Pokot","Samburu",
    "Trans Nzoia","Uasin Gishu","Elgeyo Marakwet","Nandi","Baringo",
    "Laikipia","Nakuru","Narok","Kajiado","Kericho","Bomet",
    "Kakamega","Vihiga","Bungoma","Busia",
    "Siaya","Kisumu","Homa Bay","Migori","Kisii","Nyamira",
    "Nairobi City"
  ];

  const propertyTypes = [
    "Bedsitter","Studio Apartment","1 Bedroom","2 Bedroom",
    "3 Bedroom","4+ Bedroom","Maisonette","Bungalow",
    "Townhouse","Apartment Block","Single Room","Shared Room",
    "Hostel Room","Commercial Office","Shop / Retail Space",
    "Warehouse","Plot / Land","Furnished Apartment",
    "Unfurnished Apartment"
  ];

  const amenitiesList = [
    "Water","Electricity","Parking","Security",
    "WiFi","Borehole","Furnished","AC","TV","Gym"
  ];

  // ✅ Calculate form completion percentage
  const calcCompletion = () => {
    const fields = [
      form.title, form.county, form.area, form.price,
      form.type, form.bedrooms, form.description, form.phone, form.images.length > 0
    ];
    const filled = fields.filter(f => f && f.toString().trim()).length;
    return Math.round((filled / fields.length) * 100);
  };

  const updateFormAndCompletion = (updates) => {
    const newForm = { ...form, ...updates };
    setForm(newForm);
    const fields = [
      newForm.title, newForm.county, newForm.area, newForm.price,
      newForm.type, newForm.bedrooms, newForm.description, newForm.phone, newForm.images.length > 0
    ];
    const filled = fields.filter(f => f && f.toString().trim()).length;
    setCompletionPercent(Math.round((filled / fields.length) * 100));
  };

  const getMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateFormAndCompletion({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        alert("✅ Location detected!");
      },
      (error) => {
        console.log("GEO ERROR:", error);
        alert("❌ Location permission denied");
      }
    );
  };

  const handleChange = (e) => {
    updateFormAndCompletion({ [e.target.name]: e.target.value });
  };

  const handleAmenity = (item) => {
    const updated = form.amenities.includes(item)
      ? form.amenities.filter((a) => a !== item)
      : [...form.amenities, item];
    updateFormAndCompletion({ amenities: updated });
  };

  // ✅ Handle multiple images
  const handleImages = (e) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length > 5) {
      setErrorMsg("⚠️ Maximum 5 images allowed");
      return;
    }

    // Generate previews
    const previews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        previews.push(evt.target.result);
        if (previews.length === files.length) {
          setPreviewImages(previews);
        }
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
      title: "", county: "", area: "", price: "",
      deposit: "", type: "", bedrooms: "", bathrooms: "",
      amenities: [], description: "", phone: "",
      images: [], lat: "", lng: "",
    });
    setPreviewImages([]);
    setCompletionPercent(0);
    setSubmitStatus(null);
    setErrorMsg("");
  };

  const suggestPrice = () => {
    const suggestions = {
      "Bedsitter": 8000,
      "Studio Apartment": 12000,
      "1 Bedroom": 18000,
      "2 Bedroom": 28000,
      "3 Bedroom": 40000,
      "4+ Bedroom": 60000,
    };
    const suggested = suggestions[form.type] || 15000;
    updateFormAndCompletion({ price: suggested });
    alert(`💡 Suggested: Ksh ${suggested.toLocaleString()}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus(null);
    setErrorMsg("");

    try {
      // ✅ Use FormData for multipart upload
      const formData = new FormData();
      
      formData.append("title", form.title);
      formData.append("county", form.county);
      formData.append("area", form.area);
      formData.append("price", form.price);
      formData.append("deposit", form.deposit || "");
      formData.append("type", form.type);
      formData.append("bedrooms", form.bedrooms || "");
      formData.append("bathrooms", form.bathrooms || "");
      formData.append("description", form.description);
      formData.append("phone", form.phone);
      formData.append("lat", form.lat || "");
      formData.append("lng", form.lng || "");
      formData.append("amenities", JSON.stringify(form.amenities || []));

      // ✅ Append all images
      form.images.forEach((image, idx) => {
        formData.append("images", image);
      });

      console.log("📤 Uploading with FormData:", {
        title: form.title,
        county: form.county,
        imageCount: form.images.length,
      });

      // ✅ POST to /api/properties (without auth for now)
      const res = await API.post("/properties", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ SUCCESS:", res.data);
      setSubmitStatus("success");

      setTimeout(() => {
        resetForm();
        navigate("/listings"); // Redirect to listings after success
      }, 2000);

    } catch (err) {
      console.error("❌ UPLOAD ERROR:", err);
      const errorMessage = err.response?.data?.error || err.message || "Upload failed. Try again.";
      setErrorMsg(errorMessage);
      setSubmitStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* ── Page header ── */}
      <div style={styles.header}>
        <h1 style={styles.title}>📝 Upload Your Property</h1>
        <p style={styles.subtitle}>List your home and reach thousands of tenants</p>
      </div>

      {/* ✅ Completion progress bar */}
      <div style={styles.progressWrap}>
        <div style={styles.progressLabel}>
          Form Completion <span style={styles.progressPercent}>{completionPercent}%</span>
        </div>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${completionPercent}%` }} />
        </div>
      </div>

      {/* ✅ Success/Error messages */}
      {submitStatus === "success" && (
        <div className="upload-success">
          ✅ Property submitted successfully! Redirecting…
        </div>
      )}
      {submitStatus === "error" && (
        <div className="upload-error">
          ❌ {errorMsg || "Upload failed. Check your network."}
        </div>
      )}
      {errorMsg && !submitStatus && (
        <div className="upload-warning">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>

        {/* ── Basic info section ── */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Basic Information</h3>

          <input
            className="upload-input"
            name="title"
            placeholder="Property Title (e.g., Cozy 2BR in Kilimani)"
            onChange={handleChange}
            value={form.title}
            required
          />

          <select
            className="upload-select"
            name="county"
            onChange={handleChange}
            value={form.county}
            required
          >
            <option value="">📍 Select County</option>
            {counties.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>

          <input
            className="upload-input"
            name="area"
            placeholder="Area / Estate (e.g., Kilimani, Eastleigh)"
            onChange={handleChange}
            value={form.area}
            required
          />

          <select
            className="upload-select"
            name="type"
            onChange={handleChange}
            value={form.type}
            required
          >
            <option value="">🏗 Property Type</option>
            {propertyTypes.map((t, i) => (
              <option key={i} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* ── Pricing section ── */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Pricing</h3>

          <div style={styles.priceRow}>
            <input
              className="upload-input"
              name="price"
              placeholder="Monthly Rent (Ksh)"
              onChange={handleChange}
              value={form.price}
              type="number"
              required
            />
            {form.type && (
              <button
                type="button"
                className="upload-suggest-btn"
                onClick={suggestPrice}
              >
                💡 Suggest
              </button>
            )}
          </div>

          <input
            className="upload-input"
            name="deposit"
            placeholder="Deposit (Ksh, optional)"
            onChange={handleChange}
            value={form.deposit}
            type="number"
          />
        </div>

        {/* ── Details section ── */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Details</h3>

          <div style={styles.detailRow}>
            <input
              className="upload-input"
              name="bedrooms"
              placeholder="Bedrooms"
              onChange={handleChange}
              value={form.bedrooms}
              type="number"
            />
            <input
              className="upload-input"
              name="bathrooms"
              placeholder="Bathrooms"
              onChange={handleChange}
              value={form.bathrooms}
              type="number"
            />
          </div>

          <textarea
            className="upload-textarea"
            name="description"
            placeholder="Describe your property — location, features, rules, etc."
            onChange={handleChange}
            value={form.description}
            rows="4"
          />
        </div>

        {/* ── Amenities ── */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Amenities</h3>
          <div style={styles.amenitiesGrid}>
            {amenitiesList.map((item, i) => (
              <label key={i} className="upload-amenity">
                <input
                  type="checkbox"
                  checked={form.amenities.includes(item)}
                  onChange={() => handleAmenity(item)}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ── Contact & Location ── */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Contact &amp; Location</h3>

          <input
            className="upload-input"
            name="phone"
            placeholder="Your Phone Number (for tenants to reach you)"
            onChange={handleChange}
            value={form.phone}
            required
          />

          <button
            type="button"
            className="upload-geo-btn"
            onClick={getMyLocation}
          >
            📍 Get My Location
          </button>

          <div style={styles.geoRow}>
            <input
              className="upload-input"
              name="lat"
              placeholder="Latitude (auto-filled)"
              value={form.lat}
              disabled
            />
            <input
              className="upload-input"
              name="lng"
              placeholder="Longitude (auto-filled)"
              value={form.lng}
              disabled
            />
          </div>
        </div>

        {/* ✅ Multiple images upload with preview */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Property Images (up to 5)</h3>

          <div style={styles.imageUploadBox}>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImages}
              style={{ display: "none" }}
              id="image-input"
            />
            <label htmlFor="image-input" className="upload-file-label">
              📸 Choose Images ({form.images.length}/5)
            </label>

            {previewImages.length > 0 && (
              <div style={styles.previewGrid}>
                {previewImages.map((preview, idx) => (
                  <div key={idx} style={styles.previewItem}>
                    <img src={preview} alt={`preview ${idx}`} style={styles.previewImg} />
                    <button
                      type="button"
                      className="upload-remove-img"
                      onClick={() => removeImage(idx)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Submit & Reset buttons ── */}
        <div style={styles.buttonRow}>
          <button
            className="upload-submit-btn"
            type="submit"
            disabled={submitting || completionPercent < 80}
          >
            {submitting ? "⏳ Uploading…" : "✓ Submit for Approval"}
          </button>

          <button
            type="button"
            className="upload-reset-btn"
            onClick={resetForm}
            disabled={submitting}
          >
            ↻ Clear Form
          </button>
        </div>

        {completionPercent < 80 && (
          <p style={styles.hint}>
            📌 Complete at least 80% of the form to submit ({completionPercent}%)
          </p>
        )}

      </form>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════════════ */
const styles = {
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#06101f",
    color: "#e2e8f0",
    minHeight: "100vh",
    padding: "40px 20px 60px",
    maxWidth: "700px",
    margin: "0 auto",
  },

  header: { textAlign: "center", marginBottom: "30px" },
  title: { fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: "#f1f5f9", margin: "0 0 6px", letterSpacing: "-0.5px" },
  subtitle: { color: "#64748b", fontSize: "14px", margin: 0 },

  progressWrap: { marginBottom: "28px" },
  progressLabel: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", fontSize: "13px", color: "#94a3b8" },
  progressPercent: { fontWeight: 700, color: "#60a5fa" },
  progressBar: {
    width: "100%", height: "6px", background: "rgba(255,255,255,0.08)",
    borderRadius: "999px", overflow: "hidden",
  },
  progressFill: {
    height: "100%", background: "linear-gradient(90deg,#60a5fa,#3b82f6)",
    transition: "width 0.2s ease",
  },

  form: { display: "flex", flexDirection: "column", gap: "24px" },

  section: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px" },
  sectionTitle: { fontSize: "14px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.5px" },

  priceRow: { display: "flex", gap: "10px", alignItems: "flex-end" },
  detailRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },

  amenitiesGrid: { display: "flex", flexWrap: "wrap", gap: "10px" },

  geoRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },

  imageUploadBox: { display: "flex", flexDirection: "column", gap: "12px" },
  previewGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "12px" },
  previewItem: { position: "relative", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(59,130,246,0.3)" },
  previewImg: { width: "100%", height: "120px", objectFit: "cover", display: "block" },

  buttonRow: { display: "flex", gap: "10px" },

  hint: { fontSize: "12px", color: "#64748b", textAlign: "center", margin: 0 },
};

/* ── CSS classes ───────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');

  .upload-input, .upload-select, .upload-textarea {
    width: 100%; padding: 11px 14px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04);
    color: #e2e8f0; font-size: 14px; font-family: inherit; outline: none;
    transition: border-color .2s;
  }
  .upload-input:focus, .upload-select:focus, .upload-textarea:focus {
    border-color: rgba(59,130,246,0.5);
  }
  .upload-textarea { resize: vertical; }
  .upload-select { cursor: pointer; }
  .upload-select option { background: #0d1b2e; }

  .upload-amenity {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 12px; border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.02); cursor: pointer;
    transition: background .2s; font-size: 13px;
  }
  .upload-amenity:hover { background: rgba(255,255,255,0.06); }
  .upload-amenity input[type="checkbox"] { cursor: pointer; accent-color: #3b82f6; }

  .upload-suggest-btn {
    padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(251,146,60,0.3);
    background: rgba(251,146,60,0.08); color: #fb923c; font-size: 12px;
    font-weight: 600; cursor: pointer; font-family: inherit; white-space: nowrap;
    transition: background .2s;
  }
  .upload-suggest-btn:hover { background: rgba(251,146,60,0.15); }

  .upload-geo-btn {
    width: 100%; padding: 11px; border-radius: 10px;
    border: 1px solid rgba(59,130,246,0.3); background: rgba(59,130,246,0.08);
    color: #60a5fa; font-size: 14px; font-weight: 600; cursor: pointer;
    font-family: inherit; transition: background .2s;
  }
  .upload-geo-btn:hover { background: rgba(59,130,246,0.15); }

  .upload-file-label {
    display: block; padding: 18px; text-align: center;
    border: 2px dashed rgba(59,130,246,0.3); border-radius: 12px;
    cursor: pointer; transition: border-color .2s, background .2s;
    font-size: 14px; font-weight: 600; color: #60a5fa;
  }
  .upload-file-label:hover {
    border-color: rgba(59,130,246,0.6); background: rgba(59,130,246,0.08);
  }

  .upload-remove-img {
    position: absolute; top: 4px; right: 4px;
    padding: 4px 8px; border-radius: 4px; font-size: 12px;
    border: none; background: rgba(239,68,68,0.8); color: white;
    cursor: pointer; font-family: inherit; font-weight: 600;
  }

  .upload-submit-btn {
    flex: 1; padding: 13px; border-radius: 10px; border: none;
    background: linear-gradient(135deg,#1d4ed8,#6d28d9); color: white;
    font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit;
    transition: transform .15s; box-shadow: 0 4px 20px rgba(59,130,246,0.35);
  }
  .upload-submit-btn:hover:not(:disabled) { transform: translateY(-2px); }
  .upload-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .upload-reset-btn {
    flex: 1; padding: 13px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.05);
    color: #e2e8f0; font-size: 15px; font-weight: 600; cursor: pointer;
    font-family: inherit; transition: background .2s;
  }
  .upload-reset-btn:hover:not(:disabled) { background: rgba(255,255,255,0.1); }
  .upload-reset-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .upload-success {
    padding: 12px 16px; border-radius: 10px;
    background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.3);
    color: #86efac; font-size: 13px; font-weight: 600; margin-bottom: 16px;
    animation: slideDown .3s ease;
  }

  .upload-error {
    padding: 12px 16px; border-radius: 10px;
    background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3);
    color: #fca5a5; font-size: 13px; font-weight: 600; margin-bottom: 16px;
    animation: slideDown .3s ease;
  }

  .upload-warning {
    padding: 12px 16px; border-radius: 10px;
    background: rgba(251,146,60,0.12); border: 1px solid rgba(251,146,60,0.3);
    color: #fed7aa; font-size: 13px; font-weight: 600; margin-bottom: 16px;
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;