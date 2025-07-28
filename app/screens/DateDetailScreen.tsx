import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import { Colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

const DateDetailScreen: React.FC = () => {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { user, currentGroup, groupAvailabilities, t } = useApp();
  const router = useRouter();
  const [availableMembers, setAvailableMembers] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (!date || !currentGroup) return;

    // Find all members available on this date
    const available = new Set<string>();
    
    groupAvailabilities.forEach(availability => {
      const hasAvailability = availability.slots.some(slot => 
        slot.date === date && slot.available
      );
      if (hasAvailability) {
        available.add(availability.userId);
      }
    });

    setAvailableMembers(Array.from(available));

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
  }, [date, currentGroup, groupAvailabilities]);

  const sendMessage = () => {
    if (!messageText.trim() || !user) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      text: messageText.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, newMessage]);
    setMessageText('');
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
            <Text style={styles.dateTitle}>{formatDate(date!)}</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionTitle}>
            Available Members ({availableMembers.length}/{currentGroup?.members.length})
          </Text>
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
            keyExtractor={(item) => item.id}
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
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>
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
    padding: 16,
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
    padding: 16,
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
    padding: 16,
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
});

export default DateDetailScreen;