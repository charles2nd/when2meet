import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { getWebStyle } from '../utils/webStyles';
// Removed logger import
import { FirebaseStorageService } from '../services/FirebaseStorageService';
import { Team } from '../models/Team';
import { TeamMember } from '../models/TeamMember';

const FindGroupScreen: React.FC = () => {
  const [groupCode, setGroupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  const handleJoinGroup = () => {
    console.log('[FIND_GROUP] Navigating to join team');
    router.push('/(tabs)/meet/join-team');
  };

  const handleCreateGroup = () => {
    console.log('[FIND_GROUP] Navigating to create team');
    router.push('/(tabs)/meet/create-team');
  };

  const handleQuickJoin = async () => {
    if (!groupCode.trim()) {
      return;
    }

    setLoading(true);
    console.log('[FIND_GROUP] Quick join attempt with code:', groupCode);
    
    try {
      const result = await FirebaseStorageService.joinTeam(groupCode.trim(), {
        id: user?.uid || 'demo-user',
        name: user?.displayName || 'Demo User',
        email: user?.email || 'demo@example.com'
      });

      if (result.success && result.data) {
        console.log('[FIND_GROUP] Successfully joined team:', result.data.name);
        router.replace('/(tabs)/meet');
      } else {
        // If join fails, try creating a team with the code as name
        const createResult = await FirebaseStorageService.createTeam({
          name: `Team ${groupCode}`,
          description: `Team created with code: ${groupCode}`,
          adminUser: {
            id: user?.uid || 'demo-user',
            name: user?.displayName || 'Demo User',
            email: user?.email || 'demo@example.com'
          }
        });

        if (createResult.success) {
          console.log('[FIND_GROUP] Successfully created team:', createResult.data!.name);
          router.replace('/(tabs)/meet');
        } else {
          console.error('[FIND_GROUP] Both join and create failed:', createResult.error);
        }
      }
    } catch (error) {
      console.error('[FIND_GROUP] Quick join failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome, Operator {user?.displayName}!</Text>
            <Text style={styles.subtitle}>Select your mission</Text>
          </View>
          
          <View style={styles.iconContainer}>
            <View style={styles.operatorIcon}>
              <Ionicons name="shield" size={40} color={Colors.accent} />
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.quickJoinCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="flash" size={24} color={Colors.accent} />
            <Text style={styles.cardTitle}>RAPID DEPLOY</Text>
          </View>
          <Text style={styles.cardDescription}>
            Have a squad code? Deploy instantly to your team
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, getWebStyle('textInput')]}
              value={groupCode}
              onChangeText={setGroupCode}
              placeholder="ENTER SQUAD CODE"
              placeholderTextColor={Colors.text.tertiary}
              autoCapitalize="characters"
              editable={!loading}
            />
            <TouchableOpacity
              style={[
                styles.quickJoinButton,
                !groupCode.trim() && styles.disabledButton,
                getWebStyle('touchableOpacity')
              ]}
              onPress={handleQuickJoin}
              disabled={!groupCode.trim() || loading}
            >
              <Ionicons 
                name="arrow-forward" 
                size={20} 
                color={!groupCode.trim() ? Colors.text.tertiary : Colors.text.inverse} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.optionsContainer}>
          <Text style={styles.sectionTitle}>MISSION SELECTION</Text>
          
          <TouchableOpacity
            style={[styles.optionCard, getWebStyle('touchableOpacity')]}
            onPress={handleJoinGroup}
          >
            <LinearGradient
              colors={[Colors.secondary, Colors.secondaryDark]}
              style={styles.optionGradient}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons name="enter" size={32} color={Colors.text.inverse} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>JOIN EXISTING SQUAD</Text>
                <Text style={styles.optionDescription}>
                  Connect to an established team using their secure code
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="rgba(255, 255, 255, 0.7)" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, getWebStyle('touchableOpacity')]}
            onPress={handleCreateGroup}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.optionGradient}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons name="add-circle" size={32} color={Colors.text.inverse} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>CREATE NEW SQUAD</Text>
                <Text style={styles.optionDescription}>
                  Lead your own team and recruit new operators
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="rgba(255, 255, 255, 0.7)" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.helpSection}>
          <View style={styles.helpCard}>
            <Ionicons name="help-circle" size={24} color={Colors.primary} />
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>TACTICAL SUPPORT</Text>
              <Text style={styles.helpText}>
                Contact your squad leader for access codes, or establish a new unit if you're commanding.
              </Text>
            </View>
          </View>
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
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  iconContainer: {
    marginLeft: Spacing.lg,
  },
  operatorIcon: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  quickJoinCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
  },
  cardDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
    lineHeight: Typography.lineHeights.relaxed,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.md,
    backgroundColor: Colors.background,
  },
  quickJoinButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },
  disabledButton: {
    backgroundColor: Colors.border.medium,
  },
  optionsContainer: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  optionCard: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadows.md,
  },
  optionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  optionIconContainer: {
    marginRight: Spacing.md,
  },
  optionContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  optionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
    marginBottom: Spacing.xs,
  },
  optionDescription: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: Typography.lineHeights.relaxed,
  },
  helpSection: {
    marginBottom: Spacing.xl,
  },
  helpCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...Shadows.sm,
  },
  helpContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  helpTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  helpText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeights.relaxed,
  },
});

export default FindGroupScreen;