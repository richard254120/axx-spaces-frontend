import React, { useState, useEffect } from 'react';
import './AppUpdateNotifier.css';

const CURRENT_APP_VERSION = '1.0.0'; // Base reference version

export default function AppUpdateNotifier() {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check for version updates
    fetch('/downloads/version.json?t=' + Date.now())
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch version manifest');
        return res.json();
      })
      .then((data) => {
        const dismissedVersion = localStorage.getItem('dismissed_app_version');
        
        // If server version is greater than installed reference version AND not dismissed
        if (data && data.latestVersion && data.latestVersion !== dismissedVersion) {
          // Compare versions (simple string or numerical check)
          if (isNewerVersion(data.latestVersion, CURRENT_APP_VERSION)) {
            setUpdateInfo(data);
            setIsVisible(true);
          }
        }
      })
      .catch((err) => {
        // Silently ignore network fetch errors for update manifest
      });
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
      <div className="app-update-notifier-card">
        <div className="app-update-notifier-icon">🚀</div>
        <div className="app-update-notifier-content">
          <div className="app-update-notifier-header">
            <h4>App Upgrade Available!</h4>
            <span className="app-update-badge">v{updateInfo.latestVersion}</span>
          </div>
          <p className="app-update-notifier-desc">
            {updateInfo.releaseNotes || 'A new update for AXX Spaces is available with performance improvements.'}
          </p>
        </div>
        <div className="app-update-notifier-actions">
          <button className="app-update-btn-primary" onClick={handleUpdate}>
            Update Now
          </button>
          <button className="app-update-btn-dismiss" onClick={handleDismiss}>
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
