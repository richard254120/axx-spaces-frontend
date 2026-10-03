import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import logo from "../assets/image.png";

/* ══════════════════════════════════════════════════════════
   AgentQRPosterModal
   Mirrors the landlord VacancyPoster design exactly.
   QR code links to the agent's public profile page.
══════════════════════════════════════════════════════════ */

const getScallopPath = (cx, cy, r, numScallops, depth) => {
  let path = "";
  for (let i = 0; i <= 360; i++) {
    const angle = (i * Math.PI) / 180;
    const currentR = r + Math.sin(angle * numScallops) * depth;
    const x = cx + currentR * Math.cos(angle);
    const y = cy + currentR * Math.sin(angle);
    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return path + " Z";
};

const AgentScallopBadge = () => {
  const path = getScallopPath(55, 55, 43, 18, 4);
  return (
    <svg width="110" height="110" viewBox="0 0 110 110" style={{ overflow: "visible" }}>
      <path d={path} fill="#081A34" stroke="#d9383a" strokeWidth="2.5" />
      <rect x="40" y="44" width="30" height="20" rx="3"
        fill="none" stroke="#ffffff" strokeWidth="2" />
      <path d="M48 44 v-4 a3 3 0 0 1 3-3 h6 a3 3 0 0 1 3 3 v4"
        fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <line x1="40" y1="54" x2="70" y2="54" stroke="#ffffff" strokeWidth="1.5" />
      <text x="55" y="72" fill="#ffffff" fontSize="7.5" fontWeight="bold"
        textAnchor="middle" fontFamily="'Inter', sans-serif">Listed On</text>
      <text x="55" y="83" fill="#ffffff" fontSize="9" fontWeight="900"
        textAnchor="middle" fontFamily="'Inter', sans-serif">AXXSPACE</text>
    </svg>
  );
};

function AgentPoster({ agent, qrCodeDataUrl }) {
  const name = agent?.name || agent?.username || "Agent";
  return (
    <div style={ps.posterContainer}>
      <div style={ps.topAccentLeft} />

      {/* Brand */}
      <div style={ps.logoSection}>
        <img src={logo} alt="Axxspace Logo" style={ps.logoImg} />
        <div style={ps.logoTextContainer}>
          <span style={{ color: "#d9383a" }}>AXX</span>
          <span style={{ color: "#081A34", marginLeft: "6px" }}>SPACE</span>
        </div>
        <div style={ps.logoTagline}>Space hunting bila stress</div>
        <div style={ps.redSeparator} />
      </div>

      {/* Title + Badge */}
      <div style={ps.titleSection}>
        <div style={ps.titleTextContainer}>
          <div style={ps.titleRow1}>VERIFIED</div>
          <div style={ps.titleRow2}>AGENT</div>
        </div>
        <div style={ps.badgeContainer}>
          <AgentScallopBadge />
        </div>
      </div>

      {/* Scan instruction */}
      <div style={ps.scanInstruction}>SCAN TO VIEW AGENT PROFILE AND LISTINGS</div>

      {/* QR */}
      <div style={ps.qrContainer}>
        <div style={ps.qrBox}>
          {qrCodeDataUrl
            ? <img src={qrCodeDataUrl} alt="Agent QR Code" style={ps.qrCodeImg} />
            : <div style={ps.qrPlaceholder}>Generating QR…</div>}
        </div>
      </div>

      {/* Visit */}
      <div style={ps.visitSection}>
        <div style={ps.orVisitText}>OR VISIT</div>
        <div style={ps.visitPill}>
          <div style={ps.globeCircle}>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none"
              stroke="#ffffff" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <span style={ps.visitUrl}>www.axxspace.com</span>
        </div>
      </div>

      {/* Agent name strip */}
      <div style={ps.agentStrip}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
          stroke="#081A34" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0 }}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span style={ps.agentStripLabel}>Agent:&nbsp;</span>
        <span style={ps.agentStripName}>{name}</span>
      </div>

      {/* Footer */}
      <div style={ps.contactFooter}>
        <div style={ps.contactItem}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
            stroke="#081A34" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <span>info@axxspace.com</span>
        </div>
        <div style={ps.contactItem}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#081A34">
            <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.761.459 3.475 1.33 4.988l-1.417 5.176 5.297-1.39a9.939 9.939 0 0 0 4.778 1.214h.004c5.506 0 9.988-4.482 9.988-9.988.001-2.66-1.034-5.161-2.92-7.052A9.92 9.92 0 0 0 12.012 2zm5.727 13.916c-.244.686-1.22 1.262-1.682 1.344-.462.081-.926.156-3.033-.674-2.529-.993-4.148-3.565-4.274-3.732-.127-.168-.946-1.258-.946-2.398 0-1.14.597-1.705.809-1.928.212-.224.462-.28.618-.28h.442c.112 0 .262-.042.411.319.15.362.511 1.25.555 1.34.043.089.073.193.013.31-.06.117-.089.192-.178.297-.09.104-.188.232-.269.31-.089.088-.182.183-.078.36.104.178.461.76.99 1.23.681.605 1.254.793 1.43.882.176.088.277.074.379-.044.103-.118.441-.518.56-.695.118-.178.238-.148.397-.089.159.059 1.011.477 1.184.566.173.089.288.134.332.208.044.074.044.431-.2.116z" />
          </svg>
          <span>+254 745 689 773</span>
        </div>
        <div style={ps.contactItem}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
              stroke="#081A34" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style={{ color: "#081A34" }}>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>
          <span>axx.space</span>
        </div>
      </div>

      <div style={ps.bottomAccentLeft} />
      <div style={ps.bottomAccentRight} />
    </div>
  );
}

