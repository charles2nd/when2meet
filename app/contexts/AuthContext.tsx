import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole, signInWithGoogle, signInAsDemo, signOutUser } from '../services/firebase';
import { FirebaseStorageService } from '../services/FirebaseStorageService';
import { LocalStorage } from '../services/LocalStorage';

interface AuthContextType {
  user: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signInGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  logoutTrigger: number;
  loginTrigger: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutTrigger, setLogoutTrigger] = useState(0);
  const [loginTrigger, setLoginTrigger] = useState(0);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      console.log('[AUTH] Loading user from storage...');
      const savedUser = await AsyncStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setUser(user);
        console.log('[AUTH] User loaded from storage:', user.email);
        
        // Load user's teams and data
        console.log('[AUTH] Loading user teams and data...');
        await FirebaseStorageService.loadUserData(user.uid);
      } else {
        console.log('[AUTH] No saved user found');
      }
    } catch (error) {
      console.error('[AUTH] Error loading user from storage:', error);
    } finally {
      setLoading(false);
      console.log('[AUTH] Auth loading complete');
    }
  };

  const saveUserToStorage = async (userData: UserRole | null) => {
    try {
      if (userData) {
        await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
        console.log('[AUTH] User saved to storage:', userData.email);
      } else {
        await AsyncStorage.removeItem('currentUser');
        console.log('[AUTH] User removed from storage');
      }
    } catch (error) {
      console.error('[AUTH] Error saving user to storage:', error);
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('[AUTH] Sign in attempt for:', email);
      const userData = await signInAsDemo(email, password);
      
      if (userData) {
        setUser(userData);
        await saveUserToStorage(userData);
        console.log('[AUTH] Sign in successful for:', userData.email);
        
        // Trigger login success for navigation
        setLoginTrigger(prev => prev + 1);
        return true;
      }
      
      console.warn('[AUTH] Sign in failed: Invalid credentials');
      return false;
    } catch (error) {
      console.error('[AUTH] Sign in error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signInGoogle = async (): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('[AUTH] Google sign in attempt');
      const userData = await signInWithGoogle();
      if (userData) {
        setUser(userData);
        await saveUserToStorage(userData);
        console.log('[AUTH] Google sign in successful for:', userData.email);
        
        // Trigger login success for navigation
        setLoginTrigger(prev => prev + 1);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[AUTH] Google sign in error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('[AUTH] Starting complete logout process...');
      
      // Clear Firebase auth
      await signOutUser();
      console.log('[AUTH] Firebase auth cleared');
      
      // Clear user state
      setUser(null);
      await saveUserToStorage(null);
      console.log('[AUTH] User state cleared');
      
      // Clear AsyncStorage data
      await AsyncStorage.multiRemove([
        'currentTeamId', 
        'currentUserId', 
        'teams', 
        'monthlyAvailability',
        'currentUser',
        'user',
        'currentGroup',
        'groups',
        'availabilities'
      ]);
      console.log('[AUTH] AsyncStorage cleared');
      
      // Clear LocalStorage data (AppContext)
      await LocalStorage.clearAll();
      console.log('[AUTH] LocalStorage cleared');
      
      console.log('[AUTH] Complete logout finished');
      
      // Trigger logout state change for navigation
      setLogoutTrigger(prev => prev + 1);
    } catch (error) {
      console.error('[AUTH] Error during logout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signInGoogle,
    signOut,
    isAdmin: user?.role === 'admin',
    logoutTrigger,
    loginTrigger,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};