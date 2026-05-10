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
    services: "",
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

  // 3. FETCH APPROVED MOVERS BY COUNTY
  useEffect(() => {
    if (!selectedCounty || activeTab !== "search") return;

    const fetchMovers = async () => {
      setLoading(true);
      try {
        // Backend should only return movers where isApproved: true
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

  // 4. HANDLE REGISTRATION SUBMIT
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Sends details to backend with default isApproved: false
      await API.post("/movers/register", formData);
      alert("✅ Details Submitted! Please wait for Admin approval before you appear in searches.");
      setFormData({ name: "", phone: "", county: "", company: "", services: "" });
      setActiveTab("search");
    } catch (err) {
      alert("❌ Error submitting details. Please try again.");
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
        <p style={styles.subtitle}>Professional relocation services at your fingertips</p>
      </div>

      {/* TAB NAVIGATION */}
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

      <hr style={styles.divider} />

      {/* SEARCH TAB CONTENT */}
      {activeTab === "search" && (
        <div style={styles.contentFade}>
          <div style={styles.filterSection}>
            <select 
              value={selectedCounty} 
              onChange={(e) => setSelectedCounty(e.target.value)}
              style={styles.select}
            >
              <option value="">-- Select County to Search --</option>
              {counties.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {loading && <p style={styles.centerText}>Searching for verified movers...</p>}

          {!loading && selectedCounty && movers.length > 0 && (
            <div style={styles.grid}>
              {movers.map((mover) => (
                <div key={mover._id} style={styles.card}>
                  <h3 style={styles.moverName}>{mover.name}</h3>
                  <p style={styles.badge}>✅ Verified</p>
                  <p style={styles.detail}>📍 {mover.county}</p>
                  {mover.company && <p style={styles.detail}>🏢 {mover.company}</p>}
                  <p style={styles.servicesText}>{mover.services}</p>
                  <button onClick={() => handleContact(mover)} style={styles.whatsappBtn}>
                    Chat on WhatsApp
                  </button>
                </div>
              ))}
            </div>
          )}

          {!loading && selectedCounty && movers.length === 0 && (
            <p style={styles.centerText}>No approved movers found in {selectedCounty} yet.</p>
          )}
        </div>
      )}

      {/* REGISTER TAB CONTENT */}
      {activeTab === "register" && (
        <div style={styles.authCard}>
          <h2 style={styles.formTitle}>Mover Application</h2>
          <p style={styles.formNote}>Fill in your details. Admin will verify and post them publicly.</p>
          
          <form onSubmit={handleRegister}>
            <input 
              placeholder="Full Name / Business Name" 
              style={styles.input} 
              required 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <input 
              placeholder="WhatsApp Phone Number (e.g. 0712...)" 
              style={styles.input} 
              required 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
            <select 
              style={styles.input} 
              required 
              value={formData.county}
              onChange={(e) => setFormData({...formData, county: e.target.value})}
            >
              <option value="">Select Primary County</option>
              {counties.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input 
              placeholder="Company Name (Optional)" 
              style={styles.input} 
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
            />
            <textarea 
              placeholder="List your services (e.g. House moving, Office relocations, Packing...)" 
              style={{...styles.input, height: "100px", resize: "none"}} 
              required 
              value={formData.services}
              onChange={(e) => setFormData({...formData, services: e.target.value})}
            />
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? "Submitting..." : "Submit for Approval"}
            </button>
          </form>
        </div>
      )}

      <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
        ← Back to Dashboard
      </button>
    </div>
  );
}

const styles = {
  container: {
    background: "linear-gradient(135deg, #06101f 0%, #0f1729 100%)",
    minHeight: "100vh",
    padding: "120px 20px 60px",
    color: "#f1f5f9",
    fontFamily: "'DM Sans', sans-serif"
  },
  header: { textAlign: "center", marginBottom: "40px" },
  title: { fontSize: "2.5rem", color: "#fbbf24", marginBottom: "10px" },
  subtitle: { color: "#94a3b8", fontSize: "1.1rem" },
  
  tabBar: { display: "flex", justifyContent: "center", gap: "15px", marginBottom: "20px" },
  tab: { padding: "12px 24px", background: "rgba(30, 41, 59, 0.5)", border: "1px solid #334155", color: "#94a3b8", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  activeTab: { padding: "12px 24px", background: "#fbbf24", border: "1px solid #fbbf24", color: "#000", borderRadius: "8px", cursor: "pointer", fontWeight: "700" },
  divider: { border: "0", height: "1px", background: "rgba(51, 65, 85, 0.5)", marginBottom: "40px", maxWidth: "800px", margin: "0 auto 40px" },

  filterSection: { maxWidth: "500px", margin: "0 auto 40px" },
  select: { width: "100%", padding: "15px", borderRadius: "10px", background: "#1e293b", color: "#fff", border: "1px solid #475569", fontSize: "1rem" },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "25px", maxWidth: "1200px", margin: "0 auto" },
  card: { background: "#1e293b", padding: "25px", borderRadius: "15px", border: "1px solid #334155", position: "relative" },
  moverName: { fontSize: "1.4rem", color: "#60a5fa", marginBottom: "5px" },
  badge: { color: "#22c55e", fontSize: "0.8rem", fontWeight: "bold", marginBottom: "15px" },
  detail: { color: "#cbd5e1", margin: "5px 0", fontSize: "0.95rem" },
  servicesText: { color: "#94a3b8", fontSize: "0.9rem", margin: "15px 0", fontStyle: "italic", lineHeight: "1.5" },
  whatsappBtn: { width: "100%", padding: "12px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" },

  authCard: { maxWidth: "500px", margin: "0 auto", background: "#1e293b", padding: "40px", borderRadius: "20px", border: "1px solid #334155" },
  formTitle: { textAlign: "center", color: "#fbbf24", marginBottom: "10px" },
  formNote: { textAlign: "center", color: "#94a3b8", fontSize: "0.9rem", marginBottom: "30px" },
  input: { width: "100%", padding: "12px", marginBottom: "15px", borderRadius: "8px", border: "1px solid #334155", background: "#0f172a", color: "#fff", boxSizing: "border-box" },
  submitBtn: { width: "100%", padding: "14px", background: "#fbbf24", color: "#000", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "1rem" },

  centerText: { textAlign: "center", color: "#94a3b8", padding: "40px" },
  backBtn: { display: "block", margin: "40px auto 0", padding: "10px 20px", background: "transparent", color: "#94a3b8", border: "1px solid #334155", borderRadius: "8px", cursor: "pointer" }
};