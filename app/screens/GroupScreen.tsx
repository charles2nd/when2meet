import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, StatusBar, Share, Alert, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import { Colors, Typography, Spacing, BorderRadius, CommonStyles, HeaderStyles } from '../theme';
import { getWebStyle } from '../utils/webStyles';
import { AuthGuard } from '../components/AuthGuard';
import { SafeHeader } from '../components/SafeHeader';
import { DemoDataService } from '../services/DemoDataService';
import { FirebaseDebug } from '../services/FirebaseDebug';
import { Group } from '../models/Group';

const GroupScreen: React.FC = () => {
  const { user, currentGroup, userGroups, groupAvailabilities, createGroup, joinGroup, loadGroupAvailabilities, loadUserGroups, setCurrentGroup, t } = useApp();
  const router = useRouter();
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [modalMode, setModalMode] = useState<'list' | 'join' | 'create'>('list');
  const [groupCode, setGroupCode] = useState('');
  const [groupName, setGroupName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  useEffect(() => {
    if (currentGroup) {
      console.log('[GROUP] Loading group availabilities...');
      loadGroupAvailabilities();
    }
    // Load user groups when component mounts
    loadUserGroups();
  }, [currentGroup]);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert(
        t.group.missionFailed,
        t.group.squadNameRequired,
        [{ text: t.common.ok || 'OK', style: 'default' }]
      );
      return;
    }

    setIsCreating(true);
    try {
      await createGroup(groupName.trim());
      setShowGroupModal(false);
      setModalMode('list');
      setGroupName('');
      
      Alert.alert(
        t.group.squadDeployed,
        t.group.squadOperational,
        [{ 
          text: t.group.proceedToCalendar, 
          onPress: () => router.push('/(tabs)/calendar')
        }]
      );
    } catch (error) {
      console.error('Error creating group:', error);
      const errorMessage = error instanceof Error ? error.message : t.group.createSquadFailed;
      Alert.alert(
        t.group.missionFailed,
        errorMessage,
        [{ text: t.common.ok || 'OK', style: 'default' }]
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!groupCode.trim()) {
      Alert.alert(
        t.group.invalidInput,
        t.group.enterSquadCode,
        [{ text: t.common.ok || 'OK', style: 'default' }]
      );
      return;
    }

    setIsJoining(true);
    try {
      const success = await joinGroup(groupCode.trim());
      if (success) {
        setShowGroupModal(false);
        setModalMode('list');
        setGroupCode('');
        
        Alert.alert(
          t.group.deploymentSuccessful,
          t.group.welcomeOperator,
          [{ 
            text: t.group.proceedToCalendar, 
            onPress: () => router.push('/(tabs)/calendar')
          }]
        );
      } else {
        Alert.alert(
          t.group.missionFailed,
          t.group.squadNotFound,
          [{ text: t.common.ok || 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error joining group:', error);
      const errorMessage = error instanceof Error ? error.message : t.group.joinSquadFailed;
      Alert.alert(
        t.group.missionFailed,
        errorMessage,
        [{ text: t.common.ok || 'OK', style: 'default' }]
      );
    } finally {
      setIsJoining(false);
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

  const handleSwitchGroup = (group: Group) => {
    setCurrentGroup(group);
    setShowGroupModal(false);
    // Update user's current group
    if (user) {
      user.groupId = group.id;
    }
  };

  const openGroupModal = () => {
    setShowGroupModal(true);
    setModalMode('list');
    
    // Debug: List all groups in Firebase
    FirebaseDebug.listAllGroups();
  };

  const renderGroupModal = () => {
    return (
      <Modal
        visible={showGroupModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowGroupModal(false)}
      >
        <View style={styles.modalContainer}>
          <StatusBar barStyle="light-content" backgroundColor={Colors.tactical.dark} />
          
          {/* Header with gradient */}
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.modalHeader}
          >
            <View style={styles.modalHeaderContent}>
              <TouchableOpacity 
                onPress={() => setShowGroupModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
              
              <Text style={styles.modalTitle}>
                {modalMode === 'list' ? 'MES GROUPES' : 
                 modalMode === 'join' ? 'REJOINDRE GROUPE' : 'CRÉER GROUPE'}
              </Text>
              
              <View style={styles.headerSpacer} />
            </View>
          </LinearGradient>

          {modalMode === 'list' && (
            <View style={styles.modalContent}>
              <ScrollView>
                {/* Current Groups */}
                {userGroups.length > 0 && (
                  <View style={styles.groupSection}>
                    <Text style={styles.sectionTitle}>MES GROUPES ({userGroups.length})</Text>
                    {userGroups.map((group) => (
                      <TouchableOpacity
                        key={group.id}
                        style={[
                          styles.groupItem,
                          currentGroup?.id === group.id && styles.currentGroupItem
                        ]}
                        onPress={() => handleSwitchGroup(group)}
                      >
                        <View style={styles.groupItemContent}>
                          <View style={styles.groupItemLeft}>
                            <Ionicons 
                              name={currentGroup?.id === group.id ? "checkmark-circle" : "people"} 
                              size={20} 
                              color={currentGroup?.id === group.id ? Colors.accent : Colors.secondary} 
                            />
                            <View>
                              <Text style={styles.groupItemName}>{group.name}</Text>
                              <Text style={styles.groupItemCode}>Code: {group.code}</Text>
                            </View>
                          </View>
                          <Text style={styles.groupItemMembers}>
                            {group.members?.length || 0} membres
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[CommonStyles.buttonBase, getWebStyle('touchableOpacity')]}
                    onPress={() => setModalMode('join')}
                  >
                    <LinearGradient
                      colors={[Colors.secondary, Colors.secondaryDark]}
                      style={CommonStyles.buttonGradient}
                    >
                      <Ionicons name="enter-outline" size={20} color={Colors.text.primary} />
                      <Text style={CommonStyles.buttonText}>REJOINDRE UN GROUPE</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[CommonStyles.buttonBase, getWebStyle('touchableOpacity')]}
                    onPress={() => setModalMode('create')}
                  >
                    <LinearGradient
                      colors={[Colors.primary, Colors.primaryDark]}
                      style={CommonStyles.buttonGradient}
                    >
                      <Ionicons name="add-circle-outline" size={20} color={Colors.text.primary} />
                      <Text style={CommonStyles.buttonText}>CRÉER UN GROUPE</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          )}

          {modalMode === 'join' && (
            <View style={styles.modalContent}>
              <ScrollView 
                style={styles.formScrollView}
                contentContainerStyle={styles.formContainer}
                showsVerticalScrollIndicator={false}
              >
                {/* Form Content */}
                <View style={styles.formSection}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="shield-checkmark" size={48} color={Colors.accent} />
                  </View>
                  
                  <Text style={styles.formTitle}>REJOINDRE UN GROUPE</Text>
                  <Text style={styles.formSubtitle}>
                    Entrez le code du groupe fourni par l'administrateur
                  </Text>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>CODE DU GROUPE</Text>
                    <TextInput
                      style={[styles.modalInput, styles.codeInput, getWebStyle('textInput')]}
                      placeholder="Ex: ABC123"
                      placeholderTextColor={Colors.text.tertiary}
                      value={groupCode}
                      onChangeText={setGroupCode}
                      autoCapitalize="characters"
                      returnKeyType="join"
                      maxLength={10}
                      autoFocus={true}
                    />
                    <Text style={styles.inputHint}>
                      Le code est généralement composé de 6 caractères
                    </Text>
                  </View>
                </View>
              </ScrollView>
              
              {/* Bottom Buttons */}
              <View style={styles.bottomButtonContainer}>
                <TouchableOpacity 
                  style={[styles.secondaryButton, getWebStyle('touchableOpacity')]}
                  onPress={() => setModalMode('list')}
                >
                  <Text style={styles.secondaryButtonText}>RETOUR</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.primaryButton, 
                    getWebStyle('touchableOpacity'),
                    (!groupCode.trim() || isJoining) && styles.disabledButton
                  ]}
                  onPress={handleJoinGroup}
                  disabled={!groupCode.trim() || isJoining}
                >
                  <LinearGradient
                    colors={[Colors.secondary, Colors.secondaryDark]}
                    style={styles.primaryButtonGradient}
                  >
                    {isJoining ? (
                      <ActivityIndicator size="small" color={Colors.text.primary} />
                    ) : (
                      <Ionicons name="rocket-outline" size={20} color={Colors.text.primary} />
                    )}
                    <Text style={styles.primaryButtonText}>
                      {isJoining ? 'CONNEXION...' : 'REJOINDRE LE GROUPE'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {modalMode === 'create' && (
            <View style={styles.modalContent}>
              <ScrollView 
                style={styles.formScrollView}
                contentContainerStyle={styles.formContainer}
                showsVerticalScrollIndicator={false}
              >
                {/* Form Content */}
                <View style={styles.formSection}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="flag" size={48} color={Colors.accent} />
                  </View>
                  
                  <Text style={styles.formTitle}>CRÉER UN NOUVEAU GROUPE</Text>
                  <Text style={styles.formSubtitle}>
                    Choisissez un nom pour votre groupe tactique
                  </Text>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>NOM DU GROUPE</Text>
                    <TextInput
                      style={[styles.modalInput, getWebStyle('textInput')]}
                      placeholder="Ex: Équipe Alpha, Squad Delta..."
                      placeholderTextColor={Colors.text.tertiary}
                      value={groupName}
                      onChangeText={setGroupName}
                      maxLength={30}
                      autoFocus={true}
                    />
                    <Text style={styles.inputHint}>
                      {groupName.length}/30 caractères
                    </Text>
                  </View>
                </View>
              </ScrollView>
              
              {/* Bottom Buttons */}
              <View style={styles.bottomButtonContainer}>
                <TouchableOpacity 
                  style={[styles.secondaryButton, getWebStyle('touchableOpacity')]}
                  onPress={() => setModalMode('list')}
                >
                  <Text style={styles.secondaryButtonText}>RETOUR</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.primaryButton, 
                    getWebStyle('touchableOpacity'),
                    (!groupName.trim() || isCreating) && styles.disabledButton
                  ]}
                  onPress={handleCreateGroup}
                  disabled={!groupName.trim() || isCreating}
                >
                  <LinearGradient
                    colors={[Colors.primary, Colors.primaryDark]}
                    style={styles.primaryButtonGradient}
                  >
                    {isCreating ? (
                      <ActivityIndicator size="small" color={Colors.text.primary} />
                    ) : (
                      <Ionicons name="add-circle" size={20} color={Colors.text.primary} />
                    )}
                    <Text style={styles.primaryButtonText}>
                      {isCreating ? 'CRÉATION...' : 'CRÉER LE GROUPE'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    );
  };

  if (!currentGroup) {
    return (
      <AuthGuard>
        <View style={[CommonStyles.container]}>
          <SafeHeader
            title="AUCUN GROUPE"
            subtitle="Créez ou rejoignez un groupe pour commencer"
            colors={[Colors.primary, Colors.primaryDark]}
          >
            <View style={styles.logoContainer}>
              <Ionicons name="people-outline" size={32} color={Colors.accent} />
            </View>
          </SafeHeader>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={[CommonStyles.buttonBase, getWebStyle('touchableOpacity')]}
              onPress={openGroupModal}
            >
              <LinearGradient
                colors={[Colors.accent, '#FF8F00']}
                style={CommonStyles.buttonGradient}
              >
                <Ionicons name="add-circle" size={24} color={Colors.text.inverse} />
                <Text style={[CommonStyles.buttonText, { color: Colors.text.inverse }]}>GÉRER MES GROUPES</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {renderGroupModal()}
        </View>
      </AuthGuard>
    );
  }

  // If user has a group, show the group interface
  console.log('[GROUP_SCREEN] Rendering with group:', currentGroup ? {
    id: currentGroup.id,
    name: currentGroup.name,
    code: currentGroup.code,
    isDemo: DemoDataService.isDemoGroup(currentGroup.code)
  } : 'NULL');
  
  console.log('[GROUP_SCREEN] Translation keys:', {
    demoGroup: t.group.demoGroup,
    observerMode: t.group.observerMode,
    squadOperationalStatus: t.group.squadOperationalStatus
  });

  // Temporary debug: Simple title first
  const debugTitle = currentGroup ? currentGroup.name : 'No Group';
  const debugSubtitle = 'Group page loaded';
  
  return (
    <AuthGuard>
      <View style={CommonStyles.container}>
        <SafeHeader
          title={debugTitle}
          subtitle={debugSubtitle}
          colors={[Colors.secondary, Colors.secondaryDark]}
          centered={false}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={openGroupModal}
            >
              <Ionicons name="apps" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
        </SafeHeader>

        {renderGroupModal()}

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
        {/* Simple test content */}
        <View style={[CommonStyles.panel]}>
          <Text style={[styles.panelTitle, { color: Colors.text.primary }]}>
            DEBUG: Group loaded successfully!
          </Text>
          <Text style={{ color: Colors.text.secondary, padding: 16 }}>
            Group Name: {currentGroup?.name || 'Unknown'}
          </Text>
          <Text style={{ color: Colors.text.secondary, padding: 16 }}>
            Group Code: {currentGroup?.code || 'Unknown'}
          </Text>
        </View>

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
  disabledButton: {
    opacity: 0.6,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  modalHeader: {
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    letterSpacing: 1,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
  },
  // Form styles
  formScrollView: {
    flex: 1,
  },
  formContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  formSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  formTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  formSubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
    paddingHorizontal: Spacing.xl,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 400,
  },
  inputLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.accent,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: Colors.tactical.medium,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    fontSize: Typography.sizes.lg,
    color: Colors.text.primary,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    marginBottom: Spacing.sm,
  },
  codeInput: {
    textAlign: 'center',
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  inputHint: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  // Bottom buttons
  bottomButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.lg,
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.border.medium,
    gap: Spacing.md,
  },
  secondaryButton: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.tactical.medium,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    minWidth: 120,
  },
  secondaryButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text.secondary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  primaryButton: {
    borderRadius: BorderRadius.lg,
    minWidth: 200,
    maxWidth: 280,
    flex: 1,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  primaryButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    letterSpacing: 0.5,
  },
  groupSection: {
    marginBottom: Spacing.xl,
    marginHorizontal: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.accent,
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  groupItem: {
    backgroundColor: Colors.tactical.medium,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.medium,
  },
  currentGroupItem: {
    borderColor: Colors.accent,
    backgroundColor: Colors.tactical.light,
  },
  groupItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  groupItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupItemName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  groupItemCode: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
    letterSpacing: 1,
  },
  groupItemMembers: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.weights.medium,
  },
  actionButtons: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Header with button styles
  headerWithButton: {
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  headerButton: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{ translateY: -12 }],
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default GroupScreen;