import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FirebaseStorageService } from '../services/FirebaseStorageService';
import { getWebStyle } from '../utils/webStyles';
import { Team } from '../models/Team';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
// Removed logger import

const JoinTeamScreen: React.FC = () => {
  const [teamCode, setTeamCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();

  const handleJoinTeam = async () => {
    if (!teamCode.trim()) {
      Alert.alert('Invalid Code', 'Please enter a team code');
      return;
    }

    if (teamCode.trim().length < 4) {
      Alert.alert('Invalid Code', 'Team code must be at least 4 characters');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);
    console.log('[JOIN_TEAM] Attempting to join team with code:', teamCode);

    try {
      const result = await FirebaseStorageService.joinTeam(teamCode.trim(), {
        id: user.uid,
        name: user.displayName || 'Operator',
        email: user.email || 'operator@cs2.com'
      });

      if (!result.success) {
        Alert.alert('Mission Failed', result.error || 'Unable to join team. Please check the code and try again.');
        return;
      }

      const team = result.data!;
      console.log('[JOIN_TEAM] Successfully joined team:', team.name);
      
      Alert.alert(
        'Mission Joined!', 
        `Welcome to ${team.name}, operator!\n\nYou are now part of the squad and can coordinate with your team members.`, 
        [{ text: 'Deploy', onPress: () => router.replace('/(tabs)/meet') }]
      );
    } catch (error) {
      console.error('[JOIN_TEAM] Failed to join team:', error);
      Alert.alert('Mission Failed', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.tactical.dark} />
      
      {/* CS2-style header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={styles.missionIcon}>
            <Ionicons name="people" size={32} color={Colors.text.primary} />
          </View>
          <Text style={styles.missionTitle}>JOIN SQUAD</Text>
          <Text style={styles.missionSubtitle}>Enter team code to deploy</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main input panel */}
        <View style={styles.inputPanel}>
          <View style={styles.panelHeader}>
            <Ionicons name="shield" size={20} color={Colors.accent} />
            <Text style={styles.panelTitle}>TEAM CODE</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.tacticalInput, getWebStyle('textInput')]}
              value={teamCode}
              onChangeText={setTeamCode}
              placeholder="Enter team code..."
              placeholderTextColor={Colors.text.tertiary}
              autoCapitalize="characters"
              maxLength={10}
              editable={!loading}
            />
            <View style={styles.inputAccent} />
          </View>
          
          <Text style={styles.hint}>
            Get the code from your squad leader
          </Text>
        </View>

        {/* Status info */}
        <View style={styles.statusPanel}>
          <View style={styles.statusRow}>
            <Ionicons name="person" size={16} color={Colors.secondary} />
            <Text style={styles.statusLabel}>Operator:</Text>
            <Text style={styles.statusValue}>{user?.displayName || 'Unknown'}</Text>
          </View>
          <View style={styles.statusRow}>
            <Ionicons name="mail" size={16} color={Colors.secondary} />
            <Text style={styles.statusLabel}>Contact:</Text>
            <Text style={styles.statusValue}>{user?.email || 'Unknown'}</Text>
          </View>
        </View>

        {/* Join button */}
        <TouchableOpacity
          style={[
            styles.deployButton,
            !teamCode.trim() && styles.deployButtonDisabled,
            getWebStyle('touchableOpacity')
          ]}
          onPress={handleJoinTeam}
          disabled={!teamCode.trim() || loading}
        >
          <LinearGradient
            colors={
              !teamCode.trim() || loading
                ? [Colors.border.medium, Colors.border.dark]
                : [Colors.secondary, Colors.secondaryDark]
            }
            style={styles.deployGradient}
          >
            {loading ? (
              <>
                <Ionicons name="hourglass" size={20} color={Colors.text.primary} />
                <Text style={styles.deployText}>CONNECTING...</Text>
              </>
            ) : (
              <>
                <Ionicons name="rocket" size={20} color={Colors.text.primary} />
                <Text style={styles.deployText}>DEPLOY TO SQUAD</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Mission briefing */}
        <View style={styles.briefingPanel}>
          <Text style={styles.briefingTitle}>MISSION BRIEFING</Text>
          <Text style={styles.briefingText}>
            • Join your squad using the team code{'\n'}
            • Coordinate availability with team members{'\n'}
            • Complete objectives together{'\n'}
            • Maintain operational security
          </Text>
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
    paddingTop: 50,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  missionIcon: {
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
  missionTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    letterSpacing: 2,
  },
  missionSubtitle: {
    fontSize: Typography.sizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inputPanel: {
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    ...Shadows.lg,
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
    position: 'relative',
    marginBottom: Spacing.md,
  },
  tacticalInput: {
    backgroundColor: Colors.tactical.medium,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.lg,
    color: Colors.text.primary,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
    letterSpacing: 2,
  },
  inputAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  hint: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statusPanel: {
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    marginTop: 0,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
    minWidth: 80,
  },
  statusValue: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.primary,
    fontWeight: Typography.weights.medium,
    flex: 1,
  },
  deployButton: {
    margin: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  deployButtonDisabled: {
    opacity: 0.6,
  },
  deployGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  deployText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
    letterSpacing: 1,
  },
  briefingPanel: {
    backgroundColor: Colors.tactical.medium,
    margin: Spacing.lg,
    marginTop: 0,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  briefingTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text.accent,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  briefingText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeights.relaxed,
  },
});

export default JoinTeamScreen;