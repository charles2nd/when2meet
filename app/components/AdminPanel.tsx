import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getWebStyle } from '../utils/webStyles';
import { Team } from '../utils/types';

const AdminPanel: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      loadAllTeams();
    }
  }, [isAdmin]);

  const loadAllTeams = async () => {
    try {
      const teamsData = await AsyncStorage.getItem('teams');
      if (teamsData) {
        setTeams(JSON.parse(teamsData));
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async (teamId: string) => {
    Alert.alert(
      'Delete Team',
      'Are you sure you want to delete this team? This action cannot be undone.',
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedTeams = teams.filter(team => team.id !== teamId);
              setTeams(updatedTeams);
              await AsyncStorage.setItem('teams', JSON.stringify(updatedTeams));
              Alert.alert(t.common.success, 'Team deleted successfully');
            } catch (error) {
              Alert.alert(t.common.error, 'Failed to delete team');
            }
          }
        }
      ]
    );
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all teams and availability data. This action cannot be undone.',
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['teams', 'monthlyAvailability', 'currentTeamId', 'currentUserId']);
              setTeams([]);
              Alert.alert(t.common.success, 'All data cleared successfully');
            } catch (error) {
              Alert.alert(t.common.error, 'Failed to clear data');
            }
          }
        }
      ]
    );
  };

  if (!isAdmin) {
    return null;
  }

  const renderTeamItem = ({ item }: { item: Team }) => (
    <View style={styles.teamItem}>
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{item.name}</Text>
        <Text style={styles.teamDetails}>
          {item.members.length} members • Created {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Text style={styles.teamId}>ID: {item.id}</Text>
      </View>
      <TouchableOpacity
        style={[styles.deleteButton, getWebStyle('touchableOpacity')]}
        onPress={() => deleteTeam(item.id)}
      >
        <Ionicons name="trash" size={16} color="#ff3b30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={24} color="#34C759" />
        <Text style={styles.title}>Admin Panel</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{teams.length}</Text>
          <Text style={styles.statLabel}>Total Teams</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{teams.reduce((sum, team) => sum + team.members.length, 0)}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Teams</Text>
        {loading ? (
          <Text style={styles.loadingText}>{t.common.loading}</Text>
        ) : teams.length === 0 ? (
          <Text style={styles.emptyText}>No teams found</Text>
        ) : (
          <FlatList
            data={teams}
            renderItem={renderTeamItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <TouchableOpacity
        style={[styles.clearButton, getWebStyle('touchableOpacity')]}
        onPress={clearAllData}
      >
        <Ionicons name="warning" size={20} color="#ff3b30" />
        <Text style={styles.clearButtonText}>Clear All Data</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 8,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  teamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  teamDetails: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  teamId: {
    fontSize: 12,
    color: '#999999',
    fontFamily: 'monospace',
  },
  deleteButton: {
    padding: 8,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#ff3b30',
    padding: 12,
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff3b30',
    marginLeft: 8,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666666',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666666',
    padding: 20,
    fontStyle: 'italic',
  },
});

export default AdminPanel;