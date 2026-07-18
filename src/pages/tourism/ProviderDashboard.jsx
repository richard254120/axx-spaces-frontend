import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ProfileAvatar } from "../../features/profile";
import {
  useOwnerProfile,
  StatusBadge,
  LoadingBlock,
  ErrorAlert,
  TOURISM_FONT_CSS,
  tourismTheme,
  getDisplayName,
} from "../../features/tourism";

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { user: authUser, token, logout: authLogout } = useContext(AuthContext);
  const { profile, loading, error, reload } = useOwnerProfile();

  const user = profile?.user;
  const stats = profile?.stats;
  const listings = profile?.listings || [];

  const handleLogout = () => {
    authLogout("/");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "☀️ Good morning";
    if (hour < 17) return "🌤️ Good afternoon";
    if (hour < 22) return "🌙 Good evening";
    return "✨ Hello";
  };

  const displayName = getDisplayName(user || authUser);
  const avatarUser = user || authUser;
  const loggedIn = Boolean(token);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: tourismTheme.bg }}>
      <style>{TOURISM_FONT_CSS}</style>

      <main style={{ padding: "32px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={mainHeader}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: tourismTheme.text, marginBottom: "8px" }}>
              {getGreeting()}, {displayName.split(" ")[0]}!
            </h1>
            <p style={{ color: tourismTheme.muted, fontSize: "14px" }}>
              Your tourism property dashboard
            </p>
          </div>
        </div>

        {error && <ErrorAlert message={error} onRetry={reload} />}

        {loading ? (
          <LoadingBlock message="Loading your profile…" />
        ) : user ? (
          <>
            <div style={statsGrid}>
              {[
                { label: "Total properties", value: stats?.total ?? 0 },
                { label: "Live", value: stats?.approved ?? 0, color: "#16a34a" },
                { label: "Under review", value: stats?.pending ?? 0, color: "#d97706" },
                { label: "Rejected", value: stats?.rejected ?? 0, color: "#dc2626" },
                { label: "Total views", value: stats?.totalViews ?? 0, color: "#0ea5e9" },
              ].map((s) => (
                <div key={s.label} style={statCard}>
                  <div style={{ fontSize: "13px", color: tourismTheme.muted }}>{s.label}</div>
                  <div style={{ fontSize: "26px", fontWeight: 900, color: s.color || tourismTheme.text }}>{s.value}</div>
                </div>
              ))}
            </div>

            <h2 style={{ ...sectionHead, marginTop: "28px" }}>Your properties</h2>

            {listings.length === 0 ? (
              <div style={{ ...statCard, textAlign: "center", padding: "40px" }}>
                <p style={{ color: tourismTheme.muted, marginBottom: "16px" }}>No properties submitted yet.</p>
                <button type="button" style={primaryBtn} onClick={() => navigate("/tourism/register-property")}>
                  List your first property →
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {listings.map((l) => (
                  <article key={l.id || l._id} style={listRow}>
                    <div style={thumbWrap}>
                      {l.thumbnail ? (
                        <img src={l.thumbnail} alt="" style={thumbImg} />
                      ) : (
                        <span style={{ fontSize: "36px" }}>{l.emoji}</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: 800 }}>{l.name}</h3>
                        <StatusBadge status={l.status} />
                      </div>
                      <p style={{ fontSize: "13px", color: tourismTheme.muted, marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span>{l.category} ·</span>
                        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        <span>{l.location} · KSh {l.price?.toLocaleString()}/night</span>
                      </p>
                      <p style={{ fontSize: "12px", color: tourismTheme.muted, marginTop: "6px" }}>
                        📷 {(l.images?.length || 0)} photo(s) · 🎬 {(l.videos?.length || 0)} video(s) · 👁 {l.views || 0} views
                      </p>
                      {l.status === "pending" && (
                        <p style={{ fontSize: "12px", color: "#92400e", marginTop: "8px" }}>
                          Under review — usually within 24 hours.
                        </p>
                      )}
                      {l.status === "rejected" && (
                        <p style={{ fontSize: "12px", color: "#991b1b", marginTop: "8px" }}>
                          Not approved — edit and resubmit for review.
                        </p>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                      <button type="button" style={primaryBtn} onClick={() => navigate(`/tourism/dashboard/property/${l.id || l._id}`)}>
                        Edit & upload media
                      </button>
                      {l.status === "approved" && (
                        <button type="button" style={secondaryBtn} onClick={() => navigate(`/tourism/${l.id || l._id}`)}>
                          View live
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        ) : !loggedIn ? (
          <div style={statCard}>
            <p style={{ marginBottom: "16px", color: tourismTheme.muted }}>Sign in to manage your tourism properties.</p>
            <button type="button" style={primaryBtn} onClick={() => navigate("/tourism/login")}>🔑 Log in</button>
            <button type="button" style={{ ...secondaryBtn, marginLeft: "10px" }} onClick={() => navigate("/tourism/register-property")}>
              Register property
            </button>
          </div>
        ) : null}
      </main>
    </div>
  );
}

const mainHeader = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", marginBottom: "32px", flexWrap: "wrap" };
const sectionHead = { fontSize: "20px", fontWeight: 800, margin: 0, color: "#1f2937", letterSpacing: "-0.5px" };
const statsGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" };
const statCard = { background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)", padding: "24px", borderRadius: "16px", border: "1px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "all 0.3s ease", cursor: "pointer" };
const listRow = { background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)", padding: "20px", borderRadius: "18px", border: "1px solid #e5e7eb", display: "flex", gap: "20px", alignItems: "flex-start", flexWrap: "wrap", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "all 0.3s ease" };
const thumbWrap = { width: "100px", height: "100px", borderRadius: "14px", overflow: "hidden", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid #e5e7eb" };
const thumbImg = { width: "100%", height: "100%", objectFit: "cover" };
const primaryBtn = { background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", color: "#1f2937", border: "none", borderRadius: "12px", padding: "12px 20px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", fontSize: "14px", boxShadow: "0 4px 12px rgba(251, 191, 36, 0.3)", transition: "all 0.3s ease" };
const secondaryBtn = { background: "transparent", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "12px 20px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: "14px", transition: "all 0.3s ease" };
