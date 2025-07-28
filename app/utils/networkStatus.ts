import NetInfo from '@react-native-community/netinfo';
import { FirebaseStorageService } from '../services/FirebaseStorageService';
import { logger } from './logger';

export class NetworkStatusManager {
  private static isInitialized = false;
  private static unsubscribe: (() => void) | null = null;

  static initialize(): void {
    if (this.isInitialized) {
      return;
    }

    this.unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected && state.isInternetReachable;
      
      logger.info('NETWORK', `Network status changed: ${isConnected ? 'online' : 'offline'}`);
      
      // Update Firebase service
      FirebaseStorageService.setOnlineStatus(isConnected || false);
      
      if (isConnected) {
        // Force sync when coming back online
        this.performOnlineSync();
      }
    });

    this.isInitialized = true;
    logger.info('NETWORK', 'Network status monitoring initialized');
  }

  static cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.isInitialized = false;
    logger.info('NETWORK', 'Network status monitoring cleaned up');
  }

  private static async performOnlineSync(): Promise<void> {
    try {
      logger.info('NETWORK', 'Performing online sync...');
      const result = await FirebaseStorageService.forceSyncWithFirebase();
      
      if (result.success) {
        logger.info('NETWORK', 'Online sync completed successfully');
      } else {
        logger.error('NETWORK', 'Online sync failed', result.error);
      }
    } catch (error) {
      logger.error('NETWORK', 'Online sync error', error);
    }
  }

  static async getCurrentNetworkStatus(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected && state.isInternetReachable || false;
    } catch (error) {
      logger.error('NETWORK', 'Failed to get network status', error);
      return false;
    }
  }
}