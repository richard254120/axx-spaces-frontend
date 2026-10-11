import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { getPricelistUrl } from "../utils/fileLinks";

/* ─────────────── GLOBAL STYLE INJECTION ─────────────── */
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .bd-root *, .bd-root *::before, .bd-root *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
  }

  .bd-root {
    --bg: #060d1a;
    --surface: #0d1b31;
    --surface2: #14263f;
    --border: rgba(96, 140, 220, 0.16);
    --border-strong: rgba(96, 140, 220, 0.38);
    --accent: #3b82f6;
    --accent-soft: rgba(59, 130, 246, 0.12);
    --text: #e8f0fe;
    --text-dim: #8ea5c8;
    --text-muted: #5b7399;
    --green: #22c55e;
    --green-soft: rgba(34, 197, 94, 0.13);
    --gold: #f59e0b;
    --gold-soft: rgba(245, 158, 11, 0.13);
    --purple: #a855f7;
    --purple-soft: rgba(168, 85, 247, 0.13);
    --danger: #ef4444;
    --r-sm: 8px;
    --r: 12px;
    --r-lg: 16px;
    --font-head: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;

    width: 100%;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 15px;
    line-height: 1.6;
    overflow-x: hidden;
  }

  .bd-root a { color: inherit; text-decoration: none; }
  .bd-root button { font-family: inherit; -webkit-appearance: none; appearance: none; }
  .bd-root :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

  /* ── Layout ── */
  .bd-container {
    max-width: 1080px;
    margin: 0 auto;
    padding: 0 16px 32px;
  }

  .bd-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    margin-top: 16px;
  }
  .bd-main, .bd-aside { display: flex; flex-direction: column; gap: 16px; min-width: 0; }

  @media (min-width: 900px) {
    .bd-container { padding: 0 24px 48px; }
    .bd-layout { grid-template-columns: minmax(0, 1fr) 340px; gap: 20px; }
    .bd-aside { position: sticky; top: 16px; align-self: start; }
  }

  /* ── Card ── */
  .bd-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    padding: 20px;
  }

  .bd-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  .bd-card-title {
    font-family: var(--font-head);
    font-size: 17px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.01em;
  }

  .bd-count {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-dim);
    background: var(--surface2);
    border: 1px solid var(--border);
    padding: 3px 10px;
    border-radius: 999px;
  }

  /* ── Back ── */
  .bd-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 16px 0 12px;
    color: var(--text-dim);
    font-size: 14px;
    font-weight: 600;
    transition: color 0.2s;
  }
  .bd-back:hover { color: var(--accent); }

  /* ── Hero ── */
  .bd-hero {
    background: linear-gradient(180deg, #0f2140 0%, var(--surface) 100%);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    padding: 24px 20px;
  }

  .bd-hero-top { display: flex; gap: 16px; align-items: center; }

  .bd-logo, .bd-logo-fallback {
    width: 84px;
    height: 84px;
    border-radius: var(--r);
    flex-shrink: 0;
    border: 1px solid var(--border-strong);
    background: var(--surface2);
  }
  .bd-logo { object-fit: cover; }
  .bd-logo-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
  }

  .bd-name {
    font-family: var(--font-head);
    font-size: clamp(22px, 4vw, 32px);
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.02em;
    margin-bottom: 8px;
  }

  .bd-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .bd-chip {
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
    background: var(--accent-soft);
    border: 1px solid var(--border-strong);
    padding: 3px 10px;
    border-radius: 999px;
  }

  .bd-location {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-top: 18px;
    font-size: 14px;
    color: var(--text-dim);
  }
  .bd-location svg { flex-shrink: 0; margin-top: 3px; color: var(--accent); }

  .bd-description {
    margin-top: 14px;
    font-size: 15px;
    color: var(--text-dim);
    line-height: 1.7;
    max-width: 70ch;
  }

  .bd-badges { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 16px; }
  .bd-badge {
    font-size: 12px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 999px;
  }
  .bd-badge-green  { background: var(--green-soft);  color: var(--green);  border: 1px solid rgba(34,197,94,0.3); }
  .bd-badge-blue   { background: var(--accent-soft); color: var(--accent); border: 1px solid var(--border-strong); }
  .bd-badge-purple { background: var(--purple-soft); color: var(--purple); border: 1px solid rgba(168,85,247,0.3); }
  .bd-badge-gold   { background: var(--gold-soft);   color: var(--gold);   border: 1px solid rgba(245,158,11,0.3); }

  /* ── Buttons ── */
  .bd-cta-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-top: 20px;
  }
  @media (min-width: 640px) {
    .bd-cta-row { grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); }
  }

  .bd-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 14px;
    border-radius: var(--r-sm);
    border: 1px solid transparent;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: filter 0.2s, transform 0.15s, background 0.2s;
    width: 100%;
  }
  .bd-btn:hover { filter: brightness(1.1); }
  .bd-btn:active { transform: scale(0.98); }
  .bd-btn-primary { background: var(--accent); color: #fff; }
  .bd-btn-green   { background: var(--green-soft); color: var(--green); border-color: rgba(34,197,94,0.4); }
  .bd-btn-ghost   { background: var(--surface2); color: var(--text); border-color: var(--border); }
  .bd-btn-danger  { background: var(--danger); color: #fff; }
  .bd-btn-sm { width: auto; padding: 8px 14px; font-size: 13px; }

  /* ── Socials ── */
  .bd-socials {
    display: flex;
    gap: 8px;
    margin-top: 16px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .bd-socials::-webkit-scrollbar { display: none; }
  .bd-social-link {
    flex-shrink: 0;
    padding: 7px 14px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    background: var(--surface2);
    color: var(--text-dim);
    border: 1px solid var(--border);
    transition: border-color 0.2s, color 0.2s;
  }
  .bd-social-link:hover { border-color: var(--accent); color: var(--accent); }

  /* ── Stats ── */
  .bd-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    margin-top: 16px;
    overflow: hidden;
  }
  .bd-stat { padding: 14px 6px; text-align: center; border-right: 1px solid var(--border); }
  .bd-stat:last-child { border-right: none; }
  .bd-stat-value { font-family: var(--font-head); font-size: 20px; font-weight: 800; line-height: 1.1; }
  .bd-stat-label { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

  /* ── Gallery ── */
  .bd-gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
  .bd-gallery-item {
    overflow: hidden;
    border-radius: var(--r-sm);
    background: var(--surface2);
    cursor: pointer;
    aspect-ratio: 1;
  }
  .bd-gallery-item:first-child { grid-column: span 3; aspect-ratio: 16 / 8; }
  .bd-gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }
  .bd-gallery-item:hover img { transform: scale(1.04); }

  /* ── Promotions ── */
  .bd-promo {
    border: 1px solid var(--border);
    background: var(--surface2);
    border-radius: var(--r);
    overflow: hidden;
  }
  .bd-promo + .bd-promo { margin-top: 12px; }
  .bd-promo-img { width: 100%; height: 160px; object-fit: cover; display: block; }
  .bd-promo-body { padding: 16px; }
  .bd-promo-title { font-family: var(--font-head); font-size: 16px; font-weight: 700; margin-bottom: 4px; }
  .bd-promo-desc { font-size: 14px; color: var(--text-dim); margin-bottom: 10px; }
  .bd-promo-discount { font-family: var(--font-head); font-size: 22px; font-weight: 800; color: var(--green); margin-bottom: 4px; }
  .bd-promo-dates { font-size: 12px; color: var(--text-muted); margin-bottom: 10px; }
  .bd-promo-code {
    display: inline-block;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--accent);
    background: var(--accent-soft);
    border: 1px dashed var(--border-strong);
    padding: 4px 10px;
    border-radius: 6px;
  }

  /* ── Products ── */
  .bd-products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
  .bd-product {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--r);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .bd-product-img, .bd-product-placeholder {
    width: 100%;
    aspect-ratio: 4 / 3;
    display: block;
    flex-shrink: 0;
  }
  .bd-product-img { object-fit: cover; }
  .bd-product-placeholder {
    background: var(--bg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
  }
  .bd-product-body { padding: 12px; display: flex; flex-direction: column; flex: 1; gap: 4px; }
  .bd-product-name { font-family: var(--font-head); font-size: 14px; font-weight: 700; line-height: 1.3; }
  .bd-product-desc { font-size: 12px; color: var(--text-dim); line-height: 1.5; flex: 1; }
  .bd-product-price { font-size: 15px; font-weight: 700; color: var(--green); }
  .bd-product-cat { font-size: 12px; color: var(--text-muted); }

  /* ── Pricelist ── */
  .bd-pricelist {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: var(--surface2);
    border: 1px solid var(--border-strong);
    border-radius: var(--r);
    color: var(--accent);
    font-weight: 600;
    font-size: 14px;
    transition: background 0.2s;
  }
  .bd-pricelist:hover { background: var(--accent-soft); }

  /* ── Reviews ── */
  .bd-form { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; padding: 16px; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r); }
  .bd-form-title { font-size: 15px; font-weight: 700; }
  .bd-label { display: block; font-size: 13px; color: var(--text-dim); margin-bottom: 6px; }

  .bd-input, .bd-textarea {
    width: 100%;
    padding: 11px 13px;
    background: var(--bg);
    border: 1px solid var(--border-strong);
    border-radius: var(--r-sm);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }
  .bd-input:focus, .bd-textarea:focus { border-color: var(--accent); }
  .bd-textarea { min-height: 96px; resize: vertical; }
  .bd-input::placeholder, .bd-textarea::placeholder { color: var(--text-muted); }

  .bd-stars { display: flex; gap: 2px; }
  .bd-star { cursor: pointer; font-size: 26px; line-height: 1; color: var(--text-muted); transition: color 0.15s; }
  .bd-star.active, .bd-star:hover { color: var(--gold); }

  .bd-form-actions { display: flex; gap: 10px; }

  .bd-success {
    padding: 10px 13px;
    background: var(--green-soft);
    border: 1px solid rgba(34,197,94,0.3);
    border-radius: var(--r-sm);
    color: var(--green);
    font-size: 13px;
  }

  .bd-review {
    padding: 16px 0;
    border-top: 1px solid var(--border);
  }
  .bd-review:first-child { border-top: none; padding-top: 0; }
  .bd-review-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 4px; }
  .bd-review-user { font-weight: 700; font-size: 14px; }
  .bd-review-verified {
    margin-left: 8px;
    font-size: 11px;
    font-weight: 600;
    color: var(--green);
    background: var(--green-soft);
    padding: 2px 8px;
    border-radius: 999px;
  }
  .bd-review-date { font-size: 12px; color: var(--text-muted); }
  .bd-review-rating { color: var(--gold); font-size: 14px; letter-spacing: 1px; }
  .bd-review-title { font-weight: 700; font-size: 14px; margin-top: 4px; }
  .bd-review-comment { font-size: 14px; color: var(--text-dim); margin-top: 2px; line-height: 1.65; }
  .bd-review-extra { font-size: 13px; color: var(--text-dim); margin-top: 8px; }
  .bd-review-extra strong { font-weight: 700; margin-right: 6px; }

  .bd-empty { text-align: center; padding: 28px 16px; color: var(--text-muted); font-size: 14px; }
  .bd-empty strong { display: block; color: var(--text-dim); font-size: 15px; margin-bottom: 2px; }

  /* ── Contact / owner / support ── */
  .bd-info-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 0;
    font-size: 14px;
    color: var(--text-dim);
    border-bottom: 1px solid var(--border);
    word-break: break-word;
  }
  .bd-info-row:last-child { border-bottom: none; padding-bottom: 0; }
  .bd-info-row:first-of-type { padding-top: 0; }
  .bd-info-row svg { flex-shrink: 0; color: var(--accent); }
  .bd-info-row a:hover { color: var(--accent); }

  .bd-coords {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 14px;
    padding: 12px;
    background: var(--accent-soft);
    border: 1px solid var(--border-strong);
    border-radius: var(--r-sm);
  }
  .bd-coords-vals { display: flex; gap: 16px; }
  .bd-coords-label { display: block; font-size: 11px; font-weight: 600; color: var(--text-dim); }
  .bd-coords-val { font-family: ui-monospace, monospace; font-size: 13px; font-weight: 600; }

  .bd-owner { display: flex; align-items: center; gap: 12px; }
  .bd-owner-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--accent-soft);
    border: 1px solid var(--border-strong);
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .bd-owner-name { font-weight: 700; font-size: 15px; }
  .bd-owner-detail { font-size: 13px; color: var(--text-dim); word-break: break-word; }

  .bd-admin { border-color: rgba(34,197,94,0.3); }
  .bd-admin .bd-form { margin: 12px 0 0; }

  /* ── States ── */
  .bd-state {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 20px;
    text-align: center;
    background: #060d1a;
    color: #8ea5c8;
    font-family: 'DM Sans', sans-serif;
  }
  .bd-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(96,140,220,0.25);
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: bd-spin 0.8s linear infinite;
  }
  @keyframes bd-spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .bd-spinner { animation-duration: 2s; } }

  /* ── Lightbox ── */
  .bd-lightbox {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.94);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 16px;
  }
  .bd-lightbox img { max-width: 100%; max-height: 80vh; object-fit: contain; border-radius: var(--r-sm); }
  .bd-lightbox-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: rgba(255,255,255,0.12);
    color: #fff;
    font-size: 18px;
    cursor: pointer;
  }
  .bd-lightbox-nav { display: flex; align-items: center; gap: 16px; color: rgba(255,255,255,0.7); font-size: 13px; }
  .bd-lightbox-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.18);
    background: rgba(255,255,255,0.08);
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .bd-lightbox-btn:hover { background: rgba(255,255,255,0.2); }
`;

/* ─── Inject styles once ─── */
if (typeof document !== "undefined" && !document.getElementById("bd-styles")) {
  const tag = document.createElement("style");
  tag.id = "bd-styles";
  tag.textContent = globalCSS;
  document.head.appendChild(tag);
}

/* ─────────────── BADGE CONFIG ─────────────── */
const BADGE_CONFIG = {
  student_verified: { label: "Student Verified", cls: "bd-badge-green", icon: "✓" },
  identity_verified: { label: "Identity Verified", cls: "bd-badge-green", icon: "✓" },
  business_verified: { label: "Business Verified", cls: "bd-badge-blue", icon: "●" },
  online_verified: { label: "Online Verified", cls: "bd-badge-blue", icon: "●" },
  location_verified: { label: "Location Verified", cls: "bd-badge-purple", icon: "◆" },
  premium_verified: { label: "Premium", cls: "bd-badge-gold", icon: "★" },
};

/* ─────────────── ICONS ─────────────── */
const Svg = ({ children, size = 16, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const IconPin = ({ size }) => (
  <Svg size={size}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></Svg>
);
const IconPhone = ({ size }) => (
  <Svg size={size}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></Svg>
);
const IconMail = ({ size }) => (
  <Svg size={size}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></Svg>
);
const IconGlobe = ({ size }) => (
  <Svg size={size}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></Svg>
);
const IconShare = ({ size }) => (
  <Svg size={size}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></Svg>
);
const IconFile = ({ size }) => (
  <Svg size={size}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></Svg>
);
const IconUser = ({ size }) => (
  <Svg size={size}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Svg>
);
const IconStore = ({ size }) => (
  <Svg size={size}><path d="M3 9l1-5h16l1 5" /><path d="M4 9v11h16V9" /><path d="M9 20v-6h6v6" /></Svg>
);
const IconImage = ({ size }) => (
  <Svg size={size}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></Svg>
);
const IconWhatsApp = ({ size }) => (
  <svg width={size || 16} height={size || 16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.132.554 4.133 1.524 5.875L.057 23.986l6.305-1.651A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.914 0-3.708-.504-5.254-1.385l-.377-.222-3.906 1.023 1.041-3.808-.245-.396A9.957 9.957 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
  </svg>
);

/* ─────────────── HELPERS ─────────────── */
const formatTime = (time) => {
  if (!time) return "Closed";
  const [h, m] = time.split(":");
  const hr = parseInt(h);
  const ampm = hr >= 12 ? "PM" : "AM";
  return `${hr % 12 || 12}:${m} ${ampm}`;
};

/* ─────────────── COMPONENT ─────────────── */
export default function BusinessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annMsg, setAnnMsg] = useState("");

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewUserName, setReviewUserName] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [deleteConfirmReviewId, setDeleteConfirmReviewId] = useState(null);
  const [deleteUserName, setDeleteUserName] = useState("");
  const [editReviewId, setEditReviewId] = useState(null);
  const [editUserName, setEditUserName] = useState("");

  /* Lightbox state */
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState([]);

  useEffect(() => { loadBusiness(); }, [id]);
  useEffect(() => { loadReviews(); }, [id]);

  /* ── Refresh trigger from BusinessForm after update ── */
  useEffect(() => {
    if (location.state?.refresh) {
      loadBusiness();
      // Clear the router state so back-navigation doesn't re-trigger
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const loadBusiness = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/business/${id}`);
      setBusiness(res.data.business);
    } catch {
      setError("Failed to load business");
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await API.get(`/business-reviews/business/${id}`);
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error("Failed to load reviews:", err);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/business-reviews/business/${id}`, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
        userName: user?.name || reviewUserName || "Anonymous",
      });
      setReviewMsg("Review submitted successfully!");
      setReviewRating(5);
      setReviewTitle("");
      setReviewComment("");
      setReviewUserName("");
      setShowReviewForm(false);
      setReviewSubmitted(true);
      loadReviews();
      loadBusiness(); // Reload to update rating
      setTimeout(() => setReviewMsg(""), 3000);
    } catch (err) {
      setReviewMsg("Failed to submit review: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteReview = async (reviewId, reviewUserNameToDelete) => {
    try {
      await API.delete(`/business-reviews/${reviewId}`, {
        data: { userName: reviewUserNameToDelete }
      });
      setReviewMsg("Review deleted successfully!");
      setDeleteConfirmReviewId(null);
      setDeleteUserName("");
      loadReviews();
      loadBusiness();
      setTimeout(() => setReviewMsg(""), 3000);
    } catch (err) {
      setReviewMsg("Failed to delete review: " + (err.response?.data?.error || err.message));
    }
  };

  const handleEditReview = (review) => {
    setEditReviewId(review._id);
    setReviewRating(review.rating);
    setReviewTitle(review.title);
    setReviewComment(review.comment);
    setReviewUserName(review.userName);
    setShowReviewForm(true);
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!editReviewId) return;
    try {
      await API.put(`/business-reviews/${editReviewId}`, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
        userName: user?.name || reviewUserName || "Anonymous",
      });
      setReviewMsg("Review updated successfully!");
      setReviewRating(5);
      setReviewTitle("");
      setReviewComment("");
      setReviewUserName("");
      setShowReviewForm(false);
      setEditReviewId(null);
      loadReviews();
      loadBusiness();
      setTimeout(() => setReviewMsg(""), 3000);
    } catch (err) {
      setReviewMsg("Failed to update review: " + (err.response?.data?.error || err.message));
    }
  };

  const handleCancelEdit = () => {
    setEditReviewId(null);
    setReviewRating(5);
    setReviewTitle("");
    setReviewComment("");
    setReviewUserName("");
    setShowReviewForm(false);
  };

  const handleAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/business/${id}/announcements`, { title: annTitle, content: annContent });
      setAnnMsg("Announcement added!");
      setAnnTitle(""); setAnnContent("");
      setShowForm(false);
      loadBusiness();
      setTimeout(() => setAnnMsg(""), 3000);
    } catch {
      setAnnMsg("Failed to add announcement.");
    }
  };

  /* Lightbox helpers */
  const openLightbox = (index, imageArray = business?.images || []) => {
    setLightboxImages(imageArray);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const prevPhoto = () => setLightboxIndex(i => (i - 1 + lightboxImages.length) % lightboxImages.length);
  const nextPhoto = () => setLightboxIndex(i => (i + 1) % lightboxImages.length);

  /* Keyboard nav for lightbox */
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e) => {
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, lightboxIndex]);

  /* ── Loading / error states ── */
  if (loading) return (
    <div className="bd-state">
      <div className="bd-spinner" />
      <div>Loading business…</div>
    </div>
  );

  if (error || !business) return (
    <div className="bd-state">
      <div style={{ fontSize: 18, fontWeight: 700, color: "#e8f0fe" }}>{error || "Business not found"}</div>
      <a href="/axxbiashara" style={{ color: "#3b82f6", fontWeight: 600 }}>Back to directory</a>
    </div>
  );

  const b = business;
  const images = b.images || [];
  const products = b.products || [];
  const categoryItems = b.categoryItems || [];
  const activePromos = (b.promotions || []).filter(p => p.status === "active" && p.isFeatured);
  const hasCoords = b.location.coordinates?.lat && b.location.coordinates?.lng;
  const hasSocials = b.socialMedia && Object.values(b.socialMedia).some(Boolean);

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <div className="bd-root">
      <div className="bd-container">

        {/* ── Back ── */}
        <a href="/axxbiashara" className="bd-back">
          <Svg size={16}><polyline points="15 18 9 12 15 6" /></Svg>
          Back to directory
        </a>

        {/* ── Hero ── */}
        <header className="bd-hero">
          <div className="bd-hero-top">
            {b.logo
              ? <img src={b.logo} alt={b.name} className="bd-logo" />
              : <div className="bd-logo-fallback"><IconStore size={32} /></div>
            }
            <div style={{ minWidth: 0 }}>
              <h1 className="bd-name">{b.name}</h1>
              <div className="bd-chips">
                {(b.categories || []).map((c, i) => <span key={i} className="bd-chip">{c}</span>)}
              </div>
            </div>
          </div>

          <div className="bd-location">
            <IconPin size={16} />
            <span>{b.location.town}, {b.location.county}{b.location.address && `, ${b.location.address}`}</span>
          </div>

          {b.description && <p className="bd-description">{b.description}</p>}

          {b.verificationBadges?.length > 0 && (
            <div className="bd-badges">
              {b.verificationBadges.map((badge, i) => {
                const cfg = BADGE_CONFIG[badge.type] || {};
                return (
                  <span key={i} className={`bd-badge ${cfg.cls || "bd-badge-blue"}`}>
                    {cfg.icon} {cfg.label || badge.type}
                  </span>
                );
              })}
            </div>
          )}

          {/* CTA buttons */}
          <div className="bd-cta-row">
            <a href={`tel:${b.contact.phone}`} className="bd-btn bd-btn-primary">
              <IconPhone size={16} /> Call
            </a>
            <button className="bd-btn bd-btn-green" onClick={() => window.open(`https://wa.me/${b.contact.phone}`)}>
              <IconWhatsApp size={16} /> WhatsApp
            </button>
            {b.contact.email && (
              <a href={`mailto:${b.contact.email}`} className="bd-btn bd-btn-ghost">
                <IconMail size={16} /> Email
              </a>
            )}
            {b.contact.website && (
              <a href={b.contact.website} target="_blank" rel="noopener noreferrer" className="bd-btn bd-btn-ghost">
                <IconGlobe size={16} /> Website
              </a>
            )}
            <button className="bd-btn bd-btn-ghost" onClick={() => navigator.share?.({ title: b.name, url: window.location.href })}>
              <IconShare size={16} /> Share
            </button>
          </div>

          {/* Social links */}
          {hasSocials && (
            <div className="bd-socials">
              {b.socialMedia.facebook && <a href={b.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="bd-social-link">Facebook</a>}
              {b.socialMedia.instagram && <a href={b.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="bd-social-link">Instagram</a>}
              {b.socialMedia.twitter && <a href={b.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="bd-social-link">Twitter</a>}
              {b.socialMedia.linkedin && <a href={b.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="bd-social-link">LinkedIn</a>}
              {b.socialMedia.whatsapp && <a href={`https://wa.me/${b.socialMedia.whatsapp}`} target="_blank" rel="noopener noreferrer" className="bd-social-link">WhatsApp</a>}
            </div>
          )}
        </header>

        {/* ── Stats ── */}
        <div className="bd-stats">
          <div className="bd-stat">
            <div className="bd-stat-value">{b.views || 0}</div>
            <div className="bd-stat-label">Views</div>
          </div>
          <div className="bd-stat">
            <div className="bd-stat-value">{b.rating?.toFixed(1) || "—"}</div>
            <div className="bd-stat-label">Rating</div>
          </div>
          <div className="bd-stat">
            <div className="bd-stat-value">{b.reviewCount || 0}</div>
            <div className="bd-stat-label">Reviews</div>
          </div>
          <div className="bd-stat">
            <div className="bd-stat-value">{b.yearEstablished || "—"}</div>
            <div className="bd-stat-label">Established</div>
          </div>
        </div>

        <div className="bd-layout">

          {/* ═══════════ MAIN COLUMN ═══════════ */}
          <main className="bd-main">

            {/* Gallery — all photos */}
            {images.length > 0 && (
              <section className="bd-card">
                <div className="bd-card-head">
                  <h2 className="bd-card-title">Photos</h2>
                  <span className="bd-count">{images.length}</span>
                </div>
                <div className="bd-gallery">
                  {images.map((img, i) => (
                    <div key={i} className="bd-gallery-item" onClick={() => openLightbox(i)}>
                      <img src={img} alt={`${b.name} photo ${i + 1}`} loading="lazy" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Promotions */}
            {activePromos.length > 0 && (
              <section className="bd-card">
                <div className="bd-card-head">
                  <h2 className="bd-card-title">Active promotions</h2>
                </div>
                {activePromos.map((promo, i) => (
                  <div key={i} className="bd-promo">
                    {promo.imageUrl && <img src={promo.imageUrl} alt={promo.title} className="bd-promo-img" />}
                    <div className="bd-promo-body">
                      <div className="bd-promo-title">{promo.title}</div>
                      <div className="bd-promo-desc">{promo.description}</div>
                      <div className="bd-promo-discount">
                        {promo.discountType === "percentage" ? `${promo.discountValue}% OFF`
                          : promo.discountType === "fixed" ? `KES ${promo.discountValue} OFF`
                            : "Buy One Get One"}
                      </div>
                      <div className="bd-promo-dates">
                        {new Date(promo.startDate).toLocaleDateString()} — {new Date(promo.endDate).toLocaleDateString()}
                      </div>
                      {promo.code && <span className="bd-promo-code">{promo.code}</span>}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Products — all items */}
            {products.length > 0 && (
              <section className="bd-card">
                <div className="bd-card-head">
                  <h2 className="bd-card-title">Products &amp; services</h2>
                  <span className="bd-count">{products.length} {products.length === 1 ? "item" : "items"}</span>
                </div>
                <div className="bd-products-grid">
                  {products.map((product, i) => (
                    <div key={i} className="bd-product">
                      {product.imageUrl
                        ? <img src={product.imageUrl} alt={product.name} className="bd-product-img" loading="lazy" />
                        : <div className="bd-product-placeholder"><IconImage size={28} /></div>
                      }
                      <div className="bd-product-body">
                        <div className="bd-product-name">{product.name}</div>
                        {product.description && <div className="bd-product-desc">{product.description}</div>}
                        {product.price && <div className="bd-product-price">KES {product.price.toLocaleString()}</div>}
                        {product.category && <div className="bd-product-cat">{product.category}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Category items */}
            {categoryItems.length > 0 && (
              <section className="bd-card">
                <div className="bd-card-head">
                  <h2 className="bd-card-title">Category items</h2>
                  <span className="bd-count">{categoryItems.length} {categoryItems.length === 1 ? "item" : "items"}</span>
                </div>
                <div className="bd-products-grid">
                  {categoryItems.map((item, i) => (
                    <div key={i} className="bd-product">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="bd-product-img"
                          loading="lazy"
                          onClick={() => openLightbox(i, categoryItems.filter(ci => ci.image).map(ci => ci.image))}
                          style={{ cursor: "pointer" }}
                        />
                      ) : (
                        <div className="bd-product-placeholder"><IconImage size={28} /></div>
                      )}
                      <div className="bd-product-body">
                        <div className="bd-product-name">{item.name || "Unnamed Item"}</div>
                        {item.price && <div className="bd-product-price">KES {item.price}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Pricelist */}
            {b.pricelist?.url && (
              <section className="bd-card">
                <div className="bd-card-head">
                  <h2 className="bd-card-title">Menu / pricelist</h2>
                </div>
                <a href={getPricelistUrl(b.pricelist)} download target="_blank" rel="noopener noreferrer" className="bd-pricelist">
                  <IconFile size={18} />
                  {b.pricelist.name || "Download pricelist"}
                </a>
              </section>
            )}

            {/* Reviews */}
            <section className="bd-card">
              <div className="bd-card-head">
                <h2 className="bd-card-title">Reviews &amp; ratings</h2>
                <button className="bd-btn bd-btn-ghost bd-btn-sm" onClick={() => setShowReviewForm(!showReviewForm)}>
                  {showReviewForm ? "Cancel" : "Write a review"}
                </button>
              </div>

              {showReviewForm && (
                <form onSubmit={editReviewId ? handleUpdateReview : handleReviewSubmit} className="bd-form">
                  <h3 className="bd-form-title">{editReviewId ? "Edit your review" : "Write a review"}</h3>
                  {!user && (
                    <input
                      className="bd-input"
                      type="text"
                      placeholder="Your name (optional)"
                      value={reviewUserName}
                      onChange={e => setReviewUserName(e.target.value)}
                    />
                  )}
                  <div>
                    <label className="bd-label">Your rating</label>
                    <div className="bd-stars">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span
                          key={star}
                          className={`bd-star ${star <= reviewRating ? "active" : ""}`}
                          onClick={() => setReviewRating(star)}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <input
                    className="bd-input"
                    type="text"
                    placeholder="Review title"
                    value={reviewTitle}
                    onChange={e => setReviewTitle(e.target.value)}
                    required
                  />
                  <textarea
                    className="bd-textarea"
                    placeholder="Share your experience..."
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    required
                    rows={4}
                  />
                  <div className="bd-form-actions">
                    <button type="submit" className="bd-btn bd-btn-primary">
                      {editReviewId ? "Update review" : "Submit review"}
                    </button>
                    {editReviewId && (
                      <button type="button" onClick={handleCancelEdit} className="bd-btn bd-btn-ghost">
                        Cancel
                      </button>
                    )}
                  </div>
                  {reviewMsg && <div className="bd-success">{reviewMsg}</div>}
                </form>
              )}

              {!showReviewForm && reviewMsg && <div className="bd-success" style={{ marginBottom: 16 }}>{reviewMsg}</div>}

              {reviewsLoading ? (
                <div className="bd-empty">Loading reviews…</div>
              ) : reviews.length === 0 ? (
                <div className="bd-empty">
                  <strong>No reviews yet</strong>
                  Be the first to review this business.
                </div>
              ) : (
                <div>
                  {reviews.map(review => (
                    <article key={review._id} className="bd-review">
                      <div className="bd-review-head">
                        <div>
                          <span className="bd-review-user">{review.userName}</span>
                          {review.verified && <span className="bd-review-verified">✓ Verified</span>}
                        </div>
                        <span className="bd-review-date">
                          {new Date(review.createdAt).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <div className="bd-review-rating">
                        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                      </div>
                      <div className="bd-review-title">{review.title}</div>
                      <div className="bd-review-comment">{review.comment}</div>
                      {review.pros && review.pros.length > 0 && (
                        <div className="bd-review-extra">
                          <strong style={{ color: "var(--green)" }}>Pros</strong>{review.pros.join(", ")}
                        </div>
                      )}
                      {review.cons && review.cons.length > 0 && (
                        <div className="bd-review-extra">
                          <strong style={{ color: "var(--danger)" }}>Cons</strong>{review.cons.join(", ")}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </main>

          {/* ═══════════ SIDE COLUMN ═══════════ */}
          <aside className="bd-aside">

            {/* Contact */}
            <section className="bd-card">
              <div className="bd-card-head">
                <h2 className="bd-card-title">Contact</h2>
              </div>
              <div className="bd-info-row">
                <IconPhone size={16} />
                <a href={`tel:${b.contact.phone}`}>{b.contact.phone}</a>
              </div>
              {b.contact.email && (
                <div className="bd-info-row">
                  <IconMail size={16} />
                  <a href={`mailto:${b.contact.email}`}>{b.contact.email}</a>
                </div>
              )}
              {b.location.address && (
                <div className="bd-info-row">
                  <IconPin size={16} />
                  <span>{b.location.address}</span>
                </div>
              )}

              {/* GPS coordinates */}
              {hasCoords && (
                <div className="bd-coords">
                  <div className="bd-coords-vals">
                    <div>
                      <span className="bd-coords-label">Latitude</span>
                      <span className="bd-coords-val">{b.location.coordinates.lat}</span>
                    </div>
                    <div>
                      <span className="bd-coords-label">Longitude</span>
                      <span className="bd-coords-val">{b.location.coordinates.lng}</span>
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${b.location.coordinates.lat},${b.location.coordinates.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bd-btn bd-btn-primary bd-btn-sm"
                  >
                    Open map
                  </a>
                </div>
              )}
            </section>

            {/* Owner */}
            {b.owner && (
              <section className="bd-card">
                <div className="bd-card-head">
                  <h2 className="bd-card-title">Business owner</h2>
                </div>
                <div className="bd-owner">
                  <div className="bd-owner-avatar"><IconUser size={20} /></div>
                  <div style={{ minWidth: 0 }}>
                    <div className="bd-owner-name">{b.owner.name}</div>
                    <div className="bd-owner-detail">{b.owner.email}</div>
                    <div className="bd-owner-detail">{b.owner.phone}</div>
                  </div>
                </div>
              </section>
            )}

            {/* Support */}
            <section className="bd-card">
              <div className="bd-card-head">
                <h2 className="bd-card-title">Axxspace support</h2>
              </div>
              <div className="bd-info-row"><IconMail size={16} /><a href="mailto:info@axxspace.com">info@axxspace.com</a></div>
              <div className="bd-info-row"><IconMail size={16} /><a href="mailto:support@axxspace.com">support@axxspace.com</a></div>
              <div className="bd-info-row"><IconMail size={16} /><a href="mailto:admin@axxspace.com">admin@axxspace.com</a></div>
            </section>

            {/* Admin */}
            {user?.role === "admin" && (
              <section className="bd-card bd-admin">
                <div className="bd-card-head" style={{ marginBottom: 0 }}>
                  <h2 className="bd-card-title" style={{ color: "var(--green)" }}>Admin actions</h2>
                </div>
                <button className="bd-btn bd-btn-green" style={{ marginTop: 12 }} onClick={() => setShowForm(!showForm)}>
                  {showForm ? "Cancel" : "Add announcement"}
                </button>
                {showForm && (
                  <form onSubmit={handleAnnouncement} className="bd-form">
                    <input
                      className="bd-input"
                      type="text"
                      placeholder="Announcement title"
                      value={annTitle}
                      onChange={e => setAnnTitle(e.target.value)}
                      required
                    />
                    <textarea
                      className="bd-textarea"
                      placeholder="Announcement content…"
                      value={annContent}
                      onChange={e => setAnnContent(e.target.value)}
                      required
                    />
                    <button type="submit" className="bd-btn bd-btn-primary">Submit announcement</button>
                  </form>
                )}
                {annMsg && <div className="bd-success" style={{ marginTop: 10 }}>{annMsg}</div>}
              </section>
            )}
          </aside>
        </div>
      </div>

      {/* ── Delete Review Confirmation Modal ── */}
      {deleteConfirmReviewId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmReviewId(null)}>
          <div className="modal-box" style={{ maxWidth: "400px", width: "90%" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setDeleteConfirmReviewId(null)} style={{ position: "absolute", top: "18px", right: "18px", width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#f1f5f9", marginBottom: "12px" }}>Delete review</h3>
            <p style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "16px" }}>Are you sure you want to delete this review?</p>
            <div className="bd-form-actions">
              <button
                onClick={() => handleDeleteReview(deleteConfirmReviewId, user?.name || "Anonymous")}
                className="bd-btn bd-btn-danger"
              >
                Confirm delete
              </button>
              <button
                onClick={() => {
                  setDeleteConfirmReviewId(null);
                  setDeleteUserName("");
                }}
                className="bd-btn bd-btn-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightboxOpen && lightboxImages.length > 0 && (
        <div className="bd-lightbox" onClick={closeLightbox}>
          <button className="bd-lightbox-close" onClick={closeLightbox} aria-label="Close">✕</button>
          <img
            src={lightboxImages[lightboxIndex]}
            alt={`${b.name} photo ${lightboxIndex + 1}`}
            onClick={e => e.stopPropagation()}
          />
          <div className="bd-lightbox-nav" onClick={e => e.stopPropagation()}>
            <button className="bd-lightbox-btn" onClick={prevPhoto} aria-label="Previous photo">‹</button>
            <span>{lightboxIndex + 1} / {lightboxImages.length}</span>
            <button className="bd-lightbox-btn" onClick={nextPhoto} aria-label="Next photo">›</button>
          </div>
        </div>
      )}
    </div>
  );
}