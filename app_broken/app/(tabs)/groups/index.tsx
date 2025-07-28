import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GroupsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Groups</Text>
      <Text style={styles.subtitle}>Coming Soon</Text>
      <Text style={styles.description}>
        Group management features will be available in a future update.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 12,
    color: '#666666',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888888',
    lineHeight: 24,
  },
});

export default GroupsScreen;