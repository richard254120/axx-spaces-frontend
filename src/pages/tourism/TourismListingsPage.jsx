import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useTourismListings,
  TourismNav,
  PropertyCard,
  ListingFilters,
  LoadingBlock,
  ErrorAlert,
  EmptyState,
  TOURISM_FONT_CSS,
  tourismTheme,
} from "../../features/tourism";

const listingsCss = `
  .page-body { max-width: 1400px; margin: 0 auto; padding: 20px 16px; display: grid; grid-template-columns: 260px 1fr; gap: 24px; }
  .desktop-sidebar { background: white; border-radius: 14px; padding: 20px; border: 1px solid #e5e7eb; position: sticky; top: 80px; height: fit-content; }
  .prop-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .prop-card { background: white; border-radius: 14px; border: 1px solid #e5e7eb; overflow: hidden; transition: box-shadow 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  .prop-card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
  .prop-card-img { aspect-ratio: 1/1; object-fit: cover; }
  .mobile-drawer { display: none; }
  @media (max-width: 900px) {
    .page-body { grid-template-columns: 1fr; }
    .desktop-sidebar { display: none; }
    .mobile-drawer.drawer-open { display: block; position: fixed; inset: 0; top: 120px; background: white; z-index: 200; padding: 20px; overflow-y: auto; border-top: 1px solid #e5e7eb; }
  }
`;

export default function TourismListingsPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Recommended");
  const [maxPrice, setMaxPrice] = useState(35000);
  const [minRating, setMinRating] = useState(0);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { properties, loading, offline, error, total } = useTourismListings({
    category, sort, maxPrice, minRating, search,
  });

  const clearFilters = () => {
    setCategory("All");
    setMaxPrice(35000);
    setMinRating(0);
    setSearch("");
  };

  const openProperty = (id) => navigate(`/tourism/${id}`);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: tourismTheme.bg, minHeight: "100vh" }}>
      <style>{TOURISM_FONT_CSS}{listingsCss}</style>

      <TourismNav
        showSearch
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={() => navigate("/tourism/listings")}
        extraActions={
          <button
            type="button"
            className="filter-toggle-btn"
            onClick={() => setFiltersOpen(!filtersOpen)}
            style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            ⚙️ Filters
          </button>
        }
      />

      <div style={{ maxWidth: "1400px", margin: "8px auto 0", padding: "0 16px", fontSize: "13px", color: tourismTheme.muted }}>
        {loading && <span>Loading… </span>}
        {offline && <span style={{ color: "#b45309" }}>Offline preview · </span>}
        <strong style={{ color: tourismTheme.text }}>{total}</strong> properties found
      </div>

      {error && offline && (
        <div style={{ maxWidth: "1400px", margin: "12px auto", padding: "0 16px" }}>
          <ErrorAlert message={`Could not reach server: ${error}. Showing sample listings.`} />
        </div>
      )}

      <div className={`mobile-drawer ${filtersOpen ? "drawer-open" : ""}`}>
        <ListingFilters
          category={category} setCategory={setCategory}
          sort={sort} setSort={setSort}
          maxPrice={maxPrice} setMaxPrice={setMaxPrice}
          minRating={minRating} setMinRating={setMinRating}
          onClear={() => { clearFilters(); setFiltersOpen(false); }}
        />
      </div>

      <div className="page-body">
        <aside className="desktop-sidebar">
          <h3 style={{ fontSize: "15px", fontWeight: 800, marginBottom: "16px" }}>Filters</h3>
          <ListingFilters
            category={category} setCategory={setCategory}
            sort={sort} setSort={setSort}
            maxPrice={maxPrice} setMaxPrice={setMaxPrice}
            minRating={minRating} setMinRating={setMinRating}
            onClear={clearFilters}
          />
        </aside>

        <main>
          {loading ? (
            <LoadingBlock />
          ) : total === 0 ? (
            <EmptyState
              action={
                <button type="button" onClick={clearFilters} style={{ background: tourismTheme.accent, border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: 800, cursor: "pointer" }}>
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="prop-grid">
              {properties.map((p) => (
                <PropertyCard key={p.id || p._id} property={p} onOpen={openProperty} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
