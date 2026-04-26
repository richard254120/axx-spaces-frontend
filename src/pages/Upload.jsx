import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Upload() {
  const { token } = useContext(AuthContext);
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
    lat: "",
    lng: "",
  });

  const [images, setImages] = useState([]);           // Selected files
  const [imagePreviews, setImagePreviews] = useState([]); // Preview URLs
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      alert("Please login to upload a property");
      navigate("/login");
    }
  }, [token, navigate]);

  const counties = [
    "Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita Taveta",
    "Garissa","Wajir","Mandera","Marsabit","Isiolo","Meru","Tharaka Nithi",
    "Embu","Kitui","Machakos","Makueni","Nyandarua","Nyeri","Kirinyaga",
    "Murang’a","Kiambu","Turkana","West Pokot","Samburu","Trans Nzoia",
    "Uasin Gishu","Elgeyo Marakwet","Nandi","Baringo","Laikipia","Nakuru",
    "Narok","Kajiado","Kericho","Bomet","Kakamega","Vihiga","Bungoma",
    "Busia","Siaya","Kisumu","Homa Bay","Migori","Kisii","Nyamira",
    "Nairobi City"
  ];

  const propertyTypes = [
    "Bedsitter","Studio Apartment","1 Bedroom","2 Bedroom","3 Bedroom",
    "4+ Bedroom","Maisonette","Bungalow","Townhouse","Apartment Block",
    "Single Room","Shared Room","Hostel Room","Commercial Office",
    "Shop / Retail Space","Warehouse","Plot / Land","Furnished Apartment",
    "Unfurnished Apartment"
  ];

  const amenitiesList = [
    "Water","Electricity","Parking","Security","WiFi","Borehole","Furnished"
  ];

  const getMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
        }));
        alert("✅ Location detected successfully!");
      },
      (error) => {
        console.error("GEO ERROR:", error);
        alert("❌ Location access denied or unavailable");
      }
    );
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAmenity = (item) => {
    setForm((prev) => {
      const exists = prev.amenities.includes(item);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== item)
          : [...prev.amenities, item],
      };
    });
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (files.length > 6) {
      alert("You can upload maximum 6 images");
      return;
    }

    setImages(files);

    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    if (images.length === 0) {
      alert("Please select at least one image");
      return;
    }

    setIsSubmitting(true);
    setSuccess(false);

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

    // Append multiple images
    images.forEach((imageFile) => {
      formData.append("images", imageFile);
    });

    try {
      const res = await API.post("/properties", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("SUCCESS:", res.data);
      setSuccess(true);

      // Reset form
      setForm({
        title: "", county: "", area: "", price: "", deposit: "", type: "",
        bedrooms: "", bathrooms: "", amenities: [], description: "",
        phone: "", lat: "", lng: "",
      });
      setImages([]);
      setImagePreviews([]);

    } catch (err) {
      console.error("Upload Error:", err);
      alert(err?.response?.data?.error || "Failed to submit property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Upload New Property</h2>
        <p style={styles.subtitle}>Fill in the details below. All fields marked * are required.</p>
      </div>

      {success && (
        <div style={styles.successMessage}>
          <h3>✅ Property Submitted Successfully!</h3>
          <p>Your property has been received and is now <strong>awaiting admin approval</strong>.</p>
          <p>You can check the status anytime in <strong>My Properties</strong> page.</p>
          <small>Once approved, it will appear in the public listings with all your photos.</small>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Basic Information */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Basic Information</h3>
          
          <label style={styles.label}>Property Title *</label>
          <input
            name="title"
            placeholder="e.g. Spacious 2 Bedroom Apartment in Kilimani"
            value={form.title}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <div style={styles.row}>
            <div style={styles.col}>
              <label style={styles.label}>County *</label>
              <select
                name="county"
                value={form.county}
                onChange={handleChange}
                style={styles.select}
                required
              >
                <option value="">Select County</option>
                {counties.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={styles.col}>
              <label style={styles.label}>Area / Estate *</label>
              <input
                name="area"
                placeholder="e.g. Kilimani, Westlands, Kitengela"
                value={form.area}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
          </div>

          <label style={styles.label}>Property Type *</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            style={styles.select}
            required
          >
            <option value="">Select Property Type</option>
            {propertyTypes.map((t, i) => (
              <option key={i} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Pricing & Rooms */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Pricing & Rooms</h3>
          
          <div style={styles.row}>
            <div style={styles.col}>
              <label style={styles.label}>Rent per Month (KSh) *</label>
              <input
                name="price"
                type="number"
                placeholder="45000"
                value={form.price}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.col}>
              <label style={styles.label}>Deposit (KSh)</label>
              <input
                name="deposit"
                type="number"
                placeholder="45000"
                value={form.deposit}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.col}>
              <label style={styles.label}>Bedrooms</label>
              <input
                name="bedrooms"
                type="number"
                placeholder="2"
                value={form.bedrooms}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.col}>
              <label style={styles.label}>Bathrooms</label>
              <input
                name="bathrooms"
                type="number"
                placeholder="2"
                value={form.bathrooms}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Amenities</h3>
          <div style={styles.amenitiesGrid}>
            {amenitiesList.map((item, i) => (
              <label
                key={i}
                style={{
                  ...styles.amenityLabel,
                  background: form.amenities.includes(item) ? "#0a84ff" : "#1f1f1f",
                  color: form.amenities.includes(item) ? "#fff" : "#ccc",
                }}
              >
                <input
                  type="checkbox"
                  onChange={() => handleAmenity(item)}
                  checked={form.amenities.includes(item)}
                  style={{ display: "none" }}
                />
                {item}
              </label>
            ))}
          </div>
        </div>

        {/* Description & Contact */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Description & Contact</h3>
          
          <label style={styles.label}>Description</label>
          <textarea
            name="description"
            placeholder="Describe the property, location advantages, nearby amenities..."
            value={form.description}
            onChange={handleChange}
            style={styles.textarea}
            rows="5"
          />

          <label style={styles.label}>Phone Number *</label>
          <input
            name="phone"
            type="tel"
            placeholder="07xxxxxxxx"
            value={form.phone}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        {/* Location */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Location</h3>
          
          <button type="button" onClick={getMyLocation} style={styles.geoBtn}>
            📍 Get My Current Location
          </button>

          <div style={styles.row}>
            <div style={styles.col}>
              <label style={styles.label}>Latitude</label>
              <input
                name="lat"
                placeholder="e.g. -1.2921"
                value={form.lat}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.col}>
              <label style={styles.label}>Longitude</label>
              <input
                name="lng"
                placeholder="e.g. 36.8219"
                value={form.lng}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Multiple Image Upload */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Property Images (Max 6)</h3>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImages}
            style={styles.fileInput}
          />

          {imagePreviews.length > 0 && (
            <div style={{ marginTop: "15px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {imagePreviews.map((preview, index) => (
                <img
                  key={index}
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  style={{
                    width: "130px",
                    height: "130px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #444",
                  }}
                />
              ))}
            </div>
          )}

          <small style={{ color: "#888", marginTop: "8px", display: "block" }}>
            You can select up to 6 photos of your property
          </small>
        </div>

        <button
          type="submit"
          style={{
            ...styles.submitBtn,
            opacity: isSubmitting ? 0.7 : 1,
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Property for Approval"}
        </button>
      </form>
    </div>
  );
}

// ==================== STYLES ====================
const styles = {
  container: {
    padding: "40px 20px",
    maxWidth: "700px",
    margin: "40px auto",
    backgroundColor: "#0a0a0a",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#eee",
  },
  header: { textAlign: "center", marginBottom: "30px" },
  title: { fontSize: "28px", fontWeight: "600", margin: "0 0 8px 0", color: "#fff" },
  subtitle: { color: "#aaa", fontSize: "15px" },
  successMessage: {
    background: "#0a3d1f",
    color: "#4ade80",
    padding: "20px 25px",
    borderRadius: "12px",
    marginBottom: "30px",
    textAlign: "center",
    border: "1px solid #14532d",
  },
  form: { display: "flex", flexDirection: "column", gap: "32px" },
  section: { backgroundColor: "#111", padding: "24px", borderRadius: "12px", border: "1px solid #222" },
  sectionTitle: { margin: "0 0 18px 0", color: "#0a84ff", fontSize: "18px", fontWeight: "600" },
  label: { display: "block", marginBottom: "6px", fontSize: "14px", color: "#ccc", fontWeight: "500" },
  input: { width: "100%", padding: "12px 16px", backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "#fff", fontSize: "15px", outline: "none" },
  select: { width: "100%", padding: "12px 16px", backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "#fff", fontSize: "15px", cursor: "pointer" },
  textarea: { width: "100%", padding: "12px 16px", backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "#fff", fontSize: "15px", resize: "vertical", minHeight: "110px" },
  row: { display: "flex", gap: "16px" },
  col: { flex: 1 },
  amenitiesGrid: { display: "flex", flexWrap: "wrap", gap: "10px" },
  amenityLabel: { padding: "10px 16px", borderRadius: "8px", cursor: "pointer", userSelect: "none", transition: "all 0.2s ease", border: "1px solid #333", fontSize: "14px" },
  geoBtn: { padding: "12px 20px", background: "linear-gradient(135deg, #0a84ff, #0066cc)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px", fontWeight: "500", marginBottom: "12px" },
  fileInput: { width: "100%", padding: "12px", backgroundColor: "#1a1a1a", border: "2px dashed #444", borderRadius: "8px", color: "#ccc", cursor: "pointer" },
  submitBtn: { padding: "16px", background: "linear-gradient(135deg, #0a84ff, #0066cc)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "17px", fontWeight: "600", cursor: "pointer", marginTop: "10px" },
};