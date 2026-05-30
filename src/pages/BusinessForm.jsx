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
    maxWidth: "800px",
    margin: "0 auto",
    background: "rgba(30, 41, 59, 0.8)",
    borderRadius: "20px",
    padding: "40px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  title: {
    fontSize: "32px",
    fontWeight: 800,
    color: "#fbbf24",
    marginBottom: "30px",
    textAlign: "center",
  },
  section: {
    marginBottom: "30px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: "15px",
    paddingBottom: "10px",
    borderBottom: "2px solid #fbbf24",
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
    background: "#fbbf24",
    color: "#0f172a",
    border: "1px solid #fbbf24",
  },
  button: {
    width: "100%",
    padding: "16px",
    background: "#fbbf24",
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
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isEditing) {
        await API.put(`/business/${id}`, formData);
        setSuccess("✅ Business updated successfully!");
      } else {
        const res = await API.post("/business", formData);
        setSuccess(res.data.message);
      }

      setTimeout(() => {
        navigate("/axxbiashara");
      }, 2000);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Please log in to create a business");
        setTimeout(() => {
          navigate("/login");
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
          {isEditing ? "Edit Business" : "Create Business"}
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

        <button
          type="submit"
          style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
          disabled={loading}
        >
          {loading ? "Saving..." : isEditing ? "Update Business" : "Create Business"}
        </button>
      </form>
    </div>
  );
}
