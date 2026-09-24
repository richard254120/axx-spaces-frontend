import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { registerAccommodationProperty } from "../../api/accommodation";
import {
  ADVERTISING_PACKAGES,
  PROPERTY_CATEGORIES,
  KENYA_COUNTIES,
  AMENITIES_LIST,
  INITIAL_REGISTER_FORM,
  REGISTER_STEPS,
  setAccommodationSession,
  ErrorAlert,
} from "../../features/accommodation";
import PhoneInput from "../../components/PhoneInput";

const categories = PROPERTY_CATEGORIES;
const counties = KENYA_COUNTIES;
const amenitiesList = AMENITIES_LIST;
const steps = REGISTER_STEPS;
const packages = ADVERTISING_PACKAGES;

function VideoPreviewCard({ file, index, onRemove }) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
  const isTooLarge = file.size > 100 * 1024 * 1024;

  return (
    <div style={{
      position: "relative",
      borderRadius: "12px",
      overflow: "hidden",
      border: isTooLarge ? "2px solid #ef4444" : "1px solid #e5e7eb",
      background: "#0f172a",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      display: "flex",
      flexDirection: "column"
    }}>
      {previewUrl && (
        <video
          src={previewUrl}
          controls
          playsInline
          preload="metadata"
          style={{ width: "100%", height: "180px", objectFit: "contain", background: "#000" }}
        />
      )}
      <div style={{
        padding: "10px 12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(15, 23, 42, 0.95)",
        gap: "10px"
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            📹 {file.name || `Video Walkthrough #${index + 1}`}
          </div>
          <div style={{ fontSize: "11px", color: isTooLarge ? "#f87171" : "#94a3b8", marginTop: "2px" }}>
            {sizeMb} MB {isTooLarge ? "• ⚠️ Exceeds 100MB limit" : "• Ready to upload"}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            color: "#fca5a5",
            borderRadius: "6px",
            padding: "5px 10px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            flexShrink: 0
          }}
          title="Remove video"
        >
          ✕ Remove
        </button>
      </div>
    </div>
  );
}

function ImagePreviewCard({ file, index, onRemove }) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div style={{
      position: "relative",
      borderRadius: "10px",
      overflow: "hidden",
      border: "1px solid #e5e7eb",
      aspectRatio: "4/3",
      background: "#f3f4f6",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
    }}>
      {previewUrl && (
        <img
          src={previewUrl}
          alt={`Photo ${index + 1}`}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
      {index === 0 && (
        <span style={{
          position: "absolute",
          top: "6px",
          left: "6px",
          background: "#0284c7",
          color: "white",
          fontSize: "10px",
          fontWeight: 800,
          padding: "3px 8px",
          borderRadius: "6px",
          letterSpacing: "0.04em",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
        }}>
          Primary Cover
        </span>
      )}
      <button
        type="button"
        onClick={() => onRemove(index)}
        style={{
          position: "absolute",
          top: "6px",
          right: "6px",
          background: "rgba(0,0,0,0.7)",
          border: "none",
          color: "white",
          borderRadius: "50%",
          width: "26px",
          height: "26px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          cursor: "pointer",
          transition: "background 0.2s"
        }}
        title="Remove photo"
      >
        ✕
      </button>
    </div>
  );
}

