import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
// Original AxXspace logo. Served from /public so the poster, the live preview
// and the canvas export all use the same brand asset (and stay same-origin).
const logo = "/logo.png";

const SOURCES = [
  { value: "generic", label: "General / Digital Link" },
  { value: "gate", label: "Gate Poster" },
  { value: "building_outside", label: "Building Exterior" },
  { value: "noticeboard", label: "Noticeboard" },
  { value: "shop_nearby", label: "Local Shop/Kiosk" },
  { value: "office", label: "Landlord Office" },
  { value: "vacancy_sign", label: "Vacancy Signboard" }
];

/* ══════════════════════════════════════════════════════════
   Vacancy poster
   The downloadable poster is one PNG cut in the AxXspace pin
   silhouette: every word of the sheet sits inside the logo
   shape, wrapped by a thick red brand border.
   The canvas is the single source of truth — the live preview
   and the print view render that very same PNG.
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

/* ── Pin-shaped QR frame nested inside the sheet ──────────── */
const PIN_W        = 250;                      // frame width = head diameter
const PIN_TAIL     = 46;                       // pointed tail below the head
const PIN_QR       = 170;                      // QR side (fits inside the head)
const PIN_QR_INNER = (PIN_W - PIN_QR) / 2;     // QR inset from the frame edge
const QR_Y         = 522;

// Poster render, shared by the preview, the print view and the download.
function VacancyPoster({ posterDataUrl }) {
  if (!posterDataUrl) {
    return (
      <div className="axx-vacancy-poster" style={posterStyles.previewEmpty}>
        Generating poster…
      </div>
    );
  }
  return (
    <img
      src={posterDataUrl}
      alt="Vacancy poster"
      className="axx-vacancy-poster"
      style={posterStyles.previewImg}
    />
  );
}

