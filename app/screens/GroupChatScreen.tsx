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
import { WebSocketService } from '../services/WebSocketService';

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
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const wsService = useRef(WebSocketService.getInstance());
  const messageIdCounter = useRef(0);

  useEffect(() => {
    if (!currentGroup || !user) {
      router.replace('/(tabs)/group');
      return;
    }

    // Initialize chat with welcome message
    setMessages([
      {
        id: '1',
        userId: 'system',
        userName: 'System',
        text: `Welcome to ${currentGroup.name} chat! Real-time messaging is enabled.`,
        timestamp: new Date().toISOString(),
        groupId: currentGroup.id
      }
    ]);

    // Connect to WebSocket
    const connectWebSocket = async () => {
      try {
        await wsService.current.connect(currentGroup.id, user.id, user.name);
        setIsConnected(true);
        
        // Set up message listener
        wsService.current.onMessage(currentGroup.id, (message: Message) => {
          // Only add messages from other users (prevent duplicates from echo)
          if (message.userId !== user.id) {
            setMessages(prev => {
              // Check if message already exists to prevent duplicates
              const exists = prev.some(m => m.id === message.id || 
                (m.text === message.text && m.userId === message.userId && 
                 Math.abs(new Date(m.timestamp).getTime() - new Date(message.timestamp).getTime()) < 1000));
              
              if (exists) {
                return prev;
              }
              
              return [...prev, message];
            });
            
            // Scroll to bottom
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }
        });
        
      } catch (error) {
        console.error('[CHAT] Failed to connect to WebSocket:', error);
        Alert.alert('Connection Error', 'Unable to connect to chat server. Messages will work locally only.');
      }
    };

    connectWebSocket();

    // Cleanup function
    return () => {
      wsService.current.removeMessageListener(currentGroup.id);
    };
  }, [currentGroup, user, router]);

  const sendMessage = async () => {
    if (!messageText.trim() || !user || !currentGroup || isSending) return;

    setIsSending(true);
    
    // Generate unique ID using counter + timestamp
    messageIdCounter.current += 1;
    const uniqueId = `${user.id}_${Date.now()}_${messageIdCounter.current}`;
    
    const newMessage: Message = {
      id: uniqueId,
      userId: user.id,
      userName: user.name,
      text: messageText.trim(),
      timestamp: new Date().toISOString(),
      groupId: currentGroup.id
    };

    // Clear input immediately
    const messageToSend = messageText.trim();
    setMessageText('');

    // Add message locally first for immediate feedback
    setMessages(prev => [...prev, newMessage]);
    
    // Send via WebSocket if connected (but don't add to local messages again)
    if (isConnected) {
      try {
        wsService.current.sendChatMessage(newMessage);
      } catch (error) {
        console.error('[CHAT] Failed to send message:', error);
      }
    }
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    setIsSending(false);
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
          <View style={styles.statusContainer}>
            <Text style={styles.memberCount}>
              {currentGroup.members.length} members • Code: {currentGroup.code}
            </Text>
            <View style={styles.connectionStatus}>
              <View style={[styles.statusDot, { backgroundColor: isConnected ? Colors.success : Colors.warning }]} />
              <Text style={styles.statusText}>
                {isConnected ? 'Connected' : 'Offline'}
              </Text>
            </View>
          </View>
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
        keyExtractor={(item, index) => `${item.id}_${index}`}
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
          style={[styles.sendButton, (!messageText.trim() || isSending) && styles.sendButtonDisabled]}
          disabled={!messageText.trim() || isSending}
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
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: RESPONSIVE.spacing.xs,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: RESPONSIVE.fontSizes.xs,
    color: Colors.text.secondary,
    fontWeight: '500',
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