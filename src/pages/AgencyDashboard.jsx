import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

const s = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
    minHeight: "100vh",
    padding: "20px",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    padding: "40px 30px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  title: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#1f2937",
    margin: 0,
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    marginTop: "4px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "32px",
  },
  statCard: {
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
  },
  statLabel: {
    fontSize: "13px",
    opacity: 0.9,
    marginBottom: "8px",
    fontWeight: 600,
  },
  statValue: {
    fontSize: "32px",
    fontWeight: 800,
  },
  section: {
    marginBottom: "32px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: "16px",
  },
  tableContainer: {
    background: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  thead: {
    background: "#f8fafc",
  },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  td: {
    padding: "16px",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "14px",
  },
  tr: {
    transition: "background 0.2s",
  },
  button: {
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    border: "none",
    transition: "all 0.2s",
  },
  primaryButton: {
    background: "#3b82f6",
    color: "white",
  },
  dangerButton: {
    background: "#ef4444",
    color: "white",
  },
  input: {
    padding: "10px 14px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
    minWidth: "200px",
  },
  modal: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  modalContent: {
    background: "white",
    borderRadius: "16px",
    padding: "32px",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#1f2937",
    marginBottom: "20px",
  },
  field: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 700,
    color: "#374151",
    marginBottom: "6px",
  },
  error: {
    background: "#fee2e2",
    color: "#dc2626",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "16px",
  },
  empty: {
    textAlign: "center",
    padding: "48px",
    color: "#6b7280",
  },
};

export default function AgencyDashboard() {
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (user?.role !== "agency_admin") {
      navigate("/");
      return;
    }
    loadAgents();
  }, [user]);

  const loadAgents = async () => {
    setLoading(true);
    setError("");
    try {
      // Get agency ID from user's agentProfile
      const agencyId = user?.agentProfile?.agencyId;
      if (!agencyId) {
        setError("No agency associated with your account");
        return;
      }

      const res = await API.get(`/agencies/${agencyId}/agents`);
      setAgents(res.data || []);
    } catch (err) {
      console.error("Failed to load agents:", err);
      setError("Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteAgent = async (e) => {
    e.preventDefault();
    setInviting(true);
    setError("");

    try {
      const agencyId = user?.agentProfile?.agencyId;
      if (!agencyId) {
        setError("No agency associated with your account");
        return;
      }

      // Find agent by email first
      const userRes = await API.get(`/users?email=${inviteEmail}`);
      const agentUser = userRes.data?.[0];

      if (!agentUser) {
        setError("User not found. Please ask the agent to register first.");
        return;
      }

      if (agentUser.role !== "agent") {
        setError("This user is not registered as an agent.");
        return;
      }

      const res = await API.post(`/agencies/${agencyId}/agents/invite`, {
        agentId: agentUser._id,
      });

      if (res.data.success) {
        alert("Agent added to agency successfully");
        setShowInviteModal(false);
        setInviteEmail("");
        loadAgents();
      } else {
        setError(res.data.error || "Failed to add agent");
      }
    } catch (err) {
      console.error("Failed to invite agent:", err);
      setError("Failed to add agent to agency");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveAgent = async (agentId) => {
    if (!confirm("Are you sure you want to remove this agent from your agency?")) return;

    try {
      const agencyId = user?.agentProfile?.agencyId;
      const res = await API.delete(`/agencies/${agencyId}/agents/${agentId}`);

      if (res.data.success) {
        alert("Agent removed successfully");
        loadAgents();
      } else {
        alert(res.data.error || "Failed to remove agent");
      }
    } catch (err) {
      console.error("Failed to remove agent:", err);
      alert("Failed to remove agent");
    }
  };

  const verifiedCount = agents.filter(a => a.agentProfile?.verificationStatus === "verified").length;
  const pendingCount = agents.filter(a => a.agentProfile?.verificationStatus === "pending").length;

  return (
    <div style={s.root}>
      <div style={s.container}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Agency Dashboard</h1>
            <p style={s.subtitle}>Manage your agency's agents and track their performance</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            style={{ ...s.button, ...s.primaryButton }}
          >
            + Add Agent
          </button>
        </div>

        {error && <div style={s.error}>{error}</div>}

        {/* Stats */}
        <div style={s.statsGrid}>
          <div style={s.statCard}>
            <div style={s.statLabel}>Total Agents</div>
            <div style={s.statValue}>{agents.length}</div>
          </div>
          <div style={{ ...s.statCard, background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" }}>
            <div style={s.statLabel}>Verified Agents</div>
            <div style={s.statValue}>{verifiedCount}</div>
          </div>
          <div style={{ ...s.statCard, background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" }}>
            <div style={s.statLabel}>Pending Verification</div>
            <div style={s.statValue}>{pendingCount}</div>
          </div>
        </div>

        {/* Agents Table */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Agency Agents</h2>
          {loading ? (
            <div style={s.empty}>Loading agents...</div>
          ) : agents.length === 0 ? (
            <div style={s.empty}>
              <p>No agents in your agency yet.</p>
              <p>Click "Add Agent" to invite agents to join your agency.</p>
            </div>
          ) : (
            <div style={s.tableContainer}>
              <table style={s.table}>
                <thead style={s.thead}>
                  <tr>
                    <th style={s.th}>Agent Name</th>
                    <th style={s.th}>Email</th>
                    <th style={s.th}>Phone</th>
                    <th style={s.th}>County</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent._id} style={s.tr}>
                      <td style={s.td}>
                        <div style={{ fontWeight: 600 }}>{agent.name}</div>
                      </td>
                      <td style={s.td}>{agent.email}</td>
                      <td style={s.td}>{agent.agentProfile?.phone || "N/A"}</td>
                      <td style={s.td}>{agent.agentProfile?.county || "N/A"}</td>
                      <td style={s.td}>
                        <span style={{
                          fontSize: "11px",
                          padding: "4px 10px",
                          borderRadius: "4px",
                          fontWeight: 600,
                          background: agent.agentProfile?.verificationStatus === "verified"
                            ? "rgba(34,197,94,0.12)"
                            : "rgba(251,191,36,0.12)",
                          color: agent.agentProfile?.verificationStatus === "verified"
                            ? "#22c55e"
                            : "#fbbf24",
                        }}>
                          {agent.agentProfile?.verificationStatus?.toUpperCase() || "PENDING"}
                        </span>
                      </td>
                      <td style={s.td}>
                        <button
                          onClick={() => handleRemoveAgent(agent._id)}
                          style={{ ...s.button, ...s.dangerButton, padding: "6px 12px", fontSize: "12px" }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div style={s.modal} onClick={() => setShowInviteModal(false)}>
          <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={s.modalTitle}>Add Agent to Agency</h2>
            <form onSubmit={handleInviteAgent}>
              <div style={s.field}>
                <label style={s.label}>Agent Email *</label>
                <input
                  style={s.input}
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="agent@example.com"
                  required
                />
                <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                  The agent must already be registered on the platform.
                </p>
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button
                  type="submit"
                  disabled={inviting}
                  style={{ ...s.button, ...s.primaryButton, flex: 1 }}
                >
                  {inviting ? "Adding..." : "Add Agent"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  style={{ ...s.button, background: "#e5e7eb", color: "#374151", flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
