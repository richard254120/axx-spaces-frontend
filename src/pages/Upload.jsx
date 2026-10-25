import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import UniversityPicker from "../components/UniversityPicker";
import { resolveMediaUrl } from "../utils/fileLinks";

const HOSTEL_PROPERTY_TYPE = "Hostel Room";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

const AMENITIES_DATA = [
  { name: "WiFi", icon: "📶" },
  { name: "Parking", icon: "🅿️" },
  { name: "24/7 Security", icon: "🛡️" },
  { name: "Water Tank", icon: "💧" },
  { name: "Generator", icon: "⚡" },
  { name: "Security Fence", icon: "🧱" },
  { name: "Balcony", icon: "🌇" },
  { name: "AC/Cooler", icon: "❄️" },
  { name: "TV", icon: "📺" },
  { name: "Refrigerator", icon: "🧊" },
  { name: "Cooking Stove", icon: "🍳" },
  { name: "Bed", icon: "🛏️" },
  { name: "Sofa", icon: "🛋️" },
  { name: "Dining Table", icon: "🪑" },
  { name: "Shower", icon: "🚿" },
  { name: "Kitchen Cabinet", icon: "🗄️" },
  { name: "Wardrobes", icon: "🚪" },
  { name: "Ceiling Fans", icon: "💨" },
  { name: "Lights", icon: "💡" },
  { name: "Swimming Pool", icon: "🏊" },
  { name: "Gym", icon: "🏋️" },
  { name: "Garden", icon: "🌿" },
  { name: "Workspace", icon: "💻" },
  { name: "Pet Friendly", icon: "🐾" },
];

const PROPERTY_TYPES = [
  "Bedsitter", "Studio Apartment", "1 Bedroom", "2 Bedroom", "3 Bedroom",
  "4+ Bedroom", "Maisonette", "Bungalow", "Townhouse", "Apartment Block",
  "Single Room", "Shared Room", "Hostel Room", "Commercial Office",
  "Shop / Retail Space", "Warehouse", "Plot / Land", "Furnished Apartment",
  "Unfurnished Apartment", "Penthouse", "Duplex"
];

