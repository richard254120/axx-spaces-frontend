import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
// Original AxXspace logo. Served from /public so the poster, the live preview
// and the canvas export all use the same brand asset (and stay same-origin).
const logo = "/axxspace_poster_header_logo_clean.png";

/* ══════════════════════════════════════════════════════════
   AgentQRPosterModal
   Matches the AxxSpace Househunting Agent pin poster:
   - Location pin silhouette with thick red outer border
   - Top white region with clean brand lockup & bold HOUSEHUNTING AGENT
   - Central crisp QR code linking to agent profile
   - Slanted bottom-right navy wedge with red divider & Contact Us
══════════════════════════════════════════════════════════ */

const POSTER_W = 800;
const POSTER_H = 1130;

const NAVY = "#04244D";
const RED  = "#E51A24";

/* ── Poster shell = the AxXspace pin ─────────────────────────
   Round head + long tapered tail that comes to a point.
─────────────────────────────────────────────────────────────── */
const HEAD_CX = POSTER_W / 2;   // 400
const HEAD_CY = 405;
const HEAD_R  = 370;
const TIP_Y   = 1095;

// The entire pin silhouette
const traceFullPin = (ctx) => {
  ctx.beginPath();
  ctx.moveTo(HEAD_CX, TIP_Y);
  ctx.bezierCurveTo(320, 1010, HEAD_CX - HEAD_R, 880, HEAD_CX - HEAD_R, HEAD_CY);
  ctx.arc(HEAD_CX, HEAD_CY, HEAD_R, Math.PI, 0, false);
  ctx.bezierCurveTo(HEAD_CX + HEAD_R, 880, 480, 1010, HEAD_CX, TIP_Y);
  ctx.closePath();
};

// The white top portion of the pin framed by the red outline
const traceWhiteSection = (ctx) => {
  ctx.beginPath();
  ctx.moveTo(204, 880);
  ctx.bezierCurveTo(HEAD_CX - HEAD_R, 750, HEAD_CX - HEAD_R, HEAD_CY + 200, HEAD_CX - HEAD_R, HEAD_CY);
  ctx.arc(HEAD_CX, HEAD_CY, HEAD_R, Math.PI, 0, false);
  ctx.bezierCurveTo(HEAD_CX + HEAD_R, HEAD_CY + 120, HEAD_CX + HEAD_R, 490, 782, 520);
  // Diagonal curve dividing top white from bottom navy:
  ctx.bezierCurveTo(617, 667, 393, 808, 204, 880);
  ctx.closePath();
};

// Preview is rendered straight from the export PNG, scaled to fit the modal.
function AgentPoster({ posterDataUrl }) {
  if (!posterDataUrl) {
    return <div style={ps.previewEmpty}>Generating poster…</div>;
  }
  return <img src={posterDataUrl} alt="Agent QR poster" style={ps.previewImg} />;
}

const ps = {
  previewImg: {
    width: `${POSTER_W}px`,
    height: `${POSTER_H}px`,
    display: "block",
  },
  previewEmpty: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
  },
};

