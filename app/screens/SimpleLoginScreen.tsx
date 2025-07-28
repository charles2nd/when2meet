import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../contexts/AppContext';
import { getWebStyle } from '../utils/webStyles';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';

const SimpleLoginScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { login, t } = useApp();
  const router = useRouter();

  const handleLogin = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert(t.common.error, 'Please fill all fields');
      return;
    }

    await login(name.trim(), email.trim());
    router.replace('/(tabs)/calendar');
  };

  const handleDemoLogin = () => {
    setName('Demo User');
    setEmail('demo@example.com');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.tactical.dark} />
      
      {/* CS2-style header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Ionicons name="shield-checkmark" size={48} color={Colors.accent} />
          </View>
          <Text style={styles.title}>TACTICAL LOGIN</Text>
          <Text style={styles.subtitle}>Secure operator authentication</Text>
        </View>
      </LinearGradient>

      <View style={styles.formContainer}>
        <View style={styles.loginPanel}>
          <View style={styles.panelHeader}>
            <Ionicons name="person" size={20} color={Colors.accent} />
            <Text style={styles.panelTitle}>OPERATOR CREDENTIALS</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>CALLSIGN</Text>
            <TextInput
              style={[styles.input, getWebStyle('textInput')]}
              placeholder="Enter your callsign"
              placeholderTextColor={Colors.text.tertiary}
              value={name}
              onChangeText={setName}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>COMMS ID</Text>
            <TextInput
              style={[styles.input, getWebStyle('textInput')]}
              placeholder="Enter your communication ID"
              placeholderTextColor={Colors.text.tertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.loginButton, getWebStyle('touchableOpacity')]} 
            onPress={handleLogin}
          >
            <LinearGradient
              colors={[Colors.accent, '#E65100']}
              style={styles.loginGradient}
            >
              <Ionicons name="log-in" size={20} color={Colors.text.inverse} />
              <Text style={styles.loginText}>DEPLOY TO MISSION</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.demoButton, getWebStyle('touchableOpacity')]} 
            onPress={handleDemoLogin}
          >
            <View style={styles.demoContent}>
              <Ionicons name="flask" size={16} color={Colors.secondary} />
              <Text style={styles.demoText}>TRAINING MODE</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Mission Brief */}
        <View style={styles.briefPanel}>
          <View style={styles.briefHeader}>
            <Ionicons name="document-text" size={16} color={Colors.text.secondary} />
            <Text style={styles.briefTitle}>MISSION BRIEF</Text>
          </View>
          <Text style={styles.briefText}>
            Secure tactical coordination platform for team operations. 
            Enter your credentials to join the mission.
          </Text>
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
    paddingTop: 60,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  loginPanel: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    ...Shadows.lg,
    marginBottom: Spacing.lg,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  panelTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
    letterSpacing: 1,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: Colors.tactical.medium,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    fontWeight: Typography.weights.medium,
  },
  loginButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.lg,
  },
  loginGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  loginText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
    marginLeft: Spacing.sm,
    letterSpacing: 1,
  },
  demoButton: {
    backgroundColor: Colors.tactical.light,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  demoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  demoText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.secondary,
    marginLeft: Spacing.xs,
    letterSpacing: 0.5,
  },
  briefPanel: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    ...Shadows.sm,
  },
  briefHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  briefTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
    letterSpacing: 1,
  },
  briefText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.tertiary,
    lineHeight: 20,
  },
});

export default SimpleLoginScreen;