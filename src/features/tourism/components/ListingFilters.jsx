import { CATEGORY_OPTIONS, SORT_OPTIONS, CATEGORY_ICONS } from "../constants";

export default function ListingFilters({
  category,
  setCategory,
  sort,
  setSort,
  maxPrice,
  setMaxPrice,
  minRating,
  setMinRating,
  onClear,
}) {
  return (
    <>
      <div style={fg}>
        <div style={label}>Category</div>
        {CATEGORY_OPTIONS.map((c) => (
          <button
            key={c}
            type="button"
            style={{ ...chip, ...(category === c ? chipActive : {}) }}
            onClick={() => setCategory(c)}
          >
            {CATEGORY_ICONS[c] || "🌍"} {c}
          </button>
        ))}
      </div>

      <div style={fg}>
        <div style={label}>Max price / night</div>
        <div style={{ fontWeight: 800, color: "#1f2937", marginBottom: "8px" }}>KSh {maxPrice.toLocaleString()}</div>
        <input type="range" min={1000} max={35000} step={500} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} style={{ width: "100%" }} />
      </div>

      <div style={fg}>
        <div style={label}>Minimum rating</div>
        {[0, 4, 4.5, 4.7].map((r) => (
          <button key={r} type="button" style={{ ...chip, ...(minRating === r ? chipActive : {}) }} onClick={() => setMinRating(r)}>
            {r === 0 ? "Any rating" : `⭐ ${r}+`}
          </button>
        ))}
      </div>

      <div style={fg}>
        <div style={label}>Sort by</div>
        <select style={select} value={sort} onChange={(e) => setSort(e.target.value)}>
          {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>

      <button type="button" style={clearBtn} onClick={onClear}>Clear all filters</button>
    </>
  );
}

const fg = { marginBottom: "20px" };
const label = { fontSize: "11px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" };
const chip = { display: "block", width: "100%", textAlign: "left", border: "1px solid #e5e7eb", background: "white", borderRadius: "8px", padding: "8px 12px", marginBottom: "6px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", color: "#4b5563" };
const chipActive = { background: "#fef9c3", borderColor: "#fbbf24", color: "#92400e", fontWeight: 700 };
const select = { width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px", fontFamily: "inherit", fontSize: "14px" };
const clearBtn = { width: "100%", background: "transparent", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: "#6b7280" };
