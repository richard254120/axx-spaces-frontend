import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../config';

export const cacheService = {
  // Get cached data
  async get(key) {
    try {
      const cachedData = await AsyncStorage.getItem(key);
      if (!cachedData) return null;

      const { data, timestamp } = JSON.parse(cachedData);
      const isExpired = Date.now() - timestamp > CONFIG.CACHE.DEFAULT_TTL;

      if (isExpired) {
        await this.remove(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  },

  // Set cached data
  async set(key, data, customTTL = null) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl: customTTL || CONFIG.CACHE.DEFAULT_TTL,
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
      return true;
    } catch (error) {
      console.error('Error setting cached data:', error);
      return false;
    }
  },

  // Remove cached data
  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing cached data:', error);
      return false;
    }
  },

  // Clear all cache
  async clear() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  },

  // Get cache size
  async getCacheSize() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      let totalSize = 0;

      for (const key of cacheKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          totalSize += data.length;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 0;
    }
  },

  // Clear expired cache entries
  async clearExpired() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));

      for (const key of cacheKeys) {
        const cachedData = await AsyncStorage.getItem(key);
        if (cachedData) {
          const { timestamp, ttl } = JSON.parse(cachedData);
          const isExpired = Date.now() - timestamp > ttl;
          
          if (isExpired) {
            await this.remove(key);
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error clearing expired cache:', error);
      return false;
    }
  },

  // Cache API response with automatic TTL management
  async cacheApiResponse(endpoint, data, ttl = null) {
    const cacheKey = `cache_api_${endpoint}`;
    return await this.set(cacheKey, data, ttl);
  },

  // Get cached API response
  async getCachedApiResponse(endpoint) {
    const cacheKey = `cache_api_${endpoint}`;
    return await this.get(cacheKey);
  },

  // Invalidate cache by pattern
  async invalidatePattern(pattern) {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const matchingKeys = keys.filter(key => key.includes(pattern));
      
      if (matchingKeys.length > 0) {
        await AsyncStorage.multiRemove(matchingKeys);
      }
      
      return true;
    } catch (error) {
      console.error('Error invalidating cache pattern:', error);
      return false;
    }
  },

  // Prefetch data for offline use
  async prefetchData(endpoints, apiCallFunction) {
    try {
      const results = await Promise.all(
        endpoints.map(async (endpoint) => {
          try {
            const data = await apiCallFunction(endpoint);
            await this.cacheApiResponse(endpoint, data);
            return { endpoint, success: true };
          } catch (error) {
            console.error(`Error prefetching ${endpoint}:`, error);
            return { endpoint, success: false, error };
          }
        })
      );

      return results;
    } catch (error) {
      console.error('Error prefetching data:', error);
      return [];
    }
  },

  // Get all cached keys
  async getAllCacheKeys() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.filter(key => key.startsWith('cache_'));
    } catch (error) {
      console.error('Error getting cache keys:', error);
      return [];
    }
  },

  // Get cache statistics
  async getCacheStats() {
    try {
      const keys = await this.getAllCacheKeys();
      const size = await this.getCacheSize();
      
      return {
        totalKeys: keys.length,
        totalSize: size,
        totalSizeMB: (size / (1024 * 1024)).toFixed(2),
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        totalKeys: 0,
        totalSize: 0,
        totalSizeMB: '0.00',
      };
    }
  },
};

export default cacheService;
