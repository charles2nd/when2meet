import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing } from '../constants/theme';
import { checkEmailLinkSignIn, completeSignInWithEmailLink } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FinishSignInScreen: React.FC = () => {
  const router = useRouter();
  const { completeEmailLinkSignIn } = useAuth();

  useEffect(() => {
    handleEmailLinkSignIn();
  }, []);

  const handleEmailLinkSignIn = async () => {
    try {
      // Get the email from storage
      const email = await AsyncStorage.getItem('emailForSignIn');
      
      if (!email) {
        console.error('[FINISH_SIGNIN] No email found in storage');
        router.replace('/login');
        return;
      }

      // Get the current URL (contains the sign-in link)
      const url = window.location.href;
      
      // Complete the sign-in
      const success = await completeEmailLinkSignIn(email, url);
      
      if (success) {
        console.log('[FINISH_SIGNIN] Sign-in successful, redirecting...');
        router.replace('/(tabs)/group');
      } else {
        console.error('[FINISH_SIGNIN] Sign-in failed');
        router.replace('/login');
      }
    } catch (error) {
      console.error('[FINISH_SIGNIN] Error:', error);
      router.replace('/login');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.text}>Completing sign-in...</Text>
        <Text style={styles.subtext}>Please wait while we verify your link</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  text: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  subtext: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});

export default FinishSignInScreen;