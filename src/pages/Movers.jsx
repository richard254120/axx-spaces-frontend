import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

export default function Movers() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // 1. NAVIGATION & UI STATE
  const [activeTab, setActiveTab] = useState("search"); 
  const [loading, setLoading] = useState(false);
  const [selectedCounty, setSelectedCounty] = useState("");
  const [movers, setMovers] = useState([]);

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

  // 2. FORM STATES
  const [registerData, setRegisterData] = useState({
    name: "", email: "", password: "", phone: "", county: "", 
    experience: "", vehicleType: "Pickup", services: []
  });

  const [loginData, setLoginData] = useState({ email: "", password: "" });

  // 3. SEARCH LOGIC
  useEffect(() => {
    if (!selectedCounty || activeTab !== "search") return;
    const fetchMovers = async () => {
      setLoading(true);
      try {
        // Hits the GET /api/movers endpoint we created in moverController
        const res = await API.get(`/movers?county=${selectedCounty}`);
        setMovers(res.data || []);
      } catch (err) { 
        setMovers([]); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchMovers();
  }, [selectedCounty, activeTab]);

  // 4. HANDLERS
  const handleServiceToggle = (service) => {
    setRegisterData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const onRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ FIXED: Using the standard /auth/register endpoint with role: "mover"
      await API.post("/auth/register", { 
        ...registerData, 
        role: "mover" 
      });
      alert("✅ Application Submitted! Once Admin approves your business, you can log in.");
      setActiveTab("login");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed. Check your details.";
      alert(`❌ ${errorMsg}`);
    } finally { 
      setLoading(false); 
    }
  };
const onLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", loginData);
      
      if (res.data.user.role !== "mover") {
        alert("❌ This portal is for Mover accounts only.");
        return;
      }

      // ✅ Ensure this passes BOTH token and the user object
      login(res.data.token, res.data.user); 
      
      // Navigate specifically to mover dashboard
      navigate("/mover-dashboard");
    } catch (err) {
      alert("❌ Invalid credentials.");
    } finally { 
      setLoading(false); 
    }
  };
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🚚 Axx Movers</h1>
        <p style={styles.subtitle}>Kenya's Verified Relocation Network</p>
      </div>

      <div style={styles.tabBar}>
        <button style={activeTab === "search" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("search")}>🔍 Find Mover</button>
        <button style={activeTab === "register" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("register")}>📝 Join Us</button>
        <button style={activeTab === "login" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("login")}>🔑 Mover Login</button>
      </div>

      {activeTab === "search" && (
        <div style={styles.viewContainer}>
          <select value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)} style={styles.select}>
            <option value="">-- Select Your County --</option>
            {counties.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {loading ? <p style={styles.centerText}>Searching database...</p> : (
            <div style={styles.grid}>
              {movers.length > 0 ? movers.map(m => (
                <div key={m._id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.moverName}>{m.name}</h3>
                  </div>
                  <p style={styles.detail}>📍 {m.county} • ⭐ {m.experience || m.experienceYears} yrs exp</p>
                  <p style={styles.detail}>🚛 {m.vehicleType}</p>
                  <div style={styles.tagContainer}>
                    {m.services.map(s => <span key={s} style={styles.miniTag}>{s}</span>)}
                  </div>
                  <button onClick={() => window.open(`https://wa.me/${m.phone}`, "_blank")} style={styles.whatsappBtn}>Contact Now</button>
                </div>
              )) : selectedCounty && <p style={styles.centerText}>No approved movers in {selectedCounty} yet.</p>}
            </div>
          )}
        </div>
      )}

      {activeTab === "register" && (
        <div style={styles.formCard}>
          <form onSubmit={onRegister}>
            <h2 style={styles.formTitle}>Mover Onboarding</h2>
            <div style={styles.formGrid}>
              <input required placeholder="Business/Full Name" style={styles.input} value={registerData.name} onChange={e => setRegisterData({...registerData, name: e.target.value})} />
              <input required type="email" placeholder="Email Address" style={styles.input} value={registerData.email} onChange={e => setRegisterData({...registerData, email: e.target.value})} />
            </div>
            <div style={styles.formGrid}>
              <input required type="password" placeholder="Create Password" style={styles.input} value={registerData.password} onChange={e => setRegisterData({...registerData, password: e.target.value})} />
              <input required placeholder="WhatsApp Phone" style={styles.input} value={registerData.phone} onChange={e => setRegisterData({...registerData, phone: e.target.value})} />
            </div>
            <div style={styles.formGrid}>
              <select required style={styles.input} value={registerData.county} onChange={e => setRegisterData({...registerData, county: e.target.value})}>
                <option value="">Select County</option>
                {counties.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" placeholder="Experience (Yrs)" style={styles.input} value={registerData.experience} onChange={e => setRegisterData({...registerData, experience: e.target.value})} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Services Provided:</label>
              <div style={styles.checkGrid}>
                {availableServices.map(s => (
                  <label key={s} style={styles.checkItem}>
                    <input type="checkbox" checked={registerData.services.includes(s)} onChange={() => handleServiceToggle(s)} /> {s}
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading} style={styles.submitBtn}>{loading ? "Processing..." : "Submit Application"}</button>
          </form>
        </div>
      )}

      {activeTab === "login" && (
        <div style={styles.loginSmallCard}>
          <form onSubmit={onLogin}>
            <h2 style={styles.formTitle}>Mover Portal</h2>
            <input required type="email" placeholder="Email" style={styles.input} value={loginData.email} onChange={e => setLoginData({...loginData, email: e.target.value})} />
            <input required type="password" placeholder="Password" style={styles.input} value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} />
            <button type="submit" disabled={loading} style={styles.submitBtn}>{loading ? "Verifying..." : "Access Dashboard"}</button>
            <p style={styles.switchText} onClick={() => setActiveTab("register")}>New here? Register your business</p>
          </form>
        </div>
      )}
    </div>
  );
}

