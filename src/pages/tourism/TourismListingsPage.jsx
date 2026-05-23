import { useState } from "react";
import { useNavigate } from "react-router-dom";

const allProperties = [
  { id: 1, name: "Serena Beach Resort", location: "Mombasa, Coast", category: "Beach Resort", price: 12500, rating: 4.8, reviews: 312, color: "#0ea5e9", amenities: ["Pool", "WiFi", "Restaurant", "Spa"], tag: "Top Rated" },
  { id: 2, name: "Fairmont Mount Kenya Safari Club", location: "Nanyuki, Laikipia", category: "Mountain Lodge", price: 28000, rating: 4.9, reviews: 198, color: "#22c55e", amenities: ["Safari", "Pool", "Restaurant", "WiFi"], tag: "Luxury" },
  { id: 3, name: "Nairobi Serena Hotel", location: "Nairobi CBD", category: "Hotel", price: 9500, rating: 4.7, reviews: 541, color: "#f59e0b", amenities: ["Pool", "WiFi", "Gym", "Restaurant"], tag: "Most Booked" },
  { id: 4, name: "Ol Pejeta Bush Camp", location: "Laikipia, Rift Valley", category: "Adventure Tour", price: 18000, rating: 4.9, reviews: 87, color: "#a855f7", amenities: ["Safari", "Meals", "Guide", "WiFi"], tag: "Hidden Gem" },
  { id: 5, name: "Lake Nakuru Lodge", location: "Nakuru, Rift Valley", category: "Mountain Lodge", price: 7800, rating: 4.5, reviews: 223, color: "#ec4899", amenities: ["Game Drive", "Restaurant", "WiFi", "Pool"], tag: null },
  { id: 6, name: "Diani Reef Beach Resort", location: "Diani, Coast", category: "Beach Resort", price: 15000, rating: 4.6, reviews: 189, color: "#06b6d4", amenities: ["Beach", "Pool", "Diving", "Spa"], tag: null },
  { id: 7, name: "Hemingways Nairobi", location: "Karen, Nairobi", category: "Hotel", price: 32000, rating: 4.8, reviews: 134, color: "#f97316", amenities: ["Pool", "Spa", "Restaurant", "Bar"], tag: "Premium" },
  { id: 8, name: "Wildebeest Eco Camp", location: "Narok, Masai Mara", category: "Camping Grounds", price: 5500, rating: 4.4, reviews: 97, color: "#84cc16", amenities: ["Tents", "Meals", "Safari", "Campfire"], tag: "Budget Pick" },
];

const categoryOptions = ["All", "Hotel", "Beach Resort", "Mountain Lodge", "Adventure Tour", "Camping Grounds", "Restaurant", "Entertainment", "Spa & Wellness", "Water Sports"];
const sortOptions = ["Recommended", "Price: Low to High", "Price: High to Low", "Highest Rated", "Most Reviewed"];

const categoryIcons = {
  "Hotel": "🏨", "Beach Resort": "🏖️", "Mountain Lodge": "⛰️",
  "Adventure Tour": "🗻", "Camping Grounds": "🏕️", "Restaurant": "🍽️",
  "Entertainment": "🎭", "Spa & Wellness": "🏊", "Water Sports": "🚣",
};

