import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo.jpeg";

export default function Home() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  
  const [searchForm, setSearchForm] = useState({
    county: "",
    area: "",
    type: "",
    price: "",
    bedrooms: "",
  });

  const counties = [
    "Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita Taveta",
    "Garissa","Wajir","Mandera","Marsabit",
    "Isiolo","Meru","Tharaka Nithi","Embu","Kitui",
    "Machakos","Makueni","Nyandarua","Nyeri","Kirinyaga",
    "Murang'a","Kiambu","Turkana","West Pokot","Samburu",
    "Trans Nzoia","Uasin Gishu","Elgeyo Marakwet","Nandi","Baringo",
    "Laikipia","Nakuru","Narok","Kajiado","Kericho","Bomet",
    "Kakamega","Vihiga","Bungoma","Busia",
    "Siaya","Kisumu","Homa Bay","Migori","Kisii","Nyamira",
    "Nairobi City"
  ];

  const types = [
    "Bedsitter","Studio Apartment","1 Bedroom","2 Bedroom",
    "3 Bedroom","4+ Bedroom","Maisonette","Bungalow",
    "Townhouse","Apartment Block"
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchForm.county) params.append("county", searchForm.county);
    if (searchForm.area) params.append("area", searchForm.area);
    if (searchForm.type) params.append("type", searchForm.type);
    if (searchForm.price) params.append("price", searchForm.price);
    if (searchForm.bedrooms) params.append("bedrooms", searchForm.bedrooms);
    navigate(`/listings?${params.toString()}`);
  };

  const handleListProperty = () => {
    if (!token) {
      navigate("/login");
      return;
    }
    navigate("/upload");
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* HERO SECTION */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.logoContainer}>
            <img src={logo} alt="Logo" style={styles.heroLogo} />
          </div>
          
          <h1 style={styles.heroTitle}>
            Find Your Dream Home in Kenya
          </h1>
          <p style={styles.heroSubtitle}>
            Discover verified rental properties across all 47 counties
          </p>

          {/* SEARCH FORM */}
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <div style={styles.searchGrid}>
              <select
                style={styles.searchInput}
                value={searchForm.county}
                onChange={(e) => setSearchForm({...searchForm, county: e.target.value})}
              >
                <option value="">📍 County</option>
                {counties.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <input
                type="text"
                placeholder="🏘 Area/Estate"
                style={styles.searchInput}
                value={searchForm.area}
                onChange={(e) => setSearchForm({...searchForm, area: e.target.value})}
              />

              <select
                style={styles.searchInput}
                value={searchForm.type}
                onChange={(e) => setSearchForm({...searchForm, type: e.target.value})}
              >
                <option value="">🏗 Property Type</option>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <input
                type="number"
                placeholder="💰 Max Price"
                style={styles.searchInput}
                value={searchForm.price}
                onChange={(e) => setSearchForm({...searchForm, price: e.target.value})}
              />

              <input
                type="number"
                placeholder="🛏 Bedrooms"
                style={styles.searchInput}
                value={searchForm.bedrooms}
                onChange={(e) => setSearchForm({...searchForm, bedrooms: e.target.value})}
              />

              <button type="submit" style={styles.searchBtn}>
                🔍 Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* STATS SECTION */}
      <section style={styles.stats}>
        <div style={styles.statsContent}>
          <div style={styles.statCard}>
            <div style={{...styles.statNumber, color: "#fbbf24"}}>47</div>
            <div style={styles.statLabel}>Counties</div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statNumber, color: "#ef4444"}}>10K+</div>
            <div style={styles.statLabel}>Verified Listings</div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statNumber, color: "#22c55e"}}>5K+</div>
            <div style={styles.statLabel}>Happy Tenants</div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statNumber, color: "#1f2937"}}>24/7</div>
            <div style={styles.statLabel}>Support</div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section style={styles.features}>
        <h2 style={styles.sectionTitle}>Why Choose Axx Spaces?</h2>
        
        <div style={styles.featureGrid}>
          <div style={{...styles.featureCard, borderTop: "4px solid #fbbf24"}}>
            <div style={styles.featureIcon}>✓</div>
            <h3 style={styles.featureTitle}>Verified Properties</h3>
            <p style={styles.featureText}>All listings are manually verified to ensure accuracy and legitimacy</p>
          </div>

          <div style={{...styles.featureCard, borderTop: "4px solid #ef4444"}}>
            <div style={styles.featureIcon}>💬</div>
            <h3 style={styles.featureTitle}>Direct Contact</h3>
            <p style={styles.featureText}>Chat with landlords via WhatsApp instantly</p>
          </div>

          <div style={{...styles.featureCard, borderTop: "4px solid #22c55e"}}>
            <div style={styles.featureIcon}>🔒</div>
            <h3 style={styles.featureTitle}>Safe & Secure</h3>
            <p style={styles.featureText}>Your data is protected with industry-standard encryption</p>
          </div>

          <div style={{...styles.featureCard, borderTop: "4px solid #1f2937"}}>
            <div style={styles.featureIcon}>📱</div>
            <h3 style={styles.featureTitle}>Mobile Friendly</h3>
            <p style={styles.featureText}>Search and find properties on the go</p>
          </div>

          <div style={{...styles.featureCard, borderTop: "4px solid #fbbf24"}}>
            <div style={styles.featureIcon}>🗺</div>
            <h3 style={styles.featureTitle}>Location Maps</h3>
            <p style={styles.featureText}>View exact location of properties on interactive maps</p>
          </div>

          <div style={{...styles.featureCard, borderTop: "4px solid #ef4444"}}>
            <div style={styles.featureIcon}>💰</div>
            <h3 style={styles.featureTitle}>No Hidden Fees</h3>
            <p style={styles.featureText}>Transparent pricing with no surprise charges</p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to Find Your Home?</h2>
        <p style={styles.ctaText}>Browse thousands of listings or list your property today</p>
        <div style={styles.ctaButtons}>
          <button 
            style={styles.ctaBtnPrimary}
            onClick={() => navigate("/listings")}
          >
            🔍 Browse Listings
          </button>
          
          <button 
            style={{
              ...styles.ctaBtnSecondary,
              background: token ? "#22c55e" : "white",
              color: token ? "white" : "#1f2937",
              border: token ? "none" : "2px solid #1f2937"
            }}
            onClick={handleListProperty}
            title={token ? "Upload your property" : "Login to list your property"}
          >
            {token ? "📝 Upload Your Property" : "🔐 Login to List Property"}
          </button>
        </div>
        {!token && (
          <p style={styles.loginHint}>
            💡 Create an account to start listing properties
          </p>
        )}
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>© 2024 Axx Spaces. All rights reserved.</p>
      </footer>
    </div>
  );
}

