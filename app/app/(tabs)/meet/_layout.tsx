import { Stack } from 'expo-router';
import React from 'react';

export default function MeetLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#333333',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'When2Meet',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="availability"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}