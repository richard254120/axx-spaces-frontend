import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import VerificationStatus from "../components/VerificationStatus";
import { UserProfileEditor, ProfileAvatar } from "../features/profile";
import VerificationBadges from "../components/VerificationBadges";
import AnalyticsDashboard from "../components/AnalyticsDashboard";

import { getDashboardPath } from "../utils/dashboardRoutes";

const COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta", "Garissa", "Wajir",
  "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka Nithi", "Embu", "Kitui", "Machakos",
  "Makueni", "Nyandarua", "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot",
  "Samburu", "Trans Nzoia", "Uasin Gishu", "Elgeyo Marakwet", "Nandi", "Baringo", "Laikipia",
  "Nakuru", "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia",
  "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi City"
];

const CATEGORIES = ["Construction Materials", "Furniture", "Appliances", "Electronics", "Tools", "Other"];
const CONDITIONS = ["Like New", "Good", "Fair", "Poor"];

const STATUS_COLORS = {
  pending: { bg: "rgba(251,191,36,0.15)", color: "#fbbf24", label: "⏳ Pending Approval" },
  active: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", label: "✅ Live" },
  approved: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", label: "✅ Live" },
  sold: { bg: "rgba(148,163,184,0.15)", color: "#94a3b8", label: "🏷️ Sold" },
  archived: { bg: "rgba(239,68,68,0.15)", color: "#ef4444", label: "❌ Rejected" },
  rejected: { bg: "rgba(239,68,68,0.15)", color: "#ef4444", label: "❌ Rejected" },
};

const resolveStatus = (item) => {
  const raw = item.status || "pending";
  if (raw === "approved") return "active";
  return raw;
};

