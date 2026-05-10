import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

export default function Movers() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  // 1. TABS & LOADING STATE
  const [activeTab, setActiveTab] = useState("search");
  const [loading, setLoading] = useState(false);
  const [selectedCounty, setSelectedCounty] = useState("");
  const [movers, setMovers] = useState([]);

  // 2. REGISTRATION FORM STATE
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    county: "",
    company: "",
    experience: "",
    vehicleType: "",
    services: [], // Array for checkboxes
    about: "",
  });

  const counties = [
    "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo Marakwet", "Embu", "Garissa",
    "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi",
    "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu",
    "Machakos", "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa",
    "Murang’a", "Nairobi City", "Nakuru", "Nandi", "Narok", "Nyamira",
    "Nyandarua", "Nyeri", "Samburu", "Siaya", "Taita Taveta", "Tana River",
    "Tharaka Nithi", "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga",
    "Wajir", "West Pokot"
  ];

  const availableServices = [
    "Household Moving", "Office Relocation", "Packing & Unpacking",
    "Furniture Assembly", "Storage Solutions", "Local Moving",
    "Inter-County Moving", "Fragile Item Handling"
  ];

  const vehicleOptions = ["Small Van", "Pickup Truck", "3-Ton Truck", "5-Ton Truck", "10-Ton+ Lorry", "Motorbike/Courier"];

  // 3. FETCH APPROVED MOVERS BY COUNTY
  useEffect(() => {
    if (!selectedCounty || activeTab !== "search") return;

    const fetchMovers = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/movers?county=${selectedCounty}`);
        setMovers(res.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setMovers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovers();
  }, [selectedCounty, activeTab]);

  // 4. HANDLE CHECKBOX CHANGE
  const handleServiceChange = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  // 5. HANDLE REGISTRATION SUBMIT
  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.services.length === 0) {
      alert("Please select at least one service.");
      return;
    }
    setLoading(true);
    try {
      await API.post("/movers/register", formData);
      alert("✅ Application Submitted! Admin will review your profile. You'll appear in searches once approved.");
      setFormData({ name: "", phone: "", county: "", company: "", experience: "", vehicleType: "", services: [], about: "" });
      setActiveTab("search");
    } catch (err) {
      alert("❌ Submission failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (mover) => {
    const message = `Hello ${mover.name}, I found you on Axx Spaces. I need moving services in ${selectedCounty}.`;
    window.open(`https://wa.me/${mover.phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🚚 Movers Hub</h1>
        <p style={styles.subtitle}>Kenya's Trusted Relocation Network</p>
      </div>

      <div style={styles.tabBar}>
        <button 
          style={activeTab === "search" ? styles.activeTab : styles.tab} 
          onClick={() => setActiveTab("search")}
        >
          🔍 Find a Mover
        </button>
        <button 
          style={activeTab === "register" ? styles.activeTab : styles.tab} 
          onClick={() => setActiveTab("register")}
        >
          📝 Register as Mover
        </button>
      </div>

      {activeTab === "search" ? (
        <div style={styles.searchSection}>
          <div style={styles.filterBox}>
            <select 
              value={selectedCounty} 
              onChange={(e) => setSelectedCounty(e.target.value)}
              style={styles.select}
            >
              <option value="">-- Choose County --</option>
              {counties.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {loading ? (
            <div style={styles.loader}>Scanning for verified movers...</div>
          ) : selectedCounty ? (
            <div style={styles.grid}>
              {movers.length > 0 ? movers.map((mover) => (
                <div key={mover._id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.moverName}>{mover.name}</h3>
                    <span style={styles.verifyBadge}>Verified</span>
                  </div>
                  <p style={styles.detail}><b>Experience:</b> {mover.experience} Years</p>
                  <p style={styles.detail}><b>Vehicle:</b> {mover.vehicleType}</p>
                  <div style={styles.serviceTags}>
                    {mover.services.map(s => <span key={s} style={styles.tag}>{s}</span>)}
                  </div>
                  <button onClick={() => handleContact(mover)} style={styles.whatsappBtn}>
                    Book Mover
                  </button>
                </div>
              )) : <p style={styles.emptyText}>No approved movers found in {selectedCounty} yet.</p>}
            </div>
          ) : <p style={styles.emptyText}>Select a county to see available professionals.</p>}
        </div>
      ) : (
        <div style={styles.formContainer}>
          <form style={styles.form} onSubmit={handleRegister}>
            <h2 style={styles.formTitle}>Professional Onboarding</h2>
            
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name / Brand Name</label>
                <input required style={styles.input} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>WhatsApp Phone</label>
                <input required type="tel" placeholder="07..." style={styles.input} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Primary County</label>
                <select required style={styles.input} value={formData.county} onChange={e => setFormData({...formData, county: e.target.value})}>
                   <option value="">Select County</option>
                   {counties.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Experience (Years)</label>
                <input type="number" style={styles.input} value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Vehicle Type</label>
              <select style={styles.input} value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})}>
                <option value="">Select Primary Vehicle</option>
                {vehicleOptions.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Services Offered (Tick all that apply)</label>
              <div style={styles.checkboxGrid}>
                {availableServices.map(service => (
                  <label key={service} style={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      checked={formData.services.includes(service)}
                      onChange={() => handleServiceChange(service)}
                    /> {service}
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Brief Bio / About Services</label>
              <textarea style={styles.textarea} placeholder="Tell customers why they should pick you..." value={formData.about} onChange={e => setFormData({...formData, about: e.target.value})} />
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? "Processing..." : "Submit Application"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { background: "#06101f", minHeight: "100vh", padding: "100px 20px 50px", color: "#f1f5f9", fontFamily: "'DM Sans', sans-serif" },
  header: { textAlign: "center", marginBottom: "40px" },
  title: { fontSize: "2.8rem", color: "#fbbf24", margin: 0 },
  subtitle: { color: "#94a3b8", marginTop: "10px" },
  tabBar: { display: "flex", justifyContent: "center", gap: "15px", marginBottom: "40px" },
  tab: { padding: "12px 25px", background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", borderRadius: "30px", cursor: "pointer", transition: "0.3s" },
  activeTab: { padding: "12px 25px", background: "#fbbf24", border: "1px solid #fbbf24", color: "#000", borderRadius: "30px", cursor: "pointer", fontWeight: "bold" },
  
  // Search Styles
  filterBox: { maxWidth: "400px", margin: "0 auto 40px" },
  select: { width: "100%", padding: "15px", borderRadius: "12px", background: "#1e293b", color: "#fff", border: "2px solid #334155" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "25px", maxWidth: "1200px", margin: "0 auto" },
  card: { background: "#111827", padding: "25px", borderRadius: "20px", border: "1px solid #1f2937", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
  moverName: { color: "#fbbf24", margin: 0, fontSize: "1.3rem" },
  verifyBadge: { background: "rgba(34, 197, 94, 0.2)", color: "#22c55e", padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "bold" },
  detail: { fontSize: "0.9rem", color: "#cbd5e1", margin: "5px 0" },
  serviceTags: { display: "flex", flexWrap: "wrap", gap: "8px", margin: "15px 0" },
  tag: { background: "#1f2937", padding: "5px 10px", borderRadius: "5px", fontSize: "0.8rem", color: "#94a3b8" },
  whatsappBtn: { width: "100%", padding: "12px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" },

  // Form Styles
  formContainer: { maxWidth: "700px", margin: "0 auto" },
  form: { background: "#1e293b", padding: "40px", borderRadius: "24px", border: "1px solid #334155" },
  formTitle: { textAlign: "center", color: "#fbbf24", marginBottom: "30px" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" },
  label: { fontSize: "0.9rem", color: "#94a3b8", fontWeight: "600" },
  input: { padding: "12px", borderRadius: "8px", background: "#0f172a", border: "1px solid #334155", color: "#fff" },
  textarea: { padding: "12px", borderRadius: "8px", background: "#0f172a", border: "1px solid #334155", color: "#fff", height: "100px", resize: "none" },
  checkboxGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", background: "#0f172a", padding: "15px", borderRadius: "8px" },
  checkboxLabel: { fontSize: "0.85rem", color: "#cbd5e1", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" },
  submitBtn: { width: "100%", padding: "15px", background: "#fbbf24", color: "#000", border: "none", borderRadius: "10px", fontWeight: "900", cursor: "pointer", marginTop: "10px" },
  
  emptyText: { textAlign: "center", color: "#64748b", marginTop: "50px" },
  loader: { textAlign: "center", color: "#fbbf24", fontSize: "1.1rem" }
};