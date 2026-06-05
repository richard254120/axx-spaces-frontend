import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import bgVideo from "../assets/AXX Homepage Video.mp4";
import rentalsIcon from "/rentals.png";
import moversIcon from "/movers.png";
import tourismIcon from "/tourism.png";
import axxbiasharaIcon from "/axxbiashara.png";
import SocialMediaLinks from "../components/SocialMediaLinks";

/* ═══════════════════════ INJECTED GLOBAL CSS ═══════════════════════ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

:root {
  --red: #E31B1B;
  --red-dark: #B01212;
  --navy: #0B1F3A;
  --navy-mid: #142B50;
  --navy-light: #1E3A6A;
  --gold: #F0B429;
  --gold-light: #FDE68A;
  --off-white: #F5F3EE;
  --cream: #FAF8F4;
  --gray-soft: #E8E4DC;
  --gray-text: #6B6860;
  --font-display: 'Syne', sans-serif;
  --font-body: 'Outfit', sans-serif;
  --font-mono: 'Space Mono', monospace;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: var(--font-body); background: var(--cream); color: var(--navy); }

/* ── SCROLLBAR ── */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--navy); }
::-webkit-scrollbar-thumb { background: var(--red); border-radius: 3px; }

/* ── KEYFRAMES ── */
@keyframes ticker {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes cardsScroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes pulseDot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(227,27,27,0.7); }
  50% { box-shadow: 0 0 0 8px rgba(227,27,27,0); }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
@keyframes floatY {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}
@keyframes borderSpin {
  to { transform: rotate(360deg); }
}

/* ── HOME ROOT ── */
.home-root {
  font-family: var(--font-body);
  background: var(--cream);
  color: var(--navy);
  min-height: 100vh;
  overflow-x: hidden;
}

/* ── TICKER ── */
.ticker-outer {
  background: var(--navy);
  padding: 0;
  border-bottom: 2px solid var(--red);
  overflow: hidden;
  height: 38px;
  display: flex;
  align-items: center;
}
.ticker-track {
  display: flex;
  align-items: center;
  width: max-content;
  animation: ticker 40s linear infinite;
}
.ticker-track:hover { animation-play-state: paused; }
.ticker-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 24px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: rgba(255,255,255,0.8);
  white-space: nowrap;
  border-right: 1px solid rgba(255,255,255,0.1);
}
.ticker-item b { color: var(--gold); }
.ticker-dot { width: 4px; height: 4px; background: var(--red); border-radius: 50%; flex-shrink: 0; }

/* ── HERO ── */
.hero {
  position: relative;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  border-bottom: 3px solid var(--red);
}
.hero-bg-video {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover; object-position: center;
  z-index: 0;
  pointer-events: none;
}
.hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(160deg,
    rgba(11,31,58,0.88) 0%,
    rgba(11,31,58,0.72) 40%,
    rgba(11,31,58,0.82) 100%);
  z-index: 1;
}
.hero-grain {
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  z-index: 2; opacity: 0.4; pointer-events: none;
}
.hero-content {
  position: relative; z-index: 3;
  max-width: 900px;
  padding: 80px 24px 60px;
  animation: fadeUp 0.9s ease both;
}
.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.18);
  backdrop-filter: blur(12px);
  padding: 8px 20px;
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.15em;
  color: rgba(255,255,255,0.9);
  text-transform: uppercase;
  margin-bottom: 28px;
}
.hero-eyebrow-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--red);
  animation: pulseDot 2s infinite;
  flex-shrink: 0;
}
.hero-title {
  font-family: var(--font-display);
  font-size: clamp(36px, 6vw, 72px);
  font-weight: 800;
  line-height: 1.05;
  color: #fff;
  margin: 0 0 8px;
  letter-spacing: -2px;
}
.hero-title em {
  font-style: normal;
  color: var(--gold);
  position: relative;
}
.hero-subtitle {
  font-family: var(--font-body);
  font-size: clamp(15px, 2vw, 18px);
  color: rgba(255,255,255,0.72);
  max-width: 540px;
  margin: 0 auto 36px;
  line-height: 1.65;
  font-weight: 300;
}

/* ── HERO CATEGORY TABS ── */
.hero-tabs {
  display: flex; justify-content: center; flex-wrap: wrap; gap: 8px;
  margin-bottom: 28px;
}
.hero-tab {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 20px;
  border-radius: 2px;
  font-family: var(--font-display);
  font-size: 13px; font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1.5px solid transparent;
}
.hero-tab-inactive {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.18);
  color: rgba(255,255,255,0.75);
  backdrop-filter: blur(8px);
}
.hero-tab-inactive:hover {
  background: rgba(255,255,255,0.14);
  color: #fff;
}
.hero-tab-active {
  background: var(--red);
  border-color: var(--red);
  color: #fff;
  box-shadow: 0 0 20px rgba(227,27,27,0.5);
}

/* ── SEARCH PANEL ── */
.search-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.16em;
  color: rgba(255,255,255,0.6);
  text-transform: uppercase;
  margin-bottom: 10px;
}
.search-trigger {
  display: inline-flex; align-items: center; gap: 12px;
  background: rgba(255,255,255,0.1);
  border: 1.5px solid rgba(255,255,255,0.25);
  backdrop-filter: blur(12px);
  border-radius: 2px;
  padding: 8px 22px 8px 8px;
  cursor: pointer;
  margin: 0 auto 14px;
  transition: all 0.2s;
}
.search-trigger:hover { border-color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.15); }
.search-trigger-icon {
  width: 40px; height: 40px;
  background: var(--red);
  border-radius: 2px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 4px;
  flex-shrink: 0;
}
.search-trigger-line {
  width: 18px; height: 2px;
  background: #fff; border-radius: 1px;
  transition: transform 0.25s, opacity 0.2s;
}
.search-trigger-text {
  font-family: var(--font-display);
  font-weight: 700; font-size: 15px;
  color: #fff;
}
.search-panel {
  background: #fff;
  border-radius: 4px;
  padding: 18px;
  max-width: 420px; width: 100%;
  margin: 0 auto 18px;
  display: flex; flex-direction: column; gap: 10px;
  box-shadow: 0 20px 60px rgba(11,31,58,0.4);
  border-top: 3px solid var(--red);
  animation: slideDown 0.2s ease;
}
.search-select {
  padding: 12px 38px 12px 14px;
  border: 1.5px solid var(--gray-soft);
  border-radius: 2px;
  font-family: var(--font-body);
  font-size: 14px; font-weight: 500;
  color: var(--navy);
  background: var(--off-white);
  width: 100%; cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B6860' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 18px;
  transition: border-color 0.2s;
}
.search-select:focus { outline: none; border-color: var(--red); box-shadow: 0 0 0 3px rgba(227,27,27,0.1); }
.search-submit {
  padding: 14px;
  background: var(--red);
  color: #fff; border: none; border-radius: 2px;
  font-family: var(--font-display);
  font-size: 15px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  letter-spacing: 0.02em;
}
.search-submit:hover { background: var(--red-dark); transform: translateY(-1px); }

