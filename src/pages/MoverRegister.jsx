import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import PhoneInput from "../components/PhoneInput";

export default function MoverRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    county: "",
    services: "",
    experience: "",
    company: "",
    description: "",
    vehicleType: "",
    baseRate: "",
    rateType: "per_job",
    minCharge: "",
    hasInsurance: false,
    insuranceProvider: "",
    coverageAmount: "",
    teamSize: "1",
    specialties: "",
    serviceAreas: "",
    availability: "",
    responseTime: "",
    languages: "",
    certifications: "",
    workPhotos: [],
    equipment: "",
    workHours: "",
    uniform: false,
    safetyGear: false,
    loadingEquipment: "",
    photoDescriptions: []
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map(file => ({
      file,
      description: "",
      category: "general"
    }));
    setFormData({
      ...formData,
      workPhotos: [...formData.workPhotos, ...newPhotos],
      photoDescriptions: [...formData.photoDescriptions, ...new Array(files.length).fill("")]
    });
  };

  const removePhoto = (index) => {
    setFormData({
      ...formData,
      workPhotos: formData.workPhotos.filter((_, i) => i !== index),
      photoDescriptions: formData.photoDescriptions.filter((_, i) => i !== index)
    });
  };

  const handlePhotoDescriptionChange = (index, description) => {
    const newDescriptions = [...formData.photoDescriptions];
    newDescriptions[index] = description;
    setFormData({
      ...formData,
      photoDescriptions: newDescriptions
    });
  };

  const handlePhotoCategoryChange = (index, category) => {
    const newPhotos = [...formData.workPhotos];
    newPhotos[index] = { ...newPhotos[index], category };
    setFormData({
      ...formData,
      workPhotos: newPhotos
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Prepare the data for submission
      const submissionData = new FormData();
      submissionData.append("role", "mover");
      submissionData.append("name", formData.name);
      submissionData.append("email", formData.email);
      submissionData.append("password", formData.password);
      submissionData.append("phone", formData.phone);
      submissionData.append("county", formData.county);
      submissionData.append("services", formData.services);
      submissionData.append("experience", formData.experience);
      submissionData.append("company", formData.company);
      submissionData.append("description", formData.description);
      submissionData.append("vehicleType", formData.vehicleType);
      submissionData.append("baseRate", formData.baseRate);
      submissionData.append("rateType", formData.rateType);
      submissionData.append("minCharge", formData.minCharge);
      submissionData.append("hasInsurance", formData.hasInsurance);
      submissionData.append("insuranceProvider", formData.insuranceProvider);
      submissionData.append("coverageAmount", formData.coverageAmount);
      submissionData.append("teamSize", formData.teamSize);
      submissionData.append("specialties", formData.specialties);
      submissionData.append("serviceAreas", formData.serviceAreas);
      submissionData.append("availability", formData.availability);
      submissionData.append("responseTime", formData.responseTime);
      submissionData.append("languages", formData.languages);
      submissionData.append("certifications", formData.certifications);
      submissionData.append("equipment", formData.equipment);
      submissionData.append("workHours", formData.workHours);
      submissionData.append("uniform", formData.uniform);
      submissionData.append("safetyGear", formData.safetyGear);
      submissionData.append("loadingEquipment", formData.loadingEquipment);

      // Append work photos with descriptions
      formData.workPhotos.forEach((photo, index) => {
        submissionData.append("workPhotos", photo.file || photo);
        submissionData.append(`photoDescription_${index}`, formData.photoDescriptions[index] || "");
        submissionData.append(`photoCategory_${index}`, photo.category || "general");
      });

      const res = await API.post("/auth/register", submissionData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setMessage("✅ Mover registration successful! Please check your email to verify your account.");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.error || "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🚚 Register as a Professional Mover</h1>
        <p style={styles.subtitle}>Join Axxspace Movers Network</p>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Basic Information</h3>
            <input
              type="text"
              name="name"
              placeholder="Full Name or Company Name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Create Password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <PhoneInput
              name="phone"
              value={formData.phone}
              onChange={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
              style={styles.input}
              required
            />

            <select
              name="county"
              value={formData.county}
              onChange={handleChange}
              style={styles.input}
              required
            >
              <option value="">Select Operating County</option>
              {[
                "Nairobi City", "Mombasa", "Kiambu", "Nakuru", "Uasin Gishu", "Kisumu",
                "Kakamega", "Machakos", "Kajiado", "Kilifi", "Meru", "Nyeri", "Bungoma",
                "Busia", "Homa Bay", "Siaya", "Migori", "Kitui", "Embu", "Murang'a",
                "Kirinyaga", "Tharaka Nithi", "Laikipia", "Baringo", "Nandi", "Kericho",
                "Bomet", "Vihiga", "Trans Nzoia", "West Pokot", "Turkana", "Samburu",
                "Mandera", "Wajir", "Garissa", "Tana River", "Lamu", "Taita Taveta",
                "Marsabit", "Isiolo", "Nyandarua", "Nyamira", "Elgeyo Marakwet"
              ].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <input
              type="text"
              name="company"
              placeholder="Company Name (Optional)"
              value={formData.company}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* Services & Experience */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Services & Experience</h3>
            <textarea
              name="services"
              placeholder="Services (comma-separated, e.g. House Moving, Office Relocation, Packing)"
              value={formData.services}
              onChange={handleChange}
              style={styles.textarea}
              required
            />

            <input
              type="text"
              name="experience"
              placeholder="Years of Experience (e.g. 5)"
              value={formData.experience}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="">Primary Vehicle Type</option>
              <option value="Pickup">Pickup Truck</option>
              <option value="Van">Van</option>
              <option value="Lorry">Lorry</option>
              <option value="Truck">Truck</option>
              <option value="Motorbike">Motorbike</option>
            </select>

            <textarea
              name="description"
              placeholder="Describe your business and why customers should choose you..."
              value={formData.description}
              onChange={handleChange}
              style={styles.textarea}
            />
          </div>

          {/* Pricing */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Pricing Information</h3>
            <input
              type="number"
              name="baseRate"
              placeholder="Base Rate (KES)"
              value={formData.baseRate}
              onChange={handleChange}
              style={styles.input}
            />

            <select
              name="rateType"
              value={formData.rateType}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="per_job">Per Job</option>
              <option value="hourly">Hourly</option>
              <option value="per_km">Per Kilometer</option>
              <option value="fixed">Fixed Price</option>
            </select>

            <input
              type="number"
              name="minCharge"
              placeholder="Minimum Charge (KES)"
              value={formData.minCharge}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* Insurance */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Insurance Information</h3>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="hasInsurance"
                checked={formData.hasInsurance}
                onChange={handleChange}
                style={styles.checkbox}
              />
              <span>I have insurance coverage</span>
            </label>

            {formData.hasInsurance && (
              <>
                <input
                  type="text"
                  name="insuranceProvider"
                  placeholder="Insurance Provider Name"
                  value={formData.insuranceProvider}
                  onChange={handleChange}
                  style={styles.input}
                />

                <input
                  type="number"
                  name="coverageAmount"
                  placeholder="Coverage Amount (KES)"
                  value={formData.coverageAmount}
                  onChange={handleChange}
                  style={styles.input}
                />
              </>
            )}
          </div>

          {/* Team & Specialties */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Team & Specialties</h3>
            <input
              type="number"
              name="teamSize"
              placeholder="Team Size"
              value={formData.teamSize}
              onChange={handleChange}
              style={styles.input}
              min="1"
            />

            <textarea
              name="specialties"
              placeholder="Specialties (comma-separated, e.g. Piano Moving, Fragile Items, Heavy Lifting)"
              value={formData.specialties}
              onChange={handleChange}
              style={styles.textarea}
            />

            <textarea
              name="serviceAreas"
              placeholder="Service Areas (comma-separated counties/areas)"
              value={formData.serviceAreas}
              onChange={handleChange}
              style={styles.textarea}
            />
          </div>

          {/* Additional Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Additional Information</h3>
            <input
              type="text"
              name="availability"
              placeholder="Availability (e.g. Mon-Sat, 8AM-6PM)"
              value={formData.availability}
              onChange={handleChange}
              style={styles.input}
            />

            <input
              type="text"
              name="workHours"
              placeholder="Working Hours (e.g. 6:00 AM - 8:00 PM)"
              value={formData.workHours}
              onChange={handleChange}
              style={styles.input}
            />

            <input
              type="text"
              name="responseTime"
              placeholder="Response Time (e.g. Within 1 hour)"
              value={formData.responseTime}
              onChange={handleChange}
              style={styles.input}
            />

            <input
              type="text"
              name="languages"
              placeholder="Languages Spoken (comma-separated)"
              value={formData.languages}
              onChange={handleChange}
              style={styles.input}
            />

            <textarea
              name="certifications"
              placeholder="Certifications & Training (comma-separated)"
              value={formData.certifications}
              onChange={handleChange}
              style={styles.textarea}
            />
          </div>

          {/* Equipment & Safety */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🔧 Equipment & Safety</h3>
            <textarea
              name="equipment"
              placeholder="Equipment you have (e.g. Dollies, Ramps, Straps, Blankets, Tool Kit)"
              value={formData.equipment}
              onChange={handleChange}
              style={styles.textarea}
            />

            <textarea
              name="loadingEquipment"
              placeholder="Loading/Unloading Equipment (e.g. Forklift, Crane, Hand Truck)"
              value={formData.loadingEquipment}
              onChange={handleChange}
              style={styles.textarea}
            />

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="uniform"
                checked={formData.uniform}
                onChange={handleChange}
                style={styles.checkbox}
              />
              <span>We wear professional uniforms</span>
            </label>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="safetyGear"
                checked={formData.safetyGear}
                onChange={handleChange}
                style={styles.checkbox}
              />
              <span>We use safety gear (gloves, helmets, vests)</span>
            </label>
          </div>

          {/* Proof of Work */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📷 Proof of Work</h3>
            <p style={styles.hint}>Upload photos of you doing moving activities to build trust with customers (up to 10 photos)</p>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              style={styles.fileInput}
            />

            {formData.workPhotos.length > 0 && (
              <div style={styles.photoPreview}>
                {formData.workPhotos.map((photo, index) => (
                  <div key={index} style={styles.photoItemWithDetails}>
                    <img
                      src={URL.createObjectURL(photo.file || photo)}
                      alt={`Work photo ${index + 1}`}
                      style={styles.photoImg}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      style={styles.removePhotoBtn}
                    >
                      ✕
                    </button>
                    <div style={styles.photoDetails}>
                      <select
                        value={photo.category || "general"}
                        onChange={(e) => handlePhotoCategoryChange(index, e.target.value)}
                        style={styles.photoCategorySelect}
                      >
                        <option value="general">General Work</option>
                        <option value="moving">Moving Activity</option>
                        <option value="team">Team in Action</option>
                        <option value="equipment">Equipment</option>
                        <option value="before_after">Before/After</option>
                        <option value="vehicle">Vehicle</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Describe this photo..."
                        value={formData.photoDescriptions[index] || ""}
                        onChange={(e) => handlePhotoDescriptionChange(index, e.target.value)}
                        style={styles.photoDescriptionInput}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? "Registering..." : "Register as Mover"}
          </button>
        </form>

        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #06101f 0%, #0f1729 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px"
  },
  card: {
    background: "#1e293b",
    padding: "40px",
    borderRadius: "16px",
    maxWidth: "600px",
    width: "100%",
    border: "1px solid #334155",
    maxHeight: "90vh",
    overflowY: "auto"
  },
  title: {
    textAlign: "center",
    color: "#fbbf24",
    fontSize: "2rem",
    marginBottom: "8px"
  },
  subtitle: {
    textAlign: "center",
    color: "#94a3b8",
    marginBottom: "30px"
  },
  section: {
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: "1px solid #334155"
  },
  sectionTitle: {
    color: "#fbbf24",
    fontSize: "1.2rem",
    marginBottom: "15px",
    fontWeight: "600"
  },
  input: {
    width: "100%",
    padding: "14px",
    margin: "10px 0",
    background: "#0f1729",
    border: "1px solid #475569",
    borderRadius: "8px",
    color: "white"
  },
  textarea: {
    width: "100%",
    padding: "14px",
    margin: "10px 0",
    background: "#0f1729",
    border: "1px solid #475569",
    borderRadius: "8px",
    color: "white",
    minHeight: "80px",
    resize: "vertical",
    fontFamily: "inherit"
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#94a3b8",
    margin: "10px 0",
    cursor: "pointer"
  },
  checkbox: {
    width: "20px",
    height: "20px",
    cursor: "pointer"
  },
  submitBtn: {
    width: "100%",
    padding: "16px",
    background: "#22c55e",
    color: "black",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700",
    marginTop: "20px",
    cursor: "pointer"
  },
  message: {
    textAlign: "center",
    marginTop: "20px",
    padding: "12px",
    borderRadius: "8px",
    fontWeight: "600"
  },
  hint: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    marginBottom: "10px"
  },
  fileInput: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    background: "#0f1729",
    border: "1px dashed #475569",
    borderRadius: "8px",
    color: "#94a3b8",
    cursor: "pointer"
  },
  photoPreview: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
    gap: "10px",
    marginTop: "15px"
  },
  photoItem: {
    position: "relative",
    width: "100%",
    paddingBottom: "100%",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #475569"
  },
  photoImg: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  removePhotoBtn: {
    position: "absolute",
    top: "5px",
    right: "5px",
    background: "rgba(220, 38, 38, 0.9)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "bold"
  },
  photoItemWithDetails: {
    position: "relative",
    width: "100%",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #475569",
    marginBottom: "10px"
  },
  photoDetails: {
    padding: "10px",
    background: "#0f1729",
    borderTop: "1px solid #475569"
  },
  photoCategorySelect: {
    width: "100%",
    padding: "8px",
    marginBottom: "8px",
    background: "#1e293b",
    border: "1px solid #475569",
    borderRadius: "6px",
    color: "white",
    fontSize: "12px"
  },
  photoDescriptionInput: {
    width: "100%",
    padding: "8px",
    background: "#1e293b",
    border: "1px solid #475569",
    borderRadius: "6px",
    color: "white",
    fontSize: "12px"
  }
};