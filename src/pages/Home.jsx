import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import bgVideo from "../assets/AXX Homepage video.mp4";
import rentalsIcon from "/rentals.png";
import moversIcon from "/movers.png";
import tourismIcon from "/tourism.png";
import axxbiasharaIcon from "/axxbiashara.png";
import SocialMediaLinks from "../components/SocialMediaLinks";

/* ════════════════════════════════════════════════
   DESIGN SYSTEM  — Luxury Real Estate (from Listings.jsx)
   Palette: Deep Navy · Champagne Gold · Ivory Cream
   Font: Cormorant Garamond (headings) + DM Sans (body)
════════════════════════════════════════════════ */
const C = {
  navy: "#0D1B2A",
  navyMid: "#162233",
  navyLight: "#1E3148",
  gold: "#C9A84C",
  goldLight: "#E2C47A",
  goldDim: "rgba(201,168,76,0.15)",
  goldBorder: "rgba(201,168,76,0.18)",
  cream: "#F5F0E8",
  creamDim: "#EDE6D6",
  white: "#FFFFFF",
  textMain: "#F0EAD8",
  textMid: "#B8AD96",
  textDim: "#7A7260",
  red: "#E31B1B",
  redDark: "#B01212",
  green: "#4CAF74",
  border: "rgba(201,168,76,0.18)",
  borderSoft: "rgba(255,255,255,0.08)",
};

/* ════════ GLOBAL CSS ════════ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,700&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: 'DM Sans', sans-serif; background: #0D1B2A; color: #F0EAD8; }

::placeholder { color: #7A7260 !important; }
option { background: #162233; color: #F0EAD8; }

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #0D1B2A; }
::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.4); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(201,168,76,0.7); }

/* ── KEYFRAMES ── */
@keyframes ticker {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes cardsScroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes pulseDot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.7); }
  50%       { box-shadow: 0 0 0 8px rgba(201,168,76,0); }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}
@keyframes floatY {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-12px); }
}

/* ── ROOT ── */
.home-root {
  font-family: 'DM Sans', sans-serif;
  background: #0D1B2A;
  color: #F0EAD8;
  min-height: 100vh;
  overflow-x: hidden;
}

/* ── TICKER ── */
.ticker-outer {
  background: #071018;
  border-bottom: 1px solid rgba(201,168,76,0.2);
  overflow: hidden;
  height: 38px;
  display: flex;
  align-items: center;
}
.ticker-track {
  display: flex;
  align-items: center;
  width: max-content;
  animation: ticker 42s linear infinite;
}
.ticker-track:hover { animation-play-state: paused; }
.ticker-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 28px;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: #B8AD96;
  white-space: nowrap;
  border-right: 1px solid rgba(201,168,76,0.12);
  letter-spacing: 0.06em;
}
.ticker-item b { color: #C9A84C; font-weight: 700; }
.ticker-dot { width: 4px; height: 4px; background: #C9A84C; border-radius: 50%; flex-shrink: 0; }

/* ── HERO ── */
.hero {
  position: relative;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  border-bottom: 1px solid rgba(201,168,76,0.2);
}
.hero-bg-video {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover; object-position: center;
  z-index: 0; pointer-events: none;
  transition: opacity 0.7s;
}

@media (max-width: 768px) {
  .hero-bg-video {
    object-fit: contain;
    object-position: center top;
  }
}
.hero-bg-fallback {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, #071018 0%, #0D1B2A 40%, #162233 70%, #0a1520 100%);
  z-index: 0;
}
.hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(160deg,
    rgba(7,16,24,0.88) 0%,
    rgba(13,27,42,0.75) 40%,
    rgba(13,27,42,0.85) 100%);
  z-index: 1;
}
.hero-radial {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 70%);
  z-index: 2; pointer-events: none;
}
.hero-decor1 {
  position: absolute; width: 500px; height: 500px;
  border: 1px solid rgba(201,168,76,0.05);
  border-radius: 50%; top: -200px; right: -120px;
  pointer-events: none; z-index: 2;
}
.hero-decor2 {
  position: absolute; width: 350px; height: 350px;
  border: 1px solid rgba(201,168,76,0.05);
  border-radius: 50%; bottom: -120px; left: -80px;
  pointer-events: none; z-index: 2;
}
.hero-content {
  position: relative; z-index: 3;
  max-width: 900px;
  padding: 80px 28px 70px;
  animation: fadeUp 1s ease both;
}
.hero-badge {
  display: inline-block;
  border: 1px solid #C9A84C;
  color: #C9A84C;
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.22em;
  padding: 6px 20px;
  border-radius: 20px;
  margin-bottom: 28px;
  text-transform: uppercase;
}
.hero-title {
  margin: 0;
  line-height: 1.0;
}
.hero-title-line1 {
  display: block;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(2.8rem, 7vw, 5.2rem);
  font-weight: 300;
  color: #F0EAD8;
  letter-spacing: 0.04em;
}
.hero-title-line2 {
  display: block;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(2.8rem, 7vw, 5.2rem);
  font-weight: 700;
  color: #C9A84C;
  letter-spacing: 0.04em;
  font-style: italic;
}
.hero-sub {
  font-family: 'DM Sans', sans-serif;
  color: #B8AD96;
  font-size: clamp(14px, 1.8vw, 17px);
  margin: 18px auto 32px;
  letter-spacing: 0.06em;
  line-height: 1.7;
  font-weight: 300;
  max-width: 500px;
}

/* ── HERO CATEGORY TABS ── */
.hero-tabs {
  display: flex; justify-content: center;
  flex-wrap: wrap; gap: 8px;
  margin-bottom: 28px;
}
.hero-tab {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 18px;
  border-radius: 20px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.03em;
}
.hero-tab-inactive {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(201,168,76,0.2);
  color: #B8AD96;
}
.hero-tab-inactive:hover {
  border-color: rgba(201,168,76,0.5);
  color: #C9A84C;
  background: rgba(201,168,76,0.06);
}
.hero-tab-active {
  background: linear-gradient(135deg, #C9A84C 0%, #E2C47A 100%);
  border: 1px solid #C9A84C;
  color: #0D1B2A;
  box-shadow: 0 4px 20px rgba(201,168,76,0.35);
}

/* ── SEARCH ── */
.search-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.2em; text-transform: uppercase;
  color: rgba(184,173,150,0.7);
  margin-bottom: 10px;
}
.search-trigger {
  display: inline-flex; align-items: center; gap: 12px;
  background: rgba(22,34,51,0.85);
  border: 1px solid rgba(201,168,76,0.25);
  backdrop-filter: blur(12px);
  border-radius: 8px;
  padding: 8px 24px 8px 8px;
  cursor: pointer;
  margin: 0 auto 14px;
  transition: all 0.2s;
}
.search-trigger:hover { border-color: rgba(201,168,76,0.6); }
.search-trigger-icon {
  width: 40px; height: 40px;
  background: linear-gradient(135deg, #C9A84C 0%, #E2C47A 100%);
  border-radius: 6px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 4px;
  flex-shrink: 0;
}
.search-trigger-line {
  width: 18px; height: 2px;
  background: #0D1B2A;
  border-radius: 1px;
  transition: transform 0.25s, opacity 0.2s;
}
.search-trigger-text {
  font-family: 'DM Sans', sans-serif;
  font-weight: 700; font-size: 14px;
  color: #F0EAD8; letter-spacing: 0.04em;
}
.search-panel {
  background: #162233;
  border: 1px solid rgba(201,168,76,0.2);
  border-top: 3px solid #C9A84C;
  border-radius: 8px;
  padding: 18px;
  max-width: 440px; width: 100%;
  margin: 0 auto 18px;
  display: flex; flex-direction: column; gap: 10px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.5);
  animation: slideDown 0.2s ease;
}
.search-select {
  padding: 11px 38px 11px 14px;
  border: 1px solid rgba(201,168,76,0.18);
  border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 400;
  color: #F0EAD8;
  background: #1E3148;
  width: 100%; cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237A7260' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 18px;
  transition: border-color 0.2s;
}
.search-select:focus { outline: none; border-color: #C9A84C; }
.search-submit {
  padding: 13px;
  background: linear-gradient(135deg, #C9A84C 0%, #E2C47A 100%);
  color: #0D1B2A;
  border: none; border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  letter-spacing: 0.06em; text-transform: uppercase;
}
.search-submit:hover { filter: brightness(1.08); transform: translateY(-1px); }

/* ── CATEGORY CTA (non-rentals) ── */
.cat-cta-desc {
  font-size: 15px; color: #B8AD96;
  line-height: 1.75; margin-bottom: 18px;
  max-width: 460px; margin-inline: auto;
  font-weight: 300;
}
.cat-cta-btn {
  padding: 13px 38px;
  background: linear-gradient(135deg, #C9A84C 0%, #E2C47A 100%);
  color: #0D1B2A;
  border: none; border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  letter-spacing: 0.06em;
  box-shadow: 0 6px 24px rgba(201,168,76,0.3);
}
.cat-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(201,168,76,0.4); }

/* ── HERO STATS ── */
.hero-stats {
  display: flex; justify-content: center;
  flex-wrap: wrap; margin-top: 12px;
  border-top: 1px solid rgba(201,168,76,0.12);
  padding-top: 20px;
}
.hero-stat {
  display: flex; flex-direction: column;
  align-items: center; padding: 10px 28px;
  border-right: 1px solid rgba(201,168,76,0.12);
}
.hero-stat:last-child { border-right: none; }
.hero-stat-val {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 24px; font-weight: 700;
  color: #C9A84C;
}
.hero-stat-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px; font-weight: 600;
  color: #7A7260;
  text-transform: uppercase; letter-spacing: 0.14em;
  margin-top: 4px;
}

/* ── SECTION BASICS ── */
.section-eyebrow {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.22em; text-transform: uppercase;
  color: #C9A84C; margin-bottom: 8px;
}
.section-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 600; color: #F0EAD8;
  margin: 0 0 10px; letter-spacing: 0.01em;
}
.section-sub {
  font-family: 'DM Sans', sans-serif;
  font-size: 15px; color: #7A7260;
  margin: 0; font-weight: 300; letter-spacing: 0.03em;
}
.section-hdr { text-align: center; margin-bottom: 50px; }

