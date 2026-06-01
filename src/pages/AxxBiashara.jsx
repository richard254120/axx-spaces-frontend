import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

const BUSINESS_CATEGORIES = [
  "Restaurants", "Retail", "Services", "Technology", "Healthcare", "Education",
  "Entertainment", "Professional Services", "Manufacturing", "Agriculture",
  "Construction", "Transportation", "Other",
];

const KENYA_COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta", "Garissa", "Wajir",
  "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka Nithi", "Embu", "Kitui", "Machakos",
  "Makueni", "Nyandarua", "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana",
  "West Pokot", "Samburu", "Trans Nzoia", "Uasin Gishu", "Elgeyo Marakwet", "Nandi",
  "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega",
  "Vihiga", "Bungoma", "Busia", "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii",
  "Nyamira", "Nairobi City",
];

const BADGE_CONFIG = {
  student_verified: { label: "Student Verified", color: "#10b981", icon: "✦" },
  identity_verified: { label: "Identity Verified", color: "#10b981", icon: "✦" },
  business_verified: { label: "Business Verified", color: "#3b82f6", icon: "◈" },
  online_verified: { label: "Online Verified", color: "#3b82f6", icon: "◈" },
  location_verified: { label: "Location Verified", color: "#8b5cf6", icon: "◉" },
  premium_verified: { label: "Premium", color: "#f59e0b", icon: "★" },
};