// ── Poster inline styles (identical layout to VacancyPoster) ──
const ps = {
  posterContainer: {
    width: "794px",
    height: "1123px",
    backgroundColor: "#ffffff",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', sans-serif",
  },
  topAccentLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "35px",
    background: "#081A34",
    clipPath: "polygon(0 0, 100% 0, 100% 40%, 0 100%)",
    zIndex: 2,
  },
  logoSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "55px",
  },
  logoImg: {
    width: "80px",
    height: "80px",
    objectFit: "contain",
  },
  logoTextContainer: {
    fontSize: "34px",
    fontWeight: 900,
    letterSpacing: "1px",
    marginTop: "6px",
  },
  logoTagline: {
    fontSize: "13px",
    color: "#475569",
    fontWeight: 500,
    marginTop: "2px",
    letterSpacing: "0.3px",
  },
  redSeparator: {
    width: "720px",
    height: "4px",
    backgroundColor: "#d9383a",
    marginTop: "14px",
  },
  titleSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 60px 0",
    position: "relative",
  },
  titleTextContainer: {
    flex: 1,
  },
  titleRow1: {
    fontSize: "48px",
    fontWeight: 900,
    color: "#081A34",
    lineHeight: 1.1,
    letterSpacing: "-1px",
  },
  titleRow2: {
    fontSize: "68px",
    fontWeight: 900,
    color: "#d9383a",
    lineHeight: 1.05,
    letterSpacing: "-2px",
  },
  badgeContainer: {
    flexShrink: 0,
    marginLeft: "20px",
  },
  scanInstruction: {
    textAlign: "center",
    fontSize: "16px",
    fontWeight: 800,
    color: "#081A34",
    letterSpacing: "0.3px",
    marginTop: "8px",
    padding: "0 40px",
  },
  qrContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "18px",
  },
  qrBox: {
    width: "264px",
    height: "264px",
    border: "4px solid #d9383a",
    borderRadius: "10px",
    padding: "12px",
    backgroundColor: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  qrCodeImg: {
    width: "240px",
    height: "240px",
    objectFit: "contain",
  },
  qrPlaceholder: {
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: 600,
  },
  visitSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "20px",
    gap: "8px",
  },
  orVisitText: {
    fontSize: "13px",
    fontWeight: 800,
    color: "#081A34",
    letterSpacing: "1px",
  },
  visitPill: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "2px solid #081A34",
    borderRadius: "22px",
    padding: "8px 24px",
    backgroundColor: "#ffffff",
  },
  globeCircle: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#081A34",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  visitUrl: {
    fontSize: "15px",
    fontWeight: 800,
    color: "#081A34",
    letterSpacing: "0.3px",
  },
  agentStrip: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    marginTop: "14px",
    padding: "8px 40px",
    backgroundColor: "#f0f4ff",
    borderTop: "1px solid #dde4f0",
    borderBottom: "1px solid #dde4f0",
  },
  agentStripLabel: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#475569",
  },
  agentStripName: {
    fontSize: "14px",
    fontWeight: 900,
    color: "#081A34",
    letterSpacing: "0.3px",
  },
  contactFooter: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "14px 40px",
    marginTop: "10px",
    borderTop: "1px solid #e2e8f0",
  },
  contactItem: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "12px",
    fontWeight: 700,
    color: "#081A34",
  },
  bottomAccentLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "240px",
    height: "35px",
    backgroundColor: "#d9383a",
    clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 0)",
  },
  bottomAccentRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: "calc(100% - 240px)",
    height: "35px",
    backgroundColor: "#081A34",
    clipPath: "polygon(0 100%, 100% 0, 100% 100%, 0 100%)",
  },
};

