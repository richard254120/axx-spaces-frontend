import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

export default function Movers() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("search");
  const [loading, setLoading] = useState(false);
  const [selectedCounty, setSelectedCounty] = useState("");
  const [movers, setMovers] = useState([]);

  // FORM STATE
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    county: "",
    company: "",
    experience: "",
    vehicleType: "",
    services: [],
    about: "",
    hasInsurance: false,
    pricingType: "Flat Rate",
    availability: "Daily (8am - 6pm)",
    licenseNo: "" // For Admin eyes only
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
    "Furniture Assembly", "Storage Solutions", "Inter-County Moving",
    "Fragile Item Handling", "Piano/Heavy Lift"
  ];

  useEffect(() => {
    if (!selectedCounty || activeTab !== "search") return;
    const fetchMovers = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/movers?county=${selectedCounty}`);
        setMovers(res.data || []);
      } catch (err) { setMovers([]); }
      finally { setLoading(false); }
    };
    fetchMovers();
  }, [selectedCounty, activeTab]);

  const handleServiceChange = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.services.length === 0) return alert("Select at least one service.");
    setLoading(true);
    try {
      await API.post("/movers/register", formData);
      alert("✅ Application Submitted! Admin will review your profile.");
      setActiveTab("search");
    } catch (err) { alert("❌ Error submitting."); }
    finally { setLoading(false); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🚚 Axx Movers</h1>
        <p style={styles.subtitle}>Verified Relocation Experts in Kenya</p>
      </div>

      <div style={styles.tabBar}>
        <button style={activeTab === "search" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("search")}>🔍 Find Mover</button>
        <button style={activeTab === "register" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("register")}>📝 Join as Mover</button>
      </div>

      {activeTab === "search" ? (
        <div style={styles.searchSection}>
          <select value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)} style={styles.select}>
            <option value="">-- Choose Your County --</option>
            {counties.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <div style={styles.grid}>
            {movers.map((mover) => (
              <div key={mover._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.moverName}>{mover.name}</h3>
                  {mover.hasInsurance && <span style={styles.insBadge}>🛡️ Insured</span>}
                </div>
                <div style={styles.infoRow}>
                  <span>📍 {mover.county}</span>
                  <span>⭐ {mover.experience} Yrs Exp</span>
                </div>
                <p style={styles.detail}>🚛 <b>Vehicle:</b> {mover.vehicleType}</p>
                <p style={styles.detail}>💰 <b>Rates:</b> {mover.pricingType}</p>
                <p style={styles.detail}>⏰ <b>Availability:</b> {mover.availability}</p>
                
                <div style={styles.tagContainer}>
                  {mover.services.map(s => <span key={s} style={styles.miniTag}>{s}</span>)}
                </div>

                <button onClick={() => window.open(`https://wa.me/${mover.phone}`, "_blank")} style={styles.whatsappBtn}>
                  Contact Mover
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={styles.formCard}>
          <form onSubmit={handleRegister}>
            <h2 style={{color: '#fbbf24', textAlign: 'center'}}>Mover Onboarding</h2>
            
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}><label>Full/Business Name</label><input required style={styles.input} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              <div style={styles.inputGroup}><label>WhatsApp Phone</label><input required style={styles.input} placeholder="07..." onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label>Operating County</label>
                <select style={styles.input} onChange={e => setFormData({...formData, county: e.target.value})}>
                  <option>Select...</option>
                  {counties.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={styles.inputGroup}><label>Years of Experience</label><input type="number" style={styles.input} onChange={e => setFormData({...formData, experience: e.target.value})} /></div>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label>Primary Vehicle</label>
                <select style={styles.input} onChange={e => setFormData({...formData, vehicleType: e.target.value})}>
                  <option>Select...</option>
                  <option>Pickup</option><option>3-Ton Truck</option><option>5-Ton Truck</option><option>10-Ton Lorry</option>
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label>Pricing Model</label>
                <select style={styles.input} onChange={e => setFormData({...formData, pricingType: e.target.value})}>
                  <option>Flat Rate</option><option>Per Hour</option><option>Negotiable</option>
                </select>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label>Services Offered</label>
              <div style={styles.checkGrid}>
                {availableServices.map(s => (
                  <label key={s} style={styles.checkItem}>
                    <input type="checkbox" onChange={() => handleServiceChange(s)} /> {s}
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.inputGroup}>
                <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <input type="checkbox" onChange={e => setFormData({...formData, hasInsurance: e.target.checked})} />
                    Do you provide Goods-In-Transit Insurance?
                </label>
            </div>

            <div style={styles.inputGroup}><label>National ID / Business License No (Confidential)</label><input style={styles.input} onChange={e => setFormData({...formData, licenseNo: e.target.value})} /></div>

            <button type="submit" style={styles.submitBtn}>Submit for Verification</button>
          </form>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { background: "#06101f", minHeight: "100vh", padding: "120px 20px 60px", color: "#f1f5f9", fontFamily: "'DM Sans', sans-serif" },
  header: { textAlign: "center", marginBottom: "40px" },
  title: { fontSize: "2.5rem", color: "#fbbf24", marginBottom: "10px" },
  subtitle: { color: "#94a3b8" },
  tabBar: { display: "flex", justifyContent: "center", gap: "10px", marginBottom: "40px" },
  tab: { padding: "10px 20px", background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", borderRadius: "20px", cursor: "pointer" },
  activeTab: { padding: "10px 20px", background: "#fbbf24", color: "#000", border: "none", borderRadius: "20px", fontWeight: "bold" },
  
  select: { display: "block", width: "100%", maxWidth: "400px", margin: "0 auto 30px", padding: "12px", background: "#1e293b", color: "#fff", border: "1px solid #334155", borderRadius: "8px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", maxWidth: "1200px", margin: "0 auto" },
  card: { background: "#111827", padding: "20px", borderRadius: "15px", border: "1px solid #1f2937" },
  cardHeader: { display: "flex", justifyContent: "space-between", marginBottom: "10px" },
  moverName: { color: "#fbbf24", margin: 0, fontSize: "1.2rem" },
  insBadge: { background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", padding: "4px 8px", borderRadius: "5px", fontSize: "0.7rem" },
  infoRow: { display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: "0.85rem", marginBottom: "10px" },
  detail: { margin: "5px 0", fontSize: "0.9rem" },
  tagContainer: { display: "flex", flexWrap: "wrap", gap: "5px", margin: "15px 0" },
  miniTag: { background: "#1e293b", padding: "3px 8px", borderRadius: "4px", fontSize: "0.75rem", color: "#cbd5e1" },
  whatsappBtn: { width: "100%", padding: "10px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },

  formCard: { maxWidth: "650px", margin: "0 auto", background: "#1e293b", padding: "30px", borderRadius: "20px" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" },
  inputGroup: { marginBottom: "15px", display: "flex", flexDirection: "column", gap: "5px" },
  input: { padding: "10px", background: "#0f172a", border: "1px solid #334155", borderRadius: "6px", color: "#fff" },
  checkGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", background: "#0f172a", padding: "10px", borderRadius: "8px" },
  checkItem: { fontSize: "0.8rem", color: "#cbd5e1", cursor: "pointer" },
  submitBtn: { width: "100%", padding: "12px", background: "#fbbf24", color: "#000", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", marginTop: "20px" }
};