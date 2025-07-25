import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMockData } from '../../contexts/MockDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { COLORS, SPACING } from '../../utils/constants';

const ProfileScreen: React.FC = () => {
  const { currentUser, currentTeam, availabilityEvents, getEventResponses, isLoaded } = useMockData();
  const { t, language, setLanguage } = useLanguage();

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'Coach': '#ef4444',
      'IGL': '#8b5cf6', 
      'Player': '#3b82f6',
      'Sub': '#10b981',
    };
    return colors[role] || '#6b7280';
  };

  const getRoleTranslation = (role: string) => {
    const roleKey = `role.${role.toLowerCase()}`;
    return t(roleKey);
  };

  const handleLanguageToggle = () => {
    const newLanguage = language === 'fr' ? 'en' : 'fr';
    setLanguage(newLanguage);
  };

  const getUserStats = () => {
    const userEvents = availabilityEvents.filter(event => event.teamId === currentTeam?.id);
    const userResponses = userEvents.reduce((total, event) => {
      const responses = getEventResponses(event.id);
      return total + responses.filter(r => r.userId === currentUser?.id).length;
    }, 0);

    return {
      eventsParticipated: userResponses,
      totalEvents: userEvents.length,
      responseRate: userEvents.length > 0 ? Math.round((userResponses / userEvents.length) * 100) : 0
    };
  };

  const stats = getUserStats();

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t('profile.loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('profile.title')}</Text>
        <Text style={styles.subtitle}>{t('profile.subtitle')}</Text>
      </View>
      
      {currentUser ? (
        <View style={styles.content}>
          {/* User Info Card */}
          <View style={styles.userCard}>
            <View style={styles.avatarContainer}>
              <View style={[
                styles.avatar,
                { backgroundColor: getRoleColor(currentUser.role) }
              ]}>
                <Text style={styles.avatarText}>
                  {currentUser.username.charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{currentUser.username}</Text>
              <View style={styles.roleContainer}>
                <View style={[
                  styles.roleBadge,
                  { backgroundColor: getRoleColor(currentUser.role) }
                ]}>
                  <Text style={styles.roleText}>{getRoleTranslation(currentUser.role)}</Text>
                </View>
              </View>
              {currentUser.email && (
                <Text style={styles.userEmail}>{currentUser.email}</Text>
              )}
            </View>
          </View>

          {/* Team Info */}
          {currentTeam && (
            <View style={styles.teamCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="people" size={24} color={COLORS.primary} />
                <Text style={styles.cardTitle}>{t('profile.current_team')}</Text>
              </View>
              <Text style={styles.teamName}>{currentTeam.name}</Text>
              {currentTeam.description && (
                <Text style={styles.teamDescription}>{currentTeam.description}</Text>
              )}
              <Text style={styles.teamMembers}>
                {currentTeam.members.length} {t('common.members')}
              </Text>
            </View>
          )}

          {/* Statistics */}
          <View style={styles.statsCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="stats-chart" size={24} color={COLORS.primary} />
              <Text style={styles.cardTitle}>{t('profile.activity_stats')}</Text>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.responseRate}%</Text>
                <Text style={styles.statLabel}>{t('profile.response_rate')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.eventsParticipated}</Text>
                <Text style={styles.statLabel}>{t('profile.events_joined')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalEvents}</Text>
                <Text style={styles.statLabel}>{t('profile.total_events')}</Text>
              </View>
            </View>
          </View>

          {/* Settings Options */}
          <View style={styles.settingsCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="settings" size={24} color={COLORS.primary} />
              <Text style={styles.cardTitle}>{t('profile.settings')}</Text>
            </View>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={20} color={COLORS.gray[600]} />
                <Text style={styles.settingText}>{t('profile.notifications')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.gray[400]} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="time-outline" size={20} color={COLORS.gray[600]} />
                <Text style={styles.settingText}>{t('profile.timezone')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.gray[400]} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem} onPress={handleLanguageToggle}>
              <View style={styles.settingLeft}>
                <Ionicons name="language-outline" size={20} color={COLORS.gray[600]} />
                <Text style={styles.settingText}>{t('profile.language')}</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.languageText}>
                  {language === 'fr' ? 'Français' : 'English'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.gray[400]} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="help-circle-outline" size={20} color={COLORS.gray[600]} />
                <Text style={styles.settingText}>{t('profile.help')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.gray[400]} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContent}>
          <Text style={styles.emptyText}>{t('profile.loading')}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    padding: 16,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  roleContainer: {
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  teamCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  teamName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  teamDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  teamMembers: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
});

export default ProfileScreen;