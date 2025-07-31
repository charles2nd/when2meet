import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { RESPONSIVE } from '../utils/responsive';
import { Group } from '../models/Group';
import { User } from '../models/User';
import { LocalStorage } from '../services/LocalStorage';

const SimpleProfileScreen: React.FC = () => {
  const { currentGroup, userGroups, language, setLanguage, loadUserGroups, user, setUser, setCurrentGroup, t } = useApp();
  const { user: authUser, signOut } = useAuth();
  const router = useRouter();

  // Load user groups when component mounts
  useEffect(() => {
    if (authUser) {
      loadUserGroups();
    }
  }, [authUser, loadUserGroups]);

  const handleLanguageChange = (lang: 'en' | 'fr') => {
    console.log('[PROFILE] Changing language to:', lang);
    setLanguage(lang);
  };


  const renderGroupItem = ({ item: group }: { item: Group }) => {
    const isCurrentGroup = currentGroup?.id === group.id;
    const isAdmin = group.adminId === authUser?.uid;
    
    return (
      <View style={[styles.groupItem, isCurrentGroup && styles.currentGroupItem]}>
        <View style={styles.groupHeader}>
          <View style={styles.groupInfo}>
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.groupCode}>{t.group.code}: {group.code}</Text>
            <Text style={styles.groupMembers}>
              {group.members.length} {group.members.length === 1 ? t.group.member : t.group.members}
            </Text>
          </View>
          <View style={styles.groupBadges}>
            {isAdmin && (
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={16} color={Colors.accent} />
                <Text style={styles.adminText}>{t.group.admin}</Text>
              </View>
            )}
            {isCurrentGroup && (
              <View style={styles.currentBadge}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.currentText}>{t.group.current}</Text>
              </View>
            )}
          </View>
        </View>
        
        <Text style={styles.groupCreatedAt}>
          {t.group.created}: {new Date(group.createdAt).toLocaleDateString()}
        </Text>
        
        <View style={styles.groupActions}>
          {!isCurrentGroup && (
            <TouchableOpacity 
              style={styles.switchGroupButton} 
              onPress={() => handleSwitchGroup(group)}
            >
              <Ionicons name="swap-horizontal" size={16} color={Colors.primary} />
              <Text style={styles.switchGroupButtonText}>{t.group.switchToThisGroup}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const handleSwitchGroup = async (group: Group) => {
    console.log('[PROFILE] Switching to group:', group.name);
    
    try {
      // Use the setCurrentGroup function from AppContext
      setCurrentGroup(group);
      
      // Update user's current group
      if (user) {
        const updatedUser = new User({
          id: user.id,
          name: user.name,
          email: user.email,
          language: user.language,
          groupId: group.id
        });
        setUser(updatedUser);
        await LocalStorage.saveUser(updatedUser);
      }
      
      console.log('[PROFILE] ✅ Successfully switched to group:', group.name);
      
      // Navigate to group page to show the switch
      router.push('/(tabs)/group');
    } catch (error) {
      console.error('[PROFILE] ❌ Error switching group:', error);
    }
  };

  const handleLogout = async () => {
    console.log('[PROFILE] Logout requested');
    
    // Direct logout without confirmation popup
    await signOut();
    router.replace('/login');
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
        <Text style={styles.label}>
          {authUser.phoneNumber ? t.phone.phoneNumber : t.profile.email}
        </Text>
        <Text style={styles.value}>
          {authUser.phoneNumber || authUser.email || 'Not provided'}
        </Text>
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

      {/* User Groups Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="people" size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>{t.group.myGroups} ({userGroups.length})</Text>
        </View>
        
        {userGroups.length > 0 ? (
          <FlatList
            data={userGroups}
            renderItem={renderGroupItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.groupSeparator} />}
          />
        ) : (
          <View style={styles.noGroupsContainer}>
            <Ionicons name="people-outline" size={48} color={Colors.text.tertiary} />
            <Text style={styles.noGroupsText}>{t.group.noGroupsJoinedYet}</Text>
            <Text style={styles.noGroupsSubtext}>{t.group.createOrJoinGroup}</Text>
          </View>
        )}
      </View>

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
    paddingHorizontal: RESPONSIVE.spacing.lg,
    paddingVertical: RESPONSIVE.spacing.md,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: RESPONSIVE.spacing.md,
  },
  sectionTitle: {
    fontSize: RESPONSIVE.fontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginLeft: RESPONSIVE.spacing.sm,
  },
  groupItem: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: RESPONSIVE.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  currentGroupItem: {
    borderColor: Colors.success,
    borderWidth: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: RESPONSIVE.spacing.sm,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: RESPONSIVE.fontSizes.md,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  groupCode: {
    fontSize: RESPONSIVE.fontSizes.sm,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  groupMembers: {
    fontSize: RESPONSIVE.fontSizes.sm,
    color: Colors.text.secondary,
  },
  groupBadges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  adminText: {
    fontSize: RESPONSIVE.fontSizes.xs,
    color: Colors.text.inverse,
    fontWeight: 'bold',
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  currentText: {
    fontSize: RESPONSIVE.fontSizes.xs,
    color: Colors.text.inverse,
    fontWeight: 'bold',
  },
  groupCreatedAt: {
    fontSize: RESPONSIVE.fontSizes.xs,
    color: Colors.text.tertiary,
    marginTop: RESPONSIVE.spacing.sm,
  },
  groupActions: {
    marginTop: RESPONSIVE.spacing.md,
  },
  switchGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: RESPONSIVE.spacing.md,
    paddingVertical: RESPONSIVE.spacing.sm,
    borderRadius: 8,
    gap: RESPONSIVE.spacing.xs,
  },
  switchGroupButtonText: {
    color: Colors.text.inverse,
    fontSize: RESPONSIVE.fontSizes.sm,
    fontWeight: 'bold',
  },
  groupSeparator: {
    height: RESPONSIVE.spacing.sm,
  },
  noGroupsContainer: {
    alignItems: 'center',
    paddingVertical: RESPONSIVE.spacing.xl,
    gap: RESPONSIVE.spacing.sm,
  },
  noGroupsText: {
    fontSize: RESPONSIVE.fontSizes.md,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  noGroupsSubtext: {
    fontSize: RESPONSIVE.fontSizes.sm,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});

export default SimpleProfileScreen;