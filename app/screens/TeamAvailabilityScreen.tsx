import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getWebStyle } from '../utils/webStyles';
import { Team, MonthlyAvailability, TeamMember } from '../utils/types';

interface MemberAvailability {
  member: TeamMember;
  availability: Record<string, boolean>;
}

const TeamAvailabilityScreen: React.FC = () => {
  const [team, setTeam] = useState<Team | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [membersAvailability, setMembersAvailability] = useState<MemberAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const hours = Array.from({ length: 10 }, (_, i) => i + 9); // 9 AM to 6 PM
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  const loadData = async () => {
    try {
      const [teamsData, currentTeamId, availabilityData] = await Promise.all([
        AsyncStorage.getItem('teams'),
        AsyncStorage.getItem('currentTeamId'),
        AsyncStorage.getItem('monthlyAvailability')
      ]);

      if (teamsData && currentTeamId) {
        const teams: Team[] = JSON.parse(teamsData);
        const foundTeam = teams.find(t => t.id === currentTeamId);
        
        if (foundTeam) {
          setTeam(foundTeam);

          const monthKey = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}`;
          const memberAvailabilities: MemberAvailability[] = [];

          if (availabilityData) {
            const allAvailability: MonthlyAvailability[] = JSON.parse(availabilityData);
            
            foundTeam.members.forEach(member => {
              const memberData = allAvailability.find(
                a => a.teamId === currentTeamId && a.memberId === member.id && a.month === monthKey
              );
              
              memberAvailabilities.push({
                member,
                availability: memberData?.availability || {}
              });
            });
          } else {
            foundTeam.members.forEach(member => {
              memberAvailabilities.push({
                member,
                availability: {}
              });
            });
          }

          setMembersAvailability(memberAvailabilities);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load team availability');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
      days.push({
        date: date.toISOString().split('T')[0],
        dayOfWeek: weekDays[date.getDay()],
        dayNumber: date.getDate()
      });
    }

    return days;
  };

  const getAvailabilityCount = (date: string, hour: number): number => {
    const key = `${date}-${hour}`;
    return membersAvailability.filter(ma => ma.availability[key]).length;
  };

  const getAvailabilityColor = (count: number): string => {
    const total = membersAvailability.length;
    if (total === 0) return '#e0e0e0';
    
    const percentage = count / total;
    if (percentage === 0) return '#e0e0e0';
    if (percentage < 0.33) return '#FFCDD2';
    if (percentage < 0.66) return '#FFF9C4';
    if (percentage < 1) return '#C8E6C9';
    return '#4CAF50';
  };

  const changeMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading team availability...</Text>
      </View>
    );
  }

  if (!team) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No team selected</Text>
      </View>
    );
  }

  const days = getDaysInMonth();

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
        <Text style={styles.legendTitle}>Team: {team.name} ({membersAvailability.length} members)</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#e0e0e0' }]} />
            <Text style={styles.legendText}>0%</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#FFCDD2' }]} />
            <Text style={styles.legendText}>1-33%</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#FFF9C4' }]} />
            <Text style={styles.legendText}>34-66%</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#C8E6C9' }]} />
            <Text style={styles.legendText}>67-99%</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>100%</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.calendarContainer}>
          <View style={styles.timeColumn}>
            <View style={styles.timeHeader} />
            {hours.map(hour => (
              <View key={hour} style={styles.timeCell}>
                <Text style={styles.timeText}>{hour}:00</Text>
              </View>
            ))}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.daysContainer}>
              <View style={styles.daysHeader}>
                {days.map(day => (
                  <View key={day.date} style={styles.dayHeader}>
                    <Text style={styles.dayOfWeek}>{day.dayOfWeek}</Text>
                    <Text style={styles.dayNumber}>{day.dayNumber}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.slotsGrid}>
                {hours.map(hour => (
                  <View key={hour} style={styles.hourRow}>
                    {days.map(day => {
                      const count = getAvailabilityCount(day.date, hour);
                      const color = getAvailabilityColor(count);
                      
                      return (
                        <TouchableOpacity
                          key={`${day.date}-${hour}`}
                          style={[styles.slot, { backgroundColor: color }]}
                          onPress={() => {
                            if (count > 0) {
                              Alert.alert(
                                'Availability',
                                `${count} of ${membersAvailability.length} members available`,
                                [{ text: 'OK' }]
                              );
                            }
                          }}
                        >
                          {count > 0 && (
                            <Text style={styles.slotCount}>{count}</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>

        <View style={styles.membersSection}>
          <Text style={styles.sectionTitle}>Members Availability Status</Text>
          {membersAvailability.map(ma => {
            const totalSlots = days.length * hours.length;
            const availableSlots = Object.values(ma.availability).filter(v => v).length;
            const percentage = totalSlots > 0 ? Math.round((availableSlots / totalSlots) * 100) : 0;
            
            return (
              <View key={ma.member.id} style={styles.memberRow}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{ma.member.name}</Text>
                  <Text style={styles.memberEmail}>{ma.member.email}</Text>
                </View>
                <View style={styles.memberStats}>
                  <Text style={styles.memberPercentage}>{percentage}%</Text>
                  <Text style={styles.memberSlots}>{availableSlots} slots</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666666',
  },
  scrollView: {
    flex: 1,
  },
  calendarContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  timeColumn: {
    width: 60,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  timeHeader: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  timeCell: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timeText: {
    fontSize: 12,
    color: '#666666',
  },
  daysContainer: {
    flex: 1,
  },
  daysHeader: {
    flexDirection: 'row',
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dayHeader: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
  dayOfWeek: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  slotsGrid: {
    flex: 1,
  },
  hourRow: {
    flexDirection: 'row',
    height: 40,
  },
  slot: {
    width: 50,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: '#f0f0f0',
    borderBottomColor: '#f0f0f0',
  },
  slotCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
  },
  membersSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 14,
    color: '#666666',
  },
  memberStats: {
    alignItems: 'flex-end',
  },
  memberPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  memberSlots: {
    fontSize: 12,
    color: '#666666',
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

export default TeamAvailabilityScreen;