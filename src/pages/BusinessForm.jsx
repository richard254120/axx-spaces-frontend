import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/api";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "40px 20px",
    color: "#f1f5f9",
    fontFamily: "'DM Sans', sans-serif",
  },
  form: {
    maxWidth: "900px",
    margin: "0 auto",
    background: "rgba(30, 41, 59, 0.8)",
    borderRadius: "20px",
    padding: "40px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  title: {
    fontSize: "32px",
    fontWeight: 800,
    color: "#60a5fa",
    marginBottom: "30px",
    textAlign: "center",
  },
  instructions: {
    background: "rgba(96, 165, 250, 0.1)",
    border: "1px solid rgba(96, 165, 250, 0.3)",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "30px",
  },
  instructionsTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#60a5fa",
    marginBottom: "10px",
  },
  instructionsList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  instructionsItem: {
    fontSize: "14px",
    color: "#cbd5e1",
    marginBottom: "8px",
    paddingLeft: "20px",
    position: "relative",
  },
  instructionsItemBefore: {
    content: "✓",
    position: "absolute",
    left: 0,
    color: "#60a5fa",
    fontWeight: "bold",
  },
  section: {
    marginBottom: "30px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#60a5fa",
    marginBottom: "15px",
    paddingBottom: "10px",
    borderBottom: "2px solid #60a5fa",
  },
  label: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#cbd5e1",
    marginBottom: "8px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    color: "#f1f5f9",
    fontSize: "16px",
    marginBottom: "15px",
    transition: "border-color 0.3s",
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    color: "#f1f5f9",
    fontSize: "16px",
    marginBottom: "15px",
    minHeight: "120px",
    resize: "vertical",
  },
  select: {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    color: "#f1f5f9",
    fontSize: "16px",
    marginBottom: "15px",
  },
  checkboxGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "15px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  checkboxLabelSelected: {
    background: "#60a5fa",
    color: "#0f172a",
    border: "1px solid #60a5fa",
  },
  button: {
    width: "100%",
    padding: "16px",
    background: "#60a5fa",
    color: "#0f172a",
    border: "none",
    borderRadius: "10px",
    fontSize: "18px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "opacity 0.3s",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  error: {
    background: "rgba(239, 68, 68, 0.2)",
    border: "1px solid #ef4444",
    color: "#ef4444",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  success: {
    background: "rgba(34, 197, 94, 0.2)",
    border: "1px solid #22c55e",
    color: "#22c55e",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  instructions: {
    background: "rgba(251, 191, 36, 0.1)",
    border: "1px solid #fbbf24",
    borderRadius: "15px",
    padding: "20px",
    marginBottom: "30px",
  },
  instructionsTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#fbbf24",
    marginBottom: "15px",
  },
  instructionsList: {
    margin: 0,
    paddingLeft: "20px",
    color: "#cbd5e1",
    lineHeight: "1.8",
  },
  hoursGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },
  hoursItem: {
    background: "rgba(30, 41, 59, 0.8)",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  hoursLabel: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#fbbf24",
    marginBottom: "12px",
    textTransform: "capitalize",
  },
  hoursInputs: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  hoursInput: {
    flex: 1,
    minWidth: "120px",
    padding: "10px 14px",
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    color: "#f1f5f9",
    fontSize: "14px",
  },
};

const BUSINESS_CATEGORIES = [
  "Restaurants",
  "Retail",
  "Services",
  "Technology",
  "Healthcare",
  "Education",
  "Entertainment",
  "Professional Services",
  "Manufacturing",
  "Agriculture",
  "Construction",
  "Transportation",
  "Other",
];

