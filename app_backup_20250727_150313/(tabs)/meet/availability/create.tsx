import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Switch
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAvailabilityEvents } from '../../../hooks/useAvailability';
import { useAuth } from '../../../hooks/useAuth';
import { useTeam } from '../../../hooks/useTeam';
import { createAvailabilityEvent } from '../../../utils/availabilityHelpers';
import { COLORS, SPACING } from '../../../utils/constants';
import { formatDate, formatTime } from '../../../utils/helpers';

const CreateAvailabilityEvent: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { teamId } = route.params || {};
  const { user } = useAuth();
  const { team, members } = useTeam({ teamId: teamId || '' });
  const { createEvent, loading } = useAvailabilityEvents(teamId || '');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    startTime: '09:00',
    endTime: '17:00',
    allowAnonymous: false,
    isRecurring: false
  });

  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  const [showTimePicker, setShowTimePicker] = useState<'start' | 'end' | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    members.map(member => member.userId)
  );

  const handleCreate = async () => {
    if (!user || !team) {
      Alert.alert('Error', 'You must be logged in to create an event');
      return;
    }

    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    if (formData.startDate >= formData.endDate) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    try {
      const eventData = createAvailabilityEvent(
        formData.title.trim(),
        teamId || '',
        user.id,
        formData.startDate,
        formData.endDate,
        formData.startTime,
        formData.endTime,
        selectedParticipants,
        {
          description: formData.description.trim() || undefined,
          allowAnonymous: formData.allowAnonymous,
          isRecurring: formData.isRecurring,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      );

      const eventId = await createEvent(eventData);
      
      Alert.alert(
        'Success',
        'Availability event created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('AvailabilityEvent', { eventId })
          }
        ]
      );
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event. Please try again.');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      if (showDatePicker === 'start') {
        setFormData(prev => ({ ...prev, startDate: selectedDate }));
      } else if (showDatePicker === 'end') {
        setFormData(prev => ({ ...prev, endDate: selectedDate }));
      }
    }
    setShowDatePicker(null);
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (selectedTime) {
      const timeString = formatTime(selectedTime);
      if (showTimePicker === 'start') {
        setFormData(prev => ({ ...prev, startTime: timeString }));
      } else if (showTimePicker === 'end') {
        setFormData(prev => ({ ...prev, endTime: timeString }));
      }
    }
    setShowTimePicker(null);
  };

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const renderFormField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    multiline = false
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray[500]}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );

  const renderDateTimeField = (
    label: string,
    value: Date | string,
    onPress: () => void,
    isTime = false
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity style={styles.dateTimeButton} onPress={onPress}>
        <Text style={styles.dateTimeText}>
          {isTime ? value : formatDate(value as Date)}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={COLORS.gray[600]} />
      </TouchableOpacity>
    </View>
  );

  const renderSwitchField = (
    label: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    description: string
  ) => (
    <View style={styles.fieldContainer}>
      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <Text style={styles.switchDescription}>{description}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: COLORS.gray[300], true: COLORS.primary }}
          thumbColor={value ? '#FFFFFF' : COLORS.gray[100]}
        />
      </View>
    </View>
  );

  const renderParticipantSelector = () => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        Participants ({selectedParticipants.length} selected)
      </Text>
      <View style={styles.participantList}>
        {members.map(member => (
          <TouchableOpacity
            key={member.userId}
            style={[
              styles.participantItem,
              selectedParticipants.includes(member.userId) && styles.participantItemSelected
            ]}
            onPress={() => toggleParticipant(member.userId)}
          >
            <Text style={[
              styles.participantName,
              selectedParticipants.includes(member.userId) && styles.participantNameSelected
            ]}>
              {member.username}
            </Text>
            <Text style={[
              styles.participantRole,
              selectedParticipants.includes(member.userId) && styles.participantRoleSelected
            ]}>
              {member.role}
            </Text>
            {selectedParticipants.includes(member.userId) && (
              <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.title}>Create Availability Event</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        {renderFormField(
          'Event Title',
          formData.title,
          (text) => setFormData(prev => ({ ...prev, title: text })),
          'Enter event title'
        )}

        {renderFormField(
          'Description (Optional)',
          formData.description,
          (text) => setFormData(prev => ({ ...prev, description: text })),
          'Add event description...',
          true
        )}

        <View style={styles.dateTimeRow}>
          {renderDateTimeField(
            'Start Date',
            formData.startDate,
            () => setShowDatePicker('start')
          )}
          
          {renderDateTimeField(
            'End Date',
            formData.endDate,
            () => setShowDatePicker('end')
          )}
        </View>

        <View style={styles.dateTimeRow}>
          {renderDateTimeField(
            'Start Time',
            formData.startTime,
            () => setShowTimePicker('start'),
            true
          )}
          
          {renderDateTimeField(
            'End Time',
            formData.endTime,
            () => setShowTimePicker('end'),
            true
          )}
        </View>

        {renderParticipantSelector()}

        {renderSwitchField(
          'Allow Anonymous Responses',
          formData.allowAnonymous,
          (value) => setFormData(prev => ({ ...prev, allowAnonymous: value })),
          'Allow people to respond without signing in'
        )}

        {renderSwitchField(
          'Recurring Event',
          formData.isRecurring,
          (value) => setFormData(prev => ({ ...prev, isRecurring: value })),
          'Repeat this event weekly'
        )}

        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Creating...' : 'Create Event'}
          </Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  form: {
    padding: SPACING.md,
  },
  fieldContainer: {
    marginBottom: SPACING.lg,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  dateTimeText: {
    fontSize: 16,
    color: COLORS.gray[900],
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  switchDescription: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginTop: SPACING.xs,
  },
  participantList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  participantItemSelected: {
    backgroundColor: COLORS.primary + '10',
  },
  participantName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.gray[900],
  },
  participantNameSelected: {
    color: COLORS.primary,
  },
  participantRole: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginRight: SPACING.sm,
  },
  participantRoleSelected: {
    color: COLORS.primary,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  createButtonDisabled: {
    backgroundColor: COLORS.gray[400],
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CreateAvailabilityEvent;