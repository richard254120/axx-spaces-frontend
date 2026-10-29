import { useState, useEffect, useContext, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import bgVideo from "../assets/homepage-hero.mp4";
import SocialMediaLinks from "../components/SocialMediaLinks";
import RequestItemModal from "../components/RequestItemModal";
import { optimizeImage, imageSrcSet, IMG_WIDTH } from "../utils/imageUrl";

/* ════════════════════════════════════════════════
   HOMEPRO — all styles are scoped under .ax-root
   so this file can live beside the old Home.jsx
════════════════════════════════════════════════ */
const css = `
/* Web fonts are loaded from index.html with preconnect + display:swap.
   An @import here would block first paint until the font CSS round-trip
   finished, so it is deliberately kept out of this style block. */

.ax-root{
  --ink:#0F172A; --ink-2:#1E293B; --mute:#64748B; --line:#E2E8F0;
  --paper:#F8FAFC; --card:#FFFFFF; --green:#0B5D3B; --green-d:#073F29;
  --green-l:#E4F1EA; --red:#E31B1B; --amber:#F59E0B;
  --bg-dark:#08101D; --navy-dark:#0F172A;
  font-family:'Instrument Sans',system-ui,sans-serif; color:var(--ink);
  background:var(--paper); min-height:100vh; overflow-x:hidden; line-height:1.5;
}
.ax-root *{box-sizing:border-box;margin:0;padding:0}
.ax-root h1,.ax-root h2,.ax-root h3,.ax-root h4{font-family:'Bricolage Grotesque',sans-serif;letter-spacing:-0.02em;line-height:1.1}
.ax-root button{font-family:inherit;cursor:pointer}
.ax-root :focus-visible{outline:3px solid var(--amber);outline-offset:2px}
.ax-root .ax-wrap{max-width:1200px;margin:0 auto;padding:0 24px}
.ax-root .ax-section{padding:88px 0}
.ax-root .ax-section.alt{background:var(--card);border-block:1px solid var(--line)}
.ax-root .ax-sec-head{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap;margin-bottom:36px}
.ax-root .ax-sec-head h2{font-size:clamp(28px,3.6vw,42px);font-weight:700;max-width:620px}
.ax-root .ax-sec-head p{color:var(--mute);max-width:460px;font-size:16px}

/* trust bar */
.ax-root .ax-trust{background:#0B1322;color:#94A3B8;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.08)}
.ax-root .ax-trust .ax-wrap{display:flex;gap:28px;justify-content:center;flex-wrap:wrap;padding-block:9px}
.ax-root .ax-trust span{display:inline-flex;align-items:center;gap:8px}
.ax-root .ax-trust i{width:6px;height:6px;border-radius:50%;background:var(--amber);display:inline-block}

/* Ambient mesh & glowing orbs (Matching Rentals/Property & Accommodation) */
.ambient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
  z-index: -2;
  opacity: 0.6;
  animation: orbFloat 10s ease-in-out infinite alternate;
}
.orb-crimson {
  top: -100px;
  left: 10%;
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(227, 27, 27, 0.35) 0%, transparent 70%);
}
.orb-amber {
  top: 40px;
  right: 5%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%);
  animation-delay: -3s;
}
.orb-navy {
  bottom: -150px;
  left: 40%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%);
  animation-delay: -6s;
}

@keyframes orbFloat {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(30px) scale(1.1); }
}

.hero-grid-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(circle at 50% 40%, black 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(circle at 50% 40%, black 30%, transparent 80%);
  pointer-events: none;
  z-index: -1;
}

/* hero */
.ax-root .ax-hero{
  position:relative;
  color:#fff;
  background: radial-gradient(circle at 50% 20%, #112035 0%, var(--bg-dark) 80%);
  overflow:hidden;
  isolation:isolate;
}
.ax-root .ax-hero video{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit:cover;
  z-index:-2;
  transition:opacity .8s;
  mix-blend-mode:luminosity;
}
.ax-root .ax-hero::after{
  content:"";
  position:absolute;
  inset:0;
  z-index:-1;
  background: radial-gradient(circle at 50% 20%, rgba(17, 32, 53, 0.72) 0%, rgba(8, 16, 29, 0.92) 80%);
}
.ax-root .ax-hero-inner{
  padding:110px 24px 100px;
  max-width:1200px;
  margin:0 auto;
  position:relative;
  z-index:2;
}
.ax-root .ax-hero h1{font-size:clamp(38px,6.2vw,72px);font-weight:800;max-width:860px}
.ax-root .ax-hero-sub{margin-top:20px;font-size:clamp(16px,1.7vw,19px);max-width:560px;color:#D5E3DB}

/* search panel */
.ax-root .ax-search{margin-top:44px;background:var(--card);color:var(--ink);border-radius:18px;
  box-shadow:0 30px 70px rgba(0,0,0,.35);max-width:900px;overflow:hidden}
.ax-root .ax-search-body{display:grid;grid-template-columns:1fr 1fr auto;gap:12px;padding:18px;align-items:end}
.ax-root .ax-search-body.single{grid-template-columns:1fr auto}
.ax-root .ax-field{display:flex;flex-direction:column;gap:6px}
.ax-root .ax-field label{font-size:12px;font-weight:600;color:var(--mute)}
.ax-root .ax-field select,.ax-root .ax-field input{height:48px;border:1px solid var(--line);border-radius:10px;padding:0 14px;
  font:500 15px 'Instrument Sans',sans-serif;color:var(--ink);background:var(--paper);width:100%}
.ax-root .ax-field select:focus,.ax-root .ax-field input:focus{border-color:var(--green);outline:none;box-shadow:0 0 0 3px var(--green-l)}
.ax-root .ax-btn{height:48px;padding:0 28px;border-radius:10px;border:0;font-weight:700;font-size:15px;
  background:var(--green);color:#fff;transition:background .2s,transform .15s;white-space:nowrap}
.ax-root .ax-btn:hover{background:var(--green-d);transform:translateY(-1px)}
.ax-root .ax-btn.ghost{background:transparent;color:var(--green);border:1px solid var(--green)}
.ax-root .ax-btn.ghost:hover{background:var(--green-l);transform:none}
.ax-root .ax-btn.amber{background:var(--amber);color:#2A1A00}
.ax-root .ax-btn.amber:hover{background:#E39425}

/* hero stats */
.ax-root .ax-stats{display:flex;gap:44px;flex-wrap:wrap;margin-top:40px}
.ax-root .ax-stat strong{display:block;font:700 30px 'Bricolage Grotesque',sans-serif}
.ax-root .ax-stat span{font-size:13px;color:#B9CFC3}

/* services */
.ax-root .ax-services{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.ax-root .ax-svc{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:26px;text-align:left;
  display:flex;flex-direction:column;gap:12px;min-height:210px;transition:border-color .2s,box-shadow .2s,transform .2s}
.ax-root .ax-svc:hover{border-color:var(--green);box-shadow:0 14px 34px rgba(11,93,59,.12);transform:translateY(-3px)}
.ax-root .ax-svc-ico{width:44px;height:44px;border-radius:12px;background:var(--green-l);color:var(--green);display:grid;place-items:center}
.ax-root .ax-svc h3{font-size:20px;font-weight:700}
.ax-root .ax-svc p{color:var(--mute);font-size:14.5px;flex:1}
.ax-root .ax-svc b{color:var(--green);font-size:14px}

/* featured */
.ax-root .ax-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:28px}
.ax-root .ax-tab{padding:9px 18px;border-radius:999px;border:1px solid var(--line);background:var(--card);
  font-size:14px;font-weight:600;color:var(--ink-2);display:inline-flex;gap:8px;align-items:center;transition:all .2s}
.ax-root .ax-tab:hover{border-color:var(--green)}
.ax-root .ax-tab[aria-selected="true"]{background:var(--green);border-color:var(--green);color:#fff}
.ax-root .ax-tab em{font-style:normal;font-size:12px;padding:1px 8px;border-radius:999px;background:rgba(0,0,0,.08)}
.ax-root .ax-tab[aria-selected="true"] em{background:rgba(255,255,255,.22)}
.ax-root .ax-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(262px,1fr));gap:22px}
.ax-root .ax-card{background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden;cursor:pointer;
  display:flex;flex-direction:column;text-align:left;transition:box-shadow .25s,transform .25s}
.ax-root .ax-card:hover{box-shadow:0 16px 40px rgba(16,22,20,.12);transform:translateY(-4px)}
.ax-root .ax-card-img{position:relative;aspect-ratio:4/3;background:linear-gradient(135deg,#DCE9E2,#EEF3EF);overflow:hidden}
.ax-root .ax-card-img img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
.ax-root .ax-card:hover .ax-card-img img{transform:scale(1.05)}
.ax-root .ax-card-img .ph{height:100%;display:grid;place-items:center;color:var(--green);font-weight:600;font-size:14px}
.ax-root .ax-chip{position:absolute;top:12px;left:12px;background:var(--amber);color:#2A1A00;font-size:12px;font-weight:700;
  padding:4px 10px;border-radius:999px}
.ax-root .ax-chip.v{left:auto;right:12px;background:rgba(16,22,20,.8);color:#fff}
.ax-root .ax-card-body{padding:18px;display:flex;flex-direction:column;gap:6px;flex:1}
.ax-root .ax-card-cat{font-size:13px;color:var(--green);font-weight:600}
.ax-root .ax-card h3{font-size:18px;font-weight:600;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ax-root .ax-card-loc{font-size:14px;color:var(--mute)}
.ax-root .ax-card-foot{margin-top:auto;padding-top:12px;border-top:1px solid var(--line);font:700 18px 'Bricolage Grotesque',sans-serif}
.ax-root .ax-empty{text-align:center;padding:64px 20px;border:1px dashed var(--line);border-radius:16px;background:var(--card)}
.ax-root .ax-empty h4{font-size:20px;margin-bottom:8px}
.ax-root .ax-empty p{color:var(--mute);margin-bottom:20px}
.ax-root .ax-skel{height:340px;border-radius:16px;background:linear-gradient(90deg,#ECEFEC 25%,#F5F7F5 50%,#ECEFEC 75%);
  background-size:300% 100%;animation:axsk 1.4s infinite}
@keyframes axsk{to{background-position:-300% 0}}
.ax-root .ax-center{text-align:center;margin-top:36px}

/* steps */
.ax-root .ax-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:1px solid var(--line);border-radius:16px;overflow:hidden;background:var(--card)}
.ax-root .ax-step{padding:34px 30px;border-right:1px solid var(--line)}
.ax-root .ax-step:last-child{border-right:0}
.ax-root .ax-step-n{width:36px;height:36px;border-radius:50%;background:var(--green);color:#fff;display:grid;place-items:center;font-weight:700;margin-bottom:18px}
.ax-root .ax-step h3{font-size:20px;margin-bottom:8px}
.ax-root .ax-step p{color:var(--mute);font-size:15px}

/* analytics */
.ax-root .ax-an{display:grid;grid-template-columns:1.4fr 1fr;gap:24px}
.ax-root .ax-panel{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:26px}
.ax-root .ax-panel h3{font-size:19px;margin-bottom:18px}
.ax-root .ax-seg{display:inline-flex;background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:3px;margin-bottom:20px}
.ax-root .ax-seg button{border:0;background:none;padding:7px 16px;border-radius:8px;font-size:14px;font-weight:600;color:var(--mute)}
.ax-root .ax-seg button[aria-selected="true"]{background:var(--green);color:#fff}
.ax-root .ax-donut{display:flex;gap:28px;align-items:center;flex-wrap:wrap}
.ax-root .ax-legend{flex:1;min-width:200px;display:flex;flex-direction:column;gap:8px}
.ax-root .ax-legend div{display:flex;justify-content:space-between;gap:12px;font-size:14.5px;padding:6px 8px;border-radius:8px;cursor:default}
.ax-root .ax-legend div:hover,.ax-root .ax-legend div.on{background:var(--paper)}
.ax-root .ax-legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:10px}
.ax-root .ax-bar-row{margin-bottom:14px}
.ax-root .ax-bar-row header{display:flex;justify-content:space-between;font-size:14.5px;margin-bottom:6px}
.ax-root .ax-bar-row header span:last-child{color:var(--mute)}
.ax-root .ax-bar{height:8px;border-radius:4px;background:var(--line);overflow:hidden}
.ax-root .ax-bar i{display:block;height:100%;background:var(--green);border-radius:4px}
.ax-root .ax-kpis{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:22px}
.ax-root .ax-kpi{background:var(--paper);border-radius:12px;padding:18px}
.ax-root .ax-kpi strong{display:block;font:700 32px 'Bricolage Grotesque',sans-serif;color:var(--green)}
.ax-root .ax-kpi span{font-size:13px;color:var(--mute)}

/* app */
.ax-root .ax-app{display:grid;grid-template-columns:1.1fr .9fr;gap:56px;align-items:center}
.ax-root .ax-app h2{font-size:clamp(28px,3.6vw,42px);margin-bottom:16px}
.ax-root .ax-app>div>p{color:var(--mute);font-size:16px;max-width:520px;margin-bottom:24px}
.ax-root .ax-list{list-style:none;display:grid;gap:12px;margin-bottom:30px}
.ax-root .ax-list li{display:flex;gap:12px;font-size:15px;align-items:flex-start}
.ax-root .ax-list svg{flex-shrink:0;color:var(--green);margin-top:3px}
.ax-root .ax-app-cta{display:flex;gap:18px;align-items:center;flex-wrap:wrap}
.ax-root .ax-app-cta small{display:block;color:var(--mute);font-size:13px}
.ax-root .ax-phone{width:250px;height:500px;margin:0 auto;border:10px solid var(--ink);border-radius:36px;background:var(--paper);
  padding:30px 14px 14px;position:relative;box-shadow:0 30px 60px rgba(16,22,20,.2)}
.ax-root .ax-phone::before{content:"";position:absolute;top:0;left:50%;transform:translateX(-50%);width:90px;height:20px;background:var(--ink);border-radius:0 0 14px 14px}
.ax-root .ax-phone b{font:800 17px 'Bricolage Grotesque',sans-serif;color:var(--green);display:block;margin-bottom:12px}
.ax-root .ax-ph-card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px;margin-bottom:12px}
.ax-root .ax-ph-img{height:96px;border-radius:8px;background:var(--green-l);margin-bottom:8px}
.ax-root .ax-ph-l{height:10px;border-radius:3px;background:var(--line);margin-bottom:6px}

/* reviews */
.ax-root .ax-reviews{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:20px}
.ax-root .ax-rev{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:24px;display:flex;flex-direction:column;gap:14px}
.ax-root .ax-stars{color:var(--amber);letter-spacing:2px}
.ax-root .ax-rev p{font-size:15px;color:var(--ink-2);flex:1}
.ax-root .ax-who{display:flex;gap:12px;align-items:center}
.ax-root .ax-av{width:40px;height:40px;border-radius:50%;background:var(--green);color:#fff;display:grid;place-items:center;font-weight:700}
.ax-root .ax-who strong{display:block;font-size:14.5px}
.ax-root .ax-who span{font-size:13px;color:var(--mute)}

/* cta */
.ax-root .ax-cta{
  background: radial-gradient(circle at 50% 20%, #112035 0%, var(--bg-dark) 80%);
  color:#fff;
  border-radius:24px;
  padding:64px 32px;
  text-align:center;
  border: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
}
.ax-root .ax-cta h2{font-size:clamp(30px,4.4vw,52px);margin-bottom:14px}
.ax-root .ax-cta p{color:#94A3B8;max-width:520px;margin:0 auto 30px}
.ax-root .ax-cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;position:relative;z-index:2}
.ax-root .ax-cta .ax-btn.ghost{color:#fff;border-color:rgba(255,255,255,.3)}
.ax-root .ax-cta .ax-btn.ghost:hover{background:rgba(255,255,255,.1)}
.ax-root .ax-cta small{display:block;margin-top:18px;color:#64748B;font-size:13px}

/* footer */
.ax-root .ax-footer{
  background: var(--bg-dark);
  color: #94A3B8;
  padding: 60px 0 28px;
  margin-top: 88px;
  border-top: 1px solid #1E293B;
}
.ax-root .ax-foot-grid{display:grid;grid-template-columns:1.5fr repeat(4,1fr);gap:36px;margin-bottom:40px}
.ax-root .ax-foot-brand{font:800 26px 'Bricolage Grotesque',sans-serif;color:#fff;margin-bottom:10px}
.ax-root .ax-foot-brand span{color:var(--amber)}
.ax-root .ax-foot-col h4{color:#fff;font-size:15px;margin-bottom:14px}
.ax-root .ax-foot-col a,.ax-root .ax-foot-col button{display:block;background:none;border:0;color:inherit;font-size:14px;margin-bottom:10px;
  text-align:left;text-decoration:none;cursor:pointer}
.ax-root .ax-foot-col a:hover,.ax-root .ax-foot-col button:hover{color:#fff}
.ax-root .ax-copy{border-top:1px solid #1E293B;padding-top:22px;font-size:13px;text-align:center}

/* modal */
.ax-root .ax-modal-bg{position:fixed;inset:0;background:rgba(7,19,13,.7);display:grid;place-items:center;z-index:9999;padding:20px;backdrop-filter:blur(4px)}
.ax-root .ax-modal{background:var(--card);border-radius:20px;max-width:520px;width:100%;max-height:90vh;overflow:auto;padding:32px;position:relative;color:var(--ink)}
.ax-root .ax-modal h2{font-size:26px;margin-bottom:6px}
.ax-root .ax-modal>p{color:var(--mute);margin-bottom:22px;font-size:15px}
.ax-root .ax-modal-x{position:absolute;top:14px;right:14px;width:36px;height:36px;border-radius:50%;border:1px solid var(--line);background:var(--card);font-size:16px}
.ax-root .ax-modal-opt{display:flex;gap:14px;align-items:center;width:100%;padding:14px;border:1px solid var(--line);border-radius:12px;
  background:var(--card);margin-bottom:10px;text-align:left;transition:border-color .2s,background .2s}
.ax-root .ax-modal-opt:hover{border-color:var(--green);background:var(--green-l)}
.ax-root .ax-modal-opt strong{display:block;font-size:16px}
.ax-root .ax-modal-opt span{font-size:13.5px;color:var(--mute)}

/* advertising */
.ax-root .ax-adband{padding:8px 0 56px}
.ax-root .ax-ad{display:grid;grid-template-columns:minmax(0,340px) 1fr;width:100%;background:var(--card);border:1px solid var(--line);
  border-radius:16px;overflow:hidden;text-align:left;margin-bottom:16px;transition:box-shadow .2s}
.ax-root .ax-ad:hover{box-shadow:0 14px 34px rgba(16,22,20,.1)}
.ax-root .ax-ad.noimg{grid-template-columns:1fr}
.ax-root .ax-ad img{width:100%;height:100%;min-height:170px;object-fit:cover;display:block}
.ax-root .ax-ad-text{padding:28px;display:flex;flex-direction:column;gap:8px;justify-content:center}
.ax-root .ax-ad-tag{font-size:12px;font-weight:600;color:var(--mute)}
.ax-root .ax-ad-text h3{font-size:26px}
.ax-root .ax-ad-text p{color:var(--mute);max-width:560px}
.ax-root .ax-ad-cta{color:var(--green);font-weight:700;font-size:14px;margin-top:4px}
.ax-root .ax-dots{display:flex;gap:8px;justify-content:center;margin-bottom:16px}
.ax-root .ax-dots button{width:9px;height:9px;border-radius:50%;border:0;background:var(--line);padding:0}
.ax-root .ax-dots button[aria-current="true"]{background:var(--green)}
.ax-root .ax-advertise{display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;
  background:var(--green-l);border-radius:16px;padding:22px 26px}
.ax-root .ax-advertise h3{font-size:20px;margin-bottom:4px}
.ax-root .ax-advertise p{color:var(--ink-2);font-size:15px}
.ax-root .ax-chip.ad{background:rgba(16,22,20,.8);color:#fff}
@media (max-width:1000px){
  .ax-root .ax-services{grid-template-columns:repeat(2,1fr)}
  .ax-root .ax-an,.ax-root .ax-app{grid-template-columns:1fr}
  .ax-root .ax-foot-grid{grid-template-columns:1fr 1fr}
}
@media (max-width:720px){
  .ax-root .ax-ad{grid-template-columns:1fr}
  .ax-root .ax-section{padding:60px 0}
  .ax-root .ax-hero-inner{padding:64px 20px 52px}
  .ax-root .ax-search-body,.ax-root .ax-search-body.single{grid-template-columns:1fr}
  .ax-root .ax-steps{grid-template-columns:1fr}
  .ax-root .ax-step{border-right:0;border-bottom:1px solid var(--line)}
  .ax-root .ax-step:last-child{border-bottom:0}
  .ax-root .ax-services{grid-template-columns:1fr}
  .ax-root .ax-stats{gap:28px}
  .ax-root .ax-trust .ax-wrap{gap:14px;font-size:12px}
}
@media (prefers-reduced-motion:reduce){
  .ax-root *{animation:none!important;transition:none!important}
}

/* ════════════════════════════════════════════════
   REFRESH LAYER — smarter hero, motion & polish
════════════════════════════════════════════════ */
.ax-root .ax-eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:11px;font-weight:700;
  letter-spacing:.16em;text-transform:uppercase;color:var(--green);margin-bottom:12px}
.ax-root .ax-eyebrow::before{content:"";width:24px;height:2px;border-radius:2px;background:currentColor;opacity:.65}
.ax-root .ax-sec-head .ax-eyebrow{color:var(--green)}

/* scroll reveal */
.ax-root [data-reveal]{opacity:0;transform:translateY(26px);
  transition:opacity .7s cubic-bezier(.22,.61,.36,1),transform .7s cubic-bezier(.22,.61,.36,1);
  transition-delay:var(--d,0ms)}
.ax-root [data-reveal].is-visible{opacity:1;transform:none}

/* hero rebuild */
.ax-root .ax-hero-inner{display:grid;grid-template-columns:minmax(0,1.12fr) minmax(0,.88fr);
  gap:48px;align-items:center;padding:80px 24px 58px;max-width:1200px}
.ax-root .ax-hero-copy{min-width:0;animation:axRise .9s cubic-bezier(.22,.61,.36,1) both}
.ax-root .ax-hero-side{animation:axRise 1.05s cubic-bezier(.22,.61,.36,1) both;animation-delay:.12s}
.ax-root .ax-hero-badge{display:inline-flex;align-items:center;gap:10px;padding:8px 16px;border-radius:999px;
  background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);font-size:12.5px;font-weight:600;
  color:#CBD5E1;backdrop-filter:blur(10px)}
.ax-root .ax-hero-badge i{width:7px;height:7px;border-radius:50%;background:#34D399;
  box-shadow:0 0 0 4px rgba(52,211,153,.18);animation:axPulse 2.4s ease-in-out infinite}
.ax-root .ax-hero h1{margin-top:20px;font-size:clamp(34px,5vw,66px);line-height:1.05;letter-spacing:-.035em;max-width:640px}
.ax-root .ax-grad{background:linear-gradient(96deg,#FBBF24,#F59E0B 42%,#34D399);background-size:180% 100%;
  -webkit-background-clip:text;background-clip:text;color:transparent;animation:axGrad 9s ease infinite}
.ax-root .ax-hero-sub{margin-top:20px;font-size:clamp(15px,1.5vw,18px);max-width:552px;color:#BFD1C7}
.ax-root .ax-btn.glass{background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.2);backdrop-filter:blur(10px)}
.ax-root .ax-btn.glass:hover{background:rgba(255,255,255,.16);transform:translateY(-1px)}
.ax-root .ax-shine{position:relative;overflow:hidden;isolation:isolate}
.ax-root .ax-shine::after{content:"";position:absolute;inset:0;z-index:-1;
  background:linear-gradient(110deg,transparent 22%,rgba(255,255,255,.5) 46%,transparent 66%);
  transform:translateX(-130%);transition:transform .8s ease}
.ax-root .ax-shine:hover::after{transform:translateX(130%)}

/* hero visual */
.ax-root .ax-hero-side{position:relative;min-height:420px;display:flex;align-items:center;justify-content:center}
.ax-root .ax-hero-card{width:100%;max-width:360px;background:rgba(15,23,42,.72);border:1px solid rgba(255,255,255,.12);
  border-radius:20px;padding:14px;backdrop-filter:blur(18px);box-shadow:0 30px 70px rgba(0,0,0,.45);
  animation:axFloat 9s ease-in-out infinite}
.ax-root .ax-hero-card-top{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;color:#94A3B8;padding:2px 4px 12px}
.ax-root .ax-hero-card-top i{width:7px;height:7px;border-radius:50%;background:#34D399;animation:axPulse 2.4s infinite}
.ax-root .ax-hero-thumb{position:relative;aspect-ratio:16/10;border-radius:14px;overflow:hidden;
  background:linear-gradient(135deg,#12291F,#0B5D3B)}
.ax-root .ax-hero-thumb img{width:100%;height:100%;object-fit:cover;transition:transform .6s ease}
.ax-root .ax-hero-card:hover .ax-hero-thumb img{transform:scale(1.05)}
.ax-root .ax-hero-thumb::after{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(8,16,29,.6),transparent 58%)}
.ax-root .ax-hero-thumb .ax-thumb-tag{position:absolute;top:10px;left:10px;z-index:2;background:var(--amber);color:#2A1A00;
  font-size:11px;font-weight:800;padding:4px 10px;border-radius:999px;letter-spacing:.02em}
.ax-root .ax-hero-card-body{padding:14px 6px 4px;display:flex;flex-direction:column;gap:3px}
.ax-root .ax-hero-card-body strong{font-size:16px;color:#fff;line-height:1.3}
.ax-root .ax-hero-card-body span{font-size:13px;color:#94A3B8}
.ax-root .ax-hero-card-body .ax-price{font:800 20px 'Bricolage Grotesque',sans-serif;color:var(--amber);margin-top:8px}
.ax-root .ax-hero-mini{position:absolute;right:0;bottom:6px;display:flex;align-items:center;gap:12px;padding:13px 18px;
  border-radius:16px;background:rgba(255,255,255,.97);color:var(--ink);box-shadow:0 18px 44px rgba(0,0,0,.35);
  animation:axFloat 7s ease-in-out infinite;animation-delay:-3.5s}
.ax-root .ax-hero-mini b{display:block;font:800 19px 'Bricolage Grotesque',sans-serif;line-height:1.1}
.ax-root .ax-hero-mini small{font-size:11.5px;color:var(--mute)}
.ax-root .ax-hero-mini .ax-mini-ico{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;
  background:var(--green-l);color:var(--green)}

/* hero search */
.ax-root .ax-search{grid-column:1/-1;margin-top:8px;max-width:100%;border-radius:20px;
  background:rgba(255,255,255,.98);box-shadow:0 34px 80px rgba(0,0,0,.45)}
.ax-root .ax-search-body{padding:14px}
.ax-root .ax-search-body .ax-field label{font-size:11px;letter-spacing:.06em;text-transform:uppercase}
.ax-root .ax-search-body .ax-btn{height:48px;display:inline-flex;align-items:center;justify-content:center;gap:8px}
.ax-root .ax-search-body .ax-field input,.ax-root .ax-search-body .ax-field select{background:#fff}

/* marquee trust bar */
.ax-root .ax-trust{overflow:hidden}
.ax-root .ax-marquee{display:flex;width:max-content;animation:axMarquee 34s linear infinite}
.ax-root .ax-marquee:hover{animation-play-state:paused}
.ax-root .ax-marquee-track{display:flex;gap:46px;padding:10px 23px}
.ax-root .ax-marquee-track span{display:inline-flex;align-items:center;gap:9px;font-size:12.5px;white-space:nowrap}

/* service cards */
.ax-root .ax-svc{position:relative;overflow:hidden;isolation:isolate}
.ax-root .ax-svc::before{content:"";position:absolute;inset:0;z-index:-1;
  background:radial-gradient(320px 170px at var(--mx,50%) var(--my,0%),rgba(11,93,59,.12),transparent 70%);
  opacity:0;transition:opacity .35s}
.ax-root .ax-svc:hover::before{opacity:1}
.ax-root .ax-svc-ico{transition:transform .4s cubic-bezier(.34,1.56,.64,1),background .3s,color .3s}
.ax-root .ax-svc:hover .ax-svc-ico{transform:translateY(-4px) rotate(-6deg) scale(1.06);background:var(--green);color:#fff}
.ax-root .ax-svc-arrow{margin-top:auto;display:inline-flex;align-items:center;gap:8px;color:var(--green);
  font-size:13.5px;font-weight:700}
.ax-root .ax-svc-arrow svg{transition:transform .3s}
.ax-root .ax-svc:hover .ax-svc-arrow svg{transform:translateX(5px)}

/* listing cards */
.ax-root .ax-card{transition:box-shadow .3s,transform .3s,border-color .3s}
.ax-root .ax-card:hover{border-color:rgba(11,93,59,.35);transform:translateY(-6px);box-shadow:0 22px 48px rgba(16,22,20,.14)}
.ax-root .ax-card-img::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;
  background:linear-gradient(to top,rgba(8,16,29,.32),transparent 46%);opacity:0;transition:opacity .3s}
.ax-root .ax-card:hover .ax-card-img::after{opacity:1}
.ax-root .ax-card-foot{transition:color .25s}
.ax-root .ax-card:hover .ax-card-foot{color:var(--green)}

/* steps */
.ax-root .ax-steps{border-radius:20px;background:linear-gradient(180deg,#fff 0%,#F8FAFC 100%)}
.ax-root .ax-step{position:relative;overflow:hidden;transition:background .3s}
.ax-root .ax-step:hover{background:#fff}
.ax-root .ax-step::after{content:attr(data-step);position:absolute;right:14px;bottom:-16px;
  font:800 92px/1 'Bricolage Grotesque',sans-serif;color:rgba(11,93,59,.07);pointer-events:none}
.ax-root .ax-step-n{background:linear-gradient(135deg,var(--green),#12865A);box-shadow:0 8px 20px rgba(11,93,59,.25)}

/* analytics */
.ax-root .ax-panel{transition:box-shadow .35s,transform .35s}
.ax-root .ax-panel:hover{box-shadow:0 18px 40px rgba(15,23,42,.09)}
.ax-root .ax-kpi{transition:transform .3s,background .3s}
.ax-root .ax-kpi:hover{transform:translateY(-3px);background:#EFF5F1}
.ax-root .ax-bar i{transform-origin:left;animation:axBarGrow 1.1s cubic-bezier(.22,.61,.36,1) both}
.ax-root .ax-donut circle{transition:stroke-width .25s}
.ax-root .ax-legend div{transition:background .2s,transform .2s}
.ax-root .ax-legend div:hover{transform:translateX(3px)}

/* app visual */
.ax-root .ax-app-visual{position:relative;display:grid;place-items:center;min-height:520px}
.ax-root .ax-app-visual::before{content:"";position:absolute;width:360px;height:360px;border-radius:50%;
  background:radial-gradient(circle,rgba(11,93,59,.16),transparent 68%);animation:axGlow 8s ease-in-out infinite}
.ax-root .ax-phone{position:relative;z-index:1;animation:axFloat 8s ease-in-out infinite}
.ax-root .ax-phone-chip{position:absolute;z-index:2;display:flex;align-items:center;gap:10px;padding:11px 15px;
  border-radius:14px;background:#fff;border:1px solid var(--line);box-shadow:0 16px 36px rgba(16,22,20,.16);
  font-size:12.5px;font-weight:700;animation:axFloat 6.5s ease-in-out infinite}
.ax-root .ax-phone-chip.top{top:44px;right:2%;animation-delay:-2s}
.ax-root .ax-phone-chip.bottom{bottom:58px;left:0;animation-delay:-4s}
.ax-root .ax-phone-chip i{width:8px;height:8px;border-radius:50%;background:var(--green);display:inline-block}

/* reviews */
.ax-root .ax-rev{position:relative;overflow:hidden;transition:transform .3s,box-shadow .3s,border-color .3s}
.ax-root .ax-rev:hover{transform:translateY(-4px);box-shadow:0 18px 40px rgba(15,23,42,.09);border-color:rgba(11,93,59,.3)}
.ax-root .ax-rev::before{content:"“";position:absolute;top:2px;right:16px;
  font:800 68px/1 'Bricolage Grotesque',sans-serif;color:rgba(11,93,59,.09);pointer-events:none}

/* cta glow */
.ax-root .ax-cta::before{content:"";position:absolute;top:-280px;left:50%;width:560px;height:560px;
  transform:translateX(-50%);border-radius:50%;pointer-events:none;
  background:radial-gradient(circle,rgba(52,211,153,.22),transparent 66%);animation:axGlow 7s ease-in-out infinite}
.ax-root .ax-cta h2,.ax-root .ax-cta p,.ax-root .ax-cta-btns,.ax-root .ax-cta small{position:relative;z-index:1}

/* keyframes */
@keyframes axRise{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
@keyframes axFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes axPulse{0%,100%{box-shadow:0 0 0 0 rgba(52,211,153,.35)}50%{box-shadow:0 0 0 6px rgba(52,211,153,0)}}
@keyframes axGrad{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes axGlow{0%,100%{opacity:.55;transform:translateX(-50%) scale(1)}50%{opacity:.9;transform:translateX(-50%) scale(1.08)}}
@keyframes axMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes axBarGrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}

@media (max-width:1000px){
  .ax-root .ax-hero-inner{grid-template-columns:1fr;gap:34px;padding:66px 24px 48px}
  .ax-root .ax-hero-side{display:none}
  .ax-root .ax-app-visual{min-height:440px}
}
@media (max-width:720px){
  .ax-root .ax-app-visual{display:none}
  .ax-root .ax-phone-chip{display:none}
  .ax-root .ax-step::after{font-size:70px}
}
`;

/* ════════ DATA ════════ */
const TABS = [
  { id: "properties", label: "Rentals", path: "/listings", hint: "Search rentals" },
  { id: "accommodation", label: "Accommodation", path: "/accommodation", hint: "Find hotels, lodges and stays" },
  { id: "businesses", label: "AxxBiashara", path: "/axxbiashara", hint: "Find business services" },
  { id: "materials", label: "QuickSales", path: "/quicksales", hint: "Find items for sale" },
];

const TRUST_ITEMS = [
  "Verified listings",
  "0% broker fees",
  "All 47 counties",
  "Direct WhatsApp contact",
  "Owner-to-client, no middlemen",
];

const SERVICES = [
  {
    id: "properties", title: "Rentals", desc: "Verified houses and apartments, listed by landlords with no broker fees.",
    icon: <path d="M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6" />
  },
  {
    id: "accommodation", title: "Accommodation", desc: "Hotels, lodges and short stays with direct contact to the host.",
    icon: <path d="M3 18V8M3 14h18v4M21 14v-2a3 3 0 00-3-3h-7v5M7 11h.01" />
  },
  {
    id: "businesses", title: "AxxBiashara", desc: "Find trusted local businesses and professionals near you.",
    icon: <path d="M4 7h16v12H4zM9 7V5h6v2M4 12h16" />
  },
  {
    id: "materials", title: "QuickSales", desc: "Buy and sell materials, furniture and equipment from people nearby.",
    icon: <path d="M6 6h15l-2 9H8L6 6zm0 0L5 3H2M9 20h.01M17 20h.01" />
  },
];

const STEPS = [
  { t: "Search", d: "Browse verified rentals, stays, businesses and items across all 47 counties." },
  { t: "Contact the owner", d: "Reach landlords, hosts and sellers directly on WhatsApp or by phone." },
  { t: "Close the deal", d: "Agree terms yourself. Ratings and reviews help you decide with confidence." },
];

const APP_POINTS = [
  "Alerts when new listings match your search",
  "WhatsApp and phone contact in one tap",
  "Saved properties available offline",
  "Maps and directions for every listing",
];

const FALLBACK_REVIEWS = [
  { _id: "f1", userName: "Sarah Wanjiku", category: "rentals", rating: 5, comment: "Found my apartment in two days. WhatsApp made it easy to reach the landlord, and there were no agent fees." },
  { _id: "f2", userName: "Grace Omondi", category: "quicksales", rating: 5, comment: "I found roofing materials about 20% below market price for my construction project." },
  { _id: "f3", userName: "James Kariuki", category: "accommodation", rating: 5, comment: "Booked a lodge for a family trip. Simple process and a fair rate." },
  { _id: "f4", userName: "Faith Kamau", category: "business", rating: 5, comment: "I found a reliable legal service for my business registration. Professional and affordable." },
];

const DONUT_COLORS = ["#0B5D3B", "#F2A33A", "#2F7FB8", "#B3261E", "#7A5AA6"];
const DONUT_R = 40;
const DONUT_CIRC = 2 * Math.PI * DONUT_R;

/* ════════ HELPERS ════════ */
const money = (n) => (n != null ? `KES ${Number(n).toLocaleString()}` : null);
const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

const getImage = (item, tab) => {
  if (!item) return "";
  if (tab === "businesses") return item.images?.[0] || item.logo || "";
  if (item.images?.length) {
    const f = item.images[0];
    return typeof f === "object" ? f.imageUrl || f.url || "" : f;
  }
  return item.coverImage || item.imageUrl || "";
};

const normalise = (item, tab) => {
  const title = item.title || item.name || item.businessName || "Featured listing";
  let loc = "Kenya";
  if (item.location && typeof item.location === "object")
    loc = [item.location.town, item.location.county].filter(Boolean).join(", ") || "Kenya";
  else if (item.county) loc = [item.location || item.town || item.address, item.county].filter(Boolean).join(", ");
  else if (item.location) loc = item.location;

  let price = item.priceRange || "Contact for pricing";
  if (item.price != null)
    price = money(item.price) + (tab === "properties" ? " / month" : tab === "accommodation" ? " / night" : "");
  else if (item.basePrice != null) price = `${money(item.basePrice)} / night`;

  const detail = {
    properties: `/listings/${item._id}`,
    accommodation: `/accommodation/${item._id}`,
    businesses: `/axxbiashara?business=${item._id}`,
    materials: `/quicksales/${item._id}`,
  }[tab];

  const rawImages = Array.isArray(item.images) ? item.images : [];
  let images = rawImages
    .map((img) => (typeof img === "object" ? img?.imageUrl || img?.url : img))
    .filter(Boolean);
  if (!images.length) {
    const single = getImage(item, tab);
    if (single) images = [single];
  }

  return {
    id: item._id, title, loc, price, detail,
    cat: item.propertyType || item.type || item.category || item.categories?.[0] || "Verified",
    img: getImage(item, tab),
    images,
    video: !!item.videos?.length,
  };
};

function HomeCardMedia({ item, activeLabel }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const images = Array.isArray(item.images) && item.images.length > 0 
    ? item.images 
    : (item.img ? [item.img] : []);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % images.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [images.length]);

  if (!images.length) {
    return <div className="ph">{activeLabel}</div>;
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      {images.map((imgUrl, idx) => {
        // Only the visible slide and the queued one are mounted — see the note
        // in Listings.jsx PropertyCardMedia.
        const isQueued = idx === (activeIdx + 1) % images.length;
        if (idx !== activeIdx && !isQueued) return null;
        return (
          <img
            key={idx}
            src={optimizeImage(imgUrl, IMG_WIDTH.card)}
            srcSet={imageSrcSet(imgUrl)}
            sizes="(max-width: 640px) 90vw, (max-width: 1100px) 45vw, 340px"
            alt={item.title}
            loading={activeIdx === 0 && idx === 0 ? "eager" : "lazy"}
            decoding="async"
            width="480"
            height="360"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: idx === activeIdx ? 1 : 0,
              transition: "opacity 0.6s ease-in-out",
            }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        );
      })}

      {images.length > 1 && (
        <>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
              }
            }}
            style={{
              position: "absolute",
              left: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "rgba(15, 23, 42, 0.75)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 4,
              fontSize: "14px",
              lineHeight: 1,
              userSelect: "none",
            }}
            aria-label="Previous photo"
          >
            ‹
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setActiveIdx((prev) => (prev + 1) % images.length);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                setActiveIdx((prev) => (prev + 1) % images.length);
              }
            }}
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "rgba(15, 23, 42, 0.75)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 4,
              fontSize: "14px",
              lineHeight: 1,
              userSelect: "none",
            }}
            aria-label="Next photo"
          >
            ›
          </span>
          <div
            style={{
              position: "absolute",
              bottom: "8px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "4px",
              zIndex: 4,
            }}
          >
            {images.map((_, idx) => (
              <span
                key={idx}
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIdx(idx);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    setActiveIdx(idx);
                  }
                }}
                style={{
                  width: idx === activeIdx ? "14px" : "5px",
                  height: "5px",
                  borderRadius: "10px",
                  background: idx === activeIdx ? "#22c55e" : "rgba(255,255,255,0.7)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const Icon = ({ children, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

/* Counts up once the number is on screen (respects reduced motion) */
function Counter({ value = 0 }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const el = ref.current;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (!el || reduced || value < 2) {
      const id = requestAnimationFrame(() => setShown(value || 0));
      return () => cancelAnimationFrame(id);
    }

    let frame = 0;
    let started = false;
    const duration = 1100;
    const start = performance.now();

    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          started = true;
          frame = requestAnimationFrame(step);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return <span ref={ref}>{Number(shown).toLocaleString()}</span>;
}

/* Reveals [data-reveal] nodes as they scroll into view */
function useScrollReveal(version) {
  useEffect(() => {
    const root = document.querySelector(".ax-root");
    if (!root) return;

    const nodes = Array.from(root.querySelectorAll("[data-reveal]"));
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduced || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    nodes.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, [version]);
}

/* ═══════════════════════ COMPONENT ═══════════════════════ */
export default function HomePro() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [featured, setFeatured] = useState({ properties: [], accommodation: [], businesses: [], materials: [] });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("properties");
  const [demographics, setDemographics] = useState(null);
  const [demoTab, setDemoTab] = useState("services");
  const [hovered, setHovered] = useState(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  // The hero clip is decorative ambience. Mounting it after first paint keeps it
  // off the critical path, and phones / metered connections skip it entirely.
  const [showHeroVideo, setShowHeroVideo] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [ads, setAds] = useState([]);
  const [adIdx, setAdIdx] = useState(0);

  /* ── HERO SEARCH ── */
  const [query, setQuery] = useState("");
  const [heroIdx, setHeroIdx] = useState(0);

  /* ── HERO VIDEO: start it only after the page is interactive ── */
  useEffect(() => {
    const conn = navigator.connection;
    const metered =
      conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ""));
    const smallScreen = window.matchMedia("(max-width: 768px)").matches;

    if (metered || smallScreen) return undefined;

    let cancelled = false;
    let timerId;
    let idleId;

    const enable = () => {
      if (!cancelled) setShowHeroVideo(true);
    };

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(enable, { timeout: 2500 });
    } else {
      timerId = window.setTimeout(enable, 1500);
    }

    return () => {
      cancelled = true;
      if (idleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timerId) window.clearTimeout(timerId);
    };
  }, []);

  /* ── DATA FETCHING (same endpoints as before) ── */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/analytics/demographics");
        setDemographics(res.data?.data || null);
      } catch (err) {
        console.error("Failed to load demographics:", err?.message || err);
      }
    };
    load();
    const t = setInterval(load, 300000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      const timeout = 5000;
      const [p, b, m, a, r] = await Promise.all([
        API.get("/properties?featured=true&limit=4", { timeout }).catch(() => ({ data: [] })),
        API.get("/business?featured=true&limit=4&sort=rating", { timeout }).catch(() => ({ data: { businesses: [] } })),
        API.get("/materials?featured=true&limit=4", { timeout }).catch(() => ({ data: [] })),
        API.get("/accommodations?featured=true&limit=4", { timeout }).catch(() => ({ data: [] })),
        API.get("/reviews", { timeout }).catch(() => ({ data: [] })),
      ]);
      if (!alive) return;
      const arr = (v) => (Array.isArray(v) ? v : []);
      setFeatured({
        properties: arr(p?.data),
        businesses: arr(b?.data?.businesses),
        materials: arr(m?.data),
        accommodation: arr(a?.data),
      });
      setReviews(arr(r?.data).slice(0, 4));
      setLoading(false);
    };
    run().catch((e) => {
      console.error("Failed to load featured items:", e?.message || e);
      if (alive) setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  /* ── ADS ── */
  useEffect(() => {
    API.get("/ads?placement=home", { timeout: 5000 })
      .then((res) => {
        const d = res?.data;
        setAds(Array.isArray(d) ? d : Array.isArray(d?.ads) ? d.ads : []);
      })
      .catch(() => setAds([]));
  }, []);

  useEffect(() => {
    if (ads.length < 2 || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setAdIdx((i) => i + 1), 7000);
    return () => clearInterval(t);
  }, [ads.length]);

  const openAd = (ad) => {
    if (ad?._id) API.post(`/ads/${ad._id}/click`).catch(() => { });
    const link = ad?.link || "";
    if (/^https?:\/\//i.test(link)) window.open(link, "_blank", "noopener,noreferrer");
    else if (link) navigate(link);
  };



  const handleListProperty = () => {
    if (!token) { setShowBoostModal(true); return; }
    navigate("/upload");
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const q = query.trim();
    if (q) params.set("search", q);
    navigate(`/listings${params.toString() ? `?${params}` : ""}`);
  };

  /* Rotate the hero preview card through live listings */
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setHeroIdx((i) => i + 1), 5200);
    return () => clearInterval(t);
  }, []);

  /* ── DERIVED ── */
  const items = useMemo(
    () => (featured[activeTab] || []).slice(0, 8).map((i) => normalise(i, activeTab)),
    [featured, activeTab]
  );
  const activeMeta = TABS.find((t) => t.id === activeTab);
  const bannerAds = ads.filter((a) => a.placement !== "feed");
  const feedAds = ads.filter((a) => a.placement === "feed");
  const banner = bannerAds.length ? bannerAds[adIdx % bannerAds.length] : null;
  const feedAd = feedAds.length ? feedAds[adIdx % feedAds.length] : null;
  const cells = feedAd && items.length >= 3
    ? [...items.slice(0, 3), { isAd: true, ad: feedAd, id: `ad-${feedAd._id}` }, ...items.slice(3)]
    : items;
  const shownReviews = reviews.length ? reviews : FALLBACK_REVIEWS;

  const heroPreview = useMemo(() => {
    const useRentals = featured.properties.length > 0;
    const pool = useRentals ? featured.properties : featured.accommodation;
    if (!pool.length) return null;
    const item = normalise(pool[heroIdx % pool.length], useRentals ? "properties" : "accommodation");
    return { ...item, tag: useRentals ? "Rental" : "Stay" };
  }, [featured, heroIdx]);

  useScrollReveal(`${loading}-${Boolean(demographics)}-${ads.length}-${shownReviews.length}`);

  const services = useMemo(() => demographics?.services || [], [demographics]);
  const serviceTotal = services.reduce((s, x) => s + x.count, 0);
  const counties = demographics?.counties || [];
  const maxCounty = Math.max(...counties.map((c) => c.count), 1);
  const label = (s) => (s === "tourism" ? "Accommodation" : cap(s));

  /* Donut slices: each arc starts where the previous ones ended */
  const donutSlices = useMemo(() => {
    const lengths = services.map((s) =>
      serviceTotal > 0 ? (s.count / serviceTotal) * DONUT_CIRC : 0
    );
    return services.map((s, i) => ({
      service: s.service,
      len: lengths[i],
      offset: -lengths.slice(0, i).reduce((a, b) => a + b, 0),
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    }));
  }, [services, serviceTotal]);

  /* ════════════════════════════════════ RENDER ════════════════════════════════════ */
  return (
    <div className="ax-root">
      <style>{css}</style>

      {/* ── TRUST BAR ── */}
      <div className="ax-trust">
        <div className="ax-marquee">
          {[0, 1].map((copy) => (
            <div key={copy} className="ax-marquee-track" aria-hidden={copy === 1 ? "true" : undefined}>
              {TRUST_ITEMS.map((t) => (
                <span key={t}><i />{t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── HERO ── */}
      <header className="ax-hero">
        {/* Ambient atmospheric glows & grid mesh */}
        <div className="ambient-orb orb-crimson" />
        <div className="ambient-orb orb-amber" />
        <div className="ambient-orb orb-navy" />
        <div className="hero-grid-pattern" />

        {showHeroVideo && (
          <video autoPlay muted loop playsInline preload="none"
            onLoadedData={() => setVideoLoaded(true)}
            onError={() => setVideoLoaded(false)}
            style={{ opacity: videoLoaded ? 0.35 : 0 }}>
            <source src={bgVideo} type="video/mp4" />
          </video>
        )}

        <div className="ax-hero-inner">
          <div className="ax-hero-copy">
            <span className="ax-hero-badge"><i /> Verified owners across all 47 counties</span>
            <h1>
              Rent, stay, shop and <span className="ax-grad">do business</span> — straight from the owner
            </h1>
            <p className="ax-hero-sub">
              Verified rentals, accommodation, business services and quick sales in one place.
              Talk to owners and hosts yourself and pay no broker fees.
            </p>
          </div>

          <div className="ax-hero-side">
            <div className="ax-hero-card">
              <div className="ax-hero-card-top"><i /> Live listing</div>
              <div className="ax-hero-thumb">
                {heroPreview?.img && (
                  <img
                    src={optimizeImage(heroPreview.img, IMG_WIDTH.thumb)}
                    alt=""
                    loading="eager"
                    decoding="async"
                    width="160"
                    height="120"
                  />
                )}
                <span className="ax-thumb-tag">{heroPreview?.tag || "Verified"}</span>
              </div>
              <div className="ax-hero-card-body">
                <strong>{heroPreview?.title || "Verified homes and stays"}</strong>
                <span>{heroPreview?.loc || "Across all 47 counties"}</span>
                <span className="ax-price">{heroPreview?.price || "Direct owner prices"}</span>
              </div>
            </div>

            <div className="ax-hero-mini">
              <span className="ax-mini-ico">
                <Icon size={19}><path d="M20 6L9 17l-5-5" /></Icon>
              </span>
              <span>
                <b>Direct contact</b>
                <small>No brokers, no hidden fees</small>
              </span>
            </div>
          </div>

          <form className="ax-search" onSubmit={handleHeroSearch}>
            <div className="ax-search-body single">
              <div className="ax-field">
                <label htmlFor="hero-query">What are you looking for?</label>
                <input id="hero-query" type="search" value={query}
                  placeholder="Search rentals, stays, items for sale…"
                  onChange={(e) => setQuery(e.target.value)} />
              </div>

              <button className="ax-btn ax-shine" type="submit">
                Search
                <Icon size={17}><path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3" /></Icon>
              </button>
            </div>
          </form>
        </div>
      </header>

      {/* ── FEATURED ── */}
      <section className="ax-section alt">
        <div className="ax-wrap">
          <div className="ax-sec-head" data-reveal>
            <div>
              <span className="ax-eyebrow">Fresh this week</span>
              <h2>Featured listings</h2>
            </div>
            <p>Hand-picked, verified listings from across the platform.</p>
          </div>

          <div className="ax-tabs" role="tablist" aria-label="Featured category" data-reveal style={{ "--d": "80ms" }}>
            {TABS.map((t) => (
              <button key={t.id} role="tab" className="ax-tab" aria-selected={activeTab === t.id}
                onClick={() => setActiveTab(t.id)}>
                {t.label}<em>{featured[t.id].length}</em>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="ax-grid">{[0, 1, 2, 3].map((i) => <div key={i} className="ax-skel" />)}</div>
          ) : items.length === 0 ? (
            <div className="ax-empty">
              <h4>No featured {activeMeta.label.toLowerCase()} yet</h4>
              <p>Check back soon, or browse the full directory.</p>
              <button className="ax-btn" onClick={() => navigate(activeMeta.path)}>Browse all {activeMeta.label}</button>
            </div>
          ) : (
            <div className="ax-grid" data-reveal style={{ "--d": "150ms" }}>
              {cells.map((it, idx) => it.isAd ? (
                <button key={it.id} className="ax-card" onClick={() => openAd(it.ad)}>
                  <div className="ax-card-img">
                    {it.ad.imageUrl ? <img src={optimizeImage(it.ad.imageUrl, IMG_WIDTH.card)} alt="" loading="lazy" decoding="async" /> : <div className="ph">Sponsored</div>}
                    <span className="ax-chip ad">Ad</span>
                  </div>
                  <div className="ax-card-body">
                    <span className="ax-card-cat">{it.ad.sponsor || "Sponsored"}</span>
                    <h3>{it.ad.title}</h3>
                    {it.ad.description && <span className="ax-card-loc">{it.ad.description}</span>}
                    <div className="ax-card-foot">{it.ad.cta || "Learn more"}</div>
                  </div>
                </button>
              ) : (
                <button key={it.id || idx} className="ax-card" onClick={() => navigate(it.detail)}>
                  <div className="ax-card-img">
                    <HomeCardMedia item={it} activeLabel={activeMeta.label} />
                    <span className="ax-chip">Featured</span>
                    {it.video && <span className="ax-chip v">Video tour</span>}
                  </div>
                  <div className="ax-card-body">
                    <span className="ax-card-cat">{it.cat}</span>
                    <h3>{it.title}</h3>
                    <span className="ax-card-loc">{it.loc}</span>
                    <div className="ax-card-foot">{it.price}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="ax-center">
            <button className="ax-btn ghost" onClick={() => navigate(`${activeMeta.path}?featured=true`)}>
              View all featured {activeMeta.label}
            </button>
          </div>
        </div>
      </section>

      {/* ── ADVERTISING ── */}
      {banner && (
        <section className="ax-adband" aria-label="Sponsored">
          <div className="ax-wrap">
            <button className={`ax-ad ${banner.imageUrl ? "" : "noimg"}`} onClick={() => openAd(banner)}>
              {banner.imageUrl && <img src={optimizeImage(banner.imageUrl, IMG_WIDTH.panel)} alt="" loading="lazy" decoding="async" />}
              <div className="ax-ad-text">
                <span className="ax-ad-tag">Sponsored{banner.sponsor ? ` by ${banner.sponsor}` : ""}</span>
                <h3>{banner.title}</h3>
                {banner.description && <p>{banner.description}</p>}
                <span className="ax-ad-cta">{banner.cta || "Learn more"}</span>
              </div>
            </button>
            {bannerAds.length > 1 && (
              <div className="ax-dots">
                {bannerAds.map((a, i) => (
                  <button key={a._id || i} aria-label={`Show ad ${i + 1}`}
                    aria-current={i === adIdx % bannerAds.length} onClick={() => setAdIdx(i)} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── SERVICES ── */}
      <section className="ax-section">
        <div className="ax-wrap">
          <div className="ax-sec-head" data-reveal>
            <div>
              <span className="ax-eyebrow">Four ways to use Axxspace</span>
              <h2>One platform for the way Kenyans live and trade</h2>
            </div>
            <p>Choose a service to start browsing. Each one connects you straight to the person behind the listing.</p>
          </div>
          <div className="ax-services" data-reveal style={{ "--d": "120ms" }}>
            {SERVICES.map((s) => (
              <button key={s.id} className="ax-svc"
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
                }}
                onClick={() => navigate(TABS.find((t) => t.id === s.id).path)}>
                <span className="ax-svc-ico"><Icon>{s.icon}</Icon></span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <span className="ax-svc-arrow">
                  Browse {s.title}
                  <Icon size={16}><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="ax-section">
        <div className="ax-wrap">
          <div className="ax-sec-head" data-reveal>
            <div>
              <span className="ax-eyebrow">Simple by design</span>
              <h2>How Axxspace works</h2>
            </div>
            <p>Three steps from search to done, with no middleman taking a cut.</p>
          </div>
          <div className="ax-steps" data-reveal style={{ "--d": "120ms" }}>
            {STEPS.map((s, i) => (
              <div key={s.t} className="ax-step" data-step={String(i + 1).padStart(2, "0")}>
                <div className="ax-step-n">{i + 1}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ANALYTICS ── */}
      {demographics && (
        <section className="ax-section alt">
          <div className="ax-wrap">
            <div className="ax-sec-head" data-reveal>
              <div>
                <span className="ax-eyebrow">Live data</span>
                <h2>Live platform activity</h2>
              </div>
              <p>See which services and counties are most active. Figures refresh every 5 minutes.</p>
            </div>

            <div className="ax-an" data-reveal style={{ "--d": "120ms" }}>
              <div className="ax-panel">
                <div className="ax-seg" role="tablist">
                  <button role="tab" aria-selected={demoTab === "services"} onClick={() => setDemoTab("services")}>Services</button>
                  <button role="tab" aria-selected={demoTab === "counties"} onClick={() => setDemoTab("counties")}>Top counties</button>
                </div>

                {demoTab === "services" ? (
                  <div className="ax-donut">
                    <svg width="200" height="200" viewBox="0 0 100 100" role="img" aria-label="Service popularity chart">
                      <circle cx="50" cy="50" r={DONUT_R} fill="none" stroke="#ECEFEC" strokeWidth="12" />
                      {donutSlices.map((s) => (
                        <circle key={s.service} cx="50" cy="50" r={DONUT_R} fill="none"
                          stroke={s.color}
                          strokeWidth={hovered === s.service ? 15 : 12}
                          strokeDasharray={`${s.len} ${DONUT_CIRC - s.len}`} strokeDashoffset={s.offset}
                          transform="rotate(-90 50 50)" style={{ transition: "stroke-width .2s" }}
                          onMouseEnter={() => setHovered(s.service)} onMouseLeave={() => setHovered(null)} />
                      ))}
                      <text x="50" y="48" textAnchor="middle" fontSize="5" fill="#617069">
                        {hovered ? label(hovered) : "Total"}
                      </text>
                      <text x="50" y="59" textAnchor="middle" fontSize="12" fontWeight="700" fill="#101614">
                        {hovered ? services.find((s) => s.service === hovered)?.count ?? 0 : serviceTotal}
                      </text>
                    </svg>
                  </div>
                ) : counties.length ? (
                  <div>
                    {counties.slice(0, 8).map((c, i) => (
                      <div key={c.county} className="ax-bar-row">
                        <header><span>{i + 1}. {c.county}</span><span>{c.count} listings</span></header>
                        <div className="ax-bar"><i style={{ width: `${(c.count / maxCounty) * 100}%` }} /></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "var(--mute)" }}>No county data available yet.</p>
                )}
              </div>

              <div className="ax-panel">
                <h3>Platform overview</h3>
                <div className="ax-kpis">
                  <div className="ax-kpi"><strong><Counter value={demographics.totalListings || 0} /></strong><span>Total listings</span></div>
                  <div className="ax-kpi"><strong><Counter value={demographics.totalUsers || 0} /></strong><span>Total users</span></div>
                </div>
                <div className="ax-bar-row">
                  <header><span>County coverage</span><span>{counties.length} of 47</span></header>
                  <div className="ax-bar"><i style={{ width: `${(counties.length / 47) * 100}%` }} /></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── MOBILE APP ── */}
      <section className="ax-section">
        <div className="ax-wrap ax-app">
          <div data-reveal>
            <span className="ax-eyebrow">Mobile app</span>
            <h2>Take Axxspace with you</h2>
            <p>Browse rentals, stays, services and quick sales on your phone, and contact owners without leaving the app.</p>
            <ul className="ax-list">
              {APP_POINTS.map((p) => (
                <li key={p}>
                  <Icon size={18}><path d="M5 12l5 5 9-10" /></Icon>{p}
                </li>
              ))}
            </ul>
            <div className="ax-app-cta">
              <button className="ax-btn" onClick={() => navigate("/mobile-app")}>Download the Android app</button>
              <span><strong>Version 1.0.0</strong><small>APK, 3.1 MB</small></span>
            </div>
          </div>
          <div className="ax-app-visual" data-reveal style={{ "--d": "140ms" }} aria-hidden="true">
            <span className="ax-phone-chip top"><i />New match found</span>
            <div className="ax-phone">
              <b>Axxspace</b>
              <div className="ax-ph-card"><div className="ax-ph-img" /><div className="ax-ph-l" style={{ width: "70%" }} /><div className="ax-ph-l" style={{ width: "40%" }} /></div>
              <div className="ax-ph-card"><div className="ax-ph-l" style={{ width: "55%" }} /><div className="ax-ph-l" style={{ width: "30%" }} /></div>
            </div>
            <span className="ax-phone-chip bottom"><i />Chat on WhatsApp</span>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="ax-section alt">
        <div className="ax-wrap">
          <div className="ax-sec-head" data-reveal>
            <div>
              <span className="ax-eyebrow">Real people, real deals</span>
              <h2>What our users say</h2>
            </div>
            <button className="ax-btn ghost" onClick={() => navigate("/leave-review")}>Leave a review</button>
          </div>
          <div className="ax-reviews" data-reveal style={{ "--d": "120ms" }}>
            {shownReviews.map((r) => (
              <article key={r._id} className="ax-rev">
                <div className="ax-stars" aria-label={`${r.rating} out of 5`}>{"★".repeat(r.rating || 5)}</div>
                <p>“{r.comment}”</p>
                <div className="ax-who">
                  <div className="ax-av">{r.userName?.charAt(0).toUpperCase() || "U"}</div>
                  <div>
                    <strong>{r.userName || "Axxspace user"}</strong>
                    <span>{r.category && r.category !== "general" ? cap(r.category) : "General"}
                      {r.createdAt ? ` · ${new Date(r.createdAt).toLocaleDateString()}` : ""}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="ax-section" style={{ paddingBottom: 0 }}>
        <div className="ax-wrap">
          <div className="ax-cta" data-reveal>
            <h2>Find your place in Kenya</h2>
            <p>Join thousands of Kenyans finding homes, building projects and growing businesses through Axxspace.</p>
            <div className="ax-cta-btns">
              <button className="ax-btn amber" onClick={() => navigate("/listings")}>Browse rentals</button>
              <button className="ax-btn ghost" onClick={() => navigate("/accommodation")}>Explore accommodation</button>
              <button className="ax-btn ghost" onClick={() => navigate("/quicksales")}>Shop QuickSales</button>
              <button className="ax-btn ghost" onClick={() => setIsRequestModalOpen(true)}>Request an item</button>
            </div>
            <div style={{ marginTop: 28 }}>
              <button className="ax-btn ghost" onClick={handleListProperty}>
                {token ? "List your property or service" : "Log in to list your business"}
              </button>
              {!token && <small>Free to join. No credit card required.</small>}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="ax-footer">
        <div className="ax-wrap">
          <div className="ax-foot-grid">
            <div>
              <div className="ax-foot-brand">Axx<span>space</span></div>
              <p style={{ fontSize: 14, maxWidth: 280, marginBottom: 18 }}>
                Kenya's property and services platform. Direct, verified and broker-free.
              </p>
              <SocialMediaLinks iconSize={20} />
            </div>
            <div className="ax-foot-col">
              <h4>Services</h4>
              <button onClick={() => navigate("/listings")}>Rentals</button>
              <button onClick={() => navigate("/accommodation")}>Accommodation</button>
              <button onClick={() => navigate("/axxbiashara")}>AxxBiashara</button>
              <button onClick={() => navigate("/quicksales")}>QuickSales</button>
            </div>
            <div className="ax-foot-col">
              <h4>Company</h4>
              <span style={{ display: "block", fontSize: 14, marginBottom: 10 }}>About us</span>
              <span style={{ display: "block", fontSize: 14, marginBottom: 10 }}>How it works</span>
              <span style={{ display: "block", fontSize: 14, marginBottom: 10 }}>Contact us</span>
              <button onClick={() => navigate("/advertise")}>Advertise</button>
            </div>
            <div className="ax-foot-col">
              <h4>Legal</h4>
              <span style={{ display: "block", fontSize: 14, marginBottom: 10 }}>Terms of service</span>
              <span style={{ display: "block", fontSize: 14, marginBottom: 10 }}>Privacy policy</span>
              <span style={{ display: "block", fontSize: 14, marginBottom: 10 }}>FAQ</span>
              <span style={{ display: "block", fontSize: 14, marginBottom: 10 }}>Safety tips</span>
            </div>
            <div className="ax-foot-col">
              <h4>Contact</h4>
              <a href="mailto:info@axxspace.com">info@axxspace.com</a>
              <a href="mailto:support@axxspace.com">support@axxspace.com</a>
              <a href="mailto:admin@axxspace.com">admin@axxspace.com</a>
            </div>
          </div>
          <p className="ax-copy">© 2026 Axxspace. All rights reserved.</p>
        </div>
      </footer>

      {/* ── LIST / BOOST MODAL ── */}
      {showBoostModal && (
        <div className="ax-modal-bg" onClick={() => setShowBoostModal(false)}>
          <div className="ax-modal" role="dialog" aria-modal="true" aria-labelledby="ax-modal-title"
            onClick={(e) => e.stopPropagation()}>
            <button className="ax-modal-x" aria-label="Close" onClick={() => setShowBoostModal(false)}>✕</button>
            <h2 id="ax-modal-title">Choose a service</h2>
            <p>Select what you want to list or boost on Axxspace.</p>
            {[
              { title: "Landlord / Rentals", desc: "List rental properties and boost your listings", route: "/login" },
              { title: "QuickSales", desc: "Sell items in QuickSales", route: "/quicksales-login" },
              { title: "Accommodation provider", desc: "List hotels, lodges and stays", route: "/accommodation/login" },
              { title: "Business / AxxBiashara", desc: "List professional business services", route: "/business-login" },
            ].map((s) => (
              <button key={s.title} className="ax-modal-opt"
                onClick={() => { setShowBoostModal(false); navigate(s.route); }}>
                <div><strong>{s.title}</strong><span>{s.desc}</span></div>
              </button>
            ))}
          </div>
        </div>
      )}

      <RequestItemModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} />
    </div>
  );
}