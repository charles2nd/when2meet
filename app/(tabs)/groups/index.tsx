import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { useMockData } from '../../contexts/MockDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import InitialSetup from '../../components/InitialSetup';
import { COLORS, SPACING } from '../../utils/constants';

const GroupsScreen: React.FC = () => {
  const { currentTeam, currentUser, availabilityEvents, createAvailabilityEvent, isLoaded } = useMockData();
  const { t } = useLanguage();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEventForm, setNewEventForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '18:00',
    endTime: '22:00',
    requiresPassword: false,
    password: ''
  });

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'Coach': '#ef4444',
      'IGL': '#8b5cf6', 
      'Player': '#3b82f6',
      'Sub': '#10b981',
    };
    return colors[role] || '#6b7280';
  };

  const handleCreateEvent = () => {
    if (!newEventForm.title.trim()) {
      Alert.alert(t('common.error'), t('groups.createEvent.validation.titleRequired'));
      return;
    }
    
    if (!newEventForm.startDate || !newEventForm.endDate) {
      Alert.alert(t('common.error'), t('groups.createEvent.validation.datesRequired'));
      return;
    }

    const eventId = createAvailabilityEvent({
      title: newEventForm.title,
      description: newEventForm.description,
      teamId: currentTeam?.id || 'team1',
      createdBy: currentUser?.id || 'user1',
      startDate: newEventForm.startDate,
      endDate: newEventForm.endDate,
      startTime: newEventForm.startTime,
      endTime: newEventForm.endTime,
      requiresPassword: newEventForm.requiresPassword,
      password: newEventForm.requiresPassword ? newEventForm.password : undefined,
    });

    Alert.alert(t('common.success'), t('groups.createEvent.success'));
    setShowCreateModal(false);
    setNewEventForm({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      startTime: '18:00',
      endTime: '22:00',
      requiresPassword: false,
      password: ''
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const teamEvents = availabilityEvents.filter(event => event.teamId === currentTeam?.id);

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t('groups.loading')}</Text>
      </View>
    );
  }

  // Show initial setup if no user or team exists
  if (!currentUser || !currentTeam) {
    return <InitialSetup onComplete={() => {}} />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('groups.title')}</Text>
        <Text style={styles.subtitle}>{t('groups.subtitle')}</Text>
        <View style={styles.headerInfo}>
          <Text style={styles.headerInfoText}>{t('groups.headerInfo')}</Text>
        </View>
      </View>
      
      {currentTeam ? (
        <View style={styles.content}>
          {/* Team Info Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>{t('groups.teamInfo')}</Text>
          </View>
          <View style={styles.teamCard}>
            <Text style={styles.teamName}>{currentTeam.name}</Text>
            {currentTeam.description && (
              <Text style={styles.teamDescription}>{currentTeam.description}</Text>
            )}
            
            <Text style={styles.sectionTitle}>{t('groups.team.membersTitle', { count: currentTeam.members.length })}</Text>
            
            {currentTeam.members.map((member) => {
              const isCurrentUser = member.id === currentUser?.id;
              
              return (
                <View key={member.id} style={styles.memberCard}>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>
                      {member.username} {isCurrentUser ? t('groups.team.you') : ''}
                    </Text>
                    <Text style={[
                      styles.memberRole,
                      { color: getRoleColor(member.role) }
                    ]}>
                      {t(`profile.role.${member.role.toLowerCase()}`)}
                    </Text>
                    {member.email && (
                      <Text style={styles.memberEmail}>{member.email}</Text>
                    )}
                  </View>
                  <View style={[
                    styles.roleIndicator,
                    { backgroundColor: getRoleColor(member.role) }
                  ]} />
                </View>
              );
            })}
          </View>

          {/* Quick Event Creation */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>{t('groups.quickActions')}</Text>
          </View>
          <TouchableOpacity style={styles.createEventCard} onPress={() => setShowCreateModal(true)}>
            <View style={styles.createEventIcon}>
              <Text style={styles.createEventIconText}>+</Text>
            </View>
            <View style={styles.createEventContent}>
              <Text style={styles.createEventTitle}>{t('groups.quickAction.title')}</Text>
              <Text style={styles.createEventDescription}>
                {t('groups.quickAction.description')}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Active Events Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>{t('groups.eventsSection')}</Text>
          </View>
          <View style={styles.eventsSection}>
            <Text style={styles.sectionTitle}>{t('groups.activeEvents.title', { count: teamEvents.length })}</Text>
            
            {teamEvents.length === 0 ? (
              <Text style={styles.emptyText}>{t('groups.activeEvents.empty')}</Text>
            ) : (
              teamEvents.map(event => (
                <View key={event.id} style={styles.eventCard}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDate}>
                      {formatDate(event.startDate)} - {formatDate(event.endDate)}
                    </Text>
                    <Text style={styles.eventTime}>
                      {event.startTime} - {event.endTime}
                    </Text>
                  </View>
                  {event.description && (
                    <Text style={styles.eventDescription}>{event.description}</Text>
                  )}
                  <Text style={styles.eventShare}>{t('groups.event.shareLabel')}: {event.shareLink}</Text>
                  {event.requiresPassword && (
                    <Text style={styles.eventPassword}>{t('groups.event.passwordProtected')}</Text>
                  )}
                </View>
              ))
            )}
          </View>
        </View>
      ) : (
        <View style={styles.emptyContent}>
          <Text style={styles.emptyText}>{t('groups.noTeam')}</Text>
        </View>
      )}

      {/* Create Event Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalCancelButton}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('groups.createEvent.modalTitle')}</Text>
            <TouchableOpacity onPress={handleCreateEvent}>
              <Text style={styles.modalSaveButton}>{t('common.create')}</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t('groups.createEvent.form.title')} *</Text>
              <TextInput
                style={styles.formInput}
                value={newEventForm.title}
                onChangeText={(text) => setNewEventForm(prev => ({ ...prev, title: text }))}
                placeholder={t('groups.createEvent.form.titlePlaceholder')}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t('groups.createEvent.form.description')}</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                value={newEventForm.description}
                onChangeText={(text) => setNewEventForm(prev => ({ ...prev, description: text }))}
                placeholder={t('groups.createEvent.form.descriptionPlaceholder')}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t('groups.createEvent.form.dateRange')} *</Text>
              <Text style={styles.formHelper}>{t('groups.createEvent.form.dateRangeHelper')}</Text>
              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <TextInput
                    style={styles.formInput}
                    value={newEventForm.startDate}
                    onChangeText={(text) => setNewEventForm(prev => ({ ...prev, startDate: text }))}
                    placeholder={t('groups.createEvent.form.startDatePlaceholder')}
                  />
                </View>
                <Text style={styles.formSeparator}>à</Text>
                <View style={styles.formGroupHalf}>
                  <TextInput
                    style={styles.formInput}
                    value={newEventForm.endDate}
                    onChangeText={(text) => setNewEventForm(prev => ({ ...prev, endDate: text }))}
                    placeholder={t('groups.createEvent.form.endDatePlaceholder')}
                  />
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t('groups.createEvent.form.timeRange')}</Text>
              <Text style={styles.formHelper}>{t('groups.createEvent.form.timeRangeHelper')}</Text>
              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <TextInput
                    style={styles.formInput}
                    value={newEventForm.startTime}
                    onChangeText={(text) => setNewEventForm(prev => ({ ...prev, startTime: text }))}
                    placeholder="18:00"
                  />
                </View>
                <Text style={styles.formSeparator}>à</Text>
                <View style={styles.formGroupHalf}>
                  <TextInput
                    style={styles.formInput}
                    value={newEventForm.endTime}
                    onChangeText={(text) => setNewEventForm(prev => ({ ...prev, endTime: text }))}
                    placeholder="22:00"
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.passwordToggle}
              onPress={() => setNewEventForm(prev => ({ 
                ...prev, 
                requiresPassword: !prev.requiresPassword,
                password: !prev.requiresPassword ? prev.password : ''
              }))}
            >
              <View style={[
                styles.checkbox,
                newEventForm.requiresPassword && styles.checkboxActive
              ]}>
                {newEventForm.requiresPassword && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.passwordToggleText}>{t('groups.createEvent.form.requirePassword')}</Text>
            </TouchableOpacity>

            {newEventForm.requiresPassword && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{t('groups.createEvent.form.password')}</Text>
                <TextInput
                  style={styles.formInput}
                  value={newEventForm.password}
                  onChangeText={(text) => setNewEventForm(prev => ({ ...prev, password: text }))}
                  placeholder={t('groups.createEvent.form.passwordPlaceholder')}
                  secureTextEntry
                />
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
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
    marginBottom: 8,
  },
  headerInfo: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  headerInfoText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    textAlign: 'center',
  },
  sectionHeader: {
    marginBottom: 8,
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  teamCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  teamName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  teamDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    marginTop: 8,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 12,
    color: '#6b7280',
  },
  roleIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  createEventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  createEventIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  createEventIconText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  createEventContent: {
    flex: 1,
  },
  createEventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  createEventDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 18,
  },
  eventsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  eventCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  eventHeader: {
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  eventDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  eventShare: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  eventPassword: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalCancelButton: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalSaveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formGroupHalf: {
    flex: 1,
  },
  formRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  formSeparator: {
    fontSize: 16,
    color: '#6b7280',
    paddingHorizontal: 8,
  },
  formHelper: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  formTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  passwordToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    borderColor: '#8b5cf6',
    backgroundColor: '#8b5cf6',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  passwordToggleText: {
    fontSize: 16,
    color: '#374151',
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

export default GroupsScreen;