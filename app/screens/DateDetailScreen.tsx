import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Modal, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import { Colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Availability } from '../models/SimpleAvailability';

interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

const DateDetailScreen: React.FC = () => {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { user, currentGroup, groupAvailabilities, myAvailability, saveAvailability, t } = useApp();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<string>(date as string);
  const [availableMembers, setAvailableMembers] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [showTimeRangePicker, setShowTimeRangePicker] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(9);
  const [endTime, setEndTime] = useState<number>(17);
  const [userAvailability, setUserAvailability] = useState<Availability | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messageIdCounter = useRef(0);

  useEffect(() => {
    if (!currentDate || !currentGroup) return;

    // Find all members available on this date
    const available = new Set<string>();
    
    groupAvailabilities.forEach(availability => {
      const hasAvailability = availability.slots.some(slot => 
        slot.date === currentDate && slot.available
      );
      if (hasAvailability) {
        available.add(availability.userId);
      }
    });

    setAvailableMembers(Array.from(available));

    // Initialize user availability
    if (myAvailability) {
      setUserAvailability(myAvailability);
    } else if (user && currentGroup) {
      setUserAvailability(new Availability({
        userId: user.id,
        groupId: currentGroup.id
      }));
    }

    // Load saved messages for this date (would be from storage/Firebase)
    // For now, using demo messages
    setMessages([
      {
        id: '1',
        userId: 'demo1',
        userName: 'Player 1',
        text: 'Great, we have enough people for a full team!',
        timestamp: new Date().toISOString()
      }
    ]);
  }, [currentDate, currentGroup, groupAvailabilities, myAvailability, user]);

  const sendMessage = () => {
    if (!messageText.trim() || !user || isSending) return;

    setIsSending(true);
    
    // Generate unique ID using counter + timestamp
    messageIdCounter.current += 1;
    const uniqueId = `${user.id}_${Date.now()}_${messageIdCounter.current}`;

    const newMessage: Message = {
      id: uniqueId,
      userId: user.id,
      userName: user.name,
      text: messageText.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, newMessage]);
    setMessageText('');
    setIsSending(false);
    // TODO: Save to storage/Firebase
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const date = new Date(currentDate);
    if (direction === 'prev') {
      date.setDate(date.getDate() - 1);
    } else {
      date.setDate(date.getDate() + 1);
    }
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  const handleSetTimeRange = async () => {
    if (!userAvailability || !currentGroup || startTime >= endTime) {
      Alert.alert('Error', 'Please select a valid time range');
      return;
    }

    try {
      // Clear existing availability for this date
      userAvailability.clearDay(currentDate);
      
      // Set availability for the selected time range
      for (let hour = startTime; hour < endTime; hour++) {
        userAvailability.setSlot(currentDate, hour, true);
      }
      
      // Save to storage
      await saveAvailability(userAvailability);
      setUserAvailability({...userAvailability});
      setShowTimeRangePicker(false);
      
      Alert.alert('Success', `Available from ${startTime}:00 to ${endTime}:00`);
    } catch (error) {
      console.error('Error saving time range:', error);
      Alert.alert('Error', 'Failed to save time range');
    }
  };

  const getUserTimeRange = () => {
    if (!userAvailability) return null;
    
    const daySlots = userAvailability.slots
      .filter(slot => slot.date === currentDate && slot.available)
      .sort((a, b) => a.hour - b.hour);
    
    if (daySlots.length === 0) return null;
    
    const start = daySlots[0].hour;
    const end = daySlots[daySlots.length - 1].hour + 1;
    
    return `${start.toString().padStart(2, '0')}:00 - ${end.toString().padStart(2, '0')}:00`;
  };

  const renderMember = ({ item }: { item: string }) => {
    const memberData = currentGroup?.members.find(m => m === item);
    return (
      <View style={styles.memberItem}>
        <Ionicons name="person-circle" size={32} color={Colors.primary} />
        <Text style={styles.memberName}>Member {item.slice(-4)}</Text>
        <View style={styles.availableBadge}>
          <Text style={styles.availableText}>Available</Text>
        </View>
      </View>
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.userId === user?.id;
    return (
      <View style={[styles.message, isMyMessage && styles.myMessage]}>
        <Text style={styles.messageAuthor}>{item.userName}</Text>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.messageTime}>
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigateDate('prev')} style={styles.navButton}>
              <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.dateTitle}>{formatDate(currentDate)}</Text>
            <TouchableOpacity onPress={() => navigateDate('next')} style={styles.navButton}>
              <Ionicons name="chevron-forward" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionTitle}>
            Available Members ({availableMembers.length}/{currentGroup?.members.length})
          </Text>
          
          {/* User Time Range Section */}
          <View style={styles.timeRangeSection}>
            <View style={styles.timeRangeHeader}>
              <Text style={styles.timeRangeTitle}>Your Availability</Text>
              <TouchableOpacity 
                onPress={() => setShowTimeRangePicker(true)}
                style={styles.setTimeButton}
              >
                <Ionicons name="time" size={16} color={Colors.text.primary} />
                <Text style={styles.setTimeText}>Set Time Range</Text>
              </TouchableOpacity>
            </View>
            
            {getUserTimeRange() ? (
              <View style={styles.currentTimeRange}>
                <Ionicons name="clock" size={16} color={Colors.success} />
                <Text style={styles.timeRangeText}>{getUserTimeRange()}</Text>
              </View>
            ) : (
              <Text style={styles.noTimeRange}>No availability set for this day</Text>
            )}
          </View>
          <FlatList
            data={availableMembers}
            renderItem={renderMember}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.membersList}
          />
        </View>

        <View style={styles.chatSection}>
          <Text style={styles.sectionTitle}>Team Chat</Text>
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => `${item.id}_${index}`}
            style={styles.messagesList}
            inverted
          />
        </View>
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          placeholderTextColor={Colors.text.tertiary}
          multiline
        />
        <TouchableOpacity 
          onPress={sendMessage} 
          style={[styles.sendButton, isSending && { opacity: 0.6 }]}
          disabled={isSending}
        >
          <Ionicons name="send" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Time Range Picker Modal */}
      <Modal
        visible={showTimeRangePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimeRangePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Your Availability</Text>
            <Text style={styles.modalSubtitle}>I will play from:</Text>
            
            <View style={styles.timePickerContainer}>
              <View style={styles.timePicker}>
                <Text style={styles.timeLabel}>From:</Text>
                <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 24 }, (_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.timeOption, startTime === i && styles.selectedTime]}
                      onPress={() => setStartTime(i)}
                    >
                      <Text style={[styles.timeOptionText, startTime === i && styles.selectedTimeText]}>
                        {i.toString().padStart(2, '0')}:00
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.timePicker}>
                <Text style={styles.timeLabel}>To:</Text>
                <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 24 }, (_, i) => i + 1).map(hour => (
                    <TouchableOpacity
                      key={hour}
                      style={[styles.timeOption, endTime === hour && styles.selectedTime]}
                      onPress={() => setEndTime(hour)}
                    >
                      <Text style={[styles.timeOptionText, endTime === hour && styles.selectedTimeText]}>
                        {hour.toString().padStart(2, '0')}:00
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setShowTimeRangePicker(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleSetTimeRange}
                style={[styles.modalButton, styles.confirmButton]}
              >
                <Text style={styles.confirmButtonText}>Set Availability</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  navButton: {
    padding: 8,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginHorizontal: 8,
  },
  closeButton: {
    padding: 8,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  membersList: {
    marginTop: 8,
  },
  memberItem: {
    alignItems: 'center',
    marginRight: 16,
    padding: 8,
  },
  memberName: {
    fontSize: 12,
    color: Colors.text.primary,
    marginTop: 4,
  },
  availableBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  availableText: {
    fontSize: 10,
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  chatSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
  },
  messagesList: {
    maxHeight: 300,
  },
  message: {
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
  },
  messageAuthor: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  messageTime: {
    fontSize: 10,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.inputBackground,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    color: Colors.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeRangeSection: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.card,
    borderRadius: 8,
  },
  timeRangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeRangeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  setTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  setTimeText: {
    fontSize: 12,
    color: Colors.text.primary,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  currentTimeRange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeRangeText: {
    fontSize: 14,
    color: Colors.success,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  noTimeRange: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  timePickerContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  timePicker: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  timeScroll: {
    maxHeight: 150,
    backgroundColor: Colors.inputBackground,
    borderRadius: 8,
  },
  timeOption: {
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  selectedTime: {
    backgroundColor: Colors.primary,
  },
  timeOptionText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  selectedTimeText: {
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border.medium,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    color: Colors.text.secondary,
    fontWeight: 'bold',
  },
  confirmButtonText: {
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
});

export default DateDetailScreen;