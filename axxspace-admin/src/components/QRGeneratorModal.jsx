import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import logo from "../assets/image.png";

const SOURCES = [
  { value: "generic", label: "General / Digital Link" },
  { value: "gate", label: "Gate Poster" },
  { value: "building_outside", label: "Building Exterior" },
  { value: "noticeboard", label: "Noticeboard" },
  { value: "shop_nearby", label: "Local Shop/Kiosk" },
  { value: "office", label: "Landlord Office" },
  { value: "vacancy_sign", label: "Vacancy Signboard" }
];

const PROPERTY_TYPES_LIST = [
  "4+ Bedroom",
  "Maisonette",
  "Bungalow",
  "Townhouse",
  "Apartment Block",
  "Single Room",
  "Shared Room",
  "Hostel Room",
  "Commercial Office",
  "Shop / Retail Space",
  "Warehouse",
  "Plot / Land",
  "Furnished"
];

// SVG Icons
const GenuineIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const SecureIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 11 11 13 15 9" />
  </svg>
);

const ContactIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#C5A059" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#C5A059" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const PhoneScanIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#C5A059" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
    <path d="M9 6h6" />
    <path d="M9 10h6" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#d9383a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const MobileIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#d9383a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

const TrendIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#d9383a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#d9383a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#d9383a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 11 11 13 15 9" />
  </svg>
);

const RibbonHouseIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#C5A059" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const PencilIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#d9383a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" />
  </svg>
);

const PrintIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#d9383a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const QrIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#d9383a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const TenantsIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#d9383a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
    <path d="M12.525.02c1.31.02 2.61.35 3.75 1 .1-.8.4-1.56.9-2.2H12.85v14.1c0 2.26-1.89 4.1-4.22 4.1-2.33 0-4.22-1.84-4.22-4.1 0-2.26 1.89-4.1 4.22-4.1.47 0 .92.08 1.34.22V6.02c-5 .52-8.84 4.77-8.84 9.98 0 5.52 4.48 10 10 10s10-4.48 10-10V4.82c1.47.88 3.2 1.38 5.02 1.38v-3c-2.33 0-4.38-1.22-5.5-3.08a7.88 7.88 0 0 1-5.18-.1M10.125 15.02c-.93 0-1.68.75-1.68 1.68s.75 1.68 1.68 1.68 1.68-.75 1.68-1.68-.75-1.68-1.68-1.68" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ color: "#081A34" }}>
    <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.761.459 3.475 1.33 4.988l-1.417 5.176 5.297-1.39a9.939 9.939 0 0 0 4.778 1.214h.004c5.506 0 9.988-4.482 9.988-9.988.001-2.66-1.034-5.161-2.92-7.052A9.92 9.92 0 0 0 12.012 2zm5.727 13.916c-.244.686-1.22 1.262-1.682 1.344-.462.081-.926.156-3.033-.674-2.529-.993-4.148-3.565-4.274-3.732-.127-.168-.946-1.258-.946-2.398 0-1.14.597-1.705.809-1.928.212-.224.462-.28.618-.28h.442c.112 0 .262-.042.411.319.15.362.511 1.25.555 1.34.043.089.073.193.013.31-.06.117-.089.192-.178.297-.09.104-.188.232-.269.31-.089.088-.182.183-.078.36.104.178.461.76.99 1.23.681.605 1.254.793 1.43.882.176.088.277.074.379-.044.103-.118.441-.518.56-.695.118-.178.238-.148.397-.089.159.059 1.011.477 1.184.566.173.089.288.134.332.208.044.074.044.431-.2.116z" />
  </svg>
);

// Helper to draw rosette path
const getScallopPath = (cx, cy, r, numScallops, depth) => {
  let path = "";
  for (let i = 0; i <= 360; i++) {
    const angle = (i * Math.PI) / 180;
    const currentR = r + Math.sin(angle * numScallops) * depth;
    const x = cx + currentR * Math.cos(angle);
    const y = cy + currentR * Math.sin(angle);
    if (i === 0) {
      path += `M ${x} ${y}`;
    } else {
      path += ` L ${x} ${y}`;
    }
  }
  path += " Z";
  return path;
};

