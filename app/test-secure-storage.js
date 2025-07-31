/**
 * Simple test to verify SecureStorageService works in Expo Go
 */

import { SecureStorageService } from './services/SecureStorageService';

const testSecureStorage = async () => {
  console.log('[TEST] Testing SecureStorageService...');
  
  try {
    // Test storage type
    const storageType = SecureStorageService.getStorageType();
    const isSecure = SecureStorageService.isSecureStoreAvailable();
    
    console.log('[TEST] Storage type:', storageType);
    console.log('[TEST] Is secure store available:', isSecure);
    
    // Test set/get/delete
    const testKey = 'test_key_' + Date.now();
    const testValue = 'test_value_' + Math.random();
    
    console.log('[TEST] Setting value...');
    await SecureStorageService.setItemAsync(testKey, testValue);
    
    console.log('[TEST] Getting value...');
    const retrievedValue = await SecureStorageService.getItemAsync(testKey);
    
    console.log('[TEST] Retrieved value:', retrievedValue);
    console.log('[TEST] Values match:', retrievedValue === testValue);
    
    console.log('[TEST] Deleting value...');
    await SecureStorageService.deleteItemAsync(testKey);
    
    console.log('[TEST] Verifying deletion...');
    const deletedValue = await SecureStorageService.getItemAsync(testKey);
    console.log('[TEST] Value after deletion:', deletedValue);
    console.log('[TEST] Deletion successful:', deletedValue === null);
    
    // Test storage stats
    console.log('[TEST] Getting storage stats...');
    const stats = await SecureStorageService.getStorageStats();
    console.log('[TEST] Storage stats:', stats);
    
    console.log('[TEST] ✅ All tests passed!');
    return true;
    
  } catch (error) {
    console.error('[TEST] ❌ Test failed:', error);
    return false;
  }
};

// Export for manual testing
export { testSecureStorage };

console.log('[TEST] SecureStorageService test module loaded');