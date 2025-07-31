import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  Timestamp,
  getDocs 
} from 'firebase/firestore';
import { db } from './firebase';

export interface ChatMessage {
  id?: string;
  groupId: string;
  date: string; // YYYY-MM-DD format
  userId: string;
  userName: string;
  text: string;
  timestamp: Timestamp | Date;
  createdAt?: Timestamp;
}

export class ChatService {
  /**
   * Send a message to a specific day's chat
   */
  static async sendMessage(
    groupId: string, 
    date: string, 
    userId: string, 
    userName: string, 
    text: string
  ): Promise<string> {
    try {
      console.log('[CHAT] Sending message to group:', groupId, 'date:', date);
      
      const messageData: Omit<ChatMessage, 'id'> = {
        groupId,
        date,
        userId,
        userName,
        text: text.trim(),
        timestamp: new Date(),
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'dayMessages'), messageData);
      console.log('[CHAT] ✅ Message sent successfully:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('[CHAT] ❌ Error sending message:', error);
      throw error;
    }
  }

  /**
   * Listen to messages for a specific group and date
   */
  static subscribeToDateMessages(
    groupId: string,
    date: string,
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    try {
      console.log('[CHAT] Subscribing to messages for group:', groupId, 'date:', date);
      
      const messagesRef = collection(db, 'dayMessages');
      
      // Create a simpler query first - just filter by groupId and date
      // We'll sort manually in JavaScript to avoid index requirements
      const q = query(
        messagesRef,
        where('groupId', '==', groupId),
        where('date', '==', date)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages: ChatMessage[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          messages.push({
            id: doc.id,
            groupId: data.groupId,
            date: data.date,
            userId: data.userId,
            userName: data.userName,
            text: data.text,
            timestamp: data.timestamp,
            createdAt: data.createdAt
          });
        });

        // Sort messages by timestamp manually to avoid Firestore index requirement
        messages.sort((a, b) => {
          const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
          const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
          return timeA - timeB;
        });

        console.log('[CHAT] ✅ Received and sorted', messages.length, 'messages for date:', date);
        callback(messages);
      }, (error) => {
        console.error('[CHAT] ❌ Error listening to messages:', error);
        
        // Check if it's an index error and provide helpful information
        if (error.code === 'failed-precondition' && error.message.includes('index')) {
          console.error('[CHAT] 🔍 Index missing for dayMessages collection');
          console.error('[CHAT] 💡 This is normal for first-time setup');
          console.error('[CHAT] 📝 Using fallback method until index is ready');
          
          // Use fallback method without real-time updates
          ChatService.getDateMessagesOnce(groupId, date).then(callback);
        } else {
          callback([]); // Return empty array on other errors
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error('[CHAT] ❌ Error setting up message subscription:', error);
      // Return a no-op function if subscription fails
      return () => {};
    }
  }

  /**
   * Get messages once (fallback method when real-time subscription fails)
   */
  static async getDateMessagesOnce(groupId: string, date: string): Promise<ChatMessage[]> {
    try {
      console.log('[CHAT] Using fallback method to get messages for:', groupId, date);
      
      const messagesRef = collection(db, 'dayMessages');
      const q = query(
        messagesRef,
        where('groupId', '==', groupId),
        where('date', '==', date)
      );

      const snapshot = await getDocs(q);
      const messages: ChatMessage[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          groupId: data.groupId,
          date: data.date,
          userId: data.userId,
          userName: data.userName,
          text: data.text,
          timestamp: data.timestamp,
          createdAt: data.createdAt
        });
      });

      // Sort messages by timestamp
      messages.sort((a, b) => {
        const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
        const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
        return timeA - timeB;
      });

      console.log('[CHAT] ✅ Fallback method loaded', messages.length, 'messages');
      return messages;
    } catch (error) {
      console.error('[CHAT] ❌ Error in fallback method:', error);
      return [];
    }
  }

  /**
   * Get message count for a specific date (for indicators)
   */
  static async getMessageCount(groupId: string, date: string): Promise<number> {
    try {
      const messagesRef = collection(db, 'dayMessages');
      const q = query(
        messagesRef,
        where('groupId', '==', groupId),
        where('date', '==', date)
      );

      // Note: This would need to be implemented with a count query or by fetching all docs
      // For now, we'll use the subscription method to get count
      return 0;
    } catch (error) {
      console.error('[CHAT] ❌ Error getting message count:', error);
      return 0;
    }
  }

  /**
   * Format timestamp for display
   */
  static formatTimestamp(timestamp: Timestamp | Date): string {
    let date: Date;
    
    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}