import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function LandlordDashboard() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // "pending" | "approved"
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const fetchMyProperties = async () => {
    setLoading(true);
    setError("");
    try {
      // Get token from localStorage (adjust based on your auth setup)
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("❌ Not logged in. Please login first.");
        navigate("/login");
        return;
      }

      const res = await API.get("/properties/my-properties", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ Fetched properties:", res.data);
      setProperties(res.data);

    } catch (err) {
      console.error("❌ Fetch error:", err);
      const errorMsg = err.response?.data?.error || "Failed to load properties";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await API.delete(`/properties/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("✅ Property deleted successfully");
      setProperties(properties.filter(p => p._id !== id));

    } catch (err) {
      alert("❌ Delete failed: " + (err.response?.data?.error || err.message));
    }
  };

  // Filter by status
  const pendingProps = properties.filter(p => p.status === "pending");
  const approvedProps = properties.filter(p => p.status === "approved");
  const displayProps = activeTab === "pending" ? pendingProps : approvedProps;

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>📊 My Properties</h1>
        <p style={styles.subtitle}>Manage your listings — view pending and approved properties</p>
      </div>

      {/* Error message */}
      {error && (
        <div style={styles.errorBanner}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabBar}>
        <button
          className={`dashboard-tab${activeTab === "pending" ? " active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          ⏳ Pending ({pendingProps.length})
        </button>
        <button
          className={`dashboard-tab${activeTab === "approved" ? " active" : ""}`}
          onClick={() => setActiveTab("approved")}
        >
          ✅ Approved ({approvedProps.length})
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div style={styles.loading}>
          <div className="dashboard-spinner" />
          <p>Loading your properties…</p>
        </div>
      ) : displayProps.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            {activeTab === "pending" ? "⏳" : "✅"}
          </div>
          <h3 style={styles.emptyTitle}>
            {activeTab === "pending" 
              ? "No pending properties" 
              : "No approved properties"}
          </h3>
          <p style={styles.emptyText}>
            {activeTab === "pending"
              ? "All your properties have been approved!"
              : "You don't have any approved listings yet."}
          </p>
          <button className="dashboard-btn" onClick={() => navigate("/upload")}>
            📝 Upload a Property
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {displayProps.map((property, idx) => (
            <div
              key={property._id}
              className="dashboard-card"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              {/* Image */}
              {property.image || property.images?.[0] ? (
                <div style={styles.imageWrap}>
                  <img
                    src={property.image || property.images[0]}
                    alt={property.title}
                    style={styles.image}
                  />
                  <span style={styles.statusBadge}>
                    {property.status === "pending" ? "⏳ Pending" : "✅ Approved"}
                  </span>
                </div>
              ) : (
                <div style={styles.imagePlaceholder}>
                  <span style={{ fontSize: 36 }}>🏠</span>
                </div>
              )}

              {/* Content */}
              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{property.title}</h3>
                <p style={styles.location}>
                  📍 {property.county}{property.area ? ` · ${property.area}` : ""}
                </p>

                {/* Price & Details */}
                <div style={styles.priceBox}>
                  <div>
                    <div style={styles.label}>Monthly Rent</div>
                    <div style={styles.price}>
                      Ksh {Number(property.price).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={styles.label}>Deposit</div>
                    <div style={styles.deposit}>
                      Ksh {property.deposit ? Number(property.deposit).toLocaleString() : "N/A"}
                    </div>
                  </div>
                </div>

                {/* Meta */}
                <div style={styles.metaRow}>
                  {property.type && (
                    <span className="dashboard-meta-pill">{property.type}</span>
                  )}
                  {property.bedrooms && (
                    <span className="dashboard-meta-pill">
                      🛏 {property.bedrooms} Bed{property.bedrooms > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Description */}
                {property.description && (
                  <p style={styles.description}>{property.description}</p>
                )}

                {/* Phone */}
                <div style={styles.phoneRow}>
                  <span>📞</span>
                  <span style={styles.phone}>{property.phone}</span>
                </div>

                {/* Amenities */}
                {property.amenities?.length > 0 && (
                  <p style={styles.amenities}>
                    🏡 {property.amenities.join(", ")}
                  </p>
                )}

                {/* Status info */}
                <div style={styles.statusInfo}>
                  {property.status === "pending" ? (
                    <p style={styles.pendingText}>
                      ⏳ Your property is under review. We'll notify you once it's approved!
                    </p>
                  ) : (
                    <p style={styles.approvedText}>
                      ✅ Your property is now live! Tenants can see it on the platform.
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div style={styles.actionRow}>
                  <button
                    className="dashboard-view-btn"
                    onClick={() => navigate(`/properties/${property._id}`)}
                  >
                    👁 View
                  </button>
                  <button
                    className="dashboard-delete-btn"
                    onClick={() => handleDelete(property._id)}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div style={styles.cta}>
        <h2 style={styles.ctaTitle}>Want to list more properties?</h2>
        <button className="dashboard-btn" onClick={() => navigate("/upload")}>
          ➕ Upload Another Property
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════════════ */
const styles = {
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#06101f",
    color: "#e2e8f0",
    minHeight: "100vh",
    padding: "40px 20px 60px",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  header: { textAlign: "center", marginBottom: "30px" },
  title: { fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: "#f1f5f9", margin: "0 0 6px", letterSpacing: "-0.5px" },
  subtitle: { color: "#64748b", fontSize: "14px", margin: 0 },

  errorBanner: {
    padding: "12px 16px",
    borderRadius: "10px",
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: 600,
  },

  tabBar: {
    display: "flex",
    gap: "10px",
    marginBottom: "28px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
  },

  loading: {
    textAlign: "center",
    padding: "60px 20px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },

  imageWrap: { position: "relative" },
  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderRadius: "12px 12px 0 0",
    display: "block",
  },
  imagePlaceholder: {
    width: "100%",
    height: "160px",
    background: "rgba(59,130,246,0.07)",
    borderRadius: "12px 12px 0 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "rgba(6,16,31,0.85)",
    backdropFilter: "blur(6px)",
    color: "#fff",
    fontSize: "12px",
    fontWeight: 600,
    padding: "5px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.2)",
  },

  cardBody: { padding: "16px" },
  cardTitle: { fontSize: "16px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px" },
  location: { fontSize: "13px", color: "#60a5fa", margin: "0 0 12px" },

  priceBox: {
    display: "flex",
    justifyContent: "space-between",
    background: "rgba(59,130,246,0.07)",
    borderRadius: "10px",
    padding: "10px 14px",
    marginBottom: "12px",
  },
  label: { fontSize: "11px", color: "#64748b", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.5px" },
  price: { fontSize: "16px", fontWeight: 800, color: "#60a5fa" },
  deposit: { fontSize: "14px", fontWeight: 700, color: "#94a3b8" },

  metaRow: { display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" },

  description: {
    fontSize: "13px",
    color: "#94a3b8",
    lineHeight: 1.6,
    margin: "0 0 10px",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  phoneRow: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" },
  phone: { fontSize: "14px", fontWeight: 600, color: "#e2e8f0" },

  amenities: {
    fontSize: "12px",
    color: "#64748b",
    margin: "0 0 10px",
    lineHeight: 1.5,
  },

  statusInfo: { background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "10px 12px", marginBottom: "12px" },
  pendingText: { margin: 0, fontSize: "12px", color: "#fbbf24" },
  approvedText: { margin: 0, fontSize: "12px", color: "#86efac" },

  actionRow: { display: "flex", gap: "8px" },

  emptyState: { textAlign: "center", padding: "60px 20px" },
  emptyIcon: { fontSize: "52px", marginBottom: "12px" },
  emptyTitle: { fontSize: "22px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 8px" },
  emptyText: { color: "#64748b", marginBottom: "24px" },

  cta: {
    textAlign: "center",
    padding: "40px",
    background: "linear-gradient(160deg,#0c1d42,#060e1c)",
    borderRadius: "16px",
    border: "1px solid rgba(59,130,246,0.15)",
  },
  ctaTitle: { fontSize: "24px", fontWeight: 800, color: "#f1f5f9", margin: "0 0 16px" },
};

/* ── CSS classes ───────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');

  .dashboard-tab {
    padding: 12px 20px; border: none; background: none;
    color: #94a3b8; font-size: 14px; font-weight: 600;
    cursor: pointer; font-family: inherit; border-bottom: 2px solid transparent;
    transition: all .2s;
  }
  .dashboard-tab.active {
    color: #60a5fa; border-bottom-color: #60a5fa;
  }
  .dashboard-tab:hover { color: #e2e8f0; }

  .dashboard-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; overflow: hidden;
    transition: transform .2s, border-color .2s, box-shadow .2s;
    animation: fadeUp .4s ease both;
  }
  .dashboard-card:hover {
    transform: translateY(-4px); border-color: rgba(59,130,246,0.35);
    box-shadow: 0 12px 32px rgba(0,0,0,0.35);
  }

  .dashboard-meta-pill {
    display: inline-block; font-size: 11px; padding: 3px 10px;
    border-radius: 999px; background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08); color: #94a3b8;
  }

  .dashboard-view-btn {
    flex: 1; padding: 10px; border-radius: 10px; font-size: 13px;
    border: 1px solid rgba(59,130,246,0.35); color: #60a5fa;
    background: rgba(59,130,246,0.08); cursor: pointer; font-family: inherit;
    font-weight: 600; transition: background .2s;
  }
  .dashboard-view-btn:hover { background: rgba(59,130,246,0.18); }

  .dashboard-delete-btn {
    flex: 1; padding: 10px; border-radius: 10px; font-size: 13px;
    border: 1px solid rgba(239,68,68,0.35); color: #fca5a5;
    background: rgba(239,68,68,0.08); cursor: pointer; font-family: inherit;
    font-weight: 600; transition: background .2s;
  }
  .dashboard-delete-btn:hover { background: rgba(239,68,68,0.18); }

  .dashboard-btn {
    padding: 12px 28px; border-radius: 10px; border: none;
    background: linear-gradient(135deg,#1d4ed8,#6d28d9); color: white;
    font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit;
    box-shadow: 0 4px 20px rgba(59,130,246,0.35); transition: transform .15s;
  }
  .dashboard-btn:hover { transform: translateY(-2px); }

  .dashboard-spinner {
    width: 36px; height: 36px; border-radius: 50%;
    border: 3px solid rgba(59,130,246,0.15); border-top-color: #3b82f6;
    animation: spin .8s linear infinite; margin: 0 auto;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;