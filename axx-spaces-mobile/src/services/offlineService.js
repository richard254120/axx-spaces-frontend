import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cacheService } from './cacheService';
import { apiCall } from './api';

export const offlineService = {
  // Check network connectivity
  async isOnline() {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected && state.isInternetReachable;
    } catch (error) {
      console.error('Error checking network status:', error);
      return false;
    }
  },

  // Fetch with offline fallback
  async fetchWithOfflineFallback(endpoint, options = {}) {
    const isOnline = await this.isOnline();

    if (isOnline) {
      try {
        const data = await apiCall(endpoint, options);
        // Cache the successful response
        await cacheService.cacheApiResponse(endpoint, data);
        return { data, source: 'network' };
      } catch (error) {
        console.error('Network request failed, trying cache:', error);
        // Fall back to cache
        const cachedData = await cacheService.getCachedApiResponse(endpoint);
        if (cachedData) {
          return { data: cachedData, source: 'cache' };
        }
        throw error;
      }
    } else {
      // Offline - try to get from cache
      const cachedData = await cacheService.getCachedApiResponse(endpoint);
      if (cachedData) {
        return { data: cachedData, source: 'cache' };
      }
      throw new Error('No internet connection and no cached data available');
    }
  },

  // Queue offline actions for sync when online
  async queueOfflineAction(action) {
    try {
      const queuedActions = await this.getQueuedActions();
      queuedActions.push({
        ...action,
        id: Date.now(),
        timestamp: Date.now(),
        status: 'pending',
      });
      await this.saveQueuedActions(queuedActions);
      return true;
    } catch (error) {
      console.error('Error queuing offline action:', error);
      return false;
    }
  },

  // Get all queued actions
  async getQueuedActions() {
    try {
      const actions = await AsyncStorage.getItem('offline_queue');
      return actions ? JSON.parse(actions) : [];
    } catch (error) {
      console.error('Error getting queued actions:', error);
      return [];
    }
  },

  // Save queued actions
  async saveQueuedActions(actions) {
    try {
      await AsyncStorage.setItem('offline_queue', JSON.stringify(actions));
      return true;
    } catch (error) {
      console.error('Error saving queued actions:', error);
      return false;
    }
  },

  // Sync queued actions when online
  async syncQueuedActions() {
    try {
      const isOnline = await this.isOnline();
      if (!isOnline) {
        console.log('Not online, skipping sync');
        return { synced: 0, failed: 0 };
      }

      const queuedActions = await this.getQueuedActions();
      let synced = 0;
      let failed = 0;

      for (const action of queuedActions) {
        try {
          await this.executeAction(action);
          synced++;
        } catch (error) {
          console.error('Error syncing action:', error);
          failed++;
        }
      }

      // Clear synced actions
      if (synced > 0) {
        const remainingActions = queuedActions.slice(synced);
        await this.saveQueuedActions(remainingActions);
      }

      return { synced, failed };
    } catch (error) {
      console.error('Error syncing queued actions:', error);
      return { synced: 0, failed: 0 };
    }
  },

  // Execute a queued action
  async executeAction(action) {
    switch (action.type) {
      case 'api_call':
        return await apiCall(action.endpoint, action.options);
      case 'favorite':
        // Handle favorite action
        break;
      case 'message':
        // Handle message action
        break;
      default:
        console.warn('Unknown action type:', action.type);
    }
  },

  // Clear queued actions
  async clearQueuedActions() {
    try {
      await AsyncStorage.removeItem('offline_queue');
      return true;
    } catch (error) {
      console.error('Error clearing queued actions:', error);
      return false;
    }
  },

  // Prefetch essential data for offline use
  async prefetchEssentialData() {
    const essentialEndpoints = [
      '/properties?limit=20',
      '/tourism/listings?limit=10',
      '/business?limit=10',
      '/materials?limit=10',
      '/movers?limit=10',
    ];

    try {
      const results = await cacheService.prefetchData(
        essentialEndpoints,
        (endpoint) => apiCall(endpoint)
      );

      const successful = results.filter(r => r.success).length;
      console.log(`Prefetched ${successful}/${essentialEndpoints.length} endpoints`);

      return results;
    } catch (error) {
      console.error('Error prefetching essential data:', error);
      return [];
    }
  },

  // Get offline storage stats
  async getOfflineStats() {
    try {
      const queuedActions = await this.getQueuedActions();
      const cacheStats = await cacheService.getCacheStats();

      return {
        queuedActions: queuedActions.length,
        ...cacheStats,
      };
    } catch (error) {
      console.error('Error getting offline stats:', error);
      return {
        queuedActions: 0,
        totalKeys: 0,
        totalSize: 0,
        totalSizeMB: '0.00',
      };
    }
  },

  // Setup network listener for auto-sync
  setupNetworkListener(callback) {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        console.log('Network connected, syncing queued actions');
        this.syncQueuedActions().then(callback);
      }
    });

    return unsubscribe;
  },
};

export default offlineService;
