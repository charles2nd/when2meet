import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';
import { RESPONSIVE } from '../utils/responsive';

interface HeatmapData {
  date: string;
  count: number;
  intensity: number;
}

interface CalendarHeatmapProps {
  data: HeatmapData[];
  onDatePress: (date: string) => void;
  startDate: Date;
  endDate: Date;
}

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ data, onDatePress }) => {
  const getColorForIntensity = (intensity: number) => {
    if (intensity === 0) return 'transparent'; // Transparent for none
    if (intensity < 0.25) return '#C8E6C9'; // Light green - Few members
    if (intensity < 0.5) return '#81C784'; // Medium light green - Some members
    if (intensity < 0.75) return '#4CAF50'; // Medium green - Most members
    return '#2E7D32'; // Dark green - All members
  };

  const getCurrentMonthDays = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Get first day of month and calculate start of calendar (including previous month days)
    const firstDay = new Date(year, month, 1);
    const startOfWeek = firstDay.getDay(); // 0 = Sunday
    
    // Get last day of month
    const lastDay = new Date(year, month + 1, 0);
    
    // Calculate calendar grid (42 days = 6 weeks)
    const days = [];
    
    // Add previous month days to fill start of calendar
    for (let i = startOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }
    
    // Add current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Add next month days to fill end of calendar
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  };

  const getDataForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return data.find(d => d.date === dateStr);
  };
  
  const getMonthName = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const renderCalendarGrid = () => {
    const days = getCurrentMonthDays();
    const weeks = [];
    
    // Group days into weeks
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    return weeks.map((week, weekIndex) => (
      <View key={weekIndex} style={styles.week}>
        {week.map((dayObj, dayIndex) => {
          const { date, isCurrentMonth } = dayObj;
          const dayData = getDataForDate(date);
          const intensity = dayData?.intensity || 0;
          const count = dayData?.count || 0;
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <TouchableOpacity
              key={dayIndex}
              style={[
                styles.day,
                !isCurrentMonth && styles.dayOtherMonth,
                isToday && styles.dayToday,
                { backgroundColor: isCurrentMonth ? getColorForIntensity(intensity) : Colors.surface }
              ]}
              onPress={() => isCurrentMonth && onDatePress(date.toISOString().split('T')[0])}
              disabled={!isCurrentMonth}
            >
              <Text style={[
                styles.dayText,
                !isCurrentMonth && styles.dayTextOtherMonth,
                isToday && styles.dayTextToday
              ]}>
                {date.getDate()}
              </Text>
              {isCurrentMonth && count > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    ));
  };


  return (
    <View style={styles.container}>
      <Text style={styles.monthTitle}>{getMonthName()}</Text>
      
      <View style={styles.weekDayLabels}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <Text key={index} style={styles.weekDayLabel}>{day}</Text>
        ))}
      </View>
      
      <View style={styles.calendarGrid}>
        {renderCalendarGrid()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: RESPONSIVE.spacing.sm,
    paddingVertical: RESPONSIVE.spacing.sm,
    width: '100%',
  },
  monthTitle: {
    fontSize: RESPONSIVE.fontSizes.xl,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: RESPONSIVE.spacing.md,
  },
  weekDayLabels: {
    flexDirection: 'row',
    marginBottom: RESPONSIVE.spacing.sm,
    paddingHorizontal: RESPONSIVE.spacing.xs,
    justifyContent: 'space-between',
  },
  weekDayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: RESPONSIVE.fontSizes.md,
    color: Colors.text.secondary,
    fontWeight: '700',
  },
  calendarGrid: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: RESPONSIVE.spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginBottom: RESPONSIVE.spacing.sm,
    width: '100%',
  },
  week: {
    flexDirection: 'row',
    marginBottom: 4,
    justifyContent: 'space-between',
  },
  day: {
    flex: 1,
    aspectRatio: 1,
    margin: 2,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
    position: 'relative',
    maxHeight: 40,
    maxWidth: 40,
  },
  dayOtherMonth: {
    opacity: 0.3,
  },
  dayToday: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  dayText: {
    fontSize: RESPONSIVE.fontSizes.sm,
    color: Colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  dayTextOtherMonth: {
    color: Colors.text.tertiary,
  },
  dayTextToday: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  countBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: RESPONSIVE.fontSizes.xs,
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
});

export default CalendarHeatmap;