// Rosette Badge Component
const ScallopBadge = () => {
  const path = getScallopPath(55, 55, 43, 18, 4);
  return (
    <svg width="110" height="110" viewBox="0 0 110 110" style={{ overflow: "visible" }}>
      <path d={path} fill="#081A34" stroke="#d9383a" strokeWidth="2.5" />
      {/* House Icon */}
      <path
        d="M44 42 L44 58 L66 58 L66 42 Z"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M38 43 L55 28 L72 43"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Door */}
      <rect x="51" y="48" width="8" height="10" fill="#ffffff" />
      {/* Texts */}
      <text
        x="55"
        y="70"
        fill="#ffffff"
        fontSize="7.5"
        fontWeight="bold"
        textAnchor="middle"
        fontFamily="'Inter', sans-serif"
        letterSpacing="0.2px"
      >
        Listed On
      </text>
      <text
        x="55"
        y="81"
        fill="#ffffff"
        fontSize="9"
        fontWeight="900"
        textAnchor="middle"
        fontFamily="'Inter', sans-serif"
        letterSpacing="0.5px"
      >
        AXXSPACE
      </text>
    </svg>
  );
};

// High-fidelity VacancyPoster Component
function VacancyPoster({ property, qrCodeDataUrl, sourceLabel }) {
  return (
    <div style={posterStyles.posterContainer} className="axx-vacancy-poster">
      {/* Top slanted accent */}
      <div style={posterStyles.topAccentLeft} />

      {/* Brand logo & tagline */}
      <div style={posterStyles.logoSection}>
        <img src={logo} alt="Axxspace Logo" style={posterStyles.logoImg} />
        <div style={posterStyles.logoTextContainer}>
          <span style={{ color: "#d9383a" }}>AXX</span>
          <span style={{ color: "#081A34", marginLeft: "6px" }}>SPACE</span>
        </div>
        <div style={posterStyles.logoTagline}>Space hunting bila stress</div>
        <div style={posterStyles.redSeparator} />
      </div>

      {/* Main Title & Stamp */}
      <div style={posterStyles.titleSection}>
        <div style={posterStyles.titleTextContainer}>
          <div style={posterStyles.titleRow1}>ROOM/HOUSE</div>
          <div style={posterStyles.titleRow2}>AVAILABLE</div>
        </div>
        <div style={posterStyles.badgeContainer}>
          <ScallopBadge />
        </div>
      </div>

      {/* Scan instruction */}
      <div style={posterStyles.scanInstruction}>
        SCAN TO VIEW HOUSE DETAILS AND CONTACTS
      </div>

      {/* QR Code Container */}
      <div style={posterStyles.qrContainer}>
        <div style={posterStyles.qrBox}>
          {qrCodeDataUrl ? (
            <img src={qrCodeDataUrl} alt="Property QR Code" style={posterStyles.qrCodeImg} />
          ) : (
            <div style={posterStyles.qrPlaceholder}>Generating QR...</div>
          )}
        </div>
      </div>

      {/* Visit section */}
      <div style={posterStyles.visitSection}>
        <div style={posterStyles.orVisitText}>OR VISIT</div>
        <div style={posterStyles.visitPill}>
          <div style={posterStyles.globeCircle}>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#ffffff" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <span style={posterStyles.visitUrl}>www.axxspace.com</span>
        </div>
      </div>

      {/* Contact Footer */}
      <div style={posterStyles.contactFooter}>
        <div style={posterStyles.contactItem}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#081A34" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <span>info@axxspace.com</span>
        </div>

        <div style={posterStyles.contactItem}>
          <WhatsAppIcon />
          <span>+254 745 689 773</span>
        </div>

        <div style={posterStyles.contactItem}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#081A34" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#081A34" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
            </svg>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" style={{ color: "#081A34" }}>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>
          <span>axx.space</span>
        </div>
      </div>

      {/* Bottom slanted accents */}
      <div style={posterStyles.bottomAccentLeft} />
      <div style={posterStyles.bottomAccentRight} />
    </div>
  );
}

