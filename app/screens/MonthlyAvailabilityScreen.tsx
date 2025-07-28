import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getWebStyle } from '../utils/webStyles';
import { Team, MonthlyAvailability } from '../utils/types';

interface DaySlot {
  date: string;
  dayOfWeek: string;
  dayNumber: number;
  slots: { hour: number; available: boolean }[];
}

const MonthlyAvailabilityScreen: React.FC = () => {
  const { teamId } = useLocalSearchParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const hours = Array.from({ length: 10 }, (_, i) => i + 9); // 9 AM to 6 PM
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    loadData();
  }, [teamId, currentMonth]);

  const loadData = async () => {
    try {
      const [teamsData, userId, availabilityData] = await Promise.all([
        AsyncStorage.getItem('teams'),
        AsyncStorage.getItem('currentUserId'),
        AsyncStorage.getItem('monthlyAvailability')
      ]);

      if (teamsData && userId) {
        const teams: Team[] = JSON.parse(teamsData);
        const foundTeam = teams.find(t => t.id === teamId);
        if (foundTeam) {
          setTeam(foundTeam);
          setCurrentUserId(userId);

          if (availabilityData) {
            const allAvailability: MonthlyAvailability[] = JSON.parse(availabilityData);
            const monthKey = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}`;
            const userAvailability = allAvailability.find(
              a => a.teamId === teamId && a.memberId === userId && a.month === monthKey
            );
            if (userAvailability) {
              setAvailability(userAvailability.availability);
            }
          }
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (): DaySlot[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: DaySlot[] = [];

    for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
      const dateString = date.toISOString().split('T')[0];
      const daySlots: { hour: number; available: boolean }[] = hours.map(hour => ({
        hour,
        available: availability[`${dateString}-${hour}`] || false
      }));

      days.push({
        date: dateString,
        dayOfWeek: weekDays[date.getDay()],
        dayNumber: date.getDate(),
        slots: daySlots
      });
    }

    return days;
  };

  const toggleSlot = (date: string, hour: number) => {
    const key = `${date}-${hour}`;
    setAvailability(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleDay = (date: string) => {
    const newAvailability = { ...availability };
    const allSlotsAvailable = hours.every(hour => availability[`${date}-${hour}`]);
    
    hours.forEach(hour => {
      newAvailability[`${date}-${hour}`] = !allSlotsAvailable;
    });
    
    setAvailability(newAvailability);
  };

  const saveAvailability = async () => {
    try {
      const monthKey = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}`;
      const existingData = await AsyncStorage.getItem('monthlyAvailability');
      const allAvailability: MonthlyAvailability[] = existingData ? JSON.parse(existingData) : [];
      
      const existingIndex = allAvailability.findIndex(
        a => a.teamId === teamId && a.memberId === currentUserId && a.month === monthKey
      );

      const newEntry: MonthlyAvailability = {
        id: existingIndex >= 0 ? allAvailability[existingIndex].id : Date.now().toString(),
        teamId: teamId as string,
        memberId: currentUserId,
        month: monthKey,
        availability,
        createdAt: existingIndex >= 0 ? allAvailability[existingIndex].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        allAvailability[existingIndex] = newEntry;
      } else {
        allAvailability.push(newEntry);
      }

      await AsyncStorage.setItem('monthlyAvailability', JSON.stringify(allAvailability));
      Alert.alert('Success', 'Availability saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save availability');
    }
  };

  const changeMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const renderDaySlot = ({ item: day }: { item: DaySlot }) => {
    const isWeekend = day.dayOfWeek === 'Sat' || day.dayOfWeek === 'Sun';
    const allSlotsAvailable = day.slots.every(slot => slot.available);

    return (
      <View style={[styles.dayContainer, isWeekend && styles.weekendDay]}>
        <TouchableOpacity 
          style={styles.dayHeader}
          onPress={() => toggleDay(day.date)}
        >
          <Text style={styles.dayOfWeek}>{day.dayOfWeek}</Text>
          <Text style={[styles.dayNumber, allSlotsAvailable && styles.allAvailableText]}>
            {day.dayNumber}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.slotsContainer}>
          {day.slots.map(slot => (
            <TouchableOpacity
              key={`${day.date}-${slot.hour}`}
              style={[
                styles.slot,
                slot.available && styles.availableSlot,
                getWebStyle('touchableOpacity')
              ]}
              onPress={() => toggleSlot(day.date, slot.hour)}
            >
              <Text style={[styles.slotText, slot.available && styles.availableSlotText]}>
                {slot.hour}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!team) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Team not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, getWebStyle('container')]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.monthButton, getWebStyle('touchableOpacity')]}
          onPress={() => changeMonth(-1)}
        >
          <Text style={styles.monthButtonText}>{'<'}</Text>
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        
        <TouchableOpacity 
          style={[styles.monthButton, getWebStyle('touchableOpacity')]}
          onPress={() => changeMonth(1)}
        >
          <Text style={styles.monthButtonText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.availableSlot]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.legendBox} />
          <Text style={styles.legendText}>Not Available</Text>
        </View>
      </View>

      <View style={styles.timeLabels}>
        <Text style={styles.timeLabelHeader}>Time</Text>
        {hours.map(hour => (
          <Text key={hour} style={styles.timeLabel}>
            {hour}:00
          </Text>
        ))}
      </View>

      <FlatList
        data={getDaysInMonth()}
        renderItem={renderDaySlot}
        keyExtractor={(item) => item.date}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysContainer}
      />

      <TouchableOpacity 
        style={[styles.saveButton, getWebStyle('touchableOpacity')]} 
        onPress={saveAvailability}
      >
        <Text style={styles.saveButtonText}>Save Availability</Text>
      </TouchableOpacity>
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
  monthButton: {
    padding: 8,
  },
  monthButtonText: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: '600',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  legendBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#666666',
  },
  timeLabels: {
    position: 'absolute',
    left: 0,
    top: 180,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 10,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  timeLabelHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 19,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666666',
    height: 36,
    lineHeight: 36,
  },
  daysContainer: {
    paddingLeft: 70,
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 80,
  },
  dayContainer: {
    marginRight: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 8,
    width: 80,
  },
  weekendDay: {
    backgroundColor: '#f9f9f9',
  },
  dayHeader: {
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dayOfWeek: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 4,
  },
  allAvailableText: {
    color: '#4CAF50',
  },
  slotsContainer: {
    gap: 4,
  },
  slot: {
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  availableSlot: {
    backgroundColor: '#4CAF50',
  },
  slotText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  availableSlotText: {
    color: '#ffffff',
  },
  saveButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
  },
});

export default MonthlyAvailabilityScreen;