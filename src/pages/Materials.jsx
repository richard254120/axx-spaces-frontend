import { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

const COUNTIES = [
  "Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita Taveta",
  "Garissa","Wajir","Mandera","Marsabit","Isiolo","Meru","Tharaka Nithi",
  "Embu","Kitui","Machakos","Makueni","Nyandarua","Nyeri","Kirinyaga",
  "Murang'a","Kiambu","Turkana","West Pokot","Samburu","Trans Nzoia",
  "Uasin Gishu","Elgeyo Marakwet","Nandi","Baringo","Laikipia","Nakuru",
  "Narok","Kajiado","Kericho","Bomet","Kakamega","Vihiga","Bungoma",
  "Busia","Siaya","Kisumu","Homa Bay","Migori","Kisii","Nyamira",
  "Nairobi City"
];

const CATEGORIES = [
  "Construction Materials",
  "Furniture",
  "Appliances",
  "Electronics",
  "Tools",
  "Other",
];

const CONDITIONS = ["Like New", "Good", "Fair", "Poor"];

export default function Materials() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [searchParams] = useSearchParams();

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    condition: searchParams.get("condition") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    county: searchParams.get("county") || "",
  });

  useEffect(() => {
    fetchMaterials();
  }, [filters]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filters.search) query.append("search", filters.search);
      if (filters.category) query.append("category", filters.category);
      if (filters.condition) query.append("condition", filters.condition);
      if (filters.minPrice) query.append("minPrice", filters.minPrice);
      if (filters.maxPrice) query.append("maxPrice", filters.maxPrice);
      if (filters.county) query.append("county", filters.county);

      const response = await fetch(`${API_BASE}/materials?${query}`);
      const data = await response.json();
      setMaterials(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError("Failed to load materials");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpload = () => {
    if (!token) {
      navigate("/login");
      return;
    }
    navigate("/upload-material");
  };

  return (
    <div style={styles.container}>
      <style>{css}</style>

      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Materials Marketplace</h1>
        <button onClick={handleUpload} style={styles.uploadBtn}>
          ⬆️ Sell Materials
        </button>
      </div>

      {/* FILTERS */}
      <div style={styles.filterSection}>
        <input
          type="text"
          name="search"
          placeholder="Search materials..."
          value={filters.search}
          onChange={handleFilterChange}
          style={styles.searchInput}
        />

        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          style={styles.filterSelect}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          name="condition"
          value={filters.condition}
          onChange={handleFilterChange}
          style={styles.filterSelect}
        >
          <option value="">All Conditions</option>
          {CONDITIONS.map((cond) => (
            <option key={cond} value={cond}>{cond}</option>
          ))}
        </select>

        <select
          name="county"
          value={filters.county}
          onChange={handleFilterChange}
          style={styles.filterSelect}
        >
          <option value="">All Counties</option>
          {COUNTIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input
          type="number"
          name="minPrice"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={handleFilterChange}
          style={styles.filterSelect}
        />

        <input
          type="number"
          name="maxPrice"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={handleFilterChange}
          style={styles.filterSelect}
        />
      </div>

      {/* ERROR MESSAGE */}
      {error && <div style={styles.error}>{error}</div>}

      {/* LOADING */}
      {loading ? (
        <p style={styles.loading}>Loading materials...</p>
      ) : materials.length === 0 ? (
        <div style={styles.empty}>
          <p>No materials found. Try different filters or</p>
          <button onClick={handleUpload} style={styles.uploadBtn}>Sell your materials</button>
        </div>
      ) : (
        /* MATERIALS GRID */
        <div style={styles.grid}>
          {materials.map((material) => (
            <div
              key={material._id}
              style={styles.card}
              onClick={() => navigate(`/materials/${material._id}`)}
            >
              <div style={styles.imageContainer}>
                <img
                  src={material.images?.[0] || "/placeholder.jpg"}
                  alt={material.title}
                  style={styles.image}
                />
                <span style={styles.condition}>{material.condition}</span>
              </div>

              <div style={styles.content}>
                <h3 style={styles.materialTitle}>{material.title}</h3>
                <p style={styles.location}>📍 {material.location}</p>

                {material.seller && (
                  <p style={styles.seller}>
                    By: {material.seller.name}
                  </p>
                )}

                <p style={styles.quantity}>Qty: {material.quantity}</p>
                <p style={styles.price}>KSh {Number(material.price).toLocaleString()}</p>

                <div style={styles.stats}>
                  <span>👁️ {material.views}</span>
                  <span>💬 {material.inquiries}</span>
                </div>

                <button style={styles.viewBtn} onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/materials/${material._id}`);
                }}>
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: "#06101f",
    minHeight: "100vh",
    padding: "20px",
    fontFamily: "'DM Sans', sans-serif",
    color: "#f1f5f9",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: "1px solid #334155",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 800,
    color: "#fbbf24",
  },

  uploadBtn: {
    padding: "12px 24px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },

  filterSection: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    marginBottom: "30px",
  },

  searchInput: {
    padding: "12px",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#f1f5f9",
    fontSize: "14px",
    gridColumn: "span 2",
  },

  filterSelect: {
    padding: "12px",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#f1f5f9",
    fontSize: "14px",
  },

  error: {
    background: "rgba(239, 68, 68, 0.2)",
    border: "1px solid #ef4444",
    color: "#fca5a5",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  loading: {
    textAlign: "center",
    color: "#94a3b8",
    padding: "40px",
  },

  empty: {
    textAlign: "center",
    color: "#94a3b8",
    padding: "60px 20px",
    background: "#1e293b",
    borderRadius: "12px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "16px",
  },

  card: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "10px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.3s",
  },

  imageContainer: {
    position: "relative",
    height: "140px",
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  condition: {
    position: "absolute",
    top: "6px",
    right: "6px",
    background: "#ef4444",
    color: "white",
    padding: "3px 8px",
    borderRadius: "12px",
    fontSize: "10px",
    fontWeight: 700,
  },

  content: {
    padding: "12px",
  },

  materialTitle: {
    margin: "0 0 4px",
    fontSize: "13px",
    fontWeight: 700,
    color: "#f1f5f9",
  },

  location: {
    margin: "0 0 4px",
    fontSize: "11px",
    color: "#94a3b8",
  },

  seller: {
    margin: "0 0 4px",
    fontSize: "11px",
    color: "#cbd5e1",
  },

  quantity: {
    margin: "0",
    fontSize: "11px",
    color: "#94a3b8",
  },

  price: {
    margin: "6px 0",
    fontSize: "14px",
    fontWeight: 700,
    color: "#22c55e",
  },

  stats: {
    display: "flex",
    gap: "10px",
    fontSize: "10px",
    color: "#cbd5e1",
    marginBottom: "8px",
  },

  viewBtn: {
    width: "100%",
    padding: "8px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 600,
  },
};

const css = `
  input:focus, select:focus {
    outline: none;
    border-color: #3b82f6 !important;
    background: #334155 !important;
  }

  button:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  @media (max-width: 600px) {
    [style*="gridTemplateColumns: repeat(auto-fit"] {
      grid-template-columns: 1fr !important;
    }
  }
`;