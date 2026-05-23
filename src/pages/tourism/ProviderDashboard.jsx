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

  const totalRevenue = bookings.filter((b) => b.paid).reduce((sum, b) => sum + b.total, 0);
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const pending = bookings.filter((b) => b.status === "pending").length;
  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div style={s.root}>
      <style>{css}</style>

      {/* SIDEBAR */}
      <aside style={s.sidebar}>
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
              onClick={() => setTab(i)}
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
            <div style={s.statusBadge}>🟢 Listing Active</div>
          </div>
        </div>

        {/* OVERVIEW */}
        {tab === 0 && (
          <div>
            <div style={s.statsGrid}>
              {[
                { label: "Total Revenue", val: `KSh ${totalRevenue.toLocaleString()}`, icon: "💰", color: "#22c55e", sub: "Paid bookings" },
                { label: "Confirmed Bookings", val: confirmed, icon: "✅", color: "#3b82f6", sub: "This month" },
                { label: "Pending Approval", val: pending, icon: "⏳", color: "#f59e0b", sub: "Needs action" },
                { label: "Average Rating", val: `⭐ ${avgRating}`, icon: "🌟", color: "#a855f7", sub: `${reviews.length} reviews` },
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
                      <div style={s.miniDates}>📅 {b.checkin} → {b.checkout} · {b.nights} nights</div>
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
                    { label: "Edit Property Info", icon: "✏️", action: () => setTab(3) },
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

        {/* BOOKINGS */}
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
            <div style={s.tableWrap}>
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
                        {b.status === "pending" && <button style={s.acceptBtn}>Accept</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {tab === 2 && (
          <div style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={s.cardTitle}>Guest Reviews</h2>
              <div style={s.ratingOverall}>
                <span style={{ fontSize: "32px", fontWeight: 800, color: "#fbbf24" }}>{avgRating}</span>
                <span style={{ fontSize: "14px", color: "#6b7280", marginLeft: "8px" }}>avg · {reviews.length} reviews</span>
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

        {/* SETTINGS */}
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
                <button style={s.pauseBtn}>⏸️ Pause Listing</button>
                <button style={s.deleteBtn}>🗑️ Delete Listing</button>
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {tab === 4 && (
          <div>
            <div style={s.analyticsGrid}>
              {[
                { label: "Profile Views", val: "1,247", change: "+18%", color: "#3b82f6" },
                { label: "Booking Requests", val: "43", change: "+12%", color: "#22c55e" },
                { label: "Conversion Rate", val: "11.6%", change: "+2.1%", color: "#fbbf24" },
                { label: "Revenue (Month)", val: "KSh 233,000", change: "+31%", color: "#a855f7" },
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
                    <div style={{ ...s.bar, height: `${d.val * 20}px` }} />
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
  root: { fontFamily: "'DM Sans', sans-serif", display: "flex", minHeight: "100vh", background: "#f8f4f0", flexDirection: "column" },

  sidebar: { width: "100%", background: "#1f2937", display: "flex", flexDirection: "column", padding: "20px 16px", flexShrink: 0 },
  sidebarLogo: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" },
  logoIcon: { fontSize: "28px" },
  logoName: { fontSize: "13px", fontWeight: 800, color: "white", lineHeight: 1.2 },
  logoSub: { fontSize: "11px", color: "#6b7280" },

  nav: { flex: 1, display: "flex", flexDirection: "column", gap: "4px" },
  navItem: { background: "transparent", border: "none", color: "#9ca3af", padding: "12px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", textAlign: "left" },
  navActive: { background: "#fbbf2420", color: "#fbbf24" },

  sidebarFooter: { display: "flex", flexDirection: "column", gap: "8px", marginTop: "24px" },
  viewListingBtn: { background: "#fbbf24", color: "#1f2937", border: "none", borderRadius: "8px", padding: "12px", fontSize: "13px", fontWeight: 700, cursor: "pointer" },
  logoutBtn: { background: "transparent", border: "1px solid #374151", color: "#9ca3af", borderRadius: "8px", padding: "12px", fontSize: "13px", cursor: "pointer" },

  main: { flex: 1, padding: "20px", overflow: "auto" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "12px" },
  pageTitle: { fontSize: "24px", fontWeight: 800, color: "#1f2937", margin: "0 0 4px" },
  pageSub: { fontSize: "13px", color: "#6b7280" },
  topBarRight: { display: "flex", gap: "10px", alignItems: "center" },
  statusBadge: { background: "#dcfce7", color: "#16a34a", padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 },

  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "24px" },
  statCard: { background: "white", borderRadius: "14px", padding: "20px", border: "1px solid #e5e7eb", textAlign: "center" },
  statIcon: { fontSize: "28px", marginBottom: "8px" },
  statVal: { fontSize: "24px", fontWeight: 800, marginBottom: "4px" },
  statLabel: { fontSize: "13px", color: "#1f2937", fontWeight: 600, marginBottom: "2px" },
  statSub: { fontSize: "11px", color: "#9ca3af" },

  twoCol: { display: "grid", gridTemplateColumns: "1fr", gap: "20px" },
  card: { background: "white", borderRadius: "14px", padding: "24px", border: "1px solid #e5e7eb", marginBottom: "20px" },
  cardTitle: { fontSize: "16px", fontWeight: 800, color: "#1f2937", marginBottom: "18px" },

  miniBooking: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 0", borderBottom: "1px solid #f3f4f6" },
  miniBookingLeft: {},
  miniGuest: { fontSize: "14px", fontWeight: 700, color: "#1f2937" },
  miniDates: { fontSize: "12px", color: "#6b7280", margin: "2px 0" },
  miniRoom: { fontSize: "12px", color: "#9ca3af" },
  miniTotal: { fontSize: "14px", fontWeight: 800, color: "#22c55e" },

  quickActions: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  quickAction: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "16px 12px", cursor: "pointer", fontFamily: "inherit" },
  quickIcon: { display: "block", fontSize: "24px", marginBottom: "6px" },
  quickLabel: { fontSize: "12px", fontWeight: 700, color: "#4b5563" },

  tableHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" },
  tableFilters: { display: "flex", gap: "6px", flexWrap: "wrap" },
  filterChip: { border: "1px solid #e5e7eb", background: "white", borderRadius: "20px", padding: "5px 12px", fontSize: "12px", cursor: "pointer" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f9fafb" },
  th: { padding: "10px 12px", fontSize: "11px", fontWeight: 700, color: "#6b7280", textAlign: "left" },
  tr: { borderBottom: "1px solid #f3f4f6" },
  td: { padding: "12px", fontSize: "13px", color: "#1f2937" },
  bookingId: { background: "#f3f4f6", borderRadius: "4px", padding: "2px 6px", fontSize: "11px", fontFamily: "monospace" },
  payBadge: { padding: "3px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 },
  statusBadgeTbl: { padding: "3px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 },
  acceptBtn: { background: "#22c55e", color: "white", border: "none", borderRadius: "6px", padding: "5px 10px", fontSize: "11px", fontWeight: 700, cursor: "pointer" },

  ratingOverall: { display: "flex", alignItems: "center" },
  reviewCard: { border: "1px solid #f3f4f6", borderRadius: "12px", padding: "18px", marginBottom: "14px" },
  reviewTop: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" },
  reviewAvatar: { width: "36px", height: "36px", borderRadius: "50%", background: "#fbbf24", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "14px" },
  reviewName: { fontSize: "14px", fontWeight: 700, color: "#1f2937" },
  reviewMeta: { fontSize: "12px", color: "#9ca3af" },
  repliedBadge: { background: "#dcfce7", color: "#16a34a", fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px" },
  reviewComment: { fontSize: "13px", color: "#4b5563", lineHeight: 1.65, margin: "0 0 12px" },
  replyBtn: { background: "transparent", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "7px 14px", fontSize: "12px", color: "#6b7280", cursor: "pointer" },
  replyBox: { background: "#f9fafb", borderRadius: "10px", padding: "14px" },
  replyInput: { width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", marginBottom: "10px", height: "80px", resize: "vertical" },
  sendReplyBtn: { background: "#fbbf24", color: "#1f2937", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: 700, cursor: "pointer" },
  cancelReplyBtn: { background: "transparent", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", color: "#6b7280", cursor: "pointer" },

  settingsGrid: { display: "grid", gridTemplateColumns: "1fr", gap: "16px", marginBottom: "24px" },
  settingField: { display: "flex", flexDirection: "column", gap: "6px" },
  settingLabel: { fontSize: "11px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" },
  settingInput: { border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 12px", fontSize: "14px", outline: "none" },
  settingActions: { display: "flex", flexDirection: "column", gap: "12px", paddingTop: "20px", borderTop: "1px solid #f3f4f6" },
  saveBtn: { background: "#fbbf24", color: "#1f2937", border: "none", borderRadius: "10px", padding: "12px 24px", fontWeight: 800, fontSize: "14px", cursor: "pointer" },
  dangerZone: { display: "flex", flexDirection: "column", gap: "8px" },
  dangerTitle: { fontSize: "12px", color: "#dc2626", fontWeight: 700 },
  pauseBtn: { background: "#fef9c3", color: "#92400e", border: "1px solid #fde68a", borderRadius: "8px", padding: "8px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer" },
  deleteBtn: { background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "8px", padding: "8px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer" },

  analyticsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "20px" },
  analyticsCard: { background: "white", borderRadius: "14px", padding: "20px", border: "1px solid #e5e7eb" },
  analyticsVal: { fontSize: "22px", fontWeight: 800, color: "#1f2937", marginBottom: "4px" },
  analyticsLabel: { fontSize: "13px", color: "#6b7280", marginBottom: "6px" },
  analyticsChange: { fontSize: "12px", fontWeight: 700 },

  barChart: { display: "flex", alignItems: "flex-end", gap: "12px", height: "200px", padding: "20px 0 0", overflowX: "auto" },
  barCol: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: "6px" },
  bar: { width: "100%", background: "linear-gradient(180deg, #fbbf24, #f59e0b)", borderRadius: "6px 6px 0 0" },
  barLabel: { fontSize: "12px", color: "#6b7280", fontWeight: 600 },
  barVal: { fontSize: "11px", color: "#9ca3af" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  .table-row:hover { background: #f9fafb; }
  @media (min-width: 769px) {
    [style*="flexDirection: column"][style*="minHeight: 100vh"] { flex-direction: row !important; }
    [style*="width: 100%"][style*="background: #1f2937"] { width: 260px !important; }
    [style*="gridTemplateColumns: 1fr"] { grid-template-columns: 1fr 1fr !important; }
  }
`;