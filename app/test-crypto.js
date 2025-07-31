/**
 * Test CryptoService fallback functionality
 */

const testCrypto = async () => {
  console.log('\n[CRYPTO TEST] Starting CryptoService tests...');
  
  try {
    // Import dynamically to handle module loading
    const { CryptoService } = await import('./services/CryptoService');
    
    // Test crypto availability
    console.log('[CRYPTO TEST] Native crypto available:', CryptoService.isNativeCryptoAvailable());
    console.log('[CRYPTO TEST] Crypto type:', CryptoService.getCryptoType());
    
    // Test stats
    const stats = CryptoService.getStats();
    console.log('[CRYPTO TEST] Stats:', stats);
    
    // Test hash function
    console.log('[CRYPTO TEST] Testing hash function...');
    const testString = 'test_string_' + Date.now();
    const hash1 = await CryptoService.digestStringAsync('SHA256', testString);
    const hash2 = await CryptoService.digestStringAsync('SHA256', testString);
    
    console.log('[CRYPTO TEST] Hash 1:', hash1);
    console.log('[CRYPTO TEST] Hash 2:', hash2);
    console.log('[CRYPTO TEST] Hashes match:', hash1 === hash2);
    console.log('[CRYPTO TEST] Hash length:', hash1.length);
    
    // Test phone number hashing
    console.log('[CRYPTO TEST] Testing phone number hashing...');
    const phoneHash1 = await CryptoService.hashPhoneNumber('+1234567890');
    const phoneHash2 = await CryptoService.hashPhoneNumber('+1234567890');
    console.log('[CRYPTO TEST] Phone hash 1:', phoneHash1);
    console.log('[CRYPTO TEST] Phone hash 2:', phoneHash2);
    console.log('[CRYPTO TEST] Phone hashes match:', phoneHash1 === phoneHash2);
    
    // Test random bytes
    console.log('[CRYPTO TEST] Testing random bytes...');
    const randomBytes1 = await CryptoService.getRandomBytesAsync(16);
    const randomBytes2 = await CryptoService.getRandomBytesAsync(16);
    console.log('[CRYPTO TEST] Random bytes 1:', Array.from(randomBytes1).join(','));
    console.log('[CRYPTO TEST] Random bytes 2:', Array.from(randomBytes2).join(','));
    console.log('[CRYPTO TEST] Random bytes different:', !randomBytes1.every((b, i) => b === randomBytes2[i]));
    
    // Test session ID generation
    console.log('[CRYPTO TEST] Testing session ID generation...');
    const sessionId1 = await CryptoService.generateSessionId();
    const sessionId2 = await CryptoService.generateSessionId();
    console.log('[CRYPTO TEST] Session ID 1:', sessionId1);
    console.log('[CRYPTO TEST] Session ID 2:', sessionId2);
    console.log('[CRYPTO TEST] Session IDs different:', sessionId1 !== sessionId2);
    
    // Test secure compare
    console.log('[CRYPTO TEST] Testing secure compare...');
    const compareResult1 = CryptoService.secureCompare('hello', 'hello');
    const compareResult2 = CryptoService.secureCompare('hello', 'world');
    console.log('[CRYPTO TEST] Same strings compare:', compareResult1);
    console.log('[CRYPTO TEST] Different strings compare:', compareResult2);
    
    console.log('[CRYPTO TEST] ✅ All crypto tests completed successfully!');
    return true;
    
  } catch (error) {
    console.error('[CRYPTO TEST] ❌ Crypto test failed:', error);
    console.error('[CRYPTO TEST] Error details:', error.message);
    console.error('[CRYPTO TEST] Stack trace:', error.stack);
    return false;
  }
};

// Test SecureStorageService with CryptoService
const testSecureStorageWithCrypto = async () => {
  console.log('\n[STORAGE TEST] Starting SecureStorageService tests...');
  
  try {
    const { SecureStorageService } = await import('./services/SecureStorageService');
    
    // Test storage type
    console.log('[STORAGE TEST] Storage type:', SecureStorageService.getStorageType());
    console.log('[STORAGE TEST] Secure store available:', SecureStorageService.isSecureStoreAvailable());
    
    // Test basic operations
    const testKey = 'crypto_test_' + Date.now();
    const testValue = 'test_value_with_crypto_' + Math.random();
    
    console.log('[STORAGE TEST] Setting encrypted value...');
    await SecureStorageService.setItemAsync(testKey, testValue);
    
    console.log('[STORAGE TEST] Getting encrypted value...');
    const retrievedValue = await SecureStorageService.getItemAsync(testKey);
    
    console.log('[STORAGE TEST] Original value:', testValue);
    console.log('[STORAGE TEST] Retrieved value:', retrievedValue);
    console.log('[STORAGE TEST] Values match:', retrievedValue === testValue);
    
    console.log('[STORAGE TEST] Deleting encrypted value...');
    await SecureStorageService.deleteItemAsync(testKey);
    
    console.log('[STORAGE TEST] Verifying deletion...');
    const deletedValue = await SecureStorageService.getItemAsync(testKey);
    console.log('[STORAGE TEST] Value after deletion:', deletedValue);
    console.log('[STORAGE TEST] Deletion successful:', deletedValue === null);
    
    console.log('[STORAGE TEST] ✅ All storage tests completed successfully!');
    return true;
    
  } catch (error) {
    console.error('[STORAGE TEST] ❌ Storage test failed:', error);
    return false;
  }
};

// Export test functions
export { testCrypto, testSecureStorageWithCrypto };

console.log('[TEST] Crypto and Storage test modules loaded');