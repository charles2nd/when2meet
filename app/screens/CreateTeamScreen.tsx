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
// Removed logger import - using console.log directly

const CreateTeamScreen: React.FC = () => {
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      Alert.alert('Invalid Input', 'Squad name is required');
      return;
    }

    if (teamName.trim().length > 50) {
      Alert.alert('Invalid Input', 'Squad name must be 50 characters or less');
      return;
    }

    if (description.length > 200) {
      Alert.alert('Invalid Input', 'Description must be 200 characters or less');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);
    console.log('[CREATE_TEAM] Creating squad:', teamName);
    
    try {
      const result = await FirebaseStorageService.createTeam({
        name: teamName.trim(),
        description: description.trim() || `Elite squad led by ${user.displayName}`,
        adminUser: {
          id: user.uid,
          name: user.displayName || 'Commander',
          email: user.email || 'commander@cs2.com'
        }
      });

      if (!result.success) {
        Alert.alert('Mission Failed', result.error || 'Unable to create squad. Try again.');
        return;
      }

      const newTeam = result.data!;
      console.log('[CREATE_TEAM] Squad created successfully:', newTeam.name, 'Code:', newTeam.code);
      
      Alert.alert(
        'Squad Deployed!', 
        `${newTeam.name} is now operational, Commander!\n\nSquad Code: ${newTeam.code}\n\nShare this code with your team members so they can join.`, 
        [{ text: 'Command', onPress: () => router.replace('/(tabs)/meet') }]
      );
    } catch (error) {
      console.error('[CREATE_TEAM] Squad creation failed:', error);
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
            <Ionicons name="add-circle" size={32} color={Colors.text.primary} />
          </View>
          <Text style={styles.missionTitle}>CREATE SQUAD</Text>
          <Text style={styles.missionSubtitle}>Establish new tactical unit</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Squad info panel */}
        <View style={styles.inputPanel}>
          <View style={styles.panelHeader}>
            <Ionicons name="flag" size={20} color={Colors.accent} />
            <Text style={styles.panelTitle}>SQUAD IDENTIFICATION</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Squad Name *</Text>
            <TextInput
              style={[styles.tacticalInput, getWebStyle('textInput')]}
              value={teamName}
              onChangeText={setTeamName}
              placeholder="Enter squad name..."
              placeholderTextColor={Colors.text.tertiary}
              maxLength={50}
              editable={!loading}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mission Description</Text>
            <TextInput
              style={[styles.tacticalInput, styles.textArea, getWebStyle('textInput')]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your tactical objectives..."
              placeholderTextColor={Colors.text.tertiary}
              multiline
              numberOfLines={3}
              maxLength={200}
              editable={!loading}
            />
          </View>
        </View>

        {/* Command structure */}
        <View style={styles.statusPanel}>
          <View style={styles.statusRow}>
            <Ionicons name="person" size={16} color={Colors.secondary} />
            <Text style={styles.statusLabel}>Commander:</Text>
            <Text style={styles.statusValue}>{user?.displayName || 'Unknown'}</Text>
          </View>
          <View style={styles.statusRow}>
            <Ionicons name="mail" size={16} color={Colors.secondary} />
            <Text style={styles.statusLabel}>Contact:</Text>
            <Text style={styles.statusValue}>{user?.email || 'Unknown'}</Text>
          </View>
        </View>

        {/* Create button */}
        <TouchableOpacity
          style={[
            styles.deployButton,
            !teamName.trim() && styles.deployButtonDisabled,
            getWebStyle('touchableOpacity')
          ]}
          onPress={handleCreateTeam}
          disabled={!teamName.trim() || loading}
        >
          <LinearGradient
            colors={
              !teamName.trim() || loading
                ? [Colors.border.medium, Colors.border.dark]
                : [Colors.primary, Colors.primaryDark]
            }
            style={styles.deployGradient}
          >
            {loading ? (
              <>
                <Ionicons name="hourglass" size={20} color={Colors.text.primary} />
                <Text style={styles.deployText}>ESTABLISHING...</Text>
              </>
            ) : (
              <>
                <Ionicons name="add" size={20} color={Colors.text.primary} />
                <Text style={styles.deployText}>ESTABLISH SQUAD</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Mission briefing */}
        <View style={styles.briefingPanel}>
          <Text style={styles.briefingTitle}>MISSION BRIEFING</Text>
          <Text style={styles.briefingText}>
            • Create and command your own tactical squad{'\n'}
            • Set mission objectives and squad description{'\n'}
            • Invite operators using your squad code{'\n'}
            • Coordinate team availability and objectives
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
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  tacticalInput: {
    backgroundColor: Colors.tactical.medium,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    fontWeight: Typography.weights.medium,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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

export default CreateTeamScreen;