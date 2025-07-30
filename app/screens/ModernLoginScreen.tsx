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
import { getWebStyle } from '../utils/webStyles';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { translations } from '../services/translations';

const ModernLoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const { signIn, signUp, signInGoogle, loading } = useAuth();
  const router = useRouter();
  const t = translations[language];

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t.login.missingInfo, t.login.enterBothFields);
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
        Alert.alert(t.login.loginFailed, t.login.invalidCredentials);
      }
    } catch (error) {
      console.error('[LOGIN] Login error:', error);
      Alert.alert(t.login.loginError, t.login.loginErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !displayName.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
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
        Alert.alert('Sign Up Failed', 'Failed to create account. Please try again.');
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
      
      Alert.alert('Sign Up Error', errorMessage);
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
        Alert.alert(t.login.googleLoginFailed, t.login.googleLoginFailedMessage);
      }
    } catch (error) {
      console.error('[LOGIN] Google login error:', error);
      Alert.alert(t.login.googleLoginError, t.login.googleLoginErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo@demo.com');
    setPassword('demo123');
  };

  const handleAdminDemo = () => {
    setEmail('admin@admin.com');
    setPassword('admin');
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
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Modern Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark, Colors.tactical.dark]}
        style={styles.header}
      >
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={[Colors.accent, '#FF6F00']}
            style={styles.logoGradient}
          >
            <Ionicons name="calendar" size={24} color={Colors.text.inverse} />
          </LinearGradient>
        </View>
        <Text style={styles.appTitle}>When2Meet</Text>
        <Text style={styles.appSubtitle}>Find the perfect meeting time</Text>
      </LinearGradient>

      {/* Login Form */}
      <View style={styles.formContainer}>
          <View style={styles.loginCard}>
            <Text style={styles.loginTitle}>{isSignUpMode ? 'Create Account' : 'Welcome Back'}</Text>
            <Text style={styles.loginSubtitle}>{isSignUpMode ? 'Sign up for a new account' : 'Sign in to your account'}</Text>
            
            {/* Display Name Input (Sign Up Only) */}
            {isSignUpMode && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Display Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons 
                    name="person-outline" 
                    size={20} 
                    color={Colors.text.secondary} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, getWebStyle('textInput')]}
                    placeholder="Enter your display name"
                    placeholderTextColor={Colors.text.tertiary}
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                    autoComplete="name"
                  />
                </View>
              </View>
            )}
            
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
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
                />
              </View>
            </View>
            
            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={Colors.text.secondary} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.passwordInput, getWebStyle('textInput')]}
                  placeholder={isSignUpMode ? "Create a password (min 6 chars)" : "Enter your password"}
                  placeholderTextColor={Colors.text.tertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete={isSignUpMode ? "new-password" : "password"}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={Colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Confirm Password Input (Sign Up Only) */}
            {isSignUpMode && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
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
            >
              <LinearGradient
                colors={[Colors.accent, '#FF8F00']}
                style={styles.loginGradient}
              >
                {isLoading || loading ? (
                  <Text style={styles.loginText}>{isSignUpMode ? 'Creating Account...' : 'Signing In...'}</Text>
                ) : (
                  <>
                    <Ionicons name={isSignUpMode ? "person-add-outline" : "log-in-outline"} size={20} color={Colors.text.inverse} />
                    <Text style={styles.loginText}>{isSignUpMode ? 'Create Account' : 'Sign In'}</Text>
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
                {isSignUpMode ? 'Already have an account? ' : 'Don\'t have an account? '}
                <Text style={styles.toggleLink}>{isSignUpMode ? 'Sign In' : 'Sign Up'}</Text>
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
              <Text style={styles.googleText}>{isSignUpMode ? 'Sign up with Google' : 'Continue with Google'}</Text>
            </TouchableOpacity>

            {/* Firebase Setup Notice */}
            <View style={styles.setupNotice}>
              <View style={styles.setupHeader}>
                <Ionicons name="information-circle" size={20} color={Colors.accent} />
                <Text style={styles.setupTitle}>Authentication Mode</Text>
              </View>
              <Text style={styles.setupText}>
                Firebase Email/Password authentication is not enabled.{' '}
                The app is using demo authentication mode.
              </Text>
              <Text style={styles.setupInstructions}>
                To enable Firebase Auth:{' '}
                <Text style={styles.setupLink}>Firebase Console → Authentication → Sign-in method → Enable Email/Password</Text>
              </Text>
            </View>
            
            {/* Demo Buttons */}
            <View style={styles.demoContainer}>
              <Text style={styles.demoTitle}>Quick Demo:</Text>
              <View style={styles.demoButtons}>
                <TouchableOpacity 
                  style={[styles.demoButton, getWebStyle('touchableOpacity')]} 
                  onPress={handleDemoLogin}
                >
                  <Ionicons name="person-outline" size={16} color={Colors.secondary} />
                  <Text style={styles.demoText}>User Demo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.demoButton, styles.adminDemoButton, getWebStyle('touchableOpacity')]} 
                  onPress={handleAdminDemo}
                >
                  <Ionicons name="shield-outline" size={16} color={Colors.accent} />
                  <Text style={[styles.demoText, styles.adminDemoText]}>Admin Demo</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.demoHint}>
                Admin: admin@admin.com / admin{'\n'}
                Or any email/password for user role{'\n'}
                📚 University Demo Group: TEST999
              </Text>
            </View>
          </View>
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
  logoContainer: {
    marginBottom: Spacing.md,
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
  demoContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  demoTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  demoButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  demoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.tactical.light,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.xs,
  },
  adminDemoButton: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  demoText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.secondary,
  },
  adminDemoText: {
    color: Colors.accent,
  },
  demoHint: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 16,
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
  setupNotice: {
    backgroundColor: Colors.tactical.light,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  setupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  setupTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.accent,
    marginLeft: Spacing.xs,
  },
  setupText: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  setupInstructions: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.tertiary,
    lineHeight: 16,
  },
  setupLink: {
    color: Colors.accent,
    fontWeight: Typography.weights.medium,
  },
});

export default ModernLoginScreen;