export default function RegisterPropertyPage() {
  const navigate = useNavigate();
  const { login: authLogin, token } = useContext(AuthContext);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState({ ...INITIAL_REGISTER_FORM });
  const [newImages, setNewImages] = useState([]);
  const [newVideos, setNewVideos] = useState([]);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const toggleAmenity = (a) => setForm((f) => ({
    ...f,
    amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
  }));
  const addRoomType = () => setForm((f) => ({ ...f, roomTypes: [...f.roomTypes, { name: "", price: "", guests: "", images: [], videos: [] }] }));
  const updateRoom = (i, field, val) => setForm((f) => {
    const rt = [...f.roomTypes]; rt[i] = { ...rt[i], [field]: val }; return { ...f, roomTypes: rt };
  });
  const removeRoom = (i) => setForm((f) => ({ ...f, roomTypes: f.roomTypes.filter((_, idx) => idx !== i) }));

  const handleImageFiles = (files) => {
    const valid = Array.from(files).filter((f) => f.type && f.type.startsWith("image/"));
    setNewImages((prev) => [...prev, ...valid].slice(0, 20));
  };

  const handleVideoFiles = (files) => {
    const fileList = Array.from(files);
    const valid = [];
    const oversized = [];
    fileList.forEach((f) => {
      if (f.type && f.type.startsWith("video/")) {
        if (f.size > 100 * 1024 * 1024) {
          oversized.push(`${f.name} (${(f.size / (1024 * 1024)).toFixed(1)}MB)`);
        } else {
          valid.push(f);
        }
      }
    });
    if (oversized.length > 0) {
      alert(`The following video(s) exceed the 100MB limit and were skipped:\n\n${oversized.join("\n")}\n\nPlease compress them or choose shorter clips under 100MB.`);
    }
    setNewVideos((prev) => [...prev, ...valid].slice(0, 10));
  };

  const removeImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index) => {
    setNewVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        update("lat", position.coords.latitude.toString());
        update("lng", position.coords.longitude.toString());
      },
      (error) => {
        alert("Unable to retrieve your location. Please enable location services or enter coordinates manually.");
      }
    );
  };

  const canNext = () => {
    if (step === 0) return form.name && form.category && form.description;
    if (step === 1) return form.county && form.town && form.address && form.lat && form.lng;
    if (step === 2) return true; // Media upload is optional
    if (step === 3) return form.amenities.length > 0;
    if (step === 4) return form.basePrice && form.basePrice !== "";
    return true;
  };

  const handleSubmit = async () => {
    if (!form.agreeTerms || submitting) return;
    setSubmitting(true);
    setSubmitError("");

    if (!token) {
      setSubmitError("You must be logged in to submit a property. Please log in first.");
      setSubmitting(false);
      return;
    }

    try {
      const fd = new FormData();

      // Map category to backend enum value (kebab-case)
      const categoryToTypeMap = {
        "Hotel": "hotel",
        "Airbnb": "bnb",
        "Beach Resort": "beach-resort",
        "Mountain Lodge": "mountain-lodge",
        "Safari Camp": "safari-camp",
        "Camping Grounds": "camping-grounds",
        "Boutique Hotel": "boutique-hotel",
        "Eco Lodge": "eco-lodge",
        "Guest House": "guesthouse",
        "Bed & Breakfast": "bnb",
        "Hostel": "hostel",
        "Apartment": "apartment",
        "Villa": "villa",
        "Holiday Home": "holiday-home",
        "Cottage": "cottage",
        "Treehouse": "treehouse",
        "Glamping Site": "glamping-site",
        "Luxury Tented Camp": "luxury-tented-camp",
        "Safari Lodge": "safari-lodge",
        "Game Lodge": "game-lodge",
        "Bush Camp": "bush-camp",
        "City Hotel": "city-hotel",
        "Airport Hotel": "airport-hotel",
        "Business Hotel": "business-hotel",
        "Conference Hotel": "conference-hotel",
        "Resort Hotel": "resort-hotel",
        "All-Inclusive Resort": "all-inclusive-resort",
        "Family Resort": "family-resort",
        "Adults Only Resort": "adults-only-resort",
        "Beach Hotel": "beach-hotel",
        "Lake Resort": "lake-resort",
        "River Lodge": "river-lodge",
        "Forest Lodge": "forest-lodge",
        "Hill Station": "hill-station",
      };

      Object.entries(form).forEach(([k, v]) => {
        if (k === "amenities") fd.append("amenities", JSON.stringify(v));
        else if (k === "category") fd.append("type", categoryToTypeMap[v] || "hotel");
        else if (k === "checkIn") fd.append("checkInTime", v);
        else if (k === "checkOut") fd.append("checkOutTime", v);
        else if (k === "basePrice") {
          if (v && v !== "") fd.append("basePrice", parseFloat(v) || 0);
        }
        else if (k === "maxGuests" || k === "totalRooms") {
          if (v && v !== "") fd.append(k, parseInt(v) || 0);
        }
        else if (Array.isArray(v)) return;
        else if (v !== undefined && v !== null && v !== "") fd.append(k, v);
      });
      newImages.forEach((file) => fd.append("images", file));
      newVideos.forEach((file) => fd.append("videos", file));

      console.log("Submitting property with", newImages.length, "images,", newVideos.length, "videos");
      const result = await registerAccommodationProperty(fd, token);
      console.log("Submission successful:", result);
      setSubmitted(true);
    } catch (err) {
      console.error("Submission error:", err);
      setSubmitError(err.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#f8f4f0", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{ background: "white", borderRadius: "20px", padding: "36px 24px", textAlign: "center", maxWidth: "520px", width: "100%", border: "1px solid #e5e7eb", boxShadow: "0 20px 60px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: "56px", marginBottom: "16px" }}></div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1f2937", marginBottom: "10px" }}>Property Submitted!</h2>
          <p style={{ color: "#6b7280", lineHeight: 1.7, marginBottom: "20px", fontSize: "14px" }}>
            <strong>{form.name}</strong> has been submitted for review. Our team will verify within 24 hours.
          </p>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "16px", marginBottom: "20px", textAlign: "left" }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400e", marginBottom: "8px" }}> Next Steps</div>
            <div style={{ fontSize: "12px", color: "#b45309" }}>• Review within 24 hours<br />• Listing goes live after approval</div>
          </div>
          {form.bookingUrl && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "14px", marginBottom: "20px", textAlign: "left" }}>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#166534", marginBottom: "4px" }}> Booking Site Registered</div>
              <div style={{ fontSize: "12px", color: "#15803d" }}>Guests will be redirected to: {form.bookingUrl}</div>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button style={{ background: "#fbbf24", color: "#1f2937", border: "none", borderRadius: "10px", padding: "14px", fontWeight: 800, fontSize: "15px", cursor: "pointer", fontFamily: "inherit" }} onClick={() => navigate("/accommodation/dashboard")}>
              Go to Dashboard →
            </button>
            <button style={{ background: "transparent", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px", fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "inherit", color: "#4b5563" }} onClick={() => navigate("/accommodation")}>
              Browse Accommodations
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.root}>
      <style>{css}</style>

      {/* HEADER */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate("/accommodation")}>← Back</button>
        <div style={s.headerCenter}>
          <div style={s.logo}><span style={s.logoAccent}>AXX</span><span style={s.logoWord}>SPACE</span></div>
          <p style={s.headerSub}>List Your Property — Step {step + 1} of {steps.length}</p>
        </div>
        <div style={s.stepCount}>Step {step + 1}/{steps.length}</div>
      </div>

      {/* PROGRESS */}
      <div style={s.progressBar}>
        <div style={{ ...s.progressFill, width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>

      <div className="reg-layout">
        {/* STEP NAV */}
        <aside className="step-nav-desktop">
          {steps.map((st, i) => (
            <div
              key={st}
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", marginBottom: "4px", background: i === step ? "#fef9c3" : "transparent", cursor: i < step ? "pointer" : "default", opacity: i > step ? 0.5 : 1 }}
              onClick={() => { if (i < step) setStep(i); }}
            >
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: i < step ? "#22c55e" : i === step ? "#fbbf24" : "#e5e7eb", color: i < step || i === step ? "white" : "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>
                {i < step ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: "13px", fontWeight: 600, color: i === step ? "#92400e" : "#4b5563" }}>{st}</span>
            </div>
          ))}
        </aside>

        <main>
          <div style={s.formCard}>

            {/* STEP 0 — PROPERTY INFO */}
            {step === 0 && (
              <div>
                <h2 style={s.formTitle}> Property Information</h2>
                <p style={s.formSub}>Tell guests what makes your property special</p>
                <div style={s.field}>
                  <label style={s.label}>Property Name *</label>
                  <input style={s.input} placeholder="e.g. Sunrise Beach Resort" value={form.name} onChange={(e) => update("name", e.target.value)} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Category *</label>
                  <select style={s.input} value={form.category} onChange={(e) => update("category", e.target.value)}>
                    <option value="">Select category...</option>
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Description *</label>
                  <textarea style={{ ...s.input, height: "140px", resize: "vertical" }} placeholder="Describe your property, unique features, nearby attractions, experiences offered..." value={form.description} onChange={(e) => update("description", e.target.value)} />
                  <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>{form.description.length}/500 characters recommended</div>
                </div>
              </div>
            )}

            {/* STEP 1 — LOCATION */}
            {step === 1 && (
              <div>
                <h2 style={{ ...s.formTitle, display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <span>Location Details</span>
                </h2>
                <p style={s.formSub}>Help guests find you</p>
                <div className="two-col-form">
                  <div style={s.field}>
                    <label style={s.label}>County *</label>
                    <select style={s.input} value={form.county} onChange={(e) => update("county", e.target.value)}>
                      <option value="">Select county...</option>
                      {counties.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Town / Area *</label>
                    <input style={s.input} placeholder="e.g. Diani, Westlands, Nyali" value={form.town} onChange={(e) => update("town", e.target.value)} />
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Common Location Name (optional)</label>
                  <input style={s.input} placeholder="e.g. South Coast, CBD, Nyali Beach" value={form.commonLocation} onChange={(e) => update("commonLocation", e.target.value)} />
                  <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>
                    Include commonly known names if they differ from the official location name
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Physical Address / Landmark *</label>
                  <input style={s.input} placeholder="e.g. Off Mombasa-Malindi Road, next to Kenya Wildlife Service gate" value={form.address} onChange={(e) => update("address", e.target.value)} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Google Maps Link (optional)</label>
                  <input style={s.input} placeholder="https://maps.google.com/..." value={form.mapLink} onChange={(e) => update("mapLink", e.target.value)} />
                </div>
                <div className="two-col-form">
                  <div style={s.field}>
                    <label style={s.label}>GPS Latitude *</label>
                    <input style={s.input} type="number" step="any" placeholder="e.g. -1.286389" value={form.lat} onChange={(e) => update("lat", e.target.value)} required />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>GPS Longitude *</label>
                    <input style={s.input} type="number" step="any" placeholder="e.g. 36.817223" value={form.lng} onChange={(e) => update("lng", e.target.value)} required />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                    GPS coordinates are required. Get them from Google Maps (right-click → coordinates).
                  </div>
                  <button
                    type="button"
                    onClick={detectLocation}
                    style={{
                      background: "#fbbf24",
                      color: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 16px",
                      fontWeight: 700,
                      fontSize: "12px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    📍 Auto-detect Location
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 — MEDIA UPLOAD */}
            {step === 2 && (
              <div>
                <h2 style={s.formTitle}>Photos & Virtual Video Walkthroughs</h2>
                <p style={s.formSub}>
                  Upload high-resolution photos and video tours. Video walkthroughs will be playable directly on your listing page with interactive full-screen controls.
                </p>

                {/* PHOTOS UPLOAD */}
                <div style={{ marginBottom: "28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label style={{ ...s.label, marginBottom: 0 }}>Property Photos ({newImages.length}/20)</label>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>JPG, PNG, WebP • Max 10MB each</span>
                  </div>

                  <div
                    style={{
                      ...s.uploadBox,
                      borderColor: isDraggingImage ? "#0284c7" : "#fbbf24",
                      background: isDraggingImage ? "#f0f9ff" : "#fffbeb",
                      transition: "all 0.2s"
                    }}
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingImage(true); }}
                    onDragLeave={() => setIsDraggingImage(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(false);
                      if (e.dataTransfer.files) handleImageFiles(e.dataTransfer.files);
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) handleImageFiles(e.target.files);
                        e.target.value = "";
                      }}
                      style={{ display: "none" }}
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" style={s.uploadBtn}>
                      <span style={{ fontSize: "36px", marginBottom: "8px" }}>📸</span>
                      <span style={{ fontWeight: 800, fontSize: "15px" }}>Click to add photos</span>
                      <span style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                        or drag and drop your photos here
                      </span>
                    </label>
                  </div>

                  {newImages.length > 0 && (
                    <div style={{ marginTop: "16px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#166534", marginBottom: "10px" }}>
                        ✓ {newImages.length} photo(s) selected:
                      </div>
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                        gap: "10px"
                      }}>
                        {newImages.map((file, idx) => (
                          <ImagePreviewCard
                            key={`${file.name}-${idx}`}
                            file={file}
                            index={idx}
                            onRemove={removeImage}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* VIDEOS UPLOAD */}
                <div style={{
                  marginBottom: "28px",
                  padding: "20px",
                  borderRadius: "16px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "18px" }}>🎬</span>
                        <label style={{ ...s.label, marginBottom: 0, fontSize: "13px", color: "#0f172a" }}>
                          Virtual Video Walkthroughs ({newVideos.length}/10)
                        </label>
                      </div>
                      <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", margin: "4px 0 0 0" }}>
                        MP4, WebM, MOV, QuickTime • Up to 100MB per video walkthrough
                      </p>
                    </div>
                    {newVideos.length > 0 && (
                      <span style={{
                        background: "#f0fdf4",
                        color: "#166534",
                        fontSize: "12px",
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: "20px",
                        border: "1px solid #bbf7d0"
                      }}>
                        ✓ {newVideos.length} Video(s) Ready
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      ...s.uploadBox,
                      borderColor: isDraggingVideo ? "#2563eb" : "#cbd5e1",
                      background: isDraggingVideo ? "#eff6ff" : "white",
                      borderStyle: "dashed",
                      borderWidth: "2px",
                      padding: "28px 16px",
                      transition: "all 0.2s"
                    }}
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingVideo(true); }}
                    onDragLeave={() => setIsDraggingVideo(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingVideo(false);
                      if (e.dataTransfer.files) handleVideoFiles(e.dataTransfer.files);
                    }}
                  >
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) handleVideoFiles(e.target.files);
                        e.target.value = "";
                      }}
                      style={{ display: "none" }}
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" style={s.uploadBtn}>
                      <span style={{ fontSize: "38px", marginBottom: "8px" }}>🎥</span>
                      <span style={{ fontWeight: 800, fontSize: "15px", color: "#0f172a" }}>
                        Click to select video walkthrough(s)
                      </span>
                      <span style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                        or drag & drop video files directly into this box
                      </span>
                    </label>
                  </div>

                  {/* Video Live Preview Grid */}
                  {newVideos.length > 0 && (
                    <div style={{ marginTop: "20px" }}>
                      <div style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#0f172a",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}>
                        <span>▶ Test Playback Preview:</span>
                        <span style={{ fontSize: "12px", fontWeight: 500, color: "#64748b" }}>
                          (Use the player below to test audio/video before uploading)
                        </span>
                      </div>
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                        gap: "16px"
                      }}>
                        {newVideos.map((file, idx) => (
                          <VideoPreviewCard
                            key={`${file.name}-${idx}`}
                            file={file}
                            index={idx}
                            onRemove={removeVideo}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "14px 16px", fontSize: "13px", color: "#166534", lineHeight: 1.6 }}>
                  💡 <strong>Pro-Tip:</strong> Verified virtual tours dramatically increase guest bookings! You can also manage, add or replace videos at any time from your owner dashboard.
                </div>
              </div>
            )}

            {/* STEP 3 — AMENITIES */}
            {step === 3 && (
              <div>
                <h2 style={s.formTitle}> Amenities & Features</h2>
                <p style={s.formSub}>Select everything your property offers — this helps guests discover you</p>
                <div className="amenities-grid">
                  {amenitiesList.map((a) => (
                    <button
                      key={a}
                      style={{ ...s.amenityBtn, ...(form.amenities.includes(a) ? s.amenityActive : {}) }}
                      onClick={() => toggleAmenity(a)}
                    >
                      {form.amenities.includes(a) ? "✓ " : ""}{a}
                    </button>
                  ))}
                </div>
                <div style={s.field}>
                  <label style={s.label}>Other Amenities (comma-separated)</label>
                  <input style={s.input} placeholder="e.g. Helicopter pad, Private beach, Rooftop terrace, Nightclub" />
                </div>
                {form.amenities.length === 0 && <div style={s.validationHint}> Please select at least one amenity to continue</div>}
              </div>
            )}

            {/* STEP 4 — PRICING & BOOKING URL */}
            {step === 4 && (
              <div>
                <h2 style={s.formTitle}> Pricing, Rooms & Booking</h2>
                <p style={s.formSub}>Set your rates and add your existing booking site link</p>

                {/* BOOKING URL — KEY FEATURE */}
                <div style={s.bookingUrlBox}>
                  <div style={s.bookingUrlTitle}> Your Booking Website (Optional but Recommended)</div>
                  <p style={s.bookingUrlSub}>
                    Already have your own booking site? Add the link here. When guests click "Book Now" on AXXSpace, they'll be redirected directly to your booking site. No commission on bookings — we just advertise for you.
                  </p>
                  <div style={s.field}>
                    <label style={s.label}>Your Booking Site URL</label>
                    <input style={s.input} type="url" placeholder="https://www.yourproperty.com/book or https://booking.com/your-property" value={form.bookingUrl} onChange={(e) => update("bookingUrl", e.target.value)} />
                  </div>
                  {form.bookingUrl && (
                    <div style={{ fontSize: "12px", color: "#15803d", background: "#f0fdf4", padding: "8px 12px", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                      ✓ Guests will be redirected to: <strong>{form.bookingUrl}</strong>
                    </div>
                  )}
                  {!form.bookingUrl && (
                    <div style={{ fontSize: "12px", color: "#92400e", background: "#fffbeb", padding: "8px 12px", borderRadius: "8px", border: "1px solid #fde68a" }}>
                      No booking URL? Guests will use your contact details (phone, email, WhatsApp) to enquire.
                    </div>
                  )}
                </div>

                <div style={s.sectionBreak}>Base Pricing</div>
                <div className="two-col-form">
                  <div style={s.field}>
                    <label style={s.label}>Base Price / Night (KSh) *</label>
                    <input style={s.input} type="number" placeholder="e.g. 8500" value={form.basePrice} onChange={(e) => update("basePrice", e.target.value)} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Weekend Price (KSh)</label>
                    <input style={s.input} type="number" placeholder="e.g. 12000" value={form.weekendPrice} onChange={(e) => update("weekendPrice", e.target.value)} />
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Peak Season Price (KSh)</label>
                  <input style={s.input} type="number" placeholder="e.g. 18000 (Dec, Jul-Aug)" value={form.peakPrice} onChange={(e) => update("peakPrice", e.target.value)} />
                </div>

                <div style={s.sectionBreak}>Room Types (optional)</div>
                {form.roomTypes.map((r, i) => (
                  <div key={i} style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px", marginBottom: "16px", border: "1px solid #e5e7eb" }}>
                    <div className="room-row" style={{ marginBottom: "12px" }}>
                      <input style={{ ...s.input, flex: 2 }} placeholder="Room type name (e.g. Deluxe Suite)" value={r.name} onChange={(e) => updateRoom(i, "name", e.target.value)} />
                      <input style={{ ...s.input, flex: 1 }} type="number" placeholder="Price KSh" value={r.price} onChange={(e) => updateRoom(i, "price", e.target.value)} />
                      <input style={{ ...s.input, flex: 1 }} type="number" placeholder="Max guests" value={r.guests} onChange={(e) => updateRoom(i, "guests", e.target.value)} />
                      {form.roomTypes.length > 1 && <button style={s.removeRoomBtn} onClick={() => removeRoom(i)}>✕</button>}
                    </div>

                    {/* Room Images */}
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ ...s.label, fontSize: "10px" }}>Room Images</label>
                      <div style={{ border: "1px dashed #d1d5db", borderRadius: "8px", padding: "12px", textAlign: "center", background: "white" }}>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            updateRoom(i, "images", [...(r.images || []), ...files]);
                          }}
                          style={{ display: "none" }}
                          id={`room-images-${i}`}
                        />
                        <label htmlFor={`room-images-${i}`} style={{ cursor: "pointer", fontSize: "12px", color: "#6b7280" }}>
                          + Add room photos
                        </label>
                      </div>
                      {r.images && r.images.length > 0 && (
                        <div style={{ fontSize: "11px", color: "#16a34a", marginTop: "4px" }}>
                          ✓ {r.images.length} photo(s)
                        </div>
                      )}
                    </div>

                    {/* Room Videos */}
                    <div>
                      <label style={{ ...s.label, fontSize: "10px" }}>Room Videos (WhatsApp Status-style)</label>
                      <div style={{ border: "1px dashed #d1d5db", borderRadius: "8px", padding: "12px", textAlign: "center", background: "white" }}>
                        <input
                          type="file"
                          accept="video/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            updateRoom(i, "videos", [...(r.videos || []), ...files]);
                          }}
                          style={{ display: "none" }}
                          id={`room-videos-${i}`}
                        />
                        <label htmlFor={`room-videos-${i}`} style={{ cursor: "pointer", fontSize: "12px", color: "#6b7280" }}>
                          + Add room videos
                        </label>
                      </div>
                      {r.videos && r.videos.length > 0 && (
                        <div style={{ fontSize: "11px", color: "#16a34a", marginTop: "4px" }}>
                          ✓ {r.videos.length} video(s)
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <button style={s.addRoomBtn} onClick={addRoomType}>+ Add Room Type</button>

                <div style={s.sectionBreak}>Check-in / Check-out</div>
                <div className="two-col-form">
                  <div style={s.field}>
                    <label style={s.label}>Check-in Time</label>
                    <input style={s.input} type="time" value={form.checkIn} onChange={(e) => update("checkIn", e.target.value)} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Check-out Time</label>
                    <input style={s.input} type="time" value={form.checkOut} onChange={(e) => update("checkOut", e.target.value)} />
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Free Cancellation Window</label>
                  <select style={s.input} value={form.cancellation} onChange={(e) => update("cancellation", e.target.value)}>
                    <option value="24">24 hours</option>
                    <option value="48">48 hours</option>
                    <option value="72">72 hours</option>
                    <option value="7days">7 days</option>
                    <option value="0">Non-refundable</option>
                  </select>
                </div>
              </div>
            )}

            {/* STEP 5 — REVIEW */}
            {step === 5 && (
              <div>
                <h2 style={s.formTitle}> Review & Submit</h2>
                <p style={s.formSub}>Confirm your details before submitting for approval</p>
                <div className="review-grid">
                  {[
                    ["Property Name", form.name || "—"],
                    ["Category", form.category || "—"],
                    ["Location", form.town ? `${form.town}, ${form.county}` : "—"],
                    ["Base Price", form.basePrice ? `KSh ${Number(form.basePrice).toLocaleString()}/night` : "—"],
                    ["Photos", `${newImages.length} photo(s) selected`],
                    ["Video Walkthroughs", `${newVideos.length} video(s) ready`],
                    ["Amenities", form.amenities.length > 0 ? `${form.amenities.length} selected` : "—"],
                    ["Booking URL", form.bookingUrl || "Guests will contact you directly"],
                  ].map(([k, v]) => (
                    <div key={k} style={s.reviewItem}>
                      <div style={s.reviewKey}>{k}</div>
                      <div style={s.reviewVal}>{v}</div>
                    </div>
                  ))}
                </div>

                {newVideos.length > 0 && (
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "14px", marginBottom: "16px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#166534", marginBottom: "4px" }}>
                      🎬 Virtual Video Tour Attached
                    </div>
                    <div style={{ fontSize: "12px", color: "#15803d" }}>
                      {newVideos.length} video file(s) will be uploaded to our cloud media CDN and made playable on your listing page.
                    </div>
                  </div>
                )}

                {form.bookingUrl && (
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "14px", marginBottom: "16px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#166534", marginBottom: "4px" }}> Booking Redirect Confirmed</div>
                    <div style={{ fontSize: "12px", color: "#15803d" }}>Guests clicking "Book Now" on AXXSpace will be redirected to:<br /><strong>{form.bookingUrl}</strong></div>
                  </div>
                )}

                <div style={s.commissionBox}>
                  <div style={s.commissionTitle}> What Happens After Submission?</div>
                  <div style={{ fontSize: "13px", color: "#78350f", lineHeight: 1.7 }}>
                    1. Our team reviews your listing and media within 24 hours.<br />
                    2. Once approved, your listing and video walkthroughs go live on AXXSpace.<br />
                    3. Guests discover you, and bookings go directly to your site or contact — <strong>0% commission</strong>.
                  </div>
                </div>

                <label style={s.checkboxRow}>
                  <input type="checkbox" checked={form.agreeTerms} onChange={(e) => update("agreeTerms", e.target.checked)} style={{ marginRight: "10px", flexShrink: 0, accentColor: "#fbbf24" }} />
                  <span style={{ fontSize: "14px", color: "#4b5563", lineHeight: 1.6 }}>
                    I agree to the AXXSpace <span style={{ color: "#fbbf24", cursor: "pointer", fontWeight: 700 }}>Terms & Conditions</span> and confirm all information is accurate.
                  </span>
                </label>
              </div>
            )}

            {/* Media Upload Progress Indicator */}
            {submitting && (
              <div style={{
                background: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: "12px",
                padding: "16px",
                marginTop: "20px",
                display: "flex",
                alignItems: "center",
                gap: "14px"
              }}>
                <div className="spinner-media-upload"></div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#92400e" }}>
                    Uploading Property & Media...
                  </div>
                  <div style={{ fontSize: "12px", color: "#b45309", marginTop: "3px", lineHeight: 1.5 }}>
                    {newVideos.length > 0
                      ? `Uploading ${newVideos.length} video walkthrough(s) and ${newImages.length} photo(s). High-definition media processing may take 15–30 seconds. Please keep this tab open.`
                      : `Uploading ${newImages.length} photo(s) and listing details. Please wait a moment.`}
                  </div>
                </div>
              </div>
            )}

            {/* NAV */}
            <div style={s.navBtns}>
              {step > 0 && <button style={s.prevBtn} onClick={() => setStep((s) => s - 1)} disabled={submitting}>← Previous</button>}
              {step < steps.length - 1 ? (
                <button style={{ ...s.nextBtn, opacity: canNext() ? 1 : 0.5 }} onClick={() => { if (canNext()) setStep((s) => s + 1); }}>
                  Next →
                </button>
              ) : (
                <>
                  {submitError && <div style={{ flex: "1 1 100%", marginBottom: "8px" }}><ErrorAlert message={submitError} /></div>}
                  <button style={{ ...s.nextBtn, opacity: form.agreeTerms && !submitting ? 1 : 0.5 }} onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Uploading Media & Submitting…" : "Submit Property "}
                  </button>
                </>
              )}
            </div>
          </div>
        </main>
      </div >
    </div >
  );
}

const s = {
  root: { fontFamily: "'DM Sans', sans-serif", background: "#f8f4f0", minHeight: "100vh", overflowX: "hidden" },
  header: { background: "white", borderBottom: "1px solid #e5e7eb", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" },
  backBtn: { background: "transparent", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", color: "#4b5563", whiteSpace: "nowrap" },
  headerCenter: { textAlign: "center", flex: 1 },
  logo: { display: "flex", alignItems: "center", justifyContent: "center", gap: "2px" },
  logoAccent: { fontSize: "18px", fontWeight: 900, color: "#fbbf24" },
  logoWord: { fontSize: "18px", fontWeight: 900, color: "#1f2937" },
  headerSub: { fontSize: "12px", color: "#6b7280", marginTop: "2px" },
  stepCount: { fontSize: "13px", color: "#9ca3af", fontWeight: 600, whiteSpace: "nowrap" },

  progressBar: { height: "4px", background: "#e5e7eb" },
  progressFill: { height: "100%", background: "#fbbf24", transition: "width 0.4s ease" },

  formCard: { background: "white", borderRadius: "14px", padding: "24px 20px", border: "1px solid #e5e7eb" },
  formTitle: { fontSize: "20px", fontWeight: 800, color: "#1f2937", marginBottom: "6px" },
  formSub: { fontSize: "13px", color: "#6b7280", marginBottom: "24px" },

  field: { marginBottom: "16px" },
  label: { display: "block", fontSize: "11px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" },
  input: { width: "100%", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "12px 14px", fontSize: "14px", fontFamily: "inherit", color: "#1f2937", outline: "none" },

  // Package cards
  pkgSection: { marginTop: "24px" },
  pkgTitle: { fontSize: "13px", fontWeight: 800, color: "#1f2937", marginBottom: "14px" },
  pkgCard: { border: "2px solid #e5e7eb", borderRadius: "12px", padding: "16px", cursor: "pointer", transition: "all 0.2s", position: "relative" },
  pkgBadge: { position: "absolute", top: "-10px", right: "12px", color: "white", fontSize: "10px", fontWeight: 800, padding: "3px 10px", borderRadius: "20px" },

  amenityBtn: { border: "1px solid #e5e7eb", background: "white", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", color: "#4b5563", transition: "all 0.15s", textAlign: "left" },
  amenityActive: { background: "#fef9c3", borderColor: "#fbbf24", color: "#92400e", fontWeight: 700 },
  validationHint: { fontSize: "12px", color: "#dc2626", background: "#fee2e2", padding: "8px 12px", borderRadius: "8px", border: "1px solid #fecaca", marginTop: "8px" },
  uploadBox: { border: "2px dashed #fbbf24", borderRadius: "12px", padding: "24px", textAlign: "center", background: "#fffbeb", cursor: "pointer" },
  uploadBtn: { display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", color: "#92400e" },

  bookingUrlBox: { background: "#f0fdf4", border: "2px solid #bbf7d0", borderRadius: "14px", padding: "18px", marginBottom: "20px" },
  bookingUrlTitle: { fontSize: "14px", fontWeight: 800, color: "#166534", marginBottom: "8px" },
  bookingUrlSub: { fontSize: "13px", color: "#15803d", lineHeight: 1.65, marginBottom: "14px" },

  sectionBreak: { fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #f3f4f6", paddingBottom: "8px", marginBottom: "14px", marginTop: "8px" },
  addRoomBtn: { background: "transparent", border: "1px dashed #fbbf24", color: "#fbbf24", borderRadius: "8px", padding: "10px 16px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginBottom: "20px", width: "100%" },
  removeRoomBtn: { background: "#fee2e2", border: "none", color: "#dc2626", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 },

  reviewItem: { background: "#f9fafb", borderRadius: "10px", padding: "12px" },
  reviewKey: { fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" },
  reviewVal: { fontSize: "13px", color: "#1f2937", fontWeight: 600, wordBreak: "break-word" },

  commissionBox: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "16px", marginBottom: "18px" },
  commissionTitle: { fontSize: "13px", fontWeight: 800, color: "#92400e", marginBottom: "8px" },
  checkboxRow: { display: "flex", alignItems: "flex-start", cursor: "pointer" },

  navBtns: { display: "flex", justifyContent: "space-between", marginTop: "28px", paddingTop: "20px", borderTop: "1px solid #f3f4f6" },
  prevBtn: { background: "transparent", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "12px 20px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: "#4b5563" },
  nextBtn: { background: "#fbbf24", color: "#1f2937", border: "none", borderRadius: "10px", padding: "12px 28px", fontSize: "14px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", marginLeft: "auto" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  input:focus, select:focus, textarea:focus { border-color: #fbbf24 !important; box-shadow: 0 0 0 3px rgba(251,191,36,0.1); }

  .reg-layout {
    max-width: 960px;
    margin: 0 auto;
    padding: 24px 16px;
    display: grid;
    grid-template-columns: 190px 1fr;
    gap: 24px;
    align-items: start;
  }

  .step-nav-desktop {
    background: white;
    border-radius: 14px;
    padding: 16px 12px;
    border: 1px solid #e5e7eb;
    position: sticky;
    top: 20px;
  }

  .two-col-form { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

  .pkg-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }

  .amenities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 8px;
    margin-bottom: 20px;
  }

  .room-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: stretch; flex-wrap: wrap; }
  .room-row input { min-width: 80px; }

  .review-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }

  @media (max-width: 720px) {
    .step-nav-desktop { display: none; }
    .reg-layout { grid-template-columns: 1fr; }
    .two-col-form { grid-template-columns: 1fr; }
    .pkg-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 480px) {
    .amenities-grid { grid-template-columns: repeat(2, 1fr); }
    .review-grid { grid-template-columns: 1fr; }
    .room-row { flex-direction: column; }
  }

  .spinner-media-upload {
    width: 24px;
    height: 24px;
    border: 3px solid #fde68a;
    border-top: 3px solid #d97706;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    flex-shrink: 0;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;