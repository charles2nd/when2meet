import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Switch,
  Alert,
  Modal,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import { Colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LocalStorage } from '../services/LocalStorage';
import { FirebaseGroupService } from '../services/FirebaseGroupService';

const GroupSettingsScreen: React.FC = () => {
  const { user, currentGroup, setCurrentGroup, t } = useApp();
  const router = useRouter();
  const [groupName, setGroupName] = useState(currentGroup?.name || '');
  const [groupDescription, setGroupDescription] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [showAdminTransfer, setShowAdminTransfer] = useState(false);
  const [members, setMembers] = useState<Array<{id: string, name: string}>>([]);

  const isAdmin = currentGroup?.adminId === user?.id;
  const isOwner = isAdmin; // Admin is the owner

  useEffect(() => {
    // Load member names (in real app, this would fetch from user profiles)
    if (currentGroup) {
      const memberData = currentGroup.members.map(id => ({
        id,
        name: id === user?.id ? user.name : id.slice(-4)
      }));
      setMembers(memberData);
    }
  }, [currentGroup, user]);

  const handleUpdateGroupInfo = async (field: 'name' | 'description', value: string) => {
    if (!currentGroup || !value.trim()) return;
    
    try {
      const updates = { [field]: value.trim() };
      await FirebaseGroupService.updateGroupInfo(currentGroup.id, updates);
      
      // Update local state
      const updatedGroup = { ...currentGroup, [field]: value.trim() };
      setCurrentGroup(updatedGroup);
      await LocalStorage.saveGroup(updatedGroup);
      
      if (field === 'name') setIsEditingName(false);
      if (field === 'description') setIsEditingDescription(false);
      
      Alert.alert('Success', `Group ${field} updated`);
    } catch (error) {
      console.error(`Error updating group ${field}:`, error);
      Alert.alert('Error', `Failed to update group ${field}`);
    }
  };

  const handleTransferAdmin = async (newAdminId: string) => {
    if (!currentGroup) return;
    
    const newAdminName = members.find(m => m.id === newAdminId)?.name || 'Member';
    
    Alert.alert(
      'Transfer Ownership',
      `Are you sure you want to transfer group ownership to ${newAdminName}? You will lose admin privileges.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Transfer',
          style: 'destructive',
          onPress: async () => {
            try {
              await FirebaseGroupService.transferAdmin(currentGroup.id, newAdminId);
              
              // Update local state
              const updatedGroup = { ...currentGroup, adminId: newAdminId };
              setCurrentGroup(updatedGroup);
              await LocalStorage.saveGroup(updatedGroup);
              
              setShowAdminTransfer(false);
              Alert.alert('Success', 'Group ownership transferred');
              router.back();
            } catch (error) {
              console.error('Error transferring admin:', error);
              Alert.alert('Error', 'Failed to transfer ownership');
            }
          }
        }
      ]
    );
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to permanently delete this group? This will remove all data and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            if (!currentGroup) return;
            
            try {
              await FirebaseGroupService.deleteGroup(currentGroup.id);
              await LocalStorage.clearAll();
              
              Alert.alert('Success', 'Group deleted permanently');
              router.replace('/(tabs)/group');
            } catch (error) {
              console.error('Error deleting group:', error);
              Alert.alert('Error', 'Failed to delete group');
            }
          }
        }
      ]
    );
  };

  const renderMemberItem = ({ item }: { item: { id: string, name: string } }) => {
    const isSelf = item.id === user?.id;
    const isCurrentAdmin = item.id === currentGroup?.adminId;
    
    return (
      <TouchableOpacity
        style={styles.memberItem}
        onPress={() => {
          if (!isSelf && !isCurrentAdmin) {
            handleTransferAdmin(item.id);
          }
        }}
        disabled={isSelf || isCurrentAdmin}
      >
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.name}</Text>
          {isCurrentAdmin && <Text style={styles.ownerBadge}>{t.groupSettings.owner}</Text>}
          {isSelf && <Text style={styles.youBadge}>{t.groupSettings.you}</Text>}
        </View>
        {!isSelf && !isCurrentAdmin && (
          <Text style={styles.transferText}>{t.groupSettings.tapToTransferOwnership}</Text>
        )}
      </TouchableOpacity>
    );
  };

  // const handleLeaveGroup = () => {
  //   Alert.alert(
  //     'Leave Group',
  //     `Are you sure you want to leave "${currentGroup?.name}"?`,
  //     [
  //       { text: 'Cancel', style: 'cancel' },
  //       {
  //         text: 'Leave',
  //         style: 'destructive',
  //         onPress: async () => {
  //           await leaveGroup();
  //           router.replace('/(tabs)/group');
  //         }
  //       }
  //     ]
  //   );
  // };

  if (!currentGroup) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{t.groupSettings.title}</Text>
      </View>

      {/* Group Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.groupSettings.groupInformation}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>{t.groupSettings.groupName}:</Text>
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.input}
                value={groupName}
                onChangeText={setGroupName}
                placeholder={t.groupSettings.groupNamePlaceholder}
                placeholderTextColor={Colors.text.tertiary}
              />
              <TouchableOpacity onPress={handleUpdateGroupName} style={styles.saveButton}>
                <Text style={styles.saveText}>{t.groupSettings.save}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setIsEditing(false); setGroupName(currentGroup.name); }}>
                <Text style={styles.cancelText}>{t.groupSettings.cancel}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.nameContainer}>
              <Text style={styles.value}>{currentGroup.name}</Text>
              {isAdmin && (
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Ionicons name="pencil" size={20} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>{t.groupSettings.groupCode}:</Text>
          <Text style={styles.value}>{currentGroup.code}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>{t.groupSettings.members}:</Text>
          <Text style={styles.value}>{currentGroup.members.length}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>{t.groupSettings.created}:</Text>
          <Text style={styles.value}>
            {new Date(currentGroup.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.groupSettings.notifications}</Text>
        <View style={styles.switchRow}>
          <Text style={styles.label}>{t.groupSettings.pushNotifications}</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: Colors.border.light, true: Colors.primary }}
            thumbColor={Colors.text.primary}
          />
        </View>
      </View>

      {/* Owner Actions */}
      {isOwner && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.groupSettings.ownerActions}</Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => setShowAdminTransfer(true)}
          >
            <Ionicons name="person-add" size={20} color={Colors.text.primary} />
            <Text style={styles.actionText}>{t.groupSettings.transferOwnership}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleDeleteGroup}
          >
            <Ionicons name="trash" size={20} color={Colors.text.primary} />
            <Text style={styles.actionText}>{t.groupSettings.deleteGroupForever}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Member Actions - Leave functionality temporarily disabled */}
      {/* {!isOwner && (
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.warningButton]}
            onPress={handleLeaveGroup}
          >
            <Ionicons name="exit" size={20} color={Colors.text.primary} />
            <Text style={styles.actionText}>Leave Group</Text>
          </TouchableOpacity>
        </View>
      )} */}

      {/* Admin Transfer Modal */}
      <Modal
        visible={showAdminTransfer}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t.groupSettings.transferOwnership}</Text>
            <TouchableOpacity onPress={() => setShowAdminTransfer(false)}>
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalDescription}>
            {t.groupSettings.selectMemberToTransfer}
          </Text>
          
          <FlatList
            data={members.filter(m => m.id !== user?.id)}
            renderItem={renderMemberItem}
            keyExtractor={(item) => item.id}
            style={styles.membersList}
          />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  section: {
    backgroundColor: Colors.surface,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  ownerIndicator: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  infoRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveText: {
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  cancelText: {
    color: Colors.text.secondary,
    paddingHorizontal: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  dangerButton: {
    backgroundColor: Colors.error,
  },
  warningButton: {
    backgroundColor: Colors.warning,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  modalDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    textAlign: 'center',
  },
  membersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginRight: 12,
  },
  ownerBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.primary,
    backgroundColor: Colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  youBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.text.secondary,
    backgroundColor: Colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.medium,
  },
  transferText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
});

export default GroupSettingsScreen;