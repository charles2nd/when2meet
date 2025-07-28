import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Alert } from 'react-native';
import { Calendar, CalendarList } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { FirebaseStorageService } from '../services/FirebaseStorageService';
import { MonthlyAvailability } from '../models/Availability';
import { logger } from '../utils/logger';
import { getWebStyle } from '../utils/webStyles';

interface TimeSlot {
  hour: number;
  label: string;
  selected: boolean;
}

interface DayAvailability {
  date: string;
  slots: TimeSlot[];
}

const MonthlyCalendarScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0].substring(0, 7));
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [dayAvailability, setDayAvailability] = useState<DayAvailability | null>(null);
  const [loading, setLoading] = useState(false);
  const [teamName, setTeamName] = useState('My Team');
  
  const { user } = useAuth();
  const { t } = useLanguage();

  const timeSlots: TimeSlot[] = [
    { hour: 9, label: '9:00 AM', selected: false },
    { hour: 10, label: '10:00 AM', selected: false },
    { hour: 11, label: '11:00 AM', selected: false },
    { hour: 12, label: '12:00 PM', selected: false },
    { hour: 13, label: '1:00 PM', selected: false },
    { hour: 14, label: '2:00 PM', selected: false },
    { hour: 15, label: '3:00 PM', selected: false },
    { hour: 16, label: '4:00 PM', selected: false },
    { hour: 17, label: '5:00 PM', selected: false },
  ];

  useEffect(() => {
    loadAvailabilityData();
    loadTeamName();
  }, [currentMonth]);

  useEffect(() => {
    updateDayAvailability();
  }, [selectedDate, availability]);

  const loadTeamName = async () => {
    try {
      const teamResult = await FirebaseStorageService.getCurrentTeam();
      if (teamResult.success && teamResult.data) {
        setTeamName(teamResult.data.name);
      }
    } catch (error) {
      logger.storage.error('loadTeamName', error);
    }
  };

  const loadAvailabilityData = async () => {
    try {
      setLoading(true);
      const teamIdResult = await FirebaseStorageService.getCurrentTeamId();
      const userIdResult = await FirebaseStorageService.getCurrentUserId();
      
      if (teamIdResult.success && teamIdResult.data && userIdResult.success && userIdResult.data) {
        const userAvailabilityResult = await FirebaseStorageService.getUserAvailability(
          teamIdResult.data, 
          userIdResult.data, 
          currentMonth
        );
        
        if (userAvailabilityResult.success && userAvailabilityResult.data) {
          setAvailability(userAvailabilityResult.data.availability);
          logger.storage.load('availability', true);
        } else {
          setAvailability({});
          logger.storage.load('availability', false);
        }
      }
    } catch (error) {
      logger.storage.error('loadAvailability', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDayAvailability = () => {
    const slots = timeSlots.map(slot => ({
      ...slot,
      selected: availability[`${selectedDate}-${slot.hour}`] || false
    }));

    setDayAvailability({
      date: selectedDate,
      slots
    });
  };

  const toggleTimeSlot = (hour: number) => {
    const key = `${selectedDate}-${hour}`;
    const newAvailability = {
      ...availability,
      [key]: !availability[key]
    };
    setAvailability(newAvailability);
    logger.debug('CALENDAR', `Toggled slot: ${key} = ${!availability[key]}`);
  };

  const toggleAllDay = () => {
    const newAvailability = { ...availability };
    const allSelected = timeSlots.every(slot => availability[`${selectedDate}-${slot.hour}`]);
    
    timeSlots.forEach(slot => {
      newAvailability[`${selectedDate}-${slot.hour}`] = !allSelected;
    });
    
    setAvailability(newAvailability);
    logger.debug('CALENDAR', `Toggled all day for ${selectedDate}: ${!allSelected}`);
  };

  const saveAvailability = async () => {
    try {
      setLoading(true);
      const teamIdResult = await FirebaseStorageService.getCurrentTeamId();
      const userIdResult = await FirebaseStorageService.getCurrentUserId();
      
      if (teamIdResult.success && teamIdResult.data && userIdResult.success && userIdResult.data && user) {
        const availabilityData = new MonthlyAvailability({
          id: `${teamIdResult.data}-${userIdResult.data}-${currentMonth}`,
          teamId: teamIdResult.data,
          memberId: userIdResult.data,
          month: currentMonth,
          availability,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        const saveResult = await FirebaseStorageService.addOrUpdateAvailability(availabilityData);
        if (saveResult.success) {
          Alert.alert(t.common.success, 'Availability saved successfully!');
          logger.info('CALENDAR', 'Availability saved successfully');
        } else {
          Alert.alert(t.common.error, saveResult.error || 'Failed to save availability');
        }
      }
    } catch (error) {
      logger.error('CALENDAR', 'Save availability failed', error);
      Alert.alert(t.common.error, 'Failed to save availability');
    } finally {
      setLoading(false);
    }
  };

  const getMarkedDates = () => {
    const marked: any = {};
    
    // Mark selected date
    marked[selectedDate] = {
      selected: true,
      selectedColor: Colors.primary,
    };

    // Mark dates with availability
    Object.keys(availability).forEach(key => {
      if (availability[key]) {
        const date = key.split('-').slice(0, 3).join('-');
        if (!marked[date]) {
          marked[date] = {};
        }
        marked[date].marked = true;
        marked[date].dotColor = Colors.secondary;
      }
    });

    return marked;
  };

  const formatSelectedDate = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.teamName}>{teamName}</Text>
            <Text style={styles.monthLabel}>
              {new Date(currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} OPERATIONS
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.saveButton, getWebStyle('touchableOpacity')]}
            onPress={saveAvailability}
            disabled={loading}
          >
            <Ionicons name="checkmark-circle" size={20} color={Colors.text.inverse} />
            <Text style={styles.saveButtonText}>DEPLOY</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              logger.debug('CALENDAR', `Selected date: ${day.dateString}`);
            }}
            onMonthChange={(month) => {
              const monthStr = `${month.year}-${month.month.toString().padStart(2, '0')}`;
              setCurrentMonth(monthStr);
              logger.debug('CALENDAR', `Changed month: ${monthStr}`);
            }}
            markedDates={getMarkedDates()}
            theme={{
              backgroundColor: Colors.surface,
              calendarBackground: Colors.surface,
              textSectionTitleColor: Colors.text.secondary,
              selectedDayBackgroundColor: Colors.primary,
              selectedDayTextColor: Colors.text.inverse,
              todayTextColor: Colors.primary,
              dayTextColor: Colors.text.primary,
              textDisabledColor: Colors.text.tertiary,
              dotColor: Colors.secondary,
              selectedDotColor: Colors.text.inverse,
              arrowColor: Colors.primary,
              disabledArrowColor: Colors.text.tertiary,
              monthTextColor: Colors.text.primary,
              indicatorColor: Colors.primary,
              textDayFontFamily: 'System',
              textMonthFontFamily: 'System',
              textDayHeaderFontFamily: 'System',
              textDayFontWeight: '400',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '600',
              textDayFontSize: Typography.sizes.md,
              textMonthFontSize: Typography.sizes.lg,
              textDayHeaderFontSize: Typography.sizes.sm,
            }}
          />
        </View>

        {dayAvailability && (
          <View style={styles.timeSlotsContainer}>
            <View style={styles.timeSlotsHeader}>
              <Text style={styles.selectedDateText}>
                {formatSelectedDate(selectedDate)}
              </Text>
              <TouchableOpacity
                style={[styles.toggleAllButton, getWebStyle('touchableOpacity')]}
                onPress={toggleAllDay}
              >
                <Text style={styles.toggleAllText}>ALL DAY</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.slotsGrid}>
              {dayAvailability.slots.map((slot) => (
                <TouchableOpacity
                  key={slot.hour}
                  style={[
                    styles.timeSlot,
                    slot.selected && styles.selectedSlot,
                    getWebStyle('touchableOpacity')
                  ]}
                  onPress={() => toggleTimeSlot(slot.hour)}
                >
                  <Text style={[
                    styles.slotText,
                    slot.selected && styles.selectedSlotText
                  ]}>
                    {slot.label}
                  </Text>
                  {slot.selected && (
                    <Ionicons name="checkmark" size={16} color={Colors.text.inverse} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>OPERATION STATUS</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.secondary }]} />
              <Text style={styles.legendText}>Available for mission</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.legendText}>Currently selected</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamName: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
    marginBottom: Spacing.xs,
  },
  monthLabel: {
    fontSize: Typography.sizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  saveButtonText: {
    color: Colors.text.inverse,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    marginLeft: Spacing.xs,
  },
  content: {
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  timeSlotsContainer: {
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    marginTop: 0,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.md,
  },
  timeSlotsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  selectedDateText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    flex: 1,
    marginRight: Spacing.md,
  },
  toggleAllButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  toggleAllText: {
    color: Colors.text.inverse,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minWidth: 100,
    gap: Spacing.xs,
  },
  selectedSlot: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  slotText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text.primary,
  },
  selectedSlotText: {
    color: Colors.text.inverse,
  },
  legendContainer: {
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    marginTop: 0,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  legendTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  legendItems: {
    gap: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  legendText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  },
});

export default MonthlyCalendarScreen;