import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { getWebStyle } from '../utils/webStyles';
// Removed missing imports

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInGoogle } = useAuth();
  const { t } = useLanguage();

  const handleEmailSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t.common.error, t.auth.fillAllFields);
      return;
    }

    setLoading(true);
    try {
      console.log('[LOGIN] Attempting sign in with email:', email);
      const success = await signIn(email, password);
      
      if (!success) {
        console.warn('[LOGIN] Sign in failed - invalid credentials');
        Alert.alert(t.common.error, t.auth.invalidCredentials);
      } else {
        console.log('[LOGIN] Sign in successful');
      }
    } catch (error) {
      console.error('[LOGIN] Sign in error:', error);
      Alert.alert(t.common.error, t.auth.signInError);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const success = await signInGoogle();
      if (!success) {
        Alert.alert(t.common.error, t.auth.googleSignInError);
      }
    } catch (error) {
      Alert.alert(t.common.error, t.auth.googleSignInError);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@admin.com');
    setPassword('admin');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoBackground}>
            <Ionicons name="shield" size={48} color={Colors.accent} />
          </View>
        </View>
        <Text style={styles.title}>CS2 TACTICAL BOARD</Text>
        <Text style={styles.subtitle}>Authenticate to access mission control</Text>
      </LinearGradient>

      <ScrollView style={styles.formScrollView} showsVerticalScrollIndicator={false}>

        <View style={styles.formContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>ACCESS CODE</Text>
          <TextInput
            style={[styles.input, getWebStyle('textInput')]}
            value={email}
            onChangeText={setEmail}
            placeholder="operator@tactical.com"
            placeholderTextColor={Colors.text.tertiary}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>SECURITY KEY</Text>
          <TextInput
            style={[styles.input, getWebStyle('textInput')]}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter classified password"
            placeholderTextColor={Colors.text.tertiary}
            secureTextEntry
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.signInButton,
            loading && styles.disabledButton,
            getWebStyle('touchableOpacity')
          ]}
          onPress={handleEmailSignIn}
          disabled={loading}
        >
          <Text style={styles.signInButtonText}>
            {loading ? 'AUTHENTICATING...' : 'DEPLOY TO MISSION'}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t.auth.or}</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[styles.googleButton, getWebStyle('touchableOpacity')]}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <Ionicons name="logo-google" size={20} color="#4285F4" />
          <Text style={styles.googleButtonText}>{t.auth.signInWithGoogle}</Text>
        </TouchableOpacity>

          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>DEMO ACCESS</Text>
            <TouchableOpacity
              style={[styles.demoButton, getWebStyle('touchableOpacity')]}
              onPress={fillDemoCredentials}
            >
              <Text style={styles.demoButtonText}>USE ADMIN CREDENTIALS</Text>
            </TouchableOpacity>
            <Text style={styles.demoHint}>Click above then hit deploy for instant access</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: Spacing.lg,
  },
  logoContainer: {
    marginBottom: Spacing.xl,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  formScrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  formContainer: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
    color: Colors.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.md,
    backgroundColor: Colors.surface,
    ...Shadows.sm,
  },
  signInButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadows.md,
  },
  disabledButton: {
    backgroundColor: Colors.text.tertiary,
  },
  signInButtonText: {
    color: Colors.text.inverse,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border.medium,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.weights.medium,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  googleButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
  },
  demoSection: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  demoTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  demoButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  demoButtonText: {
    color: Colors.text.inverse,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  demoHint: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.relaxed,
  },
});

export default LoginScreen;