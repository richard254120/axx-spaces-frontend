import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.jpeg";

export default function Home() {
  const navigate = useNavigate();

  const [searchData, setSearchData] = useState({
    location: "",
    area: "",
    price: "",
    type: "",
    bedrooms: ""
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

  const propertyTypes = [
    "Bedsitter","Studio Apartment","1 Bedroom","2 Bedroom",
    "3 Bedroom","4+ Bedroom","Maisonette","Bungalow",
    "Townhouse","Apartment Block","Single Room","Shared Room",
    "Hostel Room","Commercial Office","Shop / Retail Space",
    "Warehouse","Plot / Land","Furnished Apartment",
    "Unfurnished Apartment"
  ];

  const handleSearch = () => {
    const query = new URLSearchParams();
    if (searchData.location) query.append("county", searchData.location);
    if (searchData.area) query.append("area", searchData.area);
    if (searchData.price) query.append("price", searchData.price);
    if (searchData.type) query.append("type", searchData.type);
    if (searchData.bedrooms) query.append("bedrooms", searchData.bedrooms);
    navigate(`/listings?${query.toString()}`);
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* HERO SECTION */}
      <div style={styles.hero}>
        <img src={logo} alt="Axx Spaces Logo" style={styles.logo} />

        <h1 style={styles.title}>
          Find Affordable & Verified Homes in Kenya 🏠
        </h1>

        <p style={styles.subtitle}>
          Trusted rental platform connecting landlords and tenants
        </p>

        {/* Your Original Search Box */}
        <div style={styles.searchBox}>
          <select
            style={styles.input}
            value={searchData.location}
            onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
            className="search-input"
          >
            <option value="">📍 Select County</option>
            {counties.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>

          <input
            placeholder="🏘 Area (e.g Kilimani)"
            style={styles.input}
            value={searchData.area}
            onChange={(e) => setSearchData({ ...searchData, area: e.target.value })}
            className="search-input"
          />

          <input
            placeholder="💵 Max Price"
            style={styles.input}
            value={searchData.price}
            onChange={(e) => setSearchData({ ...searchData, price: e.target.value })}
            className="search-input"
          />

          <select
            style={styles.input}
            value={searchData.type}
            onChange={(e) => setSearchData({ ...searchData, type: e.target.value })}
            className="search-input"
          >
            <option value="">🏗 Property Type</option>
            {propertyTypes.map((t, i) => (
              <option key={i} value={t}>{t}</option>
            ))}
          </select>

          <select
            style={styles.input}
            value={searchData.bedrooms}
            onChange={(e) => setSearchData({ ...searchData, bedrooms: e.target.value })}
            className="search-input"
          >
            <option value="">🛏 Bedrooms</option>
            <option value="1">1 Bedroom</option>
            <option value="2">2 Bedrooms</option>
            <option value="3">3 Bedrooms</option>
            <option value="4">4+ Bedrooms</option>
          </select>

          <button className="home-btn search-btn" onClick={handleSearch}>
            🔍 Search Homes
          </button>
        </div>
      </div>

      {/* TRUST SECTION - Your Original */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Why Renters Trust Axx Spaces</h2>
        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.icon}>🔐</div>
            <h3>Verified Listings</h3>
            <p>Every property is reviewed before approval</p>
          </div>
          <div style={styles.card}>
            <div style={styles.icon}>🧾</div>
            <h3>No Fake Ads</h3>
            <p>We filter scams and fake landlords</p>
          </div>
          <div style={styles.card}>
            <div style={styles.icon}>📞</div>
            <h3>Direct Contact</h3>
            <p>Talk directly to landlords</p>
          </div>
          <div style={styles.card}>
            <div style={styles.icon}>⚡</div>
            <h3>Fast Updates</h3>
            <p>New listings appear instantly</p>
          </div>
        </div>
      </div>

      {/* NEW: STATS SECTION */}
      <div style={styles.statsSection}>
        <div style={styles.statsGrid}>
          <div style={styles.stat}>
            <div style={styles.statNumber}>5,200+</div>
            <div style={styles.statLabel}>Properties Listed</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statNumber}>47</div>
            <div style={styles.statLabel}>Counties Covered</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statNumber}>98%</div>
            <div style={styles.statLabel}>Satisfied Tenants</div>
          </div>
        </div>
      </div>

      {/* NEW: HOW IT WORKS */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>How Axx Spaces Works</h2>
        <div style={styles.steps}>
          <div style={styles.step}>
            <div style={styles.stepNum}>1</div>
            <h3>Browse & Search</h3>
            <p>Find verified homes in your preferred county and area</p>
          </div>
          <div style={styles.step}>
            <div style={styles.stepNum}>2</div>
            <h3>Contact Directly</h3>
            <p>Chat with landlords via WhatsApp or call</p>
          </div>
          <div style={styles.step}>
            <div style={styles.stepNum}>3</div>
            <h3>Move In</h3>
            <p>Visit, pay deposit and secure your new home</p>
          </div>
        </div>
      </div>

      {/* LANDLORD CTA - Your Original */}
      <div style={styles.cta}>
        <h2>Are you a landlord?</h2>
        <p>Post your property and reach thousands of tenants</p>
        <button className="home-btn" onClick={() => navigate("/upload")}>
          📝 Upload Property
        </button>
      </div>
    </div>
  );
}

/* Styles + Animations */
const styles = {
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#06101f",
    color: "#e2e8f0",
    minHeight: "100vh",
  },

  hero: {
    padding: "60px 20px",
    textAlign: "center",
    background: "linear-gradient(to right, #0a1f44, #000)",
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: "90px",
    height: "90px",
    objectFit: "contain",
    marginBottom: "20px",
    borderRadius: "20px",
    boxShadow: "0 0 40px rgba(59,130,246,0.35)"
  },

  title: {
    fontSize: "clamp(28px,5vw,48px)",
    fontWeight: 800,
    color: "white",
    margin: "0 0 16px",
    lineHeight: 1.2,
  },

  subtitle: {
    color: "#94a3b8",
    marginBottom: "32px",
    fontSize: "16px",
    maxWidth: "550px",
  },

  searchBox: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    flexWrap: "wrap",
    maxWidth: "900px",
  },

  input: {
    padding: "11px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#e2e8f0",
    width: "160px",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
    transition: "all 0.3s ease",
  },

  section: {
    padding: "60px 20px",
    textAlign: "center",
    maxWidth: "1100px",
    margin: "0 auto",
  },

  sectionTitle: {
    fontSize: "clamp(22px,3vw,34px)",
    fontWeight: 800,
    color: "#f1f5f9",
    marginBottom: "40px",
  },

  grid: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
  },

  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    padding: "24px",
    borderRadius: "14px",
    width: "220px",
    color: "white",
    transition: "all 0.3s ease",
  },

  icon: {
    fontSize: "32px",
    marginBottom: "12px",
  },

  statsSection: {
    background: "#0a1729",
    padding: "60px 20px",
  },
  statsGrid: {
    display: "flex",
    justifyContent: "center",
    gap: "60px",
    flexWrap: "wrap",
  },
  stat: {
    textAlign: "center",
  },
  statNumber: {
    fontSize: "42px",
    fontWeight: "900",
    color: "#60a5fa",
  },
  statLabel: {
    color: "#94a3b8",
    marginTop: "8px",
  },

  steps: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "30px",
    marginTop: "40px",
  },
  step: {
    background: "rgba(255,255,255,0.03)",
    padding: "32px 24px",
    borderRadius: "16px",
    textAlign: "center",
  },
  stepNum: {
    fontSize: "48px",
    fontWeight: "900",
    color: "#60a5fa",
    marginBottom: "12px",
  },

  cta: {
    padding: "60px 20px",
    textAlign: "center",
    background: "linear-gradient(160deg,#0c1d42,#060e1c)",
    borderTop: "1px solid rgba(59,130,246,0.15)",
    color: "white",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');

  .home-btn, .search-btn {
    padding: 11px 28px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg,#1d4ed8,#6d28d9);
    color: white;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(59,130,246,0.35);
  }

  .home-btn:hover, .search-btn:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 10px 30px rgba(59,130,246,0.55);
  }

  .search-input {
    transition: all 0.3s ease;
  }

  .search-input:focus {
    border-color: rgba(59,130,246,0.6);
    box-shadow: 0 0 0 4px rgba(59,130,246,0.25);
    transform: scale(1.04);
  }

  .card {
    transition: all 0.3s ease;
  }

  .card:hover {
    transform: translateY(-8px);
    border-color: rgba(59,130,246,0.4);
  }

  input:focus, select:focus {
    border-color: rgba(59,130,246,0.5);
    box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
  }

  select option {
    background: #0d1b2e;
  }
`;