export default function QRGeneratorModal({ isOpen, onClose, property }) {
  const [source, setSource] = useState("generic");
  const [qrLoaded, setQrLoaded] = useState(false);
  const [posterDataUrl, setPosterDataUrl] = useState("");
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
    let mainOrigin = window.location.origin;
    if (mainOrigin.includes("5174")) {
      mainOrigin = mainOrigin.replace("5174", "5173");
    } else if (mainOrigin.includes("admin.axxspace.com")) {
      mainOrigin = mainOrigin.replace("admin.axxspace.com", "axxspace.com");
    } else if (mainOrigin.includes("admin.")) {
      mainOrigin = mainOrigin.replace("admin.", "");
    }
    return `${mainOrigin}/listings/${property._id}?ref=qr&source=${source}`;
  };

  const generateQR = () => {
    const qrCanvas = qrCanvasRef.current;
    if (!qrCanvas) return;

    const url = getQrUrl();

    QRCode.toCanvas(qrCanvas, url, {
      width: 620,
      margin: 1.5,
      errorCorrectionLevel: "H",
      color: {
        dark: NAVY,
        light: "#ffffff"
      }
    }, (error) => {
      if (error) {
        console.error("QR Code generation error:", error);
        return;
      }

      // Brand mark punched into the middle of the code
      const ctx = qrCanvas.getContext("2d");
      const brandImg = new Image();
      brandImg.onload = () => {
        const cardSize = 116;
        const x = (qrCanvas.width - cardSize) / 2;
        const y = (qrCanvas.height - cardSize) / 2;
        const radius = 12;

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
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

        ctx.strokeStyle = RED;
        ctx.lineWidth = 5;
        ctx.stroke();

        const logoSize = 78;
        const logoX = x + (cardSize - logoSize) / 2;
        const logoY = y + (cardSize - logoSize) / 2;
        ctx.drawImage(brandImg, logoX, logoY, logoSize, logoSize);

        setQrLoaded(true);
        drawDownloadableCanvases();
      };
      brandImg.src = logo;
    });
  };

  /* ── Canvas helpers ─────────────────────────────────────── */
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

  // Pin silhouette used for the QR frame
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

  // Shrinks a label until it fits its band
  const fitFontSize = (ctx, text, maxW, size, weight) => {
    const family = "'Inter', system-ui, sans-serif";
    ctx.font = `${weight} ${size}px ${family}`;
    const w = ctx.measureText(text).width;
    if (w > maxW) {
      size = Math.floor(size * (maxW / w) * 10) / 10;
      ctx.font = `${weight} ${size}px ${family}`;
    }
    return size;
  };

  const fitText = (ctx, text, maxW) => {
    if (ctx.measureText(text).width <= maxW) return text;
    let t = text;
    while (t.length > 1 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
    return t + "…";
  };

  const drawDownloadableCanvases = () => {
    const qrCanvas = qrCanvasRef.current;
    const dlQrCanvas = downloadQrCanvasRef.current;
    const posterCanvas = posterCanvasRef.current;
    if (!qrCanvas || !dlQrCanvas || !posterCanvas) return;

    // ── Standalone QR download, also cut in the pin ──
    const qCtx = dlQrCanvas.getContext("2d");
    qCtx.setTransform(1, 0, 0, 1, 0, 0);
    qCtx.clearRect(0, 0, dlQrCanvas.width, dlQrCanvas.height);
    const qW = 260, qTail = 46;
    const qX = (dlQrCanvas.width - qW) / 2, qY = 24;
    drawPinFrame(qCtx, qX, qY, qW, qTail, "#ffffff", RED, 5);
    qCtx.drawImage(qrCanvas, qX + 35, qY + 35, qW - 70, qW - 70);
    qCtx.textAlign = "center";
    qCtx.fillStyle = NAVY;
    qCtx.font = "900 24px 'Inter', system-ui, sans-serif";
    qCtx.fillText("AXXSPACE", dlQrCanvas.width / 2, 360);
    qCtx.fillStyle = "#64748b";
    qCtx.font = "600 12px 'Inter', system-ui, sans-serif";
    qCtx.fillText("Scan to view availability and property details", dlQrCanvas.width / 2, 386);

    // ── High-res poster (rendered at 2× for print) ──
    const logoImg = new Image();
    logoImg.onload = () => drawPosterCanvas(posterCanvas, qrCanvas, logoImg);
    logoImg.src = logo;
  };

  const drawPosterCanvas = (poster, qrCanvas, logoImg) => {
    const ctx = poster.getContext("2d");
    const cx = HEAD_CX;

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
    ctx.drawImage(logoImg, cx - 44, 72, 88, 88);

    ctx.textAlign = "left";
    ctx.font = "900 38px 'Inter', system-ui, sans-serif";
    const t1 = "AXX", t2 = "SPACE";
    const gap = 11;
    const w1 = ctx.measureText(t1).width + gap;
    const w2 = ctx.measureText(t2).width;
    const brandX = cx - (w1 + w2) / 2;
    ctx.fillStyle = RED;
    ctx.fillText(t1, brandX, 206);
    ctx.fillStyle = NAVY;
    ctx.fillText(t2, brandX + w1, 206);

    ctx.textAlign = "center";
    ctx.font = "500 14px 'Inter', system-ui, sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("Space hunting bila stress", cx, 230);

    ctx.fillStyle = RED;
    drawRoundRect(ctx, cx - 280, 246, 560, 5, 2.5, true, false);

    /* ── 4. Headline ─────────────────────────────────────── */
    ctx.font = "900 40px 'Inter', system-ui, sans-serif";
    ctx.fillStyle = NAVY;
    ctx.fillText("ROOM/HOUSE", cx, 316);

    ctx.font = "900 68px 'Inter', system-ui, sans-serif";
    ctx.fillStyle = RED;
    ctx.fillText("AVAILABLE", cx, 386);

    /* ── 5. Property band (clipped to the pin edges) ─────── */
    const title = property?.title || "Vacancy";
    const location = property?.location || "";
    const price = property?.price
      ? `KSh ${Number(property.price).toLocaleString()} / month`
      : "";
    const meta = [location, price].filter(Boolean).join("   ·   ");

    ctx.fillStyle = "#f5f8fc";
    ctx.fillRect(0, 402, POSTER_W, 60);
    ctx.fillStyle = "#e6ecf5";
    ctx.fillRect(0, 402, POSTER_W, 1.5);
    ctx.fillRect(0, 460.5, POSTER_W, 1.5);

    ctx.textAlign = "center";
    ctx.fillStyle = NAVY;
    ctx.font = "900 17px 'Inter', system-ui, sans-serif";
    ctx.fillText(fitText(ctx, title, 540), cx, 428);

    if (meta) {
      ctx.fillStyle = "#64748b";
      ctx.font = "700 12.5px 'Inter', system-ui, sans-serif";
      ctx.fillText(fitText(ctx, meta, 520), cx, 450);
    }

    /* ── 6. Call to action ───────────────────────────────── */
    const cta = "SCAN TO VIEW AVAILABILITY AND PROPERTY DETAILS/CONTACTS";
    ctx.fillStyle = "#f0f4ff";
    drawRoundRect(ctx, cx - 300, 474, 600, 36, 18, true, false);

    fitFontSize(ctx, cta, 556, 13.5, "900");
    ctx.textAlign = "center";
    ctx.fillStyle = NAVY;
    ctx.fillText(cta, cx, 498);

    /* ── 7. QR inside its own pin ────────────────────────── */
    const qbX = cx - PIN_W / 2;

    const halo = ctx.createRadialGradient(cx, 660, 40, cx, 660, 330);
    halo.addColorStop(0, "rgba(217,56,58,0.13)");
    halo.addColorStop(1, "rgba(217,56,58,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 330, POSTER_W, 680);

    ctx.save();
    ctx.shadowColor = "rgba(8,26,52,0.22)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 5;
    drawPinFrame(ctx, qbX, QR_Y, PIN_W, PIN_TAIL, "#ffffff", null, 0);
    ctx.restore();

    ctx.drawImage(qrCanvas, qbX + PIN_QR_INNER, QR_Y + PIN_QR_INNER, PIN_QR, PIN_QR);
    drawPinFrame(ctx, qbX, QR_Y, PIN_W, PIN_TAIL, null, RED, 5);

    /* ── 8. Listing chip ─────────────────────────────────── */
    ctx.fillStyle = NAVY;
    drawRoundRect(ctx, cx - 190, 828, 380, 38, 19, true, false);

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 13px 'Inter', system-ui, sans-serif";
    ctx.fillText("LISTED ON AXXSPACE", cx, 852);

    /* ── 9. Contact rows ─────────────────────────────────── */
    const iconStroke = NAVY;

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

    const drawIconRow = (rowY, items, gap) => {
      let total = 0;
      items.forEach((it, i) => {
        ctx.font = it.font;
        it._w = ctx.measureText(it.text).width;
        total += (it.iconW || 0) + it._w + (i < items.length - 1 ? gap : 0);
      });
      let x = cx - total / 2;
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

    const contactFont = "800 13px 'Inter', system-ui, sans-serif";
    drawIconRow(894, [
      { icon: envelope, iconW: 22, text: "info@axxspace.com", font: contactFont, color: NAVY },
      { icon: whatsapp, iconW: 22, text: "+254 745 689 773", font: contactFont, color: NAVY },
    ], 34);

    drawIconRow(918, [
      {
        icon: (x, rowY) => { instagram(x, rowY); xMark(x + 20, rowY); },
        iconW: 38,
        text: "axx.space",
        font: contactFont,
        color: NAVY,
      },
    ], 0);

    /* ── 10. Website pill ────────────────────────────────── */
    ctx.textAlign = "center";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "900 10.5px 'Inter', system-ui, sans-serif";
    ctx.fillText("OR VISIT", cx, 942);

    const pillW = 240, pillH = 34;
    const pillX = cx - pillW / 2, pillY = 950;
    ctx.fillStyle = "#ffffff";
    drawRoundRect(ctx, pillX, pillY, pillW, pillH, 17, true, true, NAVY, 2);

    ctx.font = "900 13px 'Inter', system-ui, sans-serif";
    const urlText = "www.axxspace.com";
    const urlW = ctx.measureText(urlText).width;
    const gx = pillX + (pillW - (14 + 8 + urlW)) / 2 + 7;
    const gy = pillY + pillH / 2;
    ctx.fillStyle = NAVY;
    ctx.beginPath(); ctx.arc(gx, gy, 6.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.arc(gx, gy, 6.5, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(gx - 6.5, gy); ctx.lineTo(gx + 6.5, gy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(gx, gy - 6.5); ctx.lineTo(gx, gy + 6.5); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(gx, gy, 3, 6.5, 0, 0, Math.PI * 2); ctx.stroke();

    ctx.fillStyle = NAVY;
    ctx.textAlign = "left";
    ctx.fillText(urlText, gx + 15, gy + 4.5);

    /* ── 11. Tip accent ──────────────────────────────────── */
    ctx.fillStyle = RED;
    drawRoundRect(ctx, cx - 35, 1028, 70, 4, 2, true, false);

    ctx.restore(); // end pin clip

    /* ── 12. Thick red brand border ──────────────────────── */
    ctx.strokeStyle = RED;
    ctx.lineWidth = 14;
    tracePosterShell(ctx);
    ctx.stroke();

    setPosterDataUrl(poster.toDataURL("image/png"));
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
            {/* Live preview — the exact PNG that gets downloaded */}
            <div style={styles.previewBox}>
              <h4 style={styles.previewHeader}>Live Poster Preview ({getSourceLabel(source)})</h4>
              <div style={styles.previewFrame}>
                <div style={styles.previewScale}>
                  <VacancyPoster posterDataUrl={posterDataUrl} />
                </div>
              </div>
            </div>

            {/* Hidden elements used for rendering exports */}
            <div style={{ display: "none" }}>
              <canvas ref={qrCanvasRef} width={620} height={620} />
              <canvas ref={downloadQrCanvasRef} width={350} height={440} />
              <canvas ref={posterCanvasRef} width={POSTER_W * 2} height={POSTER_H * 2} />
            </div>

            {/* Print Only: visible only in CSS print mode */}
            <div className="print-poster-only" style={{ display: "none" }}>
              <VacancyPoster posterDataUrl={posterDataUrl} />
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
  previewFrame: {
    width: `${POSTER_W / 2}px`,
    height: `${POSTER_H / 2}px`,
    overflow: "hidden",
    position: "relative",
    borderRadius: "12px",
    // Light wash so the pin cut-out reads as a shape, not a white block
    background: "linear-gradient(135deg,#f8fafc,#e8edf5)",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
  },
  previewScale: {
    width: `${POSTER_W}px`,
    height: `${POSTER_H}px`,
    transform: "scale(0.5)",
    transformOrigin: "top left",
    position: "absolute",
    left: 0,
    top: 0,
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

// Poster frame styles
const posterStyles = {
  previewImg: {
    width: `${POSTER_W}px`,
    height: `${POSTER_H}px`,
    display: "block",
  },
  previewEmpty: {
    width: `${POSTER_W}px`,
    height: `${POSTER_H}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#94a3b8",
    fontSize: "22px",
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
  },
};