export default function UserDashboard() {
  const { user, token, logout, login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Navigation and ui states
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Data lists
  const [businesses, setBusinesses] = useState([]);
  const [properties, setProperties] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [moverJobs, setMoverJobs] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState({});

  // Material upload sub-view inside the Sales tab
  const [materialView, setMaterialView] = useState("list"); // "list" or "upload"
  const [uploadLoading, setUploadLoading] = useState(false);
  const [materialImages, setMaterialImages] = useState([]);
  const [materialPreviews, setMaterialPreviews] = useState([]);
  const [materialForm, setMaterialForm] = useState({
    title: "", description: "", category: "", condition: "Good",
    price: "", quantity: "", location: "", county: "", lat: "", lng: ""
  });

  // Load all dashboard content
  useEffect(() => {
    if (!token) {
      navigate("/business-login");
      return;
    }
    // Allow business users (role: "user") to access this dashboard
    // Don't redirect them away from their intended dashboard
    loadAllData();
    fetchAgents();
  }, [token, user]);

  const loadAllData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const [bizRes, propRes, matRes] = await Promise.all([
        API.get("/business/my").catch(() => ({ data: { businesses: [] } })),
        API.get("/properties/my-properties/all").catch(() => ({ data: [] })),
        API.get("/materials/seller/my-materials").catch(() => ({ data: [] }))
      ]);

      setBusinesses(bizRes.data?.businesses || []);

      const processedProperties = (propRes.data || []).map(p => ({
        ...p,
        availableUnits: Math.max(0, (p.totalUnits || 1) - (p.bookedUnits || 0)),
      }));
      setProperties(processedProperties);

      // Initialize property agent selection state
      const agentMap = {};
      processedProperties.forEach(p => {
        if (p.assignedAgent) agentMap[p._id] = p.assignedAgent;
      });
      setSelectedAgents(agentMap);

      setMaterials(matRes.data || []);

      if (user?.role === "mover") {
        const moverRes = await API.get("/jobs/mover").catch(() => ({ data: [] }));
        setMoverJobs(moverRes.data || []);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load workspace data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await API.get("/properties/agents/all");
      setAgents(res.data || []);
    } catch (err) {
      console.log("Agents endpoints fail catch:", err.message);
    }
  };

  // Directory Listings Actions
  const handleEditBusiness = (id) => navigate(`/business/edit/${id}`);
  const handleDeleteBusiness = async (id) => {
    if (!window.confirm("Delete this business directory?")) return;
    try {
      await API.delete(`/business/${id}`);
      showSuccess("Business listing deleted successfully");
      loadAllData();
    } catch (err) {
      showError("Failed to delete business listing");
    }
  };

  // Property / Rentals Actions
  const updateBookedUnits = async (propertyId, change) => {
    try {
      await API.patch(`/properties/${propertyId}/book`, { change });
      showSuccess(change > 0 ? "Unit marked as booked" : "Unit marked as available");
      loadAllData();
    } catch (err) {
      showError("Could not update units booking");
    }
  };

  const handleAssignAgent = async (propertyId, agentId) => {
    try {
      await API.patch(`/properties/${propertyId}/assign-agent`, { agentId });
      setSelectedAgents(prev => ({ ...prev, [propertyId]: agentId }));
      showSuccess("Agent assigned successfully");
      loadAllData();
    } catch (err) {
      showError("Failed to assign agent. (Endpoint simulation)");
    }
  };

  const handleBoostProperty = (propertyId) => {
    navigate(`/premium-plans?propertyId=${propertyId}`);
  };

  // QuickSales / Materials Actions
  const handleMarkMaterialSold = async (id) => {
    try {
      await API.patch(`/materials/${id}/sold`);
      showSuccess("Item marked as sold");
      loadAllData();
    } catch (err) {
      showError("Could not mark item as sold");
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm("Permanently delete this material listing?")) return;
    try {
      await API.delete(`/materials/${id}`);
      showSuccess("Material listing deleted");
      loadAllData();
    } catch (err) {
      showError("Failed to delete material listing");
    }
  };

  // Mover Jobs Actions
  const handleAcceptMoverJob = async (jobId) => {
    try {
      await API.put(`/jobs/${jobId}/accept`);
      showSuccess("Job request accepted!");
      loadAllData();
    } catch (err) {
      showError("Could not accept job");
    }
  };

  const handleCompleteMoverJob = async (jobId) => {
    if (!window.confirm("Mark this job as completed?")) return;
    try {
      await API.patch(`/jobs/${jobId}/complete`);
      showSuccess("Job completed!");
      loadAllData();
    } catch (err) {
      showError("Could not update job status");
    }
  };

  // Sales Material Upload
  const handleMaterialFormChange = (e) => {
    const { name, value } = e.target;
    setMaterialForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMaterialImages = (e) => {
    const files = Array.from(e.target.files);
    setMaterialImages(files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setMaterialPreviews(newPreviews);
  };

  const handleMaterialUploadSubmit = async (e) => {
    e.preventDefault();
    if (!materialForm.title || !materialForm.price || !materialForm.location || !materialForm.county) {
      showError("Please fill out all required fields");
      return;
    }
    if (materialImages.length === 0) {
      showError("Please upload at least one image");
      return;
    }

    setUploadLoading(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(materialForm).forEach(key => {
        formDataToSend.append(key, materialForm[key]);
      });
      materialImages.forEach(img => {
        formDataToSend.append("images", img);
      });

      const res = await fetch(`${API_BASE}/materials/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to upload material");
      }

      showSuccess("Material uploaded successfully! Pending approval.");
      setMaterialForm({
        title: "", description: "", category: "", condition: "Good",
        price: "", quantity: "", location: "", county: "", lat: "", lng: ""
      });
      setMaterialImages([]);
      setMaterialPreviews([]);
      setMaterialView("list");
      loadAllData();
    } catch (err) {
      showError(err.message || "Failed to list material");
    } finally {
      setUploadLoading(false);
    }
  };

  // Toast Helpers
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 4000);
  };

  // Total summary calculations
  const totalListedCount = businesses.length + properties.length + materials.length;

  if (loading) {
    return (
      <div style={s.loaderContainer}>
        <div style={s.spinner}></div>
        <p style={{ marginTop: "16px", fontWeight: "600", color: "#fbbf24" }}>Loading Unified Workspace...</p>
      </div>
    );
  }

  return (
    <div style={s.dashboardContainer}>
      <style>{customStyles}</style>

      {/* TOP HEADER MENU BAR FOR MOBILE */}
      <header style={s.mobileHeader}>
        <button style={s.menuToggleBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? "✕ Menu" : "☰ Menu"}
        </button>
        <span style={s.headerBranding}>AxxSpace Workspace</span>
        <ProfileAvatar user={user} size={32} />
      </header>

      {/* SIDEBAR WRAPPER */}
      <aside style={{ ...s.sidebar, transform: sidebarOpen ? "translateX(0)" : "" }}>
        <div style={s.sidebarBrand}>
          <span style={s.brandGold}>AXXSPACE</span>
          <span style={s.brandSub}>Client Panel</span>
        </div>

        <div style={s.sidebarUserProfile}>
          <ProfileAvatar user={user} size={50} />
          <div style={s.userMetaInfo}>
            <div style={s.userName}>{user?.name || "Member Account"}</div>
            <div style={s.userRole}>{user?.role?.toUpperCase() || "USER"}</div>
          </div>
        </div>

        <nav style={s.sidebarNav}>
          <button style={{ ...s.navItem, ...(activeTab === "overview" && s.navItemActive) }} onClick={() => { setActiveTab("overview"); setSidebarOpen(false); }}>
            <span style={s.navIcon}>📊</span> Overview
          </button>
          <button style={{ ...s.navItem, ...(activeTab === "businesses" && s.navItemActive) }} onClick={() => { setActiveTab("businesses"); setSidebarOpen(false); }}>
            <span style={s.navIcon}>🏢</span> Directory Listings
          </button>
          <button style={{ ...s.navItem, ...(activeTab === "properties" && s.navItemActive) }} onClick={() => { setActiveTab("properties"); setSidebarOpen(false); }}>
            <span style={s.navIcon}>🏠</span> Rentals / Properties
          </button>
          <button style={{ ...s.navItem, ...(activeTab === "materials" && s.navItemActive) }} onClick={() => { setActiveTab("materials"); setSidebarOpen(false); setMaterialView("list"); }}>
            <span style={s.navIcon}>🛒</span> QuickSales / Items
          </button>
          {user?.role === "mover" && (
            <button style={{ ...s.navItem, ...(activeTab === "mover" && s.navItemActive) }} onClick={() => { setActiveTab("mover"); setSidebarOpen(false); }}>
              <span style={s.navIcon}>🚚</span> Mover Service
            </button>
          )}
          <button style={{ ...s.navItem, ...(activeTab === "profile" && s.navItemActive) }} onClick={() => { setActiveTab("profile"); setSidebarOpen(false); }}>
            <span style={s.navIcon}>👤</span> Profile & KYC
          </button>
        </nav>

        <div style={s.sidebarFooter}>
          <button style={s.footerBtn} onClick={() => navigate("/settings")}>⚙️ Settings</button>
          <button style={{ ...s.footerBtn, ...s.logoutColor }} onClick={() => logout("/login")}>Logout</button>
        </div>
      </aside>

      {/* OVERLAY FOR BACKDROP ON MOBILE SIDEBAR OPEN */}
      {sidebarOpen && <div style={s.sidebarOverlay} onClick={() => setSidebarOpen(false)}></div>}

      {/* MAIN CONTENT AREA */}
      <main style={s.mainContent}>
        {/* Toast Notifs */}
        {successMsg && <div style={s.toastSuccess}>{successMsg}</div>}
        {errorMsg && <div style={s.toastError}>{errorMsg}</div>}

        {/* ── Tab Panels ── */}

        {/* OVERVIEW PANEL */}
        {activeTab === "overview" && (
          <div>
            <div style={s.welcomeBanner}>
              <div style={s.bannerLeft}>
                <h1 style={s.bannerTitle}>Workspace Console 👋</h1>
                <p style={s.bannerSubtitle}>Monitor your listings, active items, and KYC verification tier from one unified space.</p>
              </div>
              <div style={s.bannerRight}>
                <div style={s.badgeCard}>
                  <VerificationBadges userId={user?._id || user?.id} />
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div style={s.statsGrid}>
              <div style={s.statCard}>
                <div style={s.statValue}>{totalListedCount}</div>
                <div style={s.statLabel}>Total Listings</div>
              </div>
              <div style={s.statCard}>
                <div style={s.statValue}>{businesses.length}</div>
                <div style={s.statLabel}>Businesses (Directory)</div>
              </div>
              <div style={s.statCard}>
                <div style={s.statValue}>{properties.length}</div>
                <div style={s.statLabel}>Properties (Rentals)</div>
              </div>
              <div style={s.statCard}>
                <div style={s.statValue}>{materials.length}</div>
                <div style={s.statLabel}>Materials (QuickSales)</div>
              </div>
            </div>

            {/* KYC widget */}
            <div style={s.kycContainer}>
              <VerificationStatus />
            </div>

            {/* Quick Actions Panel */}
            <div style={s.panelCard}>
              <h3 style={s.panelHeading}>⚡ Quick Listing Creation</h3>
              <div style={s.actionsGrid}>
                <button style={s.actionGridBtn} onClick={() => navigate("/business/create")}>
                  🏢 Register New Business
                </button>
                <button style={s.actionGridBtn} onClick={() => navigate("/upload")}>
                  🏠 Upload Rental Property
                </button>
                <button style={s.actionGridBtn} onClick={() => { setActiveTab("materials"); setMaterialView("upload"); }}>
                  🛒 List Material/Item
                </button>
              </div>
            </div>

            <div style={{ marginTop: "24px" }}>
              <AnalyticsDashboard userId={user?._id || user?.id} userType={user?.role} />
            </div>
          </div>
        )}

        {/* BUSINESSES TAB */}
        {activeTab === "businesses" && (
          <div style={s.panelCard}>
            <div style={s.panelFlexHeader}>
              <h2 style={s.tabTitle}>🏢 My Directory Listings</h2>
              <button style={s.btnPrimary} onClick={() => navigate("/business/create")}>+ Register Business</button>
            </div>

            {businesses.length === 0 ? (
              <div style={s.emptyState}>
                <p>No businesses directory listed.</p>
                <button style={s.btnSecondary} onClick={() => navigate("/business/create")}>List Your Business</button>
              </div>
            ) : (
              <div style={s.cardGrid}>
                {businesses.map((biz) => {
                  const resolvedSt = biz.status || "pending";
                  const st = STATUS_COLORS[resolvedSt] || STATUS_COLORS.pending;
                  return (
                    <div key={biz._id} style={s.itemCard}>
                      <div style={s.itemCardHeader}>
                        <h3 style={s.itemCardTitle}>{biz.name}</h3>
                        <span style={{ ...s.statusBadge, background: st.bg, color: st.color }}>{st.label}</span>
                      </div>
                      <p style={s.itemCardDesc}>{biz.description?.substring(0, 120)}...</p>
                      <div style={s.itemCardMeta}>
                        <div>📍 {biz.location?.town}, {biz.location?.county}</div>
                        <div>📂 {biz.categories?.join(", ")}</div>
                      </div>
                      <div style={s.itemActions}>
                        <button style={s.btnEdit} onClick={() => handleEditBusiness(biz._id)}>Edit</button>
                        <button style={s.btnDelete} onClick={() => handleDeleteBusiness(biz._id)}>Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PROPERTIES TAB */}
        {activeTab === "properties" && (
          <div style={s.panelCard}>
            <div style={s.panelFlexHeader}>
              <h2 style={s.tabTitle}>🏠 My Rental Listings</h2>
              <button style={s.btnPrimary} onClick={() => navigate("/upload")}>+ Post Property</button>
            </div>

            {properties.length === 0 ? (
              <div style={s.emptyState}>
                <p>No rental properties uploaded yet.</p>
                <button style={s.btnSecondary} onClick={() => navigate("/upload")}>Post Rental Space</button>
              </div>
            ) : (
              <div style={s.cardGrid}>
                {properties.map((property) => {
                  const resolvedSt = property.status || "pending";
                  const st = STATUS_COLORS[resolvedSt] || STATUS_COLORS.pending;
                  const booked = property.bookedUnits || 0;
                  const total = property.totalUnits || 1;
                  const available = property.availableUnits ?? Math.max(0, total - booked);
                  const fullyBooked = booked >= total;

                  return (
                    <div key={property._id} style={s.itemCard}>
                      <div style={s.propertyImageContainer}>
                        <img src={property.images?.[0] || "/placeholder.jpg"} alt={property.title} style={s.propertyImg} />
                        <span style={{ ...s.statusBadge, position: "absolute", top: "10px", right: "10px", background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                        {fullyBooked && <span style={s.fullyBookedOverlay}>🔴 FULLY BOOKED</span>}
                      </div>

                      <div style={{ padding: "16px" }}>
                        <h3 style={s.itemCardTitle}>{property.title}</h3>
                        <p style={s.itemCardDesc}>📍 {property.location}, {property.county}</p>
                        <div style={s.propertyPriceText}>KSh {Number(property.price).toLocaleString()}/mo</div>

                        {/* Units indicators */}
                        <div style={s.unitsRow}>
                          <div style={s.unitBox}>
                            <span style={s.unitVal}>{total}</span>
                            <span style={s.unitLbl}>Total Units</span>
                          </div>
                          <div style={s.unitBox}>
                            <span style={{ ...s.unitVal, color: "#f87171" }}>{booked}</span>
                            <span style={s.unitLbl}>Booked</span>
                          </div>
                          <div style={s.unitBox}>
                            <span style={{ ...s.unitVal, color: "#4ade80" }}>{available}</span>
                            <span style={s.unitLbl}>Available</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={s.progressBar}>
                          <div style={{ ...s.progressFill, width: `${(booked / total) * 100}%`, background: fullyBooked ? "#f87171" : "#4ade80" }}></div>
                        </div>

                        {/* Actions block */}
                        {property.status === "approved" && (
                          <div style={s.propertyActionsGrid}>
                            <button style={s.unitActionBtn} onClick={() => updateBookedUnits(property._id, 1)} disabled={fullyBooked}>
                              ✓ Book Unit
                            </button>
                            <button style={s.unitActionBtn} onClick={() => updateBookedUnits(property._id, -1)} disabled={booked === 0}>
                              ✗ Free Unit
                            </button>
                            <button style={s.boostActionBtn} onClick={() => handleBoostProperty(property._id)}>
                              ⭐ Boost Property
                            </button>
                            <div style={{ gridColumn: "1 / -1", marginTop: "10px" }}>
                              <label style={s.labelMicro}>Assign Agent:</label>
                              <select
                                value={selectedAgents[property._id] || ""}
                                onChange={(e) => handleAssignAgent(property._id, e.target.value)}
                                style={s.agentSelectInput}
                              >
                                <option value="">No Agent Assigned</option>
                                {agents.map(agent => (
                                  <option key={agent._id} value={agent._id}>{agent.name} - {agent.phone}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MATERIAL / QUICK SALES TAB */}
        {activeTab === "materials" && (
          <div style={s.panelCard}>
            <div style={s.panelFlexHeader}>
              <h2 style={s.tabTitle}>🛒 QuickSales Inventory Listings</h2>
              <button style={s.btnPrimary} onClick={() => setMaterialView(materialView === "list" ? "upload" : "list")}>
                {materialView === "list" ? "+ List Material" : "View Inventory"}
              </button>
            </div>

            {materialView === "upload" ? (
              /* Inline material listing upload form */
              <form onSubmit={handleMaterialUploadSubmit} style={s.uploadForm}>
                <h3 style={s.formSubheading}>List a New Item/Material</h3>

                <div style={s.formGrid}>
                  <div style={s.formInputGroup}>
                    <label style={s.formInputLabel}>Title *</label>
                    <input name="title" value={materialForm.title} onChange={handleMaterialFormChange} style={s.formInputField} placeholder="e.g. Premium Cement Bags" required />
                  </div>

                  <div style={s.formInputGroup}>
                    <label style={s.formInputLabel}>Category *</label>
                    <select name="category" value={materialForm.category} onChange={handleMaterialFormChange} style={s.formInputField} required>
                      <option value="">Select Category</option>
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div style={s.formInputGroup}>
                    <label style={s.formInputLabel}>Condition</label>
                    <select name="condition" value={materialForm.condition} onChange={handleMaterialFormChange} style={s.formInputField}>
                      {CONDITIONS.map(cond => <option key={cond} value={cond}>{cond}</option>)}
                    </select>
                  </div>

                  <div style={s.formInputGroup}>
                    <label style={s.formInputLabel}>Price (KES) *</label>
                    <input name="price" type="number" value={materialForm.price} onChange={handleMaterialFormChange} style={s.formInputField} placeholder="1200" required />
                  </div>

                  <div style={s.formInputGroup}>
                    <label style={s.formInputLabel}>Quantity *</label>
                    <input name="quantity" type="number" value={materialForm.quantity} onChange={handleMaterialFormChange} style={s.formInputField} placeholder="1" required />
                  </div>

                  <div style={s.formInputGroup}>
                    <label style={s.formInputLabel}>Area Location (e.g. Kilimani) *</label>
                    <input name="location" value={materialForm.location} onChange={handleMaterialFormChange} style={s.formInputField} placeholder="Kilimani" required />
                  </div>

                  <div style={s.formInputGroup}>
                    <label style={s.formInputLabel}>County *</label>
                    <select name="county" value={materialForm.county} onChange={handleMaterialFormChange} style={s.formInputField} required>
                      <option value="">Select County</option>
                      {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div style={s.formInputGroup}>
                    <label style={s.formInputLabel}>Latitude (GPS Optional)</label>
                    <input name="lat" type="number" step="any" value={materialForm.lat} onChange={handleMaterialFormChange} style={s.formInputField} placeholder="-1.286" />
                  </div>

                  <div style={s.formInputGroup}>
                    <label style={s.formInputLabel}>Longitude (GPS Optional)</label>
                    <input name="lng" type="number" step="any" value={materialForm.lng} onChange={handleMaterialFormChange} style={s.formInputField} placeholder="36.817" />
                  </div>

                  <div style={{ ...s.formInputGroup, gridColumn: "1 / -1" }}>
                    <label style={s.formInputLabel}>Description</label>
                    <textarea name="description" value={materialForm.description} onChange={handleMaterialFormChange} style={s.formTextAreaField} rows={4} placeholder="Describe the item details..."></textarea>
                  </div>

                  <div style={{ ...s.formInputGroup, gridColumn: "1 / -1" }}>
                    <label style={s.formInputLabel}>Images (at least 1 required) *</label>
                    <input type="file" multiple accept="image/*" onChange={handleMaterialImages} style={s.formInputField} required />
                    {materialPreviews.length > 0 && (
                      <div style={s.imagePreviewsGrid}>
                        {materialPreviews.map((prev, index) => (
                          <img key={index} src={prev} alt="Preview" style={s.imagePreviewThumb} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={s.formActionsRow}>
                  <button type="button" style={s.btnSecondary} onClick={() => setMaterialView("list")}>Cancel</button>
                  <button type="submit" style={s.btnPrimary} disabled={uploadLoading}>
                    {uploadLoading ? "Uploading..." : "Publish Material Listing"}
                  </button>
                </div>
              </form>
            ) : (
              /* Materials Listing Stock */
              materials.length === 0 ? (
                <div style={s.emptyState}>
                  <p>No materials listing in stock.</p>
                  <button style={s.btnSecondary} onClick={() => setMaterialView("upload")}>Post First Material</button>
                </div>
              ) : (
                <div style={s.cardGrid}>
                  {materials.map((m) => {
                    const resolvedSt = resolveStatus(m);
                    const st = STATUS_COLORS[resolvedSt] || STATUS_COLORS.pending;
                    return (
                      <div key={m._id} style={s.itemCard}>
                        <div style={s.propertyImageContainer}>
                          {m.images?.[0] ? (
                            <img src={m.images[0]} alt={m.title} style={s.propertyImg} />
                          ) : (
                            <div style={s.placeholderMaterialImg}>📷 No Image</div>
                          )}
                          <span style={{ ...s.statusBadge, position: "absolute", top: "10px", right: "10px", background: st.bg, color: st.color }}>
                            {st.label}
                          </span>
                        </div>

                        <div style={{ padding: "16px" }}>
                          <h3 style={s.itemCardTitle}>{m.title}</h3>
                          <div style={s.propertyPriceText}>KES {m.price?.toLocaleString()}</div>
                          <p style={s.itemCardDesc}>Qty: {m.quantity} • {m.location}, {m.county}</p>

                          <div style={s.engagementRow}>
                            <span>👁️ {m.views || 0} views</span>
                            <span>⭐ {m.rating ? m.rating.toFixed(1) : "—"} ({m.reviewCount || 0} reviews)</span>
                          </div>

                          <div style={s.itemActions}>
                            {resolvedSt === "active" && (
                              <button style={s.btnSold} onClick={() => handleMarkMaterialSold(m._id)}>Mark Sold</button>
                            )}
                            <button style={s.btnDelete} onClick={() => handleDeleteMaterial(m._id)}>Delete</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        )}

        {/* MOVER SERVICES TAB */}
        {activeTab === "mover" && user?.role === "mover" && (
          <div style={s.panelCard}>
            <h2 style={s.tabTitle}>🚚 Mover Job Bookings</h2>

            {moverJobs.length === 0 ? (
              <div style={s.emptyState}>
                <p>No moving job requests registered to your profile.</p>
              </div>
            ) : (
              <div style={s.cardGrid}>
                {moverJobs.map((job) => {
                  const isPending = job.status === "pending";
                  const isAccepted = job.status === "accepted" || job.status === "active";
                  return (
                    <div key={job._id} style={s.itemCard}>
                      <div style={s.itemCardHeader}>
                        <h3 style={s.itemCardTitle}>{job.serviceType || "Household Moving"}</h3>
                        <span style={s.moverJobStatusBadge}>{job.status?.toUpperCase()}</span>
                      </div>

                      <div style={{ margin: "12px 0" }}>
                        <p style={s.moverJobText}>👤 Client: {job.customerName || "Anonymous"}</p>
                        <p style={s.moverJobText}>📞 Phone: {isPending ? "🔒 Accept job to unlock" : job.customerPhone}</p>
                        <p style={s.moverJobText}>📍 Pickup: {job.pickupLocation}</p>
                        <p style={s.moverJobText}>🏁 Dropoff: {job.dropoffLocation}</p>
                        <p style={s.moverJobText}>📅 Scheduled: {new Date(job.scheduledDate).toLocaleDateString()}</p>
                        <p style={{ ...s.moverJobText, color: "#10b981", fontWeight: "700" }}>
                          💰 Value: KES {(job.amount || 0).toLocaleString()}
                        </p>
                      </div>

                      <div style={s.moverJobActions}>
                        {isPending && (
                          <button style={s.btnAcceptMover} onClick={() => handleAcceptMoverJob(job._id)}>Accept Job Request</button>
                        )}
                        {isAccepted && (
                          <button style={s.btnCompleteMover} onClick={() => handleCompleteMoverJob(job._id)}>Mark Completed</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PROFILE & KYC TAB */}
        {activeTab === "profile" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={s.panelCard}>
              <h2 style={s.tabTitle}>👤 Account Profile Info</h2>
              <UserProfileEditor
                token={token}
                user={user}
                accentColor="#fbbf24"
                onUpdated={(updatedUser) => {
                  if (updatedUser) login(token, updatedUser);
                }}
              />
            </div>

            <div style={s.panelCard}>
              <h2 style={s.tabTitle}>🔐 Identity & Verification status</h2>
              <VerificationStatus />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const s = {
  loaderContainer: {
    minHeight: "100vh",
    background: "#080c14",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "4px solid rgba(251, 191, 36, 0.1)",
    borderTop: "4px solid #fbbf24",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  dashboardContainer: {
    minHeight: "100vh",
    background: "#080c14",
    color: "#f1f5f9",
    display: "flex",
    fontFamily: "'DM Sans', sans-serif",
  },
  mobileHeader: {
    display: "none",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "60px",
    background: "#0f172a",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "0 16px",
    boxSizing: "border-box",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1001,
  },
  menuToggleBtn: {
    background: "rgba(251, 191, 36, 0.15)",
    border: "1px solid rgba(251, 191, 36, 0.3)",
    borderRadius: "6px",
    color: "#fbbf24",
    padding: "6px 12px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
  },
  headerBranding: {
    fontWeight: "900",
    color: "#fbbf24",
    fontSize: "16px",
    letterSpacing: "0.5px",
  },
  sidebarOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(4px)",
    zIndex: 1000,
  },
  sidebar: {
    width: "280px",
    background: "linear-gradient(180deg, #0f172a 0%, #070d19 100%)",
    borderRight: "1px solid rgba(255, 255, 255, 0.08)",
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
    boxSizing: "border-box",
    flexShrink: 0,
    position: "sticky",
    top: 0,
    height: "100vh",
    zIndex: 1002,
    transition: "transform 0.3s ease",
  },
  sidebarBrand: {
    marginBottom: "32px",
    display: "flex",
    flexDirection: "column",
  },
  brandGold: {
    fontSize: "20px",
    fontWeight: "900",
    color: "#fbbf24",
    letterSpacing: "1px",
  },
  brandSub: {
    fontSize: "11px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "2px",
    marginTop: "2px",
  },
  sidebarUserProfile: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(255, 255, 255, 0.03)",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    marginBottom: "24px",
  },
  userMetaInfo: {
    display: "flex",
    flexDirection: "column",
  },
  userName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#f1f5f9",
  },
  userRole: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#fbbf24",
    letterSpacing: "0.5px",
    marginTop: "2px",
  },
  sidebarNav: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flex: 1,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "transparent",
    border: "none",
    borderRadius: "10px",
    padding: "12px 16px",
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
  },
  navItemActive: {
    background: "rgba(251, 191, 36, 0.12)",
    color: "#fbbf24",
    borderLeft: "4px solid #fbbf24",
  },
  navIcon: {
    fontSize: "16px",
  },
  sidebarFooter: {
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    paddingTop: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  footerBtn: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "8px",
    color: "#94a3b8",
    padding: "10px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  logoutColor: {
    background: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    color: "#fca5a5",
  },
  mainContent: {
    flex: 1,
    padding: "32px",
    boxSizing: "border-box",
    overflowY: "auto",
    maxHeight: "100vh",
  },
  toastSuccess: {
    background: "rgba(16, 185, 129, 0.12)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    borderRadius: "8px",
    color: "#34d399",
    padding: "14px 20px",
    marginBottom: "24px",
    fontSize: "14px",
    fontWeight: "600",
  },
  toastError: {
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "8px",
    color: "#f87171",
    padding: "14px 20px",
    marginBottom: "24px",
    fontSize: "14px",
    fontWeight: "600",
  },
  welcomeBanner: {
    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "20px",
  },
  bannerLeft: {
    flex: 1,
    minWidth: "280px",
  },
  bannerTitle: {
    margin: "0 0 8px 0",
    fontSize: "28px",
    fontWeight: "800",
    color: "#fbbf24",
  },
  bannerSubtitle: {
    margin: 0,
    fontSize: "14px",
    color: "#94a3b8",
    lineHeight: "1.5",
  },
  badgeCard: {
    display: "flex",
    gap: "8px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },
  statCard: {
    background: "rgba(22, 28, 45, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "14px",
    padding: "24px",
    transition: "transform 0.2s",
  },
  statValue: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#fbbf24",
    marginBottom: "4px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  kycContainer: {
    marginBottom: "32px",
  },
  panelCard: {
    background: "rgba(22, 28, 45, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "24px",
  },
  panelHeading: {
    margin: "0 0 16px 0",
    fontSize: "18px",
    fontWeight: "700",
    color: "#fbbf24",
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "12px",
  },
  actionGridBtn: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "12px",
    color: "#fbbf24",
    padding: "16px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.2s ease",
  },
  panelFlexHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "12px",
  },
  tabTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "800",
    color: "#fbbf24",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#080c14",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  btnSecondary: {
    background: "rgba(255, 255, 255, 0.08)",
    color: "#f1f5f9",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  emptyState: {
    textAlign: "center",
    padding: "48px 20px",
    color: "#64748b",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
  },
  itemCard: {
    background: "rgba(15, 23, 42, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    borderRadius: "14px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  itemCardHeader: {
    padding: "16px 16px 8px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemCardTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "700",
    color: "#f1f5f9",
  },
  itemCardDesc: {
    margin: "0 16px 12px 16px",
    fontSize: "13px",
    color: "#94a3b8",
    lineHeight: "1.4",
  },
  itemCardMeta: {
    margin: "auto 16px 16px 16px",
    fontSize: "12px",
    color: "#64748b",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
    paddingTop: "12px",
  },
  itemActions: {
    padding: "12px 16px",
    background: "rgba(255,255,255,0.02)",
    display: "flex",
    gap: "8px",
  },
  btnEdit: {
    flex: 1,
    background: "rgba(251, 191, 36, 0.12)",
    border: "1px solid rgba(251, 191, 36, 0.2)",
    borderRadius: "6px",
    color: "#fbbf24",
    padding: "8px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
  btnDelete: {
    flex: 1,
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    borderRadius: "6px",
    color: "#fca5a5",
    padding: "8px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
  btnSold: {
    flex: 1,
    background: "rgba(16, 185, 129, 0.12)",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    borderRadius: "6px",
    color: "#34d399",
    padding: "8px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
  statusBadge: {
    padding: "3px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },
  propertyImageContainer: {
    position: "relative",
    height: "180px",
    background: "#0f172a",
  },
  propertyImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  fullyBookedOverlay: {
    position: "absolute",
    bottom: "10px",
    left: "10px",
    background: "rgba(239, 68, 68, 0.9)",
    color: "#fff",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "800",
  },
  placeholderMaterialImg: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    fontSize: "14px",
  },
  propertyPriceText: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#fbbf24",
    margin: "0 16px 12px 16px",
  },
  unitsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "8px",
    margin: "12px 16px",
  },
  unitBox: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "8px",
    padding: "8px",
    textAlign: "center",
  },
  unitVal: {
    display: "block",
    fontSize: "18px",
    fontWeight: "800",
    color: "#fbbf24",
  },
  unitLbl: {
    display: "block",
    fontSize: "9px",
    color: "#64748b",
    marginTop: "2px",
  },
  progressBar: {
    height: "6px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "3px",
    margin: "0 16px 16px 16px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "3px",
    transition: "width 0.4s",
  },
  propertyActionsGrid: {
    padding: "16px",
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  },
  unitActionBtn: {
    padding: "8px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "6px",
    color: "#f1f5f9",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },
  boostActionBtn: {
    gridColumn: "1 / -1",
    padding: "8px",
    background: "rgba(251, 191, 36, 0.15)",
    border: "1px solid rgba(251, 191, 36, 0.3)",
    borderRadius: "6px",
    color: "#fbbf24",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },
  labelMicro: {
    display: "block",
    fontSize: "10px",
    color: "#64748b",
    marginBottom: "4px",
  },
  agentSelectInput: {
    width: "100%",
    padding: "8px",
    background: "#0f172a",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "6px",
    color: "#f1f5f9",
    fontSize: "11px",
  },
  engagementRow: {
    margin: "12px 16px",
    fontSize: "12px",
    color: "#64748b",
    display: "flex",
    justifyContent: "space-between",
  },
  uploadForm: {
    background: "rgba(15, 23, 42, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    padding: "24px",
  },
  formSubheading: {
    margin: "0 0 20px 0",
    fontSize: "16px",
    fontWeight: "700",
    color: "#fbbf24",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    "@media (max-width: 600px)": {
      gridTemplateColumns: "1fr",
    },
  },
  formInputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  formInputLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  formInputField: {
    background: "#0f172a",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "8px",
    padding: "12px",
    color: "#f1f5f9",
    fontSize: "14px",
  },
  formTextAreaField: {
    background: "#0f172a",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "8px",
    padding: "12px",
    color: "#f1f5f9",
    fontSize: "14px",
    resize: "vertical",
  },
  imagePreviewsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
    gap: "8px",
    marginTop: "10px",
  },
  imagePreviewThumb: {
    width: "100%",
    height: "60px",
    objectFit: "cover",
    borderRadius: "4px",
  },
  formActionsRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "24px",
  },
  moverJobStatusBadge: {
    background: "rgba(59, 130, 246, 0.15)",
    color: "#60a5fa",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    padding: "3px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "700",
  },
  moverJobText: {
    margin: "0 16px 8px 16px",
    fontSize: "13px",
    color: "#cbd5e1",
  },
  moverJobActions: {
    padding: "12px 16px",
    background: "rgba(255,255,255,0.02)",
    marginTop: "auto",
  },
  btnAcceptMover: {
    width: "100%",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "10px",
    fontWeight: "700",
    cursor: "pointer",
  },
  btnCompleteMover: {
    width: "100%",
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "10px",
    fontWeight: "700",
    cursor: "pointer",
  },
};

const customStyles = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @media (max-width: 768px) {
    aside[style*="position: sticky"] {
      position: fixed !important;
      left: 0;
      top: 0;
      transform: translateX(-100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      height: 100vh;
      z-index: 1002;
    }
    header[style*="display: none"] {
      display: flex !important;
    }
    main[style*="padding: 32px"] {
      padding: 92px 16px 32px 16px !important;
    }
  }
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #fbbf24 !important;
    box-shadow: 0 0 0 3px rgba(251,191,36,0.1);
  }
  button:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;
