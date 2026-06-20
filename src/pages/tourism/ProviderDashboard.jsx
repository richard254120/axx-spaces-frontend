import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { tourismLogin } from "../../api/tourism";
import { UserProfileEditor, ProfileAvatar } from "../../features/profile";
import VerificationStatus from "../../components/VerificationStatus";
import VerificationBadges from "../../components/VerificationBadges";
import AnalyticsDashboard from "../../components/AnalyticsDashboard";
import {
  useOwnerProfile,
  StatusBadge,
  LoadingBlock,
  ErrorAlert,
  TOURISM_FONT_CSS,
  tourismTheme,
  setTourismSession,
  clearTourismSession,
  getTourismToken,
  getDisplayName,
} from "../../features/tourism";

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { user: authUser, token, login: authLogin, logout: authLogout } = useContext(AuthContext);
  const { profile, loading, error, reload } = useOwnerProfile();

  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginErr, setLoginErr] = useState("");

  const loggedIn = Boolean(token || getTourismToken());
  const user = profile?.user;
  const stats = profile?.stats;
  const listings = profile?.listings || [];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginErr("");
    try {
      const res = await tourismLogin(loginForm.email, loginForm.password);
      setTourismSession(res.token, res.user);
      authLogin(res.token, res.user);
      setShowLogin(false);
      reload();
    } catch (err) {
      setLoginErr(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    clearTourismSession();
    authLogout("/tourism");
  };

  const displayName = getDisplayName(user || authUser);
  const avatarUser = user || authUser;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", display: "flex", minHeight: "100vh", background: tourismTheme.bg }}>
      <style>{TOURISM_FONT_CSS}</style>

      <aside style={sidebar}>
        <div style={sidebarTop}>
          <button type="button" style={logoBtn} onClick={() => navigate("/tourism")}>🏨 AXX Tourism</button>
          <div style={authRow}>
            {loggedIn ? (
              <>
                <button type="button" style={iconBtn} title={`Signed in as ${displayName}`} aria-label="Account">
                  <ProfileAvatar user={avatarUser} size={28} style={{ border: "none" }} />
                </button>
                <button type="button" style={iconBtn} onClick={() => navigate("/settings")} title="Settings" aria-label="Settings">
                  ⚙️
                </button>
                <button type="button" style={iconBtn} onClick={handleLogout} title="Log out" aria-label="Log out">
                  🚪
                </button>
              </>
            ) : (
              <button type="button" style={iconBtn} onClick={() => setShowLogin(true)} title="Log in" aria-label="Log in">
                🔑
              </button>
            )}
          </div>
        </div>

        {loggedIn && (
          <div style={sidebarUser}>
            <ProfileAvatar user={avatarUser} size={40} />
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px" }}>{displayName}</div>
              <div style={{ fontSize: "11px", color: "#9ca3af" }}>{user?.email || authUser?.email}</div>
            </div>
          </div>
        )}

        <nav style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "16px" }}>
          {[
            { label: "← Back to site", path: "/tourism" },
            { label: "+ Add property", path: "/tourism/register-property" },
            { label: "Browse listings", path: "/tourism/listings" },
          ].map((item) => (
            <button key={item.path} type="button" style={navItem} onClick={() => navigate(item.path)}>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={sidebarFooter}>
          {loggedIn ? (
            <>
              <button type="button" style={settingsLink} onClick={() => navigate("/settings")}>
                <span aria-hidden>⚙️</span> Settings
              </button>
              <button type="button" style={logoutLink} onClick={handleLogout}>
                <span aria-hidden>🚪</span> Log out
              </button>
            </>
          ) : (
            <button type="button" style={loginLink} onClick={() => setShowLogin(true)}>
              <span aria-hidden>🔑</span> Log in
            </button>
          )}
        </div>
      </aside>

      <main style={{ flex: 1, padding: "32px 24px", maxWidth: "1000px" }}>
        <div style={mainHeader}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: tourismTheme.text, marginBottom: "8px" }}>
              Owner dashboard
            </h1>
            <p style={{ color: tourismTheme.muted, fontSize: "14px" }}>
              Your profile, property statuses, and listing editor.
            </p>
          </div>
          {loggedIn && (
            <button type="button" style={headerLogout} onClick={handleLogout} title="Log out">
              🚪 Log out
            </button>
          )}
        </div>

        {error && <ErrorAlert message={error} onRetry={reload} />}

        {loading ? (
          <LoadingBlock message="Loading your profile…" />
        ) : user ? (
          <>
            <VerificationBadges userId={user?._id || user?.id} userType="tourism" />
            <AnalyticsDashboard userType="tourism" userId={user?._id || user?.id} />
            <UserProfileEditor
              token={token || getTourismToken()}
              user={user}
              accentColor="#fbbf24"
              onUpdated={() => reload()}
            />

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

            <div style={{ marginBottom: '24px' }}>
              <VerificationStatus />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <AnalyticsDashboard userType="landlord" userId={user?._id || user?.id || authUser?._id || authUser?.id} />
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
                      <p style={{ fontSize: "13px", color: tourismTheme.muted, marginTop: "4px" }}>
                        {l.category} · 📍 {l.location} · KSh {l.price?.toLocaleString()}/night
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
            <button type="button" style={primaryBtn} onClick={() => setShowLogin(true)}>🔑 Log in</button>
            <button type="button" style={{ ...secondaryBtn, marginLeft: "10px" }} onClick={() => navigate("/tourism/register-property")}>
              Register property
            </button>
          </div>
        ) : null}
      </main>

      {showLogin && (
        <div style={overlay} onClick={() => setShowLogin(false)} role="presentation">
          <div style={modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="login-title">
            <button type="button" style={modalClose} onClick={() => setShowLogin(false)} aria-label="Close">✕</button>
            <h2 id="login-title" style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px" }}>🔑 Log in</h2>
            <p style={{ fontSize: "13px", color: tourismTheme.muted, marginBottom: "20px" }}>
              Access your owner dashboard and property listings.
            </p>
            <form onSubmit={handleLogin}>
              <label style={fieldWrap}>
                <span style={fieldLabel}>Email</span>
                <input
                  style={fieldInput}
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </label>
              <label style={{ ...fieldWrap, marginTop: "12px" }}>
                <span style={fieldLabel}>Password</span>
                <input
                  style={fieldInput}
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                  required
                />
              </label>
              {loginErr && <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "12px" }}>{loginErr}</p>}
              <button type="submit" style={{ ...primaryBtn, width: "100%", marginTop: "20px" }} disabled={loginLoading}>
                {loginLoading ? "Signing in…" : "Sign in"}
              </button>
            </form>
            <p style={{ fontSize: "12px", color: tourismTheme.muted, marginTop: "16px", textAlign: "center" }}>
              New here?{" "}
              <button type="button" style={textLink} onClick={() => { setShowLogin(false); navigate("/tourism/register-property"); }}>
                Register a property
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const sidebar = { width: "280px", background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)", color: "white", padding: "24px 20px", flexShrink: 0, display: "flex", flexDirection: "column", minHeight: "100vh", boxShadow: "4px 0 20px rgba(0,0,0,0.15)" };
const sidebarTop = { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "16px" };
const logoBtn = { background: "none", border: "none", color: "white", fontSize: "18px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", textAlign: "left", flex: 1, letterSpacing: "-0.5px" };
const authRow = { display: "flex", gap: "8px", flexShrink: 0 };
const iconBtn = { background: "rgba(55, 65, 81, 0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", width: "44px", height: "44px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", transition: "all 0.3s ease" };
const sidebarUser = { display: "flex", alignItems: "center", gap: "14px", padding: "16px", background: "rgba(55, 65, 81, 0.6)", borderRadius: "14px", marginBottom: "16px", border: "1px solid rgba(255,255,255,0.08)" };
const navItem = { padding: "14px 16px", borderRadius: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.05)", color: "#9ca3af", textAlign: "left", cursor: "pointer", fontFamily: "inherit", fontSize: "14px", fontWeight: 600, transition: "all 0.3s ease" };
const sidebarFooter = { marginTop: "auto", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.08)" };
const logoutLink = { width: "100%", padding: "14px 16px", borderRadius: "12px", background: "transparent", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", textAlign: "left", cursor: "pointer", fontFamily: "inherit", fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px", transition: "all 0.3s ease" };
const settingsLink = { width: "100%", padding: "14px 16px", borderRadius: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", textAlign: "left", cursor: "pointer", fontFamily: "inherit", fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", transition: "all 0.3s ease" };
const loginLink = { width: "100%", padding: "14px 16px", borderRadius: "12px", background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", border: "none", color: "#1f2937", textAlign: "left", cursor: "pointer", fontFamily: "inherit", fontSize: "14px", fontWeight: 800, display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 4px 12px rgba(251, 191, 36, 0.3)", transition: "all 0.3s ease" };
const mainHeader = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", marginBottom: "32px", flexWrap: "wrap" };
const headerLogout = { background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "12px 20px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: "14px", transition: "all 0.3s ease", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" };
const sectionHead = { fontSize: "20px", fontWeight: 800, margin: 0, color: "#1f2937", letterSpacing: "-0.5px" };
const statsGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" };
const statCard = { background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)", padding: "24px", borderRadius: "16px", border: "1px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "all 0.3s ease", cursor: "pointer" };
const listRow = { background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)", padding: "20px", borderRadius: "18px", border: "1px solid #e5e7eb", display: "flex", gap: "20px", alignItems: "flex-start", flexWrap: "wrap", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "all 0.3s ease" };
const thumbWrap = { width: "100px", height: "100px", borderRadius: "14px", overflow: "hidden", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid #e5e7eb" };
const thumbImg = { width: "100%", height: "100%", objectFit: "cover" };
const primaryBtn = { background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", color: "#1f2937", border: "none", borderRadius: "12px", padding: "12px 20px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", fontSize: "14px", boxShadow: "0 4px 12px rgba(251, 191, 36, 0.3)", transition: "all 0.3s ease" };
const secondaryBtn = { background: "transparent", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "12px 20px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: "14px", transition: "all 0.3s ease" };
const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" };
const modal = { background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)", borderRadius: "20px", padding: "32px 28px", maxWidth: "420px", width: "100%", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" };
const modalClose = { position: "absolute", top: "16px", right: "16px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease" };
const textLink = { background: "none", border: "none", color: "#d97706", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", transition: "all 0.3s ease" };
const fieldWrap = { display: "block", marginBottom: "16px" };
const fieldLabel = { display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 700, color: "#374151" };
const fieldInput = { width: "100%", padding: "14px 16px", borderRadius: "10px", border: "1px solid #d1d5db", fontSize: "14px", fontFamily: "inherit", boxSizing: "border-box", transition: "all 0.3s ease" };