/* ── CATEGORIES SECTION ── */
.cats-section {
  padding: 96px 28px;
  background: #162233;
  border-top: 1px solid rgba(201,168,76,0.1);
  border-bottom: 1px solid rgba(201,168,76,0.1);
}
.cats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(268px, 1fr));
  gap: 20px; max-width: 1280px; margin: 0 auto;
}
.cat-card {
  background: #1E3148;
  border: 1px solid rgba(201,168,76,0.14);
  border-radius: 12px;
  padding: 28px 24px 24px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative; overflow: hidden;
  border-top-width: 3px;
}
.cat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,168,76,0.25);
}
.cat-icon-wrap {
  width: 52px; height: 52px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 18px; font-size: 26px;
}
.cat-card-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 22px; font-weight: 700;
  margin: 0 0 4px; letter-spacing: 0.02em;
}
.cat-card-tagline {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: #7A7260; margin: 0 0 14px;
}
.cat-card-desc {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; color: #B8AD96;
  line-height: 1.7; margin: 0 0 18px; font-weight: 300;
}
.cat-feature-list {
  list-style: none; margin: 0 0 22px;
  display: flex; flex-direction: column; gap: 7px;
}
.cat-feature-item {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px; font-weight: 600;
  display: flex; align-items: center; gap: 8px;
  color: #B8AD96;
}
.cat-btn {
  width: 100%; padding: 12px;
  color: #0D1B2A; border: none; border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  letter-spacing: 0.06em; text-transform: uppercase;
}
.cat-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }

