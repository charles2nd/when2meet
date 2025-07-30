import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/theme';

const IndexScreen: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    console.log('[INDEX] ========================================');
    console.log('[INDEX] AUTH STATE CHECK');
    console.log('[INDEX] ========================================');
    console.log('[INDEX] User authenticated:', !!user);
    console.log('[INDEX] Auth loading:', loading);
    console.log('[INDEX] User email:', user?.email || 'none');
    console.log('[INDEX] ========================================');
    
    if (!loading && !redirected) {
      setRedirected(true);
      
      if (user) {
        console.log('[INDEX] 🔄 Redirecting authenticated user to GroupScreen');
        router.replace('/(tabs)/group');
      } else {
        console.log('[INDEX] 🔄 Redirecting unauthenticated user to login');
        router.replace('/login');
      }
    }
  }, [user, loading, router, redirected]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>
        {loading ? 'Checking authentication...' : 'Redirecting...'}
      </Text>
      {user && (
        <Text style={styles.userText}>
          Welcome back, {user.email}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  userText: {
    marginTop: 5,
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
});

export default IndexScreen;