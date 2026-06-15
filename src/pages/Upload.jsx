import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import UniversityPicker from "../components/UniversityPicker";

const HOSTEL_PROPERTY_TYPE = "Hostel Room";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

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

const STEPS = [
  { id: "basic", label: "Basic Info", icon: "📋" },
  { id: "details", label: "Details", icon: "🏠" },
  { id: "images", label: "Images", icon: "📷" },
  { id: "amenities", label: "Amenities", icon: "✨" },
];

function needsUniversityLink(data, landlordType) {
  return data.propertyType === HOSTEL_PROPERTY_TYPE || landlordType === "university";
}

function validateBasic(data, { universityRequired = false } = {}) {
  const missing = [];
  if (!data.title?.trim()) missing.push("Title");
  if (!data.propertyType) missing.push("Property type");
  if (!data.county) missing.push("County");
  if (!data.location?.trim()) missing.push("Location");
  if (!data.totalUnits || Number(data.totalUnits) < 1) missing.push("Number of units");
  if (universityRequired && !data.universityId) missing.push("University");
  return missing;
}

function validateDetails(data) {
  const missing = [];
  if (!data.description?.trim()) missing.push("Description");
  if (!data.price || Number(data.price) <= 0) missing.push("Price");
  if (data.bedrooms === "" || Number(data.bedrooms) < 0) missing.push("Bedrooms");
  if (data.bathrooms === "" || Number(data.bathrooms) < 0) missing.push("Bathrooms");
  if (data.bookedUnits > data.totalUnits) missing.push("Booked units cannot exceed total units");
  return missing;
}

function validateImages(imageList) {
  return imageList.length === 0 ? ["At least one image"] : [];
}

function validateAmenities(data, agreed) {
  const missing = [];
  if (data.amenities.length === 0) missing.push("At least one amenity");
  if (!agreed) missing.push("Terms agreement");
  return missing;
}

const STEP_VALIDATORS = [
  null, // basic — validated in component (needs landlordType)
  (data) => validateDetails(data),
  (_data, images) => validateImages(images),
  (data, _images, agreed) => validateAmenities(data, agreed),
];

const COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta",
  "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka Nithi",
  "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga",
  "Murang'a", "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans Nzoia",
  "Uasin Gishu", "Elgeyo Marakwet", "Nandi", "Baringo", "Laikipia", "Nakuru",
  "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma",
  "Busia", "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira",
  "Nairobi City"
];

