import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../api/api";
import { formatTimeAgo, formatPrice } from "../../data/axxgoData";
import {
  IconFlag,
  IconBan,
  IconCheck,
  IconTrash,
  IconExternalLink,
} from "../../components/axxgo/AxxGoIcons";

export default function AxxGoAdmin() {
  const [activeTab, setActiveTab] = useState("reports"); // reports, banned
  const [reports, setReports] = useState([]);
  const [bannedList, setBannedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Ban Modal
  const [showBanModal, setShowBanModal] = useState(false);
  const [banType, setBanType] = useState("phone");
  const [banValue, setBanValue] = useState("");
  const [banReason, setBanReason] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/axxgo/admin/reports");
      if (res.data.success) {
        setReports(res.data.reports || []);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load reports. Make sure you are logged in as admin.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBanned = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/axxgo/admin/banned");
      if (res.data.success) {
        setBannedList(res.data.banned || []);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load banned list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "reports") fetchReports();
    else fetchBanned();
  }, [activeTab]);

  const handleToggleHide = async (listingId, currentlyHidden) => {
    try {
      const res = await API.post(`/axxgo/admin/listings/${listingId}/hide`, {
        hide: !currentlyHidden,
      });
      if (res.data.success) {
        setActionSuccess(res.data.message);
        fetchReports();
        setTimeout(() => setActionSuccess(""), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Action failed.");
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm("Permanently delete this listing and all its reports?")) return;
    try {
      const res = await API.delete(`/axxgo/admin/listings/${listingId}`);
      if (res.data.success) {
        setActionSuccess("Listing deleted permanently.");
        fetchReports();
        setTimeout(() => setActionSuccess(""), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed.");
    }
  };

  const handleBanSubmit = async (e) => {
    e.preventDefault();
    if (!banValue.trim()) return;

    try {
      const res = await API.post("/axxgo/admin/ban", {
        type: banType,
        value: banValue.trim(),
        reason: banReason.trim(),
      });
      if (res.data.success) {
        setShowBanModal(false);
        setBanValue("");
        setBanReason("");
        setActionSuccess(`Banned ${banType}: ${banValue}`);
        fetchBanned();
        setTimeout(() => setActionSuccess(""), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to ban.");
    }
  };

  const handleUnban = async (id) => {
    if (!window.confirm("Remove this ban?")) return;
    try {
      const res = await API.delete(`/axxgo/admin/banned/${id}`);
      if (res.data.success) {
        setActionSuccess("Ban removed successfully.");
        fetchBanned();
        setTimeout(() => setActionSuccess(""), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to remove ban.");
    }
  };

  return (
    <div style={{ background: "#0f1729", minHeight: "100vh", color: "#f8fafc", padding: "28px 16px 80px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ background: "#dc2626", color: "white", fontSize: "11px", fontWeight: "800", padding: "2px 8px", borderRadius: "4px" }}>
                ADMIN
              </span>
              <span style={{ fontSize: "13px", color: "#94a3b8" }}>Cleanup & Moderation</span>
            </div>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "800" }}>AxxGo Moderation Console</h1>
          </div>
          <Link
            to="/axxgo"
            style={{
              background: "#1e293b",
              border: "1px solid #475569",
              color: "#cbd5e1",
              padding: "8px 16px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            ← View Public AxxGo
          </Link>
        </div>

        {/* Tab switch */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            style={{
              background: activeTab === "reports" ? "#dc2626" : "#1e293b",
              color: "white",
              border: `1px solid ${activeTab === "reports" ? "#dc2626" : "#334155"}`,
              padding: "8px 20px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <IconFlag size={15} />
            <span>Reports ({reports.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("banned")}
            style={{
              background: activeTab === "banned" ? "#dc2626" : "#1e293b",
              color: "white",
              border: `1px solid ${activeTab === "banned" ? "#dc2626" : "#334155"}`,
              padding: "8px 20px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <IconBan size={15} />
            <span>Banned Entities ({bannedList.length})</span>
          </button>
        </div>

        {actionSuccess && (
          <div
            style={{
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid #10b981",
              borderRadius: "8px",
              padding: "10px 16px",
              color: "#a7f3d0",
              fontSize: "13px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <IconCheck size={16} color="#10b981" />
            <span>{actionSuccess}</span>
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

        {/* TAB 1: REPORTS */}
        {activeTab === "reports" && (
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", overflow: "hidden" }}>
            {loading ? (
              <p style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>Loading reports...</p>
            ) : reports.length === 0 ? (
              <p style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>No reported listings found. Everything is clean!</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#0f1729", borderBottom: "1px solid #334155", color: "#94a3b8" }}>
                      <th style={{ padding: "12px 16px" }}>Listing</th>
                      <th style={{ padding: "12px 16px" }}>Reason</th>
                      <th style={{ padding: "12px 16px" }}>Details & Contact</th>
                      <th style={{ padding: "12px 16px" }}>Status</th>
                      <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => {
                      const l = r.listing;
                      const isHidden = l?.status === "hidden";
                      return (
                        <tr key={r._id} style={{ borderBottom: "1px solid #334155" }}>
                          <td style={{ padding: "14px 16px", verticalAlign: "top", maxWidth: "260px" }}>
                            {l ? (
                              <div>
                                <Link
                                  to={`/axxgo/listing/${l._id}`}
                                  target="_blank"
                                  style={{ color: "#38bdf8", fontWeight: "600", textDecoration: "none" }}
                                >
                                  {l.title}
                                </Link>
                                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "3px" }}>
                                  Category: {l.category} • KES {l.price}
                                </div>
                                <div style={{ fontSize: "11px", color: "#cbd5e1" }}>
                                  Poster: {l.poster?.name} ({l.poster?.phone})
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: "#ef4444" }}>[Deleted Listing]</span>
                            )}
                          </td>

                          <td style={{ padding: "14px 16px", verticalAlign: "top" }}>
                            <span
                              style={{
                                background: r.reason === "scam" ? "rgba(220, 38, 38, 0.2)" : "rgba(245, 158, 11, 0.2)",
                                color: r.reason === "scam" ? "#fca5a5" : "#fcd34d",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontWeight: "700",
                                textTransform: "uppercase",
                                fontSize: "11px",
                              }}
                            >
                              {r.reason}
                            </span>
                            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                              {formatTimeAgo(r.createdAt)}
                            </div>
                          </td>

                          <td style={{ padding: "14px 16px", verticalAlign: "top", maxWidth: "240px" }}>
                            <div style={{ color: "#cbd5e1" }}>{r.details || "No additional comments"}</div>
                            {r.reporterContact && (
                              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                                Reporter: {r.reporterContact}
                              </div>
                            )}
                          </td>

                          <td style={{ padding: "14px 16px", verticalAlign: "top" }}>
                            {isHidden ? (
                              <span style={{ color: "#ef4444", fontWeight: "700" }}>● Auto-Hidden</span>
                            ) : (
                              <span style={{ color: "#10b981" }}>● Active</span>
                            )}
                          </td>

                          <td style={{ padding: "14px 16px", verticalAlign: "top", textAlign: "right" }}>
                            {l && (
                              <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                                <button
                                  type="button"
                                  onClick={() => handleToggleHide(l._id, isHidden)}
                                  style={{
                                    background: isHidden ? "#10b981" : "#f59e0b",
                                    color: "white",
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                  }}
                                >
                                  {isHidden ? "Unhide" : "Hide"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteListing(l._id)}
                                  style={{
                                    background: "#dc2626",
                                    color: "white",
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BANNED */}
        {activeTab === "banned" && (
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>Banned Phone Numbers & IPs</h3>
              <button
                type="button"
                onClick={() => setShowBanModal(true)}
                style={{
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                + Ban New Phone / IP
              </button>
            </div>

            {loading ? (
              <p style={{ color: "#94a3b8" }}>Loading banned entities...</p>
            ) : bannedList.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>No banned entities found.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #334155", color: "#94a3b8" }}>
                      <th style={{ padding: "10px" }}>Type</th>
                      <th style={{ padding: "10px" }}>Value</th>
                      <th style={{ padding: "10px" }}>Reason</th>
                      <th style={{ padding: "10px" }}>Banned At</th>
                      <th style={{ padding: "10px", textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bannedList.map((b) => (
                      <tr key={b._id} style={{ borderBottom: "1px solid #334155" }}>
                        <td style={{ padding: "12px 10px", textTransform: "uppercase", fontWeight: "700", color: "#fca5a5" }}>
                          {b.type}
                        </td>
                        <td style={{ padding: "12px 10px", fontWeight: "600" }}>{b.value}</td>
                        <td style={{ padding: "12px 10px", color: "#cbd5e1" }}>{b.reason}</td>
                        <td style={{ padding: "12px 10px", color: "#64748b" }}>{formatTimeAgo(b.createdAt)}</td>
                        <td style={{ padding: "12px 10px", textAlign: "right" }}>
                          <button
                            type="button"
                            onClick={() => handleUnban(b._id)}
                            style={{
                              background: "transparent",
                              border: "1px solid #10b981",
                              color: "#10b981",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                          >
                            Unban
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Ban Modal */}
        {showBanModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.75)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
          >
            <div
              style={{
                background: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "12px",
                padding: "24px",
                maxWidth: "450px",
                width: "100%",
              }}
            >
              <h3 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <IconBan size={18} color="#ef4444" />
                <span>Ban Phone Number or IP</span>
              </h3>
              <form onSubmit={handleBanSubmit}>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Type
                  </label>
                  <select
                    value={banType}
                    onChange={(e) => setBanType(e.target.value)}
                    style={{
                      background: "#0f1729",
                      border: "1px solid #334155",
                      color: "white",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="phone">Phone Number</option>
                    <option value="ip">IP Address</option>
                  </select>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    {banType === "phone" ? "Phone Number" : "IP Address"}
                  </label>
                  <input
                    type="text"
                    required
                    value={banValue}
                    onChange={(e) => setBanValue(e.target.value)}
                    placeholder={banType === "phone" ? "e.g. 0712345678" : "e.g. 197.232.x.x"}
                    style={{
                      background: "#0f1729",
                      border: "1px solid #334155",
                      color: "white",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "18px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Reason
                  </label>
                  <input
                    type="text"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="e.g. Repeated scam reports"
                    style={{
                      background: "#0f1729",
                      border: "1px solid #334155",
                      color: "white",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setShowBanModal(false)}
                    style={{
                      background: "transparent",
                      border: "1px solid #475569",
                      color: "#cbd5e1",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: "#dc2626",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Confirm Ban
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

