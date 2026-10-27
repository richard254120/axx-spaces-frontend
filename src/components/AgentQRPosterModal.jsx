import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
// Original AxXspace logo. Served from /public so the poster, the live preview
// and the canvas export all use the same brand asset (and stay same-origin).
const logo = "/logo.png";

/* ══════════════════════════════════════════════════════════
   AgentQRPosterModal
   The downloadable poster is one PNG cut in the AxXspace pin
   silhouette: every word of the sheet sits inside the logo
   shape, wrapped by a thick red brand border.
   The canvas is the single source of truth — the live preview
   renders the very same PNG that gets downloaded.
══════════════════════════════════════════════════════════ */

const POSTER_W = 800;
const POSTER_H = 1130;

const NAVY = "#081A34";
const RED  = "#d9383a";

/* ── Poster shell = the AxXspace pin ─────────────────────────
   Round head + long tapered tail that comes to a point.
─────────────────────────────────────────────────────────────── */
const HEAD_CX = POSTER_W / 2;   // 400
const HEAD_CY = 430;
const HEAD_R  = 370;
const TIP_Y   = 1105;

const tracePosterShell = (ctx) => {
  ctx.beginPath();
  ctx.moveTo(HEAD_CX, TIP_Y);
  ctx.bezierCurveTo(340, 1030, HEAD_CX - HEAD_R, 900, HEAD_CX - HEAD_R, HEAD_CY);
  ctx.arc(HEAD_CX, HEAD_CY, HEAD_R, Math.PI, 0, false);
  ctx.bezierCurveTo(HEAD_CX + HEAD_R, 900, 460, 1030, HEAD_CX, TIP_Y);
  ctx.closePath();
};