export default function Upload() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const landlordType = user?.landlordType || "general";

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
    university: "",
    universityId: "",
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(0);
  const [stepErrors, setStepErrors] = useState([]);
  const [consent, setConsent] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);

  const universityRequired = needsUniversityLink(formData, landlordType);

  const runStepValidation = (stepIndex) => {
    if (stepIndex === 0) {
      return validateBasic(formData, { universityRequired });
    }
    const validator = STEP_VALIDATORS[stepIndex];
    if (!validator) return [];
    if (stepIndex === 2) return validator(formData, images);
    if (stepIndex === 3) return validator(formData, images, consent);
    return validator(formData);
  };

  const isStepComplete = (stepIndex) => runStepValidation(stepIndex).length === 0;

  const goToStep = (stepIndex) => {
    if (stepIndex > maxUnlockedStep) return;
    setStepErrors([]);
    setError("");
    setCurrentStep(stepIndex);
  };

  const handleNextStep = () => {
    const missing = runStepValidation(currentStep);
    if (missing.length > 0) {
      setStepErrors(missing);
      setError(`Complete required fields: ${missing.join(", ")}`);
      return;
    }
    setStepErrors([]);
    setError("");
    const next = currentStep + 1;
    if (next < STEPS.length) {
      setCurrentStep(next);
      setMaxUnlockedStep((prev) => Math.max(prev, next));
    }
  };

  const handlePrevStep = () => {
    setStepErrors([]);
    setError("");
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleUniversityPick = (uni) => {
    setSelectedUniversity(uni);
    setFormData((prev) => ({
      ...prev,
      university: uni?.name || "",
      universityId: uni ? String(uni.id) : "",
    }));
  };

  useEffect(() => {
    if (stepErrors.length > 0 && isStepComplete(currentStep)) {
      setStepErrors([]);
      setError("");
    }
  }, [formData, images, consent, currentStep]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "furnished" || name === "initiallyBooked") {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value === "true",
      }));
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
      setCurrentStep(3);
      setStepErrors(["Terms agreement"]);
      return;
    }

    const allMissing = [
      ...validateBasic(formData, { universityRequired }),
      ...validateDetails(formData),
      ...validateImages(images),
      ...validateAmenities(formData, consent),
    ];
    if (allMissing.length > 0) {
      setError(`Complete all steps before submitting: ${allMissing.join(", ")}`);
      if (!isStepComplete(0)) setCurrentStep(0);
      else if (!isStepComplete(1)) setCurrentStep(1);
      else if (!isStepComplete(2)) setCurrentStep(2);
      else setCurrentStep(3);
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
        bookedUnits: 0, initiallyBooked: false, university: "", universityId: "",
      });
      setImages([]);
      setImagePreviews([]);
      setConsent(false);
      setSelectedUniversity(null);
      setCurrentStep(0);
      setMaxUnlockedStep(0);
      setStepErrors([]);

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

      {/* STEP PROGRESS */}
      <div style={styles.stepProgress} className="upload-step-progress">
        {STEPS.map((step, index) => {
          const unlocked = index <= maxUnlockedStep;
          const complete = index < currentStep && isStepComplete(index);
          const active = index === currentStep;
          return (
            <button
              key={step.id}
              type="button"
              disabled={!unlocked}
              onClick={() => goToStep(index)}
              style={{
                ...styles.stepItem,
                ...(active && styles.stepItemActive),
                ...(complete && styles.stepItemComplete),
                ...(!unlocked && styles.stepItemLocked),
              }}
            >
              <span style={styles.stepNumber}>
                {complete ? "✓" : index + 1}
              </span>
              <span style={styles.stepLabel}>
                {step.icon} {step.label}
              </span>
            </button>
          );
        })}
      </div>

      <div style={styles.stepHint}>
        Step {currentStep + 1} of {STEPS.length} — complete this section to unlock the next
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>

        {/* ── BASIC INFO ── */}
        {currentStep === 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Basic Info</h2>
            {stepErrors.length > 0 && (
              <div style={styles.stepErrorBox}>
                Required: {stepErrors.join(", ")}
              </div>
            )}

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
                {COUNTIES.map(county => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Location *</label>
              <input type="text" name="location" placeholder="e.g., Westlands" value={formData.location} onChange={handleChange} style={styles.input} required />
            </div>

            <div style={styles.formGroup}>
              <UniversityPicker
                value={selectedUniversity}
                onChange={handleUniversityPick}
                required={universityRequired}
                label={universityRequired ? "Nearby University" : "Nearby University (Optional)"}
                hint={
                  universityRequired
                    ? "Required — students browsing this university will see your listing after admin approval."
                    : "Optional — link your property to a campus so students can find it under University Hostels."
                }
              />
            </div>

            {universityRequired && (
              <div style={styles.universityNotice}>
                <strong>🎓 Campus listing</strong>
                <p style={{ margin: "6px 0 0", lineHeight: 1.5 }}>
                  {formData.propertyType === HOSTEL_PROPERTY_TYPE
                    ? "Hostel listings must be linked to a university so students can find them when they select that campus."
                    : "As a near-university landlord, every property must be linked to the campus you serve."}
                </p>
              </div>
            )}

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

            <button
              type="button"
              onClick={handleNextStep}
              disabled={!isStepComplete(0)}
              style={{
                ...styles.nextBtn,
                opacity: isStepComplete(0) ? 1 : 0.5,
                cursor: isStepComplete(0) ? "pointer" : "not-allowed",
              }}
            >
              Next →
            </button>
          </div>
        )}

        {/* ── DETAILS ── */}
        {currentStep === 1 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Details</h2>
            {stepErrors.length > 0 && (
              <div style={styles.stepErrorBox}>
                Required: {stepErrors.join(", ")}
              </div>
            )}

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
              <button type="button" onClick={handlePrevStep} style={styles.prevBtn}>← Back</button>
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!isStepComplete(1)}
                style={{
                  ...styles.nextBtn,
                  opacity: isStepComplete(1) ? 1 : 0.5,
                  cursor: isStepComplete(1) ? "pointer" : "not-allowed",
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── IMAGES ── */}
        {currentStep === 2 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Images</h2>
            {stepErrors.length > 0 && (
              <div style={styles.stepErrorBox}>
                Required: {stepErrors.join(", ")}
              </div>
            )}

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
              <button type="button" onClick={handlePrevStep} style={styles.prevBtn}>← Back</button>
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!isStepComplete(2)}
                style={{
                  ...styles.nextBtn,
                  opacity: isStepComplete(2) ? 1 : 0.5,
                  cursor: isStepComplete(2) ? "pointer" : "not-allowed",
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── AMENITIES ── */}
        {currentStep === 3 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Amenities</h2>
            {stepErrors.length > 0 && (
              <div style={styles.stepErrorBox}>
                Required: {stepErrors.join(", ")}
              </div>
            )}

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

            <div style={styles.navBtns}>
              <button type="button" onClick={handlePrevStep} style={styles.prevBtn}>← Back</button>
            </div>

            <button type="submit" disabled={loading || !isStepComplete(3)} style={{
              ...styles.submitBtn,
              opacity: (!isStepComplete(3) || loading) ? 0.5 : 1,
              cursor: (!isStepComplete(3) || loading) ? "not-allowed" : "pointer",
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
  stepProgress: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "8px",
    padding: "12px",
    background: "#1e293b",
  },
  stepItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    padding: "10px 6px",
    background: "#0f1729",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#94a3b8",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
  stepItemActive: {
    background: "#fbbf24",
    color: "#0f1729",
    borderColor: "#fbbf24",
    fontWeight: 700,
  },
  stepItemComplete: {
    borderColor: "#22c55e",
    color: "#86efac",
  },
  stepItemLocked: {
    opacity: 0.45,
    cursor: "not-allowed",
  },
  stepNumber: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    background: "rgba(0,0,0,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 800,
  },
  stepLabel: {
    fontSize: "10px",
    fontWeight: 600,
    textAlign: "center",
    lineHeight: 1.2,
  },
  stepHint: {
    padding: "8px 16px",
    fontSize: "12px",
    color: "#64748b",
    background: "#0f1729",
    borderBottom: "1px solid #1e293b",
  },
  stepErrorBox: {
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid #ef4444",
    color: "#fca5a5",
    padding: "10px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "16px",
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
  hint: {
    fontSize: "11px",
    color: "#64748b",
    marginTop: "4px",
    marginBottom: "0",
  },
  universityNotice: {
    background: "rgba(59, 130, 246, 0.12)",
    border: "1px solid #3b82f6",
    borderRadius: "10px",
    padding: "14px 16px",
    marginBottom: "16px",
    fontSize: "13px",
    color: "#93c5fd",
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

  @media (max-width: 600px) {
    .upload-step-progress {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
`;