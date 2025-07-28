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

const ModernLoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInGoogle, loading } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Information', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const success = await signIn(email.trim(), password.trim());
      if (success) {
        console.log('[LOGIN] Login successful, navigating to tabs...');
        // Force navigation after successful login
        setTimeout(() => {
          router.replace('/(tabs)/calendar');
        }, 100);
      } else {
        Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('[LOGIN] Login error:', error);
      Alert.alert('Login Error', 'An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const success = await signInGoogle();
      if (success) {
        console.log('[LOGIN] Google login successful, navigating to tabs...');
        setTimeout(() => {
          router.replace('/(tabs)/calendar');
        }, 100);
      } else {
        Alert.alert('Google Login Failed', 'Unable to sign in with Google. Please try again.');
      }
    } catch (error) {
      console.error('[LOGIN] Google login error:', error);
      Alert.alert('Google Login Error', 'An error occurred during Google login.');
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
            <LinearGradient
              colors={[Colors.accent, '#FF6F00']}
              style={styles.logoGradient}
            >
              <Ionicons name="calendar" size={32} color={Colors.text.inverse} />
            </LinearGradient>
          </View>
          <Text style={styles.appTitle}>When2Meet</Text>
          <Text style={styles.appSubtitle}>Find the perfect meeting time</Text>
        </LinearGradient>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <View style={styles.loginCard}>
            <Text style={styles.loginTitle}>Welcome Back</Text>
            <Text style={styles.loginSubtitle}>Sign in to your account</Text>
            
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
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.text.tertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
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
            
            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, getWebStyle('touchableOpacity')]} 
              onPress={handleLogin}
              disabled={isLoading || loading}
            >
              <LinearGradient
                colors={[Colors.accent, '#FF8F00']}
                style={styles.loginGradient}
              >
                {isLoading || loading ? (
                  <Text style={styles.loginText}>Signing In...</Text>
                ) : (
                  <>
                    <Ionicons name="log-in-outline" size={20} color={Colors.text.inverse} />
                    <Text style={styles.loginText}>Sign In</Text>
                  </>
                )}
              </LinearGradient>
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
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>

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
                Or any email/password for user role
              </Text>
            </View>
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
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
  appTitle: {
    fontSize: 32,
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  loginCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
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
    marginTop: Spacing.md,
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
    marginVertical: Spacing.lg,
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
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
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
});

export default ModernLoginScreen;