const KENYA_COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta",
  "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka Nithi",
  "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga",
  "Murang'a", "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans Nzoia",
  "Uasin Gishu", "Elgeyo Marakwet", "Nandi", "Baringo", "Laikipia", "Nakuru",
  "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma",
  "Busia", "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi City",
];

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function BusinessForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categories: [],
    yearEstablished: "",
    employeeCount: "",
    priceRange: "",
    submitterName: "",
    location: {
      county: "",
      town: "",
      address: "",
    },
    contact: {
      phone: "",
      email: "",
      website: "",
    },
    businessHours: {
      monday: { open: "", close: "", closed: false },
      tuesday: { open: "", close: "", closed: false },
      wednesday: { open: "", close: "", closed: false },
      thursday: { open: "", close: "", closed: false },
      friday: { open: "", close: "", closed: false },
      saturday: { open: "", close: "", closed: false },
      sunday: { open: "", close: "", closed: false },
    },
    socialMedia: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
      tiktok: "",
      whatsapp: "",
    },
    images: [],
    logo: "",
    products: [],
    pricelist: { url: "", name: "" },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState({ logo: false, photos: false, product: false, pricelist: false });
  const [businessPhotos, setBusinessPhotos] = useState([]);

  useEffect(() => {
    if (isEditing) {
      loadBusiness();
    }
  }, [id]);

  const loadBusiness = async () => {
    try {
      const res = await API.get(`/business/${id}`);
      setFormData(res.data.business);
    } catch (err) {
      setError("Failed to load business");
    }
  };

  const toggleCategory = (category) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading((prev) => ({ ...prev, logo: true }));
    const formData = new FormData();
    formData.append("logo", file);

    try {
      const res = await API.post("/uploads/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData((prev) => ({ ...prev, logo: res.data.url }));
    } catch (err) {
      setError("Failed to upload logo");
    } finally {
      setUploading((prev) => ({ ...prev, logo: false }));
    }
  };

  const handleProductImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("=== PRODUCT IMAGE UPLOAD START ===");
    console.log("File:", file);

    setUploading((prev) => ({ ...prev, product: true }));
    const formData = new FormData();
    formData.append("image", file);

    try {
      console.log("Sending upload request to /uploads/product-image");
      const res = await API.post("/uploads/product-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Upload response:", res.data);
      console.log("Upload URL:", res.data.url);
      return res.data.url;
    } catch (err) {
      console.error("Product image upload error:", err);
      console.error("Error response:", err.response);
      setError("Failed to upload product image");
      return null;
    } finally {
      setUploading((prev) => ({ ...prev, product: false }));
    }
  };

  const handlePricelistUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading((prev) => ({ ...prev, pricelist: true }));
    const formData = new FormData();
    formData.append("pricelist", file);

    try {
      const res = await API.post("/uploads/pricelist", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData((prev) => ({
        ...prev,
        pricelist: { ...prev.pricelist, url: res.data.url, name: res.data.originalName || file.name },
      }));
    } catch (err) {
      setError("Failed to upload pricelist");
    } finally {
      setUploading((prev) => ({ ...prev, pricelist: false }));
    }
  };

  const handleBusinessPhotosUpload = async (e) => {
    const files = Array.from(e.target.files);
    console.log("=== BUSINESS PHOTOS UPLOAD START ===");
    console.log("Files selected:", files);
    console.log("Files length:", files.length);
    console.log("Current businessPhotos length:", businessPhotos.length);

    if (!files || files.length === 0) return;

    if (businessPhotos.length + files.length > 18) {
      setError("You can upload a maximum of 18 photos");
      return;
    }

    setUploading((prev) => ({ ...prev, photos: true }));
    const formData = new FormData();
    files.forEach((file) => formData.append("photos", file));

    try {
      console.log("Sending upload request to /uploads/business-photos");
      const res = await API.post("/uploads/business-photos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Upload response:", res.data);
      console.log("Upload response URLs:", res.data.urls);
      console.log("Upload response URLs length:", res.data.urls?.length);

      setBusinessPhotos((prev) => {
        const newPhotos = [...prev, ...res.data.urls];
        console.log("New businessPhotos state:", newPhotos);
        console.log("New businessPhotos length:", newPhotos.length);
        return newPhotos;
      });
      setFormData((prev) => {
        const newImages = [...(prev.images || []), ...res.data.urls];
        console.log("New formData.images state:", newImages);
        console.log("New formData.images length:", newImages.length);
        return {
          ...prev,
          images: newImages,
        };
      });
    } catch (err) {
      console.error("Photo upload error:", err);
      console.error("Error response:", err.response);
      setError("Failed to upload photos");
    } finally {
      setUploading((prev) => ({ ...prev, photos: false }));
    }
  };

  const removePhoto = (index) => {
    setBusinessPhotos((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    console.log("=== BUSINESS SUBMISSION ===");
    console.log("Form data images:", formData.images);
    console.log("Form data images length:", formData.images?.length);
    console.log("Business photos state:", businessPhotos);
    console.log("Business photos state length:", businessPhotos?.length);

    try {
      if (isEditing) {
        await API.put(`/business/${id}`, formData);
        setSuccess("✅ Business updated successfully!");
      } else {
        const res = await API.post("/business", formData);
        setSuccess(res.data.message);
      }

      setTimeout(() => {
        navigate("/business-dashboard");
      }, 2000);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Please log in to add a business");
        setTimeout(() => {
          navigate("/business-login");
        }, 2000);
      } else {
        setError(err.response?.data?.error || "Failed to save business");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateHours = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value,
        },
      },
    }));
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h1 style={styles.title}>
          {isEditing ? "Edit Business" : "Add Business"}
        </h1>

        {!isEditing && (
          <div style={styles.instructions}>
            <h3 style={styles.instructionsTitle}>📋 Instructions</h3>
            <ul style={styles.instructionsList}>
              <li>Fill in your business details to list on AxxBiashara</li>
              <li>Select multiple categories that describe your business</li>
              <li>Add your business hours for each day of the week</li>
              <li>Include social media links to help customers find you</li>
              <li>Your business will be reviewed and approved by admin before appearing</li>
            </ul>
          </div>
        )}

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Basic Information</h2>
          <label style={styles.label}>Your Name or Company Name *</label>
          <input
            type="text"
            style={styles.input}
            value={formData.submitterName}
            onChange={(e) => setFormData({ ...formData, submitterName: e.target.value })}
            required
            placeholder="Enter your name or company name"
          />

          <label style={styles.label}>Business Name *</label>
          <input
            type="text"
            style={styles.input}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Enter your business name"
          />

          <label style={styles.label}>Description *</label>
          <textarea
            style={styles.textarea}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            placeholder="Describe your business, products, and services in detail"
          />

          <label style={styles.label}>Year Established</label>
          <input
            type="number"
            style={styles.input}
            value={formData.yearEstablished || ""}
            onChange={(e) => setFormData({ ...formData, yearEstablished: e.target.value })}
            placeholder="e.g., 2015"
            min="1900"
            max={new Date().getFullYear()}
          />

          <label style={styles.label}>Number of Employees</label>
          <select
            style={styles.select}
            value={formData.employeeCount || ""}
            onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
          >
            <option value="">Select size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="500+">500+ employees</option>
          </select>

          <label style={styles.label}>Price Range</label>
          <select
            style={styles.select}
            value={formData.priceRange || ""}
            onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
          >
            <option value="">Select price range</option>
            <option value="$">$ - Budget friendly</option>
            <option value="$$">$$ - Moderate</option>
            <option value="$$$">$$$ - Expensive</option>
            <option value="$$$$">$$$$ - Premium</option>
          </select>

          <label style={styles.label}>Categories (Select multiple) *</label>
          <div style={styles.checkboxGroup}>
            {BUSINESS_CATEGORIES.map((category) => (
              <label
                key={category}
                style={{
                  ...styles.checkboxLabel,
                  ...(formData.categories.includes(category) ? styles.checkboxLabelSelected : {}),
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.categories.includes(category)}
                  onChange={() => toggleCategory(category)}
                />
                {category}
              </label>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Location</h2>
          <label style={styles.label}>County *</label>
          <select
            style={styles.select}
            value={formData.location.county}
            onChange={(e) =>
              setFormData({
                ...formData,
                location: { ...formData.location, county: e.target.value },
              })
            }
            required
          >
            <option value="">Select County</option>
            {KENYA_COUNTIES.map((county) => (
              <option key={county} value={county}>
                {county}
              </option>
            ))}
          </select>

          <label style={styles.label}>Town/City *</label>
          <input
            type="text"
            style={styles.input}
            value={formData.location.town}
            onChange={(e) =>
              setFormData({
                ...formData,
                location: { ...formData.location, town: e.target.value },
              })
            }
            required
          />

          <label style={styles.label}>Address</label>
          <input
            type="text"
            style={styles.input}
            value={formData.location.address}
            onChange={(e) =>
              setFormData({
                ...formData,
                location: { ...formData.location, address: e.target.value },
              })
            }
          />
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Contact Information</h2>
          <label style={styles.label}>Phone *</label>
          <input
            type="tel"
            style={styles.input}
            value={formData.contact.phone}
            onChange={(e) =>
              setFormData({
                ...formData,
                contact: { ...formData.contact, phone: e.target.value },
              })
            }
            required
          />

          <label style={styles.label}>Email</label>
          <input
            type="email"
            style={styles.input}
            value={formData.contact.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                contact: { ...formData.contact, email: e.target.value },
              })
            }
          />

          <label style={styles.label}>Website (Optional)</label>
          <input
            type="url"
            style={styles.input}
            value={formData.contact.website}
            onChange={(e) =>
              setFormData({
                ...formData,
                contact: { ...formData.contact, website: e.target.value },
              })
            }
            placeholder="https://example.com"
          />
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Business Hours</h2>
          <div style={styles.hoursGrid}>
            {DAYS.map((day) => (
              <div key={day} style={styles.hoursItem}>
                <label style={styles.hoursLabel}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </label>
                <div style={styles.hoursInputs}>
                  <input
                    type="time"
                    style={styles.hoursInput}
                    value={formData.businessHours[day].open}
                    onChange={(e) => updateHours(day, "open", e.target.value)}
                    disabled={formData.businessHours[day].closed}
                  />
                  <span>-</span>
                  <input
                    type="time"
                    style={styles.hoursInput}
                    value={formData.businessHours[day].close}
                    onChange={(e) => updateHours(day, "close", e.target.value)}
                    disabled={formData.businessHours[day].closed}
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.businessHours[day].closed}
                      onChange={(e) =>
                        updateHours(day, "closed", e.target.checked)
                      }
                    />
                    Closed
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Social Media (Optional)</h2>
          <label style={styles.label}>Facebook</label>
          <input
            type="url"
            style={styles.input}
            value={formData.socialMedia.facebook}
            onChange={(e) =>
              setFormData({
                ...formData,
                socialMedia: { ...formData.socialMedia, facebook: e.target.value },
              })
            }
            placeholder="https://facebook.com/yourbusiness"
          />

          <label style={styles.label}>Instagram</label>
          <input
            type="url"
            style={styles.input}
            value={formData.socialMedia.instagram}
            onChange={(e) =>
              setFormData({
                ...formData,
                socialMedia: { ...formData.socialMedia, instagram: e.target.value },
              })
            }
            placeholder="https://instagram.com/yourbusiness"
          />

          <label style={styles.label}>Twitter/X</label>
          <input
            type="url"
            style={styles.input}
            value={formData.socialMedia.twitter}
            onChange={(e) =>
              setFormData({
                ...formData,
                socialMedia: { ...formData.socialMedia, twitter: e.target.value },
              })
            }
            placeholder="https://twitter.com/yourbusiness"
          />

          <label style={styles.label}>LinkedIn</label>
          <input
            type="url"
            style={styles.input}
            value={formData.socialMedia.linkedin}
            onChange={(e) =>
              setFormData({
                ...formData,
                socialMedia: { ...formData.socialMedia, linkedin: e.target.value },
              })
            }
            placeholder="https://linkedin.com/company/yourbusiness"
          />

          <label style={styles.label}>TikTok</label>
          <input
            type="url"
            style={styles.input}
            value={formData.socialMedia.tiktok}
            onChange={(e) =>
              setFormData({
                ...formData,
                socialMedia: { ...formData.socialMedia, tiktok: e.target.value },
              })
            }
            placeholder="https://tiktok.com/@yourbusiness"
          />

          <label style={styles.label}>WhatsApp</label>
          <input
            type="tel"
            style={styles.input}
            value={formData.socialMedia.whatsapp}
            onChange={(e) =>
              setFormData({
                ...formData,
                socialMedia: { ...formData.socialMedia, whatsapp: e.target.value },
              })
            }
            placeholder="2547XXXXXXXXX"
          />
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Business Logo</h2>
          <label style={styles.label}>Upload Logo</label>
          <input
            type="file"
            style={styles.input}
            accept="image/*"
            onChange={handleLogoUpload}
            disabled={uploading.logo}
          />
          {uploading.logo && <p style={{ fontSize: "12px", color: "#60a5fa" }}>Uploading logo...</p>}
          {formData.logo && (
            <div style={{ marginTop: "10px" }}>
              <img src={formData.logo} alt="Logo preview" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "10px" }} />
              <p style={{ fontSize: "12px", color: "#4ade80" }}>✅ Logo uploaded successfully</p>
            </div>
          )}
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Business Photos (Up to 18)</h2>
          <label style={styles.label}>Upload Photos</label>
          <input
            type="file"
            style={styles.input}
            accept="image/*"
            multiple
            onChange={handleBusinessPhotosUpload}
            disabled={uploading.photos}
          />
          {uploading.photos && <p style={{ fontSize: "12px", color: "#60a5fa" }}>Uploading photos...</p>}
          <p style={{ fontSize: "12px", color: "#94a3b8" }}>{businessPhotos.length} / 18 photos uploaded</p>
          {businessPhotos.length > 0 && (
            <div style={{ marginTop: "15px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "10px" }}>
              {businessPhotos.map((photo, index) => (
                <div key={index} style={{ position: "relative" }}>
                  <img src={photo} alt={`Business photo ${index + 1}`} style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "8px" }} />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Products & Services</h2>
          <label style={styles.label}>Product Name</label>
          <input
            type="text"
            style={styles.input}
            placeholder="Product name"
            id="productName"
          />
          <label style={styles.label}>Description</label>
          <input
            type="text"
            style={styles.input}
            placeholder="Product description"
            id="productDescription"
          />
          <label style={styles.label}>Price (KES)</label>
          <input
            type="number"
            style={styles.input}
            placeholder="Price"
            id="productPrice"
          />
          <label style={styles.label}>Category</label>
          <input
            type="text"
            style={styles.input}
            placeholder="Category"
            id="productCategory"
          />
          <label style={styles.label}>Product Image</label>
          <input
            type="file"
            style={styles.input}
            accept="image/*"
            id="productImage"
            disabled={uploading.product}
          />
          {uploading.product && <p style={{ fontSize: "12px", color: "#fbbf24" }}>Uploading product image...</p>}
          <button
            type="button"
            style={{ ...styles.button, marginTop: "10px" }}
            onClick={async () => {
              const name = document.getElementById("productName").value;
              const description = document.getElementById("productDescription").value;
              const price = parseFloat(document.getElementById("productPrice").value);
              const category = document.getElementById("productCategory").value;
              const imageFile = document.getElementById("productImage").files[0];

              console.log("=== ADD PRODUCT CLICKED ===");
              console.log("Product name:", name);
              console.log("Product description:", description);
              console.log("Product price:", price);
              console.log("Product category:", category);
              console.log("Image file:", imageFile);
              console.log("Current products:", formData.products);

              if (name) {
                let imageUrl = "";
                if (imageFile) {
                  imageUrl = await handleProductImageUpload({ target: { files: [imageFile] } });
                  console.log("Image URL after upload:", imageUrl);
                }

                setFormData((prev) => {
                  const newProducts = [...prev.products, { name, description, price, category, imageUrl }];
                  console.log("New products array:", newProducts);
                  return {
                    ...prev,
                    products: newProducts,
                  };
                });
                document.getElementById("productName").value = "";
                document.getElementById("productDescription").value = "";
                document.getElementById("productPrice").value = "";
                document.getElementById("productCategory").value = "";
                document.getElementById("productImage").value = "";
              }
            }}
          >
            + Add Product
          </button>
          {formData.products.length > 0 && (
            <div style={{ marginTop: "15px" }}>
              <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "10px" }}>Added Products:</p>
              {formData.products.map((product, index) => (
                <div key={index} style={{ padding: "10px", background: "rgba(15, 23, 42, 0.5)", borderRadius: "8px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {product.imageUrl && <img src={product.imageUrl} alt={product.name} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "5px" }} />}
                    <div>
                      <div style={{ fontWeight: 600 }}>{product.name}</div>
                      {product.price && <div style={{ fontSize: "12px", color: "#94a3b8" }}>KES {product.price.toLocaleString()}</div>}
                    </div>
                  </div>
                  <button
                    type="button"
                    style={{ padding: "5px 10px", background: "#ef4444", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
                    onClick={() => setFormData({ ...formData, products: formData.products.filter((_, i) => i !== index) })}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Pricelist / Menu</h2>
          <label style={styles.label}>Upload Pricelist/Menu</label>
          <input
            type="file"
            style={styles.input}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handlePricelistUpload}
            disabled={uploading.pricelist}
          />
          {uploading.pricelist && <p style={{ fontSize: "12px", color: "#fbbf24" }}>Uploading pricelist...</p>}
          {formData.pricelist.url && (
            <div style={{ marginTop: "10px" }}>
              <p style={{ fontSize: "12px", color: "#4ade80" }}>✅ Pricelist uploaded: {formData.pricelist.name}</p>
            </div>
          )}
        </div>

        <button
          type="submit"
          style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
          disabled={loading}
        >
          {loading ? "Saving..." : isEditing ? "Update Business" : "Add Business"}
        </button>
      </form>
    </div>
  );
}