export default function AxxBiashara() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [minRating, setMinRating] = useState("");
  const [openNow, setOpenNow] = useState(false);
  const [verification, setVerification] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementSuccess, setAnnouncementSuccess] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [isMarqueePaused, setIsMarqueePaused] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [comparisonList, setComparisonList] = useState([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [comparisonData, setComparisonData] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);

  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedCounty) params.county = selectedCounty;
      if (searchQuery) params.search = searchQuery;
      if (sortBy) params.sort = sortBy;
      if (minRating) params.minRating = minRating;
      if (openNow) params.openNow = "true";
      if (verification) params.verification = verification;
      const res = await API.get("/business", { params });
      setBusinesses(res.data.businesses || []);
    } catch (err) {
      console.error("Failed to load businesses:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const res = await API.get("/business/announcements");
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      console.error("Failed to load announcements:", err);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, [selectedCategory, selectedCounty, searchQuery, sortBy, minRating, openNow, verification]);

  useEffect(() => {
    loadAnnouncements();
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const res = await API.get("/favorites");
      setFavorites(res.data.favorites || []);
    } catch (err) { }
  };

  const toggleFavorite = async (businessId, e) => {
    e.stopPropagation();
    try {
      const existing = favorites.find(f => f.business._id === businessId);
      if (existing) {
        await API.delete(`/favorites/${existing._id}`);
        setFavorites(favorites.filter(f => f._id !== existing._id));
      } else {
        await API.post("/favorites", { businessId });
        loadFavorites();
      }
    } catch (err) { }
  };

  const toggleComparison = (businessId, e) => {
    e.stopPropagation();
    if (comparisonList.includes(businessId)) {
      setComparisonList(comparisonList.filter(id => id !== businessId));
    } else if (comparisonList.length < 3) {
      setComparisonList([...comparisonList, businessId]);
    } else {
      alert("You can compare up to 3 businesses");
    }
  };

  const openComparison = async () => {
    if (comparisonList.length < 2) { alert("Select at least 2 businesses"); return; }
    try {
      const res = await API.get(`/business/compare?ids=${comparisonList.join(",")}`);
      setComparisonData(res.data.businesses);
      setShowComparisonModal(true);
    } catch (err) { }
  };

  const isFavorite = (id) => favorites.some(f => f.business._id === id);

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await API.post("/business/announcements", { title: announcementTitle, content: announcementContent, submitterName, organizationName });
      setAnnouncementSuccess("Announcement submitted for approval!");
      setAnnouncementTitle(""); setAnnouncementContent(""); setSubmitterName(""); setOrganizationName("");
      setShowAnnouncementForm(false);
      setTimeout(() => setAnnouncementSuccess(""), 4000);
    } catch (err) {
      alert("Failed to submit: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#06070d", color: "#e8eaf0", fontFamily: "'Sora', 'DM Sans', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0d0f1a; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 3px; }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(56,189,248,0.4); }
          70%  { box-shadow: 0 0 0 12px rgba(56,189,248,0); }
          100% { box-shadow: 0 0 0 0 rgba(56,189,248,0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }

        .axx-card {
          animation: fadeSlideUp 0.5s ease both;
          transition: transform 0.3s cubic-bezier(.22,.68,0,1.2), box-shadow 0.3s ease;
          cursor: pointer;
          position: relative;
          background: linear-gradient(145deg, #0e1629 0%, #111827 100%);
          border-radius: 20px;
          border: 1px solid rgba(56,189,248,0.08);
          overflow: hidden;
        }
        .axx-card:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 28px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(56,189,248,0.2);
        }
        .axx-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(56,189,248,0.03) 0%, transparent 60%);
          pointer-events: none;
        }

        .card-img-wrap { position: relative; overflow: hidden; height: 200px; }
        .card-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; display: block; }
        .axx-card:hover .card-img-wrap img { transform: scale(1.06); }
        .card-img-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(6,7,13,0.85) 0%, transparent 55%);
        }

        .badge-pill {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.02em;
        }

        .action-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 600;
          border: none; cursor: pointer; transition: all 0.2s ease; text-decoration: none;
        }
        .action-btn-primary { background: rgba(56,189,248,0.15); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); }
        .action-btn-primary:hover { background: #38bdf8; color: #06070d; }
        .action-btn-success { background: rgba(16,185,129,0.12); color: #10b981; border: 1px solid rgba(16,185,129,0.3); }
        .action-btn-success:hover { background: #10b981; color: #06070d; }

        .icon-btn {
          width: 34px; height: 34px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer; font-size: 15px; transition: all 0.2s;
        }
        .icon-btn:hover { background: rgba(56,189,248,0.2); border-color: rgba(56,189,248,0.4); }

        .filter-select {
          padding: 10px 14px;
          background: #0e1629;
          border: 1px solid rgba(56,189,248,0.15);
          border-radius: 10px;
          color: #cbd5e1;
          font-size: 13px;
          font-family: inherit;
          cursor: pointer;
          outline: none;
          transition: border-color 0.2s;
          min-width: 180px;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2338bdf8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 32px;
        }
        .filter-select:focus, .filter-select:hover { border-color: rgba(56,189,248,0.4); }

        .search-input {
          width: 100%; padding: 14px 14px 14px 48px;
          background: #0e1629;
          border: 1px solid rgba(56,189,248,0.2);
          border-radius: 14px;
          color: #f1f5f9;
          font-size: 15px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .search-input:focus {
          border-color: rgba(56,189,248,0.5);
          box-shadow: 0 0 0 3px rgba(56,189,248,0.08);
        }
        .search-input::placeholder { color: #475569; }

        .ann-card {
          background: #0e1629;
          border: 1px solid rgba(56,189,248,0.1);
          border-radius: 14px;
          padding: 18px 20px;
          min-width: 260px;
          max-width: 290px;
          flex-shrink: 0;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .ann-card:hover {
          transform: translateY(-4px);
          border-color: rgba(56,189,248,0.35);
          box-shadow: 0 12px 32px rgba(56,189,248,0.12);
        }

        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999;
          animation: fadeSlideUp 0.2s ease;
        }
        .modal-box {
          background: #0e1629;
          border: 1px solid rgba(56,189,248,0.2);
          border-radius: 24px;
          padding: 40px;
          position: relative;
          max-height: 85vh;
          overflow-y: auto;
        }

        .shimmer-card {
          background: linear-gradient(90deg, #0e1629 25%, #162236 50%, #0e1629 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 20px;
          height: 340px;
        }

        .cta-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 24px; border-radius: 12px;
          font-size: 14px; font-weight: 700;
          border: none; cursor: pointer;
          transition: all 0.25s ease; font-family: inherit;
          text-decoration: none;
        }
        .cta-primary {
          background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%);
          color: #06070d;
          box-shadow: 0 4px 20px rgba(56,189,248,0.3);
        }
        .cta-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(56,189,248,0.45); }
        .cta-green {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: #fff;
          box-shadow: 0 4px 16px rgba(16,185,129,0.25);
        }
        .cta-green:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(16,185,129,0.4); }

        .comparison-bar {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
          background: rgba(14,22,41,0.96);
          border: 1px solid rgba(56,189,248,0.3);
          border-radius: 16px; padding: 14px 24px;
          display: flex; align-items: center; gap: 16px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(56,189,248,0.1);
          z-index: 1000; backdrop-filter: blur(10px);
          animation: float 3s ease-in-out infinite;
        }

        .section-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: #38bdf8;
        }
        .section-title {
          font-size: 28px; font-weight: 800;
          background: linear-gradient(135deg, #f1f5f9 30%, #94a3b8 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .no-results {
          text-align: center; padding: 80px 20px;
          color: #475569; font-size: 16px;
        }
        .no-results-icon { font-size: 56px; margin-bottom: 16px; opacity: 0.5; }

        .form-input {
          width: 100%; padding: 12px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(56,189,248,0.15);
          border-radius: 10px; color: #f1f5f9;
          font-size: 14px; font-family: inherit;
          outline: none; transition: border-color 0.2s;
          margin-bottom: 12px;
        }
        .form-input:focus { border-color: rgba(56,189,248,0.45); }
        .form-input::placeholder { color: #475569; }

        .social-dot {
          width: 30px; height: 30px; border-radius: 50%;
          background: rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; text-decoration: none;
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.2s;
        }
        .social-dot:hover { background: rgba(56,189,248,0.2); border-color: rgba(56,189,248,0.4); transform: scale(1.15); }

        .featured-tag {
          position: absolute; top: 12px; left: 12px;
          background: linear-gradient(135deg, #f59e0b, #fbbf24);
          color: #06070d; padding: 4px 12px; border-radius: 20px;
          font-size: 11px; font-weight: 800; letter-spacing: 0.05em;
          text-transform: uppercase; z-index: 2;
        }

        .stat-chip {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 8px; padding: 4px 10px;
          font-size: 12px; color: #94a3b8;
        }
        .stat-chip strong { color: #e2e8f0; font-weight: 600; }

        .divider { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 14px 0; }
      `}</style>

      {/* ── HERO HEADER ── */}
      <div style={{
        background: "linear-gradient(160deg, #0a1628 0%, #0c1a2e 40%, #06070d 100%)",
        borderBottom: "1px solid rgba(56,189,248,0.1)",
        padding: "48px 24px 36px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative orbs */}
        <div style={{ position: "absolute", top: "-80px", right: "-60px", width: "340px", height: "340px", borderRadius: "50%", background: "radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "10%", width: "240px", height: "240px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          {/* Top bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px", marginBottom: "36px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg,#0ea5e9,#38bdf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", boxShadow: "0 4px 16px rgba(56,189,248,0.3)" }}>🏪</div>
                <div>
                  <div className="section-label">Kenya Business Directory</div>
                  <h1 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: 800, background: "linear-gradient(135deg, #f8fafc 0%, #38bdf8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1.1 }}>
                    AxxBiashara
                  </h1>
                </div>
              </div>
              <p style={{ color: "#64748b", fontSize: "15px", maxWidth: "420px", lineHeight: "1.6" }}>
                Discover and connect with verified businesses across all 47 counties of Kenya.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button className="cta-primary cta-btn" onClick={() => navigate("/business/create")}>
                + Add Business
              </button>
              <button className="cta-green cta-btn" onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}>
                {showAnnouncementForm ? "✕ Cancel" : "📢 Announce"}
              </button>
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "28px" }}>
            {[
              { label: "Businesses", value: businesses.length },
              { label: "Counties", value: "47" },
              { label: "Categories", value: BUSINESS_CATEGORIES.length },
              { label: "Verified", value: businesses.filter(b => b.verificationBadges?.length).length },
            ].map(s => (
              <div key={s.label} className="stat-chip"><strong>{s.value}</strong> {s.label}</div>
            ))}
          </div>

          {/* Success message */}
          {announcementSuccess && (
            <div style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", padding: "12px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
              ✓ {announcementSuccess}
            </div>
          )}

          {/* Announcement form */}
          {showAnnouncementForm && (
            <div style={{ background: "rgba(14,22,41,0.8)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: "18px", padding: "28px", marginBottom: "28px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#38bdf8", marginBottom: "18px" }}>Create Announcement</h3>
              <form onSubmit={handleAddAnnouncement}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "0" }}>
                  <input className="form-input" type="text" placeholder="Your Name *" value={submitterName} onChange={e => setSubmitterName(e.target.value)} required style={{ marginBottom: 0 }} />
                  <input className="form-input" type="text" placeholder="Organisation (optional)" value={organizationName} onChange={e => setOrganizationName(e.target.value)} style={{ marginBottom: 0 }} />
                </div>
                <div style={{ height: 12 }} />
                <input className="form-input" type="text" placeholder="Announcement Title *" value={announcementTitle} onChange={e => setAnnouncementTitle(e.target.value)} required />
                <textarea className="form-input" placeholder="Content *" value={announcementContent} onChange={e => setAnnouncementContent(e.target.value)} required rows={4} style={{ resize: "vertical" }} />
                <button type="submit" className="cta-primary cta-btn" style={{ width: "100%", justifyContent: "center", marginTop: "4px" }}>Submit for Approval</button>
              </form>
            </div>
          )}

          {/* Announcements ticker */}
          {announcements.length > 0 && (
            <div style={{ background: "rgba(14,22,41,0.6)", border: "1px solid rgba(56,189,248,0.1)", borderRadius: "16px", padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 8px #38bdf8", animation: "pulse-ring 2s infinite", display: "inline-block" }} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Live Announcements</span>
              </div>
              <div style={{ overflow: "hidden" }} onMouseEnter={() => setIsMarqueePaused(true)} onMouseLeave={() => setIsMarqueePaused(false)}>
                <div style={{ display: "flex", gap: "16px", animation: "marquee 50s linear infinite", animationPlayState: isMarqueePaused ? "paused" : "running" }}>
                  {[...announcements.slice(0, 10), ...announcements.slice(0, 10)].map((a, i) => (
                    <div key={`${i}-${a._id}`} className="ann-card" onClick={() => { setSelectedAnnouncement(a); setShowAnnouncementModal(true); }}>
                      <div style={{ fontSize: "11px", color: "#38bdf8", fontWeight: 700, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{a.businessName || "General"}</div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#f1f5f9", marginBottom: "8px", lineHeight: "1.4" }}>{a.title}</div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>
                        {a.submitterName && `👤 ${a.submitterName}`}
                        {a.organizationName && ` · ${a.organizationName}`}
                      </div>
                      <div style={{ fontSize: "11px", color: "#475569", marginTop: "6px" }}>{new Date(a.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div style={{ background: "#080b13", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "20px 24px", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          {/* Search */}
          <div style={{ position: "relative", marginBottom: "14px" }}>
            <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "18px", color: "#475569" }}>🔍</span>
            <input className="search-input" type="text" placeholder="Search businesses by name, category, or location…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "16px" }}>✕</button>
            )}
          </div>

          {/* Filter row */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <select className="filter-select" value={selectedCategory || ""} onChange={e => setSelectedCategory(e.target.value || null)}>
              <option value="">All Categories</option>
              {BUSINESS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="filter-select" value={selectedCounty || ""} onChange={e => setSelectedCounty(e.target.value || null)}>
              <option value="">All Counties</option>
              {KENYA_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating">Top Rated</option>
              <option value="views">Most Viewed</option>
              <option value="reviews">Most Reviews</option>
              <option value="name">Name A–Z</option>
            </select>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              style={{ padding: "10px 16px", background: showAdvancedFilters ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${showAdvancedFilters ? "rgba(56,189,248,0.4)" : "rgba(255,255,255,0.1)"}`, borderRadius: "10px", color: showAdvancedFilters ? "#38bdf8" : "#94a3b8", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
            >
              ⚙ Filters {showAdvancedFilters ? "▲" : "▼"}
            </button>

            {(selectedCategory || selectedCounty || searchQuery || openNow || minRating || verification) && (
              <button onClick={() => { setSelectedCategory(null); setSelectedCounty(null); setSearchQuery(""); setOpenNow(false); setMinRating(""); setVerification(""); }}
                style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "10px", color: "#f87171", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Clear All
              </button>
            )}
          </div>

          {/* Advanced */}
          {showAdvancedFilters && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <select className="filter-select" value={minRating} onChange={e => setMinRating(e.target.value)}>
                <option value="">Min Rating</option>
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}+ Stars</option>)}
              </select>
              <select className="filter-select" value={verification} onChange={e => setVerification(e.target.value)}>
                <option value="">Any Verification</option>
                <option value="business_verified">Business Verified</option>
                <option value="location_verified">Location Verified</option>
                <option value="premium_verified">Premium</option>
              </select>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: openNow ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${openNow ? "rgba(16,185,129,0.35)" : "rgba(255,255,255,0.08)"}`, borderRadius: "10px", color: openNow ? "#10b981" : "#94a3b8", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                <input type="checkbox" checked={openNow} onChange={e => setOpenNow(e.target.checked)} style={{ accentColor: "#10b981" }} />
                Open Now
              </label>
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* Results header */}
        {!loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div className="section-label" style={{ marginBottom: "4px" }}>Results</div>
              <div className="section-title" style={{ fontSize: "22px" }}>
                {businesses.length} {businesses.length === 1 ? "Business" : "Businesses"} Found
              </div>
            </div>
            {comparisonList.length > 0 && (
              <div style={{ fontSize: "13px", color: "#38bdf8", fontWeight: 600 }}>
                {comparisonList.length}/3 selected for comparison
              </div>
            )}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "22px" }}>
            {[...Array(6)].map((_, i) => <div key={i} className="shimmer-card" style={{ animationDelay: `${i * 0.1}s` }} />)}
          </div>
        ) : businesses.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔭</div>
            <p style={{ fontSize: "18px", fontWeight: 600, color: "#334155", marginBottom: "8px" }}>No businesses found</p>
            <p style={{ color: "#475569" }}>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "22px" }}>
            {businesses.map((biz, idx) => (
              <div
                key={biz._id}
                className="axx-card"
                style={{ animationDelay: `${Math.min(idx * 0.06, 0.5)}s` }}
                onClick={() => navigate(`/business/${biz._id}`)}
                onMouseEnter={() => setHoveredCard(biz._id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {biz.featured && <div className="featured-tag">⭐ Featured</div>}

                {/* Image */}
                {biz.images?.length > 0 ? (
                  <div className="card-img-wrap">
                    <img src={biz.images[0]} alt={biz.name} />
                    <div className="card-img-overlay" />
                    {/* Rating over image */}
                    {biz.rating > 0 && (
                      <div style={{ position: "absolute", bottom: "12px", left: "14px", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", borderRadius: "8px", padding: "4px 10px", fontSize: "12px", fontWeight: 700, color: "#fbbf24", zIndex: 2 }}>
                        ★ {biz.rating?.toFixed(1)} · {biz.reviewCount || 0} reviews
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ height: "80px", background: "linear-gradient(135deg, rgba(56,189,248,0.06), rgba(16,185,129,0.04))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>🏪</div>
                )}

                {/* Body */}
                <div style={{ padding: "18px 20px 20px" }}>
                  {/* Title row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#f1f5f9", lineHeight: 1.3, flex: 1, paddingRight: "8px" }}>{biz.name}</h3>
                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                      <button className="icon-btn" onClick={e => toggleFavorite(biz._id, e)} title="Favourite">
                        {isFavorite(biz._id) ? "❤️" : "🤍"}
                      </button>
                      <button className="icon-btn" onClick={e => toggleComparison(biz._id, e)} title="Compare" style={{ background: comparisonList.includes(biz._id) ? "rgba(56,189,248,0.15)" : undefined, borderColor: comparisonList.includes(biz._id) ? "rgba(56,189,248,0.4)" : undefined }}>
                        {comparisonList.includes(biz._id) ? <span style={{ color: "#38bdf8", fontWeight: 700, fontSize: "13px" }}>✓</span> : "⚖"}
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: "12px", color: "#38bdf8", fontWeight: 600, marginBottom: "4px" }}>{biz.categories?.join(" · ")}</div>
                  <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "10px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span>📍</span> {biz.location?.town}, {biz.location?.county}
                  </div>

                  <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.55", marginBottom: "12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {biz.description}
                  </p>

                  {/* Badges */}
                  {biz.verificationBadges?.length > 0 && (
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                      {biz.verificationBadges.map((badge, i) => {
                        const cfg = BADGE_CONFIG[badge.type] || {};
                        return (
                          <span key={i} className="badge-pill" style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}40` }}>
                            {cfg.icon} {cfg.label || badge.type}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <hr className="divider" />

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: biz.socialMedia ? "10px" : "0" }}>
                    {biz.contact?.phone && (
                      <a href={`tel:${biz.contact.phone}`} className="action-btn action-btn-primary" onClick={e => e.stopPropagation()}>
                        📞 Call
                      </a>
                    )}
                    {biz.contact?.email && (
                      <a href={`mailto:${biz.contact.email}`} className="action-btn action-btn-success" onClick={e => e.stopPropagation()}>
                        ✉ Email
                      </a>
                    )}
                    {biz.contact?.phone && (
                      <a href={`https://wa.me/${biz.contact.phone}`} target="_blank" rel="noopener noreferrer" className="action-btn" style={{ background: "rgba(37,211,102,0.1)", color: "#25d366", border: "1px solid rgba(37,211,102,0.25)", display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }} onClick={e => e.stopPropagation()}>
                        💬 WhatsApp
                      </a>
                    )}
                  </div>

                  {/* Social icons */}
                  {biz.socialMedia && (
                    <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                      {biz.socialMedia.facebook && <a href={biz.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="social-dot" onClick={e => e.stopPropagation()}>f</a>}
                      {biz.socialMedia.instagram && <a href={biz.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="social-dot" onClick={e => e.stopPropagation()}>📷</a>}
                      {biz.socialMedia.twitter && <a href={biz.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="social-dot" onClick={e => e.stopPropagation()}>𝕏</a>}
                      {biz.socialMedia.whatsapp && <a href={`https://wa.me/${biz.socialMedia.whatsapp}`} target="_blank" rel="noopener noreferrer" className="social-dot" onClick={e => e.stopPropagation()}>💬</a>}
                      {biz.contact?.website && <a href={biz.contact.website} target="_blank" rel="noopener noreferrer" className="social-dot" onClick={e => e.stopPropagation()}>🔗</a>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── COMPARISON FLOATING BAR ── */}
      {comparisonList.length > 0 && (
        <div className="comparison-bar">
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 800, color: "#38bdf8" }}>{comparisonList.length}</span>
            <span style={{ color: "#cbd5e1", fontSize: "14px", fontWeight: 500 }}>businesses to compare</span>
          </div>
          <button className="cta-primary cta-btn" style={{ padding: "8px 18px", fontSize: "13px" }} onClick={openComparison}>Compare Now</button>
          <button onClick={() => setComparisonList([])} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "8px", color: "#f87171", fontSize: "13px", fontWeight: 600, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit" }}>Clear</button>
        </div>
      )}

      {/* ── ANNOUNCEMENT MODAL ── */}
      {showAnnouncementModal && selectedAnnouncement && (
        <div className="modal-overlay" onClick={() => setShowAnnouncementModal(false)}>
          <div className="modal-box" style={{ maxWidth: "560px", width: "90%" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowAnnouncementModal(false)} style={{ position: "absolute", top: "18px", right: "18px", width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>📢 {selectedAnnouncement.businessName || "Announcement"}</div>
            <h3 style={{ fontSize: "24px", fontWeight: 800, color: "#f1f5f9", marginBottom: "12px", lineHeight: "1.3" }}>{selectedAnnouncement.title}</h3>
            <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
              {selectedAnnouncement.submitterName && `👤 ${selectedAnnouncement.submitterName}`}
              {selectedAnnouncement.organizationName && ` · 🏢 ${selectedAnnouncement.organizationName}`}
              <span style={{ marginLeft: "10px" }}>📅 {new Date(selectedAnnouncement.createdAt).toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <hr className="divider" />
            <p style={{ fontSize: "15px", color: "#cbd5e1", lineHeight: "1.75", marginTop: "16px" }}>{selectedAnnouncement.content}</p>
          </div>
        </div>
      )}

      {/* ── COMPARISON MODAL ── */}
      {showComparisonModal && (
        <div className="modal-overlay" onClick={() => setShowComparisonModal(false)}>
          <div className="modal-box" style={{ maxWidth: "860px", width: "95%" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowComparisonModal(false)} style={{ position: "absolute", top: "18px", right: "18px", width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            <div className="section-label" style={{ marginBottom: "6px" }}>Side by Side</div>
            <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#f1f5f9", marginBottom: "24px" }}>Business Comparison</h3>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${comparisonData.length}, 1fr)`, gap: "16px" }}>
              {comparisonData.map(biz => (
                <div key={biz._id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(56,189,248,0.12)", borderRadius: "14px", padding: "20px" }}>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#38bdf8", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>{biz.name}</div>
                  {[
                    ["Category", biz.categories?.join(", ")],
                    ["Location", `${biz.location?.town}, ${biz.location?.county}`],
                    ["Rating", biz.rating ? `★ ${biz.rating}` : "N/A"],
                    ["Reviews", biz.reviewCount || 0],
                    ["Price Range", biz.priceRange || "N/A"],
                    ["Est.", biz.yearEstablished || "N/A"],
                    ["Phone", biz.contact?.phone || "N/A"],
                    ["Email", biz.contact?.email || "N/A"],
                  ].map(([label, val]) => (
                    <div key={label} style={{ marginBottom: "10px" }}>
                      <div style={{ fontSize: "11px", color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "2px" }}>{label}</div>
                      <div style={{ fontSize: "13px", color: "#cbd5e1" }}>{val}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ background: "#06070d", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "48px 24px 28px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "32px", marginBottom: "36px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,#0ea5e9,#38bdf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🏪</div>
                <span style={{ fontSize: "18px", fontWeight: 800, color: "#f1f5f9" }}>AxxBiashara</span>
              </div>
              <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>Kenya's premier verified business directory.</p>
            </div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px" }}>Support</div>
              {["info@axxspace.com", "support@axxspace.com", "admin@axxspace.com"].map(e => (
                <a key={e} href={`mailto:${e}`} style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "8px", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={ev => ev.target.style.color = "#38bdf8"}
                  onMouseLeave={ev => ev.target.style.color = "#64748b"}>
                  📧 {e}
                </a>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <p style={{ fontSize: "12px", color: "#334155" }}>© 2026 Axxspace. All rights reserved.</p>
            <p style={{ fontSize: "12px", color: "#1e3a5f" }}>Built for Kenya 🇰🇪</p>
          </div>
        </div>
      </footer>
    </div>
  );
}