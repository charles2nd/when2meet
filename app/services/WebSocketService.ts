/**
 * WebSocket Service for Real-time Group Chat
 * Provides real-time messaging capabilities using WebSockets
 */

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  groupId: string;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private messageCallbacks: Map<string, (message: ChatMessage) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect(groupId: string, userId: string, userName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // For demo purposes, we'll use a mock WebSocket server
        // In production, replace with your actual WebSocket server URL
        const wsUrl = `wss://echo.websocket.org/`;
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('[WEBSOCKET] Connected to chat server');
          this.reconnectAttempts = 0;
          
          // Send join message
          this.sendMessage({
            type: 'join',
            groupId,
            userId,
            userName,
            timestamp: new Date().toISOString()
          });
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            // Skip non-JSON messages (echo server sometimes sends non-JSON)
            if (typeof event.data !== 'string' || !event.data.startsWith('{')) {
              console.log('[WEBSOCKET] Skipping non-JSON message:', event.data.substring(0, 50) + '...');
              return;
            }
            
            const data = JSON.parse(event.data);
            
            // Handle different message types
            if (data.type === 'chat_message') {
              const callback = this.messageCallbacks.get(data.groupId);
              if (callback) {
                callback(data);
              }
            }
          } catch (error) {
            console.error('[WEBSOCKET] Error parsing message:', error);
            console.log('[WEBSOCKET] Raw message data:', event.data.substring(0, 100) + '...');
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WEBSOCKET] Connection error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[WEBSOCKET] Connection closed');
          this.handleReconnect(groupId, userId, userName);
        };

      } catch (error) {
        console.error('[WEBSOCKET] Failed to connect:', error);
        reject(error);
      }
    });
  }

  private handleReconnect(groupId: string, userId: string, userName: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[WEBSOCKET] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(groupId, userId, userName).catch(console.error);
      }, this.reconnectInterval);
    } else {
      console.error('[WEBSOCKET] Max reconnection attempts reached');
    }
  }

  sendChatMessage(message: ChatMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'chat_message',
        ...message
      }));
    } else {
      console.error('[WEBSOCKET] WebSocket not connected');
    }
  }

  private sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  onMessage(groupId: string, callback: (message: ChatMessage) => void) {
    this.messageCallbacks.set(groupId, callback);
  }

  removeMessageListener(groupId: string) {
    this.messageCallbacks.delete(groupId);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageCallbacks.clear();
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export default WebSocketService;