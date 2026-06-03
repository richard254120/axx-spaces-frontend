import { useState, useEffect, useRef } from "react";
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
    boxSizing: "border-box",
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
    boxSizing: "border-box",
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
    boxSizing: "border-box",
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
    padding: "16px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "15px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "10px",
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
  redirectBar: {
    marginTop: "12px",
    background: "rgba(56,189,248,0.08)",
    border: "1px solid rgba(56,189,248,0.25)",
    borderRadius: "10px",
    padding: "10px 16px",
    fontSize: "13px",
    color: "#38bdf8",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  /* ── Product section styles ── */
  productFormBox: {
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(96, 165, 250, 0.2)",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "16px",
  },
  productFormTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#60a5fa",
    marginBottom: "14px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  addProductBtn: {
    width: "100%",
    padding: "13px",
    background: "rgba(96, 165, 250, 0.15)",
    color: "#60a5fa",
    border: "1px solid rgba(96, 165, 250, 0.4)",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    marginTop: "4px",
  },
  productCard: {
    padding: "12px",
    background: "rgba(15, 23, 42, 0.5)",
    borderRadius: "10px",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  productCardLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
    minWidth: 0,
  },
  productThumb: {
    width: "54px",
    height: "54px",
    objectFit: "cover",
    borderRadius: "8px",
    flexShrink: 0,
    border: "1px solid rgba(255,255,255,0.1)",
  },
  productThumbPlaceholder: {
    width: "54px",
    height: "54px",
    borderRadius: "8px",
    background: "rgba(96,165,250,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    flexShrink: 0,
    border: "1px solid rgba(96,165,250,0.2)",
  },
  productName: {
    fontWeight: 700,
    fontSize: "14px",
    color: "#f1f5f9",
    marginBottom: "2px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  productMeta: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  removeBtn: {
    padding: "6px 14px",
    background: "rgba(239,68,68,0.15)",
    color: "#f87171",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
    flexShrink: 0,
    marginLeft: "10px",
  },
  uploadingNote: {
    fontSize: "12px",
    color: "#fbbf24",
    marginBottom: "8px",
  },
};

