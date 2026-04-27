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

      {/* ================== NAVIGATION BAR WITH LOGO ================== */}
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          <div style={styles.logoNav}>
            <img src={logo} alt="Axx Spaces" style={styles.logoSmall} />
            <span style={styles.brandName}>AXX SPACES</span>
          </div>

          <div style={styles.navLinks}>
            <button style={styles.navLink} onClick={() => navigate("/listings")}>Listings</button>
            <button style={styles.navLink} onClick={() => navigate("/upload")}>List Property</button>
            <button style={styles.navLink} onClick={() => navigate("/dashboard")}>My Dashboard</button>
          </div>

          <div>
            <button style={styles.loginBtn} onClick={() => navigate("/login")}>Login</button>
            <button style={styles.registerBtn} onClick={() => navigate("/register")}>Register</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={styles.hero}>
        <img src={logo} alt="Axx Spaces Logo" style={styles.logo} />

        <h1 style={styles.title}>
          Find Affordable & Verified Homes in Kenya 🏠
        </h1>

        <p style={styles.subtitle}>
          Trusted rental platform connecting landlords and tenants across all counties
        </p>

        {/* Your Original Search Box with Animations */}
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

      {/* ── TRUST SECTION (Your Original) ── */}
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

      {/* ── POPULAR AREAS ── */}
      <div style={styles.popularSection}>
        <h2 style={styles.sectionTitle}>Popular Areas Right Now</h2>
        <div style={styles.chips}>
          {["Nairobi", "Mombasa", "Kisumu", "Eldoret", "Nakuru", "Meru", "Kilimani", "Westlands", "Nyali"].map((area) => (
            <button 
              key={area} 
              style={styles.chip}
              onClick={() => navigate(`/listings?area=${area}`)}
              className="area-chip"
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* ── LANDLORD CTA (Your Original) ── */}
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

/* ══════════════════════════════════════════════════════════════════
   STYLES WITH SEARCH ANIMATIONS
══════════════════════════════════════════════════════════════════ */
const styles = {
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#06101f",
    color: "#e2e8f0",
    minHeight: "100vh",
  },

  navbar: {
    background: "linear-gradient(135deg, #0a1f44, #1e40af)",
    padding: "16px 20px",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  navContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "16px",
  },
  logoNav: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoSmall: {
    width: "48px",
    height: "48px",
    objectFit: "contain",
    borderRadius: "12px",
  },
  brandName: {
    fontSize: "24px",
    fontWeight: "900",
    color: "#60a5fa",
    letterSpacing: "-1px",
  },
  navLinks: {
    display: "flex",
    gap: "20px",
  },
  navLink: {
    background: "none",
    border: "none",
    color: "#cbd5e1",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    padding: "8px 16px",
  },
  loginBtn: {
    padding: "10px 20px",
    background: "transparent",
    color: "#93c5fd",
    border: "2px solid #60a5fa",
    borderRadius: "8px",
    marginRight: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },
  registerBtn: {
    padding: "10px 20px",
    background: "#0a84ff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  hero: {
    padding: "100px 20px 120px",
    textAlign: "center",
    background: "linear-gradient(to bottom, #0a1f44, #000)",
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: "110px",
    height: "110px",
    objectFit: "contain",
    marginBottom: "24px",
    borderRadius: "24px",
    boxShadow: "0 0 50px rgba(59,130,246,0.4)",
  },

  title: {
    fontSize: "clamp(32px,6vw,52px)",
    fontWeight: 800,
    color: "white",
    margin: "0 0 16px",
    lineHeight: 1.1,
  },

  subtitle: {
    color: "#94a3b8",
    marginBottom: "40px",
    fontSize: "18px",
    maxWidth: "620px",
  },

  searchBox: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    flexWrap: "wrap",
    maxWidth: "920px",
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
  },

  section: {
    padding: "70px 20px",
    textAlign: "center",
    maxWidth: "1100px",
    margin: "0 auto",
  },

  sectionTitle: {
    fontSize: "clamp(26px,4vw,36px)",
    fontWeight: 800,
    color: "#f1f5f9",
    marginBottom: "40px",
  },

  grid: {
    display: "flex",
    justifyContent: "center",
    gap: "24px",
    flexWrap: "wrap",
  },

  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "28px 20px",
    borderRadius: "16px",
    width: "240px",
    transition: "all 0.3s",
  },

  icon: {
    fontSize: "38px",
    marginBottom: "16px",
  },

  popularSection: {
    background: "#0a1729",
    padding: "70px 20px",
    textAlign: "center",
  },
  chips: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "20px",
  },
  chip: {
    padding: "10px 22px",
    background: "#1e40af",
    color: "white",
    border: "none",
    borderRadius: "999px",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  cta: {
    padding: "80px 20px",
    textAlign: "center",
    background: "linear-gradient(160deg,#0c1d42,#060e1c)",
    color: "white",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');

  .home-btn, .search-btn {
    padding: 14px 32px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg,#1d4ed8,#3b82f6);
    color: white;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(59,130,246,0.4);
  }

  .home-btn:hover, .search-btn:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 12px 35px rgba(59,130,246,0.6);
  }

  .search-input {
    transition: all 0.3s ease;
  }

  .search-input:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.25);
    transform: scale(1.03);
  }

  .area-chip {
    transition: all 0.3s ease;
  }

  .area-chip:hover {
    transform: translateY(-4px) scale(1.08);
    background: #3b82f6;
    box-shadow: 0 8px 25px rgba(59,130,246,0.5);
  }

  input:focus, select:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96,165,250,0.2);
  }
`;