import React, { useState, useEffect } from 'react';
import './AppUpdateNotifier.css';

const CURRENT_APP_VERSION = '1.0.0';

// Clean download endpoint on our API — redirects to the APK on the EAS CDN so
// the browser downloads the file directly instead of showing the raw URL.
const API_BASE =
  import.meta.env.VITE_API_URL || 'https://axx-spaces-backend-1.onrender.com/api';
const DOWNLOAD_URL = `${API_BASE}/app/download`;

export default function AppUpdateNotifier() {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetch('/downloads/version.json?t=' + Date.now())
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch version manifest');
        return res.json();
      })
      .then((data) => {
        const dismissedVersion = localStorage.getItem('dismissed_app_version');
        if (data && data.latestVersion && data.latestVersion !== dismissedVersion) {
          if (isNewerVersion(data.latestVersion, CURRENT_APP_VERSION)) {
            setUpdateInfo(data);
            setIsVisible(true);
          }
        }
      })
      .catch(() => {});
  }, []);

  const isNewerVersion = (latest, current) => {
    const lParts = latest.split('.').map(Number);
    const cParts = current.split('.').map(Number);
    for (let i = 0; i < Math.max(lParts.length, cParts.length); i++) {
      const l = lParts[i] || 0;
      const c = cParts[i] || 0;
      if (l > c) return true;
      if (l < c) return false;
    }
    return false;
  };

  const handleUpdate = () => {
    // Trigger a direct file download via a temporary anchor instead of
    // navigating, so the APK saves to the device and the page stays put.
    const link = document.createElement('a');
    link.href = DOWNLOAD_URL;
    link.download = 'Axxspace.apk';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDismiss = () => {
    if (updateInfo?.latestVersion) {
      localStorage.setItem('dismissed_app_version', updateInfo.latestVersion);
    }
    setIsVisible(false);
  };

  if (!isVisible || !updateInfo) return null;

  return (
    <div className="app-update-notifier-container" role="alert">
      <div className="app-update-notifier-compact">
        <div className="app-update-notifier-text">
          <span className="app-update-title">Update Available</span>
          <span className="app-update-version">v{updateInfo.latestVersion}</span>
        </div>
        <div className="app-update-notifier-btns">
          <button className="app-update-btn-update" onClick={handleUpdate}>
            Update
          </button>
          <button className="app-update-btn-later" onClick={handleDismiss} title="Dismiss">
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
