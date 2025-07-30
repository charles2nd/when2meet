import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../theme';

interface SafeHeaderProps {
  title: string;
  subtitle?: string;
  colors?: string[];
  children?: React.ReactNode;
  centered?: boolean;
}

export const SafeHeader: React.FC<SafeHeaderProps> = ({
  title,
  subtitle,
  colors = [Colors.primary, Colors.primaryDark],
  children,
  centered = true
}) => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors[0]} />
      <LinearGradient
        colors={colors}
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top + Spacing.xl, 70), // iOS guideline: minimum 70px with extra large spacing
          },
          centered && styles.headerCentered
        ]}
      >
        <View style={styles.content}>
          {!centered && children && (
            <View style={styles.headerActions}>
              {children}
            </View>
          )}
          <View style={centered ? styles.textCentered : styles.textLeft}>
            {centered && children}
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingBottom: Spacing.xxl, // Extra spacing for better visual hierarchy
    paddingHorizontal: Spacing.lg,
  },
  headerCentered: {
    alignItems: 'center',
  },
  content: {
    width: '100%',
    position: 'relative',
  },
  headerActions: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
  textCentered: {
    alignItems: 'center',
  },
  textLeft: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
});