import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Colors, Typography, Spacing } from '../constants/theme';
import { logger } from '../utils/logger';
import { StorageService } from '../services/storage';

const IndexScreen: React.FC = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const segments = useSegments();
  const [checkingTeam, setCheckingTeam] = useState(false);

  useEffect(() => {
    const handleNavigation = async () => {
      if (!loading) {
        const inAuthGroup = segments[0] === '(tabs)';
        
        if (user && !inAuthGroup) {
          setCheckingTeam(true);
          
          try {
            // Check if user has a team
            const currentTeamId = await StorageService.getCurrentTeamId();
            
            if (currentTeamId) {
              // User has a team, go to calendar
              logger.navigation.route('/(tabs)/meet', 'index-with-team');
              router.replace('/(tabs)/meet');
            } else {
              // User doesn't have a team, go to find group screen
              logger.navigation.route('/find-group', 'index-no-team');
              router.replace('/find-group');
            }
          } catch (error) {
            logger.error('INDEX', 'Error checking team status', error);
            // Fallback to find group screen
            logger.navigation.route('/find-group', 'index-error');
            router.replace('/find-group');
          } finally {
            setCheckingTeam(false);
          }
        } else if (!user && inAuthGroup) {
          logger.navigation.route('/login', 'index');
          router.replace('/login');
        } else if (!user && segments.length <= 0) {
          logger.navigation.route('/login', 'index');
          router.replace('/login');
        }
      }
    };

    handleNavigation();
  }, [user, loading, segments]);

  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>
        {checkingTeam ? 'Checking team status...' : t.common.loading}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    fontWeight: Typography.weights.medium,
  },
});

export default IndexScreen;