// API Configuration
import { CONFIG } from '../config';

export const API_URL = CONFIG.API_URL;

// Create an axios-like fetch wrapper with authentication
export const apiCall = async (endpoint, options = {}) => {
  const { useAuth = true, ...fetchOptions } = options;

  const headers = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // Add auth token if required
  if (useAuth) {
    try {
      const token = await getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
  }

  const config = {
    ...fetchOptions,
    headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Helper to get auth token
const getAuthToken = async () => {
  try {
    const SecureStore = require('expo-secure-store');
    return await SecureStore.getItemAsync('token');
  } catch (error) {
    console.error('Error getting token from secure store:', error);
    return null;
  }
};

// Specific API methods
export const authAPI = {
  login: (email, password, role) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
      useAuth: false,
    }),

  register: (formData) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
      useAuth: false,
    }),

  logout: () =>
    apiCall('/auth/logout', { method: 'POST' }),
};

export const propertyAPI = {
  getProperties: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/properties?${queryString}`);
  },

  getProperty: (id) =>
    apiCall(`/properties/${id}`),

  createProperty: (propertyData) =>
    apiCall('/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    }),

  updateProperty: (id, propertyData) =>
    apiCall(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(propertyData),
    }),

  deleteProperty: (id) =>
    apiCall(`/properties/${id}`, { method: 'DELETE' }),
};

export const tourismAPI = {
  getListings: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/tourism/listings?${queryString}`);
  },

  getListing: (id) =>
    apiCall(`/tourism/listings/${id}`),

  createListing: (listingData) =>
    apiCall('/tourism/listings', {
      method: 'POST',
      body: JSON.stringify(listingData),
    }),
};

export const businessAPI = {
  getBusinesses: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/business?${queryString}`);
  },

  getBusiness: (id) =>
    apiCall(`/business/${id}`),

  createBusiness: (businessData) =>
    apiCall('/business', {
      method: 'POST',
      body: JSON.stringify(businessData),
    }),
};

export const materialsAPI = {
  getMaterials: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/materials?${queryString}`);
  },

  getMaterial: (id) =>
    apiCall(`/materials/${id}`),
};

export const moversAPI = {
  getMovers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/movers?${queryString}`);
  },

  getMover: (id) =>
    apiCall(`/movers/${id}`),
};

export const userAPI = {
  getProfile: () =>
    apiCall('/profile/me'),

  updateProfile: (profileData) =>
    apiCall('/profile/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  getFavorites: () =>
    apiCall('/favorites'),

  addFavorite: (itemId, itemType) =>
    apiCall('/favorites', {
      method: 'POST',
      body: JSON.stringify({ itemId, itemType }),
    }),

  removeFavorite: (itemId) =>
    apiCall(`/favorites/${itemId}`, { method: 'DELETE' }),
};

export const notificationAPI = {
  getNotifications: () =>
    apiCall('/notifications'),

  markAsRead: (notificationId) =>
    apiCall(`/notifications/${notificationId}/read`, { method: 'PUT' }),
};

export const walletAPI = {
  getBalance: () =>
    apiCall('/wallet/balance'),

  getTransactions: () =>
    apiCall('/wallet/transactions'),
};
