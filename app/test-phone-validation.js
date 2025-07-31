/**
 * Test phone number validation with various formats
 */

const testPhoneValidation = async () => {
  console.log('\n[PHONE TEST] Testing phone number validation...');
  
  try {
    const { SecurePhoneAuthService } = await import('./services/SecurePhoneAuthService');
    
    // Test cases with various phone number formats
    const testCases = [
      // US numbers
      { input: '1234567890', expected: true, description: 'US 10 digits' },
      { input: '+1234567890', expected: true, description: 'US with +' },
      { input: '11234567890', expected: true, description: 'US with country code 1' },
      { input: '+11234567890', expected: true, description: 'US with +1' },
      { input: '(123) 456-7890', expected: true, description: 'US formatted' },
      { input: '123-456-7890', expected: true, description: 'US with dashes' },
      
      // French numbers
      { input: '612345678', expected: true, description: 'France 9 digits' },
      { input: '0612345678', expected: true, description: 'France with leading 0' },
      { input: '+33612345678', expected: true, description: 'France with +33' },
      { input: '33612345678', expected: true, description: 'France with 33' },
      
      // UK numbers
      { input: '7123456789', expected: true, description: 'UK mobile 10 digits' },
      { input: '07123456789', expected: true, description: 'UK with leading 0' },
      { input: '+447123456789', expected: true, description: 'UK with +44' },
      { input: '447123456789', expected: true, description: 'UK with 44' },
      
      // Invalid numbers
      { input: '123', expected: false, description: 'Too short' },
      { input: '12345678901234567890', expected: false, description: 'Too long' },
      { input: 'abcdefghij', expected: false, description: 'Letters only' },
      { input: '', expected: false, description: 'Empty string' },
      { input: '+', expected: false, description: 'Plus only' },
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const testCase of testCases) {
      console.log(`\n[PHONE TEST] Testing: "${testCase.input}" (${testCase.description})`);
      
      const result = SecurePhoneAuthService.validatePhoneNumber(testCase.input);
      const success = result.isValid === testCase.expected;
      
      if (success) {
        console.log(`[PHONE TEST] ✅ PASS - Valid: ${result.isValid}, Country: ${result.country || 'N/A'}, Formatted: ${result.formatted || 'N/A'}`);
        passed++;
      } else {
        console.log(`[PHONE TEST] ❌ FAIL - Expected: ${testCase.expected}, Got: ${result.isValid}`);
        failed++;
      }
    }
    
    console.log(`\n[PHONE TEST] ========================================`);
    console.log(`[PHONE TEST] VALIDATION TEST RESULTS`);
    console.log(`[PHONE TEST] ========================================`);
    console.log(`[PHONE TEST] Passed: ${passed}`);
    console.log(`[PHONE TEST] Failed: ${failed}`);
    console.log(`[PHONE TEST] Total: ${testCases.length}`);
    console.log(`[PHONE TEST] Success Rate: ${Math.round((passed / testCases.length) * 100)}%`);
    console.log(`[PHONE TEST] ========================================`);
    
    return failed === 0;
    
  } catch (error) {
    console.error('[PHONE TEST] ❌ Phone validation test failed:', error);
    return false;
  }
};

// Test formatting function
const testPhoneFormatting = () => {
  console.log('\n[FORMAT TEST] Testing phone number formatting...');
  
  const formatPhoneNumber = (text) => {
    // Clean the input - remove all non-digit characters except +
    let cleaned = text.replace(/[^\d+]/g, '');
    
    // If it already starts with +, return as-is
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    
    // Remove any leading zeros
    cleaned = cleaned.replace(/^0+/, '');
    
    // Auto-format based on length and patterns
    if (cleaned.length === 10 && /^[2-9]/.test(cleaned)) {
      // US/Canada format: 10 digits starting with 2-9
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      // US/Canada with country code
      return `+${cleaned}`;
    } else if (cleaned.length === 9 && /^[1-9]/.test(cleaned)) {
      // France format: 9 digits
      return `+33${cleaned}`;
    } else if (cleaned.length === 10 && /^[1-9]/.test(cleaned)) {
      // UK format: 10 digits
      return `+44${cleaned}`;
    } else if (cleaned.length > 0) {
      // Default: add + if not present
      return `+${cleaned}`;
    }
    
    return text;
  };
  
  const formatTests = [
    { input: '1234567890', expected: '+11234567890' },
    { input: '(123) 456-7890', expected: '+11234567890' },
    { input: '612345678', expected: '+33612345678' },
    { input: '0612345678', expected: '+33612345678' },
    { input: '7123456789', expected: '+447123456789' },
    { input: '+11234567890', expected: '+11234567890' },
    { input: '11234567890', expected: '+11234567890' },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of formatTests) {
    const result = formatPhoneNumber(test.input);
    const success = result === test.expected;
    
    console.log(`[FORMAT TEST] Input: "${test.input}" → Output: "${result}" (Expected: "${test.expected}") ${success ? '✅' : '❌'}`);
    
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log(`\n[FORMAT TEST] Results: ${passed}/${formatTests.length} passed`);
  return failed === 0;
};

// Export test functions
export { testPhoneValidation, testPhoneFormatting };

console.log('[TEST] Phone validation test module loaded');