/* ── CATEGORY CTA (non-rentals) ── */
.cat-cta-desc {
  font-size: 15px; color: rgba(255,255,255,0.8);
  line-height: 1.65; margin-bottom: 18px; max-width: 440px; margin-inline: auto;
}
.cat-cta-btn {
  padding: 14px 36px;
  background: #fff; color: var(--navy);
  border: none; border-radius: 2px;
  font-family: var(--font-display);
  font-size: 15px; font-weight: 800;
  cursor: pointer; transition: all 0.2s;
  box-shadow: 0 8px 30px rgba(0,0,0,0.25);
}
.cat-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 40px rgba(0,0,0,0.3); }

/* ── HERO STATS ── */
.hero-stats {
  display: flex; justify-content: center;
  gap: 0; flex-wrap: wrap; margin-top: 10px;
}
.hero-stat {
  display: flex; flex-direction: column;
  align-items: center; padding: 12px 28px;
  border-right: 1px solid rgba(255,255,255,0.12);
}
.hero-stat:last-child { border-right: none; }
.hero-stat-val {
  font-family: var(--font-display);
  font-size: 22px; font-weight: 800;
  color: #fff;
}
.hero-stat-label {
  font-family: var(--font-mono);
  font-size: 10px; color: rgba(255,255,255,0.55);
  text-transform: uppercase; letter-spacing: 0.1em;
  margin-top: 3px;
}

/* ── SECTION BASICS ── */
.section-eyebrow {
  font-family: var(--font-mono);
  font-size: 10px; letter-spacing: 0.2em;
  text-transform: uppercase; color: var(--red);
  margin-bottom: 8px;
}
.section-title {
  font-family: var(--font-display);
  font-size: clamp(26px, 4vw, 40px);
  font-weight: 800; color: var(--navy);
  margin: 0 0 10px; letter-spacing: -1px;
}
.section-sub {
  font-family: var(--font-body);
  font-size: 16px; color: var(--gray-text); margin: 0;
}
.section-hdr { text-align: center; margin-bottom: 50px; }

/* ── CATEGORIES SHOWCASE ── */
.cats-section {
  padding: 96px 24px;
  background: var(--off-white);
  position: relative;
}
.cats-section::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--red), var(--gold), var(--red));
}
.cats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(268px, 1fr));
  gap: 20px; max-width: 1240px; margin: 0 auto;
}
.cat-card {
  padding: 30px 26px 26px;
  border-radius: 4px;
  border: 1.5px solid var(--gray-soft);
  cursor: pointer;
  transition: all 0.3s;
  position: relative; overflow: hidden;
  background: #fff;
}
.cat-card::after {
  content: '';
  position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
  transform: scaleX(0); transform-origin: left;
  transition: transform 0.3s ease;
}
.cat-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(11,31,58,0.1); }
.cat-card:hover::after { transform: scaleX(1); }
.cat-icon-wrap {
  width: 54px; height: 54px; border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 18px; font-size: 26px;
}
.cat-card-title {
  font-family: var(--font-display);
  font-size: 22px; font-weight: 800;
  margin: 0 0 4px;
  letter-spacing: -0.5px;
}
.cat-card-tagline {
  font-family: var(--font-mono);
  font-size: 10px; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--gray-text);
  margin: 0 0 14px;
}
.cat-card-desc {
  font-size: 14px; color: #4B5563;
  line-height: 1.65; margin: 0 0 18px;
}
.cat-feature-list {
  list-style: none; margin: 0 0 22px;
  display: flex; flex-direction: column; gap: 7px;
}
.cat-feature-item {
  font-size: 13px; font-weight: 600;
  display: flex; align-items: center; gap: 8px;
}
.cat-btn {
  width: 100%; padding: 13px;
  color: #fff; border: none; border-radius: 2px;
  font-family: var(--font-display);
  font-size: 14px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  letter-spacing: 0.03em;
}
.cat-btn:hover { filter: brightness(1.12); transform: translateY(-1px); }

