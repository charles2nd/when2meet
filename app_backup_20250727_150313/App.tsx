import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { MockDataProvider } from './contexts/MockDataContext';

// Import screens
import MeetScreen from './screens/MeetScreen';
import GroupsScreen from './screens/GroupsScreen';
import ProfileScreen from './screens/ProfileScreen';
import CreateAvailabilityScreen from './screens/CreateAvailabilityScreen';
import AvailabilityEventScreen from './screens/AvailabilityEventScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MeetStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MeetHome" component={MeetScreen} />
      <Stack.Screen name="CreateAvailability" component={CreateAvailabilityScreen} />
      <Stack.Screen name="AvailabilityEvent" component={AvailabilityEventScreen} />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8b5cf6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#e5e7eb',
        },
      }}
    >
      <Tab.Screen
        name="Meet"
        component={MeetStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const AppContent = () => (
    <MockDataProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </GestureHandlerRootView>
    </MockDataProvider>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <AppContent />
      </View>
    );
  }

  return <AppContent />;
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
    backgroundColor: '#f5f5f5',
  },
});