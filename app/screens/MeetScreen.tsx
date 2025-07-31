import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getWebStyle } from '../utils/webStyles';
import { Team } from '../models/Team';
import { TeamMember } from '../models/TeamMember';
import { FirebaseStorageService } from '../services/FirebaseStorageService';
import { useLanguage, interpolate } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';

const MeetScreen: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    loadTeams();
    
    // Set up real-time subscription for current team
    let unsubscribe: (() => void) | null = null;
    
    const setupRealtimeSync = async () => {
      const teamResult = await FirebaseStorageService.getCurrentTeam();
      if (teamResult.success && teamResult.data) {
        unsubscribe = FirebaseStorageService.subscribeToTeam(
          teamResult.data.id,
          (updatedTeam) => {
            if (updatedTeam) {
              setCurrentTeam(updatedTeam);
              console.log('[REALTIME] Team updated:', updatedTeam.name);
            }
          }
        );
      }
    };

    setupRealtimeSync();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const loadTeams = async () => {
    try {
      console.log('[MEET_SCREEN] Loading teams...');
      
      // First try to load from cache
      const cachedTeams = await AsyncStorage.getItem('teams');
      if (cachedTeams) {
        const teamData = JSON.parse(cachedTeams);
        const cachedTeamObjects = teamData.map((data: any) => Team.fromJSON(data));
        setTeams(cachedTeamObjects);
        console.log('[MEET_SCREEN] Loaded', cachedTeamObjects.length, 'teams from cache');
        
        // Set current team from cache
        const currentTeamId = await AsyncStorage.getItem('currentTeamId');
        if (currentTeamId) {
          const currentTeamFromCache = cachedTeamObjects.find(team => team.id === currentTeamId);
          if (currentTeamFromCache) {
            setCurrentTeam(currentTeamFromCache);
            console.log('[MEET_SCREEN] Set current team from cache:', currentTeamFromCache.name);
          }
        }
        setLoading(false);
      }
      
      // Then load from remote storage
      if (user) {
        const teamsResult = await FirebaseStorageService.getTeams(user.uid);
        if (teamsResult.success && teamsResult.data) {
          setTeams(teamsResult.data);
          console.log('[MEET_SCREEN] Loaded', teamsResult.data.length, 'teams from remote');
          
          // Update cache
          await AsyncStorage.setItem('teams', JSON.stringify(teamsResult.data.map(team => team.toJSON())));
          
          // Set current team if not already set
          if (!currentTeam && teamsResult.data.length > 0) {
            setCurrentTeam(teamsResult.data[0]);
            await AsyncStorage.setItem('currentTeamId', teamsResult.data[0].id);
            console.log('[MEET_SCREEN] Set current team from remote:', teamsResult.data[0].name);
          }
        }
      }
    } catch (error) {
      console.error('[MEET_SCREEN] Error loading teams:', error);
      Alert.alert(t.common.error, 'An unexpected error occurred while loading teams');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMonth = (): string => {
    const now = new Date();
    const monthNames = Object.values(t.calendar.months);
    return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  };

  const handleViewAvailability = () => {
    if (currentTeam) {
      console.log('[MEET_SCREEN] Viewing availability for team:', currentTeam.id);
      router.push(`/(tabs)/meet/availability/${currentTeam.id}`);
    }
  };

  const handleJoinTeam = () => {
    console.log('[MEET_SCREEN] Navigating to join team');
    router.push('/(tabs)/meet/join-team');
  };

  const handleCreateTeam = () => {
    console.log('[MEET_SCREEN] Navigating to create team');
    router.push('/(tabs)/meet/create-team');
  };

  const renderTeamMember = ({ item }: { item: TeamMember }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>{item.getInitials()}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberEmail}>{item.email}</Text>
        {item.isAdmin() && (
          <Text style={styles.memberRole}>Commander</Text>
        )}
      </View>
      <Ionicons 
        name={item.isAdmin() ? "shield-checkmark" : "checkmark-circle"} 
        size={20} 
        color={item.isAdmin() ? Colors.accent : Colors.success} 
      />
    </View>
  );

  const renderNoTeamState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIllustration}>
        <Ionicons name="people-outline" size={80} color={Colors.text.tertiary} />
      </View>
      <Text style={styles.emptyTitle}>{t.team.noTeamTitle}</Text>
      <Text style={styles.emptyDescription}>
        {t.team.noTeamDescription}
      </Text>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.primaryActionButton, getWebStyle('touchableOpacity')]} 
          onPress={handleJoinTeam}
        >
          <Ionicons name="enter" size={20} color={Colors.text.inverse} />
          <Text style={styles.primaryActionText}>{t.team.joinTeam}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.secondaryActionButton, getWebStyle('touchableOpacity')]} 
          onPress={handleCreateTeam}
        >
          <Ionicons name="add" size={20} color={Colors.primary} />
          <Text style={styles.secondaryActionText}>{t.team.createTeam}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t.common.loading}</Text>
      </View>
    );
  }

  if (!currentTeam) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.headerGradient}
        >
          <Text style={styles.welcomeText}>Welcome, {user?.displayName}</Text>
        </LinearGradient>
        {renderNoTeamState()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.teamHeader}>
            <Text style={styles.welcomeText}>Welcome, {user?.displayName}</Text>
            <Text style={styles.teamName} numberOfLines={1} ellipsizeMode="tail">{currentTeam.name}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.availabilityButton, getWebStyle('touchableOpacity')]} 
            onPress={handleViewAvailability}
          >
            <Ionicons name="calendar" size={16} color={Colors.text.inverse} />
            <Text style={styles.availabilityButtonText}>{t.team.setAvailability}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.monthCard}>
          <View style={styles.monthHeader}>
            <Ionicons name="time" size={20} color={Colors.primary} />
            <Text style={styles.monthTitle}>{t.team.currentMonth}</Text>
          </View>
          <Text style={styles.monthValue}>{getCurrentMonth()}</Text>
        </View>

        <View style={styles.teamCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{interpolate(t.team.memberCount, { count: currentTeam.members.length })}</Text>
            <Ionicons name="people" size={20} color={Colors.primary} />
          </View>
          <FlatList
            data={currentTeam.members}
            renderItem={renderTeamMember}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
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
  headerGradient: {
    paddingTop: 85,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  teamHeader: {
    flex: 1,
    marginRight: Spacing.md,
  },
  welcomeText: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: Spacing.xs,
  },
  teamName: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
    numberOfLines: 1,
    ellipsizeMode: 'tail',
  },
  availabilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    flexShrink: 0,
  },
  availabilityButtonText: {
    color: Colors.text.inverse,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    marginLeft: Spacing.xs,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  monthCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  monthTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
  },
  monthValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
  teamCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flex: 1,
    ...Shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  memberAvatarText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  },
  memberRole: {
    fontSize: Typography.sizes.xs,
    color: Colors.accent,
    fontWeight: Typography.weights.semibold,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  emptyIllustration: {
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.md,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: Typography.sizes.md,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeights.relaxed,
  },
  actionButtons: {
    width: '100%',
    gap: Spacing.md,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.md,
  },
  primaryActionText: {
    color: Colors.text.inverse,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    marginLeft: Spacing.sm,
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },
  secondaryActionText: {
    color: Colors.primary,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    marginLeft: Spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
  },
});

export default MeetScreen;