import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AvailabilityEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  timeSlots: string[];
  participants: string[];
  createdAt: string;
}

const EventDetailScreen: React.FC = () => {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [event, setEvent] = useState<AvailabilityEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const storedEvents = await AsyncStorage.getItem('availabilityEvents');
      if (storedEvents) {
        const events: AvailabilityEvent[] = JSON.parse(storedEvents);
        const foundEvent = events.find(e => e.id === eventId);
        setEvent(foundEvent || null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeSlot: string): string => {
    const date = new Date(timeSlot);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const groupTimeSlotsByDate = (timeSlots: string[]) => {
    const grouped: { [key: string]: string[] } = {};
    
    timeSlots.forEach(slot => {
      const date = slot.split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(slot);
    });

    return grouped;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading event...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Event Not Found</Text>
        <Text style={styles.errorDescription}>
          The event you're looking for doesn't exist or has been deleted.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const groupedTimeSlots = groupTimeSlotsByDate(event.timeSlots);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        {event.description ? (
          <Text style={styles.eventDescription}>{event.description}</Text>
        ) : null}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Event Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Duration:</Text>
          <Text style={styles.infoValue}>
            {formatDate(event.startDate)} - {formatDate(event.endDate)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Participants:</Text>
          <Text style={styles.infoValue}>{event.participants.length}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Time Slots:</Text>
          <Text style={styles.infoValue}>{event.timeSlots.length}</Text>
        </View>
      </View>

      <View style={styles.timeSlotsSection}>
        <Text style={styles.sectionTitle}>Available Time Slots</Text>
        {Object.entries(groupedTimeSlots).map(([date, slots]) => (
          <View key={date} style={styles.dateGroup}>
            <Text style={styles.dateHeader}>{formatDate(date)}</Text>
            <View style={styles.timeSlotGrid}>
              {slots.map((slot, index) => (
                <View key={index} style={styles.timeSlot}>
                  <Text style={styles.timeSlotText}>{formatTime(slot)}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Share Event</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Event</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333333',
  },
  errorDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666666',
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  eventDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  infoSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    width: 100,
    color: '#333333',
  },
  infoValue: {
    fontSize: 16,
    flex: 1,
    color: '#666666',
  },
  timeSlotsSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 8,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#007AFF',
  },
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  timeSlotText: {
    fontSize: 14,
    color: '#333333',
  },
  actionSection: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EventDetailScreen;