import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://axx-spaces-backend.onrender.com/api";

const AMENITIES_LIST = [
  "WiFi","Parking","AC/Cooler","Water Tank","Generator","Security Fence",
  "Balcony","TV","Refrigerator","Cooking Stove","Bed","Sofa","Dining Table",
  "Shower","Kitchen Cabinet","Wardrobes","Ceiling Fans","Lights",
  "24/7 Security","Swimming Pool","Gym","Garden","Workspace","Pet Friendly",
];

export default function Upload() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

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
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : ["price","deposit","bedrooms","bathrooms","totalUnits"].includes(name)
          ? parseInt(value) || ""
          : value,
    }));
  };

  // ================= AMENITIES =================
  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  // ================= IMAGES =================
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + images.length > 10) {
      setError("⚠️ Maximum 10 images allowed");
      return;
    }

    setImages((prev) => [...prev, ...files]);

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title || !formData.description || !formData.location ||
        !formData.price || !formData.bedrooms || !formData.bathrooms) {
      setError("❌ Please fill all required fields");
      return;
    }

    if (images.length === 0) {
      setError("❌ Please upload at least one image");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "amenities") {
          formDataToSend.append("amenities", JSON.stringify(formData.amenities));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      images.forEach((img) => formDataToSend.append("images", img));

      // ✅ FIXED ENDPOINT
      const response = await fetch(`${API_BASE}/properties/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setSuccess("✅ Property uploaded successfully!");

      setFormData({
        title: "", description: "", location: "", price: "", deposit: "",
        bedrooms: "", bathrooms: "", amenities: [], totalUnits: 1,
        furnished: false, leaseType: "monthly", availableFrom: "", rules: "",
      });

      setImages([]);
      setImagePreviews([]);

      setTimeout(() => navigate("/dashboard"), 2000);

    } catch (err) {
      setError(err.message || "Upload error");
    } finally {
      setLoading(false);
    }
  };

  // ================= AUTH CHECK =================
  if (!token) {
    return (
      <div style={styles.container}>
        <style>{cssStyles}</style>
        <div style={styles.unauth}>
          <p>🔐 Please login to upload a property</p>
          <button onClick={() => navigate("/login")} style={styles.loginBtn}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ================= UI =================
  return (
    <div style={styles.container}>
      <style>{cssStyles}</style>

      <div style={styles.formBox}>
        <h1 style={styles.heading}>📝 Upload Your Property</h1>
        <p style={styles.subtitle}>List your rental property on Axx Spaces</p>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          
          <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} style={styles.input}/>
          <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} style={styles.input}/>
          
          <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} style={styles.textarea}/>

          <input name="price" type="number" placeholder="Price" value={formData.price} onChange={handleChange} style={styles.input}/>
          <input name="bedrooms" type="number" placeholder="Bedrooms" value={formData.bedrooms} onChange={handleChange} style={styles.input}/>
          <input name="bathrooms" type="number" placeholder="Bathrooms" value={formData.bathrooms} onChange={handleChange} style={styles.input}/>

          {/* IMAGE */}
          <input type="file" multiple accept="image/*" onChange={handleImageChange}/>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? "Uploading..." : "Upload Property"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  container: { minHeight: "100vh", background: "#06101f", padding: "20px" },
  formBox: { maxWidth: "600px", margin: "auto", background: "#0a1428", padding: "30px", borderRadius: "12px" },
  heading: { color: "#fff", textAlign: "center" },
  subtitle: { color: "#aaa", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #333", background: "#1e293b", color: "#fff" },
  textarea: { padding: "12px", borderRadius: "8px", border: "1px solid #333", background: "#1e293b", color: "#fff" },
  submitBtn: { padding: "12px", background: "#22c55e", border: "none", borderRadius: "8px", color: "#fff" },
  errorBox: { color: "red" },
  successBox: { color: "green" },
  unauth: { textAlign: "center", color: "#fff" },
  loginBtn: { marginTop: "10px" },
};

/* ================= CSS ================= */
const cssStyles = `
  input:focus, textarea:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;