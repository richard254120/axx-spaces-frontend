import { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ProfileAvatar } from "../features/profile";

const API_BASE = import.meta.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api";

const IconActivity = ({ size = 20, color = "currentColor", style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const IconHeart = ({ size = 20, color = "currentColor", style, filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const IconCalendar = ({ size = 20, color = "currentColor", style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconMessageSquare = ({ size = 20, color = "currentColor", style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconUser = ({ size = 20, color = "currentColor", style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconRefresh = ({ size = 13, color = "currentColor", style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const IconBuilding = ({ size = 18, color = "currentColor", style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <line x1="9" y1="22" x2="9" y2="22.01" />
    <line x1="8" y1="6" x2="8" y2="6.01" />
    <line x1="16" y1="6" x2="16" y2="6.01" />
    <line x1="8" y1="10" x2="8" y2="10.01" />
    <line x1="16" y1="10" x2="16" y2="10.01" />
    <line x1="8" y1="14" x2="8" y2="14.01" />
    <line x1="16" y1="14" x2="16" y2="14.01" />
  </svg>
);

const IconMapPin = ({ size = 14, color = "currentColor", style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconCompass = ({ size = 36, color = "currentColor", style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const IconBed = ({ size = 36, color = "currentColor", style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M2 4v16" />
    <path d="M2 8h18a2 2 0 0 1 2 2v10" />
    <path d="M2 17h20" />
    <path d="M6 8v9" />
  </svg>
);

const IconTruck = ({ size = 16, color = "currentColor", style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const IconArrowUpRight = ({ size = 13, color = "currentColor", style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

const IconBell = ({ size = 18, color = "currentColor", style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const IconWallet = ({ size = 18, color = "currentColor", style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <circle cx="16" cy="15" r="1.5" />
  </svg>
);

const IconCreditCard = ({ size = 18, color = "currentColor", style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const IconSettings = ({ size = 18, color = "currentColor", style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6h.09A1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const IconArrowRight = ({ size = 13, color = "currentColor", style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconClose = ({ size = 18, color = "currentColor", style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconPackage = ({ size = 18, color = "currentColor", style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M16.5 9.4 7.55 4.24a1.8 1.8 0 0 0-1.8 0L3.5 5.5" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const styles = {
  page: {
    minHeight: "100vh",
    background: "#080d1a",
    color: "#f8fafc",
    fontFamily: "'DM Sans', sans-serif",
    padding: "36px 16px 80px",
  },
  container: {
    maxWidth: "1140px",
    margin: "0 auto",
  },
  headerCard: {
    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "20px",
    padding: "28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "28px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  name: {
    fontSize: "24px",
    fontWeight: 800,
    margin: 0,
    color: "#ffffff",
    letterSpacing: "-0.5px",
  },
  roleBadge: {
    fontSize: "11px",
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: "999px",
    background: "rgba(251, 191, 36, 0.15)",
    color: "#fbbf24",
    border: "1px solid rgba(251, 191, 36, 0.3)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  email: {
    fontSize: "14px",
    color: "#94a3b8",
    margin: "4px 0 0 0",
  },
  subtext: {
    fontSize: "12.5px",
    color: "#64748b",
    margin: "4px 0 0 0",
  },
  headerActions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  exploreBtn: {
    background: "rgba(255, 255, 255, 0.06)",
    color: "#f8fafc",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    padding: "10px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 700,
    textDecoration: "none",
    transition: "all 0.2s",
  },
  providerBtn: {
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#0f172a",
    border: "none",
    padding: "10px 18px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(251, 191, 36, 0.25)",
    transition: "all 0.2s",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "16px",
    marginBottom: "28px",
  },
  statCard: {
    background: "rgba(15, 23, 42, 0.65)",
    border: "1px solid rgba(255, 255, 255, 0.07)",
    borderRadius: "16px",
    padding: "20px",
    cursor: "pointer",
    transition: "transform 0.2s, border-color 0.2s",
  },
  statCardActive: {
    borderColor: "#fbbf24",
    background: "rgba(251, 191, 36, 0.05)",
  },
  statNumber: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#ffffff",
    margin: "8px 0 2px 0",
  },
  statLabel: {
    fontSize: "13px",
    color: "#94a3b8",
    fontWeight: 600,
  },
  statSub: {
    fontSize: "11px",
    color: "#64748b",
    marginTop: "4px",
  },
  statIconWrap: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px",
  },
  tabBar: {
    display: "flex",
    gap: "8px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    paddingBottom: "12px",
    marginBottom: "24px",
    overflowX: "auto",
  },
  tabBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: 700,
    padding: "10px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.2s",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  },
  tabBtnActive: {
    background: "rgba(251, 191, 36, 0.15)",
    color: "#fbbf24",
  },
  section: {
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    borderRadius: "18px",
    padding: "26px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 800,
    margin: 0,
    color: "#ffffff",
  },
  sectionSub: {
    fontSize: "13px",
    color: "#94a3b8",
    marginTop: "4px",
  },
  emptyBox: {
    textAlign: "center",
    padding: "50px 20px",
    background: "rgba(255, 255, 255, 0.02)",
    borderRadius: "14px",
    border: "1px dashed rgba(255, 255, 255, 0.1)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "rgba(30, 41, 59, 0.7)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "14px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  cardImg: {
    width: "100%",
    height: "170px",
    objectFit: "cover",
  },
  cardBody: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#ffffff",
    margin: "0 0 6px 0",
    lineHeight: "1.35",
  },
  cardLocation: {
    fontSize: "12.5px",
    color: "#94a3b8",
    margin: "0 0 10px 0",
  },
  cardPrice: {
    fontSize: "15px",
    fontWeight: 800,
    color: "#fbbf24",
    margin: "0 0 12px 0",
  },
  cardActions: {
    display: "flex",
    gap: "8px",
    marginTop: "auto",
  },
  viewBtn: {
    flex: 1,
    textAlign: "center",
    background: "rgba(255, 255, 255, 0.08)",
    color: "#ffffff",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "12.5px",
    fontWeight: 700,
    textDecoration: "none",
  },
  removeBtn: {
    background: "rgba(239, 68, 68, 0.12)",
    color: "#f87171",
    border: "1px solid rgba(239, 68, 68, 0.25)",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "12.5px",
    fontWeight: 700,
    cursor: "pointer",
  },
  statusBadge: (status) => {
    const s = (status || "pending").toLowerCase();
    let bg = "rgba(251, 191, 36, 0.15)";
    let color = "#fbbf24";
    let border = "rgba(251, 191, 36, 0.3)";

    if (s === "confirmed" || s === "approved" || s === "completed") {
      bg = "rgba(16, 185, 129, 0.15)";
      color = "#34d399";
      border = "rgba(16, 185, 129, 0.3)";
    } else if (s === "cancelled" || s === "rejected") {
      bg = "rgba(239, 68, 68, 0.15)";
      color = "#f87171";
      border = "rgba(239, 68, 68, 0.3)";
    }

    return {
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "999px",
      fontSize: "11.5px",
      fontWeight: 700,
      background: bg,
      color,
      border: `1px solid ${border}`,
      textTransform: "capitalize",
    };
  },
  enquiryCard: {
    background: "rgba(30, 41, 59, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.07)",
    borderRadius: "12px",
    padding: "16px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "12px",
  },
  bookingCard: {
    background: "rgba(30, 41, 59, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.07)",
    borderRadius: "14px",
    padding: "18px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  timelineItem: {
    display: "flex",
    gap: "16px",
    position: "relative",
    paddingBottom: "24px",
  },
  timelineDot: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "rgba(251, 191, 36, 0.15)",
    border: "1px solid rgba(251, 191, 36, 0.3)",
    color: "#fbbf24",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    flexShrink: 0,
  },
  overviewColumns: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    padding: "11px 0",
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
  },
  detailLabel: {
    fontSize: "12.5px",
    color: "#94a3b8",
    fontWeight: 600,
  },
  detailValue: {
    fontSize: "13.5px",
    color: "#f8fafc",
    fontWeight: 700,
    textAlign: "right",
    wordBreak: "break-word",
  },
  perfRow: {
    marginBottom: "16px",
  },
  perfLine: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12.5px",
    color: "#cbd5e1",
    fontWeight: 600,
    marginBottom: "6px",
  },
  perfTrack: {
    height: "7px",
    borderRadius: "999px",
    background: "rgba(255, 255, 255, 0.07)",
    overflow: "hidden",
  },
  settingsLink: {
    background: "rgba(255, 255, 255, 0.06)",
    color: "#cbd5e1",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    padding: "10px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 700,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  },
  accountLinks: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "12px",
    marginTop: "16px",
  },
  accountLink: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    borderRadius: "12px",
    background: "rgba(30, 41, 59, 0.55)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    textDecoration: "none",
    minWidth: 0,
  },
  accountLinkIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  accountLinkTitle: {
    display: "block",
    fontSize: "13.5px",
    fontWeight: 700,
    color: "#f8fafc",
  },
  accountLinkSub: {
    display: "block",
    fontSize: "11.5px",
    color: "#94a3b8",
    marginTop: "2px",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    background: "rgba(30, 41, 59, 0.7)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "10px",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#cbd5e1",
    marginBottom: "6px",
    display: "block",
  },
  submitBtn: {
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    color: "#0f172a",
    border: "none",
    padding: "12px 20px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(251, 191, 36, 0.25)",
  },
  modalBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.75)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "16px",
  },
  modalCard: {
    background: "#0f172a",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
    padding: "32px",
    maxWidth: "520px",
    width: "100%",
    boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5)",
  },
};

function formatTimeAgo(dateInput) {
  if (!dateInput) return "Recently";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Recently";
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-KE", { month: "short", day: "numeric" });
}

export default function MemberDashboard() {
  const { user, token, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState(tabFromUrl || "overview");
  const [favorites, setFavorites] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [bookings, setBookings] = useState({ accommodations: [], services: [] });
  const [itemRequests, setItemRequests] = useState([]);
  const [stats, setStats] = useState({ favoritesCount: 0, enquiriesCount: 0, bookingsCount: 0, requestsCount: 0 });
  const [loading, setLoading] = useState(true);

  // Sync tab if URL changes
  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl, activeTab]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  // Profile Form state
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Become a Provider Modal State
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [providerData, setProviderData] = useState({
    businessName: "",
    county: "",
    description: "",
    services: "",
  });
  const [providerLoading, setProviderLoading] = useState(false);
  const [providerError, setProviderError] = useState("");
  const [providerSuccess, setProviderSuccess] = useState("");

  const loadActivities = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/members/activities`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();

        // Account activity is identity-scoped only.
        // Device-local wishlists are deliberately excluded so a shared device
        // can never surface another account's saved spaces here.
        setFavorites(data.favorites || []);
        setEnquiries(data.enquiries || []);
        setBookings(data.bookings || { accommodations: [], services: [] });
        setItemRequests(data.itemRequests || []);
        setStats(data.stats || {
          favoritesCount: (data.favorites || []).length,
          enquiriesCount: (data.enquiries || []).length,
          bookingsCount: ((data.bookings?.accommodations || []).length + (data.bookings?.services || []).length),
          requestsCount: (data.itemRequests || []).length,
        });
      } else {
        // Fallback to separate endpoints if /activities isn't ready
        const [favRes, enqRes] = await Promise.all([
          fetch(`${API_BASE}/members/favorites`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/members/enquiries`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (favRes.ok) {
          const fData = await favRes.json();
          setFavorites(fData.favorites || []);
        }
        if (enqRes.ok) {
          const eData = await enqRes.json();
          setEnquiries(eData.enquiries || []);
        }
      }
    } catch (err) {
      console.error("Load member activities error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate("/user-login");
      return;
    }
    loadActivities();

    // Auto-refresh activities every 20 seconds for real-time responsiveness
    const timer = setInterval(() => {
      loadActivities();
    }, 20000);

    const onFocus = () => loadActivities();
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onFocus);
    };
  }, [token, loadActivities, navigate]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfilePhone(user.phone || "");
    }
  }, [user]);

  const handleRemoveFavorite = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/members/favorites/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFavorites((prev) => prev.filter((f) => f._id !== id && f.property?._id !== id));
        setStats((prev) => ({ ...prev, favoritesCount: Math.max(0, prev.favoritesCount - 1) }));
      }
    } catch (err) {
      console.error("Remove favorite error:", err);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg("");
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: profileName, phone: profilePhone }),
      });
      const data = await res.json();
      if (res.ok) {
        updateUser(data.user || { name: profileName, phone: profilePhone });
        setProfileMsg("Profile updated successfully!");
        setTimeout(() => setProfileMsg(""), 3000);
      } else {
        setProfileMsg(data.error || "Failed to update profile");
      }
    } catch {
      setProfileMsg("Network error saving profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleBecomeProvider = async (e) => {
    e.preventDefault();
    setProviderLoading(true);
    setProviderError("");
    setProviderSuccess("");

    try {
      const res = await fetch(`${API_BASE}/users/become-provider`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          businessName: providerData.businessName,
          county: providerData.county,
          description: providerData.description,
          services: providerData.services.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upgrade account");
      }

      setProviderSuccess("Upgrade successful! Entering your provider dashboard...");
      if (data.user) {
        updateUser(data.user);
      }
      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);
    } catch (err) {
      setProviderError(err.message || "Failed to become provider");
    } finally {
      setProviderLoading(false);
    }
  };

  const totalBookingsCount = (bookings.accommodations?.length || 0) + (bookings.services?.length || 0);
  const totalActivities = favorites.length + enquiries.length + totalBookingsCount + itemRequests.length;
  const accountType = user?.role === "member" ? "Axxspace Member" : "Community Explorer";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-KE", { month: "long", year: "numeric" })
    : "Not available";

  // Share of this member's own activity, used for the performance snapshot
  const performanceRows = [
    { label: "Saved spaces", value: favorites.length, color: "#f43f5e" },
    { label: "Bookings & stays", value: totalBookingsCount, color: "#fbbf24" },
    { label: "Enquiries sent", value: enquiries.length, color: "#c084fc" },
    { label: "Service requests", value: itemRequests.length, color: "#38bdf8" },
  ].map((row) => ({
    ...row,
    percent: totalActivities ? Math.round((row.value / totalActivities) * 100) : 0,
  }));

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* TOP MEMBER PROFILE & ACTIONS */}
        <div style={styles.headerCard}>
          <div style={styles.headerLeft}>
            <ProfileAvatar user={user} size={64} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h1 style={styles.name}>{user?.name || "Community Member"}</h1>
                <span style={styles.roleBadge}>
                  {user?.role === "member" ? "AXXSPACE MEMBER" : "COMMUNITY EXPLORER"}
                </span>
              </div>
              <p style={styles.email}>{user?.email}</p>
              <p style={styles.subtext}>
                Member Hub · Explore, save, inquire, and track all your website activities
              </p>
            </div>
          </div>

          <div style={styles.headerActions}>
            <Link to="/settings" style={styles.settingsLink} title="Profile, security and sign out">
              <IconUser size={14} />
              <span>Account Settings</span>
            </Link>
            <Link to="/listings" style={{ ...styles.exploreBtn, display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span>Browse Spaces</span>
              <IconArrowUpRight size={13} />
            </Link>
            <Link to="/accommodation" style={{ ...styles.exploreBtn, display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span>Book Stays</span>
              <IconArrowUpRight size={13} />
            </Link>
            <button
              type="button"
              style={{ ...styles.providerBtn, display: "inline-flex", alignItems: "center", gap: "6px" }}
              onClick={() => setShowProviderModal(true)}
            >
              <span>List Space / Provider</span>
              <IconArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* ACTIVITY STAT METRICS — personal performance at a glance */}
        <div style={styles.statsRow}>
          <div
            style={{ ...styles.statCard, ...(activeTab === "overview" ? styles.statCardActive : {}) }}
            onClick={() => handleTabChange("overview")}
          >
            <div style={{ ...styles.statIconWrap, background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8" }}>
              <IconActivity size={20} />
            </div>
            <div style={styles.statNumber}>{totalActivities}</div>
            <div style={styles.statLabel}>Total Activities</div>
            <div style={styles.statSub}>All your platform interactions</div>
          </div>

          <div
            style={{ ...styles.statCard, ...(activeTab === "favorites" ? styles.statCardActive : {}) }}
            onClick={() => handleTabChange("favorites")}
          >
            <div style={{ ...styles.statIconWrap, background: "rgba(244, 63, 94, 0.12)", color: "#f43f5e" }}>
              <IconHeart size={20} filled />
            </div>
            <div style={styles.statNumber}>{favorites.length}</div>
            <div style={styles.statLabel}>Saved Spaces</div>
            <div style={styles.statSub}>Your bookmarked listings</div>
          </div>

          <div
            style={{ ...styles.statCard, ...(activeTab === "bookings" ? styles.statCardActive : {}) }}
            onClick={() => handleTabChange("bookings")}
          >
            <div style={{ ...styles.statIconWrap, background: "rgba(251, 191, 36, 0.12)", color: "#fbbf24" }}>
              <IconCalendar size={20} />
            </div>
            <div style={styles.statNumber}>{totalBookingsCount}</div>
            <div style={styles.statLabel}>Stays &amp; Bookings</div>
            <div style={styles.statSub}>Your reservations with hosts</div>
          </div>

          <div
            style={{ ...styles.statCard, ...(activeTab === "enquiries" ? styles.statCardActive : {}) }}
            onClick={() => handleTabChange("enquiries")}
          >
            <div style={{ ...styles.statIconWrap, background: "rgba(192, 132, 252, 0.12)", color: "#c084fc" }}>
              <IconMessageSquare size={20} />
            </div>
            <div style={styles.statNumber}>{enquiries.length}</div>
            <div style={styles.statLabel}>Enquiries Sent</div>
            <div style={styles.statSub}>Questions to hosts &amp; owners</div>
          </div>

          <div
            style={{ ...styles.statCard, ...(activeTab === "requests" ? styles.statCardActive : {}) }}
            onClick={() => handleTabChange("requests")}
          >
            <div style={{ ...styles.statIconWrap, background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8" }}>
              <IconPackage size={20} />
            </div>
            <div style={styles.statNumber}>{itemRequests.length}</div>
            <div style={styles.statLabel}>Service Requests</div>
            <div style={styles.statSub}>Items &amp; services you requested</div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div style={styles.tabBar}>
          <button
            type="button"
            style={{ ...styles.tabBtn, ...(activeTab === "overview" ? styles.tabBtnActive : {}) }}
            onClick={() => handleTabChange("overview")}
          >
            <IconActivity size={16} />
            <span>Activity Feed</span>
          </button>
          <button
            type="button"
            style={{ ...styles.tabBtn, ...(activeTab === "favorites" ? styles.tabBtnActive : {}) }}
            onClick={() => handleTabChange("favorites")}
          >
            <IconHeart size={16} filled={activeTab === "favorites"} />
            <span>Saved Spaces ({favorites.length})</span>
          </button>
          <button
            type="button"
            style={{ ...styles.tabBtn, ...(activeTab === "bookings" ? styles.tabBtnActive : {}) }}
            onClick={() => handleTabChange("bookings")}
          >
            <IconCalendar size={16} />
            <span>My Bookings &amp; Stays ({totalBookingsCount})</span>
          </button>
          <button
            type="button"
            style={{ ...styles.tabBtn, ...(activeTab === "enquiries" ? styles.tabBtnActive : {}) }}
            onClick={() => handleTabChange("enquiries")}
          >
            <IconMessageSquare size={16} />
            <span>Space Enquiries ({enquiries.length})</span>
          </button>
          <button
            type="button"
            style={{ ...styles.tabBtn, ...(activeTab === "requests" ? styles.tabBtnActive : {}) }}
            onClick={() => handleTabChange("requests")}
          >
            <IconPackage size={16} />
            <span>Service Requests ({itemRequests.length})</span>
          </button>
          <button
            type="button"
            style={{ ...styles.tabBtn, ...(activeTab === "profile" ? styles.tabBtnActive : {}) }}
            onClick={() => handleTabChange("profile")}
          >
            <IconUser size={16} />
            <span>Account Profile</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW — personal details, performance, and timeline */}
        {activeTab === "overview" && (
          <>
            <div style={styles.overviewColumns}>
              {/* PERSONAL DETAILS */}
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <div>
                    <h2 style={styles.sectionTitle}>Your Account Details</h2>
                    <div style={styles.sectionSub}>Only your own account information is shown here</div>
                  </div>
                  <Link to="/settings" style={styles.exploreBtn}>Edit</Link>
                </div>

                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Full name</span>
                  <span style={styles.detailValue}>{user?.name || "Not set"}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Email address</span>
                  <span style={styles.detailValue}>{user?.email || "Not set"}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Phone number</span>
                  <span style={styles.detailValue}>{user?.phone || "Not set"}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>County</span>
                  <span style={styles.detailValue}>{user?.county || "Not set"}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Account type</span>
                  <span style={styles.detailValue}>{accountType}</span>
                </div>
                <div style={{ ...styles.detailRow, borderBottom: "none" }}>
                  <span style={styles.detailLabel}>Member since</span>
                  <span style={styles.detailValue}>{memberSince}</span>
                </div>
              </div>

              {/* PERFORMANCE SNAPSHOT */}
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <div>
                    <h2 style={styles.sectionTitle}>Your Activity Performance</h2>
                    <div style={styles.sectionSub}>How you are using Axxspace, at a glance</div>
                  </div>
                </div>

                <div style={{ ...styles.detailRow, borderBottom: "none", paddingTop: 0 }}>
                  <span style={styles.detailLabel}>Total activities</span>
                  <span style={{ ...styles.detailValue, color: "#fbbf24", fontSize: "20px" }}>{totalActivities}</span>
                </div>

                {performanceRows.map((row) => (
                  <div key={row.label} style={styles.perfRow}>
                    <div style={styles.perfLine}>
                      <span>{row.label}</span>
                      <span>{row.value} · {row.percent}%</span>
                    </div>
                    <div style={styles.perfTrack}>
                      <div
                        style={{
                          width: `${row.percent}%`,
                          height: "100%",
                          background: row.color,
                          borderRadius: "999px",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>
                ))}

                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>
                  Updated automatically from your own saved spaces, bookings, enquiries, and requests.
                </p>
              </div>
            </div>

          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Your Activity Timeline</h2>
                <div style={styles.sectionSub}>Everything you've explored, saved, and requested on Axxspace</div>
              </div>
              <button
                type="button"
                onClick={loadActivities}
                style={{
                  background: "none",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#cbd5e1",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <IconRefresh size={12} />
                <span>Refresh Feed</span>
              </button>
            </div>

            {loading ? (
              <p style={{ color: "#94a3b8", padding: "20px 0" }}>Loading your activity feed...</p>
            ) : favorites.length === 0 && enquiries.length === 0 && totalBookingsCount === 0 && itemRequests.length === 0 ? (
              <div style={styles.emptyBox}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px", color: "#64748b" }}>
                  <IconCompass size={40} />
                </div>
                <h3 style={{ margin: "0 0 6px 0", color: "#ffffff", fontSize: "17px" }}>
                  Your Axxspace journey begins here
                </h3>
                <p style={{ margin: "0 0 20px 0", color: "#94a3b8", fontSize: "13.5px", maxWidth: "460px", marginInline: "auto" }}>
                  Save your favorite rental apartments, book weekend accommodations, or enquire about properties.
                  All your website activities will be organized right here.
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                  <Link to="/listings" style={styles.submitBtn}>
                    Explore Rentals
                  </Link>
                  <Link to="/accommodation" style={{ ...styles.exploreBtn, padding: "12px 20px" }}>
                    Explore Accommodations
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {/* Bookings events */}
                {bookings.accommodations?.map((b) => (
                  <div key={b._id} style={styles.timelineItem}>
                    <div style={{ ...styles.timelineDot, background: "rgba(251, 191, 36, 0.12)", color: "#fbbf24", borderColor: "rgba(251, 191, 36, 0.3)" }}>
                      <IconBuilding size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                        <span style={{ fontWeight: 700, color: "#ffffff", fontSize: "14.5px" }}>
                          Booked stay at {b.accommodation?.title || "Accommodation"}
                        </span>
                        <span style={styles.statusBadge(b.status)}>{b.status}</span>
                      </div>
                      <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "13px" }}>
                        Check-in: {b.checkIn ? new Date(b.checkIn).toLocaleDateString() : "TBD"} &bull; Total: KES {Number(b.totalPrice || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Enquiries events */}
                {enquiries.map((enq) => (
                  <div key={enq._id} style={styles.timelineItem}>
                    <div style={{ ...styles.timelineDot, background: "rgba(192, 132, 252, 0.12)", color: "#c084fc", borderColor: "rgba(192, 132, 252, 0.3)" }}>
                      <IconMessageSquare size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                        <span style={{ fontWeight: 700, color: "#ffffff", fontSize: "14.5px" }}>
                          Sent enquiry for {enq.property?.title || enq.rental?.title || "Property"}
                        </span>
                        <span style={styles.statusBadge("Active")}>Active</span>
                      </div>
                      {enq.message && (
                        <p style={{ margin: "4px 0 0 0", color: "#cbd5e1", fontSize: "13px" }}>
                          &ldquo;{enq.message}&rdquo;
                        </p>
                      )}
                      <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "11.5px" }}>
                        {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString() : ""}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Saved events */}
                {favorites.map((fav) => {
                  const item = fav.property || fav.business;
                  if (!item) return null;
                  return (
                    <div key={fav._id} style={styles.timelineItem}>
                      <div style={{ ...styles.timelineDot, background: "rgba(244, 63, 94, 0.12)", color: "#f43f5e", borderColor: "rgba(244, 63, 94, 0.3)" }}>
                        <IconHeart size={16} filled />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                          <span style={{ fontWeight: 700, color: "#ffffff", fontSize: "14.5px" }}>
                            Saved space: {item.title || item.name}
                          </span>
                          <span style={styles.roleBadge}>Saved</span>
                        </div>
                        <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "13px" }}>
                          {item.location?.address || item.county || "Kenya"} &bull; {item.price ? `KES ${Number(item.price).toLocaleString()}` : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Service request events */}
                {itemRequests.map((req) => (
                  <div key={req._id} style={styles.timelineItem}>
                    <div style={{ ...styles.timelineDot, background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.3)" }}>
                      <IconPackage size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                        <span style={{ fontWeight: 700, color: "#ffffff", fontSize: "14.5px" }}>
                          Requested: {req.searchQuery || "Service request"}
                        </span>
                        <span style={styles.statusBadge(req.status)}>{req.status || "pending"}</span>
                      </div>
                      {req.details && (
                        <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "13px" }}>{req.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACCOUNT SHORTCUTS — moved out of the navbar menu */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>My Activity &amp; Account</h2>
                <div style={styles.sectionSub}>Notifications, wallet, payments and security — all one tap away</div>
              </div>
            </div>
            <div style={styles.accountLinks}>
              {[
                { to: "/notifications", label: "Notifications", sub: "Alerts, enquiries & booking updates", icon: <IconBell size={18} />, tint: "rgba(192, 132, 252, 0.12)", color: "#c084fc" },
                { to: "/wallet", label: "AxxWallet", sub: "Balances, transactions & payouts", icon: <IconWallet size={18} />, tint: "rgba(16, 185, 129, 0.12)", color: "#34d399" },
                { to: "/payment-history", label: "Payment History", sub: "Receipts for every payment", icon: <IconCreditCard size={18} />, tint: "rgba(56, 189, 248, 0.12)", color: "#38bdf8" },
                { to: "/settings", label: "Settings & Security", sub: "Password, 2FA & sign out", icon: <IconSettings size={18} />, tint: "rgba(251, 191, 36, 0.12)", color: "#fbbf24" },
              ].map((item) => (
                <Link key={item.to} to={item.to} style={styles.accountLink}>
                  <span style={{ ...styles.accountLinkIcon, background: item.tint, color: item.color }}>{item.icon}</span>
                  <span style={{ minWidth: 0 }}>
                    <span style={styles.accountLinkTitle}>{item.label}</span>
                    <span style={styles.accountLinkSub}>{item.sub}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
          </>
        )}

        {/* TAB 2: SAVED SPACES */}
        {activeTab === "favorites" && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Saved Listings ({favorites.length})</h2>
                <div style={styles.sectionSub}>All your bookmarked apartments, houses, and spaces</div>
              </div>
              <Link to="/listings" style={{ ...styles.exploreBtn, color: "#fbbf24" }}>
                + Explore More Spaces
              </Link>
            </div>

            {loading ? (
              <p style={{ color: "#94a3b8" }}>Loading your saved spaces...</p>
            ) : favorites.length === 0 ? (
              <div style={styles.emptyBox}>
                <p style={{ fontSize: "16px", color: "#f8fafc", margin: "0 0 6px 0" }}>No saved spaces yet</p>
                <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 16px 0" }}>
                  Tap the heart icon on any listing to save and compare here anytime.
                </p>
                <Link to="/listings" style={styles.submitBtn}>
                  Explore Listings
                </Link>
              </div>
            ) : (
              <div style={styles.grid}>
                {favorites.map((fav) => {
                  const item = fav.property || fav.business;
                  if (!item) return null;
                  const title = item.title || item.name || "Axxspace Listing";
                  const price = item.price ? `KES ${Number(item.price).toLocaleString()}/mo` : "";
                  const location = item.location?.address || item.location?.city || item.county || "Kenya";
                  const image = (item.images && item.images[0]) || "/rentals.png";

                  return (
                    <div key={fav._id} style={styles.card}>
                      <img src={image} alt={title} style={styles.cardImg} />
                      <div style={styles.cardBody}>
                        <div>
                          <h3 style={styles.cardTitle}>{title}</h3>
                          <p style={{ ...styles.cardLocation, display: "flex", alignItems: "center", gap: "4px" }}>
                            <IconMapPin size={13} color="#94a3b8" />
                            <span>{location}</span>
                          </p>
                          {price && <p style={styles.cardPrice}>{price}</p>}
                        </div>
                        <div style={styles.cardActions}>
                          <Link
                            to={fav.property ? `/listings/${fav.property._id}` : `/business/${fav.business?._id}`}
                            style={styles.viewBtn}
                          >
                            View Space
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleRemoveFavorite(fav._id)}
                            style={styles.removeBtn}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BOOKINGS & STAYS */}
        {activeTab === "bookings" && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>My Stays &amp; Bookings ({totalBookingsCount})</h2>
                <div style={styles.sectionSub}>Hotel, resort, cottage, and service bookings</div>
              </div>
              <Link to="/accommodation" style={{ ...styles.exploreBtn, color: "#fbbf24" }}>
                + Book Accommodations
              </Link>
            </div>

            {loading ? (
              <p style={{ color: "#94a3b8" }}>Loading bookings...</p>
            ) : totalBookingsCount === 0 ? (
              <div style={styles.emptyBox}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px", color: "#64748b" }}>
                  <IconBed size={40} />
                </div>
                <h3 style={{ margin: "0 0 6px 0", color: "#ffffff", fontSize: "16px" }}>
                  No active bookings found
                </h3>
                <p style={{ margin: "0 0 16px 0", color: "#94a3b8", fontSize: "13px" }}>
                  Explore verified holiday stays, beachfront villas, and safari lodges across Kenya.
                </p>
                <Link to="/accommodation" style={styles.submitBtn}>
                  Find a Stay
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Accommodation stays */}
                {bookings.accommodations?.map((b) => (
                  <div key={b._id} style={styles.bookingCard}>
                    <div>
                      <h4 style={{ margin: "0 0 6px 0", color: "#ffffff", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <IconBuilding size={18} color="#fbbf24" />
                        <span>{b.accommodation?.title || "Accommodation Stay"}</span>
                      </h4>
                      <p style={{ margin: "0 0 4px 0", color: "#cbd5e1", fontSize: "13px" }}>
                        Check-in: {b.checkIn ? new Date(b.checkIn).toLocaleDateString() : "TBD"} &bull; Check-out: {b.checkOut ? new Date(b.checkOut).toLocaleDateString() : "TBD"}
                      </p>
                      <p style={{ margin: 0, color: "#94a3b8", fontSize: "12.5px" }}>
                        Guests: {b.numberOfGuests || 1} &bull; Total:{" "}
                        <strong style={{ color: "#fbbf24" }}>KES {Number(b.totalPrice || 0).toLocaleString()}</strong>
                      </p>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={styles.statusBadge(b.status)}>{b.status || "Pending"}</span>
                      {b.accommodation?._id && (
                        <div style={{ marginTop: "10px" }}>
                          <Link
                            to={`/accommodation/property/${b.accommodation._id}`}
                            style={{ ...styles.exploreBtn, fontSize: "12px", padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                          >
                            <span>View Details</span>
                            <IconArrowRight size={12} />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Service bookings */}
                {bookings.services?.map((s) => (
                  <div key={s._id} style={styles.bookingCard}>
                    <div>
                      <h4 style={{ margin: "0 0 6px 0", color: "#ffffff", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <IconTruck size={18} color="#38bdf8" />
                        <span>Service: {s.description || s.serviceType}</span>
                      </h4>
                      <p style={{ margin: "0 0 4px 0", color: "#cbd5e1", fontSize: "13px" }}>
                        Date: {s.date ? new Date(s.date).toLocaleDateString() : ""} at {s.time}
                      </p>
                      <p style={{ margin: 0, color: "#94a3b8", fontSize: "12.5px" }}>
                        Address: {s.address} &bull; Est: KES {Number(s.estimatedCost || 0).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <span style={styles.statusBadge(s.status)}>{s.status || "Pending"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ENQUIRIES */}
        {activeTab === "enquiries" && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Your Space Enquiries &amp; Waitlists ({enquiries.length})</h2>
                <div style={styles.sectionSub}>Questions and waitlist requests sent to space providers</div>
              </div>
            </div>

            {loading ? (
              <p style={{ color: "#94a3b8" }}>Loading enquiries...</p>
            ) : enquiries.length === 0 ? (
              <div style={styles.emptyBox}>
                <p style={{ fontSize: "16px", color: "#f8fafc", margin: "0 0 6px 0" }}>No active enquiries</p>
                <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>
                  Inquiries and waitlist requests you send to property hosts will appear here.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {enquiries.map((enq) => {
                  const title = enq.property?.title || enq.rental?.title || "Property Enquiry";
                  const date = enq.createdAt ? new Date(enq.createdAt).toLocaleDateString() : "";
                  return (
                    <div key={enq._id} style={styles.enquiryCard}>
                      <div>
                        <h4 style={{ margin: "0 0 4px 0", color: "#f8fafc", fontSize: "15px" }}>{title}</h4>
                        <p style={{ margin: "0 0 6px 0", color: "#94a3b8", fontSize: "12px" }}>
                          Status: <span style={{ color: "#34d399", fontWeight: 700 }}>Active</span> · Date: {date}
                        </p>
                        {enq.message && <p style={{ margin: 0, color: "#cbd5e1", fontSize: "13px" }}>&ldquo;{enq.message}&rdquo;</p>}
                      </div>
                      {enq.property?._id && (
                        <Link to={`/listings/${enq.property._id}`} style={styles.viewBtn}>
                          View Space
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: SERVICE REQUESTS */}
        {activeTab === "requests" && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Your Service Requests ({itemRequests.length})</h2>
                <div style={styles.sectionSub}>Items, moves, and services you asked Axxspace to source</div>
              </div>
            </div>

            {loading ? (
              <p style={{ color: "#94a3b8" }}>Loading your requests...</p>
            ) : itemRequests.length === 0 ? (
              <div style={styles.emptyBox}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px", color: "#64748b" }}>
                  <IconPackage size={40} />
                </div>
                <h3 style={{ margin: "0 0 6px 0", color: "#ffffff", fontSize: "16px" }}>No service requests yet</h3>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>
                  When you ask us to source an item or service, it will be tracked here.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {itemRequests.map((req) => (
                  <div key={req._id} style={styles.enquiryCard}>
                    <div>
                      <h4 style={{ margin: "0 0 4px 0", color: "#f8fafc", fontSize: "15px" }}>
                        {req.searchQuery || "Service request"}
                      </h4>
                      <p style={{ margin: "0 0 6px 0", color: "#94a3b8", fontSize: "12px" }}>
                        {req.serviceType ? `${req.serviceType.toUpperCase()} · ` : ""}
                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : ""}
                      </p>
                      {req.details && (
                        <p style={{ margin: 0, color: "#cbd5e1", fontSize: "13px" }}>{req.details}</p>
                      )}
                    </div>
                    <span style={styles.statusBadge(req.status)}>{req.status || "pending"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: PROFILE & SETTINGS */}
        {activeTab === "profile" && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Account &amp; Profile Details</h2>
                <div style={styles.sectionSub}>Manage your contact details and preferences</div>
              </div>
            </div>

            {profileMsg && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: profileMsg.includes("success") ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                  color: profileMsg.includes("success") ? "#34d399" : "#f87171",
                  marginBottom: "16px",
                  fontSize: "13px",
                }}
              >
                {profileMsg}
              </div>
            )}

            <form onSubmit={handleProfileSave} style={{ maxWidth: "460px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div>
                <label style={styles.label}>Phone Number</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div>
                <label style={styles.label}>Email Address (Account ID)</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  style={{ ...styles.input, opacity: 0.6, cursor: "not-allowed" }}
                />
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                style={{ ...styles.submitBtn, opacity: profileSaving ? 0.7 : 1, width: "fit-content" }}
              >
                {profileSaving ? "Saving..." : "Save Profile Details"}
              </button>
            </form>

            <div
              style={{
                marginTop: "24px",
                paddingTop: "20px",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                fontSize: "13px",
                color: "#94a3b8",
              }}
            >
              Password, notification preferences, and signing out are managed in{" "}
              <Link to="/settings" style={{ color: "#fbbf24", fontWeight: 700 }}>
                Account Settings
              </Link>
              .
            </div>
          </div>
        )}
      </div>

      {/* BECOME A PROVIDER MODAL */}
      {showProviderModal && (
        <div style={styles.modalBackdrop} onClick={() => setShowProviderModal(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>
                Upgrade to Provider
              </h3>
              <button
                type="button"
                onClick={() => setShowProviderModal(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}
              >
                <IconClose size={20} />
              </button>
            </div>

            <p style={{ color: "#94a3b8", fontSize: "13.5px", marginBottom: "20px", lineHeight: "1.4" }}>
              Have properties, accommodations, or moving services to offer? Upgrade your member account to a Provider.
            </p>

            {providerError && (
              <div style={{ padding: "10px", background: "rgba(239, 68, 68, 0.15)", color: "#f87171", borderRadius: "8px", fontSize: "13px", marginBottom: "14px" }}>
                {providerError}
              </div>
            )}
            {providerSuccess && (
              <div style={{ padding: "10px", background: "rgba(16, 185, 129, 0.15)", color: "#34d399", borderRadius: "8px", fontSize: "13px", marginBottom: "14px" }}>
                {providerSuccess}
              </div>
            )}

            <form onSubmit={handleBecomeProvider} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={styles.label}>Business / Provider Name</label>
                <input
                  type="text"
                  placeholder="e.g. Skyline Apartments or Quick Movers"
                  value={providerData.businessName}
                  onChange={(e) => setProviderData({ ...providerData, businessName: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>

              <div>
                <label style={styles.label}>County / Operating Area</label>
                <input
                  type="text"
                  placeholder="e.g. Nairobi, Kiambu, Mombasa"
                  value={providerData.county}
                  onChange={(e) => setProviderData({ ...providerData, county: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>

              <div>
                <label style={styles.label}>Services Offered (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Rentals, House Moving, Student Housing"
                  value={providerData.services}
                  onChange={(e) => setProviderData({ ...providerData, services: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>

              <div>
                <label style={styles.label}>Short Bio / Description</label>
                <textarea
                  placeholder="Describe your offerings and experience..."
                  value={providerData.description}
                  onChange={(e) => setProviderData({ ...providerData, description: e.target.value })}
                  style={{ ...styles.input, minHeight: "80px", resize: "vertical" }}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowProviderModal(false)}
                  style={{ ...styles.exploreBtn, flex: 1, textAlign: "center" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={providerLoading}
                  style={{ ...styles.submitBtn, flex: 1, opacity: providerLoading ? 0.7 : 1 }}
                >
                  {providerLoading ? "Upgrading..." : "Confirm Upgrade"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
