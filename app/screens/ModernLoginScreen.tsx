import React, { useState } from 'react';
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
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { getWebStyle } from '../utils/webStyles';
import { SafeHeader } from '../components/SafeHeader';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { translations } from '../services/translations';

const ModernLoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { signIn, signUp, signInGoogle, loading } = useAuth();
  const { language, setLanguage, t } = useApp();
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError(t.login.emailRequired || 'Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError(t.login.emailInvalid || 'Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password.trim()) {
      setPasswordError(t.login.passwordRequired || 'Password is required');
      return false;
    }
    if (isSignUpMode && password.length < 6) {
      setPasswordError(t.login.passwordTooShort || 'Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);
    try {
      const success = await signIn(email.trim(), password.trim());
      if (success) {
        console.log('[LOGIN] Login successful, navigating to group page...');
        
        
        // Force navigation after successful login
        setTimeout(() => {
          router.replace('/(tabs)/group');
        }, 100);
      } else {
        console.error('[LOGIN] ❌ Login failed:', t.login.invalidCredentials);
      }
    } catch (error) {
      console.error('[LOGIN] Login error:', error);
      console.error('[LOGIN] ❌ Login error message:', t.login.loginErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !displayName.trim()) {
      console.log('[SIGNUP] ❌ Missing fields: Please fill in all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      console.log('[SIGNUP] ❌ Password mismatch: Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      console.log('[SIGNUP] ❌ Password too short: Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const success = await signUp(email.trim(), password.trim(), displayName.trim());
      if (success) {
        console.log('[SIGNUP] Account created successfully');
        
        
        // Force navigation after successful signup
        setTimeout(() => {
          router.replace('/(tabs)/group');
        }, 100);
      } else {
        console.error('[SIGNUP] ❌ Account creation failed: Failed to create account. Please try again.');
      }
    } catch (error) {
      console.error('[SIGNUP] Sign up error:', error);
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Try signing in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      
      console.error('[SIGNUP] ❌ Sign up error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const success = await signInGoogle();
      if (success) {
        console.log('[LOGIN] Google login successful, navigating to group page...');
        
        
        setTimeout(() => {
          router.replace('/(tabs)/group');
        }, 100);
      } else {
        console.error('[GOOGLE_LOGIN] ❌ Google login failed:', t.login.googleLoginFailedMessage);
      }
    } catch (error) {
      console.error('[LOGIN] Google login error:', error);
      console.error('[GOOGLE] ❌ Google login error:', t.login.googleLoginErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  
  const toggleAuthMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
  };

  return (
    <View style={styles.container}>
      <SafeHeader
        title="When2Meet"
        subtitle="Find the perfect meeting time"
        colors={[Colors.primary, Colors.primaryDark, Colors.tactical.dark]}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[Colors.accent, '#FF6F00']}
              style={styles.logoGradient}
            >
              <Ionicons name="calendar" size={24} color={Colors.text.inverse} />
            </LinearGradient>
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

      {/* Login Form */}
      <View style={styles.formContainer}>
          <View style={styles.loginCard}>
            <Text style={styles.loginTitle}>{isSignUpMode ? t.login.createAccount : t.login.welcomeBack}</Text>
            <Text style={styles.loginSubtitle}>{isSignUpMode ? t.login.signUpForNewAccount : t.login.signInToYourAccount}</Text>
            
            {/* Display Name Input (Sign Up Only) */}
            {isSignUpMode && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.login.enterDisplayName}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons 
                    name="person-outline" 
                    size={20} 
                    color={Colors.text.secondary} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, getWebStyle('textInput')]}
                    placeholder={t.login.enterDisplayName}
                    placeholderTextColor={Colors.text.tertiary}
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                    autoComplete="name"
                    accessible={true}
                    accessibilityLabel="Display name input"
                    accessibilityHint="Enter your full name as it will appear to other users"
                    returnKeyType="next"
                  />
                </View>
              </View>
            )}
            
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.login.email}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color={Colors.text.secondary} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, getWebStyle('textInput')]}
                  placeholder={t.login.enterEmail}
                  placeholderTextColor={Colors.text.tertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  accessible={true}
                  accessibilityLabel="Email address input"
                  accessibilityHint="Enter your email address to sign in"
                  returnKeyType="next"
                  textContentType="emailAddress"
                  onBlur={() => validateEmail(email)}
                />
              </View>
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>
            
            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.login.password}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={Colors.text.secondary} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.passwordInput, getWebStyle('textInput')]}
                  placeholder={isSignUpMode ? t.login.createPassword : t.login.enterPassword}
                  placeholderTextColor={Colors.text.tertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete={isSignUpMode ? "new-password" : "password"}
                  accessible={true}
                  accessibilityLabel="Password input"
                  accessibilityHint={isSignUpMode ? "Create a new password with at least 6 characters" : "Enter your password"}
                  returnKeyType={isSignUpMode ? "next" : "go"}
                  textContentType="password"
                  onBlur={() => validatePassword(password)}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  accessible={true}
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                  accessibilityRole="button"
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={Colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
            </View>
            
            {/* Confirm Password Input (Sign Up Only) */}
            {isSignUpMode && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.login.confirmPassword}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={Colors.text.secondary} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, styles.passwordInput, getWebStyle('textInput')]}
                    placeholder="Confirm your password"
                    placeholderTextColor={Colors.text.tertiary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="new-password"
                  />
                </View>
              </View>
            )}
            
            {/* Login/SignUp Button */}
            <TouchableOpacity 
              style={[styles.loginButton, getWebStyle('touchableOpacity')]} 
              onPress={isSignUpMode ? handleSignUp : handleLogin}
              disabled={isLoading || loading}
              accessible={true}
              accessibilityLabel={isSignUpMode ? "Create account button" : "Sign in button"}
              accessibilityHint={isSignUpMode ? "Tap to create your new account" : "Tap to sign in to your account"}
              accessibilityRole="button"
            >
              <LinearGradient
                colors={[Colors.accent, '#FF8F00']}
                style={styles.loginGradient}
              >
                {isLoading || loading ? (
                  <Text style={styles.loginText}>{isSignUpMode ? t.login.creatingAccount : t.login.signingIn}</Text>
                ) : (
                  <>
                    <Ionicons name={isSignUpMode ? "person-add-outline" : "log-in-outline"} size={20} color={Colors.text.inverse} />
                    <Text style={styles.loginText}>{isSignUpMode ? t.login.createAccount : t.login.signIn}</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
            
            {/* Toggle Auth Mode */}
            <TouchableOpacity 
              style={styles.toggleButton}
              onPress={toggleAuthMode}
              disabled={isLoading || loading}
            >
              <Text style={styles.toggleText}>
                {isSignUpMode ? t.login.alreadyHaveAccount : t.login.dontHaveAccount}
                <Text style={styles.toggleLink}>{isSignUpMode ? t.login.signIn : t.login.signUp}</Text>
              </Text>
            </TouchableOpacity>

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
              <Text style={styles.googleText}>{isSignUpMode ? t.login.signUpWithGoogle : t.login.continueWithGoogle}</Text>
            </TouchableOpacity>

          </View>
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
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
  logoGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    fontSize: Typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
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
  passwordInput: {
    paddingRight: 0,
  },
  eyeButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.xs,
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
  toggleButton: {
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  toggleText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  toggleLink: {
    fontSize: Typography.sizes.sm,
    color: Colors.accent,
    fontWeight: Typography.weights.bold,
  },
  errorText: {
    fontSize: Typography.sizes.sm,
    color: '#FF6B6B',
    marginTop: Spacing.xs,
    marginLeft: Spacing.sm,
    fontWeight: Typography.weights.medium,
  },
});

export default ModernLoginScreen;