export default function TourismListingsPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Recommended");
  const [maxPrice, setMaxPrice] = useState(50000);
  const [minRating, setMinRating] = useState(0);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = allProperties
    .filter((p) => category === "All" || p.category === category)
    .filter((p) => p.price <= maxPrice)
    .filter((p) => p.rating >= minRating)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "Price: Low to High") return a.price - b.price;
      if (sort === "Price: High to Low") return b.price - a.price;
      if (sort === "Highest Rated") return b.rating - a.rating;
      if (sort === "Most Reviewed") return b.reviews - a.reviews;
      return 0;
    });

  const clearFilters = () => { setCategory("All"); setMaxPrice(50000); setMinRating(0); setSearch(""); };

  const FilterContent = () => (
    <>
      <div style={s.filterGroup}>
        <div style={s.filterLabel}>Category</div>
        {categoryOptions.map((c) => (
          <button
            key={c}
            style={{ ...s.filterChip, ...(category === c ? s.filterChipActive : {}) }}
            onClick={() => { setCategory(c); setFilterOpen(false); }}
          >
            {categoryIcons[c] || "🌍"} {c}
          </button>
        ))}
      </div>

      <div style={s.filterGroup}>
        <div style={s.filterLabel}>Max Price per Night</div>
        <div style={s.priceDisplay}>KSh {maxPrice.toLocaleString()}</div>
        <input
          type="range" min={1000} max={50000} step={500}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          style={s.slider}
        />
        <div style={s.priceRange}><span>KSh 1,000</span><span>KSh 50,000</span></div>
      </div>

      <div style={s.filterGroup}>
        <div style={s.filterLabel}>Minimum Rating</div>
        {[0, 3, 4, 4.5].map((r) => (
          <button
            key={r}
            style={{ ...s.filterChip, ...(minRating === r ? s.filterChipActive : {}) }}
            onClick={() => setMinRating(r)}
          >
            {r === 0 ? "Any Rating" : `⭐ ${r}+`}
          </button>
        ))}
      </div>

      <div style={s.filterGroup}>
        <div style={s.filterLabel}>Sort By</div>
        <select style={s.select} value={sort} onChange={(e) => setSort(e.target.value)}>
          {sortOptions.map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>

      <button style={s.clearBtn} onClick={clearFilters}>Clear All Filters</button>
    </>
  );

  return (
    <div style={s.root}>
      <style>{css}</style>

      {/* HEADER */}
      <div style={s.header}>
        <div style={s.headerInner}>
          <div style={s.headerLeft}>
            <h1 style={s.headerTitle}>🏨 Tourism & Hospitality</h1>
            <p style={s.headerSub}>{filtered.length} properties in Kenya</p>
          </div>
          <input
            style={s.searchBar}
            placeholder="🔍  Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={s.headerActions}>
            {/* Mobile filter button */}
            <button style={s.filterToggleBtn} className="filter-toggle-btn" onClick={() => setFilterOpen(true)}>
              ⚙️ Filters {(category !== "All" || minRating > 0 || maxPrice < 50000) ? "•" : ""}
            </button>
            <button style={s.listBtn} onClick={() => navigate("/tourism/register-property")}>
              + List Property
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE FILTER SHEET */}
      {filterOpen && (
        <>
          <div style={s.overlay} onClick={() => setFilterOpen(false)} />
          <div style={s.filterSheet}>
            <div style={s.sheetHandle} />
            <div style={s.sheetHeader}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#1f2937" }}>Filters</h3>
              <button style={s.sheetClose} onClick={() => setFilterOpen(false)}>✕</button>
            </div>
            <div style={{ overflowY: "auto", flex: 1, padding: "0 4px" }}>
              <FilterContent />
            </div>
            <button style={{ ...s.listBtn, width: "100%", padding: "14px", fontSize: "15px", borderRadius: "10px" }} onClick={() => setFilterOpen(false)}>
              Show {filtered.length} Properties
            </button>
          </div>
        </>
      )}

      <div style={s.body}>
        {/* SIDEBAR — desktop */}
        <aside style={s.sidebar} className="sidebar-desktop">
          <h3 style={s.filterTitle}>Filters</h3>
          <FilterContent />
        </aside>

        {/* LISTINGS */}
        <main style={s.main}>
          {/* Active filters chips */}
          {(category !== "All" || minRating > 0 || maxPrice < 50000) && (
            <div style={s.activeFilters}>
              {category !== "All" && <span style={s.activeChip}>{categoryIcons[category]} {category} <button style={s.chipX} onClick={() => setCategory("All")}>✕</button></span>}
              {minRating > 0 && <span style={s.activeChip}>⭐ {minRating}+ <button style={s.chipX} onClick={() => setMinRating(0)}>✕</button></span>}
              {maxPrice < 50000 && <span style={s.activeChip}>≤ KSh {maxPrice.toLocaleString()} <button style={s.chipX} onClick={() => setMaxPrice(50000)}>✕</button></span>}
            </div>
          )}

          {filtered.length === 0 ? (
            <div style={s.empty}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
              <h3 style={{ color: "#1f2937", marginBottom: "8px" }}>No properties found</h3>
              <p style={{ color: "#6b7280", marginBottom: "16px" }}>Try adjusting your filters</p>
              <button style={{ ...s.listBtn, padding: "10px 20px" }} onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <div style={s.grid}>
              {filtered.map((p) => (
                <div
                  key={p.id}
                  style={s.card}
                  className="prop-card"
                  onClick={() => navigate(`/tourism/${p.id}`)}
                >
                  <div style={{ ...s.cardImg, background: `linear-gradient(135deg, ${p.color}25, ${p.color}10)`, border: `1px solid ${p.color}30` }}>
                    <span style={{ fontSize: "52px" }}>{categoryIcons[p.category] || "🏨"}</span>
                    {p.tag && <div style={{ ...s.cardTag, background: p.color }}>{p.tag}</div>}
                  </div>
                  <div style={s.cardBody}>
                    <div style={s.cardCat}>{p.category}</div>
                    <h3 style={s.cardName}>{p.name}</h3>
                    <div style={s.cardLoc}>📍 {p.location}</div>
                    <div style={s.cardAmenities}>
                      {p.amenities.slice(0, 3).map((a) => (
                        <span key={a} style={s.amenityChip}>{a}</span>
                      ))}
                      {p.amenities.length > 3 && <span style={s.amenityChip}>+{p.amenities.length - 3}</span>}
                    </div>
                    <div style={s.cardFooter}>
                      <div>
                        <span style={{ ...s.cardPrice, color: p.color }}>KSh {p.price.toLocaleString()}</span>
                        <span style={s.cardPer}>/night</span>
                      </div>
                      <div style={s.cardRating}>⭐ {p.rating} <span style={{ color: "#9ca3af" }}>({p.reviews})</span></div>
                    </div>
                    <button style={{ ...s.viewBtn, background: p.color }} onClick={(e) => { e.stopPropagation(); navigate(`/tourism/${p.id}`); }}>
                      View & Book →
                    </button>
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
  root: { fontFamily: "'DM Sans', sans-serif", background: "#f8f4f0", minHeight: "100vh" },

  header: { background: "white", borderBottom: "1px solid #e5e7eb", padding: "14px 16px", position: "sticky", top: 0, zIndex: 10 },
  headerInner: { maxWidth: "1400px", margin: "0 auto", display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" },
  headerLeft: { flexShrink: 0 },
  headerTitle: { fontSize: "18px", fontWeight: 800, color: "#1f2937", margin: 0 },
  headerSub: { fontSize: "11px", color: "#6b7280", margin: "1px 0 0" },
  searchBar: { flex: 1, minWidth: "180px", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", fontFamily: "inherit", outline: "none" },
  headerActions: { display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 },
  filterToggleBtn: { display: "none", background: "white", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#4b5563" },
  listBtn: { background: "#fbbf24", color: "#1f2937", border: "none", borderRadius: "10px", padding: "10px 16px", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" },

  // Mobile filter sheet
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200 },
  filterSheet: { position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderRadius: "20px 20px 0 0", padding: "0 16px 16px", zIndex: 201, maxHeight: "85vh", display: "flex", flexDirection: "column" },
  sheetHandle: { width: "40px", height: "4px", background: "#e5e7eb", borderRadius: "2px", margin: "12px auto 0" },
  sheetHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0 12px", borderBottom: "1px solid #f3f4f6", marginBottom: "12px" },
  sheetClose: { background: "#f3f4f6", border: "none", borderRadius: "50%", width: "32px", height: "32px", fontSize: "14px", cursor: "pointer", fontFamily: "inherit" },

  body: { maxWidth: "1400px", margin: "0 auto", padding: "20px 16px", display: "grid", gridTemplateColumns: "260px 1fr", gap: "20px", alignItems: "start" },

  sidebar: { background: "white", borderRadius: "14px", padding: "20px", border: "1px solid #e5e7eb", position: "sticky", top: "80px" },
  filterTitle: { fontSize: "15px", fontWeight: 800, color: "#1f2937", marginBottom: "18px" },
  filterGroup: { marginBottom: "20px" },
  filterLabel: { fontSize: "10px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" },
  filterChip: { display: "block", width: "100%", textAlign: "left", background: "transparent", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "7px 10px", fontSize: "12px", cursor: "pointer", marginBottom: "5px", fontFamily: "inherit", color: "#4b5563" },
  filterChipActive: { background: "#fef9c3", borderColor: "#fbbf24", color: "#92400e", fontWeight: 700 },
  priceDisplay: { fontSize: "18px", fontWeight: 800, color: "#1f2937", marginBottom: "8px" },
  slider: { width: "100%", accentColor: "#fbbf24", marginBottom: "4px" },
  priceRange: { display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#9ca3af" },
  select: { width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 10px", fontSize: "12px", fontFamily: "inherit", color: "#1f2937", outline: "none" },
  clearBtn: { width: "100%", background: "transparent", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "9px", fontSize: "12px", color: "#6b7280", cursor: "pointer", fontFamily: "inherit" },

  activeFilters: { display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" },
  activeChip: { background: "#fef9c3", border: "1px solid #fbbf24", borderRadius: "20px", padding: "5px 10px", fontSize: "12px", color: "#92400e", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" },
  chipX: { background: "none", border: "none", cursor: "pointer", fontSize: "11px", color: "#92400e", padding: 0, lineHeight: 1 },

  main: {},
  empty: { textAlign: "center", padding: "60px 20px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" },
  card: { background: "white", borderRadius: "14px", overflow: "hidden", border: "1px solid #e5e7eb", cursor: "pointer", transition: "all 0.22s" },
  cardImg: { height: "150px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" },
  cardTag: { position: "absolute", top: "10px", left: "10px", color: "white", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px" },
  cardBody: { padding: "14px" },
  cardCat: { fontSize: "10px", color: "#6b7280", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "3px" },
  cardName: { fontSize: "14px", fontWeight: 800, color: "#1f2937", margin: "0 0 3px", lineHeight: 1.3 },
  cardLoc: { fontSize: "12px", color: "#6b7280", marginBottom: "8px" },
  cardAmenities: { display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px" },
  amenityChip: { background: "#f3f4f6", color: "#6b7280", fontSize: "10px", padding: "2px 7px", borderRadius: "20px" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" },
  cardPrice: { fontSize: "16px", fontWeight: 800 },
  cardPer: { fontSize: "11px", color: "#9ca3af" },
  cardRating: { fontSize: "12px", color: "#fbbf24", fontWeight: 700 },
  viewBtn: { width: "100%", border: "none", color: "white", padding: "10px", borderRadius: "8px", fontWeight: 700, fontSize: "12px", cursor: "pointer", fontFamily: "inherit" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  .prop-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; border-color: #fbbf24 !important; }
  input:focus, select:focus { border-color: #fbbf24 !important; }
  .sidebar-desktop { display: block; }

  @media (max-width: 860px) {
    .sidebar-desktop { display: none !important; }
    .filter-toggle-btn { display: block !important; }
    [style*="gridTemplateColumns: 260px"] { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 500px) {
    [style*="gridTemplateColumns: repeat(auto-fill, minmax(260px"] { grid-template-columns: 1fr !important; }
    [style*="padding: 20px 16px"] { padding: 12px !important; }
  }
`;