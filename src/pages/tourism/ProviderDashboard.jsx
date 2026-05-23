import { useState } from "react";
import { useNavigate } from "react-router-dom";

const bookings = [
  { id: "BK001", guest: "Amina Kariuki", checkin: "2026-06-10", checkout: "2026-06-13", nights: 3, room: "Deluxe Ocean View", total: 55500, status: "confirmed", paid: true },
  { id: "BK002", guest: "David Mwangi", checkin: "2026-06-15", checkout: "2026-06-16", nights: 1, room: "Standard Room", total: 12500, status: "pending", paid: false },
  { id: "BK003", guest: "Sarah Wanjiku", checkin: "2026-06-20", checkout: "2026-06-25", nights: 5, room: "Family Suite", total: 140000, status: "confirmed", paid: true },
  { id: "BK004", guest: "Peter Otieno", checkin: "2026-07-01", checkout: "2026-07-03", nights: 2, room: "Standard Room", total: 25000, status: "confirmed", paid: false },
  { id: "BK005", guest: "Grace Achieng", checkin: "2026-07-08", checkout: "2026-07-10", nights: 2, room: "Deluxe Ocean View", total: 37000, status: "cancelled", paid: false },
];

const reviews = [
  { guest: "Amina K.", rating: 5, comment: "Absolutely stunning! Will return.", date: "May 2026", replied: false },
  { guest: "David M.", rating: 5, comment: "Best resort in Kenya. Magical sunset views.", date: "April 2026", replied: true },
  { guest: "Sarah W.", rating: 4, comment: "Excellent service. Spa was phenomenal.", date: "March 2026", replied: true },
];

