import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MockDataProvider } from './contexts/MockDataContext';
import { LanguageProvider } from './contexts/LanguageContext';

export default function RootLayout() {
  return (
    <LanguageProvider>
      <MockDataProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
        </GestureHandlerRootView>
      </MockDataProvider>
    </LanguageProvider>
  );
}