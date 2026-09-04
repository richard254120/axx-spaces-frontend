import React, { useState, useEffect } from 'react';
import './AppUpdateNotifier.css';

const CURRENT_APP_VERSION = '1.0.0';

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
    if (updateInfo?.downloadUrl) {
      window.location.href = updateInfo.downloadUrl;
    } else {
      window.location.href = '/downloads/axx-spaces-mobile-v1.0.1.apk';
    }
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
        <span className="app-update-notifier-icon">🚀</span>
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
