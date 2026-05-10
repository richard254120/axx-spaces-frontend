import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Movers() {
  const navigate = useNavigate();

  // New state for tabs: 'search' | 'login' | 'register'
  const [activeTab, setActiveTab] = useState("search");
  
  const [selectedCounty, setSelectedCounty] = useState("");
  const [movers, setMovers] = useState([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (!selectedCounty || activeTab !== "search") {
      setMovers([]);
      return;
    }

    const fetchMovers = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/movers?county=${selectedCounty}`);
        setMovers(res.data || []);
      } catch (err) {
        console.error(err);
        setMovers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovers();
  }, [selectedCounty, activeTab]);

  const handleContact = (mover) => {
    const message = `Hello ${mover.name}, I need moving services in ${selectedCounty}. Please contact me.`;
    window.open(`https://wa.me/${mover.phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <h1 style={styles.title}>🚚 Movers Hub</h1>
        <p style={styles.subtitle}>Find a service or manage your mover profile</p>
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabContainer}>
        <button 
          style={activeTab === "search" ? styles.activeTab : styles.tab} 
          onClick={() => setActiveTab("search")}
        >
          Find Movers
        </button>
        <button 
          style={activeTab === "login" ? styles.activeTab : styles.tab} 
          onClick={() => setActiveTab("login")}
        >
          Mover Login
        </button>
        <button 
          style={activeTab === "register" ? styles.activeTab : styles.tab} 
          onClick={() => setActiveTab("register")}
        >
          Register as Mover
        </button>
      </div>

      <hr style={styles.divider} />

      {/* Tab Content: FIND MOVERS */}
      {activeTab === "search" && (
        <>
          <div style={styles.filterSection}>
            <select 
              value={selectedCounty} 
              onChange={(e) => setSelectedCounty(e.target.value)}
              style={styles.select}
            >
              <option value="">-- Select County --</option>
              {counties.map((county) => (
                <option key={county} value={county}>{county}</option>
              ))}
            </select>
          </div>

          {loading && <p style={styles.loading}>Loading movers in {selectedCounty}...</p>}

          {!loading && selectedCounty && movers.length > 0 && (
            <div style={styles.moversGrid}>
              {movers.map((mover) => (
                <div key={mover._id} style={styles.moverCard}>
                  <h3 style={styles.moverName}>{mover.name}</h3>
                  <p style={styles.moverDetail}>📍 {mover.county}</p>
                  <p style={styles.moverDetail}>📞 {mover.phone}</p>
                  {mover.company && <p style={styles.moverDetail}>🏢 {mover.company}</p>}
                  {mover.services && <p style={styles.services}>{mover.services}</p>}
                  <button onClick={() => handleContact(mover)} style={styles.contactBtn}>
                    Contact via WhatsApp
                  </button>
                </div>
              ))}
            </div>
          )}

          {!loading && selectedCounty && movers.length === 0 && (
            <p style={styles.noResults}>No registered movers found in {selectedCounty} yet.</p>
          )}
        </>
      )}

      {/* Tab Content: LOGIN (Simplified UI) */}
      {activeTab === "login" && (
        <div style={styles.authContainer}>
          <h2>Welcome Back</h2>
          <input type="email" placeholder="Email Address" style={styles.input} />
          <input type="password" placeholder="Password" style={styles.input} />
          <button style={styles.contactBtn}>Login to Profile</button>
        </div>
      )}

      {/* Tab Content: REGISTER (Simplified UI) */}
      {activeTab === "register" && (
        <div style={styles.authContainer}>
          <h2>Join the Network</h2>
          <input type="text" placeholder="Full Name / Company" style={styles.input} />
          <input type="text" placeholder="Phone Number" style={styles.input} />
          <select style={styles.input}>
            <option>Select Primary County</option>
            {counties.map(c => <option key={c}>{c}</option>)}
          </select>
          <button style={styles.contactBtn}>Create Mover Account</button>
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
    color: "#f1f5f9",
    padding: "120px 20px 40px", // Increase the top padding (first value) to clear the navbar
    fontFamily: "'DM Sans', sans-serif"
  },
  header: { textAlign: "center", marginBottom: "30px" },
  title: { fontSize: "2.8rem", color: "#fbbf24", marginBottom: "8px" },
  subtitle: { color: "#94a3b8", fontSize: "1.2rem" },
  
  // Tab Styles
  tabContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "20px"
  },
  tab: {
    padding: "10px 20px",
    background: "transparent",
    color: "#94a3b8",
    border: "1px solid #334155",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "0.3s"
  },
  activeTab: {
    padding: "10px 20px",
    background: "#fbbf24",
    color: "#000",
    border: "1px solid #fbbf24",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  divider: { border: "0", height: "1px", background: "#334155", marginBottom: "30px" },

  filterSection: { maxWidth: "500px", margin: "0 auto 30px" },
  select: {
    width: "100%",
    padding: "16px",
    fontSize: "1.1rem",
    background: "#1e293b",
    border: "1px solid #475569",
    borderRadius: "10px",
    color: "white"
  },

  // Auth Section Styles
  authContainer: {
    maxWidth: "400px",
    margin: "0 auto",
    background: "#1e293b",
    padding: "30px",
    borderRadius: "15px",
    textAlign: "center"
  },
  input: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "1px solid #475569",
    background: "#0f172a",
    color: "white"
  },

  moversGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "25px",
    maxWidth: "1100px",
    margin: "0 auto"
  },
  moverCard: {
    background: "#1e293b",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #334155"
  },
  moverName: { fontSize: "1.4rem", color: "#60a5fa", marginBottom: "12px" },
  moverDetail: { color: "#94a3b8", margin: "6px 0" },
  services: { color: "#cbd5e1", margin: "12px 0", fontStyle: "italic" },
  contactBtn: {
    marginTop: "16px",
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: 700,
    cursor: "pointer"
  },

  noResults: { textAlign: "center", color: "#94a3b8", fontSize: "1.2rem", padding: "60px" },
  backBtn: {
    display: "block",
    margin: "50px auto 0",
    padding: "12px 32px",
    background: "#334155",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }
};