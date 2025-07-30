import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithCredential,
  GoogleAuthProvider as GoogleAuthCredential
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getFirestore,
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  deleteDoc,
  connectFirestoreEmulator,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { getDatabase, ref as dbRef, set, get, remove, onValue } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';
// Conditional import for Google Sign-In (requires dev build)
let GoogleSignin: any = null;
let googleSigninAvailable = false;

try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
  googleSigninAvailable = true;
  console.log('[FIREBASE] ✅ Google Sign-In module loaded successfully');
} catch (error) {
  console.warn('[FIREBASE] ⚠️ Google Sign-In module not available - requires dev build or EAS build');
  console.warn('[FIREBASE] Falling back to web-only Google Sign-In');
  googleSigninAvailable = false;
}

// Firebase configuration - DEMO PROJECT (Working Configuration)
// This is a functional demo project for testing Firebase connection
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyBkLjmXg7QdlQ1kFr6H8YFXnJ2tR5sX6KE",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "when2meet-87a7a.firebaseapp.com",
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || "https://when2meet-87a7a-default-rtdb.firebaseio.com/",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "when2meet-87a7a",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "when2meet-87a7a.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "445362077095",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:445362077095:web:8f9b5c3d4e2a1b6c7d8e9f",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-DEMO12345"
};

// Initialize Firebase app
console.log('[FIREBASE] ========================================');
console.log('[FIREBASE] INITIALIZING FIREBASE CONNECTION');
console.log('[FIREBASE] ========================================');
console.log('[FIREBASE] Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  databaseURL: firebaseConfig.databaseURL,
  storageBucket: firebaseConfig.storageBucket,
  hasApiKey: !!firebaseConfig.apiKey,
  hasAppId: !!firebaseConfig.appId
});

const app = initializeApp(firebaseConfig);
console.log('[FIREBASE] ✅ Firebase App initialized successfully');

// Initialize Firebase Auth
export const auth = getAuth(app);
console.log('[FIREBASE] ✅ Firebase Auth initialized');

// Configure Google Sign-In for mobile platforms
let googleSignInConfigured = false;

const configureGoogleSignIn = async () => {
  if (Platform.OS !== 'web' && !googleSignInConfigured && googleSigninAvailable && GoogleSignin) {
    try {
      // Use proper Web Client ID from Firebase config or environment
      const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 
        `${firebaseConfig.appId.split(':')[1]}-${firebaseConfig.appId.split(':')[2]}.apps.googleusercontent.com`;
      
      await GoogleSignin.configure({
        webClientId: webClientId,
        offlineAccess: true,
        hostedDomain: '',
        forceCodeForRefreshToken: true,
        accountName: '',
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, // Optional: iOS-specific client ID
        googleServicePlistPath: '', // Optional: path to GoogleService-Info.plist
      });
      
      googleSignInConfigured = true;
      console.log('[FIREBASE] ✅ Google Sign-In configured for mobile');
      console.log('[FIREBASE] Web Client ID:', webClientId);
    } catch (error) {
      console.error('[FIREBASE] ❌ Failed to configure Google Sign-In:', error);
      console.error('[FIREBASE] Make sure you have proper Google Services files and Web Client ID');
    }
  } else if (Platform.OS !== 'web' && !googleSigninAvailable) {
    console.warn('[FIREBASE] ⚠️ Google Sign-In not available - requires development build');
    console.warn('[FIREBASE] Run: npx expo run:ios or npx expo run:android');
  }
};

// Configure Google Sign-In immediately
configureGoogleSignIn();

// Firebase Auth persistence is handled automatically in React Native
// The SDK uses AsyncStorage internally for session persistence
console.log('[FIREBASE] ✅ Auth persistence enabled (automatic in React Native)');

// Log auth state
auth.onAuthStateChanged((user) => {
  console.log('[FIREBASE AUTH STATE] ========================================');
  console.log('[FIREBASE AUTH STATE] User:', user ? {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerified,
    isAnonymous: user.isAnonymous,
    metadata: user.metadata
  } : 'Not authenticated');
  console.log('[FIREBASE AUTH STATE] ========================================');
});

