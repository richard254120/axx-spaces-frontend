export const ACCOMMODATION_FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  input:focus, select:focus, textarea:focus {
    border-color: #E31B1B !important;
    box-shadow: 0 0 0 3px rgba(227, 27, 27, 0.12) !important;
  }
`;

export const accommodationTheme = {
  bg: "#F8FAFC",
  accent: "#E31B1B",
  text: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0",
  white: "#ffffff",
  brandRed: "#E31B1B",
  emerald: "#10B981",
  bgDark: "#08101D",
};

export const navStyles = {
  nav: { background: "rgba(8, 16, 29, 0.95)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 100 },
  navInner: { maxWidth: "1400px", margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" },
  logoBtn: { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontFamily: "inherit" },
  logoAccent: { fontSize: "18px", fontWeight: 900, color: "#E31B1B" },
  logoWord: { fontSize: "18px", fontWeight: 900, color: "#ffffff" },
  logoPipe: { color: "rgba(255, 255, 255, 0.2)", margin: "0 4px" },
  logoLabel: { fontSize: "13px", fontWeight: 700, color: "#94A3B8" },
  navLink: { background: "none", border: "none", fontSize: "14px", fontWeight: 600, color: "#cbd5e1", cursor: "pointer", fontFamily: "inherit", padding: "8px 12px", borderRadius: "8px" },
  navBtnPrimary: { background: "linear-gradient(135deg, #E31B1B 0%, #C41414 100%)", color: "#ffffff", border: "none", borderRadius: "10px", padding: "10px 18px", fontWeight: 800, fontSize: "13px", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 15px rgba(227, 27, 27, 0.35)" },
  userChip: { background: "rgba(227, 27, 27, 0.12)", color: "#E31B1B", fontSize: "13px", fontWeight: 700, padding: "8px 14px", borderRadius: "20px", border: "1px solid rgba(227, 27, 27, 0.2)" },
  searchBar: { flex: 1, minWidth: "200px", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", fontFamily: "inherit", background: "#ffffff", color: "#0F172A" },
  listBtn: { background: "linear-gradient(135deg, #E31B1B 0%, #C41414 100%)", color: "#ffffff", border: "none", borderRadius: "10px", padding: "10px 16px", fontWeight: 800, fontSize: "13px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", boxShadow: "0 4px 15px rgba(227, 27, 27, 0.35)" },
};
