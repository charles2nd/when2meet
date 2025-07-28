import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../../contexts/AppContext';
import { Colors } from '../../constants/theme';
import { RESPONSIVE } from '../../utils/responsive';

export default function TabLayout() {
  const { t } = useApp();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.border.light,
          height: RESPONSIVE.scale(70) + RESPONSIVE.safeArea.bottom,
          paddingBottom: RESPONSIVE.safeArea.bottom + RESPONSIVE.spacing.sm,
          paddingTop: RESPONSIVE.spacing.sm,
          paddingHorizontal: RESPONSIVE.spacing.sm,
        },
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.text.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Tabs.Screen
        name="calendar"
        options={{
          title: t.tabs.calendar,
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="calendar-today" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="group"
        options={{
          title: t.tabs.group,
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="groups" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.tabs.profile,
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}