/* ── Pin-shaped QR frame nested inside the sheet ─────────────
   Same silhouette, one size down, so the code reads as a chip
   of the AxXspace mark.
─────────────────────────────────────────────────────────────── */
const PIN_W        = 280;                      // frame width = head diameter
const PIN_TAIL     = 50;                       // pointed tail below the head
const PIN_QR       = 190;                      // QR side (fits inside the head)
const PIN_QR_INNER = (PIN_W - PIN_QR) / 2;     // QR inset from the frame edge
const QR_Y         = 466;

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

  // Pin silhouette used for the QR frame (identical to the sheet outline)
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

  // Trims a string so it never spills out of its chip
  const fitText = (ctx, text, maxW) => {
    if (ctx.measureText(text).width <= maxW) return text;
    let t = text;
    while (t.length > 1 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
    return t + "…";
  };

  // Draws icon + label pairs in one auto-centred row
  const drawIconRow = (ctx, rowY, items, gap) => {
    let total = 0;
    items.forEach((it, i) => {
      ctx.font = it.font;
      it._w = ctx.measureText(it.text).width;
      total += (it.iconW || 0) + it._w + (i < items.length - 1 ? gap : 0);
    });
    let x = HEAD_CX - total / 2;
    items.forEach((it) => {
      if (it.icon) it.icon(x, rowY);
      x += it.iconW || 0;
      ctx.font = it.font;
      ctx.fillStyle = it.color;
      ctx.textAlign = "left";
      ctx.fillText(it.text, x, rowY);
      x += it._w + gap;
    });
  };

  const drawCanvases = (qrCanvas) => {
    const dlQr  = downloadQrRef.current;
    const poster = posterCanvasRef.current;
    if (!dlQr || !poster) return;

    const agentName = agent?.name || agent?.username || "Agent";

    // ── Standalone QR download, also cut in the pin ──
    const qCtx = dlQr.getContext("2d");
    qCtx.setTransform(1, 0, 0, 1, 0, 0);
    qCtx.clearRect(0, 0, dlQr.width, dlQr.height);
    const qW = 260, qTail = 46, qX = (dlQr.width - qW) / 2, qY = 24;
    drawPinFrame(qCtx, qX, qY, qW, qTail, "#ffffff", RED, 5);
    qCtx.drawImage(qrCanvas, qX + 35, qY + 35, qW - 70, qW - 70);
    qCtx.textAlign = "center";
    qCtx.fillStyle = NAVY;
    qCtx.font = "900 24px 'Inter', system-ui, sans-serif";
    qCtx.fillText("AXXSPACE", dlQr.width / 2, 360);
    qCtx.fillStyle = "#64748b";
    qCtx.font = "600 12px 'Inter', system-ui, sans-serif";
    qCtx.fillText("Scan to view availability and profile", dlQr.width / 2, 386);

    // ── High-res poster (rendered at 2× for print) ──
    const logoImg = new Image();
    logoImg.onload = () => drawPosterCanvas(poster, qrCanvas, logoImg, agentName);
    logoImg.src = logo;
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

    /* ── 1. The pin-shaped sheet ─────────────────────────── */
    ctx.save();
    ctx.shadowColor = "rgba(8,26,52,0.30)";
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 6;
    const shellFill = ctx.createLinearGradient(0, 40, 0, TIP_Y);
    shellFill.addColorStop(0, "#ffffff");
    shellFill.addColorStop(0.6, "#ffffff");
    shellFill.addColorStop(1, "#f4f7fc");
    ctx.fillStyle = shellFill;
    tracePosterShell(ctx);
    ctx.fill();
    ctx.restore();

    // Nothing may escape the silhouette from here on.
    ctx.save();
    tracePosterShell(ctx);
    ctx.clip();

    // Soft red edge sitting just inside the thick border
    ctx.strokeStyle = "rgba(217,56,58,0.10)";
    ctx.lineWidth = 24;
    tracePosterShell(ctx);
    ctx.stroke();

    /* ── 2. Faint brand watermark ────────────────────────── */
    ctx.strokeStyle = "#f2f6fb";
    ctx.lineWidth = 26;
    for (let i = 0; i < 4; i++) {
      const y0 = 130 + i * 290;
      ctx.beginPath();
      ctx.moveTo(-160, y0);
      ctx.bezierCurveTo(200, y0 - 130, 600, y0 + 150, 960, y0 - 30);
      ctx.stroke();
    }

    /* ── 3. Brand lock-up ────────────────────────────────── */
    ctx.drawImage(logoImg, cx - 48, 72, 96, 96);

    ctx.textAlign = "left";
    ctx.font = "900 44px 'Inter', system-ui, sans-serif";
    const t1 = "AXX", t2 = "SPACE";
    const gap = 12;
    const w1 = ctx.measureText(t1).width + gap;
    const w2 = ctx.measureText(t2).width;
    const brandX = cx - (w1 + w2) / 2;
    ctx.fillStyle = RED;
    ctx.fillText(t1, brandX, 216);
    ctx.fillStyle = NAVY;
    ctx.fillText(t2, brandX + w1, 216);

    ctx.textAlign = "center";
    ctx.font = "500 15px 'Inter', system-ui, sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("Space hunting bila stress", cx, 242);

    ctx.fillStyle = RED;
    drawRoundRect(ctx, cx - 280, 258, 560, 5, 2.5, true, false);

    /* ── 4. Headline + verified stamp ───────────────────── */
    ctx.font = "900 42px 'Inter', system-ui, sans-serif";
    ctx.fillStyle = NAVY;
    ctx.fillText("VERIFIED", cx, 318);

    ctx.font = "900 76px 'Inter', system-ui, sans-serif";
    ctx.fillStyle = RED;
    ctx.fillText("AGENT", cx, 392);

    // Rosette stamp with a briefcase mark
    const bx2 = 618, by2 = 344, br = 44;
    drawScallop(ctx, bx2, by2, br, 18, 4, NAVY, RED, 3);
    drawRoundRect(ctx, bx2 - 14, by2 - 8, 28, 18, 4, false, true, "#ffffff", 2.5);
    ctx.beginPath();
    ctx.moveTo(bx2 - 7, by2 - 8);
    ctx.lineTo(bx2 - 7, by2 - 15);
    ctx.quadraticCurveTo(bx2 - 7, by2 - 20, bx2, by2 - 20);
    ctx.quadraticCurveTo(bx2 + 7, by2 - 20, bx2 + 7, by2 - 15);
    ctx.lineTo(bx2 + 7, by2 - 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx2 - 14, by2 - 1);
    ctx.lineTo(bx2 + 14, by2 - 1);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = "bold 8px 'Inter', sans-serif";
    ctx.fillText("Listed On", bx2, by2 + 16);
    ctx.font = "900 9.5px 'Inter', sans-serif";
    ctx.fillText("AXXSPACE", bx2, by2 + 27);

    /* ── 5. Call to action ───────────────────────────────── */
    ctx.fillStyle = "#f0f4ff";
    drawRoundRect(ctx, cx - 280, 414, 560, 40, 20, true, false);

    ctx.textAlign = "center";
    ctx.fillStyle = NAVY;
    ctx.font = "900 15px 'Inter', system-ui, sans-serif";
    ctx.fillText("SCAN TO VIEW AVAILABILITY AND AGENTS PROFILE", cx, 440);

    /* ── 6. QR inside its own pin ────────────────────────── */
    const qbX = cx - PIN_W / 2;

    const halo = ctx.createRadialGradient(cx, 620, 40, cx, 620, 330);
    halo.addColorStop(0, "rgba(217,56,58,0.13)");
    halo.addColorStop(1, "rgba(217,56,58,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 300, POSTER_W, 660);

    ctx.save();
    ctx.shadowColor = "rgba(8,26,52,0.22)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 5;
    drawPinFrame(ctx, qbX, QR_Y, PIN_W, PIN_TAIL, "#ffffff", null, 0);
    ctx.restore();

    ctx.drawImage(qrCanvas, qbX + PIN_QR_INNER, QR_Y + PIN_QR_INNER, PIN_QR, PIN_QR);
    drawPinFrame(ctx, qbX, QR_Y, PIN_W, PIN_TAIL, null, RED, 5);

    /* ── 7. Agent name chip ──────────────────────────────── */
    ctx.fillStyle = NAVY;
    drawRoundRect(ctx, cx - 210, 806, 420, 42, 21, true, false);

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 15px 'Inter', system-ui, sans-serif";
    ctx.fillText(fitText(ctx, agentName.toUpperCase(), 370), cx, 833);

    /* ── 8. Contact rows ─────────────────────────────────── */
    const iconStroke = "#081A34";

    const envelope = (x, rowY) => {
      const top = rowY - 12;
      drawRoundRect(ctx, x, top, 16, 12, 2, false, true, iconStroke, 1.6);
      ctx.beginPath();
      ctx.moveTo(x + 1, top + 2);
      ctx.lineTo(x + 8, top + 7);
      ctx.lineTo(x + 15, top + 2);
      ctx.stroke();
    };
    const whatsapp = (x, rowY) => {
      const gx = x + 8, gy = rowY - 6;
      ctx.strokeStyle = iconStroke;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(gx, gy, 7, 0.15 * Math.PI, 1.85 * Math.PI);
      ctx.lineTo(gx - 7, gy + 7);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(gx, gy, 3.2, 0.75 * Math.PI, 1.35 * Math.PI);
      ctx.stroke();
    };
    const instagram = (x, rowY) => {
      const top = rowY - 13;
      drawRoundRect(ctx, x, top, 14, 14, 4, false, true, iconStroke, 1.6);
      ctx.beginPath();
      ctx.arc(x + 7, top + 7, 3.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = iconStroke;
      ctx.beginPath();
      ctx.arc(x + 10.6, top + 3.4, 0.9, 0, Math.PI * 2);
      ctx.fill();
    };
    const xMark = (x, rowY) => {
      const top = rowY - 12;
      ctx.strokeStyle = iconStroke;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(x, top); ctx.lineTo(x + 11, top + 11);
      ctx.moveTo(x + 11, top); ctx.lineTo(x, top + 11);
      ctx.stroke();
    };

    drawIconRow(ctx, 884, [
      { icon: envelope, iconW: 22, text: "info@axxspace.com", font: "800 13px 'Inter', system-ui, sans-serif", color: NAVY },
      { icon: whatsapp, iconW: 22, text: "+254 745 689 773", font: "800 13px 'Inter', system-ui, sans-serif", color: NAVY },
    ], 34);

    drawIconRow(ctx, 910, [
      {
        icon: (x, rowY) => { instagram(x, rowY); xMark(x + 20, rowY); },
        iconW: 38,
        text: "axx.space",
        font: "800 13px 'Inter', system-ui, sans-serif",
        color: NAVY,
      },
    ], 0);

    /* ── 9. Website pill ─────────────────────────────────── */
    ctx.textAlign = "center";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "900 11px 'Inter', system-ui, sans-serif";
    ctx.fillText("OR VISIT", cx, 938);

    const pillW = 250, pillH = 36;
    const pillX = cx - pillW / 2, pillY = 946;
    ctx.fillStyle = "#ffffff";
    drawRoundRect(ctx, pillX, pillY, pillW, pillH, 18, true, true, NAVY, 2);

    ctx.font = "900 14px 'Inter', system-ui, sans-serif";
    const urlText = "www.axxspace.com";
    const urlW = ctx.measureText(urlText).width;
    const gx = pillX + (pillW - (16 + 9 + urlW)) / 2 + 8;
    const gy = pillY + pillH / 2;
    ctx.fillStyle = NAVY;
    ctx.beginPath(); ctx.arc(gx, gy, 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(gx, gy, 7, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(gx - 7, gy); ctx.lineTo(gx + 7, gy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(gx, gy - 7); ctx.lineTo(gx, gy + 7); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(gx, gy, 3.2, 7, 0, 0, Math.PI * 2); ctx.stroke();

    ctx.fillStyle = NAVY;
    ctx.textAlign = "left";
    ctx.fillText(urlText, gx + 17, gy + 5);

    /* ── 10. Tip accent ──────────────────────────────────── */
    ctx.fillStyle = RED;
    drawRoundRect(ctx, cx - 35, 1034, 70, 4, 2, true, false);

    ctx.restore(); // end pin clip

    /* ── 11. Thick red brand border ──────────────────────── */
    ctx.strokeStyle = RED;
    ctx.lineWidth = 14;
    tracePosterShell(ctx);
    ctx.stroke();

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
