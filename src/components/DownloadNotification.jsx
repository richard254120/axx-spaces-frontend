// src/components/DownloadNotification.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import "./DownloadNotification.css";

/**
 * DownloadNotification
 * A professional, dismissable modal popup prompting visitors to download the
 * Axxspace app. The primary button triggers the exact APK URL directly (the EAS
 * CDN serves it with Content-Disposition: attachment, so it downloads on click),
 * with a secondary link to the full download page. Dismissal is remembered per
 * browser and it does not appear on the download page itself.
 */
const APP_NAME = "Axxspace";
const APK_VERSION = "v1.1.0";
// The exact URL that downloads the app APK. Update after each new EAS build.
const APK_DOWNLOAD_URL =
  "https://expo.dev/artifacts/eas/tfbHKWKT1XUGv5tHV7rAnRi59n5fPcRWqFWZGS-QsU4.apk";
const APK_FILENAME = "Axxspace.apk";
const DOWNLOAD_PAGE_PATH = "/mobile-app";
const DISMISS_KEY = "axx_download_popup_dismissed_v3";

const DownloadNotification = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  const isDownloadPage =
    location.pathname.toLowerCase() === DOWNLOAD_PAGE_PATH;

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 240);
    localStorage.setItem(DISMISS_KEY, "true");
  }, []);

  useEffect(() => {
    if (isDownloadPage) return undefined;
    if (localStorage.getItem(DISMISS_KEY) === "true") return undefined;
    // Small delay so it isn't intrusive on first paint.
    const t = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(t);
  }, [isDownloadPage]);

  // Escape key dismisses the popup.
  useEffect(() => {
    if (!visible) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, close]);

  if (!visible) return null;

  const handleDownload = () => {
    // Real anchor click → the browser downloads the APK directly from the CDN.
    const link = document.createElement("a");
    link.href = APK_DOWNLOAD_URL;
    link.download = APK_FILENAME;
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    localStorage.setItem(DISMISS_KEY, "true");
    setVisible(false);
    setClosing(false);
  };

  const handleOverlayMouseDown = (e) => {
    if (e.target === e.currentTarget) close();
  };

  return (
    <div
      className={`dl-popup-overlay${closing ? " is-closing" : ""}`}
      onMouseDown={handleOverlayMouseDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dl-popup-title"
    >
      <div className="dl-popup-card">
        <button
          className="dl-popup-close"
          onClick={close}
          aria-label="Close"
          id="download-popup-close"
        >
          ×
        </button>

        <div className="dl-popup-icon" aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2.5" ry="2.5"></rect>
            <path d="M9 13l2 2 4-4"></path>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
          </svg>
        </div>

        <h2 id="dl-popup-title" className="dl-popup-title">
          Get the {APP_NAME} App
        </h2>
        <p className="dl-popup-sub">
          Rentals, stays, movers, services and quick sales — right in your
          pocket, always in sync with the website.
        </p>

        <div className="dl-popup-meta">
          <span>Android 7.0+</span>
          <span className="dot">•</span>
          <span>Free</span>
          <span className="dot">•</span>
          <span>{APK_VERSION}</span>
        </div>

        <button
          className="dl-popup-cta"
          onClick={handleDownload}
          id="download-popup-cta"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download {APP_NAME} App
        </button>

        <a
          href={DOWNLOAD_PAGE_PATH}
          className="dl-popup-alt"
          onClick={close}
          id="download-popup-alt"
        >
          Or view all download options &amp; QR code →
        </a>
      </div>
    </div>
  );
};

export default DownloadNotification;
