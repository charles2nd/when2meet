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
            paddingTop: Math.max(insets.top + Spacing.md, 60),
          },
          centered && styles.headerCentered
        ]}
      >
        <View style={styles.content}>
          {!centered ? (
            <View style={styles.compactHeader}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              </View>
              {children && (
                <View style={styles.headerActions}>
                  {children}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.textCentered}>
              {children}
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          )}
        </View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  headerCentered: {
    alignItems: 'center',
  },
  content: {
    width: '100%',
    position: 'relative',
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  textCentered: {
    alignItems: 'center',
  },
  textLeft: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    letterSpacing: 1,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
    marginTop: Spacing.xs,
  },
});