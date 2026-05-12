import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo.jpeg";
import API from "../api/api";

export default function Home() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [searchForm, setSearchForm] = useState({ county: "", type: "" });
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [errorFeatured, setErrorFeatured] = useState(false);

  const counties = [
    "Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita Taveta",
    "Garissa","Wajir","Mandera","Marsabit","Isiolo","Meru","Tharaka Nithi",
    "Embu","Kitui","Machakos","Makueni","Nyandarua","Nyeri","Kirinyaga",
    "Murang’a","Kiambu","Turkana","West Pokot","Samburu","Trans Nzoia",
    "Uasin Gishu","Elgeyo Marakwet","Nandi","Baringo","Laikipia","Nakuru",
    "Narok","Kajiado","Kericho","Bomet","Kakamega","Vihiga","Bungoma",
    "Busia","Siaya","Kisumu","Homa Bay","Migori","Kisii","Nyamira",
    "Nairobi City"
  ];

  const types = [
    "Bedsitter","Studio Apartment","1 Bedroom","2 Bedroom","3 Bedroom",
    "4+ Bedroom","Maisonette","Bungalow","Townhouse","Apartment Block"
  ];

  // Fetch Featured Properties safely
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await API.get("/payment/featured");
        setFeaturedProperties(res.data || []);
      } catch (err) {
        console.error("Failed to load featured properties:", err);
        setErrorFeatured(true);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchForm.county) params.append("county", searchForm.county);
    if (searchForm.type) params.append("type", searchForm.type);
    navigate(`/listings?${params.toString()}`);
  };

  const handleListProperty = () => {
    if (!token) {
      navigate("/login");
    } else {
      navigate("/upload");
    }
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* Marquee */}
      <div style={styles.marqueeWrapper}>
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, idx) => (
            <span key={idx} style={styles.marqueePill}>{item}</span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <img src={logo} alt="Axx Spaces" style={styles.heroLogo} />
          <h1 style={styles.heroTitle}>Find Your Dream Home in Kenya</h1>
          <p style={styles.heroSubtitle}>Verified rentals • Direct landlord contact • No agents</p>

          <form onSubmit={handleSearch} style={styles.searchCard}>
            <div style={styles.searchRow}>
              <select
                style={styles.searchInput}
                value={searchForm.county}
                onChange={(e) => setSearchForm({ ...searchForm, county: e.target.value })}
              >
                <option value="">📍 Select County</option>
                {counties.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select
                style={styles.searchInput}
                value={searchForm.type}
                onChange={(e) => setSearchForm({ ...searchForm, type: e.target.value })}
              >
                <option value="">🏠 Property Type</option>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <button type="submit" style={styles.searchBtn}>🔍 Search</button>
            </div>
          </form>
        </div>
      </section>

      {/* Featured Listings */}
      <section style={styles.featuredSection}>
        <h2 style={styles.sectionTitle}>⭐ Featured Premium Listings</h2>

        {loadingFeatured ? (
          <p style={{ textAlign: "center", padding: "40px" }}>Loading featured properties...</p>
        ) : featuredProperties.length > 0 ? (
          <div style={styles.featuredGrid}>
            {featuredProperties.map(property => (
              <div key={property._id} style={styles.featuredCard}>
                <img 
                  src={property.images?.[0] || ""} 
                  alt={property.title} 
                  style={styles.featuredImage} 
                />
                <div style={styles.featuredInfo}>
                  <h3 style={styles.featuredTitle}>{property.title}</h3>
                  <p style={styles.featuredLocation}>📍 {property.county}</p>
                  <p style={styles.featuredPrice}>
                    KSh {Number(property.price).toLocaleString()} / month
                  </p>
                  <button 
                    onClick={() => navigate(`/listings?highlight=${property._id}`)}
                    style={styles.viewBtn}
                  >
                    View Property →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            No featured listings at the moment
          </p>
        )}
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to Find Your Home?</h2>
        <button style={styles.ctaBtn} onClick={() => navigate("/listings")}>
          Browse All Listings
        </button>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        © 2026 Axx Spaces • Kenya's Trusted Rental Platform
      </footer>
    </div>
  );
}

/* ===================== STYLES ===================== */
const styles = {
  root: { fontFamily: "'DM Sans', system-ui, sans-serif", background: "#f8f4f0", minHeight: "100vh" },

  marqueeWrapper: { overflow: "hidden", background: "#fbbf24", padding: "10px 0", whiteSpace: "nowrap" },
  marqueePill: { display: "inline-block", margin: "0 20px", fontWeight: 600, fontSize: "14px" },

  hero: { padding: "60px 20px 40px", textAlign: "center", background: "linear-gradient(#fff, #fef3e2)" },
  heroLogo: { height: "70px", marginBottom: "20px" },
  heroTitle: { fontSize: "clamp(28px, 6vw, 48px)", fontWeight: 800, margin: "0 0 12px" },
  heroSubtitle: { fontSize: "17px", color: "#555", maxWidth: "500px", margin: "0 auto 30px" },

  searchCard: { background: "white", padding: "20px", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", maxWidth: "700px", margin: "0 auto" },
  searchRow: { display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "12px" },
  searchInput: { padding: "14px", border: "2px solid #ddd", borderRadius: "10px", fontSize: "15px" },
  searchBtn: { padding: "14px 28px", background: "#ef4444", color: "white", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer" },

  featuredSection: { padding: "60px 20px", background: "#1f2937", color: "white" },
  sectionTitle: { fontSize: "32px", textAlign: "center", color: "#fbbf24", marginBottom: "10px" },
  featuredGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", maxWidth: "1200px", margin: "0 auto" },
  featuredCard: { background: "#111827", borderRadius: "12px", overflow: "hidden" },
  featuredImage: { width: "100%", height: "200px", objectFit: "cover" },
  featuredInfo: { padding: "16px" },
  featuredTitle: { fontSize: "17px", fontWeight: 700, margin: "0 0 8px" },
  featuredLocation: { color: "#94a3b8", marginBottom: "8px" },
  featuredPrice: { color: "#22c55e", fontSize: "18px", fontWeight: 800 },
  viewBtn: { marginTop: "12px", width: "100%", padding: "12px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" },

  cta: { padding: "80px 20px", background: "#2427fb", color: "white", textAlign: "center" },
  ctaTitle: { fontSize: "32px", marginBottom: "20px" },
  ctaBtn: { padding: "16px 36px", background: "white", color: "#2427fb", border: "none", borderRadius: "12px", fontSize: "17px", fontWeight: 700, cursor: "pointer" },

  footer: { padding: "30px", background: "#111", color: "#888", textAlign: "center", fontSize: "14px" }
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');

  @keyframes marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  .marquee-track { display: inline-flex; animation: marquee 35s linear infinite; }
`;