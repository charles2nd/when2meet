import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getWebStyle } from '../utils/webStyles';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { SessionManager } from '../services/SessionManager';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';

const ProfileScreen: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { user: authUser, signOut, isAdmin } = useAuth();
  const { user: appUser, currentGroup, logout: appLogout } = useApp();

  // Get user data from contexts
  console.log('[PROFILE] authUser:', authUser);
  console.log('[PROFILE] appUser:', appUser);
  
  // Use authUser as primary source since it's always available when logged in
  const user = authUser;
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Unknown Operator';
  const userEmail = user?.email || 'No email';
  const userRole = user?.role === 'admin' || isAdmin ? 'Squad Leader' : 'Operator';

  const handleLanguageChange = async (lang: 'en' | 'fr') => {
    try {
      await setLanguage(lang);
      console.log('[PROFILE] Language changed successfully to:', lang);
    } catch (error) {
      console.error('[PROFILE] Error changing language:', error);
      Alert.alert('Error', 'Failed to change language. Please try again.');
    }
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
              // Clear app state first
              if (appLogout) {
                await appLogout();
              }
              
              // Sign out from Firebase (this handles all cache clearing)
              await signOut();
              
              console.log('[PROFILE] Logout completed');
              
              // Navigate to login page
              router.replace('/login');
            } catch (error) {
              console.error('[PROFILE] Error during logout:', error);
            }
          }
        }
      ]
    );
  };

  const handleLeaveTeam = () => {
    Alert.alert(
      'ABANDON SQUAD',
      'Are you sure you want to leave your current squad?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave Squad', 
          style: 'destructive',
          onPress: async () => {
            try {
              await FirebaseStorageService.setCurrentTeamId('');
              router.replace('/find-group');
            } catch (error) {
              Alert.alert('Mission Failed', 'Unable to leave squad. Try again.');
            }
          }
        }
      ]
    );
  };

  const handleShareTeamCode = () => {
    if (currentGroup) {
      Alert.alert(
        'SQUAD CODE',
        `Share this code with new recruits:\n\n${currentGroup.code}\n\nSquad: ${currentGroup.name}`,
        [{ text: 'Copy Code', onPress: () => {} }]
      );
    }
  };

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.tactical.dark} />
        
        {/* CS2-style header */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.operatorInfo}>
              <Text style={styles.headerTitle}>OPERATOR PROFILE</Text>
              <Text style={styles.headerSubtitle}>Tactical personnel data</Text>
            </View>
          
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowSettings(!showSettings)}
          >
            <Ionicons 
              name={showSettings ? "close" : "settings"} 
              size={24} 
              color={Colors.text.primary} 
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!showSettings ? (
          <>
            {/* Operator Profile */}
            <View style={styles.profilePanel}>
              <View style={styles.operatorAvatar}>
                <Text style={styles.avatarText}>{displayName.substring(0, 2).toUpperCase()}</Text>
              </View>
              <View style={styles.operatorDetails}>
                <Text style={styles.operatorName}>{displayName}</Text>
                <Text style={styles.operatorEmail}>{userEmail}</Text>
                <View style={styles.badgeContainer}>
                  {isAdmin && (
                    <View style={styles.adminBadge}>
                      <Ionicons name="shield-checkmark" size={12} color={Colors.text.inverse} />
                      <Text style={styles.adminText}>COMMANDER</Text>
                    </View>
                  )}
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>ACTIVE</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Squad Information */}
            <View style={styles.squadPanel}>
              <View style={styles.panelHeader}>
                <Ionicons name="people" size={20} color={Colors.secondary} />
                <Text style={styles.panelTitle}>SQUAD INTEL</Text>
              </View>
              
              {currentGroup ? (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Squad Name:</Text>
                    <Text style={styles.infoValue}>{currentGroup.name}</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Squad Code:</Text>
                    <Text style={styles.infoValue}>{currentGroup.code}</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Members:</Text>
                    <Text style={styles.infoValue}>{currentGroup.members?.length || 0}</Text>
                  </View>
                </>
              ) : (
                <Text style={styles.infoValue}>No squad assigned</Text>
              )}
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Deployed:</Text>
                <Text style={styles.infoValue}>
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsPanel}>
              {currentGroup && (
                <>
                  <TouchableOpacity 
                    style={[styles.actionButton, getWebStyle('touchableOpacity')]}
                    onPress={handleShareTeamCode}
                  >
                  <LinearGradient
                    colors={[Colors.secondary, Colors.secondaryDark]}
                    style={styles.actionGradient}
                  >
                    <Ionicons name="share" size={20} color={Colors.text.primary} />
                    <Text style={styles.actionText}>SHARE SQUAD CODE</Text>
                  </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionButton, getWebStyle('touchableOpacity')]}
                    onPress={handleLeaveTeam}
                  >
                    <LinearGradient
                      colors={[Colors.error, '#D32F2F']}
                      style={styles.actionGradient}
                    >
                      <Ionicons name="exit" size={20} color={Colors.text.primary} />
                      <Text style={styles.actionText}>ABANDON SQUAD</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </>
        ) : (
          <>
            {/* Settings Panel */}
            <View style={styles.settingsPanel}>
              <View style={styles.panelHeader}>
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

            {/* System Info */}
            <View style={styles.infoPanel}>
              <View style={styles.panelHeader}>
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
              style={[styles.actionButton, getWebStyle('touchableOpacity')]}
              onPress={handleSignOut}
            >
              <LinearGradient
                colors={[Colors.error, '#D32F2F']}
                style={styles.actionGradient}
              >
                <Ionicons name="power" size={20} color={Colors.text.primary} />
                <Text style={styles.actionText}>EXTRACT FROM MISSION</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  operatorInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  settingsButton: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
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
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.medium,
    ...Shadows.lg,
  },
  operatorAvatar: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
    borderWidth: 3,
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
  squadPanel: {
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    marginTop: 0,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    ...Shadows.md,
  },
  settingsPanel: {
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    ...Shadows.md,
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
    minWidth: 100,
  },
  infoValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'right',
  },
  actionsPanel: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  actionButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  actionText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
    letterSpacing: 1,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: Typography.sizes.lg,
    color: Colors.text.secondary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  buttonText: {
    color: Colors.text.inverse,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
});

export default ProfileScreen;