const STEPS = [
  { id: "basic", label: "Basic Info", icon: "📋", desc: "Title & Location" },
  { id: "details", label: "Pricing & Details", icon: "🏷️", desc: "Rent & Terms" },
  { id: "images", label: "Photos & Media", icon: "📸", desc: "Images & Video" },
  { id: "amenities", label: "Amenities & Publish", icon: "✨", desc: "Features & Submit" },
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
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const landlordType = user?.landlordType || "general";

  const [autoRefCode] = useState(() => `AXX-${Math.floor(1000 + Math.random() * 9000)}`);
  const todayDateFormatted = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    deposit: "",
    bedrooms: "",
    bathrooms: 1,
    amenities: [],
    totalUnits: 1,
    furnished: true,
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
  const [existingImages, setExistingImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [videos, setVideos] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);

  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [locLoading, setLocLoading] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(0);
  const [stepErrors, setStepErrors] = useState([]);
  const [showManualGps, setShowManualGps] = useState(false);

  useEffect(() => {
    if (user && !["landlord", "agent", "admin"].includes((user.role || "").toLowerCase())) {
      navigate("/member", { replace: true });
    }
  }, [user, navigate]);

  // Load existing property data for Edit mode
  useEffect(() => {
    if (isEditMode && token) {
      const fetchProperty = async () => {
        try {
          const response = await fetch(`${API_BASE}/properties/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!response.ok) throw new Error("Failed to fetch property details");
          const data = await response.json();

          setFormData({
            title: data.title || "",
            description: data.description || "",
            location: data.location || "",
            price: data.price || "",
            deposit: data.deposit || "",
            bedrooms: data.bedrooms !== undefined ? data.bedrooms : "",
            bathrooms: data.bathrooms !== undefined ? data.bathrooms : 1,
            amenities: data.amenities || [],
            totalUnits: data.totalUnits || 1,
            furnished: data.furnished !== undefined ? data.furnished : true,
            leaseType: data.leaseType || "monthly",
            availableFrom: data.availableFrom ? new Date(data.availableFrom).toISOString().split('T')[0] : "",
            rules: data.rules || "",
            propertyType: data.propertyType || "",
            county: data.county || "",
            lat: data.lat || "",
            lng: data.lng || "",
            bookedUnits: data.bookedUnits || 0,
            initiallyBooked: data.bookedUnits > 0,
            university: data.university || "",
            universityId: data.universityId || "",
          });

          if (data.universityId && data.university) {
            setSelectedUniversity({
              id: data.universityId,
              name: data.university
            });
          }

          if (data.lat || data.lng) {
            setShowManualGps(true);
          }

          setExistingImages(data.images || []);
          setImagePreviews(data.images || []);
          setMaxUnlockedStep(3);
        } catch (err) {
          setError(err.message || "Failed to load property data");
        }
      };
      fetchProperty();
    }
  }, [id, token, isEditMode]);

  const universityRequired = needsUniversityLink(formData, landlordType);

  const runStepValidation = (stepIndex) => {
    if (stepIndex === 0) {
      return validateBasic(formData, { universityRequired });
    }
    const validator = STEP_VALIDATORS[stepIndex];
    if (!validator) return [];
    if (stepIndex === 2) return (existingImages.length + images.length === 0) ? ["At least one image"] : [];
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
      setError(`Please complete the required fields: ${missing.join(", ")}`);
      return;
    }
    setStepErrors([]);
    setError("");
    const next = currentStep + 1;
    if (next < STEPS.length) {
      setCurrentStep(next);
      setMaxUnlockedStep((prev) => Math.max(prev, next));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    setStepErrors([]);
    setError("");
    setCurrentStep((prev) => Math.max(0, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
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
  }, [formData, images, existingImages, consent, currentStep]);

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
          ? value
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
    if (files.length + images.length + existingImages.length > 10) {
      setError("Maximum 10 images allowed per listing");
      return;
    }
    setImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleVideoChange = (fileList) => {
    const files = Array.from(fileList);
    const validVideos = [];
    const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

    if (videos.length + files.length > 5) {
      setError("Maximum 5 videos allowed per listing");
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith("video/")) {
        setError(`"${file.name}" is not a valid video file`);
        return;
      }
      if (file.size > MAX_VIDEO_SIZE) {
        setError(`"${file.name}" exceeds the 100MB limit`);
        return;
      }
      validVideos.push(file);
    }

    setVideos((prev) => [...prev, ...validVideos]);
    const newPreviews = validVideos.map((file) => URL.createObjectURL(file));
    setVideoPreviews((prev) => [...prev, ...newPreviews]);
    setError("");
  };

  const removeVideo = (index) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
    setVideoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeImage = (index) => {
    if (index < existingImages.length) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      const newFileIndex = index - existingImages.length;
      setImages((prev) => prev.filter((_, i) => i !== newFileIndex));
    }
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
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
        setError("Unable to retrieve location. You may enter coordinates manually.");
        setLocLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!consent) {
      setError("Please agree to the terms and conditions before submitting");
      setCurrentStep(3);
      setStepErrors(["Terms agreement"]);
      return;
    }

    const imageCheck = (existingImages.length + images.length === 0) ? ["At least one image"] : [];
    const allMissing = [
      ...validateBasic(formData, { universityRequired }),
      ...validateDetails(formData),
      ...imageCheck,
      ...validateAmenities(formData, consent),
    ];
    if (allMissing.length > 0) {
      setError(`Please complete all required steps: ${allMissing.join(", ")}`);
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
          } else if (key === "bedrooms") {
            const numBedrooms = formData.bedrooms !== "" && formData.bedrooms !== undefined
              ? formData.bedrooms
              : (formData.propertyType?.match(/(\d+)\+?\s*Bedroom/i)?.[1] || 0);
            formDataToSend.append("bedrooms", String(numBedrooms));
          } else if (key === "bathrooms") {
            const numBathrooms = formData.bathrooms !== "" && formData.bathrooms !== undefined
              ? formData.bathrooms
              : 1;
            formDataToSend.append("bathrooms", String(numBathrooms));
          } else if (key === "furnished" || key === "initiallyBooked") {
            formDataToSend.append(key, String(formData[key]));
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      if (isEditMode) {
        formDataToSend.append("remainingImages", JSON.stringify(existingImages));
      }

      images.forEach((image) => formDataToSend.append("images", image));
      videos.forEach((video) => formDataToSend.append("videos", video));

      const url = isEditMode ? `${API_BASE}/properties/${id}` : `${API_BASE}/properties`;
      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Submission failed");
      }

      setSuccess(isEditMode ? "Property updated successfully!" : "Property submitted successfully! Pending approval.");

      if (!isEditMode) {
        setFormData({
          title: "", description: "", location: "", price: "", deposit: "",
          bedrooms: "", bathrooms: 1, amenities: [], totalUnits: 1,
          furnished: true, leaseType: "monthly", availableFrom: "", rules: "",
          propertyType: "", county: "", lat: "", lng: "",
          bookedUnits: 0, initiallyBooked: false, university: "", universityId: "",
        });
        setImages([]);
        setImagePreviews([]);
        setVideos([]);
        setVideoPreviews([]);
        setConsent(false);
        setSelectedUniversity(null);
        setCurrentStep(0);
        setMaxUnlockedStep(0);
        setStepErrors([]);
      }

      const redirectPath = user?.role === "admin" ? "/admin/dashboard" : user?.role === "agent" ? "/agent/dashboard" : "/dashboard";
      setTimeout(() => navigate(redirectPath), 2200);
    } catch (err) {
      setError(err.message || "Error submitting property");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={styles.container}>
        <style>{cssStyles}</style>
        <div style={styles.unauthCard}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔒</div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 8px", color: "#f8fafc" }}>
            Sign In Required
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0 0 20px" }}>
            Please log in with your landlord or agent account to publish a property.
          </p>
          <button onClick={() => navigate("/login")} style={styles.primaryBtn}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const currentStepData = STEPS[currentStep];
  const progressPercent = ((currentStep) / (STEPS.length - 1)) * 100;

  return (
    <div style={styles.container}>
      <style>{cssStyles}</style>

      <div style={styles.wrapper}>
        {/* TOP BAR / BREADCRUMB */}
        <div style={styles.topNav}>
          <button
            type="button"
            style={styles.backBtn}
            onClick={() => navigate(user?.role === "admin" ? "/admin/dashboard" : "/dashboard")}
          >
            ← Back to Dashboard
          </button>
          <div style={styles.badgeLive}>
            <span style={styles.badgeDot} />
            {isEditMode ? "Editing Property" : "Direct Listing"}
          </div>
        </div>

        {/* HERO TITLE */}
        <div style={styles.headerArea}>
          <h1 style={styles.heading}>
            {isEditMode ? "Edit Property Listing" : "List Your Property"}
          </h1>
          <p style={styles.subheading}>
            Reach thousands of verified tenants across Kenya with transparent pricing and zero broker hassle.
          </p>
        </div>

        {/* STEPPER PROGRESS */}
        <div style={styles.stepperCard}>
          <div style={styles.stepperTrackWrap}>
            <div style={{ ...styles.stepperTrackFill, width: `${progressPercent}%` }} />
          </div>

          <div style={styles.stepGrid}>
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
                    ...styles.stepBtn,
                    ...(active ? styles.stepBtnActive : {}),
                    ...(complete ? styles.stepBtnComplete : {}),
                    ...(!unlocked ? styles.stepBtnLocked : {}),
                  }}
                >
                  <div style={{
                    ...styles.stepNumberBadge,
                    ...(active ? styles.stepNumberBadgeActive : {}),
                    ...(complete ? styles.stepNumberBadgeComplete : {}),
                  }}>
                    {complete ? "✓" : index + 1}
                  </div>
                  <div style={styles.stepTextWrap}>
                    <span style={styles.stepTitleText}>{step.label}</span>
                    <span style={styles.stepSubText}>{step.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ALERTS */}
        {error && (
          <div style={styles.errorBanner}>
            <span style={{ fontSize: "16px" }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div style={styles.successBanner}>
            <span style={{ fontSize: "16px" }}>✅</span>
            <span>{success}</span>
          </div>
        )}

        {/* MAIN FORM CARD */}
        <div style={styles.formCard}>
          <div style={styles.formCardHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "22px" }}>{currentStepData.icon}</span>
              <div>
                <h2 style={styles.cardStepTitle}>{currentStepData.label}</h2>
                <span style={styles.cardStepIndicator}>
                  Step {currentStep + 1} of {STEPS.length}
                </span>
              </div>
            </div>
            {stepErrors.length > 0 && (
              <span style={styles.stepReqPill}>
                {stepErrors.length} field{stepErrors.length > 1 ? "s" : ""} required
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} style={styles.formContent}>

            {/* ═══════════════════════════════════════════════════════
                STEP 0: BASIC INFO
            ═══════════════════════════════════════════════════════ */}
            {currentStep === 0 && (
              <div style={styles.stepSection}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Property Title <span style={styles.reqStar}>*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g., Spacious 2-Bedroom Master Ensuite Apartment"
                    value={formData.title}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  />
                  <span style={styles.helperText}>A descriptive title helps your listing stand out in search results.</span>
                </div>

                <div style={styles.gridTwo}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Property Type <span style={styles.reqStar}>*</span>
                    </label>
                    <select
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleChange}
                      style={styles.select}
                      required
                    >
                      <option value="">Select Property Type</option>
                      {PROPERTY_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      County <span style={styles.reqStar}>*</span>
                    </label>
                    <select
                      name="county"
                      value={formData.county}
                      onChange={handleChange}
                      style={styles.select}
                      required
                    >
                      <option value="">Select County</option>
                      {COUNTIES.map((county) => (
                        <option key={county} value={county}>{county}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={styles.gridTwo}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Area / Neighborhood <span style={styles.reqStar}>*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      placeholder="e.g., Westlands, Kilimani, Juja"
                      value={formData.location}
                      onChange={handleChange}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Total Units Available <span style={styles.reqStar}>*</span>
                    </label>
                    <input
                      type="number"
                      name="totalUnits"
                      min="1"
                      value={formData.totalUnits}
                      onChange={handleChange}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                {/* University Picker */}
                <div style={styles.universityBox}>
                  <UniversityPicker
                    value={selectedUniversity}
                    onChange={handleUniversityPick}
                    required={universityRequired}
                    label={universityRequired ? "Linked Campus / University *" : "Nearby University (Optional)"}
                    hint={
                      universityRequired
                        ? "Required for hostel listings and campus landlords so students find your property."
                        : "Link your property to a nearby campus to appear in student hostel searches."
                    }
                  />
                </div>

                {/* GPS Coordinates Section */}
                <div style={styles.gpsContainer}>
                  <div style={styles.gpsTopRow}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "18px" }}>📍</span>
                      <div>
                        <span style={styles.gpsCardTitle}>GPS Map Pin</span>
                        <span style={styles.recBadge}>Recommended</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={locLoading}
                      style={styles.gpsLocateBtn}
                    >
                      {locLoading ? "Detecting GPS..." : "📍 Auto-Detect Location"}
                    </button>
                  </div>

                  {(formData.lat || formData.lng) ? (
                    <div style={styles.gpsDetectedPill}>
                      <span>✓ Pinned at {formData.lat}, {formData.lng}</span>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, lat: "", lng: "" }))}
                        style={styles.gpsClearBtn}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                      <span style={styles.gpsInfoText}>
                        Pinning your property enables map view so tenants find you faster.
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowManualGps(!showManualGps)}
                        style={styles.textLinkBtn}
                      >
                        {showManualGps ? "Hide coordinates" : "Enter manually"}
                      </button>
                    </div>
                  )}

                  {showManualGps && (
                    <div style={{ ...styles.gridTwo, marginTop: "12px" }}>
                      <div>
                        <label style={styles.smallLabel}>Latitude</label>
                        <input
                          type="number"
                          name="lat"
                          step="any"
                          placeholder="-1.292066"
                          value={formData.lat}
                          onChange={handleChange}
                          style={styles.smallInput}
                        />
                      </div>
                      <div>
                        <label style={styles.smallLabel}>Longitude</label>
                        <input
                          type="number"
                          name="lng"
                          step="any"
                          placeholder="36.821945"
                          value={formData.lng}
                          onChange={handleChange}
                          style={styles.smallInput}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div style={styles.actionsBar}>
                  <div />
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!isStepComplete(0)}
                    style={{
                      ...styles.primaryBtn,
                      opacity: isStepComplete(0) ? 1 : 0.5,
                      cursor: isStepComplete(0) ? "pointer" : "not-allowed",
                    }}
                  >
                    Continue to Details →
                  </button>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════
                STEP 1: PRICING & DETAILS
            ═══════════════════════════════════════════════════════ */}
            {currentStep === 1 && (
              <div style={styles.stepSection}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Property Description <span style={styles.reqStar}>*</span>
                  </label>
                  <textarea
                    name="description"
                    placeholder="Highlight main features, finishes, security, water availability, nearby transit, and what makes your property special..."
                    value={formData.description}
                    onChange={handleChange}
                    style={styles.textarea}
                    rows="4"
                    required
                  />
                </div>

                {/* Pricing Row */}
                <div style={styles.gridTwo}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Monthly Rent (KES) <span style={styles.reqStar}>*</span>
                    </label>
                    <div style={styles.prefixInputWrap}>
                      <span style={styles.inputPrefix}>KES</span>
                      <input
                        type="number"
                        name="price"
                        placeholder="25000"
                        value={formData.price}
                        onChange={handleChange}
                        style={styles.prefixInput}
                        required
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Security Deposit (KES)</label>
                    <div style={styles.prefixInputWrap}>
                      <span style={styles.inputPrefix}>KES</span>
                      <input
                        type="number"
                        name="deposit"
                        placeholder="25000"
                        value={formData.deposit}
                        onChange={handleChange}
                        style={styles.prefixInput}
                      />
                    </div>
                  </div>
                </div>

                {/* Auto Reference & Date Row */}
                <div style={styles.gridTwo}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Listing Reference <span style={styles.autoTag}>Auto</span>
                    </label>
                    <input
                      type="text"
                      value={isEditMode && id ? `AXX-${id.slice(-4).toUpperCase()}` : autoRefCode}
                      readOnly
                      style={styles.readOnlyInput}
                    />
                    <span style={styles.helperText}>Unique verification reference for your property.</span>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Date Listed <span style={styles.autoTag}>Auto</span>
                    </label>
                    <input
                      type="text"
                      value={todayDateFormatted}
                      readOnly
                      style={styles.readOnlyInput}
                    />
                    <span style={styles.helperText}>Official timestamp when listing was created.</span>
                  </div>
                </div>

                {/* Furnished & Lease Type */}
                <div style={styles.gridTwo}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Furnished</label>
                    <select
                      name="furnished"
                      value={String(formData.furnished)}
                      onChange={handleChange}
                      style={styles.select}
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Lease Type</label>
                    <select
                      name="leaseType"
                      value={formData.leaseType}
                      onChange={handleChange}
                      style={styles.select}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="6months">6 Months</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div style={styles.gridTwo}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Available From</label>
                    <input
                      type="date"
                      name="availableFrom"
                      value={formData.availableFrom}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>House Rules (Optional)</label>
                    <input
                      type="text"
                      name="rules"
                      placeholder="e.g., No smoking inside, Quiet hours after 10 PM"
                      value={formData.rules}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.actionsBar}>
                  <button type="button" onClick={handlePrevStep} style={styles.secondaryBtn}>
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!isStepComplete(1)}
                    style={{
                      ...styles.primaryBtn,
                      opacity: isStepComplete(1) ? 1 : 0.5,
                      cursor: isStepComplete(1) ? "pointer" : "not-allowed",
                    }}
                  >
                    Continue to Media →
                  </button>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════
                STEP 2: PHOTOS & MEDIA
            ═══════════════════════════════════════════════════════ */}
            {currentStep === 2 && (
              <div style={styles.stepSection}>
                {/* Images Upload */}
                <div style={styles.formGroup}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label style={{ ...styles.label, marginBottom: 0 }}>
                      Property Photos <span style={styles.reqStar}>*</span>
                    </label>
                    <span style={styles.countBadge}>
                      {imagePreviews.length}/10 Photos
                    </span>
                  </div>

                  <div style={styles.uploadDropzone}>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      id="imageInput"
                      style={{ display: "none" }}
                    />
                    <label htmlFor="imageInput" style={styles.dropzoneLabel}>
                      <span style={{ fontSize: "36px", marginBottom: "8px" }}>📸</span>
                      <span style={{ fontWeight: 700, fontSize: "15px", color: "#f8fafc" }}>
                        Click to select photos
                      </span>
                      <span style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                        Upload up to 10 high-quality photos (JPG, PNG, WEBP)
                      </span>
                    </label>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div style={styles.previewGrid}>
                      {imagePreviews.map((preview, index) => {
                        const src = (String(preview).startsWith("blob:") || String(preview).startsWith("data:"))
                          ? preview
                          : resolveMediaUrl(preview);
                        const isCover = index === 0;

                        return (
                          <div key={index} style={styles.previewCard}>
                            <img src={src} alt={`Property preview ${index + 1}`} style={styles.previewImage} />
                            {isCover && <span style={styles.coverBadge}>Cover Photo</span>}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              style={styles.trashBtn}
                              title="Remove photo"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Walkthrough Video Upload */}
                <div style={styles.videoCardBox}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "20px" }}>🎥</span>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: "14px", color: "#f8fafc" }}>
                          Walkthrough Video
                        </span>
                        <span style={styles.optBadge}>Optional</span>
                      </div>
                    </div>
                    {videos.length > 0 && (
                      <span style={styles.readyBadge}>
                        ✓ {videos.length} video{videos.length > 1 ? "s" : ""} selected
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      ...styles.videoDropzone,
                      borderColor: isDraggingVideo ? "#38bdf8" : "#334155",
                      background: isDraggingVideo ? "rgba(56, 189, 248, 0.08)" : "#0b1324",
                    }}
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingVideo(true); }}
                    onDragLeave={() => setIsDraggingVideo(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingVideo(false);
                      if (e.dataTransfer.files) handleVideoChange(e.dataTransfer.files);
                    }}
                  >
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) handleVideoChange(e.target.files);
                        e.target.value = "";
                      }}
                      id="videoInput"
                      style={{ display: "none" }}
                    />
                    <label htmlFor="videoInput" style={styles.dropzoneLabel}>
                      <span style={{ fontSize: "28px", marginBottom: "6px" }}>📹</span>
                      <span style={{ fontWeight: 600, fontSize: "14px", color: "#e2e8f0" }}>
                        Click to add walkthrough video
                      </span>
                      <span style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                        MP4, WebM or MOV • Max 100MB
                      </span>
                    </label>
                  </div>

                  {videoPreviews.length > 0 && (
                    <div style={styles.videoList}>
                      {videos.map((file, idx) => (
                        <div key={idx} style={styles.videoItem}>
                          <video
                            src={videoPreviews[idx]}
                            controls
                            playsInline
                            style={styles.videoPlayer}
                          />
                          <div style={styles.videoMeta}>
                            <span style={styles.videoFileName}>{file.name}</span>
                            <span style={styles.videoFileSize}>
                              {(file.size / (1024 * 1024)).toFixed(1)} MB
                            </span>
                            <button
                              type="button"
                              onClick={() => removeVideo(idx)}
                              style={styles.videoDeleteBtn}
                            >
                              Remove video
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={styles.actionsBar}>
                  <button type="button" onClick={handlePrevStep} style={styles.secondaryBtn}>
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!isStepComplete(2)}
                    style={{
                      ...styles.primaryBtn,
                      opacity: isStepComplete(2) ? 1 : 0.5,
                      cursor: isStepComplete(2) ? "pointer" : "not-allowed",
                    }}
                  >
                    Continue to Amenities →
                  </button>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════
                STEP 3: AMENITIES & SUBMISSION
            ═══════════════════════════════════════════════════════ */}
            {currentStep === 3 && (
              <div style={styles.stepSection}>
                <div style={styles.formGroup}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <label style={{ ...styles.label, marginBottom: 0 }}>
                      Select Property Amenities <span style={styles.reqStar}>*</span>
                    </label>
                    <span style={styles.countBadge}>
                      {formData.amenities.length} Selected
                    </span>
                  </div>

                  <div style={styles.amenitiesGrid}>
                    {AMENITIES_DATA.map((item) => {
                      const selected = formData.amenities.includes(item.name);
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => handleAmenityToggle(item.name)}
                          style={{
                            ...styles.amenityChip,
                            ...(selected ? styles.amenityChipSelected : {}),
                          }}
                        >
                          <span style={{ fontSize: "16px" }}>{item.icon}</span>
                          <span style={{ flex: 1, textAlign: "left" }}>{item.name}</span>
                          <span style={{
                            ...styles.amenityCheck,
                            ...(selected ? styles.amenityCheckSelected : {}),
                          }}>
                            {selected ? "✓" : "+"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Agreement Checkbox */}
                <div style={styles.termsCard}>
                  <label style={styles.termsLabel}>
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      style={styles.checkboxInput}
                    />
                    <span style={styles.termsText}>
                      I confirm that all property details, rent, and photos provided are accurate, genuine, and comply with AXX Spaces platform guidelines.
                    </span>
                  </label>
                </div>

                <div style={styles.actionsBar}>
                  <button type="button" onClick={handlePrevStep} style={styles.secondaryBtn}>
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !isStepComplete(3)}
                    style={{
                      ...styles.submitBtn,
                      opacity: (!isStepComplete(3) || loading) ? 0.6 : 1,
                      cursor: (!isStepComplete(3) || loading) ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                        <span className="upload-spinner" /> Publishing Property...
                      </span>
                    ) : (
                      <span>🚀 {isEditMode ? "Save Changes" : "Publish Property Listing"}</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#080e1a",
    color: "#f8fafc",
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    padding: "24px 16px 60px",
    boxSizing: "border-box",
  },
  wrapper: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  topNav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  backBtn: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    color: "#cbd5e1",
    fontSize: "13px",
    fontWeight: 600,
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s ease",
  },
  badgeLive: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(16, 185, 129, 0.12)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    color: "#34d399",
    fontSize: "12px",
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: "20px",
  },
  badgeDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#10b981",
  },
  headerArea: {
    marginBottom: "24px",
  },
  heading: {
    fontSize: "26px",
    fontWeight: 800,
    color: "#ffffff",
    margin: "0 0 6px",
    letterSpacing: "-0.5px",
  },
  subheading: {
    fontSize: "14px",
    color: "#94a3b8",
    margin: 0,
    lineHeight: 1.5,
  },

  // ── STEPPER ──
  stepperCard: {
    background: "#0f172a",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "14px",
    padding: "16px",
    marginBottom: "20px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
  },
  stepperTrackWrap: {
    width: "100%",
    height: "4px",
    background: "#1e293b",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "14px",
  },
  stepperTrackFill: {
    height: "100%",
    background: "linear-gradient(90deg, #3b82f6 0%, #10b981 100%)",
    borderRadius: "4px",
    transition: "width 0.3s ease",
  },
  stepGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "8px",
  },
  stepBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 10px",
    borderRadius: "8px",
    background: "transparent",
    border: "1px solid transparent",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  stepBtnActive: {
    background: "rgba(59, 130, 246, 0.12)",
    borderColor: "rgba(59, 130, 246, 0.35)",
  },
  stepBtnComplete: {
    background: "rgba(16, 185, 129, 0.08)",
  },
  stepBtnLocked: {
    opacity: 0.45,
    cursor: "not-allowed",
  },
  stepNumberBadge: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    background: "#1e293b",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 700,
    flexShrink: 0,
  },
  stepNumberBadgeActive: {
    background: "#3b82f6",
    color: "#ffffff",
    boxShadow: "0 0 10px rgba(59, 130, 246, 0.4)",
  },
  stepNumberBadgeComplete: {
    background: "#10b981",
    color: "#ffffff",
  },
  stepTextWrap: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  stepTitleText: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#f1f5f9",
    whiteSpace: "nowrap",
  },
  stepSubText: {
    fontSize: "10px",
    color: "#64748b",
    whiteSpace: "nowrap",
  },

  // ── FORM CARD ──
  formCard: {
    background: "#0f172a",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
  },
  formCardHeader: {
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
    background: "rgba(255, 255, 255, 0.02)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardStepTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: 700,
    color: "#f8fafc",
  },
  cardStepIndicator: {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: 600,
  },
  stepReqPill: {
    fontSize: "11px",
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: "12px",
    background: "rgba(239, 68, 68, 0.15)",
    color: "#fca5a5",
    border: "1px solid rgba(239, 68, 68, 0.3)",
  },
  formContent: {
    padding: "24px 20px",
  },
  stepSection: {
    animation: "fadeIn 0.25s ease-out",
  },

  // ── INPUTS & TYPOGRAPHY ──
  formGroup: {
    marginBottom: "18px",
  },
  gridTwo: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 700,
    color: "#e2e8f0",
    marginBottom: "7px",
    letterSpacing: "0.2px",
  },
  reqStar: {
    color: "#ef4444",
  },
  helperText: {
    display: "block",
    fontSize: "11px",
    color: "#64748b",
    marginTop: "5px",
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    background: "#162032",
    border: "1px solid #293548",
    borderRadius: "9px",
    color: "#f8fafc",
    fontSize: "14px",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  select: {
    width: "100%",
    padding: "11px 14px",
    background: "#162032",
    border: "1px solid #293548",
    borderRadius: "9px",
    color: "#f8fafc",
    fontSize: "14px",
    fontFamily: "inherit",
    boxSizing: "border-box",
    cursor: "pointer",
  },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    background: "#162032",
    border: "1px solid #293548",
    borderRadius: "9px",
    color: "#f8fafc",
    fontSize: "14px",
    fontFamily: "inherit",
    boxSizing: "border-box",
    resize: "vertical",
    lineHeight: 1.5,
  },
  prefixInputWrap: {
    display: "flex",
    alignItems: "center",
    background: "#162032",
    border: "1px solid #293548",
    borderRadius: "9px",
    overflow: "hidden",
  },
  inputPrefix: {
    padding: "11px 12px",
    background: "#1e293b",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 700,
    borderRight: "1px solid #293548",
  },
  prefixInput: {
    flex: 1,
    padding: "11px 14px",
    background: "transparent",
    border: "none",
    color: "#f8fafc",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
  },
  readOnlyInput: {
    width: "100%",
    padding: "11px 14px",
    background: "#0c1322",
    border: "1px solid #243042",
    borderRadius: "9px",
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "not-allowed",
    boxSizing: "border-box",
  },
  autoTag: {
    marginLeft: "6px",
    fontSize: "10px",
    padding: "2px 6px",
    background: "rgba(16, 185, 129, 0.15)",
    color: "#34d399",
    borderRadius: "4px",
    fontWeight: 700,
  },

  // ── GPS CONTAINER ──
  gpsContainer: {
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(59, 130, 246, 0.2)",
    borderRadius: "12px",
    padding: "14px",
    marginBottom: "20px",
  },
  gpsTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  gpsCardTitle: {
    fontWeight: 700,
    fontSize: "13px",
    color: "#f8fafc",
    marginRight: "6px",
  },
  recBadge: {
    fontSize: "10px",
    fontWeight: 700,
    padding: "2px 6px",
    background: "rgba(59, 130, 246, 0.15)",
    color: "#60a5fa",
    borderRadius: "10px",
  },
  gpsLocateBtn: {
    background: "rgba(59, 130, 246, 0.15)",
    border: "1px solid #3b82f6",
    color: "#60a5fa",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  gpsDetectedPill: {
    marginTop: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(16, 185, 129, 0.1)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#86efac",
    fontWeight: 600,
  },
  gpsClearBtn: {
    background: "transparent",
    border: "none",
    color: "#fca5a5",
    fontSize: "11px",
    cursor: "pointer",
    textDecoration: "underline",
  },
  gpsInfoText: {
    fontSize: "12px",
    color: "#64748b",
  },
  textLinkBtn: {
    background: "transparent",
    border: "none",
    color: "#38bdf8",
    fontSize: "12px",
    cursor: "pointer",
    textDecoration: "underline",
    padding: 0,
  },
  smallLabel: {
    fontSize: "11px",
    color: "#94a3b8",
    display: "block",
    marginBottom: "4px",
    fontWeight: 600,
  },
  smallInput: {
    width: "100%",
    padding: "8px 10px",
    background: "#162032",
    border: "1px solid #293548",
    borderRadius: "6px",
    color: "#f8fafc",
    fontSize: "13px",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  universityBox: {
    marginBottom: "18px",
  },

  // ── MEDIA DROPZONE ──
  uploadDropzone: {
    border: "2px dashed #293548",
    borderRadius: "12px",
    padding: "32px 16px",
    textAlign: "center",
    background: "#131c2d",
    cursor: "pointer",
    transition: "border-color 0.2s, background 0.2s",
  },
  dropzoneLabel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
  },
  countBadge: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#38bdf8",
    background: "rgba(56, 189, 248, 0.1)",
    padding: "2px 8px",
    borderRadius: "10px",
  },
  previewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
    gap: "10px",
    marginTop: "16px",
  },
  previewCard: {
    position: "relative",
    aspectRatio: "1",
    borderRadius: "10px",
    overflow: "hidden",
    border: "1px solid #293548",
    background: "#0f172a",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  coverBadge: {
    position: "absolute",
    bottom: "4px",
    left: "4px",
    background: "#10b981",
    color: "#ffffff",
    fontSize: "9px",
    fontWeight: 800,
    padding: "2px 5px",
    borderRadius: "4px",
    letterSpacing: "0.4px",
  },
  trashBtn: {
    position: "absolute",
    top: "4px",
    right: "4px",
    background: "rgba(0, 0, 0, 0.7)",
    border: "none",
    color: "#fca5a5",
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    transition: "all 0.15s",
  },

  // ── VIDEO CARD ──
  videoCardBox: {
    marginTop: "24px",
    padding: "16px",
    borderRadius: "12px",
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid #1e293b",
  },
  optBadge: {
    marginLeft: "6px",
    fontSize: "10px",
    padding: "2px 6px",
    background: "rgba(148, 163, 184, 0.15)",
    color: "#94a3b8",
    borderRadius: "10px",
    fontWeight: 600,
  },
  readyBadge: {
    fontSize: "12px",
    color: "#34d399",
    fontWeight: 700,
  },
  videoDropzone: {
    border: "2px dashed #293548",
    borderRadius: "10px",
    padding: "20px 12px",
    textAlign: "center",
    cursor: "pointer",
  },
  videoList: {
    marginTop: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  videoItem: {
    display: "flex",
    gap: "12px",
    padding: "10px",
    background: "#0b1324",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    alignItems: "center",
  },
  videoPlayer: {
    width: "120px",
    height: "75px",
    objectFit: "cover",
    borderRadius: "6px",
    background: "#000",
  },
  videoMeta: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  videoFileName: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#f1f5f9",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  videoFileSize: {
    fontSize: "11px",
    color: "#64748b",
  },
  videoDeleteBtn: {
    alignSelf: "flex-start",
    marginTop: "4px",
    background: "transparent",
    border: "none",
    color: "#fca5a5",
    fontSize: "11px",
    cursor: "pointer",
    padding: 0,
    textDecoration: "underline",
  },

  // ── AMENITIES ──
  amenitiesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: "8px",
  },
  amenityChip: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 12px",
    background: "#131c2d",
    border: "1px solid #233044",
    borderRadius: "8px",
    color: "#cbd5e1",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
  },
  amenityChipSelected: {
    background: "rgba(59, 130, 246, 0.18)",
    borderColor: "#3b82f6",
    color: "#60a5fa",
  },
  amenityCheck: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: 700,
  },
  amenityCheckSelected: {
    color: "#38bdf8",
  },

  // ── TERMS & ACTIONS ──
  termsCard: {
    marginTop: "20px",
    padding: "14px",
    background: "rgba(16, 185, 129, 0.05)",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    borderRadius: "10px",
  },
  termsLabel: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    cursor: "pointer",
  },
  checkboxInput: {
    marginTop: "3px",
    width: "16px",
    height: "16px",
    accentColor: "#10b981",
    cursor: "pointer",
  },
  termsText: {
    fontSize: "13px",
    color: "#cbd5e1",
    lineHeight: 1.5,
  },
  actionsBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "28px",
    paddingTop: "16px",
    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
  },
  primaryBtn: {
    padding: "12px 24px",
    background: "#3b82f6",
    color: "#ffffff",
    border: "none",
    borderRadius: "9px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s",
    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.35)",
  },
  secondaryBtn: {
    padding: "12px 20px",
    background: "rgba(255, 255, 255, 0.06)",
    color: "#cbd5e1",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "9px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  submitBtn: {
    padding: "13px 28px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "9px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 4px 16px rgba(16, 185, 129, 0.35)",
  },
  errorBanner: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#fca5a5",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    marginBottom: "16px",
  },
  successBanner: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(16, 185, 129, 0.15)",
    border: "1px solid rgba(16, 185, 129, 0.35)",
    color: "#86efac",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    marginBottom: "16px",
  },
  unauthCard: {
    maxWidth: "420px",
    margin: "80px auto",
    textAlign: "center",
    background: "#0f172a",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "16px",
    padding: "36px 24px",
  },
};

const cssStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');

  input:focus, textarea:focus, select:focus {
    border-color: #3b82f6 !important;
    background: #19253b !important;
    outline: none !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18) !important;
  }

  .upload-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    display: inline-block;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 640px) {
    .stepGrid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    div[style*="gridTemplateColumns: 1fr 1fr"],
    div[style*="grid-template-columns: 1fr 1fr"] {
      grid-template-columns: 1fr !important;
    }
  }
`;