/* ── FEATURED LISTINGS ── */
.featured-section {
  padding: 80px 0;
  background: #0D1B2A;
  overflow: hidden;
  border-top: 1px solid rgba(201,168,76,0.1);
}
.featured-header { padding: 0 28px; text-align: center; margin-bottom: 44px; }
.cards-track-wrap { overflow: hidden; width: 100%; }
.cards-track {
  display: flex; align-items: stretch;
  width: max-content;
  animation: cardsScroll 34s linear infinite;
  padding: 8px 0 24px;
}
.cards-track:hover { animation-play-state: paused; }
.feat-card {
  background: #162233;
  border-radius: 12px; overflow: hidden;
  border: 1px solid rgba(201,168,76,0.14);
  min-width: 292px; max-width: 292px;
  flex-shrink: 0; margin: 0 12px;
  transition: transform 0.3s, box-shadow 0.3s;
}
.feat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,168,76,0.3);
}
.feat-img-wrap { position: relative; height: 185px; overflow: hidden; }
.feat-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s; }
.feat-card:hover .feat-img { transform: scale(1.05); }
.feat-boosted {
  position: absolute; top: 10px; left: 10px;
  background: linear-gradient(135deg, #C9A84C 0%, #E2C47A 100%);
  color: #0D1B2A;
  padding: 3px 12px; border-radius: 20px;
  font-family: 'DM Sans', sans-serif;
  font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase;
}
.feat-type {
  position: absolute; top: 10px; right: 10px;
  background: rgba(13,27,42,0.8);
  color: #B8AD96;
  padding: 3px 10px; border-radius: 5px;
  font-family: 'DM Sans', sans-serif;
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase;
  backdrop-filter: blur(4px);
}
.feat-img-grad {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(13,27,42,0.65) 0%, transparent 50%);
  pointer-events: none;
}
.feat-body { padding: 18px 18px 20px; }
.feat-type-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: #C9A84C; margin-bottom: 6px;
}
.feat-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 17px; font-weight: 700;
  color: #F0EAD8; margin: 0 0 6px; letter-spacing: 0.01em;
  line-height: 1.25;
}
.feat-loc { color: #7A7260; font-size: 12px; margin: 0 0 10px; font-family: 'DM Sans', sans-serif; }
.feat-meta { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 10px; }
.feat-tag {
  background: rgba(201,168,76,0.1);
  border: 1px solid rgba(201,168,76,0.2);
  color: #C9A84C;
  padding: 3px 10px; border-radius: 4px;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px; font-weight: 500;
}
.feat-price {
  font-family: 'Cormorant Garamond', Georgia, serif;
  color: #C9A84C; font-size: 19px; font-weight: 700;
  margin: 8px 0 0;
}
.feat-price span { font-size: 12px; color: #7A7260; font-weight: 400; }
.feat-view-btn {
  margin-top: 14px; width: 100%;
  padding: 11px;
  background: transparent;
  color: #B8AD96;
  border: 1px solid rgba(201,168,76,0.2); border-radius: 6px;
  font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 12px;
  cursor: pointer; transition: all 0.2s;
  letter-spacing: 0.06em; text-transform: uppercase;
}
.feat-view-btn:hover {
  background: linear-gradient(135deg, #C9A84C 0%, #E2C47A 100%);
  border-color: #C9A84C; color: #0D1B2A;
}
.view-all-wrap { text-align: center; margin-top: 36px; padding: 0 28px; }
.view-all-btn {
  padding: 13px 44px;
  background: transparent;
  color: #C9A84C;
  border: 1px solid rgba(201,168,76,0.35);
  border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  letter-spacing: 0.1em; text-transform: uppercase;
}
.view-all-btn:hover { border-color: #C9A84C; background: rgba(201,168,76,0.08); }
.no-feat-wrap { text-align: center; padding: 60px 28px; }
.no-feat-icon { font-size: 52px; margin-bottom: 16px; display: block; }
.no-feat-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 22px; font-weight: 600; color: #F0EAD8; margin-bottom: 8px;
}
.no-feat-sub { color: #7A7260; font-size: 14px; margin-bottom: 24px; font-weight: 300; }
.no-feat-btn {
  padding: 13px 32px;
  background: linear-gradient(135deg, #C9A84C 0%, #E2C47A 100%);
  color: #0D1B2A; border: none; border-radius: 6px;
  font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700;
  cursor: pointer; letter-spacing: 0.06em;
}

/* ── SKELETON ── */
.skel-card {
  background: #162233;
  border: 1px solid rgba(201,168,76,0.08);
  border-radius: 12px; overflow: hidden;
  min-width: 292px; max-width: 292px; margin: 0 12px; flex-shrink: 0;
}
.skel-img {
  height: 185px;
  background: linear-gradient(90deg, #1E3148 25%, #243d5a 50%, #1E3148 75%);
  background-size: 400px;
  animation: shimmer 1.5s infinite;
}
.skel-body { padding: 18px; display: flex; flex-direction: column; gap: 10px; }
.skel-line {
  height: 12px; border-radius: 3px;
  background: linear-gradient(90deg, #1E3148 25%, #243d5a 50%, #1E3148 75%);
  background-size: 400px;
  animation: shimmer 1.5s infinite;
}

/* ── SPOTLIGHT STRIPS ── */
.spotlight-section {
  background: #162233;
  border-top: 1px solid rgba(201,168,76,0.1);
  border-bottom: 1px solid rgba(201,168,76,0.1);
}
.spotlight-strip {
  display: flex; align-items: center; gap: 60px;
  padding: 72px 60px;
  max-width: 1280px; margin: 0 auto;
}
.spotlight-strip.reverse { flex-direction: row-reverse; }
.strip-divider {
  height: 1px; background: rgba(201,168,76,0.1);
  max-width: 1280px; margin: 0 auto;
}
.spot-text { flex: 1; min-width: 0; }
.spot-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 14px; border-radius: 20px;
  font-family: 'DM Sans', sans-serif;
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.16em; text-transform: uppercase;
  margin-bottom: 18px;
  border: 1px solid rgba(201,168,76,0.3);
  background: rgba(201,168,76,0.08);
  color: #C9A84C;
}
.spot-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(26px, 3.5vw, 44px);
  font-weight: 600; color: #F0EAD8;
  margin: 0 0 14px; line-height: 1.1; letter-spacing: 0.01em;
}
.spot-desc {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px; color: #B8AD96;
  line-height: 1.8; margin: 0 0 22px; font-weight: 300;
}
.spot-features { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 28px; }
.spot-feat {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px; font-weight: 600;
  display: flex; align-items: center; gap: 6px;
  color: #B8AD96; letter-spacing: 0.04em;
}
.spot-btn {
  padding: 13px 32px;
  background: linear-gradient(135deg, #C9A84C 0%, #E2C47A 100%);
  color: #0D1B2A; border: none; border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  box-shadow: 0 6px 20px rgba(201,168,76,0.25);
  letter-spacing: 0.06em; text-transform: uppercase;
}
.spot-btn-alt {
  padding: 13px 32px;
  background: transparent;
  color: #C9A84C;
  border: 1px solid rgba(201,168,76,0.35);
  border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  letter-spacing: 0.06em; text-transform: uppercase;
}
.spot-btn:hover, .spot-btn-alt:hover { filter: brightness(1.1); transform: translateY(-2px); }
.spot-visual {
  display: flex; flex-direction: column;
  align-items: center; gap: 28px; flex-shrink: 0;
}
.spot-icon-box {
  width: 140px; height: 140px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  animation: floatY 4.5s ease-in-out infinite;
  border: 1px solid rgba(201,168,76,0.15);
}
.spot-stats { display: flex; gap: 24px; }
.spot-stat { display: flex; flex-direction: column; align-items: center; gap: 3px; }
.spot-stat-val {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 22px; font-weight: 700; color: #C9A84C;
}
.spot-stat-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px; font-weight: 600;
  color: #7A7260; letter-spacing: 0.1em; text-align: center; text-transform: uppercase;
}

/* ── HOW IT WORKS ── */
.how-section {
  padding: 96px 28px;
  background: #0D1B2A;
  border-top: 1px solid rgba(201,168,76,0.1);
}
.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 2px; margin-top: 50px;
  max-width: 1100px; margin-inline: auto;
}
.step-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(201,168,76,0.1);
  padding: 36px 28px; position: relative;
  transition: all 0.3s; text-align: center;
}
.step-card:hover {
  background: rgba(201,168,76,0.04);
  border-color: rgba(201,168,76,0.3);
  transform: translateY(-4px);
}
.step-num {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 80px; font-weight: 700;
  color: rgba(201,168,76,0.04);
  position: absolute; top: 8px; right: 14px;
  line-height: 1; pointer-events: none;
}
.step-icon { font-size: 44px; margin-bottom: 18px; display: block; }
.step-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 20px; font-weight: 700;
  color: #F0EAD8; margin: 0 0 12px; letter-spacing: 0.01em;
}
.step-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; color: #7A7260;
  line-height: 1.75; margin: 0; font-weight: 300;
}

/* ── TESTIMONIALS ── */
.test-section {
  padding: 96px 28px;
  background: #162233;
  border-top: 1px solid rgba(201,168,76,0.1);
}
.test-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 20px; max-width: 1280px; margin: 50px auto 0;
}
.test-card {
  background: #1E3148;
  border: 1px solid rgba(201,168,76,0.14);
  border-radius: 12px; padding: 26px;
  transition: all 0.3s; position: relative; overflow: hidden;
}
.test-card::before {
  content: '"';
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 130px; color: rgba(201,168,76,0.05);
  position: absolute; top: -24px; left: 14px;
  line-height: 1; pointer-events: none;
}
.test-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(201,168,76,0.25);
}
.test-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
.test-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 20px; font-weight: 700; color: #0D1B2A; flex-shrink: 0;
  background: linear-gradient(135deg, #C9A84C 0%, #E2C47A 100%);
}
.test-service-tag {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; color: #0D1B2A;
  padding: 4px 12px; border-radius: 20px;
  background: linear-gradient(135deg, #C9A84C 0%, #E2C47A 100%);
}
.test-rating { font-size: 13px; margin-bottom: 10px; }
.test-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px; line-height: 1.8;
  color: #B8AD96; margin: 0 0 18px;
  position: relative; z-index: 1; font-weight: 300;
}
.test-name {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 16px; font-weight: 700; color: #F0EAD8;
}
.test-role {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px; color: #7A7260; margin-top: 2px;
  letter-spacing: 0.06em;
}
.review-btn {
  padding: 14px 38px;
  background: linear-gradient(135deg, #C9A84C 0%, #E2C47A 100%);
  color: #0D1B2A; border: none; border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 700;
  cursor: pointer; transition: all 0.2s; margin-top: 40px;
  display: block; margin-inline: auto;
  letter-spacing: 0.06em;
  box-shadow: 0 6px 24px rgba(201,168,76,0.3);
}
.review-btn:hover { filter: brightness(1.08); transform: translateY(-2px); }

/* ── WHY AXXSPACE ── */
.why-section {
  padding: 96px 28px;
  background: #0D1B2A;
  border-top: 1px solid rgba(201,168,76,0.1);
}
.why-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px; max-width: 1280px; margin: 50px auto 0;
}
.why-card {
  padding: 28px 24px;
  background: #162233;
  border: 1px solid rgba(201,168,76,0.12);
  border-radius: 12px; text-align: center;
  transition: all 0.25s;
  border-top-width: 3px;
}
.why-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 36px rgba(0,0,0,0.3), 0 0 0 1px rgba(201,168,76,0.2);
}
.why-icon { font-size: 34px; margin-bottom: 16px; display: block; }
.why-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 18px; font-weight: 700; color: #F0EAD8;
  margin: 0 0 10px; letter-spacing: 0.01em;
}
.why-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; color: #7A7260; line-height: 1.7; margin: 0; font-weight: 300;
}

