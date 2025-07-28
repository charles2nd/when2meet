import { Stack } from 'expo-router';

export default function AvailabilityLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="create" />
      <Stack.Screen name="[eventId]" />
    </Stack>
  );
}