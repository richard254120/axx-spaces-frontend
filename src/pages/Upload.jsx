import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Upload() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "", county: "", area: "", price: "", deposit: "", type: "",
    bedrooms: "", bathrooms: "", amenities: [], description: "",
    phone: "", lat: "", lng: "",
  });

  // ✅ UPDATED: State for multiple files
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) { navigate("/login"); }
  }, [token, navigate]);

  const counties = ["Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita Taveta","Garissa","Wajir","Mandera","Marsabit","Isiolo","Meru","Tharaka Nithi","Embu","Kitui","Machakos","Makueni","Nyandarua","Nyeri","Kirinyaga","Murang’a","Kiambu","Turkana","West Pokot","Samburu","Trans Nzoia","Uasin Gishu","Elgeyo Marakwet","Nandi","Baringo","Laikipia","Nakuru","Narok","Kajiado","Kericho","Bomet","Kakamega","Vihiga","Bungoma","Busia","Siaya","Kisumu","Homa Bay","Migori","Kisii","Nyamira","Nairobi City"];
  const propertyTypes = ["Bedsitter","Studio Apartment","1 Bedroom","2 Bedroom","3 Bedroom","4+ Bedroom","Maisonette","Bungalow","Townhouse","Apartment Block","Single Room","Shared Room","Hostel Room","Commercial Office","Shop / Retail Space","Warehouse","Plot / Land","Furnished Apartment","Unfurnished Apartment"];
  const amenitiesList = ["Water","Electricity","Parking","Security","WiFi","Borehole","Furnished"];

  const getMyLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition((pos) => {
      setForm(prev => ({ ...prev, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) }));
      alert("✅ Location detected!");
    });
  };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAmenity = (item) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(item) ? prev.amenities.filter(a => a !== item) : [...prev.amenities, item]
    }));
  };

  // ✅ UPDATED: Handle Multiple Images
  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    const filePreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(filePreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    const formData = new FormData();

    // Append standard fields
    Object.keys(form).forEach(key => {
      if (key === 'amenities') {
        formData.append(key, JSON.stringify(form[key]));
      } else {
        formData.append(key, form[key]);
      }
    });

    // ✅ UPDATED: Append each file to 'images' array for Multer
    selectedFiles.forEach(file => {
      formData.append("images", file);
    });

    try {
      await API.post("/properties", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      setSuccess(true);
      setForm({ title: "", county: "", area: "", price: "", deposit: "", type: "", bedrooms: "", bathrooms: "", amenities: [], description: "", phone: "", lat: "", lng: "" });
      setSelectedFiles([]);
      setPreviews([]);
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to submit property.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Upload Property</h2>
        <p style={styles.subtitle}>List your property on AXX Spaces</p>
      </div>

      {success && <div style={styles.successMessage}>✅ Submitted! Awaiting Admin Approval.</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Details</h3>
          <input name="title" placeholder="Title" value={form.title} onChange={handleChange} style={styles.input} required />
          <div style={styles.row}>
            <select name="county" value={form.county} onChange={handleChange} style={styles.select} required>
              <option value="">Select County</option>
              {counties.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input name="area" placeholder="Area" value={form.area} onChange={handleChange} style={styles.input} required />
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Pricing</h3>
          <div style={styles.row}>
            <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} style={styles.input} required />
            <input name="deposit" type="number" placeholder="Deposit" value={form.deposit} onChange={handleChange} style={styles.input} />
          </div>
        </div>

        {/* ✅ UPDATED: Multi-Image Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Property Images (Upload Multiple)</h3>
          <input type="file" multiple accept="image/*" onChange={handleImages} style={styles.fileInput} />
          <div style={styles.previewGrid}>
            {previews.map((src, i) => (
              <img key={i} src={src} alt="preview" style={styles.thumb} />
            ))}
          </div>
        </div>

        <button type="submit" style={styles.submitBtn} disabled={isSubmitting}>
          {isSubmitting ? "Uploading to Cloud..." : "Submit Property"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: { padding: "40px 20px", maxWidth: "700px", margin: "40px auto", backgroundColor: "#0a0a0a", borderRadius: "16px", color: "#eee" },
  header: { textAlign: "center", marginBottom: "30px" },
  title: { fontSize: "28px", color: "#fff" },
  subtitle: { color: "#aaa" },
  successMessage: { background: "#0a3d1f", color: "#4ade80", padding: "15px", borderRadius: "8px", marginBottom: "20px", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  section: { backgroundColor: "#111", padding: "20px", borderRadius: "12px", border: "1px solid #222" },
  sectionTitle: { color: "#0a84ff", marginBottom: "15px" },
  input: { width: "100%", padding: "12px", backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "#fff", marginBottom: "10px" },
  select: { width: "100%", padding: "12px", backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "#fff" },
  row: { display: "flex", gap: "10px", marginBottom: "10px" },
  fileInput: { width: "100%", padding: "20px", border: "2px dashed #333", borderRadius: "8px", cursor: "pointer" },
  previewGrid: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "15px" },
  thumb: { width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid #444" },
  submitBtn: { padding: "16px", background: "linear-gradient(135deg, #0a84ff, #0066cc)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "600", cursor: "pointer" }
};