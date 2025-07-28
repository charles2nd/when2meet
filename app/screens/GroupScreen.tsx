import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, Alert } from 'react-native';
import { useApp } from '../contexts/AppContext';
import GroupChatScreen from './GroupChatScreen';

const GroupScreen: React.FC = () => {
  const { user, currentGroup, groupAvailabilities, createGroup, joinGroup, loadGroupAvailabilities, t } = useApp();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [groupCode, setGroupCode] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    if (currentGroup) {
      loadGroupAvailabilities();
    }
  }, [currentGroup]);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert(t.common.error, 'Please enter a group name');
      return;
    }

    const group = await createGroup(groupName.trim());
    Alert.alert(t.common.success, `Group created! Code: ${group.code}`);
    setShowCreateForm(false);
    setGroupName('');
  };

  const handleJoinGroup = async () => {
    if (!groupCode.trim()) {
      Alert.alert(t.common.error, 'Please enter a group code');
      return;
    }

    const success = await joinGroup(groupCode.trim());
    if (success) {
      Alert.alert(t.common.success, 'Successfully joined group!');
      setShowJoinForm(false);
      setGroupCode('');
    } else {
      Alert.alert(t.common.error, 'Group not found');
    }
  };

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

  const getAvailabilityCount = (date: string, hour: number): number => {
    return groupAvailabilities.filter(availability => 
      availability.getSlot(date, hour)
    ).length;
  };

  const getHeatMapColor = (count: number, total: number): string => {
    if (count === 0) return '#f5f5f5';
    const percentage = count / total;
    if (percentage >= 0.8) return '#4CAF50';
    if (percentage >= 0.6) return '#8BC34A';
    if (percentage >= 0.4) return '#FFC107';
    if (percentage >= 0.2) return '#FF9800';
    return '#FFEB3B';
  };

  if (!currentGroup) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t.group.noGroup}</Text>
        
        {!showJoinForm && !showCreateForm && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => setShowJoinForm(true)}
            >
              <Text style={styles.buttonText}>{t.group.joinGroup}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => setShowCreateForm(true)}
            >
              <Text style={styles.buttonText}>{t.group.createGroup}</Text>
            </TouchableOpacity>
          </View>
        )}

        {showJoinForm && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder={t.group.enterCode}
              value={groupCode}
              onChangeText={setGroupCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.button} onPress={handleJoinGroup}>
              <Text style={styles.buttonText}>{t.group.joinGroup}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowJoinForm(false)}>
              <Text style={styles.cancelText}>{t.common.cancel}</Text>
            </TouchableOpacity>
          </View>
        )}

        {showCreateForm && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder={t.group.groupName}
              value={groupName}
              onChangeText={setGroupName}
            />
            <TouchableOpacity style={styles.button} onPress={handleCreateGroup}>
              <Text style={styles.buttonText}>{t.group.createGroup}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowCreateForm(false)}>
              <Text style={styles.cancelText}>{t.common.cancel}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // If user has a group, show the chat screen
  return <GroupChatScreen />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    paddingBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    paddingHorizontal: 20,
    paddingBottom: 5,
    color: '#666',
  },
  buttonContainer: {
    padding: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  form: {
    padding: 20,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  cancelText: {
    textAlign: 'center',
    color: '#007AFF',
    marginTop: 10,
    fontSize: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  dateButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  selectedDate: {
    backgroundColor: '#007AFF',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  heatMapContainer: {
    padding: 20,
  },
  heatMapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  hoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  hourBlock: {
    width: '23%',
    padding: 10,
    margin: '1%',
    borderRadius: 8,
    alignItems: 'center',
  },
  hourText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  countText: {
    fontSize: 10,
    marginTop: 2,
  },
  legend: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  legendTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
  },
});

export default GroupScreen;