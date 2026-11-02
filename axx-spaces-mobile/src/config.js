// App Configuration
export const CONFIG = {
  // API Configuration - Updated to work with existing backend
  API_URL: __DEV__
    ? 'http://localhost:1001/api'
    : 'https://axxspace.com/api',

  // Web App URL Configuration
  WEBSITE_URL: 'https://axxspace.com',

  // App Configuration
  APP_NAME: 'Axxspace',
  APP_VERSION: '1.1.0',
  APP_VERSION_CODE: 3,

  // Self-update manifest for the app SHELL (site content updates are automatic
  // because the WebView always loads the live site).
  VERSION_MANIFEST_URL: 'https://axxspace.com/downloads/version.json',
  // Same EAS artifact the web download page and version.json point to (the
  // local /downloads APK files were removed — Vercel can't carry the binary).
  DEFAULT_APK_URL: 'https://expo.dev/artifacts/eas/tfbHKWKT1XUGv5tHV7rAnRi59n5fPcRWqFWZGS-QsU4.apk',

  // Feature Flags
  FEATURES: {
    ENABLE_PUSH_NOTIFICATIONS: true,
    ENABLE_LOCATION_SERVICES: true,
    ENABLE_CAMERA: true,
    ENABLE_OFFLINE_MODE: false,
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },

  // Image Upload
  UPLOAD: {
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
    MAX_IMAGES_PER_UPLOAD: 10,
  },

  // Cache Configuration
  CACHE: {
    DEFAULT_TTL: 3600000, // 1 hour in milliseconds
    IMAGE_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
  },
};

export default CONFIG;
