import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import "./MobileAppDownload.css";

const MobileAppDownload = () => {
  const [appVersion, setAppVersion] = useState("1.0.1");
  const [downloadCount, setDownloadCount] = useState(1480);
  const [isDownloading, setIsDownloading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [activeTab, setActiveTab] = useState("download"); // 'download' | 'web' | 'troubleshoot'

  useEffect(() => {
    generateQRCode();
  }, []);

  const generateQRCode = async () => {
    try {
      const url = window.location.origin + "/mobile-app";
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 220,
        margin: 2,
        color: {
          dark: "#F59E0B",
          light: "#0F172A"
        }
      });
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const handleDownload = () => {
    setIsDownloading(true);
    const apkUrl = "/downloads/axx-spaces-mobile-v1.0.1.apk";

    const link = document.createElement('a');
    link.href = apkUrl;
    link.download = "axx-spaces-mobile-v1.0.1.apk";
    link.target = "_self";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloading(false);
      setDownloadCount(prev => prev + 1);
    }, 1500);
  };

  const handleOpenWebApp = () => {
    window.open("https://axxspace.com", "_blank", "noopener,noreferrer");
  };

  const features = [
    { title: "Property Rentals", description: "Browse, view, and rent apartments, hostels, and residential homes in real-time." },
    { title: "Tourism & Hotels", description: "Discover top vacation rentals, hotels, safaris, and local cultural experiences." },
    { title: "AxxBiashara Directory", description: "Connect directly with verified local businesses and services across Kenya." },
    { title: "Materials Marketplace", description: "Source quality construction materials and hardware straight from vendors." },
    { title: "Movers & Logistics", description: "Book verified relocation, moving, and delivery services effortlessly." },
    { title: "AxxWallet Payments", description: "Seamless, secure digital wallet transactions and instant booking receipts." },
  ];

  return (
    <div className="mobile-download-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="badge-wrapper">
                <span className="app-badge">Official Release v{appVersion}</span>
                <span className="badge-dot"></span>
                <span className="app-badge-sub">WebView & Web Enabled</span>
              </div>
              
              <h1>AXX Spaces Mobile</h1>
              <p className="hero-subtitle">
                Kenya's Premier All-in-One Property & Services Platform
              </p>
              <p className="hero-description">
                Experience seamless access to property rentals, tourism stays, business directory, material sales, and movers. Download the Android APK or open the web app directly in your browser.
              </p>

              {/* Action Buttons */}
              <div className="download-buttons">
                <button
                  className="download-btn primary"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  id="download-apk-btn"
                >
                  {isDownloading ? (
                    <>
                      <span className="spinner"></span>
                      Downloading APK...
                    </>
                  ) : (
                    <>
                      Download Android APK
                    </>
                  )}
                </button>

                <button
                  className="download-btn secondary-web"
                  onClick={handleOpenWebApp}
                  id="open-web-app-btn"
                >
                  Open Web App Directly
                </button>
              </div>

              <div className="app-info">
                <span className="version">Version {appVersion}</span>
                <span className="separator">•</span>
                <span className="downloads">{downloadCount.toLocaleString()} downloads</span>
                <span className="separator">•</span>
                <span className="size">3.2 MB</span>
              </div>

              <div className="security-notice">
                <span>Verified Safe & Secure - Direct from AXX Spaces</span>
              </div>

              {qrCodeUrl && (
                <div className="qr-code-section">
                  <div className="qr-header">
                    <p className="qr-code-title">Scan with Phone Camera</p>
                  </div>
                  <div className="qr-code-container">
                    <img src={qrCodeUrl} alt="Download QR Code" className="qr-code-image" />
                  </div>
                  <p className="qr-code-instruction">
                    Point your mobile device camera at the QR code to open or download the app.
                  </p>
                </div>
              )}
            </div>

            {/* Interactive Phone Mockup */}
            <div className="hero-image">
              <div className="phone-mockup">
                <div className="phone-notch"></div>
                <div className="phone-screen">
                  <div className="status-bar">
                    <span>09:41</span>
                    <div className="status-icons">
                      <span>5G</span>
                    </div>
                  </div>
                  <div className="app-content">
                    <div className="app-header">
                      <div className="header-logo-brand">
                        <span className="brand-dot"></span>
                        <h2>AXX Space</h2>
                      </div>
                      <span className="live-status-pill">LIVE</span>
                    </div>
                    
                    <div className="app-preview-body">
                      <div className="preview-banner">
                        <span className="banner-title">Featured Listings</span>
                        <span className="banner-badge">Nairobi & Beyond</span>
                      </div>
                      
                      <div className="preview-card">
                        <div className="preview-image-placeholder">
                          <span className="verified-tag">✓ Verified</span>
                        </div>
                        <div className="preview-info">
                          <div className="preview-title">Luxury Studio Apartment</div>
                          <div className="preview-location">Kilimani, Nairobi</div>
                          <div className="preview-price">KES 35,000 / mo</div>
                        </div>
                      </div>

                      <div className="mini-quick-actions">
                        <div className="action-chip">Rentals</div>
                        <div className="action-chip">Tourism</div>
                        <div className="action-chip">Biashara</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Troubleshooting Section: Why the app needs internet or web link */}
      <section className="troubleshoot-section" id="troubleshoot">
        <div className="container">
          <div className="troubleshoot-card">
            <div className="troubleshoot-header">
              <div>
                <h2>App Not Opening the Website?</h2>
                <p>If you downloaded the app and it displays a connection message or white screen, check these quick solutions:</p>
              </div>
            </div>
            
            <div className="troubleshoot-grid">
              <div className="troubleshoot-item">
                <div className="item-num">1</div>
                <div>
                  <h4>Internet & Data Connection</h4>
                  <p>The AXX Spaces app connects securely to <strong>https://axxspace.com</strong>. Make sure Wi-Fi or Mobile Data is turned on.</p>
                </div>
              </div>

              <div className="troubleshoot-item">
                <div className="item-num">2</div>
                <div>
                  <h4>Allow Android App Permissions</h4>
                  <p>When installing via APK, allow unknown installation sources in your Android Security Settings.</p>
                </div>
              </div>

              <div className="troubleshoot-item">
                <div className="item-num">3</div>
                <div>
                  <h4>Direct Browser Alternative</h4>
                  <p>You can always access all features directly at <a href="https://axxspace.com" target="_blank" rel="noreferrer" className="inline-link">https://axxspace.com</a> from any browser.</p>
                </div>
              </div>
            </div>

            <div className="troubleshoot-actions">
              <button onClick={handleOpenWebApp} className="direct-web-btn">
                Launch Web Version Now →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Everything in One App</h2>
          <p className="section-subtitle">Seamless access across all AXX Space services</p>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Installation Guide */}
      <section className="installation-section">
        <div className="container">
          <h2 className="section-title">Easy 4-Step Installation</h2>
          <div className="installation-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Download the APK</h3>
                <p>Tap the "Download Android APK" button to download the setup file directly to your phone.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Allow Unknown Sources</h3>
                <p>If prompted, go to Settings &gt; Security &gt; Enable "Install from unknown sources" for your browser.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Tap Install</h3>
                <p>Open your downloads folder and tap <strong>axx-spaces-mobile-v1.0.1.apk</strong> to complete installation.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Launch & Access AXX Space</h3>
                <p>Open the app icon on your home screen to instantly connect to Axxspace website and services.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <h3>What website does the mobile app open?</h3>
              <p>The app automatically loads <strong>https://axxspace.com</strong> in a fast, dedicated mobile WebView interface.</p>
            </div>
            <div className="faq-item">
              <h3>Is the app safe to install?</h3>
              <p>Yes, the APK is hosted directly on our official servers and scanned for malware and security integrity.</p>
            </div>
            <div className="faq-item">
              <h3>Can I use the website without installing the APK?</h3>
              <p>Absolutely! Tap "Open Web App Directly" or visit <strong>axxspace.com</strong> on any phone, tablet, or PC browser.</p>
            </div>
            <div className="faq-item">
              <h3>What if I get a connection error in the app?</h3>
              <p>Check your mobile data or Wi-Fi connection, tap "Retry Connection" in the app, or click the direct web link above.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Explore AXX Spaces?</h2>
          <p>Get instant access on your mobile device or open the platform online right now.</p>
          <div className="cta-buttons">
            <button
              className="download-btn large primary"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <span className="spinner"></span>
                  Downloading APK...
                </>
              ) : (
                <>
                  Download Mobile APK
                </>
              )}
            </button>
            <button
              className="download-btn large secondary-web"
              onClick={handleOpenWebApp}
            >
              Open Web Version
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MobileAppDownload;
