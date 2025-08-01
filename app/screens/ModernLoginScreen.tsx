import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { getWebStyle } from '../utils/webStyles';
import { SafeHeader } from '../components/SafeHeader';
import { AppLogo } from '../components/AppLogo';  
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
// Phone authentication is handled through AuthContext
import { PhoneAuthModal } from '../components/modals/PhoneAuthModal';
import { showToast } from '../components/Toast';

const ModernLoginScreen: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [confirmation, setConfirmation] = useState<any>(null);
  const [phoneError, setPhoneError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [sessionId, setSessionId] = useState<string>('');
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error' | 'verification'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  
  const { signInPhone, verifyPhoneCode, signInGoogle, loading } = useAuth();
  const { language, setLanguage, t } = useApp();
  const router = useRouter();

  // Phone authentication is now handled entirely through AuthContext

  const validatePhoneNumber = (phone: string) => {
    if (!phone.trim()) {
      const errorMessage = t.phone.phoneRequired || 'Phone number is required';
      setPhoneError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    }
    
    // Extract digits from formatted display (e.g., "569 943 2895" -> "5699432895")
    const digits = phone.replace(/\D/g, '');
    
    // Check for test number
    if (digits === '1234567891') {
      setPhoneError('');
      return true;
    }
    
    // Check for valid phone number (10 digits) - no area code validation
    if (digits.length === 10) {
      setPhoneError('');
      return true;
    }
    
    // Check for 11-digit number with country code - no area code validation
    if (digits.length === 11 && digits.startsWith('1')) {
      setPhoneError('');
      return true;
    }
    
    // Invalid length
    const errorMessage = t.phone.phoneValidationError || 'Please enter a 10-digit phone number (e.g., 123 456 4323)';
    setPhoneError(errorMessage);
    showToast(errorMessage, 'error');
    return false;
  };

  const formatPhoneNumberForDisplay = (text: string) => {
    // Remove all non-digit characters for processing
    let digits = text.replace(/\D/g, '');
    
    // Handle test number first
    if (digits === '1234567891') {
      return '123 456 7891';
    }
    
    // Format US/Canada numbers (10 or 11 digits)
    if (digits.length === 10) {
      // Format: 569 943 2895
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    } else if (digits.length === 11 && digits.startsWith('1')) {
      // Format: 1 569 943 2895 (with country code)
      return `${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    } else if (digits.length > 0 && digits.length <= 3) {
      // First 3 digits
      return digits;
    } else if (digits.length > 3 && digits.length <= 6) {
      // First 6 digits: 569 943
      return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    } else if (digits.length > 6 && digits.length <= 10) {
      // Up to 10 digits: 569 943 2895
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    } else if (digits.length > 10) {
      // More than 10 digits, assume country code: 1 569 943 2895
      return `${digits.slice(0, digits.length - 10)} ${digits.slice(-10, -7)} ${digits.slice(-7, -4)} ${digits.slice(-4)}`;
    }
    
    return text;
  };

  const convertToE164 = (displayNumber: string) => {
    // Remove all non-digit characters
    let digits = displayNumber.replace(/\D/g, '');
    
    // Handle test number
    if (digits === '1234567891') {
      return '+11234567891';
    }
    
    // Auto-detect and format for E.164
    if (digits.length === 10) {
      // US/Canada: add +1
      return `+1${digits}`;
    } else if (digits.length === 11 && digits.startsWith('1')) {
      // Already has country code
      return `+${digits}`;
    }
    
    // Default: assume US and add +1
    return `+1${digits}`;
  };

  const validateVerificationCode = (code: string) => {
    if (!code.trim()) {
      setCodeError(t.phone.verificationCodeRequired || 'Verification code is required');
      return false;
    }
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setCodeError(t.phone.invalidVerificationCode || 'Please enter a valid 6-digit code');
      return false;
    }
    setCodeError('');
    return true;
  };

  const handleSendCode = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      return;
    }

    setIsLoading(true);
    try {
      const formattedNumber = convertToE164(phoneNumber);
      
      // Use AuthContext's signInPhone function
      console.log('[LOGIN] Sending verification code through AuthContext for:', formattedNumber);
      const result = await signInPhone(formattedNumber);
      console.log('[LOGIN] AuthContext signInPhone result:', result);
      
      // Extract data from the result
      if (result && result.confirmationResult && result.sessionId) {
        setConfirmation(result.confirmationResult);
        setSessionId(result.sessionId);
        console.log('[LOGIN] ✅ Successfully set confirmation and sessionId');
      } else {
        console.error('[LOGIN] ❌ Invalid result structure:', result);
        throw new Error(t.common.error || 'Invalid response from phone authentication service');
      }
      setStep('verify');
      startResendTimer();
      
      // Show success toast with user-friendly format  
      showToast(`📱 Code sent to ${phoneNumber}`, 'success');
      
      // Show success modal for code sent
      setModalType('verification');
      setModalTitle(t.phone.codeSent || 'Code Sent');
      setModalMessage(`${t.phone.verificationCodeSentTo || 'Verification code sent to'} ${phoneNumber}`);
      setShowVerificationModal(true);
    } catch (error: any) {
      console.error('[LOGIN] Send code error:', error);
      
      // Handle specific error messages
      let errorMessage = t.phone.failedToSendCode || 'Failed to send verification code';
      
      if (error.message?.includes('RATE_LIMITED')) {
        const remainingTime = error.message.split('_')[2];
        errorMessage = `Too many attempts. Please wait ${remainingTime} seconds.`;
      } else if (error.message === 'TOO_MANY_SMS_ATTEMPTS') {
        errorMessage = t.phone.tooManyRequests || 'Too many SMS attempts. Please wait 15 minutes.';
      } else if (error.message === 'INVALID_PHONE_NUMBER') {
        errorMessage = t.phone.invalidPhoneForTesting || 'Invalid phone number. For testing, use: 123 456 7891';
      } else if (error.message === 'SMS_QUOTA_EXCEEDED') {
        errorMessage = t.phone.smsQuotaExceeded || 'SMS service temporarily unavailable. Please try again later.';
      }
      
      // Show toast notification for immediate feedback
      showToast(errorMessage, 'error');
      
      // Show error modal
      setModalType('error');
      setModalTitle(t.common.error || 'Error');
      setModalMessage(errorMessage);
      setModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!validateVerificationCode(verificationCode)) {
      return;
    }

    setIsLoading(true);
    try {
      // Use AuthContext's verifyPhoneCode to properly set user state
      console.log('[LOGIN] Verifying code through AuthContext with sessionId:', sessionId);
      const success = await verifyPhoneCode(confirmation, verificationCode, sessionId);
      
      if (success) {
        console.log('[LOGIN] ✅ Phone verification successful through AuthContext, navigating to group page...');
        // Close verification modal on success
        setShowVerificationModal(false);
        
        // Show success toast
        showToast(t.phone.phoneVerifiedSuccessfully || 'Phone number verified successfully!', 'success');
        
        // Navigate to group page
        setTimeout(() => {
          router.replace('/(tabs)/group');
        }, 500);
      } else {
        const errorMessage = t.phone.invalidCode || 'Invalid verification code. Please try again.';
        showToast(errorMessage, 'error');
        setModalType('error');
        setModalTitle(t.common.error || 'Error');
        setModalMessage(errorMessage);
        setModalVisible(true);
      }
    } catch (error: any) {
      console.error('[LOGIN] Verification error:', error);
      
      // Handle specific error messages
      let errorMessage = t.phone.verificationFailed || 'Verification failed. Please try again.';
      
      if (error.message === 'INVALID_VERIFICATION_CODE') {
        errorMessage = t.phone.invalidCode || 'Invalid verification code. Please try again.';
      } else if (error.message === 'CODE_EXPIRED') {
        errorMessage = t.phone.codeExpired || 'Verification code has expired. Please request a new one.';
      } else if (error.message === 'SESSION_EXPIRED') {
        errorMessage = t.phone.sessionExpired || 'Session expired. Please start over.';
        setStep('phone');
      } else if (error.message === 'TOO_MANY_VERIFICATION_ATTEMPTS') {
        errorMessage = t.phone.tooManyAttempts || 'Too many failed attempts. Please request a new code.';
        setStep('phone');
      } else if (error.message === 'INVALID_SESSION') {
        errorMessage = t.phone.invalidSession || 'Invalid session. Please start over.';
        setStep('phone');
      }
      
      // Show error modal
      setModalType('error');
      setModalTitle(t.common.error || 'Error');
      setModalMessage(errorMessage);
      setModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Start resend timer
  const startResendTimer = () => {
    setResendTimer(60);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    await handleSendCode();
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const success = await signInGoogle();
      if (success) {
        console.log('[LOGIN] Google sign-in successful, navigating to group page...');
        setTimeout(() => {
          router.replace('/(tabs)/group');
        }, 100);
      } else {
        setModalType('error');
        setModalTitle(t.login.googleLoginFailed || 'Google Sign-In Failed');
        setModalMessage(t.login.googleLoginFailedMessage || 'Unable to sign in with Google. Please try again.');
        setModalVisible(true);
      }
    } catch (error: any) {
      console.error('[LOGIN] Google sign-in error:', error);
      setModalType('error');
      setModalTitle(t.login.googleLoginError || 'Google Sign-In Error');
      setModalMessage(t.login.googleLoginErrorMessage || 'An error occurred during Google sign-in.');
      setModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationModalSubmit = async (code: string) => {
    setVerificationCode(code);
    if (code.length === 6) {
      await handleVerifyCode();
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setShowVerificationModal(false);
  };

  const handleResendFromModal = async () => {
    setShowVerificationModal(false);
    await handleResendCode();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeHeader
        title={t.group.loginPageTitle || 'Meet2Gether'}
        subtitle={step === 'phone' ? (t.group.loginPageSubtitle || 'Sign in with your phone number') : (t.group.verifyPageSubtitle || 'Verify your phone number')}
        colors={[Colors.primary, Colors.primaryDark, Colors.tactical.dark]}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <AppLogo size={50} variant="icon" showShadow={true} />
          </View>
          
          {/* Language Switcher */}
          <View style={styles.languageSwitcher}>
            <TouchableOpacity
              style={[styles.languageButton, language === 'en' && styles.activeLanguageButton]}
              onPress={() => setLanguage('en')}
            >
              <Text style={[styles.languageButtonText, language === 'en' && styles.activeLanguageButtonText]}>EN</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.languageButton, language === 'fr' && styles.activeLanguageButton]}
              onPress={() => setLanguage('fr')}
            >
              <Text style={[styles.languageButtonText, language === 'fr' && styles.activeLanguageButtonText]}>FR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeHeader>

      {/* Phone Authentication Form */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <View style={styles.loginCard}>
          {step === 'phone' ? (
            <>
              
              <Text style={styles.loginTitle}>{t.phone.enterPhoneNumber || 'Enter Phone Number'}</Text>
              <Text style={styles.loginSubtitle}>
                {t.phone.sendVerificationCode || 'Enter your phone number. Country code will be auto-detected.'}
              </Text>
              
              {/* Phone Number Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.phone.phoneNumber || 'Phone Number'}</Text>
                <TextInput
                  style={[styles.input, styles.cleanInput, getWebStyle('textInput')]}
                  placeholder="569 943 2895"
                  placeholderTextColor={Colors.text.tertiary}
                  value={phoneNumber}
                  onChangeText={(text) => {
                    const formatted = formatPhoneNumberForDisplay(text);
                    setPhoneNumber(formatted);
                  }}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                  accessible={true}
                  accessibilityLabel="Phone number input"
                  accessibilityHint="Enter your phone number to receive a verification code"
                  returnKeyType="send"
                  onSubmitEditing={handleSendCode}
                  maxLength={14} // Max length for "1 569 943 2895"
                />
                {phoneError ? (
                  <Text style={styles.errorText}>{phoneError}</Text>
                ) : null}
              </View>
              
              {/* Send Code Button */}
              <TouchableOpacity 
                style={[styles.loginButton, getWebStyle('touchableOpacity')]} 
                onPress={handleSendCode}
                disabled={isLoading || loading}
                accessible={true}
                accessibilityLabel="Send verification code button"
                accessibilityHint="Tap to send a verification code to your phone"
                accessibilityRole="button"
              >
                <LinearGradient
                  colors={[Colors.accent, Colors.accentDark]}
                  style={styles.loginGradient}
                >
                  {isLoading || loading ? (
                    <Text style={styles.loginText}>{t.phone.sendingCode || 'Sending...'}</Text>
                  ) : (
                    <>
                      <Ionicons name="paper-plane" size={20} color={Colors.text.inverse} />
                      <Text style={styles.loginText}>{t.phone.sendCode || 'Send Code'}</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              
              {/* Google Sign-In Button */}
              <TouchableOpacity 
                style={[styles.googleButton, getWebStyle('touchableOpacity')]} 
                onPress={handleGoogleSignIn}
                disabled={isLoading || loading}
                accessible={true}
                accessibilityLabel="Sign in with Google button"
                accessibilityHint="Tap to sign in with your Google account"
                accessibilityRole="button"
              >
                <View style={styles.googleButtonContent}>
                  <Ionicons name="logo-google" size={20} color="#4285F4" />
                  <Text style={styles.googleButtonText}>{t.login.continueWithGoogle || 'Continue with Google'}</Text>
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.iconContainer}>
                <Ionicons name="shield-checkmark" size={48} color={Colors.success} />
              </View>
              
              <Text style={styles.loginTitle}>{t.phone.verifyPhone || 'Verify Your Phone'}</Text>
              <Text style={styles.loginSubtitle}>
                {t.phone.enter6DigitCode || 'Enter the 6-digit code sent to'} {phoneNumber}
              </Text>
              
              {/* Verification Code Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.phone.verificationCode || 'Verification Code'}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons 
                    name="keypad-outline" 
                    size={20} 
                    color={Colors.text.secondary} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, styles.codeInput, getWebStyle('textInput')]}
                    placeholder="123456"
                    placeholderTextColor={Colors.text.tertiary}
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    keyboardType="numeric"
                    maxLength={6}
                    autoComplete="sms-otp"
                    textContentType="oneTimeCode"
                    accessible={true}
                    accessibilityLabel="Verification code input"
                    accessibilityHint="Enter the 6-digit code sent to your phone"
                    returnKeyType="done"
                    onSubmitEditing={handleVerifyCode}
                  />
                </View>
                {codeError ? (
                  <Text style={styles.errorText}>{codeError}</Text>
                ) : null}
              </View>
              
              {/* Verify Code Button */}
              <TouchableOpacity 
                style={[styles.loginButton, getWebStyle('touchableOpacity')]} 
                onPress={handleVerifyCode}
                disabled={isLoading || loading}
                accessible={true}
                accessibilityLabel="Verify code button"
                accessibilityHint="Tap to verify the code and sign in"
                accessibilityRole="button"
              >
                <LinearGradient
                  colors={[Colors.success, '#388E3C']}
                  style={styles.loginGradient}
                >
                  {isLoading || loading ? (
                    <Text style={styles.loginText}>{t.phone.verifying || 'Verifying...'}</Text>
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color={Colors.text.inverse} />
                      <Text style={styles.loginText}>{t.phone.verifyCode || 'Verify Code'}</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              
              {/* Resend Code */}
              <View style={styles.resendContainer}>
                <TouchableOpacity
                  onPress={handleResendCode}
                  disabled={resendTimer > 0}
                  style={[styles.resendButton, resendTimer > 0 && styles.resendButtonDisabled]}
                >
                  <Text style={[styles.resendButtonText, resendTimer > 0 && styles.resendButtonTextDisabled]}>
                    {resendTimer > 0 ? `${t.phone.resendIn || 'Resend in'} ${resendTimer}s` : t.phone.resendCode || 'Resend Code'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Change Phone Number */}
              <TouchableOpacity
                onPress={() => setStep('phone')}
                style={styles.changePhoneButton}
              >
                <Text style={styles.changePhoneButtonText}>{t.phone.changePhoneNumber || 'Change Phone Number'}</Text>
              </TouchableOpacity>
            </>
          )}
          </View>
        </View>
      </ScrollView>
      
      {/* Custom Modals */}
      <PhoneAuthModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={handleModalClose}
      />
      
      <PhoneAuthModal
        visible={showVerificationModal}
        type="verification"
        title={modalTitle}
        message={modalMessage}
        onClose={handleModalClose}
        showVerificationInput={true}
        verificationCode={verificationCode}
        onVerificationCodeChange={setVerificationCode}
        onVerificationSubmit={handleVerificationModalSubmit}
        isLoading={isLoading}
        showResendButton={true}
        onResend={handleResendFromModal}
        resendTimer={resendTimer}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: '70%',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    marginBottom: Spacing.md,
  },
  languageSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.md,
    padding: 2,
    marginBottom: Spacing.md,
  },
  languageButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    minWidth: 40,
    alignItems: 'center',
  },
  activeLanguageButton: {
    backgroundColor: Colors.accent,
  },
  languageButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activeLanguageButtonText: {
    color: Colors.text.inverse,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  loginCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
    ...Shadows.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.tactical.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 3,
    borderColor: Colors.accent,
    alignSelf: 'center',
  },
  loginTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  loginSubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.tactical.light,
    borderWidth: 2,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    backgroundColor: 'transparent',
  },
  cleanInput: {
    backgroundColor: Colors.tactical.light,
    borderWidth: 2,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    flex: 0,
  },
  codeInput: {
    textAlign: 'center',
    letterSpacing: 8,
    fontSize: Typography.sizes.xl,
  },
  loginButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.sm,
    ...Shadows.lg,
  },
  loginGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  loginText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
  },
  resendContainer: {
    marginVertical: Spacing.md,
    alignItems: 'center',
  },
  resendButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: Typography.sizes.sm,
    color: Colors.accent,
    fontWeight: Typography.weights.medium,
    textDecorationLine: 'underline',
  },
  resendButtonTextDisabled: {
    color: Colors.text.tertiary,
    textDecorationLine: 'none',
  },
  changePhoneButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  changePhoneButtonText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  errorText: {
    fontSize: Typography.sizes.sm,
    color: '#FF6B6B',
    marginTop: Spacing.xs,
    marginLeft: Spacing.sm,
    fontWeight: Typography.weights.medium,
  },
  googleButton: {
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    marginTop: Spacing.md,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  googleButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
});

export default ModernLoginScreen;