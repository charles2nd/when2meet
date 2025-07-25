import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useMockData } from '../contexts/MockDataContext';

const GroupsScreen: React.FC = () => {
  const { currentTeam, teams, currentUser } = useMockData();
  
  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'Coach': '#ef4444',
      'IGL': '#8b5cf6', 
      'Player': '#3b82f6',
      'Sub': '#10b981',
    };
    return colors[role] || '#6b7280';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Teams</Text>
        <Text style={styles.subtitle}>Your gaming teams and members</Text>
      </View>
      
      {currentTeam ? (
        <View style={styles.content}>
          <View style={styles.teamCard}>
            <Text style={styles.teamName}>{currentTeam.name}</Text>
            {currentTeam.description && (
              <Text style={styles.teamDescription}>{currentTeam.description}</Text>
            )}
            
            <Text style={styles.sectionTitle}>Team Members ({currentTeam.members.length})</Text>
            
            {currentTeam.members.map((member) => {
              const isCurrentUser = member.id === currentUser?.id;
              
              return (
                <View key={member.id} style={styles.memberCard}>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>
                      {member.username} {isCurrentUser ? '(You)' : ''}
                    </Text>
                    <Text style={[
                      styles.memberRole,
                      { color: getRoleColor(member.role) }
                    ]}>
                      {member.role}
                    </Text>
                    {member.email && (
                      <Text style={styles.memberEmail}>{member.email}</Text>
                    )}
                  </View>
                  <View style={[
                    styles.roleIndicator,
                    { backgroundColor: getRoleColor(member.role) }
                  ]} />
                </View>
              );
            })}
          </View>
          
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Team Statistics</Text>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{currentTeam.members.filter(m => m.role === 'Player').length}</Text>
              <Text style={styles.statLabel}>Active Players</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{currentTeam.members.filter(m => m.role === 'Coach').length}</Text>
              <Text style={styles.statLabel}>Coaches</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{currentTeam.members.filter(m => m.role === 'IGL').length}</Text>
              <Text style={styles.statLabel}>In-Game Leaders</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContent}>
          <Text style={styles.emptyText}>No team found</Text>
        </View>
      )}
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
  teamCard: {
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
  teamName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  teamDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    marginTop: 8,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 12,
    color: '#6b7280',
  },
  roleIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCard: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8b5cf6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default GroupsScreen;