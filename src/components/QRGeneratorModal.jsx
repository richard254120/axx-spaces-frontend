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

export default function QRGeneratorModal({ isOpen, onClose, property }) {
  const [source, setSource] = useState("generic");
  const [qrLoaded, setQrLoaded] = useState(false);
  const qrCanvasRef = useRef(null);
  const downloadQrCanvasRef = useRef(null);
  const posterCanvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && property) {
      // Small timeout to ensure DOM has rendered canvas elements
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
    return `${window.location.origin}/listings/${property._id}?ref=qr&source=${source}`;
  };

  const generateQR = () => {
    const qrCanvas = qrCanvasRef.current;
    if (!qrCanvas) return;

    const url = getQrUrl();

    // 1. Generate the base QR code on the visible preview canvas (300x300)
    QRCode.toCanvas(qrCanvas, url, {
      width: 300,
      margin: 1.5,
      errorCorrectionLevel: "H",
      color: {
        dark: "#0f172a", // Slate-900
        light: "#ffffff"
      }
    }, (error) => {
      if (error) {
        console.error("QR Code generation error:", error);
        return;
      }

      // Draw the Axxspace logo in the center of the QR code
      const ctx = qrCanvas.getContext("2d");
      const logoImg = new Image();
      logoImg.src = logo;
      logoImg.onload = () => {
        const logoSize = 60;
        const x = (qrCanvas.width - logoSize) / 2;
        const y = (qrCanvas.height - logoSize) / 2;

        // White background card under logo
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x - 4, y - 4, logoSize + 8, logoSize + 8);
        // Draw the image
        ctx.drawImage(logoImg, x, y, logoSize, logoSize);

        // Generate other canvases once the base is loaded
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

    // ── Draw Downloadable QR Code Canvas (350x450) ──
    // Clear and background
    qrCtx.fillStyle = "#ffffff";
    qrCtx.fillRect(0, 0, dlQrCanvas.width, dlQrCanvas.height);
    // Draw QR
    qrCtx.drawImage(qrCanvas, 25, 20);
    // Draw "Axxspace" Text
    qrCtx.font = "bold 26px 'Inter', system-ui, sans-serif";
    qrCtx.fillStyle = "#3b82f6"; // Axxspace blue
    qrCtx.textAlign = "center";
    qrCtx.fillText("Axxspace", 175, 365);
    // Draw Subtext
    qrCtx.font = "600 13px 'Inter', system-ui, sans-serif";
    qrCtx.fillStyle = "#64748b";
    qrCtx.fillText("Scan to view property details", 175, 395);

    // ── Draw High-Res Poster Canvas (800x1130 - A4 Ratio) ──
    // Clear & fill background
    posterCtx.fillStyle = "#ffffff";
    posterCtx.fillRect(0, 0, posterCanvas.width, posterCanvas.height);

    // Outer double border
    posterCtx.strokeStyle = "#0f172a"; // Navy
    posterCtx.lineWidth = 10;
    posterCtx.strokeRect(20, 20, posterCanvas.width - 40, posterCanvas.height - 40);
    posterCtx.lineWidth = 2;
    posterCtx.strokeRect(36, 36, posterCanvas.width - 72, posterCanvas.height - 72);

    // Top Header
    posterCtx.fillStyle = "#0f172a";
    posterCtx.textAlign = "center";
    posterCtx.font = "800 48px 'Inter', system-ui, sans-serif";
    posterCtx.fillText("ROOM / HOUSE AVAILABLE", posterCanvas.width / 2, 120);

    // Property Title & Location
    posterCtx.font = "700 24px 'Inter', system-ui, sans-serif";
    posterCtx.fillStyle = "#2563eb"; // Accent blue
    const maxTitleLen = 45;
    const titleText = property.title.length > maxTitleLen ? property.title.substring(0, maxTitleLen) + "..." : property.title;
    posterCtx.fillText(titleText, posterCanvas.width / 2, 175);
    
    posterCtx.font = "600 18px 'Inter', system-ui, sans-serif";
    posterCtx.fillStyle = "#64748b"; // Location subtext
    posterCtx.fillText(`📍 ${property.location}, ${property.county}`, posterCanvas.width / 2, 215);

    // Price & Lease Info
    posterCtx.font = "800 28px 'Inter', system-ui, sans-serif";
    posterCtx.fillStyle = "#0f172a";
    posterCtx.fillText(`KES ${Number(property.price).toLocaleString()} / Month`, posterCanvas.width / 2, 270);

    // Call-to-action
    posterCtx.font = "700 24px 'Inter', system-ui, sans-serif";
    posterCtx.fillStyle = "#1e293b";
    posterCtx.fillText("Scan to view details & contact", posterCanvas.width / 2, 345);

    // Draw the QR Code scaled (420x420)
    const qrTargetSize = 420;
    const qrX = (posterCanvas.width - qrTargetSize) / 2;
    const qrY = 400;
    posterCtx.drawImage(qrCanvas, qrX, qrY, qrTargetSize, qrTargetSize);

    // Brand Footer
    const logoImg = new Image();
    logoImg.src = logo;
    logoImg.onload = () => {
      // Draw Logo
      const logoW = 75;
      const logoH = 75;
      const logoX = (posterCanvas.width - logoW) / 2;
      const logoY = 880;
      posterCtx.drawImage(logoImg, logoX, logoY, logoW, logoH);

      // Logo Name
      posterCtx.font = "800 42px 'Inter', system-ui, sans-serif";
      posterCtx.fillStyle = "#0f172a";
      posterCtx.fillText("Axxspace", posterCanvas.width / 2, 1000);

      // Slogan
      posterCtx.font = "italic 700 22px 'Inter', system-ui, sans-serif";
      posterCtx.fillStyle = "#d97706"; // Amber-600
      posterCtx.fillText("Space hunting bila stress.", posterCanvas.width / 2, 1045);
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
    // We trigger window.print(). The stylesheet handles displaying the print-only view.
    window.print();
  };

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>🖨️ Poster & QR Generator</h2>
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
              <div style={styles.posterHtmlPreview}>
                <div style={styles.posterHtmlBorder}>
                  <div style={styles.posterHtmlContent}>
                    <div style={styles.posterTitle}>ROOM / HOUSE AVAILABLE</div>
                    <div style={styles.posterPropName}>{property.title}</div>
                    <div style={styles.posterLoc}>📍 {property.location}, {property.county}</div>
                    <div style={styles.posterPrice}>KES {Number(property.price).toLocaleString()} / mo</div>
                    
                    <div style={styles.posterScanCta}>Scan to view details & contact</div>
                    
                    {/* Centered QR Canvas */}
                    <div style={styles.qrContainer}>
                      <canvas ref={qrCanvasRef} width={300} height={300} style={styles.previewQrCanvas} />
                    </div>

                    <div style={styles.brandRow}>
                      <img src={logo} alt="Axxspace Logo" style={styles.brandLogo} />
                      <div style={styles.brandName}>Axxspace</div>
                    </div>
                    <div style={styles.brandSlogan}>Space hunting bila stress.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Downloader templates (Hidden from UI but used for rendering exports) */}
            <div style={{ display: "none" }}>
              <canvas ref={downloadQrCanvasRef} width={350} height={450} />
              <canvas ref={posterCanvasRef} width={800} height={1130} />
            </div>

            {/* Print Only Representation: This is visible only in CSS print mode */}
            <div className="print-poster-only" style={{ display: "none" }}>
              <div style={printStyles.printBorderOuter}>
                <div style={printStyles.printBorderInner}>
                  <div style={printStyles.printHeader}>ROOM / HOUSE AVAILABLE</div>
                  <div style={printStyles.printPropName}>{property.title}</div>
                  <div style={printStyles.printLoc}>📍 {property.location}, {property.county}</div>
                  <div style={printStyles.printPrice}>KES {Number(property.price).toLocaleString()} / Month</div>
                  
                  <div style={printStyles.printScanCta}>Scan to view details & contact</div>
                  
                  <div style={printStyles.printQrContainer}>
                    {/* We clone the visible QR canvas to the print container using ref/DOM during print or let the print engine read the base64 */}
                    <img 
                      src={qrCanvasRef.current ? qrCanvasRef.current.toDataURL("image/png") : ""} 
                      alt="Property QR Code" 
                      style={printStyles.printQrImage} 
                    />
                  </div>

                  <div style={printStyles.printBrandContainer}>
                    <img src={logo} alt="Axxspace Logo" style={printStyles.printBrandLogo} />
                    <div style={printStyles.printBrandName}>Axxspace</div>
                  </div>
                  <div style={printStyles.printBrandSlogan}>Space hunting bila stress.</div>
                </div>
              </div>
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
              📥 Download QR (PNG)
            </button>
            <button 
              style={styles.downloadBtn} 
              onClick={downloadPoster}
              disabled={!qrLoaded}
            >
              📥 Download Poster (PNG)
            </button>
            <button 
              style={styles.printBtn} 
              onClick={printPoster}
              disabled={!qrLoaded}
            >
              🖨️ Print Poster (A4 PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    maxWidth: "850px",
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
  posterHtmlPreview: {
    width: "100%",
    aspectRatio: "1 / 1.414", // A4 aspect ratio
    backgroundColor: "#ffffff",
    color: "#0f172a",
    padding: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
    fontFamily: "system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  posterHtmlBorder: {
    border: "4px double #0f172a",
    height: "100%",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  posterHtmlContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100%",
    justifyContent: "space-between",
  },
  posterTitle: {
    fontSize: "18px",
    fontWeight: 900,
    color: "#0f172a",
    textAlign: "center",
    marginTop: "4px",
  },
  posterPropName: {
    fontSize: "12px",
    fontWeight: 800,
    color: "#2563eb",
    textAlign: "center",
    marginTop: "2px",
  },
  posterLoc: {
    fontSize: "9px",
    color: "#64748b",
    fontWeight: 600,
    textAlign: "center",
  },
  posterPrice: {
    fontSize: "12px",
    fontWeight: 800,
    color: "#0f172a",
    textAlign: "center",
    marginTop: "1px",
  },
  posterScanCta: {
    fontSize: "10px",
    fontWeight: 700,
    color: "#1e293b",
    textAlign: "center",
  },
  qrContainer: {
    width: "140px",
    height: "140px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "4px 0",
  },
  previewQrCanvas: {
    width: "100% !important",
    height: "100% !important",
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "2px",
  },
  brandLogo: {
    width: "24px",
    height: "24px",
    objectFit: "contain",
  },
  brandName: {
    fontSize: "14px",
    fontWeight: 900,
    color: "#0f172a",
  },
  brandSlogan: {
    fontSize: "9px",
    fontStyle: "italic",
    fontWeight: 700,
    color: "#d97706",
    textAlign: "center",
    marginBottom: "4px",
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
    "&:hover": { backgroundColor: "rgba(59, 130, 246, 0.25)" }
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
    "&:hover": { opacity: 0.9 }
  }
};

// Styles for the @media print layout (High res full scale layout)
const printStyles = {
  printBorderOuter: {
    border: "20px double #000000",
    height: "100%",
    padding: "30px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    boxSizing: "border-box",
  },
  printBorderInner: {
    border: "2px solid #000000",
    height: "100%",
    width: "100%",
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    boxSizing: "border-box",
  },
  printHeader: {
    fontSize: "44px",
    fontWeight: "900",
    color: "#000",
    textAlign: "center",
    fontFamily: "'Inter', sans-serif",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  printPropName: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
    fontFamily: "'Inter', sans-serif",
    marginTop: "20px",
  },
  printLoc: {
    fontSize: "20px",
    color: "#475569",
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "'Inter', sans-serif",
    marginTop: "10px",
  },
  printPrice: {
    fontSize: "28px",
    fontWeight: "900",
    color: "#000000",
    textAlign: "center",
    fontFamily: "'Inter', sans-serif",
    marginTop: "15px",
    borderBottom: "3px solid #000",
    paddingBottom: "10px",
    width: "80%",
  },
  printScanCta: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    fontFamily: "'Inter', sans-serif",
    marginTop: "30px",
  },
  printQrContainer: {
    width: "350px",
    height: "350px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "30px 0",
    border: "1px solid #e2e8f0",
    padding: "10px",
    backgroundColor: "#fff",
  },
  printQrImage: {
    width: "100%",
    height: "100%",
  },
  printBrandContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
    marginTop: "20px",
  },
  printBrandLogo: {
    width: "60px",
    height: "60px",
    objectFit: "contain",
  },
  printBrandName: {
    fontSize: "36px",
    fontWeight: "900",
    color: "#000",
    fontFamily: "'Inter', sans-serif",
  },
  printBrandSlogan: {
    fontSize: "20px",
    fontStyle: "italic",
    fontWeight: "700",
    color: "#000",
    fontFamily: "'Inter', sans-serif",
    textAlign: "center",
    marginTop: "10px",
    marginBottom: "20px",
  }
};