const styles = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#f8f4f0",
    color: "#1f2937",
    minHeight: "100vh",
  },

  hero: {
    background: "linear-gradient(135deg, #ffffff 0%, #fef3e2 50%, #fef9e7 100%)",
    padding: "60px 20px",
    textAlign: "center",
    borderBottom: "3px solid #fbbf24",
  },

  heroContent: {
    maxWidth: "900px",
    margin: "0 auto",
  },

  logoContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "20px",
  },

  heroLogo: {
    height: "100px",
    width: "auto",
  },

  heroTitle: {
    fontSize: "clamp(32px, 6vw, 52px)",
    fontWeight: 800,
    color: "#1f2937",
    margin: "0 0 12px",
    letterSpacing: "-1px",
  },

  heroSubtitle: {
    fontSize: "18px",
    color: "#6b7280",
    margin: "0 0 32px",
    maxWidth: "600px",
    marginLeft: "auto",
    marginRight: "auto",
  },

  searchForm: {
    marginTop: "40px",
  },

  searchGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
    maxWidth: "900px",
    margin: "0 auto",
  },

  searchInput: {
    padding: "12px 14px",
    border: "2px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
    transition: "all 0.2s",
    background: "white",
  },

  searchBtn: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
  },

  stats: {
    background: "#1f2937",
    padding: "60px 20px",
    color: "white",
  },

  statsContent: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "24px",
    maxWidth: "900px",
    margin: "0 auto",
  },

  statCard: {
    textAlign: "center",
  },

  statNumber: {
    fontSize: "36px",
    fontWeight: 800,
    marginBottom: "8px",
  },

  statLabel: {
    fontSize: "14px",
    color: "#d1d5db",
  },

  features: {
    padding: "80px 20px",
    background: "white",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  sectionTitle: {
    fontSize: "36px",
    fontWeight: 800,
    color: "#1f2937",
    textAlign: "center",
    marginBottom: "60px",
  },

  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "28px",
  },

  featureCard: {
    padding: "28px",
    background: "#f9fafb",
    borderRadius: "12px",
    textAlign: "center",
    transition: "all 0.2s",
    border: "1px solid #e5e7eb",
  },

  featureIcon: {
    fontSize: "36px",
    marginBottom: "16px",
  },

  featureTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1f2937",
    margin: "0 0 12px",
  },

  featureText: {
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: 1.6,
    margin: 0,
  },

  cta: {
    background: "linear-gradient(135deg, #fbbf24 0%, #fcd34d 100%)",
    padding: "80px 20px",
    textAlign: "center",
    borderTop: "3px solid #f59e0b",
  },

  ctaTitle: {
    fontSize: "36px",
    fontWeight: 800,
    color: "#1f2937",
    margin: "0 0 12px",
  },

  ctaText: {
    fontSize: "18px",
    color: "#6b7280",
    margin: "0 0 32px",
  },

  ctaButtons: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  ctaBtnPrimary: {
    padding: "14px 32px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
  },

  ctaBtnSecondary: {
    padding: "14px 32px",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  },

  loginHint: {
    fontSize: "14px",
    color: "#6b7280",
    marginTop: "16px",
    fontStyle: "italic",
  },

  footer: {
    background: "#1f2937",
    color: "#d1d5db",
    padding: "20px",
    textAlign: "center",
    fontSize: "14px",
  },

  footerText: {
    margin: 0,
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');

  select {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 8px center;
    background-size: 18px;
    padding-right: 32px;
  }

  input:focus, select:focus {
    outline: none;
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  button:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  .featureCard:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;