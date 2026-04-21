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

  // ✅ COUNTIES
  const counties = [
    "Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita Taveta",
    "Garissa","Wajir","Mandera","Marsabit",
    "Isiolo","Meru","Tharaka Nithi","Embu","Kitui",
    "Machakos","Makueni","Nyandarua","Nyeri","Kirinyaga",
    "Murang’a","Kiambu","Turkana","West Pokot","Samburu",
    "Trans Nzoia","Uasin Gishu","Elgeyo Marakwet","Nandi","Baringo",
    "Laikipia","Nakuru","Narok","Kajiado","Kericho","Bomet",
    "Kakamega","Vihiga","Bungoma","Busia",
    "Siaya","Kisumu","Homa Bay","Migori","Kisii","Nyamira",
    "Nairobi City"
  ];

  // ✅ PROPERTY TYPES
  const propertyTypes = [
    "Bedsitter","Studio Apartment","1 Bedroom","2 Bedroom",
    "3 Bedroom","4+ Bedroom","Maisonette","Bungalow",
    "Townhouse","Apartment Block","Single Room","Shared Room",
    "Hostel Room","Commercial Office","Shop / Retail Space",
    "Warehouse","Plot / Land","Furnished Apartment",
    "Unfurnished Apartment"
  ];

  // ✅ FIXED SEARCH FUNCTION
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
    <div>

      {/* HERO */}
      <div style={styles.hero}>
        <img src={logo} alt="Axx Spaces Logo" style={styles.logo} />

        <h1 style={styles.title}>
          Find Affordable & Verified Homes in Kenya 🏠
        </h1>

        <p style={styles.subtitle}>
          Trusted rental platform connecting landlords and tenants
        </p>

        <div style={styles.searchBox}>

          {/* COUNTY */}
          <select
            style={styles.input}
            value={searchData.location}
            onChange={(e) =>
              setSearchData({ ...searchData, location: e.target.value })
            }
          >
            <option value="">Select County</option>
            {counties.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>

          {/* AREA */}
          <input
            placeholder="Area (e.g Kilimani)"
            style={styles.input}
            value={searchData.area}
            onChange={(e) =>
              setSearchData({ ...searchData, area: e.target.value })
            }
          />

          {/* PRICE */}
          <input
            placeholder="Max Price"
            style={styles.input}
            value={searchData.price}
            onChange={(e) =>
              setSearchData({ ...searchData, price: e.target.value })
            }
          />

          {/* TYPE */}
          <select
            style={styles.input}
            value={searchData.type}
            onChange={(e) =>
              setSearchData({ ...searchData, type: e.target.value })
            }
          >
            <option value="">Property Type</option>
            {propertyTypes.map((t, i) => (
              <option key={i} value={t}>{t}</option>
            ))}
          </select>

          {/* BEDROOMS */}
          <select
            style={styles.input}
            value={searchData.bedrooms}
            onChange={(e) =>
              setSearchData({ ...searchData, bedrooms: e.target.value })
            }
          >
            <option value="">Bedrooms</option>
            <option value="1">1 Bedroom</option>
            <option value="2">2 Bedrooms</option>
            <option value="3">3 Bedrooms</option>
            <option value="4">4+ Bedrooms</option>
          </select>

          <button className="btn" onClick={handleSearch}>
            Search Homes
          </button>
        </div>
      </div>

      {/* TRUST SECTION */}
      <div style={styles.section}>
        <h2>Why Renters Trust Axx Spaces</h2>

        <div style={styles.grid}>
          <div style={styles.card}>
            🔐 Verified Listings
            <p>Every property is reviewed before approval</p>
          </div>

          <div style={styles.card}>
            🧾 No Fake Ads
            <p>We filter scams and fake landlords</p>
          </div>

          <div style={styles.card}>
            📞 Direct Contact
            <p>Talk directly to landlords</p>
          </div>

          <div style={styles.card}>
            ⚡ Fast Updates
            <p>New listings appear instantly</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={styles.cta}>
        <h2>Are you a landlord?</h2>
        <p>Post your property and reach thousands of tenants</p>

        <button className="btn" onClick={() => navigate("/upload")}>
          Upload Property
        </button>
      </div>

    </div>
  );
}

/* =========================
   STYLES
========================= */
const styles = {
  hero: {
    padding: "60px 20px",
    textAlign: "center",
    background: "linear-gradient(to right, #0a1f44, #000)",
  },

  logo: {
    width: "90px",
    height: "90px",
    objectFit: "contain",
    marginBottom: "8px",
    borderRadius: "20px"
  },

  title: {
    fontSize: "40px",
    marginBottom: "10px",
    color: "white"
  },

  subtitle: {
    color: "gray",
    marginBottom: "20px",
  },

  searchBox: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    flexWrap: "wrap",
  },

  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    width: "200px",
  },

  section: {
    padding: "40px 20px",
    textAlign: "center",
  },

  grid: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginTop: "20px",
  },

  card: {
    background: "#111",
    padding: "20px",
    borderRadius: "10px",
    width: "220px",
    color: "white"
  },

  cta: {
    padding: "40px",
    textAlign: "center",
    background: "#0a1f44",
    marginTop: "30px",
    color: "white"
  }
};