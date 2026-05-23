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

  return (
    <div style={s.root}>
      <style>{css}</style>

      {/* HEADER */}
      <div style={s.header}>
        <div style={s.headerInner}>
          <div>
            <h1 style={s.headerTitle}>🏨 Tourism & Hospitality</h1>
            <p style={s.headerSub}>{filtered.length} properties found across Kenya</p>
          </div>
          <input
            style={s.searchBar}
            placeholder="🔍  Search properties or locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button style={s.listBtn} onClick={() => navigate("/tourism/register-property")}>
            + List Your Property
          </button>
        </div>
      </div>

      <div style={s.body}>
        {/* SIDEBAR FILTERS */}
        <aside style={s.sidebar}>
          <h3 style={s.filterTitle}>Filters</h3>

          <div style={s.filterGroup}>
            <div style={s.filterLabel}>Category</div>
            {categoryOptions.map((c) => (
              <button
                key={c}
                style={{ ...s.filterChip, ...(category === c ? s.filterChipActive : {}) }}
                onClick={() => setCategory(c)}
              >
                {categoryIcons[c] || "🌍"} {c}
              </button>
            ))}
          </div>

          <div style={s.filterGroup}>
            <div style={s.filterLabel}>Max Price per Night</div>
            <div style={s.priceDisplay}>KSh {maxPrice.toLocaleString()}</div>
            <input
              type="range" 
              min={1000} 
              max={50000} 
              step={500}
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
            <select
              style={s.select}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {sortOptions.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>

          <button style={s.clearBtn} onClick={() => { 
            setCategory("All"); 
            setMaxPrice(50000); 
            setMinRating(0); 
            setSearch(""); 
          }}>
            Clear All Filters
          </button>
        </aside>

        {/* LISTINGS */}
        <main style={s.main}>
          {filtered.length === 0 ? (
            <div style={s.empty}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
              <h3 style={{ color: "#1f2937", marginBottom: "8px" }}>No properties found</h3>
              <p style={{ color: "#6b7280" }}>Try adjusting your filters</p>
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
                    <span style={{ fontSize: "56px" }}>{categoryIcons[p.category] || "🏨"}</span>
                    {p.tag && <div style={{ ...s.cardTag, background: p.color }}>{p.tag}</div>}
                  </div>
                  <div style={s.cardBody}>
                    <div style={s.cardCat}>{p.category}</div>
                    <h3 style={s.cardName}>{p.name}</h3>
                    <div style={s.cardLoc}>📍 {p.location}</div>
                    <div style={s.cardAmenities}>
                      {p.amenities.map((a) => (
                        <span key={a} style={s.amenityChip}>{a}</span>
                      ))}
                    </div>
                    <div style={s.cardFooter}>
                      <div>
                        <span style={{ ...s.cardPrice, color: p.color }}>KSh {p.price.toLocaleString()}</span>
                        <span style={s.cardPer}>/night</span>
                      </div>
                      <div style={s.cardRating}>⭐ {p.rating} <span style={{ color: "#9ca3af" }}>({p.reviews})</span></div>
                    </div>
                    <button style={{ ...s.viewBtn, background: p.color }} onClick={(e) => { 
                      e.stopPropagation(); 
                      navigate(`/tourism/${p.id}`); 
                    }}>
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
  header: { background: "white", borderBottom: "1px solid #e5e7eb", padding: "20px", position: "sticky", top: 0, zIndex: 10 },
  headerInner: { maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" },
  headerTitle: { fontSize: "22px", fontWeight: 800, color: "#1f2937", margin: 0 },
  headerSub: { fontSize: "13px", color: "#6b7280", margin: "2px 0 0" },
  searchBar: { flex: 1, minWidth: "200px", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "12px 16px", fontSize: "14px", fontFamily: "inherit", outline: "none" },
  listBtn: { background: "#fbbf24", color: "#1f2937", border: "none", borderRadius: "10px", padding: "12px 20px", fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" },

  body: { maxWidth: "1400px", margin: "0 auto", padding: "20px", display: "flex", flexDirection: "column", gap: "24px" },
  sidebar: { background: "white", borderRadius: "14px", padding: "24px", border: "1px solid #e5e7eb", position: "sticky", top: "20px" },
  filterTitle: { fontSize: "16px", fontWeight: 800, color: "#1f2937", marginBottom: "20px" },
  filterGroup: { marginBottom: "24px" },
  filterLabel: { fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" },
  filterChip: { display: "block", width: "100%", textAlign: "left", background: "transparent", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", cursor: "pointer", marginBottom: "6px", fontFamily: "inherit", color: "#4b5563" },
  filterChipActive: { background: "#fef9c3", borderColor: "#fbbf24", color: "#92400e", fontWeight: 700 },
  priceDisplay: { fontSize: "20px", fontWeight: 800, color: "#1f2937", marginBottom: "10px" },
  slider: { width: "100%", accentColor: "#fbbf24", marginBottom: "6px" },
  priceRange: { display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#9ca3af" },
  select: { width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", fontFamily: "inherit", color: "#1f2937", outline: "none" },
  clearBtn: { width: "100%", background: "transparent", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "12px", fontSize: "13px", color: "#6b7280", cursor: "pointer", fontFamily: "inherit" },

  main: {},
  empty: { textAlign: "center", padding: "80px 20px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" },
  card: { background: "white", borderRadius: "14px", overflow: "hidden", border: "1px solid #e5e7eb", cursor: "pointer", transition: "all 0.22s" },
  cardImg: { height: "160px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" },
  cardTag: { position: "absolute", top: "10px", left: "10px", color: "white", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px" },
  cardBody: { padding: "16px" },
  cardCat: { fontSize: "10px", color: "#6b7280", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "4px" },
  cardName: { fontSize: "15px", fontWeight: 800, color: "#1f2937", margin: "0 0 4px", lineHeight: 1.3 },
  cardLoc: { fontSize: "12px", color: "#6b7280", marginBottom: "10px" },
  cardAmenities: { display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" },
  amenityChip: { background: "#f3f4f6", color: "#6b7280", fontSize: "11px", padding: "3px 8px", borderRadius: "20px" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  cardPrice: { fontSize: "17px", fontWeight: 800 },
  cardPer: { fontSize: "12px", color: "#9ca3af" },
  cardRating: { fontSize: "13px", color: "#fbbf24", fontWeight: 700 },
  viewBtn: { width: "100%", border: "none", color: "white", padding: "12px", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  .prop-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.1) !important; border-color: #fbbf24 !important; }
  
  @media (min-width: 768px) {
    [style*="flexDirection: column"] { flex-direction: row !important; }
    [style*="gridTemplateColumns: repeat(auto-fill, minmax(260px, 1fr))"] { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important; }
  }
`;