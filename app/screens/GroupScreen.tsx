import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, StatusBar, Share, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, Alert, Animated } from 'react-native';
import { ClipboardUtil } from '../utils/clipboard';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows, CommonStyles, HeaderStyles } from '../theme';
import { getWebStyle } from '../utils/webStyles';
import { AuthGuard } from '../components/AuthGuard';
import { SafeHeader } from '../components/SafeHeader';
import { DemoDataService } from '../services/DemoDataService';
import { FirebaseDebug } from '../services/FirebaseDebug';
import { Group } from '../models/Group';
import { User } from '../models/User';
import { LocalStorage } from '../services/LocalStorage';

const GroupScreen: React.FC = () => {
  const { user, currentGroup, userGroups, groupAvailabilities, createGroup, joinGroup, loadGroupAvailabilities, loadUserGroups, setCurrentGroup, setUser, t } = useApp();
  const router = useRouter();
  const params = useLocalSearchParams<{ inviteCode?: string }>();
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [modalMode, setModalMode] = useState<'list' | 'join' | 'create'>('list');
  const [groupCode, setGroupCode] = useState('');
  const [groupName, setGroupName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (currentGroup) {
      console.log('[GROUP] Loading group availabilities...');
      loadGroupAvailabilities();
    }
    // Load user groups when component mounts
    loadUserGroups();
  }, [currentGroup]);

  // Handle invite code from deep link
  useEffect(() => {
    if (params.inviteCode && !currentGroup) {
      console.log('[GROUP] Received invite code from deep link:', params.inviteCode);
      
      // Auto-fill the join form with the invite code
      setGroupCode(params.inviteCode);
      setModalMode('join');
      setShowGroupModal(true);
      
      // Show a toast notification
      showToastMessage(`📬 ${t.group.inviteCodeReceived || 'Invite code received!'} ${params.inviteCode}`);
    }
  }, [params.inviteCode]);

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    
    // Reset animation
    toastOpacity.setValue(0);
    
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2500),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowToast(false);
    });
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      console.log('[GROUP] ❌ Group name is required:', t.group.squadNameRequired);
      return;
    }

    setIsCreating(true);
    try {
      console.log('[GROUP] Creating group:', groupName.trim());
      await createGroup(groupName.trim());
      console.log('[GROUP] ✅ Group created successfully');
      
      setShowGroupModal(false);
      setModalMode('list');
      setGroupName('');
      
      // Direct navigation without popup
      console.log('[GROUP] Navigating to calendar...');
      router.push('/(tabs)/calendar');
    } catch (error) {
      console.error('[GROUP] ❌ Error creating group:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create group';
      console.error('[GROUP] Error message:', errorMessage);
      
      // Just log the error, no popup
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGroup = async () => {
    const trimmedCode = groupCode.trim();
    if (!trimmedCode) {
      console.log('[GROUP] ❌ Invalid input:', t.group.enterSquadCode);
      showToastMessage(`❌ ${t.group.enterSquadCode || 'Enter squad code to deploy!'}`);
      return;
    }

    setIsJoining(true);
    try {
      console.log('[GROUP] Joining group with code:', trimmedCode);
      const success = await joinGroup(trimmedCode);
      if (success) {
        console.log('[GROUP] ✅ Successfully joined group');
        showToastMessage(`✅ ${t.group.deploymentSuccessful || 'DEPLOYMENT SUCCESSFUL!'}`);
        
        setShowGroupModal(false);
        setModalMode('list');
        setGroupCode('');
        
        // Direct navigation without popup
        console.log('[GROUP] Navigating to calendar...');
        router.push('/(tabs)/calendar');
      } else {
        console.error('[GROUP] ❌ Failed to join group - invalid code');
        showToastMessage(`❌ ${t.group.squadNotFound || 'Squad not found. Check your code.'}`);
      }
    } catch (error) {
      console.error('[GROUP] ❌ Error joining group:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to join group';
      console.error('[GROUP] Error message:', errorMessage);
      showToastMessage(`❌ ${t.group.joinSquadFailed || 'Failed to join squad. Try again.'}`);
    } finally {
      setIsJoining(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      console.log('[GROUP] Attempting to paste from clipboard...');
      
      // Check if clipboard is available
      const isAvailable = await ClipboardUtil.isAvailable();
      console.log('[GROUP] Clipboard available for paste:', isAvailable);
      
      if (!isAvailable) {
        console.log('[GROUP] Clipboard not available, prompting manual paste');
        showToastMessage(`ℹ️ ${t.group.manualPasteHint || 'Please paste the code manually using Ctrl+V (Cmd+V on Mac)'}`);
        return;
      }
      
      const clipboardText = await ClipboardUtil.getStringAsync();
      console.log('[GROUP] Clipboard text length:', clipboardText?.length);
      console.log('[GROUP] Clipboard text preview:', clipboardText?.substring(0, 20) + '...');
      
      if (clipboardText && clipboardText.trim().length > 0) {
        // Clean the text - remove spaces, special characters, keep only alphanumeric
        const cleanCode = clipboardText.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        console.log('[GROUP] Cleaned code:', cleanCode);
        
        if (cleanCode.length > 0) {
          const finalCode = cleanCode.substring(0, 10); // Respect maxLength
          setGroupCode(finalCode);
          showToastMessage(`📋 ${t.group.codePasted || 'Code pasted from clipboard'}: ${finalCode}`);
          console.log('[GROUP] ✅ Code pasted successfully:', finalCode);
        } else {
          showToastMessage(`⚠️ ${t.group.invalidClipboard || 'Clipboard contains no valid code'}`);
          console.log('[GROUP] ⚠️ Invalid clipboard content after cleaning');
        }
      } else {
        showToastMessage(`⚠️ ${t.group.emptyClipboard || 'Clipboard is empty'}`);
        console.log('[GROUP] ⚠️ Empty or null clipboard');
      }
    } catch (error) {
      console.error('[GROUP] Error pasting from clipboard:', error);
      
      // More specific error messages based on platform and error type
      if (Platform.OS === 'web') {
        if (error.name === 'NotAllowedError' || error.message.includes('permission')) {
          showToastMessage(`🔒 Clipboard access denied. ${t.group.manualPasteHint || 'Please paste manually using Ctrl+V'}`);
        } else {
          showToastMessage(`ℹ️ ${t.group.manualPasteHint || 'Please paste the code manually using Ctrl+V'}`);
        }
      } else {
        showToastMessage(`❌ ${t.group.pasteError || 'Could not paste from clipboard'}`);
      }
    }
  };

  const generateInviteLink = () => {
    if (!currentGroup) return '';
    
    // For development, use the app scheme directly
    // This will work with your dev client
    if (__DEV__) {
      return `when2meet://join/${currentGroup.code}`;
    }
    
    // For production, use a web URL that can redirect to the app
    const baseUrl = 'https://when2meet.app'; // Replace with your actual domain
    return `${baseUrl}/join/${currentGroup.code}`;
  };


  const handleQuickShare = async () => {
    if (!currentGroup) return;
    
    try {
      const inviteLink = generateInviteLink();

      const shareOptions = {
        message: inviteLink, // Only the link, nothing else
      };

      const result = await Share.share(shareOptions);
      
      if (result.action === Share.sharedAction) {
        showToastMessage(`⚡ ${t.group.quickShareSuccess || 'Invite link shared!'}`);
      }
    } catch (error) {
      console.error('[SHARE] Quick share error:', error);
      showToastMessage(`❌ ${t.group.shareErrorMessage || 'Failed to share'}`);
    }
  };

  const handleCopyGroupCode = async () => {
    if (!currentGroup) return;

    try {
      console.log('[GROUP] Attempting to copy group code:', currentGroup.code);
      
      // Test clipboard availability first
      const isAvailable = await ClipboardUtil.isAvailable();
      console.log('[GROUP] Clipboard available:', isAvailable);
      
      const success = await ClipboardUtil.setStringAsync(currentGroup.code);
      
      if (success) {
        // Verify the copy worked by reading it back
        setTimeout(async () => {
          try {
            const readBack = await ClipboardUtil.getStringAsync();
            if (readBack === currentGroup.code) {
              showToastMessage(`✅ ${t.group.copiedToClipboard || 'Copied to clipboard'}: ${currentGroup.code}`);
              console.log('[GROUP] ✅ Group code copied and verified:', currentGroup.code);
            } else {
              showToastMessage(`⚠️ ${t.group.manualCopyMessage || 'Please copy this code manually'}: ${currentGroup.code}`);
              console.log('[GROUP] ⚠️ Copy verification failed. Expected:', currentGroup.code, 'Got:', readBack);
            }
          } catch (verifyError) {
            // Still show success if we can't verify
            showToastMessage(`✅ ${t.group.copiedToClipboard || 'Copied to clipboard'}: ${currentGroup.code}`);
            console.log('[GROUP] ✅ Copy successful (verification failed):', verifyError);
          }
        }, 100);
      } else {
        // Clipboard API failed, show manual copy message
        showToastMessage(`📋 ${t.group.manualCopyMessage || 'Please copy this code manually'}: ${currentGroup.code}`);
        console.log('[GROUP] ⚠️ Clipboard API failed, showing manual copy message');
      }
    } catch (error) {
      console.error('[GROUP] ❌ Failed to copy code to clipboard:', error);
      showToastMessage(`📋 ${t.group.manualCopyMessage || 'Please copy this code manually'}: ${currentGroup.code}`);
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
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowGroupModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.8)" translucent />
          
          {/* Background Blur */}
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowGroupModal(false)}
          />
          
          {/* Modern Modal Container */}
          <View style={styles.modalContainer}>
            {/* Elegant Header */}
            <LinearGradient
              colors={['rgba(255, 107, 53, 0.95)', 'rgba(230, 74, 25, 0.95)']}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderContent}>
                <TouchableOpacity 
                  onPress={() => setShowGroupModal(false)}
                  style={styles.modernCloseButton}
                >
                  <Ionicons name="close" size={20} color={Colors.text.primary} />
                </TouchableOpacity>
                
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle}>
                    {modalMode === 'list' ? t.group.myGroupsTitle : 
                     modalMode === 'join' ? t.group.joinGroupTitle : t.group.createGroupTitle}
                  </Text>
                  <View style={styles.titleUnderline} />
                </View>
                
                <View style={styles.headerSpacer} />
              </View>
            </LinearGradient>

          {modalMode === 'list' && (
            <View style={styles.modalContent}>
              <ScrollView>
                {/* Current Groups */}
                {userGroups.length > 0 && (
                  <View style={styles.groupSection}>
                    <Text style={styles.sectionTitle}>{t.group.myGroupsTitle} ({userGroups.length})</Text>
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
                            {group.members?.length || 0} {t.group.members}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Action Buttons - Positioned outside ScrollView for visibility */}
              </ScrollView>
              
              {/* Fixed Action Buttons Container */}
              <View style={styles.fixedActionButtons}>
                <TouchableOpacity
                  style={[CommonStyles.buttonBase, getWebStyle('touchableOpacity'), styles.modalActionButton]}
                  onPress={() => setModalMode('join')}
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
                  style={[CommonStyles.buttonBase, getWebStyle('touchableOpacity'), styles.modalActionButton]}
                  onPress={() => setModalMode('create')}
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
            </View>
          )}

          {modalMode === 'join' && (
            <View style={styles.modalContent}>
              <ScrollView 
                style={styles.formScrollView}
                contentContainerStyle={styles.modernFormContainer}
                showsVerticalScrollIndicator={false}
              >
                {/* Enhanced Form Content */}
                <View style={styles.modernFormSection}>
                  <View style={styles.modernIconContainer}>
                    <LinearGradient
                      colors={[Colors.accent, '#FFA000']}
                      style={styles.iconGradient}
                    >
                      <Ionicons name="shield-checkmark" size={40} color={Colors.text.inverse} />
                    </LinearGradient>
                  </View>
                  
                  <Text style={styles.modernFormTitle}>{t.group.joinGroupFormTitle}</Text>
                  <Text style={styles.modernFormSubtitle}>
                    {t.group.enterGroupCodeInstruction}
                  </Text>
                  
                  <View style={styles.modernInputContainer}>
                    <Text style={styles.modernInputLabel}>{t.group.groupCodeInputLabel}</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={[styles.modernInput, styles.codeInput, getWebStyle('textInput')]}
                        placeholder={t.group.exampleCode}
                        placeholderTextColor={Colors.text.tertiary}
                        value={groupCode}
                        onChangeText={setGroupCode}
                        autoCapitalize="characters"
                        returnKeyType="join"
                        maxLength={10}
                        autoFocus={true}
                      />
                      <View style={styles.inputIcon}>
                        <Ionicons name="key" size={20} color={Colors.accent} />
                      </View>
                    </View>
                    <Text style={styles.modernInputHint}>
                      {t.group.groupCodeHint}
                    </Text>
                  </View>
                </View>
              </ScrollView>
              
              {/* Modern Bottom Buttons */}
              <View style={styles.modernBottomContainer}>
                <TouchableOpacity 
                  style={[styles.modernSecondaryButton, getWebStyle('touchableOpacity')]}
                  onPress={() => setModalMode('list')}
                >
                  <View style={styles.modernSecondaryButtonContent}>
                    <Ionicons name="arrow-back" size={18} color={Colors.text.secondary} />
                    <Text style={styles.modernSecondaryButtonText}>{t.group.goBackButton}</Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.modernPrimaryButton, 
                    getWebStyle('touchableOpacity'),
                    (!groupCode.trim() || isJoining) && styles.modernDisabledButton
                  ]}
                  onPress={handleJoinGroup}
                  disabled={!groupCode.trim() || isJoining}
                >
                  <LinearGradient
                    colors={isJoining ? [Colors.text.tertiary, Colors.text.secondary] : [Colors.secondary, Colors.secondaryDark]}
                    style={styles.modernPrimaryButtonGradient}
                  >
                    {isJoining ? (
                      <ActivityIndicator size="small" color={Colors.text.primary} />
                    ) : (
                      <Ionicons name="rocket" size={18} color={Colors.text.primary} />
                    )}
                    <Text style={styles.modernPrimaryButtonText}>
                      {isJoining ? t.group.connecting : t.group.joinGroupShort}
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
                contentContainerStyle={styles.modernFormContainer}
                showsVerticalScrollIndicator={false}
              >
                {/* Enhanced Form Content */}
                <View style={styles.modernFormSection}>
                  <View style={styles.modernIconContainer}>
                    <LinearGradient
                      colors={[Colors.primary, Colors.primaryDark]}
                      style={styles.iconGradient}
                    >
                      <Ionicons name="flag" size={40} color={Colors.text.primary} />
                    </LinearGradient>
                  </View>
                  
                  <Text style={styles.modernFormTitle}>{t.group.createGroupFormTitle}</Text>
                  <Text style={styles.modernFormSubtitle}>
                    {t.group.chooseGroupNameInstruction}
                  </Text>
                  
                  <View style={styles.modernInputContainer}>
                    <Text style={styles.modernInputLabel}>{t.group.groupNameInputLabel}</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={[styles.modernInput, getWebStyle('textInput')]}
                        placeholder={t.group.squadNamePlaceholder}
                        placeholderTextColor={Colors.text.tertiary}
                        value={groupName}
                        onChangeText={setGroupName}
                        maxLength={30}
                        autoFocus={true}
                      />
                      <View style={styles.inputIcon}>
                        <Ionicons name="people" size={20} color={Colors.accent} />
                      </View>
                    </View>
                    <View style={styles.characterCounter}>
                      <Text style={[styles.modernInputHint, { color: groupName.length > 25 ? Colors.warning : Colors.text.tertiary }]}>
                        {groupName.length}/30 {t.group.characters}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
              
              {/* Modern Bottom Buttons */}
              <View style={styles.modernBottomContainer}>
                <TouchableOpacity 
                  style={[styles.modernSecondaryButton, getWebStyle('touchableOpacity')]}
                  onPress={() => setModalMode('list')}
                >
                  <View style={styles.modernSecondaryButtonContent}>
                    <Ionicons name="arrow-back" size={18} color={Colors.text.secondary} />
                    <Text style={styles.modernSecondaryButtonText}>{t.group.goBackButton}</Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.modernPrimaryButton, 
                    getWebStyle('touchableOpacity'),
                    (!groupName.trim() || isCreating) && styles.modernDisabledButton
                  ]}
                  onPress={handleCreateGroup}
                  disabled={!groupName.trim() || isCreating}
                >
                  <LinearGradient
                    colors={isCreating ? [Colors.text.tertiary, Colors.text.secondary] : [Colors.primary, Colors.primaryDark]}
                    style={styles.modernPrimaryButtonGradient}
                  >
                    {isCreating ? (
                      <ActivityIndicator size="small" color={Colors.text.primary} />
                    ) : (
                      <Ionicons name="add-circle" size={18} color={Colors.text.primary} />
                    )}
                    <Text style={styles.modernPrimaryButtonText}>
                      {isCreating ? t.group.creating : t.group.createGroup}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  // Show "no groups" only if user has no groups at all
  if (!userGroups || userGroups.length === 0) {
    return (
      <AuthGuard>
        <View style={[CommonStyles.container]}>
          <SafeHeader
            title={t.group.noGroups}
            subtitle={t.group.noGroupsDescription}
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
                <Text style={[CommonStyles.buttonText, { color: Colors.text.inverse }]}>{t.group.groupsManagement}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {renderGroupModal()}
        </View>
      </AuthGuard>
    );
  }

  // If user has groups but no current group, show groups list (like profile page)
  if (userGroups.length > 0 && !currentGroup) {
    return (
      <AuthGuard>
        <View style={CommonStyles.container}>
          <SafeHeader
            title={t.group.myGroupsTitle}
            colors={[Colors.primary, Colors.primaryDark]}
            centered={false}
          >
            <TouchableOpacity 
              style={styles.compactHeaderButton}
              onPress={openGroupModal}
            >
              <Ionicons name="add" size={20} color={Colors.text.primary} />
            </TouchableOpacity>
          </SafeHeader>

          {renderGroupModal()}

          <ScrollView style={styles.content} contentContainerStyle={styles.compactContent}>
            {/* Groups List */}
            <View style={[CommonStyles.panel]}>
              <View style={styles.panelHeader}>
                <Ionicons name="people" size={20} color={Colors.accent} />
                <Text style={styles.panelTitle}>{t.group.myGroupsTitle} ({userGroups.length})</Text>
              </View>
              
              {userGroups.map((group) => (
                <View key={group.id} style={styles.groupItem}>
                  <View style={styles.groupHeader}>
                    <View style={styles.groupInfo}>
                      <Text style={styles.groupName}>{group.name}</Text>
                      <Text style={styles.groupCode}>Code: {group.code}</Text>
                      <Text style={styles.groupMembers}>
                        {group.members.length} {group.members.length === 1 ? t.group.member : t.group.members}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.selectGroupButton} 
                    onPress={() => {
                      setCurrentGroup(group);
                      if (user) {
                        const updatedUser = new User({
                          id: user.id,
                          name: user.name,
                          email: user.email,
                          language: user.language,
                          groupId: group.id
                        });
                        setUser(updatedUser);
                        LocalStorage.saveUser(updatedUser);
                      }
                    }}
                  >
                    <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
                    <Text style={styles.selectGroupButtonText}>{t.group.select}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </AuthGuard>
    );
  }

  // If user has a current group, show the group interface
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

  // Compact header with group name only
  const compactTitle = currentGroup ? currentGroup.name : t.group.groupsTitle;
  
  return (
    <AuthGuard>
      <View style={CommonStyles.container}>
        <SafeHeader
          title={compactTitle}
          colors={[Colors.primary, Colors.primaryDark]}
          centered={false}
        >
          <TouchableOpacity 
            style={styles.compactHeaderButton}
            onPress={openGroupModal}
          >
            <Ionicons name="add" size={20} color={Colors.text.primary} />
          </TouchableOpacity>
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

      <ScrollView style={styles.content} contentContainerStyle={styles.compactContent}>
        {/* Group Info and Share Panel */}
        <View style={[CommonStyles.panel]}>
          <View style={styles.panelHeader}>
            <Ionicons name="people" size={20} color={Colors.accent} />
            <Text style={styles.panelTitle}>{t.group.squadInfo}</Text>
          </View>
          
          <View style={styles.groupInfoContainer}>
            <TouchableOpacity 
              style={styles.groupCodeContainer}
              onPress={handleCopyGroupCode}
              activeOpacity={0.7}
            >
              <View style={styles.codeHeader}>
                <Text style={styles.groupCodeLabel}>{t.group.groupCodeLabel || 'Squad Code'}:</Text>
                <Ionicons name="copy-outline" size={20} color={Colors.accent} />
              </View>
              <Text style={styles.groupCodeValue}>{currentGroup.code}</Text>
              <Text style={styles.copyHint}>{t.group.tapToCopy || 'Tap to copy'}</Text>
            </TouchableOpacity>
            
            {/* Quick Share Button - Primary Sharing Method */}
            <TouchableOpacity 
              style={styles.quickShareButton}
              onPress={handleQuickShare}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.quickShareGradient}
              >
                <Ionicons name="link" size={26} color={Colors.text.primary} />
                <Text style={styles.quickShareText}>{t.group.quickShare || 'Share Invite Link'}</Text>
                <Ionicons name="arrow-forward" size={20} color={Colors.text.primary} />
              </LinearGradient>
            </TouchableOpacity>
            
          </View>
          
          <Text style={styles.memberSummary}>
            {t.group.teamMembers}: {currentGroup.members?.length || 0}
          </Text>
        </View>

      </ScrollView>
      </View>
      
      {/* Toast Notification */}
      {showToast && (
        <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]}>
          <View style={styles.toastContent}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </Animated.View>
      )}
    </AuthGuard>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  compactContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
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
    marginBottom: Spacing.sm, // Reduced from lg to sm for compact design
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
    marginBottom: Spacing.sm, // Reduced from lg to sm for compact design
  },
  groupCodeContainer: {
    backgroundColor: Colors.tactical.medium,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    alignItems: 'center',
    // Add touchable button styling
    elevation: 2,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    width: '100%',
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
    marginBottom: Spacing.xs,
  },
  copyHint: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.tertiary,
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
  },
  quickShareButton: {
    marginTop: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  quickShareGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  quickShareText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    letterSpacing: 0.5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  // Modern Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 420,
    minHeight: 500,
    maxHeight: '85%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border.light,
    overflow: 'hidden',
    ...Shadows.lg,
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    elevation: 15,
  },
  modalHeader: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modernCloseButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  titleUnderline: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 1,
  },
  headerSpacer: {
    width: 36,
  },
  modalContent: {
    flex: 1,
  },
  // Modern Form styles
  formScrollView: {
    flex: 1,
  },
  modernFormContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  modernFormSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  modernIconContainer: {
    marginBottom: Spacing.lg,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modernFormTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  modernFormSubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
  },
  modernInputContainer: {
    width: '100%',
    maxWidth: 360,
  },
  modernInputLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.accent,
    marginBottom: Spacing.sm,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  modernInput: {
    backgroundColor: Colors.tactical.medium,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingRight: 50,
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    fontWeight: Typography.weights.medium,
  },
  inputIcon: {
    position: 'absolute',
    right: Spacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  codeInput: {
    textAlign: 'center',
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    letterSpacing: 3,
    textTransform: 'uppercase',
    paddingRight: Spacing.lg,
  },
  modernInputHint: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    lineHeight: 16,
  },
  characterCounter: {
    alignItems: 'flex-end',
  },
  // Modern Bottom buttons
  modernBottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.tactical.medium,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    gap: Spacing.sm,
  },
  modernSecondaryButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.border.light,
    minWidth: 100,
  },
  modernSecondaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  modernSecondaryButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.secondary,
    letterSpacing: 0.3,
  },
  modernPrimaryButton: {
    borderRadius: BorderRadius.md,
    flex: 1,
    maxWidth: 220,
    ...Shadows.md,
  },
  modernPrimaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  modernPrimaryButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    letterSpacing: 0.3,
  },
  modernDisabledButton: {
    opacity: 0.5,
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
  modernActionButtons: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.lg,
  },
  modernActionButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
    marginBottom: Spacing.sm,
  },
  modernActionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  actionButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonContent: {
    flex: 1,
  },
  modernActionButtonTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  modernActionButtonSubtitle: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: Typography.weights.medium,
  },
  // Compact header button
  compactHeaderButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  // Group list styles (for when user has groups but no current group)
  groupItem: {
    backgroundColor: Colors.tactical.medium,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.medium,
  },
  groupHeader: {
    marginBottom: Spacing.sm,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  groupCode: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  groupMembers: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.tertiary,
  },
  selectGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  selectGroupButtonText: {
    color: Colors.text.inverse,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  toastContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  toastText: {
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
  // Action buttons for creating/joining groups
  actionButtons: {
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  // Fixed action buttons for modal visibility
  fixedActionButtons: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.tactical.medium,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    gap: Spacing.md,
  },
  modalActionButton: {
    marginBottom: Spacing.xs,
  },
  // Clipboard paste functionality styles
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pasteButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
});

export default GroupScreen;