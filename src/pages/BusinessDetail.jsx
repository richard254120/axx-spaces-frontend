import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";

/* ─────────────── GLOBAL STYLE INJECTION ─────────────── */
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
  }

  :root {
    --bg: #060d1a;
    --surface: #0e1f38;
    --surface2: #152840;
    --border: rgba(56, 130, 246, 0.18);
    --border-bright: rgba(56, 130, 246, 0.45);
    --accent: #3b82f6;
    --accent-glow: rgba(59,130,246,0.25);
    --accent-soft: rgba(59,130,246,0.12);
    --text: #e8f0fe;
    --text-dim: #7a93b8;
    --text-muted: #4a6285;
    --green: #22c55e;
    --green-soft: rgba(34,197,94,0.15);
    --gold: #f59e0b;
    --gold-soft: rgba(245,158,11,0.15);
    --purple: #a855f7;
    --purple-soft: rgba(168,85,247,0.15);
    --radius-sm: 10px;
    --radius: 16px;
    --radius-lg: 22px;
    --font-head: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
    --safe-pad: env(safe-area-inset-left, 0px);
  }

  html, body {
    width: 100%;
    overflow-x: hidden;
  }

  .bd-root {
    width: 100%;
    max-width: 100vw;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 15px;
    line-height: 1.6;
    padding: 0;
    overflow-x: hidden;
    position: relative;
  }

  /* ── Top glow bar ── */
  .bd-root::before {
    content: '';
    position: fixed;
    inset: 0 0 auto 0;
    height: 220px;
    background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.22) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  /* ── Back button ── */
  .bd-back {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 14px 16px 6px;
    color: var(--accent);
    font-family: var(--font-head);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-decoration: none;
    width: fit-content;
  }

  .bd-back svg { flex-shrink: 0; }

  /* ── Hero header ── */
  .bd-hero {
    position: relative;
    z-index: 2;
    padding: 12px 16px 24px;
  }

  .bd-logo-row {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 16px;
  }

  .bd-logo {
    width: 72px;
    height: 72px;
    border-radius: 14px;
    object-fit: cover;
    border: 2px solid var(--border-bright);
    flex-shrink: 0;
    background: var(--surface);
  }

  .bd-logo-fallback {
    width: 72px;
    height: 72px;
    border-radius: 14px;
    background: var(--surface2);
    border: 2px solid var(--border-bright);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    flex-shrink: 0;
  }

  .bd-name {
    font-family: var(--font-head);
    font-size: 26px;
    font-weight: 800;
    color: var(--text);
    line-height: 1.1;
    margin-bottom: 4px;
    letter-spacing: -0.02em;
  }

  .bd-category {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
    background: var(--accent-soft);
    display: inline-block;
    padding: 3px 10px;
    border-radius: 20px;
    border: 1px solid var(--border-bright);
  }

  .bd-location {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    color: var(--text-dim);
    margin: 12px 0 14px;
  }

  .bd-description {
    font-size: 14px;
    color: var(--text-dim);
    line-height: 1.7;
    margin-bottom: 16px;
  }

  /* ── Badges ── */
  .bd-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-bottom: 18px;
  }

  .bd-badge {
    font-size: 11px;
    font-weight: 700;
    padding: 5px 11px;
    border-radius: 20px;
    letter-spacing: 0.03em;
  }
  .bd-badge-green  { background: var(--green-soft);  color: var(--green);  border: 1px solid rgba(34,197,94,0.3);  }
  .bd-badge-blue   { background: var(--accent-soft); color: var(--accent); border: 1px solid var(--border-bright); }
  .bd-badge-purple { background: var(--purple-soft); color: var(--purple); border: 1px solid rgba(168,85,247,0.3); }
  .bd-badge-gold   { background: var(--gold-soft);   color: var(--gold);   border: 1px solid rgba(245,158,11,0.3); }

  /* ── CTA pill buttons ── */
  .bd-cta-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 9px;
    margin-bottom: 16px;
  }

  .bd-cta-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 13px 10px;
    border-radius: var(--radius-sm);
    font-family: var(--font-head);
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
    border: none;
    cursor: pointer;
    letter-spacing: 0.02em;
    transition: opacity 0.2s, transform 0.15s;
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
  }
  .bd-cta-btn:active { transform: scale(0.97); opacity: 0.85; }

  .bd-cta-primary { background: var(--accent); color: #fff; }
  .bd-cta-green   { background: #15803d; color: #4ade80; border: 1px solid #22c55e; }
  .bd-cta-ghost   { background: var(--surface2); color: var(--text-dim); border: 1px solid var(--border); }

  .bd-cta-btn.span2 { grid-column: span 2; }

  /* ══════════════════════════════════════════
     GALLERY — shows ALL uploaded photos in a
     responsive masonry-style grid with NO cap
  ══════════════════════════════════════════ */
  .bd-gallery {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    margin-bottom: 20px;
  }

  /* First photo is bigger — hero treatment */
  .bd-gallery-item {
    overflow: hidden;
    border-radius: 8px;
    background: var(--surface);
  }

  .bd-gallery-item:first-child {
    grid-column: span 3;
    aspect-ratio: 16/7;
  }

  .bd-gallery-item:not(:first-child) {
    aspect-ratio: 1;
  }

  .bd-gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }

  .bd-gallery-item img:hover {
    transform: scale(1.04);
  }

  /* Photo count badge */
  .bd-photo-count {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--accent-soft);
    border: 1px solid var(--border-bright);
    color: var(--accent);
    font-size: 12px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 20px;
    margin-bottom: 10px;
    font-family: var(--font-head);
    letter-spacing: 0.04em;
  }

  /* ── Social links ── */
  .bd-socials {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .bd-social-link {
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    background: var(--surface2);
    color: var(--text-dim);
    border: 1px solid var(--border);
    text-decoration: none;
    transition: border-color 0.2s, color 0.2s;
  }
  .bd-social-link:hover { border-color: var(--accent); color: var(--accent); }

  /* ── Divider line ── */
  .bd-divider {
    height: 1px;
    background: var(--border);
    margin: 0 16px;
  }

  /* ── Section wrapper ── */
  .bd-section {
    padding: 22px 16px;
    position: relative;
    z-index: 2;
  }

  .bd-section-title {
    font-family: var(--font-head);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 14px;
  }

  /* ── Hours grid ── */
  .bd-hours-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .bd-hours-item {
    background: var(--surface);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    padding: 10px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .bd-hours-day    { font-size: 12px; font-weight: 600; color: var(--text); }
  .bd-hours-time   { font-size: 11px; color: var(--text-dim); }
  .bd-hours-closed { color: var(--text-muted); }

  /* ── Promo cards ── */
  .bd-promo-card {
    background: var(--surface);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    overflow: hidden;
    margin-bottom: 12px;
  }

  .bd-promo-img      { width: 100%; height: 150px; object-fit: cover; }
  .bd-promo-body     { padding: 14px; }
  .bd-promo-title    { font-family: var(--font-head); font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
  .bd-promo-desc     { font-size: 13px; color: var(--text-dim); margin-bottom: 10px; line-height: 1.5; }
  .bd-promo-discount { font-size: 22px; font-weight: 800; color: var(--green); margin-bottom: 6px; font-family: var(--font-head); }
  .bd-promo-dates    { font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
  .bd-promo-code     { font-size: 12px; color: var(--accent); background: var(--accent-soft); border: 1px solid var(--border-bright); padding: 4px 10px; border-radius: 6px; display: inline-block; font-weight: 700; letter-spacing: 0.06em; }

  /* ══════════════════════════════════════════
     PRODUCTS GRID — auto-fill so ALL products
     appear regardless of how many there are
  ══════════════════════════════════════════ */
  .bd-products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }

  .bd-product-card {
    background: var(--surface);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .bd-product-img {
    width: 100%;
    height: 120px;
    object-fit: cover;
    display: block;
    flex-shrink: 0;
  }

  .bd-product-img-placeholder {
    width: 100%;
    height: 120px;
    background: var(--surface2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    flex-shrink: 0;
  }

  .bd-product-body  { padding: 10px; flex: 1; display: flex; flex-direction: column; }
  .bd-product-name  { font-family: var(--font-head); font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 4px; line-height: 1.3; }
  .bd-product-desc  { font-size: 11px; color: var(--text-dim); margin-bottom: 6px; line-height: 1.4; flex: 1; }
  .bd-product-price { font-size: 15px; font-weight: 800; color: var(--green); font-family: var(--font-head); }
  .bd-product-cat   { font-size: 11px; color: var(--text-muted); margin-top: 3px; }

  /* Product count badge */
  .bd-product-count {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--green-soft);
    border: 1px solid rgba(34,197,94,0.3);
    color: var(--green);
    font-size: 12px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 20px;
    margin-bottom: 14px;
    font-family: var(--font-head);
    letter-spacing: 0.04em;
  }

  /* ── Stats ── */
  .bd-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .bd-stat {
    background: var(--surface);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    padding: 12px 6px;
    text-align: center;
  }

  .bd-stat-value { font-family: var(--font-head); font-size: 18px; font-weight: 800; color: var(--accent); line-height: 1; margin-bottom: 4px; }
  .bd-stat-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }

  /* ── Contact info ── */
  .bd-contact-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
    font-size: 14px;
    color: var(--text-dim);
  }
  .bd-contact-item:last-child { border-bottom: none; }
  .bd-contact-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }

  /* ── Pricelist button ── */
  .bd-pricelist-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    background: var(--surface2);
    border: 1px solid var(--border-bright);
    border-radius: var(--radius-sm);
    color: var(--accent);
    font-family: var(--font-head);
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
    letter-spacing: 0.04em;
  }

  /* ── Support card ── */
  .bd-support-card {
    margin: 0 16px 16px;
    background: var(--surface);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    padding: 16px;
    position: relative;
    z-index: 2;
  }

  .bd-support-title { font-family: var(--font-head); font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); margin-bottom: 10px; }
  .bd-support-item  { font-size: 13px; color: var(--text-dim); margin-bottom: 4px; }

  /* ── Owner card ── */
  .bd-owner-card {
    display: flex;
    align-items: center;
    gap: 14px;
    background: var(--surface);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    padding: 16px;
  }

  .bd-owner-avatar {
    width: 48px;
    height: 48px;
    background: var(--accent-soft);
    border: 2px solid var(--border-bright);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
  }

  .bd-owner-name   { font-family: var(--font-head); font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 2px; }
  .bd-owner-detail { font-size: 12px; color: var(--text-dim); }

  /* ── Admin section ── */
  .bd-admin-section {
    margin: 0 16px 20px;
    background: var(--surface);
    border-radius: var(--radius);
    border: 1px solid rgba(34,197,94,0.25);
    padding: 16px;
    position: relative;
    z-index: 2;
  }

  .bd-admin-title { font-family: var(--font-head); font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--green); margin-bottom: 12px; }

  .bd-toggle-btn {
    width: 100%;
    padding: 11px 16px;
    background: var(--green-soft);
    color: var(--green);
    border: 1px solid rgba(34,197,94,0.35);
    border-radius: var(--radius-sm);
    font-family: var(--font-head);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
  }

  .bd-form { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }

  .bd-input, .bd-textarea {
    padding: 11px 13px;
    background: rgba(6,13,26,0.6);
    border: 1px solid var(--border-bright);
    border-radius: var(--radius-sm);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 14px;
    width: 100%;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
  }
  .bd-textarea { min-height: 90px; resize: vertical; }
  .bd-input::placeholder, .bd-textarea::placeholder { color: var(--text-muted); }

  .bd-submit-btn {
    padding: 13px;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    font-family: var(--font-head);
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
  }

  .bd-success { padding: 10px 13px; background: var(--green-soft); border: 1px solid rgba(34,197,94,0.3); border-radius: var(--radius-sm); color: var(--green); font-size: 13px; margin-top: 8px; }

  /* ── Loading / error states ── */
  .bd-state-center {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--bg);
    color: var(--text-dim);
    font-family: var(--font-head);
    gap: 12px;
    padding: 20px;
    text-align: center;
  }

  .bd-state-icon { font-size: 40px; margin-bottom: 6px; }
  .bd-state-msg  { font-size: 16px; font-weight: 600; }

  /* ── Spacer at bottom for safe area ── */
  .bd-safe-bottom { height: env(safe-area-inset-bottom, 20px); min-height: 24px; }

  /* ── Scrollable x for social row ── */
  .bd-scroll-x {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 4px;
    scrollbar-width: none;
  }
  .bd-scroll-x::-webkit-scrollbar { display: none; }
  .bd-scroll-x-inner { display: flex; gap: 8px; width: max-content; }

  /* ── Reviews section ── */
  .bd-reviews-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
  }
  .bd-reviews-title { font-family: var(--font-head); font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); }
  .bd-review-btn {
    padding: 8px 14px;
    background: var(--accent-soft);
    color: var(--accent);
    border: 1px solid var(--border-bright);
    border-radius: var(--radius-sm);
    font-family: var(--font-head);
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
  }
  .bd-review-card {
    background: var(--surface);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    padding: 14px;
    margin-bottom: 10px;
  }
  .bd-review-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
  }
  .bd-review-user {
    font-family: var(--font-head);
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
  }
  .bd-review-date {
    font-size: 11px;
    color: var(--text-muted);
  }
  .bd-review-rating {
    color: var(--gold);
    font-size: 14px;
    margin-bottom: 6px;
  }
  .bd-review-title {
    font-family: var(--font-head);
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 4px;
  }
  .bd-review-comment {
    font-size: 13px;
    color: var(--text-dim);
    line-height: 1.6;
  }
  .bd-review-verified {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: var(--green-soft);
    color: var(--green);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 700;
    margin-left: 8px;
  }
  .bd-rating-stars {
    display: flex;
    gap: 2px;
  }
  .bd-rating-star {
    cursor: pointer;
    font-size: 24px;
    color: var(--text-muted);
    transition: color 0.2s;
  }
  .bd-rating-star.active { color: var(--gold); }
  .bd-rating-star:hover { color: var(--gold); }
  .bd-no-reviews {
    text-align: center;
    padding: 30px 20px;
    color: var(--text-muted);
    font-size: 14px;
  }

  /* ── Lightbox overlay ── */
  .bd-lightbox {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.94);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }

  .bd-lightbox img {
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 10px;
  }

  .bd-lightbox-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    background: rgba(255,255,255,0.1);
    border: none;
    border-radius: 50%;
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bd-lightbox-nav {
    display: flex;
    align-items: center;
    gap: 16px;
    color: rgba(255,255,255,0.6);
    font-size: 13px;
    font-family: var(--font-head);
  }

  .bd-lightbox-btn {
    width: 44px;
    height: 44px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 50%;
    color: #fff;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }
  .bd-lightbox-btn:hover { background: rgba(255,255,255,0.18); }
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
      setReviewMsg("Failed to load reviews. Please try again.");
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
  const openLightbox = (index) => { setLightboxIndex(index); setLightboxOpen(true); };
  const closeLightbox = () => setLightboxOpen(false);
  const prevPhoto = () => setLightboxIndex(i => (i - 1 + b.images.length) % b.images.length);
  const nextPhoto = () => setLightboxIndex(i => (i + 1) % b.images.length);

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
    <div className="bd-state-center">
      <div className="bd-state-icon">⟳</div>
      <div className="bd-state-msg">Loading…</div>
    </div>
  );

  if (error || !business) return (
    <div className="bd-state-center">
      <div className="bd-state-icon">✕</div>
      <div className="bd-state-msg">{error || "Business not found"}</div>
    </div>
  );

  const b = business;
  const images = b.images || [];
  const products = b.products || [];
  const activePromos = (b.promotions || []).filter(p => p.status === "active" && p.isFeatured);

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <div className="bd-root">

      {/* ── Back ── */}
      <a href="/axxbiashara" className="bd-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Directory
      </a>

      {/* ── Hero ── */}
      <div className="bd-hero">
        <div className="bd-logo-row">
          {b.logo
            ? <img src={b.logo} alt={b.name} className="bd-logo" />
            : <div className="bd-logo-fallback">🏪</div>
          }
          <div>
            <h1 className="bd-name">{b.name}</h1>
            <span className="bd-category">{(b.categories || []).join(", ")}</span>
          </div>
        </div>

        <div className="bd-location">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          {b.location.town}, {b.location.county}{b.location.address && `, ${b.location.address}`}
        </div>

        {/* GPS Coordinates */}
        {b.location.coordinates?.lat && b.location.coordinates?.lng && (
          <div style={{
            background: "rgba(59, 130, 246, 0.08)",
            border: "1px solid rgba(59, 130, 246, 0.25)",
            borderRadius: "8px",
            padding: "10px 14px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.06em" }}>Latitude</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#e8f0fe", fontFamily: "monospace" }}>{b.location.coordinates.lat}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.06em" }}>Longitude</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#e8f0fe", fontFamily: "monospace" }}>{b.location.coordinates.lng}</span>
              </div>
            </div>
            <a
              href={`https://www.google.com/maps?q=${b.location.coordinates.lat},${b.location.coordinates.lng}`}
              target="_blank"
              rel="noreferrer"
              style={{
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "8px 14px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              🗺️ Open Map
            </a>
          </div>
        )}

        <p className="bd-description">{b.description}</p>

        {/* Badges */}
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
          <a href={`tel:${b.contact.phone}`} className="bd-cta-btn bd-cta-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
            Call
          </a>
          <button className="bd-cta-btn bd-cta-green" onClick={() => window.open(`https://wa.me/${b.contact.phone}`)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.132.554 4.133 1.524 5.875L.057 23.986l6.305-1.651A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.914 0-3.708-.504-5.254-1.385l-.377-.222-3.906 1.023 1.041-3.808-.245-.396A9.957 9.957 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
            WhatsApp
          </button>
          {b.contact.email && (
            <a href={`mailto:${b.contact.email}`} className="bd-cta-btn bd-cta-ghost">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Email
            </a>
          )}
          {b.contact.website && (
            <a href={b.contact.website} target="_blank" rel="noopener noreferrer" className="bd-cta-btn bd-cta-ghost">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Website
            </a>
          )}
          <button className="bd-cta-btn bd-cta-ghost span2" onClick={() => navigator.share?.({ title: b.name, url: window.location.href })}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share Business
          </button>
        </div>

        {/* ══════════════════════════════════════
            GALLERY — ALL photos, no slice cap
            First photo = hero (full width)
            Rest = 3-column grid, tap to enlarge
        ══════════════════════════════════════ */}
        {images.length > 0 && (
          <div>
            {/* Photo count badge */}
            <div className="bd-photo-count">
              📷 {images.length} {images.length === 1 ? "Photo" : "Photos"}
            </div>

            <div className="bd-gallery">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="bd-gallery-item"
                  onClick={() => openLightbox(i)}
                  style={{ cursor: "pointer" }}
                >
                  <img src={img} alt={`${b.name} photo ${i + 1}`} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social links */}
        {b.socialMedia && Object.values(b.socialMedia).some(Boolean) && (
          <div className="bd-scroll-x">
            <div className="bd-scroll-x-inner">
              {b.socialMedia.facebook && <a href={b.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="bd-social-link">📘 Facebook</a>}
              {b.socialMedia.instagram && <a href={b.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="bd-social-link">📸 Instagram</a>}
              {b.socialMedia.twitter && <a href={b.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="bd-social-link">🐦 Twitter</a>}
              {b.socialMedia.linkedin && <a href={b.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="bd-social-link">💼 LinkedIn</a>}
              {b.socialMedia.whatsapp && <a href={`https://wa.me/${b.socialMedia.whatsapp}`} target="_blank" rel="noopener noreferrer" className="bd-social-link">💬 WhatsApp</a>}
            </div>
          </div>
        )}
      </div>

      <div className="bd-divider" />

      {/* ── Stats ── */}
      <div className="bd-section">
        <p className="bd-section-title">Overview</p>
        <div className="bd-stats-grid">
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
            <div className="bd-stat-label">Est.</div>
          </div>
        </div>
      </div>

      <div className="bd-divider" />

      {/* ── Reviews ── */}
      <div className="bd-section">
        <div className="bd-reviews-header">
          <p className="bd-reviews-title">Reviews & Ratings</p>
          <button className="bd-review-btn" onClick={() => setShowReviewForm(!showReviewForm)}>
            {showReviewForm ? "✕ Cancel" : "+ Write Review"}
          </button>
        </div>

        {/* Review form */}
        {showReviewForm && (
          <form onSubmit={editReviewId ? handleUpdateReview : handleReviewSubmit} className="bd-form" style={{ marginBottom: "16px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)", marginBottom: "12px" }}>
              {editReviewId ? "Edit Your Review" : "Write a Review"}
            </h4>
            {!user && (
              <input
                className="bd-input"
                type="text"
                placeholder="Your name (optional)"
                value={reviewUserName}
                onChange={e => setReviewUserName(e.target.value)}
              />
            )}
            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>Your Rating</label>
              <div className="bd-rating-stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    className={`bd-rating-star ${star <= reviewRating ? "active" : ""}`}
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
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" className="bd-submit-btn" style={{ flex: 1 }}>
                {editReviewId ? "Update Review" : "Submit Review"}
              </button>
              {editReviewId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bd-submit-btn"
                  style={{ background: "var(--surface2)", color: "var(--text-dim)", flex: 1 }}
                >
                  Cancel
                </button>
              )}
            </div>
            {reviewMsg && <div className="bd-success">{reviewMsg}</div>}
          </form>
        )}

        {/* Reviews list */}
        {reviewsLoading ? (
          <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="bd-no-reviews">
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>⭐</div>
            <div>No reviews yet</div>
            <div style={{ fontSize: "12px", marginTop: "4px" }}>Be the first to review this business</div>
          </div>
        ) : (
          <div>
            {reviews.map(review => (
              <div key={review._id} className="bd-review-card">
                <div className="bd-review-header">
                  <div>
                    <span className="bd-review-user">{review.userName}</span>
                    {review.verified && <span className="bd-review-verified">✓ Verified</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="bd-review-date">
                      {new Date(review.createdAt).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>
                <div className="bd-review-rating">
                  {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                </div>
                <div className="bd-review-title">{review.title}</div>
                <div className="bd-review-comment">{review.comment}</div>
                {review.pros && review.pros.length > 0 && (
                  <div style={{ marginTop: "8px" }}>
                    <div style={{ fontSize: "11px", color: "var(--green)", fontWeight: 700, marginBottom: "4px" }}>Pros:</div>
                    <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>{review.pros.join(", ")}</div>
                  </div>
                )}
                {review.cons && review.cons.length > 0 && (
                  <div style={{ marginTop: "8px" }}>
                    <div style={{ fontSize: "11px", color: "#ef4444", fontWeight: 700, marginBottom: "4px" }}>Cons:</div>
                    <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>{review.cons.join(", ")}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bd-divider" />

      {/* ── Hours ── */}
      <div className="bd-section">
        <p className="bd-section-title">Business Hours</p>
        <div className="bd-hours-grid">
          {Object.entries(b.businessHours || {}).map(([day, hrs]) => (
            <div key={day} className="bd-hours-item">
              <span className="bd-hours-day">{day.charAt(0).toUpperCase() + day.slice(1, 3)}</span>
              <span className={`bd-hours-time ${hrs.closed ? "bd-hours-closed" : ""}`}>
                {hrs.closed ? "Closed" : `${formatTime(hrs.open)}–${formatTime(hrs.close)}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Promotions ── */}
      {activePromos.length > 0 && (
        <>
          <div className="bd-divider" />
          <div className="bd-section">
            <p className="bd-section-title">Active Promotions</p>
            {activePromos.map((promo, i) => (
              <div key={i} className="bd-promo-card">
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
          </div>
        </>
      )}

      {/* ══════════════════════════════════════
          PRODUCTS — ALL items, auto-fill grid
          No slice, no hardcoded column count
      ══════════════════════════════════════ */}
      {products.length > 0 && (
        <>
          <div className="bd-divider" />
          <div className="bd-section">
            <p className="bd-section-title">Products & Services</p>

            {/* Product count badge */}
            <div className="bd-product-count">
              🛍 {products.length} {products.length === 1 ? "Item" : "Items"}
            </div>

            <div className="bd-products-grid">
              {products.map((product, i) => (
                <div key={i} className="bd-product-card">
                  {product.imageUrl
                    ? <img src={product.imageUrl} alt={product.name} className="bd-product-img" loading="lazy" />
                    : <div className="bd-product-img-placeholder">🛍</div>
                  }
                  <div className="bd-product-body">
                    <div className="bd-product-name">{product.name}</div>
                    {product.description && (
                      <div className="bd-product-desc">{product.description}</div>
                    )}
                    {product.price && (
                      <div className="bd-product-price">KES {product.price.toLocaleString()}</div>
                    )}
                    {product.category && (
                      <div className="bd-product-cat">{product.category}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Pricelist ── */}
      {b.pricelist?.url && (
        <>
          <div className="bd-divider" />
          <div className="bd-section">
            <p className="bd-section-title">Menu / Pricelist</p>
            <a href={`/api/uploads/pricelist/${b.pricelist.publicId || b.pricelist.url.split('/').pop()}`} target="_blank" rel="noopener noreferrer" className="bd-pricelist-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              {b.pricelist.name || "Download Pricelist"}
            </a>
          </div>
        </>
      )}

      <div className="bd-divider" />

      {/* ── Contact ── */}
      <div className="bd-section">
        <p className="bd-section-title">Contact</p>
        <div className="bd-contact-item">
          <span className="bd-contact-icon">📞</span>
          <a href={`tel:${b.contact.phone}`} style={{ color: "inherit", textDecoration: "none" }}>{b.contact.phone}</a>
        </div>
        {b.contact.email && (
          <div className="bd-contact-item">
            <span className="bd-contact-icon">✉️</span>
            <a href={`mailto:${b.contact.email}`} style={{ color: "inherit", textDecoration: "none" }}>{b.contact.email}</a>
          </div>
        )}
        {b.location.address && (
          <div className="bd-contact-item">
            <span className="bd-contact-icon">📍</span>
            {b.location.address}
          </div>
        )}
      </div>

      {/* ── Owner ── */}
      {b.owner && (
        <>
          <div className="bd-divider" />
          <div className="bd-section">
            <p className="bd-section-title">Business Owner</p>
            <div className="bd-owner-card">
              <div className="bd-owner-avatar">👤</div>
              <div>
                <div className="bd-owner-name">{b.owner.name}</div>
                <div className="bd-owner-detail">{b.owner.email}</div>
                <div className="bd-owner-detail">{b.owner.phone}</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Support ── */}
      <div className="bd-support-card">
        <div className="bd-support-title">Axxspace Support</div>
        <div className="bd-support-item">📧 info@axxspace.com</div>
        <div className="bd-support-item">🛠 support@axxspace.com</div>
        <div className="bd-support-item">⚙️ admin@axxspace.com</div>
      </div>

      {/* ── Admin ── */}
      {user?.role === "admin" && (
        <div className="bd-admin-section">
          <p className="bd-admin-title">Admin Actions</p>
          <button className="bd-toggle-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? "✕ Cancel" : "+ Add Announcement"}
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
              <button type="submit" className="bd-submit-btn">Submit Announcement</button>
            </form>
          )}
          {annMsg && <div className="bd-success">{annMsg}</div>}
        </div>
      )}

      <div className="bd-safe-bottom" />

      {/* ── Delete Review Confirmation Modal ── */}
      {deleteConfirmReviewId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmReviewId(null)}>
          <div className="modal-box" style={{ maxWidth: "400px", width: "90%" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setDeleteConfirmReviewId(null)} style={{ position: "absolute", top: "18px", right: "18px", width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#f1f5f9", marginBottom: "12px" }}>Delete Review</h3>
            <p style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "16px" }}>Are you sure you want to delete this review?</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => {
                  handleDeleteReview(deleteConfirmReviewId, user?.name || "Anonymous");
                }}
                className="bd-submit-btn"
                style={{ background: "#ef4444", flex: 1 }}
              >
                Confirm Delete
              </button>
              <button
                onClick={() => {
                  setDeleteConfirmReviewId(null);
                  setDeleteUserName("");
                }}
                className="bd-submit-btn"
                style={{ background: "var(--surface2)", color: "var(--text-dim)", flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          LIGHTBOX — tap any photo to enlarge,
          arrow keys / buttons to navigate
      ══════════════════════════════════════ */}
      {lightboxOpen && images.length > 0 && (
        <div className="bd-lightbox" onClick={closeLightbox}>
          <button className="bd-lightbox-close" onClick={closeLightbox}>✕</button>

          <img
            src={images[lightboxIndex]}
            alt={`${b.name} photo ${lightboxIndex + 1}`}
            onClick={e => e.stopPropagation()}
          />

          <div className="bd-lightbox-nav" onClick={e => e.stopPropagation()}>
            <button className="bd-lightbox-btn" onClick={prevPhoto}>‹</button>
            <span>{lightboxIndex + 1} / {images.length}</span>
            <button className="bd-lightbox-btn" onClick={nextPhoto}>›</button>
          </div>
        </div>
      )}
    </div>
  );
}