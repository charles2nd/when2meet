import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getWebStyle } from '../utils/webStyles';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import AdminPanel from '../components/AdminPanel';

const SettingsScreen: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut, isAdmin } = useAuth();
  const router = useRouter();

  const handleLanguageChange = async (lang: 'en' | 'fr') => {
    await setLanguage(lang);
  };

  const handleSignOut = () => {
    Alert.alert(
      'EXTRACT FROM MISSION',
      'Confirm extraction from tactical operations?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Extract', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              console.log('[SETTINGS] Logout completed');
            } catch (error) {
              console.error('[SETTINGS] Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
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
          <View style={styles.commandCenter}>
            <Ionicons name="settings" size={32} color={Colors.accent} />
          </View>
          <Text style={styles.headerTitle}>COMMAND CENTER</Text>
          <Text style={styles.headerSubtitle}>Operator configuration panel</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Operator Profile */}
        <View style={styles.profilePanel}>
          <View style={styles.profileHeader}>
            <Ionicons name="person-circle" size={20} color={Colors.accent} />
            <Text style={styles.panelTitle}>OPERATOR PROFILE</Text>
          </View>
          
          <View style={styles.operatorInfo}>
            <View style={styles.operatorAvatar}>
              <Text style={styles.avatarText}>{user?.displayName?.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.operatorDetails}>
              <Text style={styles.operatorName}>{user?.displayName}</Text>
              <Text style={styles.operatorEmail}>{user?.email}</Text>
              <View style={styles.badgeContainer}>
                {isAdmin && (
                  <View style={styles.adminBadge}>
                    <Ionicons name="shield-checkmark" size={12} color={Colors.text.inverse} />
                    <Text style={styles.adminText}>ADMIN</Text>
                  </View>
                )}
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>ACTIVE</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Language Settings */}
        <View style={styles.settingsPanel}>
          <View style={styles.panelHeaderRow}>
            <Ionicons name="language" size={20} color={Colors.secondary} />
            <Text style={styles.panelTitle}>LANGUAGE PROTOCOL</Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.languageOption,
              language === 'en' && styles.selectedOption,
              getWebStyle('touchableOpacity')
            ]}
            onPress={() => handleLanguageChange('en')}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionLeft}>
                <Text style={styles.flagEmoji}>US</Text>
                <Text style={[styles.optionText, language === 'en' && styles.selectedText]}>
                  ENGLISH
                </Text>
              </View>
              {language === 'en' && (
                <Ionicons name="radio-button-on" size={20} color={Colors.accent} />
              )}
              {language !== 'en' && (
                <Ionicons name="radio-button-off" size={20} color={Colors.text.tertiary} />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.languageOption,
              language === 'fr' && styles.selectedOption,
              getWebStyle('touchableOpacity')
            ]}
            onPress={() => handleLanguageChange('fr')}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionLeft}>
                <Text style={styles.flagEmoji}>FR</Text>
                <Text style={[styles.optionText, language === 'fr' && styles.selectedText]}>
                  FRANÇAIS
                </Text>
              </View>
              {language === 'fr' && (
                <Ionicons name="radio-button-on" size={20} color={Colors.accent} />
              )}
              {language !== 'fr' && (
                <Ionicons name="radio-button-off" size={20} color={Colors.text.tertiary} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Admin Panel */}
        {isAdmin && <AdminPanel />}

        {/* System Info */}
        <View style={styles.infoPanel}>
          <View style={styles.panelHeaderRow}>
            <Ionicons name="information-circle" size={20} color={Colors.secondary} />
            <Text style={styles.panelTitle}>SYSTEM INFO</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version:</Text>
            <Text style={styles.infoValue}>v1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build:</Text>
            <Text style={styles.infoValue}>CS2 Tactical</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Release:</Text>
            <Text style={styles.infoValue}>2024.01</Text>
          </View>
        </View>

        {/* Extract Button */}
        <TouchableOpacity
          style={[styles.extractButton, getWebStyle('touchableOpacity')]}
          onPress={handleSignOut}
        >
          <LinearGradient
            colors={[Colors.error, '#D32F2F']}
            style={styles.extractGradient}
          >
            <Ionicons name="exit" size={20} color={Colors.text.primary} />
            <Text style={styles.extractText}>EXTRACT FROM MISSION</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    paddingTop: 50,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  commandCenter: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  headerTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profilePanel: {
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    ...Shadows.lg,
  },
  profileHeader: {
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
  operatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  operatorAvatar: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  avatarText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
  operatorDetails: {
    flex: 1,
  },
  operatorName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  operatorEmail: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 2,
  },
  adminText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.text.primary,
  },
  statusText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
  settingsPanel: {
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    marginTop: 0,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    ...Shadows.md,
  },
  panelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  languageOption: {
    backgroundColor: Colors.tactical.medium,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  selectedOption: {
    borderColor: Colors.accent,
    backgroundColor: Colors.tactical.light,
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagEmoji: {
    fontSize: Typography.sizes.lg,
    marginRight: Spacing.sm,
  },
  optionText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.text.primary,
  },
  selectedText: {
    fontWeight: Typography.weights.bold,
    color: Colors.accent,
  },
  infoPanel: {
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    marginTop: 0,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    ...Shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  infoLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  },
  infoValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text.primary,
  },
  extractButton: {
    margin: Spacing.lg,
    marginTop: 0,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  extractGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  extractText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
    letterSpacing: 1,
  },
});

export default SettingsScreen;