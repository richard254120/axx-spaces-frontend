import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import "./MobileAppDownload.css";

// Direct download: the APK artifact on the EAS CDN. The CDN serves it with
// Content-Disposition: attachment, so a click downloads the file directly
// (no page shown). Update this URL after each new EAS build.
const DOWNLOAD_URL =
  "https://expo.dev/artifacts/eas/tfbHKWKT1XUGv5tHV7rAnRi59n5fPcRWqFWZGS-QsU4.apk";

const APP_NAME = "Axxspace";
const APK_VERSION = "v1.1.0";
const APK_SIZE = "86 MB";
const APK_UPDATED = "Nov 2, 2026";
const APK_FILENAME = "Axxspace.apk";

const MobileAppDownload = () => {
  const [downloadCount, setDownloadCount] = useState(1480);
  const [isDownloadingClient, setIsDownloadingClient] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [copied, setCopied] = useState(false);

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

  const handleDownloadClient = () => {
    setIsDownloadingClient(true);
    // Real anchor click → the browser downloads the APK directly (the endpoint
    // redirects to the CDN which serves it as an attachment). No page/URL shown.
    const link = document.createElement("a");
    link.href = DOWNLOAD_URL;
    link.download = APK_FILENAME;
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      setIsDownloadingClient(false);
      setDownloadCount((prev) => prev + 1);
    }, 1200);
  };

  const handleOpenWebApp = () => {
    window.open(window.location.origin, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(DOWNLOAD_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
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
          <h1 className="download-title">Get the {APP_NAME} App</h1>
          <p className="download-subtitle">
            Take {APP_NAME} with you — rentals, stays, movers, services and quick sales in your
            pocket. The app stays in sync with the website, so content always updates
            automatically — no reinstall needed.
          </p>
        </div>

        <div className="download-options-grid">
          {/* Client App Android APK Card (Axxspace) */}
          <div className="option-card primary-card">
            <div className="option-badge">Android · Recommended</div>
            <div className="option-icon-wrap">
              <svg className="option-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </div>
            <h3>{APP_NAME} App</h3>
            <p>Browse listings, book, chat and pay — always in sync with the website.</p>
            <button
              onClick={handleDownloadClient}
              disabled={isDownloadingClient}
              className="action-btn download-btn"
              id="download-client-apk-btn"
            >
              {isDownloadingClient ? (
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
                  Download {APP_NAME} APK
                </>
              )}
            </button>
            <div className="card-meta">
              <span>{APK_VERSION}</span>
              <span className="meta-dot">•</span>
              <span>{APK_SIZE}</span>
              <span className="meta-dot">•</span>
              <span>Android 7.0+</span>
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
            <h3>{APP_NAME} Web App</h3>
            <p>Open {APP_NAME} instantly in any browser — no installation required.</p>
            <button onClick={handleOpenWebApp} className="action-btn web-btn" id="open-web-app-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              Launch Web App
            </button>
            <div className="card-meta">
              <span>Works on any device</span>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        {qrCodeUrl && (
          <div className="qr-wrapper">
            <div className="qr-box">
              <img src={qrCodeUrl} alt="Scan QR code to open Axxspace" className="qr-img" />
            </div>
            <div className="qr-info">
              <h4>Scan to open on your phone</h4>
              <p>Point your camera here to launch {APP_NAME} directly on your phone.</p>
            </div>
          </div>
        )}

        {/* Direct download link */}
        <div className="direct-link">
          <span className="direct-link-label">Direct download</span>
          <div className="direct-link-row">
            <code className="direct-link-url" title={DOWNLOAD_URL}>{DOWNLOAD_URL}</code>
            <button
              onClick={handleDownloadClient}
              className="copy-btn download-primary"
              id="direct-download-btn"
              aria-label="Download APK now"
            >
              Download
            </button>
            <button
              onClick={handleCopyLink}
              className="copy-btn"
              id="copy-apk-link-btn"
              aria-label="Copy APK download link"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="direct-link-hint">
            Updated {APK_UPDATED} · {APK_SIZE} · Clicking Download saves <strong>{APK_FILENAME}</strong>{" "}
            to your device. Open the file and allow “install from unknown sources” to install {APP_NAME}.
          </p>
        </div>

        {/* Client App Download & Badges */}
        <div className="extra-links-row">
          <span className="text-link-btn" style={{ cursor: "default" }}>
            New to {APP_NAME}? The app updates itself whenever we change the website — no reinstall needed.
          </span>
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
