import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import "./MobileAppDownload.css";

const MobileAppDownload = () => {
  const [appVersion] = useState("v1.0.0");
  const [downloadCount, setDownloadCount] = useState(1480);
  const [isDownloading, setIsDownloading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const url = window.location.origin;
        const qrDataUrl = await QRCode.toDataURL(url, {
          width: 180,
          margin: 1,
          color: {
            dark: "#0F172A",
            light: "#FFFFFF",
          },
        });
        setQrCodeUrl(qrDataUrl);
      } catch (err) {
        console.error("Failed to generate QR code", err);
      }
    };
    generateQRCode();
  }, []);

  const handleDownloadManager = () => {
    setIsDownloading(true);
    const link = document.createElement("a");
    link.href = "/downloads/axx-spaces-manager-v1.0.0.apk";
    link.download = "axx-spaces-manager-v1.0.0.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      setIsDownloading(false);
      setDownloadCount((prev) => prev + 1);
    }, 1200);
  };

  const handleDownloadClient = () => {
    const link = document.createElement("a");
    link.href = "/downloads/axx-spaces-mobile-v1.0.1.apk";
    link.download = "axx-spaces-mobile-v1.0.1.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenWebApp = () => {
    window.open(window.location.origin, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="download-container">
      <div className="download-card">
        <div className="brand-header">
          <div className="brand-logo-badge">
            <svg className="brand-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
          </div>
          <h1 className="download-title">AXX Spaces Manager</h1>
          <p className="download-subtitle">
            Manage your listings, bookings, and operations seamlessly on mobile or web.
          </p>
        </div>

        <div className="download-options-grid">
          {/* Manager Android APK Card */}
          <div className="option-card primary-card">
            <div className="option-badge">Android</div>
            <div className="option-icon-wrap">
              <svg className="option-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </div>
            <h3>Manager Mobile App</h3>
            <p>Direct APK download for property and service managers</p>
            <button
              onClick={handleDownloadManager}
              disabled={isDownloading}
              className="action-btn download-btn"
              id="download-manager-apk-btn"
            >
              {isDownloading ? (
                <>
                  <span className="spinner"></span>
                  Downloading APK...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download Manager APK
                </>
              )}
            </button>
            <div className="card-meta">
              <span>{appVersion}</span>
              <span className="meta-dot">•</span>
              <span>Direct install</span>
            </div>
          </div>

          {/* Web App Card */}
          <div className="option-card secondary-card">
            <div className="option-badge">Instant Access</div>
            <div className="option-icon-wrap">
              <svg className="option-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </div>
            <h3>Manager Web App</h3>
            <p>Access the manager portal instantly in any web browser</p>
            <button onClick={handleOpenWebApp} className="action-btn web-btn" id="open-web-app-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              Launch Web App
            </button>
            <div className="card-meta">
              <span>No installation required</span>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        {qrCodeUrl && (
          <div className="qr-wrapper">
            <div className="qr-box">
              <img src={qrCodeUrl} alt="Scan QR code for Web App" className="qr-img" />
            </div>
            <div className="qr-info">
              <h4>Scan to open on phone</h4>
              <p>Point your mobile camera to launch the web app directly on your phone.</p>
            </div>
          </div>
        )}

        {/* Client App Download & Badges */}
        <div className="extra-links-row">
          <button onClick={handleDownloadClient} className="text-link-btn">
            Looking for the Client App? Download AXX Spaces Mobile APK (v1.0.1) →
          </button>
        </div>

        {/* Trust Badges */}
        <div className="trust-row">
          <div className="trust-item">
            <svg className="trust-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>Verified & Safe APK</span>
          </div>
          <div className="trust-item">
            <svg className="trust-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{downloadCount.toLocaleString()} downloads</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileAppDownload;
