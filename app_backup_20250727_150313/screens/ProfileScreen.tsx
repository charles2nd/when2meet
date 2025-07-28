import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useMockData } from '../contexts/MockDataContext';

const ProfileScreen: React.FC = () => {
  const { currentUser, currentTeam, availabilityResponses, availabilityEvents } = useMockData();
  
  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'Coach': '#ef4444',
      'IGL': '#8b5cf6', 
      'Player': '#3b82f6',
      'Sub': '#10b981',
    };
    return colors[role] || '#6b7280';
  };

  const userResponses = currentUser 
    ? availabilityResponses.filter(r => r.userId === currentUser.id)
    : [];
  
  const totalAvailabilityEvents = availabilityEvents.length;
  const userParticipatedEvents = userResponses.length;
  const totalSlotsSelected = userResponses.reduce((total, response) => 
    total + response.selectedSlots.length, 0
  );

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContent}>
          <Text style={styles.emptyText}>No user profile found</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Your gaming profile and stats</Text>
      </View>
      
      <View style={styles.content}>
        {/* User Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <View style={[styles.avatar, { backgroundColor: getRoleColor(currentUser.role) }]}>
              <Text style={styles.avatarText}>
                {currentUser.username.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.username}>{currentUser.username}</Text>
            <Text style={[
              styles.userRole,
              { color: getRoleColor(currentUser.role) }
            ]}>
              {currentUser.role}
            </Text>
            {currentUser.email && (
              <Text style={styles.userEmail}>{currentUser.email}</Text>
            )}
            {currentTeam && (
              <Text style={styles.teamName}>Team: {currentTeam.name}</Text>
            )}
          </View>
        </View>

        {/* Statistics Card */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Activity Statistics</Text>
          
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userParticipatedEvents}</Text>
              <Text style={styles.statLabel}>Events Joined</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalAvailabilityEvents}</Text>
              <Text style={styles.statLabel}>Total Events</Text>
            </View>
          </View>
          
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalSlotsSelected}</Text>
              <Text style={styles.statLabel}>Time Slots Selected</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {userParticipatedEvents > 0 
                  ? Math.round((userParticipatedEvents / totalAvailabilityEvents) * 100)
                  : 0}%
              </Text>
              <Text style={styles.statLabel}>Participation Rate</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityCard}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {userResponses.length === 0 ? (
            <Text style={styles.emptyActivityText}>No recent activity</Text>
          ) : (
            userResponses.slice(0, 5).map((response) => {
              const event = availabilityEvents.find(e => e.id === response.eventId);
              if (!event) return null;
              
              return (
                <View key={response.eventId} style={styles.activityItem}>
                  <View>
                    <Text style={styles.activityEventTitle}>{event.title}</Text>
                    <Text style={styles.activityDate}>
                      Updated: {response.lastUpdated.toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.activitySlots}>
                    {response.selectedSlots.length} slots
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    padding: 16,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userInfo: {
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  userRole: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  teamName: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#8b5cf6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyActivityText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 10,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityEventTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  activitySlots: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
});

export default ProfileScreen;