/* ── FEATURED LISTINGS ── */
.featured-section {
  padding: 80px 0;
  background: var(--navy);
  overflow: hidden;
}
.featured-header { padding: 0 24px; text-align: center; margin-bottom: 44px; }
.featured-header .section-title { color: #fff; }
.featured-header .section-sub { color: rgba(255,255,255,0.55); }
.cards-track-wrap { overflow: hidden; width: 100%; }
.cards-track {
  display: flex; align-items: stretch;
  width: max-content;
  animation: cardsScroll 32s linear infinite;
  padding: 8px 0 24px;
}
.cards-track:hover { animation-play-state: paused; }
.feat-card {
  background: var(--navy-mid);
  border-radius: 4px; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
  min-width: 290px; max-width: 290px;
  flex-shrink: 0; margin: 0 12px;
  transition: transform 0.25s, box-shadow 0.25s;
}
.feat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(0,0,0,0.4);
  border-color: var(--red);
}
.feat-img-wrap { position: relative; }
.feat-img {
  width: 100%; height: 185px;
  object-fit: cover; display: block;
}
.feat-boosted {
  position: absolute; top: 10px; left: 10px;
  background: var(--red); color: #fff;
  padding: 3px 10px; border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
}
.feat-type {
  position: absolute; top: 10px; right: 10px;
  background: rgba(11,31,58,0.85); color: rgba(255,255,255,0.9);
  padding: 3px 10px; border-radius: 2px;
  font-family: var(--font-mono); font-size: 10px;
}
.feat-body { padding: 18px 18px 20px; }
.feat-title {
  font-family: var(--font-display);
  font-size: 16px; font-weight: 700;
  color: #fff; margin: 0 0 6px; letter-spacing: -0.3px;
}
.feat-loc { color: rgba(255,255,255,0.45); font-size: 12px; margin: 0 0 10px; }
.feat-meta { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 10px; }
.feat-tag {
  background: rgba(227,27,27,0.15);
  color: #ff7070;
  padding: 3px 10px; border-radius: 2px;
  font-size: 11px; font-weight: 600;
}
.feat-price {
  font-family: var(--font-display);
  color: var(--gold); font-size: 18px; font-weight: 800;
  margin: 8px 0 0;
}
.feat-price span { font-size: 12px; color: rgba(240,180,41,0.65); font-weight: 400; }
.feat-view-btn {
  margin-top: 14px; width: 100%;
  padding: 12px; background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.85);
  border: 1px solid rgba(255,255,255,0.1); border-radius: 2px;
  font-family: var(--font-display); font-weight: 700; font-size: 13px;
  cursor: pointer; transition: all 0.2s;
}
.feat-view-btn:hover { background: var(--red); border-color: var(--red); color: #fff; }
.view-all-wrap { text-align: center; margin-top: 36px; padding: 0 24px; }
.view-all-btn {
  padding: 13px 40px;
  background: transparent;
  color: #fff; border: 1.5px solid rgba(255,255,255,0.3);
  border-radius: 2px;
  font-family: var(--font-display);
  font-size: 15px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  letter-spacing: 0.03em;
}
.view-all-btn:hover { border-color: var(--gold); color: var(--gold); }
.no-featured-wrap { text-align: center; padding: 50px 24px; }
.no-feat-icon { font-size: 56px; margin-bottom: 14px; display: block; }
.no-feat-title { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 8px; }
.no-feat-sub { color: rgba(255,255,255,0.5); font-size: 14px; margin-bottom: 24px; }
.no-feat-btn {
  padding: 13px 30px; background: var(--red); color: #fff;
  border: none; border-radius: 2px; font-family: var(--font-display);
  font-size: 15px; font-weight: 700; cursor: pointer;
}

/* ── SKELETON ── */
.skel-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 4px; overflow: hidden;
  min-width: 290px; max-width: 290px; margin: 0 12px; flex-shrink: 0;
}
.skel-img { height: 185px; background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%); background-size: 400px; animation: shimmer 1.5s infinite; }
.skel-body { padding: 18px; display: flex; flex-direction: column; gap: 10px; }
.skel-line { height: 12px; border-radius: 2px; background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%); background-size: 400px; animation: shimmer 1.5s infinite; }

/* ── SPOTLIGHT STRIPS ── */
.spotlight-section { background: var(--cream); }
.spotlight-strip {
  display: flex; align-items: center; gap: 60px;
  padding: 72px 60px;
  max-width: 1240px; margin: 0 auto;
}
.spotlight-strip.reverse { flex-direction: row-reverse; }
.spot-text { flex: 1; min-width: 0; }
.spot-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 14px; border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase;
  font-weight: 700; margin-bottom: 18px;
  border: 1px solid currentColor;
}
.spot-title {
  font-family: var(--font-display);
  font-size: clamp(24px, 3vw, 36px);
  font-weight: 800; color: var(--navy);
  margin: 0 0 14px; line-height: 1.15; letter-spacing: -1px;
}
.spot-desc { font-size: 15px; color: var(--gray-text); line-height: 1.75; margin: 0 0 22px; }
.spot-features { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 28px; }
.spot-feat {
  font-family: var(--font-mono);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; gap: 6px;
  color: var(--navy);
}
.spot-btn {
  padding: 14px 32px; color: #fff;
  border: none; border-radius: 2px;
  font-family: var(--font-display);
  font-size: 15px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  letter-spacing: 0.03em;
}
.spot-btn:hover { filter: brightness(1.1); transform: translateY(-2px); }
.spot-visual {
  display: flex; flex-direction: column;
  align-items: center; gap: 28px; flex-shrink: 0;
}
.spot-icon-box {
  width: 130px; height: 130px; border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  animation: floatY 4s ease-in-out infinite;
  position: relative;
}
.spot-stats { display: flex; gap: 24px; }
.spot-stat { display: flex; flex-direction: column; align-items: center; gap: 3px; }
.spot-stat-val { font-family: var(--font-display); font-size: 22px; font-weight: 800; }
.spot-stat-label { font-family: var(--font-mono); font-size: 10px; color: var(--gray-text); letter-spacing: 0.08em; text-align: center; }

/* ── DIVIDER ── */
.strip-divider {
  height: 1px;
  background: var(--gray-soft);
  max-width: 1240px; margin: 0 auto;
}

/* ── HOW IT WORKS ── */
.how-section {
  padding: 96px 24px;
  background: var(--navy);
}
.how-section .section-title { color: #fff; }
.how-section .section-sub { color: rgba(255,255,255,0.5); }
.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 2px; margin-top: 50px;
  max-width: 1100px; margin-inline: auto;
}
.step-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  padding: 36px 28px;
  position: relative;
  transition: all 0.3s;
  text-align: center;
}
.step-card:hover {
  background: rgba(255,255,255,0.07);
  border-color: var(--red);
  transform: translateY(-4px);
}
.step-num {
  font-family: var(--font-display);
  font-size: 72px; font-weight: 800;
  color: rgba(255,255,255,0.04);
  position: absolute; top: 10px; right: 16px;
  line-height: 1; pointer-events: none;
}
.step-icon { font-size: 44px; margin-bottom: 18px; display: block; }
.step-title {
  font-family: var(--font-display);
  font-size: 18px; font-weight: 700;
  color: #fff; margin: 0 0 12px; letter-spacing: -0.3px;
}
.step-text { font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.7; margin: 0; }

