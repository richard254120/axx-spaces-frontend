import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

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
};

export default function AgentDashboard() {
  const navigate = useNavigate();
  const { user, token, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("hosts");
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
        <div style={s.logo}>
          <span style={s.logoAccent}>AXX</span>
          <span style={s.logoWord}>SPACE</span>
        </div>
        <div style={s.headerTitle}>Agent Dashboard</div>
        <button style={s.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div style={s.container}>
        <div style={s.tabs}>
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
