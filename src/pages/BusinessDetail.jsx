import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { getPricelistUrl } from "../utils/fileLinks";
import { optimizeImage, IMG_WIDTH } from "../utils/imageUrl";

/* ─────────────── GLOBAL STYLE INJECTION ─────────────── */
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');

  .bd-root *, .bd-root *::before, .bd-root *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
  }

  .bd-root {
    --bg: #070e1c;
    --surface: #0e1a2f;
    --surface2: #14233c;
    --surface3: #1a2d4a;
    --border: rgba(120, 160, 230, 0.14);
    --border-strong: rgba(120, 160, 230, 0.32);
    --accent: #3b82f6;
    --accent-hover: #2f6fe0;
    --accent-soft: rgba(59, 130, 246, 0.12);
    --text: #eaf1fe;
    --text-dim: #94a9ca;
    --text-muted: #61789f;
    --green: #22c55e;
    --green-soft: rgba(34, 197, 94, 0.12);
    --gold: #f5b014;
    --gold-soft: rgba(245, 176, 20, 0.12);
    --purple: #a78bfa;
    --purple-soft: rgba(167, 139, 250, 0.12);
    --danger: #ef4444;
    --danger-soft: rgba(239, 68, 68, 0.12);
    --r-sm: 8px;
    --r: 12px;
    --r-lg: 16px;
    --shadow: 0 8px 28px rgba(0, 0, 0, 0.28);
    --font-head: 'Manrope', sans-serif;
    --font-body: 'Inter', sans-serif;

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
  .bd-root svg { flex-shrink: 0; }

  /* ── Layout ── */
  .bd-container { max-width: 1120px; margin: 0 auto; padding: 0 16px 48px; }

  .bd-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    margin-top: 16px;
  }
  .bd-main, .bd-aside { display: flex; flex-direction: column; gap: 16px; min-width: 0; }

  @media (min-width: 960px) {
    .bd-container { padding: 0 24px 64px; }
    .bd-layout { grid-template-columns: minmax(0, 1fr) 340px; gap: 20px; }
    .bd-aside { position: sticky; top: 68px; align-self: start; }
  }

  /* ── Top bar ── */
  .bd-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0 14px;
  }
  .bd-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--text-dim);
    font-size: 14px;
    font-weight: 600;
    transition: color 0.2s;
  }
  .bd-back:hover { color: var(--accent); }
  .bd-crumb { font-size: 13px; color: var(--text-muted); }

  /* ── Card ── */
  .bd-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    padding: 22px;
    scroll-margin-top: 72px;
  }
  .bd-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
  }
  .bd-card-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-head);
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.01em;
  }
  .bd-card-title svg { color: var(--accent); }
  .bd-count {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-dim);
    background: var(--surface2);
    border: 1px solid var(--border);
    padding: 3px 10px;
    border-radius: 999px;
    white-space: nowrap;
  }

  /* ── Hero ── */
  .bd-hero {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    overflow: hidden;
  }
  .bd-cover {
    position: relative;
    height: 150px;
    background:
      radial-gradient(circle at 20% 20%, rgba(59,130,246,0.35), transparent 55%),
      linear-gradient(135deg, #12284a 0%, #0b1730 100%);
    background-size: cover;
    background-position: center;
  }
  .bd-cover::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(7,14,28,0.15) 0%, rgba(14,26,47,0.92) 100%);
  }
  @media (min-width: 640px) { .bd-cover { height: 200px; } }

  .bd-hero-body { position: relative; padding: 0 22px 22px; }
  .bd-hero-top {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: -44px;
  }
  @media (min-width: 640px) {
    .bd-hero-top { flex-direction: row; align-items: flex-end; gap: 20px; margin-top: -56px; }
  }

  .bd-logo, .bd-logo-fallback {
    position: relative;
    z-index: 1;
    width: 92px;
    height: 92px;
    border-radius: var(--r-lg);
    border: 3px solid var(--surface);
    background: var(--surface3);
    box-shadow: var(--shadow);
  }
  @media (min-width: 640px) { .bd-logo, .bd-logo-fallback { width: 112px; height: 112px; } }
  .bd-logo { object-fit: cover; }
  .bd-logo-fallback { display: flex; align-items: center; justify-content: center; color: var(--text-muted); }

  .bd-name {
    font-family: var(--font-head);
    font-size: clamp(22px, 4vw, 32px);
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.02em;
  }

  .bd-rating-line { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 8px; font-size: 14px; color: var(--text-dim); }
  .bd-rating-line strong { color: var(--text); font-weight: 700; }

  .bd-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
  .bd-chip {
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
    background: var(--accent-soft);
    border: 1px solid var(--border-strong);
    padding: 3px 11px;
    border-radius: 999px;
  }

  .bd-meta { display: flex; flex-wrap: wrap; gap: 8px 22px; margin-top: 18px; font-size: 14px; color: var(--text-dim); }
  .bd-meta-item { display: inline-flex; align-items: center; gap: 8px; }
  .bd-meta-item svg { color: var(--accent); }

  .bd-description { margin-top: 16px; font-size: 15px; color: var(--text-dim); line-height: 1.75; max-width: 72ch; }

  .bd-badges { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
  .bd-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    padding: 5px 11px;
    border-radius: 999px;
  }
  .bd-badge-green  { background: var(--green-soft);  color: var(--green);  border: 1px solid rgba(34,197,94,0.3); }
  .bd-badge-blue   { background: var(--accent-soft); color: #6aa5ff;       border: 1px solid var(--border-strong); }
  .bd-badge-purple { background: var(--purple-soft); color: var(--purple); border: 1px solid rgba(167,139,250,0.3); }
  .bd-badge-gold   { background: var(--gold-soft);   color: var(--gold);   border: 1px solid rgba(245,176,20,0.3); }

  /* ── Buttons ── */
  .bd-cta-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 22px; }
  @media (min-width: 640px) { .bd-cta-row { grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); } }

  .bd-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 11px 14px;
    border-radius: var(--r-sm);
    border: 1px solid transparent;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, transform 0.15s;
    width: 100%;
    white-space: nowrap;
  }
  .bd-btn:active { transform: scale(0.98); }
  .bd-btn-primary { background: var(--accent); color: #fff; }
  .bd-btn-primary:hover { background: var(--accent-hover); }
  .bd-btn-green { background: var(--green-soft); color: var(--green); border-color: rgba(34,197,94,0.4); }
  .bd-btn-green:hover { background: rgba(34,197,94,0.2); }
  .bd-btn-ghost { background: var(--surface2); color: var(--text); border-color: var(--border); }
  .bd-btn-ghost:hover { border-color: var(--border-strong); background: var(--surface3); }
  .bd-btn-danger { background: var(--danger); color: #fff; }
  .bd-btn-danger:hover { filter: brightness(1.08); }
  .bd-btn-sm { width: auto; padding: 8px 14px; font-size: 13px; }

  /* ── Socials ── */
  .bd-socials { display: flex; gap: 8px; margin-top: 16px; overflow-x: auto; scrollbar-width: none; }
  .bd-socials::-webkit-scrollbar { display: none; }
  .bd-social-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
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

  /* ── Section nav ── */
  .bd-nav {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    gap: 6px;
    margin-top: 16px;
    padding: 10px 0;
    background: rgba(7, 14, 28, 0.9);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border);
    overflow-x: auto;
    scrollbar-width: none;
  }
  .bd-nav::-webkit-scrollbar { display: none; }
  .bd-nav-btn {
    flex-shrink: 0;
    padding: 7px 14px;
    border-radius: 999px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-dim);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .bd-nav-btn:hover { background: var(--surface2); color: var(--text); }

  /* ── Stats ── */
  .bd-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-top: 16px;
  }
  @media (min-width: 640px) { .bd-stats { grid-template-columns: repeat(4, 1fr); } }
  .bd-stat {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r);
  }
  .bd-stat-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent-soft);
    color: var(--accent);
  }
  .bd-stat-value { font-family: var(--font-head); font-size: 20px; font-weight: 800; line-height: 1.1; }
  .bd-stat-label { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

  /* ── Gallery ── */
  .bd-gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .bd-gallery-item {
    position: relative;
    overflow: hidden;
    border-radius: var(--r-sm);
    background: var(--surface2);
    cursor: pointer;
    aspect-ratio: 1;
    border: 1px solid var(--border);
  }
  .bd-gallery-item:first-child { grid-column: span 3; aspect-ratio: 16 / 8; }
  @media (min-width: 640px) {
    .bd-gallery { grid-template-columns: repeat(4, 1fr); }
    .bd-gallery-item:first-child { grid-column: span 2; grid-row: span 2; aspect-ratio: auto; }
  }
  .bd-gallery-item img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.35s ease; }
  .bd-gallery-item:hover img { transform: scale(1.05); }

  /* ── Promotions ── */
  .bd-promo-list { display: grid; gap: 14px; }
  @media (min-width: 640px) { .bd-promo-list { grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); } }
  .bd-promo {
    border: 1px solid var(--border);
    background: var(--surface2);
    border-radius: var(--r);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .bd-promo-img { width: 100%; height: 150px; object-fit: cover; display: block; }
  .bd-promo-body { padding: 16px; display: flex; flex-direction: column; flex: 1; }
  .bd-promo-title { font-family: var(--font-head); font-size: 16px; font-weight: 700; margin-bottom: 4px; }
  .bd-promo-desc { font-size: 14px; color: var(--text-dim); margin-bottom: 12px; flex: 1; }
  .bd-promo-discount { font-family: var(--font-head); font-size: 22px; font-weight: 800; color: var(--green); margin-bottom: 4px; }
  .bd-promo-dates { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); margin-bottom: 12px; }
  .bd-promo-code {
    align-self: flex-start;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--accent);
    background: var(--accent-soft);
    border: 1px dashed var(--border-strong);
    padding: 5px 11px;
    border-radius: 6px;
  }

  /* ── Products ── */
  .bd-products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; }
  .bd-product {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--r);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: border-color 0.2s, transform 0.2s;
  }
  .bd-product:hover { border-color: var(--border-strong); transform: translateY(-2px); }
  .bd-product-img, .bd-product-placeholder { width: 100%; aspect-ratio: 4 / 3; display: block; flex-shrink: 0; }
  .bd-product-img { object-fit: cover; }
  .bd-product-placeholder { background: var(--bg); display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
  .bd-product-body { padding: 12px 14px 14px; display: flex; flex-direction: column; flex: 1; gap: 4px; }
  .bd-product-cat { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); }
  .bd-product-name { font-family: var(--font-head); font-size: 14px; font-weight: 700; line-height: 1.3; }
  .bd-product-desc { font-size: 12.5px; color: var(--text-dim); line-height: 1.5; flex: 1; }
  .bd-product-price { font-size: 15px; font-weight: 700; color: var(--green); margin-top: 4px; }

  /* ── Pricelist ── */
  .bd-pricelist {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    background: var(--surface2);
    border: 1px solid var(--border-strong);
    border-radius: var(--r);
    font-weight: 600;
    font-size: 14px;
    transition: background 0.2s;
  }
  .bd-pricelist:hover { background: var(--accent-soft); }
  .bd-pricelist-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: var(--accent-soft);
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .bd-pricelist-text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .bd-pricelist-dl { color: var(--text-dim); }

  /* ── Stars ── */
  .bd-stars-row { display: inline-flex; gap: 2px; align-items: center; }
  .bd-star-on { color: var(--gold); }
  .bd-star-off { color: var(--text-muted); opacity: 0.55; }
  .bd-star-input { display: flex; gap: 4px; }
  .bd-star-btn { background: none; border: none; cursor: pointer; padding: 2px; line-height: 0; color: var(--text-muted); transition: color 0.15s, transform 0.15s; }
  .bd-star-btn.active, .bd-star-btn:hover { color: var(--gold); }
  .bd-star-btn:active { transform: scale(0.9); }

  /* ── Reviews ── */
  .bd-summary {
    display: grid;
    grid-template-columns: 1fr;
    gap: 18px;
    padding: 18px;
    margin-bottom: 20px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--r);
  }
  @media (min-width: 640px) { .bd-summary { grid-template-columns: 160px 1fr; align-items: center; } }
  .bd-summary-score { text-align: center; }
  .bd-summary-num { font-family: var(--font-head); font-size: 44px; font-weight: 800; line-height: 1; }
  .bd-summary-sub { font-size: 12px; color: var(--text-muted); margin-top: 6px; }
  .bd-dist { display: flex; flex-direction: column; gap: 6px; }
  .bd-dist-row { display: grid; grid-template-columns: 14px 1fr 28px; align-items: center; gap: 10px; font-size: 12px; color: var(--text-dim); }
  .bd-dist-bar { height: 6px; background: var(--bg); border-radius: 999px; overflow: hidden; }
  .bd-dist-fill { height: 100%; background: var(--gold); border-radius: 999px; }
  .bd-dist-count { text-align: right; color: var(--text-muted); }

  .bd-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 20px;
    padding: 18px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--r);
  }
  .bd-form-title { font-family: var(--font-head); font-size: 15px; font-weight: 700; }
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
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .bd-input:focus, .bd-textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
  .bd-textarea { min-height: 100px; resize: vertical; }
  .bd-input::placeholder, .bd-textarea::placeholder { color: var(--text-muted); }

  .bd-form-actions { display: flex; gap: 10px; }
  .bd-form-actions .bd-btn { width: auto; flex: 1; }

  .bd-alert {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 13px;
    border-radius: var(--r-sm);
    font-size: 13px;
    background: var(--green-soft);
    border: 1px solid rgba(34,197,94,0.3);
    color: var(--green);
  }
  .bd-alert-error { background: var(--danger-soft); border-color: rgba(239,68,68,0.3); color: #f87171; }

  .bd-review { display: flex; gap: 14px; padding: 18px 0; border-top: 1px solid var(--border); }
  .bd-review:first-child { border-top: none; padding-top: 0; }
  .bd-review-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--accent-soft);
    border: 1px solid var(--border-strong);
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-head);
    font-weight: 700;
    font-size: 15px;
    flex-shrink: 0;
  }
  .bd-review-content { flex: 1; min-width: 0; }
  .bd-review-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; flex-wrap: wrap; }
  .bd-review-user { font-weight: 700; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .bd-review-verified {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    color: var(--green);
    background: var(--green-soft);
    padding: 2px 8px;
    border-radius: 999px;
  }
  .bd-review-date { font-size: 12px; color: var(--text-muted); }
  .bd-review-rating { margin-top: 4px; }
  .bd-review-title { font-weight: 700; font-size: 14px; margin-top: 6px; }
  .bd-review-comment { font-size: 14px; color: var(--text-dim); margin-top: 2px; line-height: 1.7; }
  .bd-review-extra { font-size: 13px; color: var(--text-dim); margin-top: 8px; }
  .bd-review-extra strong { font-weight: 700; margin-right: 6px; }
  .bd-review-actions { display: flex; gap: 8px; margin-top: 10px; }
  .bd-link-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    cursor: pointer;
    padding: 4px 0;
    transition: color 0.2s;
  }
  .bd-link-btn:hover { color: var(--accent); }
  .bd-link-btn.danger:hover { color: var(--danger); }

  .bd-empty { text-align: center; padding: 32px 16px; color: var(--text-muted); font-size: 14px; }
  .bd-empty svg { margin: 0 auto 10px; display: block; color: var(--text-muted); }
  .bd-empty strong { display: block; color: var(--text-dim); font-size: 15px; margin-bottom: 2px; }

  /* ── Contact / owner / support ── */
  .bd-info-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    font-size: 14px;
    color: var(--text-dim);
    border-bottom: 1px solid var(--border);
    word-break: break-word;
  }
  .bd-info-row:last-child { border-bottom: none; padding-bottom: 0; }
  .bd-info-row:first-of-type { padding-top: 0; }
  .bd-info-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--accent-soft);
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .bd-info-row a:hover { color: var(--accent); }

  .bd-coords {
    margin-top: 16px;
    padding: 14px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--r-sm);
  }
  .bd-coords-vals { display: flex; gap: 24px; margin-bottom: 12px; }
  .bd-coords-label { display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); }
  .bd-coords-val { font-family: ui-monospace, monospace; font-size: 13px; font-weight: 600; }

  .bd-owner { display: flex; align-items: center; gap: 12px; }
  .bd-owner-avatar {
    width: 46px;
    height: 46px;
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
  .bd-admin .bd-form { margin: 14px 0 0; }

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
    background: #070e1c;
    color: #94a9ca;
    font-family: 'Inter', sans-serif;
  }
  .bd-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(120,160,230,0.25);
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: bd-spin 0.8s linear infinite;
  }
  @keyframes bd-spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .bd-spinner { animation-duration: 2s; } }

  /* ── Modal ── */
  .bd-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 9000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(3, 8, 18, 0.75);
    backdrop-filter: blur(4px);
  }
  .bd-modal {
    position: relative;
    width: 100%;
    max-width: 420px;
    padding: 26px;
    background: var(--surface);
    border: 1px solid var(--border-strong);
    border-radius: var(--r-lg);
    box-shadow: var(--shadow);
  }
  .bd-modal-icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--danger-soft);
    color: var(--danger);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 14px;
  }
  .bd-modal h3 { font-family: var(--font-head); font-size: 19px; font-weight: 800; margin-bottom: 6px; }
  .bd-modal p { font-size: 14px; color: var(--text-dim); margin-bottom: 20px; }
  .bd-modal-close {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: var(--surface2);
    border: 1px solid var(--border);
    color: var(--text-dim);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .bd-modal-close:hover { color: var(--text); }

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
    width: 42px;
    height: 42px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.18);
    background: rgba(255,255,255,0.1);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .bd-lightbox-nav { display: flex; align-items: center; gap: 16px; color: rgba(255,255,255,0.7); font-size: 13px; }
  .bd-lightbox-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.18);
    background: rgba(255,255,255,0.08);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
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

