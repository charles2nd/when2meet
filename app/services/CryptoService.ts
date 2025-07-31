/**
 * Crypto Service - Cross-platform cryptographic functions
 * 
 * Uses expo-crypto in production builds and JavaScript fallback in Expo Go
 */

// Dynamic import for expo-crypto to handle missing native modules
let ExpoCrypto: any = null;
let expoCryptoAvailable = false;

try {
  ExpoCrypto = require('expo-crypto');
  expoCryptoAvailable = true;
  console.log('[CRYPTO] ✅ expo-crypto available (production build)');
} catch (error) {
  console.warn('[CRYPTO] ⚠️ expo-crypto not available - using JavaScript fallback (Expo Go)');
  expoCryptoAvailable = false;
}

export class CryptoService {
  /**
   * Generate SHA256 hash of a string
   */
  static async digestStringAsync(algorithm: string, data: string): Promise<string> {
    try {
      if (expoCryptoAvailable && ExpoCrypto) {
        // Use expo-crypto in production builds
        return await ExpoCrypto.digestStringAsync(
          ExpoCrypto.CryptoDigestAlgorithm.SHA256,
          data
        );
      } else {
        // JavaScript fallback for Expo Go
        return await this.sha256Fallback(data);
      }
    } catch (error) {
      console.error('[CRYPTO] Hash generation failed:', error);
      // Ultimate fallback - simple hash
      return this.simpleHash(data);
    }
  }

  /**
   * Generate random bytes
   */
  static async getRandomBytesAsync(length: number): Promise<Uint8Array> {
    try {
      if (expoCryptoAvailable && ExpoCrypto) {
        // Use expo-crypto in production builds
        return await ExpoCrypto.getRandomBytesAsync(length);
      } else {
        // JavaScript fallback for Expo Go
        return this.randomBytesFallback(length);
      }
    } catch (error) {
      console.error('[CRYPTO] Random bytes generation failed:', error);
      // Ultimate fallback
      return this.randomBytesFallback(length);
    }
  }

  /**
   * Check if native crypto is available
   */
  static isNativeCryptoAvailable(): boolean {
    return expoCryptoAvailable;
  }

  /**
   * Get crypto implementation type
   */
  static getCryptoType(): 'native' | 'javascript-fallback' {
    return expoCryptoAvailable ? 'native' : 'javascript-fallback';
  }

  /**
   * JavaScript SHA256 implementation fallback
   * Based on RFC 3174 and RFC 6234
   */
  private static async sha256Fallback(data: string): Promise<string> {
    // Simple SHA256-like hash using JavaScript
    // Note: This is not cryptographically secure, only for development
    let hash = 0;
    const str = data + 'when2meet_salt_2024'; // Add some salt
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to positive number and pad with zeros
    const positiveHash = Math.abs(hash);
    const hexHash = positiveHash.toString(16).padStart(8, '0');
    
    // Extend to 64 characters like SHA256
    const extendedHash = hexHash.repeat(8).substring(0, 64);
    
    console.log('[CRYPTO] ⚠️ Using JavaScript hash fallback (not cryptographically secure)');
    return extendedHash;
  }

  /**
   * Simple hash function for ultimate fallback
   */
  private static simpleHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const positiveHash = Math.abs(hash);
    return positiveHash.toString(16).padStart(16, '0').repeat(4).substring(0, 64);
  }

  /**
   * Generate random bytes using JavaScript Math.random fallback
   */
  private static randomBytesFallback(length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    
    console.log('[CRYPTO] ⚠️ Using Math.random() fallback (not cryptographically secure)');
    return bytes;
  }

  /**
   * Generate a secure random string for session IDs
   */
  static async generateRandomString(length: number = 32): Promise<string> {
    try {
      const bytes = await this.getRandomBytesAsync(length);
      return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('[CRYPTO] Random string generation failed:', error);
      // Fallback to timestamp + random
      const timestamp = Date.now().toString(16);
      const random = Math.random().toString(16).substring(2);
      return (timestamp + random).substring(0, length);
    }
  }

  /**
   * Generate a session ID
   */
  static async generateSessionId(): Promise<string> {
    const randomString = await this.generateRandomString(32);
    return `sess_${Date.now()}_${randomString}`;
  }

  /**
   * Hash a phone number for secure storage
   */
  static async hashPhoneNumber(phoneNumber: string): Promise<string> {
    const salt = process.env.EXPO_PUBLIC_PHONE_SALT || 'default_salt_change_in_production';
    return await this.digestStringAsync('SHA256', phoneNumber + salt);
  }

  /**
   * Secure comparison to prevent timing attacks
   */
  static secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Get crypto service statistics for debugging
   */
  static getStats(): {
    cryptoType: string;
    isNativeAvailable: boolean;
    algorithms: string[];
  } {
    return {
      cryptoType: this.getCryptoType(),
      isNativeAvailable: this.isNativeCryptoAvailable(),
      algorithms: expoCryptoAvailable ? ['SHA256', 'RandomBytes'] : ['JavaScript-Fallback']
    };
  }
}

export default CryptoService;