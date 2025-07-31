import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../contexts/AppContext';
import { Availability } from '../models/SimpleAvailability';
import { Colors, Typography, Spacing, BorderRadius, CommonStyles, HeaderStyles } from '../theme';
import { getWebStyle } from '../utils/webStyles';
import { AuthGuard } from '../components/AuthGuard';
import { SafeHeader } from '../components/SafeHeader';

// Simple debounce utility
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const CalendarScreen: React.FC = () => {
  const { user, currentGroup, myAvailability, saveAvailability, loadGroupAvailabilities, t } = useApp();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

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
    if (!availability || !currentGroup || isUpdating) return;
    
    console.log('[CALENDAR] Toggling availability for', date, hour);
    console.log('[CALENDAR] Current availability has', availability.slots.length, 'total slots before toggle');
    
    // Use the clone method to create a proper deep copy that preserves all existing availability
    const updatedAvailability = availability.clone();
    
    // Update local state immediately for instant UI feedback
    const isAvailable = updatedAvailability.getSlot(date, hour);
    updatedAvailability.setSlot(date, hour, !isAvailable);
    
    console.log('[CALENDAR] After toggle, availability has', updatedAvailability.slots.length, 'total slots');
    console.log('[CALENDAR] Slots by date:', updatedAvailability.slots.reduce((acc, slot) => {
      acc[slot.date] = (acc[slot.date] || 0) + (slot.available ? 1 : 0);
      return acc;
    }, {} as Record<string, number>));
    
    setAvailability(updatedAvailability);
    
    // Debounced save to prevent excessive calls
    saveAvailabilityDebounced(updatedAvailability);
  };

  // Debounced save function to prevent multiple rapid saves
  const saveAvailabilityDebounced = useCallback(
    debounce(async (availabilityData: Availability) => {
      if (!availabilityData || !currentGroup) return;
      
      setIsUpdating(true);
      try {
        await saveAvailability(availabilityData);
        await loadGroupAvailabilities();
        console.log('[CALENDAR] Availability auto-saved and refreshed');
      } catch (error) {
        console.error('[CALENDAR] Error saving availability:', error);
      } finally {
        setIsUpdating(false);
      }
    }, 500), // 500ms debounce
    [saveAvailability, loadGroupAvailabilities, currentGroup]
  );


  // This should not render anymore due to redirect, but keeping as fallback
  if (!currentGroup) {
    return (
      <View style={styles.container}>
        <Text style={styles.noGroupText}>{t.calendar.redirecting}</Text>
      </View>
    );
  }

  const dates = getDatesForMonth();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <AuthGuard>
      <View style={[CommonStyles.container]}>
        <SafeHeader
          title={t.calendar.missionCalendarTitle}
          subtitle={t.calendar.setOperationalAvailability}
          colors={[Colors.secondary, Colors.secondaryDark]}
        >
          <View style={styles.logoContainer}>
            <Ionicons name="calendar-outline" size={32} color={Colors.accent} />
          </View>
        </SafeHeader>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Selection Panel */}
        <View style={[CommonStyles.panel]}>
          <View style={styles.panelHeader}>
            <Ionicons name="calendar" size={20} color={Colors.accent} />
            <Text style={styles.panelTitle}>{t.calendar.selectDatePanel}</Text>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dateContainer}
            contentContainerStyle={styles.dateContentContainer}
          >
            {dates.map((date) => (
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
                  {new Date(date).getDate()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Hours Grid Panel */}
        {selectedDate && availability && (
          <View style={[CommonStyles.panel]}>
            <View style={styles.panelHeader}>
              <Ionicons name="time" size={20} color={Colors.accent} />
              <Text style={styles.panelTitle}>{t.calendar.availabilityHoursPanel}</Text>
            </View>
            
            <View style={styles.hoursGrid}>
              {hours.map(hour => {
                const isAvailable = availability.getSlot(selectedDate, hour);
                return (
                  <TouchableOpacity
                    key={hour}
                    style={[
                      styles.hourButton,
                      isAvailable && styles.availableHour,
                      getWebStyle('touchableOpacity')
                    ]}
                    onPress={() => toggleTimeSlot(selectedDate, hour)}
                  >
                    <Text style={[
                      styles.hourText,
                      isAvailable && styles.availableHourText
                    ]}>
                      {hour.toString().padStart(2, '0')}:00
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

      </ScrollView>
      </View>
    </AuthGuard>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  panelTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
    letterSpacing: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  dateContentContainer: {
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  dateButton: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.tactical.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border.medium,
  },
  selectedDate: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  dateText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
  selectedDateText: {
    color: Colors.text.inverse,
  },
  hoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg, // Much larger gap (24px) for better ergonomics
    paddingHorizontal: Spacing.lg, // Increased padding for breathing room
    paddingVertical: Spacing.md, // Add vertical padding
    justifyContent: 'space-around', // Better distribution with more space
  },
  hourButton: {
    width: '20%', // Smaller width for more space between buttons
    paddingVertical: Spacing.xl, // Much larger vertical padding (32px)
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg, // Larger border radius for modern look
    backgroundColor: Colors.tactical.medium,
    alignItems: 'center',
    minHeight: 68, // Increased minimum height for better touch targets
    justifyContent: 'center',
    borderWidth: 2, // Thicker border for better definition
    borderColor: Colors.border.medium,
    marginBottom: Spacing.lg, // Much more bottom margin (24px) between rows
    shadowColor: Colors.shadow.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  availableHour: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  hourText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.text.secondary,
  },
  availableHourText: {
    color: Colors.text.primary,
  },
  noGroupText: {
    fontSize: Typography.sizes.lg,
    textAlign: 'center',
    marginTop: 50,
    color: Colors.text.secondary,
  },
});

export default CalendarScreen;