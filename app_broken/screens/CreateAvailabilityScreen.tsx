import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
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

const CreateAvailabilityScreen: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const router = useRouter();

  const generateTimeSlots = (start: string, end: string): string[] => {
    const slots: string[] = [];
    const startTime = new Date(start);
    const endTime = new Date(end);
    
    const current = new Date(startTime);
    while (current <= endTime) {
      for (let hour = 9; hour <= 17; hour++) {
        const timeSlot = `${current.toISOString().split('T')[0]}T${hour.toString().padStart(2, '0')}:00:00`;
        slots.push(timeSlot);
      }
      current.setDate(current.getDate() + 1);
    }
    
    return slots;
  };

  const handleCreateEvent = async () => {
    if (!title.trim() || !startDate || !endDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const eventId = Date.now().toString();
    const timeSlots = generateTimeSlots(startDate, endDate);
    
    const newEvent: AvailabilityEvent = {
      id: eventId,
      title: title.trim(),
      description: description.trim(),
      startDate,
      endDate,
      timeSlots,
      participants: [],
      createdAt: new Date().toISOString(),
    };

    try {
      const existingEvents = await AsyncStorage.getItem('availabilityEvents');
      const events: AvailabilityEvent[] = existingEvents ? JSON.parse(existingEvents) : [];
      events.push(newEvent);
      
      await AsyncStorage.setItem('availabilityEvents', JSON.stringify(events));
      
      Alert.alert('Success', 'Event created successfully!', [
        { text: 'OK', onPress: () => router.push('/meet') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create event');
    }
  };

  return (
    <ScrollView style={[styles.container, getWebStyle('container'), getWebStyle('scrollView')]}>
      <Text style={styles.title}>Create Availability Event</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Event Title *</Text>
        <TextInput
          style={[styles.input, getWebStyle('textInput')]}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter event title"
          maxLength={100}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea, getWebStyle('textInput')]}
          value={description}
          onChangeText={setDescription}
          placeholder="Optional description"
          multiline
          numberOfLines={3}
          maxLength={500}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Start Date *</Text>
        <TextInput
          style={[styles.input, getWebStyle('textInput')]}
          value={startDate}
          onChangeText={setStartDate}
          placeholder="YYYY-MM-DD"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>End Date *</Text>
        <TextInput
          style={[styles.input, getWebStyle('textInput')]}
          value={endDate}
          onChangeText={setEndDate}
          placeholder="YYYY-MM-DD"
        />
      </View>

      <TouchableOpacity 
        style={[styles.createButton, getWebStyle('touchableOpacity')]} 
        onPress={handleCreateEvent}
      >
        <Text style={styles.createButtonText}>Create Event</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333333',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CreateAvailabilityScreen;