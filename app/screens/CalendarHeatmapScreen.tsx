import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../contexts/AppContext';
import { Colors } from '../constants/theme';
import { RESPONSIVE } from '../utils/responsive';
import CalendarHeatmap from '../components/CalendarHeatmap';
import { DateTimeUtils } from '../utils/DateTimeUtils';

const CalendarHeatmapScreen: React.FC = () => {
  const { user, currentGroup, groupAvailabilities, loadGroupAvailabilities, t } = useApp();
  const router = useRouter();
  const [heatmapData, setHeatmapData] = useState<any[]>([]);

  // CRITICAL: Focus effect ensures calendar data refreshes when switching groups
  useFocusEffect(
    useCallback(() => {
      console.log('[CALENDAR] 🔄 Calendar screen focused - refreshing data');
      
      // Redirect if no group
      if (user && !currentGroup) {
        console.log('[CALENDAR] No group found, redirecting to group page');
        router.replace('/(tabs)/group');
        return;
      }
      
      // Refresh group availabilities with real-time sync
      if (currentGroup) {
        console.log('[CALENDAR] 🔄 Refreshing availabilities for group:', currentGroup.name);
        loadGroupAvailabilities();
      }
      
      return () => {
        console.log('[CALENDAR] 🛡️ Calendar screen unfocused');
      };
    }, [user, currentGroup, router, loadGroupAvailabilities])
  );

  useEffect(() => {
    // Calculate heatmap data from group availabilities with timezone accuracy
    console.log('[CALENDAR] 📊 Calculating heatmap data from', groupAvailabilities.length, 'availabilities');
    
    if (groupAvailabilities.length > 0) {
      const dateMap = new Map<string, Set<string>>();
      
      // Count unique users available per date with UTC date consistency
      groupAvailabilities.forEach(availability => {
        availability.slots.forEach(slot => {
          if (slot.available && DateTimeUtils.isValidDateString(slot.date)) {
            const dateKey = slot.date; // Already in UTC format
            if (!dateMap.has(dateKey)) {
              dateMap.set(dateKey, new Set());
            }
            dateMap.get(dateKey)?.add(availability.userId);
          }
        });
      });

      console.log('[CALENDAR] 📊 Found availability data for', dateMap.size, 'dates');

      // Convert to heatmap format with proper intensity calculation
      const data = Array.from(dateMap.entries()).map(([date, userSet]) => {
        const count = userSet.size;
        const totalMembers = currentGroup?.members.length || 1;
        const intensity = Math.min(count / totalMembers, 1.0); // Cap at 1.0
        
        return {
          date: date,
          count: count,
          intensity: intensity,
          totalMembers: totalMembers,
          formattedDate: DateTimeUtils.formatDateForDisplay(date)
        };
      });
      
      console.log('[CALENDAR] 📊 Heatmap data calculated:', data.length, 'entries');
      setHeatmapData(data);
    } else {
      console.log('[CALENDAR] ⚠️ No group availabilities found, clearing heatmap');
      setHeatmapData([]);
    }
  }, [groupAvailabilities, currentGroup]);

  const handleDatePress = (dateStr: string) => {
    console.log('[CALENDAR] 📅 Date pressed:', dateStr);
    router.push({
      pathname: '/dateDetail',
      params: { date: dateStr }
    });
  };

  if (!currentGroup) {
    return (
      <View style={styles.container}>
        <Text style={styles.redirectText}>Redirecting to group page...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{currentGroup.name}</Text>
        <Text style={styles.subtitle}>
          {currentGroup.members.length} members • Tap a date to see details
        </Text>
        {groupAvailabilities.length > 0 && (
          <Text style={styles.syncStatus}>
            ✅ Real-time sync active • {groupAvailabilities.length} availabilities loaded
          </Text>
        )}
      </View>

      <View style={styles.calendarContainer}>
        <CalendarHeatmap
          data={heatmapData}
          onDatePress={handleDatePress}
        />
      </View>

      <View style={styles.compactLegend}>
        <Text style={styles.legendTitle}>Availability Intensity</Text>
        <View style={styles.legendRow}>
          <View style={styles.miniLegendItem}>
            <View style={[styles.miniLegendBox, { backgroundColor: 'transparent' }]} />
            <Text style={styles.miniLegendText}>0</Text>
          </View>
          <View style={styles.miniLegendItem}>
            <View style={[styles.miniLegendBox, { backgroundColor: '#C8E6C9' }]} />
            <Text style={styles.miniLegendText}>1</Text>
          </View>
          <View style={styles.miniLegendItem}>
            <View style={[styles.miniLegendBox, { backgroundColor: '#81C784' }]} />
            <Text style={styles.miniLegendText}>2-4</Text>
          </View>
          <View style={styles.miniLegendItem}>
            <View style={[styles.miniLegendBox, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.miniLegendText}>5+</Text>
          </View>
        </View>
        <Text style={styles.legendSubtitle}>
          Number of members available • Updates in real-time
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: RESPONSIVE.safeArea.top,
  },
  calendarContainer: {
    flex: 1,
    paddingHorizontal: RESPONSIVE.spacing.sm,
    paddingVertical: RESPONSIVE.spacing.md,
  },
  header: {
    paddingHorizontal: RESPONSIVE.spacing.md,
    paddingTop: RESPONSIVE.spacing.xl,
    paddingBottom: RESPONSIVE.spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: RESPONSIVE.fontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: RESPONSIVE.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: RESPONSIVE.fontSizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: RESPONSIVE.spacing.xs,
  },
  syncStatus: {
    fontSize: RESPONSIVE.fontSizes.xs,
    color: Colors.success,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  redirectText: {
    color: Colors.text.primary,
    fontSize: RESPONSIVE.fontSizes.lg,
    textAlign: 'center',
    marginTop: RESPONSIVE.spacing.xl,
  },
  compactLegend: {
    paddingHorizontal: RESPONSIVE.spacing.md,
    paddingVertical: RESPONSIVE.spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  legendTitle: {
    fontSize: RESPONSIVE.fontSizes.sm,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: RESPONSIVE.spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: RESPONSIVE.spacing.xs,
  },
  miniLegendItem: {
    alignItems: 'center',
    flex: 1,
  },
  miniLegendBox: {
    width: RESPONSIVE.scale(16),
    height: RESPONSIVE.scale(16),
    borderRadius: 3,
    marginBottom: RESPONSIVE.spacing.xs / 2,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  miniLegendText: {
    fontSize: RESPONSIVE.fontSizes.xs,
    color: Colors.text.primary,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  legendSubtitle: {
    fontSize: RESPONSIVE.fontSizes.xs,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default CalendarHeatmapScreen;