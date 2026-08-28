// App Configuration
export const CONFIG = {
  // API Configuration - Updated to work with existing backend
  API_URL: __DEV__
    ? 'http://localhost:1001/api'
    : 'https://axxspace.com/api',

  // App Configuration
  APP_NAME: 'AXX Spaces',
  APP_VERSION: '1.0.0',

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
