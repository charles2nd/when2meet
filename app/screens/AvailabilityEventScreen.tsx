import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMockData } from '../contexts/MockDataContext';

const AvailabilityEventScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { eventId } = route.params || {};
  
  const { 
    getAvailabilityEvent, 
    updateAvailabilityResponse, 
    getEventResponses, 
    getOptimalTimeSlots,
    currentUser,
    currentTeam 
  } = useMockData();
  
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'participants' | 'summary' | undefined>();
  const [event, setEvent] = useState(getAvailabilityEvent(eventId));
  const [responses, setResponses] = useState(getEventResponses(eventId));
  const [optimalSlots, setOptimalSlots] = useState(getOptimalTimeSlots(eventId));

  useEffect(() => {
    if (currentUser) {
      const userResponse = responses.find(r => r.userId === currentUser.id);
      if (userResponse) {
        setSelectedSlots(userResponse.selectedSlots);
      }
    }
  }, [responses, currentUser]);

  useEffect(() => {
    setResponses(getEventResponses(eventId));
    setOptimalSlots(getOptimalTimeSlots(eventId));
  }, [eventId, getEventResponses, getOptimalTimeSlots]);

  const toggleTimeSlot = (slotId: string) => {
    const newSelectedSlots = selectedSlots.includes(slotId)
      ? selectedSlots.filter(id => id !== slotId)
      : [...selectedSlots, slotId];
    
    setSelectedSlots(newSelectedSlots);
    
    if (currentUser) {
      updateAvailabilityResponse(eventId, currentUser.id, newSelectedSlots);
      // Update responses and optimal slots
      setResponses(getEventResponses(eventId));
      setOptimalSlots(getOptimalTimeSlots(eventId));
    }
  };

  const handleShare = () => {
    if (event) {
      Alert.alert('Share Event', `Link: ${event.shareLink}`, [
        { text: 'Copy Link', onPress: () => Alert.alert('Copied!', 'Link copied to clipboard') },
        { text: 'OK' }
      ]);
    }
  };

  const getSlotAvailabilityColor = (slotId: string) => {
    const optimal = optimalSlots.find(s => s.slotId === slotId);
    if (!optimal) return '#f3f4f6';
    
    if (optimal.percentage >= 80) return '#10b981'; // Green - High availability
    if (optimal.percentage >= 60) return '#f59e0b'; // Yellow - Medium availability  
    if (optimal.percentage >= 40) return '#ef4444'; // Red - Low availability
    return '#f3f4f6'; // Gray - Very low availability
  };

  const getSlotCount = (slotId: string) => {
    const optimal = optimalSlots.find(s => s.slotId === slotId);
    return optimal ? optimal.availableCount : 0;
  };

  if (!event) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Event not found</Text>
      </View>
    );
  }

  const renderDualView = () => {
    const isWeb = Platform.OS === 'web';
    
    return (
      <View style={isWeb ? styles.dualViewWeb : styles.dualViewMobile}>
        {/* Individual Availability - Left Side */}
        <View style={styles.individualSection}>
          <Text style={styles.sectionTitle}>Your Availability</Text>
          <ScrollView style={styles.timeSlotContainer}>
            {event.timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.timeSlotIndividual,
                  selectedSlots.includes(slot.id) && styles.timeSlotSelected
                ]}
                onPress={() => toggleTimeSlot(slot.id)}
              >
                <Text style={styles.timeSlotLabel}>
                  {slot.date}
                </Text>
                <Text style={[
                  styles.timeSlotTime,
                  selectedSlots.includes(slot.id) && styles.timeSlotTextSelected
                ]}>
                  {slot.startTime} - {slot.endTime}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.selectedCount}>
            {selectedSlots.length}/{event.timeSlots.length} slots selected
          </Text>
        </View>
        
        {/* Group Availability - Right Side */}
        <View style={styles.groupSection}>
          <Text style={styles.sectionTitle}>Team Availability</Text>
          <ScrollView style={styles.timeSlotContainer}>
            {event.timeSlots.map((slot) => {
              const availableCount = getSlotCount(slot.id);
              const totalMembers = currentTeam?.members.length || 1;
              
              return (
                <View
                  key={slot.id}
                  style={[
                    styles.timeSlotGroup,
                    { backgroundColor: getSlotAvailabilityColor(slot.id) }
                  ]}
                >
                  <Text style={styles.timeSlotLabel}>
                    {slot.date}
                  </Text>
                  <Text style={styles.timeSlotTime}>
                    {slot.startTime} - {slot.endTime}
                  </Text>
                  <Text style={styles.availabilityCount}>
                    {availableCount}/{totalMembers} available
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderParticipants = () => (
    <View style={styles.participantsContainer}>
      <Text style={styles.sectionTitle}>Participants ({currentTeam?.members.length || 0})</Text>
      {currentTeam?.members.map((member) => {
        const memberResponse = responses.find(r => r.userId === member.id);
        const availableSlots = memberResponse ? memberResponse.selectedSlots.length : 0;
        const isCurrentUser = member.id === currentUser?.id;
        
        return (
          <View key={member.id} style={styles.participantItem}>
            <View>
              <Text style={styles.participantName}>
                {member.username} {isCurrentUser ? '(You)' : ''}
              </Text>
              <Text style={styles.participantRole}>{member.role}</Text>
            </View>
            <Text style={styles.participantSlots}>
              {isCurrentUser ? selectedSlots.length : availableSlots}/{event.timeSlots.length} available
            </Text>
          </View>
        );
      })}
    </View>
  );

  const renderSummary = () => {
    const topSlots = optimalSlots.slice(0, 10); // Show top 10 optimal slots
    
    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>Optimal Meeting Times</Text>
        {topSlots.length === 0 ? (
          <Text style={styles.emptyText}>No availability data yet</Text>
        ) : (
          topSlots.map((slot) => {
            const timeSlot = event.timeSlots.find(ts => ts.id === slot.slotId);
            if (!timeSlot) return null;
            
            return (
              <View key={slot.slotId} style={styles.summaryItem}>
                <View>
                  <Text style={styles.summaryTime}>
                    {timeSlot.date} • {timeSlot.startTime} - {timeSlot.endTime}
                  </Text>
                  <Text style={styles.summaryPercentage}>
                    {Math.round(slot.percentage)}% available
                  </Text>
                </View>
                <Text style={[
                  styles.summaryCount,
                  { color: getSlotAvailabilityColor(slot.slotId) }
                ]}>
                  {slot.availableCount}/{currentTeam?.members.length || 0}
                </Text>
              </View>
            );
          })
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDates}>{event.startDate} - {event.endDate}</Text>
        </View>

        <TouchableOpacity onPress={handleShare}>
          <Text style={styles.shareButton}>Share</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.viewSelector}>
        <TouchableOpacity
          style={[styles.viewButton, !viewMode && styles.viewButtonActive]}
          onPress={() => setViewMode(undefined)}
        >
          <Text style={[
            styles.viewButtonText,
            !viewMode && styles.viewButtonTextActive
          ]}>
            Real-time View
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.viewButton, viewMode === 'participants' && styles.viewButtonActive]}
          onPress={() => setViewMode('participants')}
        >
          <Text style={[
            styles.viewButtonText,
            viewMode === 'participants' && styles.viewButtonTextActive
          ]}>
            Participants
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.viewButton, viewMode === 'summary' && styles.viewButtonActive]}
          onPress={() => setViewMode('summary')}
        >
          <Text style={[
            styles.viewButtonText,
            viewMode === 'summary' && styles.viewButtonTextActive
          ]}>
            Summary
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {!viewMode && renderDualView()}
        {viewMode === 'participants' && (
          <ScrollView style={styles.scrollContent}>
            {renderParticipants()}
          </ScrollView>
        )}
        {viewMode === 'summary' && (
          <ScrollView style={styles.scrollContent}>
            {renderSummary()}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    fontSize: 16,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  shareButton: {
    fontSize: 16,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  eventDates: {
    fontSize: 14,
    color: '#6b7280',
  },
  viewSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewButtonActive: {
    backgroundColor: '#8b5cf6',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  viewButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  dualViewWeb: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  dualViewMobile: {
    flex: 1,
    padding: 16,
  },
  individualSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  groupSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  timeSlotContainer: {
    maxHeight: 400,
  },
  timeSlotIndividual: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  timeSlotGroup: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  timeSlotLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  timeSlotTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  availabilityCount: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 4,
  },
  participantRole: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  summaryPercentage: {
    fontSize: 12,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  timeSlotSelected: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  timeSlotTextSelected: {
    color: '#FFFFFF',
  },
  selectedCount: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
  participantsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  participantSlots: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  summaryTime: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  summaryCount: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
});

export default AvailabilityEventScreen;