import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.jpeg";
import iconImage from "../assets/image.png";   // ← Your custom icon

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
        <div style={styles.logoContainer}>
          <img src={iconImage} alt="Axx Icon" style={styles.heroIcon} />
          <img src={logo} alt="Axx Spaces Logo" style={styles.logo} />
        </div>

        <h1 style={styles.title}>
          Find Affordable & Verified Homes in Kenya
        </h1>

        <p style={styles.subtitle}>
          Trusted rental platform connecting landlords and tenants across all counties
        </p>

        {/* Search Box */}
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

      {/* TRUST SECTION */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Why Renters Trust Axx Spaces</h2>
        <div style={styles.grid}>
          <div style={{ ...styles.card, ...styles.cardRed }}>
            <div style={styles.icon}>🔐</div>
            <h3>Verified Listings</h3>
            <p>Every property is reviewed before approval</p>
          </div>
          <div style={{ ...styles.card, ...styles.cardBlue }}>
            <div style={styles.icon}>🧾</div>
            <h3>No Fake Ads</h3>
            <p>We filter scams and fake landlords</p>
          </div>
          <div style={{ ...styles.card, ...styles.cardYellow }}>
            <div style={styles.icon}>📞</div>
            <h3>Direct Contact</h3>
            <p>Talk directly to landlords</p>
          </div>
          <div style={{ ...styles.card, ...styles.cardGreen }}>
            <div style={styles.icon}>⚡</div>
            <h3>Fast Updates</h3>
            <p>New listings appear instantly</p>
          </div>
        </div>
      </div>

      {/* STATS SECTION */}
      <div style={styles.statsSection}>
        <div style={styles.statsGrid}>
          <div style={styles.stat}>
            <div style={{ ...styles.statNumber, color: "#f87171" }}>5,200+</div>
            <div style={styles.statLabel}>Properties Listed</div>
          </div>
          <div style={styles.stat}>
            <div style={{ ...styles.statNumber, color: "#facc15" }}>47</div>
            <div style={styles.statLabel}>Counties Covered</div>
          </div>
          <div style={styles.stat}>
            <div style={{ ...styles.statNumber, color: "#4ade80" }}>98%</div>
            <div style={styles.statLabel}>Satisfied Tenants</div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>How Axx Spaces Works</h2>
        <div style={styles.steps}>
          <div style={{ ...styles.step, borderTop: "4px solid #ef4444" }}>
            <div style={{ ...styles.stepNum, color: "#ef4444" }}>1</div>
            <h3>Browse & Search</h3>
            <p>Find verified homes in your preferred county and area</p>
          </div>
          <div style={{ ...styles.step, borderTop: "4px solid #3b82f6" }}>
            <div style={{ ...styles.stepNum, color: "#3b82f6" }}>2</div>
            <h3>Contact Directly</h3>
            <p>Chat with landlords via WhatsApp or call</p>
          </div>
          <div style={{ ...styles.step, borderTop: "4px solid #22c55e" }}>
            <div style={{ ...styles.stepNum, color: "#22c55e" }}>3</div>
            <h3>Move In</h3>
            <p>Visit, pay deposit and secure your new home</p>
          </div>
        </div>
      </div>

      {/* LANDLORD CTA */}
      <div style={styles.cta}>
        <h2>Are you a landlord?</h2>
        <p>List your property and reach thousands of serious tenants</p>
        <button className="home-btn" onClick={() => navigate("/upload")}>
          📝 Upload Your Property Now
        </button>
      </div>
    </div>
  );
}

