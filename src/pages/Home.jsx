import { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import bgVideo from "../assets/AXX Homepage video.mp4";
import SocialMediaLinks from "../components/SocialMediaLinks";
import RequestItemModal from "../components/RequestItemModal";

/* ════════════════════════════════════════════════
   HOMEPRO — all styles are scoped under .ax-root
   so this file can live beside the old Home.jsx
════════════════════════════════════════════════ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;600;700;800&family=Instrument+Sans:wght@400;500;600;700&display=swap');

.ax-root{
  --ink:#101614; --ink-2:#2B3532; --mute:#617069; --line:#E3E7E3;
  --paper:#FAFAF7; --card:#FFFFFF; --green:#0B5D3B; --green-d:#073F29;
  --green-l:#E4F1EA; --red:#B3261E; --amber:#F2A33A;
  font-family:'Instrument Sans',system-ui,sans-serif; color:var(--ink);
  background:var(--paper); min-height:100vh; overflow-x:hidden; line-height:1.5;
}
.ax-root *{box-sizing:border-box;margin:0;padding:0}
.ax-root h1,.ax-root h2,.ax-root h3,.ax-root h4{font-family:'Bricolage Grotesque',sans-serif;letter-spacing:-0.02em;line-height:1.1}
.ax-root button{font-family:inherit;cursor:pointer}
.ax-root :focus-visible{outline:3px solid var(--amber);outline-offset:2px}
.ax-wrap{max-width:1200px;margin:0 auto;padding:0 24px}
.ax-section{padding:88px 0}
.ax-section.alt{background:var(--card);border-block:1px solid var(--line)}
.ax-sec-head{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap;margin-bottom:36px}
.ax-sec-head h2{font-size:clamp(28px,3.6vw,42px);font-weight:700;max-width:620px}
.ax-sec-head p{color:var(--mute);max-width:460px;font-size:16px}

/* trust bar */
.ax-trust{background:var(--green-d);color:#CFE6DA;font-size:13px}
.ax-trust .ax-wrap{display:flex;gap:28px;justify-content:center;flex-wrap:wrap;padding-block:9px}
.ax-trust span{display:inline-flex;align-items:center;gap:8px}
.ax-trust i{width:6px;height:6px;border-radius:50%;background:var(--amber);display:inline-block}

/* hero */
.ax-hero{position:relative;color:#fff;background:#07130D;isolation:isolate}
.ax-hero video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2;transition:opacity .8s}
.ax-hero::after{content:"";position:absolute;inset:0;z-index:-1;
  background:linear-gradient(100deg,rgba(7,19,13,.92) 0%,rgba(7,19,13,.72) 55%,rgba(7,19,13,.45) 100%)}
.ax-hero-inner{padding:96px 24px 72px;max-width:1200px;margin:0 auto}
.ax-hero h1{font-size:clamp(38px,6.2vw,72px);font-weight:800;max-width:860px}
.ax-hero-sub{margin-top:20px;font-size:clamp(16px,1.7vw,19px);max-width:560px;color:#D5E3DB}

/* search panel */
.ax-search{margin-top:44px;background:var(--card);color:var(--ink);border-radius:18px;
  box-shadow:0 30px 70px rgba(0,0,0,.35);max-width:900px;overflow:hidden}
.ax-search-tabs{display:flex;border-bottom:1px solid var(--line);overflow-x:auto}
.ax-search-tabs button{flex:1;min-width:max-content;padding:15px 20px;background:none;border:0;
  font-size:14px;font-weight:600;color:var(--mute);border-bottom:3px solid transparent;transition:color .2s,border-color .2s}
.ax-search-tabs button:hover{color:var(--ink)}
.ax-search-tabs button[aria-selected="true"]{color:var(--green);border-color:var(--green)}
.ax-search-body{display:grid;grid-template-columns:1fr 1fr auto;gap:12px;padding:18px;align-items:end}
.ax-search-body.single{grid-template-columns:1fr auto}
.ax-field{display:flex;flex-direction:column;gap:6px}
.ax-field label{font-size:12px;font-weight:600;color:var(--mute)}
.ax-field select,.ax-field input{height:48px;border:1px solid var(--line);border-radius:10px;padding:0 14px;
  font:500 15px 'Instrument Sans',sans-serif;color:var(--ink);background:var(--paper);width:100%}
.ax-field select:focus,.ax-field input:focus{border-color:var(--green);outline:none;box-shadow:0 0 0 3px var(--green-l)}
.ax-btn{height:48px;padding:0 28px;border-radius:10px;border:0;font-weight:700;font-size:15px;
  background:var(--green);color:#fff;transition:background .2s,transform .15s;white-space:nowrap}
.ax-btn:hover{background:var(--green-d);transform:translateY(-1px)}
.ax-btn.ghost{background:transparent;color:var(--green);border:1px solid var(--green)}
.ax-btn.ghost:hover{background:var(--green-l);transform:none}
.ax-btn.amber{background:var(--amber);color:#2A1A00}
.ax-btn.amber:hover{background:#E39425}

/* hero stats */
.ax-stats{display:flex;gap:44px;flex-wrap:wrap;margin-top:40px}
.ax-stat strong{display:block;font:700 30px 'Bricolage Grotesque',sans-serif}
.ax-stat span{font-size:13px;color:#B9CFC3}

/* services */
.ax-services{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.ax-svc{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:26px;text-align:left;
  display:flex;flex-direction:column;gap:12px;min-height:210px;transition:border-color .2s,box-shadow .2s,transform .2s}
.ax-svc:hover{border-color:var(--green);box-shadow:0 14px 34px rgba(11,93,59,.12);transform:translateY(-3px)}
.ax-svc-ico{width:44px;height:44px;border-radius:12px;background:var(--green-l);color:var(--green);display:grid;place-items:center}
.ax-svc h3{font-size:20px;font-weight:700}
.ax-svc p{color:var(--mute);font-size:14.5px;flex:1}
.ax-svc b{color:var(--green);font-size:14px}

/* featured */
.ax-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:28px}
.ax-tab{padding:9px 18px;border-radius:999px;border:1px solid var(--line);background:var(--card);
  font-size:14px;font-weight:600;color:var(--ink-2);display:inline-flex;gap:8px;align-items:center;transition:all .2s}
.ax-tab:hover{border-color:var(--green)}
.ax-tab[aria-selected="true"]{background:var(--green);border-color:var(--green);color:#fff}
.ax-tab em{font-style:normal;font-size:12px;padding:1px 8px;border-radius:999px;background:rgba(0,0,0,.08)}
.ax-tab[aria-selected="true"] em{background:rgba(255,255,255,.22)}
.ax-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(262px,1fr));gap:22px}
.ax-card{background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden;cursor:pointer;
  display:flex;flex-direction:column;text-align:left;transition:box-shadow .25s,transform .25s}
.ax-card:hover{box-shadow:0 16px 40px rgba(16,22,20,.12);transform:translateY(-4px)}
.ax-card-img{position:relative;aspect-ratio:4/3;background:linear-gradient(135deg,#DCE9E2,#EEF3EF);overflow:hidden}
.ax-card-img img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
.ax-card:hover .ax-card-img img{transform:scale(1.05)}
.ax-card-img .ph{height:100%;display:grid;place-items:center;color:var(--green);font-weight:600;font-size:14px}
.ax-chip{position:absolute;top:12px;left:12px;background:var(--amber);color:#2A1A00;font-size:12px;font-weight:700;
  padding:4px 10px;border-radius:999px}
.ax-chip.v{left:auto;right:12px;background:rgba(16,22,20,.8);color:#fff}
.ax-card-body{padding:18px;display:flex;flex-direction:column;gap:6px;flex:1}
.ax-card-cat{font-size:13px;color:var(--green);font-weight:600}
.ax-card h3{font-size:18px;font-weight:600;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ax-card-loc{font-size:14px;color:var(--mute)}
.ax-card-foot{margin-top:auto;padding-top:12px;border-top:1px solid var(--line);font:700 18px 'Bricolage Grotesque',sans-serif}
.ax-empty{text-align:center;padding:64px 20px;border:1px dashed var(--line);border-radius:16px;background:var(--card)}
.ax-empty h4{font-size:20px;margin-bottom:8px}
.ax-empty p{color:var(--mute);margin-bottom:20px}
.ax-skel{height:340px;border-radius:16px;background:linear-gradient(90deg,#ECEFEC 25%,#F5F7F5 50%,#ECEFEC 75%);
  background-size:300% 100%;animation:axsk 1.4s infinite}
@keyframes axsk{to{background-position:-300% 0}}
.ax-center{text-align:center;margin-top:36px}

/* steps */
.ax-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:1px solid var(--line);border-radius:16px;overflow:hidden;background:var(--card)}
.ax-step{padding:34px 30px;border-right:1px solid var(--line)}
.ax-step:last-child{border-right:0}
.ax-step-n{width:36px;height:36px;border-radius:50%;background:var(--green);color:#fff;display:grid;place-items:center;font-weight:700;margin-bottom:18px}
.ax-step h3{font-size:20px;margin-bottom:8px}
.ax-step p{color:var(--mute);font-size:15px}

/* analytics */
.ax-an{display:grid;grid-template-columns:1.4fr 1fr;gap:24px}
.ax-panel{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:26px}
.ax-panel h3{font-size:19px;margin-bottom:18px}
.ax-seg{display:inline-flex;background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:3px;margin-bottom:20px}
.ax-seg button{border:0;background:none;padding:7px 16px;border-radius:8px;font-size:14px;font-weight:600;color:var(--mute)}
.ax-seg button[aria-selected="true"]{background:var(--green);color:#fff}
.ax-donut{display:flex;gap:28px;align-items:center;flex-wrap:wrap}
.ax-legend{flex:1;min-width:200px;display:flex;flex-direction:column;gap:8px}
.ax-legend div{display:flex;justify-content:space-between;gap:12px;font-size:14.5px;padding:6px 8px;border-radius:8px;cursor:default}
.ax-legend div:hover,.ax-legend div.on{background:var(--paper)}
.ax-legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:10px}
.ax-bar-row{margin-bottom:14px}
.ax-bar-row header{display:flex;justify-content:space-between;font-size:14.5px;margin-bottom:6px}
.ax-bar-row header span:last-child{color:var(--mute)}
.ax-bar{height:8px;border-radius:4px;background:var(--line);overflow:hidden}
.ax-bar i{display:block;height:100%;background:var(--green);border-radius:4px}
.ax-kpis{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:22px}
.ax-kpi{background:var(--paper);border-radius:12px;padding:18px}
.ax-kpi strong{display:block;font:700 32px 'Bricolage Grotesque',sans-serif;color:var(--green)}
.ax-kpi span{font-size:13px;color:var(--mute)}

/* app */
.ax-app{display:grid;grid-template-columns:1.1fr .9fr;gap:56px;align-items:center}
.ax-app h2{font-size:clamp(28px,3.6vw,42px);margin-bottom:16px}
.ax-app>div>p{color:var(--mute);font-size:16px;max-width:520px;margin-bottom:24px}
.ax-list{list-style:none;display:grid;gap:12px;margin-bottom:30px}
.ax-list li{display:flex;gap:12px;font-size:15px;align-items:flex-start}
.ax-list svg{flex-shrink:0;color:var(--green);margin-top:3px}
.ax-app-cta{display:flex;gap:18px;align-items:center;flex-wrap:wrap}
.ax-app-cta small{display:block;color:var(--mute);font-size:13px}
.ax-phone{width:250px;height:500px;margin:0 auto;border:10px solid var(--ink);border-radius:36px;background:var(--paper);
  padding:30px 14px 14px;position:relative;box-shadow:0 30px 60px rgba(16,22,20,.2)}
.ax-phone::before{content:"";position:absolute;top:0;left:50%;transform:translateX(-50%);width:90px;height:20px;background:var(--ink);border-radius:0 0 14px 14px}
.ax-phone b{font:800 17px 'Bricolage Grotesque',sans-serif;color:var(--green);display:block;margin-bottom:12px}
.ax-ph-card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px;margin-bottom:12px}
.ax-ph-img{height:96px;border-radius:8px;background:var(--green-l);margin-bottom:8px}
.ax-ph-l{height:10px;border-radius:3px;background:var(--line);margin-bottom:6px}

/* reviews */
.ax-reviews{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:20px}
.ax-rev{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:24px;display:flex;flex-direction:column;gap:14px}
.ax-stars{color:var(--amber);letter-spacing:2px}
.ax-rev p{font-size:15px;color:var(--ink-2);flex:1}
.ax-who{display:flex;gap:12px;align-items:center}
.ax-av{width:40px;height:40px;border-radius:50%;background:var(--green);color:#fff;display:grid;place-items:center;font-weight:700}
.ax-who strong{display:block;font-size:14.5px}
.ax-who span{font-size:13px;color:var(--mute)}

/* cta */
.ax-cta{background:var(--green-d);color:#fff;border-radius:24px;padding:64px 32px;text-align:center}
.ax-cta h2{font-size:clamp(30px,4.4vw,52px);margin-bottom:14px}
.ax-cta p{color:#BFD8CB;max-width:520px;margin:0 auto 30px}
.ax-cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.ax-cta .ax-btn.ghost{color:#fff;border-color:rgba(255,255,255,.4)}
.ax-cta .ax-btn.ghost:hover{background:rgba(255,255,255,.1)}
.ax-cta small{display:block;margin-top:18px;color:#8FB6A2;font-size:13px}

/* footer */
.ax-footer{background:var(--ink);color:#9BA8A2;padding:60px 0 28px;margin-top:88px}
.ax-foot-grid{display:grid;grid-template-columns:1.5fr repeat(4,1fr);gap:36px;margin-bottom:40px}
.ax-foot-brand{font:800 26px 'Bricolage Grotesque',sans-serif;color:#fff;margin-bottom:10px}
.ax-foot-brand span{color:var(--amber)}
.ax-foot-col h4{color:#fff;font-size:15px;margin-bottom:14px}
.ax-foot-col a,.ax-foot-col button{display:block;background:none;border:0;color:inherit;font-size:14px;margin-bottom:10px;
  text-align:left;text-decoration:none;cursor:pointer}
.ax-foot-col a:hover,.ax-foot-col button:hover{color:#fff}
.ax-copy{border-top:1px solid #26302C;padding-top:22px;font-size:13px;text-align:center}

/* modal */
.ax-modal-bg{position:fixed;inset:0;background:rgba(7,19,13,.7);display:grid;place-items:center;z-index:9999;padding:20px;backdrop-filter:blur(4px)}
.ax-modal{background:var(--card);border-radius:20px;max-width:520px;width:100%;max-height:90vh;overflow:auto;padding:32px;position:relative;color:var(--ink)}
.ax-modal h2{font-size:26px;margin-bottom:6px}
.ax-modal>p{color:var(--mute);margin-bottom:22px;font-size:15px}
.ax-modal-x{position:absolute;top:14px;right:14px;width:36px;height:36px;border-radius:50%;border:1px solid var(--line);background:var(--card);font-size:16px}
.ax-modal-opt{display:flex;gap:14px;align-items:center;width:100%;padding:14px;border:1px solid var(--line);border-radius:12px;
  background:var(--card);margin-bottom:10px;text-align:left;transition:border-color .2s,background .2s}
.ax-modal-opt:hover{border-color:var(--green);background:var(--green-l)}
.ax-modal-opt strong{display:block;font-size:16px}
.ax-modal-opt span{font-size:13.5px;color:var(--mute)}

/* advertising */
.ax-adband{padding:8px 0 56px}
.ax-ad{display:grid;grid-template-columns:minmax(0,340px) 1fr;width:100%;background:var(--card);border:1px solid var(--line);
  border-radius:16px;overflow:hidden;text-align:left;margin-bottom:16px;transition:box-shadow .2s}
.ax-ad:hover{box-shadow:0 14px 34px rgba(16,22,20,.1)}
.ax-ad.noimg{grid-template-columns:1fr}
.ax-ad img{width:100%;height:100%;min-height:170px;object-fit:cover;display:block}
.ax-ad-text{padding:28px;display:flex;flex-direction:column;gap:8px;justify-content:center}
.ax-ad-tag{font-size:12px;font-weight:600;color:var(--mute)}
.ax-ad-text h3{font-size:26px}
.ax-ad-text p{color:var(--mute);max-width:560px}
.ax-ad-cta{color:var(--green);font-weight:700;font-size:14px;margin-top:4px}
.ax-dots{display:flex;gap:8px;justify-content:center;margin-bottom:16px}
.ax-dots button{width:9px;height:9px;border-radius:50%;border:0;background:var(--line);padding:0}
.ax-dots button[aria-current="true"]{background:var(--green)}
.ax-advertise{display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;
  background:var(--green-l);border-radius:16px;padding:22px 26px}
.ax-advertise h3{font-size:20px;margin-bottom:4px}
.ax-advertise p{color:var(--ink-2);font-size:15px}
.ax-chip.ad{background:rgba(16,22,20,.8);color:#fff}
@media (max-width:1000px){
  .ax-services{grid-template-columns:repeat(2,1fr)}
  .ax-an,.ax-app{grid-template-columns:1fr}
  .ax-foot-grid{grid-template-columns:1fr 1fr}
}
@media (max-width:720px){
  .ax-ad{grid-template-columns:1fr}
  .ax-section{padding:60px 0}
  .ax-hero-inner{padding:64px 20px 52px}
  .ax-search-body,.ax-search-body.single{grid-template-columns:1fr}
  .ax-steps{grid-template-columns:1fr}
  .ax-step{border-right:0;border-bottom:1px solid var(--line)}
  .ax-step:last-child{border-bottom:0}
  .ax-services{grid-template-columns:1fr}
  .ax-stats{gap:28px}
  .ax-trust .ax-wrap{gap:14px;font-size:12px}
}
@media (prefers-reduced-motion:reduce){
  .ax-root *{animation:none!important;transition:none!important}
}
`;

/* ════════ DATA ════════ */
const COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta", "Garissa", "Wajir", "Mandera", "Marsabit",
  "Isiolo", "Meru", "Tharaka Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga",
  "Murang'a", "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans Nzoia", "Uasin Gishu", "Elgeyo Marakwet",
  "Nandi", "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga",
  "Bungoma", "Busia", "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi City",
];

const TYPES = [
  "Bedsitter", "Studio Apartment", "1 Bedroom", "2 Bedroom", "3 Bedroom",
  "4+ Bedroom", "Maisonette", "Bungalow", "Townhouse", "Apartment Block",
];

const TABS = [
  { id: "properties", label: "Rentals", path: "/listings", hint: "Search by county and house type" },
  { id: "accommodation", label: "Accommodation", path: "/accommodation", hint: "Find hotels, lodges and stays" },
  { id: "businesses", label: "AxxBiashara", path: "/axxbiashara", hint: "Find business services" },
  { id: "materials", label: "QuickSales", path: "/quicksales", hint: "Find items for sale" },
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

  return {
    id: item._id, title, loc, price, detail,
    cat: item.propertyType || item.type || item.category || item.categories?.[0] || "Verified",
    img: getImage(item, tab),
    video: !!item.videos?.length,
  };
};

const Icon = ({ children, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

/* ═══════════════════════ COMPONENT ═══════════════════════ */
export default function HomePro() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [search, setSearch] = useState({ tab: "properties", county: "", type: "", q: "" });
  const [featured, setFeatured] = useState({ properties: [], accommodation: [], businesses: [], materials: [] });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("properties");
  const [demographics, setDemographics] = useState(null);
  const [demoTab, setDemoTab] = useState("services");
  const [hovered, setHovered] = useState(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [ads, setAds] = useState([]);
  const [adIdx, setAdIdx] = useState(0);

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

  /* ── ACTIONS ── */
  const activeSearchTab = TABS.find((t) => t.id === search.tab);
  const isRentals = search.tab === "properties";

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (isRentals) {
      if (search.county) params.append("county", search.county);
      if (search.type) params.append("type", search.type);
    } else {
      if (search.county && search.tab === "accommodation") params.append("county", search.county);
      if (search.q.trim()) params.append("search", search.q.trim());
    }
    const qs = params.toString();
    navigate(`${activeSearchTab.path}${qs ? `?${qs}` : ""}`);
  };

  const handleListProperty = () => {
    if (!token) { setShowBoostModal(true); return; }
    navigate("/upload");
  };

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

  const services = demographics?.services || [];
  const serviceTotal = services.reduce((s, x) => s + x.count, 0);
  const counties = demographics?.counties || [];
  const maxCounty = Math.max(...counties.map((c) => c.count), 1);
  const label = (s) => (s === "tourism" ? "Accommodation" : cap(s));

  const R = 40, CIRC = 2 * Math.PI * R;
  let acc = 0;

  /* ════════════════════════════════════ RENDER ════════════════════════════════════ */
  return (
    <div className="ax-root">
      <style>{css}</style>

      {/* ── TRUST BAR ── */}
      <div className="ax-trust">
        <div className="ax-wrap">
          <span><i />Verified listings</span>
          <span><i />0% broker fees</span>
          <span><i />All 47 counties</span>
          <span><i />Direct WhatsApp contact</span>
        </div>
      </div>

      {/* ── HERO ── */}
      <header className="ax-hero">
        <video autoPlay muted loop playsInline
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setVideoLoaded(false)}
          style={{ opacity: videoLoaded ? 1 : 0 }}>
          <source src={bgVideo} type="video/mp4" />
        </video>

        <div className="ax-hero-inner">
          <h1>Rent, stay, shop and do business across Kenya, directly from the owner</h1>
          <p className="ax-hero-sub">
            Verified rentals, accommodation, business services and quick sales in one place. Talk to owners and hosts yourself and pay no broker fees.
          </p>

          <div className="ax-search">
            <div className="ax-search-tabs" role="tablist" aria-label="Search category">
              {TABS.map((t) => (
                <button key={t.id} role="tab" aria-selected={search.tab === t.id}
                  onClick={() => setSearch((s) => ({ ...s, tab: t.id }))}>
                  {t.label}
                </button>
              ))}
            </div>

            <form className={`ax-search-body ${isRentals ? "" : "single"}`} onSubmit={handleSearch}>
              {isRentals ? (
                <>
                  <div className="ax-field">
                    <label htmlFor="ax-county">County</label>
                    <select id="ax-county" value={search.county}
                      onChange={(e) => setSearch((s) => ({ ...s, county: e.target.value }))}>
                      <option value="">All counties</option>
                      {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="ax-field">
                    <label htmlFor="ax-type">House type</label>
                    <select id="ax-type" value={search.type}
                      onChange={(e) => setSearch((s) => ({ ...s, type: e.target.value }))}>
                      <option value="">Any type</option>
                      {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </>
              ) : (
                <div className="ax-field">
                  <label htmlFor="ax-q">{activeSearchTab.hint}</label>
                  <input id="ax-q" type="text" value={search.q} placeholder={`Search ${activeSearchTab.label}`}
                    onChange={(e) => setSearch((s) => ({ ...s, q: e.target.value }))} />
                </div>
              )}
              <button type="submit" className="ax-btn">Search {activeSearchTab.label}</button>
            </form>
          </div>

          {demographics && (
            <div className="ax-stats">
              <div className="ax-stat"><strong>{demographics.totalListings || 0}</strong><span>Listings</span></div>
              <div className="ax-stat"><strong>{demographics.totalUsers || 0}</strong><span>Users</span></div>
              <div className="ax-stat"><strong>{counties.length} / 47</strong><span>Counties reached</span></div>
            </div>
          )}
        </div>
      </header>

      {/* ── FEATURED ── */}
      <section className="ax-section alt">
        <div className="ax-wrap">
          <div className="ax-sec-head">
            <h2>Featured listings</h2>
            <p>Hand-picked, verified listings from across the platform.</p>
          </div>

          <div className="ax-tabs" role="tablist" aria-label="Featured category">
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
            <div className="ax-grid">
              {cells.map((it, idx) => it.isAd ? (
                <button key={it.id} className="ax-card" onClick={() => openAd(it.ad)}>
                  <div className="ax-card-img">
                    {it.ad.imageUrl ? <img src={it.ad.imageUrl} alt="" loading="lazy" /> : <div className="ph">Sponsored</div>}
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
                    {it.img ? (
                      <img src={it.img} alt={it.title} loading="lazy"
                        onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    ) : (
                      <div className="ph">{activeMeta.label}</div>
                    )}
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
      <section className="ax-adband" aria-label="Sponsored">
        <div className="ax-wrap">
          {banner && (
            <>
              <button className={`ax-ad ${banner.imageUrl ? "" : "noimg"}`} onClick={() => openAd(banner)}>
                {banner.imageUrl && <img src={banner.imageUrl} alt="" loading="lazy" />}
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
            </>
          )}
          <div className="ax-advertise">
            <div>
              <h3>Advertise on Axxspace</h3>
              <p>Put your rental, stay, business or product in front of users across all 47 counties.</p>
            </div>
            <button className="ax-btn" onClick={() => navigate("/advertise")}>Start advertising</button>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="ax-section">
        <div className="ax-wrap">
          <div className="ax-sec-head">
            <h2>One platform for the way Kenyans live and trade</h2>
            <p>Choose a service to start browsing. Each one connects you straight to the person behind the listing.</p>
          </div>
          <div className="ax-services">
            {SERVICES.map((s) => (
              <button key={s.id} className="ax-svc"
                onClick={() => navigate(TABS.find((t) => t.id === s.id).path)}>
                <span className="ax-svc-ico"><Icon>{s.icon}</Icon></span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <b>Browse {s.title}</b>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="ax-section">
        <div className="ax-wrap">
          <div className="ax-sec-head">
            <h2>How Axxspace works</h2>
            <p>Three steps from search to done, with no middleman taking a cut.</p>
          </div>
          <div className="ax-steps">
            {STEPS.map((s, i) => (
              <div key={s.t} className="ax-step">
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
            <div className="ax-sec-head">
              <h2>Live platform activity</h2>
              <p>See which services and counties are most active. Figures refresh every 5 minutes.</p>
            </div>

            <div className="ax-an">
              <div className="ax-panel">
                <div className="ax-seg" role="tablist">
                  <button role="tab" aria-selected={demoTab === "services"} onClick={() => setDemoTab("services")}>Services</button>
                  <button role="tab" aria-selected={demoTab === "counties"} onClick={() => setDemoTab("counties")}>Top counties</button>
                </div>

                {demoTab === "services" ? (
                  <div className="ax-donut">
                    <svg width="200" height="200" viewBox="0 0 100 100" role="img" aria-label="Service popularity chart">
                      <circle cx="50" cy="50" r={R} fill="none" stroke="#ECEFEC" strokeWidth="12" />
                      {services.map((s, i) => {
                        const len = serviceTotal > 0 ? (s.count / serviceTotal) * CIRC : 0;
                        const offset = -acc;
                        acc += len;
                        return (
                          <circle key={s.service} cx="50" cy="50" r={R} fill="none"
                            stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
                            strokeWidth={hovered === s.service ? 15 : 12}
                            strokeDasharray={`${len} ${CIRC - len}`} strokeDashoffset={offset}
                            transform="rotate(-90 50 50)" style={{ transition: "stroke-width .2s" }}
                            onMouseEnter={() => setHovered(s.service)} onMouseLeave={() => setHovered(null)} />
                        );
                      })}
                      <text x="50" y="48" textAnchor="middle" fontSize="5" fill="#617069">
                        {hovered ? label(hovered) : "Total"}
                      </text>
                      <text x="50" y="59" textAnchor="middle" fontSize="12" fontWeight="700" fill="#101614">
                        {hovered ? services.find((s) => s.service === hovered)?.count ?? 0 : serviceTotal}
                      </text>
                    </svg>
                    <div className="ax-legend">
                      {services.map((s, i) => (
                        <div key={s.service} className={hovered === s.service ? "on" : ""}
                          onMouseEnter={() => setHovered(s.service)} onMouseLeave={() => setHovered(null)}>
                          <span><i style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />{label(s.service)}</span>
                          <strong>{s.count}</strong>
                        </div>
                      ))}
                    </div>
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
                  <div className="ax-kpi"><strong>{demographics.totalListings || 0}</strong><span>Total listings</span></div>
                  <div className="ax-kpi"><strong>{demographics.totalUsers || 0}</strong><span>Total users</span></div>
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
          <div>
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
          <div className="ax-phone" aria-hidden="true">
            <b>Axxspace</b>
            <div className="ax-ph-card"><div className="ax-ph-img" /><div className="ax-ph-l" style={{ width: "70%" }} /><div className="ax-ph-l" style={{ width: "40%" }} /></div>
            <div className="ax-ph-card"><div className="ax-ph-l" style={{ width: "55%" }} /><div className="ax-ph-l" style={{ width: "30%" }} /></div>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="ax-section alt">
        <div className="ax-wrap">
          <div className="ax-sec-head">
            <h2>What our users say</h2>
            <button className="ax-btn ghost" onClick={() => navigate("/leave-review")}>Leave a review</button>
          </div>
          <div className="ax-reviews">
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
          <div className="ax-cta">
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