import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:1001";

export default function UserBadgeManagement() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [badgeType, setBadgeType] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [filterBadgeType, setFilterBadgeType] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [paymentReference, setPaymentReference] = useState("");
  const [amount, setAmount] = useState("");

  const badgeTypes = [
    { value: "premium_verified", label: "Premium Verified", icon: "⭐", color: "#fbbf24", image: "Premium Verified.png" },
    { value: "student_verified", label: "Student Verified", icon: "🎓", color: "#3b82f6", image: "Student Verified.png" },
    { value: "business_verified", label: "Business Verified", icon: "🏢", color: "#8b5cf6", image: "Business Verified.png" },
    { value: "identity_verified", label: "Identity Verified", icon: "🪪", color: "#22c55e", image: "Identity Verified.png" },
    { value: "location_verified", label: "Location Verified", icon: "📍", color: "#ef4444", image: "Locationn Verified.png" },
    { value: "online_verified", label: "Online Verified", icon: "🌐", color: "#06b6d4", image: "Online Verified.png" },
  ];

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [roleFilter, filterBadgeType]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const params = {};
      if (roleFilter !== "all") params.role = roleFilter;
      if (filterBadgeType) params.badgeType = filterBadgeType;

      const response = await axios.get(`${API_BASE}/api/user-badges`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(`${API_BASE}/api/user-badges/stats/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleSearchUsers = async () => {
    if (searchQuery.length < 2) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(`${API_BASE}/api/user-badges/search`, {
        params: { query: searchQuery },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(response.data.users || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueBadge = async () => {
    if (!selectedUser || !badgeType) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `${API_BASE}/api/user-badges/issue`,
        {
          userId: selectedUser._id,
          badgeType,
          paymentReference: paymentReference || null,
          amount: amount || 0,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Badge issued successfully!");
      setBadgeType("");
      setSelectedUser(null);
      setPaymentReference("");
      setAmount("");
      setSearchQuery("");
      setShowSearchResults(false);
      loadUsers();
      loadStats();
    } catch (error) {
      console.error("Error issuing badge:", error);
      alert(error.response?.data?.error || "Failed to issue badge");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBadge = async (user, badgeTypeToRemove) => {
    if (!confirm(`Remove ${badgeTypeToRemove} badge from ${user.name}?`)) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `${API_BASE}/api/user-badges/remove`,
        {
          userId: user._id,
          badgeType: badgeTypeToRemove,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Badge removed successfully!");
      loadUsers();
      loadStats();
    } catch (error) {
      console.error("Error removing badge:", error);
      alert(error.response?.data?.error || "Failed to remove badge");
    } finally {
      setLoading(false);
    }
  };

  const getBadgeImage = (badgeType) => {
    const badge = badgeTypes.find(b => b.value === badgeType);
    return badge ? badge.image : null;
  };

  const getBadgeInfo = (badgeType) => {
    return badgeTypes.find(b => b.value === badgeType) || { label: badgeType, icon: "🏅", color: "#6b7280" };
  };

  return (
    <div style={styles.container}>
      <style>{css}</style>

      <h2 style={styles.header}>User Badge Management</h2>

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
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All User Roles</option>
          <option value="user">Users</option>
          <option value="landlord">Landlords</option>
          <option value="mover">Movers</option>
          <option value="seller">Sellers</option>
          <option value="business">Business Owners</option>
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
        <h3 style={styles.formTitle}>Issue New Badge to User</h3>

        {/* User Search */}
        <div style={styles.searchSection}>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search user by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchUsers()}
          />
          <button
            style={styles.searchButton}
            onClick={handleSearchUsers}
            disabled={loading}
          >
            Search
          </button>
        </div>

        {/* Search Results */}
        {showSearchResults && searchResults.length > 0 && (
          <div style={styles.searchResults}>
            {searchResults.map((user) => (
              <div
                key={user._id}
                style={{
                  ...styles.searchResultItem,
                  backgroundColor: selectedUser?._id === user._id ? '#e0f2fe' : 'white'
                }}
                onClick={() => {
                  setSelectedUser(user);
                  setShowSearchResults(false);
                }}
              >
                <div>
                  <div style={styles.userName}>{user.name}</div>
                  <div style={styles.userEmail}>{user.email}</div>
                  <div style={styles.userRole}>{user.role.toUpperCase()}</div>
                </div>
                {user.verificationBadges && user.verificationBadges.length > 0 && (
                  <div style={styles.existingBadges}>
                    {user.verificationBadges.map((badge, idx) => (
                      <span key={idx} style={styles.existingBadge}>
                        {getBadgeInfo(badge.type).icon}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Selected User */}
        {selectedUser && (
          <div style={styles.selectedUser}>
            <div style={styles.selectedUserInfo}>
              <strong>Selected User:</strong> {selectedUser.name} ({selectedUser.email}) - {selectedUser.role.toUpperCase()}
            </div>
            <button
              style={styles.clearButton}
              onClick={() => {
                setSelectedUser(null);
                setSearchQuery("");
              }}
            >
              Clear
            </button>
          </div>
        )}

        {/* Badge Selection */}
        <div style={styles.formRow}>
          <select
            style={styles.select}
            value={badgeType}
            onChange={(e) => setBadgeType(e.target.value)}
            disabled={!selectedUser}
          >
            <option value="">Select Badge Type</option>
            {badgeTypes.map((badge) => (
              <option key={badge.value} value={badge.value}>
                {badge.icon} {badge.label}
              </option>
            ))}
          </select>

          <input
            style={styles.input}
            type="text"
            placeholder="Payment Reference (optional)"
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
            disabled={!selectedUser}
          />

          <input
            style={styles.input}
            type="number"
            placeholder="Amount (optional)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!selectedUser}
          />

          <button
            style={styles.button}
            onClick={handleIssueBadge}
            disabled={!selectedUser || !badgeType || loading}
          >
            Issue Badge
          </button>
        </div>
      </div>

      {/* Users with Badges */}
      <div style={styles.usersSection}>
        <h3 style={styles.sectionTitle}>Users with Badges</h3>
        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : users.length === 0 ? (
          <div style={styles.empty}>No users with badges found</div>
        ) : (
          <div style={styles.usersGrid}>
            {users.map((user) => (
              <div key={user._id} style={styles.userCard}>
                <div style={styles.userHeader}>
                  <div style={styles.userInfo}>
                    <div style={styles.userName}>{user.name}</div>
                    <div style={styles.userEmail}>{user.email}</div>
                    <div style={styles.userRole}>{user.role.toUpperCase()}</div>
                  </div>
                  <div style={styles.userBadges}>
                    {user.verificationBadges && user.verificationBadges.length > 0 ? (
                      user.verificationBadges.map((badge, idx) => {
                        const badgeInfo = getBadgeInfo(badge.type);
                        const badgeImage = getBadgeImage(badge.type);
                        return (
                          <div key={idx} style={styles.badgeContainer}>
                            {badgeImage && (
                              <img
                                src={`/${badgeImage}`}
                                alt={badgeInfo.label}
                                style={styles.badgeImage}
                              />
                            )}
                            <button
                              style={styles.removeButton}
                              onClick={() => handleRemoveBadge(user, badge.type)}
                              title="Remove badge"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <span style={styles.noBadges}>No badges</span>
                    )}
                  </div>
                </div>
                {user.verificationBadges && user.verificationBadges.length > 0 && (
                  <div style={styles.badgeDetails}>
                    {user.verificationBadges.map((badge, idx) => {
                      const badgeInfo = getBadgeInfo(badge.type);
                      return (
                        <div key={idx} style={styles.badgeDetail}>
                          <span style={styles.badgeDetailLabel}>{badgeInfo.label}</span>
                          <span style={styles.badgeDetailDate}>
                            Issued: {new Date(badge.verifiedAt).toLocaleDateString()}
                          </span>
                          {badge.paymentReference && (
                            <span style={styles.badgeDetailRef}>
                              Ref: {badge.paymentReference}
                            </span>
                          )}
                          {badge.amount && (
                            <span style={styles.badgeDetailAmount}>
                              Amount: KES {badge.amount}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
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
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
  },
  header: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#333",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "20px",
  },
  statCard: {
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  statIcon: {
    fontSize: "32px",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: "12px",
    color: "#666",
    marginBottom: "5px",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
  },
  filters: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  select: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    fontSize: "14px",
    flex: 1,
  },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    fontSize: "14px",
    flex: 1,
  },
  issueForm: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  },
  formTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#333",
  },
  searchSection: {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
  },
  searchInput: {
    flex: 1,
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  searchButton: {
    padding: "10px 20px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
  },
  searchResults: {
    maxHeight: "200px",
    overflowY: "auto",
    border: "1px solid #ddd",
    borderRadius: "5px",
    marginBottom: "15px",
  },
  searchResultItem: {
    padding: "10px",
    borderBottom: "1px solid #eee",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userName: {
    fontWeight: "bold",
    fontSize: "14px",
  },
  userEmail: {
    fontSize: "12px",
    color: "#666",
  },
  userRole: {
    fontSize: "11px",
    color: "#999",
    marginTop: "5px",
  },
  existingBadges: {
    display: "flex",
    gap: "5px",
  },
  existingBadge: {
    fontSize: "16px",
  },
  selectedUser: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    backgroundColor: "#e0f2fe",
    borderRadius: "5px",
    marginBottom: "15px",
  },
  selectedUserInfo: {
    fontSize: "14px",
  },
  clearButton: {
    padding: "5px 10px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "12px",
  },
  formRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
    cursor: "not-allowed",
  },
  usersSection: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#333",
  },
  loading: {
    textAlign: "center",
    padding: "20px",
    color: "#666",
  },
  empty: {
    textAlign: "center",
    padding: "20px",
    color: "#999",
  },
  usersGrid: {
    display: "grid",
    gap: "15px",
  },
  userCard: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "15px",
    backgroundColor: "#fafafa",
  },
  userHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "10px",
  },
  userInfo: {
    flex: 1,
  },
  userBadges: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  badgeContainer: {
    position: "relative",
    display: "inline-block",
  },
  badgeImage: {
    width: "40px",
    height: "40px",
    objectFit: "contain",
  },
  removeButton: {
    position: "absolute",
    top: "-8px",
    right: "-8px",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  noBadges: {
    color: "#999",
    fontSize: "12px",
  },
  badgeDetails: {
    borderTop: "1px solid #eee",
    paddingTop: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  badgeDetail: {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    fontSize: "12px",
    color: "#666",
  },
  badgeDetailLabel: {
    fontWeight: "bold",
    color: "#333",
  },
  badgeDetailDate: {
    color: "#666",
  },
  badgeDetailRef: {
    color: "#666",
  },
  badgeDetailAmount: {
    color: "#22c55e",
    fontWeight: "bold",
  },
};

const css = `
  @media (max-width: 768px) {
    .statsGrid {
      grid-template-columns: 1fr;
    }
    .formRow {
      flex-direction: column;
    }
    .userHeader {
      flex-direction: column;
    }
  }
`;
