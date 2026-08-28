import * as Location from 'expo-location';
import { CONFIG } from '../config';

export const locationService = {
  // Request location permissions
  async requestLocationPermissions() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  },

  // Get current location
  async getCurrentLocation() {
    try {
      const hasPermission = await this.requestLocationPermissions();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        altitudeAccuracy: location.coords.altitudeAccuracy,
        heading: location.coords.heading,
        speed: location.coords.speed,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      throw error;
    }
  },

  // Get location address (reverse geocoding)
  async getAddressFromCoordinates(latitude, longitude) {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (results.length > 0) {
        const address = results[0];
        return {
          street: address.street,
          city: address.city,
          region: address.region,
          country: address.country,
          postalCode: address.postalCode,
          formattedAddress: `${address.street}, ${address.city}, ${address.region}`,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting address from coordinates:', error);
      throw error;
    }
  },

  // Get coordinates from address (geocoding)
  async getCoordinatesFromAddress(address) {
    try {
      const results = await Location.geocodeAsync(address);

      if (results.length > 0) {
        return {
          latitude: results[0].latitude,
          longitude: results[0].longitude,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting coordinates from address:', error);
      throw error;
    }
  },

  // Calculate distance between two coordinates (in kilometers)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  },

  // Convert degrees to radians
  toRad(degrees) {
    return degrees * (Math.PI / 180);
  },

  // Start location updates (for tracking)
  async startLocationUpdates(callback) {
    try {
      const hasPermission = await this.requestLocationPermissions();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10, // Update every 10 meters
          timeInterval: 5000, // Update every 5 seconds
        },
        callback
      );

      return subscription;
    } catch (error) {
      console.error('Error starting location updates:', error);
      throw error;
    }
  },

  // Stop location updates
  stopLocationUpdates(subscription) {
    if (subscription) {
      subscription.remove();
    }
  },

  // Get region for map display
  getMapRegion(latitude, longitude, latitudeDelta = 0.01, longitudeDelta = 0.01) {
    return {
      latitude,
      longitude,
      latitudeDelta,
      longitudeDelta,
    };
  },

  // Check if location services are enabled
  async isLocationEnabled() {
    const enabled = await Location.hasServicesEnabledAsync();
    return enabled;
  },

  // Open device location settings
  async openLocationSettings() {
    // This would require additional implementation
    // For now, it's a placeholder
    console.log('Opening location settings...');
  },
};

export default locationService;