// ... styles remain exactly the same as you provided ...
const styles = {
    container: { background: "#06101f", minHeight: "100vh", padding: "120px 20px 60px", color: "#f1f5f9", fontFamily: "'DM Sans', sans-serif" },
    header: { textAlign: "center", marginBottom: "40px" },
    title: { fontSize: "2.5rem", color: "#fbbf24", margin: 0 },
    subtitle: { color: "#94a3b8", marginTop: "10px" },
    tabBar: { display: "flex", justifyContent: "center", gap: "10px", marginBottom: "40px" },
    tab: { padding: "10px 20px", background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", borderRadius: "20px", cursor: "pointer", transition: "0.3s" },
    activeTab: { padding: "10px 20px", background: "#fbbf24", color: "#000", border: "none", borderRadius: "20px", fontWeight: "bold" },
    
    viewContainer: { maxWidth: "1200px", margin: "0 auto" },
    select: { display: "block", width: "100%", maxWidth: "400px", margin: "0 auto 40px", padding: "15px", background: "#1e293b", color: "#fff", border: "1px solid #334155", borderRadius: "12px" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "25px" },
    card: { background: "#111827", padding: "25px", borderRadius: "20px", border: "1px solid #1f2937" },
    cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" },
    moverName: { color: "#fbbf24", margin: 0, fontSize: "1.3rem" },
    insBadge: { background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: "bold" },
    detail: { color: "#94a3b8", margin: "5px 0", fontSize: "0.9rem" },
    tagContainer: { display: "flex", flexWrap: "wrap", gap: "6px", margin: "15px 0" },
    miniTag: { background: "#1e293b", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", color: "#cbd5e1" },
    whatsappBtn: { width: "100%", padding: "12px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" },
  
    formCard: { maxWidth: "700px", margin: "0 auto", background: "#1e293b", padding: "40px", borderRadius: "25px", border: "1px solid #334155" },
    loginSmallCard: { maxWidth: "400px", margin: "0 auto", background: "#1e293b", padding: "40px", borderRadius: "25px", border: "1px solid #334155" },
    formTitle: { color: "#fbbf24", textAlign: "center", marginBottom: "30px" },
    formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" },
    input: { width: "100%", padding: "12px", background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#fff", boxSizing: "border-box", marginBottom: "15px" },
    label: { fontSize: "0.9rem", color: "#94a3b8", marginBottom: "10px", display: "block" },
    checkGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", background: "#0f172a", padding: "15px", borderRadius: "10px" },
    checkItem: { fontSize: "0.8rem", color: "#cbd5e1", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },
    submitBtn: { width: "100%", padding: "14px", background: "#fbbf24", color: "#000", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", fontSize: "1rem" },
    switchText: { textAlign: "center", color: "#3b82f6", marginTop: "20px", cursor: "pointer", fontSize: "0.9rem" },
    centerText: { textAlign: "center", color: "#94a3b8", marginTop: "40px" }
  };