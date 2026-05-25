import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTourismListings } from "../../api/tourism";

const allProperties = [
  { id: 1, name: "Serena Beach Resort & Spa", location: "Nyali, Mombasa", county: "Mombasa", category: "Beach Resort", price: 12500, rating: 4.8, reviews: 312, color: "#0ea5e9", amenities: ["Pool", "WiFi", "Spa", "Restaurant"], tag: "Top Rated", emoji: "🏖️", bookingUrl: "https://www.serenahotels.com/mombasa" },
  { id: 2, name: "Fairmont Mount Kenya Safari Club", location: "Nanyuki, Laikipia", county: "Laikipia", category: "Mountain Lodge", price: 28000, rating: 4.9, reviews: 198, color: "#22c55e", amenities: ["Safari", "Pool", "Restaurant", "WiFi"], tag: "Luxury", emoji: "⛰️", bookingUrl: "https://www.fairmont.com/mount-kenya-safari-club" },
  { id: 3, name: "Nairobi Serena Hotel", location: "Nairobi CBD", county: "Nairobi", category: "City Hotel", price: 9500, rating: 4.7, reviews: 541, color: "#f59e0b", amenities: ["Pool", "WiFi", "Gym", "Restaurant"], tag: "Most Booked", emoji: "🏨", bookingUrl: "https://www.serenahotels.com/nairobi" },
  { id: 4, name: "Ol Pejeta Bush Camp", location: "Laikipia Conservancy", county: "Laikipia", category: "Safari Camp", price: 18000, rating: 4.9, reviews: 87, color: "#a855f7", amenities: ["Safari", "Meals", "Guide", "WiFi"], tag: "Hidden Gem", emoji: "🦁", bookingUrl: "https://www.olpejetabushcamp.com" },
  { id: 5, name: "Diani Reef Beach Resort", location: "Diani Beach, Kwale", county: "Kwale", category: "Beach Resort", price: 15000, rating: 4.6, reviews: 189, color: "#06b6d4", amenities: ["Beach", "Pool", "Diving", "Spa"], tag: null, emoji: "🤿", bookingUrl: "https://www.dianireef.com" },
  { id: 6, name: "Hemingways Nairobi", location: "Karen, Nairobi", county: "Nairobi", category: "Boutique Hotel", price: 32000, rating: 4.8, reviews: 134, color: "#f97316", amenities: ["Pool", "Spa", "Restaurant", "Bar"], tag: "Premium", emoji: "🌿", bookingUrl: "https://www.hemingways-collection.com/nairobi" },
  { id: 7, name: "Wildebeest Eco Camp", location: "Narok, Masai Mara", county: "Narok", category: "Camping Grounds", price: 5500, rating: 4.4, reviews: 97, color: "#84cc16", amenities: ["Tents", "Meals", "Safari", "Campfire"], tag: "Budget Pick", emoji: "🏕️", bookingUrl: "https://www.wildebeestcamp.com" },
  { id: 8, name: "Lake Nakuru Lodge", location: "Nakuru National Park", county: "Nakuru", category: "Mountain Lodge", price: 7800, rating: 4.5, reviews: 223, color: "#ec4899", amenities: ["Game Drive", "Restaurant", "WiFi", "Pool"], tag: null, emoji: "🦩", bookingUrl: "https://www.lakenakurulodge.com" },
  { id: 9, name: "Giraffe Centre & Hotel", location: "Langata, Nairobi", county: "Nairobi", category: "Eco Lodge", price: 4500, rating: 4.6, reviews: 410, color: "#f59e0b", amenities: ["Wildlife", "Restaurant", "WiFi", "Garden"], tag: "Family Fav", emoji: "🦒", bookingUrl: "https://www.giraffecentre.org" },
  { id: 10, name: "Watamu Treehouse", location: "Watamu, Kilifi", county: "Kilifi", category: "Beach Resort", price: 8800, rating: 4.7, reviews: 156, color: "#10b981", amenities: ["Beach", "WiFi", "Restaurant", "Snorkeling"], tag: null, emoji: "🌴", bookingUrl: "https://www.waratamutreehouse.com" },
  { id: 11, name: "Samburu Simba Lodge", location: "Samburu National Reserve", county: "Samburu", category: "Safari Camp", price: 21000, rating: 4.8, reviews: 76, color: "#dc2626", amenities: ["Safari", "Pool", "Restaurant", "Guide"], tag: "Wildlife", emoji: "🐘", bookingUrl: "https://www.simbalodge.com" },
  { id: 12, name: "Ole Sereni Hotel", location: "Nairobi National Park Gate", county: "Nairobi", category: "City Hotel", price: 11000, rating: 4.6, reviews: 288, color: "#6366f1", amenities: ["Pool", "WiFi", "Spa", "Game View"], tag: null, emoji: "🦓", bookingUrl: "https://www.olesereni.com" },
];