export default function QRGeneratorModal({ isOpen, onClose, property }) {
  const [source, setSource] = useState("generic");
  const [qrLoaded, setQrLoaded] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const qrCanvasRef = useRef(null);
  const downloadQrCanvasRef = useRef(null);
  const posterCanvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && property) {
      const timer = setTimeout(() => {
        generateQR();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, property, source]);

  if (!isOpen || !property) return null;

  const getSourceLabel = (val) => {
    const found = SOURCES.find(s => s.value === val);
    return found ? found.label : "General";
  };

  const getQrUrl = () => {
    // If running on admin subdomain/port, redirect main listings URL to main domain/port
    const mainOrigin = window.location.origin.includes("5174") 
      ? window.location.origin.replace("5174", "5173") 
      : window.location.origin;
    return `${mainOrigin}/listings/${property._id}?ref=qr&source=${source}`;
  };

  const generateQR = () => {
    const qrCanvas = qrCanvasRef.current;
    if (!qrCanvas) return;

    const url = getQrUrl();

    QRCode.toCanvas(qrCanvas, url, {
      width: 300,
      margin: 1.5,
      errorCorrectionLevel: "H",
      color: {
        dark: "#081A34",
        light: "#ffffff"
      }
    }, (error) => {
      if (error) {
        console.error("QR Code generation error:", error);
        return;
      }

      const ctx = qrCanvas.getContext("2d");
      const logoImg = new Image();
      logoImg.src = logo;
      logoImg.onload = () => {
        const cardSize = 56;
        const x = (qrCanvas.width - cardSize) / 2;
        const y = (qrCanvas.height - cardSize) / 2;

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        const radius = 6;
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + cardSize - radius, y);
        ctx.quadraticCurveTo(x + cardSize, y, x + cardSize, y + radius);
        ctx.lineTo(x + cardSize, y + cardSize - radius);
        ctx.quadraticCurveTo(x + cardSize, y + cardSize, x + cardSize - radius, y + cardSize);
        ctx.lineTo(x + radius, y + cardSize);
        ctx.quadraticCurveTo(x, y + cardSize, x, y + cardSize - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#d9383a";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        const logoSize = 38;
        const logoX = x + (cardSize - logoSize) / 2;
        const logoY = y + (cardSize - logoSize) / 2;
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

        const dataUrl = qrCanvas.toDataURL("image/png");
        setQrCodeDataUrl(dataUrl);

        setQrLoaded(true);
        drawDownloadableCanvases();
      };
    });
  };

  const drawDownloadableCanvases = () => {
    const qrCanvas = qrCanvasRef.current;
    const dlQrCanvas = downloadQrCanvasRef.current;
    const posterCanvas = posterCanvasRef.current;
    if (!qrCanvas || !dlQrCanvas || !posterCanvas) return;

    const qrCtx = dlQrCanvas.getContext("2d");
    const posterCtx = posterCanvas.getContext("2d");

    // ── Downloadable QR Code Canvas ──
    qrCtx.fillStyle = "#ffffff";
    qrCtx.fillRect(0, 0, dlQrCanvas.width, dlQrCanvas.height);
    qrCtx.drawImage(qrCanvas, 25, 20);
    qrCtx.font = "bold 26px 'Inter', system-ui, sans-serif";
    qrCtx.fillStyle = "#081A34";
    qrCtx.textAlign = "center";
    qrCtx.fillText("Axxspace", 175, 365);
    qrCtx.font = "600 13px 'Inter', system-ui, sans-serif";
    qrCtx.fillStyle = "#64748b";
    qrCtx.fillText("Scan to view property details", 175, 395);

    const logoImg = new Image();
    logoImg.src = logo;
    logoImg.onload = () => {
      // ── High-Res Poster Canvas (800x1130) ──
      posterCtx.fillStyle = "#ffffff";
      posterCtx.fillRect(0, 0, posterCanvas.width, posterCanvas.height);

      // Helper function to draw round rects
      const drawRoundRect = (ctx, x, y, width, height, radius, fill, stroke, strokeColor, strokeWidth) => {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        if (fill) {
          ctx.fill();
        }
        if (stroke) {
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = strokeWidth;
          ctx.stroke();
        }
      };

      // Helper function to draw scallop badge
      const drawScallopBadge = (ctx, cx, cy, r, numScallops, depth, fillColor, strokeColor, strokeWidth) => {
        ctx.beginPath();
        for (let i = 0; i <= 360; i++) {
          const angle = (i * Math.PI) / 180;
          const currentR = r + Math.sin(angle * numScallops) * depth;
          const x = cx + currentR * Math.cos(angle);
          const y = cy + currentR * Math.sin(angle);
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        if (fillColor) {
          ctx.fillStyle = fillColor;
          ctx.fill();
        }
        if (strokeColor) {
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = strokeWidth;
          ctx.stroke();
        }
      };

      // Draw background waves watermark (faint gray)
      posterCtx.strokeStyle = "#f1f5f9";
      posterCtx.lineWidth = 1.5;
      for (let yOffset = 0; yOffset < 1200; yOffset += 200) {
        posterCtx.beginPath();
        posterCtx.moveTo(-100, yOffset + 200);
        posterCtx.quadraticCurveTo(200, yOffset + 100, 400, yOffset + 300);
        posterCtx.quadraticCurveTo(600, yOffset + 500, 900, yOffset + 200);
        posterCtx.stroke();
      }

      // Draw top slanted accent spanning full width (35px left, 14px right)
      posterCtx.fillStyle = "#081A34";
      posterCtx.beginPath();
      posterCtx.moveTo(0, 0);
      posterCtx.lineTo(posterCanvas.width, 0);
      posterCtx.lineTo(posterCanvas.width, 14);
      posterCtx.lineTo(0, 35);
      posterCtx.closePath();
      posterCtx.fill();

      // Logo Section (Centered)
      const logoW = 100;
      const logoH = 100;
      const logoX = (posterCanvas.width - logoW) / 2;
      const logoY = 50;
      posterCtx.drawImage(logoImg, logoX, logoY, logoW, logoH);

      // Brand name
      posterCtx.font = "900 42px 'Inter', sans-serif";
      const brandY = 195;
      const text1 = "AXX ";
      const text2 = "SPACE";
      const w1 = posterCtx.measureText(text1).width;
      const w2 = posterCtx.measureText(text2).width;
      const startX = (posterCanvas.width - (w1 + w2)) / 2;

      posterCtx.textAlign = "left";
      posterCtx.fillStyle = "#d9383a";
      posterCtx.fillText(text1, startX, brandY);

      posterCtx.fillStyle = "#081A34";
      posterCtx.fillText(text2, startX + w1, brandY);

      // Tagline
      posterCtx.textAlign = "center";
      posterCtx.fillStyle = "#475569";
      posterCtx.font = "500 16px 'Inter', sans-serif";
      posterCtx.fillText("Space hunting bila stress", posterCanvas.width / 2, 222);

      // Red separator line
      posterCtx.fillStyle = "#d9383a";
      posterCtx.fillRect(40, 240, 720, 4);

      // Main title: "ROOM/HOUSE AVAILABLE"
      posterCtx.textAlign = "center";
      posterCtx.fillStyle = "#081A34";
      posterCtx.font = "900 60px 'Inter', sans-serif";
      posterCtx.fillText("ROOM/HOUSE", posterCanvas.width / 2, 330);

      posterCtx.fillStyle = "#d9383a";
      posterCtx.font = "900 85px 'Inter', sans-serif";
      posterCtx.fillText("AVAILABLE", posterCanvas.width / 2, 420);

      // Draw scalloped stamp badge (Listed On AXXSPACE)
      const badgeX = 650;
      const badgeY = 350;
      const badgeRadius = 45;

      drawScallopBadge(posterCtx, badgeX, badgeY, badgeRadius, 18, 4, "#081A34", "#d9383a", 3);

      // Draw house icon inside the badge
      posterCtx.strokeStyle = "#ffffff";
      posterCtx.lineWidth = 2.5;
      posterCtx.lineCap = "round";
      posterCtx.lineJoin = "round";

      // Roof
      posterCtx.beginPath();
      posterCtx.moveTo(badgeX - 17, badgeY - 12);
      posterCtx.lineTo(badgeX, badgeY - 27);
      posterCtx.lineTo(badgeX + 17, badgeY - 12);
      posterCtx.stroke();

      // House body
      posterCtx.beginPath();
      posterCtx.moveTo(badgeX - 11, badgeY - 12);
      posterCtx.lineTo(badgeX - 11, badgeY + 3);
      posterCtx.lineTo(badgeX + 11, badgeY + 3);
      posterCtx.lineTo(badgeX + 11, badgeY - 12);
      posterCtx.stroke();

      // Door
      posterCtx.fillStyle = "#ffffff";
      posterCtx.fillRect(badgeX - 4, badgeY - 7, 8, 10);

      // Text inside badge
      posterCtx.fillStyle = "#ffffff";
      posterCtx.textAlign = "center";

      posterCtx.font = "bold 8px 'Inter', sans-serif";
      posterCtx.fillText("Listed On", badgeX, badgeY + 15);

      posterCtx.font = "900 9.5px 'Inter', sans-serif";
      posterCtx.fillText("AXXSPACE", badgeX, badgeY + 26);

      // Scan Call to Action text
      posterCtx.fillStyle = "#081A34";
      posterCtx.textAlign = "center";
      posterCtx.font = "800 20px 'Inter', sans-serif";
      posterCtx.fillText("SCAN TO VIEW HOUSE DETAILS AND CONTACTS", posterCanvas.width / 2, 480);

      // QR Code Box with red border
      const qrBoxW = 296;
      const qrBoxH = 296;
      const qrBoxX = (posterCanvas.width - qrBoxW) / 2;
      const qrBoxY = 515;
      const qrBoxR = 10;

      // Fill white round rect
      posterCtx.fillStyle = "#ffffff";
      drawRoundRect(posterCtx, qrBoxX, qrBoxY, qrBoxW, qrBoxH, qrBoxR, true, true, "#d9383a", 4);

      // Draw QR Code inside
      posterCtx.drawImage(qrCanvas, qrBoxX + 16, qrBoxY + 16, 264, 264);

      // OR VISIT
      posterCtx.fillStyle = "#081A34";
      posterCtx.textAlign = "center";
      posterCtx.font = "800 16px 'Inter', sans-serif";
      posterCtx.fillText("OR VISIT", posterCanvas.width / 2, 850);

      // www.axxspace.com Pill
      const pillW = 280;
      const pillH = 44;
      const pillX = (posterCanvas.width - pillW) / 2;
      const pillY = 870;
      const pillR = 22;

      // Fill white round rect with navy border
      posterCtx.fillStyle = "#ffffff";
      drawRoundRect(posterCtx, pillX, pillY, pillW, pillH, pillR, true, true, "#081A34", 2);

      // Globe Icon inside pill
      const globeX = pillX + 22;
      const globeY = pillY + 22;

      posterCtx.fillStyle = "#081A34";
      posterCtx.beginPath();
      posterCtx.arc(globeX, globeY, 12, 0, Math.PI * 2);
      posterCtx.fill();

      posterCtx.strokeStyle = "#ffffff";
      posterCtx.lineWidth = 1.5;

      // Draw white globe lines inside the circle
      posterCtx.beginPath();
      posterCtx.arc(globeX, globeY, 10, 0, Math.PI * 2);
      posterCtx.stroke();

      posterCtx.beginPath();
      posterCtx.moveTo(globeX - 10, globeY);
      posterCtx.lineTo(globeX + 10, globeY);
      posterCtx.stroke();

      posterCtx.beginPath();
      posterCtx.moveTo(globeX, globeY - 10);
      posterCtx.lineTo(globeX, globeY + 10);
      posterCtx.stroke();

      // Globe vertical ellipse
      posterCtx.beginPath();
      posterCtx.ellipse ? posterCtx.ellipse(globeX, globeY, 5, 10, 0, 0, Math.PI * 2) : posterCtx.arc(globeX, globeY, 5, 0, Math.PI * 2);
      posterCtx.stroke();

      // Text inside pill
      posterCtx.fillStyle = "#081A34";
      posterCtx.textAlign = "left";
      posterCtx.font = "800 18px 'Inter', sans-serif";
      posterCtx.fillText("www.axxspace.com", pillX + 44, pillY + 28);

      // Contact Footer row
      const contactY = 960;
      posterCtx.textAlign = "left";
      posterCtx.font = "800 15px 'Inter', sans-serif";

      // Block 1: info@axxspace.com (Envelope icon)
      const b1X = 80;
      posterCtx.strokeStyle = "#081A34";
      posterCtx.lineWidth = 1.5;
      posterCtx.strokeRect(b1X, contactY - 12, 18, 12);
      posterCtx.beginPath();
      posterCtx.moveTo(b1X, contactY - 12);
      posterCtx.lineTo(b1X + 9, contactY - 6);
      posterCtx.lineTo(b1X + 18, contactY - 12);
      posterCtx.stroke();
      posterCtx.fillText("info@axxspace.com", b1X + 26, contactY - 1);

      // Block 2: +254 745 689 773 (WhatsApp icon)
      const b2X = 330;
      posterCtx.fillStyle = "#081A34";
      posterCtx.strokeStyle = "#081A34";
      posterCtx.lineWidth = 1.5;

      posterCtx.beginPath();
      posterCtx.arc(b2X + 8, contactY - 6, 6, 0.15 * Math.PI, 1.85 * Math.PI);
      posterCtx.lineTo(b2X + 1, contactY - 1);
      posterCtx.closePath();
      posterCtx.stroke();

      posterCtx.beginPath();
      posterCtx.arc(b2X + 8, contactY - 6, 3, 0.7 * Math.PI, 1.3 * Math.PI);
      posterCtx.stroke();
      posterCtx.fillText("+254 745 689 773", b2X + 26, contactY - 1);

      // Block 3: axx.space (Social icons: Instagram, TikTok, X)
      const b3X = 590;
      posterCtx.strokeStyle = "#081A34";
      posterCtx.lineWidth = 1.5;

      // Instagram icon
      drawRoundRect(posterCtx, b3X, contactY - 12, 12, 12, 3, false, true, "#081A34", 1.5);
      posterCtx.beginPath();
      posterCtx.arc(b3X + 6, contactY - 6, 2.5, 0, Math.PI * 2);
      posterCtx.stroke();
      posterCtx.beginPath();
      posterCtx.arc(b3X + 9, contactY - 9, 0.5, 0, Math.PI * 2);
      posterCtx.fillStyle = "#081A34";
      posterCtx.fill();

      // TikTok icon
      posterCtx.beginPath();
      posterCtx.moveTo(b3X + 22, contactY - 12);
      posterCtx.lineTo(b3X + 22, contactY - 4);
      posterCtx.quadraticCurveTo(b3X + 22, contactY - 1, b3X + 19, contactY - 1);
      posterCtx.quadraticCurveTo(b3X + 16, contactY - 1, b3X + 16, contactY - 4);
      posterCtx.quadraticCurveTo(b3X + 16, contactY - 7, b3X + 19, contactY - 7);
      posterCtx.lineTo(b3X + 19, contactY - 4);
      posterCtx.stroke();
      // TikTok flag
      posterCtx.beginPath();
      posterCtx.moveTo(b3X + 22, contactY - 9);
      posterCtx.quadraticCurveTo(b3X + 25, contactY - 9, b3X + 26, contactY - 12);
      posterCtx.stroke();

      // X icon
      posterCtx.lineWidth = 1.8;
      posterCtx.beginPath();
      posterCtx.moveTo(b3X + 32, contactY - 12);
      posterCtx.lineTo(b3X + 42, contactY);
      posterCtx.moveTo(b3X + 42, contactY - 12);
      posterCtx.lineTo(b3X + 32, contactY);
      posterCtx.stroke();

      posterCtx.fillStyle = "#081A34";
      posterCtx.fillText("axx.space", b3X + 48, contactY - 1);

      // Bottom accents: meeting at x=240, slanting up to 35px high on outer edges, no white gap
      // Red bottom-left triangle
      posterCtx.fillStyle = "#d9383a";
      posterCtx.beginPath();
      posterCtx.moveTo(0, posterCanvas.height - 35);
      posterCtx.lineTo(240, posterCanvas.height);
      posterCtx.lineTo(0, posterCanvas.height);
      posterCtx.closePath();
      posterCtx.fill();

      // Navy bottom-right triangle
      posterCtx.fillStyle = "#081A34";
      posterCtx.beginPath();
      posterCtx.moveTo(240, posterCanvas.height);
      posterCtx.lineTo(posterCanvas.width, posterCanvas.height - 35);
      posterCtx.lineTo(posterCanvas.width, posterCanvas.height);
      posterCtx.closePath();
      posterCtx.fill();
    };
  };

  const downloadQR = () => {
    const canvas = downloadQrCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `axxspace_qr_${property.title.replace(/\s+/g, "_").toLowerCase()}_${source}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const downloadPoster = () => {
    const canvas = posterCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `axxspace_poster_${property.title.replace(/\s+/g, "_").toLowerCase()}_${source}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const printPoster = () => {
    window.print();
  };

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}> Poster & QR Generator</h2>
            <p style={styles.subtitle}>{property.title}</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div style={styles.body}>
          {/* Controls */}
          <div style={styles.controlGroup}>
            <label style={styles.label}>Where are you placing this poster?</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              style={styles.select}
            >
              {SOURCES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <p style={styles.helpText}>
              Selecting a specific placement helps you track scans from the gate vs noticeboards in your analytics.
            </p>
          </div>

          <div style={styles.previewContainer}>
            {/* Visual HTML Preview of the Poster */}
            <div style={styles.previewBox}>
              <h4 style={styles.previewHeader}>Live Poster Preview ({getSourceLabel(source)})</h4>
              <div style={{
                width: "397px",
                height: "561px",
                overflow: "hidden",
                position: "relative",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                backgroundColor: "#ffffff",
                boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
              }}>
                <div style={{
                  width: "794px",
                  height: "1123px",
                  transform: "scale(0.5)",
                  transformOrigin: "top left",
                  position: "absolute",
                  left: 0,
                  top: 0
                }}>
                  <VacancyPoster property={property} qrCodeDataUrl={qrCodeDataUrl} sourceLabel={getSourceLabel(source)} />
                </div>
              </div>
            </div>

            {/* Hidden elements used for rendering exports */}
            <div style={{ display: "none" }}>
              <canvas ref={qrCanvasRef} width={300} height={300} />
              <canvas ref={downloadQrCanvasRef} width={350} height={450} />
              <canvas ref={posterCanvasRef} width={800} height={1130} />
            </div>

            {/* Print Only Representation: This is visible only in CSS print mode */}
            <div className="print-poster-only" style={{ display: "none" }}>
              <VacancyPoster property={property} qrCodeDataUrl={qrCodeDataUrl} sourceLabel={getSourceLabel(source)} />
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.cancelBtn} onClick={onClose}>Close</button>

          <div style={styles.actionButtons}>
            <button
              style={styles.downloadBtn}
              onClick={downloadQR}
              disabled={!qrLoaded}
            >
              Download QR (PNG)
            </button>
            <button
              style={styles.downloadBtn}
              onClick={downloadPoster}
              disabled={!qrLoaded}
            >
              Download Poster (PNG)
            </button>
            <button
              style={styles.printBtn}
              onClick={printPoster}
              disabled={!qrLoaded}
            >
              Print Poster (A4 PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline Styles for modal layout
const styles = {
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    backgroundColor: "#1e293b",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "500px",
    maxHeight: "90vh",
    overflowY: "auto",
    color: "#fff",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "20px 24px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#fbbf24",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: "4px 0 0",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    fontSize: "24px",
    cursor: "pointer",
    lineHeight: "20px",
    "&:hover": { color: "#fff" }
  },
  body: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  controlGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#f1f5f9",
  },
  select: {
    padding: "12px 16px",
    backgroundColor: "#0f172a",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 600,
    outline: "none",
    cursor: "pointer",
  },
  helpText: {
    fontSize: "11px",
    color: "#64748b",
    margin: 0,
  },
  previewContainer: {
    display: "flex",
    justifyContent: "center",
    backgroundColor: "#0f172a",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  previewBox: {
    width: "100%",
    maxWidth: "420px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  previewHeader: {
    fontSize: "12px",
    color: "#fbbf24",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "12px",
    textAlign: "center",
  },
  footer: {
    padding: "20px 24px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },
  cancelBtn: {
    padding: "10px 20px",
    backgroundColor: "#334155",
    color: "#f1f5f9",
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "13px",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  downloadBtn: {
    padding: "10px 16px",
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    color: "#60a5fa",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  printBtn: {
    padding: "10px 16px",
    backgroundColor: "#fbbf24",
    border: "none",
    color: "#0f1729",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(251, 191, 36, 0.2)",
    transition: "all 0.2s",
  }
};

// High-fidelity Poster design stylesheet values
const posterStyles = {
  posterContainer: {
    width: "794px",
    height: "1123px",
    backgroundColor: "#ffffff",
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='800' height='1200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-100,200 Q200,100 400,300 T900,200 M-100,400 Q200,300 400,500 T900,400 M-100,600 Q200,500 400,700 T900,600 M-100,800 Q200,700 400,900 T900,800' fill='none' stroke='%23f1f5f9' stroke-width='1.5'/%3E%3C/svg%3E")`,
    color: "#081A34",
    fontFamily: "'Inter', sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxSizing: "border-box",
    padding: "0",
    position: "relative",
    overflow: "hidden",
  },
  topAccentLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "35px",
    backgroundColor: "#081A34",
    clipPath: "polygon(0 0, 100% 0, 100% 40%, 0 100%)",
  },
  logoSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "50px",
    width: "100%",
  },
  logoImg: {
    width: "100px",
    height: "100px",
    objectFit: "contain",
  },
  logoTextContainer: {
    display: "flex",
    fontSize: "40px",
    fontWeight: "900",
    letterSpacing: "-1px",
    marginTop: "10px",
  },
  logoTagline: {
    fontSize: "16px",
    color: "#475569",
    fontWeight: "500",
    marginTop: "4px",
  },
  redSeparator: {
    width: "90%",
    height: "4px",
    backgroundColor: "#d9383a",
    marginTop: "20px",
  },
  titleSection: {
    position: "relative",
    width: "100%",
    textAlign: "center",
    marginTop: "35px",
  },
  titleTextContainer: {
    display: "inline-block",
  },
  titleRow1: {
    fontSize: "60px",
    fontWeight: "900",
    color: "#081A34",
    lineHeight: "1",
    letterSpacing: "1px",
  },
  titleRow2: {
    fontSize: "85px",
    fontWeight: "900",
    color: "#d9383a",
    lineHeight: "1",
    letterSpacing: "2px",
  },
  badgeContainer: {
    position: "absolute",
    right: "40px",
    top: "50%",
    transform: "translateY(-50%)",
  },
  scanInstruction: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#081A34",
    marginTop: "20px",
    textAlign: "center",
    letterSpacing: "0.5px",
  },
  qrContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "25px",
  },
  qrBox: {
    border: "4px solid #d9383a",
    borderRadius: "10px",
    padding: "16px",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    display: "inline-block",
  },
  qrCodeImg: {
    width: "260px",
    height: "260px",
    display: "block",
  },
  qrPlaceholder: {
    width: "260px",
    height: "260px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    color: "#64748b",
  },
  visitSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "20px",
  },
  orVisitText: {
    fontSize: "14px",
    fontWeight: "800",
    color: "#081A34",
    letterSpacing: "1px",
  },
  visitPill: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "2px solid #081A34",
    borderRadius: "30px",
    padding: "6px 20px",
    backgroundColor: "#ffffff",
    marginTop: "8px",
  },
  globeCircle: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#081A34",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  visitUrl: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#081A34",
  },
  contactFooter: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "24px",
    marginTop: "30px",
    width: "100%",
  },
  contactItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#081A34",
    fontSize: "14px",
    fontWeight: "700",
  },
  bottomAccentLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "240px",
    height: "35px",
    backgroundColor: "#d9383a",
    clipPath: "polygon(0 0, 100% 100%, 0 100%)",
  },
  bottomAccentRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: "554px", // 794 - 240
    height: "35px",
    backgroundColor: "#081A34",
    clipPath: "polygon(0 100%, 100% 0, 100% 100%)",
  },
};
