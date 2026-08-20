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

// High-fidelity VacancyPoster Component
function VacancyPoster({ property, qrCodeDataUrl, sourceLabel }) {
  const propImg = (property.images && property.images.length > 0)
    ? property.images[0]
    : "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80";

  const displayId = property._id ? property._id.slice(-6).toUpperCase() : "AXXSPC";

  return (
    <div style={posterStyles.posterContainer} className="axx-vacancy-poster">
      {/* HEADER ROW */}
      <div style={posterStyles.headerRow}>
        {/* Left Logo */}
        <div style={posterStyles.headerLeft}>
          <div style={posterStyles.logoWrapper}>
            <img src={logo} alt="Axxspace Logo" style={posterStyles.logoImg} />
            <div style={posterStyles.logoTextContainer}>
              <span style={posterStyles.logoBrand}>AXXSPACE</span>
              <span style={posterStyles.logoTagline}>Space hunting bila stress.</span>
            </div>
          </div>
        </div>

        {/* Center Title */}
        <div style={posterStyles.headerCenter}>
          <div style={posterStyles.mainTitleRow1}>ROOM / HOUSE</div>
          <div style={posterStyles.mainTitleRow2}>AVAILABLE</div>
          <div style={posterStyles.scanIndicator}>
            <div style={posterStyles.indicatorLine}></div>
            <span style={posterStyles.indicatorText}>SCAN TO VIEW DETAILS & CONTACT</span>
            <div style={posterStyles.indicatorLine}></div>
          </div>
        </div>

        {/* Right Ribbon Badge */}
        <div style={posterStyles.headerRight}>
          <div style={posterStyles.ribbon}>
            <RibbonHouseIcon />
            <span style={posterStyles.ribbonListed}>LISTED ON</span>
            <span style={posterStyles.ribbonBrand}>AXXSPACE</span>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN SECTION */}
      <div style={posterStyles.mainSection}>
        {/* Left Side: 3 Features */}
        <div style={posterStyles.featuresCol}>
          {/* Feature 1 */}
          <div style={posterStyles.featureCard}>
            <div style={posterStyles.featureIconCircle}>
              <GenuineIcon />
            </div>
            <div style={posterStyles.featureTitle}>Genuine Listings</div>
            <div style={posterStyles.featureDesc}>Verified landlords & properties.</div>
          </div>
          <div style={posterStyles.featureDivider}></div>

          {/* Feature 2 */}
          <div style={posterStyles.featureCard}>
            <div style={posterStyles.featureIconCircle}>
              <SecureIcon />
            </div>
            <div style={posterStyles.featureTitle}>Safe & Secure</div>
            <div style={posterStyles.featureDesc}>Your security is our priority.</div>
          </div>
          <div style={posterStyles.featureDivider}></div>

          {/* Feature 3 */}
          <div style={posterStyles.featureCard}>
            <div style={posterStyles.featureIconCircle}>
              <ContactIcon />
            </div>
            <div style={posterStyles.featureTitle}>Easy Contact</div>
            <div style={posterStyles.featureDesc}>Connect directly with landlord.</div>
          </div>
        </div>

        {/* Center Side: QR Code in Gold Frame */}
        <div style={posterStyles.qrCol}>
          <div style={posterStyles.qrGoldFrame}>
            {qrCodeDataUrl ? (
              <img src={qrCodeDataUrl} alt="Property QR Code" style={posterStyles.qrCodeImg} />
            ) : (
              <div style={posterStyles.qrPlaceholder}>Generating QR...</div>
            )}
          </div>
        </div>

        {/* Right Side: Property Types list & Scan Circle */}
        <div style={posterStyles.typesCardCol}>
          <div style={posterStyles.typesCard}>
            {PROPERTY_TYPES_LIST.map((item) => {
              let isChecked = false;
              if (item === "Furnished") {
                isChecked = property.furnished === true || property.furnished === "true";
              } else {
                const pType = String(property.propertyType || "").toLowerCase().trim();
                const itemNorm = item.toLowerCase().trim();
                if (pType === itemNorm) {
                  isChecked = true;
                } else if (itemNorm === "4+ bedroom" && (pType.includes("4 bedroom") || pType.includes("4+ bedroom") || pType.includes("5 bedroom"))) {
                  isChecked = true;
                }
              }

              return (
                <div key={item} style={posterStyles.typeRow}>
                  <span style={posterStyles.typeLabel}>{item}</span>
                  <div style={isChecked ? posterStyles.checkCircleActive : posterStyles.checkCircle}>
                    {isChecked && (
                      <svg viewBox="0 0 24 24" width="7" height="7" fill="none" stroke="#081A34" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={posterStyles.scanBadgeCircleOverlapping}>
            <PhoneScanIcon />
            <span style={posterStyles.scanBadgeTitle}>SCAN NOW</span>
            <span style={posterStyles.scanBadgeDesc}>Find your next space today!</span>
          </div>
        </div>
      </div>

      {/* INFORMATION BANNER ROW */}
      <div style={posterStyles.infoBanner}>
        <div style={posterStyles.infoLeft}>
          <GlobeIcon />
          <span style={posterStyles.infoTextLabel}>Or visit:</span>
          <span style={posterStyles.infoTextValue}>www.axxspace.com</span>
        </div>
        <div style={posterStyles.infoDivider}></div>
        <div style={posterStyles.infoCenter}>
          <span style={posterStyles.infoTextLabel}>Email:</span>
          <span style={posterStyles.infoTextValue}>info@axxspace.com</span>
        </div>
        <div style={posterStyles.infoDivider}></div>
        <div style={posterStyles.infoRight}>
          <SearchIcon />
          <span style={posterStyles.infoTextLabel}>Search property ID:</span>
          <div style={posterStyles.infoIdBox}>{displayId}</div>
        </div>
      </div>

      {/* WHY CHOOSE AXXSPACE? */}
      <div style={posterStyles.whySection}>
        <div style={posterStyles.whyTitle}>WHY CHOOSE AXXSPACE?</div>
        <div style={posterStyles.whyGoldLine}></div>
        <div style={posterStyles.whyGrid}>
          {/* Benefit 1 */}
          <div style={posterStyles.whyCol}>
            <EyeIcon />
            <span style={posterStyles.whyColLabel}>More Visibility</span>
            <span style={posterStyles.whyColDesc}>Reach more potential tenants online & offline.</span>
            <div style={posterStyles.whyColDivider}></div>
          </div>
          {/* Benefit 2 */}
          <div style={posterStyles.whyCol}>
            <MobileIcon />
            <span style={posterStyles.whyColLabel}>Easy Access</span>
            <span style={posterStyles.whyColDesc}>Tenants can scan and view details instantly.</span>
            <div style={posterStyles.whyColDivider}></div>
          </div>
          {/* Benefit 3 */}
          <div style={posterStyles.whyCol}>
            <TrendIcon />
            <span style={posterStyles.whyColLabel}>Track Performance</span>
            <span style={posterStyles.whyColDesc}>Monitor views & enquiries in real-time.</span>
            <div style={posterStyles.whyColDivider}></div>
          </div>
          {/* Benefit 4 */}
          <div style={posterStyles.whyCol}>
            <UsersIcon />
            <span style={posterStyles.whyColLabel}>More Enquiries</span>
            <span style={posterStyles.whyColDesc}>Get more genuine leads and serious tenants.</span>
            <div style={posterStyles.whyColDivider}></div>
          </div>
          {/* Benefit 5 */}
          <div style={posterStyles.whyCol}>
            <ShieldCheckIcon />
            <span style={posterStyles.whyColLabel}>Trusted Platform</span>
            <span style={posterStyles.whyColDesc}>A professional system built for users.</span>
          </div>
        </div>
      </div>

      {/* FOOTER BARS */}
      <div style={posterStyles.footerContainer}>
        {/* Navy Bar */}
        <div style={posterStyles.navyFooter}>
          <div style={posterStyles.navyFooterLeft}>
            <img src={logo} alt="Axxspace Logo" style={posterStyles.navyLogo} />
            <span style={posterStyles.navyBrandName}>AXXSPACE</span>
            <span style={posterStyles.navyTagline}>Space hunting bila stress.</span>
          </div>
          <div style={posterStyles.navyFooterCenter}>
            List. Discover. Connect. &nbsp;|&nbsp; Kenya's smart rental marketplace.
          </div>
          <div style={posterStyles.navyFooterRight}>
            <FacebookIcon />
            <InstagramIcon />
            <XIcon />
            <TikTokIcon />
            <span style={posterStyles.socialHandle}>@axxspace</span>
          </div>
        </div>

        {/* Red Landlord Workflow Bar */}
        <div style={posterStyles.redFooter}>
          <div style={posterStyles.redFooterLeft}>TO LANDLORDS:</div>
          <div style={posterStyles.redFooterSteps}>
            <div style={posterStyles.stepItem}>
              <div style={posterStyles.stepCircle}>1</div>
              <div style={posterStyles.stepTextWrapper}>
                <span style={posterStyles.stepTitle}>List Property</span>
                <span style={posterStyles.stepDesc}>Add details on Axxspace.</span>
              </div>
            </div>
            <div style={posterStyles.stepArrow}>&gt;</div>

            <div style={posterStyles.stepItem}>
              <div style={posterStyles.stepCircle}>2</div>
              <div style={posterStyles.stepTextWrapper}>
                <span style={posterStyles.stepTitle}>Generate QR</span>
                <span style={posterStyles.stepDesc}>Get unique property QR.</span>
              </div>
            </div>
            <div style={posterStyles.stepArrow}>&gt;</div>

            <div style={posterStyles.stepItem}>
              <div style={posterStyles.stepCircle}>3</div>
              <div style={posterStyles.stepTextWrapper}>
                <span style={posterStyles.stepCircleIcon}><PrintIcon /></span>
                <div style={posterStyles.stepTextWrapperInner}>
                  <span style={posterStyles.stepTitle}>Print & Display</span>
                  <span style={posterStyles.stepDesc}>Display at your property.</span>
                </div>
              </div>
            </div>
            <div style={posterStyles.stepArrow}>&gt;</div>

            <div style={posterStyles.stepItem}>
              <div style={posterStyles.stepCircle}>4</div>
              <div style={posterStyles.stepTextWrapper}>
                <span style={posterStyles.stepTitle}>Get Tenants</span>
                <span style={posterStyles.stepDesc}>Attract more enquiries.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Thank You message */}
        <div style={posterStyles.thankYouText}>
          Thank you for choosing Axxspace. &nbsp;|&nbsp; Together, we make space hunting easy.
        </div>
      </div>
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
    return `${window.location.origin}/listings/${property._id}?ref=qr&source=${source}`;
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
        const cardSize = 90;
        const x = (qrCanvas.width - cardSize) / 2;
        const y = (qrCanvas.height - cardSize) / 2;

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        const radius = 8;
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

        const logoSize = 34;
        const logoX = x + (cardSize - logoSize) / 2;
        const logoY = y + 10;
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

        ctx.font = "bold 9px 'Inter', sans-serif";
        ctx.fillStyle = "#d9383a";
        ctx.textAlign = "center";
        ctx.fillText("AXXSPACE", x + cardSize / 2, y + 56);

        ctx.font = "500 5px 'Inter', sans-serif";
        ctx.fillStyle = "#475569";
        ctx.fillText("Space hunting bila stress.", x + cardSize / 2, y + 68);

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

      // Draw top-left logo image
      posterCtx.drawImage(logoImg, 40, 24, 48, 48);

      // Brand name
      posterCtx.fillStyle = "#081A34";
      posterCtx.font = "900 24px 'Inter', sans-serif";
      posterCtx.textAlign = "left";
      posterCtx.fillText("AXXSPACE", 98, 46);

      // Tagline
      posterCtx.fillStyle = "#64748b";
      posterCtx.font = "700 9px 'Inter', sans-serif";
      posterCtx.fillText("Space hunting bila stress.", 98, 59);

      // Draw listed on AXXSPACE ribbon (Top right)
      const ribX = 675;
      const ribY = 0;
      const ribW = 85;
      const ribH = 85;

      // Draw navy background
      posterCtx.fillStyle = "#081A34";
      posterCtx.beginPath();
      posterCtx.moveTo(ribX, ribY);
      posterCtx.lineTo(ribX + ribW, ribY);
      posterCtx.lineTo(ribX + ribW, ribY + ribH - 12);
      posterCtx.quadraticCurveTo(ribX + ribW, ribY + ribH, ribX + ribW - 12, ribY + ribH);
      posterCtx.lineTo(ribX + 12, ribY + ribH);
      posterCtx.quadraticCurveTo(ribX, ribY + ribH, ribX, ribY + ribH - 12);
      posterCtx.closePath();
      posterCtx.fill();

      // Gold border
      posterCtx.strokeStyle = "#C5A059";
      posterCtx.lineWidth = 2.5;
      posterCtx.beginPath();
      posterCtx.moveTo(ribX, ribY);
      posterCtx.lineTo(ribX, ribY + ribH - 12);
      posterCtx.quadraticCurveTo(ribX, ribY + ribH, ribX + 12, ribY + ribH);
      posterCtx.lineTo(ribX + ribW - 12, ribY + ribH);
      posterCtx.quadraticCurveTo(ribX + ribW, ribY + ribH, ribX + ribW, ribY + ribH - 12);
      posterCtx.lineTo(ribX + ribW, ribY);
      posterCtx.stroke();

      // Draw small gold house icon inside ribbon
      posterCtx.strokeStyle = "#C5A059";
      posterCtx.lineWidth = 1.5;
      const rx = ribX + ribW / 2;
      const ry = ribY + 28;
      posterCtx.beginPath();
      posterCtx.moveTo(rx - 7, ry + 5);
      posterCtx.lineTo(rx - 7, ry - 3);
      posterCtx.lineTo(rx, ry - 9);
      posterCtx.lineTo(rx + 7, ry - 3);
      posterCtx.lineTo(rx + 7, ry + 5);
      posterCtx.closePath();
      posterCtx.stroke();

      // Text inside ribbon
      posterCtx.fillStyle = "#94a3b8";
      posterCtx.font = "bold 8px 'Inter', sans-serif";
      posterCtx.textAlign = "center";
      posterCtx.fillText("LISTED ON", rx, ry + 18);

      posterCtx.fillStyle = "#ffffff";
      posterCtx.font = "900 9.5px 'Inter', sans-serif";
      posterCtx.fillText("AXXSPACE", rx, ry + 30);

      // Main Header Text
      posterCtx.fillStyle = "#081A34";
      posterCtx.textAlign = "center";
      posterCtx.font = "800 36px 'Inter', sans-serif";
      posterCtx.fillText("ROOM / HOUSE", posterCanvas.width / 2, 85);
      posterCtx.fillStyle = "#d9383a";
      posterCtx.font = "900 52px 'Inter', sans-serif";
      posterCtx.fillText("AVAILABLE", posterCanvas.width / 2, 135);

      posterCtx.fillStyle = "#C5A059";
      posterCtx.fillRect(40, 155, 720, 2);
      posterCtx.fillStyle = "#081A34";
      posterCtx.font = "800 12px 'Inter', sans-serif";
      posterCtx.fillText("SCAN TO VIEW DETAILS & CONTACT", posterCanvas.width / 2, 172);

      // Draw features (Left side)
      const featX = 40;
      const featYStart = 200;
      const featGap = 100;

      const FEATURES = [
        { title: "GENUINE LISTINGS", desc: "Verified landlords & properties." },
        { title: "SAFE & SECURE", desc: "Your security is our priority." },
        { title: "EASY CONTACT", desc: "Connect directly with landlord." }
      ];

      FEATURES.forEach((feat, index) => {
        const currY = featYStart + index * featGap;

        // Draw gold circle
        const circX = featX + 75;
        const circY = currY + 25;
        posterCtx.strokeStyle = "#C5A059";
        posterCtx.lineWidth = 2.5;
        posterCtx.beginPath();
        posterCtx.arc(circX, circY, 20, 0, Math.PI * 2);
        posterCtx.stroke();

        // Draw icon
        posterCtx.strokeStyle = "#C5A059";
        posterCtx.lineWidth = 2;
        if (index === 0) {
          // House
          posterCtx.beginPath();
          posterCtx.moveTo(circX - 7, circY + 5);
          posterCtx.lineTo(circX - 7, circY - 3);
          posterCtx.lineTo(circX, circY - 9);
          posterCtx.lineTo(circX + 7, circY - 3);
          posterCtx.lineTo(circX + 7, circY + 5);
          posterCtx.closePath();
          posterCtx.stroke();
        } else if (index === 1) {
          // Shield check
          posterCtx.beginPath();
          posterCtx.moveTo(circX - 6, circY - 6);
          posterCtx.lineTo(circX + 6, circY - 6);
          posterCtx.lineTo(circX + 6, circY);
          posterCtx.quadraticCurveTo(circX + 6, circY + 6, circX, circY + 9);
          posterCtx.quadraticCurveTo(circX - 6, circY + 6, circX - 6, circY);
          posterCtx.closePath();
          posterCtx.stroke();
        } else {
          // Headset
          posterCtx.beginPath();
          posterCtx.arc(circX, circY, 8, Math.PI, 0);
          posterCtx.stroke();
          posterCtx.fillStyle = "#C5A059";
          posterCtx.fillRect(circX - 10, circY, 3, 5);
          posterCtx.fillRect(circX + 7, circY, 3, 5);
        }

        // Text
        posterCtx.fillStyle = "#081A34";
        posterCtx.font = "bold 11px 'Inter', sans-serif";
        posterCtx.textAlign = "center";
        posterCtx.fillText(feat.title, circX, circY + 34);

        posterCtx.fillStyle = "#475569";
        posterCtx.font = "500 8.5px 'Inter', sans-serif";
        posterCtx.fillText(feat.desc, circX, circY + 46);

        if (index < 2) {
          posterCtx.strokeStyle = "#e2e8f0";
          posterCtx.lineWidth = 1;
          posterCtx.beginPath();
          posterCtx.moveTo(circX - 30, circY + 58);
          posterCtx.lineTo(circX + 30, circY + 58);
          posterCtx.stroke();
        }
      });

      // Center QR code frame
      posterCtx.fillStyle = "#ffffff";
      posterCtx.strokeStyle = "#C5A059";
      posterCtx.lineWidth = 8;
      const drawRoundRect = (ctx, x, y, width, height, radius) => {
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
        ctx.stroke();
      };
      drawRoundRect(posterCtx, 252, 210, 296, 296, 32);
      posterCtx.drawImage(qrCanvas, 270, 228, 260, 260);

      // Draw Property Type Card (Right side)
      const cardX = 575;
      const cardY = 195;
      const cardW = 185;
      const cardH = 295;

      // Card background
      posterCtx.fillStyle = "#081A34";
      const drawRoundRectFilled = (ctx, x, y, width, height, radius) => {
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
        ctx.fill();
      };
      drawRoundRectFilled(posterCtx, cardX, cardY, cardW, cardH, 16);

      // Draw items inside card
      PROPERTY_TYPES_LIST.forEach((item, index) => {
        const itemY = cardY + 12 + index * 20;

        let isChecked = false;
        if (item === "Furnished") {
          isChecked = property.furnished === true || property.furnished === "true";
        } else {
          const pType = String(property.propertyType || "").toLowerCase().trim();
          const itemNorm = item.toLowerCase().trim();
          if (pType === itemNorm) {
            isChecked = true;
          } else if (itemNorm === "4+ bedroom" && (pType.includes("4 bedroom") || pType.includes("4+ bedroom") || pType.includes("5 bedroom"))) {
            isChecked = true;
          }
        }

        // Draw text
        posterCtx.fillStyle = "#ffffff";
        posterCtx.font = "bold 9px 'Inter', sans-serif";
        posterCtx.textAlign = "left";
        posterCtx.fillText(item, cardX + 12, itemY + 8);

        // Checkbox circle
        const circleX = cardX + cardW - 20;
        const circleY = itemY + 4;
        const radius = 5;

        if (isChecked) {
          posterCtx.fillStyle = "#C5A059";
          posterCtx.beginPath();
          posterCtx.arc(circleX, circleY, radius, 0, Math.PI * 2);
          posterCtx.fill();

          posterCtx.strokeStyle = "#081A34";
          posterCtx.lineWidth = 1.5;
          posterCtx.beginPath();
          posterCtx.moveTo(circleX - 2.5, circleY);
          posterCtx.lineTo(circleX - 0.5, circleY + 2);
          posterCtx.lineTo(circleX + 2.5, circleY - 1.5);
          posterCtx.stroke();
        } else {
          posterCtx.strokeStyle = "rgba(255, 255, 255, 0.3)";
          posterCtx.lineWidth = 1;
          posterCtx.beginPath();
          posterCtx.arc(circleX, circleY, radius, 0, Math.PI * 2);
          posterCtx.stroke();
        }
      });

      // Draw overlapping scan badge
      const badgeX = cardX + cardW / 2;
      const badgeY = cardY + cardH;
      const badgeRadius = 38;

      posterCtx.fillStyle = "#081A34";
      posterCtx.beginPath();
      posterCtx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
      posterCtx.fill();

      posterCtx.strokeStyle = "#C5A059";
      posterCtx.lineWidth = 2;
      posterCtx.beginPath();
      posterCtx.arc(badgeX, badgeY, badgeRadius - 1, 0, Math.PI * 2);
      posterCtx.stroke();

      posterCtx.fillStyle = "#ffffff";
      posterCtx.textAlign = "center";
      posterCtx.font = "bold 9px 'Inter', sans-serif";
      posterCtx.fillText("SCAN NOW", badgeX, badgeY - 5);

      posterCtx.fillStyle = "#C5A059";
      posterCtx.font = "500 6.5px 'Inter', sans-serif";
      posterCtx.fillText("Find your next", badgeX, badgeY + 6);
      posterCtx.fillText("space today!", badgeX, badgeY + 14);

      // Info Banner
      posterCtx.fillStyle = "#081A34";
      posterCtx.fillRect(40, 560, 720, 50);

      posterCtx.fillStyle = "#ffffff";
      posterCtx.font = "800 14px 'Inter', sans-serif";
      posterCtx.textAlign = "left";
      posterCtx.fillText("Or visit: www.axxspace.com", 60, 590);

      posterCtx.textAlign = "center";
      posterCtx.fillText("Email: info@axxspace.com", posterCanvas.width / 2, 590);

      posterCtx.textAlign = "right";
      const displayId = property._id ? property._id.slice(-6).toUpperCase() : "AXXSPC";
      posterCtx.fillText(`Search Property ID: ${displayId}`, 740, 590);

      // Why choose section
      posterCtx.fillStyle = "#081A34";
      posterCtx.textAlign = "center";
      posterCtx.font = "800 16px 'Inter', sans-serif";
      posterCtx.fillText("WHY CHOOSE AXXSPACE?", posterCanvas.width / 2, 660);

      posterCtx.fillStyle = "#C5A059";
      posterCtx.fillRect(350, 675, 100, 2);

      // Why choose columns
      const benefits = [
        {
          label: "MORE VISIBILITY",
          desc1: "Reach more potential",
          desc2: "tenants online & offline.",
          drawIcon: (cx, cy) => {
            posterCtx.strokeStyle = "#081A34";
            posterCtx.lineWidth = 1.5;
            posterCtx.beginPath();
            posterCtx.moveTo(cx - 12, cy);
            posterCtx.quadraticCurveTo(cx, cy - 8, cx + 12, cy);
            posterCtx.quadraticCurveTo(cx, cy + 8, cx - 12, cy);
            posterCtx.stroke();
            posterCtx.beginPath();
            posterCtx.arc(cx, cy, 3, 0, Math.PI * 2);
            posterCtx.fillStyle = "#C5A059";
            posterCtx.fill();
          }
        },
        {
          label: "EASY ACCESS",
          desc1: "Tenants can scan and",
          desc2: "view details instantly.",
          drawIcon: (cx, cy) => {
            posterCtx.strokeStyle = "#081A34";
            posterCtx.lineWidth = 1.5;
            posterCtx.beginPath();
            const pw = 12;
            const ph = 20;
            const px = cx - pw / 2;
            const py = cy - ph / 2;
            const r = 2;
            posterCtx.moveTo(px + r, py);
            posterCtx.lineTo(px + pw - r, py);
            posterCtx.quadraticCurveTo(px + pw, py, px + pw, py + r);
            posterCtx.lineTo(px + pw, py + ph - r);
            posterCtx.quadraticCurveTo(px + pw, py + ph, px + pw - r, py + ph);
            posterCtx.lineTo(px + r, py + ph);
            posterCtx.quadraticCurveTo(px, py + ph, px, py + ph - r);
            posterCtx.lineTo(px, py + r);
            posterCtx.quadraticCurveTo(px, py, px + r, py);
            posterCtx.closePath();
            posterCtx.stroke();
            posterCtx.beginPath();
            posterCtx.moveTo(cx - 2, cy + ph / 2 - 3);
            posterCtx.lineTo(cx + 2, cy + ph / 2 - 3);
            posterCtx.stroke();
          }
        },
        {
          label: "TRACK PERFORMANCE",
          desc1: "Monitor views &",
          desc2: "enquiries in real-time.",
          drawIcon: (cx, cy) => {
            posterCtx.strokeStyle = "#081A34";
            posterCtx.lineWidth = 2;
            posterCtx.beginPath();
            posterCtx.moveTo(cx - 10, cy + 6);
            posterCtx.lineTo(cx - 3, cy);
            posterCtx.lineTo(cx + 2, cy + 5);
            posterCtx.lineTo(cx + 9, cy - 6);
            posterCtx.stroke();
            posterCtx.beginPath();
            posterCtx.moveTo(cx + 4, cy - 6);
            posterCtx.lineTo(cx + 9, cy - 6);
            posterCtx.lineTo(cx + 9, cy - 1);
            posterCtx.stroke();
          }
        },
        {
          label: "MORE ENQUIRIES",
          desc1: "Get more genuine",
          desc2: "leads and serious tenants.",
          drawIcon: (cx, cy) => {
            posterCtx.strokeStyle = "#081A34";
            posterCtx.lineWidth = 1.5;
            posterCtx.beginPath();
            posterCtx.arc(cx - 4, cy - 2, 3, 0, Math.PI * 2);
            posterCtx.stroke();
            posterCtx.beginPath();
            posterCtx.arc(cx - 4, cy + 7, 5, Math.PI, 0);
            posterCtx.stroke();
            posterCtx.fillStyle = "#ffffff";
            posterCtx.beginPath();
            posterCtx.arc(cx + 4, cy - 2, 3.5, 0, Math.PI * 2);
            posterCtx.fill();
            posterCtx.stroke();
            posterCtx.beginPath();
            posterCtx.arc(cx + 4, cy + 7, 5.5, Math.PI, 0);
            posterCtx.fill();
            posterCtx.stroke();
          }
        },
        {
          label: "TRUSTED PLATFORM",
          desc1: "A professional",
          desc2: "system built for users.",
          drawIcon: (cx, cy) => {
            posterCtx.strokeStyle = "#081A34";
            posterCtx.lineWidth = 1.5;
            posterCtx.beginPath();
            posterCtx.moveTo(cx - 7, cy - 8);
            posterCtx.lineTo(cx + 7, cy - 8);
            posterCtx.lineTo(cx + 7, cy - 1);
            posterCtx.quadraticCurveTo(cx + 7, cy + 5, cx, cy + 9);
            posterCtx.quadraticCurveTo(cx - 7, cy + 5, cx - 7, cy - 1);
            posterCtx.closePath();
            posterCtx.stroke();
            posterCtx.strokeStyle = "#C5A059";
            posterCtx.lineWidth = 1.5;
            posterCtx.beginPath();
            posterCtx.moveTo(cx - 3, cy);
            posterCtx.lineTo(cx - 1, cy + 2);
            posterCtx.lineTo(cx + 3, cy - 2);
            posterCtx.stroke();
          }
        }
      ];

      benefits.forEach((b, index) => {
        const colW = 144;
        const cx = 40 + colW / 2 + index * colW;
        const cyIcon = 720;

        // Draw icon
        b.drawIcon(cx, cyIcon);

        // Draw label
        posterCtx.fillStyle = "#081A34";
        posterCtx.textAlign = "center";
        posterCtx.font = "800 10.5px 'Inter', sans-serif";
        posterCtx.fillText(b.label, cx, 752);

        // Draw description line 1
        posterCtx.fillStyle = "#475569";
        posterCtx.font = "600 8.5px 'Inter', sans-serif";
        posterCtx.fillText(b.desc1, cx, 770);

        // Draw description line 2
        posterCtx.fillText(b.desc2, cx, 784);

        // Draw column divider (except last column)
        if (index < 4) {
          const divX = 40 + (index + 1) * colW;
          posterCtx.strokeStyle = "#e2e8f0";
          posterCtx.lineWidth = 1;
          posterCtx.beginPath();
          posterCtx.moveTo(divX, 715);
          posterCtx.lineTo(divX, 780);
          posterCtx.stroke();
        }
      });


      // Footers
      posterCtx.fillStyle = "#081A34";
      posterCtx.fillRect(0, 990, 800, 50);
      posterCtx.fillStyle = "#d9383a";
      posterCtx.fillRect(0, 1040, 800, 50);

      // Navy footer content
      posterCtx.drawImage(logoImg, 40, 1000, 30, 30);

      posterCtx.fillStyle = "#ffffff";
      posterCtx.textAlign = "left";
      posterCtx.font = "900 16px 'Inter', sans-serif";
      posterCtx.fillText("AXXSPACE", 80, 1020);

      posterCtx.fillStyle = "#94a3b8";
      posterCtx.font = "700 9px 'Inter', sans-serif";
      posterCtx.fillText("Space hunting bila stress.", 175, 1020);

      posterCtx.textAlign = "right";
      posterCtx.font = "800 12px 'Inter', sans-serif";
      posterCtx.fillText("Kenya's smart rental marketplace", 760, 1020);

      // Red footer content
      posterCtx.textAlign = "left";
      posterCtx.fillStyle = "#ffffff";
      posterCtx.font = "900 14px 'Inter', sans-serif";
      posterCtx.fillText("TO LANDLORDS:", 40, 1070);

      posterCtx.textAlign = "right";
      posterCtx.font = "800 10px 'Inter', sans-serif";
      posterCtx.fillText("1. LIST PROPERTY  >  2. GENERATE QR  >  3. PRINT & DISPLAY  >  4. GET TENANTS", 760, 1070);

      // Thank you
      posterCtx.fillStyle = "#475569";
      posterCtx.textAlign = "center";
      posterCtx.font = "700 10px 'Inter', sans-serif";
      posterCtx.fillText("Thank you for choosing Axxspace. | Together, we make space hunting easy.", posterCanvas.width / 2, 1110);
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
    color: "#081A34",
    fontFamily: "'Inter', 'DM Sans', sans-serif",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxSizing: "border-box",
    padding: "0",
    position: "relative",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "24px 36px 0 36px",
    height: "120px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    width: "220px",
  },
  logoWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoImg: {
    width: "48px",
    height: "48px",
    objectFit: "contain",
  },
  logoTextContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  logoBrand: {
    fontSize: "24px",
    fontWeight: "900",
    color: "#081A34",
    letterSpacing: "-1px",
    lineHeight: "1",
  },
  logoTagline: {
    fontSize: "9px",
    fontWeight: "700",
    color: "#64748b",
    marginTop: "2px",
  },
  headerCenter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    flex: "1",
  },
  mainTitleRow1: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#081A34",
    lineHeight: "1",
    letterSpacing: "-0.5px",
  },
  mainTitleRow2: {
    fontSize: "44px",
    fontWeight: "900",
    color: "#d9383a",
    lineHeight: "0.95",
    letterSpacing: "-1px",
    marginTop: "2px",
  },
  scanIndicator: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "8px",
    width: "100%",
  },
  indicatorLine: {
    height: "1.5px",
    flex: "1",
    backgroundColor: "#C5A059",
  },
  indicatorText: {
    fontSize: "9.5px",
    fontWeight: "900",
    color: "#081A34",
    letterSpacing: "0.8px",
    whiteSpace: "nowrap",
  },
  headerRight: {
    width: "220px",
    display: "flex",
    justifyContent: "flex-end",
  },
  ribbon: {
    width: "90px",
    height: "90px",
    backgroundColor: "#081A34",
    border: "2.5px solid #C5A059",
    borderTop: "none",
    borderRadius: "0 0 12px 12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
  },
  ribbonListed: {
    fontSize: "8px",
    color: "#94a3b8",
    fontWeight: "800",
    letterSpacing: "0.5px",
    marginTop: "4px",
  },
  ribbonBrand: {
    fontSize: "10px",
    color: "#ffffff",
    fontWeight: "900",
    letterSpacing: "0.5px",
    marginTop: "2px",
  },
  mainSection: {
    display: "grid",
    gridTemplateColumns: "185px 304px 185px",
    gap: "20px",
    padding: "10px 40px",
    alignItems: "center",
    height: "380px",
  },
  featuresCol: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
    padding: "15px 0",
  },
  featureCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  featureIconCircle: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    border: "2px solid #C5A059",
    backgroundColor: "rgba(197, 160, 89, 0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#C5A059",
  },
  featureTitle: {
    fontSize: "11.5px",
    fontWeight: "800",
    color: "#081A34",
    marginTop: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  featureDesc: {
    fontSize: "9px",
    color: "#475569",
    marginTop: "2px",
    fontWeight: "600",
    lineHeight: "1.2",
  },
  featureDivider: {
    width: "40px",
    height: "1px",
    backgroundColor: "#e2e8f0",
    alignSelf: "center",
  },
  qrCol: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  qrGoldFrame: {
    border: "6px solid #C5A059",
    borderRadius: "28px",
    padding: "14px",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  },
  qrCodeImg: {
    width: "210px",
    height: "210px",
    display: "block",
  },
  qrPlaceholder: {
    width: "210px",
    height: "210px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "600",
  },
  typesCardCol: {
    position: "relative",
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  typesCard: {
    width: "100%",
    height: "90%",
    backgroundColor: "#081A34",
    borderRadius: "20px",
    padding: "16px 14px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },
  typeRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  typeLabel: {
    color: "#ffffff",
    fontSize: "9px",
    fontWeight: "700",
    fontFamily: "'Inter', sans-serif",
  },
  checkCircle: {
    width: "11px",
    height: "11px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  checkCircleActive: {
    width: "11px",
    height: "11px",
    borderRadius: "50%",
    backgroundColor: "#C5A059",
    border: "1px solid #C5A059",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  scanBadgeCircleOverlapping: {
    position: "absolute",
    bottom: "-5px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#081A34",
    border: "2.5px solid #C5A059",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    textAlign: "center",
    boxShadow: "0 8px 20px rgba(8, 26, 52, 0.35)",
    zIndex: 10,
  },
  scanBadgeTitle: {
    fontSize: "9px",
    fontWeight: "800",
    color: "#ffffff",
    marginTop: "2px",
    letterSpacing: "0.5px",
  },
  scanBadgeDesc: {
    fontSize: "6.5px",
    color: "#94a3b8",
    lineHeight: "1.1",
    width: "65px",
    marginTop: "1.5px",
    fontWeight: "600",
  },
  infoBanner: {
    margin: "0 40px",
    height: "46px",
    backgroundColor: "#081A34",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 24px",
    color: "#ffffff",
    boxShadow: "0 4px 10px rgba(8, 26, 52, 0.15)",
  },
  infoLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  infoTextLabel: {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: "600",
  },
  infoTextValue: {
    fontSize: "13px",
    color: "#ffffff",
    fontWeight: "800",
    textDecoration: "underline",
    textDecorationColor: "#C5A059",
  },
  infoDivider: {
    width: "1px",
    height: "18px",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  infoRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  infoIdBox: {
    backgroundColor: "#ffffff",
    color: "#081A34",
    fontWeight: "900",
    fontSize: "13px",
    padding: "3px 10px",
    borderRadius: "5px",
    border: "1px solid #e2e8f0",
    letterSpacing: "0.5px",
    minWidth: "70px",
    textAlign: "center",
  },
  whySection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 40px",
    marginTop: "15px",
  },
  whyTitle: {
    fontSize: "12px",
    fontWeight: "900",
    color: "#081A34",
    letterSpacing: "1.2px",
  },
  whyGoldLine: {
    height: "2px",
    width: "50px",
    backgroundColor: "#C5A059",
    margin: "4px auto 10px",
  },
  whyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    width: "100%",
  },
  whyCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "0 8px",
    position: "relative",
  },
  whyColLabel: {
    fontSize: "8.5px",
    fontWeight: "800",
    color: "#081A34",
    marginTop: "5px",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
  whyColDesc: {
    fontSize: "7px",
    color: "#475569",
    marginTop: "3px",
    lineHeight: "1.2",
    fontWeight: "600",
  },
  whyColDivider: {
    position: "absolute",
    right: "0",
    top: "8px",
    height: "35px",
    width: "1px",
    backgroundColor: "#e2e8f0",
  },
  footerContainer: {
    marginTop: "auto",
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  navyFooter: {
    height: "44px",
    backgroundColor: "#081A34",
    borderTop: "3.5px solid #C5A059",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 36px",
    color: "#ffffff",
  },
  navyFooterLeft: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    width: "230px",
  },
  navyLogo: {
    width: "24px",
    height: "24px",
    objectFit: "contain",
  },
  navyBrandName: {
    fontSize: "13px",
    fontWeight: "900",
    letterSpacing: "-0.5px",
  },
  navyTagline: {
    fontSize: "8px",
    color: "#94a3b8",
    fontWeight: "600",
  },
  navyFooterCenter: {
    fontSize: "9.5px",
    color: "#94a3b8",
    fontWeight: "600",
  },
  navyFooterRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "9.5px",
    width: "230px",
    justifyContent: "flex-end",
  },
  socialHandle: {
    color: "#C5A059",
    fontWeight: "700",
    marginLeft: "2px",
  },
  redFooter: {
    height: "46px",
    backgroundColor: "#d9383a",
    display: "flex",
    alignItems: "center",
    padding: "0 36px",
    justifyContent: "space-between",
    color: "#ffffff",
  },
  redFooterLeft: {
    fontSize: "12px",
    fontWeight: "900",
    letterSpacing: "0.5px",
  },
  redFooterSteps: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: "1",
    justifyContent: "flex-end",
    marginLeft: "15px",
  },
  stepItem: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  stepCircle: {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    backgroundColor: "#ffffff",
    color: "#d9383a",
    fontSize: "9px",
    fontWeight: "900",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleIcon: {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    backgroundColor: "#ffffff",
    color: "#d9383a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stepTextWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  stepTextWrapperInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  stepTitle: {
    fontSize: "8.5px",
    fontWeight: "800",
    lineHeight: "1",
    textTransform: "uppercase",
  },
  stepDesc: {
    fontSize: "6.5px",
    color: "rgba(255,255,255,0.85)",
    lineHeight: "1",
    marginTop: "1.5px",
    fontWeight: "500",
  },
  stepArrow: {
    fontSize: "10px",
    color: "rgba(255,255,255,0.5)",
    fontWeight: "750",
  },
  thankYouText: {
    textAlign: "center",
    fontSize: "8.5px",
    fontWeight: "700",
    color: "#475569",
    padding: "6px 0",
    backgroundColor: "#f8fafc",
  }
};
