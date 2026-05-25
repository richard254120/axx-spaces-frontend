import { useState } from "react";

const bookings = [
  { id: "BK001", guest: "Amina Kariuki", checkin: "2026-06-10", checkout: "2026-06-13", total: 55500, status: "confirmed", paid: true },
];

export default function ProviderDashboard() {
  const [tab, setTab] = useState(0);

  const totalRevenue = bookings.filter(b => b.paid).reduce((sum, b) => sum + b.total, 0);

  return (
    <div style={s.root}>
      <style>{css}</style>

      <aside style={s.sidebar}>
        <div style={s.logo}>🏨 Axx Spaces</div>
        <nav style={s.nav}>
          {["Overview", "Bookings", "Reviews", "Settings"].map((t, i) => (
            <button key={i} style={{ ...s.navItem, ...(tab === i ? s.navActive : {}) }} onClick={() => setTab(i)}>
              {t}
            </button>
          ))}
        </nav>
      </aside>

      <main style={s.main}>
        <h1 style={s.pageTitle}>Provider Dashboard</h1>
        <div style={s.statsGrid}>
          <div style={s.statCard}>
            <div>Total Revenue</div>
            <h2 style={{ color: "#22c55e" }}>KSh {totalRevenue.toLocaleString()}</h2>
          </div>
        </div>
        <button style={s.manageBtn} onClick={() => alert("Advertising Package Management")}>
          Manage Advertising Package
        </button>
      </main>
    </div>
  );
}

const s = {
  root: { fontFamily: "'DM Sans', sans-serif", display: "flex", minHeight: "100vh", background: "#f8f4f0" },
  sidebar: { width: "260px", background: "#1f2937", color: "white", padding: "32px 20px" },
  logo: { fontSize: "22px", fontWeight: 800, marginBottom: "40px" },
  nav: { display: "flex", flexDirection: "column", gap: "6px" },
  navItem: { padding: "14px 18px", borderRadius: "10px", background: "transparent", border: "none", color: "#9ca3af", textAlign: "left", cursor: "pointer" },
  navActive: { background: "#fbbf2420", color: "#fbbf24" },
  main: { flex: 1, padding: "40px" },
  pageTitle: { fontSize: "28px", fontWeight: 800 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginTop: "30px" },
  statCard: { background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e5e7eb" },
  manageBtn: { marginTop: "30px", background: "#fbbf24", color: "#1f2937", padding: "14px 28px", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer" }
};

const css = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`;