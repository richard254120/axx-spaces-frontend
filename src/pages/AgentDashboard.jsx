import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { resolveMediaUrl } from "../utils/fileLinks";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

const s = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#f8f4f0",
    minHeight: "100vh",
  },
  header: {
    background: "white",
    borderBottom: "1px solid #e5e7eb",
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  logoAccent: {
    fontSize: "20px",
    fontWeight: 900,
    color: "#fbbf24",
  },
  logoWord: {
    fontSize: "20px",
    fontWeight: 900,
    color: "#1f2937",
  },
  headerTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1f2937",
  },
  logoutBtn: {
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    borderRadius: "8px",
    padding: "8px 16px",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "24px",
  },
  tabs: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    borderBottom: "2px solid #e5e7eb",
  },
  tab: {
    padding: "12px 20px",
    background: "transparent",
    border: "none",
    borderBottom: "3px solid transparent",
    fontSize: "14px",
    fontWeight: 600,
    color: "#6b7280",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  tabActive: {
    color: "#fbbf24",
    borderBottomColor: "#fbbf24",
  },
  sectionTitle: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#1f2937",
    marginBottom: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "white",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "#fbbf24",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: 700,
    color: "#1f2937",
  },
  cardName: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#1f2937",
  },
  cardEmail: {
    fontSize: "12px",
    color: "#6b7280",
  },
  cardPhone: {
    fontSize: "13px",
    color: "#4b5563",
    marginTop: "4px",
  },
  cardCounty: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "4px",
  },
  cardBio: {
    fontSize: "13px",
    color: "#4b5563",
    marginTop: "8px",
    lineHeight: "1.5",
  },
  requestBtn: {
    width: "100%",
    padding: "10px",
    background: "#fbbf24",
    color: "#1f2937",
    border: "none",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
    marginTop: "12px",
  },
  requestBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  statusBadge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: 700,
    marginTop: "8px",
  },
  statusPending: {
    background: "#fef3c7",
    color: "#92400e",
  },
  statusAccepted: {
    background: "#dcfce7",
    color: "#166534",
  },
  statusRejected: {
    background: "#fee2e2",
    color: "#dc2626",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "16px",
  },
  modalContent: {
    background: "white",
    borderRadius: "12px",
    padding: "24px",
    maxWidth: "500px",
    width: "100%",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: "16px",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
    minHeight: "100px",
    resize: "vertical",
    marginBottom: "16px",
  },
  modalButtons: {
    display: "flex",
    gap: "10px",
  },
  modalBtn: {
    flex: 1,
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
  },
  modalBtnPrimary: {
    background: "#fbbf24",
    color: "#1f2937",
  },
  modalBtnSecondary: {
    background: "#e5e7eb",
    color: "#4b5563",
  },
  empty: {
    textAlign: "center",
    padding: "40px",
    color: "#6b7280",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  uploadBtn: {
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 16px",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    boxShadow: "0 2px 6px rgba(16, 185, 129, 0.25)",
    transition: "all 0.2s",
  },
  statusApproved: {
    background: "#dcfce7",
    color: "#166534",
  },
  houseGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
    gap: "20px",
  },
  houseCard: {
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
  },
  houseImgWrap: {
    width: "100%",
    height: "175px",
    position: "relative",
    background: "#f1f5f9",
  },
  houseImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  houseTypePill: {
    position: "absolute",
    top: "10px",
    left: "10px",
    background: "rgba(15, 23, 42, 0.8)",
    color: "#fff",
    fontSize: "11px",
    fontWeight: 700,
    padding: "4px 8px",
    borderRadius: "6px",
    backdropFilter: "blur(4px)",
  },
  houseStatusPill: {
    position: "absolute",
    top: "10px",
    right: "10px",
    fontSize: "11px",
    fontWeight: 700,
    padding: "4px 8px",
    borderRadius: "6px",
  },
  houseContent: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    gap: "8px",
  },
  houseTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#1f2937",
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  houseLocation: {
    fontSize: "13px",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  housePrice: {
    fontSize: "17px",
    fontWeight: 800,
    color: "#059669",
    marginTop: "2px",
  },
  houseInfoRow: {
    fontSize: "12px",
    color: "#4b5563",
    background: "#f9fafb",
    padding: "8px 10px",
    borderRadius: "6px",
    display: "flex",
    justifyContent: "space-between",
  },
  houseActions: {
    display: "flex",
    gap: "8px",
    marginTop: "auto",
    paddingTop: "12px",
    borderTop: "1px solid #f3f4f6",
  },
  editBtn: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#1f2937",
    fontWeight: 600,
    fontSize: "12px",
    cursor: "pointer",
    textAlign: "center",
  },
  viewBtn: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "none",
    background: "#f3f4f6",
    color: "#1f2937",
    fontWeight: 600,
    fontSize: "12px",
    cursor: "pointer",
    textAlign: "center",
  },
  delBtn: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#dc2626",
    fontWeight: 600,
    fontSize: "12px",
    cursor: "pointer",
  },
  emptyCard: {
    background: "white",
    borderRadius: "14px",
    border: "1.5px dashed #cbd5e1",
    padding: "48px 24px",
    textAlign: "center",
    maxWidth: "520px",
    margin: "24px auto",
  },
};

