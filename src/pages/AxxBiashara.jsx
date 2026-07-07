import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";

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
  const location = useLocation();
  const { token, user } = useContext(AuthContext);

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
  const [refreshBanner, setRefreshBanner] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalBusinesses, setTotalBusinesses] = useState(0);

  /* ── core data fetchers ── */
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
      console.log("🔍 Frontend received businesses:", res.data.businesses?.length);
      console.log("🔍 Setting businesses state:", res.data.businesses);
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

  const loadFavorites = async () => {
    // Only load favorites if user is logged in
    if (!token) return;

    try {
      const res = await API.get("/favorites");
      setFavorites(res.data.favorites || []);
    } catch (err) { }
  };

  /* ── filter-driven reload ── */
  useEffect(() => {
    loadBusinesses();
  }, [selectedCategory, selectedCounty, searchQuery, sortBy, minRating, openNow, verification]);

  /* ── initial load ── */
  useEffect(() => {
    loadAnnouncements();
    loadFavorites();
  }, []);

  /* ── refresh trigger from BusinessForm after update ── */
  useEffect(() => {
    if (location.state?.refresh) {
      loadBusinesses();
      setRefreshBanner(true);
      // Clear the router state so back-navigation doesn't re-trigger
      window.history.replaceState({}, document.title);
      const t = setTimeout(() => setRefreshBanner(false), 4000);
      return () => clearTimeout(t);
    }
  }, [location.state]);

  /* ── favourites ── */
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

  const isFavorite = (id) => favorites.some(f => f.business._id === id);

  /* ── comparison ── */
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

  /* ── announcement submit ── */
  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await API.post("/business/announcements", {
        title: announcementTitle,
        content: announcementContent,
        submitterName,
        organizationName,
      });
      setAnnouncementSuccess("Announcement submitted for approval!");
      setAnnouncementTitle("");
      setAnnouncementContent("");
      setSubmitterName("");
      setOrganizationName("");
      setShowAnnouncementForm(false);
      setTimeout(() => setAnnouncementSuccess(""), 4000);
    } catch (err) {
      alert("Failed to submit: " + (err.response?.data?.error || err.message));
    }
  };

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(185deg, #090d16 0%, #0d1220 50%, #07090f 100%)", color: "#f1f5f9", fontFamily: "'Sora', 'DM Sans', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #07090f; }
        ::-webkit-scrollbar-thumb { background: #fbbf2450; border-radius: 3px; }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.4); }
          70%  { box-shadow: 0 0 0 10px rgba(251, 191, 36, 0); }
          100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
        }
        @keyframes float {
          0%, 100% { transform: translateX(-50%) translateY(0px); }
          50%       { transform: translateX(-50%) translateY(-6px); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .axx-card {
          animation: fadeSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease, border-color 0.35s;
          cursor: pointer;
          position: relative;
          background: rgba(17, 24, 39, 0.55);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          overflow: hidden;
          backdrop-filter: blur(12px);
        }
        .axx-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.55), 0 0 25px rgba(251, 191, 36, 0.08);
          border-color: rgba(251, 191, 36, 0.35);
        }

        .card-img-wrap { position: relative; overflow: hidden; aspect-ratio: 1/1; }
        .business-grid { gap: 24px; }
        @media (max-width: 768px) { .business-grid { gap: 16px; } }
        @media (max-width: 480px) { .business-grid { gap: 12px; } }
        @media (max-width: 380px) { .business-grid { gap: 8px; } }
        .card-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); display: block; }
        .axx-card:hover .card-img-wrap img { transform: scale(1.05); }
        .card-img-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(9, 13, 22, 0.9) 0%, transparent 60%);
        }

        .badge-pill {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 10px; border-radius: 20px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        .action-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 18px; border-radius: 12px; font-size: 12.5px; font-weight: 700;
          border: none; cursor: pointer; transition: all 0.25s ease; text-decoration: none;
        }
        .action-btn-primary { 
          background: rgba(251, 191, 36, 0.1); 
          color: #fbbf24; 
          border: 1px solid rgba(251, 191, 36, 0.25); 
        }
        .action-btn-primary:hover { 
          background: #fbbf24; 
          color: #090d16; 
          box-shadow: 0 4px 15px rgba(251, 191, 36, 0.25);
        }
        .action-btn-success { 
          background: rgba(20, 184, 166, 0.1); 
          color: #14b8a6; 
          border: 1px solid rgba(20, 184, 166, 0.25); 
        }
        .action-btn-success:hover { 
          background: #14b8a6; 
          color: #090d16; 
          box-shadow: 0 4px 15px rgba(20, 184, 166, 0.25);
        }

        .icon-btn {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer; font-size: 14px; transition: all 0.25s;
        }
        .icon-btn:hover { background: rgba(251, 191, 36, 0.15); border-color: rgba(251, 191, 36, 0.3); }

        .filter-select {
          padding: 12px 16px;
          background: rgba(17, 24, 39, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          color: #e2e8f0;
          font-size: 13.5px;
          font-family: inherit;
          cursor: pointer;
          outline: none;
          transition: all 0.25s;
          min-width: 170px;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23fbbf24' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
        }
        .filter-select:focus, .filter-select:hover { border-color: rgba(251, 191, 36, 0.4); }

        .search-input {
          width: 100%; padding: 16px 16px 16px 54px;
          background: rgba(17, 24, 39, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          color: #f8fafc;
          font-size: 15.5px;
          font-family: inherit;
          outline: none;
          transition: all 0.3s;
        }
        .search-input:focus {
          border-color: rgba(251, 191, 36, 0.5);
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.08);
          background: rgba(17, 24, 39, 0.8);
        }
        .search-input::placeholder { color: #64748b; }

        .ann-card {
          background: rgba(251, 191, 36, 0.03);
          border: 1px solid rgba(251, 191, 36, 0.15);
          border-radius: 14px;
          padding: 16px 20px;
          min-width: 270px;
          max-width: 300px;
          flex-shrink: 0;
          cursor: pointer;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(8px);
        }
        .ann-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #fbbf24, #f59e0b, #d97706, #fbbf24);
          background-size: 300% 100%;
          animation: shimmer 3s linear infinite;
        }
        .ann-card:hover {
          transform: translateY(-4px);
          border-color: rgba(251, 191, 36, 0.45);
          box-shadow: 0 10px 25px rgba(251, 191, 36, 0.15);
          background: rgba(251, 191, 36, 0.06);
        }

        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(5, 8, 15, 0.8);
          backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999;
          animation: fadeSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .modal-box {
          background: #0d1220;
          border: 1px solid rgba(251, 191, 36, 0.25);
          border-radius: 24px;
          padding: 40px;
          position: relative;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.7);
        }

        .shimmer-card {
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 75%);
          background-size: 400px 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 20px;
          height: 340px;
        }

        .cta-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 24px; border-radius: 14px;
          font-size: 14px; font-weight: 700;
          border: none; cursor: pointer;
          transition: all 0.25s ease; font-family: inherit;
          text-decoration: none;
        }
        .cta-primary {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #090d16;
          box-shadow: 0 4px 18px rgba(251, 191, 36, 0.25);
        }
        .cta-primary:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 8px 24px rgba(251, 191, 36, 0.4); 
        }
        .cta-green {
          background: rgba(255, 255, 255, 0.05);
          color: #f1f5f9;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .cta-green:hover { 
          background: rgba(255, 255, 255, 0.09);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px); 
        }

        .comparison-bar {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
          background: rgba(13, 18, 32, 0.95);
          border: 1px solid rgba(251, 191, 36, 0.3);
          border-radius: 20px; padding: 14px 28px;
          display: flex; align-items: center; gap: 20px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.7);
          z-index: 1000; backdrop-filter: blur(16px);
          animation: float 3s ease-in-out infinite;
        }

        .section-label {
          font-size: 11px; font-weight: 800; letter-spacing: 0.15em;
          text-transform: uppercase; color: #fbbf24;
        }
        .section-title {
          font-size: 28px; font-weight: 800;
          background: linear-gradient(135deg, #f8fafc 30%, #94a3b8 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .no-results {
          text-align: center; padding: 80px 20px;
          color: #64748b; font-size: 16px;
        }
        .no-results-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.6; }

        .form-input {
          width: 100%; padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px; color: #f1f5f9;
          font-size: 14px; font-family: inherit;
          outline: none; transition: border-color 0.25s;
          margin-bottom: 12px;
        }
        .form-input:focus { border-color: rgba(251, 191, 36, 0.45); }
        .form-input::placeholder { color: #475569; }

        .social-dot {
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(255, 255, 255, 0.04);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.2s ease;
          color: #cbd5e1;
        }
        .social-dot:hover { background: rgba(251, 191, 36, 0.15); border-color: rgba(251, 191, 36, 0.4); transform: scale(1.1); color: #fbbf24; }

        .featured-tag {
          position: absolute; top: 12px; left: 12px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: #090d16; padding: 4px 12px; border-radius: 20px;
          font-size: 10px; font-weight: 800; letter-spacing: 0.05em;
          text-transform: uppercase; z-index: 2;
        }

        .stat-chip {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px; padding: 6px 14px;
          font-size: 12px; color: #94a3b8;
        }
        .stat-chip strong { color: #fbbf24; font-weight: 700; }

        .divider { border: none; border-top: 1px solid rgba(255, 255, 255, 0.08); margin: 16px 0; }

        .refresh-banner {
          animation: slideDown 0.35s ease;
          background: rgba(20, 184, 166, 0.1);
          border: 1px solid rgba(20, 184, 166, 0.3);
          color: #14b8a6;
          padding: 14px 22px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
        }
      `}</style>

      {/* ── HERO HEADER ── */}
      <div style={{
        background: "radial-gradient(circle at top right, rgba(251, 191, 36, 0.05) 0%, transparent 60%), linear-gradient(180deg, #0d1322 0%, #090d16 100%)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        padding: "72px 24px 56px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative backdrop blobs */}
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(251, 191, 36, 0.06) 0%, transparent 70%)", pointerEvents: "none", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "-120px", left: "5%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(20, 184, 166, 0.04) 0%, transparent 70%)", pointerEvents: "none", filter: "blur(40px)" }} />

        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          {/* Top bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "30px", marginBottom: "42px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "14px" }}>
                <img src="/axxbiashara.png" alt="AxxBiashara" style={{ width: "48px", height: "48px", borderRadius: "14px", objectFit: "cover", boxShadow: "0 6px 20px rgba(251, 191, 36, 0.25)" }} />
                <div>
                  <div className="section-label">Kenya Business Directory</div>
                  <h1 style={{ fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 800, background: "linear-gradient(135deg, #ffffff 0%, #fbbf24 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                    AxxBiashara
                  </h1>
                </div>
              </div>
              <p style={{ color: "#94a3b8", fontSize: "15.5px", maxWidth: "480px", lineHeight: "1.6", fontWeight: 500 }}>
                Discover, compare, and connect with premier verified local businesses and services across all 47 counties of Kenya.
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {token && user?.role === "user" && (
                <button className="cta-btn" style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f1f5f9" }} onClick={() => navigate("/business-dashboard")}>
                  Dashboard
                </button>
              )}
              <button className="cta-primary cta-btn" onClick={() => {
                if (token && user?.role === "user") {
                  navigate("/business-dashboard");
                } else {
                  navigate("/business-login");
                }
              }}>
                Add Business
              </button>
              <button className="cta-green cta-btn" onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}>
                {showAnnouncementForm ? "Cancel" : "Announce"}
              </button>
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "36px" }}>
            {[
              { label: "Registered Businesses", value: businesses.length },
              { label: "Counties Covered", value: "47" },
              { label: "Industry Categories", value: BUSINESS_CATEGORIES.length },
              { label: "Verified Partners", value: businesses.filter(b => b.verificationBadges?.length).length },
            ].map(s => (
              <div key={s.label} className="stat-chip"><strong>{s.value}</strong> {s.label}</div>
            ))}
          </div>

          {/* ── REFRESH BANNER — shown after a business update ── */}
          {refreshBanner && (
            <div className="refresh-banner">
              <span style={{ fontSize: "18px" }}>✓</span>
              Directory updated successfully! The business records have been reloaded.
            </div>
          )}

          {/* Success message (announcement) */}
          {announcementSuccess && (
            <div style={{ background: "rgba(20, 184, 166, 0.1)", border: "1px solid rgba(20, 184, 166, 0.3)", color: "#14b8a6", padding: "14px 20px", borderRadius: "14px", marginBottom: "24px", fontSize: "14.5px", fontWeight: 600 }}>
              {announcementSuccess}
            </div>
          )}

          {/* Announcement form */}
          {showAnnouncementForm && (
            <div style={{ background: "rgba(17, 24, 39, 0.45)", border: "1px solid rgba(251, 191, 36, 0.2)", borderRadius: "20px", padding: "32px", marginBottom: "36px", backdropFilter: "blur(12px)" }}>
              <h3 style={{ fontSize: "19px", fontWeight: 700, color: "#fbbf24", marginBottom: "20px" }}>Create General Announcement</h3>
              <form onSubmit={handleAddAnnouncement}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "0" }}>
                  <input className="form-input" type="text" placeholder="Your Name *" value={submitterName} onChange={e => setSubmitterName(e.target.value)} required style={{ marginBottom: 0 }} />
                  <input className="form-input" type="text" placeholder="Organisation (optional)" value={organizationName} onChange={e => setOrganizationName(e.target.value)} style={{ marginBottom: 0 }} />
                </div>
                <div style={{ height: 16 }} />
                <input className="form-input" type="text" placeholder="Announcement Title *" value={announcementTitle} onChange={e => setAnnouncementTitle(e.target.value)} required />
                <textarea className="form-input" placeholder="Content *" value={announcementContent} onChange={e => setAnnouncementContent(e.target.value)} required rows={4} style={{ resize: "vertical" }} />
                <button type="submit" className="cta-primary cta-btn" style={{ width: "100%", justifyContent: "center", marginTop: "4px" }}>Submit Announcement</button>
              </form>
            </div>
          )}

          {/* Announcements ticker */}
          {announcements.length > 0 && (
            <div style={{ background: "rgba(17, 24, 39, 0.35)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "20px 24px", backdropFilter: "blur(8px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fbbf24", boxShadow: "0 0 8px #fbbf24", animation: "pulse-ring 2s infinite", display: "inline-block" }} />
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.12em" }}>Live Board</span>
              </div>
              <div style={{ overflow: "hidden" }} onMouseEnter={() => setIsMarqueePaused(true)} onMouseLeave={() => setIsMarqueePaused(false)}>
                <div style={{ display: "flex", gap: "16px", animation: "marquee 50s linear infinite", animationPlayState: isMarqueePaused ? "paused" : "running" }}>
                  {[...announcements.slice(0, 10), ...announcements.slice(0, 10)].map((a, i) => (
                    <div key={`${i}-${a._id}`} className="ann-card" onClick={() => { setSelectedAnnouncement(a); setShowAnnouncementModal(true); }}>
                      <div style={{ fontSize: "11px", color: "#fbbf24", fontWeight: 700, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{a.businessName || "General"}</div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#f1f5f9", marginBottom: "8px", lineHeight: "1.4" }}>{a.title}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                        {a.submitterName && `${a.submitterName}`}
                        {a.organizationName && ` · ${a.organizationName}`}
                      </div>
                      <div style={{ fontSize: "10px", color: "#64748b", marginTop: "6px", fontWeight: 600 }}>{new Date(a.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── FILTERS BAR ── */}
      <div style={{ background: "rgba(9, 13, 22, 0.8)", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", padding: "20px 24px", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(16px)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          {/* Search bar wrapper */}
          <div style={{ position: "relative", marginBottom: "16px" }}>
            <span style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)", fontSize: "18px", color: "#fbbf24" }}>🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search businesses by name, category, or town…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "16px" }}>✕</button>
            )}
          </div>

          {/* Filters Row */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <select className="filter-select" value={selectedCategory || ""} onChange={e => setSelectedCategory(e.target.value || null)}>
              <option value="">All Categories</option>
              {BUSINESS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="filter-select" value={selectedCounty || ""} onChange={e => setSelectedCounty(e.target.value || null)}>
              <option value="">All Counties</option>
              {KENYA_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="verified">Verified First</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating">Top Rated</option>
              <option value="views">Most Viewed</option>
              <option value="reviews">Most Reviews</option>
              <option value="name">Name A–Z</option>
            </select>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              style={{ padding: "12px 18px", background: showAdvancedFilters ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${showAdvancedFilters ? "rgba(251,191,36,0.35)" : "rgba(255,255,255,0.08)"}`, borderRadius: "12px", color: showAdvancedFilters ? "#fbbf24" : "#94a3b8", fontSize: "13.5px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.25s" }}
            >
              Filters {showAdvancedFilters ? "▲" : "▼"}
            </button>

            {(selectedCategory || selectedCounty || searchQuery || openNow || minRating || verification) && (
              <button
                onClick={() => { setSelectedCategory(null); setSelectedCounty(null); setSearchQuery(""); setOpenNow(false); setMinRating(""); setVerification(""); }}
                style={{ padding: "12px 18px", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "12px", color: "#fca5a5", fontSize: "13.5px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
              >
                Clear All
              </button>
            )}
          </div>

          {/* Advanced Panel */}
          {showAdvancedFilters && (
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)", animation: "slideDown 0.25s ease-out" }}>
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
              <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 18px", background: openNow ? "rgba(20, 184, 166, 0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${openNow ? "rgba(20, 184, 166, 0.3)" : "rgba(255,255,255,0.06)"}`, borderRadius: "12px", color: openNow ? "#14b8a6" : "#94a3b8", fontSize: "13.5px", fontWeight: 700, cursor: "pointer", transition: "all 0.25s" }}>
                <input type="checkbox" checked={openNow} onChange={e => setOpenNow(e.target.checked)} style={{ accentColor: "#14b8a6" }} />
                Open Now
              </label>
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Results title */}
        {!loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div className="section-label" style={{ marginBottom: "6px" }}>Directory Records</div>
              <div className="section-title" style={{ fontSize: "24px" }}>
                {businesses.length} {businesses.length === 1 ? "Business" : "Businesses"} Available
              </div>
            </div>
            {comparisonList.length > 0 && (
              <div style={{ fontSize: "13.5px", color: "#fbbf24", fontWeight: 700 }}>
                {comparisonList.length}/3 selected for compare
              </div>
            )}
          </div>
        )}

        {/* Directory Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
            {[...Array(6)].map((_, i) => <div key={i} className="shimmer-card" style={{ animationDelay: `${i * 0.08}s` }} />)}
          </div>
        ) : businesses.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <p style={{ fontSize: "19px", fontWeight: 700, color: "#94a3b8", marginBottom: "8px" }}>No matching businesses</p>
            <p style={{ color: "#475569" }}>Try broadening your search query or selecting a different category/county.</p>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }} className="business-grid">
              {businesses.map((biz, idx) => (
                <div
                  key={biz._id}
                  className="axx-card"
                  style={{
                    animationDelay: `${Math.min(idx * 0.05, 0.4)}s`,
                    border: biz.featured ? "1px solid rgba(251, 191, 36, 0.35)" : undefined,
                    boxShadow: biz.featured ? "0 0 15px rgba(251, 191, 36, 0.04)" : undefined,
                  }}
                  onClick={() => navigate(`/business/${biz._id}`)}
                  onMouseEnter={() => setHoveredCard(biz._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {biz.featured && <div className="featured-tag">Featured</div>}

                  {/* Visual Header */}
                  {biz.images?.length > 0 ? (
                    <div className="card-img-wrap">
                      <img src={biz.images[0]} alt={biz.name} />
                      <div className="card-img-overlay" />
                      {biz.rating > 0 && (
                        <div style={{ position: "absolute", bottom: "12px", left: "14px", background: "rgba(9, 13, 22, 0.8)", backdropFilter: "blur(4px)", borderRadius: "8px", padding: "4px 10px", fontSize: "11px", fontWeight: 800, color: "#fbbf24", zIndex: 2, border: "1px solid rgba(255,255,255,0.08)" }}>
                          ★ {biz.rating?.toFixed(1)}
                        </div>
                      )}
                      <div style={{ position: "absolute", top: "12px", right: "12px", display: "flex", gap: "8px", zIndex: 2 }}>
                        <button className="icon-btn" onClick={e => toggleFavorite(biz._id, e)} title="Favorite" style={{ padding: "8px", width: "32px", height: "32px" }}>
                          {isFavorite(biz._id) ? "❤️" : "🤍"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ aspectRatio: "1/1", background: "linear-gradient(135deg, rgba(251,191,36,0.05) 0%, rgba(20,184,166,0.03) 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      🏪
                    </div>
                  )}

                  {/* Body Content - Simplified */}
                  <div style={{ padding: "16px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#f8fafc", lineHeight: 1.3, marginBottom: "8px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{biz.name}</h3>
                    <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
                      <span>📍</span> {biz.location?.town}, {biz.location?.county}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination controls */}
      {totalBusinesses > itemsPerPage && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginTop: "42px", flexWrap: "wrap" }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{
              padding: "10px 18px",
              background: currentPage === 1 ? "rgba(255,255,255,0.02)" : "rgba(251,191,36,0.1)",
              border: currentPage === 1 ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(251,191,36,0.25)",
              borderRadius: "12px",
              color: currentPage === 1 ? "#475569" : "#fbbf24",
              fontSize: "14px",
              fontWeight: 700,
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "all 0.25s",
            }}
          >
            ← Previous
          </button>

          {Array.from({ length: Math.min(5, Math.ceil(totalBusinesses / itemsPerPage)) }, (_, i) => {
            const totalPages = Math.ceil(totalBusinesses / itemsPerPage);
            let pageNum;

            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  padding: "10px 14px",
                  background: currentPage === pageNum ? "rgba(251, 191, 36, 0.15)" : "rgba(255,255,255,0.03)",
                  border: currentPage === pageNum ? "1px solid rgba(251, 191, 36, 0.4)" : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "12px",
                  color: currentPage === pageNum ? "#fbbf24" : "#94a3b8",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                  minWidth: "44px",
                }}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalBusinesses / itemsPerPage), prev + 1))}
            disabled={currentPage === Math.ceil(totalBusinesses / itemsPerPage)}
            style={{
              padding: "10px 18px",
              background: currentPage === Math.ceil(totalBusinesses / itemsPerPage) ? "rgba(255,255,255,0.02)" : "rgba(251,191,36,0.1)",
              border: currentPage === Math.ceil(totalBusinesses / itemsPerPage) ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(251,191,36,0.25)",
              borderRadius: "12px",
              color: currentPage === Math.ceil(totalBusinesses / itemsPerPage) ? "#475569" : "#fbbf24",
              fontSize: "14px",
              fontWeight: 700,
              cursor: currentPage === Math.ceil(totalBusinesses / itemsPerPage) ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "all 0.25s",
            }}
          >
            Next →
          </button>
        </div>
      )}

      {/* ── FLOATING COMPARE BAR ── */}
      {comparisonList.length > 0 && (
        <div className="comparison-bar">
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800, color: "#fbbf24" }}>{comparisonList.length}</span>
            <span style={{ color: "#cbd5e1", fontSize: "13.5px", fontWeight: 600 }}>selected businesses</span>
          </div>
          <button className="cta-primary cta-btn" style={{ padding: "8px 18px", fontSize: "12.5px" }} onClick={openComparison}>Compare</button>
          <button onClick={() => setComparisonList([])} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#cbd5e1", fontSize: "12.5px", fontWeight: 600, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit" }}>Clear</button>
        </div>
      )}

      {/* ── ANNOUNCEMENT VIEW MODAL ── */}
      {showAnnouncementModal && selectedAnnouncement && (
        <div className="modal-overlay" onClick={() => setShowAnnouncementModal(false)}>
          <div className="modal-box" style={{ maxWidth: "560px", width: "90%" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowAnnouncementModal(false)} style={{ position: "absolute", top: "18px", right: "18px", width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justify: "center", transition: "all 0.2s" }} onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.1)"} onMouseLeave={e => e.target.style.background = "rgba(255,255,255,0.04)"}>✕</button>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>📢 {selectedAnnouncement.businessName || "Announcement"}</div>
            <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#f8fafc", marginBottom: "12px", lineHeight: 1.3 }}>{selectedAnnouncement.title}</h3>
            <div style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "20px" }}>
              {selectedAnnouncement.submitterName && `${selectedAnnouncement.submitterName}`}
              {selectedAnnouncement.organizationName && ` · ${selectedAnnouncement.organizationName}`}
              <span style={{ marginLeft: "12px" }}>{new Date(selectedAnnouncement.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <hr className="divider" style={{ marginBottom: "20px" }} />
            <p style={{ fontSize: "14.5px", color: "#e2e8f0", lineHeight: 1.7, marginTop: "12px" }}>{selectedAnnouncement.content}</p>
          </div>
        </div>
      )}

      {/* ── SIDE BY SIDE COMPARISON MODAL ── */}
      {showComparisonModal && (
        <div className="modal-overlay" onClick={() => setShowComparisonModal(false)}>
          <div className="modal-box" style={{ maxWidth: "860px", width: "95%" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowComparisonModal(false)} style={{ position: "absolute", top: "18px", right: "18px", width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justify: "center" }}>✕</button>
            <div className="section-label" style={{ marginBottom: "6px" }}>Side-by-Side Review</div>
            <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#f8fafc", marginBottom: "24px" }}>Business Comparison</h3>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${comparisonData.length}, 1fr)`, gap: "16px" }}>
              {comparisonData.map(biz => (
                <div key={biz._id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(251, 191, 36, 0.15)", borderRadius: "16px", padding: "20px" }}>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#fbbf24", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{biz.name}</div>
                  {[
                    ["Category", biz.categories?.join(", ")],
                    ["Location", `${biz.location?.town}, ${biz.location?.county}`],
                    ["Rating", biz.rating ? `★ ${biz.rating}` : "No rating"],
                    ["Reviews count", biz.reviewCount || 0],
                    ["Price Guide", biz.priceRange || "N/A"],
                    ["Founded Year", biz.yearEstablished || "N/A"],
                    ["Contact Phone", biz.contact?.phone || "N/A"],
                    ["Contact Email", biz.contact?.email || "N/A"],
                  ].map(([label, val]) => (
                    <div key={label} style={{ marginBottom: "12px" }}>
                      <div style={{ fontSize: "10.5px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>{label}</div>
                      <div style={{ fontSize: "13px", color: "#e2e8f0" }}>{val}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── DIRECTORY FOOTER ── */}
      <footer style={{ background: "#07090f", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "56px 24px 32px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "32px", marginBottom: "40px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(251,191,36,0.1)", display: "flex", alignItems: "center", justify: "center" }}><img src="/axxbiashara.png" alt="AxxBiashara" style={{ width: "24px", height: "24px", objectFit: "cover", borderRadius: "6px" }} /></div>
                <span style={{ fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>AxxBiashara</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>Directory Contacts</div>
              {["info@axxspace.com", "support@axxspace.com"].map(e => (
                <a
                  key={e}
                  href={`mailto:${e}`}
                  style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "8px", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={ev => ev.target.style.color = "#fbbf24"}
                  onMouseLeave={ev => ev.target.style.color = "#64748b"}
                >
                  {e}
                </a>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <p style={{ fontSize: "12px", color: "#475569" }}>Copyright 2026 Axxspace.</p>
            <p style={{ fontSize: "12.5px", color: "#fbbf24", fontWeight: 700 }}>Built for Kenya</p>
          </div>
        </div>
      </footer>
    </div>
  );
}