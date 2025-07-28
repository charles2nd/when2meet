import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { __DEV__ } from '../constants/config';

const DebugPanel: React.FC = () => {
  const { user, loading } = useAuth();

  if (!__DEV__) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Info</Text>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Loading:</Text>
        <Text style={styles.value}>{loading ? 'true' : 'false'}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>User:</Text>
        <Text style={styles.value}>{user ? user.email : 'null'}</Text>
      </View>
      {user && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Role:</Text>
          <Text style={styles.value}>{user.role}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    minWidth: 150,
    zIndex: 9999,
  },
  title: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
    marginBottom: Spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  label: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.inverse,
    marginRight: Spacing.xs,
    fontWeight: Typography.weights.medium,
  },
  value: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    flex: 1,
  },
});

export default DebugPanel;