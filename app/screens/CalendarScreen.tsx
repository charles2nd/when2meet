import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import { Availability } from '../models/SimpleAvailability';

const CalendarScreen: React.FC = () => {
  const { user, currentGroup, myAvailability, saveAvailability, t } = useApp();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availability, setAvailability] = useState<Availability | null>(null);

  useEffect(() => {
    // Redirect to group page if user has no group
    if (user && !currentGroup) {
      console.log('[CALENDAR] No group found, redirecting to group page');
      router.replace('/(tabs)/group');
      return;
    }
    
    if (myAvailability) {
      setAvailability(myAvailability);
    } else if (user && currentGroup) {
      setAvailability(new Availability({
        userId: user.id,
        groupId: currentGroup.id
      }));
    }
  }, [myAvailability, user, currentGroup, router]);

  const getDatesForMonth = () => {
    const dates = [];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    for (let day = 1; day <= 31; day++) {
      const date = new Date(year, month, day);
      if (date.getMonth() === month) {
        dates.push(date.toISOString().split('T')[0]);
      }
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
      Alert.alert(t.common.error, t.calendar.noGroup);
      return;
    }

    await saveAvailability(availability);
    Alert.alert(t.common.success, t.calendar.saved);
  };

  // This should not render anymore due to redirect, but keeping as fallback
  if (!currentGroup) {
    return (
      <View style={styles.container}>
        <Text style={styles.noGroupText}>Redirecting to group page...</Text>
      </View>
    );
  }

  const dates = getDatesForMonth();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t.calendar.title}</Text>
      <Text style={styles.subtitle}>{t.calendar.selectDate}</Text>

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
              <Text style={styles.dateText}>
                {new Date(date).getDate()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {selectedDate && availability && (
        <View style={styles.hoursContainer}>
          <Text style={styles.hoursTitle}>{t.calendar.hours}</Text>
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
        <Text style={styles.saveButtonText}>{t.calendar.save}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    paddingBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  noGroupText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
  },
  dateContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  dateButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  selectedDate: {
    backgroundColor: '#007AFF',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  hoursContainer: {
    padding: 20,
  },
  hoursTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  hoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  hourButton: {
    width: '23%',
    padding: 10,
    margin: '1%',
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
  },
  availableHour: {
    backgroundColor: '#4CAF50',
  },
  hourText: {
    fontSize: 14,
  },
  availableHourText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CalendarScreen;