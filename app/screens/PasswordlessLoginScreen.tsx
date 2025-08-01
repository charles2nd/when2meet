import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { getWebStyle } from '../utils/webStyles';
import { AppLogo } from '../components/AppLogo';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { translations } from '../services/translations';
import { sendEmailLink, checkEmailLinkSignIn, completeSignInWithEmailLink } from '../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PasswordlessLoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const { signIn, signInGoogle, loading } = useAuth();
  const router = useRouter();
  const t = translations[language];

  // Check if coming from email link on mount
  useEffect(() => {
    checkForEmailLink();
  }, []);

  const checkForEmailLink = async () => {
    try {
      const { email: savedEmail, isValid } = await checkEmailLinkSignIn();
      
      if (isValid && savedEmail) {
        setIsLoading(true);
        const url = Platform.OS === 'web' ? window.location.href : '';
        const userRole = await completeSignInWithEmailLink(savedEmail, url);
        
        if (userRole) {
          console.log('[LOGIN] Email link sign-in successful');
          router.replace('/(tabs)/group');
        }
      }
    } catch (error) {
      console.error('[LOGIN] Email link sign-in error:', error);
      Alert.alert('Sign In Error', 'Invalid or expired sign-in link. Please request a new one.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmailLink = async () => {
    if (!email.trim()) {
      Alert.alert('Missing Email', 'Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await sendEmailLink(email.trim());
      setEmailSent(true);
      Alert.alert(
        'Check Your Email', 
        `We've sent a sign-in link to ${email}. Click the link in the email to sign in.`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('[LOGIN] Send email link error:', error);
      
      let errorMessage = 'Failed to send sign-in link. Please try again.';
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/unauthorized-continue-uri') {
        errorMessage = 'Email link authentication is not properly configured. Please contact support.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const success = await signInGoogle();
      if (success) {
        router.replace('/(tabs)/group');
      } else {
        Alert.alert('Google Sign In Failed', 'Please try again or use email sign-in.');
      }
    } catch (error) {
      console.error('[LOGIN] Google login error:', error);
      Alert.alert('Google Sign In Error', 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Modern Header */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark, Colors.tactical.dark]}
          style={styles.header}
        >
          <View style={styles.logoContainer}>
            <AppLogo size={70} variant="icon" showShadow={true} />
          </View>
          <Text style={styles.appTitle}>Meet2Gether</Text>
          <Text style={styles.appSubtitle}>Find the perfect meeting time</Text>
        </LinearGradient>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <View style={styles.loginCard}>
            <Text style={styles.loginTitle}>Welcome</Text>
            <Text style={styles.loginSubtitle}>Sign in with your email - no password needed!</Text>
            
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color={Colors.text.secondary} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, getWebStyle('textInput')]}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.text.tertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!emailSent && !isLoading}
                />
              </View>
            </View>
            
            {/* Send Email Link Button */}
            <TouchableOpacity 
              style={[styles.loginButton, emailSent && styles.loginButtonDisabled, getWebStyle('touchableOpacity')]} 
              onPress={handleSendEmailLink}
              disabled={isLoading || loading || emailSent}
            >
              <LinearGradient
                colors={emailSent ? ['#888', '#666'] : [Colors.accent, '#FF8F00']}
                style={styles.loginGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.text.inverse} />
                ) : emailSent ? (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.text.inverse} />
                    <Text style={styles.loginText}>Email Sent - Check Your Inbox</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="mail" size={20} color={Colors.text.inverse} />
                    <Text style={styles.loginText}>Send Sign-In Link</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {emailSent && (
              <TouchableOpacity 
                style={styles.resendButton}
                onPress={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
              >
                <Text style={styles.resendText}>Use a different email</Text>
              </TouchableOpacity>
            )}

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Login */}
            <TouchableOpacity 
              style={[styles.googleButton, getWebStyle('touchableOpacity')]} 
              onPress={handleGoogleLogin}
              disabled={isLoading || loading}
            >
              <Ionicons name="logo-google" size={20} color={Colors.text.primary} />
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 25,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: Spacing.md,
  },
  logoGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: Typography.sizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  loginCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
    ...Shadows.xl,
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
    marginBottom: Spacing.lg,
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
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    backgroundColor: 'transparent',
  },
  loginButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.md,
    ...Shadows.lg,
  },
  loginButtonDisabled: {
    opacity: 0.8,
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
  resendButton: {
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  resendText: {
    fontSize: Typography.sizes.sm,
    color: Colors.accent,
    fontWeight: Typography.weights.medium,
    textDecorationLine: 'underline',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border.light,
  },
  dividerText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.tertiary,
    marginHorizontal: Spacing.md,
    fontWeight: Typography.weights.medium,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  googleText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.text.primary,
  },
});

export default PasswordlessLoginScreen;