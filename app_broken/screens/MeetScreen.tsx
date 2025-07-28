import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getWebStyle } from '../utils/webStyles';

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

const MeetScreen: React.FC = () => {
  const [events, setEvents] = useState<AvailabilityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const storedEvents = await AsyncStorage.getItem('availabilityEvents');
      if (storedEvents) {
        const parsedEvents: AvailabilityEvent[] = JSON.parse(storedEvents);
        setEvents(parsedEvents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleEventPress = (eventId: string) => {
    router.push(`/meet/availability/${eventId}` as any);
  };

  const handleCreateNew = () => {
    router.push('/meet/availability/create');
  };

  const renderEventItem = ({ item }: { item: AvailabilityEvent }) => (
    <TouchableOpacity
      style={[styles.eventCard, getWebStyle('touchableOpacity')]}
      onPress={() => handleEventPress(item.id)}
    >
      <Text style={styles.eventTitle}>{item.title}</Text>
      {item.description ? (
        <Text style={styles.eventDescription}>{item.description}</Text>
      ) : null}
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>
          {formatDate(item.startDate)} - {formatDate(item.endDate)}
        </Text>
      </View>
      <View style={styles.participantContainer}>
        <Text style={styles.participantText}>
          {item.participants.length} participant(s)
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Events Yet</Text>
      <Text style={styles.emptyDescription}>
        Create your first availability event to get started
      </Text>
      <TouchableOpacity 
        style={[styles.createFirstButton, getWebStyle('touchableOpacity')]} 
        onPress={handleCreateNew}
      >
        <Text style={styles.createFirstButtonText}>Create First Event</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, getWebStyle('container')]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>When2Meet Events</Text>
        <TouchableOpacity 
          style={[styles.createButton, getWebStyle('touchableOpacity')]} 
          onPress={handleCreateNew}
        >
          <Text style={styles.createButtonText}>+ New Event</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          events.length === 0 ? styles.emptyListContainer : styles.listContainer,
          getWebStyle('scrollView')
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  eventDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    lineHeight: 20,
  },
  dateContainer: {
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  participantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantText: {
    fontSize: 12,
    color: '#888888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333333',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666666',
    lineHeight: 24,
  },
  createFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
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
});

export default MeetScreen;