// ── Main Modal Component ──────────────────────────────────────
export default function AgentQRPosterModal({ isOpen, onClose, agent }) {
  const [qrLoaded, setQrLoaded] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const qrCanvasRef       = useRef(null);
  const downloadQrRef     = useRef(null);
  const posterCanvasRef   = useRef(null);

  useEffect(() => {
    if (isOpen && agent) {
      const t = setTimeout(generateQR, 100);
      return () => clearTimeout(t);
    }
  }, [isOpen, agent]);

  if (!isOpen || !agent) return null;

  const getProfileUrl = () =>
    `${window.location.origin}/agent/profile/${agent._id}`;

  const generateQR = () => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;

    QRCode.toCanvas(canvas, getProfileUrl(), {
      width: 300,
      margin: 1.5,
      errorCorrectionLevel: "H",
      color: { dark: "#081A34", light: "#ffffff" },
    }, (err) => {
      if (err) { console.error("QR error:", err); return; }

      const dataUrl = canvas.toDataURL("image/png");
      setQrCodeDataUrl(dataUrl);
      setQrLoaded(true);
      drawCanvases(canvas);
    });
  };

  const drawRoundRect = (ctx, x, y, w, h, r, fill, stroke, strokeColor, lw) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) { ctx.strokeStyle = strokeColor; ctx.lineWidth = lw; ctx.stroke(); }
  };

  const drawScallop = (ctx, cx, cy, r, n, d, fillCol, strokeCol, lw) => {
    ctx.beginPath();
    for (let i = 0; i <= 360; i++) {
      const a = (i * Math.PI) / 180;
      const cr = r + Math.sin(a * n) * d;
      const x = cx + cr * Math.cos(a);
      const y = cy + cr * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    if (fillCol) { ctx.fillStyle = fillCol; ctx.fill(); }
    if (strokeCol) { ctx.strokeStyle = strokeCol; ctx.lineWidth = lw; ctx.stroke(); }
  };

  const drawCanvases = (qrCanvas) => {
    const dlQr  = downloadQrRef.current;
    const poster = posterCanvasRef.current;
    if (!dlQr || !poster) return;

    const agentName = agent?.name || agent?.username || "Agent";

    // ── Standalone QR download ──
    const qCtx = dlQr.getContext("2d");
    qCtx.fillStyle = "#ffffff";
    qCtx.fillRect(0, 0, dlQr.width, dlQr.height);
    qCtx.drawImage(qrCanvas, 25, 20);
    qCtx.font = "bold 26px 'Inter', system-ui, sans-serif";
    qCtx.fillStyle = "#081A34";
    qCtx.textAlign = "center";
    qCtx.fillText("Axxspace", 175, 365);
    qCtx.font = "600 13px 'Inter', system-ui, sans-serif";
    qCtx.fillStyle = "#64748b";
    qCtx.fillText("Scan to view agent profile", 175, 395);

    // ── High-res poster (800 × 1130) ──
    const logoImg = new Image();
    logoImg.src = logo;
    logoImg.onload = () => drawPosterCanvas(poster, qrCanvas, logoImg, agentName);
  };

  const drawPosterCanvas = (poster, qrCanvas, logoImg, agentName) => {
    const pCtx = poster.getContext("2d");
    pCtx.fillStyle = "#ffffff";
    pCtx.fillRect(0, 0, poster.width, poster.height);
    const PW = poster.width;
    const PH = poster.height;

    // Watermark waves
    pCtx.strokeStyle = "#f1f5f9";
    pCtx.lineWidth = 1.5;
    for (let yo = 0; yo < 1200; yo += 200) {
      pCtx.beginPath();
      pCtx.moveTo(-100, yo + 200);
      pCtx.quadraticCurveTo(200, yo + 100, 400, yo + 300);
      pCtx.quadraticCurveTo(600, yo + 500, 900, yo + 200);
      pCtx.stroke();
    }

    // Top slanted accent
    pCtx.fillStyle = "#081A34";
    pCtx.beginPath();
    pCtx.moveTo(0, 0);
    pCtx.lineTo(PW, 0);
    pCtx.lineTo(PW, 14);
    pCtx.lineTo(0, 35);
    pCtx.closePath();
    pCtx.fill();

    // Brand name
    pCtx.font = "900 42px 'Inter', sans-serif";
    const t1 = "AXX ", t2 = "SPACE";
    const w1 = pCtx.measureText(t1).width;
    const w2 = pCtx.measureText(t2).width;
    const bx = (PW - (w1 + w2)) / 2;
    pCtx.textAlign = "left";
    pCtx.fillStyle = "#d9383a";
    pCtx.fillText(t1, bx, 90);
    pCtx.fillStyle = "#081A34";
    pCtx.fillText(t2, bx + w1, 90);

    pCtx.textAlign = "center";
    pCtx.fillStyle = "#475569";
    pCtx.font = "500 16px 'Inter', sans-serif";
    pCtx.fillText("Space hunting bila stress", PW / 2, 118);

    // Red separator
    pCtx.fillStyle = "#d9383a";
    pCtx.fillRect(40, 138, 720, 4);

    // "VERIFIED" in navy
    pCtx.textAlign = "center";
    pCtx.fillStyle = "#081A34";
    pCtx.font = "900 60px 'Inter', sans-serif";
    pCtx.fillText("VERIFIED", PW / 2, 228);

    // "AGENT" in red
    pCtx.fillStyle = "#d9383a";
    pCtx.font = "900 85px 'Inter', sans-serif";
    pCtx.fillText("AGENT", PW / 2, 318);

    // Scallop badge — briefcase icon
    const bx2 = 650, by2 = 248, br = 45;
    drawScallop(pCtx, bx2, by2, br, 18, 4, "#081A34", "#d9383a", 3);

    // Briefcase body
    pCtx.strokeStyle = "#ffffff";
    pCtx.lineWidth = 2.5;
    pCtx.lineCap = "round";
    pCtx.lineJoin = "round";
    drawRoundRect(pCtx, bx2 - 14, by2 - 8, 28, 18, 4, false, true, "#ffffff", 2.5);
    // Briefcase handle
    pCtx.beginPath();
    pCtx.moveTo(bx2 - 7, by2 - 8);
    pCtx.lineTo(bx2 - 7, by2 - 15);
    pCtx.quadraticCurveTo(bx2 - 7, by2 - 20, bx2, by2 - 20);
    pCtx.quadraticCurveTo(bx2 + 7, by2 - 20, bx2 + 7, by2 - 15);
    pCtx.lineTo(bx2 + 7, by2 - 8);
    pCtx.stroke();
    // Centre clasp line
    pCtx.beginPath();
    pCtx.moveTo(bx2 - 14, by2 - 1);
    pCtx.lineTo(bx2 + 14, by2 - 1);
    pCtx.stroke();
    // Badge text
    pCtx.fillStyle = "#ffffff";
    pCtx.textAlign = "center";
    pCtx.font = "bold 8px 'Inter', sans-serif";
    pCtx.fillText("Listed On", bx2, by2 + 16);
    pCtx.font = "900 9.5px 'Inter', sans-serif";
    pCtx.fillText("AXXSPACE", bx2, by2 + 27);

    // Scan CTA
    pCtx.fillStyle = "#081A34";
    pCtx.textAlign = "center";
    pCtx.font = "800 20px 'Inter', sans-serif";
    pCtx.fillText("SCAN TO VIEW AGENT PROFILE AND LISTINGS", PW / 2, 378);

    // QR box
    const qbW = 296, qbH = 296;
    const qbX = (PW - qbW) / 2, qbY = 413;
    pCtx.fillStyle = "#ffffff";
    drawRoundRect(pCtx, qbX, qbY, qbW, qbH, 10, true, true, "#d9383a", 4);
    pCtx.drawImage(qrCanvas, qbX + 16, qbY + 16, 264, 264);

    // Agent name strip
    const stripY = 738;
    pCtx.fillStyle = "#f0f4ff";
    pCtx.fillRect(0, stripY, PW, 42);
    pCtx.strokeStyle = "#dde4f0";
    pCtx.lineWidth = 1;
    pCtx.beginPath();
    pCtx.moveTo(0, stripY); pCtx.lineTo(PW, stripY); pCtx.stroke();
    pCtx.beginPath();
    pCtx.moveTo(0, stripY + 42); pCtx.lineTo(PW, stripY + 42); pCtx.stroke();

    pCtx.font = "600 15px 'Inter', sans-serif";
    pCtx.fillStyle = "#475569";
    pCtx.textAlign = "center";
    pCtx.fillText("Agent: " + agentName, PW / 2, stripY + 27);

    // OR VISIT
    pCtx.fillStyle = "#081A34";
    pCtx.textAlign = "center";
    pCtx.font = "800 16px 'Inter', sans-serif";
    pCtx.fillText("OR VISIT", PW / 2, 820);

    // URL pill
    const pW2 = 280, pH2 = 44;
    const pX2 = (PW - pW2) / 2, pY2 = 836;
    pCtx.fillStyle = "#ffffff";
    drawRoundRect(pCtx, pX2, pY2, pW2, pH2, 22, true, true, "#081A34", 2);
    // Globe
    const gx = pX2 + 22, gy = pY2 + 22;
    pCtx.fillStyle = "#081A34";
    pCtx.beginPath(); pCtx.arc(gx, gy, 12, 0, Math.PI * 2); pCtx.fill();
    pCtx.strokeStyle = "#ffffff"; pCtx.lineWidth = 1.5;
    pCtx.beginPath(); pCtx.arc(gx, gy, 10, 0, Math.PI * 2); pCtx.stroke();
    pCtx.beginPath(); pCtx.moveTo(gx - 10, gy); pCtx.lineTo(gx + 10, gy); pCtx.stroke();
    pCtx.beginPath(); pCtx.moveTo(gx, gy - 10); pCtx.lineTo(gx, gy + 10); pCtx.stroke();
    if (pCtx.ellipse) {
      pCtx.beginPath(); pCtx.ellipse(gx, gy, 5, 10, 0, 0, Math.PI * 2); pCtx.stroke();
    }
    pCtx.fillStyle = "#081A34";
    pCtx.textAlign = "left";
    pCtx.font = "800 18px 'Inter', sans-serif";
    pCtx.fillText("www.axxspace.com", pX2 + 44, pY2 + 28);

    // Contact row
    const cY = 1025;
    pCtx.textAlign = "left";
    pCtx.font = "800 15px 'Inter', sans-serif";

    // Email
    const b1X = 80;
    pCtx.strokeStyle = "#081A34"; pCtx.lineWidth = 1.5;
    pCtx.strokeRect(b1X, cY - 12, 18, 12);
    pCtx.beginPath();
    pCtx.moveTo(b1X, cY - 12); pCtx.lineTo(b1X + 9, cY - 6); pCtx.lineTo(b1X + 18, cY - 12);
    pCtx.stroke();
    pCtx.fillStyle = "#081A34";
    pCtx.fillText("info@axxspace.com", b1X + 26, cY - 1);

    // WhatsApp
    const b2X = 330;
    pCtx.beginPath();
    pCtx.arc(b2X + 8, cY - 6, 6, 0.15 * Math.PI, 1.85 * Math.PI);
    pCtx.lineTo(b2X + 1, cY - 1); pCtx.closePath(); pCtx.stroke();
    pCtx.beginPath();
    pCtx.arc(b2X + 8, cY - 6, 3, 0.7 * Math.PI, 1.3 * Math.PI); pCtx.stroke();
    pCtx.fillText("+254 745 689 773", b2X + 26, cY - 1);

    // Social icons (IG + X)
    const b3X = 590;
    pCtx.strokeStyle = "#081A34"; pCtx.lineWidth = 1.5;
    drawRoundRect(pCtx, b3X, cY - 12, 12, 12, 3, false, true, "#081A34", 1.5);
    pCtx.beginPath(); pCtx.arc(b3X + 6, cY - 6, 2.5, 0, Math.PI * 2); pCtx.stroke();
    pCtx.beginPath(); pCtx.arc(b3X + 9, cY - 9, 0.5, 0, Math.PI * 2);
    pCtx.fillStyle = "#081A34"; pCtx.fill();
    pCtx.lineWidth = 1.8;
    pCtx.beginPath();
    pCtx.moveTo(b3X + 20, cY - 12); pCtx.lineTo(b3X + 30, cY);
    pCtx.moveTo(b3X + 30, cY - 12); pCtx.lineTo(b3X + 20, cY);
    pCtx.stroke();
    pCtx.fillText("axx.space", b3X + 36, cY - 1);

    // Bottom accents
    pCtx.fillStyle = "#d9383a";
    pCtx.beginPath();
    pCtx.moveTo(0, PH - 35); pCtx.lineTo(240, PH);
    pCtx.lineTo(0, PH); pCtx.closePath(); pCtx.fill();

    pCtx.fillStyle = "#081A34";
    pCtx.beginPath();
    pCtx.moveTo(240, PH); pCtx.lineTo(PW, PH - 35);
    pCtx.lineTo(PW, PH); pCtx.closePath(); pCtx.fill();
  };

  const downloadQR = () => {
    const canvas = downloadQrRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `axxspace_agent_qr_${(agent?.name || "agent").replace(/\s+/g, "_").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const downloadPoster = () => {
    const canvas = posterCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `axxspace_agent_poster_${(agent?.name || "agent").replace(/\s+/g, "_").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div style={ms.backdrop}>
      <div style={ms.modal}>
        {/* Header */}
        <div style={ms.header}>
          <div>
            <h2 style={ms.title}>🪪 Agent QR Poster</h2>
            <p style={ms.subtitle}>{agent?.name || agent?.username || "Agent"}</p>
          </div>
          <button style={ms.closeBtn} onClick={onClose}>&times;</button>
        </div>

        {/* Body */}
        <div style={ms.body}>
          <p style={ms.helpText}>
            This poster links directly to your agent profile. Share it, print it, or stick it anywhere so clients can scan and find your listings instantly.
          </p>

          {/* Live preview */}
          <div style={ms.previewBox}>
            <h4 style={ms.previewHeader}>Live Poster Preview</h4>
            <div style={ms.previewFrame}>
              <div style={ms.previewScale}>
                <AgentPoster agent={agent} qrCodeDataUrl={qrCodeDataUrl} />
              </div>
            </div>
          </div>

          {/* Hidden canvases for export */}
          <div style={{ display: "none" }}>
            <canvas ref={qrCanvasRef}   width={300} height={300} />
            <canvas ref={downloadQrRef} width={350} height={450} />
            <canvas ref={posterCanvasRef} width={800} height={1130} />
          </div>
        </div>

        {/* Footer actions */}
        <div style={ms.footer}>
          <button style={ms.cancelBtn} onClick={onClose}>Close</button>
          <div style={ms.actionBtns}>
            <button style={ms.dlBtn} onClick={downloadQR}    disabled={!qrLoaded}>⬇ QR Code (PNG)</button>
            <button style={ms.dlBtn} onClick={downloadPoster} disabled={!qrLoaded}>⬇ Poster (PNG)</button>
            <button style={ms.printBtn} onClick={() => window.print()} disabled={!qrLoaded}>🖨 Print (A4)</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modal layout styles ───────────────────────────────────────
const ms = {
  backdrop: {
    position: "fixed", inset: 0,
    backgroundColor: "rgba(15,23,42,0.85)",
    backdropFilter: "blur(8px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: "20px",
  },
  modal: {
    backgroundColor: "#1e293b",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "20px",
    width: "100%", maxWidth: "500px",
    maxHeight: "90vh", overflowY: "auto",
    color: "#fff",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
    display: "flex", flexDirection: "column",
  },
  header: {
    padding: "20px 24px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
  },
  title: { fontSize: "20px", fontWeight: 700, margin: 0, color: "#f8fafc" },
  subtitle: { fontSize: "13px", color: "#94a3b8", margin: "4px 0 0", fontWeight: 500 },
  closeBtn: {
    background: "rgba(255,255,255,0.08)",
    border: "none", borderRadius: "8px",
    color: "#94a3b8", fontSize: "20px",
    width: "36px", height: "36px",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  body: { padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" },
  helpText: { fontSize: "13px", color: "#94a3b8", lineHeight: 1.6, margin: 0 },
  previewBox: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px", padding: "16px",
  },
  previewHeader: {
    fontSize: "12px", fontWeight: 700, color: "#64748b",
    textTransform: "uppercase", letterSpacing: "0.1em",
    margin: "0 0 12px",
  },
  previewFrame: {
    width: "100%",
    height: "561px",
    overflow: "hidden",
    position: "relative",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
  },
  previewScale: {
    width: "794px", height: "1123px",
    transform: "scale(0.5)",
    transformOrigin: "top left",
    position: "absolute", left: 0, top: 0,
  },
  footer: {
    padding: "16px 24px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    display: "flex", justifyContent: "space-between",
    alignItems: "center", gap: "10px", flexWrap: "wrap",
  },
  cancelBtn: {
    padding: "10px 20px",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px", color: "#94a3b8",
    fontSize: "13px", fontWeight: 600, cursor: "pointer",
  },
  actionBtns: { display: "flex", gap: "8px", flexWrap: "wrap" },
  dlBtn: {
    padding: "10px 16px",
    background: "linear-gradient(135deg,#d9383a,#b91c1c)",
    border: "none", borderRadius: "10px",
    color: "#ffffff", fontSize: "12px", fontWeight: 700,
    cursor: "pointer",
    opacity: 1,
  },
  printBtn: {
    padding: "10px 16px",
    background: "linear-gradient(135deg,#081A34,#1e3a5f)",
    border: "none", borderRadius: "10px",
    color: "#ffffff", fontSize: "12px", fontWeight: 700,
    cursor: "pointer",
  },
};
