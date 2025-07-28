import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import { Availability } from '../models/SimpleAvailability';
import { Colors } from '../constants/theme';

const SetAvailabilityScreen: React.FC = () => {
  const { user, currentGroup, myAvailability, saveAvailability, t } = useApp();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availability, setAvailability] = useState<Availability | null>(null);

  useEffect(() => {
    if (myAvailability) {
      setAvailability(myAvailability);
    } else if (user && currentGroup) {
      setAvailability(new Availability({
        userId: user.id,
        groupId: currentGroup.id
      }));
    }
  }, [myAvailability, user, currentGroup]);

  const getDatesForMonth = () => {
    const dates = [];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // Get next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(year, month, today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const toggleTimeSlot = (date: string, hour: number) => {
    if (!availability) return;
    
    const isAvailable = availability.getSlot(date, hour);
    availability.setSlot(date, hour, !isAvailable);
    setAvailability({...availability});
  };

  const handleSave = async () => {
    if (!availability || !currentGroup) {
      Alert.alert(t.common.error, 'No group selected');
      return;
    }

    await saveAvailability(availability);
    Alert.alert(t.common.success, 'Availability saved!');
    router.back();
  };

  const dates = getDatesForMonth();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Set Your Availability</Text>
      </View>

      <Text style={styles.subtitle}>Select dates and times when you're available</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.dateContainer}>
          {dates.map(date => (
            <TouchableOpacity
              key={date}
              style={[
                styles.dateButton,
                selectedDate === date && styles.selectedDate
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[
                styles.dateText,
                selectedDate === date && styles.selectedDateText
              ]}>
                {new Date(date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {selectedDate && availability && (
        <View style={styles.hoursContainer}>
          <Text style={styles.hoursTitle}>Select available hours:</Text>
          <View style={styles.hoursGrid}>
            {hours.map(hour => {
              const isAvailable = availability.getSlot(selectedDate, hour);
              return (
                <TouchableOpacity
                  key={hour}
                  style={[
                    styles.hourButton,
                    isAvailable && styles.availableHour
                  ]}
                  onPress={() => toggleTimeSlot(selectedDate, hour)}
                >
                  <Text style={[
                    styles.hourText,
                    isAvailable && styles.availableHourText
                  ]}>
                    {hour}:00
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Availability</Text>
      </TouchableOpacity>
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
    padding: 20,
  },
  backButton: {
    marginRight: 16,
  },
  backText: {
    color: Colors.primary,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  dateButton: {
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border.light,
    minWidth: 60,
    alignItems: 'center',
  },
  selectedDate: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dateText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  selectedDateText: {
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  hoursContainer: {
    padding: 20,
  },
  hoursTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 15,
  },
  hoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  hourButton: {
    width: '23%',
    margin: '1%',
    padding: 15,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border.light,
    alignItems: 'center',
  },
  availableHour: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  hourText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  availableHourText: {
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SetAvailabilityScreen;