/* ==================== STYLES ==================== */
const styles = {
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#06101f",
    color: "#e2e8f0",
    minHeight: "100vh",
  },

  /* HERO — sweeping diagonal: deep navy → red → blue → green → yellow → dark */
  hero: {
    padding: "80px 20px 100px",
    textAlign: "center",
    background: `
      linear-gradient(135deg,
        #0a0e27 0%,
        #3b0a0a 12%,
        #7f1d1d 22%,
        #1e3a8a 36%,
        #0f2f6f 48%,
        #14532d 62%,
        #065f46 72%,
        #78350f 84%,
        #0a0e27 100%
      )
    `,
    minHeight: "75vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },

  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
  },

  logo: {
    width: "100px",
    height: "100px",
    objectFit: "contain",
    borderRadius: "20px",
    boxShadow: "0 0 40px rgba(239,68,68,0.4)",
  },

  heroIcon: {
    width: "52px",
    height: "52px",
    objectFit: "contain",
  },

  title: {
    fontSize: "clamp(32px, 6vw, 52px)",
    fontWeight: 800,
    color: "white",
    margin: "0 0 16px",
    lineHeight: 1.2,
  },

  subtitle: {
    color: "#94a3b8",
    marginBottom: "40px",
    fontSize: "18px",
    maxWidth: "600px",
  },

  searchBox: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    flexWrap: "wrap",
    maxWidth: "950px",
  },

  input: {
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#e2e8f0",
    width: "170px",
    fontSize: "15px",
    outline: "none",
    transition: "all 0.3s ease",
    fontFamily: "inherit",
  },

  section: {
    padding: "70px 20px",
    textAlign: "center",
    maxWidth: "1100px",
    margin: "0 auto",
  },

  sectionTitle: {
    fontSize: "clamp(26px, 4vw, 38px)",
    fontWeight: 800,
    color: "#f1f5f9",
    marginBottom: "50px",
  },

  grid: {
    display: "flex",
    justifyContent: "center",
    gap: "24px",
    flexWrap: "wrap",
  },

  card: {
    padding: "28px 20px",
    borderRadius: "16px",
    width: "240px",
    transition: "all 0.4s ease",
  },

  /* Each trust card gets its own vivid color band */
  cardRed: {
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.35)",
  },
  cardBlue: {
    background: "rgba(59,130,246,0.12)",
    border: "1px solid rgba(59,130,246,0.35)",
  },
  cardYellow: {
    background: "rgba(250,204,21,0.10)",
    border: "1px solid rgba(250,204,21,0.35)",
  },
  cardGreen: {
    background: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.35)",
  },

  icon: {
    fontSize: "38px",
    marginBottom: "16px",
  },

  /* STATS — four-colour diagonal sweep */
  statsSection: {
    background: `
      linear-gradient(160deg,
        #1a0808 0%,
        #7f1d1d 15%,
        #1e3a8a 35%,
        #0f2f6f 50%,
        #14532d 68%,
        #78350f 83%,
        #1a0808 100%
      )
    `,
    padding: "80px 20px",
  },

  statsGrid: {
    display: "flex",
    justifyContent: "center",
    gap: "80px",
    flexWrap: "wrap",
  },

  stat: {
    textAlign: "center",
  },

  statNumber: {
    fontSize: "48px",
    fontWeight: "900",
    marginBottom: "8px",
  },

  statLabel: {
    color: "#cbd5e1",
    fontSize: "15px",
  },

  steps: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "30px",
  },

  step: {
    background: "rgba(255,255,255,0.03)",
    padding: "40px 24px",
    borderRadius: "16px",
    textAlign: "center",
    transition: "transform 0.3s ease",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  stepNum: {
    fontSize: "52px",
    fontWeight: "900",
    marginBottom: "16px",
  },

  /* CTA — four-colour sweep ending dark */
  cta: {
    padding: "80px 20px",
    textAlign: "center",
    background: `
      linear-gradient(160deg,
        #3b0a0a 0%,
        #7f1d1d 15%,
        #1e3a8a 32%,
        #14532d 52%,
        #78350f 70%,
        #facc15 80%,
        #78350f 90%,
        #0a0e27 100%
      )
    `,
    borderTop: "1px solid rgba(239,68,68,0.2)",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');

  /* Search button: red → yellow gradient */
  .search-btn {
    padding: 14px 32px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #dc2626, #f59e0b);
    color: white;
    font-weight: 700;
    font-size: 16px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(220,38,38,0.45);
  }

  .search-btn:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 12px 35px rgba(245,158,11,0.6);
  }

  /* CTA button: green → blue gradient */
  .home-btn:not(.search-btn) {
    padding: 14px 32px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #16a34a, #2563eb);
    color: white;
    font-weight: 700;
    font-size: 16px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(22,163,74,0.45);
  }

  .home-btn:not(.search-btn):hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 12px 35px rgba(37,99,235,0.6);
  }

  .search-input {
    transition: all 0.3s ease;
  }

  .search-input:focus {
    border-color: #facc15;
    box-shadow: 0 0 0 4px rgba(250,204,21,0.2);
    transform: scale(1.03);
  }

  input:focus, select:focus {
    border-color: #facc15;
    box-shadow: 0 0 0 3px rgba(250,204,21,0.15);
  }

  select option {
    background: #0d1b2e;
  }

  /* Card hover — glow matches card border colour */
  div[style*="rgba(239,68,68"]:hover {
    transform: translateY(-10px);
    border-color: rgba(239,68,68,0.7) !important;
    box-shadow: 0 8px 30px rgba(239,68,68,0.25);
  }

  div[style*="rgba(59,130,246"]:hover {
    transform: translateY(-10px);
    border-color: rgba(59,130,246,0.7) !important;
    box-shadow: 0 8px 30px rgba(59,130,246,0.25);
  }

  div[style*="rgba(250,204,21"]:hover {
    transform: translateY(-10px);
    border-color: rgba(250,204,21,0.7) !important;
    box-shadow: 0 8px 30px rgba(250,204,21,0.2);
  }

  div[style*="rgba(34,197,94"]:hover {
    transform: translateY(-10px);
    border-color: rgba(34,197,94,0.7) !important;
    box-shadow: 0 8px 30px rgba(34,197,94,0.2);
  }

  .step:hover {
    transform: translateY(-6px);
  }
`;