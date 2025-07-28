import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { 
  initializeFirestore, 
  getFirestore,
  connectFirestoreEmulator,
  persistentLocalCache,
  persistentMultipleTabManager,
  persistentSingleTabManager,
  CACHE_SIZE_UNLIMITED,
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { getDatabase, ref as dbRef, set, get, push, remove, update, onValue, off } from 'firebase/database';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyAql7IABIXzReJDF2ZQkzofjSBEx_UE2DQ",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "when2meet-87a7a.firebaseapp.com",
  databaseURL: process.env.FIREBASE_DATABASE_URL || "https://when2meet-87a7a-default-rtdb.firebaseio.com/",
  projectId: process.env.FIREBASE_PROJECT_ID || "when2meet-87a7a",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "when2meet-87a7a.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);

// Initialize Firestore with offline persistence
console.log('[FIREBASE] Initializing Firestore with offline persistence...');
let db: any;

try {
  // Try to initialize with persistent cache for web
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
      tabManager: persistentMultipleTabManager()
    })
  });
  console.log('[FIREBASE] Firestore initialized with persistent multi-tab cache');
} catch (error) {
  console.warn('[FIREBASE] Persistent cache not supported, falling back to memory cache:', error);
  try {
    // Fallback to single tab persistent cache
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        cacheSizeBytes: CACHE_SIZE_UNLIMITED,
        tabManager: persistentSingleTabManager()
      })
    });
    console.log('[FIREBASE] Firestore initialized with persistent single-tab cache');
  } catch (fallbackError) {
    console.warn('[FIREBASE] All persistence methods failed, using default memory cache:', fallbackError);
    // Last fallback - use default memory cache
    db = getFirestore(app);
    console.log('[FIREBASE] Firestore initialized with memory cache only');
  }
}

export { db };

// Initialize Realtime Database
export const database = getDatabase(app);

export const storage = getStorage(app);

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
    if (Platform.OS === 'web') {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return getUserRole(result.user);
    } else {
      throw new Error('Google Sign-In not configured for mobile yet');
    }
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

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

export const onAuthStateChange = (callback: (user: UserRole | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    callback(getUserRole(user));
  });
};

// Test Firebase connection with detailed logging
export const testFirebaseConnection = async (): Promise<boolean> => {
  console.log('[FIREBASE] Starting connection test...');
  console.log('[FIREBASE] Environment variables loaded:', {
    hasApiKey: !!process.env.FIREBASE_API_KEY,
    hasAuthDomain: !!process.env.FIREBASE_AUTH_DOMAIN,
    hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
  });
  
  try {
    console.log('[FIREBASE] Using config:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      storageBucket: firebaseConfig.storageBucket,
    });
    
    console.log('[FIREBASE] Testing Firestore write operation...');
    const testDoc = doc(db, 'test', 'connection');
    const testData = {
      timestamp: new Date().toISOString(),
      message: 'Firebase connection test from web app',
      version: '1.0',
      platform: 'web'
    };
    
    await setDoc(testDoc, testData);
    console.log('[FIREBASE] Write operation successful');
    
    console.log('[FIREBASE] Testing Firestore read operation...');
    const docSnap = await getDoc(testDoc);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('[FIREBASE] Read operation successful:', data);
      console.log('[FIREBASE] Connection test PASSED');
      return true;
    } else {
      console.error('[FIREBASE] Read operation failed: document not found');
      console.error('[FIREBASE] Connection test FAILED');
      return false;
    }
  } catch (error) {
    console.error('[FIREBASE] Connection test FAILED with error:', error);
    console.error('[FIREBASE] Error details:', {
      name: error.name,
      message: error.message,
      code: error.code || 'unknown',
      stack: error.stack
    });
    return false;
  }
};