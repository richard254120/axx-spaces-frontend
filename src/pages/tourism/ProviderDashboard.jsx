import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { tourismLogin, updateOwnerProfile } from "../../api/tourism";
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

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");

  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginErr, setLoginErr] = useState("");

  const loggedIn = Boolean(token || getTourismToken());
  const user = profile?.user;
  const stats = profile?.stats;
  const listings = profile?.listings || [];

  const openEditProfile = () => {
    if (!user) return;
    setProfileForm({ name: user.name || "", phone: user.phone || "" });
    setEditingProfile(true);
    setProfileMsg("");
    setProfileErr("");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const t = token || getTourismToken();
    if (!t) return;
    setProfileSaving(true);
    setProfileErr("");
    setProfileMsg("");
    try {
      const res = await updateOwnerProfile(t, profileForm);
      const updated = res.data?.user;
      if (updated) {
        setTourismSession(t, updated);
        authLogin(t, {
          _id: updated.id || updated._id,
          name: updated.name,
          email: updated.email,
          phone: updated.phone,
          role: updated.role || "landlord",
        });
      }
      setProfileMsg(res.message || "Profile updated");
      setEditingProfile(false);
      reload();
    } catch (err) {
      setProfileErr(err.message);
    } finally {
      setProfileSaving(false);
    }
  };

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
  const initial = (displayName || "O").charAt(0).toUpperCase();

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
                  <span style={avatar}>{initial}</span>
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
            <span style={avatarLg}>{initial}</span>
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
            <button type="button" style={logoutLink} onClick={handleLogout}>
              <span aria-hidden>🚪</span> Log out
            </button>
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
            <section style={profileCard}>
              <div style={profileCardHead}>
                <h2 style={sectionHead}>Your profile</h2>
                {!editingProfile && (
                  <button type="button" style={editProfileBtn} onClick={openEditProfile}>
                    ✏️ Update profile
                  </button>
                )}
              </div>

              {profileMsg && (
                <div style={successBanner}>{profileMsg}</div>
              )}
              {profileErr && <div style={{ marginBottom: "12px" }}><ErrorAlert message={profileErr} /></div>}

              {editingProfile ? (
                <form onSubmit={handleSaveProfile}>
                  <div style={formGrid}>
                    <label style={fieldWrap}>
                      <span style={fieldLabel}>Full name *</span>
                      <input
                        style={fieldInput}
                        value={profileForm.name}
                        onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                        required
                      />
                    </label>
                    <label style={fieldWrap}>
                      <span style={fieldLabel}>Phone / WhatsApp *</span>
                      <input
                        style={fieldInput}
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="+254 7XX XXX XXX"
                        required
                      />
                    </label>
                    <label style={fieldWrap}>
                      <span style={fieldLabel}>Email</span>
                      <input style={{ ...fieldInput, background: "#f9fafb", color: "#6b7280" }} value={user.email} disabled />
                      <span style={fieldHint}>Email cannot be changed here. Contact support if needed.</span>
                    </label>
                  </div>
                  <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
                    <button type="submit" style={primaryBtn} disabled={profileSaving}>
                      {profileSaving ? "Saving…" : "Save profile"}
                    </button>
                    <button type="button" style={secondaryBtn} onClick={() => setEditingProfile(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div style={profileGrid}>
                  <div><span style={label}>Name</span><div style={value}>{user.name}</div></div>
                  <div><span style={label}>Email</span><div style={value}>{user.email}</div></div>
                  <div><span style={label}>Phone</span><div style={value}>{user.phone || "—"}</div></div>
                  <div>
                    <span style={label}>Member since</span>
                    <div style={value}>
                      {user.memberSince ? new Date(user.memberSince).toLocaleDateString("en-KE", { month: "long", year: "numeric" }) : "—"}
                    </div>
                  </div>
                </div>
              )}
            </section>

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

const sidebar = { width: "260px", background: "#1f2937", color: "white", padding: "20px 16px", flexShrink: 0, display: "flex", flexDirection: "column", minHeight: "100vh" };
const sidebarTop = { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "8px" };
const logoBtn = { background: "none", border: "none", color: "white", fontSize: "17px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", textAlign: "left", flex: 1 };
const authRow = { display: "flex", gap: "6px", flexShrink: 0 };
const iconBtn = { background: "#374151", border: "none", borderRadius: "10px", width: "40px", height: "40px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" };
const avatar = { width: "28px", height: "28px", borderRadius: "50%", background: "#fbbf24", color: "#1f2937", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "14px" };
const avatarLg = { width: "40px", height: "40px", borderRadius: "50%", background: "#fbbf24", color: "#1f2937", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "16px", flexShrink: 0 };
const sidebarUser = { display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "#374151", borderRadius: "12px", marginBottom: "8px" };
const navItem = { padding: "12px 14px", borderRadius: "10px", background: "transparent", border: "none", color: "#9ca3af", textAlign: "left", cursor: "pointer", fontFamily: "inherit", fontSize: "14px" };
const sidebarFooter = { marginTop: "auto", paddingTop: "20px" };
const logoutLink = { width: "100%", padding: "12px 14px", borderRadius: "10px", background: "transparent", border: "1px solid #4b5563", color: "#fca5a5", textAlign: "left", cursor: "pointer", fontFamily: "inherit", fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" };
const loginLink = { width: "100%", padding: "12px 14px", borderRadius: "10px", background: "#fbbf24", border: "none", color: "#1f2937", textAlign: "left", cursor: "pointer", fontFamily: "inherit", fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" };
const mainHeader = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "24px", flexWrap: "wrap" };
const headerLogout = { background: "white", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 16px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: "13px" };
const profileCard = { background: "white", padding: "22px", borderRadius: "14px", border: "1px solid #e5e7eb", marginBottom: "20px" };
const profileCardHead = { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "14px" };
const sectionHead = { fontSize: "16px", fontWeight: 800, margin: 0, color: "#1f2937" };
const editProfileBtn = { background: "#fef9c3", border: "1px solid #fbbf24", color: "#92400e", borderRadius: "10px", padding: "8px 14px", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" };
const successBanner = { background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "14px" };
const profileGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" };
const formGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" };
const label = { fontSize: "10px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" };
const value = { fontSize: "15px", fontWeight: 600, color: "#1f2937", marginTop: "4px" };
const fieldWrap = { display: "flex", flexDirection: "column" };
const fieldLabel = { fontSize: "11px", fontWeight: 700, color: "#374151", marginBottom: "6px", textTransform: "uppercase" };
const fieldInput = { border: "1px solid #e5e7eb", borderRadius: "10px", padding: "12px", fontSize: "14px", fontFamily: "inherit" };
const fieldHint = { fontSize: "11px", color: "#9ca3af", marginTop: "4px" };
const statsGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" };
const statCard = { background: "white", padding: "18px", borderRadius: "14px", border: "1px solid #e5e7eb" };
const listRow = { background: "white", padding: "16px", borderRadius: "14px", border: "1px solid #e5e7eb", display: "flex", gap: "16px", alignItems: "flex-start", flexWrap: "wrap" };
const thumbWrap = { width: "88px", height: "88px", borderRadius: "12px", overflow: "hidden", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const thumbImg = { width: "100%", height: "100%", objectFit: "cover" };
const primaryBtn = { background: "#fbbf24", color: "#1f2937", border: "none", borderRadius: "10px", padding: "10px 16px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", fontSize: "13px" };
const secondaryBtn = { background: "transparent", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 16px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: "13px" };
const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" };
const modal = { background: "white", borderRadius: "16px", padding: "28px 24px", maxWidth: "400px", width: "100%", position: "relative" };
const modalClose = { position: "absolute", top: "12px", right: "12px", background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#6b7280" };
const textLink = { background: "none", border: "none", color: "#d97706", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" };