/* ── FINAL CTA ── */
.cta-section {
  padding: 100px 28px;
  background: #162233;
  text-align: center;
  border-top: 1px solid rgba(201,168,76,0.2);
  position: relative; overflow: hidden;
}
.cta-section::before {
  content: 'AXXSPACE';
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(80px, 14vw, 200px);
  font-weight: 700; color: rgba(201,168,76,0.025);
  position: absolute; left: 50%; top: 50%;
  transform: translate(-50%, -50%);
  white-space: nowrap; pointer-events: none; letter-spacing: -4px;
}
.cta-inner { max-width: 820px; margin: 0 auto; position: relative; z-index: 1; }
.cta-badge {
  display: inline-block;
  border: 1px solid rgba(201,168,76,0.3);
  color: #C9A84C;
  font-family: 'DM Sans', sans-serif;
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.22em; text-transform: uppercase;
  padding: 6px 18px; border-radius: 20px; margin-bottom: 28px;
}
.cta-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(34px, 5.5vw, 66px);
  font-weight: 600; color: #F0EAD8;
  margin: 0 0 14px; letter-spacing: 0.01em; line-height: 1.05;
}
.cta-title em { font-style: italic; color: #C9A84C; }
.cta-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 16px; color: #7A7260;
  margin: 0 0 42px; line-height: 1.7; font-weight: 300;
}
.cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 22px; }
.cta-btn-gold {
  padding: 14px 26px;
  background: linear-gradient(135deg, #C9A84C 0%, #E2C47A 100%);
  color: #0D1B2A; border: none; border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  letter-spacing: 0.06em; text-transform: uppercase;
  box-shadow: 0 4px 18px rgba(201,168,76,0.3);
}
.cta-btn-ghost {
  padding: 14px 26px;
  background: transparent;
  color: #B8AD96;
  border: 1px solid rgba(201,168,76,0.2);
  border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  letter-spacing: 0.06em; text-transform: uppercase;
}
.cta-btn-gold:hover { filter: brightness(1.08); transform: translateY(-2px); }
.cta-btn-ghost:hover { border-color: rgba(201,168,76,0.5); color: #C9A84C; }
.cta-divider {
  height: 1px; background: rgba(201,168,76,0.12);
  margin: 32px auto; max-width: 440px;
}
.cta-list-btn {
  padding: 16px 44px;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px; font-weight: 700;
  border-radius: 6px; cursor: pointer; transition: all 0.2s;
  letter-spacing: 0.06em; text-transform: uppercase;
}
.cta-hint {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px; color: #7A7260;
  margin-top: 16px; letter-spacing: 0.16em; text-transform: uppercase;
}

/* ── FOOTER ── */
.footer {
  background: #071018;
  color: #7A7260;
  padding: 56px 28px 28px;
  border-top: 1px solid rgba(201,168,76,0.12);
}
.footer-inner { max-width: 1060px; margin: 0 auto; }
.footer-top { text-align: center; margin-bottom: 44px; }
.footer-brand {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 32px; font-weight: 700; color: #F0EAD8;
  letter-spacing: 0.04em;
}
.footer-brand span { color: #C9A84C; }
.footer-tagline {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px; font-weight: 600;
  color: #7A7260; letter-spacing: 0.2em;
  margin-top: 6px; text-transform: uppercase;
}
.footer-cols {
  display: flex; justify-content: center;
  gap: 64px; flex-wrap: wrap; margin-bottom: 44px;
}
.footer-col { display: flex; flex-direction: column; gap: 10px; }
.footer-col-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px; font-weight: 700; color: #C9A84C;
  text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 4px;
}
.footer-link {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; color: #7A7260; cursor: pointer; transition: color 0.2s;
}
.footer-link:hover { color: #F0EAD8; }
.footer-copy {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px; color: rgba(201,168,76,0.25);
  text-align: center; letter-spacing: 0.16em; text-transform: uppercase;
}

/* ── MODAL ── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(7,16,24,0.92);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 20px;
  backdrop-filter: blur(10px);
}
.modal-box {
  background: #162233;
  border: 1px solid rgba(201,168,76,0.2);
  border-top: 3px solid #C9A84C;
  border-radius: 14px;
  max-width: 560px; width: 100%;
  max-height: 90vh; overflow-y: auto;
  padding: 36px; position: relative;
  box-shadow: 0 40px 100px rgba(0,0,0,0.6);
  animation: slideDown 0.25s ease;
}
.modal-close {
  position: absolute; top: 14px; right: 14px;
  background: rgba(13,27,42,0.8);
  border: 1px solid rgba(201,168,76,0.15);
  border-radius: 50%; width: 36px; height: 36px;
  cursor: pointer; font-size: 16px;
  color: #B8AD96;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.modal-close:hover { background: rgba(201,168,76,0.15); color: #C9A84C; }
.modal-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 28px; font-weight: 700; color: #F0EAD8;
  margin: 0 0 6px; letter-spacing: 0.01em;
}
.modal-sub {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px; color: #7A7260; margin: 0 0 28px; line-height: 1.65; font-weight: 300;
}
.modal-services { display: flex; flex-direction: column; gap: 10px; }
.modal-svc-card {
  display: flex; align-items: center; gap: 16px;
  padding: 16px; border: 1px solid rgba(201,168,76,0.14);
  border-radius: 10px; cursor: pointer; transition: all 0.2s;
  background: #1E3148;
}
.modal-svc-card:hover {
  border-color: rgba(201,168,76,0.4);
  background: rgba(201,168,76,0.06);
  transform: translateY(-2px);
}
.modal-svc-icon {
  width: 50px; height: 50px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; flex-shrink: 0;
}
.modal-svc-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 17px; font-weight: 700; color: #F0EAD8; margin: 0 0 3px;
}
.modal-svc-desc {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px; color: #7A7260; margin: 0; font-weight: 300;
}
.modal-arrow { color: #7A7260; font-size: 20px; margin-left: auto; transition: all 0.2s; }
.modal-svc-card:hover .modal-arrow { color: #C9A84C; transform: translateX(4px); }

/* ── SPINNER ── */
.spinner { animation: spin 0.9s linear infinite; }

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .spotlight-strip,
  .spotlight-strip.reverse { flex-direction: column !important; padding: 48px 24px !important; }
  .spot-visual { width: 100%; }
  .spot-stats { justify-content: center; }
}
@media (max-width: 640px) {
  .hero-stat { padding: 8px 14px; }
  .cta-btns { flex-direction: column; align-items: center; }
  .cta-btn-gold, .cta-btn-ghost { width: 100%; max-width: 300px; }
  .footer-cols { gap: 36px; }
}
`;

/* ═══════════════════════ COMPONENT ═══════════════════════ */
export default function Home() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [searchForm, setSearchForm] = useState({ county: "", type: "" });
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({ listings: 0, counties: 0, tenants: 0 });
  const [activeCategoryTab, setActiveCategoryTab] = useState("rentals");
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [componentError, setComponentError] = useState(null);
  const [demographics, setDemographics] = useState(null);
  const [loadingDemographics, setLoadingDemographics] = useState(true);

  const counties = [
    "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta",
    "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru",
    "Tharaka Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua",
    "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot",
    "Samburu", "Trans Nzoia", "Uasin Gishu", "Elgeyo Marakwet", "Nandi",
    "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado", "Kericho", "Bomet",
    "Kakamega", "Vihiga", "Bungoma", "Busia", "Siaya", "Kisumu", "Homa Bay",
    "Migori", "Kisii", "Nyamira", "Nairobi City",
  ];

  const types = [
    "Bedsitter", "Studio Apartment", "1 Bedroom", "2 Bedroom", "3 Bedroom",
    "4+ Bedroom", "Maisonette", "Bungalow", "Townhouse", "Apartment Block",
  ];

  const marqueeItems = [
    { label: "Welcome to Axxspace!", accent: "Kenya's #1 Platform" },
    { label: "Rentals Across All", accent: "47 Counties" },
    { label: "Trusted Moving", accent: "Services" },
    { label: "Hotels & Tourism", accent: "Experiences" },
    { label: "AxxBiashara", accent: "Business Services" },
    { label: "Marketplace for", accent: "All Your Needs" },
    { label: "Verified Listings —", accent: "Zero Hidden Fees" },
    { label: "Connect via", accent: "WhatsApp" },
    { label: "GPS Maps for", accent: "Every Listing" },
    { label: "Safe, Secure &", accent: "Transparent" },
    { label: "One Platform.", accent: "Everything." },
  ];

  const platformCategories = [
    {
      id: "rentals", icon: rentalsIcon, iconType: "image",
      title: "Rentals", tagline: "Find your next home",
      description: "Browse verified rental properties across all 47 counties. Bedsitters, apartments, maisonettes & more — no agents, no hidden fees.",
      features: ["Verified landlords", "All property types", "GPS-mapped locations", "Direct WhatsApp contact"],
      cta: "Browse Rentals", route: "/listings",
      color: C.gold, iconBg: "linear-gradient(135deg,#C9A84C,#E2C47A)",
    },
    {
      id: "movers", icon: moversIcon, iconType: "image",
      title: "Movers", tagline: "Stress-free moving",
      description: "Connect with trusted, vetted moving companies across Kenya. Get quotes, compare rates, and book your move with confidence.",
      features: ["Vetted moving crews", "Transparent pricing", "Local & long-distance", "Real-time tracking"],
      cta: "Find Movers", route: "/movers",
      color: "#60A5FA", iconBg: "linear-gradient(135deg,#1E3A5F,#2D5080)",
    },
    {
      id: "tourism", icon: tourismIcon, iconType: "image",
      title: "Tourism", tagline: "Discover Kenya's best",
      description: "Explore hotels, lodges, resorts, and unique experiences across Kenya's 47 counties. From Nairobi to the coast and beyond.",
      features: ["Hotels & lodges", "Safari packages", "Weekend getaways", "Direct bookings"],
      cta: "Explore Tourism", route: "/tourism",
      color: "#4CAF74", iconBg: "linear-gradient(135deg,#1B3A2A,#264D38)",
    },
    {
      id: "axxbiashara", icon: axxbiasharaIcon, iconType: "image",
      title: "AxxBiashara", tagline: "Business solutions",
      description: "Access professional business services, from company registration to accounting, legal support, and digital solutions.",
      features: ["Business registration", "Accounting & tax", "Legal services", "Digital solutions"],
      cta: "Explore Services", route: "/axxbiashara",
      color: "#A78BFA", iconBg: "linear-gradient(135deg,#2E1B4A,#3D2566)",
    },
    {
      id: "marketplace", icon: "🏪", iconType: "emoji",
      title: "Marketplace", tagline: "Buy & sell anything",
      description: "The ultimate marketplace for buying and selling new and used items. From electronics to furniture, fashion to cars.",
      features: ["New & used items", "Secure transactions", "Nationwide delivery", "Direct seller contact"],
      cta: "Browse Marketplace", route: "/materials",
      color: "#38BDF8", iconBg: "linear-gradient(135deg,#0C2A3A,#103A4F)",
    },
  ];

  const categoryStats = {
    rentals: [{ val: "280+", label: "Active Listings" }, { val: "47", label: "Counties" }, { val: "500+", label: "Happy Tenants" }],
    movers: [{ val: "60+", label: "Moving Companies" }, { val: "47", label: "Counties Covered" }, { val: "1,200+", label: "Moves Completed" }],
    merchants: [{ val: "150+", label: "Merchants" }, { val: "5,000+", label: "Products" }, { val: "30+", label: "Counties" }],
    tourism: [{ val: "200+", label: "Hotels & Lodges" }, { val: "47", label: "Counties" }, { val: "3,000+", label: "Happy Guests" }],
    axxbiashara: [{ val: "100+", label: "Service Providers" }, { val: "47", label: "Counties" }, { val: "2,000+", label: "Businesses Served" }],
    marketplace: [{ val: "10,000+", label: "Active Listings" }, { val: "47", label: "Counties" }, { val: "5,000+", label: "Happy Users" }],
  };

  /* ── DATA FETCHING ── */
  useEffect(() => {
    const fetchDemographics = async () => {
      try {
        setLoadingDemographics(true);
        const res = await API.get("/analytics/demographics");
        setDemographics(res.data?.data || null);
      } catch (err) {
        console.error("Failed to load demographics:", err?.message || err);
      } finally {
        setLoadingDemographics(false);
      }
    };

    fetchDemographics();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDemographics, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setFetchError(false);
        const res = await API.get("/payment/featured", { timeout: 15000 });
        const data = res?.data;
        if (Array.isArray(data)) setFeaturedProperties(data);
        else if (data && Array.isArray(data.properties)) setFeaturedProperties(data.properties);
        else setFeaturedProperties([]);
      } catch (err) {
        console.error("Failed to load featured properties:", err?.message || err);
        setFetchError(true);
        setFeaturedProperties([]);
      } finally { setLoadingFeatured(false); }
    };
    fetchFeatured().catch(() => setComponentError("Failed to load featured properties"));
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await API.get("/reviews", { timeout: 15000 });
        const data = res?.data;
        if (Array.isArray(data)) setReviews(data.slice(0, 4));
        else setReviews([]);
      } catch (err) {
        console.error("Failed to load reviews:", err?.message || err);
        setReviews([]);
      } finally { setLoadingReviews(false); }
    };
    fetchReviews().catch(() => { });
  }, []);

  useEffect(() => {
    const target = { listings: 280, counties: 47, tenants: 500 };
    const steps = 60; let step = 0;
    const timer = setInterval(() => {
      step++;
      const e = 1 - Math.pow(1 - step / steps, 3);
      setAnimatedStats({ listings: Math.floor(target.listings * e), counties: Math.floor(target.counties * e), tenants: Math.floor(target.tenants * e) });
      if (step >= steps) { clearInterval(timer); setAnimatedStats(target); }
    }, 2000 / steps);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (ev) => {
    ev.preventDefault();
    const params = new URLSearchParams();
    if (searchForm.county) params.append("county", searchForm.county);
    if (searchForm.type) params.append("type", searchForm.type);
    navigate(`/listings?${params.toString()}`);
  };

  const handleListProperty = () => {
    if (!token) { setShowBoostModal(true); return; }
    navigate("/upload");
  };

  const activeCategory = platformCategories.find(c => c.id === activeCategoryTab);

  /* ── ERROR BOUNDARY ── */
  if (componentError) {
    return (
      <div style={{ padding: "60px 28px", textAlign: "center", fontFamily: "'DM Sans',sans-serif", background: C.navy, minHeight: "100vh" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", color: C.gold, marginBottom: "12px", fontSize: "28px" }}>Something Went Wrong</h2>
        <p style={{ color: C.textMid, marginBottom: "24px" }}>{componentError}</p>
        <button onClick={() => window.location.reload()} style={{ padding: "12px 28px", background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, color: C.navy, border: "none", borderRadius: "6px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>
          Reload Page
        </button>
      </div>
    );
  }

  /* ════════════════════════════════════ RENDER ════════════════════════════════════ */
  return (
    <div className="home-root">
      <style>{css}</style>

      {/* ── TICKER ── */}
      <div className="ticker-outer">
        <div className="ticker-track">
          {[...marqueeItems, ...marqueeItems].map((item, idx) => (
            <span key={idx} className="ticker-item">
              <span className="ticker-dot"></span>
              {item.label} <b>{item.accent}</b>
            </span>
          ))}
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg-fallback"></div>
        <video
          autoPlay muted loop playsInline
          className="hero-bg-video"
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setVideoLoaded(false)}
          style={{ opacity: videoLoaded ? 1 : 0 }}
        >
          <source src={bgVideo} type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-radial"></div>
        <div className="hero-decor1"></div>
        <div className="hero-decor2"></div>

        <div className="hero-content">
          <div className="hero-badge">Kenya's Premier Property &amp; Services Platform</div>

          <h1 className="hero-title">
            <span className="hero-title-line1">Everything You Need</span>
            <span className="hero-title-line2">Under One Roof</span>
          </h1>
          <p className="hero-sub">
            Rentals · Movers · Tourism · AxxBiashara · Marketplace<br />Verified across all 47 counties
          </p>

          {/* TABS */}
          <div className="hero-tabs">
            {platformCategories.map(cat => (
              <button
                key={cat.id}
                className={`hero-tab ${activeCategoryTab === cat.id ? "hero-tab-active" : "hero-tab-inactive"}`}
                onClick={() => setActiveCategoryTab(cat.id)}
              >
                {cat.iconType === "image"
                  ? <img src={cat.icon} alt={cat.title} style={{ width: "20px", height: "20px", objectFit: "contain" }} />
                  : <span style={{ fontSize: "17px" }}>{cat.icon}</span>
                }
                {cat.title}
              </button>
            ))}
          </div>

          {/* SEARCH / CTA */}
          {activeCategoryTab === "rentals" ? (
            <>
              <p className="search-label">Search Rental Properties</p>
              <div className="search-trigger" onClick={() => setMenuOpen(!menuOpen)}>
                <div className="search-trigger-icon">
                  <span className="search-trigger-line" style={{ transform: menuOpen ? "rotate(45deg) translate(3px,3px)" : "none" }}></span>
                  <span className="search-trigger-line" style={{ opacity: menuOpen ? 0 : 1 }}></span>
                  <span className="search-trigger-line" style={{ transform: menuOpen ? "rotate(-45deg) translate(3px,-3px)" : "none" }}></span>
                </div>
                <span className="search-trigger-text">Search Properties</span>
              </div>
              {menuOpen && (
                <form onSubmit={(e) => { handleSearch(e); setMenuOpen(false); }} className="search-panel">
                  <select className="search-select" value={searchForm.county} onChange={(e) => setSearchForm({ ...searchForm, county: e.target.value })}>
                    <option value="">📍 Select County</option>
                    {counties.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select className="search-select" value={searchForm.type} onChange={(e) => setSearchForm({ ...searchForm, type: e.target.value })}>
                    <option value="">🏗 Property Type</option>
                    {types.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button type="submit" className="search-submit">🔍 Search Now</button>
                </form>
              )}
            </>
          ) : (
            <div style={{ maxWidth: "480px", margin: "0 auto 20px", textAlign: "center" }}>
              <p className="cat-cta-desc">{activeCategory?.description}</p>
              <button className="cat-cta-btn" onClick={() => navigate(activeCategory?.route)}>
                {activeCategory?.cta} →
              </button>
            </div>
          )}

          {/* STATS */}
          <div className="hero-stats">
            {categoryStats[activeCategoryTab].map(s => (
              <div key={s.label} className="hero-stat">
                <span className="hero-stat-val">{s.val}</span>
                <span className="hero-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES SHOWCASE ── */}
      <section className="cats-section">
        <div className="section-hdr">
          <p className="section-eyebrow">What We Offer</p>
          <h2 className="section-title">Everything on One Platform</h2>
          <p className="section-sub">From finding a home to settling in — Axxspace has you covered</p>
        </div>
        <div className="cats-grid">
          {platformCategories.map(cat => (
            <div
              key={cat.id}
              className="cat-card"
              style={{ borderTopColor: cat.color }}
              onClick={() => navigate(cat.route)}
            >
              <div className="cat-icon-wrap" style={{ background: cat.iconBg }}>
                {cat.iconType === "image"
                  ? <img src={cat.icon} alt={cat.title} style={{ width: "30px", height: "30px", objectFit: "contain" }} />
                  : <span style={{ fontSize: "26px" }}>{cat.icon}</span>
                }
              </div>
              <h3 className="cat-card-title" style={{ color: cat.color }}>{cat.title}</h3>
              <p className="cat-card-tagline">{cat.tagline}</p>
              <p className="cat-card-desc">{cat.description}</p>
              <ul className="cat-feature-list">
                {cat.features.map(f => (
                  <li key={f} className="cat-feature-item">
                    <span style={{ color: cat.color, fontWeight: 800 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                className="cat-btn"
                style={{ background: `linear-gradient(135deg,${cat.color},${cat.color}cc)`, color: "#0D1B2A" }}
                onClick={e => { e.stopPropagation(); navigate(cat.route); }}
              >
                {cat.cta} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED LISTINGS ── */}
      <section className="featured-section">
        <div className="featured-header">
          <p className="section-eyebrow">Premium Listings</p>
          <h2 className="section-title">Featured Properties</h2>
          <p className="section-sub">Verified & boosted properties from trusted landlords</p>
        </div>

        {loadingFeatured ? (
          <div className="cards-track-wrap">
            <div className="cards-track" style={{ animation: "none" }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="skel-card">
                  <div className="skel-img"></div>
                  <div className="skel-body">
                    <div className="skel-line" style={{ width: "65%" }}></div>
                    <div className="skel-line" style={{ width: "45%" }}></div>
                    <div className="skel-line" style={{ width: "55%", height: "18px" }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : fetchError ? (
          <div className="no-feat-wrap">
            <span className="no-feat-icon">⚠️</span>
            <p className="no-feat-title">Could Not Load Featured Listings</p>
            <p className="no-feat-sub">Please refresh in a moment.</p>
            <button onClick={() => window.location.reload()} className="no-feat-btn">Retry</button>
          </div>
        ) : featuredProperties.length > 0 ? (
          <>
            <div className="cards-track-wrap">
              <div className="cards-track">
                {[...featuredProperties, ...featuredProperties].map((property, idx) => (
                  <div key={`${property._id}-${idx}`} className="feat-card">
                    <div className="feat-img-wrap">
                      <img
                        src={property.images?.[0] || ""}
                        alt={property.title || "Property"}
                        className="feat-img"
                        onError={e => { e.target.style.display = "none"; }}
                      />
                      <div className="feat-boosted">★ Featured</div>
                      <div className="feat-type">{property.type || "Rental"}</div>
                      <div className="feat-img-grad"></div>
                    </div>
                    <div className="feat-body">
                      <p className="feat-type-label">{property.propertyType || "Rental"}</p>
                      <h3 className="feat-title">{property.title}</h3>
                      <p className="feat-loc">📍 {property.area}, {property.county}</p>
                      <div className="feat-meta">
                        {property.bedrooms && <span className="feat-tag">🛏 {property.bedrooms} Bed</span>}
                        {property.bathrooms && <span className="feat-tag">🚿 {property.bathrooms} Bath</span>}
                      </div>
                      <p className="feat-price">
                        KES {Number(property.price).toLocaleString()}
                        <span> / month</span>
                      </p>
                      <button onClick={() => navigate(`/listings?highlight=${property._id}`)} className="feat-view-btn">
                        View Property →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="view-all-wrap">
              <button onClick={() => navigate("/listings")} className="view-all-btn">View All Listings →</button>
            </div>
          </>
        ) : (
          <div className="no-feat-wrap">
            <span className="no-feat-icon">🏡</span>
            <p className="no-feat-title">No Featured Listings Yet</p>
            <p className="no-feat-sub">Boost your property to appear here and reach thousands of tenants!</p>
            <button onClick={handleListProperty} className="no-feat-btn">🚀 Boost Your Property</button>
          </div>
        )}
      </section>

      {/* ── DEMOGRAPHICS SECTION ── */}
      <section style={{ padding: "96px 28px", background: "#162233", borderTop: "1px solid rgba(201,168,76,0.1)" }}>
        <div className="section-hdr">
          <p className="section-eyebrow">Live Analytics</p>
          <h2 className="section-title">Platform Demographics</h2>
          <p className="section-sub">Real-time data from across all 47 counties</p>
        </div>

        {loadingDemographics ? (
          <div style={{ textAlign: "center", padding: "60px 28px" }}>
            <div className="spinner" style={{ fontSize: "40px", color: "#C9A84C", marginBottom: "20px" }}>⟳</div>
            <p style={{ color: "#7A7260", fontSize: "14px" }}>Loading demographic data...</p>
          </div>
        ) : demographics ? (
          <div style={{ maxWidth: "1280px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px" }}>
            {/* County Distribution */}
            <div style={{ background: "#1E3148", border: "1px solid rgba(201,168,76,0.14)", borderRadius: "12px", padding: "28px" }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", fontWeight: 700, color: "#F0EAD8", margin: "0 0 20px" }}>📍 Top Counties</h3>
              {demographics.counties && demographics.counties.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {demographics.counties.slice(0, 5).map((item, idx) => {
                    const maxCount = Math.max(...demographics.counties.map(c => c.count));
                    const percentage = (item.count / maxCount) * 100;
                    return (
                      <div key={item.county} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600, color: "#F0EAD8" }}>{item.county}</span>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 700, color: "#C9A84C" }}>{item.count}</span>
                        </div>
                        <div style={{ height: "8px", background: "rgba(201,168,76,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ height: "100%", background: "linear-gradient(90deg, #C9A84C, #E2C47A)", borderRadius: "4px", width: `${percentage}%`, transition: "width 0.5s ease" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: "#7A7260", fontSize: "14px" }}>No county data available</p>
              )}
            </div>

            {/* Service Popularity */}
            <div style={{ background: "#1E3148", border: "1px solid rgba(201,168,76,0.14)", borderRadius: "12px", padding: "28px" }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", fontWeight: 700, color: "#F0EAD8", margin: "0 0 20px" }}>📊 Service Popularity</h3>
              {demographics.services && demographics.services.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {demographics.services.map((item, idx) => {
                    const maxCount = Math.max(...demographics.services.map(s => s.count));
                    const percentage = (item.count / maxCount) * 100;
                    const colors = ["#C9A84C", "#60A5FA", "#4CAF74", "#A78BFA", "#38BDF8"];
                    return (
                      <div key={item.service} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600, color: "#F0EAD8" }}>{item.service}</span>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 700, color: colors[idx % colors.length] }}>{item.count}</span>
                        </div>
                        <div style={{ height: "8px", background: "rgba(201,168,76,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ height: "100%", background: colors[idx % colors.length], borderRadius: "4px", width: `${percentage}%`, transition: "width 0.5s ease" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: "#7A7260", fontSize: "14px" }}>No service data available</p>
              )}
            </div>

            {/* Summary Stats */}
            <div style={{ background: "#1E3148", border: "1px solid rgba(201,168,76,0.14)", borderRadius: "12px", padding: "28px" }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", fontWeight: 700, color: "#F0EAD8", margin: "0 0 20px" }}>📈 Platform Overview</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div style={{ background: "rgba(201,168,76,0.08)", padding: "20px", borderRadius: "8px", textAlign: "center" }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "36px", fontWeight: 700, color: "#C9A84C", display: "block" }}>{demographics.totalListings || 0}</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 600, color: "#7A7260", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total Listings</span>
                </div>
                <div style={{ background: "rgba(201,168,76,0.08)", padding: "20px", borderRadius: "8px", textAlign: "center" }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "36px", fontWeight: 700, color: "#C9A84C", display: "block" }}>{demographics.totalUsers || 0}</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 600, color: "#7A7260", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total Users</span>
                </div>
              </div>
              <div style={{ marginTop: "20px", padding: "16px", background: "rgba(96,165,250,0.08)", borderRadius: "8px", border: "1px solid rgba(96,165,250,0.2)" }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#60A5FA", fontWeight: 600, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>🔄 Auto-refreshing every 5 minutes</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#B8AD96", margin: 0, fontWeight: 300" }}>Data updates automatically to show the latest platform activity</p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 28px" }}>
            <span style={{ fontSize: "52px", marginBottom: "16px", display: "block" }}>📊</span>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", fontWeight: 600, color: "#F0EAD8", marginBottom: "8px" }}>Demographics Unavailable</p>
            <p style={{ color: "#7A7260", fontSize: "14px", marginBottom: "24px", fontWeight: 300" }}>Unable to load demographic data at this time</p>
          </div>
        )}
      </section>

      {/* ── SERVICE SPOTLIGHT STRIPS ── */}
      <section className="spotlight-section">

        {/* Movers */}
        <div className="spotlight-strip">
          <div className="spot-text">
            <span className="spot-badge">
              <img src={moversIcon} alt="Movers" style={{ width: "13px", height: "13px", marginRight: "4px", verticalAlign: "middle" }} />
              Movers
            </span>
            <h3 className="spot-title">Planning a Move?</h3>
            <p className="spot-desc">Connect with 60+ vetted moving companies across Kenya. Get instant quotes, compare prices, and book your move — local or long-distance.</p>
            <div className="spot-features">
              {["Insured cargo", "Trained crews", "Transparent quotes", "Available 24/7"].map(f => (
                <span key={f} className="spot-feat"><span style={{ color: C.gold }}>✓</span> {f}</span>
              ))}
            </div>
            <button className="spot-btn" onClick={() => navigate("/movers")}>Find a Mover →</button>
          </div>
          <div className="spot-visual">
            <div className="spot-icon-box" style={{ background: "rgba(30,49,72,0.8)" }}>
              <img src={moversIcon} alt="Movers" style={{ width: "72px", height: "72px", objectFit: "contain" }} />
            </div>
            <div className="spot-stats">
              {[["60+", "Companies"], ["47", "Counties"], ["1,200+", "Moves Done"]].map(([v, l]) => (
                <div key={l} className="spot-stat">
                  <span className="spot-stat-val">{v}</span>
                  <span className="spot-stat-label">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="strip-divider"></div>

        {/* Tourism */}
        <div className="spotlight-strip reverse">
          <div className="spot-text">
            <span className="spot-badge">
              <img src={tourismIcon} alt="Tourism" style={{ width: "13px", height: "13px", marginRight: "4px", verticalAlign: "middle" }} />
              Tourism
            </span>
            <h3 className="spot-title">Explore Kenya Like Never Before</h3>
            <p className="spot-desc">Discover hotels, beach resorts, safari lodges, and unique experiences across Kenya's 47 counties. Book directly — no commission fees.</p>
            <div className="spot-features">
              {["Hotels & resorts", "Safari packages", "Beach getaways", "City escapes"].map(f => (
                <span key={f} className="spot-feat"><span style={{ color: C.gold }}>✓</span> {f}</span>
              ))}
            </div>
            <button className="spot-btn" onClick={() => navigate("/tourism")}>Explore Tourism →</button>
          </div>
          <div className="spot-visual">
            <div className="spot-icon-box" style={{ background: "rgba(27,58,42,0.8)" }}>
              <img src={tourismIcon} alt="Tourism" style={{ width: "72px", height: "72px", objectFit: "contain" }} />
            </div>
            <div className="spot-stats">
              {[["200+", "Hotels"], ["47", "Counties"], ["3,000+", "Guests"]].map(([v, l]) => (
                <div key={l} className="spot-stat">
                  <span className="spot-stat-val">{v}</span>
                  <span className="spot-stat-label">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="strip-divider"></div>

        {/* AxxBiashara */}
        <div className="spotlight-strip">
          <div className="spot-text">
            <span className="spot-badge">
              <img src={axxbiasharaIcon} alt="AxxBiashara" style={{ width: "13px", height: "13px", marginRight: "4px", verticalAlign: "middle" }} />
              AxxBiashara
            </span>
            <h3 className="spot-title">Grow Your Business</h3>
            <p className="spot-desc">Access professional business services across Kenya. From company registration to accounting, legal support, and digital solutions.</p>
            <div className="spot-features">
              {["Business registration", "Accounting & tax", "Legal services", "Digital solutions"].map(f => (
                <span key={f} className="spot-feat"><span style={{ color: C.gold }}>✓</span> {f}</span>
              ))}
            </div>
            <button className="spot-btn" onClick={() => navigate("/axxbiashara")}>Explore Services →</button>
          </div>
          <div className="spot-visual">
            <div className="spot-icon-box" style={{ background: "rgba(46,27,74,0.8)" }}>
              <img src={axxbiasharaIcon} alt="AxxBiashara" style={{ width: "72px", height: "72px", objectFit: "contain" }} />
            </div>
            <div className="spot-stats">
              {[["100+", "Providers"], ["47", "Counties"], ["2,000+", "Businesses"]].map(([v, l]) => (
                <div key={l} className="spot-stat">
                  <span className="spot-stat-val">{v}</span>
                  <span className="spot-stat-label">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="strip-divider"></div>

        {/* Marketplace */}
        <div className="spotlight-strip reverse">
          <div className="spot-text">
            <span className="spot-badge">🏪 Marketplace</span>
            <h3 className="spot-title">Buy &amp; Sell Anything</h3>
            <p className="spot-desc">The ultimate marketplace for buying and selling new and used items. From electronics to furniture, fashion to cars — find great deals.</p>
            <div className="spot-features">
              {["New & used items", "Secure transactions", "Nationwide delivery", "Direct seller contact"].map(f => (
                <span key={f} className="spot-feat"><span style={{ color: C.gold }}>✓</span> {f}</span>
              ))}
            </div>
            <button className="spot-btn" onClick={() => navigate("/materials")}>Browse Marketplace →</button>
          </div>
          <div className="spot-visual">
            <div className="spot-icon-box" style={{ background: "rgba(12,42,58,0.8)", fontSize: "64px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              🏪
            </div>
            <div className="spot-stats">
              {[["10K+", "Listings"], ["47", "Counties"], ["5,000+", "Users"]].map(([v, l]) => (
                <div key={l} className="spot-stat">
                  <span className="spot-stat-val">{v}</span>
                  <span className="spot-stat-label">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="test-section">
        <div className="section-hdr">
          <p className="section-eyebrow">Social Proof</p>
          <h2 className="section-title">What Our Users Say</h2>
          <p className="section-sub">Real stories from happy customers across all our services</p>
        </div>
        <div className="test-grid">
          {loadingReviews ? (
            <div style={{ textAlign: "center", gridColumn: "1/-1", padding: "50px" }}>
              <div className="spinner" style={{ width: "40px", height: "40px", border: "3px solid rgba(201,168,76,0.15)", borderTop: "3px solid #C9A84C", borderRadius: "50%", margin: "0 auto" }}></div>
              <p style={{ color: C.textDim, marginTop: "16px", fontSize: "14px" }}>Loading reviews…</p>
            </div>
          ) : reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review._id} className="test-card">
                <div className="test-top">
                  <div className="test-avatar">{review.userName?.charAt(0).toUpperCase() || "U"}</div>
                  <div className="test-service-tag">
                    {review.category === "general" ? "General" : review.category.charAt(0).toUpperCase() + review.category.slice(1)}
                  </div>
                </div>
                <div className="test-rating">{"⭐".repeat(review.rating)}</div>
                <p className="test-text">"{review.comment}"</p>
                <div><div className="test-name">{review.userName}</div><div className="test-role">{new Date(review.createdAt).toLocaleDateString()}</div></div>
              </div>
            ))
          ) : (
            [
              { name: "Sarah Wanjiku", role: "Tenant · Nairobi", rating: 5, text: "Found my dream apartment in 2 days! The WhatsApp feature made connecting with the landlord so easy. No agents, no hidden fees." },
              { name: "David Mwangi", role: "Customer · Mombasa", rating: 5, text: "Booked movers through Axxspace for my relocation to Nairobi. Professional team, transparent pricing, everything arrived safely." },
              { name: "Grace Omondi", role: "Developer · Kisumu", rating: 5, text: "The merchant listings saved me thousands on my construction project. Found roofing materials at 20% below market prices." },
              { name: "James Kariuki", role: "Tourist · Nairobi", rating: 5, text: "Planned a full safari weekend through Axxspace Tourism. Best lodge, easy booking, and zero commission. Absolutely loved it!" },
            ].map(t => (
              <div key={t.name} className="test-card">
                <div className="test-top">
                  <div className="test-avatar">{t.name.charAt(0)}</div>
                  <div className="test-service-tag">{t.role.split("·")[0].trim()}</div>
                </div>
                <div className="test-rating">{"⭐".repeat(t.rating)}</div>
                <p className="test-text">"{t.text}"</p>
                <div><div className="test-name">{t.name}</div><div className="test-role">{t.role}</div></div>
              </div>
            ))
          )}
        </div>
        <div style={{ textAlign: "center" }}>
          <button onClick={() => navigate("/leave-review")} className="review-btn">✍️ Leave a Review</button>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="cta-section">
        <div className="cta-inner">
          <div className="cta-badge">Start Your Journey Today</div>
          <h2 className="cta-title">
            Find Your Place<br /><em>in Kenya</em>
          </h2>
          <p className="cta-text">
            Join thousands of Kenyans who find homes, move smarter, build better, and explore more — all through Axxspace.
          </p>
          <div className="cta-btns">
            <button className="cta-btn-gold" onClick={() => navigate("/listings")}>🏢 Browse Rentals</button>
            <button className="cta-btn-ghost" onClick={() => navigate("/movers")}>🚛 Find Movers</button>
            <button className="cta-btn-ghost" onClick={() => navigate("/materials")}>🛍️ Shop Materials</button>
            <button className="cta-btn-ghost" onClick={() => navigate("/tourism")}>🏨 Explore Tourism</button>
          </div>
          <div className="cta-divider"></div>
          <button
            className="cta-list-btn"
            style={token
              ? { background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, color: C.navy, border: "none" }
              : { background: "transparent", color: C.textMain, border: `1px solid ${C.border}` }
            }
            onClick={handleListProperty}
          >
            {token ? "📝 List Your Property / Service" : "🔐 Login to List Your Business"}
          </button>
          {!token && <p className="cta-hint">Free to Join — No Credit Card Required</p>}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">Axx<span>space</span></div>
            <p className="footer-tagline">Kenya's Most Trusted Property &amp; Services Platform</p>
            <div style={{ marginTop: "20px" }}>
              <SocialMediaLinks iconSize={20} />
            </div>
          </div>
          <div className="footer-cols">
            <div className="footer-col">
              <p className="footer-col-title">Services</p>
              {[["🏢 Rentals", "/listings"], ["🚛 Movers", "/movers"], ["🛍️ Merchants", "/materials"], ["🏨 Tourism", "/tourism"]].map(([l, r]) => (
                <span key={l} className="footer-link" onClick={() => navigate(r)}>{l}</span>
              ))}
            </div>
            <div className="footer-col">
              <p className="footer-col-title">Company</p>
              {["About Us", "How It Works", "Contact Us", "Advertise"].map(l => (
                <span key={l} className="footer-link">{l}</span>
              ))}
            </div>
            <div className="footer-col">
              <p className="footer-col-title">Legal</p>
              {["Terms of Service", "Privacy Policy", "FAQ", "Safety Tips"].map(l => (
                <span key={l} className="footer-link">{l}</span>
              ))}
            </div>
            <div className="footer-col">
              <p className="footer-col-title">Contact</p>
              <span className="footer-link">📧 info@axxspace.com</span>
              <span className="footer-link">📧 support@axxspace.com</span>
              <span className="footer-link">📧 admin@axxspace.com</span>
            </div>
          </div>
          <p className="footer-copy">© 2026 Axxspace · All Rights Reserved</p>
        </div>
      </footer>

      {/* ── BOOST / SERVICE SELECTION MODAL ── */}
      {showBoostModal && (
        <div className="modal-overlay" onClick={() => setShowBoostModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowBoostModal(false)}>✕</button>
            <h2 className="modal-title">Choose Your Service</h2>
            <p className="modal-sub">Select the type of service you want to list or boost on Axxspace</p>
            <div className="modal-services">
              {[
                { icon: "🏠", title: "Landlord / Rentals", desc: "List rental properties and boost your listings", bg: `linear-gradient(135deg,${C.gold},${C.goldLight})`, route: "/login" },
                { icon: "🚛", title: "Mover / Moving Company", desc: "Offer moving services across Kenya", bg: "linear-gradient(135deg,#1E3A5F,#2D5080)", route: "/login?type=mover" },
                { icon: "🛍️", title: "Seller / Marketplace", desc: "Sell items in the materials marketplace", bg: "linear-gradient(135deg,#0C2A3A,#103A4F)", route: "/seller-login" },
                { icon: "🏨", title: "Tourism Provider", desc: "List hotels, lodges, and tourism experiences", bg: "linear-gradient(135deg,#1B3A2A,#264D38)", route: "/tourism/login" },
                { icon: "💼", title: "Business / AxxBiashara", desc: "List professional business services", bg: "linear-gradient(135deg,#2E1B4A,#3D2566)", route: "/business-login" },
              ].map(svc => (
                <div key={svc.title} className="modal-svc-card" onClick={() => { setShowBoostModal(false); navigate(svc.route); }}>
                  <div className="modal-svc-icon" style={{ background: svc.bg }}>{svc.icon}</div>
                  <div>
                    <p className="modal-svc-title">{svc.title}</p>
                    <p className="modal-svc-desc">{svc.desc}</p>
                  </div>
                  <span className="modal-arrow">→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}