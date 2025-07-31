import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import { Colors } from '../constants/theme';
import { RESPONSIVE } from '../utils/responsive';
import CalendarHeatmap from '../components/CalendarHeatmap';

const CalendarHeatmapScreen: React.FC = () => {
  const { user, currentGroup, groupAvailabilities, loadGroupAvailabilities, t } = useApp();
  const router = useRouter();
  const [heatmapData, setHeatmapData] = useState<any[]>([]);

  useEffect(() => {
    // Redirect if no group
    if (user && !currentGroup) {
      console.log('[CALENDAR] No group found, redirecting to group page');
      router.replace('/(tabs)/group');
      return;
    }
    
    loadGroupAvailabilities();
  }, [user, currentGroup, router]);

  useEffect(() => {
    // Calculate heatmap data from group availabilities
    if (groupAvailabilities.length > 0) {
      const dateMap = new Map<string, Set<string>>();
      
      // Count unique users available per date
      groupAvailabilities.forEach(availability => {
        availability.slots.forEach(slot => {
          if (slot.available) {
            const dateKey = slot.date;
            if (!dateMap.has(dateKey)) {
              dateMap.set(dateKey, new Set());
            }
            dateMap.get(dateKey)?.add(availability.userId);
          }
        });
      });

      // Convert to heatmap format
      const data = Array.from(dateMap.entries()).map(([date, userSet]) => {
        const count = userSet.size;
        const totalMembers = currentGroup?.members.length || 1;
        const intensity = count / totalMembers;
        
        return {
          date: date,
          count: count,
          intensity: intensity
        };
      });

      setHeatmapData(data);
    }
  }, [groupAvailabilities, currentGroup]);

  const handleDatePress = (dateStr: string) => {
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
      </View>

      <View style={styles.calendarContainer}>
        <CalendarHeatmap
          data={heatmapData}
          onDatePress={handleDatePress}
        />
      </View>

      <View style={styles.compactLegend}>
        <View style={styles.legendRow}>
          <View style={styles.miniLegendItem}>
            <View style={[styles.miniLegendBox, { backgroundColor: 'transparent' }]} />
            <Text style={styles.miniLegendText}>None</Text>
          </View>
          <View style={styles.miniLegendItem}>
            <View style={[styles.miniLegendBox, { backgroundColor: '#C8E6C9' }]} />
            <Text style={styles.miniLegendText}>Few</Text>
          </View>
          <View style={styles.miniLegendItem}>
            <View style={[styles.miniLegendBox, { backgroundColor: '#81C784' }]} />
            <Text style={styles.miniLegendText}>Some</Text>
          </View>
          <View style={styles.miniLegendItem}>
            <View style={[styles.miniLegendBox, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.miniLegendText}>Most</Text>
          </View>
          <View style={styles.miniLegendItem}>
            <View style={[styles.miniLegendBox, { backgroundColor: '#2E7D32' }]} />
            <Text style={styles.miniLegendText}>All</Text>
          </View>
        </View>
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
  },
  redirectText: {
    color: Colors.text.primary,
    fontSize: RESPONSIVE.fontSizes.lg,
    textAlign: 'center',
    marginTop: RESPONSIVE.spacing.xl,
  },
  compactLegend: {
    paddingHorizontal: RESPONSIVE.spacing.md,
    paddingVertical: RESPONSIVE.spacing.xs,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  miniLegendItem: {
    alignItems: 'center',
    flex: 1,
  },
  miniLegendBox: {
    width: RESPONSIVE.scale(12),
    height: RESPONSIVE.scale(12),
    borderRadius: 2,
    marginBottom: RESPONSIVE.spacing.xs / 2,
    borderWidth: 0.5,
    borderColor: Colors.border.light,
  },
  miniLegendText: {
    fontSize: RESPONSIVE.fontSizes.xs,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});

export default CalendarHeatmapScreen;