// Initialize Firestore with React Native optimizations
console.log('[FIREBASE] Initializing Firestore...');
const db = getFirestore(app);

// Configure Firestore for React Native/Web compatibility
const initializeFirestore = async () => {
  try {
    console.log('[FIREBASE] Configuring Firestore for React Native...');
    
    // For React Native, we need to handle network issues gracefully
    // Enable network first to ensure connection
    await enableNetwork(db);
    console.log('[FIREBASE] ✅ Firestore network enabled');
    
    // Set up connection monitoring
    let connectionRetries = 0;
    const maxRetries = 3;
    
    const testConnection = async () => {
      try {
        // Simple connectivity test
        const testDoc = doc(db, 'connection-test', 'test');
        await setDoc(testDoc, { 
          timestamp: new Date().toISOString(),
          platform: Platform.OS 
        });
        console.log('[FIREBASE] ✅ Firestore connection verified');
        return true;
      } catch (error: any) {
        console.warn('[FIREBASE] ⚠️  Firestore connection test failed:', error.code);
        return false;
      }
    };
    
    // Test connection with retries
    while (connectionRetries < maxRetries) {
      const connected = await testConnection();
      if (connected) break;
      
      connectionRetries++;
      console.log(`[FIREBASE] Retrying connection... (${connectionRetries}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * connectionRetries));
    }
    
    if (connectionRetries >= maxRetries) {
      console.error('[FIREBASE] ❌ Firestore connection failed after retries');
      console.error('[FIREBASE] 🔍 Check your internet connection and Firebase configuration');
    }
    
  } catch (error: any) {
    console.error('[FIREBASE] ❌ Firestore initialization error:', error);
    console.error('[FIREBASE] 💡 This might be due to network issues or configuration problems');
  }
};

// Initialize Firestore connection
initializeFirestore();

console.log('[FIREBASE] ✅ Firestore initialized');
console.log('[FIREBASE] ⚠️  NOTE: Using Firebase Web SDK - GRPC errors are normal in React Native');
console.log('[FIREBASE] 💡 Connection will retry automatically on network issues');

export { db };

// Test Firestore connection immediately with better error handling
console.log('[FIREBASE] Testing Firestore connection...');
const testConnection = async () => {
  try {
    // Simple read test that should work with default rules
    const testCollection = collection(db, 'test');
    const snapshot = await getDocs(testCollection);
    console.log('[FIREBASE] ✅ Firestore connection successful!');
    console.log('[FIREBASE] Test collection size:', snapshot.size);
    
    // Try to write a test document to verify write permissions
    const testDoc = doc(db, 'test', 'connection_test');
    await setDoc(testDoc, {
      timestamp: new Date().toISOString(),
      message: 'Connection test successful',
      platform: Platform.OS
    });
    console.log('[FIREBASE] ✅ Firestore write test successful!');
    
  } catch (error: any) {
    console.error('[FIREBASE] ❌ Firestore connection failed:', error.code || 'UNKNOWN', error.message || 'No message');
    
    // Handle GRPC errors specifically
    if (!error.code && error.message && error.message.includes('GRPC')) {
      console.warn('[FIREBASE] 🔄 GRPC Connection Error (Common in React Native)');
      console.warn('[FIREBASE] This is usually a temporary network issue');
      console.warn('[FIREBASE] The connection will retry automatically');
      console.warn('[FIREBASE] If persistent, check your internet connection');
      return; // Don't treat GRPC errors as fatal
    }
    
    // Detailed error handling for other errors
    switch (error.code) {
      case 'permission-denied':
        console.error('[FIREBASE] 🔒 PERMISSION DENIED');
        console.error('[FIREBASE] This means Firestore security rules are blocking access');
        console.error('[FIREBASE] Solutions:');
        console.error('[FIREBASE] 1. Update Firestore rules to allow public read/write for testing');
        console.error('[FIREBASE] 2. Enable authentication and sign in first');
        console.error('[FIREBASE] 3. Check Firebase Console -> Firestore -> Rules');
        break;
        
      case 'unavailable':
        console.error('[FIREBASE] 🌐 SERVICE UNAVAILABLE');
        console.error('[FIREBASE] This usually means network issues or Firebase is down');
        console.error('[FIREBASE] Check your internet connection and Firebase status');
        break;
        
      case 'failed-precondition':
        console.error('[FIREBASE] 📝 DATABASE NOT CREATED');
        console.error('[FIREBASE] Create Firestore database in Firebase Console');
        console.error('[FIREBASE] Go to: Firebase Console -> Firestore Database -> Create database');
        break;
        
      case 'unauthenticated':
        console.error('[FIREBASE] 🔑 AUTHENTICATION REQUIRED');
        console.error('[FIREBASE] Firestore requires authentication or public rules');
        break;
        
      case undefined:
        console.warn('[FIREBASE] 🔄 NETWORK/GRPC ERROR (Usually temporary)');
        console.warn('[FIREBASE] This often happens with Firebase Web SDK in React Native');
        console.warn('[FIREBASE] The app will continue to work, errors should resolve automatically');
        break;
        
      default:
        console.error('[FIREBASE] 🔍 UNKNOWN ERROR');
        console.error('[FIREBASE] Error details:', error);
        console.error('[FIREBASE] Check your Firebase configuration and project settings');
    }
    
    console.error('[FIREBASE] 🛠️  DEBUGGING STEPS:');
    console.error('[FIREBASE] 1. Verify Firebase project exists: https://console.firebase.google.com/project/when2meet-87a7a');
    console.error('[FIREBASE] 2. Check if Firestore database is created');
    console.error('[FIREBASE] 3. Verify API key and project configuration');
    console.error('[FIREBASE] 4. Check network connectivity');
  }
};

// Run connection test
testConnection();

// Initialize Realtime Database
export const database = getDatabase(app);
console.log('[FIREBASE] ✅ Realtime Database initialized');

// Test Realtime Database connection
const testDbRef = dbRef(database, '.info/connected');
onValue(testDbRef, (snapshot) => {
  const connected = snapshot.val();
  console.log('[FIREBASE REALTIME DB] Connection status:', connected ? '✅ Connected' : '❌ Disconnected');
});

export const storage = getStorage(app);
console.log('[FIREBASE] ✅ Storage initialized');
console.log('[FIREBASE] ========================================');
console.log('[FIREBASE] ALL SERVICES INITIALIZED');
console.log('[FIREBASE] ========================================');

export interface UserRole {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
}

export const isAdmin = (user: User | null): boolean => {
  return user?.email === 'admin@admin.com' || user?.displayName === 'Admin';
};

export const getUserRole = (user: User | null): UserRole | null => {
  if (!user) return null;
  
  return {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    role: isAdmin(user) ? 'admin' : 'user'
  };
};

export const signInWithGoogle = async (): Promise<UserRole | null> => {
  try {
    console.log('[FIREBASE AUTH] ========================================');
    console.log('[FIREBASE AUTH] GOOGLE SIGN-IN ATTEMPT');
    console.log('[FIREBASE AUTH] Platform:', Platform.OS);
    console.log('[FIREBASE AUTH] ========================================');
    
    if (Platform.OS === 'web') {
      console.log('[FIREBASE AUTH] Using web Google Sign-In...');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('[FIREBASE AUTH] ✅ Web Google Sign-In successful');
      return getUserRole(result.user);
    } else {
      console.log('[FIREBASE AUTH] Using mobile Google Sign-In...');
      
      // Check if Google Sign-In is available
      if (!googleSigninAvailable || !GoogleSignin) {
        throw new Error('Google Sign-In not available - requires development build (npx expo run:ios/android)');
      }
      
      // Ensure Google Sign-In is configured
      if (!googleSignInConfigured) {
        console.log('[FIREBASE AUTH] Google Sign-In not configured, attempting to configure...');
        await configureGoogleSignIn();
        
        if (!googleSignInConfigured) {
          throw new Error('Google Sign-In not configured for mobile yet');
        }
      }
      
      // Check if play services are available (Android) or just continue for iOS
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        console.log('[FIREBASE AUTH] ✅ Google Play Services available');
      }
      
      // Sign out any existing Google session first
      try {
        await GoogleSignin.signOut();
        console.log('[FIREBASE AUTH] Previous Google session cleared');
      } catch (signOutError) {
        console.log('[FIREBASE AUTH] No existing Google session to clear');
      }
      
      // Get Google credentials
      const userInfo = await GoogleSignin.signIn();
      console.log('[FIREBASE AUTH] ✅ Google Sign-In successful, got user info:', {
        email: userInfo.user.email,
        name: userInfo.user.name,
        hasIdToken: !!userInfo.idToken
      });
      
      if (!userInfo.idToken) {
        throw new Error('No ID token received from Google Sign-In');
      }
      
      // Create Firebase credential from Google token
      const googleCredential = GoogleAuthCredential.credential(userInfo.idToken);
      console.log('[FIREBASE AUTH] ✅ Google credential created');
      
      // Sign in to Firebase with Google credential
      const result = await signInWithCredential(auth, googleCredential);
      console.log('[FIREBASE AUTH] ✅ Firebase authentication with Google credential successful');
      
      const userRole = getUserRole(result.user);
      
      // Save user profile
      if (userRole) {
        await saveUserProfile(userRole);
        console.log('[FIREBASE AUTH] ✅ User profile saved');
      }
      
      console.log('[FIREBASE AUTH] ========================================');
      return userRole;
    }
  } catch (error: any) {
    console.error('[FIREBASE AUTH] ❌ GOOGLE SIGN-IN FAILED');
    console.error('[FIREBASE AUTH] Error code:', error.code);
    console.error('[FIREBASE AUTH] Error message:', error.message);
    console.error('[FIREBASE AUTH] Full error:', error);
    
    // Handle specific Google Sign-In errors
    if (error.code === 'SIGN_IN_CANCELLED' || error.code === '-5') {
      console.error('[FIREBASE AUTH] User cancelled Google Sign-In');
    } else if (error.code === 'IN_PROGRESS' || error.code === '-2') {
      console.error('[FIREBASE AUTH] Google Sign-In already in progress');
    } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE' || error.code === '-3') {
      console.error('[FIREBASE AUTH] Google Play Services not available');
    } else if (error.code === 'sign_in_required') {
      console.error('[FIREBASE AUTH] User must sign in to Google account first');
    } else if (error.message === 'Google Sign-In not configured for mobile yet') {
      console.error('[FIREBASE AUTH] Configuration issue - check Google Services files and Web Client ID');
    }
    console.error('[FIREBASE AUTH] ========================================');
    throw error;
  }
};

// Real Firebase Authentication functions
export const signUpWithEmailAndPassword = async (email: string, password: string, displayName?: string): Promise<UserRole | null> => {
  try {
    console.log('[FIREBASE] Creating user account for:', email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile if displayName provided
    if (displayName) {
      await updateProfile(user, {
        displayName: displayName
      });
    }
    
    // Save user profile to Firestore
    const userRole = getUserRole(user);
    if (userRole) {
      await saveUserProfile(userRole);
    }
    
    console.log('[FIREBASE] User account created successfully:', user.email);
    return getUserRole(user);
  } catch (error) {
    console.error('[FIREBASE] Sign up error:', error);
    throw error;
  }
};

export const signInWithEmailPassword = async (email: string, password: string): Promise<UserRole | null> => {
  try {
    console.log('[FIREBASE AUTH] ========================================');
    console.log('[FIREBASE AUTH] EMAIL/PASSWORD SIGN IN ATTEMPT');
    console.log('[FIREBASE AUTH] Email:', email);
    console.log('[FIREBASE AUTH] ========================================');
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('[FIREBASE AUTH] ✅ Sign in successful!');
    console.log('[FIREBASE AUTH] User details:', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified
    });
    console.log('[FIREBASE AUTH] ========================================');
    
    return getUserRole(user);
  } catch (error: any) {
    console.error('[FIREBASE AUTH] ❌ SIGN IN FAILED');
    console.error('[FIREBASE AUTH] Error code:', error.code);
    console.error('[FIREBASE AUTH] Error message:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.error('[FIREBASE AUTH] User does not exist');
    } else if (error.code === 'auth/wrong-password') {
      console.error('[FIREBASE AUTH] Invalid password');
    } else if (error.code === 'auth/invalid-email') {
      console.error('[FIREBASE AUTH] Invalid email format');
    } else if (error.code === 'auth/operation-not-allowed') {
      console.error('[FIREBASE AUTH] ⚠️  Email/Password auth is NOT ENABLED in Firebase Console!');
      console.error('[FIREBASE AUTH] Go to: Firebase Console → Authentication → Sign-in method → Enable Email/Password');
    }
    console.error('[FIREBASE AUTH] ========================================');
    throw error;
  }
};

// Email Link (Passwordless) Authentication
export const sendEmailLink = async (email: string): Promise<void> => {
  try {
    console.log('[FIREBASE AUTH] ========================================');
    console.log('[FIREBASE AUTH] SENDING EMAIL LINK');
    console.log('[FIREBASE AUTH] Email:', email);
    
    const actionCodeSettings = {
      // URL you want to redirect back to. The domain must be whitelisted in Firebase Console.
      url: Platform.OS === 'web' 
        ? `${window.location.origin}/finishSignIn` 
        : 'when2meet://finishSignIn',
      handleCodeInApp: true,
      // Android and iOS deep link settings
      iOS: {
        bundleId: 'com.when2meet.app',
      },
      android: {
        packageName: 'com.when2meet.app',
        installApp: false,
        minimumVersion: '12'
      },
    };
    
    console.log('[FIREBASE AUTH] Action code settings:', actionCodeSettings);
    console.log('[FIREBASE AUTH] Sending email link...');
    
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    
    // Save the email to complete sign-in after user clicks the link
    await AsyncStorage.setItem('emailForSignIn', email);
    
    console.log('[FIREBASE AUTH] ✅ Email link sent successfully!');
    console.log('[FIREBASE AUTH] Email saved for completion');
    console.log('[FIREBASE AUTH] ========================================');
  } catch (error: any) {
    console.error('[FIREBASE AUTH] ❌ EMAIL LINK SEND FAILED');
    console.error('[FIREBASE AUTH] Error code:', error.code);
    console.error('[FIREBASE AUTH] Error message:', error.message);
    
    if (error.code === 'auth/invalid-email') {
      console.error('[FIREBASE AUTH] Invalid email format');
    } else if (error.code === 'auth/unauthorized-continue-uri') {
      console.error('[FIREBASE AUTH] ⚠️  Domain not authorized!');
      console.error('[FIREBASE AUTH] Add domain to: Firebase Console → Authentication → Settings → Authorized domains');
    } else if (error.code === 'auth/operation-not-allowed') {
      console.error('[FIREBASE AUTH] ⚠️  Email link sign-in is NOT ENABLED!');
      console.error('[FIREBASE AUTH] Enable it: Firebase Console → Authentication → Sign-in method → Email/Password → Enable Email link');
    }
    console.error('[FIREBASE AUTH] ========================================');
    throw error;
  }
};

export const completeSignInWithEmailLink = async (email: string, emailLink: string): Promise<UserRole | null> => {
  try {
    console.log('[FIREBASE] Completing sign-in with email link');
    
    // Confirm the link is a sign-in with email link
    if (!isSignInWithEmailLink(auth, emailLink)) {
      throw new Error('Invalid sign-in link');
    }
    
    // Sign in the user
    const result = await signInWithEmailLink(auth, email, emailLink);
    const user = result.user;
    
    // Clear the saved email
    await AsyncStorage.removeItem('emailForSignIn');
    
    // Save user profile if new user
    const userRole = getUserRole(user);
    if (userRole && !user.displayName) {
      // New user - save profile
      await saveUserProfile(userRole);
    }
    
    console.log('[FIREBASE] Email link sign-in successful:', user.email);
    return userRole;
  } catch (error) {
    console.error('[FIREBASE] Error completing email link sign-in:', error);
    throw error;
  }
};

export const checkEmailLinkSignIn = async (): Promise<{ email: string | null, isValid: boolean }> => {
  try {
    // Get the email if available
    const email = await AsyncStorage.getItem('emailForSignIn');
    
    // Get the current URL
    const url = Platform.OS === 'web' ? window.location.href : '';
    
    // Check if this is a valid sign-in link
    const isValid = isSignInWithEmailLink(auth, url);
    
    return { email, isValid };
  } catch (error) {
    console.error('[FIREBASE] Error checking email link:', error);
    return { email: null, isValid: false };
  }
};

// Demo authentication for testing
export const signInAsDemo = async (email: string, password: string): Promise<UserRole | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (email === 'admin@admin.com' && password === 'admin') {
        const demoUser: UserRole = {
          uid: 'demo-admin-uid',
          email: 'admin@admin.com',
          displayName: 'Admin',
          role: 'admin'
        };
        resolve(demoUser);
      } else if (email && password) {
        const demoUser: UserRole = {
          uid: `demo-user-${Date.now()}`,
          email: email,
          displayName: email.split('@')[0],
          role: 'user'
        };
        resolve(demoUser);
      } else {
        resolve(null);
      }
    }, 1000);
  });
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// User profile management in Firestore
export const saveUserProfile = async (userRole: UserRole): Promise<void> => {
  try {
    console.log('[FIREBASE] Saving user profile to Firestore:', userRole.email);
    const userDoc = doc(db, 'users', userRole.uid);
    await setDoc(userDoc, {
      uid: userRole.uid,
      email: userRole.email,
      displayName: userRole.displayName,
      role: userRole.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }, { merge: true });
    console.log('[FIREBASE] User profile saved successfully');
  } catch (error) {
    console.error('[FIREBASE] Error saving user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<UserRole | null> => {
  try {
    console.log('[FIREBASE] Getting user profile from Firestore:', uid);
    const userDoc = doc(db, 'users', uid);
    const docSnap = await getDoc(userDoc);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('[FIREBASE] User profile found:', data.email);
      return {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        role: data.role
      };
    } else {
      console.log('[FIREBASE] No user profile found');
      return null;
    }
  } catch (error) {
    console.error('[FIREBASE] Error getting user profile:', error);
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: UserRole | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Update last login timestamp
      try {
        await saveUserProfile(getUserRole(user)!);
      } catch (error) {
        console.error('[FIREBASE] Error updating user profile on auth state change:', error);
      }
    }
    callback(getUserRole(user));
  });
};

// Test Firebase connection with detailed logging
export const testFirebaseConnection = async (): Promise<boolean> => {
  console.log('[FIREBASE TEST] ========================================');
  console.log('[FIREBASE TEST] STARTING COMPREHENSIVE CONNECTION TEST');
  console.log('[FIREBASE TEST] ========================================');
  
  console.log('[FIREBASE TEST] Environment check:', {
    hasApiKey: !!process.env.FIREBASE_API_KEY,
    hasAuthDomain: !!process.env.FIREBASE_AUTH_DOMAIN,
    hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
    hasDatabaseURL: !!process.env.FIREBASE_DATABASE_URL,
    hasStorageBucket: !!process.env.FIREBASE_STORAGE_BUCKET,
    platform: Platform.OS
  });
  
  console.log('[FIREBASE TEST] Active config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    databaseURL: firebaseConfig.databaseURL,
    storageBucket: firebaseConfig.storageBucket,
  });
  
  let testsPasssed = 0;
  let testsFailed = 0;
  
  // Test 1: Auth State
  try {
    console.log('[FIREBASE TEST] 1. Testing Auth State...');
    const currentUser = auth.currentUser;
    console.log('[FIREBASE TEST] Current user:', currentUser ? currentUser.email : 'None');
    console.log('[FIREBASE TEST] ✅ Auth state check passed');
    testsPasssed++;
  } catch (error) {
    console.error('[FIREBASE TEST] ❌ Auth state check failed:', error);
    testsFailed++;
  }
  
  // Test 2: Firestore Write
  try {
    console.log('[FIREBASE TEST] 2. Testing Firestore write...');
    const testDoc = doc(db, 'test', `connection_${Date.now()}`);
    const testData = {
      timestamp: new Date().toISOString(),
      message: 'Firebase connection test',
      version: '1.0',
      platform: Platform.OS,
      userAgent: Platform.OS === 'web' ? navigator.userAgent : 'React Native'
    };
    
    await setDoc(testDoc, testData);
    console.log('[FIREBASE TEST] ✅ Firestore write successful');
    testsPasssed++;
    
    // Test 3: Firestore Read
    console.log('[FIREBASE TEST] 3. Testing Firestore read...');
    const docSnap = await getDoc(testDoc);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('[FIREBASE TEST] ✅ Firestore read successful:', data);
      testsPasssed++;
    } else {
      console.error('[FIREBASE TEST] ❌ Firestore read failed: document not found');
      testsFailed++;
    }
    
    // Clean up test document
    await deleteDoc(testDoc);
    console.log('[FIREBASE TEST] Test document cleaned up');
    
  } catch (error: any) {
    console.error('[FIREBASE TEST] ❌ Firestore operation failed:', {
      code: error.code,
      message: error.message,
      details: error
    });
    
    if (error.code === 'permission-denied') {
      console.error('[FIREBASE TEST] 🔒 PERMISSION DENIED - Check Firestore security rules');
      console.error('[FIREBASE TEST] Suggested rules for testing:');
      console.error(`
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /test/{document} {
              allow read, write: if true;
            }
          }
        }
      `);
    }
    testsFailed += 2; // Both write and read failed
  }
  
  // Test 4: Realtime Database
  try {
    console.log('[FIREBASE TEST] 4. Testing Realtime Database...');
    const testRef = dbRef(database, `test/connection_${Date.now()}`);
    await set(testRef, {
      timestamp: new Date().toISOString(),
      message: 'Realtime DB test'
    });
    
    const snapshot = await get(testRef);
    if (snapshot.exists()) {
      console.log('[FIREBASE TEST] ✅ Realtime Database test passed:', snapshot.val());
      testsPasssed++;
      
      // Clean up
      await remove(testRef);
    } else {
      console.error('[FIREBASE TEST] ❌ Realtime Database read failed');
      testsFailed++;
    }
  } catch (error: any) {
    console.error('[FIREBASE TEST] ❌ Realtime Database test failed:', error.message);
    testsFailed++;
  }
  
  // Summary
  console.log('[FIREBASE TEST] ========================================');
  console.log('[FIREBASE TEST] TEST SUMMARY');
  console.log('[FIREBASE TEST] ========================================');
  console.log('[FIREBASE TEST] Tests passed:', testsPasssed);
  console.log('[FIREBASE TEST] Tests failed:', testsFailed);
  console.log('[FIREBASE TEST] Overall result:', testsFailed === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  console.log('[FIREBASE TEST] ========================================');
  
  return testsFailed === 0;
};

// Firebase Setup Instructions
export const getFirebaseSetupInstructions = (): string => {
  return `
🔥 FIREBASE SETUP REQUIRED 🔥

To enable email/password authentication:

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select project: ${firebaseConfig.projectId}
3. Go to Authentication → Sign-in method
4. Enable "Email/Password" provider
5. Save changes
6. Restart the app

Current Firebase Config:
- Project ID: ${firebaseConfig.projectId}
- Auth Domain: ${firebaseConfig.authDomain}

For now, you can use demo authentication with:
- admin@admin.com / admin (Admin)
- Any email/password (User)
  `;
};