/* ── TESTIMONIALS ── */
.test-section {
  padding: 96px 24px;
  background: var(--off-white);
}
.test-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
  gap: 20px; max-width: 1200px; margin: 50px auto 0;
}
.test-card {
  background: #fff; border: 1.5px solid var(--gray-soft);
  border-radius: 4px; padding: 26px;
  transition: all 0.3s; position: relative;
  overflow: hidden;
}
.test-card::before {
  content: '"';
  font-family: var(--font-display);
  font-size: 120px; color: var(--gray-soft);
  position: absolute; top: -20px; left: 16px;
  line-height: 1; pointer-events: none;
}
.test-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(11,31,58,0.1); border-color: var(--red); }
.test-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
.test-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--navy); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-size: 18px; font-weight: 800; flex-shrink: 0;
}
.test-service-tag {
  font-family: var(--font-mono);
  font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; color: #fff;
  padding: 4px 12px; border-radius: 2px;
}
.test-rating { font-size: 13px; margin-bottom: 10px; }
.test-text {
  font-size: 14px; line-height: 1.75;
  color: var(--gray-text); margin: 0 0 18px;
  position: relative; z-index: 1;
}
.test-name { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--navy); }
.test-role { font-family: var(--font-mono); font-size: 11px; color: var(--gray-text); margin-top: 2px; }
.review-btn {
  padding: 14px 36px;
  background: var(--navy); color: #fff;
  border: none; border-radius: 2px;
  font-family: var(--font-display);
  font-size: 15px; font-weight: 700;
  cursor: pointer; transition: all 0.2s; margin-top: 40px;
  display: block; margin-inline: auto;
}
.review-btn:hover { background: var(--red); transform: translateY(-2px); }

/* ── WHY AXXSPACE ── */
.why-section {
  padding: 96px 24px;
  background: var(--cream);
}
.why-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px; max-width: 1200px; margin: 50px auto 0;
}
.why-card {
  padding: 28px; background: #fff;
  border: 1.5px solid var(--gray-soft);
  border-radius: 4px; text-align: center;
  transition: all 0.25s;
  border-top-width: 4px;
}
.why-card:hover { transform: translateY(-4px); box-shadow: 0 10px 32px rgba(11,31,58,0.08); }
.why-icon { font-size: 36px; margin-bottom: 16px; display: block; }
.why-title { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--navy); margin: 0 0 10px; }
.why-text { font-size: 13px; color: var(--gray-text); line-height: 1.65; margin: 0; }

/* ── FINAL CTA ── */
.cta-section {
  padding: 96px 24px;
  background: var(--navy);
  text-align: center;
  border-top: 3px solid var(--red);
  position: relative; overflow: hidden;
}
.cta-section::before {
  content: 'AXXSPACE';
  font-family: var(--font-display);
  font-size: clamp(80px, 14vw, 200px);
  font-weight: 800; color: rgba(255,255,255,0.02);
  position: absolute; left: 50%; top: 50%;
  transform: translate(-50%, -50%);
  white-space: nowrap; pointer-events: none; letter-spacing: -4px;
}
.cta-inner { max-width: 800px; margin: 0 auto; position: relative; z-index: 1; }
.cta-title {
  font-family: var(--font-display);
  font-size: clamp(32px, 5vw, 54px);
  font-weight: 800; color: #fff;
  margin: 0 0 14px; letter-spacing: -2px;
}
.cta-title em { font-style: normal; color: var(--gold); }
.cta-text { font-size: 17px; color: rgba(255,255,255,0.6); margin: 0 0 40px; line-height: 1.6; }
.cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 22px; }
.cta-btn {
  padding: 14px 24px;
  border: none; border-radius: 2px;
  font-family: var(--font-display);
  font-size: 14px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  letter-spacing: 0.03em;
}
.cta-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 28px auto; max-width: 420px; }
.cta-list-btn {
  padding: 16px 38px;
  font-family: var(--font-display);
  font-size: 16px; font-weight: 700;
  border-radius: 2px; cursor: pointer; transition: all 0.2s;
  letter-spacing: 0.03em;
}
.cta-hint {
  font-family: var(--font-mono);
  font-size: 11px; color: rgba(255,255,255,0.35);
  margin-top: 16px; letter-spacing: 0.08em;
}

