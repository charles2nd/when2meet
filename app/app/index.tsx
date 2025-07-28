import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

const IndexScreen: React.FC = () => {
  const { user, loading, logoutTrigger, loginTrigger } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('[INDEX] Auth state changed:', { user: !!user, loading, userEmail: user?.email });
    // Wait for loading to complete before navigating
    if (!loading) {
      if (user) {
        console.log('[INDEX] User authenticated, navigating to tabs:', user.email);
        router.replace('/(tabs)/calendar');
      } else {
        console.log('[INDEX] No authenticated user, navigating to login');
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  // Handle logout trigger - force navigation to login
  useEffect(() => {
    if (logoutTrigger > 0) {
      console.log('[INDEX] Logout triggered, forcing navigation to login');
      router.replace('/login');
    }
  }, [logoutTrigger, router]);

  // Handle login trigger - force navigation to tabs
  useEffect(() => {
    if (loginTrigger > 0 && user) {
      console.log('[INDEX] Login triggered, forcing navigation to tabs');
      router.replace('/(tabs)/calendar');
    }
  }, [loginTrigger, user, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>
        {loading ? 'Loading authentication...' : 'Initializing...'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default IndexScreen;