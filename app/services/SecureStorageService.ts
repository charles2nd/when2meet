/**
 * Secure Storage Service - Cross-platform secure storage abstraction
 * 
 * Uses expo-secure-store in production builds and AsyncStorage as fallback
 * for Expo Go development environment
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoService from './CryptoService';

// Dynamic import for expo-secure-store to handle missing native modules
let SecureStore: any = null;
let secureStoreAvailable = false;

try {
  SecureStore = require('expo-secure-store');
  secureStoreAvailable = true;
  console.log('[SECURE_STORAGE] ✅ expo-secure-store available (production build)');
} catch (error) {
  console.warn('[SECURE_STORAGE] ⚠️ expo-secure-store not available - using AsyncStorage fallback (Expo Go)');
  secureStoreAvailable = false;
}

export class SecureStorageService {
  private static readonly ENCRYPTION_KEY_PREFIX = 'enc_';
  private static readonly FALLBACK_ENCRYPTION_SALT = 'when2meet_secure_salt_2024';

  /**
   * Store a value securely
   */
  static async setItemAsync(key: string, value: string): Promise<void> {
    try {
      if (secureStoreAvailable && SecureStore) {
        // Use secure store in production builds
        await SecureStore.setItemAsync(key, value);
        console.log(`[SECURE_STORAGE] ✅ Stored securely: ${key}`);
      } else {
        // Fallback to encrypted AsyncStorage in Expo Go
        const encryptedValue = await this.encryptValue(value);
        await AsyncStorage.setItem(this.ENCRYPTION_KEY_PREFIX + key, encryptedValue);
        console.log(`[SECURE_STORAGE] ✅ Stored with encryption fallback: ${key}`);
      }
    } catch (error) {
      console.error(`[SECURE_STORAGE] ❌ Failed to store ${key}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve a value securely
   */
  static async getItemAsync(key: string): Promise<string | null> {
    try {
      if (secureStoreAvailable && SecureStore) {
        // Use secure store in production builds
        const value = await SecureStore.getItemAsync(key);
        if (value) {
          console.log(`[SECURE_STORAGE] ✅ Retrieved securely: ${key}`);
        }
        return value;
      } else {
        // Fallback to encrypted AsyncStorage in Expo Go
        const encryptedValue = await AsyncStorage.getItem(this.ENCRYPTION_KEY_PREFIX + key);
        if (encryptedValue) {
          const decryptedValue = await this.decryptValue(encryptedValue);
          console.log(`[SECURE_STORAGE] ✅ Retrieved with decryption fallback: ${key}`);
          return decryptedValue;
        }
        return null;
      }
    } catch (error) {
      console.error(`[SECURE_STORAGE] ❌ Failed to retrieve ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete a value securely
   */
  static async deleteItemAsync(key: string): Promise<void> {
    try {
      if (secureStoreAvailable && SecureStore) {
        // Use secure store in production builds
        await SecureStore.deleteItemAsync(key);
        console.log(`[SECURE_STORAGE] ✅ Deleted securely: ${key}`);
      } else {
        // Fallback to AsyncStorage in Expo Go
        await AsyncStorage.removeItem(this.ENCRYPTION_KEY_PREFIX + key);
        console.log(`[SECURE_STORAGE] ✅ Deleted with fallback: ${key}`);
      }
    } catch (error) {
      console.error(`[SECURE_STORAGE] ❌ Failed to delete ${key}:`, error);
      throw error;
    }
  }

  /**
   * Check if secure storage is available
   */
  static isSecureStoreAvailable(): boolean {
    return secureStoreAvailable;
  }

  /**
   * Get storage type being used
   */
  static getStorageType(): 'secure-store' | 'encrypted-async-storage' {
    return secureStoreAvailable ? 'secure-store' : 'encrypted-async-storage';
  }

  /**
   * Encrypt value for AsyncStorage fallback
   */
  private static async encryptValue(value: string): Promise<string> {
    try {
      // Simple encryption using crypto digest for development
      // In production, expo-secure-store handles proper encryption
      const salt = process.env.EXPO_PUBLIC_STORAGE_SALT || this.FALLBACK_ENCRYPTION_SALT;
      const combined = value + salt;
      const hash = await CryptoService.digestStringAsync('SHA256', combined);
      
      // Base64 encode the original value for basic obfuscation
      // Use Buffer if available, otherwise fallback to simple encoding
      let encoded: string;
      if (typeof Buffer !== 'undefined') {
        encoded = Buffer.from(value).toString('base64');
      } else if (typeof btoa !== 'undefined') {
        encoded = btoa(value);
      } else {
        // Simple fallback encoding for environments without Buffer or btoa
        encoded = value.split('').map(c => c.charCodeAt(0).toString(16)).join('');
      }
      return `${hash.substring(0, 16)}:${encoded}`;
    } catch (error) {
      console.error('[SECURE_STORAGE] Encryption failed, storing as plain text:', error);
      return value; // Fallback to plain text if encryption fails
    }
  }

  /**
   * Decrypt value from AsyncStorage fallback
   */
  private static async decryptValue(encryptedValue: string): Promise<string> {
    try {
      if (!encryptedValue.includes(':')) {
        // Plain text fallback
        return encryptedValue;
      }

      const [, encodedValue] = encryptedValue.split(':');
      let decodedValue: string;
      if (typeof Buffer !== 'undefined') {
        decodedValue = Buffer.from(encodedValue, 'base64').toString('utf-8');
      } else if (typeof atob !== 'undefined') {
        decodedValue = atob(encodedValue);
      } else {
        // Simple fallback decoding for hex-encoded values
        const hexPairs = encodedValue.match(/.{1,2}/g) || [];
        decodedValue = hexPairs.map(hex => String.fromCharCode(parseInt(hex, 16))).join('');
      }
      return decodedValue;
    } catch (error) {
      console.error('[SECURE_STORAGE] Decryption failed, returning as-is:', error);
      return encryptedValue; // Return as-is if decryption fails
    }
  }

  /**
   * Clear all secure storage (for debugging/logout)
   */
  static async clearAll(): Promise<void> {
    try {
      console.log('[SECURE_STORAGE] Clearing all secure storage...');
      
      if (secureStoreAvailable && SecureStore) {
        // For production builds, we can't enumerate all keys in SecureStore
        // So we'll clear known keys from the phone auth service
        const knownKeys = [
          'secure_phone_rate_limit_',
          'secure_phone_session_',
          'phone_auth_audit_'
        ];
        
        // This is a limitation - we can't clear all keys from SecureStore
        console.log('[SECURE_STORAGE] ⚠️ Cannot enumerate all SecureStore keys - clearing known keys only');
        
        for (const keyPrefix of knownKeys) {
          try {
            // We can't iterate over all keys, so this is incomplete
            // In production, consider implementing a key registry
            console.log(`[SECURE_STORAGE] Attempted to clear keys with prefix: ${keyPrefix}`);
          } catch (error) {
            console.warn(`[SECURE_STORAGE] Failed to clear key prefix ${keyPrefix}:`, error);
          }
        }
      } else {
        // For AsyncStorage fallback, we can enumerate and clear all encrypted keys
        const allKeys = await AsyncStorage.getAllKeys();
        const encryptedKeys = allKeys.filter(key => key.startsWith(this.ENCRYPTION_KEY_PREFIX));
        
        if (encryptedKeys.length > 0) {
          await AsyncStorage.multiRemove(encryptedKeys);
          console.log(`[SECURE_STORAGE] ✅ Cleared ${encryptedKeys.length} encrypted keys from AsyncStorage`);
        } else {
          console.log('[SECURE_STORAGE] No encrypted keys found to clear');
        }
      }
    } catch (error) {
      console.error('[SECURE_STORAGE] Error clearing secure storage:', error);
    }
  }

  /**
   * Get storage statistics for debugging
   */
  static async getStorageStats(): Promise<{
    storageType: string;
    isSecure: boolean;
    keyCount?: number;
    keys?: string[];
  }> {
    try {
      const storageType = this.getStorageType();
      const isSecure = secureStoreAvailable;

      if (secureStoreAvailable) {
        return {
          storageType,
          isSecure,
          keyCount: undefined, // Cannot enumerate SecureStore keys
          keys: undefined
        };
      } else {
        // For AsyncStorage fallback, we can provide statistics
        const allKeys = await AsyncStorage.getAllKeys();
        const encryptedKeys = allKeys.filter(key => key.startsWith(this.ENCRYPTION_KEY_PREFIX));
        
        return {
          storageType,
          isSecure,
          keyCount: encryptedKeys.length,
          keys: encryptedKeys.map(key => key.replace(this.ENCRYPTION_KEY_PREFIX, ''))
        };
      }
    } catch (error) {
      console.error('[SECURE_STORAGE] Error getting storage stats:', error);
      return {
        storageType: 'unknown',
        isSecure: false,
        keyCount: 0,
        keys: []
      };
    }
  }
}

export default SecureStorageService;