/* ── FOOTER ── */
.footer {
  background: #050D1A;
  color: rgba(255,255,255,0.55);
  padding: 56px 24px 28px;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.footer-inner { max-width: 1000px; margin: 0 auto; }
.footer-top { text-align: center; margin-bottom: 44px; }
.footer-brand {
  font-family: var(--font-display);
  font-size: 28px; font-weight: 800; color: #fff;
}
.footer-brand span { color: var(--red); }
.footer-tagline { font-family: var(--font-mono); font-size: 11px; color: rgba(255,255,255,0.3); letter-spacing: 0.12em; margin-top: 6px; text-transform: uppercase; }
.footer-cols { display: flex; justify-content: center; gap: 64px; flex-wrap: wrap; margin-bottom: 44px; }
.footer-col { display: flex; flex-direction: column; gap: 10px; }
.footer-col-title { font-family: var(--font-mono); font-size: 10px; font-weight: 700; color: var(--gold); text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 4px; }
.footer-link { font-size: 13px; color: rgba(255,255,255,0.45); cursor: pointer; transition: color 0.2s; }
.footer-link:hover { color: #fff; }
.footer-copy { font-family: var(--font-mono); font-size: 11px; color: rgba(255,255,255,0.2); text-align: center; letter-spacing: 0.08em; }

/* ── MODAL ── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(11,31,58,0.9);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 20px;
  backdrop-filter: blur(8px);
}
.modal-box {
  background: #fff; border-radius: 4px;
  max-width: 540px; width: 100%;
  max-height: 90vh; overflow-y: auto;
  padding: 36px; position: relative;
  border-top: 4px solid var(--red);
  box-shadow: 0 30px 80px rgba(0,0,0,0.4);
}
.modal-close {
  position: absolute; top: 16px; right: 16px;
  background: var(--off-white); border: none;
  border-radius: 2px; width: 38px; height: 38px;
  cursor: pointer; font-size: 18px; color: var(--gray-text);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.modal-close:hover { background: var(--red); color: #fff; }
.modal-title { font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--navy); margin: 0 0 6px; letter-spacing: -0.5px; }
.modal-sub { font-size: 14px; color: var(--gray-text); margin: 0 0 26px; line-height: 1.6; }
.modal-services { display: flex; flex-direction: column; gap: 10px; }
.modal-service-card {
  display: flex; align-items: center; gap: 16px;
  padding: 16px; border: 1.5px solid var(--gray-soft);
  border-radius: 4px; cursor: pointer; transition: all 0.2s;
}
.modal-service-card:hover { border-color: var(--red); background: #fef2f2; transform: translateY(-2px); }
.modal-svc-icon {
  width: 50px; height: 50px; border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; flex-shrink: 0;
}
.modal-svc-title { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--navy); margin: 0 0 3px; }
.modal-svc-desc { font-size: 13px; color: var(--gray-text); margin: 0; }
.modal-arrow { color: var(--gray-soft); font-size: 20px; margin-left: auto; transition: all 0.2s; }
.modal-service-card:hover .modal-arrow { color: var(--red); transform: translateX(4px); }

/* ── SPINNER ── */
.spinner { width: 34px; height: 34px; border: 3px solid var(--gray-soft); border-top-color: var(--red); border-radius: 50%; animation: spin 0.8s linear infinite; }

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .spotlight-strip, .spotlight-strip.reverse { flex-direction: column !important; padding: 48px 24px !important; }
  .spot-visual { width: 100%; }
  .spot-stats { justify-content: center; }
}
@media (max-width: 640px) {
  .hero-stat { padding: 10px 16px; }
  .hero-stats { gap: 0; }
  .cta-btn { width: 100%; }
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
      color: "#E31B1B", bg: "linear-gradient(135deg,#fff8f8 0%,#ffe4e4 100%)", accent: "#B01212",
    },
    {
      id: "movers", icon: moversIcon, iconType: "image",
      title: "Movers", tagline: "Stress-free moving",
      description: "Connect with trusted, vetted moving companies across Kenya. Get quotes, compare rates, and book your move with confidence.",
      features: ["Vetted moving crews", "Transparent pricing", "Local & long-distance", "Real-time tracking"],
      cta: "Find Movers", route: "/movers",
      color: "#0B1F3A", bg: "linear-gradient(135deg,#EEF2FF 0%,#C7D7F8 100%)", accent: "#142B50",
    },
    {
      id: "tourism", icon: tourismIcon, iconType: "image",
      title: "Tourism", tagline: "Discover Kenya's best",
      description: "Explore hotels, lodges, resorts, and unique experiences across Kenya's 47 counties. From Nairobi to the coast and beyond.",
      features: ["Hotels & lodges", "Safari packages", "Weekend getaways", "Direct bookings"],
      cta: "Explore Tourism", route: "/tourism",
      color: "#047857", bg: "linear-gradient(135deg,#F0FDF4 0%,#BBF7D0 100%)", accent: "#065F46",
    },
    {
      id: "axxbiashara", icon: axxbiasharaIcon, iconType: "image",
      title: "AxxBiashara", tagline: "Business solutions",
      description: "Access professional business services, from company registration to accounting, legal support, and digital solutions.",
      features: ["Business registration", "Accounting & tax", "Legal services", "Digital solutions"],
      cta: "Explore Services", route: "/axxbiashara",
      color: "#6D28D9", bg: "linear-gradient(135deg,#F5F3FF 0%,#DDD6FE 100%)", accent: "#5B21B6",
    },
    {
      id: "marketplace", icon: "🏪", iconType: "emoji",
      title: "Marketplace", tagline: "Buy & sell anything",
      description: "The ultimate marketplace for buying and selling new and used items. From electronics to furniture, fashion to cars.",
      features: ["New & used items", "Secure transactions", "Nationwide delivery", "Direct seller contact"],
      cta: "Browse Marketplace", route: "/materials",
      color: "#0891B2", bg: "linear-gradient(135deg,#ECFEFF 0%,#A5F3FC 100%)", accent: "#0E7490",
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
    fetchFeatured().catch(err => { setComponentError("Failed to load featured properties"); });
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
    fetchReviews().catch(err => { setComponentError("Failed to load reviews"); });
  }, []);

  useEffect(() => {
    const targetStats = { listings: 280, counties: 47, tenants: 500 };
    const duration = 2000; const steps = 60;
    const interval = duration / steps; let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimatedStats({
        listings: Math.floor(targetStats.listings * easeOut),
        counties: Math.floor(targetStats.counties * easeOut),
        tenants: Math.floor(targetStats.tenants * easeOut),
      });
      if (currentStep >= steps) { clearInterval(timer); setAnimatedStats(targetStats); }
    }, interval);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
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

  if (componentError) {
    return (
      <div style={{ padding: "60px 24px", textAlign: "center", fontFamily: "'Outfit',sans-serif" }}>
        <h2 style={{ fontFamily: "'Syne',sans-serif", color: "#E31B1B", marginBottom: "12px" }}>Error Loading Page</h2>
        <p style={{ color: "#6B6860", marginBottom: "20px" }}>{componentError}</p>
        <button onClick={() => window.location.reload()} style={{ padding: "12px 28px", background: "#E31B1B", color: "#fff", border: "none", borderRadius: "2px", cursor: "pointer", fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>
          Reload Page
        </button>
      </div>
    );
  }

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
        <div style={{ position: "absolute", inset: 0, background: "#0B1F3A", zIndex: 0 }}></div>
        <video
          autoPlay muted loop playsInline
          className="hero-bg-video"
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setVideoLoaded(false)}
          style={{ opacity: videoLoaded ? 1 : 0, transition: "opacity 0.6s" }}
        >
          <source src={bgVideo} type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-grain"></div>

        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot"></span>
            Kenya's #1 Property & Services Platform
          </div>

          <h1 className="hero-title">
            Everything You Need<br />
            <em>Under One Roof</em>
          </h1>
          <p className="hero-subtitle">
            Rentals · Movers · Tourism · AxxBiashara · Marketplace — verified across all 47 counties
          </p>

          {/* CATEGORY TABS */}
          <div className="hero-tabs">
            {platformCategories.map((cat) => (
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
            <div style={{ maxWidth: "480px", margin: "0 auto 16px", textAlign: "center" }}>
              <p className="cat-cta-desc">{activeCategory?.description}</p>
              <button className="cat-cta-btn" onClick={() => navigate(activeCategory?.route)}>
                {activeCategory?.cta} →
              </button>
            </div>
          )}

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
              style={{ background: cat.bg }}
              onClick={() => navigate(cat.route)}
            >
              <style>{`.cat-card:hover::after { background: ${cat.color}; }`}</style>
              <div className="cat-icon-wrap" style={{ background: cat.color }}>
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
                  <li key={f} className="cat-feature-item" style={{ color: cat.accent }}>
                    <span style={{ color: cat.color, fontWeight: 800 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button className="cat-btn" style={{ background: cat.color }} onClick={e => { e.stopPropagation(); navigate(cat.route); }}>
                {cat.cta} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED LISTINGS ── */}
      <section className="featured-section">
        <div className="featured-header">
          <p className="section-eyebrow" style={{ color: "rgba(240,180,41,0.8)" }}>Premium Listings</p>
          <h2 className="section-title">⭐ Featured Properties</h2>
          <p className="section-sub">Verified & boosted properties from trusted landlords</p>
        </div>

        {loadingFeatured ? (
          <div className="cards-track-wrap">
            <div className="cards-track" style={{ animation: "none" }}>
              {[1, 2, 3, 4, 5].map(idx => (
                <div key={idx} className="skel-card">
                  <div className="skel-img"></div>
                  <div className="skel-body">
                    <div className="skel-line" style={{ width: "70%" }}></div>
                    <div className="skel-line" style={{ width: "50%" }}></div>
                    <div className="skel-line" style={{ width: "40%" }}></div>
                    <div className="skel-line" style={{ width: "60%", height: "20px" }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : fetchError ? (
          <div className="no-featured-wrap">
            <span className="no-feat-icon">⚠️</span>
            <p className="no-feat-title">Could not load featured listings</p>
            <p className="no-feat-sub">Please refresh in a moment.</p>
            <button onClick={() => window.location.reload()} className="no-feat-btn">🔄 Retry</button>
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
                      <div className="feat-boosted">★ BOOSTED</div>
                      <div className="feat-type">{property.type || "Rental"}</div>
                    </div>
                    <div className="feat-body">
                      <h3 className="feat-title">{property.title}</h3>
                      <p className="feat-loc">📍 {property.area}, {property.county}</p>
                      <div className="feat-meta">
                        {property.bedrooms && <span className="feat-tag">🛏 {property.bedrooms} Bed</span>}
                        {property.bathrooms && <span className="feat-tag">🚿 {property.bathrooms} Bath</span>}
                      </div>
                      <p className="feat-price">
                        KSh {Number(property.price).toLocaleString()}
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
          <div className="no-featured-wrap">
            <span className="no-feat-icon">🏡</span>
            <p className="no-feat-title">No featured listings yet</p>
            <p className="no-feat-sub">Boost your property to appear here and reach thousands of tenants!</p>
            <button onClick={handleListProperty} className="no-feat-btn">🚀 Boost Your Property</button>
          </div>
        )}
      </section>

      {/* ── SERVICE SPOTLIGHT STRIPS ── */}
      <section className="spotlight-section">
        {/* Movers */}
        <div className="spotlight-strip">
          <div className="spot-text">
            <span className="spot-badge" style={{ color: "#0B1F3A", borderColor: "#0B1F3A" }}>
              <img src={moversIcon} alt="Movers" style={{ width: "14px", height: "14px", marginRight: "4px", verticalAlign: "middle" }} />
              Movers
            </span>
            <h3 className="spot-title">Planning a Move?</h3>
            <p className="spot-desc">Connect with 60+ vetted moving companies across Kenya. Get instant quotes, compare prices, and book your move — local or long-distance.</p>
            <div className="spot-features">
              {["Insured cargo", "Trained crews", "Transparent quotes", "Available 24/7"].map(f => (
                <span key={f} className="spot-feat"><span style={{ color: "#0B1F3A" }}>✓</span> {f}</span>
              ))}
            </div>
            <button className="spot-btn" style={{ background: "#0B1F3A" }} onClick={() => navigate("/movers")}>Find a Mover →</button>
          </div>
          <div className="spot-visual">
            <div className="spot-icon-box" style={{ background: "linear-gradient(135deg,#EEF2FF,#C7D7F8)" }}>
              <img src={moversIcon} alt="Movers" style={{ width: "70px", height: "70px", objectFit: "contain" }} />
            </div>
            <div className="spot-stats">
              {[["60+", "Companies"], ["47", "Counties"], ["1,200+", "Moves Done"]].map(([v, l]) => (
                <div key={l} className="spot-stat">
                  <span className="spot-stat-val" style={{ color: "#0B1F3A" }}>{v}</span>
                  <span className="spot-stat-label">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="strip-divider"></div>

        {/* Tourism */}
        <div className="spotlight-strip reverse" style={{ background: "#F0FDF4" }}>
          <div className="spot-text">
            <span className="spot-badge" style={{ color: "#047857", borderColor: "#047857" }}>
              <img src={tourismIcon} alt="Tourism" style={{ width: "14px", height: "14px", marginRight: "4px", verticalAlign: "middle" }} />
              Tourism
            </span>
            <h3 className="spot-title">Explore Kenya Like Never Before</h3>
            <p className="spot-desc">Discover hotels, beach resorts, safari lodges, and unique experiences across Kenya's 47 counties. Book directly — no commission fees.</p>
            <div className="spot-features">
              {["Hotels & resorts", "Safari packages", "Beach getaways", "City escapes"].map(f => (
                <span key={f} className="spot-feat"><span style={{ color: "#047857" }}>✓</span> {f}</span>
              ))}
            </div>
            <button className="spot-btn" style={{ background: "#047857" }} onClick={() => navigate("/tourism")}>Explore Tourism →</button>
          </div>
          <div className="spot-visual">
            <div className="spot-icon-box" style={{ background: "linear-gradient(135deg,#D1FAE5,#6EE7B7)" }}>
              <img src={tourismIcon} alt="Tourism" style={{ width: "70px", height: "70px", objectFit: "contain" }} />
            </div>
            <div className="spot-stats">
              {[["200+", "Hotels"], ["47", "Counties"], ["3,000+", "Guests"]].map(([v, l]) => (
                <div key={l} className="spot-stat">
                  <span className="spot-stat-val" style={{ color: "#047857" }}>{v}</span>
                  <span className="spot-stat-label">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="strip-divider"></div>

        {/* AxxBiashara */}
        <div className="spotlight-strip" style={{ background: "#FAF7FF" }}>
          <div className="spot-text">
            <span className="spot-badge" style={{ color: "#6D28D9", borderColor: "#6D28D9" }}>
              <img src={axxbiasharaIcon} alt="AxxBiashara" style={{ width: "14px", height: "14px", marginRight: "4px", verticalAlign: "middle" }} />
              AxxBiashara
            </span>
            <h3 className="spot-title">Grow Your Business</h3>
            <p className="spot-desc">Access professional business services across Kenya. From company registration to accounting, legal support, and digital solutions.</p>
            <div className="spot-features">
              {["Business registration", "Accounting & tax", "Legal services", "Digital solutions"].map(f => (
                <span key={f} className="spot-feat"><span style={{ color: "#6D28D9" }}>✓</span> {f}</span>
              ))}
            </div>
            <button className="spot-btn" style={{ background: "#6D28D9" }} onClick={() => navigate("/axxbiashara")}>Explore Services →</button>
          </div>
          <div className="spot-visual">
            <div className="spot-icon-box" style={{ background: "linear-gradient(135deg,#EDE9FE,#C4B5FD)" }}>
              <img src={axxbiasharaIcon} alt="AxxBiashara" style={{ width: "70px", height: "70px", objectFit: "contain" }} />
            </div>
            <div className="spot-stats">
              {[["100+", "Providers"], ["47", "Counties"], ["2,000+", "Businesses"]].map(([v, l]) => (
                <div key={l} className="spot-stat">
                  <span className="spot-stat-val" style={{ color: "#6D28D9" }}>{v}</span>
                  <span className="spot-stat-label">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="strip-divider"></div>

        {/* Marketplace */}
        <div className="spotlight-strip reverse" style={{ background: "#ECFEFF" }}>
          <div className="spot-text">
            <span className="spot-badge" style={{ color: "#0891B2", borderColor: "#0891B2" }}>
              🏪 Marketplace
            </span>
            <h3 className="spot-title">Buy & Sell Anything</h3>
            <p className="spot-desc">The ultimate marketplace for buying and selling new and used items. From electronics to furniture, fashion to cars — find great deals.</p>
            <div className="spot-features">
              {["New & used items", "Secure transactions", "Nationwide delivery", "Direct seller contact"].map(f => (
                <span key={f} className="spot-feat"><span style={{ color: "#0891B2" }}>✓</span> {f}</span>
              ))}
            </div>
            <button className="spot-btn" style={{ background: "#0891B2" }} onClick={() => navigate("/materials")}>Browse Marketplace →</button>
          </div>
          <div className="spot-visual">
            <div className="spot-icon-box" style={{ background: "linear-gradient(135deg,#CFFAFE,#67E8F9)", fontSize: "64px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              🏪
            </div>
            <div className="spot-stats">
              {[["10K+", "Listings"], ["47", "Counties"], ["5,000+", "Users"]].map(([v, l]) => (
                <div key={l} className="spot-stat">
                  <span className="spot-stat-val" style={{ color: "#0891B2" }}>{v}</span>
                  <span className="spot-stat-label">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-section">
        <div className="section-hdr">
          <p className="section-eyebrow" style={{ color: "rgba(240,180,41,0.7)" }}>The Process</p>
          <h2 className="section-title">How It Works</h2>
          <p className="section-sub" style={{ color: "rgba(255,255,255,0.45)" }}>One platform. Five services. Endless possibilities.</p>
        </div>
        <div className="steps-grid">
          {[
            { num: "01", icon: "🔍", title: "Search & Discover", text: "Browse verified listings across Rentals, Movers, Merchants, and Tourism — all in one place." },
            { num: "02", icon: "💬", title: "Connect Directly", text: "Chat with landlords, movers, merchants, or hotels via WhatsApp or call — no middlemen." },
            { num: "03", icon: "✅", title: "Book & Confirm", text: "Schedule viewings, get quotes, place orders, or book stays — with full transparency." },
            { num: "04", icon: "🏠", title: "Move In & Thrive", text: "Find your home, move your stuff, furnish it, and explore Kenya — all through Axxspace." },
          ].map(s => (
            <div key={s.num} className="step-card">
              <span className="step-num">{s.num}</span>
              <span className="step-icon">{s.icon}</span>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-text">{s.text}</p>
            </div>
          ))}
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
              <div className="spinner" style={{ margin: "0 auto" }}></div>
              <p style={{ color: "#6B6860", marginTop: "16px" }}>Loading reviews...</p>
            </div>
          ) : reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review._id} className="test-card">
                <div className="test-top">
                  <div className="test-avatar">{review.userName?.charAt(0).toUpperCase() || "U"}</div>
                  <div className="test-service-tag" style={{ background: review.category === "property" ? "#E31B1B" : review.category === "mover" ? "#0B1F3A" : review.category === "merchant" ? "#D97706" : review.category === "tourism" ? "#047857" : "#6B7280" }}>
                    {review.category === "general" ? "General" : review.category.charAt(0).toUpperCase() + review.category.slice(1)}
                  </div>
                </div>
                <div className="test-rating">{"⭐".repeat(review.rating)}</div>
                <p className="test-text">"{review.comment}"</p>
                <div>
                  <div className="test-name">{review.userName}</div>
                  <div className="test-role">{new Date(review.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))
          ) : (
            [
              { name: "Sarah Wanjiku", role: "Tenant · Nairobi", rating: 5, text: "Found my dream apartment in 2 days! The WhatsApp feature made connecting with the landlord so easy. No agents, no hidden fees.", tag: "Rentals", tagColor: "#E31B1B" },
              { name: "David Mwangi", role: "Customer · Mombasa", rating: 5, text: "Booked movers through Axxspace for my relocation to Nairobi. Professional team, transparent pricing, everything arrived safely.", tag: "Movers", tagColor: "#0B1F3A" },
              { name: "Grace Omondi", role: "Developer · Kisumu", rating: 5, text: "The merchant listings saved me thousands on my construction project. Found roofing materials at 20% below market prices.", tag: "Merchants", tagColor: "#D97706" },
              { name: "James Kariuki", role: "Tourist · Nairobi", rating: 5, text: "Planned a full safari weekend through Axxspace Tourism. Best lodge, easy booking, and zero commission. Absolutely loved it!", tag: "Tourism", tagColor: "#047857" },
            ].map(t => (
              <div key={t.name} className="test-card">
                <div className="test-top">
                  <div className="test-avatar" style={{ background: t.tagColor }}>{t.name.charAt(0)}</div>
                  <div className="test-service-tag" style={{ background: t.tagColor }}>{t.tag}</div>
                </div>
                <div className="test-rating">{"⭐".repeat(t.rating)}</div>
                <p className="test-text">"{t.text}"</p>
                <div>
                  <div className="test-name">{t.name}</div>
                  <div className="test-role">{t.role}</div>
                </div>
              </div>
            ))
          )}
        </div>
        <div style={{ textAlign: "center" }}>
          <button onClick={() => navigate("/leave-review")} className="review-btn">✍️ Leave a Review</button>
        </div>
      </section>

      {/* ── WHY AXXSPACE ── */}
      <section className="why-section">
        <div className="section-hdr">
          <p className="section-eyebrow">Our Advantages</p>
          <h2 className="section-title">Why Axxspace?</h2>
          <p className="section-sub">Built for Kenyans, by Kenyans — serving every need</p>
        </div>
        <div className="why-grid">
          {[
            { icon: "✓", title: "Verified Listings", text: "Every listing is manually reviewed before going live", color: "#E31B1B" },
            { icon: "💬", title: "Direct WhatsApp", text: "Skip the middleman. Chat directly with providers", color: "#E31B1B" },
            { icon: "🌍", title: "All 47 Counties", text: "The only platform serving every corner of Kenya", color: "#0B1F3A" },
            { icon: "📱", title: "Mobile Optimized", text: "Fully responsive — works on any device", color: "#0B1F3A" },
            { icon: "🗺", title: "GPS Maps", text: "Interactive maps with exact coordinates for every listing", color: "#E31B1B" },
            { icon: "💰", title: "Zero Hidden Fees", text: "What you see is what you pay. Transparent pricing", color: "#047857" },
            { icon: "🔒", title: "Safe & Secure", text: "Industry-standard encryption protects your data", color: "#D97706" },
            { icon: "⚡", title: "One Platform", text: "Rent, move, build, and explore without switching apps", color: "#0B1F3A" },
          ].map(f => (
            <div key={f.title} className="why-card" style={{ borderTopColor: f.color }}>
              <span className="why-icon">{f.icon}</span>
              <h3 className="why-title">{f.title}</h3>
              <p className="why-text">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2 className="cta-title">Start Your Journey <em>Today</em></h2>
          <p className="cta-text">Join thousands of Kenyans who find homes, move smarter, build better, and explore more — all through Axxspace.</p>
          <div className="cta-btns">
            <button className="cta-btn" style={{ background: "#E31B1B", color: "#fff" }} onClick={() => navigate("/listings")}>🏢 Browse Rentals</button>
            <button className="cta-btn" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }} onClick={() => navigate("/movers")}>🚛 Find Movers</button>
            <button className="cta-btn" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }} onClick={() => navigate("/materials")}>🛍️ Shop Materials</button>
            <button className="cta-btn" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }} onClick={() => navigate("/tourism")}>🏨 Explore Tourism</button>
          </div>
          <div className="cta-divider"></div>
          <button
            className="cta-list-btn"
            style={token ? { background: "#E31B1B", color: "#fff", border: "none" } : { background: "#fff", color: "#0B1F3A", border: "none" }}
            onClick={handleListProperty}
          >
            {token ? "📝 List Your Property / Service" : "🔐 Login to List Your Business"}
          </button>
          {!token && <p className="cta-hint">FREE TO JOIN — NO CREDIT CARD REQUIRED</p>}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">Axx<span>space</span></div>
            <p className="footer-tagline">Kenya's Most Trusted Property & Services Platform</p>
            <div style={{ marginTop: "18px" }}>
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
          <p className="footer-copy">© 2026 AXXSPACE · ALL RIGHTS RESERVED</p>
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
                { icon: "🏠", title: "Landlord / Rentals", desc: "List rental properties and boost your listings", bg: "linear-gradient(135deg,#E31B1B,#B01212)", route: "/login" },
                { icon: "🚛", title: "Mover / Moving Company", desc: "Offer moving services across Kenya", bg: "linear-gradient(135deg,#0B1F3A,#142B50)", route: "/login?type=mover" },
                { icon: "🛍️", title: "Seller / Marketplace", desc: "Sell items in the materials marketplace", bg: "linear-gradient(135deg,#0891B2,#0E7490)", route: "/seller-login" },
                { icon: "🏨", title: "Tourism Provider", desc: "List hotels, lodges, and tourism experiences", bg: "linear-gradient(135deg,#047857,#065F46)", route: "/tourism/login" },
                { icon: "💼", title: "Business / AxxBiashara", desc: "List professional business services", bg: "linear-gradient(135deg,#6D28D9,#5B21B6)", route: "/business-login" },
              ].map(svc => (
                <div key={svc.title} className="modal-service-card" onClick={() => { setShowBoostModal(false); navigate(svc.route); }}>
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