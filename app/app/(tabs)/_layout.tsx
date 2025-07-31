import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { AppLogo } from '../../components/AppLogo';
import { Colors } from '../../constants/theme';
import { RESPONSIVE } from '../../utils/responsive';

export default function TabLayout() {
  const { user: authUser, loading } = useAuth();
  const { t, currentGroup, user: appUser, userSyncing } = useApp();
  const router = useRouter();
  
  // Authentication guard - redirect to login if not authenticated
  useEffect(() => {
    console.log('[TAB_LAYOUT] Auth check:', { user: !!authUser, loading });
    if (!loading && !authUser) {
      console.log('[TAB_LAYOUT] No authenticated user, redirecting to login');
      router.replace('/login');
    }
  }, [authUser, loading, router]);
  
  // Calculate if calendar tab should be shown
  const shouldShowCalendar = !!(currentGroup && 
    currentGroup.id && 
    appUser?.groupId && 
    currentGroup.members && 
    currentGroup.members.length > 0);
  
  // Debug logging to track group state
  console.log('[TAB_LAYOUT] Current group:', currentGroup);
  console.log('[TAB_LAYOUT] Should show calendar:', shouldShowCalendar);
  console.log('[TAB_LAYOUT] AppUser groupId:', appUser?.groupId);
  console.log('[TAB_LAYOUT] Group members count:', currentGroup?.members?.length);
  
  // Show loading screen while checking authentication or syncing user data
  if (loading || userSyncing) {
    return (
      <View style={styles.loadingContainer}>
        <AppLogo size={80} variant="icon" showShadow={true} />
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loadingSpinner} />
        <Text style={styles.loadingText}>
          {loading ? 'Checking authentication...' : 'Loading your data...'}
        </Text>
      </View>
    );
  }
  
  // If no user after loading, show nothing (redirect will happen)
  if (!authUser) {
    return null;
  }
  
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
      {/* Calendar tab - hidden when user has no group */}
      <Tabs.Screen
        name="calendar"
        options={{
          title: t.tabs.calendar,
          headerShown: false,
          // Use href: null to hide the tab when condition is false
          href: shouldShowCalendar ? undefined : null,
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingSpinner: {
    marginTop: 20,
    marginBottom: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.text.secondary,
  },
});

export default TabLayout;