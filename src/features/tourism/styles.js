export const TOURISM_FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  input:focus, select:focus, textarea:focus {
    border-color: #fbbf24 !important;
    box-shadow: 0 0 0 3px rgba(251,191,36,0.12);
  }
`;

export const tourismTheme = {
  bg: "#f8f4f0",
  accent: "#fbbf24",
  text: "#1f2937",
  muted: "#6b7280",
  border: "#e5e7eb",
  white: "#ffffff",
};

export const navStyles = {
  nav: { background: tourismTheme.white, borderBottom: `1px solid ${tourismTheme.border}`, position: "sticky", top: 0, zIndex: 100 },
  navInner: { maxWidth: "1400px", margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" },
  logoBtn: { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontFamily: "inherit" },
  logoAccent: { fontSize: "18px", fontWeight: 900, color: tourismTheme.accent },
  logoWord: { fontSize: "18px", fontWeight: 900, color: tourismTheme.text },
  logoPipe: { color: "#d1d5db", margin: "0 4px" },
  logoLabel: { fontSize: "13px", fontWeight: 700, color: tourismTheme.muted },
  navLink: { background: "none", border: "none", fontSize: "14px", fontWeight: 600, color: "#4b5563", cursor: "pointer", fontFamily: "inherit", padding: "8px 12px", borderRadius: "8px" },
  navBtnPrimary: { background: tourismTheme.accent, color: tourismTheme.text, border: "none", borderRadius: "10px", padding: "10px 18px", fontWeight: 800, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" },
  userChip: { background: "#fef9c3", color: "#92400e", fontSize: "13px", fontWeight: 700, padding: "8px 14px", borderRadius: "20px" },
  searchBar: { flex: 1, minWidth: "200px", border: `1px solid ${tourismTheme.border}`, borderRadius: "10px", padding: "10px 14px", fontSize: "14px", fontFamily: "inherit" },
  listBtn: { background: tourismTheme.accent, color: tourismTheme.text, border: "none", borderRadius: "10px", padding: "10px 16px", fontWeight: 800, fontSize: "13px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" },
};
