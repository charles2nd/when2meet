import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole, signInWithGoogle, signInAsDemo, signOutUser, signUpWithEmailAndPassword, signInWithEmailPassword, onAuthStateChange, getFirebaseSetupInstructions, sendEmailLink, completeSignInWithEmailLink, sendPhoneVerificationCode, verifyPhoneCode } from '../services/firebase';
import SecurePhoneAuthService from '../services/SecurePhoneAuthService';
import { FirebaseStorageService } from '../services/FirebaseStorageService';
import { LocalStorage } from '../services/LocalStorage';
import { SessionManager } from '../services/SessionManager';

interface AuthContextType {
  user: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, displayName?: string) => Promise<boolean>;
  signInGoogle: () => Promise<boolean>;
  signInPhone: (phoneNumber: string, recaptchaVerifier?: any) => Promise<any>;
  verifyPhoneCode: (confirmation: any, code: string, sessionId?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  sendSignInLink: (email: string) => Promise<void>;
  completeEmailLinkSignIn: (email: string, emailLink: string) => Promise<boolean>;
  isAdmin: boolean;
  logoutTrigger: number;
  loginTrigger: number;
  getSessionInfo: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutTrigger, setLogoutTrigger] = useState(0);
  const [loginTrigger, setLoginTrigger] = useState(0);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  useEffect(() => {
    console.log('[AUTH] ========================================');
    console.log('[AUTH] INITIALIZING AUTH PROVIDER WITH SESSION MANAGER');
    console.log('[AUTH] ========================================');
    
    // Initialize the auth system
    initializeAuth();
    
  }, []);

  const initializeAuth = async () => {
    try {
      // Step 1: Load session immediately for fast UI response
      console.log('[AUTH] 🚀 Step 1: Loading session from storage...');
      const sessionUser = await loadSessionFromStorage();
      
      // Step 2: Set up Firebase listener (but don't let it override valid sessions)
      console.log('[AUTH] 🚀 Step 2: Setting up Firebase auth listener...');
      const unsubscribe = onAuthStateChange((firebaseUser) => {
        console.log('[AUTH] 🔥 Firebase auth state changed:', firebaseUser?.email || 'null');
        console.log('[AUTH] 🔥 Current user state:', user?.email || 'null');
        console.log('[AUTH] 🔥 Session user from load:', sessionUser?.email || 'null');
        
        if (firebaseUser) {
          // Real Firebase user - this takes priority
          console.log('[AUTH] ✅ Firebase user authenticated, updating session');
          setUser(firebaseUser);
          SessionManager.saveSession(firebaseUser).catch(error => {
            console.error('[AUTH] Error saving Firebase session:', error);
          });
          setLoginTrigger(prev => prev + 1);
        } else {
          // No Firebase user - check if we have a valid session
          console.log('[AUTH] 🤔 No Firebase user, checking session validity...');
          
          if (sessionUser) {
            console.log('[AUTH] 💾 Valid session exists, maintaining login:', sessionUser.email);
            // Keep the session user, don't clear
            if (!user) {
              setUser(sessionUser);
              setLoginTrigger(prev => prev + 1);
            }
          } else if (user) {
            // We had a user but no session and no Firebase - sign out
            console.log('[AUTH] ❌ No valid session, signing out');
            setUser(null);
            SessionManager.clearSession();
            setLogoutTrigger(prev => prev + 1);
          }
        }
        
        // Mark Firebase as initialized
        if (!firebaseInitialized) {
          setFirebaseInitialized(true);
          console.log('[AUTH] 🔥 Firebase initialized');
        }
      });
      
      // Step 3: Set loading to false after session check
      console.log('[AUTH] 🚀 Step 3: Finalizing auth initialization...');
      setLoading(false);
      console.log('[AUTH] ✅ Auth system initialized - user:', user?.email || 'none');
      
      return unsubscribe;
    } catch (error) {
      console.error('[AUTH] Error initializing auth:', error);
      setLoading(false);
    }
  };

  const loadSessionFromStorage = async () => {
    try {
      console.log('[AUTH] 💾 Loading session from storage...');
      
      // Load session info for debugging
      const sessionInfo = await SessionManager.getSessionInfo();
      console.log('[AUTH] Session info:', sessionInfo);
      
      const savedUser = await SessionManager.loadSession();
      if (savedUser) {
        console.log('[AUTH] ✅ Valid session found for:', savedUser.email);
        
        // Set user immediately for fast UI response
        setUser(savedUser);
        setLoginTrigger(prev => prev + 1); // Trigger navigation
        console.log('[AUTH] 🎯 User restored from session, triggering navigation');
        
        // Load user's teams and data
        console.log('[AUTH] Loading user teams and data...');
        try {
          await FirebaseStorageService.loadUserData(savedUser.uid);
          console.log('[AUTH] ✅ User data loaded successfully');
        } catch (dataError) {
          console.warn('[AUTH] ⚠️ Could not load user data:', dataError);
          // Continue anyway - session is still valid
        }
        
        return savedUser;
      } else {
        console.log('[AUTH] ❌ No valid session found in storage');
        return null;
      }
    } catch (error) {
      console.error('[AUTH] Error loading session from storage:', error);
      return null;
    }
  };

  // Legacy method - now handled by SessionManager
  const saveUserToStorage = async (userData: UserRole | null) => {
    // This method is kept for backward compatibility but functionality
    // is now handled by SessionManager in the auth state change listener
    console.log('[AUTH] saveUserToStorage called (legacy) - handled by SessionManager');
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('[AUTH] Sign in attempt for:', email);
      
      // Try real Firebase auth first, then fallback to demo
      let userData: UserRole | null = null;
      
      try {
        userData = await signInWithEmailPassword(email, password);
        console.log('[AUTH] Firebase authentication successful');
      } catch (firebaseError: any) {
        console.log('[AUTH] Firebase auth failed:', firebaseError.message);
        
        if (firebaseError.message === 'EMAIL_SIGN_IN_DISABLED') {
          console.log('[AUTH] Email/password auth not enabled, showing setup instructions');
          console.log(getFirebaseSetupInstructions());
          console.log('[AUTH] Falling back to demo authentication');
        }
        
        // Fallback to demo authentication
        userData = await signInAsDemo(email, password);
        if (userData) {
          console.log('[AUTH] Demo authentication successful');
        }
      }
      
      if (userData) {
        setUser(userData);
        // Save to robust session storage
        await SessionManager.saveSession(userData);
        console.log('[AUTH] ✅ Sign in successful for:', userData.email);
        
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
  
  const signUp = async (email: string, password: string, displayName?: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('[AUTH] Sign up attempt for:', email);
      
      let userData: UserRole | null = null;
      
      try {
        userData = await signUpWithEmailAndPassword(email, password, displayName);
        console.log('[AUTH] Firebase sign up successful');
      } catch (firebaseError: any) {
        console.log('[AUTH] Firebase sign up failed:', firebaseError.message);
        
        if (firebaseError.message === 'EMAIL_SIGN_UP_DISABLED') {
          console.log('[AUTH] Email/password auth not enabled, showing setup instructions');
          console.log(getFirebaseSetupInstructions());
          console.log('[AUTH] Falling back to demo authentication');
          
          // For sign up with demo, create a demo user with the provided info
          userData = await signInAsDemo(email, password);
          if (userData && displayName) {
            userData.displayName = displayName;
          }
        } else {
          throw firebaseError; // Re-throw other Firebase errors
        }
      }
      
      if (userData) {
        setUser(userData);
        // Save to robust session storage
        await SessionManager.saveSession(userData);
        console.log('[AUTH] ✅ Sign up successful for:', userData.email);
        
        // Trigger login success for navigation
        setLoginTrigger(prev => prev + 1);
        return true;
      }
      
      console.warn('[AUTH] Sign up failed');
      return false;
    } catch (error) {
      console.error('[AUTH] Sign up error:', error);
      throw error; // Re-throw to handle in UI
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
      console.log('[AUTH] ========================================');
      console.log('[AUTH] STARTING COMPLETE LOGOUT PROCESS');
      console.log('[AUTH] ========================================');
      
      // Clear Firebase auth
      await signOutUser();
      console.log('[AUTH] ✅ Firebase auth cleared');
      
      // Clear user state
      setUser(null);
      console.log('[AUTH] ✅ User state cleared');
      
      // Clear all session storage (localStorage, cookies, AsyncStorage)
      await SessionManager.clearSession();
      console.log('[AUTH] ✅ All session storage cleared');
      
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
        'availabilities',
        'emailForSignIn'
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

  const sendSignInLink = async (email: string): Promise<void> => {
    try {
      console.log('[AUTH] Sending sign-in link to:', email);
      await sendEmailLink(email);
    } catch (error) {
      console.error('[AUTH] Error sending sign-in link:', error);
      throw error;
    }
  };

  const completeEmailLinkSignIn = async (email: string, emailLink: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('[AUTH] Completing email link sign-in for:', email);
      
      const userData = await completeSignInWithEmailLink(email, emailLink);
      
      if (userData) {
        setUser(userData);
        await saveUserToStorage(userData);
        console.log('[AUTH] Email link sign-in successful for:', userData.email);
        
        // Trigger login success for navigation
        setLoginTrigger(prev => prev + 1);
        return true;
      }
      
      console.warn('[AUTH] Email link sign-in failed');
      return false;
    } catch (error) {
      console.error('[AUTH] Email link sign-in error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signInPhone = async (phoneNumber: string, recaptchaVerifier?: any): Promise<any> => {
    try {
      setLoading(true);
      console.log('[AUTH] Phone sign in attempt for:', phoneNumber);
      
      // Use our SecurePhoneAuthService instead of Firebase directly
      const result = await SecurePhoneAuthService.sendVerificationCode(phoneNumber);
      console.log('[AUTH] SecurePhoneAuthService result:', result);
      console.log('[AUTH] Result type:', typeof result);
      console.log('[AUTH] Result keys:', result ? Object.keys(result) : 'null');
      
      if (result && result.confirmationResult && result.sessionId) {
        console.log('[AUTH] ✅ Valid result structure returned');
        return result;
      } else {
        console.error('[AUTH] ❌ Invalid result structure from SecurePhoneAuthService:', result);
        throw new Error('Invalid response from phone authentication service');
      }
    } catch (error: any) {
      console.error('[AUTH] Phone sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneCodeAuth = async (confirmation: any, code: string, sessionId?: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('[AUTH] Verifying phone code with SecurePhoneAuthService');
      
      // Use our SecurePhoneAuthService to verify the code
      const result = await SecurePhoneAuthService.verifyCode(confirmation, code, sessionId || '');
      
      if (result && result.user) {
        // Create UserRole object from the result
        const userData: UserRole = {
          uid: result.user.uid,
          phoneNumber: result.user.phoneNumber,
          displayName: result.user.displayName || 'Phone User',
          role: 'user',
          authMethod: 'phone'
        };
        
        console.log('[AUTH] ✅ Phone verification successful, setting user:', userData);
        
        // Set user state immediately
        setUser(userData);
        
        // Save session for persistence
        await SessionManager.saveSession(userData);
        console.log('[AUTH] ✅ Session saved successfully');
        
        // Trigger login success for navigation
        setLoginTrigger(prev => prev + 1);
        console.log('[AUTH] ✅ Login trigger fired for navigation');
        
        return true;
      }
      
      console.warn('[AUTH] Phone verification failed - no user data returned');
      return false;
    } catch (error: any) {
      console.error('[AUTH] Phone verification error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getSessionInfo = async () => {
    return await SessionManager.getSessionInfo();
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInGoogle,
    signInPhone,
    verifyPhoneCode: verifyPhoneCodeAuth,
    signOut,
    sendSignInLink,
    completeEmailLinkSignIn,
    isAdmin: user?.role === 'admin',
    logoutTrigger,
    loginTrigger,
    getSessionInfo,
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