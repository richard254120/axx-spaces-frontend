import { useContext, useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ProfileAvatar } from "../../features/profile";
import {
  useOwnerProfile,
  StatusBadge,
  LoadingBlock,
  ErrorAlert,
  PROPERTY_CATEGORIES,
  getDisplayName,
} from "../../features/accommodation";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { user: authUser, token } = useContext(AuthContext);
  const { profile, loading, error, reload } = useOwnerProfile();

  const user = profile?.user || authUser;
  const stats = profile?.stats;
  const listings = profile?.listings || [];

  // Agent requests state
  const [agentRequests, setAgentRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [respondingTo, setRespondingTo] = useState(null);
  const [response, setResponse] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Filters, search & view mode
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'approved' | 'pending' | 'rejected'
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [toastMessage, setToastMessage] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (token) {
      loadAgentRequests();
    }
  }, [token]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const loadAgentRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await fetch(`${API_BASE}/agent-requests/provider`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAgentRequests(data);
      }
    } catch (err) {
      console.error("Error loading agent requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/agent-requests/${requestId}/accept`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast("Agent collaboration approved successfully!");
        loadAgentRequests();
      }
    } catch (err) {
      console.error("Error accepting request:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/agent-requests/${requestId}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ response }),
      });
      if (res.ok) {
        setRespondingTo(null);
        setResponse("");
        showToast("Agent request declined.");
        loadAgentRequests();
      }
    } catch (err) {
      console.error("Error rejecting request:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await reload();
      if (token) await loadAgentRequests();
      showToast("Dashboard synchronized with server.");
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const copyPropertyLink = (propertyId) => {
    const url = `${window.location.origin}/accommodation/${propertyId}`;
    navigator.clipboard?.writeText(url);
    showToast("Listing link copied to clipboard!");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 22) return "Good evening";
    return "Welcome";
  };

  const displayName = getDisplayName(user || authUser);
  const pendingRequests = agentRequests.filter((r) => r.status === "pending");

  // Filtered & sorted listings
  const filteredListings = useMemo(() => {
    let result = [...listings];

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((l) => {
        const s = (l.status || "").toLowerCase();
        if (statusFilter === "approved") return s === "approved" || s === "active";
        if (statusFilter === "pending") return s === "pending" || s === "pending_review";
        if (statusFilter === "rejected") return s === "rejected" || s === "inactive";
        return true;
      });
    }

    // Category filter
    if (categoryFilter !== "All") {
      const catNorm = categoryFilter.toLowerCase();
      result = result.filter((l) => {
        const pCat = (l.category || "").toLowerCase();
        return pCat.includes(catNorm) || catNorm.includes(pCat);
      });
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          (l.name || "").toLowerCase().includes(q) ||
          (l.location || "").toLowerCase().includes(q) ||
          (l.category || "").toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return (b.id || b._id || "").toString().localeCompare((a.id || a._id || "").toString());
      }
      if (sortBy === "views") {
        return (b.views || 0) - (a.views || 0);
      }
      if (sortBy === "price_desc") {
        return (b.price || 0) - (a.price || 0);
      }
      if (sortBy === "price_asc") {
        return (a.price || 0) - (b.price || 0);
      }
      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      return 0;
    });

    return result;
  }, [listings, statusFilter, categoryFilter, searchQuery, sortBy]);

  // Derived stats
  const totalCount = stats?.total ?? listings.length;
  const liveCount = stats?.approved ?? listings.filter((l) => l.status === "approved" || l.status === "active").length;
  const pendingCount = stats?.pending ?? listings.filter((l) => l.status === "pending" || l.status === "pending_review").length;
  const rejectedCount = stats?.rejected ?? listings.filter((l) => l.status === "rejected" || l.status === "inactive").length;
  const viewsCount = stats?.totalViews ?? listings.reduce((sum, l) => sum + (l.views || 0), 0);

  return (
    <div style={styles.pageContainer}>
      <style>{dashboardStyles}</style>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div style={styles.toast}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HERO WELCOME HEADER */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.hostBadgeRow}>
            <span style={styles.hostTierPill}>
              <span style={styles.hostTierDot} />
              Verified Host Partner
            </span>
            <span style={styles.hostLocationPill}>Kenya Hospitality Network</span>
          </div>

          <h1 style={styles.heroTitle}>
            {getGreeting()}, <span style={styles.titleGradient}>{displayName.split(" ")[0]}</span>!
          </h1>
          <p style={styles.heroSubtitle}>
            Hospitality Command Center · Oversee your safari camps, beach villas, city apartments, and hotel properties. Track guest engagement, partner with certified agents, and manage room inventory in real-time.
          </p>
        </div>

        {/* HERO ACTIONS */}
        <div style={styles.heroActions}>
          <button
            type="button"
            style={styles.refreshBtn}
            onClick={handleManualRefresh}
            title="Refresh dashboard data"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isRefreshing ? "spin-icon" : ""}
            >
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span>Sync</span>
          </button>

          <Link to="/accommodation" style={styles.exploreLinkBtn}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
            </svg>
            <span>Live Stays</span>
          </Link>

          <button
            type="button"
            style={styles.primaryAddBtn}
            onClick={() => navigate("/accommodation/register-property")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>+ List New Property</span>
          </button>
        </div>
      </section>

      {/* AGENT REQUESTS NOTIFICATION BANNER */}
      {pendingRequests.length > 0 && (
        <section style={styles.agentAlertBanner}>
          <div style={styles.agentAlertLeft}>
            <div style={styles.agentAlertIconPulse}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
            <div>
              <div style={styles.agentAlertHeading}>
                {pendingRequests.length} Pending Agent Partnership Request{pendingRequests.length > 1 ? "s" : ""}
              </div>
              <div style={styles.agentAlertText}>
                Verified housing & tourism agents want to promote your properties to corporate groups and travelers.
              </div>
            </div>
          </div>
          <button
            type="button"
            style={styles.agentAlertToggleBtn}
            onClick={() => setShowRequests(!showRequests)}
          >
            {showRequests ? "Hide Requests" : "Review Requests →"}
          </button>
        </section>
      )}

      {/* AGENT REQUESTS DRAWER/PANEL */}
      {showRequests && (
        <section style={styles.agentDrawerCard}>
          <div style={styles.agentDrawerHead}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h3 style={styles.agentDrawerTitle}>Agent Collaboration Inquiries</h3>
              <span style={styles.agentCountBadge}>{agentRequests.length} Total</span>
            </div>
            <button
              type="button"
              style={styles.closeDrawerBtn}
              onClick={() => setShowRequests(false)}
            >
              ✕ Close
            </button>
          </div>

          {agentRequests.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "14px", padding: "16px 0" }}>
              No incoming agent requests found at this time.
            </p>
          ) : (
            <div style={styles.agentListGrid}>
              {agentRequests.map((req) => (
                <div key={req._id} style={styles.agentItemCard}>
                  <div style={styles.agentItemTop}>
                    <div style={styles.agentAvatarBox}>
                      {req.agent?.name?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={styles.agentName}>{req.agent?.name || "Agent"}</div>
                      <div style={styles.agentMeta}>{req.agent?.email}</div>
                      {req.agent?.phone && <div style={styles.agentMeta}>📞 {req.agent.phone}</div>}
                    </div>
                    <span
                      style={{
                        ...styles.agentStatusPill,
                        ...(req.status === "accepted"
                          ? styles.statusAccepted
                          : req.status === "rejected"
                          ? styles.statusRejected
                          : styles.statusPending),
                      }}
                    >
                      {req.status?.toUpperCase()}
                    </span>
                  </div>

                  {req.agent?.agentProfile?.county && (
                    <div style={styles.agentCountyTag}>
                      📍 Operating County: <strong>{req.agent.agentProfile.county}</strong>
                    </div>
                  )}

                  {req.agentMessage && (
                    <div style={styles.agentMessageBox}>
                      <span style={{ fontWeight: 700, color: "#cbd5e1" }}>Pitch: </span>
                      {req.agentMessage}
                    </div>
                  )}

                  {req.status === "pending" && (
                    <div style={styles.agentActionRow}>
                      <button
                        type="button"
                        style={styles.agentAcceptBtn}
                        disabled={actionLoading}
                        onClick={() => handleAcceptRequest(req._id)}
                      >
                        ✓ Accept Agent
                      </button>
                      <button
                        type="button"
                        style={styles.agentRejectBtn}
                        disabled={actionLoading}
                        onClick={() => setRespondingTo(respondingTo === req._id ? null : req._id)}
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {respondingTo === req._id && (
                    <div style={styles.rejectFormWrap}>
                      <textarea
                        style={styles.rejectTextarea}
                        placeholder="Optional note for the agent (e.g., currently at maximum agency capacity)..."
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                      />
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          style={styles.rejectCancelBtn}
                          onClick={() => {
                            setRespondingTo(null);
                            setResponse("");
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          style={styles.rejectConfirmBtn}
                          disabled={actionLoading}
                          onClick={() => handleRejectRequest(req._id)}
                        >
                          Confirm Decline
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ERROR ALERT */}
      {error && <ErrorAlert message={error} onRetry={reload} />}

      {/* PERFORMANCE METRICS CARDS */}
      <section style={styles.statsGrid}>
        {/* Total Properties */}
        <div
          style={{
            ...styles.statCard,
            ...(statusFilter === "all" ? styles.statCardActive : {}),
          }}
          onClick={() => setStatusFilter("all")}
          role="button"
          tabIndex={0}
        >
          <div style={styles.statCardTop}>
            <span style={styles.statLabel}>Total Properties</span>
            <div style={{ ...styles.statIconWrap, background: "rgba(59, 130, 246, 0.12)", color: "#60a5fa" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
          </div>
          <div style={styles.statValue}>{totalCount}</div>
          <div style={styles.statSubtext}>Entire property portfolio</div>
        </div>

        {/* Live & Active */}
        <div
          style={{
            ...styles.statCard,
            ...(statusFilter === "approved" ? styles.statCardActive : {}),
          }}
          onClick={() => setStatusFilter("approved")}
          role="button"
          tabIndex={0}
        >
          <div style={styles.statCardTop}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={styles.livePulseDot} />
              <span style={styles.statLabel}>Active & Live</span>
            </div>
            <div style={{ ...styles.statIconWrap, background: "rgba(16, 185, 129, 0.12)", color: "#34d399" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
          <div style={{ ...styles.statValue, color: "#10b981" }}>{liveCount}</div>
          <div style={styles.statSubtext}>Visible for booking inquiries</div>
        </div>

        {/* Under Review */}
        <div
          style={{
            ...styles.statCard,
            ...(statusFilter === "pending" ? styles.statCardActive : {}),
          }}
          onClick={() => setStatusFilter("pending")}
          role="button"
          tabIndex={0}
        >
          <div style={styles.statCardTop}>
            <span style={styles.statLabel}>Under Review</span>
            <div style={{ ...styles.statIconWrap, background: "rgba(245, 158, 11, 0.12)", color: "#fbbf24" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>
          <div style={{ ...styles.statValue, color: "#f59e0b" }}>{pendingCount}</div>
          <div style={styles.statSubtext}>Verification within 24h</div>
        </div>

        {/* Needs Revision / Inactive */}
        <div
          style={{
            ...styles.statCard,
            ...(statusFilter === "rejected" ? styles.statCardActive : {}),
          }}
          onClick={() => setStatusFilter("rejected")}
          role="button"
          tabIndex={0}
        >
          <div style={styles.statCardTop}>
            <span style={styles.statLabel}>Needs Action</span>
            <div style={{ ...styles.statIconWrap, background: "rgba(239, 68, 68, 0.12)", color: "#f87171" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
          </div>
          <div style={{ ...styles.statValue, color: rejectedCount > 0 ? "#ef4444" : "#94a3b8" }}>
            {rejectedCount}
          </div>
          <div style={styles.statSubtext}>{rejectedCount > 0 ? "Edit & resubmit listing" : "0 revision needed"}</div>
        </div>

        {/* Total Views */}
        <div style={styles.statCard}>
          <div style={styles.statCardTop}>
            <span style={styles.statLabel}>Guest Views</span>
            <div style={{ ...styles.statIconWrap, background: "rgba(14, 165, 233, 0.12)", color: "#38bdf8" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </div>
          </div>
          <div style={{ ...styles.statValue, color: "#38bdf8" }}>
            {viewsCount.toLocaleString()}
          </div>
          <div style={styles.statSubtext}>Total guest impressions</div>
        </div>
      </section>

      {/* PROPERTIES SECTION */}
      <section style={styles.propertiesSection}>
        {/* SECTION HEADER & CONTROLS */}
        <div style={styles.sectionHeaderRow}>
          <div>
            <h2 style={styles.sectionTitle}>Your Accommodation Properties</h2>
            <p style={styles.sectionSubtitle}>
              Showing {filteredListings.length} of {listings.length} listed accommodation stays
            </p>
          </div>

          <div style={styles.viewToggleGroup}>
            <button
              type="button"
              style={{
                ...styles.viewBtn,
                ...(viewMode === "grid" ? styles.viewBtnActive : {}),
              }}
              onClick={() => setViewMode("grid")}
              title="Grid photo view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>Grid</span>
            </button>
            <button
              type="button"
              style={{
                ...styles.viewBtn,
                ...(viewMode === "list" ? styles.viewBtnActive : {}),
              }}
              onClick={() => setViewMode("list")}
              title="List table view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              <span>List</span>
            </button>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div style={styles.filterToolbar}>
          {/* SEARCH INPUT */}
          <div style={styles.searchBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              style={styles.searchInput}
              placeholder="Search by property name, town, county..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                style={styles.clearSearchBtn}
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>

          {/* STATUS PILLS */}
          <div style={styles.statusPills}>
            {[
              { id: "all", label: `All (${totalCount})` },
              { id: "approved", label: `Live (${liveCount})` },
              { id: "pending", label: `In Review (${pendingCount})` },
              { id: "rejected", label: `Revision (${rejectedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                style={{
                  ...styles.statusTab,
                  ...(statusFilter === tab.id ? styles.statusTabActive : {}),
                }}
                onClick={() => setStatusFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* CATEGORY & SORT SELECTORS */}
          <div style={styles.selectGroup}>
            <select
              style={styles.filterSelect}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              {PROPERTY_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              style={styles.filterSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="views">Most Views</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div style={styles.loadingContainer}>
            <LoadingBlock message="Syncing your accommodation portfolio…" />
          </div>
        ) : listings.length === 0 ? (
          /* EMPTY PORTFOLIO STATE */
          <div style={styles.emptyCard}>
            <div style={styles.emptyIconCircle}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <h3 style={styles.emptyTitle}>No Properties Listed Yet</h3>
            <p style={styles.emptyText}>
              You haven't added any accommodation properties to your portfolio. Start listing your resort, lodge, cottage, or hotel to reach thousands of domestic and global guests.
            </p>
            <button
              type="button"
              style={styles.primaryAddBtn}
              onClick={() => navigate("/accommodation/register-property")}
            >
              + List Your First Accommodation Property
            </button>
          </div>
        ) : filteredListings.length === 0 ? (
          /* NO FILTER MATCHES STATE */
          <div style={styles.emptyCard}>
            <div style={styles.emptyIconCircle}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <h3 style={styles.emptyTitle}>No Matching Properties Found</h3>
            <p style={styles.emptyText}>
              None of your accommodation properties match the current search query or active filter settings.
            </p>
            <button
              type="button"
              style={styles.clearFilterBtn}
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setCategoryFilter("All");
              }}
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* GRID VIEW */
          <div style={styles.propertiesGrid}>
            {filteredListings.map((l) => {
              const propId = l.id || l._id;
              const isApproved = l.status === "approved" || l.status === "active";
              const isPending = l.status === "pending" || l.status === "pending_review";
              const isRejected = l.status === "rejected" || l.status === "inactive";
              const imgCount = l.images?.length || 0;
              const vidCount = l.videos?.length || 0;

              return (
                <article key={propId} style={styles.propertyCard} className="prop-card-hover">
                  {/* COVER MEDIA */}
                  <div style={styles.cardImageContainer}>
                    {l.thumbnail || (l.images && l.images[0]) ? (
                      <img
                        src={l.thumbnail || l.images[0]}
                        alt={l.name}
                        style={styles.cardCoverImg}
                        loading="lazy"
                      />
                    ) : (
                      <div style={styles.cardPlaceholderImg}>
                        <span style={{ fontSize: "40px" }}>{l.emoji || "🏨"}</span>
                      </div>
                    )}

                    {/* TOP BADGES */}
                    <div style={styles.cardBadgeOverlay}>
                      <span style={styles.categoryPill}>{l.category || "Hotel / Stay"}</span>
                      <StatusBadge status={l.status} />
                    </div>

                    {/* BOTTOM STATS PILL */}
                    <div style={styles.cardBottomOverlay}>
                      <div style={styles.cardViewsPill}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <span>{(l.views || 0).toLocaleString()} views</span>
                      </div>
                      <div style={styles.cardMediaPill}>
                        {imgCount} 📷 {vidCount > 0 && `· ${vidCount} 🎥`}
                      </div>
                    </div>
                  </div>

                  {/* CARD BODY */}
                  <div style={styles.cardBody}>
                    <div style={styles.cardHeader}>
                      <h3 style={styles.cardTitle} title={l.name}>{l.name}</h3>
                      <div style={styles.cardPrice}>
                        <span style={styles.priceCurrency}>KSh</span>
                        <span style={styles.priceAmount}>{(l.price || 0).toLocaleString()}</span>
                        <span style={styles.pricePeriod}>/ night</span>
                      </div>
                    </div>

                    <div style={styles.cardLocationRow}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span style={styles.cardLocationText}>{l.location || "Kenya"}</span>
                    </div>

                    {/* STATUS MESSAGE CALLOUT */}
                    {isPending && (
                      <div style={styles.pendingCallout}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>Listing in moderation. Usually verified within 24 hours.</span>
                      </div>
                    )}

                    {isRejected && (
                      <div style={styles.rejectedCallout}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <span>Revision requested. Update media or details to resubmit.</span>
                      </div>
                    )}

                    {/* CARD ACTIONS */}
                    <div style={styles.cardActionRow}>
                      <button
                        type="button"
                        style={styles.editBtn}
                        onClick={() => navigate(`/accommodation/dashboard/property/${propId}`)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        <span>Edit & Media</span>
                      </button>

                      {isApproved && (
                        <button
                          type="button"
                          style={styles.viewLiveBtn}
                          onClick={() => navigate(`/accommodation/${propId}`)}
                          title="View live stay on marketplace"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                          <span>Live</span>
                        </button>
                      )}

                      <button
                        type="button"
                        style={styles.shareBtn}
                        onClick={() => copyPropertyLink(propId)}
                        title="Copy share link"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="18" cy="5" r="3"></circle>
                          <circle cx="6" cy="12" r="3"></circle>
                          <circle cx="18" cy="19" r="3"></circle>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* LIST / TABLE VIEW */
          <div style={styles.listViewContainer}>
            {filteredListings.map((l) => {
              const propId = l.id || l._id;
              const isApproved = l.status === "approved" || l.status === "active";

              return (
                <div key={propId} style={styles.listRowItem} className="list-row-hover">
                  <div style={styles.listRowThumb}>
                    {l.thumbnail || (l.images && l.images[0]) ? (
                      <img src={l.thumbnail || l.images[0]} alt={l.name} style={styles.listRowImg} />
                    ) : (
                      <span style={{ fontSize: "24px" }}>{l.emoji || "🏨"}</span>
                    )}
                  </div>

                  <div style={styles.listRowInfo}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <h4 style={styles.listRowTitle}>{l.name}</h4>
                      <StatusBadge status={l.status} />
                    </div>
                    <div style={styles.listRowMeta}>
                      <span>{l.category || "Hotel"}</span>
                      <span>·</span>
                      <span>{l.location || "Kenya"}</span>
                      <span>·</span>
                      <span>{(l.images?.length || 0)} photos</span>
                      <span>·</span>
                      <span>{(l.views || 0)} views</span>
                    </div>
                  </div>

                  <div style={styles.listRowPrice}>
                    <div style={styles.listPriceNum}>KSh {(l.price || 0).toLocaleString()}</div>
                    <div style={styles.listPriceSub}>per night</div>
                  </div>

                  <div style={styles.listRowActions}>
                    <button
                      type="button"
                      style={styles.editBtnSmall}
                      onClick={() => navigate(`/accommodation/dashboard/property/${propId}`)}
                    >
                      Edit
                    </button>
                    {isApproved && (
                      <button
                        type="button"
                        style={styles.viewLiveBtnSmall}
                        onClick={() => navigate(`/accommodation/${propId}`)}
                      >
                        View
                      </button>
                    )}
                    <button
                      type="button"
                      style={styles.shareBtnSmall}
                      onClick={() => copyPropertyLink(propId)}
                      title="Share link"
                    >
                      🔗
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* HOST SUCCESS & GUIDANCE TOOLKIT */}
      <section style={styles.toolkitSection}>
        <div style={styles.toolkitHeader}>
          <div style={styles.toolkitTitle}>AXX Host Growth Toolkit</div>
          <div style={styles.toolkitSubtitle}>
            Pro-tips to maximize booking revenue, traveler inquiries, and search algorithm ranking
          </div>
        </div>

        <div style={styles.toolkitGrid}>
          <div style={styles.toolkitCard}>
            <div style={{ ...styles.toolkitIcon, background: "rgba(251, 191, 36, 0.12)", color: "#fbbf24" }}>
              📸
            </div>
            <h4 style={styles.toolkitCardTitle}>4K Photography & Video Walkthroughs</h4>
            <p style={styles.toolkitCardText}>
              Accommodations with 8+ professional photos and short video clips receive 3.4x more booking leads. Ensure proper lighting of bedrooms, balconies, and scenic views.
            </p>
          </div>

          <div style={styles.toolkitCard}>
            <div style={{ ...styles.toolkitIcon, background: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}>
              🤝
            </div>
            <h4 style={styles.toolkitCardTitle}>Certified Agent Partnerships</h4>
            <p style={styles.toolkitCardText}>
              Accept requests from accredited AXX agents who market your spaces directly to safari tourists, corporate retreats, and diplomatic delegations.
            </p>
          </div>

          <div style={styles.toolkitCard}>
            <div style={{ ...styles.toolkitIcon, background: "rgba(59, 130, 246, 0.12)", color: "#60a5fa" }}>
              ⚡
            </div>
            <h4 style={styles.toolkitCardTitle}>24-Hour Express Verification</h4>
            <p style={styles.toolkitCardText}>
              Our host onboarding desk verifies new property registrations within 24 hours. Keep pricing and WhatsApp contact details up to date for instant guest responses.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  pageContainer: {
    maxWidth: "1320px",
    margin: "0 auto",
    padding: "36px 24px 80px",
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: "#f8fafc",
  },
  toast: {
    position: "fixed",
    bottom: "28px",
    right: "28px",
    background: "#0f172a",
    border: "1px solid rgba(16, 185, 129, 0.4)",
    color: "#f8fafc",
    padding: "12px 20px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "13.5px",
    fontWeight: 600,
    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
    zIndex: 9999,
    animation: "slideInToast 0.3s ease-out",
  },
  heroSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "28px",
    marginBottom: "36px",
    flexWrap: "wrap",
    padding: "32px",
    borderRadius: "24px",
    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.85) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
    backdropFilter: "blur(16px)",
  },
  heroContent: {
    flex: "1 1 540px",
  },
  hostBadgeRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
    flexWrap: "wrap",
  },
  hostTierPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    padding: "4px 10px",
    borderRadius: "999px",
    background: "rgba(251, 191, 36, 0.15)",
    color: "#fbbf24",
    border: "1px solid rgba(251, 191, 36, 0.3)",
  },
  hostTierDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#fbbf24",
    boxShadow: "0 0 6px #fbbf24",
  },
  hostLocationPill: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#94a3b8",
    padding: "4px 10px",
    borderRadius: "999px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  heroTitle: {
    fontSize: "32px",
    fontWeight: 900,
    color: "#ffffff",
    letterSpacing: "-0.8px",
    margin: "0 0 10px 0",
    lineHeight: 1.2,
  },
  titleGradient: {
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSubtitle: {
    color: "#94a3b8",
    fontSize: "14.5px",
    lineHeight: 1.6,
    margin: 0,
    maxWidth: "680px",
  },
  heroActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    alignSelf: "center",
  },
  refreshBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    color: "#f1f5f9",
    padding: "11px 16px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  exploreLinkBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.14)",
    color: "#f1f5f9",
    textDecoration: "none",
    padding: "11px 18px",
    borderRadius: "12px",
    fontSize: "13.5px",
    fontWeight: 700,
    transition: "all 0.2s ease",
  },
  primaryAddBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#0f172a",
    border: "none",
    padding: "12px 22px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(251, 191, 36, 0.3)",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },
  agentAlertBanner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "18px",
    background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.10) 100%)",
    border: "1px solid rgba(245, 158, 11, 0.35)",
    borderRadius: "18px",
    padding: "18px 24px",
    marginBottom: "28px",
    flexWrap: "wrap",
    boxShadow: "0 10px 30px rgba(245, 158, 11, 0.1)",
  },
  agentAlertLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flex: "1 1 400px",
  },
  agentAlertIconPulse: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "rgba(245, 158, 11, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  agentAlertHeading: {
    fontSize: "15px",
    fontWeight: 800,
    color: "#fef3c7",
  },
  agentAlertText: {
    fontSize: "13px",
    color: "#fde68a",
    marginTop: "2px",
  },
  agentAlertToggleBtn: {
    background: "#fbbf24",
    color: "#1f2937",
    border: "none",
    borderRadius: "10px",
    padding: "10px 18px",
    fontWeight: 800,
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(251, 191, 36, 0.25)",
  },
  agentDrawerCard: {
    background: "rgba(15, 23, 42, 0.85)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
    padding: "24px",
    marginBottom: "32px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
  },
  agentDrawerHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
    paddingBottom: "14px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  },
  agentDrawerTitle: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#ffffff",
    margin: 0,
  },
  agentCountBadge: {
    fontSize: "11px",
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: "999px",
    background: "rgba(251, 191, 36, 0.15)",
    color: "#fbbf24",
  },
  closeDrawerBtn: {
    background: "transparent",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    color: "#94a3b8",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    cursor: "pointer",
  },
  agentListGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "16px",
  },
  agentItemCard: {
    background: "rgba(30, 41, 59, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "14px",
    padding: "18px",
  },
  agentItemTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  agentAvatarBox: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#1e293b",
    fontSize: "17px",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  agentName: {
    fontSize: "15px",
    fontWeight: 800,
    color: "#f8fafc",
  },
  agentMeta: {
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "2px",
  },
  agentStatusPill: {
    fontSize: "10.5px",
    fontWeight: 800,
    padding: "4px 10px",
    borderRadius: "999px",
  },
  statusPending: {
    background: "rgba(245, 158, 11, 0.15)",
    color: "#fbbf24",
    border: "1px solid rgba(245, 158, 11, 0.3)",
  },
  statusAccepted: {
    background: "rgba(16, 185, 129, 0.15)",
    color: "#34d399",
    border: "1px solid rgba(16, 185, 129, 0.3)",
  },
  statusRejected: {
    background: "rgba(239, 68, 68, 0.15)",
    color: "#f87171",
    border: "1px solid rgba(239, 68, 68, 0.3)",
  },
  agentCountyTag: {
    fontSize: "12px",
    color: "#cbd5e1",
    marginBottom: "10px",
    background: "rgba(255, 255, 255, 0.04)",
    padding: "6px 10px",
    borderRadius: "8px",
  },
  agentMessageBox: {
    fontSize: "12.5px",
    color: "#cbd5e1",
    lineHeight: 1.5,
    padding: "10px 12px",
    background: "rgba(15, 23, 42, 0.6)",
    borderRadius: "10px",
    marginBottom: "14px",
    borderLeft: "3px solid #fbbf24",
  },
  agentActionRow: {
    display: "flex",
    gap: "10px",
  },
  agentAcceptBtn: {
    flex: 1,
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    padding: "10px",
    fontSize: "12.5px",
    fontWeight: 700,
    cursor: "pointer",
  },
  agentRejectBtn: {
    flex: 1,
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#f87171",
    borderRadius: "10px",
    padding: "10px",
    fontSize: "12.5px",
    fontWeight: 700,
    cursor: "pointer",
  },
  rejectFormWrap: {
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
  },
  rejectTextarea: {
    width: "100%",
    padding: "10px",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "8px",
    color: "#f8fafc",
    fontSize: "12.5px",
    fontFamily: "inherit",
    minHeight: "65px",
    resize: "vertical",
    marginBottom: "8px",
    outline: "none",
  },
  rejectCancelBtn: {
    background: "transparent",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    color: "#94a3b8",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    cursor: "pointer",
  },
  rejectConfirmBtn: {
    background: "#ef4444",
    color: "#ffffff",
    border: "none",
    padding: "6px 14px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "18px",
    marginBottom: "36px",
  },
  statCard: {
    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.85) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "20px",
    padding: "22px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.25)",
    backdropFilter: "blur(14px)",
    cursor: "pointer",
    transition: "all 0.25s ease",
  },
  statCardActive: {
    borderColor: "#fbbf24",
    boxShadow: "0 10px 30px rgba(251, 191, 36, 0.15)",
  },
  statCardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  statLabel: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#94a3b8",
    letterSpacing: "-0.2px",
  },
  statIconWrap: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: "30px",
    fontWeight: 900,
    color: "#ffffff",
    letterSpacing: "-0.5px",
    marginBottom: "4px",
  },
  statSubtext: {
    fontSize: "12px",
    color: "#64748b",
  },
  livePulseDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#10b981",
    boxShadow: "0 0 8px #10b981",
    display: "inline-block",
  },
  propertiesSection: {
    marginBottom: "48px",
  },
  sectionHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "20px",
    gap: "16px",
    flexWrap: "wrap",
  },
  sectionTitle: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#ffffff",
    margin: "0 0 4px 0",
    letterSpacing: "-0.4px",
  },
  sectionSubtitle: {
    color: "#94a3b8",
    fontSize: "13.5px",
    margin: 0,
  },
  viewToggleGroup: {
    display: "flex",
    alignItems: "center",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "12px",
    padding: "3px",
    gap: "2px",
  },
  viewBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12.5px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  viewBtnActive: {
    background: "rgba(255, 255, 255, 0.12)",
    color: "#ffffff",
  },
  filterToolbar: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "24px",
    background: "rgba(15, 23, 42, 0.7)",
    border: "1px solid rgba(255, 255, 255, 0.07)",
    borderRadius: "16px",
    padding: "14px 18px",
    backdropFilter: "blur(14px)",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "10px",
    padding: "8px 14px",
    flex: "1 1 240px",
    minWidth: "220px",
  },
  searchInput: {
    background: "transparent",
    border: "none",
    color: "#f8fafc",
    fontSize: "13.5px",
    fontFamily: "inherit",
    width: "100%",
    outline: "none",
  },
  clearSearchBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "12px",
    padding: "2px",
  },
  statusPills: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  statusTab: {
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    color: "#94a3b8",
    padding: "7px 12px",
    borderRadius: "8px",
    fontSize: "12.5px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  statusTabActive: {
    background: "rgba(251, 191, 36, 0.15)",
    borderColor: "rgba(251, 191, 36, 0.35)",
    color: "#fbbf24",
    fontWeight: 700,
  },
  selectGroup: {
    display: "flex",
    gap: "8px",
    marginLeft: "auto",
    flexWrap: "wrap",
  },
  filterSelect: {
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    color: "#cbd5e1",
    padding: "7px 12px",
    borderRadius: "8px",
    fontSize: "12.5px",
    fontFamily: "inherit",
    cursor: "pointer",
    outline: "none",
  },
  loadingContainer: {
    padding: "60px 20px",
    textAlign: "center",
  },
  emptyCard: {
    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.7) 100%)",
    border: "1px dashed rgba(255, 255, 255, 0.15)",
    borderRadius: "24px",
    padding: "64px 32px",
    textAlign: "center",
    maxWidth: "620px",
    margin: "0 auto",
  },
  emptyIconCircle: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    background: "rgba(251, 191, 36, 0.10)",
    border: "1px solid rgba(251, 191, 36, 0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px auto",
  },
  emptyTitle: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#ffffff",
    marginBottom: "10px",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: "14px",
    lineHeight: 1.6,
    marginBottom: "24px",
  },
  clearFilterBtn: {
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    color: "#ffffff",
    padding: "10px 20px",
    borderRadius: "10px",
    fontSize: "13.5px",
    fontWeight: 700,
    cursor: "pointer",
  },
  propertiesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "24px",
  },
  propertyCard: {
    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 14px 35px rgba(0, 0, 0, 0.25)",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.25s ease",
  },
  cardImageContainer: {
    position: "relative",
    width: "100%",
    height: "210px",
    overflow: "hidden",
    background: "#0b1222",
  },
  cardCoverImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "transform 0.4s ease",
  },
  cardPlaceholderImg: {
    width: "100%",
    height: "100%",
    background: "radial-gradient(circle at center, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBadgeOverlay: {
    position: "absolute",
    top: "14px",
    left: "14px",
    right: "14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    pointerEvents: "none",
  },
  categoryPill: {
    fontSize: "11px",
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: "999px",
    background: "rgba(15, 23, 42, 0.85)",
    backdropFilter: "blur(10px)",
    color: "#f8fafc",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    textTransform: "capitalize",
  },
  cardBottomOverlay: {
    position: "absolute",
    bottom: "12px",
    left: "14px",
    right: "14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    pointerEvents: "none",
  },
  cardViewsPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "11px",
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: "8px",
    background: "rgba(15, 23, 42, 0.85)",
    color: "#cbd5e1",
    backdropFilter: "blur(8px)",
  },
  cardMediaPill: {
    fontSize: "11px",
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: "8px",
    background: "rgba(15, 23, 42, 0.85)",
    color: "#cbd5e1",
    backdropFilter: "blur(8px)",
  },
  cardBody: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "8px",
  },
  cardTitle: {
    fontSize: "17px",
    fontWeight: 800,
    color: "#ffffff",
    margin: 0,
    lineHeight: 1.3,
    letterSpacing: "-0.3px",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cardPrice: {
    display: "flex",
    alignItems: "baseline",
    gap: "3px",
    flexShrink: 0,
    textAlign: "right",
  },
  priceCurrency: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#fbbf24",
  },
  priceAmount: {
    fontSize: "18px",
    fontWeight: 900,
    color: "#fbbf24",
    letterSpacing: "-0.5px",
  },
  pricePeriod: {
    fontSize: "11px",
    color: "#94a3b8",
  },
  cardLocationRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "14px",
  },
  cardLocationText: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  pendingCallout: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(245, 158, 11, 0.10)",
    border: "1px solid rgba(245, 158, 11, 0.25)",
    color: "#fde68a",
    padding: "9px 12px",
    borderRadius: "10px",
    fontSize: "12px",
    lineHeight: 1.4,
    marginBottom: "16px",
  },
  rejectedCallout: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(239, 68, 68, 0.10)",
    border: "1px solid rgba(239, 68, 68, 0.25)",
    color: "#fca5a5",
    padding: "9px 12px",
    borderRadius: "10px",
    fontSize: "12px",
    lineHeight: 1.4,
    marginBottom: "16px",
  },
  cardActionRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "auto",
    paddingTop: "14px",
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
  },
  editBtn: {
    flex: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#0f172a",
    border: "none",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 3px 10px rgba(251, 191, 36, 0.25)",
    transition: "all 0.2s ease",
  },
  viewLiveBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    color: "#f8fafc",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  shareBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.10)",
    color: "#94a3b8",
    borderRadius: "10px",
    padding: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  listViewContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  listRowItem: {
    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.85) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "16px",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
    transition: "all 0.2s ease",
  },
  listRowThumb: {
    width: "70px",
    height: "70px",
    borderRadius: "12px",
    overflow: "hidden",
    background: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  listRowImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  listRowInfo: {
    flex: "1 1 240px",
    minWidth: "200px",
  },
  listRowTitle: {
    fontSize: "16px",
    fontWeight: 800,
    color: "#ffffff",
    margin: 0,
  },
  listRowMeta: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12.5px",
    color: "#94a3b8",
    marginTop: "6px",
    flexWrap: "wrap",
  },
  listRowPrice: {
    textAlign: "right",
    flexShrink: 0,
  },
  listPriceNum: {
    fontSize: "17px",
    fontWeight: 800,
    color: "#fbbf24",
  },
  listPriceSub: {
    fontSize: "11px",
    color: "#94a3b8",
  },
  listRowActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
  },
  editBtnSmall: {
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#0f172a",
    border: "none",
    borderRadius: "8px",
    padding: "8px 14px",
    fontSize: "12.5px",
    fontWeight: 800,
    cursor: "pointer",
  },
  viewLiveBtnSmall: {
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    color: "#f8fafc",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "12.5px",
    fontWeight: 700,
    cursor: "pointer",
  },
  shareBtnSmall: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.10)",
    color: "#94a3b8",
    borderRadius: "8px",
    padding: "8px 10px",
    fontSize: "12.5px",
    cursor: "pointer",
  },
  toolkitSection: {
    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.7) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "24px",
    padding: "32px",
    backdropFilter: "blur(14px)",
  },
  toolkitHeader: {
    marginBottom: "24px",
  },
  toolkitTitle: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#ffffff",
    marginBottom: "6px",
    letterSpacing: "-0.3px",
  },
  toolkitSubtitle: {
    fontSize: "13.5px",
    color: "#94a3b8",
  },
  toolkitGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },
  toolkitCard: {
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    borderRadius: "18px",
    padding: "24px",
  },
  toolkitIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    marginBottom: "16px",
  },
  toolkitCardTitle: {
    fontSize: "15.5px",
    fontWeight: 800,
    color: "#ffffff",
    marginBottom: "8px",
  },
  toolkitCardText: {
    fontSize: "13px",
    color: "#94a3b8",
    lineHeight: 1.6,
    margin: 0,
  },
};

const dashboardStyles = `
  .prop-card-hover:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45) !important;
    border-color: rgba(251, 191, 36, 0.35) !important;
  }

  .prop-card-hover:hover img {
    transform: scale(1.05);
  }

  .list-row-hover:hover {
    border-color: rgba(251, 191, 36, 0.35) !important;
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%) !important;
  }

  .spin-icon {
    animation: spinAnim 0.7s linear infinite;
  }

  @keyframes spinAnim {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes slideInToast {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    .heroSection {
      padding: 24px 20px !important;
    }
  }
`;
