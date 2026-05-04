import { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";

// ====================== LANDLORD DASHBOARD ======================

export default function LandlordDashboard() {
  const { token, logout } = useContext(AuthContext);
  
  const [activeTab, setActiveTab] = useState("active");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch properties
  const fetchProperties = useCallback(async () => {
    if (!token) {
      setError("Please log in to view your properties");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const endpoint =
        activeTab === "active"
          ? "/api/properties/my-properties/active"
          : "/api/properties/my-properties/booked";

      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        logout?.();
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) throw new Error("Failed to fetch properties");

      const data = await response.json();
      setProperties(data || []);
    } catch (err) {
      setError(err.message || "Error fetching properties");
    } finally {
      setLoading(false);
    }
  }, [activeTab, token, logout]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Generic action handler
  const handleAction = async (propertyId, url, method, successText) => {
    setActionLoading(propertyId);

    try {
      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        logout?.();
        throw new Error("Session expired.");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Action failed");
      }

      setSuccessMessage(successText);
      setTimeout(() => setSuccessMessage(""), 3000);

      fetchProperties(); // Refresh list
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkBooked = (propertyId) =>
    handleAction(propertyId, `/api/properties/${propertyId}/mark-booked`, "PUT", "✅ Property marked as booked!");

  const handleUnmarkBooked = (propertyId) =>
    handleAction(propertyId, `/api/properties/${propertyId}/unmark-booked`, "PUT", "✅ Booked status removed!");

  const handleDelete = (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    handleAction(propertyId, `/api/properties/${propertyId}`, "DELETE", "✅ Property deleted successfully!");
  };

  return (
    <div className="landlord-container">
      <div className="header">
        <h1>🏠 My Properties</h1>
        <p>Manage your rental listings</p>
      </div>

      {successMessage && <div className="success">{successMessage}</div>}
      {error && <div className="error">{error}</div>}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tabBtn ${activeTab === "active" ? "active" : ""}`}
          onClick={() => setActiveTab("active")}
        >
          📋 Active Properties
        </button>
        <button
          className={`tabBtn ${activeTab === "booked" ? "active" : ""}`}
          onClick={() => setActiveTab("booked")}
        >
          ✅ Booked Properties
        </button>
      </div>

      {loading ? (
        <p className="loading">Loading properties...</p>
      ) : properties.length === 0 ? (
        <div className="empty">
          <p>
            {activeTab === "active"
              ? "No active properties yet. Upload one to get started! 🚀"
              : "No booked properties yet. 📌"}
          </p>
        </div>
      ) : (
        <div className="grid">
          {properties.map((property) => (
            <div key={property._id} className="card">
              <div className="imageContainer">
                {property.images?.[0] ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="image"
                  />
                ) : (
                  <div className="noImage">No Image</div>
                )}

                <div className="statusBadge">
                  {property.status === "approved" && <span className="approved">✅ Approved</span>}
                  {property.status === "pending" && <span className="pending">⏳ Pending</span>}
                  {property.status === "rejected" && <span className="rejected">❌ Rejected</span>}
                </div>

                {property.bookedUnits > 0 && (
                  <div className="bookedBadge">
                    {property.bookedUnits} of {property.totalUnits} Booked
                  </div>
                )}
              </div>

              <div className="details">
                <h2>{property.title}</h2>
                <p className="location">
                  📍 {property.location || property.county || property.area}
                </p>

                <div className="specs">
                  <span>🛏️ {property.bedrooms || 0} Beds</span>
                  <span>🚿 {property.bathrooms || 0} Baths</span>
                </div>

                <p className="price">
                  💰 KES {Number(property.price || 0).toLocaleString()} / month
                </p>

                <p className="description">
                  {property.description
                    ? property.description.substring(0, 100) + "..."
                    : "No description available"}
                </p>

                <div className="unitsInfo">
                  <span>Total: {property.totalUnits || 0}</span>
                  <span>Booked: {property.bookedUnits || 0}</span>
                  <span>Available: {property.availableUnits || 0}</span>
                </div>

                <div className="actions">
                  {activeTab === "active" ? (
                    <>
                      <button
                        className="bookedBtn"
                        onClick={() => handleMarkBooked(property._id)}
                        disabled={actionLoading === property._id}
                      >
                        {actionLoading === property._id ? "Processing..." : "✅ Mark Booked"}
                      </button>
                      <button
                        className="deleteBtn"
                        onClick={() => handleDelete(property._id)}
                        disabled={actionLoading === property._id}
                      >
                        🗑️ Delete
                      </button>
                    </>
                  ) : (
                    <button
                      className="unbookBtn"
                      onClick={() => handleUnmarkBooked(property._id)}
                      disabled={actionLoading === property._id}
                    >
                      {actionLoading === property._id ? "Processing..." : "🔄 Unmark Booked"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ====================== CSS STYLES ====================== */
const styles = `
.landlord-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #06101f 0%, #0f1729 100%);
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  color: #f1f5f9;
}

.header h1 {
  font-size: 2.5rem;
  margin: 0;
  color: #fbbf24;
  font-weight: 700;
}

.header p {
  font-size: 1rem;
  color: #94a3b8;
  margin-top: 8px;
}

.success, .error {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
  animation: slideDown 0.3s ease;
}

.success { background: #10b981; color: white; }
.error { background: #ef4444; color: white; }

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.tabs {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  border-bottom: 2px solid #1e293b;
  justify-content: center;
}

.tabBtn {
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 12px 24px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
}

.tabBtn:hover { color: #fbbf24; }
.tabBtn.active { color: #fbbf24; border-bottom-color: #fbbf24; }

.loading, .empty {
  text-align: center;
  color: #94a3b8;
  font-size: 1.1rem;
  padding: 40px 20px;
}

.empty {
  background: rgba(30, 41, 59, 0.5);
  border-radius: 12px;
  border: 2px dashed #475569;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.card {
  background: linear-gradient(135deg, #1e293b 0%, #0f1729 100%);
  border: 1px solid #334155;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card:hover {
  border-color: #fbbf24;
  box-shadow: 0 8px 24px rgba(251, 191, 36, 0.1);
  transform: translateY(-4px);
}

.imageContainer {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #0f1729;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card:hover .image {
  transform: scale(1.05);
}

.noImage {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #334155;
  color: #94a3b8;
  font-weight: 600;
}

.statusBadge {
  position: absolute;
  top: 12px;
  right: 12px;
}

.statusBadge span {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.approved { background: #10b981; color: white; }
.pending { background: #f59e0b; color: white; }
.rejected { background: #ef4444; color: white; }

.bookedBadge {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: rgba(59, 130, 246, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
}

.details {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.details h2 {
  color: #f1f5f9;
  font-size: 1.3rem;
  margin: 0 0 8px 0;
}

.location { color: #94a3b8; margin: 0 0 12px 0; font-size: 0.95rem; }

.specs {
  display: flex;
  gap: 12px;
  margin: 12px 0;
  color: #cbd5e1;
  font-size: 0.9rem;
}

.price {
  color: #fbbf24;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 12px 0;
}

.description {
  color: #cbd5e1;
  font-size: 0.9rem;
  margin: 12px 0;
  line-height: 1.5;
}

.unitsInfo {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  margin: 12px 0;
  font-size: 0.85rem;
  color: #cbd5e1;
}

.unitsInfo span { flex: 1; text-align: center; }

.actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
  margin-top: 16px;
}

.bookedBtn, .unbookBtn, .deleteBtn {
  flex: 1;
  padding: 10px 12px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.bookedBtn { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; }
.unbookBtn { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; }
.deleteBtn { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; }

.bookedBtn:hover:not(:disabled),
.unbookBtn:hover:not(:disabled),
.deleteBtn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.bookedBtn:disabled,
.unbookBtn:disabled,
.deleteBtn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .landlord-container { padding: 12px; }
  .header h1 { font-size: 1.8rem; }
  .grid { grid-template-columns: 1fr; }
  .tabs { flex-wrap: wrap; gap: 8px; }
  .actions { flex-direction: column; }
}
`;

export { styles };