const categoryOptions = ["All", "Beach Resort", "City Hotel", "Mountain Lodge", "Safari Camp", "Camping Grounds", "Boutique Hotel", "Eco Lodge"];
const sortOptions = ["Recommended", "Price: Low to High", "Price: High to Low", "Highest Rated", "Most Reviewed"];
const categoryIcons = {
  "Beach Resort": "🏖️", "City Hotel": "🏨", "Mountain Lodge": "⛰️",
  "Safari Camp": "🦁", "Camping Grounds": "🏕️", "Boutique Hotel": "🌿",
  "Eco Lodge": "🌱", "All": "🌍",
};

const sortToApi = {
  Recommended: "recommended",
  "Price: Low to High": "price-asc",
  "Price: High to Low": "price-desc",
  "Highest Rated": "rating-desc",
  "Most Reviewed": "reviews-desc",
};

export default function TourismListingsPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Recommended");
  const [maxPrice, setMaxPrice] = useState(35000);
  const [minRating, setMinRating] = useState(0);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [properties, setProperties] = useState(allProperties);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setApiError("");
      try {
        const data = await fetchTourismListings({
          category: category === "All" ? undefined : category,
          maxPrice,
          minRating: minRating || undefined,
          search: search || undefined,
          sort: sortToApi[sort] || "recommended",
        });
        if (!cancelled && data.length) setProperties(data);
      } catch (err) {
        if (!cancelled) {
          setApiError(err.message);
          setProperties(
            allProperties
              .filter((p) => category === "All" || p.category === category)
              .filter((p) => p.price <= maxPrice)
              .filter((p) => p.rating >= minRating)
              .filter((p) =>
                !search ||
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.location.toLowerCase().includes(search.toLowerCase()) ||
                p.county.toLowerCase().includes(search.toLowerCase())
              )
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [category, sort, maxPrice, minRating, search]);

  const filtered = properties
    .filter((p) => category === "All" || p.category === category)
    .filter((p) => p.price <= maxPrice)
    .filter((p) => p.rating >= minRating)
    .filter((p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase()) ||
      (p.county || "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "Price: Low to High") return a.price - b.price;
      if (sort === "Price: High to Low") return b.price - a.price;
      if (sort === "Highest Rated") return b.rating - a.rating;
      if (sort === "Most Reviewed") return b.reviews - a.reviews;
      return 0;
    });

  const hasActiveFilters = category !== "All" || minRating > 0 || maxPrice < 35000;

  const FilterContent = () => (
    <>
      <div style={s.filterGroup}>
        <div style={s.filterLabel}>Category</div>
        {categoryOptions.map((c) => (
          <button key={c} style={{ ...s.filterChip, ...(category === c ? s.filterChipActive : {}) }} onClick={() => setCategory(c)}>
            {categoryIcons[c] || "🌍"} {c}
          </button>
        ))}
      </div>
      <div style={s.filterGroup}>
        <div style={s.filterLabel}>Max Price / Night</div>
        <div style={s.priceDisplay}>KSh {maxPrice.toLocaleString()}</div>
        <input type="range" min={1000} max={35000} step={500} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} style={s.slider} />
        <div style={s.priceRange}><span>KSh 1K</span><span>KSh 35K</span></div>
      </div>
      <div style={s.filterGroup}>
        <div style={s.filterLabel}>Minimum Rating</div>
        {[0, 4, 4.5, 4.7].map((r) => (
          <button key={r} style={{ ...s.filterChip, ...(minRating === r ? s.filterChipActive : {}) }} onClick={() => setMinRating(r)}>
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
      <button style={s.clearBtn} onClick={() => { setCategory("All"); setMaxPrice(35000); setMinRating(0); setSearch(""); }}>
        Clear All Filters
      </button>
    </>
  );

  return (
    <div style={s.root}>
      <style>{css}</style>

      {/* ── HEADER ── */}
      <div style={s.header}>
        <div style={s.headerInner}>
          <button style={s.logoBtn} onClick={() => navigate("/tourism")}>
            <span style={s.logoAccent}>AXX</span><span style={s.logoWord}>SPACE</span>
            <span style={s.logoPipe}>|</span>
            <span style={s.logoLabel}>Tourism</span>
          </button>
          <input
            style={s.searchBar}
            placeholder="🔍  Search by name, location, county..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={s.headerActions}>
            <button style={s.viewBtn} onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")} title="Toggle view">
              {viewMode === "grid" ? "☰" : "⊞"}
            </button>
            <button className="filter-toggle-btn" onClick={() => setFiltersOpen(!filtersOpen)}>
              ⚙️ Filters {hasActiveFilters && <span style={s.filterDot} />}
            </button>
            <button style={s.listBtn} onClick={() => navigate("/tourism/register-property")}>
              + List Property
            </button>
          </div>
        </div>
        <div style={s.resultsMeta}>
          {loading ? "Loading…" : apiError ? `Showing offline data · ${apiError}` : null}
          <strong>{filtered.length}</strong> properties found across Kenya
          {category !== "All" && <span style={s.metaChip}>{category}</span>}
          {minRating > 0 && <span style={s.metaChip}>⭐ {minRating}+</span>}
        </div>
      </div>

      {/* ── MOBILE FILTER DRAWER ── */}
      <div className={`mobile-drawer ${filtersOpen ? "drawer-open" : ""}`}>
        <div style={s.drawerHeader}>
          <span style={{ fontWeight: 800, fontSize: "15px", color: "#1f2937" }}>Filters</span>
          <button style={s.drawerClose} onClick={() => setFiltersOpen(false)}>✕</button>
        </div>
        <FilterContent />
        <button style={s.applyBtn} onClick={() => setFiltersOpen(false)}>
          ✓ Show {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </button>
      </div>

      <div className="page-body">
        {/* ── DESKTOP SIDEBAR ── */}
        <aside className="desktop-sidebar">
          <h3 style={s.filterTitle}>Filters</h3>
          <FilterContent />
        </aside>

        {/* ── LISTINGS ── */}
        <main>
          {filtered.length === 0 ? (
            <div style={s.empty}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
              <h3 style={{ color: "#1f2937", marginBottom: "8px" }}>No properties found</h3>
              <p style={{ color: "#6b7280" }}>Try adjusting your filters or search terms</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="prop-grid">
              {filtered.map((p) => (
                <PropertyCard key={p.id} p={p} navigate={navigate} />
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filtered.map((p) => (
                <PropertyListItem key={p.id} p={p} navigate={navigate} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function PropertyCard({ p, navigate }) {
  return (
    <div className="prop-card" onClick={() => navigate(`/tourism/${p.id}`)}>
      <div style={{ height: "150px", background: `linear-gradient(135deg, ${p.color}25, ${p.color}10)`, border: `1px solid ${p.color}25`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <span style={{ fontSize: "52px" }}>{p.emoji}</span>
        {p.tag && <div style={{ position: "absolute", top: "10px", left: "10px", background: p.color, color: "white", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px" }}>{p.tag}</div>}
        {p.bookingUrl && <div style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(255,255,255,0.9)", color: "#6b7280", fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "20px" }}>🔗 Has Booking Site</div>}
      </div>
      <div style={{ padding: "14px" }}>
        <div style={{ fontSize: "10px", color: "#6b7280", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "4px" }}>{p.category}</div>
        <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#1f2937", margin: "0 0 4px", lineHeight: 1.3 }}>{p.name}</h3>
        <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>📍 {p.location}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px" }}>
          {p.amenities.map((a) => (
            <span key={a} style={{ background: "#f3f4f6", color: "#6b7280", fontSize: "10px", padding: "2px 7px", borderRadius: "20px" }}>{a}</span>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div>
            <span style={{ fontSize: "16px", fontWeight: 800, color: p.color }}>KSh {p.price.toLocaleString()}</span>
            <span style={{ fontSize: "11px", color: "#9ca3af" }}>/night</span>
          </div>
          <div style={{ fontSize: "12px", color: "#fbbf24", fontWeight: 700 }}>⭐ {p.rating} <span style={{ color: "#9ca3af" }}>({p.reviews})</span></div>
        </div>
        <button
          style={{ width: "100%", background: p.color, border: "none", color: "white", padding: "10px", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}
          onClick={(e) => { e.stopPropagation(); navigate(`/tourism/${p.id}`); }}
        >
          {p.bookingUrl ? "View & Book →" : "View Details →"}
        </button>
      </div>
    </div>
  );
}

function PropertyListItem({ p, navigate }) {
  return (
    <div className="list-card" onClick={() => navigate(`/tourism/${p.id}`)}>
      <div style={{ width: "120px", flexShrink: 0, background: `linear-gradient(135deg, ${p.color}25, ${p.color}10)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", borderRadius: "12px 0 0 12px" }}>
        {p.emoji}
      </div>
      <div style={{ flex: 1, padding: "14px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "180px" }}>
          <div style={{ fontSize: "10px", color: "#9ca3af", textTransform: "uppercase", fontWeight: 700, marginBottom: "2px" }}>{p.category}</div>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1f2937", marginBottom: "4px" }}>{p.name}</h3>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>📍 {p.location}</div>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ textAlign: "right" }}>
            <div><span style={{ fontSize: "18px", fontWeight: 800, color: p.color }}>KSh {p.price.toLocaleString()}</span><span style={{ fontSize: "11px", color: "#9ca3af" }}>/night</span></div>
            <div style={{ fontSize: "12px", color: "#fbbf24", fontWeight: 700 }}>⭐ {p.rating} ({p.reviews})</div>
          </div>
          <button
            style={{ background: p.color, border: "none", color: "white", borderRadius: "8px", padding: "9px 16px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
            onClick={(e) => { e.stopPropagation(); navigate(`/tourism/${p.id}`); }}
          >
            View →
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { fontFamily: "'DM Sans', sans-serif", background: "#f8f4f0", minHeight: "100vh", overflowX: "hidden" },
  header: { background: "white", borderBottom: "1px solid #e5e7eb", padding: "12px 16px", position: "sticky", top: 0, zIndex: 20 },
  headerInner: { maxWidth: "1400px", margin: "0 auto", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
  logoBtn: { background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "3px", fontFamily: "inherit", flexShrink: 0, padding: 0 },
  logoAccent: { fontSize: "16px", fontWeight: 900, color: "#fbbf24" },
  logoWord: { fontSize: "16px", fontWeight: 900, color: "#1f2937" },
  logoPipe: { color: "#e5e7eb", margin: "0 6px", fontSize: "14px" },
  logoLabel: { fontSize: "12px", fontWeight: 600, color: "#6b7280" },
  searchBar: { flex: 1, minWidth: "160px", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "9px 14px", fontSize: "14px", fontFamily: "inherit", outline: "none" },
  headerActions: { display: "flex", gap: "8px", alignItems: "center" },
  viewBtn: { background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 12px", fontSize: "16px", cursor: "pointer", fontFamily: "inherit", color: "#4b5563" },
  filterDot: { display: "inline-block", width: "7px", height: "7px", background: "#ef4444", borderRadius: "50%", marginLeft: "6px", verticalAlign: "middle" },
  listBtn: { background: "#fbbf24", color: "#1f2937", border: "none", borderRadius: "10px", padding: "9px 14px", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" },
  resultsMeta: { maxWidth: "1400px", margin: "8px auto 0", fontSize: "12px", color: "#6b7280", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" },
  metaChip: { background: "#fef9c3", color: "#92400e", fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px" },

  drawerHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #e5e7eb" },
  drawerClose: { background: "transparent", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "5px 12px", cursor: "pointer", fontSize: "13px", fontFamily: "inherit", color: "#6b7280" },
  applyBtn: { width: "100%", background: "#fbbf24", color: "#1f2937", border: "none", borderRadius: "10px", padding: "14px", fontSize: "14px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", marginTop: "8px" },

  filterTitle: { fontSize: "15px", fontWeight: 800, color: "#1f2937", marginBottom: "18px" },
  filterGroup: { marginBottom: "20px" },
  filterLabel: { fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" },
  filterChip: { display: "block", width: "100%", textAlign: "left", background: "transparent", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", cursor: "pointer", marginBottom: "5px", fontFamily: "inherit", color: "#4b5563" },
  filterChipActive: { background: "#fef9c3", borderColor: "#fbbf24", color: "#92400e", fontWeight: 700 },
  priceDisplay: { fontSize: "18px", fontWeight: 800, color: "#1f2937", marginBottom: "8px" },
  slider: { width: "100%", accentColor: "#fbbf24", marginBottom: "6px" },
  priceRange: { display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#9ca3af" },
  select: { width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "9px 12px", fontSize: "13px", fontFamily: "inherit", color: "#1f2937", outline: "none" },
  clearBtn: { width: "100%", background: "transparent", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px", fontSize: "13px", color: "#6b7280", cursor: "pointer", fontFamily: "inherit" },

  empty: { textAlign: "center", padding: "80px 20px" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  input:focus, select:focus { border-color: #fbbf24 !important; outline: none; }

  .filter-toggle-btn {
    display: none;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    color: #4b5563;
    align-items: center;
  }

  .mobile-drawer {
    display: none;
    background: white;
    border-bottom: 2px solid #e5e7eb;
    padding: 16px;
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.35s ease;
  }
  .mobile-drawer.drawer-open { max-height: 90vh; overflow-y: auto; }

  .desktop-sidebar {
    background: white;
    border-radius: 14px;
    padding: 20px;
    border: 1px solid #e5e7eb;
    position: sticky;
    top: 90px;
  }

  .page-body {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px 16px;
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 20px;
    align-items: start;
  }

  .prop-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }

  .prop-card {
    background: white;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    cursor: pointer;
    transition: all 0.22s;
  }
  .prop-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); border-color: #fbbf24; }

  .list-card {
    background: white;
    border-radius: 14px;
    border: 1px solid #e5e7eb;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    overflow: hidden;
    min-height: 90px;
  }
  .list-card:hover { border-color: #fbbf24; box-shadow: 0 6px 20px rgba(0,0,0,0.08); }

  @media (max-width: 860px) {
    .desktop-sidebar { display: none; }
    .filter-toggle-btn { display: flex; }
    .mobile-drawer { display: block; }
    .page-body { grid-template-columns: 1fr; }
    .prop-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 500px) {
    .prop-grid { grid-template-columns: 1fr; }
  }
`;