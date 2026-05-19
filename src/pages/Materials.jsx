import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1000/api";

const COUNTIES = [
  "Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita Taveta","Garissa","Wajir",
  "Mandera","Marsabit","Isiolo","Meru","Tharaka Nithi","Embu","Kitui","Machakos",
  "Makueni","Nyandarua","Nyeri","Kirinyaga","Murang'a","Kiambu","Turkana","West Pokot",
  "Samburu","Trans Nzoia","Uasin Gishu","Elgeyo Marakwet","Nandi","Baringo","Laikipia",
  "Nakuru","Narok","Kajiado","Kericho","Bomet","Kakamega","Vihiga","Bungoma","Busia",
  "Siaya","Kisumu","Homa Bay","Migori","Kisii","Nyamira","Nairobi City"
];

const CATEGORIES = ["Construction Materials", "Furniture", "Appliances", "Electronics", "Tools", "Other"];
const CONDITIONS = ["Like New", "Good", "Fair", "Poor"];

export default function MaterialMarketplace() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filter States
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [county, setCounty] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Fetch only approved materials on mount or when filters change
  useEffect(() => {
    fetchMarketplaceMaterials();
  }, [category, condition, county]);

  const fetchMarketplaceMaterials = async () => {
    try {
      setLoading(true);
      setError("");

      // Build query parameters
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (condition) params.append("condition", condition);
      if (county) params.append("county", county);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (search) params.append("search", search);
      
      // Cache buster to ensure instant visibility updates after admin actions
      params.append("_cb", Date.now());

      const res = await fetch(`${API_BASE}/materials?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load marketplace stock.");
      
      const data = await res.json();
      setMaterials(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMarketplaceMaterials();
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setCondition("");
    setCounty("");
    setMinPrice("");
    setMaxPrice("");
    // We rely on temporary state resets; triggered refetch handled by native state effect dependencies
  };

  return (
    <div style={s.page}>
      <style>{css}</style>
      
      {/* HERO / HEADER TITLE */}
      <div style={s.hero}>
        <h1 style={s.title}>🏗️ Material Marketplace</h1>
        <p style={s.subtitle}>Browse high-quality construction materials, tools, and surplus equipment.</p>
      </div>

      <div style={s.layout}>
        {/* SIDEBAR FILTERS */}
        <aside style={s.sidebar}>
          <h2 style={s.filterTitle}>Filters</h2>
          
          <div style={s.filterGroup}>
            <label style={s.label}>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={s.select}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={s.filterGroup}>
            <label style={s.label}>County Location</label>
            <select value={county} onChange={(e) => setCounty(e.target.value)} style={s.select}>
              <option value="">All Counties</option>
              {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={s.filterGroup}>
            <label style={s.label}>Condition</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value)} style={s.select}>
              <option value="">Any Condition</option>
              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={s.filterGroup}>
            <label style={s.label}>Price Range (KES)</label>
            <div style={s.priceRangeRow}>
              <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} style={s.rangeInput} />
              <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={s.rangeInput} />
            </div>
            <button style={s.applyPriceBtn} onClick={fetchMarketplaceMaterials}>Apply Price</button>
          </div>

          <button style={s.clearBtn} onClick={clearFilters}>Reset Filters</button>
        </aside>

        {/* MAIN FEED */}
        <main style={s.mainContent}>
          {/* SEARCH BAR */}
          <form onSubmit={handleSearchSubmit} style={s.searchForm}>
            <input 
              type="text" 
              placeholder="Search items by title, details or location..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              style={s.searchField}
            />
            <button type="submit" style={s.searchBtn}>🔍 Search</button>
          </form>

          {/* STATUS FLAGS */}
          {loading ? (
            <div style={s.centeredState}>Loading live marketplace items...</div>
          ) : error ? (
            <div style={s.errorState}>❌ {error}</div>
          ) : materials.length === 0 ? (
            <div style={s.emptyState}>
              <h3>No Active Items Found</h3>
              <p>Try clearing your active filters or broaden your keyword search terms.</p>
            </div>
          ) : (
            /* MATERIALS FEED GRID */
            <div style={s.grid}>
              {materials.map((item) => (
                <div key={item._id} style={s.card}>
                  <div style={s.cardImgContainer}>
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.title} style={s.cardImg} />
                    ) : (
                      <div style={s.noImg}>📷 No Image Available</div>
                    )}
                    <span style={s.conditionBadge}>{item.condition}</span>
                  </div>
                  
                  <div style={s.cardBody}>
                    <span style={s.itemCategory}>{item.category}</span>
                    <h3 style={s.cardTitle}>{item.title}</h3>
                    <p style={s.cardPrice}>KES {item.price?.toLocaleString()}</p>
                    <p style={s.cardLocation}>📍 {item.location}, {item.county}</p>
                    <p style={s.cardStock}>Available Qty: <strong>{item.quantity}</strong></p>
                    
                    <Link to={`/materials/${item._id}`} style={s.viewDetailsBtn}>
                      View Contact Info
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const s = {
  page: { maxWidth: "1280px", margin: "0 auto", padding: "24px", minHeight: "100vh", background: "#0f172a", fontFamily: "sans-serif", color: "#f8fafc" },
  hero: { textAlign: "center", marginBottom: "40px", borderBottom: "1px solid #1e293b", paddingBottom: "24px" },
  title: { fontSize: "2.5rem", margin: "0 0 8px 0", color: "#fbbf24", fontWeight: "800" },
  subtitle: { color: "#94a3b8", fontSize: "1.1rem", margin: 0 },
  layout: { display: "grid", gridTemplateColumns: "280px 1fr", gap: "32px" },
  sidebar: { background: "#1e293b", padding: "24px", borderRadius: "12px", border: "1px solid #334155", height: "fit-content" },
  filterTitle: { margin: "0 0 20px 0", fontSize: "1.25rem", color: "#f8fafc", borderBottom: "1px solid #334155", paddingBottom: "8px" },
  filterGroup: { marginBottom: "20px" },
  label: { display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "8px", fontWeight: "600" },
  select: { width: "100%", padding: "10px", background: "#0f172a", border: "1px solid #334155", borderRadius: "6px", color: "#fff", cursor: "pointer" },
  priceRangeRow: { display: "flex", gap: "8px", marginBottom: "8px" },
  rangeInput: { width: "100%", padding: "8px", background: "#0f172a", border: "1px solid #334155", borderRadius: "6px", color: "#fff" },
  applyPriceBtn: { width: "100%", padding: "8px", background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "0.85rem" },
  clearBtn: { width: "100%", padding: "10px", background: "transparent", color: "#94a3b8", border: "1px solid #334155", borderRadius: "6px", cursor: "pointer", marginTop: "8px" },
  mainContent: { display: "flex", flexDirection: "column", gap: "24px" },
  searchForm: { display: "flex", gap: "12px" },
  searchField: { flex: 1, padding: "14px 20px", background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff", fontSize: "1rem" },
  searchBtn: { padding: "14px 28px", background: "#fbbf24", color: "#0f172a", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "1rem" },
  centeredState: { textAlign: "center", padding: "80px", color: "#94a3b8", fontSize: "1.1rem" },
  errorState: { textAlign: "center", padding: "40px", color: "#f87171" },
  emptyState: { textAlign: "center", padding: "80px 20px", background: "#1e293b", borderRadius: "12px", border: "2px dashed #334155", color: "#94a3b8" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" },
  card: { background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column", transition: "transform 0.2s" },
  cardImgContainer: { position: "relative", height: "180px", background: "#0f172a" },
  cardImg: { width: "100%", height: "100%", objectFit: "cover" },
  noImg: { height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontSize: "0.9rem" },
  conditionBadge: { position: "absolute", bottom: "10px", right: "10px", background: "rgba(15,23,42,0.8)", padding: "4px 10px", borderRadius: "4px", fontSize: "0.75rem", color: "#fff", fontWeight: "bold" },
  cardBody: { padding: "16px", display: "flex", flexDirection: "column", flex: 1 },
  itemCategory: { fontSize: "0.75rem", color: "#fbbf24", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.5px" },
  cardTitle: { margin: "6px 0 10px 0", fontSize: "1.15rem", fontWeight: "700", color: "#f8fafc", lineHeigh: "1.4" },
  cardPrice: { fontSize: "1.35rem", fontWeight: "bold", color: "#4ade80", margin: "0 0 8px 0" },
  cardLocation: { color: "#94a3b8", fontSize: "0.85rem", margin: "0 0 6px 0" },
  cardStock: { color: "#cbd5e1", fontSize: "0.85rem", margin: "0 0 16px 0" },
  viewDetailsBtn: { marginTop: "auto", textAlign: "center", display: "block", padding: "10px", background: "transparent", color: "#fbbf24", border: "1px solid #fbbf24", borderRadius: "6px", textDecoration: "none", fontWeight: "bold", fontSize: "0.9rem", transition: "all 0.2s" }
};

const css = `
  input:focus, select:focus { border-color: #fbbf24 !important; outline: none; }
  a:hover { background: #fbbf24 !important; color: #0f172a !important; }
  button:hover { opacity: 0.9; }
  @media (max-width: 900px) {
    [style*="gridTemplateColumns: 280px 1fr"] { grid-template-columns: 1fr !important; }
  }
`;