const tabs = ["Overview", "Bookings", "Reviews", "Property Settings", "Analytics"];

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const totalRevenue = bookings.filter((b) => b.paid).reduce((sum, b) => sum + b.total, 0);
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const pending = bookings.filter((b) => b.status === "pending").length;
  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  const handleTabChange = (i) => {
    setTab(i);
    setSidebarOpen(false);
  };

  return (
    <div style={s.root}>
      <style>{css}</style>

      {/* MOBILE TOP BAR */}
      <div style={s.mobileTopBar} className="mobile-topbar">
        <button style={s.hamburger} onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">
          <span style={{ ...s.hamburgerLine, transform: sidebarOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
          <span style={{ ...s.hamburgerLine, opacity: sidebarOpen ? 0 : 1 }} />
          <span style={{ ...s.hamburgerLine, transform: sidebarOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
        </button>
        <div style={s.mobileLogoText}>🏨 Serena Beach Resort</div>
        <div style={s.statusDot}>🟢</div>
      </div>

      {/* OVERLAY */}
      {sidebarOpen && (
        <div style={s.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside style={{ ...s.sidebar, transform: sidebarOpen ? "translateX(0)" : undefined }} className="sidebar">
        <div style={s.sidebarLogo}>
          <div style={s.logoIcon}>🏨</div>
          <div>
            <div style={s.logoName}>Serena Beach Resort</div>
            <div style={s.logoSub}>Provider Dashboard</div>
          </div>
        </div>

        <nav style={s.nav}>
          {tabs.map((t, i) => (
            <button
              key={t}
              style={{ ...s.navItem, ...(tab === i ? s.navActive : {}) }}
              onClick={() => handleTabChange(i)}
            >
              {["📊", "📅", "⭐", "⚙️", "📈"][i]} {t}
            </button>
          ))}
        </nav>

        <div style={s.sidebarFooter}>
          <button style={s.viewListingBtn} onClick={() => navigate("/tourism/1")}>
            👁️ View Live Listing
          </button>
          <button style={s.logoutBtn} onClick={() => navigate("/tourism")}>
            ← Back to Tourism
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={s.main}>
        <div style={s.topBar}>
          <div>
            <h1 style={s.pageTitle}>{tabs[tab]}</h1>
            <p style={s.pageSub}>Mombasa, Coast · Listed since January 2026</p>
          </div>
          <div style={s.topBarRight}>
            <div style={s.statusBadge}>🟢 Active</div>
          </div>
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 0 && (
          <div>
            <div style={s.statsGrid}>
              {[
                { label: "Total Revenue", val: `KSh ${totalRevenue.toLocaleString()}`, icon: "💰", color: "#22c55e", sub: "Paid bookings" },
                { label: "Confirmed", val: confirmed, icon: "✅", color: "#3b82f6", sub: "This month" },
                { label: "Pending", val: pending, icon: "⏳", color: "#f59e0b", sub: "Needs action" },
                { label: "Avg Rating", val: `⭐ ${avgRating}`, icon: "🌟", color: "#a855f7", sub: `${reviews.length} reviews` },
              ].map((stat) => (
                <div key={stat.label} style={s.statCard}>
                  <div style={s.statIcon}>{stat.icon}</div>
                  <div style={{ ...s.statVal, color: stat.color }}>{stat.val}</div>
                  <div style={s.statLabel}>{stat.label}</div>
                  <div style={s.statSub}>{stat.sub}</div>
                </div>
              ))}
            </div>

            <div style={s.twoCol}>
              <div style={s.card}>
                <h2 style={s.cardTitle}>Upcoming Bookings</h2>
                {bookings.filter((b) => b.status === "confirmed").slice(0, 3).map((b) => (
                  <div key={b.id} style={s.miniBooking}>
                    <div style={s.miniBookingLeft}>
                      <div style={s.miniGuest}>{b.guest}</div>
                      <div style={s.miniDates}>📅 {b.checkin} → {b.checkout} · {b.nights}n</div>
                      <div style={s.miniRoom}>{b.room}</div>
                    </div>
                    <div style={s.miniTotal}>KSh {b.total.toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div style={s.card}>
                <h2 style={s.cardTitle}>Quick Actions</h2>
                <div style={s.quickActions}>
                  {[
                    { label: "Update Pricing", icon: "💵", action: () => setTab(3) },
                    { label: "View Bookings", icon: "📅", action: () => setTab(1) },
                    { label: "Reply to Reviews", icon: "⭐", action: () => setTab(2) },
                    { label: "Edit Property", icon: "✏️", action: () => setTab(3) },
                  ].map((a) => (
                    <button key={a.label} style={s.quickAction} onClick={a.action}>
                      <span style={s.quickIcon}>{a.icon}</span>
                      <span style={s.quickLabel}>{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── BOOKINGS ── */}
        {tab === 1 && (
          <div style={s.card}>
            <div style={s.tableHeader}>
              <h2 style={s.cardTitle}>All Bookings</h2>
              <div style={s.tableFilters}>
                {["All", "Confirmed", "Pending", "Cancelled"].map((f) => (
                  <button key={f} style={s.filterChip}>{f}</button>
                ))}
              </div>
            </div>
            {/* Mobile booking cards */}
            <div className="bookings-mobile">
              {bookings.map((b) => (
                <div key={b.id} style={s.bookingMobileCard}>
                  <div style={s.bookingMobileHeader}>
                    <span style={s.bookingId}>{b.id}</span>
                    <span style={{ ...s.statusBadgeTbl, background: { confirmed: "#dbeafe", pending: "#fef9c3", cancelled: "#fee2e2" }[b.status], color: { confirmed: "#1d4ed8", pending: "#92400e", cancelled: "#dc2626" }[b.status] }}>
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                  </div>
                  <div style={s.bookingMobileGuest}>{b.guest}</div>
                  <div style={s.bookingMobileRoom}>{b.room}</div>
                  <div style={s.bookingMobileDates}>📅 {b.checkin} → {b.checkout} · {b.nights} night{b.nights > 1 ? "s" : ""}</div>
                  <div style={s.bookingMobileFooter}>
                    <strong style={{ color: "#22c55e" }}>KSh {b.total.toLocaleString()}</strong>
                    <span style={{ ...s.payBadge, background: b.paid ? "#dcfce7" : "#fee2e2", color: b.paid ? "#16a34a" : "#dc2626" }}>
                      {b.paid ? "✅ Paid" : "⏳ Pending"}
                    </span>
                    {b.status === "pending" && (
                      <button style={s.acceptBtn}>Accept</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop table */}
            <div style={s.tableWrap} className="bookings-desktop">
              <table style={s.table}>
                <thead>
                  <tr style={s.thead}>
                    <th style={s.th}>Booking ID</th>
                    <th style={s.th}>Guest</th>
                    <th style={s.th}>Dates</th>
                    <th style={s.th}>Room</th>
                    <th style={s.th}>Total</th>
                    <th style={s.th}>Payment</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} style={s.tr} className="table-row">
                      <td style={s.td}><span style={s.bookingId}>{b.id}</span></td>
                      <td style={s.td}>{b.guest}</td>
                      <td style={s.td}><span style={{ fontSize: "12px", color: "#6b7280" }}>{b.checkin} → {b.checkout}<br/>{b.nights} night{b.nights > 1 ? "s" : ""}</span></td>
                      <td style={s.td}>{b.room}</td>
                      <td style={s.td}><strong>KSh {b.total.toLocaleString()}</strong></td>
                      <td style={s.td}>
                        <span style={{ ...s.payBadge, background: b.paid ? "#dcfce7" : "#fee2e2", color: b.paid ? "#16a34a" : "#dc2626" }}>
                          {b.paid ? "✅ Paid" : "⏳ Pending"}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{ ...s.statusBadgeTbl, background: { confirmed: "#dbeafe", pending: "#fef9c3", cancelled: "#fee2e2" }[b.status], color: { confirmed: "#1d4ed8", pending: "#92400e", cancelled: "#dc2626" }[b.status] }}>
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </span>
                      </td>
                      <td style={s.td}>
                        {b.status === "pending" && (
                          <button style={s.acceptBtn}>Accept</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── REVIEWS ── */}
        {tab === 2 && (
          <div style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "10px" }}>
              <h2 style={s.cardTitle}>Guest Reviews</h2>
              <div style={s.ratingOverall}>
                <span style={{ fontSize: "28px", fontWeight: 800, color: "#fbbf24" }}>{avgRating}</span>
                <span style={{ fontSize: "13px", color: "#6b7280", marginLeft: "8px" }}>{reviews.length} reviews</span>
              </div>
            </div>
            {reviews.map((r, i) => (
              <div key={r.guest} style={s.reviewCard}>
                <div style={s.reviewTop}>
                  <div style={s.reviewAvatar}>{r.guest[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={s.reviewName}>{r.guest}</div>
                    <div style={s.reviewMeta}>{"⭐".repeat(r.rating)} · {r.date}</div>
                  </div>
                  {r.replied && <span style={s.repliedBadge}>✓ Replied</span>}
                </div>
                <p style={s.reviewComment}>{r.comment}</p>
                {!r.replied && (
                  replyingTo === i ? (
                    <div style={s.replyBox}>
                      <textarea style={s.replyInput} placeholder="Write your response..." value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button style={s.sendReplyBtn} onClick={() => { setReplyingTo(null); setReplyText(""); }}>Send Reply</button>
                        <button style={s.cancelReplyBtn} onClick={() => setReplyingTo(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button style={s.replyBtn} onClick={() => setReplyingTo(i)}>Reply to this review</button>
                  )
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab === 3 && (
          <div style={s.card}>
            <h2 style={s.cardTitle}>Property Settings</h2>
            <div style={s.settingsGrid}>
              {[
                { label: "Property Name", val: "Serena Beach Resort", type: "text" },
                { label: "Category", val: "Beach Resort", type: "text" },
                { label: "County", val: "Mombasa", type: "text" },
                { label: "Base Price (KSh/night)", val: "12500", type: "number" },
                { label: "Weekend Price (KSh/night)", val: "18000", type: "number" },
                { label: "Check-in Time", val: "14:00", type: "time" },
                { label: "Check-out Time", val: "11:00", type: "time" },
                { label: "Manager Phone", val: "+254 700 123 456", type: "text" },
              ].map((f) => (
                <div key={f.label} style={s.settingField}>
                  <label style={s.settingLabel}>{f.label}</label>
                  <input style={s.settingInput} type={f.type} defaultValue={f.val} />
                </div>
              ))}
            </div>
            <div style={s.settingActions}>
              <button style={s.saveBtn}>💾 Save Changes</button>
              <div style={s.dangerZone}>
                <div style={s.dangerTitle}>Danger Zone</div>
                <button style={s.pauseBtn}>⏸️ Pause</button>
                <button style={s.deleteBtn}>🗑️ Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {tab === 4 && (
          <div>
            <div style={s.analyticsGrid}>
              {[
                { label: "Profile Views", val: "1,247", change: "+18%", color: "#3b82f6" },
                { label: "Booking Requests", val: "43", change: "+12%", color: "#22c55e" },
                { label: "Conversion Rate", val: "11.6%", change: "+2.1%", color: "#fbbf24" },
                { label: "Revenue (Month)", val: "KSh 233K", change: "+31%", color: "#a855f7" },
              ].map((a) => (
                <div key={a.label} style={s.analyticsCard}>
                  <div style={s.analyticsVal}>{a.val}</div>
                  <div style={s.analyticsLabel}>{a.label}</div>
                  <div style={{ ...s.analyticsChange, color: a.color }}>↑ {a.change} this month</div>
                </div>
              ))}
            </div>
            <div style={s.card}>
              <h2 style={s.cardTitle}>Monthly Booking Trend</h2>
              <div style={s.barChart}>
                {[
                  { month: "Jan", val: 3 }, { month: "Feb", val: 5 }, { month: "Mar", val: 4 },
                  { month: "Apr", val: 7 }, { month: "May", val: 6 }, { month: "Jun", val: 9 },
                ].map((d) => (
                  <div key={d.month} style={s.barCol}>
                    <div style={{ ...s.bar, height: `${d.val * 18}px` }} />
                    <div style={s.barLabel}>{d.month}</div>
                    <div style={s.barVal}>{d.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const s = {
  root: { fontFamily: "'DM Sans', sans-serif", display: "flex", minHeight: "100vh", background: "#f8f4f0" },

  // Mobile top bar
  mobileTopBar: { display: "none", position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, background: "#1f2937", padding: "12px 16px", alignItems: "center", justifyContent: "space-between", height: "56px" },
  hamburger: { background: "transparent", border: "none", cursor: "pointer", padding: "4px", display: "flex", flexDirection: "column", gap: "5px", width: "28px" },
  hamburgerLine: { display: "block", width: "22px", height: "2px", background: "white", borderRadius: "2px", transition: "all 0.3s ease", transformOrigin: "center" },
  mobileLogoText: { fontSize: "14px", fontWeight: 800, color: "white" },
  statusDot: { fontSize: "16px" },

  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 150 },

  sidebar: { width: "240px", background: "#1f2937", display: "flex", flexDirection: "column", padding: "24px 16px", flexShrink: 0, position: "relative", zIndex: 160 },
  sidebarLogo: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" },
  logoIcon: { fontSize: "28px" },
  logoName: { fontSize: "13px", fontWeight: 800, color: "white", lineHeight: 1.2 },
  logoSub: { fontSize: "11px", color: "#6b7280" },

  nav: { flex: 1, display: "flex", flexDirection: "column", gap: "4px" },
  navItem: { background: "transparent", border: "none", color: "#9ca3af", padding: "10px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.15s" },
  navActive: { background: "#fbbf2420", color: "#fbbf24" },

  sidebarFooter: { display: "flex", flexDirection: "column", gap: "8px", marginTop: "24px" },
  viewListingBtn: { background: "#fbbf24", color: "#1f2937", border: "none", borderRadius: "8px", padding: "10px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  logoutBtn: { background: "transparent", border: "1px solid #374151", color: "#9ca3af", borderRadius: "8px", padding: "10px", fontSize: "12px", cursor: "pointer", fontFamily: "inherit" },

  main: { flex: 1, padding: "28px", overflow: "auto" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "12px" },
  pageTitle: { fontSize: "22px", fontWeight: 800, color: "#1f2937", margin: "0 0 4px" },
  pageSub: { fontSize: "12px", color: "#6b7280" },
  topBarRight: { display: "flex", gap: "10px", alignItems: "center" },
  statusBadge: { background: "#dcfce7", color: "#16a34a", padding: "6px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 },

  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px", marginBottom: "20px" },
  statCard: { background: "white", borderRadius: "14px", padding: "16px", border: "1px solid #e5e7eb", textAlign: "center" },
  statIcon: { fontSize: "24px", marginBottom: "6px" },
  statVal: { fontSize: "20px", fontWeight: 800, marginBottom: "4px" },
  statLabel: { fontSize: "12px", color: "#1f2937", fontWeight: 600, marginBottom: "2px" },
  statSub: { fontSize: "11px", color: "#9ca3af" },

  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  card: { background: "white", borderRadius: "14px", padding: "20px", border: "1px solid #e5e7eb", marginBottom: "16px" },
  cardTitle: { fontSize: "15px", fontWeight: 800, color: "#1f2937", marginBottom: "16px" },

  miniBooking: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #f3f4f6" },
  miniBookingLeft: {},
  miniGuest: { fontSize: "13px", fontWeight: 700, color: "#1f2937" },
  miniDates: { fontSize: "11px", color: "#6b7280", margin: "2px 0" },
  miniRoom: { fontSize: "11px", color: "#9ca3af" },
  miniTotal: { fontSize: "13px", fontWeight: 800, color: "#22c55e", flexShrink: 0 },

  quickActions: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
  quickAction: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "12px 8px", cursor: "pointer", fontFamily: "inherit", textAlign: "center" },
  quickIcon: { display: "block", fontSize: "20px", marginBottom: "4px" },
  quickLabel: { fontSize: "11px", fontWeight: 700, color: "#4b5563" },

  tableHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "10px" },
  tableFilters: { display: "flex", flexWrap: "wrap", gap: "6px" },
  filterChip: { border: "1px solid #e5e7eb", background: "white", borderRadius: "20px", padding: "4px 10px", fontSize: "11px", cursor: "pointer", fontFamily: "inherit", color: "#6b7280" },

  // Mobile booking cards
  bookingMobileCard: { border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px", marginBottom: "10px" },
  bookingMobileHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" },
  bookingMobileGuest: { fontSize: "14px", fontWeight: 700, color: "#1f2937", marginBottom: "2px" },
  bookingMobileRoom: { fontSize: "12px", color: "#6b7280", marginBottom: "4px" },
  bookingMobileDates: { fontSize: "12px", color: "#9ca3af", marginBottom: "10px" },
  bookingMobileFooter: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },

  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "600px" },
  thead: { background: "#f9fafb" },
  th: { padding: "10px 12px", fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left", borderBottom: "1px solid #e5e7eb" },
  tr: { borderBottom: "1px solid #f3f4f6" },
  td: { padding: "12px", fontSize: "13px", color: "#1f2937", verticalAlign: "middle" },
  bookingId: { background: "#f3f4f6", borderRadius: "4px", padding: "2px 6px", fontSize: "11px", fontFamily: "monospace", color: "#6b7280" },
  payBadge: { padding: "3px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 },
  statusBadgeTbl: { padding: "3px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 },
  acceptBtn: { background: "#22c55e", color: "white", border: "none", borderRadius: "6px", padding: "5px 10px", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },

  ratingOverall: { display: "flex", alignItems: "center" },
  reviewCard: { border: "1px solid #f3f4f6", borderRadius: "12px", padding: "16px", marginBottom: "12px" },
  reviewTop: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" },
  reviewAvatar: { width: "34px", height: "34px", borderRadius: "50%", background: "#fbbf24", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "13px", flexShrink: 0 },
  reviewName: { fontSize: "13px", fontWeight: 700, color: "#1f2937" },
  reviewMeta: { fontSize: "12px", color: "#9ca3af" },
  repliedBadge: { background: "#dcfce7", color: "#16a34a", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px", flexShrink: 0 },
  reviewComment: { fontSize: "13px", color: "#4b5563", lineHeight: 1.65, margin: "0 0 10px" },
  replyBtn: { background: "transparent", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "7px 14px", fontSize: "12px", color: "#6b7280", cursor: "pointer", fontFamily: "inherit" },
  replyBox: { background: "#f9fafb", borderRadius: "10px", padding: "12px" },
  replyInput: { width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", fontFamily: "inherit", marginBottom: "10px", height: "80px", resize: "vertical", boxSizing: "border-box" },
  sendReplyBtn: { background: "#fbbf24", color: "#1f2937", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  cancelReplyBtn: { background: "transparent", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", color: "#6b7280", cursor: "pointer", fontFamily: "inherit" },

  settingsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" },
  settingField: { display: "flex", flexDirection: "column", gap: "6px" },
  settingLabel: { fontSize: "11px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" },
  settingInput: { border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", fontFamily: "inherit", outline: "none" },
  settingActions: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid #f3f4f6", flexWrap: "wrap", gap: "12px" },
  saveBtn: { background: "#fbbf24", color: "#1f2937", border: "none", borderRadius: "10px", padding: "10px 20px", fontWeight: 800, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" },
  dangerZone: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
  dangerTitle: { fontSize: "11px", color: "#dc2626", fontWeight: 700 },
  pauseBtn: { background: "#fef9c3", color: "#92400e", border: "1px solid #fde68a", borderRadius: "8px", padding: "7px 12px", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  deleteBtn: { background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "8px", padding: "7px 12px", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },

  analyticsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px", marginBottom: "16px" },
  analyticsCard: { background: "white", borderRadius: "14px", padding: "16px", border: "1px solid #e5e7eb" },
  analyticsVal: { fontSize: "20px", fontWeight: 800, color: "#1f2937", marginBottom: "4px" },
  analyticsLabel: { fontSize: "12px", color: "#6b7280", marginBottom: "4px" },
  analyticsChange: { fontSize: "11px", fontWeight: 700 },

  barChart: { display: "flex", alignItems: "flex-end", gap: "10px", height: "160px", padding: "16px 0 0" },
  barCol: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: "4px" },
  bar: { width: "100%", background: "linear-gradient(180deg, #fbbf24, #f59e0b)", borderRadius: "4px 4px 0 0", transition: "height 0.3s", minHeight: "4px" },
  barLabel: { fontSize: "11px", color: "#6b7280", fontWeight: 600 },
  barVal: { fontSize: "10px", color: "#9ca3af" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  .table-row:hover { background: #f9fafb; }
  input:focus, select:focus, textarea:focus { border-color: #fbbf24 !important; outline: none; }

  @media (max-width: 768px) {
    .mobile-topbar { display: flex !important; }
    .sidebar {
      position: fixed !important;
      top: 0; left: 0; bottom: 0;
      width: 260px !important;
      z-index: 160;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
    }
    .bookings-mobile { display: block !important; }
    .bookings-desktop { display: none !important; }
  }
  @media (min-width: 769px) {
    .mobile-topbar { display: none !important; }
    .sidebar { transform: translateX(0) !important; }
    .bookings-mobile { display: none !important; }
    .bookings-desktop { display: block !important; }
  }
  @media (max-width: 768px) {
    [style*="flex: 1"][style*="padding: 28px"] {
      padding: 16px !important;
      padding-top: 72px !important;
    }
    [style*="gridTemplateColumns: 1fr 1fr"] {
      grid-template-columns: 1fr !important;
    }
  }
  @media (max-width: 480px) {
    [style*="gridTemplateColumns: repeat(auto-fill, minmax(150px"] {
      grid-template-columns: 1fr 1fr !important;
    }
  }
`;