const BUSINESS_CATEGORIES = [
  "Restaurants", "Retail", "Services", "Technology", "Healthcare", "Education",
  "Entertainment", "Professional Services", "Manufacturing", "Agriculture",
  "Construction", "Transportation", "Other",
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

/* ── Empty product template ── */
const EMPTY_PRODUCT = { name: "", description: "", price: "", category: "", imageUrl: "" };

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
    location: { county: "", town: "", address: "" },
    contact: { phone: "", email: "", website: "" },
    businessHours: {
      monday: { open: "", close: "", closed: false },
      tuesday: { open: "", close: "", closed: false },
      wednesday: { open: "", close: "", closed: false },
      thursday: { open: "", close: "", closed: false },
      friday: { open: "", close: "", closed: false },
      saturday: { open: "", close: "", closed: false },
      sunday: { open: "", close: "", closed: false },
    },
    socialMedia: { facebook: "", instagram: "", twitter: "", linkedin: "", tiktok: "", whatsapp: "" },
    images: [],
    logo: "",
    products: [],
    pricelist: { url: "", name: "" },
  });

  /* ── FIX 1: Controlled product form state (replaces uncontrolled DOM inputs) ── */
  /*
   * KEY FIX: formDataRef always holds the LATEST formData.
   * handleSubmit reads from the ref so it never uses a stale closure —
   * this is what caused newly-added products to be missing from the PUT.
   */
  const formDataRef = useRef(formData);
  useEffect(() => { formDataRef.current = formData; }, [formData]);

  const [newProduct, setNewProduct] = useState({ ...EMPTY_PRODUCT });
  const [productImageFile, setProductImageFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [uploading, setUploading] = useState({ logo: false, photos: false, product: false, pricelist: false });
  const [businessPhotos, setBusinessPhotos] = useState([]);

  /* ── Load existing business when editing ── */
  useEffect(() => {
    if (isEditing) loadBusiness();
  }, [id]);

  /* ── Countdown timer after successful edit ── */
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      navigate("/axxbiashara", { state: { refresh: true } });
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const loadBusiness = async () => {
    try {
      const res = await API.get(`/business/${id}`);
      const biz = res.data.business;
      setFormData(biz);
      if (biz.images?.length) {
        setBusinessPhotos(biz.images);
      }
    } catch (err) {
      setError("Failed to load business");
    }
  };

  /* ── Category toggle ── */
  const toggleCategory = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  /* ── Upload handlers ── */
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(prev => ({ ...prev, logo: true }));
    const fd = new FormData();
    fd.append("logo", file);
    try {
      const res = await API.post("/uploads/logo", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setFormData(prev => ({ ...prev, logo: res.data.url }));
    } catch {
      setError("Failed to upload logo");
    } finally {
      setUploading(prev => ({ ...prev, logo: false }));
    }
  };

  /* ── FIX 2: Product image upload now takes the actual File object directly ── */
  const uploadProductImage = async (file) => {
    if (!file) return "";
    setUploading(prev => ({ ...prev, product: true }));
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await API.post("/uploads/product-image", fd, { headers: { "Content-Type": "multipart/form-data" } });
      return res.data.url || "";
    } catch {
      setError("Failed to upload product image");
      return "";
    } finally {
      setUploading(prev => ({ ...prev, product: false }));
    }
  };

  const handlePricelistUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(prev => ({ ...prev, pricelist: true }));
    const fd = new FormData();
    fd.append("pricelist", file);
    try {
      const res = await API.post("/uploads/pricelist", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setFormData(prev => ({
        ...prev,
        pricelist: { ...prev.pricelist, url: res.data.url, publicId: res.data.publicId, name: res.data.originalName || file.name },
      }));
    } catch {
      setError("Failed to upload pricelist");
    } finally {
      setUploading(prev => ({ ...prev, pricelist: false }));
    }
  };

  const handleBusinessPhotosUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (businessPhotos.length + files.length > 18) {
      setError("You can upload a maximum of 18 photos");
      return;
    }
    setUploading(prev => ({ ...prev, photos: true }));
    const fd = new FormData();
    files.forEach(f => fd.append("photos", f));
    try {
      const res = await API.post("/uploads/business-photos", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setBusinessPhotos(prev => [...prev, ...res.data.urls]);
      setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...res.data.urls] }));
    } catch {
      setError("Failed to upload photos");
    } finally {
      setUploading(prev => ({ ...prev, photos: false }));
    }
  };

  const removePhoto = (index) => {
    setBusinessPhotos(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  /* ── Hours helper ── */
  const updateHours = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: { ...prev.businessHours[day], [field]: value },
      },
    }));
  };

  /* ── FIX 1+2: Add product using controlled state + clean upload ── */
  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) {
      setError("Product name is required");
      return;
    }

    let imageUrl = "";
    if (productImageFile) {
      imageUrl = await uploadProductImage(productImageFile);
    }

    const productToAdd = {
      name: newProduct.name.trim(),
      description: newProduct.description.trim(),
      price: newProduct.price ? parseFloat(newProduct.price) : 0,
      category: newProduct.category.trim(),
      imageUrl,
    };

    /* ── FIX 3: Use functional updater to avoid stale closure ── */
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, productToAdd],
    }));

    /* Reset the product form */
    setNewProduct({ ...EMPTY_PRODUCT });
    setProductImageFile(null);
  };

  /* ── FIX 3: Remove product with functional updater (no stale closure) ── */
  const handleRemoveProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const payload = formDataRef.current; // always latest, never stale

    try {
      if (isEditing) {
        await API.put(`/business/${id}`, payload);
        setSuccess("Business updated successfully! Redirecting to directory…");
        setCountdown(3);
      } else {
        const res = await API.post("/business", payload);
        setSuccess(res.data.message || "Business submitted for review!");
        setTimeout(() => navigate("/business-dashboard"), 2000);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Please log in to add a business");
        setTimeout(() => navigate("/business-login"), 2000);
      } else {
        setError(err.response?.data?.error || "Failed to save business");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h1 style={styles.title}>
          {isEditing ? "✏️ Edit Business" : "➕ Add Business"}
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

        {success && (
          <div>
            <div style={styles.success}>
              <span style={{ fontSize: "20px" }}>✅</span>
              {success}
            </div>
            {isEditing && countdown !== null && (
              <div style={styles.redirectBar}>
                <span>🔄</span>
                Taking you to the business directory in{" "}
                <strong style={{ color: "#f1f5f9", margin: "0 4px" }}>{countdown}</strong>
                {" "}second{countdown !== 1 ? "s" : ""}…
                <button
                  type="button"
                  onClick={() => navigate("/axxbiashara", { state: { refresh: true } })}
                  style={{
                    marginLeft: "auto", background: "none", border: "none",
                    color: "#38bdf8", cursor: "pointer", fontSize: "13px",
                    fontWeight: 700, textDecoration: "underline",
                  }}
                >
                  Go now
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── BASIC INFORMATION ── */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Basic Information</h2>

          <label style={styles.label}>Your Name or Company Name *</label>
          <input
            type="text"
            style={styles.input}
            value={formData.submitterName}
            onChange={e => setFormData(prev => ({ ...prev, submitterName: e.target.value }))}
            required
            placeholder="Enter your name or company name"
          />

          <label style={styles.label}>Business Name *</label>
          <input
            type="text"
            style={styles.input}
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="Enter your business name"
          />

          <label style={styles.label}>Description *</label>
          <textarea
            style={styles.textarea}
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
            placeholder="Describe your business, products, and services in detail"
          />

          <label style={styles.label}>Year Established</label>
          <input
            type="number"
            style={styles.input}
            value={formData.yearEstablished || ""}
            onChange={e => setFormData(prev => ({ ...prev, yearEstablished: e.target.value }))}
            placeholder="e.g., 2015"
            min="1900"
            max={new Date().getFullYear()}
          />

          <label style={styles.label}>Number of Employees</label>
          <select
            style={styles.select}
            value={formData.employeeCount || ""}
            onChange={e => setFormData(prev => ({ ...prev, employeeCount: e.target.value }))}
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
            onChange={e => setFormData(prev => ({ ...prev, priceRange: e.target.value }))}
          >
            <option value="">Select price range</option>
            <option value="$">$ - Budget friendly</option>
            <option value="$$">$$ - Moderate</option>
            <option value="$$$">$$$ - Expensive</option>
            <option value="$$$$">$$$$ - Premium</option>
          </select>

          <label style={styles.label}>Categories (Select multiple) *</label>
          <div style={styles.checkboxGroup}>
            {BUSINESS_CATEGORIES.map(category => (
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

        {/* ── LOCATION ── */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Location</h2>

          <label style={styles.label}>County *</label>
          <select
            style={styles.select}
            value={formData.location.county}
            onChange={e => setFormData(prev => ({ ...prev, location: { ...prev.location, county: e.target.value } }))}
            required
          >
            <option value="">Select County</option>
            {KENYA_COUNTIES.map(county => <option key={county} value={county}>{county}</option>)}
          </select>

          <label style={styles.label}>Town/City *</label>
          <input
            type="text"
            style={styles.input}
            value={formData.location.town}
            onChange={e => setFormData(prev => ({ ...prev, location: { ...prev.location, town: e.target.value } }))}
            required
          />

          <label style={styles.label}>Address</label>
          <input
            type="text"
            style={styles.input}
            value={formData.location.address}
            onChange={e => setFormData(prev => ({ ...prev, location: { ...prev.location, address: e.target.value } }))}
          />
        </div>

        {/* ── CONTACT ── */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Contact Information</h2>

          <label style={styles.label}>Phone *</label>
          <PhoneInput
            style={styles.input}
            value={formData.contact.phone}
            onChange={value => setFormData(prev => ({ ...prev, contact: { ...prev.contact, phone: value } }))}
            required
          />

          <label style={styles.label}>Email</label>
          <input
            type="email"
            style={styles.input}
            value={formData.contact.email}
            onChange={e => setFormData(prev => ({ ...prev, contact: { ...prev.contact, email: e.target.value } }))}
          />

          <label style={styles.label}>Website (Optional)</label>
          <input
            type="url"
            style={styles.input}
            value={formData.contact.website}
            onChange={e => setFormData(prev => ({ ...prev, contact: { ...prev.contact, website: e.target.value } }))}
            placeholder="https://example.com"
          />
        </div>

        {/* ── BUSINESS HOURS ── */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Business Hours</h2>
          <div style={styles.hoursGrid}>
            {DAYS.map(day => (
              <div key={day} style={styles.hoursItem}>
                <label style={styles.hoursLabel}>{day.charAt(0).toUpperCase() + day.slice(1)}</label>
                <div style={styles.hoursInputs}>
                  <input
                    type="time"
                    style={styles.hoursInput}
                    value={formData.businessHours[day]?.open || ""}
                    onChange={e => updateHours(day, "open", e.target.value)}
                    disabled={formData.businessHours[day]?.closed}
                  />
                  <span>-</span>
                  <input
                    type="time"
                    style={styles.hoursInput}
                    value={formData.businessHours[day]?.close || ""}
                    onChange={e => updateHours(day, "close", e.target.value)}
                    disabled={formData.businessHours[day]?.closed}
                  />
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#94a3b8", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={formData.businessHours[day]?.closed || false}
                      onChange={e => updateHours(day, "closed", e.target.checked)}
                    />
                    Closed
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SOCIAL MEDIA ── */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Social Media (Optional)</h2>

          {[
            { label: "Facebook", key: "facebook", placeholder: "https://facebook.com/yourbusiness", type: "url" },
            { label: "Instagram", key: "instagram", placeholder: "https://instagram.com/yourbusiness", type: "url" },
            { label: "Twitter/X", key: "twitter", placeholder: "https://twitter.com/yourbusiness", type: "url" },
            { label: "LinkedIn", key: "linkedin", placeholder: "https://linkedin.com/company/yourbusiness", type: "url" },
            { label: "TikTok", key: "tiktok", placeholder: "https://tiktok.com/@yourbusiness", type: "url" },
          ].map(({ label, key, placeholder, type }) => (
            <div key={key}>
              <label style={styles.label}>{label}</label>
              <input
                type={type}
                style={styles.input}
                value={formData.socialMedia[key] || ""}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  socialMedia: { ...prev.socialMedia, [key]: e.target.value },
                }))}
                placeholder={placeholder}
              />
            </div>
          ))}
          <div>
            <label style={styles.label}>WhatsApp</label>
            <PhoneInput
              style={styles.input}
              value={formData.socialMedia.whatsapp || ""}
              onChange={value => setFormData(prev => ({
                ...prev,
                socialMedia: { ...prev.socialMedia, whatsapp: value },
              }))}
            />
          </div>
        </div>

        {/* ── LOGO ── */}
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
          {uploading.logo && <p style={styles.uploadingNote}>Uploading logo...</p>}
          {formData.logo && (
            <div style={{ marginTop: "10px" }}>
              <img
                src={formData.logo}
                alt="Logo preview"
                style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "10px" }}
              />
              <p style={{ fontSize: "12px", color: "#4ade80", marginTop: "6px" }}>✅ Logo uploaded successfully</p>
            </div>
          )}
        </div>

        {/* ── PHOTOS ── */}
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
          {uploading.photos && <p style={styles.uploadingNote}>Uploading photos...</p>}
          <p style={{ fontSize: "12px", color: "#94a3b8" }}>{businessPhotos.length} / 18 photos uploaded</p>
          {businessPhotos.length > 0 && (
            <div style={{
              marginTop: "15px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gap: "10px",
            }}>
              {businessPhotos.map((photo, index) => (
                <div key={index} style={{ position: "relative" }}>
                  <img
                    src={photo}
                    alt={`Business photo ${index + 1}`}
                    style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "8px" }}
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    style={{
                      position: "absolute", top: "5px", right: "5px",
                      background: "#ef4444", color: "white", border: "none",
                      borderRadius: "50%", width: "24px", height: "24px",
                      cursor: "pointer", fontSize: "12px", fontWeight: "bold",
                    }}
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════
            PRODUCTS & SERVICES
            FIX: All inputs are now controlled React state.
                 No more document.getElementById.
                 Upload uses the actual File object directly.
                 Remove uses functional updater (no stale closure).
        ══════════════════════════════════════════════════════════ */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Products & Services</h2>

          {/* ── New product entry form ── */}
          <div style={styles.productFormBox}>
            <p style={styles.productFormTitle}>➕ Add a Product or Service</p>

            <label style={styles.label}>Product / Service Name *</label>
            <input
              type="text"
              style={styles.input}
              placeholder="e.g. Beef Burger, Web Design Package"
              value={newProduct.name}
              onChange={e => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
            />

            <label style={styles.label}>Description</label>
            <input
              type="text"
              style={styles.input}
              placeholder="Brief description of the product or service"
              value={newProduct.description}
              onChange={e => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
            />

            <label style={styles.label}>Price (KES)</label>
            <input
              type="number"
              style={styles.input}
              placeholder="e.g. 1500"
              value={newProduct.price}
              onChange={e => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
              min="0"
            />

            <label style={styles.label}>Category</label>
            <input
              type="text"
              style={styles.input}
              placeholder="e.g. Food, Design, Consulting"
              value={newProduct.category}
              onChange={e => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
            />

            <label style={styles.label}>Product Image (Optional)</label>
            <input
              type="file"
              style={styles.input}
              accept="image/*"
              disabled={uploading.product}
              onChange={e => setProductImageFile(e.target.files[0] || null)}
            />
            {uploading.product && <p style={styles.uploadingNote}>Uploading product image…</p>}
            {productImageFile && !uploading.product && (
              <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "10px" }}>
                📎 {productImageFile.name} selected
              </p>
            )}

            <button
              type="button"
              style={styles.addProductBtn}
              onClick={handleAddProduct}
              disabled={uploading.product}
            >
              {uploading.product ? "Uploading image…" : "+ Add Product / Service"}
            </button>
          </div>

          {/* ── List of added products ── */}
          {formData.products.length > 0 && (
            <div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#94a3b8", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {formData.products.length} {formData.products.length === 1 ? "Product" : "Products"} Added
              </p>
              {formData.products.map((product, index) => (
                <div key={index} style={styles.productCard}>
                  <div style={styles.productCardLeft}>
                    {product.imageUrl
                      ? <img src={product.imageUrl} alt={product.name} style={styles.productThumb} />
                      : <div style={styles.productThumbPlaceholder}>🛍</div>
                    }
                    <div style={{ minWidth: 0 }}>
                      <div style={styles.productName}>{product.name}</div>
                      <div style={styles.productMeta}>
                        {product.price ? `KES ${Number(product.price).toLocaleString()}` : "No price set"}
                        {product.category ? ` · ${product.category}` : ""}
                      </div>
                      {product.description && (
                        <div style={{ ...styles.productMeta, marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "260px" }}>
                          {product.description}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* FIX 3: functional updater, no stale closure */}
                  <button
                    type="button"
                    style={styles.removeBtn}
                    onClick={() => handleRemoveProduct(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {formData.products.length === 0 && (
            <p style={{ fontSize: "13px", color: "#475569", textAlign: "center", padding: "20px 0" }}>
              No products added yet. Use the form above to add your first product or service.
            </p>
          )}
        </div>

        {/* ── PRICELIST ── */}
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
          {uploading.pricelist && <p style={styles.uploadingNote}>Uploading pricelist...</p>}
          {formData.pricelist?.url && (
            <p style={{ fontSize: "12px", color: "#4ade80", marginTop: "8px" }}>
              ✅ Pricelist uploaded: {formData.pricelist.name}
            </p>
          )}
        </div>

        {/* ── SUBMIT ── */}
        <button
          type="submit"
          style={{ ...styles.button, ...(loading || countdown !== null ? styles.buttonDisabled : {}) }}
          disabled={loading || countdown !== null}
        >
          {loading
            ? "Saving…"
            : countdown !== null
              ? `Redirecting in ${countdown}s…`
              : isEditing
                ? "Update Business"
                : "Add Business"}
        </button>
      </form>
    </div>
  );
}