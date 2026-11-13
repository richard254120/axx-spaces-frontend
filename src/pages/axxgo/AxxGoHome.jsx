import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../../api/api";
import AxxGoCard from "../../components/axxgo/AxxGoCard";
import AxxGoSafetyBanner from "../../components/axxgo/AxxGoSafetyBanner";
import { COUNTIES, CATEGORIES } from "../../data/axxgoData";
import {
  IconGrid,
  IconHome,
  IconBed,
  IconBriefcase,
  IconTag,
  IconSearch,
  IconSliders,
  IconMapPin,
  IconPlus,
} from "../../components/axxgo/AxxGoIcons";

function renderCategoryIcon(category, size = 14, color = "currentColor") {
  switch (category) {
    case "Rentals":
      return <IconHome size={size} color={color} />;
    case "Accommodation":
      return <IconBed size={size} color={color} />;
    case "AxxBiashara":
      return <IconBriefcase size={size} color={color} />;
    case "Quick Sales":
      return <IconTag size={size} color={color} />;
    default:
      return <IconTag size={size} color={color} />;
  }
}

export default function AxxGoHome() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Active filters from URL query params
  const activeCategory = searchParams.get("category") || "All";
  const activeCounty = searchParams.get("county") || "All";
  const activeSearch = searchParams.get("q") || "";
  const activeSort = searchParams.get("sort") || "newest";
  const activeMinPrice = searchParams.get("minPrice") || "";
  const activeMaxPrice = searchParams.get("maxPrice") || "";
  const activePage = parseInt(searchParams.get("page") || "1", 10);

  // Local state
  const [searchInput, setSearchInput] = useState(activeSearch);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Sync search input if URL changes externally
  useEffect(() => {
    setSearchInput(activeSearch);
  }, [activeSearch]);

  // Fetch listings
  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: activePage,
        limit: 20,
        sort: activeSort,
      };

      if (activeCategory && activeCategory !== "All") params.category = activeCategory;
      if (activeCounty && activeCounty !== "All") params.county = activeCounty;
      if (activeSearch && activeSearch.trim()) params.search = activeSearch.trim();
      if (activeMinPrice) params.minPrice = activeMinPrice;
      if (activeMaxPrice) params.maxPrice = activeMaxPrice;

      const res = await API.get("/axxgo/listings", { params });
      if (res.data.success) {
        setListings(res.data.listings || []);
        setPagination(res.data.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 });
      }
    } catch (err) {
      console.error("Error fetching AxxGo listings:", err);
      setError("Unable to load listings. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeCounty, activeSearch, activeSort, activeMinPrice, activeMaxPrice, activePage]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Update query params helper
  const updateParams = (newParams) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === null || v === undefined || v === "" || v === "All") {
        next.delete(k);
      } else {
        next.set(k, v);
      }
    });
    if (!newParams.page) {
      next.delete("page");
    }
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ q: searchInput });
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    activeCategory !== "All" ||
    activeCounty !== "All" ||
    activeSearch !== "" ||
    activeMinPrice !== "" ||
    activeMaxPrice !== "";

  return (
    <div style={{ background: "#0f1729", minHeight: "100vh", color: "#f8fafc", paddingBottom: "60px" }}>
      {/* ── Top Hero & Post Button Banner ── */}
      <div
        style={{
          background: "linear-gradient(180deg, #1e293b 0%, #0f1729 100%)",
          borderBottom: "1px solid #334155",
          padding: "36px 16px 28px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span
                  style={{
                    background: "rgba(220, 38, 38, 0.2)",
                    border: "1px solid #ef4444",
                    color: "#fca5a5",
                    fontSize: "12px",
                    fontWeight: "800",
                    textTransform: "uppercase",
                    padding: "3px 10px",
                    borderRadius: "20px",
                    letterSpacing: "0.8px",
                  }}
                >
                  Instant Classifieds • No Sign-In Needed
                </span>
              </div>
              <h1
                style={{
                  margin: "0 0 8px",
                  fontSize: "clamp(26px, 4vw, 36px)",
                  fontWeight: "800",
                  letterSpacing: "-0.5px",
                  background: "linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                AxxGo Marketplace
              </h1>
              <p style={{ margin: 0, fontSize: "15px", color: "#94a3b8", maxWidth: "600px", lineHeight: 1.5 }}>
                Post rentals, student hostels, businesses, or items for quick sale in Kenya. Listings publish
                <strong> instantly</strong> without waiting for approval.
              </p>
            </div>

            {/* Prominent "Post on AxxGo" Button */}
            <div style={{ flexShrink: 0 }}>
              <Link
                to="/axxgo/post"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: "800",
                  padding: "14px 26px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  boxShadow: "0 6px 20px -2px rgba(220, 38, 38, 0.5)",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(220, 38, 38, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 6px 20px -2px rgba(220, 38, 38, 0.5)";
                }}
              >
                <IconPlus size={18} color="#ffffff" strokeWidth={2.5} />
                <span>Post on AxxGo Free</span>
              </Link>
            </div>
          </div>

          {/* ── Search Bar ── */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              marginTop: "24px",
              display: "flex",
              gap: "8px",
              background: "#1e293b",
              padding: "6px",
              borderRadius: "12px",
              border: "1px solid #475569",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", paddingLeft: "12px", color: "#94a3b8" }}>
              <IconSearch size={18} color="#94a3b8" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by keywords, item, area (e.g. 'iPhone 13', 'Westlands Bedsitter', 'Salon')..."
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#ffffff",
                fontSize: "15px",
                padding: "8px 4px",
                margin: 0,
              }}
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  updateParams({ q: "" });
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  padding: "0 10px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              style={{
                background: "#dc2626",
                border: "none",
                color: "white",
                fontWeight: "700",
                fontSize: "14px",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              Search
            </button>
          </form>

          {/* ── Category Chips ── */}
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              paddingBottom: "6px",
              scrollbarWidth: "none",
            }}
          >
            <button
              type="button"
              onClick={() => updateParams({ category: "All" })}
              style={{
                background: activeCategory === "All" ? "#dc2626" : "#1e293b",
                color: "#ffffff",
                border: `1px solid ${activeCategory === "All" ? "#dc2626" : "#334155"}`,
                borderRadius: "30px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                flexShrink: 0,
              }}
            >
              <IconGrid size={14} color="#ffffff" />
              <span>All Classifieds</span>
            </button>

            {CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => updateParams({ category: cat.id })}
                  style={{
                    background: isSelected ? cat.color : "#1e293b",
                    color: "#ffffff",
                    border: `1px solid ${isSelected ? cat.color : "#334155"}`,
                    borderRadius: "30px",
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                  }}
                >
                  {renderCategoryIcon(cat.id, 14, "#ffffff")}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px" }}>
        {/* Safety Notice */}
        <AxxGoSafetyBanner />

        {/* ── Filter Bar: County, Sort, More Filters Toggle ── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            margin: "18px 0 20px",
            padding: "12px 16px",
            background: "#1e293b",
            borderRadius: "10px",
            border: "1px solid #334155",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
            {/* County Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <IconMapPin size={14} color="#ef4444" />
              <span style={{ fontSize: "13px", color: "#94a3b8" }}>County:</span>
              <select
                value={activeCounty}
                onChange={(e) => updateParams({ county: e.target.value })}
                style={{
                  background: "#0f1729",
                  border: "1px solid #475569",
                  color: "#ffffff",
                  fontSize: "13px",
                  borderRadius: "6px",
                  padding: "6px 10px",
                  cursor: "pointer",
                  width: "auto",
                  margin: 0,
                }}
              >
                <option value="All">All Counties (Kenya)</option>
                {COUNTIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "13px", color: "#94a3b8" }}>Sort:</span>
              <select
                value={activeSort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                style={{
                  background: "#0f1729",
                  border: "1px solid #475569",
                  color: "#ffffff",
                  fontSize: "13px",
                  borderRadius: "6px",
                  padding: "6px 10px",
                  cursor: "pointer",
                  width: "auto",
                  margin: 0,
                }}
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Viewed</option>
              </select>
            </div>

            {/* Toggle Price Filter Panel */}
            <button
              type="button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              style={{
                background: filtersOpen ? "rgba(220, 38, 38, 0.2)" : "transparent",
                border: `1px solid ${filtersOpen ? "#ef4444" : "#475569"}`,
                color: filtersOpen ? "#fca5a5" : "#cbd5e1",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "13px",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
              }}
            >
              <IconSliders size={13} color={filtersOpen ? "#fca5a5" : "#cbd5e1"} />
              <span>Price Filter {activeMinPrice || activeMaxPrice ? "• Active" : ""}</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#f87171",
                  fontSize: "13px",
                  fontWeight: "600",
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: "4px 8px",
                }}
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Result Count Indicator */}
          <div style={{ fontSize: "13px", color: "#94a3b8" }}>
            {loading ? "Searching..." : `${pagination.total} listings found`}
          </div>
        </div>

        {/* ── Expandable Price Filter Dropdown ── */}
        {filtersOpen && (
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #475569",
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "20px",
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              alignItems: "flex-end",
            }}
          >
            <div style={{ minWidth: "140px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
                Min Price (KES)
              </label>
              <input
                type="number"
                value={activeMinPrice}
                onChange={(e) => updateParams({ minPrice: e.target.value })}
                placeholder="e.g. 5000"
                style={{
                  background: "#0f1729",
                  border: "1px solid #334155",
                  color: "white",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  margin: 0,
                }}
              />
            </div>
            <div style={{ minWidth: "140px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
                Max Price (KES)
              </label>
              <input
                type="number"
                value={activeMaxPrice}
                onChange={(e) => updateParams({ maxPrice: e.target.value })}
                placeholder="e.g. 50000"
                style={{
                  background: "#0f1729",
                  border: "1px solid #334155",
                  color: "white",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  margin: 0,
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => updateParams({ minPrice: "", maxPrice: "" })}
              style={{
                background: "transparent",
                border: "1px solid #475569",
                color: "#cbd5e1",
                padding: "8px 14px",
                borderRadius: "6px",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Clear Price
            </button>
          </div>
        )}

        {/* ── Listings Grid or Loading / Error / Empty States ── */}
        {loading ? (
          <div
            style={{
              padding: "80px 20px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "3px solid rgba(220, 38, 38, 0.2)",
                borderTopColor: "#dc2626",
                animation: "spin 0.8s linear infinite",
                marginBottom: "16px",
              }}
            />
            <p style={{ color: "#94a3b8", fontSize: "15px" }}>Loading live classifieds...</p>
            <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
          </div>
        ) : error ? (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid #ef4444",
              borderRadius: "10px",
              padding: "24px",
              textAlign: "center",
              color: "#fca5a5",
              margin: "30px 0",
            }}
          >
            <p style={{ margin: "0 0 14px", fontSize: "15px" }}>{error}</p>
            <button
              type="button"
              onClick={fetchListings}
              style={{
                background: "#dc2626",
                border: "none",
                color: "white",
                fontWeight: "700",
                padding: "8px 18px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        ) : listings.length === 0 ? (
          <div
            style={{
              background: "#1e293b",
              border: "1px dashed #475569",
              borderRadius: "14px",
              padding: "60px 20px",
              textAlign: "center",
              margin: "30px 0",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}>
              <IconTag size={42} color="#64748b" />
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: "700" }}>No Listings Found</h3>
            <p style={{ margin: "0 0 20px", color: "#94a3b8", fontSize: "14px", maxWidth: "450px", marginLeft: "auto", marginRight: "auto" }}>
              {hasActiveFilters
                ? "No classifieds matched your current filters. Try resetting your search or widening your price/location range."
                : "There are no listings in this category yet. Be the first to post your listing!"}
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  style={{
                    background: "transparent",
                    border: "1px solid #475569",
                    color: "#cbd5e1",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Clear Filters
                </button>
              )}
              <Link
                to="/axxgo/post"
                style={{
                  background: "#dc2626",
                  color: "white",
                  padding: "10px 22px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "14px",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Post on AxxGo Now
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "18px",
              }}
            >
              {listings.map((item) => (
                <AxxGoCard key={item._id} listing={item} />
              ))}
            </div>

            {/* ── Pagination Controls ── */}
            {pagination.totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "40px",
                }}
              >
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => updateParams({ page: pagination.page - 1 })}
                  style={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: pagination.page <= 1 ? "#64748b" : "#f1f5f9",
                    padding: "8px 14px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: pagination.page <= 1 ? "not-allowed" : "pointer",
                  }}
                >
                  ← Previous
                </button>

                <span style={{ fontSize: "13px", color: "#94a3b8", padding: "0 8px" }}>
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => updateParams({ page: pagination.page + 1 })}
                  style={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: pagination.page >= pagination.totalPages ? "#64748b" : "#f1f5f9",
                    padding: "8px 14px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: pagination.page >= pagination.totalPages ? "not-allowed" : "pointer",
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
