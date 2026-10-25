import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ProfileAvatar } from "../features/profile";
import { fetchUserProfile } from "../api/profile";
import { normalizeRole, getDashboardPath } from "../utils/dashboardRoutes";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

export default function ProfilePage() {
  const { token, user, updateUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState("");
  const [activityStats, setActivityStats] = useState({
    favoritesCount: 0,
    bookingsCount: 0,
    enquiriesCount: 0,
  });

  const activeRole = normalizeRole(profile?.role || user?.role || "member");
  const isProvider = ["landlord", "agent", "host", "seller", "mover", "business", "admin", "team"].includes(activeRole);

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({ ...prev, ...user }));
    }
  }, [user]);

  useEffect(() => {
    if (!token) {
      navigate("/user-login");
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        if (!user && !profile) setLoading(true);
        const [profileData, activitiesRes] = await Promise.allSettled([
          fetchUserProfile(token),
          fetch(`${API_BASE}/members/activities`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => (r.ok ? r.json() : null)),
        ]);

        if (!isMounted) return;

        if (profileData.status === "fulfilled" && profileData.value) {
          setProfile(profileData.value);
        }

        if (activitiesRes.status === "fulfilled" && activitiesRes.value) {
          const act = activitiesRes.value;
          const bookingsTotal = (act.bookings?.accommodations?.length || 0) + (act.bookings?.services?.length || 0);
          setActivityStats({
            favoritesCount: act.favorites?.length || act.stats?.favoritesCount || 0,
            bookingsCount: bookingsTotal || act.stats?.bookingsCount || 0,
            enquiriesCount: act.enquiries?.length || act.stats?.enquiriesCount || 0,
          });
        }
      } catch (err) {
        console.error("Profile load error:", err);
        if (isMounted) setError("Unable to load latest profile info");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [token, navigate]);

  const getRoleConfig = (role) => {
    const map = {
      member: { label: "Community Member", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.12)", border: "rgba(56, 189, 248, 0.3)" },
      user: { label: "Community Explorer", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.12)", border: "rgba(56, 189, 248, 0.3)" },
      landlord: { label: "Property Landlord", color: "#22c55e", bg: "rgba(34, 197, 94, 0.12)", border: "rgba(34, 197, 94, 0.3)" },
      agent: { label: "Certified Agent", color: "#a855f7", bg: "rgba(168, 85, 247, 0.12)", border: "rgba(168, 85, 247, 0.3)" },
      host: { label: "Accommodation Host", color: "#fbbf24", bg: "rgba(251, 191, 36, 0.12)", border: "rgba(251, 191, 36, 0.3)" },
      seller: { label: "QuickSales Seller", color: "#f97316", bg: "rgba(249, 115, 22, 0.12)", border: "rgba(249, 115, 22, 0.3)" },
      mover: { label: "Verified Mover", color: "#06b6d4", bg: "rgba(6, 182, 212, 0.12)", border: "rgba(6, 182, 212, 0.3)" },
      business: { label: "Business Directory", color: "#60a5fa", bg: "rgba(96, 165, 250, 0.12)", border: "rgba(96, 165, 250, 0.3)" },
      admin: { label: "Platform Administrator", color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)", border: "rgba(239, 68, 68, 0.3)" },
      team: { label: "Operations Team", color: "#ec4899", bg: "rgba(236, 72, 153, 0.12)", border: "rgba(236, 72, 153, 0.3)" },
    };
    return map[role] || map.member;
  };

  const roleConfig = getRoleConfig(activeRole);

  if (loading) {
    return (
      <div style={styles.container}>
        <style>{css}</style>
        <div style={styles.loadingWrap}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Loading your account profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{css}</style>

      {/* HEADER BAR */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back</span>
          </button>
          <div>
            <h1 style={styles.pageTitle}>Account Overview</h1>
            <p style={styles.pageSubtitle}>Manage your profile, saved spaces, security, and preferences</p>
          </div>
        </div>

        <div style={styles.headerRight}>
          <Link to="/settings" style={styles.editProfileBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            <span>Edit Profile</span>
          </Link>
          <button
            type="button"
            style={styles.logoutBtn}
            onClick={() => {
              if (logout) logout("/user-login");
              else window.location.href = "/user-login";
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div style={styles.errorAlert}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div style={styles.content}>
        {/* HERO PROFILE CARD */}
        <div style={styles.heroCard}>
          <div style={styles.heroGlow} />
          <div style={styles.heroTop}>
            <div style={styles.avatarWrap}>
              <ProfileAvatar user={profile} size={96} />
              <div style={styles.verifiedDot} title="Account Online & Active" />
            </div>

            <div style={styles.heroInfo}>
              <div style={styles.nameRow}>
                <h2 style={styles.userName}>{profile?.name || "Community Member"}</h2>
                <span
                  style={{
                    ...styles.roleBadge,
                    color: roleConfig.color,
                    background: roleConfig.bg,
                    borderColor: roleConfig.border,
                  }}
                >
                  {roleConfig.label}
                </span>
                {profile?.isEmailVerified ? (
                  <span style={styles.verifiedPill}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Verified Email
                  </span>
                ) : (
                  <span style={styles.unverifiedPill}>Unverified Email</span>
                )}
              </div>

              <p style={styles.userEmail}>{profile?.email}</p>

              <div style={styles.metaChips}>
                <div style={styles.metaChip}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <span>{profile?.phone || "Phone not added"}</span>
                </div>

                <div style={styles.metaChip}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{profile?.county ? `${profile.county}, Kenya` : "Kenya"}</span>
                </div>

                <div style={styles.metaChip}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>
                    Member since{" "}
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString("en-KE", {
                          year: "numeric",
                          month: "short",
                        })
                      : "Recently"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* METRICS & QUICK STATS */}
        <div style={styles.statsSection}>
          <h3 style={styles.sectionHeading}>Activity & Wallet</h3>
          <div style={styles.statsGrid}>
            <Link to="/saved" style={styles.statCard}>
              <div style={{ ...styles.statIconWrap, background: "rgba(239, 68, 68, 0.12)", color: "#f87171" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <div style={styles.statNumber}>{activityStats.favoritesCount}</div>
              <div style={styles.statLabel}>Saved Spaces</div>
              <div style={styles.statSub}>Bookmarked rentals & stays</div>
            </Link>

            <Link to="/my-bookings" style={styles.statCard}>
              <div style={{ ...styles.statIconWrap, background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div style={styles.statNumber}>{activityStats.bookingsCount}</div>
              <div style={styles.statLabel}>My Bookings</div>
              <div style={styles.statSub}>Stays & accommodation visits</div>
            </Link>

            <Link to="/member" style={styles.statCard}>
              <div style={{ ...styles.statIconWrap, background: "rgba(168, 85, 247, 0.12)", color: "#c084fc" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div style={styles.statNumber}>{activityStats.enquiriesCount}</div>
              <div style={styles.statLabel}>Space Enquiries</div>
              <div style={styles.statSub}>Inquiries with hosts & agents</div>
            </Link>

            <Link to="/wallet" style={styles.statCard}>
              <div style={{ ...styles.statIconWrap, background: "rgba(251, 191, 36, 0.12)", color: "#fbbf24" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
              </div>
              <div style={styles.statNumber}>
                KES {(profile?.walletBalance || 0).toLocaleString()}
              </div>
              <div style={styles.statLabel}>AxxWallet Balance</div>
              <div style={styles.statSub}>Secured funds & refunds</div>
            </Link>
          </div>
        </div>

        {/* QUICK ACTIONS GRID */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div>
              <h3 style={styles.sectionTitle}>Account Quick Actions</h3>
              <p style={styles.sectionSubtitle}>Everything you need to navigate your Axxspace account</p>
            </div>
          </div>

          <div style={styles.actionsGrid}>
            {/* For regular members/users */}
            {!isProvider && (
              <>
                <Link to="/member" style={styles.actionCard}>
                  <div style={{ ...styles.actionIcon, color: "#38bdf8", background: "rgba(56, 189, 248, 0.1)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </div>
                  <div>
                    <div style={styles.actionTitle}>My Activities Hub</div>
                    <div style={styles.actionDesc}>Overview of your requests, timeline & waitlists</div>
                  </div>
                </Link>

                <Link to="/saved" style={styles.actionCard}>
                  <div style={{ ...styles.actionIcon, color: "#f87171", background: "rgba(239, 68, 68, 0.1)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <div style={styles.actionTitle}>Saved Spaces</div>
                    <div style={styles.actionDesc}>View your bookmarked rentals & properties</div>
                  </div>
                </Link>

                <Link to="/my-bookings" style={styles.actionCard}>
                  <div style={{ ...styles.actionIcon, color: "#34d399", background: "rgba(16, 185, 129, 0.1)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                  <div>
                    <div style={styles.actionTitle}>Stays & Bookings</div>
                    <div style={styles.actionDesc}>Track your accommodation bookings & check-ins</div>
                  </div>
                </Link>
              </>
            )}

            {/* Provider workspace links (Only for landlords, agents, hosts) */}
            {isProvider && (
              <>
                <Link to={getDashboardPath(activeRole)} style={styles.actionCard}>
                  <div style={{ ...styles.actionIcon, color: "#fbbf24", background: "rgba(251, 191, 36, 0.1)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                  </div>
                  <div>
                    <div style={styles.actionTitle}>Provider Dashboard</div>
                    <div style={styles.actionDesc}>Manage listings, inquiries & tenant analytics</div>
                  </div>
                </Link>

                {["landlord", "agent"].includes(activeRole) && (
                  <Link to="/upload" style={styles.actionCard}>
                    <div style={{ ...styles.actionIcon, color: "#34d399", background: "rgba(16, 185, 129, 0.1)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </div>
                    <div>
                      <div style={styles.actionTitle}>Upload Property</div>
                      <div style={styles.actionDesc}>Publish a new house, bedsitter, or commercial space</div>
                    </div>
                  </Link>
                )}

                {activeRole === "host" && (
                  <Link to="/accommodation/register-property" style={styles.actionCard}>
                    <div style={{ ...styles.actionIcon, color: "#fbbf24", background: "rgba(251, 191, 36, 0.1)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </div>
                    <div>
                      <div style={styles.actionTitle}>Add Accommodation</div>
                      <div style={styles.actionDesc}>List a resort, hotel, villa, or Airbnb stay</div>
                    </div>
                  </Link>
                )}
              </>
            )}

            {/* Common links for all users */}
            <Link to="/notifications" style={styles.actionCard}>
              <div style={{ ...styles.actionIcon, color: "#facc15", background: "rgba(250, 204, 21, 0.1)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <div>
                <div style={styles.actionTitle}>Notifications</div>
                <div style={styles.actionDesc}>Alerts, booking updates & system messages</div>
              </div>
            </Link>

            <Link to="/settings" style={styles.actionCard}>
              <div style={{ ...styles.actionIcon, color: "#94a3b8", background: "rgba(148, 163, 184, 0.1)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </div>
              <div>
                <div style={styles.actionTitle}>Account Settings</div>
                <div style={styles.actionDesc}>Manage security, contact info & preferences</div>
              </div>
            </Link>

            <Link to="/wallet" style={styles.actionCard}>
              <div style={{ ...styles.actionIcon, color: "#38bdf8", background: "rgba(56, 189, 248, 0.1)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
              </div>
              <div>
                <div style={styles.actionTitle}>AxxWallet</div>
                <div style={styles.actionDesc}>Deposit, withdraw & view your payment logs</div>
              </div>
            </Link>

            <Link to="/listings" style={styles.actionCard}>
              <div style={{ ...styles.actionIcon, color: "#34d399", background: "rgba(16, 185, 129, 0.1)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <div>
                <div style={styles.actionTitle}>Browse Verified Rentals</div>
                <div style={styles.actionDesc}>Explore bedsitters, apartments & student housing</div>
              </div>
            </Link>

            <Link to="/accommodation" style={styles.actionCard}>
              <div style={{ ...styles.actionIcon, color: "#fbbf24", background: "rgba(251, 191, 36, 0.1)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div>
                <div style={styles.actionTitle}>Book Accommodations</div>
                <div style={styles.actionDesc}>Find verified vacation rentals, lodges & hotels</div>
              </div>
            </Link>
          </div>
        </div>

        {/* TASTEFUL PARTNER / HOST UPGRADE BANNER (Only for regular members) */}
        {!isProvider && (
          <div style={styles.partnerBanner}>
            <div style={styles.partnerLeft}>
              <div style={styles.partnerBadge}>PARTNER OPPORTUNITY</div>
              <h3 style={styles.partnerTitle}>Do you own a property or accommodation?</h3>
              <p style={styles.partnerText}>
                List your rental homes, student hostels, Airbnbs, or vacation villas on Axxspace and reach thousands of verified clients across Kenya.
              </p>
            </div>
            <div style={styles.partnerActions}>
              <Link to="/accommodation/register" style={styles.hostBtn}>
                <span>Register as Host</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "6px" }}>
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <Link to="/register" style={styles.landlordBtn}>
                <span>Landlord Portal</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "6px" }}>
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        {/* VERIFICATION & TRUST SECTION */}
        <div style={styles.trustSection}>
          <div style={styles.trustHeader}>
            <div style={styles.trustIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <div>
              <h3 style={styles.trustTitle}>Trust & Verification Status</h3>
              <p style={styles.trustSubtitle}>Verified accounts enjoy higher priority responses and trust badges</p>
            </div>
          </div>

          <div style={styles.trustGrid}>
            <div style={styles.trustItem}>
              <div style={styles.trustItemHeader}>
                <span style={styles.trustLabel}>Email Verification</span>
                <span style={profile?.isEmailVerified ? styles.pillSuccess : styles.pillWarn}>
                  {profile?.isEmailVerified ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <span>Verified</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  ) : "Pending"}
                </span>
              </div>
              <div style={styles.trustItemVal}>{profile?.email}</div>
            </div>

            <div style={styles.trustItem}>
              <div style={styles.trustItemHeader}>
                <span style={styles.trustLabel}>Phone Verification</span>
                <span style={profile?.phone ? styles.pillSuccess : styles.pillWarn}>
                  {profile?.phone ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <span>Connected</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  ) : "Not Provided"}
                </span>
              </div>
              <div style={styles.trustItemVal}>{profile?.phone || "Add in settings"}</div>
            </div>

            <div style={styles.trustItem}>
              <div style={styles.trustItemHeader}>
                <span style={styles.trustLabel}>Account Standing</span>
                <span style={styles.pillSuccess}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <span>Good Standing</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                </span>
              </div>
              <div style={styles.trustItemVal}>Zero policy flags &bull; 100% Secure</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#080d1a",
    color: "#f8fafc",
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    padding: "36px 16px 80px",
  },
  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "65vh",
  },
  spinner: {
    width: "44px",
    height: "44px",
    border: "3px solid rgba(251, 191, 36, 0.15)",
    borderTop: "3px solid #fbbf24",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    color: "#94a3b8",
    marginTop: "16px",
    fontSize: "14px",
    fontWeight: 600,
  },
  header: {
    maxWidth: "1080px",
    margin: "0 auto 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
    background: "rgba(255, 255, 255, 0.05)",
    color: "#f1f5f9",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 700,
    transition: "all 0.2s",
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#ffffff",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  pageSubtitle: {
    color: "#94a3b8",
    fontSize: "13.5px",
    margin: "3px 0 0",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  editProfileBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#0f172a",
    border: "none",
    borderRadius: "10px",
    fontWeight: 800,
    fontSize: "13px",
    textDecoration: "none",
    boxShadow: "0 4px 14px rgba(251, 191, 36, 0.2)",
    transition: "all 0.2s",
  },
  logoutBtn: {
    padding: "10px 16px",
    background: "rgba(255, 255, 255, 0.05)",
    color: "#f87171",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  errorAlert: {
    maxWidth: "1080px",
    margin: "0 auto 20px",
    padding: "12px 18px",
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "10px",
    color: "#fca5a5",
    fontSize: "13.5px",
  },
  content: {
    maxWidth: "1080px",
    margin: "0 auto",
  },
  heroCard: {
    position: "relative",
    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.95) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "20px",
    padding: "32px",
    marginBottom: "28px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.35)",
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute",
    top: "-50px",
    right: "-50px",
    width: "200px",
    height: "200px",
    background: "radial-gradient(circle, rgba(251, 191, 36, 0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  heroTop: {
    display: "flex",
    alignItems: "center",
    gap: "28px",
    flexWrap: "wrap",
  },
  avatarWrap: {
    position: "relative",
    flexShrink: 0,
  },
  verifiedDot: {
    position: "absolute",
    bottom: "4px",
    right: "4px",
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    background: "#22c55e",
    border: "2px solid #0f172a",
  },
  heroInfo: {
    flex: 1,
    minWidth: "260px",
  },
  nameRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "6px",
  },
  userName: {
    fontSize: "26px",
    fontWeight: 800,
    color: "#ffffff",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  roleBadge: {
    fontSize: "11px",
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: "999px",
    border: "1px solid",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  verifiedPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    fontWeight: 700,
    padding: "3px 9px",
    borderRadius: "999px",
    background: "rgba(34, 197, 94, 0.15)",
    color: "#4ade80",
    border: "1px solid rgba(34, 197, 94, 0.3)",
  },
  unverifiedPill: {
    fontSize: "11px",
    fontWeight: 700,
    padding: "3px 9px",
    borderRadius: "999px",
    background: "rgba(239, 68, 68, 0.15)",
    color: "#f87171",
    border: "1px solid rgba(239, 68, 68, 0.3)",
  },
  userEmail: {
    color: "#94a3b8",
    fontSize: "14px",
    margin: "0 0 16px 0",
  },
  metaChips: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  metaChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "8px",
    fontSize: "12.5px",
    color: "#cbd5e1",
    fontWeight: 500,
  },
  statsSection: {
    marginBottom: "28px",
  },
  sectionHeading: {
    fontSize: "16px",
    fontWeight: 800,
    color: "#ffffff",
    margin: "0 0 14px",
    letterSpacing: "-0.2px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  statCard: {
    background: "rgba(15, 23, 42, 0.65)",
    border: "1px solid rgba(255, 255, 255, 0.07)",
    borderRadius: "16px",
    padding: "20px",
    textDecoration: "none",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
  },
  statIconWrap: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "14px",
  },
  statNumber: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#ffffff",
    marginBottom: "2px",
  },
  statLabel: {
    fontSize: "13.5px",
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: "2px",
  },
  statSub: {
    fontSize: "11.5px",
    color: "#64748b",
  },
  sectionCard: {
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    borderRadius: "18px",
    padding: "26px",
    marginBottom: "28px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#ffffff",
    margin: "0 0 4px",
  },
  sectionSubtitle: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: 0,
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "14px",
  },
  actionCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "16px",
    background: "rgba(30, 41, 59, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.07)",
    borderRadius: "12px",
    textDecoration: "none",
    transition: "transform 0.2s, background 0.2s, border-color 0.2s",
  },
  actionIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  actionTitle: {
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 700,
    marginBottom: "2px",
  },
  actionDesc: {
    color: "#94a3b8",
    fontSize: "12px",
    lineHeight: "1.4",
  },
  partnerBanner: {
    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)",
    border: "1px solid rgba(251, 191, 36, 0.25)",
    borderRadius: "18px",
    padding: "26px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "28px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
  },
  partnerLeft: {
    flex: 1,
    minWidth: "280px",
  },
  partnerBadge: {
    fontSize: "10.5px",
    fontWeight: 800,
    color: "#fbbf24",
    letterSpacing: "0.8px",
    marginBottom: "6px",
  },
  partnerTitle: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#ffffff",
    margin: "0 0 6px",
  },
  partnerText: {
    fontSize: "13px",
    color: "#cbd5e1",
    margin: 0,
    lineHeight: "1.5",
    maxWidth: "580px",
  },
  partnerActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  hostBtn: {
    padding: "10px 18px",
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#0f172a",
    border: "none",
    borderRadius: "10px",
    fontWeight: 800,
    fontSize: "13px",
    textDecoration: "none",
    boxShadow: "0 4px 12px rgba(251, 191, 36, 0.25)",
    transition: "all 0.2s",
  },
  landlordBtn: {
    padding: "10px 16px",
    background: "rgba(255, 255, 255, 0.06)",
    color: "#f8fafc",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "13px",
    textDecoration: "none",
    transition: "all 0.2s",
  },
  trustSection: {
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    borderRadius: "18px",
    padding: "26px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
  },
  trustHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "20px",
  },
  trustIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "rgba(34, 197, 94, 0.15)",
    color: "#4ade80",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  trustTitle: {
    fontSize: "16px",
    fontWeight: 800,
    color: "#ffffff",
    margin: "0 0 2px",
  },
  trustSubtitle: {
    fontSize: "12.5px",
    color: "#94a3b8",
    margin: 0,
  },
  trustGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "14px",
  },
  trustItem: {
    background: "rgba(30, 41, 59, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    borderRadius: "12px",
    padding: "16px",
  },
  trustItemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
  },
  trustLabel: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#94a3b8",
  },
  trustItemVal: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#f8fafc",
  },
  pillSuccess: {
    fontSize: "11px",
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: "999px",
    background: "rgba(34, 197, 94, 0.15)",
    color: "#4ade80",
    border: "1px solid rgba(34, 197, 94, 0.3)",
  },
  pillWarn: {
    fontSize: "11px",
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: "999px",
    background: "rgba(251, 191, 36, 0.15)",
    color: "#fbbf24",
    border: "1px solid rgba(251, 191, 36, 0.3)",
  },
};

const css = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .stat-card:hover {
    transform: translateY(-2px);
    border-color: rgba(251, 191, 36, 0.3);
  }
  .action-card:hover {
    transform: translateY(-2px);
    background: rgba(30, 41, 59, 0.8) !important;
    border-color: rgba(255, 255, 255, 0.15) !important;
  }
`;
