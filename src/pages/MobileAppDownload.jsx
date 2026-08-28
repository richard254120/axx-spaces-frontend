import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import "./MobileAppDownload.css";

const MobileAppDownload = () => {
  const [appVersion, setAppVersion] = useState("1.0.0");
  const [downloadCount, setDownloadCount] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const qrRef = useRef(null);

  useEffect(() => {
    // Simulate loading app info
    setAppVersion("1.0.0");
    setDownloadCount(1234);

    // Generate QR code for the download page
    generateQRCode();
  }, []);

  const generateQRCode = async () => {
    try {
      const url = window.location.origin + "/mobile-app";
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: "#C9A84C",
          light: "#0D1B2A"
        }
      });
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const handleDownload = () => {
    setIsDownloading(true);
    // In production, this would link to the actual APK file
    // Update this path to match your actual APK file location
    const apkUrl = "/downloads/axx-spaces-mobile-v1.0.0.apk";

    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = apkUrl;
    link.download = "axx-spaces-mobile-v1.0.0.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloading(false);
      setDownloadCount(prev => prev + 1);
    }, 1500);
  };

  const features = [
    { icon: "🏠", title: "Property Rentals", description: "Browse and rent apartments, hostels, and houses" },
    { icon: "✈️", title: "Tourism", description: "Discover hotels, safaris, and cultural experiences" },
    { icon: "💼", title: "Business Directory", description: "Connect with local businesses via AxxBiashara" },
    { icon: "🔨", title: "Materials", description: "Construction materials marketplace" },
    { icon: "🚚", title: "Movers", description: "Professional moving and logistics services" },
    { icon: "💳", title: "Digital Wallet", description: "Secure payments and transactions" },
  ];

  const screenshots = [
    "/screenshots/home-screen.png",
    "/screenshots/properties-screen.png",
    "/screenshots/tourism-screen.png",
    "/screenshots/profile-screen.png",
  ];

  return (
    <div className="mobile-download-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>AXX Spaces Mobile App</h1>
              <p className="hero-subtitle">
                Kenya's Premier Property Platform - Now on Your Phone
              </p>
              <p className="hero-description">
                Download the AXX Spaces mobile app and access property rentals, tourism,
                business directory, materials marketplace, and movers services - all in one place.
              </p>

              <div className="download-buttons">
                <button
                  className="download-btn primary"
                  onClick={handleDownload}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <>
                      <span className="spinner"></span>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <span className="download-icon">📥</span>
                      Download APK
                    </>
                  )}
                </button>

                <div className="app-info">
                  <span className="version">Version {appVersion}</span>
                  <span className="separator">•</span>
                  <span className="downloads">{downloadCount.toLocaleString()} downloads</span>
                </div>
              </div>

              <div className="security-notice">
                <span className="security-icon">🔒</span>
                <span>Safe & Secure - Direct from AXX Spaces</span>
              </div>

              {qrCodeUrl && (
                <div className="qr-code-section">
                  <p className="qr-code-title">Scan to Download</p>
                  <div className="qr-code-container">
                    <img src={qrCodeUrl} alt="Download QR Code" className="qr-code-image" />
                  </div>
                  <p className="qr-code-instruction">
                    Point your phone camera at the QR code to download the app
                  </p>
                </div>
              )}
            </div>

            <div className="hero-image">
              <div className="phone-mockup">
                <div className="phone-screen">
                  <div className="status-bar">
                    <span>9:41</span>
                    <div className="status-icons">
                      <span>📶</span>
                      <span>🔋</span>
                    </div>
                  </div>
                  <div className="app-content">
                    <div className="app-header">
                      <h2>AXX Spaces</h2>
                    </div>
                    <div className="app-preview">
                      <div className="preview-card">
                        <div className="preview-image"></div>
                        <div className="preview-info">
                          <div className="preview-title">Modern Apartment</div>
                          <div className="preview-location">Westlands, Nairobi</div>
                          <div className="preview-price">KES 45,000/month</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">App Features</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="screenshots-section">
        <div className="container">
          <h2 className="section-title">App Screenshots</h2>
          <div className="screenshots-grid">
            {screenshots.map((screenshot, index) => (
              <div key={index} className="screenshot-card">
                <div className="screenshot-placeholder">
                  <span>📱</span>
                  <p>Screen {index + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Installation Guide */}
      <section className="installation-section">
        <div className="container">
          <h2 className="section-title">Installation Guide</h2>
          <div className="installation-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Download the APK</h3>
                <p>Click the download button above to get the latest version of AXX Spaces mobile app.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Enable Unknown Sources</h3>
                <p>Go to Settings &gt; Security &gt; Allow installation from unknown sources.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Install the App</h3>
                <p>Open the downloaded APK file and follow the installation prompts.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Launch & Enjoy</h3>
                <p>Open the app and start exploring all features of AXX Spaces.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="requirements-section">
        <div className="container">
          <h2 className="section-title">System Requirements</h2>
          <div className="requirements-grid">
            <div className="requirement-card">
              <h3>Android Version</h3>
              <p>Android 5.0 (Lollipop) or higher</p>
            </div>
            <div className="requirement-card">
              <h3>Storage Space</h3>
              <p>Minimum 50MB free space</p>
            </div>
            <div className="requirement-card">
              <h3>RAM</h3>
              <p>Minimum 2GB RAM recommended</p>
            </div>
            <div className="requirement-card">
              <h3>Internet</h3>
              <p>Stable internet connection required</p>
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
              <h3>Is the app safe to download?</h3>
              <p>Yes, the APK is hosted directly on our secure servers and is regularly scanned for malware.</p>
            </div>
            <div className="faq-item">
              <h3>Why isn't it on the Play Store?</h3>
              <p>We're currently in the process of Play Store verification. Download from our website for immediate access.</p>
            </div>
            <div className="faq-item">
              <h3>How do I update the app?</h3>
              <p>Visit this page regularly and download the latest version when updates are available.</p>
            </div>
            <div className="faq-item">
              <h3>Will my data be safe?</h3>
              <p>Yes, we use the same secure backend as our web platform with encrypted data transmission.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Download the AXX Spaces mobile app now and enjoy seamless property services on the go.</p>
          <button
            className="download-btn large"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <span className="spinner"></span>
                Downloading...
              </>
            ) : (
              <>
                <span className="download-icon">📥</span>
                Download APK Now
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};

export default MobileAppDownload;
