import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { Colors } from '../constants/theme';
import { RESPONSIVE } from '../utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  groupId: string;
}

const GroupChatScreen: React.FC = () => {
  const { user, currentGroup, t } = useApp();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!currentGroup) {
      router.replace('/(tabs)/group');
      return;
    }

    // Load demo messages
    setMessages([
      {
        id: '1',
        userId: 'system',
        userName: 'System',
        text: `Welcome to ${currentGroup.name} chat!`,
        timestamp: new Date().toISOString(),
        groupId: currentGroup.id
      },
      {
        id: '2',
        userId: 'demo1',
        userName: 'Player 1',
        text: 'Hey team, when can everyone play this week?',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        groupId: currentGroup.id
      },
      {
        id: '3',
        userId: 'demo2',
        userName: 'Player 2',
        text: 'I\'m free most evenings after 7pm',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        groupId: currentGroup.id
      }
    ]);
  }, [currentGroup]);

  const sendMessage = () => {
    if (!messageText.trim() || !user || !currentGroup) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      text: messageText.trim(),
      timestamp: new Date().toISOString(),
      groupId: currentGroup.id
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageText('');
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.userId === user?.id;
    const isSystem = item.userId === 'system';

    if (isSystem) {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.messageContainer, isMyMessage && styles.myMessageContainer]}>
        <View style={[styles.message, isMyMessage && styles.myMessage]}>
          {!isMyMessage && (
            <Text style={styles.messageAuthor}>{item.userName}</Text>
          )}
          <Text style={[styles.messageText, isMyMessage && styles.myMessageText]}>
            {item.text}
          </Text>
          <Text style={[styles.messageTime, isMyMessage && styles.myMessageTime]}>
            {new Date(item.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (!currentGroup) {
    return null;
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.groupName}>{currentGroup.name}</Text>
          <Text style={styles.memberCount}>
            {currentGroup.members.length} members • Code: {currentGroup.code}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push('/groupSettings')}
        >
          <Ionicons name="settings" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          placeholderTextColor={Colors.text.tertiary}
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity 
          onPress={sendMessage} 
          style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
          disabled={!messageText.trim()}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={messageText.trim() ? Colors.text.primary : Colors.text.tertiary} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: RESPONSIVE.safeArea.top,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: RESPONSIVE.spacing.md,
    paddingVertical: RESPONSIVE.spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    minHeight: RESPONSIVE.scale(60),
  },
  headerContent: {
    flex: 1,
  },
  groupName: {
    fontSize: RESPONSIVE.fontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  memberCount: {
    fontSize: RESPONSIVE.fontSizes.sm,
    color: Colors.text.secondary,
    marginTop: RESPONSIVE.spacing.xs,
  },
  settingsButton: {
    padding: 8,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: RESPONSIVE.spacing.md,
    paddingBottom: RESPONSIVE.spacing.xl,
  },
  messageContainer: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  message: {
    backgroundColor: Colors.surface,
    padding: RESPONSIVE.spacing.md,
    borderRadius: 16,
    maxWidth: RESPONSIVE.isSmallScreen ? '85%' : '80%',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  myMessage: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  systemMessage: {
    alignItems: 'center',
    marginVertical: 16,
  },
  systemMessageText: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
  messageAuthor: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  myMessageText: {
    color: Colors.text.primary,
  },
  messageTime: {
    fontSize: 11,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
  myMessageTime: {
    color: Colors.text.secondary,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: RESPONSIVE.spacing.md,
    paddingVertical: RESPONSIVE.spacing.md,
    paddingBottom: RESPONSIVE.safeArea.bottom + RESPONSIVE.spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: RESPONSIVE.spacing.md,
    paddingVertical: RESPONSIVE.spacing.sm,
    marginRight: RESPONSIVE.spacing.sm,
    color: Colors.text.primary,
    fontSize: RESPONSIVE.fontSizes.md,
    maxHeight: RESPONSIVE.scale(100),
    minHeight: RESPONSIVE.scale(40),
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    width: RESPONSIVE.scale(40),
    height: RESPONSIVE.scale(40),
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.surface,
  },
});

export default GroupChatScreen;