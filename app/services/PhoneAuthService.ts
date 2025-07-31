import { 
  getAuth, 
  signInWithPhoneNumber,
  ConfirmationResult,
  ApplicationVerifier
} from 'firebase/auth';
import { Platform } from 'react-native';
import { auth } from './firebase';

export interface PhoneAuthService {
  validatePhoneNumber: (phoneNumber: string) => boolean;
  formatPhoneNumber: (phoneNumber: string, countryCode?: string) => string;
  sendVerificationCode: (phoneNumber: string, recaptchaVerifier?: ApplicationVerifier) => Promise<ConfirmationResult>;
  verifyCode: (confirmation: ConfirmationResult, code: string) => Promise<any>;
}

/**
 * Phone number validation using international format
 */
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // International format validation: +[country code][number]
  // Must start with + followed by 1-3 digits (country code) and 4-15 total digits
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  const cleanNumber = phoneNumber.replace(/\s+/g, '');
  return phoneRegex.test(cleanNumber);
};

/**
 * Format phone number to international format
 */
export const formatPhoneNumber = (phoneNumber: string, defaultCountryCode: string = '1'): string => {
  // Remove all non-digits
  const digits = phoneNumber.replace(/\D/g, '');
  
  // If already has country code (starts with + or is longer than 10 digits)
  if (phoneNumber.startsWith('+')) {
    return phoneNumber.replace(/\s+/g, '');
  }
  
  // If number is 10 digits, assume it needs country code
  if (digits.length === 10) {
    return `+${defaultCountryCode}${digits}`;
  }
  
  // If number already includes country code
  if (digits.length > 10) {
    return `+${digits}`;
  }
  
  // Default case
  return `+${defaultCountryCode}${digits}`;
};

/**
 * Send SMS verification code to phone number
 * For Expo/React Native, the recaptchaVerifier must be passed from the component
 */
export const sendVerificationCode = async (
  phoneNumber: string, 
  recaptchaVerifier?: ApplicationVerifier
): Promise<ConfirmationResult> => {
  try {
    console.log('[PHONE_AUTH] ========================================');
    console.log('[PHONE_AUTH] SENDING VERIFICATION CODE');
    console.log('[PHONE_AUTH] Phone Number:', phoneNumber);
    console.log('[PHONE_AUTH] Platform:', Platform.OS);
    console.log('[PHONE_AUTH] Has reCAPTCHA verifier:', !!recaptchaVerifier);
    console.log('[PHONE_AUTH] ========================================');
    
    const formattedNumber = formatPhoneNumber(phoneNumber);
    
    if (!validatePhoneNumber(formattedNumber)) {
      throw new Error('Invalid phone number format. Please use international format (+1234567890)');
    }
    
    console.log('[PHONE_AUTH] Formatted number:', formattedNumber);
    
    // For Expo apps, the reCAPTCHA verifier should be passed from the component
    if (!recaptchaVerifier) {
      throw new Error('reCAPTCHA verifier is required for phone authentication in Expo apps');
    }
    
    console.log('[PHONE_AUTH] Sending verification code with reCAPTCHA verifier...');
    const confirmationResult = await signInWithPhoneNumber(auth, formattedNumber, recaptchaVerifier);
    
    console.log('[PHONE_AUTH] ✅ Verification code sent successfully!');
    return confirmationResult;
    
  } catch (error: any) {
    console.error('[PHONE_AUTH] ❌ VERIFICATION CODE SEND FAILED');
    console.error('[PHONE_AUTH] Error code:', error.code);
    console.error('[PHONE_AUTH] Error message:', error.message);
    console.error('[PHONE_AUTH] Full error:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/invalid-phone-number') {
      throw new Error('Invalid phone number format. Please check and try again.');
    } else if (error.code === 'auth/missing-phone-number') {
      throw new Error('Phone number is required.');
    } else if (error.code === 'auth/quota-exceeded') {
      throw new Error('SMS quota exceeded. Please try again later.');
    } else if (error.code === 'auth/user-disabled') {
      throw new Error('This phone number has been disabled.');
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Phone authentication is not enabled. Please contact support.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many requests. Please wait before trying again.');
    } else if (error.message && error.message.includes('reCAPTCHA')) {
      throw new Error('reCAPTCHA verification failed. Please try again.');
    }
    
    console.error('[PHONE_AUTH] ========================================');
    throw error;
  }
};

