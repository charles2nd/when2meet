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
    
    // Update local state immediately for instant UI feedback
    const isAvailable = availability.getSlot(date, hour);
    availability.setSlot(date, hour, !isAvailable);
    setAvailability({...availability});
    
    
    // Debounced save to prevent excessive calls
    saveAvailabilityDebounced(availability);
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

  const handleManualSave = async () => {
    if (!availability || !currentGroup) {
      Alert.alert(t.common.error, t.calendar.noGroup);
      return;
    }

    try {
      setIsUpdating(true);
      await saveAvailability(availability);
      await loadGroupAvailabilities();
      Alert.alert(t.common.success, t.calendar.saved);
    } catch (error) {
      console.error('[CALENDAR] Manual save error:', error);
      Alert.alert(t.common.error, 'Failed to save availability');
    } finally {
      setIsUpdating(false);
    }
  };

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
          title="MISSION CALENDAR"
          subtitle="Set your operational availability"
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
            <Text style={styles.panelTitle}>SELECT DATE</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateContainer}>
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
              <Text style={styles.panelTitle}>AVAILABILITY HOURS</Text>
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

        {/* Save Button */}
        <View style={styles.saveContainer}>
          <TouchableOpacity 
            style={[CommonStyles.buttonBase, getWebStyle('touchableOpacity')]}
            onPress={handleManualSave}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={CommonStyles.buttonGradient}
            >
              <Ionicons name="save-outline" size={20} color={Colors.text.primary} />
              <Text style={CommonStyles.buttonText}>{t.calendar.save}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  hourButton: {
    width: '23%',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.tactical.medium,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.medium,
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
  saveContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  noGroupText: {
    fontSize: Typography.sizes.lg,
    textAlign: 'center',
    marginTop: 50,
    color: Colors.text.secondary,
  },
});

export default CalendarScreen;