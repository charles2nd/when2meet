import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, GAME_LABELS } from '../../utils/constants';
import { mockUser, mockTeams, mockPlayerStats } from '../../utils/mockData';
import { formatPhoneNumber, getInitials } from '../../utils/helpers';

export default function ProfileScreen() {
  const userStats = mockPlayerStats.find((stat) => stat.playerId === mockUser.id);
  const userTeams = mockTeams.filter((team) =>
    team.members.some((member) => member.userId === mockUser.id)
  );

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing would open here');
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'App settings would open here');
  };

  const handleLinkAccount = (platform: string) => {
    Alert.alert('Link Account', `${platform} account linking would open here`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            {mockUser.avatar ? (
              <Image source={{ uri: mockUser.avatar }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
                <Text style={styles.profileImageText}>{getInitials(mockUser.displayName)}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.editImageButton}>
              <Ionicons name="camera" size={16} color={COLORS.light} />
            </TouchableOpacity>
          </View>

          <Text style={styles.displayName}>{mockUser.displayName}</Text>
          <Text style={styles.phoneNumber}>{formatPhoneNumber(mockUser.id)}</Text>

          <View style={styles.profileActions}>
            <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
              <Ionicons name="pencil" size={16} color={COLORS.primary} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
              <Ionicons name="settings" size={20} color={COLORS.gray[400]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Gaming Stats */}
        {userStats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gaming Stats</Text>
            <View style={styles.statsCard}>
              <View style={styles.statsHeader}>
                <View style={styles.gameInfo}>
                  <Text style={styles.gameName}>{GAME_LABELS[userStats.game]}</Text>
                  <Text style={styles.platform}>{userStats.platform.toUpperCase()}</Text>
                </View>
                <View style={styles.rankContainer}>
                  <Text style={styles.rank}>{userStats.stats.rank}</Text>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userStats.stats.kd}</Text>
                  <Text style={styles.statLabel}>K/D Ratio</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userStats.stats.wins}</Text>
                  <Text style={styles.statLabel}>Wins</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {Math.round((userStats.stats.headshots / userStats.stats.kills) * 100)}%
                  </Text>
                  <Text style={styles.statLabel}>HS%</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userStats.stats.hours}</Text>
                  <Text style={styles.statLabel}>Hours</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Gaming Accounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gaming Accounts</Text>

          <TouchableOpacity style={styles.accountItem} onPress={() => handleLinkAccount('Steam')}>
            <View style={styles.accountInfo}>
              <View style={[styles.accountIcon, { backgroundColor: '#1e2328' }]}>
                <Ionicons name="game-controller" size={20} color="#66c0f4" />
              </View>
              <View>
                <Text style={styles.accountName}>Steam</Text>
                <Text style={styles.accountStatus}>
                  {mockUser.steamId ? `ID: ${mockUser.steamId}` : 'Not connected'}
                </Text>
              </View>
            </View>
            <Ionicons
              name={mockUser.steamId ? 'checkmark-circle' : 'add-circle'}
              size={24}
              color={mockUser.steamId ? COLORS.success : COLORS.gray[400]}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.accountItem} onPress={() => handleLinkAccount('Faceit')}>
            <View style={styles.accountInfo}>
              <View style={[styles.accountIcon, { backgroundColor: '#ff5500' }]}>
                <Text style={styles.accountIconText}>F</Text>
              </View>
              <View>
                <Text style={styles.accountName}>Faceit</Text>
                <Text style={styles.accountStatus}>
                  {mockUser.faceitId ? `@${mockUser.faceitId}` : 'Not connected'}
                </Text>
              </View>
            </View>
            <Ionicons
              name={mockUser.faceitId ? 'checkmark-circle' : 'add-circle'}
              size={24}
              color={mockUser.faceitId ? COLORS.success : COLORS.gray[400]}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.accountItem} onPress={() => handleLinkAccount('ESEA')}>
            <View style={styles.accountInfo}>
              <View style={[styles.accountIcon, { backgroundColor: '#00d4aa' }]}>
                <Text style={styles.accountIconText}>E</Text>
              </View>
              <View>
                <Text style={styles.accountName}>ESEA</Text>
                <Text style={styles.accountStatus}>
                  {mockUser.eseaId ? `@${mockUser.eseaId}` : 'Not connected'}
                </Text>
              </View>
            </View>
            <Ionicons
              name={mockUser.eseaId ? 'checkmark-circle' : 'add-circle'}
              size={24}
              color={mockUser.eseaId ? COLORS.success : COLORS.gray[400]}
            />
          </TouchableOpacity>
        </View>

        {/* Teams */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Teams ({userTeams.length})</Text>
          {userTeams.map((team) => {
            const userMember = team.members.find((member) => member.userId === mockUser.id);
            return (
              <View key={team.id} style={styles.teamItem}>
                <View style={styles.teamInfo}>
                  {team.logo ? (
                    <Image source={{ uri: team.logo }} style={styles.teamLogo} />
                  ) : (
                    <View style={[styles.teamLogo, styles.teamLogoPlaceholder]}>
                      <Text style={styles.teamLogoText}>{getInitials(team.name)}</Text>
                    </View>
                  )}
                  <View style={styles.teamDetails}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.teamRole}>
                      {userMember?.role
                        ? userMember.role.charAt(0).toUpperCase() + userMember.role.slice(1)
                        : 'Member'}
                    </Text>
                    <Text style={styles.teamGame}>{GAME_LABELS[team.game]}</Text>
                  </View>
                </View>
                {team.stats && (
                  <View style={styles.teamStats}>
                    <Text style={styles.teamWinRate}>{team.stats.winRate.toFixed(0)}%</Text>
                    <Text style={styles.teamWinRateLabel}>Win Rate</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Activity Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <Ionicons name="calendar" size={20} color={COLORS.primary} />
              <Text style={styles.activityText}>5 events this week</Text>
            </View>
            <View style={styles.activityItem}>
              <Ionicons name="chatbubble" size={20} color={COLORS.secondary} />
              <Text style={styles.activityText}>23 messages sent today</Text>
            </View>
            <View style={styles.activityItem}>
              <Ionicons name="trophy" size={20} color={COLORS.warning} />
              <Text style={styles.activityText}>3 matches won</Text>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.appName}>When2meet</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>The ultimate gaming team management platform</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.darker,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    backgroundColor: COLORS.gray[700],
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 32,
    fontWeight: '600',
    color: COLORS.light,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayName: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.light,
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 16,
    color: COLORS.gray[400],
    marginBottom: SPACING.lg,
  },
  profileActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary + '20',
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.md,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
    marginLeft: 4,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.light,
    marginBottom: SPACING.md,
  },
  statsCard: {
    backgroundColor: COLORS.gray[900],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[800],
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  gameInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.light,
    marginRight: SPACING.sm,
  },
  platform: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  rankContainer: {
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  rank: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.warning,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.light,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray[400],
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.gray[900],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  accountIconText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.light,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.light,
    marginBottom: 2,
  },
  accountStatus: {
    fontSize: 14,
    color: COLORS.gray[400],
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.gray[900],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamLogo: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.md,
  },
  teamLogoPlaceholder: {
    backgroundColor: COLORS.gray[700],
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamLogoText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.light,
  },
  teamDetails: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.light,
    marginBottom: 2,
  },
  teamRole: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 2,
  },
  teamGame: {
    fontSize: 12,
    color: COLORS.gray[400],
  },
  teamStats: {
    alignItems: 'center',
  },
  teamWinRate: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.success,
  },
  teamWinRateLabel: {
    fontSize: 10,
    color: COLORS.gray[400],
  },
  activityCard: {
    backgroundColor: COLORS.gray[900],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  activityText: {
    fontSize: 14,
    color: COLORS.light,
    marginLeft: SPACING.md,
  },
  aboutCard: {
    backgroundColor: COLORS.gray[900],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: COLORS.gray[400],
    marginBottom: SPACING.sm,
  },
  appDescription: {
    fontSize: 14,
    color: COLORS.gray[300],
    textAlign: 'center',
  },
});