/**
 * Verify SMS code and complete phone authentication
 */
export const verifyCode = async (confirmation: ConfirmationResult, code: string): Promise<any> => {
  try {
    console.log('[PHONE_AUTH] ========================================');
    console.log('[PHONE_AUTH] VERIFYING SMS CODE');
    console.log('[PHONE_AUTH] Code length:', code.length);
    console.log('[PHONE_AUTH] ========================================');
    
    // Validate code format
    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      throw new Error('Please enter a valid 6-digit verification code.');
    }
    
    console.log('[PHONE_AUTH] Confirming verification code...');
    const result = await confirmation.confirm(code);
    
    if (result.user) {
      console.log('[PHONE_AUTH] ✅ Phone verification successful!');
      console.log('[PHONE_AUTH] User UID:', result.user.uid);
      console.log('[PHONE_AUTH] Phone Number:', result.user.phoneNumber);
      console.log('[PHONE_AUTH] ========================================');
      
      return result;
    } else {
      throw new Error('Verification failed. No user returned.');
    }
    
  } catch (error: any) {
    console.error('[PHONE_AUTH] ❌ VERIFICATION CODE FAILED');
    console.error('[PHONE_AUTH] Error code:', error.code);
    console.error('[PHONE_AUTH] Error message:', error.message);
    
    // Handle specific verification errors
    if (error.code === 'auth/invalid-verification-code') {
      throw new Error('Invalid verification code. Please check and try again.');
    } else if (error.code === 'auth/code-expired') {
      throw new Error('Verification code has expired. Please request a new one.');
    } else if (error.code === 'auth/missing-verification-code') {
      throw new Error('Please enter the verification code.');
    } else if (error.code === 'auth/session-expired') {
      throw new Error('Session expired. Please start over.');
    }
    
    console.error('[PHONE_AUTH] ========================================');
    throw error;
  }
};

/**
 * Demo/Test phone authentication for development
 * SECURITY WARNING: Only for development use!
 */
export const signInWithTestPhone = async (phoneNumber: string, code: string): Promise<any> => {
  // Check if demo mode is enabled
  const isDemoModeEnabled = process.env.EXPO_PUBLIC_ENABLE_DEMO_AUTH === 'true' || 
                           process.env.NODE_ENV === 'development';
  
  if (!isDemoModeEnabled) {
    throw new Error('Demo phone authentication is disabled');
  }
  
  console.warn('[PHONE_AUTH] ⚠️  Using DEMO phone authentication');
  console.warn('[PHONE_AUTH] This should NEVER be used in production');
  
  // Test phone numbers and codes
  const testAccounts = [
    { phone: '+1555123456', code: '123456' },
    { phone: '+1555987654', code: '654321' }
  ];
  
  const testAccount = testAccounts.find(acc => acc.phone === phoneNumber && acc.code === code);
  
  if (testAccount) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            uid: `demo-phone-${Date.now()}`,
            phoneNumber: phoneNumber,
            displayName: 'Demo Phone User'
          }
        });
      }, 1000);
    });
  } else {
    throw new Error('Invalid test phone number or code');
  }
};

/**
 * Setup test phone numbers in Firebase (for development)
 */
export const setupTestPhoneNumbers = async () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[PHONE_AUTH] Setting up test phone numbers...');
    
    // Note: Test phone numbers must be configured in Firebase Console
    // Go to Authentication > Sign-in method > Phone > Phone numbers for testing
    const testNumbers = {
      '+1555123456': '123456',
      '+1555987654': '654321'
    };
    
    console.log('[PHONE_AUTH] Test numbers should be configured in Firebase Console:');
    Object.entries(testNumbers).forEach(([phone, code]) => {
      console.log(`[PHONE_AUTH] ${phone} -> ${code}`);
    });
  }
};

/**
 * Phone authentication service object
 */
export const PhoneAuth: PhoneAuthService = {
  validatePhoneNumber,
  formatPhoneNumber,
  sendVerificationCode,
  verifyCode
};

export default PhoneAuth;