export default function AgentDashboard() {
  const navigate = useNavigate();
  const { user, token, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("houses");
  const [myHouses, setMyHouses] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [providers, setProviders] = useState([]);
  const [landlords, setLandlords] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "agent") {
      navigate("/agent/login");
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load my uploaded houses
      try {
        const housesRes = await fetch(`${API_BASE}/properties/my-properties/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (housesRes.ok) {
          const housesData = await housesRes.json();
          setMyHouses(Array.isArray(housesData) ? housesData : []);
        }
      } catch (err) {
        console.error("Error loading agent houses:", err);
      }

      // Load all providers (hosts and landlords)
      const providersRes = await fetch(`${API_BASE}/agent-requests/providers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (providersRes.ok) {
        const providersData = await providersRes.json();
        // Split into hosts and landlords
        setProviders(providersData.filter(p => p.role === "host"));
        setLandlords(providersData.filter(p => p.role === "landlord"));
      }

      // Load my requests
      const requestsRes = await fetch(`${API_BASE}/agent-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        setMyRequests(requestsData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHouse = async (houseId) => {
    if (!window.confirm("Are you sure you want to delete this house listing?")) return;
    setDeleteLoading(houseId);
    try {
      const res = await fetch(`${API_BASE}/properties/${houseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMyHouses((prev) => prev.filter((h) => h._id !== houseId));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || data.message || "Failed to delete listing");
      }
    } catch (err) {
      console.error("Error deleting house:", err);
      alert("Network error while deleting house");
    } finally {
      setDeleteLoading(null);
    }
  };

  const getRequestStatus = (providerId) => {
    const request = myRequests.find(
      (r) => r.provider._id === providerId || r.provider === providerId
    );
    return request ? request.status : null;
  };

  const handleSendRequest = async () => {
    if (!selectedProvider || !message) return;

    setSending(true);
    try {
      const response = await fetch(`${API_BASE}/agent-requests/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          providerId: selectedProvider._id,
          message,
        }),
      });

      if (response.ok) {
        setSelectedProvider(null);
        setMessage("");
        loadData();
      }
    } catch (error) {
      console.error("Error sending request:", error);
    } finally {
      setSending(false);
    }
  };

  const handleLogout = () => {
    logout("/agent/login");
  };

  if (loading) {
    return (
      <div style={s.root}>
        <div style={{ ...s.container, textAlign: "center", paddingTop: "100px" }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div style={{ ...s.logo, cursor: "pointer" }} onClick={() => navigate("/")}>
          <span style={s.logoAccent}>AXX</span>
          <span style={s.logoWord}>SPACE</span>
        </div>
        <div style={s.headerTitle}>Agent Dashboard</div>
        <div style={s.headerActions}>
          <button style={s.uploadBtn} onClick={() => navigate("/upload")}>
            + Upload House
          </button>
          <button style={s.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div style={s.container}>
        <div style={s.tabs}>
          <button
            style={{ ...s.tab, ...(activeTab === "houses" ? s.tabActive : {}) }}
            onClick={() => setActiveTab("houses")}
          >
            🏠 My Houses ({myHouses.length})
          </button>
          <button
            style={{ ...s.tab, ...(activeTab === "hosts" ? s.tabActive : {}) }}
            onClick={() => setActiveTab("hosts")}
          >
            Accommodation Hosts ({providers.length})
          </button>
          <button
            style={{ ...s.tab, ...(activeTab === "landlords" ? s.tabActive : {}) }}
            onClick={() => setActiveTab("landlords")}
          >
            Landlords ({landlords.length})
          </button>
          <button
            style={{ ...s.tab, ...(activeTab === "requests" ? s.tabActive : {}) }}
            onClick={() => setActiveTab("requests")}
          >
            My Requests ({myRequests.length})
          </button>
        </div>

        {activeTab === "houses" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h2 style={{ ...s.sectionTitle, marginBottom: "4px" }}>My Uploaded Houses &amp; Properties</h2>
                <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                  Upload, manage, and track your property listings directly on AXXSpace
                </p>
              </div>
              <button style={s.uploadBtn} onClick={() => navigate("/upload")}>
                + Upload New House
              </button>
            </div>

            {myHouses.length === 0 ? (
              <div style={s.emptyCard}>
                <div style={{ fontSize: "42px", marginBottom: "12px" }}>🏠</div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1f2937", marginBottom: "8px" }}>
                  No Houses Uploaded Yet
                </h3>
                <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: 1.5, marginBottom: "20px" }}>
                  As an agent on AXXSpace, you can upload and manage your rental houses, apartments, hostels, and commercial units to get direct inquiries from tenants.
                </p>
                <button
                  style={{ ...s.uploadBtn, padding: "10px 22px", fontSize: "14px" }}
                  onClick={() => navigate("/upload")}
                >
                  + Upload Your First House
                </button>
              </div>
            ) : (
              <div style={s.houseGrid}>
                {myHouses.map((house) => {
                  const isApproved = house.status === "approved";
                  const isRejected = house.status === "rejected";
                  const thumb = house.images?.[0] ? resolveMediaUrl(house.images[0]) : "";

                  return (
                    <div key={house._id} style={s.houseCard}>
                      <div style={s.houseImgWrap}>
                        {thumb ? (
                          <img src={thumb} alt={house.title} style={s.houseImg} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "36px" }}>
                            🏠
                          </div>
                        )}
                        <span style={s.houseTypePill}>{house.propertyType || "Rental"}</span>
                        <span
                          style={{
                            ...s.houseStatusPill,
                            ...(isApproved
                              ? s.statusApproved
                              : isRejected
                                ? s.statusRejected
                                : s.statusPending),
                          }}
                        >
                          {isApproved ? "✓ LIVE" : isRejected ? "REJECTED" : "PENDING REVIEW"}
                        </span>
                      </div>

                      <div style={s.houseContent}>
                        <h3 style={s.houseTitle} title={house.title}>{house.title}</h3>
                        <div style={s.houseLocation}>
                          <span>📍</span> {house.location || house.county || "Kenya"}
                        </div>
                        <div style={s.housePrice}>
                          KES {Number(house.price || 0).toLocaleString()} <span style={{ fontSize: "12px", fontWeight: 500, color: "#6b7280" }}>/ {house.leaseType || "month"}</span>
                        </div>

                        <div style={s.houseInfoRow}>
                          <span><strong>{house.totalUnits || 1}</strong> total units</span>
                          <span><strong>{house.bookedUnits || 0}</strong> booked</span>
                        </div>

                        <div style={s.houseActions}>
                          {isApproved && (
                            <button
                              style={s.viewBtn}
                              onClick={() => window.open(`/property/${house._id}`, "_blank")}
                              title="View live listing"
                            >
                              Live ↗
                            </button>
                          )}
                          <button
                            style={s.editBtn}
                            onClick={() => navigate(`/property/edit/${house._id}`)}
                            title="Edit house listing"
                          >
                            Edit ✏️
                          </button>
                          <button
                            style={s.delBtn}
                            onClick={() => handleDeleteHouse(house._id)}
                            disabled={deleteLoading === house._id}
                            title="Delete house listing"
                          >
                            {deleteLoading === house._id ? "..." : "Delete 🗑️"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "hosts" && (
          <div>
            <h2 style={s.sectionTitle}>Accommodation Hosts</h2>
            {providers.length === 0 ? (
              <div style={s.empty}>No accommodation hosts found</div>
            ) : (
              <div style={s.grid}>
                {providers.map((provider) => {
                  const status = getRequestStatus(provider._id);
                  return (
                    <div key={provider._id} style={s.card}>
                      <div style={s.cardHeader}>
                        <div style={s.avatar}>
                          {provider.name?.charAt(0).toUpperCase() || "H"}
                        </div>
                        <div>
                          <div style={s.cardName}>{provider.name}</div>
                          <div style={s.cardEmail}>{provider.email}</div>
                        </div>
                      </div>
                      {provider.phone && <div style={s.cardPhone}>📞 {provider.phone}</div>}
                      <div style={s.cardCounty}>🏨 Accommodation Host</div>
                      {provider.agentProfile?.county && (
                        <div style={s.cardCounty}>📍 {provider.agentProfile.county}</div>
                      )}
                      {status && (
                        <div
                          style={{
                            ...s.statusBadge,
                            ...(status === "pending"
                              ? s.statusPending
                              : status === "accepted"
                                ? s.statusAccepted
                                : s.statusRejected),
                          }}
                        >
                          {status.toUpperCase()}
                        </div>
                      )}
                      {!status && (
                        <button
                          style={s.requestBtn}
                          onClick={() => setSelectedProvider(provider)}
                        >
                          Send Request
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "landlords" && (
          <div>
            <h2 style={s.sectionTitle}>Landlords</h2>
            {landlords.length === 0 ? (
              <div style={s.empty}>No landlords found</div>
            ) : (
              <div style={s.grid}>
                {landlords.map((landlord) => {
                  const status = getRequestStatus(landlord._id);
                  return (
                    <div key={landlord._id} style={s.card}>
                      <div style={s.cardHeader}>
                        <div style={s.avatar}>
                          {landlord.name?.charAt(0).toUpperCase() || "L"}
                        </div>
                        <div>
                          <div style={s.cardName}>{landlord.name}</div>
                          <div style={s.cardEmail}>{landlord.email}</div>
                        </div>
                      </div>
                      {landlord.phone && <div style={s.cardPhone}>📞 {landlord.phone}</div>}
                      <div style={s.cardCounty}>🏠 Landlord ({landlord.landlordType || "General"})</div>
                      {status && (
                        <div
                          style={{
                            ...s.statusBadge,
                            ...(status === "pending"
                              ? s.statusPending
                              : status === "accepted"
                                ? s.statusAccepted
                                : s.statusRejected),
                          }}
                        >
                          {status.toUpperCase()}
                        </div>
                      )}
                      {!status && (
                        <button
                          style={s.requestBtn}
                          onClick={() => setSelectedProvider(landlord)}
                        >
                          Send Request
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "requests" && (
          <div>
            <h2 style={s.sectionTitle}>My Requests</h2>
            {myRequests.length === 0 ? (
              <div style={s.empty}>No requests sent yet</div>
            ) : (
              <div style={s.grid}>
                {myRequests.map((request) => (
                  <div key={request._id} style={s.card}>
                    <div style={s.cardHeader}>
                      <div style={s.avatar}>
                        {request.provider?.name?.charAt(0).toUpperCase() || "P"}
                      </div>
                      <div>
                        <div style={s.cardName}>{request.provider?.name}</div>
                        <div style={s.cardEmail}>{request.provider?.email}</div>
                      </div>
                    </div>
                    {request.agentMessage && (
                      <div style={s.cardBio}>
                        <strong>Your message:</strong> {request.agentMessage}
                      </div>
                    )}
                    {request.providerResponse && (
                      <div style={s.cardBio}>
                        <strong>Provider response:</strong> {request.providerResponse}
                      </div>
                    )}
                    <div
                      style={{
                        ...s.statusBadge,
                        ...(request.status === "pending"
                          ? s.statusPending
                          : request.status === "accepted"
                            ? s.statusAccepted
                            : s.statusRejected),
                      }}
                    >
                      {request.status.toUpperCase()}
                    </div>
                    <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "8px" }}>
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedProvider && (
        <div style={s.modal}>
          <div style={s.modalContent}>
            <h3 style={s.modalTitle}>
              Send Request to {selectedProvider.name}
            </h3>
            <textarea
              style={s.textarea}
              placeholder="Introduce yourself and explain why you'd like to work with this provider..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div style={s.modalButtons}>
              <button
                style={{ ...s.modalBtn, ...s.modalBtnSecondary }}
                onClick={() => {
                  setSelectedProvider(null);
                  setMessage("");
                }}
              >
                Cancel
              </button>
              <button
                style={{ ...s.modalBtn, ...s.modalBtnPrimary }}
                onClick={handleSendRequest}
                disabled={sending || !message}
              >
                {sending ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
