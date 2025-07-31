import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, CommonStyles } from '../theme';
import { getWebStyle } from '../utils/webStyles';
import { SafeHeader } from '../components/SafeHeader';

interface PhoneLoginScreenProps {
  onPhoneSignIn?: (phoneNumber: string) => Promise<any>;
  onVerifyCode?: (confirmation: any, code: string) => Promise<boolean>;
}

export const PhoneLoginScreen: React.FC<PhoneLoginScreenProps> = ({
  onPhoneSignIn,
  onVerifyCode
}) => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmation, setConfirmation] = useState<any>(null);
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digits
    const digits = text.replace(/\D/g, '');
    
    // Add country code if not present
    if (digits.length === 10) {
      return `+1${digits}`;
    } else if (digits.length > 0 && !text.startsWith('+')) {
      return `+${digits}`;
    }
    
    return text;
  };

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    const formattedNumber = formatPhoneNumber(phoneNumber);
    
    // Basic validation
    if (!/^\+[1-9]\d{1,14}$/.test(formattedNumber)) {
      Alert.alert('Error', 'Please enter a valid phone number in international format (+1234567890)');
      return;
    }

    try {
      setLoading(true);
      
      if (onPhoneSignIn) {
        const result = await onPhoneSignIn(formattedNumber);
        setConfirmation(result);
        setStep('verify');
        startResendTimer();
        Alert.alert('Code Sent', `Verification code sent to ${formattedNumber}`);
      } else {
        // Demo mode
        Alert.alert('Demo Mode', 'Use +1555123456 with code 123456 for testing');
        setConfirmation({ demo: true, phoneNumber: formattedNumber });
        setStep('verify');
      }
    } catch (error: any) {
      console.error('Send code error:', error);
      Alert.alert('Error', error.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit verification code');
      return;
    }

    try {
      setLoading(true);
      
      if (onVerifyCode && confirmation) {
        const success = await onVerifyCode(confirmation, verificationCode);
        if (!success) {
          Alert.alert('Error', 'Invalid verification code. Please try again.');
        }
      } else {
        // Demo mode verification
        if (verificationCode === '123456') {
          Alert.alert('Success', 'Demo phone authentication successful!');
          router.replace('/(tabs)/group');
        } else {
          Alert.alert('Error', 'Invalid code. Use 123456 for demo.');
        }
      }
    } catch (error: any) {
      console.error('Verify code error:', error);
      Alert.alert('Error', error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    await handleSendCode();
  };

  const renderPhoneStep = () => (
    <Animated.View 
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="phone-portrait" size={48} color={Colors.accent} />
      </View>
      
      <Text style={styles.stepTitle}>Enter Phone Number</Text>
      <Text style={styles.stepSubtitle}>
        We'll send you a verification code via SMS
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons name="call" size={20} color={Colors.accent} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="+1234567890"
          placeholderTextColor={Colors.text.secondary}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
        />
      </View>

      <TouchableOpacity
        style={[
          styles.actionButton,
          loading && styles.actionButtonDisabled,
          getWebStyle('touchableOpacity')
        ]}
        onPress={handleSendCode}
        disabled={loading}
      >
        <LinearGradient
          colors={[Colors.accent, Colors.accentDark]}
          style={styles.buttonGradient}
        >
          {loading ? (
            <Text style={styles.buttonText}>Sending...</Text>
          ) : (
            <>
              <Ionicons name="paper-plane" size={20} color={Colors.text.inverse} />
              <Text style={styles.buttonText}>Send Code</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>Back to Login Options</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderVerifyStep = () => (
    <Animated.View 
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="shield-checkmark" size={48} color={Colors.success} />
      </View>
      
      <Text style={styles.stepTitle}>Verify Your Phone</Text>
      <Text style={styles.stepSubtitle}>
        Enter the 6-digit code sent to {phoneNumber}
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons name="keypad" size={20} color={Colors.accent} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, styles.codeInput]}
          placeholder="123456"
          placeholderTextColor={Colors.text.secondary}
          value={verificationCode}
          onChangeText={setVerificationCode}
          keyboardType="numeric"
          maxLength={6}
          autoComplete="sms-otp"
          textContentType="oneTimeCode"
        />
      </View>

      <TouchableOpacity
        style={[
          styles.actionButton,
          loading && styles.actionButtonDisabled,
          getWebStyle('touchableOpacity')
        ]}
        onPress={handleVerifyCode}
        disabled={loading}
      >
        <LinearGradient
          colors={[Colors.success, Colors.successDark]}
          style={styles.buttonGradient}
        >
          {loading ? (
            <Text style={styles.buttonText}>Verifying...</Text>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={Colors.text.inverse} />
              <Text style={styles.buttonText}>Verify Code</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.resendContainer}>
        <TouchableOpacity
          onPress={handleResendCode}
          disabled={resendTimer > 0}
          style={[styles.resendButton, resendTimer > 0 && styles.resendButtonDisabled]}
        >
          <Text style={[styles.resendButtonText, resendTimer > 0 && styles.resendButtonTextDisabled]}>
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => setStep('phone')}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>Change Phone Number</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeHeader
        title="Phone Authentication"
        subtitle="Secure login with your phone number"
        colors={[Colors.tactical.dark, Colors.tactical.medium]}
      >
        <View style={styles.logoContainer}>
          <Ionicons name="phone-portrait" size={32} color={Colors.accent} />
        </View>
      </SafeHeader>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[CommonStyles.panel, styles.authPanel]}>
          {step === 'phone' ? renderPhoneStep() : renderVerifyStep()}
        </View>

        {/* Demo Instructions */}
        {__DEV__ && (
          <View style={styles.demoPanel}>
            <Text style={styles.demoTitle}>Demo Mode</Text>
            <Text style={styles.demoText}>
              For testing: Use +1555123456 with verification code 123456
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  authPanel: {
    marginBottom: Spacing.lg,
  },
  stepContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
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
  },
  stepTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
    letterSpacing: 1,
  },
  stepSubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: Typography.lineHeights.relaxed,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.tactical.medium,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.xl,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    width: '100%',
  },
  inputIcon: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: Typography.sizes.lg,
    color: Colors.text.primary,
    fontWeight: Typography.weights.medium,
  },
  codeInput: {
    textAlign: 'center',
    letterSpacing: 8,
    fontSize: Typography.sizes.xl,
  },
  actionButton: {
    width: '100%',
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  buttonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
    marginLeft: Spacing.sm,
    letterSpacing: 1,
  },
  resendContainer: {
    marginBottom: Spacing.lg,
  },
  resendButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.accent,
    fontWeight: Typography.weights.semibold,
    textDecorationLine: 'underline',
  },
  resendButtonTextDisabled: {
    color: Colors.text.secondary,
    textDecorationLine: 'none',
  },
  backButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  backButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  demoPanel: {
    backgroundColor: Colors.warning + '20',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  demoTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.warning,
    marginBottom: Spacing.sm,
  },
  demoText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeights.relaxed,
  },
});

export default PhoneLoginScreen;