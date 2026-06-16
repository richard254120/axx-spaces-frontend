import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:1000";

export default function BadgeManagement() {
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [badgeType, setBadgeType] = useState("");
  const [listingType, setListingType] = useState("all");
  const [filterBadgeType, setFilterBadgeType] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const badgeTypes = [
    { value: "premium_verified", label: "Premium Verified", icon: "⭐", color: "#fbbf24" },
    { value: "student_verified", label: "Student Verified", icon: "🎓", color: "#3b82f6" },
    { value: "business_verified", label: "Business Verified", icon: "🏢", color: "#8b5cf6" },
    { value: "identity_verified", label: "Identity Verified", icon: "🪪", color: "#22c55e" },
    { value: "location_verified", label: "Location Verified", icon: "📍", color: "#ef4444" },
    { value: "online_verified", label: "Online Verified", icon: "🌐", color: "#06b6d4" },
  ];

  useEffect(() => {
    loadListings();
    loadStats();
  }, [listingType, filterBadgeType]);

  const loadListings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const params = {};
      if (listingType !== "all") params.listingType = listingType;
      if (filterBadgeType) params.badgeType = filterBadgeType;

      const response = await axios.get(`${API_BASE}/api/badges`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      setListings(response.data.listings || []);
    } catch (error) {
      console.error("Error loading listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(`${API_BASE}/api/badges/stats/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleIssueBadge = async () => {
    if (!selectedListing || !badgeType) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `${API_BASE}/api/badges/issue`,
        {
          listingType: selectedListing.listingType,
          listingId: selectedListing._id,
          badgeType,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Badge issued successfully!");
      setBadgeType("");
      setSelectedListing(null);
      loadListings();
      loadStats();
    } catch (error) {
      console.error("Error issuing badge:", error);
      alert(error.response?.data?.error || "Failed to issue badge");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBadge = async (listing, badgeTypeToRemove) => {
    if (!confirm(`Remove ${badgeTypeToRemove} badge from this listing?`)) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `${API_BASE}/api/badges/remove`,
        {
          listingType: listing.listingType,
          listingId: listing._id,
          badgeType: badgeTypeToRemove,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Badge removed successfully!");
      loadListings();
      loadStats();
    } catch (error) {
      console.error("Error removing badge:", error);
      alert(error.response?.data?.error || "Failed to remove badge");
    } finally {
      setLoading(false);
    }
  };

  const getListingTitle = (listing) => {
    switch (listing.listingType) {
      case "property":
        return listing.title;
      case "material":
        return listing.title;
      case "tourism":
        return listing.name;
      case "business":
        return listing.name;
      default:
        return "Unknown";
    }
  };

  const getListingOwner = (listing) => {
    switch (listing.listingType) {
      case "property":
        return listing.owner?.name || listing.owner?.email;
      case "material":
        return listing.seller?.name || listing.seller?.email;
      case "tourism":
        return listing.owner?.name || listing.owner?.email;
      case "business":
        return listing.owner?.name || listing.owner?.email;
      default:
        return "Unknown";
    }
  };

  return (
    <div style={styles.container}>
      <style>{css}</style>

      <h2 style={styles.header}>Badge Management</h2>

      {/* Statistics */}
      {stats && (
        <div style={styles.statsGrid}>
          {badgeTypes.map((badge) => (
            <div key={badge.value} style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: `${badge.color}20`, color: badge.color }}>
                {badge.icon}
              </div>
              <div style={styles.statInfo}>
                <div style={styles.statLabel}>{badge.label}</div>
                <div style={styles.statValue}>{stats[badge.value]?.total || 0}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={styles.filters}>
        <select
          style={styles.select}
          value={listingType}
          onChange={(e) => setListingType(e.target.value)}
        >
          <option value="all">All Listing Types</option>
          <option value="property">Properties</option>
          <option value="material">Materials</option>
          <option value="tourism">Tourism</option>
          <option value="business">Businesses</option>
        </select>

        <select
          style={styles.select}
          value={filterBadgeType}
          onChange={(e) => setFilterBadgeType(e.target.value)}
        >
          <option value="">All Badge Types</option>
          {badgeTypes.map((badge) => (
            <option key={badge.value} value={badge.value}>
              {badge.label}
            </option>
          ))}
        </select>
      </div>

      {/* Issue Badge Form */}
      <div style={styles.issueForm}>
        <h3 style={styles.formTitle}>Issue New Badge</h3>
        <div style={styles.formRow}>
          <select
            style={styles.select}
            value={selectedListing?._id || ""}
            onChange={(e) => {
              const listing = listings.find((l) => l._id === e.target.value);
              setSelectedListing(listing);
            }}
          >
            <option value="">Select Listing</option>
            {listings.map((listing) => (
              <option key={listing._id} value={listing._id}>
                {listing.listingType.toUpperCase()} - {getListingTitle(listing)} ({getListingOwner(listing)})
              </option>
            ))}
          </select>

          <select
            style={styles.select}
            value={badgeType}
            onChange={(e) => setBadgeType(e.target.value)}
          >
            <option value="">Select Badge Type</option>
            {badgeTypes.map((badge) => (
              <option key={badge.value} value={badge.value}>
                {badge.icon} {badge.label}
              </option>
            ))}
          </select>

          <button
            style={styles.button}
            onClick={handleIssueBadge}
            disabled={!selectedListing || !badgeType || loading}
          >
            Issue Badge
          </button>
        </div>
      </div>

      {/* Listings with Badges */}
      <div style={styles.listingsSection}>
        <h3 style={styles.sectionTitle}>Listings with Badges</h3>
        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : listings.length === 0 ? (
          <div style={styles.empty}>No listings found</div>
        ) : (
          <div style={styles.listingsGrid}>
            {listings.map((listing) => (
              <div key={listing._id} style={styles.listingCard}>
                <div style={styles.listingHeader}>
                  <span style={styles.listingType}>{listing.listingType.toUpperCase()}</span>
                  <span style={styles.listingTitle}>{getListingTitle(listing)}</span>
                </div>
                <div style={styles.listingOwner}>Owner: {getListingOwner(listing)}</div>

                {listing.verificationBadges && listing.verificationBadges.length > 0 ? (
                  <div style={styles.badgesContainer}>
                    {listing.verificationBadges.map((badge, index) => {
                      const badgeConfig = badgeTypes.find((b) => b.value === badge.type);
                      return (
                        <div key={index} style={styles.badgeItem}>
                          <span style={{ ...styles.badgeIcon, color: badgeConfig?.color }}>
                            {badgeConfig?.icon}
                          </span>
                          <span style={styles.badgeLabel}>{badgeConfig?.label}</span>
                          <button
                            style={styles.removeButton}
                            onClick={() => handleRemoveBadge(listing, badge.type)}
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={styles.noBadges}>No badges</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "24px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
    background: "white",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "4px",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e293b",
  },
  filters: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
  },
  select: {
    padding: "10px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    background: "white",
    minWidth: "200px",
  },
  issueForm: {
    background: "white",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "32px",
  },
  formTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "16px",
  },
  formRow: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  button: {
    padding: "10px 24px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  listingsSection: {
    background: "white",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "20px",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    color: "#64748b",
  },
  empty: {
    textAlign: "center",
    padding: "40px",
    color: "#64748b",
  },
  listingsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "16px",
  },
  listingCard: {
    padding: "20px",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    background: "#f8fafc",
  },
  listingHeader: {
    marginBottom: "12px",
  },
  listingType: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#3b82f6",
    textTransform: "uppercase",
  },
  listingTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
    display: "block",
    marginTop: "4px",
  },
  listingOwner: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "16px",
  },
  badgesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  badgeItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    background: "white",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  badgeIcon: {
    fontSize: "18px",
  },
  badgeLabel: {
    flex: 1,
    fontSize: "14px",
    fontWeight: "500",
    color: "#1e293b",
  },
  removeButton: {
    padding: "4px 12px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
  },
  noBadges: {
    fontSize: "14px",
    color: "#94a3b8",
    fontStyle: "italic",
  },
};

const css = `
  button:hover:not(:disabled) {
    opacity: 0.9;
  }
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
