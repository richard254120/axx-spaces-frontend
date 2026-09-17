import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AccommodationSearch() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    type: searchParams.get("type") || "",
    search: searchParams.get("search") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    maxGuests: searchParams.get("maxGuests") || "",
    featured: searchParams.get("featured") === "true",
  });

  useEffect(() => {
    fetchAccommodations();
  }, [filters]);

  const fetchAccommodations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.type) params.append("type", filters.type);
      if (filters.search) params.append("search", filters.search);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.maxGuests) params.append("maxGuests", filters.maxGuests);
      if (filters.featured) params.append("featured", "true");

      const response = await axios.get(`${API_URL}/api/accommodations?${params.toString()}`);
      setAccommodations(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching accommodations:", err);
      setError("Failed to load accommodations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== "" && v !== false) {
        params.set(k, v);
      }
    });
    setSearchParams(params);
  };

  const getPrimaryImage = (images) => {
    if (!images || images.length === 0) return null;
    const primary = images.find(img => img.isPrimary);
    return primary ? primary.imageUrl : images[0].imageUrl;
  };

  const getTypeLabel = (type) => {
    const labels = {
      hotel: "Hotel",
      bnb: "B&B",
      guesthouse: "Guesthouse",
      apartment: "Apartment",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: "18px", color: "#6b7280" }}>Loading accommodations...</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #065f46 0%, #047857 100%)", padding: "60px 20px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 900, color: "white", marginBottom: "12px" }}>
            Find Your Perfect Stay
          </h1>
          <p style={{ fontSize: "16px", color: "#d1fae5", marginBottom: "24px" }}>
            Discover hotels, B&Bs, guesthouses, and apartments across Kenya
          </p>

          {/* Search Bar */}
          <div style={{ background: "white", borderRadius: "12px", padding: "8px", display: "flex", gap: "8px", maxWidth: "600px" }}>
            <input
              type="text"
              placeholder="Search by name, location, or description..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              style={{ flex: 1, border: "none", outline: "none", padding: "12px 16px", fontSize: "15px", fontFamily: "inherit" }}
            />
            <button
              onClick={() => fetchAccommodations()}
              style={{ background: "#059669", color: "white", border: "none", borderRadius: "8px", padding: "12px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 20px", display: "flex", gap: "32px" }}>
        {/* Filters Sidebar */}
        <div style={{ width: "280px", flexShrink: 0 }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "24px", border: "1px solid #e5e7eb", position: "sticky", top: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#065f46", marginBottom: "20px" }}>Filters</h3>

            {/* Type Filter */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px", display: "block" }}>
                Accommodation Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
              >
                <option value="">All Types</option>
                <option value="hotel">Hotel</option>
                <option value="bnb">B&B</option>
                <option value="guesthouse">Guesthouse</option>
                <option value="apartment">Apartment</option>
              </select>
            </div>

            {/* Price Range */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px", display: "block" }}>
                Price Range (KSh/night)
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                  style={{ flex: 1, padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                  style={{ flex: 1, padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
                />
              </div>
            </div>

            {/* Guests */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px", display: "block" }}>
                Max Guests
              </label>
              <input
                type="number"
                placeholder="Any"
                value={filters.maxGuests}
                onChange={(e) => handleFilterChange("maxGuests", e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
              />
            </div>

            {/* Featured Toggle */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => handleFilterChange("featured", e.target.checked)}
                  style={{ width: "18px", height: "18px" }}
                />
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>Featured only</span>
              </label>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setFilters({ type: "", search: "", minPrice: "", maxPrice: "", maxGuests: "", featured: false });
                setSearchParams({});
              }}
              style={{ width: "100%", padding: "10px 16px", background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results */}
        <div style={{ flex: 1 }}>
          {error && (
            <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: "8px", padding: "16px", marginBottom: "24px", color: "#991b1b" }}>
              {error}
            </div>
          )}

          {accommodations.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏨</div>
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#374151", marginBottom: "8px" }}>No accommodations found</h3>
              <p style={{ fontSize: "14px", color: "#6b7280" }}>Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "16px", fontSize: "14px", color: "#6b7280" }}>
                {accommodations.length} accommodation{accommodations.length !== 1 ? "s" : ""} found
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
                {accommodations.map((accommodation) => {
                  const primaryImage = getPrimaryImage(accommodation.images);
                  return (
                    <div
                      key={accommodation._id}
                      onClick={() => navigate(`/accommodation-booking-detail/${accommodation._id}`)}
                      style={{ background: "white", borderRadius: "16px", overflow: "hidden", border: "1px solid #e5e7eb", cursor: "pointer", transition: "all 0.3s", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}
                    >
                      {/* Image */}
                      <div style={{ height: "200px", background: "#f3f4f6", position: "relative" }}>
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={accommodation.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "48px" }}>
                            🏨
                          </div>
                        )}
                        {accommodation.isFeatured && (
                          <div style={{ position: "absolute", top: "12px", left: "12px", background: "#fbbf24", color: "#1f2937", fontSize: "11px", fontWeight: 800, padding: "4px 12px", borderRadius: "20px", textTransform: "uppercase" }}>
                            Featured
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ padding: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                          <span style={{ fontSize: "11px", color: "#059669", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em" }}>
                            {getTypeLabel(accommodation.type)}
                          </span>
                          {accommodation.verificationBadges && accommodation.verificationBadges.length > 0 && (
                            <span style={{ fontSize: "12px" }}>✓</span>
                          )}
                        </div>

                        <h3 style={{
                          fontSize: "16px", fontWeight: 800, color: "#065f46", marginBottom: "8px", lineHeight: 1.3
                        }}>
                          {accommodation.name}
                        </h3>

                        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "12px", color: "#6b7280", fontSize: "13px" }}>
                          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          {accommodation.address}
                        </div>

                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                          {accommodation.amenities && accommodation.amenities.slice(0, 3).map((amenity, idx) => (
                            <span key={idx} style={{ fontSize: "11px", background: "#f3f4f6", color: "#6b7280", padding: "4px 8px", borderRadius: "4px" }}>
                              {amenity}
                            </span>
                          ))}
                          {accommodation.amenities && accommodation.amenities.length > 3 && (
                            <span style={{ fontSize: "11px", color: "#6b7280" }}>+{accommodation.amenities.length - 3} more</span>
                          )}
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid #f3f4f6" }}>
                          <div style={{ fontSize: "12px", color: "#6b7280" }}>
                            Up to {accommodation.maxGuests} guests • {accommodation.totalRooms} room{accommodation.totalRooms !== 1 ? "s" : ""}
                          </div>
                          <button style={{ background: "#059669", color: "white", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div >
  );
}