// ── Main Modal Component ──────────────────────────────────────
export default function AgentQRPosterModal({ isOpen, onClose, agent }) {
  const [qrLoaded, setQrLoaded] = useState(false);
  const [posterDataUrl, setPosterDataUrl] = useState("");
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
      width: 620,
      margin: 1.5,
      errorCorrectionLevel: "H",
      color: { dark: NAVY, light: "#ffffff" },
    }, (err) => {
      if (err) { console.error("QR error:", err); return; }

      setQrLoaded(true);
      drawCanvases(canvas);
    });
  };

  // Pin silhouette used for the standalone QR frame download
  const drawPinFrame = (ctx, x, y, w, tail, fillCol, strokeCol, lw) => {
    const r = w / 2;
    const cx = x + r, cy = y + r, tipY = y + w + tail;
    ctx.beginPath();
    ctx.moveTo(cx, tipY);
    ctx.bezierCurveTo(cx - r * 0.25, cy + r, cx - r, cy + r * 0.55, cx - r, cy);
    ctx.arc(cx, cy, r, Math.PI, Math.PI * 2, false);
    ctx.bezierCurveTo(cx + r, cy + r * 0.55, cx + r * 0.25, cy + r, cx, tipY);
    ctx.closePath();
    if (fillCol) { ctx.fillStyle = fillCol; ctx.fill(); }
    if (strokeCol) { ctx.strokeStyle = strokeCol; ctx.lineWidth = lw; ctx.stroke(); }
  };

  // Contact icon drawing functions (crisp white vectors)
  const drawEnvelopeIcon = (ctx, x, y) => {
    ctx.save();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeRect(x, y - 14, 22, 16);
    ctx.beginPath();
    ctx.moveTo(x + 1, y - 13);
    ctx.lineTo(x + 11, y - 4);
    ctx.lineTo(x + 21, y - 13);
    ctx.stroke();
    ctx.restore();
  };

  const drawWhatsAppIcon = (ctx, x, y) => {
    ctx.save();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const icx = x + 10, icy = y - 6;
    ctx.beginPath();
    ctx.arc(icx, icy, 9.5, 0.22 * Math.PI, 1.82 * Math.PI, false);
    ctx.lineTo(icx - 9, icy + 9);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(icx, icy, 4.5, 0.7 * Math.PI, 1.35 * Math.PI, false);
    ctx.stroke();
    ctx.restore();
  };

  const drawGlobeIcon = (ctx, x, y) => {
    ctx.save();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.0;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const icx = x + 10, icy = y - 6;
    ctx.beginPath();
    ctx.arc(icx, icy, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(icx - 10, icy);
    ctx.lineTo(icx + 10, icy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(icx, icy - 10);
    ctx.lineTo(icx, icy + 10);
    ctx.stroke();
    ctx.save();
    ctx.translate(icx, icy);
    ctx.scale(0.5, 1.0);
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    ctx.restore();
  };

  // Draws a 3-part word (navy, red, navy) centered horizontally
  const drawTriPartText = (ctx, y, part1, part2, part3, font, navyCol, redCol, isAgent = false) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = "alphabetic";
    const w1 = ctx.measureText(part1).width;
    const w2 = ctx.measureText(part2).width;
    const w3 = ctx.measureText(part3).width;
    const totalW = w1 + w2 + w3;
    let curX = HEAD_CX - totalW / 2;

    if (isAgent) {
      ctx.shadowColor = "rgba(4, 36, 77, 0.2)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
    }

    ctx.fillStyle = navyCol;
    ctx.fillText(part1, curX, y);
    curX += w1;

    ctx.fillStyle = redCol;
    ctx.fillText(part2, curX, y);
    curX += w2;

    ctx.fillStyle = navyCol;
    ctx.fillText(part3, curX, y);

    ctx.restore();
  };

  // Draws the AxxSpace brand lockup at the top
  const drawHeaderLogo = (ctx, logoImg) => {
    if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
      const logoW = 320;
      const logoH = 78;
      const logoX = HEAD_CX - logoW / 2;
      const logoY = 135;
      ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
    } else {
      // Vector fallback if image not yet loaded
      const logoX = HEAD_CX - 150;
      const logoY = 175;
      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.arc(logoX + 22, logoY - 14, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(logoX + 22, logoY - 26);
      ctx.lineTo(logoX + 11, logoY - 15);
      ctx.lineTo(logoX + 33, logoY - 15);
      ctx.closePath();
      ctx.fill();

      ctx.font = "900 38px 'Inter', system-ui, sans-serif";
      ctx.fillStyle = RED;
      ctx.fillText("AXX", logoX + 52, logoY);
      ctx.fillStyle = NAVY;
      ctx.fillText("SPACE", logoX + 130, logoY);

      ctx.font = "italic 500 13px 'Inter', system-ui, sans-serif";
      ctx.fillStyle = "#4B5563";
      ctx.fillText("Everything you need under one roof!", logoX + 54, logoY + 22);
    }
  };

  const drawCanvases = (qrCanvas) => {
    const dlQr  = downloadQrRef.current;
    const poster = posterCanvasRef.current;
    if (!dlQr || !poster) return;

    const agentName = agent?.name || agent?.username || "Agent";

    // ── Standalone QR download, in branded pin ──
    const qCtx = dlQr.getContext("2d");
    qCtx.setTransform(1, 0, 0, 1, 0, 0);
    qCtx.clearRect(0, 0, dlQr.width, dlQr.height);
    const qW = 260, qTail = 46, qX = (dlQr.width - qW) / 2, qY = 20;
    drawPinFrame(qCtx, qX, qY, qW, qTail, "#ffffff", RED, 5);
    qCtx.drawImage(qrCanvas, qX + 35, qY + 35, qW - 70, qW - 70);
    qCtx.textAlign = "center";
    qCtx.fillStyle = NAVY;
    qCtx.font = "900 22px 'Inter', system-ui, sans-serif";
    qCtx.fillText("AXXSPACE", dlQr.width / 2, 348);
    qCtx.fillStyle = RED;
    qCtx.font = "900 15px 'Inter', system-ui, sans-serif";
    qCtx.fillText("AGENT DETAILS", dlQr.width / 2, 372);
    qCtx.fillStyle = "#64748b";
    qCtx.font = "600 12px 'Inter', system-ui, sans-serif";
    qCtx.fillText("Scan to connect with agent", dlQr.width / 2, 396);

    // ── High-res poster (rendered at 2× for print) ──
    const logoImg = new Image();
    logoImg.onload = () => drawPosterCanvas(poster, qrCanvas, logoImg, agentName);
    logoImg.onerror = () => drawPosterCanvas(poster, qrCanvas, null, agentName);
    logoImg.src = logo;
    if (logoImg.complete) {
      drawPosterCanvas(poster, qrCanvas, logoImg, agentName);
    }
  };

  const drawPosterCanvas = (poster, qrCanvas, logoImg, agentName) => {
    const ctx = poster.getContext("2d");
    const cx = HEAD_CX;

    // Work in logical 800 × 1130 units, scaled up for the export
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, poster.width, poster.height);
    ctx.scale(poster.width / POSTER_W, poster.height / POSTER_H);
    ctx.textBaseline = "alphabetic";
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // 1. Fill entire pin with deep solid Navy (forms the bottom-right navy wedge)
    ctx.save();
    ctx.fillStyle = NAVY;
    traceFullPin(ctx);
    ctx.fill();
    ctx.restore();

    // 2. Fill the top white region
    ctx.save();
    ctx.fillStyle = "#ffffff";
    traceWhiteSection(ctx);
    ctx.fill();

    // 3. Thick Red brand border framing the white section & creating the diagonal divider
    ctx.strokeStyle = RED;
    ctx.lineWidth = 20;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    traceWhiteSection(ctx);
    ctx.stroke();
    ctx.restore();

    // 4. Header Logo: AxxSpace pin + title + slogan
    drawHeaderLogo(ctx, logoImg);

    // 5. HOUSEHUNTING with middle 'H' in Red
    drawTriPartText(
      ctx,
      270,
      "HOUSE",
      "H",
      "UNTING",
      "900 44px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      NAVY,
      RED,
      false
    );

    // 6. AGENT with middle 'E' in Red
    drawTriPartText(
      ctx,
      360,
      "AG",
      "E",
      "NT",
      "900 86px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      NAVY,
      RED,
      true
    );

    // 7. Call To Action: SCAN TO VIEW AGENT DETAILS
    ctx.save();
    ctx.font = "800 15px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = NAVY;
    ctx.textAlign = "center";
    ctx.fillText("SCAN TO VIEW AGENT DETAILS", cx, 400);
    ctx.restore();

    // 8. Large Clean QR Code
    const qrSize = 290;
    const qrX = cx - qrSize / 2;
    const qrY = 425;
    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

    // 9. Contact Us in Bottom Navy Section
    const contactCenterX = 430;
    ctx.save();
    ctx.font = "800 28px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("Contact Us", contactCenterX, 850);

    // 10. Contact rows with white icons
    ctx.font = "600 18px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const contacts = [
      { icon: drawEnvelopeIcon, text: "info@axxspace.com", y: 895 },
      { icon: drawWhatsAppIcon, text: "+254 745 689 773", y: 935 },
      { icon: drawGlobeIcon, text: "axxspace.com", y: 975 }
    ];

    contacts.forEach(({ icon, text, y }) => {
      const textW = ctx.measureText(text).width;
      const totalW = 32 + textW;
      const startX = contactCenterX - totalW / 2;
      icon(ctx, startX, y);
      ctx.textAlign = "left";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(text, startX + 32, y);
    });
    ctx.restore();

    // Feed the preview / print view the exact file that gets downloaded
    setPosterDataUrl(poster.toDataURL("image/png"));
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
            <h2 style={ms.title}>Agent QR Poster</h2>
            <p style={ms.subtitle}>{agent?.name || agent?.username || "Agent"}</p>
          </div>
          <button style={ms.closeBtn} onClick={onClose}>&times;</button>
        </div>

        {/* Body */}
        <div style={ms.body}>
          <p style={ms.helpText}>
            This poster links directly to your agent profile. Share it, print it, or stick it anywhere so clients can scan and find your listings instantly.
          </p>

          {/* Live preview — the exact PNG that gets downloaded */}
          <div style={ms.previewBox}>
            <h4 style={ms.previewHeader}>Live Poster Preview</h4>
            <div style={ms.previewFrame}>
              <div style={ms.previewScale}>
                <AgentPoster posterDataUrl={posterDataUrl} />
              </div>
            </div>
          </div>

          {/* Hidden canvases for export */}
          <div style={{ display: "none" }}>
            <canvas ref={qrCanvasRef}      width={620}  height={620} />
            <canvas ref={downloadQrRef}    width={350}  height={440} />
            <canvas ref={posterCanvasRef}  width={POSTER_W * 2} height={POSTER_H * 2} />
          </div>
        </div>

        {/* Footer actions */}
        <div style={ms.footer}>
          <button style={ms.cancelBtn} onClick={onClose}>Close</button>
          <div style={ms.actionBtns}>
            <button style={ms.dlBtn} onClick={downloadQR}    disabled={!qrLoaded}>Download QR Code (PNG)</button>
            <button style={ms.dlBtn} onClick={downloadPoster} disabled={!qrLoaded}>Download Poster (PNG)</button>
            <button style={ms.printBtn} onClick={() => window.print()} disabled={!qrLoaded}>Print (A4)</button>
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
    width: `${POSTER_W / 2}px`,
    height: `${POSTER_H / 2}px`,
    margin: "0 auto",
    overflow: "hidden",
    position: "relative",
    borderRadius: "12px",
    // Light wash so the pin cut-out reads as a shape, not a white block
    background: "linear-gradient(135deg,#f8fafc,#e8edf5)",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
  },
  previewScale: {
    width: `${POSTER_W}px`, height: `${POSTER_H}px`,
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
