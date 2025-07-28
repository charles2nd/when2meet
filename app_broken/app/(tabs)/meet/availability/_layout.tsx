import { Stack } from 'expo-router';
import React from 'react';

export default function AvailabilityLayout() {
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
        name="create"
        options={{
          title: 'Create Event',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="[eventId]"
        options={{
          title: 'Event Details',
        }}
      />
    </Stack>
  );
}