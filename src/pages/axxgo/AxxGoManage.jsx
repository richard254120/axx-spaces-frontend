import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../../api/api";
import { COUNTIES, CATEGORIES, formatPrice } from "../../data/axxgoData";

export default function AxxGoManage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Editable fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState("fixed");
  const [pricePeriod, setPricePeriod] = useState("one-off");
  const [county, setCounty] = useState("Nairobi City");
  const [area, setArea] = useState("");
  const [status, setStatus] = useState("active");

  const [saving, setSaving] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function fetchListingByToken() {
      setLoading(true);
      setError("");
      try {
        const res = await API.get(`/axxgo/manage/${token}`);
        if (res.data.success) {
          const l = res.data.listing;
          setListing(l);
          setTitle(l.title || "");
          setDescription(l.description || "");
          setPrice(l.price !== undefined ? String(l.price) : "");
          setPriceType(l.priceType || "fixed");
          setPricePeriod(l.pricePeriod || "one-off");
          setCounty(l.location?.county || "Nairobi City");
          setArea(l.location?.area || "");
          setStatus(l.status || "active");
        }
      } catch (err) {
        setError(err.response?.data?.error || "Invalid or expired secret management link.");
      } finally {
        setLoading(false);
      }
    }

    if (token) fetchListingByToken();
  }, [token]);

  // Quick Status change
  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await API.put(`/axxgo/manage/${token}`, { status: newStatus });
      if (res.data.success) {
        setListing(res.data.listing);
        setSuccessMsg(`Status updated to "${newStatus.toUpperCase()}"!`);
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update status.");
    } finally {
      setSaving(false);
    }
  };

  // Renew listing
  const handleRenew = async () => {
    setRenewing(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await API.post(`/axxgo/manage/${token}/renew`);
      if (res.data.success) {
        setListing((prev) => ({ ...prev, expiresAt: res.data.expiresAt, status: "active" }));
        setStatus("active");
        setSuccessMsg("Listing renewed for 30 more days!");
        setTimeout(() => setSuccessMsg(""), 3500);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to renew listing.");
    } finally {
      setRenewing(false);
    }
  };

  // Save changes
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await API.put(`/axxgo/manage/${token}`, {
        title: title.trim(),
        description: description.trim(),
        price: Number(price) >= 0 ? Number(price) : 0,
        priceType,
        pricePeriod,
        county,
        area: area.trim(),
        status,
      });

      if (res.data.success) {
        setListing(res.data.listing);
        setSuccessMsg("Changes saved successfully!");
        setTimeout(() => setSuccessMsg(""), 3500);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  // Delete listing permanently
  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      const res = await API.delete(`/axxgo/manage/${token}`);
      if (res.data.success) {
        alert("Your listing has been permanently deleted from AxxGo.");
        navigate("/axxgo");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete listing.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          background: "#0f1729",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
        }}
      >
        <p>Loading management console...</p>
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div style={{ background: "#0f1729", minHeight: "100vh", padding: "60px 16px", color: "#f8fafc" }}>
        <div
          style={{
            maxWidth: "500px",
            margin: "0 auto",
            background: "#1e293b",
            border: "1px solid #ef4444",
            borderRadius: "14px",
            padding: "32px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "44px", marginBottom: "12px" }}>🔒</div>
          <h2 style={{ margin: "0 0 10px", fontSize: "20px", color: "#fca5a5" }}>Management Link Invalid</h2>
          <p style={{ margin: "0 0 20px", color: "#cbd5e1", fontSize: "14px" }}>{error}</p>
          <Link
            to="/axxgo"
            style={{
              background: "#dc2626",
              color: "white",
              textDecoration: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "14px",
            }}
          >
            Go to AxxGo Classifieds
          </Link>
        </div>
      </div>
    );
  }

  const categoryMeta = CATEGORIES.find((c) => c.id === listing.category);

  return (
    <div style={{ background: "#0f1729", minHeight: "100vh", color: "#f8fafc", padding: "28px 16px 80px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Top Header */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span
              style={{
                background: "rgba(245, 158, 11, 0.15)",
                color: "#f59e0b",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                fontSize: "12px",
                fontWeight: "700",
                padding: "3px 10px",
                borderRadius: "20px",
              }}
            >
              🔑 Secret Poster Console
            </span>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>No Password Required</span>
          </div>
          <h1 style={{ margin: "0 0 6px", fontSize: "24px", fontWeight: "800" }}>Manage Your Listing</h1>
          <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>
            Update availability, mark as sold or rented, renew expiration date, or edit details.
          </p>
        </div>

        {/* Live Link Button */}
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "10px",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc" }}>{listing.title}</div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              Category: {listing.category} • Views: {listing.views || 0}
            </div>
          </div>
          <Link
            to={`/axxgo/listing/${listing._id}`}
            style={{
              background: "#334155",
              color: "#38bdf8",
              border: "1px solid #475569",
              padding: "8px 16px",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            View Live Listing ↗
          </Link>
        </div>

        {/* Success / Error Alerts */}
        {successMsg && (
          <div
            style={{
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid #10b981",
              borderRadius: "8px",
              padding: "12px 16px",
              color: "#a7f3d0",
              fontSize: "14px",
              marginBottom: "16px",
            }}
          >
            ✓ {successMsg}
          </div>
        )}

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid #ef4444",
              borderRadius: "8px",
              padding: "12px 16px",
              color: "#fca5a5",
              fontSize: "14px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        {/* ── Status Management Card ── */}
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ margin: "0 0 12px", fontSize: "16px", fontWeight: "700" }}>Quick Status Actions</h3>
          <p style={{ margin: "0 0 14px", fontSize: "13px", color: "#94a3b8" }}>
            Current Status:{" "}
            <span
              style={{
                textTransform: "uppercase",
                fontWeight: "800",
                color: status === "active" ? "#10b981" : status === "sold" ? "#ef4444" : "#f59e0b",
              }}
            >
              {status}
            </span>
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleStatusChange("active")}
              style={{
                background: status === "active" ? "#10b981" : "#0f1729",
                color: "white",
                border: `1px solid ${status === "active" ? "#10b981" : "#334155"}`,
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              ✓ Active / Available
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleStatusChange("sold")}
              style={{
                background: status === "sold" ? "#dc2626" : "#0f1729",
                color: "white",
                border: `1px solid ${status === "sold" ? "#dc2626" : "#334155"}`,
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              🏷️ Mark as Sold
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleStatusChange("rented")}
              style={{
                background: status === "rented" ? "#3b82f6" : "#0f1729",
                color: "white",
                border: `1px solid ${status === "rented" ? "#3b82f6" : "#334155"}`,
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              🏠 Mark as Rented
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleStatusChange("unavailable")}
              style={{
                background: status === "unavailable" ? "#64748b" : "#0f1729",
                color: "white",
                border: `1px solid ${status === "unavailable" ? "#64748b" : "#334155"}`,
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              ⏸️ Mark as Unavailable
            </button>
          </div>
        </div>

        {/* ── Auto-Expiration & Renewal ── */}
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "700" }}>30-Day Auto-Expiration</h3>
            <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
              Expires on:{" "}
              <strong style={{ color: "#38bdf8" }}>
                {listing.expiresAt ? new Date(listing.expiresAt).toLocaleDateString("en-KE") : "In 30 days"}
              </strong>
            </p>
          </div>
          <button
            type="button"
            disabled={renewing}
            onClick={handleRenew}
            style={{
              background: "#38bdf8",
              color: "#0f1729",
              border: "none",
              padding: "10px 18px",
              borderRadius: "8px",
              fontWeight: "800",
              fontSize: "13px",
              cursor: renewing ? "not-allowed" : "pointer",
            }}
          >
            {renewing ? "Renewing..." : "🔄 Renew for +30 Days"}
          </button>
        </div>

        {/* ── Edit Listing Details Form ── */}
        <form onSubmit={handleSaveChanges}>
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "24px",
            }}
          >
            <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "700" }}>Edit Listing Details</h3>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  background: "#0f1729",
                  border: "1px solid #334155",
                  color: "white",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                Description
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  background: "#0f1729",
                  border: "1px solid #334155",
                  color: "white",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  width: "100%",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                  Price (KES)
                </label>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={{
                    background: "#0f1729",
                    border: "1px solid #334155",
                    color: "white",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                  Price Type
                </label>
                <select
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value)}
                  style={{
                    background: "#0f1729",
                    border: "1px solid #334155",
                    color: "white",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="negotiable">Negotiable</option>
                  <option value="contact_for_price">Contact for Price</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                  Billing Period
                </label>
                <select
                  value={pricePeriod}
                  onChange={(e) => setPricePeriod(e.target.value)}
                  style={{
                    background: "#0f1729",
                    border: "1px solid #334155",
                    color: "white",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="one-off">One-off / Total</option>
                  <option value="per-month">Per Month</option>
                  <option value="per-night">Per Night</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                  County
                </label>
                <select
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  style={{
                    background: "#0f1729",
                    border: "1px solid #334155",
                    color: "white",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  {COUNTIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                  Area / Neighborhood
                </label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  style={{
                    background: "#0f1729",
                    border: "1px solid #334155",
                    color: "white",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>

        {/* ── Danger Zone: Delete Listing ── */}
        <div
          style={{
            background: "rgba(220, 38, 38, 0.08)",
            border: "1px solid #ef4444",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h3 style={{ margin: "0 0 6px", fontSize: "16px", color: "#f87171", fontWeight: "700" }}>Danger Zone</h3>
          <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#cbd5e1" }}>
            Permanently delete this listing and remove it from search results immediately.
          </p>

          {showDeleteConfirm ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "13px", color: "#fca5a5" }}>Are you sure? This cannot be undone:</span>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                style={{
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: deleting ? "not-allowed" : "pointer",
                }}
              >
                {deleting ? "Deleting..." : "Yes, Delete Permanently"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
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
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                background: "transparent",
                border: "1px solid #ef4444",
                color: "#ef4444",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Delete Listing Permanently
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

