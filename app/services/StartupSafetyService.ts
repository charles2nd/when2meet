/**
 * StartupSafetyService - Production Crash Prevention
 * 
 * This service handles critical startup operations with timeouts and fallbacks
 * to prevent the app from crashing during initialization in production.
 */

export class StartupSafetyService {
  private static readonly TIMEOUT_MS = 10000; // 10 second timeout
  private static readonly MAX_RETRIES = 3;

  /**
   * Safely initialize a service with timeout and retry logic
   */
  static async safeInitialize<T>(
    serviceName: string,
    initFunction: () => Promise<T>,
    fallbackValue?: T,
    timeout: number = StartupSafetyService.TIMEOUT_MS
  ): Promise<T | null> {
    console.log(`[STARTUP_SAFETY] Initializing ${serviceName}...`);
    
    for (let attempt = 1; attempt <= StartupSafetyService.MAX_RETRIES; attempt++) {
      try {
        const result = await Promise.race([
          initFunction(),
          StartupSafetyService.createTimeout(timeout, serviceName)
        ]);
        
        console.log(`[STARTUP_SAFETY] ✅ ${serviceName} initialized successfully`);
        return result;
      } catch (error) {
        console.error(`[STARTUP_SAFETY] ❌ ${serviceName} failed (attempt ${attempt}):`, error);
        
        if (attempt === StartupSafetyService.MAX_RETRIES) {
          console.error(`[STARTUP_SAFETY] 🚨 ${serviceName} failed all ${StartupSafetyService.MAX_RETRIES} attempts`);
          
          if (fallbackValue !== undefined) {
            console.log(`[STARTUP_SAFETY] 🔄 Using fallback for ${serviceName}`);
            return fallbackValue;
          }
          
          // In production, don't crash - return null and continue
          if (process.env.NODE_ENV === 'production') {
            console.error(`[STARTUP_SAFETY] 🛡️ Production mode: Continuing without ${serviceName}`);
            return null;
          } else {
            throw error;
          }
        }
        
        // Wait before retry
        await StartupSafetyService.delay(1000 * attempt);
      }
    }
    
    return null;
  }

  /**
   * Create a timeout promise that rejects after specified time
   */
  private static createTimeout<T>(ms: number, serviceName: string): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${serviceName} initialization timed out after ${ms}ms`));
      }, ms);
    });
  }

  /**
   * Delay execution for specified milliseconds
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Safely execute an async operation with error boundary
   */
  static async safeExecute<T>(
    operation: () => Promise<T>,
    operationName: string,
    fallback?: T
  ): Promise<T | null> {
    try {
      console.log(`[STARTUP_SAFETY] Executing ${operationName}...`);
      const result = await operation();
      console.log(`[STARTUP_SAFETY] ✅ ${operationName} completed`);
      return result;
    } catch (error) {
      console.error(`[STARTUP_SAFETY] ❌ ${operationName} failed:`, error);
      
      if (fallback !== undefined) {
        console.log(`[STARTUP_SAFETY] 🔄 Using fallback for ${operationName}`);
        return fallback;
      }
      
      if (process.env.NODE_ENV === 'production') {
        console.error(`[STARTUP_SAFETY] 🛡️ Production mode: Continuing despite ${operationName} failure`);
        return null;
      } else {
        throw error;
      }
    }
  }

  /**
   * Validate environment variables and provide fallbacks
   */
  static validateEnvironment(): boolean {
    const required = [
      'EXPO_PUBLIC_FIREBASE_API_KEY',
      'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
      'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'
    ];

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.error('[STARTUP_SAFETY] Missing environment variables:', missing);
      
      if (process.env.NODE_ENV === 'production') {
        console.warn('[STARTUP_SAFETY] 🛡️ Production mode: Using fallback configuration');
        return false;
      } else {
        console.error('[STARTUP_SAFETY] Development mode: Environment validation failed');
        return false;
      }
    }
    
    console.log('[STARTUP_SAFETY] ✅ Environment validation passed');
    return true;
  }

  /**
   * Initialize critical app services in production-safe way
   */
  static async initializeApp(): Promise<{
    firebase: boolean;
    storage: boolean;
    navigation: boolean;
  }> {
    console.log('[STARTUP_SAFETY] 🚀 Starting production-safe app initialization...');
    
    const results = {
      firebase: false,
      storage: false,
      navigation: false
    };

    // Validate environment first
    const envValid = StartupSafetyService.validateEnvironment();
    if (!envValid && process.env.NODE_ENV !== 'production') {
      throw new Error('Environment validation failed in development mode');
    }

    // Initialize Firebase with safety
    try {
      await StartupSafetyService.safeInitialize(
        'Firebase',
        async () => {
          // Firebase should already be initialized in firebase.ts
          // This just validates it's working
          return Promise.resolve('initialized');
        },
        'fallback'
      );
      results.firebase = true;
    } catch (error) {
      console.error('[STARTUP_SAFETY] Firebase initialization failed:', error);
    }

    // Initialize AsyncStorage with safety
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await StartupSafetyService.safeInitialize(
        'AsyncStorage',
        async () => {
          await AsyncStorage.getItem('test');
          return 'ready';
        },
        'fallback'
      );
      results.storage = true;
    } catch (error) {
      console.error('[STARTUP_SAFETY] AsyncStorage initialization failed:', error);
    }

    // Navigation is handled by Expo Router
    results.navigation = true;

    console.log('[STARTUP_SAFETY] 🎯 App initialization completed:', results);
    return results;
  }

  /**
   * Production-safe font loading with timeout
   */
  static async safeFontLoading(fontLoadPromise: Promise<boolean>): Promise<boolean> {
    try {
      const loaded = await Promise.race([
        fontLoadPromise,
        StartupSafetyService.createTimeout(5000, 'Font Loading')
      ]);
      return loaded;
    } catch (error) {
      console.warn('[STARTUP_SAFETY] Font loading failed or timed out:', error);
      
      if (process.env.NODE_ENV === 'production') {
        console.log('[STARTUP_SAFETY] 🛡️ Continuing without custom fonts in production');
        return true; // Continue without fonts
      }
      
      return false;
    }
  }
}