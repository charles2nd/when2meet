import { Stack } from 'expo-router';

export default function MeetLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="availability" />
    </Stack>
  );
}