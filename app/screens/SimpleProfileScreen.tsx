import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/theme';
import { RESPONSIVE } from '../utils/responsive';

const SimpleProfileScreen: React.FC = () => {
  const { currentGroup, language, setLanguage, leaveGroup, t } = useApp();
  const { user: authUser, signOut } = useAuth();
  const router = useRouter();

  const handleLanguageChange = (lang: 'en' | 'fr') => {
    console.log('[PROFILE] Changing language to:', lang);
    setLanguage(lang);
  };

  const handleLeaveGroup = async () => {
    Alert.alert(
      t.common.confirm,
      `${t.profile.leaveGroupConfirm} "${currentGroup?.name}"?`,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.confirm,
          onPress: async () => {
            try {
              await leaveGroup();
              Alert.alert(t.common.success, t.profile.leaveGroupSuccess);
              // Redirect to group tab after leaving
              router.replace('/(tabs)/group');
            } catch (error) {
              Alert.alert(t.common.error, t.profile.leaveGroupError);
            }
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      t.common.confirm,
      t.profile.logoutConfirm,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.confirm,
          onPress: async () => {
            await signOut();
            router.replace('/login');
          }
        }
      ]
    );
  };

  if (!authUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.noUserText}>{t.profile.noUserLoggedIn}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t.profile.title}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>{t.profile.name}</Text>
        <Text style={styles.value}>{authUser.name || authUser.displayName || 'User'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t.profile.email}</Text>
        <Text style={styles.value}>{authUser.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t.profile.language}</Text>
        <View style={styles.languageButtons}>
          <TouchableOpacity
            style={[
              styles.languageButton,
              language === 'en' && styles.selectedLanguage
            ]}
            onPress={() => handleLanguageChange('en')}
          >
            <Text style={[
              styles.languageText,
              language === 'en' && styles.selectedLanguageText
            ]}>
              {t.profile.english}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.languageButton,
              language === 'fr' && styles.selectedLanguage
            ]}
            onPress={() => handleLanguageChange('fr')}
          >
            <Text style={[
              styles.languageText,
              language === 'fr' && styles.selectedLanguageText
            ]}>
              {t.profile.french}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {currentGroup && (
        <View style={styles.section}>
          <Text style={styles.label}>{t.profile.currentGroup}</Text>
          <Text style={styles.value}>{currentGroup.name}</Text>
          <Text style={styles.groupCode}>{t.profile.groupCode}: {currentGroup.code}</Text>
          
          <TouchableOpacity 
            style={styles.leaveButton} 
            onPress={handleLeaveGroup}
          >
            <Text style={styles.leaveButtonText}>{t.profile.leaveGroup}</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>{t.profile.logout}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: RESPONSIVE.safeArea.top,
  },
  title: {
    fontSize: RESPONSIVE.fontSizes.xxxl,
    fontWeight: 'bold',
    paddingHorizontal: RESPONSIVE.spacing.lg,
    paddingVertical: RESPONSIVE.spacing.lg,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  section: {
    backgroundColor: Colors.surface,
    marginHorizontal: RESPONSIVE.spacing.md,
    marginBottom: RESPONSIVE.spacing.md,
    padding: RESPONSIVE.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  label: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  languageButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  languageButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    alignItems: 'center',
    marginRight: 5,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  selectedLanguage: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  languageText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  selectedLanguageText: {
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  groupCode: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 5,
  },
  leaveButton: {
    backgroundColor: Colors.error,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  leaveButtonText: {
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: Colors.error,
    marginHorizontal: RESPONSIVE.spacing.md,
    marginVertical: RESPONSIVE.spacing.lg,
    marginBottom: RESPONSIVE.safeArea.bottom + RESPONSIVE.spacing.lg,
    paddingVertical: RESPONSIVE.spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: Colors.text.primary,
    fontSize: RESPONSIVE.fontSizes.lg,
    fontWeight: 'bold',
  },
  noUserText: {
    color: Colors.text.secondary,
    fontSize: RESPONSIVE.fontSizes.lg,
    textAlign: 'center',
    marginTop: RESPONSIVE.spacing.xl,
  },
});

export default SimpleProfileScreen;