import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, StatusBar, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import { Colors, Typography, Spacing, BorderRadius, CommonStyles, HeaderStyles } from '../theme';
import { getWebStyle } from '../utils/webStyles';
import { AuthGuard } from '../components/AuthGuard';
import { DemoDataService } from '../services/DemoDataService';

const GroupScreen: React.FC = () => {
  const { user, currentGroup, groupAvailabilities, createGroup, joinGroup, loadGroupAvailabilities, t } = useApp();
  const router = useRouter();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [groupCode, setGroupCode] = useState('');
  const [groupName, setGroupName] = useState('');
  useEffect(() => {
    if (currentGroup) {
      console.log('[GROUP] Loading group availabilities...');
      loadGroupAvailabilities();
    }
  }, [currentGroup]);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      return;
    }

    try {
      await createGroup(groupName.trim());
      setShowCreateForm(false);
      setGroupName('');
      
      
      router.push('/(tabs)/calendar');
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleJoinGroup = async () => {
    if (!groupCode.trim()) {
      return;
    }

    try {
      const success = await joinGroup(groupCode.trim());
      if (success) {
        setShowJoinForm(false);
        setGroupCode('');
        
        
        router.push('/(tabs)/calendar');
      } else {
      }
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleShareGroup = async () => {
    if (!currentGroup) return;

    try {
      const shareMessage = `🎯 ${t.group.inviteMessage}\n\n` +
        `${t.group.squadNameLabel}: ${currentGroup.name}\n` +
        `${t.group.groupCodeLabel}: ${currentGroup.code}\n\n` +
        `${t.group.shareInstructions}`;

      const shareOptions = {
        message: shareMessage,
        title: `${t.group.shareTitle} ${currentGroup.name}`,
      };

      const result = await Share.share(shareOptions);

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('[SHARE] Shared via:', result.activityType);
        } else {
          console.log('[SHARE] Group shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('[SHARE] Share dismissed');
      }
    } catch (error) {
      console.error('[SHARE] Error sharing group:', error);
      Alert.alert(
        t.group.shareError,
        t.group.shareErrorMessage,
        [{ text: t.common.ok || 'OK', style: 'default' }]
      );
    }
  };



  if (!currentGroup) {
    return (
      <AuthGuard>
        <View style={[CommonStyles.container]}>
          <StatusBar barStyle="light-content" backgroundColor={Colors.tactical.dark} />
          
          {/* CS2 Header */}
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={HeaderStyles.headerCenter}
          >
            <View style={styles.logoContainer}>
              <Ionicons name="people-outline" size={32} color={Colors.accent} />
            </View>
            <Text style={HeaderStyles.headerTitle}>SQUAD DEPLOYMENT</Text>
            <Text style={HeaderStyles.headerSubtitle}>Join or create your tactical unit</Text>
          </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {!showJoinForm && !showCreateForm && (
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={[CommonStyles.buttonBase, getWebStyle('touchableOpacity')]}
                onPress={() => setShowJoinForm(true)}
              >
                <LinearGradient
                  colors={[Colors.secondary, Colors.secondaryDark]}
                  style={CommonStyles.buttonGradient}
                >
                  <Ionicons name="enter-outline" size={20} color={Colors.text.primary} />
                  <Text style={CommonStyles.buttonText}>{t.group.joinGroupButton}</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[CommonStyles.buttonBase, getWebStyle('touchableOpacity')]}
                onPress={() => setShowCreateForm(true)}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDark]}
                  style={CommonStyles.buttonGradient}
                >
                  <Ionicons name="add-circle-outline" size={20} color={Colors.text.primary} />
                  <Text style={CommonStyles.buttonText}>{t.group.createGroupButton}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {showJoinForm && (
            <View style={[CommonStyles.panel]}>
              <View style={styles.panelHeader}>
                <Ionicons name="shield-checkmark" size={20} color={Colors.accent} />
                <Text style={styles.panelTitle}>SQUAD CODE</Text>
              </View>
              
              <TextInput
                style={[CommonStyles.input, getWebStyle('textInput')]}
                placeholder={t.group.enterCode}
                placeholderTextColor={Colors.text.tertiary}
                value={groupCode}
                onChangeText={setGroupCode}
                autoCapitalize="characters"
              />
              
              <TouchableOpacity 
                style={[CommonStyles.buttonBase, getWebStyle('touchableOpacity')]}
                onPress={handleJoinGroup}
              >
                <LinearGradient
                  colors={[Colors.secondary, Colors.secondaryDark]}
                  style={CommonStyles.buttonGradient}
                >
                  <Ionicons name="rocket-outline" size={20} color={Colors.text.primary} />
                  <Text style={CommonStyles.buttonText}>{t.group.deployToSquad}</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setShowJoinForm(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>{t.group.goBack}</Text>
              </TouchableOpacity>
            </View>
          )}

          {showCreateForm && (
            <View style={[CommonStyles.panel]}>
              <View style={styles.panelHeader}>
                <Ionicons name="flag" size={20} color={Colors.accent} />
                <Text style={styles.panelTitle}>SQUAD CREATION</Text>
              </View>
              
              <TextInput
                style={[CommonStyles.input, getWebStyle('textInput')]}
                placeholder={t.group.groupName}
                placeholderTextColor={Colors.text.tertiary}
                value={groupName}
                onChangeText={setGroupName}
              />
              
              <TouchableOpacity 
                style={[CommonStyles.buttonBase, getWebStyle('touchableOpacity')]}
                onPress={handleCreateGroup}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDark]}
                  style={CommonStyles.buttonGradient}
                >
                  <Ionicons name="add" size={20} color={Colors.text.primary} />
                  <Text style={CommonStyles.buttonText}>{t.group.establishSquad}</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setShowCreateForm(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>{t.group.goBack}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
        </View>
      </AuthGuard>
    );
  }

  // If user has a group, show the group interface
  return (
    <AuthGuard>
      <View style={CommonStyles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.tactical.dark} />
        
        <LinearGradient
          colors={[Colors.secondary, Colors.secondaryDark]}
          style={HeaderStyles.headerCenter}
        >
          <Text style={HeaderStyles.headerTitle}>
            {DemoDataService.isDemoGroup(currentGroup.code) ? t.group.demoGroup : currentGroup.name}
          </Text>
          <Text style={HeaderStyles.headerSubtitle}>
            {DemoDataService.isDemoGroup(currentGroup.code) ? t.group.observerMode : t.group.squadOperationalStatus}
          </Text>
        </LinearGradient>

        {/* Demo Notice */}
        {DemoDataService.isDemoGroup(currentGroup.code) && (
          <View style={[CommonStyles.panel, styles.demoNotice]}>
            <View style={styles.panelHeader}>
              <Ionicons name="information-circle" size={20} color={Colors.accent} />
              <Text style={styles.panelTitle}>{t.group.demoGroup}</Text>
            </View>
            <Text style={styles.demoText}>{t.group.demoNotice}</Text>
            <Text style={styles.demoCode}>Group Code: {currentGroup.code}</Text>
          </View>
        )}

      <ScrollView style={styles.content}>
        {/* Group Info and Share Panel */}
        <View style={[CommonStyles.panel]}>
          <View style={styles.panelHeader}>
            <Ionicons name="people" size={20} color={Colors.accent} />
            <Text style={styles.panelTitle}>SQUAD INFORMATION</Text>
          </View>
          
          <View style={styles.groupInfoContainer}>
            <View style={styles.groupCodeContainer}>
              <Text style={styles.groupCodeLabel}>{t.group.groupCodeLabel || 'Squad Code'}:</Text>
              <Text style={styles.groupCodeValue}>{currentGroup.code}</Text>
            </View>
            
            <TouchableOpacity 
              style={[CommonStyles.buttonBase, styles.shareButton, getWebStyle('touchableOpacity')]}
              onPress={handleShareGroup}
            >
              <LinearGradient
                colors={[Colors.accent, '#FF8F00']}
                style={[CommonStyles.buttonGradient, styles.shareButtonGradient]}
              >
                <Ionicons name="share-outline" size={20} color={Colors.text.inverse} />
                <Text style={[CommonStyles.buttonText, styles.shareButtonText]}>
                  {t.group.inviteMembers || 'INVITE SQUAD MEMBERS'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.memberSummary}>
            Team members: {currentGroup.members?.length || 0}
          </Text>
        </View>

        <View style={[CommonStyles.panel]}>
          <View style={styles.panelHeader}>
            <Ionicons name="today" size={20} color={Colors.accent} />
            <Text style={styles.panelTitle}>TODAY'S TEAM SCHEDULE</Text>
          </View>
          
          <Text style={styles.todayDate}>
            {new Date().toLocaleDateString()}
          </Text>
        </View>
        
        <View style={[CommonStyles.panel]}>
          <Text style={styles.panelTitle}>Chat coming soon...</Text>
        </View>
      </ScrollView>
      </View>
    </AuthGuard>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  optionsContainer: {
    padding: Spacing.lg,
    gap: Spacing.md,
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
  cancelButton: {
    alignItems: 'center',
    marginTop: Spacing.md,
    padding: Spacing.sm,
  },
  cancelText: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  demoNotice: {
    backgroundColor: Colors.tactical.medium,
    borderColor: Colors.accent,
    borderWidth: 1,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  demoText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  demoCode: {
    fontSize: Typography.sizes.sm,
    color: Colors.accent,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    letterSpacing: 2,
  },
  todayDate: {
    fontSize: Typography.sizes.lg,
    color: Colors.text.primary,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    letterSpacing: 0.5,
  },
  teamMembersContainer: {
    gap: Spacing.md,
  },
  memberCard: {
    backgroundColor: Colors.tactical.medium,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.medium,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  memberInitial: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
  },
  memberName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    flex: 1,
  },
  memberSchedule: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    marginBottom: Spacing.sm,
  },
  hourSlot: {
    width: '11.5%',
    aspectRatio: 1,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    marginHorizontal: 1,
  },
  hourSlotText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
  memberSummary: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
  },
  groupInfoContainer: {
    marginBottom: Spacing.lg,
  },
  groupCodeContainer: {
    backgroundColor: Colors.tactical.medium,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    alignItems: 'center',
  },
  groupCodeLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.xs,
  },
  groupCodeValue: {
    fontSize: Typography.sizes.xl,
    color: Colors.accent,
    fontWeight: Typography.weights.bold,
    letterSpacing: 3,
    textAlign: 'center',
  },
  shareButton: {
    marginBottom: Spacing.md,
  },
  shareButtonGradient: {
    paddingVertical: Spacing.lg,
  },
  shareButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
});

export default GroupScreen;