/* ─────────────── ICONS ─────────────── */
const Svg = ({ children, size = 16, fill = "none", strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
  <Svg size={size}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="14" y2="17" /></Svg>
);
const IconDownload = ({ size }) => (
  <Svg size={size}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></Svg>
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
const IconChevronLeft = ({ size }) => (
  <Svg size={size}><polyline points="15 18 9 12 15 6" /></Svg>
);
const IconChevronRight = ({ size }) => (
  <Svg size={size}><polyline points="9 18 15 12 9 6" /></Svg>
);
const IconClose = ({ size }) => (
  <Svg size={size}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Svg>
);
const IconCheck = ({ size }) => (
  <Svg size={size} strokeWidth={2.5}><polyline points="20 6 9 17 4 12" /></Svg>
);
const IconShield = ({ size }) => (
  <Svg size={size}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></Svg>
);
const IconStar = ({ size = 16 }) => (
  <Svg size={size} fill="currentColor" strokeWidth={1.5}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></Svg>
);
const IconEye = ({ size }) => (
  <Svg size={size}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></Svg>
);
const IconCalendar = ({ size }) => (
  <Svg size={size}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></Svg>
);
const IconTag = ({ size }) => (
  <Svg size={size}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></Svg>
);
const IconEdit = ({ size }) => (
  <Svg size={size}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></Svg>
);
const IconTrash = ({ size }) => (
  <Svg size={size}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></Svg>
);
const IconNavigation = ({ size }) => (
  <Svg size={size}><polygon points="3 11 22 2 13 21 11 13 3 11" /></Svg>
);
const IconLink = ({ size }) => (
  <Svg size={size}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></Svg>
);
const IconMegaphone = ({ size }) => (
  <Svg size={size}><path d="M3 11v2a1 1 0 0 0 1 1h3l7 4V6L7 10H4a1 1 0 0 0-1 1z" /><path d="M18 9a4 4 0 0 1 0 6" /></Svg>
);
const IconMessage = ({ size }) => (
  <Svg size={size}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Svg>
);
const IconHeadset = ({ size }) => (
  <Svg size={size}><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" /><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></Svg>
);
const IconWhatsApp = ({ size }) => (
  <svg width={size || 16} height={size || 16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.132.554 4.133 1.524 5.875L.057 23.986l6.305-1.651A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.914 0-3.708-.504-5.254-1.385l-.377-.222-3.906 1.023 1.041-3.808-.245-.396A9.957 9.957 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
  </svg>
);

/* ─────────────── BADGE CONFIG ─────────────── */
const BADGE_CONFIG = {
  student_verified: { label: "Student Verified", cls: "bd-badge-green", Icon: IconShield },
  identity_verified: { label: "Identity Verified", cls: "bd-badge-green", Icon: IconShield },
  business_verified: { label: "Business Verified", cls: "bd-badge-blue", Icon: IconStore },
  online_verified: { label: "Online Verified", cls: "bd-badge-blue", Icon: IconGlobe },
  location_verified: { label: "Location Verified", cls: "bd-badge-purple", Icon: IconPin },
  premium_verified: { label: "Premium", cls: "bd-badge-gold", Icon: IconStar },
};

/* ─────────────── HELPERS ─────────────── */
const formatTime = (time) => {
  if (!time) return "Closed";
  const [h, m] = time.split(":");
  const hr = parseInt(h);
  const ampm = hr >= 12 ? "PM" : "AM";
  return `${hr % 12 || 12}:${m} ${ampm}`;
};

const Stars = ({ value = 0, size = 14 }) => (
  <span className="bd-stars-row" aria-label={`${value} out of 5`}>
    {[1, 2, 3, 4, 5].map(n => (
      <span key={n} className={n <= Math.round(value) ? "bd-star-on" : "bd-star-off"} style={{ lineHeight: 0 }}>
        <IconStar size={size} />
      </span>
    ))}
  </span>
);

const scrollToSection = (sectionId) => {
  const el = document.getElementById(sectionId);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
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
      <div style={{ fontSize: 18, fontWeight: 700, color: "#eaf1fe" }}>{error || "Business not found"}</div>
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
  const categoryImages = categoryItems.filter(ci => ci.image).map(ci => ci.image);

  /* Rating distribution */
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => Math.round(r.rating) === star).length,
  }));
  const maxRatingCount = Math.max(1, ...ratingCounts.map(r => r.count));

  const canManageReview = (review) =>
    !!user && (review.userName === user.name || user.role === "admin");

  /* Section nav items */
  const navItems = [
    images.length > 0 && { id: "bd-photos", label: "Photos" },
    activePromos.length > 0 && { id: "bd-promos", label: "Promotions" },
    products.length > 0 && { id: "bd-products", label: "Products" },
    categoryItems.length > 0 && { id: "bd-items", label: "Items" },
    b.pricelist?.url && { id: "bd-pricelist", label: "Pricelist" },
    { id: "bd-reviews", label: "Reviews" },
    { id: "bd-contact", label: "Contact" },
  ].filter(Boolean);

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <div className="bd-root">
      <div className="bd-container">

        {/* ── Top bar ── */}
        <div className="bd-topbar">
          <a href="/axxbiashara" className="bd-back">
            <IconChevronLeft size={16} />
            Back to directory
          </a>
          <span className="bd-crumb">Business profile</span>
        </div>

        {/* ── Hero ── */}
        <header className="bd-hero">
          <div
            className="bd-cover"
            style={images[0] ? { backgroundImage: `url(${optimizeImage(images[0], IMG_WIDTH.hero)})` } : undefined}
          />
          <div className="bd-hero-body">
            <div className="bd-hero-top">
              {b.logo
                ? <img src={optimizeImage(b.logo, IMG_WIDTH.thumb)} alt={b.name} className="bd-logo" decoding="async" />
                : <div className="bd-logo-fallback"><IconStore size={36} /></div>
              }
              <div style={{ minWidth: 0, paddingBottom: 2 }}>
                <h1 className="bd-name">{b.name}</h1>
                <div className="bd-rating-line">
                  <Stars value={b.rating || 0} size={15} />
                  <strong>{b.rating ? b.rating.toFixed(1) : "No rating"}</strong>
                  <span>({b.reviewCount || 0} {(b.reviewCount || 0) === 1 ? "review" : "reviews"})</span>
                </div>
              </div>
            </div>

            {(b.categories || []).length > 0 && (
              <div className="bd-chips">
                {b.categories.map((c, i) => <span key={i} className="bd-chip">{c}</span>)}
              </div>
            )}

            <div className="bd-meta">
              <span className="bd-meta-item">
                <IconPin size={16} />
                {b.location.town}, {b.location.county}{b.location.address && `, ${b.location.address}`}
              </span>
              {b.yearEstablished && (
                <span className="bd-meta-item">
                  <IconCalendar size={16} />
                  Established {b.yearEstablished}
                </span>
              )}
            </div>

            {b.description && <p className="bd-description">{b.description}</p>}

            {b.verificationBadges?.length > 0 && (
              <div className="bd-badges">
                {b.verificationBadges.map((badge, i) => {
                  const cfg = BADGE_CONFIG[badge.type] || {};
                  const BadgeIcon = cfg.Icon || IconShield;
                  return (
                    <span key={i} className={`bd-badge ${cfg.cls || "bd-badge-blue"}`}>
                      <BadgeIcon size={13} /> {cfg.label || badge.type}
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
                {b.socialMedia.facebook && <a href={b.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="bd-social-link"><IconLink size={13} />Facebook</a>}
                {b.socialMedia.instagram && <a href={b.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="bd-social-link"><IconLink size={13} />Instagram</a>}
                {b.socialMedia.twitter && <a href={b.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="bd-social-link"><IconLink size={13} />Twitter</a>}
                {b.socialMedia.linkedin && <a href={b.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="bd-social-link"><IconLink size={13} />LinkedIn</a>}
                {b.socialMedia.whatsapp && <a href={`https://wa.me/${b.socialMedia.whatsapp}`} target="_blank" rel="noopener noreferrer" className="bd-social-link"><IconWhatsApp size={13} />WhatsApp</a>}
              </div>
            )}
          </div>
        </header>

        {/* ── Stats ── */}
        <div className="bd-stats">
          <div className="bd-stat">
            <div className="bd-stat-icon"><IconEye size={18} /></div>
            <div>
              <div className="bd-stat-value">{b.views || 0}</div>
              <div className="bd-stat-label">Views</div>
            </div>
          </div>
          <div className="bd-stat">
            <div className="bd-stat-icon"><IconStar size={18} /></div>
            <div>
              <div className="bd-stat-value">{b.rating?.toFixed(1) || "—"}</div>
              <div className="bd-stat-label">Rating</div>
            </div>
          </div>
          <div className="bd-stat">
            <div className="bd-stat-icon"><IconMessage size={18} /></div>
            <div>
              <div className="bd-stat-value">{b.reviewCount || 0}</div>
              <div className="bd-stat-label">Reviews</div>
            </div>
          </div>
          <div className="bd-stat">
            <div className="bd-stat-icon"><IconCalendar size={18} /></div>
            <div>
              <div className="bd-stat-value">{b.yearEstablished || "—"}</div>
              <div className="bd-stat-label">Established</div>
            </div>
          </div>
        </div>

        {/* ── Section nav ── */}
        <nav className="bd-nav" aria-label="Page sections">
          {navItems.map(item => (
            <button key={item.id} type="button" className="bd-nav-btn" onClick={() => scrollToSection(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="bd-layout">

          {/* ═══════════ MAIN COLUMN ═══════════ */}
          <main className="bd-main">

            {/* Gallery — all photos */}
            {images.length > 0 && (
              <section className="bd-card" id="bd-photos">
                <div className="bd-card-head">
                  <h2 className="bd-card-title"><IconImage size={18} /> Photos</h2>
                  <span className="bd-count">{images.length}</span>
                </div>
                <div className="bd-gallery">
                  {images.map((img, i) => (
                    <div key={i} className="bd-gallery-item" onClick={() => openLightbox(i)}>
                      <img src={optimizeImage(img, IMG_WIDTH.card)} alt={`${b.name} photo ${i + 1}`} loading="lazy" decoding="async" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Promotions */}
            {activePromos.length > 0 && (
              <section className="bd-card" id="bd-promos">
                <div className="bd-card-head">
                  <h2 className="bd-card-title"><IconMegaphone size={18} /> Active promotions</h2>
                  <span className="bd-count">{activePromos.length}</span>
                </div>
                <div className="bd-promo-list">
                  {activePromos.map((promo, i) => (
                    <div key={i} className="bd-promo">
                      {promo.imageUrl && <img src={optimizeImage(promo.imageUrl, IMG_WIDTH.card)} alt={promo.title} className="bd-promo-img" loading="lazy" decoding="async" />}
                      <div className="bd-promo-body">
                        <div className="bd-promo-title">{promo.title}</div>
                        <div className="bd-promo-desc">{promo.description}</div>
                        <div className="bd-promo-discount">
                          {promo.discountType === "percentage" ? `${promo.discountValue}% OFF`
                            : promo.discountType === "fixed" ? `KES ${promo.discountValue} OFF`
                              : "Buy One Get One"}
                        </div>
                        <div className="bd-promo-dates">
                          <IconCalendar size={13} />
                          {new Date(promo.startDate).toLocaleDateString()} — {new Date(promo.endDate).toLocaleDateString()}
                        </div>
                        {promo.code && <span className="bd-promo-code">{promo.code}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Products — all items */}
            {products.length > 0 && (
              <section className="bd-card" id="bd-products">
                <div className="bd-card-head">
                  <h2 className="bd-card-title"><IconTag size={18} /> Products &amp; services</h2>
                  <span className="bd-count">{products.length} {products.length === 1 ? "item" : "items"}</span>
                </div>
                <div className="bd-products-grid">
                  {products.map((product, i) => (
                    <div key={i} className="bd-product">
                      {product.imageUrl
                        ? <img src={optimizeImage(product.imageUrl, IMG_WIDTH.card)} alt={product.name} className="bd-product-img" loading="lazy" decoding="async" />
                        : <div className="bd-product-placeholder"><IconImage size={28} /></div>
                      }
                      <div className="bd-product-body">
                        {product.category && <div className="bd-product-cat">{product.category}</div>}
                        <div className="bd-product-name">{product.name}</div>
                        {product.description && <div className="bd-product-desc">{product.description}</div>}
                        {product.price && <div className="bd-product-price">KES {product.price.toLocaleString()}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Category items */}
            {categoryItems.length > 0 && (
              <section className="bd-card" id="bd-items">
                <div className="bd-card-head">
                  <h2 className="bd-card-title"><IconTag size={18} /> Category items</h2>
                  <span className="bd-count">{categoryItems.length} {categoryItems.length === 1 ? "item" : "items"}</span>
                </div>
                <div className="bd-products-grid">
                  {categoryItems.map((item, i) => (
                    <div key={i} className="bd-product">
                      {item.image ? (
                        <img
                          src={optimizeImage(item.image, IMG_WIDTH.card)}
                          alt={item.name}
                          className="bd-product-img"
                          loading="lazy"
                          decoding="async"
                          onClick={() => openLightbox(Math.max(0, categoryImages.indexOf(item.image)), categoryImages)}
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
              <section className="bd-card" id="bd-pricelist">
                <div className="bd-card-head">
                  <h2 className="bd-card-title"><IconFile size={18} /> Menu / pricelist</h2>
                </div>
                <a href={getPricelistUrl(b.pricelist)} download target="_blank" rel="noopener noreferrer" className="bd-pricelist">
                  <span className="bd-pricelist-icon"><IconFile size={20} /></span>
                  <span className="bd-pricelist-text">{b.pricelist.name || "Download pricelist"}</span>
                  <span className="bd-pricelist-dl"><IconDownload size={18} /></span>
                </a>
              </section>
            )}

            {/* Reviews */}
            <section className="bd-card" id="bd-reviews">
              <div className="bd-card-head">
                <h2 className="bd-card-title"><IconMessage size={18} /> Reviews &amp; ratings</h2>
                <button className="bd-btn bd-btn-ghost bd-btn-sm" onClick={() => setShowReviewForm(!showReviewForm)}>
                  {showReviewForm ? "Cancel" : "Write a review"}
                </button>
              </div>

              {/* Summary */}
              {reviews.length > 0 && (
                <div className="bd-summary">
                  <div className="bd-summary-score">
                    <div className="bd-summary-num">{b.rating ? b.rating.toFixed(1) : "—"}</div>
                    <div style={{ marginTop: 8 }}><Stars value={b.rating || 0} size={16} /></div>
                    <div className="bd-summary-sub">{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</div>
                  </div>
                  <div className="bd-dist">
                    {ratingCounts.map(r => (
                      <div key={r.star} className="bd-dist-row">
                        <span>{r.star}</span>
                        <div className="bd-dist-bar">
                          <div className="bd-dist-fill" style={{ width: `${(r.count / maxRatingCount) * 100}%` }} />
                        </div>
                        <span className="bd-dist-count">{r.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                    <div className="bd-star-input">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          type="button"
                          key={star}
                          className={`bd-star-btn ${star <= reviewRating ? "active" : ""}`}
                          onClick={() => setReviewRating(star)}
                          aria-label={`${star} star${star > 1 ? "s" : ""}`}
                        >
                          <IconStar size={28} />
                        </button>
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
                  {reviewMsg && (
                    <div className={`bd-alert ${reviewMsg.startsWith("Failed") ? "bd-alert-error" : ""}`}>{reviewMsg}</div>
                  )}
                </form>
              )}

              {!showReviewForm && reviewMsg && (
                <div className={`bd-alert ${reviewMsg.startsWith("Failed") ? "bd-alert-error" : ""}`} style={{ marginBottom: 16 }}>
                  {!reviewMsg.startsWith("Failed") && <IconCheck size={14} />}
                  {reviewMsg}
                </div>
              )}

              {reviewsLoading ? (
                <div className="bd-empty">Loading reviews…</div>
              ) : reviews.length === 0 ? (
                <div className="bd-empty">
                  <IconMessage size={28} />
                  <strong>No reviews yet</strong>
                  Be the first to review this business.
                </div>
              ) : (
                <div>
                  {reviews.map(review => (
                    <article key={review._id} className="bd-review">
                      <div className="bd-review-avatar">
                        {(review.userName || "A").charAt(0).toUpperCase()}
                      </div>
                      <div className="bd-review-content">
                        <div className="bd-review-head">
                          <span className="bd-review-user">
                            {review.userName}
                            {review.verified && (
                              <span className="bd-review-verified"><IconCheck size={11} /> Verified</span>
                            )}
                          </span>
                          <span className="bd-review-date">
                            {new Date(review.createdAt).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                        <div className="bd-review-rating"><Stars value={review.rating} size={14} /></div>
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
                        {canManageReview(review) && (
                          <div className="bd-review-actions">
                            <button type="button" className="bd-link-btn" onClick={() => handleEditReview(review)}>
                              <IconEdit size={13} /> Edit
                            </button>
                            <button type="button" className="bd-link-btn danger" onClick={() => setDeleteConfirmReviewId(review._id)}>
                              <IconTrash size={13} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </main>

          {/* ═══════════ SIDE COLUMN ═══════════ */}
          <aside className="bd-aside">

            {/* Contact */}
            <section className="bd-card" id="bd-contact">
              <div className="bd-card-head">
                <h2 className="bd-card-title"><IconPhone size={18} /> Contact</h2>
              </div>
              <div className="bd-info-row">
                <span className="bd-info-icon"><IconPhone size={15} /></span>
                <a href={`tel:${b.contact.phone}`}>{b.contact.phone}</a>
              </div>
              {b.contact.email && (
                <div className="bd-info-row">
                  <span className="bd-info-icon"><IconMail size={15} /></span>
                  <a href={`mailto:${b.contact.email}`}>{b.contact.email}</a>
                </div>
              )}
              {b.contact.website && (
                <div className="bd-info-row">
                  <span className="bd-info-icon"><IconGlobe size={15} /></span>
                  <a href={b.contact.website} target="_blank" rel="noopener noreferrer">{b.contact.website}</a>
                </div>
              )}
              {b.location.address && (
                <div className="bd-info-row">
                  <span className="bd-info-icon"><IconPin size={15} /></span>
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
                    className="bd-btn bd-btn-primary"
                  >
                    <IconNavigation size={15} /> Open in maps
                  </a>
                </div>
              )}
            </section>

            {/* Owner */}
            {b.owner && (
              <section className="bd-card">
                <div className="bd-card-head">
                  <h2 className="bd-card-title"><IconUser size={18} /> Business owner</h2>
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
                <h2 className="bd-card-title"><IconHeadset size={18} /> Axxspace support</h2>
              </div>
              <div className="bd-info-row"><span className="bd-info-icon"><IconMail size={15} /></span><a href="mailto:info@axxspace.com">info@axxspace.com</a></div>
              <div className="bd-info-row"><span className="bd-info-icon"><IconMail size={15} /></span><a href="mailto:support@axxspace.com">support@axxspace.com</a></div>
              <div className="bd-info-row"><span className="bd-info-icon"><IconMail size={15} /></span><a href="mailto:admin@axxspace.com">admin@axxspace.com</a></div>
            </section>

            {/* Admin */}
            {user?.role === "admin" && (
              <section className="bd-card bd-admin">
                <div className="bd-card-head" style={{ marginBottom: 0 }}>
                  <h2 className="bd-card-title" style={{ color: "var(--green)" }}><IconMegaphone size={18} /> Admin actions</h2>
                </div>
                <button className="bd-btn bd-btn-green" style={{ marginTop: 14 }} onClick={() => setShowForm(!showForm)}>
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
                {annMsg && <div className="bd-alert" style={{ marginTop: 10 }}>{annMsg}</div>}
              </section>
            )}
          </aside>
        </div>
      </div>

      {/* ── Delete Review Confirmation Modal ── */}
      {deleteConfirmReviewId && (
        <div className="bd-modal-overlay" onClick={() => setDeleteConfirmReviewId(null)}>
          <div className="bd-modal" onClick={e => e.stopPropagation()}>
            <button className="bd-modal-close" onClick={() => setDeleteConfirmReviewId(null)} aria-label="Close">
              <IconClose size={16} />
            </button>
            <div className="bd-modal-icon"><IconTrash size={20} /></div>
            <h3>Delete review</h3>
            <p>Are you sure you want to delete this review? This action cannot be undone.</p>
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
          <button className="bd-lightbox-close" onClick={closeLightbox} aria-label="Close"><IconClose size={18} /></button>
          <img
            src={optimizeImage(lightboxImages[lightboxIndex], IMG_WIDTH.hero)}
            alt={`${b.name} photo ${lightboxIndex + 1}`}
            decoding="async"
            onClick={e => e.stopPropagation()}
          />
          <div className="bd-lightbox-nav" onClick={e => e.stopPropagation()}>
            <button className="bd-lightbox-btn" onClick={prevPhoto} aria-label="Previous photo"><IconChevronLeft size={20} /></button>
            <span>{lightboxIndex + 1} / {lightboxImages.length}</span>
            <button className="bd-lightbox-btn" onClick={nextPhoto} aria-label="Next photo"><IconChevronRight size={20} /></button>
          </div>
        </div>
      )}
    </div>
  );
}