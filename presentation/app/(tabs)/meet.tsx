import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, EVENT_COLORS, EVENT_LABELS } from '../../utils/constants';
import { CalendarEvent } from '../../utils/types';
import { mockEvents } from '../../utils/mockData';
import {
  formatTime,
  formatDate,
  isSameDay,
  getDaysInMonth,
  getWeekDays,
} from '../../utils/helpers';

export default function MeetScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  const daysInMonth = getDaysInMonth(currentMonth);
  const weekDays = getWeekDays();

  // Get events for selected date
  const selectedEvents = mockEvents.filter((event) =>
    isSameDay(new Date(event.startTime), selectedDate)
  );

  // Get upcoming events (next 7 days)
  const upcomingEvents = mockEvents
    .filter((event) => {
      const eventDate = new Date(event.startTime);
      const daysDiff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return daysDiff >= 0 && daysDiff <= 7;
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const navigateMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const renderCalendarDay = (day: Date, index: number) => {
    const isToday = isSameDay(day, today);
    const isSelected = isSameDay(day, selectedDate);
    const hasEvents = mockEvents.some((event) => isSameDay(new Date(event.startTime), day));

    return (
      <TouchableOpacity
        key={index}
        style={[styles.calendarDay, isToday && styles.todayDay, isSelected && styles.selectedDay]}
        onPress={() => setSelectedDate(day)}
      >
        <Text
          style={[
            styles.calendarDayText,
            isToday && styles.todayText,
            isSelected && styles.selectedDayText,
          ]}
        >
          {day.getDate()}
        </Text>
        {hasEvents && <View style={styles.eventDot} />}
      </TouchableOpacity>
    );
  };

  const renderEventCard = ({ item }: { item: CalendarEvent }) => (
    <TouchableOpacity style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <View style={[styles.eventTypeIndicator, { backgroundColor: EVENT_COLORS[item.type] }]} />
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventType}>{EVENT_LABELS[item.type]}</Text>
        </View>
        <Text style={styles.eventTime}>{formatTime(new Date(item.startTime))}</Text>
      </View>
      {item.description && <Text style={styles.eventDescription}>{item.description}</Text>}
      <View style={styles.eventFooter}>
        <View style={styles.participantCount}>
          <Ionicons name="people" size={16} color={COLORS.gray[400]} />
          <Text style={styles.participantText}>{item.participants.length} players</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Calendar Header */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateMonth(-1)}>
            <Ionicons name="chevron-back" size={24} color={COLORS.light} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => navigateMonth(1)}>
            <Ionicons name="chevron-forward" size={24} color={COLORS.light} />
          </TouchableOpacity>
        </View>

        {/* Week Days */}
        <View style={styles.weekDaysContainer}>
          {weekDays.map((day) => (
            <Text key={day} style={styles.weekDayText}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {daysInMonth.map((day, index) => renderCalendarDay(day, index))}
        </View>

        {/* Selected Date Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isSameDay(selectedDate, today)
              ? "Today's Events"
              : `Events for ${formatDate(selectedDate)}`}
          </Text>
          {selectedEvents.length > 0 ? (
            <FlatList
              data={selectedEvents}
              renderItem={renderEventCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.noEventsContainer}>
              <Ionicons name="calendar-outline" size={48} color={COLORS.gray[600]} />
              <Text style={styles.noEventsText}>No events scheduled</Text>
              <TouchableOpacity style={styles.addEventButton}>
                <Text style={styles.addEventText}>Add Event</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <FlatList
            data={upcomingEvents}
            renderItem={renderEventCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.light,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray[400],
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  todayDay: {
    backgroundColor: COLORS.primary + '20',
  },
  selectedDay: {
    backgroundColor: COLORS.primary,
  },
  calendarDayText: {
    fontSize: 16,
    color: COLORS.light,
  },
  todayText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  selectedDayText: {
    color: COLORS.light,
    fontWeight: '600',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.light,
    marginBottom: SPACING.md,
  },
  eventCard: {
    backgroundColor: COLORS.gray[900],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  eventTypeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.light,
    marginBottom: 2,
  },
  eventType: {
    fontSize: 14,
    color: COLORS.gray[400],
  },
  eventTime: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  eventDescription: {
    fontSize: 14,
    color: COLORS.gray[300],
    marginBottom: SPACING.sm,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantText: {
    fontSize: 12,
    color: COLORS.gray[400],
    marginLeft: 4,
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  noEventsText: {
    fontSize: 16,
    color: COLORS.gray[400],
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  addEventButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  addEventText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.light,
  },
});
