import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme, Linking } from 'react-native';
import 'react-native-reanimated';

import { AppProvider } from '../contexts/AppContext';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../components/Toast';
import { ProductionErrorBoundary } from '../components/ProductionErrorBoundary';
import { StartupSafetyService } from '../services/StartupSafetyService';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Production-safe font loading with startup safety service
  useEffect(() => {
    const initializeAppSafely = async () => {
      try {
        console.log('[ROOT_LAYOUT] 🚀 Starting production-safe initialization...');
        
        // Initialize app services safely
        await StartupSafetyService.initializeApp();
        
        // Handle font loading safely
        if (error) {
          console.error('[ROOT_LAYOUT] Font loading error:', error);
          if (process.env.NODE_ENV !== 'production') {
            console.error('[ROOT_LAYOUT] Development mode: Font error will be thrown');
          } else {
            console.log('[ROOT_LAYOUT] 🛡️ Production mode: Continuing without custom fonts');
          }
        }
        
        // Always hide splash screen after initialization
        setTimeout(() => {
          SplashScreen.hideAsync().catch((splashError) => {
            console.warn('[ROOT_LAYOUT] Splash screen hide failed:', splashError);
          });
        }, 1000);
        
      } catch (initError) {
        console.error('[ROOT_LAYOUT] 🚨 App initialization failed:', initError);
        
        // In production, continue anyway
        if (process.env.NODE_ENV === 'production') {
          console.log('[ROOT_LAYOUT] 🛡️ Production mode: Continuing despite initialization errors');
          SplashScreen.hideAsync().catch(console.error);
        } else {
          throw initError;
        }
      }
    };
    
    initializeAppSafely();
  }, [error]);

  // Production safety: Always render after timeout even if fonts not loaded
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      const productionTimeout = setTimeout(() => {
        console.log('[ROOT_LAYOUT] 🛡️ Production timeout: Forcing app render');
        SplashScreen.hideAsync().catch(console.error);
      }, 3000);
      
      return () => clearTimeout(productionTimeout);
    }
  }, []);

  // In development, wait for fonts. In production, continue without blocking
  if (!loaded && !error && process.env.NODE_ENV !== 'production') {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  // Handle deep links
  useEffect(() => {
    // Handle initial URL when app is opened from a link
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink(initialUrl);
      }
    };

    // Handle URL when app is already open
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    handleInitialURL();

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = (url: string) => {
    console.log('[DEEP_LINK] Received URL:', url);
    
    // Parse the URL to extract the group code
    const match = url.match(/join\/([A-Z0-9]+)/i);
    if (match && match[1]) {
      const groupCode = match[1].toUpperCase();
      console.log('[DEEP_LINK] Extracted group code:', groupCode);
      
      // Store the code temporarily and navigate to the group screen
      // The group screen will handle the join logic
      setTimeout(() => {
        router.push({
          pathname: '/(tabs)/group',
          params: { inviteCode: groupCode }
        });
      }, 500); // Small delay to ensure navigation is ready
    }
  };

  return (
    <ProductionErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <AppProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="login" />
                <Stack.Screen name="dateDetail" />
                <Stack.Screen name="groupSettings" />
                <Stack.Screen name="setAvailability" />
                <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
              </Stack>
            </ThemeProvider>
          </AppProvider>
        </AuthProvider>
      </ToastProvider>
    </ProductionErrorBoundary>
  );
}

