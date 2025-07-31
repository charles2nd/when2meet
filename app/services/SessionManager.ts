/**
 * Session Manager - Robust user session persistence
 * Handles localStorage, cookies, and AsyncStorage for maximum compatibility
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { UserRole } from './firebase';

export interface SessionData {
  user: UserRole;
  timestamp: number;
  expiresAt: number;
  sessionId: string;
  platform: string;
}

export class SessionManager {
  private static readonly SESSION_KEY = 'when2meet_user_session';
  private static readonly SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
  private static readonly COOKIE_NAME = 'when2meet_session';

  /**
   * Save user session with multiple persistence methods
   */
  static async saveSession(user: UserRole): Promise<void> {
    const sessionData: SessionData = {
      user,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.SESSION_DURATION,
      sessionId: this.generateSessionId(),
      platform: Platform.OS
    };

    console.log('[SESSION] Saving user session:', {
      email: user.email,
      sessionId: sessionData.sessionId,
      expiresIn: Math.round(this.SESSION_DURATION / (24 * 60 * 60 * 1000)) + ' days'
    });

    try {
      // Method 1: AsyncStorage (React Native standard)
      await AsyncStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
      console.log('[SESSION] ✅ Session saved to AsyncStorage');

      // Method 2: localStorage (Web only)
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
        console.log('[SESSION] ✅ Session saved to localStorage');
      }

      // Method 3: Cookie (Web only, as fallback)
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        this.setCookie(this.COOKIE_NAME, JSON.stringify(sessionData), this.SESSION_DURATION);
        console.log('[SESSION] ✅ Session saved to cookie');
      }

      // Method 4: Backup to separate user key
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      console.log('[SESSION] ✅ User backup saved');

    } catch (error) {
      console.error('[SESSION] Error saving session:', error);
      throw error;
    }
  }

  /**
   * Load user session from multiple sources
   */
  static async loadSession(): Promise<UserRole | null> {
    console.log('[SESSION] Loading user session from storage...');

    try {
      let sessionData: SessionData | null = null;

      // Method 1: Try AsyncStorage first
      try {
        const asyncData = await AsyncStorage.getItem(this.SESSION_KEY);
        if (asyncData) {
          sessionData = JSON.parse(asyncData);
          console.log('[SESSION] Session found in AsyncStorage');
        }
      } catch (error) {
        console.warn('[SESSION] AsyncStorage read error:', error);
      }

      // Method 2: Try localStorage (Web)
      if (!sessionData && Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        try {
          const localData = localStorage.getItem(this.SESSION_KEY);
          if (localData) {
            sessionData = JSON.parse(localData);
            console.log('[SESSION] Session found in localStorage');
          }
        } catch (error) {
          console.warn('[SESSION] localStorage read error:', error);
        }
      }

      // Method 3: Try Cookie (Web)
      if (!sessionData && Platform.OS === 'web' && typeof document !== 'undefined') {
        try {
          const cookieData = this.getCookie(this.COOKIE_NAME);
          if (cookieData) {
            sessionData = JSON.parse(cookieData);
            console.log('[SESSION] Session found in cookie');
          }
        } catch (error) {
          console.warn('[SESSION] Cookie read error:', error);
        }
      }

      // Method 4: Fallback to old user storage
      if (!sessionData) {
        try {
          const userData = await AsyncStorage.getItem('currentUser');
          if (userData) {
            const user = JSON.parse(userData);
            console.log('[SESSION] Fallback: User found in legacy storage');
            // Upgrade to new session format
            await this.saveSession(user);
            return user;
          }
        } catch (error) {
          console.warn('[SESSION] Legacy storage read error:', error);
        }
      }

      // Validate session
      if (sessionData) {
        if (this.isSessionValid(sessionData)) {
          console.log('[SESSION] ✅ Valid session loaded for:', sessionData.user.email);
          
          // Extend session if it's close to expiring
          if (this.shouldExtendSession(sessionData)) {
            console.log('[SESSION] Extending session...');
            await this.saveSession(sessionData.user);
          }
          
          return sessionData.user;
        } else {
          console.log('[SESSION] ❌ Session expired, clearing...');
          await this.clearSession();
          return null;
        }
      }

      console.log('[SESSION] No valid session found');
      return null;

    } catch (error) {
      console.error('[SESSION] Error loading session:', error);
      return null;
    }
  }

  /**
   * Clear user session from all storage methods
   */
  static async clearSession(): Promise<void> {
    console.log('[SESSION] Clearing user session...');

    try {
      // Clear AsyncStorage
      await AsyncStorage.removeItem(this.SESSION_KEY);
      await AsyncStorage.removeItem('currentUser');
      console.log('[SESSION] ✅ Session cleared from AsyncStorage');

      // Clear localStorage (Web)
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.SESSION_KEY);
        console.log('[SESSION] ✅ Session cleared from localStorage');
      }

      // Clear cookie (Web)
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        this.deleteCookie(this.COOKIE_NAME);
        console.log('[SESSION] ✅ Session cleared from cookie');
      }

    } catch (error) {
      console.error('[SESSION] Error clearing session:', error);
    }
  }

  /**
   * Check if current session is valid
   */
  static isSessionValid(sessionData: SessionData): boolean {
    const now = Date.now();
    const isExpired = now > sessionData.expiresAt;
    const hasUser = sessionData.user && sessionData.user.uid && 
                   (sessionData.user.email || sessionData.user.phoneNumber);
    
    if (isExpired) {
      console.log('[SESSION] Session expired:', new Date(sessionData.expiresAt));
      return false;
    }
    
    if (!hasUser) {
      console.log('[SESSION] Invalid session data: missing user info');
      return false;
    }
    
    return true;
  }

  /**
   * Check if session should be extended
   */
  static shouldExtendSession(sessionData: SessionData): boolean {
    const now = Date.now();
    const timeUntilExpiry = sessionData.expiresAt - now;
    const extensionThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    return timeUntilExpiry < extensionThreshold;
  }

  /**
   * Generate unique session ID
   */
  private static generateSessionId(): string {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Set cookie (Web only)
   */
  private static setCookie(name: string, value: string, maxAge: number): void {
    if (typeof document === 'undefined') return;
    
    const expires = new Date(Date.now() + maxAge).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  }

  /**
   * Get cookie (Web only)
   */
  private static getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue ? decodeURIComponent(cookieValue) : null;
    }
    return null;
  }

  /**
   * Delete cookie (Web only)
   */
  private static deleteCookie(name: string): void {
    if (typeof document === 'undefined') return;
    
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  /**
   * Get session info for debugging
   */
  static async getSessionInfo(): Promise<any> {
    try {
      const asyncData = await AsyncStorage.getItem(this.SESSION_KEY);
      const sessionData = asyncData ? JSON.parse(asyncData) : null;
      
      if (!sessionData) return { exists: false };
      
      return {
        exists: true,
        user: sessionData.user.email,
        sessionId: sessionData.sessionId,
        created: new Date(sessionData.timestamp).toISOString(),
        expires: new Date(sessionData.expiresAt).toISOString(),
        isValid: this.isSessionValid(sessionData),
        platform: sessionData.platform,
        timeUntilExpiry: Math.round((sessionData.expiresAt - Date.now()) / (24 * 60 * 60 * 1000)) + ' days'
      };
    } catch (error) {
      return { exists: false, error: error.message };
    }
  }
}